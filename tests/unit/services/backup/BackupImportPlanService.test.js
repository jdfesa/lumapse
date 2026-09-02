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

function subjectParentsById(plan) {
  return Object.fromEntries(plan.data.subjects.map(item => [item.id, item.parentSubjectId]))
}

function normalizedSubjectRepairs(plan) {
  return plan.relationshipRepairs
    .filter(repair => repair.entity === 'subject')
    .map(({ id, from, to, reason }) => ({ id, from, to, reason }))
    .sort((left, right) => left.id.localeCompare(right.id))
}

function expectValidTwoLevelHierarchy(plan, localSubjects = []) {
  const subjectsById = new Map([
    ...localSubjects.map(item => [item.id, item]),
    ...plan.data.subjects.map(item => [item.id, item]),
  ])

  for (const item of plan.data.subjects) {
    if (!item.parentSubjectId) continue

    const parent = subjectsById.get(item.parentSubjectId)
    expect(parent).toBeDefined()
    expect(parent.parentSubjectId).toBeNull()
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

  it('repara cada nivel profundo y conserva referencias a subjects planificados', () => {
    const plan = createBackupImportPlan(parsedBackup({
      data: {
        subjects: [
          subject({ id: 'level-5', name: 'Nivel 5', parentSubjectId: 'level-4' }),
          subject({ id: 'level-3', name: 'Nivel 3', parentSubjectId: 'level-2' }),
          subject({ id: 'level-1', name: 'Nivel 1' }),
          subject({ id: 'level-4', name: 'Nivel 4', parentSubjectId: 'level-3' }),
          subject({ id: 'level-2', name: 'Nivel 2', parentSubjectId: 'level-1' }),
        ],
        notes: [note({ id: 'note-deep', subjectId: 'level-5' })],
        academicEvents: [academicEvent({ id: 'event-deep', subjectId: 'level-3' })],
      },
    }))

    expect(plan.data.subjects).toHaveLength(5)
    expect(subjectParentsById(plan)).toEqual({
      'level-1': null,
      'level-2': 'level-1',
      'level-3': null,
      'level-4': 'level-3',
      'level-5': null,
    })
    expect(normalizedSubjectRepairs(plan)).toEqual([
      {
        id: 'level-3',
        from: 'level-2',
        to: null,
        reason: 'La materia padre ya es una seccion; no se permiten mas de 2 niveles.',
      },
      {
        id: 'level-5',
        from: 'level-4',
        to: null,
        reason: 'La materia padre ya es una seccion; no se permiten mas de 2 niveles.',
      },
    ])
    expect(plan.counts.relationshipRepairs).toBe(2)
    expect(plan.data.notes[0].subjectId).toBe('level-5')
    expect(plan.data.academicEvents[0].subjectId).toBe('level-3')
    expectValidTwoLevelHierarchy(plan)
  })

  it('repara un padre local que ya es una seccion', () => {
    const localSubjects = [
      subject({ id: 'local-root', name: 'Local' }),
      subject({ id: 'local-section', name: 'Seccion local', parentSubjectId: 'local-root' }),
    ]
    const plan = createBackupImportPlan(parsedBackup({
      data: {
        subjects: [
          subject({ id: 'imported-child', name: 'Hija', parentSubjectId: 'local-section' }),
        ],
        notes: [],
        academicEvents: [],
      },
    }), {
      localData: { subjects: localSubjects },
    })

    expect(plan.data.subjects[0].parentSubjectId).toBeNull()
    expect(normalizedSubjectRepairs(plan)).toEqual([
      {
        id: 'imported-child',
        from: 'local-section',
        to: null,
        reason: 'La materia padre ya es una seccion; no se permiten mas de 2 niveles.',
      },
    ])
    expectValidTwoLevelHierarchy(plan, localSubjects)
  })

  it('repara un autociclo una sola vez sin omitir el subject', () => {
    const plan = createBackupImportPlan(parsedBackup({
      data: {
        subjects: [subject({ id: 'self-cycle', name: 'Autociclo', parentSubjectId: 'self-cycle' })],
        notes: [],
        academicEvents: [],
      },
    }))

    expect(subjectParentsById(plan)).toEqual({ 'self-cycle': null })
    expect(normalizedSubjectRepairs(plan)).toEqual([
      {
        id: 'self-cycle',
        from: 'self-cycle',
        to: null,
        reason: 'Se detecto una relacion circular entre materias/secciones.',
      },
    ])
    expect(plan.counts.subjects).toEqual({ source: 1, importable: 1, skipped: 0 })
    expect(plan.counts.relationshipRepairs).toBe(1)
  })

  it('repara ambos lados de un ciclo de dos nodos', () => {
    const plan = createBackupImportPlan(parsedBackup({
      data: {
        subjects: [
          subject({ id: 'cycle-b', name: 'B', parentSubjectId: 'cycle-a' }),
          subject({ id: 'cycle-a', name: 'A', parentSubjectId: 'cycle-b' }),
        ],
        notes: [],
        academicEvents: [],
      },
    }))

    expect(subjectParentsById(plan)).toEqual({ 'cycle-a': null, 'cycle-b': null })
    expect(normalizedSubjectRepairs(plan).map(repair => repair.id)).toEqual(['cycle-a', 'cycle-b'])
    expect(plan.counts.relationshipRepairs).toBe(2)
    expect(plan.data.subjects).toHaveLength(2)
    expectValidTwoLevelHierarchy(plan)
  })

  it('normaliza ciclos largos con entrada de forma independiente del orden', () => {
    const subjectsById = {
      'cycle-a': subject({ id: 'cycle-a', name: 'A', parentSubjectId: 'cycle-b' }),
      'cycle-b': subject({ id: 'cycle-b', name: 'B', parentSubjectId: 'cycle-c' }),
      'cycle-c': subject({ id: 'cycle-c', name: 'C', parentSubjectId: 'cycle-a' }),
      entry: subject({ id: 'entry', name: 'Entrada', parentSubjectId: 'cycle-a' }),
      tail: subject({ id: 'tail', name: 'Cola', parentSubjectId: 'entry' }),
    }
    const planForOrder = order => createBackupImportPlan(parsedBackup({
      data: {
        subjects: order.map(id => subjectsById[id]),
        notes: [],
        academicEvents: [],
      },
    }))

    const firstPlan = planForOrder(['tail', 'entry', 'cycle-b', 'cycle-a', 'cycle-c'])
    const reversedPlan = planForOrder(['cycle-c', 'cycle-a', 'cycle-b', 'entry', 'tail'])
    const expectedParents = {
      'cycle-a': null,
      'cycle-b': null,
      'cycle-c': null,
      entry: 'cycle-a',
      tail: null,
    }

    expect(subjectParentsById(firstPlan)).toEqual(expectedParents)
    expect(subjectParentsById(reversedPlan)).toEqual(expectedParents)
    expect(normalizedSubjectRepairs(firstPlan)).toEqual(normalizedSubjectRepairs(reversedPlan))
    expect(normalizedSubjectRepairs(firstPlan).map(repair => repair.id)).toEqual([
      'cycle-a',
      'cycle-b',
      'cycle-c',
      'tail',
    ])
    expect(firstPlan.data.subjects).toHaveLength(5)
    expect(reversedPlan.data.subjects).toHaveLength(5)
    expectValidTwoLevelHierarchy(firstPlan)
    expectValidTwoLevelHierarchy(reversedPlan)
  })

  it('resuelve nombres en el nivel raiz despues de reparar el parent', () => {
    const plan = createBackupImportPlan(parsedBackup({
      data: {
        subjects: [
          subject({ id: 'deep-history', name: 'Historia', parentSubjectId: 'section-a' }),
          subject({ id: 'root-history', name: 'Historia' }),
          subject({ id: 'section-a', name: 'Unidad I', parentSubjectId: 'root-a' }),
          subject({ id: 'root-a', name: 'Quimica' }),
        ],
        notes: [],
        academicEvents: [],
      },
    }), {
      localData: {
        subjects: [subject({ id: 'local-history', name: 'Historia' })],
      },
    })
    const namesById = Object.fromEntries(plan.data.subjects.map(item => [item.id, item.name]))

    expect(subjectParentsById(plan)['deep-history']).toBeNull()
    expect(namesById['root-history']).toBe('Historia (importada)')
    expect(namesById['deep-history']).toBe('Historia (importada 2)')
    expect(plan.renamedSubjects).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'root-history',
        to: 'Historia (importada)',
        parentSubjectId: null,
      }),
      expect.objectContaining({
        id: 'deep-history',
        to: 'Historia (importada 2)',
        parentSubjectId: null,
      }),
    ]))
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
