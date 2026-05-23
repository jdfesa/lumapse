import { beforeEach, describe, expect, it, vi } from 'vitest'

async function importConnection({ platform = 'web', existingConnection = false } = {}) {
  vi.resetModules()

  const mockDb = {
    open: vi.fn().mockResolvedValue(undefined),
    execute: vi.fn().mockResolvedValue(undefined),
    run: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue({ values: [{ value: 'true' }] }),
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
