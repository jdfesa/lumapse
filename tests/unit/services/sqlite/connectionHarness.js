import { vi } from 'vitest'

export async function importConnection({ platform = 'web', existingConnection = false } = {}) {
  vi.resetModules()

  const mockDb = {
    open: vi.fn().mockResolvedValue(undefined),
    execute: vi.fn().mockResolvedValue(undefined),
    run: vi.fn().mockResolvedValue(undefined),
    query: vi.fn(async sql => ({ values: sql.startsWith('PRAGMA') ? [{ name: 'id' }] : [{ value: 'true' }] })),
    isTransactionActive: vi.fn().mockResolvedValue({ result: false }),
    isDBOpen: vi.fn().mockResolvedValue({ result: true }),
    beginTransaction: vi.fn().mockResolvedValue(undefined),
    commitTransaction: vi.fn().mockResolvedValue(undefined),
    rollbackTransaction: vi.fn().mockResolvedValue(undefined),
  }

  const mockSqliteConnection = {
    closeConnection: vi.fn().mockResolvedValue(undefined),
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
