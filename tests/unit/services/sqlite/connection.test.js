import { beforeEach, describe, expect, it, vi } from 'vitest'

async function importConnection({ platform = 'web', existingConnection = false } = {}) {
  vi.resetModules()

  const mockDb = {
    open: vi.fn().mockResolvedValue(undefined),
    execute: vi.fn().mockResolvedValue(undefined),
    run: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue({ values: [{ value: 'true' }] }),
    beginTransaction: vi.fn().mockResolvedValue(undefined),
    commitTransaction: vi.fn().mockResolvedValue(undefined),
    rollbackTransaction: vi.fn().mockResolvedValue(undefined),
  }

  const mockSqliteConnection = {
    isConnection: vi.fn().mockResolvedValue({ result: existingConnection }),
    createConnection: vi.fn().mockResolvedValue(mockDb),
    retrieveConnection: vi.fn().mockResolvedValue(mockDb),
    initWebStore: vi.fn().mockResolvedValue(undefined),
    saveToStore: vi.fn().mockResolvedValue(undefined),
  }

  const MockSQLiteConnection = vi.fn(function SQLiteConnectionMock() {
    return mockSqliteConnection
  })
  const mockCapacitor = { getPlatform: vi.fn(() => platform) }
  const defineCustomElements = vi.fn((win) => {
    if (!win.customElements.get('jeep-sqlite')) {
      win.customElements.define('jeep-sqlite', class extends win.HTMLElement {})
    }
  })

  vi.doMock('@capacitor/core', () => ({ Capacitor: mockCapacitor }))
  vi.doMock('@capacitor-community/sqlite', () => ({
    SQLiteConnection: MockSQLiteConnection,
    CapacitorSQLite: {},
  }))
  vi.doMock('jeep-sqlite/loader', () => ({ defineCustomElements }))

  const module = await import('../../../../src/services/sqlite/connection.js')
  return { module, mockDb, mockSqliteConnection, mockCapacitor, defineCustomElements }
}

beforeEach(() => {
  vi.clearAllMocks()
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
  it('no lanza error si sqliteConnection es null', async () => {
    const { module } = await importConnection()

    await expect(module.persistWeb()).resolves.toBeUndefined()
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

    const result = await module.runTransaction(async () => {
      await module.persistWeb()
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

    await module.runTransaction(async () => {
      await module.runTransaction(async () => 'inner')
    })

    expect(mockDb.beginTransaction).toHaveBeenCalledTimes(1)
    expect(mockDb.commitTransaction).toHaveBeenCalledTimes(1)
  })

  it('expone isWriteTransactionActive durante la operación', async () => {
    const { module } = await importConnection()
    await module.initDatabase()

    expect(module.isWriteTransactionActive()).toBe(false)
    await module.runTransaction(async () => {
      expect(module.isWriteTransactionActive()).toBe(true)
    })
    expect(module.isWriteTransactionActive()).toBe(false)
  })
})
