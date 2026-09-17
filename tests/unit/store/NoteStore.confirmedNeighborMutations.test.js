import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { deferred } from '../services/sqlite/sqliteFixture.js'
import { failSubjectRefreshAfterInsert, postWriteRefreshHarness } from './postWriteRefreshHarness.js'

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
