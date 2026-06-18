import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as Connection from '../../../../src/services/sqlite/connection.js'
import { buildBackupManifest } from '../../../../src/services/backup/BackupFormat.ts'
import { applyBackupImportPlan } from '../../../../src/services/backup/BackupImportDataSource.ts'

const mockDb = vi.hoisted(() => ({
  run: vi.fn(),
}))

vi.mock('../../../../src/services/sqlite/connection.js', () => ({
  getDb: vi.fn(() => mockDb),
  runTransaction: vi.fn(async action => action()),
}))

const CREATED_AT = '2026-06-03T12:30:00.000Z'

function subject(overrides = {}) {
  return {
    id: 'subj-math',
    name: 'Matematica',
    parentSubjectId: null,
    archived: true,
    color: '#38bdf8',
    createdAt: '2026-05-01T10:00:00.000Z',
    ...overrides,
  }
}

function note(overrides = {}) {
  return {
    id: 'note-1',
    title: 'Parcial 1',
    content: 'Integrales y matrices.',
    pinned: true,
    archived: false,
    statusEmoji: 'pin',
    subjectId: 'subj-math',
    createdAt: '2026-05-02T10:00:00.000Z',
    updatedAt: '2026-05-03T10:00:00.000Z',
    ...overrides,
  }
}

function academicEvent(overrides = {}) {
  return {
    id: 'event-1',
    type: 'parcial',
    title: 'Primer parcial',
    date: '2026-06-20',
    subjectId: 'subj-math',
    createdAt: '2026-05-10T10:00:00.000Z',
    updatedAt: '2026-05-11T10:00:00.000Z',
    ...overrides,
  }
}

function plan(overrides = {}) {
  const data = {
    subjects: [subject()],
    notes: [note()],
    academicEvents: [academicEvent()],
    ...(overrides.data || {}),
  }

  return {
    manifest: buildBackupManifest({
      createdAt: CREATED_AT,
      counts: {
        subjects: data.subjects.length,
        notes: data.notes.length,
        academicEvents: data.academicEvents.length,
      },
    }),
    sourceCounts: {
      subjects: data.subjects.length,
      notes: data.notes.length,
      academicEvents: data.academicEvents.length,
    },
    data,
    counts: {
      subjects: { source: data.subjects.length, importable: data.subjects.length, skipped: 0 },
      notes: { source: data.notes.length, importable: data.notes.length, skipped: 0 },
      academicEvents: { source: data.academicEvents.length, importable: data.academicEvents.length, skipped: 0 },
      renamedSubjects: 0,
      relationshipRepairs: 0,
    },
    skipped: overrides.skipped || [],
    renamedSubjects: overrides.renamedSubjects || [],
    relationshipRepairs: overrides.relationshipRepairs || [],
    warnings: overrides.warnings || [],
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockDb.run.mockResolvedValue(undefined)
})

describe('BackupImportDataSource', () => {
  it('inserta materias, notas y fechas academicas dentro de una transaccion', async () => {
    const result = await applyBackupImportPlan(plan())

    expect(Connection.runTransaction).toHaveBeenCalledTimes(1)
    expect(Connection.getDb).toHaveBeenCalledTimes(1)
    expect(mockDb.run).toHaveBeenCalledTimes(3)
    expect(mockDb.run.mock.calls[0][0]).toContain('INSERT INTO subjects')
    expect(mockDb.run.mock.calls[1][0]).toContain('INSERT INTO notes')
    expect(mockDb.run.mock.calls[2][0]).toContain('INSERT INTO academic_events')
    expect(mockDb.run.mock.calls[0][2]).toBe(false)
    expect(mockDb.run.mock.calls[1][2]).toBe(false)
    expect(mockDb.run.mock.calls[2][2]).toBe(false)
    expect(result.imported).toEqual({
      subjects: 1,
      notes: 1,
      academicEvents: 1,
    })
  })

  it('convierte booleanos y nullables al formato esperado por SQLite', async () => {
    await applyBackupImportPlan(plan({
      data: {
        subjects: [subject({ parentSubjectId: '', archived: false, color: null })],
        notes: [note({ pinned: false, archived: true, statusEmoji: '', subjectId: null })],
        academicEvents: [academicEvent({ title: '', subjectId: null })],
      },
    }))

    expect(mockDb.run.mock.calls[0][1]).toEqual([
      'subj-math',
      'Matematica',
      null,
      0,
      null,
      '2026-05-01T10:00:00.000Z',
    ])
    expect(mockDb.run.mock.calls[1][1]).toEqual([
      'note-1',
      'Parcial 1',
      'Integrales y matrices.',
      0,
      1,
      null,
      null,
      '2026-05-02T10:00:00.000Z',
      '2026-05-03T10:00:00.000Z',
    ])
    expect(mockDb.run.mock.calls[2][1]).toEqual([
      'event-1',
      'parcial',
      null,
      '2026-06-20',
      null,
      '2026-05-10T10:00:00.000Z',
      '2026-05-11T10:00:00.000Z',
    ])
  })

  it('no abre transaccion si el plan no tiene datos importables', async () => {
    const result = await applyBackupImportPlan(plan({
      data: {
        subjects: [],
        notes: [],
        academicEvents: [],
      },
      skipped: [
        { entity: 'note', id: 'note-1', reason: 'Ya existe una nota con el mismo ID.' },
      ],
    }))

    expect(Connection.runTransaction).not.toHaveBeenCalled()
    expect(Connection.getDb).not.toHaveBeenCalled()
    expect(mockDb.run).not.toHaveBeenCalled()
    expect(result).toMatchObject({
      imported: {
        subjects: 0,
        notes: 0,
        academicEvents: 0,
      },
      skipped: [
        { entity: 'note', id: 'note-1', reason: 'Ya existe una nota con el mismo ID.' },
      ],
    })
  })

  it('propaga errores de escritura para que runTransaction revierta la operacion', async () => {
    mockDb.run
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('sqlite fallo'))

    await expect(applyBackupImportPlan(plan())).rejects.toThrow('sqlite fallo')

    expect(Connection.runTransaction).toHaveBeenCalledTimes(1)
    expect(mockDb.run).toHaveBeenCalledTimes(2)
  })

  it('devuelve resumen con omitidos, renombres, reparaciones y warnings del plan', async () => {
    const result = await applyBackupImportPlan(plan({
      skipped: [
        { entity: 'note', id: 'note-old', reason: 'Ya existe una nota con el mismo ID.' },
      ],
      renamedSubjects: [
        { id: 'subj-math', from: 'Matematica', to: 'Matematica (importada)', parentSubjectId: null },
      ],
      relationshipRepairs: [
        { entity: 'note', id: 'note-1', field: 'subjectId', from: 'missing', to: null, reason: 'Materia faltante.' },
      ],
      warnings: ['Advertencia de prueba.'],
    }))

    expect(result.skipped).toEqual([
      { entity: 'note', id: 'note-old', reason: 'Ya existe una nota con el mismo ID.' },
    ])
    expect(result.renamedSubjects).toEqual([
      { id: 'subj-math', from: 'Matematica', to: 'Matematica (importada)', parentSubjectId: null },
    ])
    expect(result.relationshipRepairs).toEqual([
      { entity: 'note', id: 'note-1', field: 'subjectId', from: 'missing', to: null, reason: 'Materia faltante.' },
    ])
    expect(result.warnings).toEqual(['Advertencia de prueba.'])
  })
})
