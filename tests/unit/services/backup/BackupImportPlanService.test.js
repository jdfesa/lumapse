import { describe, expect, it, vi } from 'vitest'
import { buildBackupManifest } from '../../../../src/services/backup/BackupFormat.ts'
import {
  createBackupImportPlan,
  createCurrentBackupImportPlan,
} from '../../../../src/services/backup/BackupImportPlanService.ts'

const CREATED_AT = '2026-06-03T12:30:00.000Z'

function manifest() {
  return buildBackupManifest({
    createdAt: CREATED_AT,
    filename: 'lumapse-2026-06-03-12-30.zip',
    counts: {
      subjects: 1,
      notes: 1,
      academicEvents: 1,
    },
  })
}

function subject(overrides = {}) {
  return {
    id: 'subj-math',
    name: 'Matematica',
    parentSubjectId: null,
    archived: false,
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
    pinned: false,
    archived: false,
    statusEmoji: null,
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

function parsedBackup(overrides = {}) {
  const data = {
    subjects: [subject()],
    notes: [note()],
    academicEvents: [academicEvent()],
    ...(overrides.data || {}),
  }

  return {
    manifest: manifest(),
    data,
    counts: {
      subjects: data.subjects.length,
      notes: data.notes.length,
      academicEvents: data.academicEvents.length,
    },
    warnings: overrides.warnings || [],
  }
}

describe('BackupImportPlanService', () => {
  it('crea un plan importable completo cuando no hay datos locales', () => {
    const plan = createBackupImportPlan(parsedBackup())

    expect(plan.data.subjects).toHaveLength(1)
    expect(plan.data.notes).toHaveLength(1)
    expect(plan.data.academicEvents).toHaveLength(1)
    expect(plan.counts.subjects).toEqual({ source: 1, importable: 1, skipped: 0 })
    expect(plan.counts.notes).toEqual({ source: 1, importable: 1, skipped: 0 })
    expect(plan.counts.academicEvents).toEqual({ source: 1, importable: 1, skipped: 0 })
    expect(plan.skipped).toEqual([])
    expect(plan.relationshipRepairs).toEqual([])
  })

  it('ordena materias padre antes de secciones aunque el backup venga desordenado', () => {
    const plan = createBackupImportPlan(parsedBackup({
      data: {
        subjects: [
          subject({ id: 'sec-1', name: 'Unidad I', parentSubjectId: 'subj-root' }),
          subject({ id: 'subj-root', name: 'Historia' }),
        ],
        notes: [],
        academicEvents: [],
      },
    }))

    expect(plan.data.subjects.map(item => item.id)).toEqual(['subj-root', 'sec-1'])
    expect(plan.data.subjects[1].parentSubjectId).toBe('subj-root')
  })

  it('omite registros que ya existen por ID local sin modificarlos', () => {
    const plan = createBackupImportPlan(parsedBackup(), {
      localData: {
        subjects: [subject()],
        notes: [note()],
        academicEvents: [academicEvent()],
      },
    })

    expect(plan.data.subjects).toEqual([])
    expect(plan.data.notes).toEqual([])
    expect(plan.data.academicEvents).toEqual([])
    expect(plan.skipped).toEqual([
      expect.objectContaining({ entity: 'subject', id: 'subj-math' }),
      expect.objectContaining({ entity: 'note', id: 'note-1' }),
      expect.objectContaining({ entity: 'academicEvent', id: 'event-1' }),
    ])
    expect(plan.counts.subjects.skipped).toBe(1)
    expect(plan.counts.notes.skipped).toBe(1)
    expect(plan.counts.academicEvents.skipped).toBe(1)
  })

  it('omite IDs duplicados dentro del backup', () => {
    const plan = createBackupImportPlan(parsedBackup({
      data: {
        subjects: [
          subject({ id: 'subj-a', name: 'A' }),
          subject({ id: 'subj-a', name: 'A duplicada' }),
        ],
        notes: [
          note({ id: 'note-a', subjectId: 'subj-a' }),
          note({ id: 'note-a', title: 'Duplicada', subjectId: 'subj-a' }),
        ],
        academicEvents: [
          academicEvent({ id: 'event-a', subjectId: 'subj-a' }),
          academicEvent({ id: 'event-a', title: 'Duplicada', subjectId: 'subj-a' }),
        ],
      },
    }))

    expect(plan.data.subjects).toHaveLength(1)
    expect(plan.data.notes).toHaveLength(1)
    expect(plan.data.academicEvents).toHaveLength(1)
    expect(plan.skipped).toEqual(expect.arrayContaining([
      expect.objectContaining({ entity: 'subject', id: 'subj-a', reason: 'ID duplicado dentro del backup.' }),
      expect.objectContaining({ entity: 'note', id: 'note-a', reason: 'ID duplicado dentro del backup.' }),
      expect.objectContaining({ entity: 'academicEvent', id: 'event-a', reason: 'ID duplicado dentro del backup.' }),
    ]))
  })

  it('renombra materias cuando hay colision de nombre en el mismo nivel', () => {
    const plan = createBackupImportPlan(parsedBackup({
      data: {
        subjects: [
          subject({ id: 'subj-history', name: 'Historia' }),
          subject({ id: 'subj-literature', name: 'Historia' }),
        ],
        notes: [],
        academicEvents: [],
      },
    }), {
      localData: {
        subjects: [subject({ id: 'local-history', name: 'Historia' })],
      },
    })

    expect(plan.data.subjects.map(item => item.name)).toEqual([
      'Historia (importada)',
      'Historia (importada 2)',
    ])
    expect(plan.renamedSubjects).toEqual([
      expect.objectContaining({ id: 'subj-history', from: 'Historia', to: 'Historia (importada)' }),
      expect.objectContaining({ id: 'subj-literature', from: 'Historia', to: 'Historia (importada 2)' }),
    ])
    expect(plan.counts.renamedSubjects).toBe(2)
  })

  it('repara relaciones a materias faltantes sin descartar notas ni fechas', () => {
    const plan = createBackupImportPlan(parsedBackup({
      data: {
        subjects: [
          subject({ id: 'sec-orphan', name: 'Unidad I', parentSubjectId: 'missing-parent' }),
        ],
        notes: [
          note({ id: 'note-orphan', subjectId: 'missing-subject' }),
        ],
        academicEvents: [
          academicEvent({ id: 'event-orphan', subjectId: 'missing-subject' }),
        ],
      },
    }))

    expect(plan.data.subjects[0]).toMatchObject({
      id: 'sec-orphan',
      parentSubjectId: null,
    })
    expect(plan.data.notes[0]).toMatchObject({
      id: 'note-orphan',
      subjectId: null,
    })
    expect(plan.data.academicEvents[0]).toMatchObject({
      id: 'event-orphan',
      subjectId: null,
    })
    expect(plan.relationshipRepairs).toEqual(expect.arrayContaining([
      expect.objectContaining({ entity: 'subject', id: 'sec-orphan', field: 'parentSubjectId' }),
      expect.objectContaining({ entity: 'note', id: 'note-orphan', field: 'subjectId' }),
      expect.objectContaining({ entity: 'academicEvent', id: 'event-orphan', field: 'subjectId' }),
    ]))
    expect(plan.counts.relationshipRepairs).toBe(3)
  })

  it('usa datos locales recolectados por dependencia inyectada', async () => {
    const collectData = vi.fn().mockResolvedValue({
      subjects: [subject({ id: 'local-history', name: 'Historia' })],
      notes: [],
      academicEvents: [],
    })

    const plan = await createCurrentBackupImportPlan(parsedBackup({
      data: {
        subjects: [subject({ id: 'subj-history', name: 'Historia' })],
        notes: [],
        academicEvents: [],
      },
    }), {
      collectData,
    })

    expect(collectData).toHaveBeenCalledTimes(1)
    expect(plan.data.subjects[0].name).toBe('Historia (importada)')
  })
})
