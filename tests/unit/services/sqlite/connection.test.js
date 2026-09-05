import { beforeEach, describe, expect, it, vi } from 'vitest'

import { importConnection } from './connectionHarness.js'

beforeEach(() => {
  vi.clearAllMocks()
  document.body.innerHTML = ''
})

describe('generateUUID()', () => {
  it('retorna un string de 36 caracteres', async () => {
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => '12345678-1234-4234-9234-123456789abc') })
    const { module } = await importConnection()

    expect(module.generateUUID()).toHaveLength(36)
  })

  it('retorna un string con formato UUID v4', async () => {
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => '12345678-1234-4234-9234-123456789abc') })
    const { module } = await importConnection()

    expect(module.generateUUID()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  })

  it('genera UUIDs únicos en llamadas consecutivas', async () => {
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn()
        .mockReturnValueOnce('11111111-1111-4111-8111-111111111111')
        .mockReturnValueOnce('22222222-2222-4222-8222-222222222222'),
    })
    const { module } = await importConnection()

    expect(module.generateUUID()).not.toBe(module.generateUUID())
  })

  it('usa fallback manual si crypto.randomUUID no está disponible', async () => {
    vi.stubGlobal('crypto', {})
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)
    const { module } = await importConnection()

    expect(module.generateUUID()).toBe('00000000-0000-4000-8000-000000000000')
    randomSpy.mockRestore()
  })
})

describe('getDb()', () => {
  it('lanza Error "Database not initialized" si se llama antes de init', async () => {
    const { module } = await importConnection()

    expect(() => module.getDb()).toThrow('Database not initialized')
  })
})

function deferred() {
  let resolve
  const promise = new Promise(r => { resolve = r })
  return { promise, resolve }
}

describe('AUD-005: coordinación independiente', () => {
  it('una operación independiente espera el rollback de la propietaria', async () => {
    const { module, mockDb } = await importConnection()
    await module.initDatabase()
    const entered = deferred()
    const release = deferred()
    const events = []
    mockDb.rollbackTransaction.mockImplementation(async () => { events.push('rollback A') })
    const cause = new Error('A failed')
    const first = module.runTransaction(async () => {
      entered.resolve()
      await release.promise
      throw cause
    })
    const rejected = expect(first).rejects.toBe(cause)
    await entered.promise
    const second = module.runTransaction(async () => { events.push('write B') })
    release.resolve()
    await Promise.all([rejected, second])
    expect(events).toEqual(['rollback A', 'write B'])
    expect(mockDb.commitTransaction).toHaveBeenCalledTimes(1)
  })

  it('un CRUD independiente no se incorpora a la transacción abierta', async () => {
    const { module, mockDb } = await importConnection()
    const notes = await import('../../../../src/services/sqlite/notes.js')
    await module.initDatabase()
    const entered = deferred()
    const release = deferred()
    const events = []
    mockDb.run.mockImplementation(async () => { events.push('CRUD') })
    mockDb.rollbackTransaction.mockImplementation(async () => { events.push('rollback') })
    const first = module.runTransaction(async () => {
      entered.resolve()
      await release.promise
      throw new Error('rollback owner')
    })
    const rejected = expect(first).rejects.toThrow('rollback owner')
    await entered.promise
    const crud = notes.createNote('independiente')
    release.resolve()
    await Promise.all([rejected, crud])
    expect(events).toEqual(['rollback', 'CRUD'])
  })

  it('no informa éxito si saveToStore falla después del commit', async () => {
    const { module, mockSqliteConnection } = await importConnection()
    await module.initDatabase()
    const cause = new Error('store unavailable')
    mockSqliteConnection.saveToStore.mockRejectedValueOnce(cause)
    await expect(module.runTransaction(async () => 'ok')).rejects.toBe(cause)
  })

  it('aborta una migración inesperadamente fallida', async () => {
    const { module, mockDb } = await importConnection()
    const cause = new Error('disk I/O error')
    mockDb.run.mockRejectedValueOnce(cause)
    await expect(module.initDatabase()).rejects.toMatchObject({ cause })
  })

  it('comparte una sola inicialización concurrente', async () => {
    const { module, mockDb, mockSqliteConnection } = await importConnection()
    const opened = deferred()
    mockDb.open.mockReturnValue(opened.promise)
    const first = module.initDatabase()
    const second = module.initDatabase()
    opened.resolve()
    await Promise.all([first, second])
    expect(mockSqliteConnection.createConnection).toHaveBeenCalledTimes(1)
    expect(document.querySelectorAll('jeep-sqlite')).toHaveLength(1)
  })

  it('reintenta un open fallido sin consultar transacciones de una base cerrada', async () => {
    const { module, mockDb, mockSqliteConnection } = await importConnection()
    mockDb.open.mockRejectedValueOnce(new Error('open failed'))
    mockDb.isDBOpen = vi.fn().mockResolvedValue({ result: false })
    mockDb.isTransactionActive.mockRejectedValue(new Error('database not opened'))
    await expect(module.initDatabase()).rejects.toThrow('open failed')
    await expect(module.initDatabase()).resolves.toBeUndefined()
    expect(mockDb.isTransactionActive).not.toHaveBeenCalled()
    expect(mockSqliteConnection.closeConnection).toHaveBeenCalledTimes(1)
  })
})

