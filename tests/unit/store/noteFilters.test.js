import { describe, expect, it } from 'vitest'
import { getChildSubjectIds, getFilteredNotes } from '../../../src/store/noteFilters.js'

function makeNote(overrides = {}) {
  return {
    id: 'note-1',
    title: 'Nota de prueba',
    content: 'contenido de prueba',
    pinned: false,
    archived: false,
    subjectId: null,
    statusEmoji: null,
    updatedAt: '2024-01-15T10:00:00.000Z',
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

describe('getFilteredNotes()', () => {
  describe('viewMode: "inbox"', () => {
    it('retorna notas sin subjectId y no archivadas', () => {
      const inbox = makeNote({ id: 'inbox', subjectId: null, archived: false })
      const state = makeState({ notes: [inbox] })

      expect(getFilteredNotes(state)).toEqual([inbox])
    })

    it('excluye notas con subjectId aunque no estén archivadas', () => {
      const state = makeState({ notes: [makeNote({ subjectId: 'subj-1' })] })

      expect(getFilteredNotes(state)).toEqual([])
    })

    it('notas de subjects archivados NO aparecen en inbox', () => {
      const state = makeState({
        notes: [makeNote({ subjectId: 'archived-subj', archived: false })],
        archivedSubjectIds: ['archived-subj'],
      })

      expect(getFilteredNotes(state)).toEqual([])
    })

    it('excluye notas archivadas aunque estén en inbox', () => {
      const state = makeState({ notes: [makeNote({ archived: true, subjectId: null })] })

      expect(getFilteredNotes(state)).toEqual([])
    })

    it('retorna [] si no hay notas en inbox', () => {
      const state = makeState({ notes: [makeNote({ subjectId: 'subj-1' })] })

      expect(getFilteredNotes(state)).toEqual([])
    })
  })

  describe('viewMode: "subject"', () => {
    const subjects = {
      tree: [
        { id: 'subj-1', children: [{ id: 'sec-1' }, { id: 'sec-2' }] },
        { id: 'subj-2', children: [{ id: 'sec-3' }] },
      ],
    }

    it('retorna notas de la materia activa', () => {
      const note = makeNote({ id: 'a', subjectId: 'subj-1' })
      const state = makeState({ notes: [note], viewMode: 'subject', activeSubjectId: 'subj-1', subjects })

      expect(getFilteredNotes(state)).toEqual([note])
    })

    it('incluye notas de secciones hijas de la materia activa', () => {
      const childNote = makeNote({ id: 'child', subjectId: 'sec-1' })
      const state = makeState({ notes: [childNote], viewMode: 'subject', activeSubjectId: 'subj-1', subjects })

      expect(getFilteredNotes(state)).toEqual([childNote])
    })

    it('excluye notas de otras materias', () => {
      const state = makeState({
        notes: [makeNote({ id: 'other', subjectId: 'subj-2' })],
        viewMode: 'subject',
        activeSubjectId: 'subj-1',
        subjects,
      })

      expect(getFilteredNotes(state)).toEqual([])
    })

    it('excluye notas archivadas aunque pertenezcan a la materia activa', () => {
      const state = makeState({
        notes: [makeNote({ subjectId: 'subj-1', archived: true })],
        viewMode: 'subject',
        activeSubjectId: 'subj-1',
        subjects,
      })

      expect(getFilteredNotes(state)).toEqual([])
    })

    it('excluye notas de subjects archivados aunque archived=false', () => {
      const state = makeState({
        notes: [makeNote({ subjectId: 'subj-1', archived: false })],
        viewMode: 'subject',
        activeSubjectId: 'subj-1',
        subjects,
        archivedSubjectIds: ['subj-1'],
      })

      expect(getFilteredNotes(state)).toEqual([])
    })

    it('retorna [] si la materia activa no tiene notas', () => {
      const state = makeState({
        notes: [makeNote({ subjectId: 'subj-2' })],
        viewMode: 'subject',
        activeSubjectId: 'subj-1',
        subjects,
      })

      expect(getFilteredNotes(state)).toEqual([])
    })
  })

  describe('viewMode: "archived"', () => {
    it('retorna solo notas con archived === true', () => {
      const archived = makeNote({ id: 'archived', archived: true })
      const active = makeNote({ id: 'active', archived: false })

      expect(getFilteredNotes(makeState({ notes: [active, archived], viewMode: 'archived' }))).toEqual([archived])
    })

    it('incluye notas archivadas de cualquier materia', () => {
      const notes = [
        makeNote({ id: 'a', archived: true, subjectId: null }),
        makeNote({ id: 'b', archived: true, subjectId: 'subj-1' }),
      ]

      expect(getFilteredNotes(makeState({ notes, viewMode: 'archived' }))).toEqual(notes)
    })

    it('excluye notas no archivadas', () => {
      expect(getFilteredNotes(makeState({ notes: [makeNote()], viewMode: 'archived' }))).toEqual([])
    })

    it('notas de subjects archivados aparecen aunque archived=false', () => {
      const inherited = makeNote({
        id: 'inherited',
        archived: false,
        subjectId: 'archived-subj',
      })

      const result = getFilteredNotes(makeState({
        notes: [inherited],
        archivedSubjectIds: ['archived-subj'],
        viewMode: 'archived',
      }))

      expect(result).toEqual([inherited])
    })

    it('incluye notas archivadas individualmente dentro de subjects archivados', () => {
      const note = makeNote({
        id: 'both',
        archived: true,
        subjectId: 'archived-subj',
      })

      expect(getFilteredNotes(makeState({
        notes: [note],
        archivedSubjectIds: ['archived-subj'],
        viewMode: 'archived',
      }))).toEqual([note])
    })
  })

  describe('viewMode: "trash"', () => {
    it('retorna siempre []', () => {
      expect(getFilteredNotes(makeState({ notes: [makeNote()], viewMode: 'trash' }))).toEqual([])
    })
  })

  describe('viewMode: "all" o default', () => {
    it('retorna todas las notas no archivadas', () => {
      const active = makeNote({ id: 'active' })
      const archived = makeNote({ id: 'archived', archived: true })

      expect(getFilteredNotes(makeState({ notes: [active, archived], viewMode: 'all' }))).toEqual([active])
    })

    it('incluye notas de cualquier materia y del inbox', () => {
      const notes = [makeNote({ id: 'inbox' }), makeNote({ id: 'subject', subjectId: 'subj-1' })]

      expect(getFilteredNotes(makeState({ notes, viewMode: 'all' }))).toEqual(notes)
    })

    it('excluye notas archivadas', () => {
      expect(getFilteredNotes(makeState({ notes: [makeNote({ archived: true })], viewMode: 'unknown' }))).toEqual([])
    })

    it('excluye notas de subjects archivados', () => {
      const state = makeState({
        notes: [makeNote({ id: 'hidden', subjectId: 'archived-subj', archived: false })],
        archivedSubjectIds: ['archived-subj'],
        viewMode: 'all',
      })

      expect(getFilteredNotes(state)).toEqual([])
    })
  })

  describe('Filtro de búsqueda', () => {
    it('filtra por título case-insensitive', () => {
      const note = makeNote({ title: 'Álgebra Lineal' })

      expect(getFilteredNotes(makeState({ notes: [note], viewMode: 'all', searchQuery: 'álgebra' }))).toEqual([note])
    })

    it('filtra por título ignorando tildes', () => {
      const note = makeNote({ title: 'Álgebra Lineal' })

      expect(getFilteredNotes(makeState({ notes: [note], viewMode: 'all', searchQuery: 'algebra' }))).toEqual([note])
    })

    it('filtra por contenido case-insensitive', () => {
      const note = makeNote({ content: 'Contenido de Programación' })

      expect(getFilteredNotes(makeState({ notes: [note], viewMode: 'all', searchQuery: 'programación' }))).toEqual([note])
    })

    it('filtra por contenido ignorando tildes', () => {
      const note = makeNote({ content: 'Contenido de Programación' })

      expect(getFilteredNotes(makeState({ notes: [note], viewMode: 'all', searchQuery: 'programacion' }))).toEqual([note])
    })

    it('búsqueda vacía no filtra nada', () => {
      const notes = [makeNote({ id: 'a' }), makeNote({ id: 'b' })]

      expect(getFilteredNotes(makeState({ notes, viewMode: 'all', searchQuery: '   ' }))).toEqual(notes)
    })

    it('búsqueda con espacios se trim-ea', () => {
      const note = makeNote({ title: 'Base de Datos' })

      expect(getFilteredNotes(makeState({ notes: [note], viewMode: 'all', searchQuery: '  datos  ' }))).toEqual([note])
    })

    it('retorna [] si ninguna nota coincide', () => {
      expect(getFilteredNotes(makeState({ notes: [makeNote()], viewMode: 'all', searchQuery: 'nope' }))).toEqual([])
    })

    it('busca globalmente desde viewMode "inbox"', () => {
      const inbox = makeNote({ id: 'inbox', title: 'TP' })
      const subject = makeNote({ id: 'subject', title: 'TP', subjectId: 'subj-1', updatedAt: '2024-01-16T10:00:00.000Z' })

      expect(getFilteredNotes(makeState({ notes: [inbox, subject], searchQuery: 'tp' }))).toEqual([subject, inbox])
    })

    it('busca globalmente desde viewMode "subject"', () => {
      const subjects = { tree: [{ id: 'subj-1', children: [] }] }
      const wanted = makeNote({ id: 'wanted', title: 'TP', subjectId: 'subj-1', updatedAt: '2024-01-16T10:00:00.000Z' })
      const inbox = makeNote({ id: 'inbox', title: 'TP', subjectId: null })

      expect(getFilteredNotes(makeState({
        notes: [wanted, inbox],
        viewMode: 'subject',
        activeSubjectId: 'subj-1',
        subjects,
        searchQuery: 'tp',
      }))).toEqual([wanted, inbox])
    })

    it('mantiene la búsqueda archivada dentro de viewMode "archived"', () => {
      const archived = makeNote({ id: 'archived', title: 'TP', archived: true })
      const active = makeNote({ id: 'active', title: 'TP', archived: false })

      expect(getFilteredNotes(makeState({
        notes: [archived, active],
        viewMode: 'archived',
        searchQuery: 'tp',
      }))).toEqual([archived])
    })
  })

  describe('Filtro por fecha', () => {
    it('retorna notas cuyo updatedAt coincide con la fecha exacta', () => {
      const note = makeNote({ updatedAt: '2024-02-10T23:59:59.000Z' })

      expect(getFilteredNotes(makeState({ notes: [note], viewMode: 'all', dateFilter: '2024-02-10' }))).toEqual([note])
    })

    it('excluye notas de otras fechas', () => {
      expect(getFilteredNotes(makeState({
        notes: [makeNote({ updatedAt: '2024-02-11T00:00:00.000Z' })],
        viewMode: 'all',
        dateFilter: '2024-02-10',
      }))).toEqual([])
    })

    it('dateFilter null no filtra por fecha', () => {
      const note = makeNote({ updatedAt: '2024-02-11T00:00:00.000Z' })

      expect(getFilteredNotes(makeState({ notes: [note], viewMode: 'all', dateFilter: null }))).toEqual([note])
    })

    it('ignora notas sin updatedAt cuando dateFilter está activo', () => {
      expect(getFilteredNotes(makeState({
        notes: [makeNote({ updatedAt: null })],
        viewMode: 'all',
        dateFilter: '2024-02-10',
      }))).toEqual([])
    })
  })

  describe('Ordenamiento', () => {
    it('notas pinned aparecen antes que no-pinned', () => {
      const regular = makeNote({ id: 'regular', pinned: false, updatedAt: '2024-02-10T00:00:00.000Z' })
      const pinned = makeNote({ id: 'pinned', pinned: true, updatedAt: '2024-01-10T00:00:00.000Z' })

      expect(getFilteredNotes(makeState({ notes: [regular, pinned], viewMode: 'all' })).map(n => n.id)).toEqual(['pinned', 'regular'])
    })

    it('dentro de pinned, orden por updatedAt descendente', () => {
      const old = makeNote({ id: 'old', pinned: true, updatedAt: '2024-01-01T00:00:00.000Z' })
      const recent = makeNote({ id: 'recent', pinned: true, updatedAt: '2024-02-01T00:00:00.000Z' })

      expect(getFilteredNotes(makeState({ notes: [old, recent], viewMode: 'all' })).map(n => n.id)).toEqual(['recent', 'old'])
    })

    it('dentro de no-pinned, orden por updatedAt descendente', () => {
      const old = makeNote({ id: 'old', updatedAt: '2024-01-01T00:00:00.000Z' })
      const recent = makeNote({ id: 'recent', updatedAt: '2024-02-01T00:00:00.000Z' })

      expect(getFilteredNotes(makeState({ notes: [old, recent], viewMode: 'all' })).map(n => n.id)).toEqual(['recent', 'old'])
    })

    it('nota más reciente antes que nota más antigua', () => {
      const old = makeNote({ id: 'old', updatedAt: '2024-01-01T00:00:00.000Z' })
      const recent = makeNote({ id: 'recent', updatedAt: '2024-03-01T00:00:00.000Z' })

      expect(getFilteredNotes(makeState({ notes: [old, recent], viewMode: 'all' })).map(n => n.id)).toEqual(['recent', 'old'])
    })

    it('combina pinned y fecha correctamente', () => {
      const notes = [
        makeNote({ id: 'no-pinned-old', pinned: false, updatedAt: '2024-01-01T00:00:00.000Z' }),
        makeNote({ id: 'pinned-old', pinned: true, updatedAt: '2024-01-01T00:00:00.000Z' }),
        makeNote({ id: 'no-pinned-recent', pinned: false, updatedAt: '2024-02-01T00:00:00.000Z' }),
        makeNote({ id: 'pinned-recent', pinned: true, updatedAt: '2024-02-01T00:00:00.000Z' }),
      ]

      expect(getFilteredNotes(makeState({ notes, viewMode: 'all' })).map(n => n.id)).toEqual([
        'pinned-recent',
        'pinned-old',
        'no-pinned-recent',
        'no-pinned-old',
      ])
    })
  })
})

describe('getChildSubjectIds()', () => {
  it('retorna [] si subjects es null', () => {
    expect(getChildSubjectIds(null, 'subj-1')).toEqual([])
  })

  it('retorna [] si subjects.tree está vacío', () => {
    expect(getChildSubjectIds({ tree: [] }, 'subj-1')).toEqual([])
  })

  it('retorna [] si parentId no existe en el árbol', () => {
    expect(getChildSubjectIds({ tree: [{ id: 'subj-2', children: [] }] }, 'subj-1')).toEqual([])
  })

  it('retorna los IDs de los children de una materia', () => {
    const subjects = { tree: [{ id: 'subj-1', children: [{ id: 'sec-1' }, { id: 'sec-2' }] }] }

    expect(getChildSubjectIds(subjects, 'subj-1')).toEqual(['sec-1', 'sec-2'])
  })

  it('retorna [] si la materia no tiene children', () => {
    expect(getChildSubjectIds({ tree: [{ id: 'subj-1', children: [] }] }, 'subj-1')).toEqual([])
  })
})
