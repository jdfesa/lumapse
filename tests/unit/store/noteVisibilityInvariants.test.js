import { describe, expect, it } from 'vitest'
import { getFilteredNotes } from '../../../src/store/noteFilters.js'

const UPDATED_AT = '2024-01-15T10:00:00.000Z'

function makeNote(overrides = {}) {
  return {
    id: 'note-1',
    title: 'Nota de prueba',
    content: 'contenido de prueba',
    pinned: false,
    archived: false,
    subjectId: null,
    updatedAt: UPDATED_AT,
    ...overrides,
  }
}

function makeState(overrides = {}) {
  return {
    notes: [],
    viewMode: 'inbox',
    activeSubjectId: null,
    searchQuery: '',
    dateFilter: null,
    subjects: { tree: [] },
    archivedSubjectIds: [],
    ...overrides,
  }
}

function getNavigableSubjectIds(subjects) {
  return (subjects.tree || []).flatMap(subject => [
    subject.id,
    ...(subject.children || []).map(child => child.id),
  ])
}

function getReachableNoteIds(notes, subjects, archivedSubjectIds) {
  const states = [
    makeState({ notes, subjects, archivedSubjectIds, viewMode: 'inbox' }),
    makeState({ notes, subjects, archivedSubjectIds, viewMode: 'archived' }),
    ...getNavigableSubjectIds(subjects).map(subjectId =>
      makeState({
        notes,
        subjects,
        archivedSubjectIds,
        viewMode: 'subject',
        activeSubjectId: subjectId,
      })
    ),
  ]

  return new Set(states.flatMap(state => getFilteredNotes(state).map(note => note.id)))
}

describe('invariantes de visibilidad de notas', () => {
  const activeSubjects = {
    tree: [
      { id: 'programacion-ii', children: [{ id: 'unidad-i' }] },
      { id: 'base-de-datos', children: [{ id: 'tp-final' }] },
    ],
  }

  it('toda nota activa aparece al menos en una vista primaria navegable', () => {
    const notes = [
      makeNote({ id: 'inbox', subjectId: null }),
      makeNote({ id: 'subject-root', subjectId: 'programacion-ii' }),
      makeNote({ id: 'subject-section', subjectId: 'unidad-i' }),
      makeNote({ id: 'individual-archive', archived: true, subjectId: null }),
      makeNote({ id: 'individual-archive-in-subject', archived: true, subjectId: 'base-de-datos' }),
      makeNote({ id: 'inherited-root-archive', subjectId: 'archived-root' }),
      makeNote({ id: 'inherited-section-archive', subjectId: 'archived-section' }),
    ]

    const reachableIds = getReachableNoteIds(notes, activeSubjects, ['archived-root', 'archived-section'])

    expect([...reachableIds].sort()).toEqual(notes.map(note => note.id).sort())
  })

  it('una nota de materia archivada no queda invisible aunque note.archived sea false', () => {
    const note = makeNote({ id: 'inherited', archived: false, subjectId: 'archived-root' })

    const reachableIds = getReachableNoteIds([note], activeSubjects, ['archived-root'])

    expect(reachableIds.has('inherited')).toBe(true)
    expect(getFilteredNotes(makeState({
      notes: [note],
      subjects: activeSubjects,
      archivedSubjectIds: ['archived-root'],
      viewMode: 'archived',
    }))).toEqual([note])
  })

  it('una nota de sección restaurada vuelve a ser navegable desde la sección y su materia', () => {
    const note = makeNote({ id: 'restored-section-note', archived: false, subjectId: 'unidad-i' })

    const fromParent = getFilteredNotes(makeState({
      notes: [note],
      subjects: activeSubjects,
      viewMode: 'subject',
      activeSubjectId: 'programacion-ii',
    }))
    const fromSection = getFilteredNotes(makeState({
      notes: [note],
      subjects: activeSubjects,
      viewMode: 'subject',
      activeSubjectId: 'unidad-i',
    }))

    expect(fromParent).toEqual([note])
    expect(fromSection).toEqual([note])
  })

  it('una nota archivada individualmente no reaparece como activa dentro de su materia', () => {
    const note = makeNote({ id: 'archived-note', archived: true, subjectId: 'programacion-ii' })

    const activeView = getFilteredNotes(makeState({
      notes: [note],
      subjects: activeSubjects,
      viewMode: 'subject',
      activeSubjectId: 'programacion-ii',
    }))
    const archivedView = getFilteredNotes(makeState({
      notes: [note],
      subjects: activeSubjects,
      viewMode: 'archived',
    }))

    expect(activeView).toEqual([])
    expect(archivedView).toEqual([note])
  })
})
