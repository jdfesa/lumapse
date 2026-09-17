import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { deferred } from '../services/sqlite/sqliteFixture.js'
import {
  academicInput,
  failSubjectRefreshAfterInsert,
  failUpcomingRead,
  postWriteRefreshHarness,
} from './postWriteRefreshHarness.js'

let harness, warnings, errors, cleanups

beforeEach(async () => {
  harness = await postWriteRefreshHarness()
  warnings = vi.fn()
  errors = vi.fn()
  cleanups = [
    harness.store.subscribeToPendingRefreshes(warnings),
    harness.store.subscribeToStoreErrors(errors),
  ]
})

afterEach(() => {
  cleanups?.forEach(unsubscribe => unsubscribe())
  harness?.fixture.close()
})

function subjectRows() {
  return harness.fixture.database.exec(
    'SELECT id, name, color, parentSubjectId FROM subjects ORDER BY name',
  )[0]?.values || []
}

describe('createSubject() con SQLite', () => {
  it('crea materia y sección normalmente con su contrato público y relación', async () => {
    const root = await harness.store.createSubject('Programación III', '#818cf8')
    const section = await harness.store.createSubject('Práctica', '#22c55e', root.id)

    expect(subjectRows()).toEqual([
      [root.id, 'Programación III', '#818cf8', null],
      [section.id, 'Práctica', '#22c55e', root.id],
    ])
    expect(harness.state.subjects.tree).toContainEqual(expect.objectContaining({
      id: root.id,
      children: [expect.objectContaining({ id: section.id, parentSubjectId: root.id })],
    }))
    expect(warnings).not.toHaveBeenCalled()
    expect(errors).not.toHaveBeenCalled()
  })

  it.each([
    { label: 'materia raíz', name: 'Programación III', parent: false },
    { label: 'sección', name: 'Práctica', parent: true },
  ])('conserva una $label confirmada aunque falle loadSubjects', async ({ name, parent }) => {
    const root = parent
      ? await harness.store.createSubject('Programación III', '#818cf8')
      : null
    warnings.mockClear()
    errors.mockClear()
    harness.db.run.mockClear()
    harness.db.query.mockClear()
    failSubjectRefreshAfterInsert(harness.db)

    const subject = await harness.store.createSubject(name, '#22c55e', root?.id || null)

    expect(subjectRows()).toContainEqual([subject.id, name, '#22c55e', root?.id || null])
    expect(subject).toMatchObject({ name, color: '#22c55e', parentSubjectId: root?.id || null })
    expect(warnings).toHaveBeenCalledTimes(1)
    expect(warnings.mock.calls[0][0]).toMatchObject({
      operation: 'createSubject',
      entityId: subject.id,
    })
    expect(errors).not.toHaveBeenCalled()
    expect(harness.db.run.mock.calls.filter(([sql]) => sql.includes('INSERT INTO subjects'))).toHaveLength(1)

    await expect(harness.store.createSubject(name, '#22c55e', root?.id || null))
      .rejects.toThrow(`Ya existe una ${parent ? 'sección' : 'materia'}`)
    expect(subjectRows().filter(row => row[1] === name)).toHaveLength(1)
    expect(harness.db.run.mock.calls.filter(([sql]) => sql.includes('INSERT INTO subjects'))).toHaveLength(1)
  })

  it('rechaza un INSERT real fallido sin persistir ni emitir aviso de refresco', async () => {
    const { DatabaseError } = await import('../../../src/services/sqlite/errors.js')
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {})
    harness.db.run.mockRejectedValueOnce(new Error('fallo inyectado antes de INSERT'))
    try {
      await expect(harness.store.createSubject('Programación III', '#818cf8'))
        .rejects.toBeInstanceOf(DatabaseError)
      expect(subjectRows()).toEqual([])
      expect(warnings).not.toHaveBeenCalled()
      expect(errors).toHaveBeenCalledTimes(1)
      expect(errors.mock.calls[0][0].operation).toBe('createSubject')
    } finally {
      errorLog.mockRestore()
    }
  })

  it('reintenta solo loadSubjects, comparte vuelo y deja de leer al converger', async () => {
    failSubjectRefreshAfterInsert(harness.db)
    const subject = await harness.store.createSubject('Programación III', '#818cf8')
    const { retry } = warnings.mock.calls[0][0]

    harness.db.query.mockRejectedValueOnce(new Error('segunda lectura fallida'))
    await expect(retry()).resolves.toBe(false)
    expect(subjectRows()).toEqual([[subject.id, 'Programación III', '#818cf8', null]])

    const query = harness.db.query.getMockImplementation()
    const gate = deferred()
    harness.db.query.mockImplementationOnce(async (...args) => {
      await gate.promise
      return query(...args)
    })
    const firstRetry = retry()
    expect(retry()).toBe(firstRetry)
    gate.resolve()
    await expect(firstRetry).resolves.toBe(true)
    const readsAfterRecovery = harness.db.query.mock.calls.length
    await expect(retry()).resolves.toBe(true)

    expect(harness.db.query).toHaveBeenCalledTimes(readsAfterRecovery)
    expect(harness.state.subjects.tree.map(item => item.id)).toContain(subject.id)
    expect(harness.db.run.mock.calls.filter(([sql]) => sql.includes('INSERT INTO subjects'))).toHaveLength(1)
    expect(warnings).toHaveBeenCalledTimes(1)
    expect(errors).not.toHaveBeenCalled()
  })
})