describe('initDatabase() schema', () => {
  it('crea academic_events e indices en instalaciones nuevas', async () => {
    const { module, mockDb } = await importConnection()

    await module.initDatabase()

    const schema = mockDb.execute.mock.calls[0][0]
    expect(schema).toContain('CREATE TABLE IF NOT EXISTS academic_events')
    expect(schema).toContain("CHECK(type IN ('parcial', 'final', 'tp', 'exposicion'))")
    expect(schema).toContain('REFERENCES subjects(id) ON DELETE SET NULL')
    expect(schema).toContain('CREATE INDEX IF NOT EXISTS idx_academic_events_date')
    expect(schema).toContain('CREATE INDEX IF NOT EXISTS idx_academic_events_subject')
  })

  it('ejecuta migraciones idempotentes para academic_events en instalaciones existentes', async () => {
    const { module, mockDb } = await importConnection()

    await module.initDatabase()

    const migrationSql = mockDb.run.mock.calls.map(([sql]) => sql).join('\n')
    expect(migrationSql).toContain('CREATE TABLE IF NOT EXISTS academic_events')
    expect(migrationSql).toContain('CREATE INDEX IF NOT EXISTS idx_academic_events_date')
    expect(migrationSql).toContain('CREATE INDEX IF NOT EXISTS idx_academic_events_subject')
  })

  it('persiste en web despues de ejecutar migraciones', async () => {
    const { module, mockSqliteConnection } = await importConnection({ platform: 'web' })

    await module.initDatabase()

    expect(mockSqliteConnection.saveToStore).toHaveBeenCalledTimes(2)
  })
})

describe('persistWeb()', () => {
  it('rechaza persistir si no existe conexión', async () => {
    const { module } = await importConnection()

    await expect(module.persistWeb()).rejects.toThrow('Database not initialized')
  })

  it('llama saveToStore si la plataforma es "web"', async () => {
    const { module, mockSqliteConnection } = await importConnection({ platform: 'web' })
    await module.initDatabase()
    mockSqliteConnection.saveToStore.mockClear()

    await module.persistWeb()

    expect(mockSqliteConnection.saveToStore).toHaveBeenCalledWith('lumapse-db')
  })

  it('no llama saveToStore si la plataforma es "ios"', async () => {
    const { module, mockSqliteConnection } = await importConnection({ platform: 'ios' })
    await module.initDatabase()
    mockSqliteConnection.saveToStore.mockClear()

    await module.persistWeb()

    expect(mockSqliteConnection.saveToStore).not.toHaveBeenCalled()
  })
})

