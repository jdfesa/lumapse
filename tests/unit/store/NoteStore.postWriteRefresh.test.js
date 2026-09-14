import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { academicInput, failUpcomingRead, postWriteRefreshHarness } from './postWriteRefreshHarness.js'

let harness
let warnings, errors, notifications, cleanup
beforeEach(async () => {
  harness = await postWriteRefreshHarness()
  warnings = vi.fn()
  errors = vi.fn()
  notifications = vi.fn()
  cleanup = [
    harness.store.subscribeToPendingRefreshes(warnings),
    harness.store.subscribeToStoreErrors(errors),
    harness.store.subscribe(notifications),
  ]
  notifications.mockClear()
})
afterEach(() => {
  cleanup?.forEach(unsubscribe => unsubscribe())
  harness?.fixture.close()
})

it('confirma una sola nota aunque falle la lectura posterior al INSERT', async () => {
  const { store, db, connection } = harness
  db.query.mockRejectedValueOnce(new Error('fallo inyectado al leer conteos'))

  const note = await store.createNote('PP3', 'Contenido')

  const rows = (await connection.getDb().query('SELECT id FROM notes')).values
  expect(rows).toEqual([{ id: note.id }])
})

it('confirma una sola fecha aunque falle la lectura posterior al INSERT', async () => {
  const { store, db, connection } = harness
  failUpcomingRead(db)

  const event = await store.createAcademicEvent(academicInput)

  const rows = (await connection.getDb().query('SELECT id FROM academic_events')).values
  expect(rows).toEqual([{ id: event.id }])
})

const cases = [
  {
    label: 'nota', table: 'notes', operation: 'createNote',
    create: store => store.createNote('PP3', 'Contenido'),
    failRead: (db, error) => {
      const query = db.query.getMockImplementation()
      db.query.mockRejectedValue(error)
      return () => db.query.mockImplementation(query)
    },
    cached: state => state.notes,
    refreshed: state => state.subjects.inboxCount,
  },
  {
    label: 'fecha', table: 'academic_events', operation: 'createAcademicEvent',
    create: store => store.createAcademicEvent(academicInput),
    failRead: failUpcomingRead,
    cached: state => state.academicEventsForMonth,
    refreshed: state => state.upcomingAcademicEvents.length,
  },
]

describe.each(cases)('contrato SQLite de creación: $label', (scenario) => {
  function rows() {
    // Consulta directa de verificación, independiente del fallo inyectado al adaptador.
    return harness.fixture.database.exec(`SELECT id FROM ${scenario.table}`)[0]?.values || []
  }

  it('confirma el camino normal sin avisos ni errores', async () => {
    const entity = await scenario.create(harness.store)

    expect(rows()).toEqual([[entity.id]])
    expect(scenario.cached(harness.state)).toContainEqual(entity)
    expect(scenario.refreshed(harness.state)).toBe(1)
    expect(warnings).not.toHaveBeenCalled()
    expect(errors).not.toHaveBeenCalled()
  })

  it('rechaza una inserción fallida sin filas ni estado nuevo y permite reintentar', async () => {
    const { DatabaseError } = await import('../../../src/services/sqlite/errors.js')
    const previousState = structuredClone(harness.state)
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    harness.db.run.mockRejectedValueOnce(new Error('fallo inyectado antes de INSERT'))
    try {
      await expect(scenario.create(harness.store)).rejects.toBeInstanceOf(DatabaseError)
      expect(rows()).toEqual([])
      expect(harness.state).toEqual(previousState)
      expect(warnings).not.toHaveBeenCalled()
      expect(notifications).not.toHaveBeenCalled()
      expect(errors).toHaveBeenCalledTimes(1)
      expect(errors.mock.calls[0][0].operation).toBe(scenario.operation)

      const entity = await scenario.create(harness.store)
      expect(rows()).toEqual([[entity.id]])
      expect(harness.db.run).toHaveBeenCalledTimes(2)
    } finally { log.mockRestore() }
  })

  it.each(['Error', 'DatabaseError'])('separa un %s de lectura y recupera sin repetir escrituras ni avisos', async (kind) => {
    const { DatabaseError } = await import('../../../src/services/sqlite/errors.js')
    const cause = kind === 'DatabaseError'
      ? new DatabaseError('derivedRead', new Error('fallo secundario'))
      : new Error('fallo secundario')
    const restore = scenario.failRead(harness.db, cause)

    const entity = await scenario.create(harness.store)

    expect(rows()).toEqual([[entity.id]])
    expect(scenario.cached(harness.state)).toContainEqual(entity)
    expect(notifications).toHaveBeenCalled()
    expect(errors).not.toHaveBeenCalled()
    expect(warnings).toHaveBeenCalledTimes(1)
    const warning = warnings.mock.calls[0][0]
    expect(warning).toMatchObject({ operation: scenario.operation, entityId: entity.id, cause })
    expect(Object.isFrozen(warning)).toBe(true)
    await expect(warning.retry()).resolves.toBe(false)
    expect(rows()).toEqual([[entity.id]])
    expect(warnings).toHaveBeenCalledTimes(1)

    restore()
    const firstRetry = warning.retry()
    expect(warning.retry()).toBe(firstRetry)
    await expect(firstRetry).resolves.toBe(true)
    await expect(warning.retry()).resolves.toBe(true)
    expect(rows()).toEqual([[entity.id]])
    expect(scenario.refreshed(harness.state)).toBe(1)
    expect(harness.db.run).toHaveBeenCalledTimes(1)
    expect(harness.db.run.mock.calls[0][0]).toContain(`INSERT INTO ${scenario.table}`)
    expect(warnings).toHaveBeenCalledTimes(1)
    expect(errors).not.toHaveBeenCalled()
  })
})

it('recupera también si falla la segunda lectura de materias archivadas', async () => {
  const { db, store, state } = harness
  const query = db.query.getMockImplementation()
  db.query.mockImplementation(async (sql, values) => {
    if (sql.includes('SELECT id FROM subjects WHERE archived = 1')) throw new Error('archivados pendientes')
    return query(sql, values)
  })
  const note = await store.createNote('PP3', 'Contenido')
  expect(warnings).toHaveBeenCalledTimes(1)
  expect(state.notes.map(note => note.id)).toEqual([note.id])
  db.query.mockImplementation(query)
  await expect(warnings.mock.calls[0][0].retry()).resolves.toBe(true)
  expect(state.subjects.inboxCount).toBe(1)
  expect(state.archivedSubjectIds).toEqual([])
  expect(db.run).toHaveBeenCalledTimes(1)
})