function academicRows() {
  return harness.fixture.database.exec(
    'SELECT id, type, title, date, subjectId FROM academic_events',
  )[0]?.values || []
}

async function createAcademicFixture() {
  const created = await harness.store.createAcademicEvent(academicInput)
  warnings.mockClear()
  errors.mockClear()
  harness.db.run.mockClear()
  harness.db.query.mockClear()
  return created
}

describe('updateAcademicEvent() con SQLite', () => {
  it('actualiza normalmente la misma entidad, la fila y los caches conocidos', async () => {
    const created = await createAcademicFixture()

    const updated = await harness.store.updateAcademicEvent(created.id, {
      title: 'Cambio persistido',
      type: 'final',
    })

    expect(updated).toMatchObject({ id: created.id, title: 'Cambio persistido', type: 'final' })
    expect(academicRows()).toEqual([
      [created.id, 'final', 'Cambio persistido', academicInput.date, null],
    ])
    expect(harness.state.academicEvents).toContainEqual(updated)
    expect(harness.state.academicEventsForMonth).toContainEqual(updated)
    expect(harness.state.upcomingAcademicEvents).toContainEqual(updated)
    expect(warnings).not.toHaveBeenCalled()
    expect(errors).not.toHaveBeenCalled()
  })

  it('conserva el UPDATE confirmado y reconcilia caches si falla próximas fechas', async () => {
    const created = await createAcademicFixture()
    failUpcomingRead(harness.db)

    const updated = await harness.store.updateAcademicEvent(created.id, {
      title: 'Cambio persistido',
    })

    expect(updated).toMatchObject({ id: created.id, title: 'Cambio persistido' })
    expect(academicRows()).toEqual([
      [created.id, academicInput.type, 'Cambio persistido', academicInput.date, null],
    ])
    expect(harness.state.academicEvents).toContainEqual(updated)
    expect(harness.state.academicEventsForMonth).toContainEqual(updated)
    expect(harness.state.upcomingAcademicEvents).toContainEqual(created)
    expect(warnings).toHaveBeenCalledTimes(1)
    expect(warnings.mock.calls[0][0]).toMatchObject({
      operation: 'updateAcademicEvent',
      entityId: created.id,
    })
    expect(errors).not.toHaveBeenCalled()
  })

  it('rechaza un UPDATE real fallido y conserva fila y caches anteriores', async () => {
    const created = await createAcademicFixture()
    const { DatabaseError } = await import('../../../src/services/sqlite/errors.js')
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {})
    harness.db.run.mockRejectedValueOnce(new Error('fallo inyectado antes de UPDATE'))
    try {
      await expect(harness.store.updateAcademicEvent(created.id, { title: 'No persistido' }))
        .rejects.toBeInstanceOf(DatabaseError)
      expect(academicRows()).toEqual([
        [created.id, academicInput.type, academicInput.title, academicInput.date, null],
      ])
      expect(harness.state.academicEvents).toContainEqual(created)
      expect(harness.state.academicEventsForMonth).toContainEqual(created)
      expect(harness.state.upcomingAcademicEvents).toContainEqual(created)
      expect(warnings).not.toHaveBeenCalled()
      expect(errors).toHaveBeenCalledTimes(1)
      expect(errors.mock.calls[0][0].operation).toBe('updateAcademicEvent')
    } finally {
      errorLog.mockRestore()
    }
  })

  it('recupera próximas fechas single-flight sin repetir UPDATE y deja de leer al converger', async () => {
    const created = await createAcademicFixture()
    const restore = failUpcomingRead(harness.db)
    const updated = await harness.store.updateAcademicEvent(created.id, { title: 'Cambio persistido' })
    const { retry } = warnings.mock.calls[0][0]

    await expect(retry()).resolves.toBe(false)
    restore()
    const query = harness.db.query.getMockImplementation()
    const gate = deferred()
    harness.db.query.mockImplementationOnce(async (...args) => {
      await gate.promise
      return query(...args)
    })
    const firstRetry = retry()
    expect(retry()).toBe(firstRetry)
    gate.resolve()
    await expect(firstRetry).resolves.toBe(true)
    const readsAfterRecovery = harness.db.query.mock.calls.length
    await expect(retry()).resolves.toBe(true)

    expect(harness.db.query).toHaveBeenCalledTimes(readsAfterRecovery)
    expect(harness.state.upcomingAcademicEvents).toContainEqual(updated)
    expect(harness.db.run.mock.calls.filter(([sql]) => sql.includes('UPDATE academic_events'))).toHaveLength(1)
    expect(warnings).toHaveBeenCalledTimes(1)
    expect(errors).not.toHaveBeenCalled()
  })
})