describe('runTransaction()', () => {
  it('confirma la transacción y persiste una sola vez al finalizar', async () => {
    const { module, mockDb, mockSqliteConnection } = await importConnection({ platform: 'web' })
    await module.initDatabase()
    mockSqliteConnection.saveToStore.mockClear()

    const result = await module.runTransaction(async scope => {
      await module.persistWeb(scope)
      return 'ok'
    })

    expect(result).toBe('ok')
    expect(mockDb.beginTransaction).toHaveBeenCalledTimes(1)
    expect(mockDb.commitTransaction).toHaveBeenCalledTimes(1)
    expect(mockDb.rollbackTransaction).not.toHaveBeenCalled()
    expect(mockSqliteConnection.saveToStore).toHaveBeenCalledTimes(1)
  })

  it('revierte la transacción si la operación falla', async () => {
    const { module, mockDb, mockSqliteConnection } = await importConnection({ platform: 'web' })
    await module.initDatabase()
    mockSqliteConnection.saveToStore.mockClear()

    await expect(module.runTransaction(async () => {
      throw new Error('fallo de cascada')
    })).rejects.toThrow('fallo de cascada')

    expect(mockDb.beginTransaction).toHaveBeenCalledTimes(1)
    expect(mockDb.commitTransaction).not.toHaveBeenCalled()
    expect(mockDb.rollbackTransaction).toHaveBeenCalledTimes(1)
    expect(mockSqliteConnection.saveToStore).not.toHaveBeenCalled()
  })

  it('reutiliza la transacción activa en llamadas anidadas', async () => {
    const { module, mockDb } = await importConnection()
    await module.initDatabase()

    await module.runTransaction(async scope => {
      await module.runTransaction(async () => 'inner', scope)
    })

    expect(mockDb.beginTransaction).toHaveBeenCalledTimes(1)
    expect(mockDb.commitTransaction).toHaveBeenCalledTimes(1)
  })

  it('expone isWriteTransactionActive durante la operación', async () => {
    const { module } = await importConnection()
    await module.initDatabase()

    expect(module.isWriteTransactionActive()).toBe(false)
    await module.runTransaction(async scope => {
      expect(module.isWriteTransactionActive(scope)).toBe(true)
      expect(module.isWriteTransactionActive()).toBe(false)
    })
    expect(module.isWriteTransactionActive()).toBe(false)
  })
})


describe('cierre seguro antes de recargar WebView', () => {
  it('espera el trabajo activo, bloquea nuevas operaciones y cierra una sola vez', async () => {
    const { module, mockDb, mockSqliteConnection } = await importConnection({ platform: 'android' })
    await module.initDatabase()
    const entered = deferred(), release = deferred()
    const write = module.runTransaction(async () => {
      entered.resolve()
      await release.promise
    })
    await entered.promise
    const retained = module.getDb()
    const closing = module.closeDatabaseForReload()
    expect(module.closeDatabaseForReload()).toBe(closing)
    expect(() => module.getDb()).toThrow('not initialized')
    await expect(module.initDatabase()).rejects.toThrow('closing')
    await Promise.resolve()
    expect(mockSqliteConnection.closeConnection).not.toHaveBeenCalled()
    release.resolve()
    await Promise.all([write, closing])
    await expect(retained.query('SELECT 1')).rejects.toThrow('recovery')
    expect(mockDb.commitTransaction).toHaveBeenCalledTimes(1)
    expect(mockSqliteConnection.closeConnection).toHaveBeenCalledTimes(1)
    await module.initDatabase()
    expect(() => module.getDb()).not.toThrow()
  })

  it('no cierra con estado incierto y permite repetir el cierre seguro', async () => {
    const { module, mockDb, mockSqliteConnection } = await importConnection({ platform: 'android' })
    await module.initDatabase()
    mockDb.isTransactionActive.mockResolvedValueOnce({})
    await expect(module.closeDatabaseForReload()).rejects.toThrow('state unknown')
    expect(mockSqliteConnection.closeConnection).not.toHaveBeenCalled()
    expect(() => module.getDb()).toThrow('not initialized')
    await expect(module.closeDatabaseForReload()).resolves.toBeUndefined()
    expect(mockSqliteConnection.closeConnection).toHaveBeenCalledTimes(1)
  })

  it('propaga el fallo de closeConnection sin perder la conexión que debe cerrar', async () => {
    const { module, mockSqliteConnection } = await importConnection({ platform: 'android' })
    await module.initDatabase()
    const cause = new Error('native close failed')
    mockSqliteConnection.closeConnection.mockRejectedValueOnce(cause)
    await expect(module.closeDatabaseForReload()).rejects.toBe(cause)
    await expect(module.closeDatabaseForReload()).resolves.toBeUndefined()
    expect(mockSqliteConnection.closeConnection).toHaveBeenCalledTimes(2)
  })

  it('espera una inicialización en curso antes de liberar su conexión', async () => {
    const { module, mockDb, mockSqliteConnection } = await importConnection({ platform: 'android' })
    const opened = deferred()
    mockDb.open.mockReturnValueOnce(opened.promise)
    const initializing = module.initDatabase()
    const closing = module.closeDatabaseForReload()
    await Promise.resolve()
    expect(mockSqliteConnection.closeConnection).not.toHaveBeenCalled()
    opened.resolve()
    await Promise.all([initializing, closing])
    expect(mockSqliteConnection.closeConnection).toHaveBeenCalledTimes(1)
    expect(() => module.getDb()).toThrow('not initialized')
  })
})
