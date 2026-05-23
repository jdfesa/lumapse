import { vi } from 'vitest'

export const mockDb = {
  open: vi.fn().mockResolvedValue(undefined),
  execute: vi.fn().mockResolvedValue(undefined),
  run: vi.fn().mockResolvedValue(undefined),
  query: vi.fn().mockResolvedValue({ values: [] }),
}

export const mockSqliteConnectionInstance = {
  isConnection: vi.fn().mockResolvedValue({ result: false }),
  createConnection: vi.fn().mockResolvedValue(mockDb),
  retrieveConnection: vi.fn().mockResolvedValue(mockDb),
  initWebStore: vi.fn().mockResolvedValue(undefined),
  saveToStore: vi.fn().mockResolvedValue(undefined),
}

export const SQLiteConnection = vi.fn(function SQLiteConnectionMock() {
  return mockSqliteConnectionInstance
})
export const CapacitorSQLite = {}