describe('deleteAcademicEvent() con SQLite', () => {
  it('elimina normalmente con retorno undefined y limpia todos los caches conocidos', async () => {
    const created = await createAcademicFixture()

    await expect(harness.store.deleteAcademicEvent(created.id)).resolves.toBeUndefined()

    expect(academicRows()).toEqual([])
    expect(harness.state.academicEvents).toEqual([])
    expect(harness.state.academicEventsForMonth).toEqual([])
    expect(harness.state.upcomingAcademicEvents).toEqual([])
    expect(warnings).not.toHaveBeenCalled()
    expect(errors).not.toHaveBeenCalled()
  })

  it('conserva el DELETE confirmado y limpia caches si falla próximas fechas', async () => {
    const created = await createAcademicFixture()
    failUpcomingRead(harness.db)

    await expect(harness.store.deleteAcademicEvent(created.id)).resolves.toBeUndefined()

    expect(academicRows()).toEqual([])
    expect(harness.state.academicEvents).toEqual([])
    expect(harness.state.academicEventsForMonth).toEqual([])
    expect(harness.state.upcomingAcademicEvents).toContainEqual(created)
    expect(warnings).toHaveBeenCalledTimes(1)
    expect(warnings.mock.calls[0][0]).toMatchObject({
      operation: 'deleteAcademicEvent',
      entityId: created.id,
    })
    expect(errors).not.toHaveBeenCalled()
  })

  it('rechaza un DELETE real fallido y conserva fila y caches anteriores', async () => {
    const created = await createAcademicFixture()
    const { DatabaseError } = await import('../../../src/services/sqlite/errors.js')
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {})
    harness.db.run.mockRejectedValueOnce(new Error('fallo inyectado antes de DELETE'))
    try {
      await expect(harness.store.deleteAcademicEvent(created.id)).rejects.toBeInstanceOf(DatabaseError)
      expect(academicRows()).toEqual([
        [created.id, academicInput.type, academicInput.title, academicInput.date, null],
      ])
      expect(harness.state.academicEvents).toContainEqual(created)
      expect(harness.state.academicEventsForMonth).toContainEqual(created)
      expect(harness.state.upcomingAcademicEvents).toContainEqual(created)
      expect(warnings).not.toHaveBeenCalled()
      expect(errors).toHaveBeenCalledTimes(1)
      expect(errors.mock.calls[0][0].operation).toBe('deleteAcademicEvent')
    } finally {
      errorLog.mockRestore()
    }
  })

  it('recupera próximas fechas single-flight sin repetir DELETE ni volver a leer', async () => {
    const created = await createAcademicFixture()
    const restore = failUpcomingRead(harness.db)
    await harness.store.deleteAcademicEvent(created.id)
    const { retry } = warnings.mock.calls[0][0]

    await expect(retry()).resolves.toBe(false)
    restore()
    const query = harness.db.query.getMockImplementation()
    const gate = deferred()
    harness.db.query.mockImplementationOnce(async (...args) => {
      await gate.promise
      return query(...args)
    })
    const firstRetry = retry()
    expect(retry()).toBe(firstRetry)
    gate.resolve()
    await expect(firstRetry).resolves.toBe(true)
    const readsAfterRecovery = harness.db.query.mock.calls.length
    await expect(retry()).resolves.toBe(true)

    expect(harness.db.query).toHaveBeenCalledTimes(readsAfterRecovery)
    expect(harness.state.upcomingAcademicEvents).toEqual([])
    expect(harness.db.run.mock.calls.filter(([sql]) => sql.includes('DELETE FROM academic_events'))).toHaveLength(1)
    expect(warnings).toHaveBeenCalledTimes(1)
    expect(errors).not.toHaveBeenCalled()
  })
})
