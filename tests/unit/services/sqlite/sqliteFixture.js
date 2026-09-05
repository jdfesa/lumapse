import initSqlJs from 'sql.js'
import { vi } from 'vitest'

// SQLite real en memoria. Solo los límites async del plugin son reemplazables.
export async function sqliteFixture() {
  const SQL = await initSqlJs()
  const database = new SQL.Database()
  database.run('PRAGMA foreign_keys = ON')
  let active = false
  const adapter = {
    open: vi.fn(async () => {}),
    execute: vi.fn(async sql => { database.run(sql) }),
    run: vi.fn(async (sql, values = []) => {
      database.run(sql, values)
      return { changes: { changes: database.getRowsModified() } }
    }),
    query: vi.fn(async (sql, values = []) => {
      const statement = database.prepare(sql)
      try {
        statement.bind(values)
        const rows = []
        while (statement.step()) rows.push(statement.getAsObject())
        return { values: rows }
      } finally { statement.free() }
    }),
    beginTransaction: vi.fn(async () => { database.run('BEGIN'); active = true }),
    commitTransaction: vi.fn(async () => { database.run('COMMIT'); active = false }),
    rollbackTransaction: vi.fn(async () => { database.run('ROLLBACK'); active = false }),
    isTransactionActive: vi.fn(async () => ({ result: active })),
    isDBOpen: vi.fn(async () => ({ result: true })),
  }
  return { adapter, database, close: () => database.close() }
}

export function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
