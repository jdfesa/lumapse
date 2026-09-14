import { importConnection } from '../services/sqlite/connectionHarness.js'
import { sqliteFixture } from '../services/sqlite/sqliteFixture.js'

// Store, servicios, coordinador y DDL reales; solo se reemplaza el plugin nativo.
export async function postWriteRefreshHarness() {
  const fixture = await sqliteFixture()
  const { module: connection, mockDb: db } = await importConnection({ platform: 'android' })
  Object.assign(db, fixture.adapter)
  fixture.database.run("CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT); INSERT INTO metadata VALUES ('indexeddb_migrated', 'true')")
  await connection.initDatabase()
  const store = await import('../../../src/store/NoteStore.js')
  await store.loadSubjects()
  await store.loadNotes()
  await store.loadAcademicEventsByMonth(2099, 9)
  db.run.mockClear()
  db.query.mockClear()

  return { fixture, connection, db, store, state: store.getState() }
}

export const academicInput = {
  type: 'tp', title: 'Entrega PP3', date: '2099-09-20', subjectId: null,
}

export function failUpcomingRead(db, error = new Error('fallo inyectado al leer próximas fechas')) {
  const query = db.query.getMockImplementation()
  db.query.mockImplementation(async (sql, values) => {
    if (sql.includes('date >= ?')) throw error
    return query(sql, values)
  })
  return () => db.query.mockImplementation(query)
}
