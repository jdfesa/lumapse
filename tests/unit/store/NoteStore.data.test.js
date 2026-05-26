import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as NoteService from '../../../src/services/sqlite/notes.js'
import * as SubjectRows from '../../../src/services/sqlite/subjects.js'
import * as SubjectService from '../../../src/services/SubjectService.js'
import * as noteFilters from '../../../src/store/noteFilters.js'
import { DatabaseError } from '../../../src/services/sqlite/errors.js'
import { state, subscribe } from '../../../src/store/NoteStore.state.js'
import * as NoteStoreData from '../../../src/store/NoteStore.data.js'

vi.mock('../../../src/services/sqlite/notes.js', () => ({
  getAllNotes: vi.fn().mockResolvedValue([]),
  createNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn().mockResolvedValue(undefined),
  permanentlyDeleteNote: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../src/services/sqlite/subjects.js', () => ({
  countTrashItems: vi.fn().mockResolvedValue(0),
  getArchivedSubjectIds: vi.fn().mockResolvedValue([]),
  getArchivedSubjectTree: vi.fn().mockResolvedValue({ tree: [] }),
}))

vi.mock('../../../src/services/SubjectService.js', () => ({
  getSubjectTree: vi.fn().mockResolvedValue({ inboxCount: 0, tree: [] }),
  createSubject: vi.fn(),
  deleteSubject: vi.fn().mockResolvedValue(undefined),
  deleteSection: vi.fn().mockResolvedValue(undefined),
  emptyTrash: vi.fn().mockResolvedValue(undefined),
  restoreNoteFromTrash: vi.fn().mockResolvedValue(undefined),
  restoreSubject: vi.fn().mockResolvedValue(undefined),
  restoreSection: vi.fn().mockResolvedValue(undefined),
  archiveSubject: vi.fn().mockResolvedValue(undefined),
  archiveSection: vi.fn().mockResolvedValue(undefined),
  unarchiveSubject: vi.fn().mockResolvedValue(undefined),
  unarchiveSection: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../src/store/noteFilters.js', () => ({
  getFilteredNotes: vi.fn(() => ['filtered']),
}))

function makeNote(overrides = {}) {
  return {
    id: 'note-1',
    title: 'Nota',
    content: 'Contenido',
    pinned: false,
    archived: false,
    subjectId: null,
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function listenForNotify() {
  const listener = vi.fn()
  const unsubscribe = subscribe(listener)
  listener.mockClear()
  return { listener, unsubscribe }
}

beforeEach(() => {
  state.notes = []
  state.activeNoteId = null
  state.searchQuery = ''
  state.dateFilter = null
  state.subjects = []
  state.viewMode = 'inbox'
  state.activeSubjectId = null
  state.trashCount = 0
  state.showTrashWarning = false
  state.archivedSubjectIds = []
  state.archivedSubjects = null
  state.sidebarOpen = true
  vi.clearAllMocks()

  NoteService.getAllNotes.mockResolvedValue([])
  NoteService.createNote.mockResolvedValue(makeNote({ id: 'created' }))
  NoteService.updateNote.mockResolvedValue(makeNote({ id: 'note-1', title: 'Actualizada' }))
  SubjectService.getSubjectTree.mockResolvedValue({ inboxCount: 0, tree: [] })
  SubjectService.createSubject.mockResolvedValue({ id: 'subj-1', name: 'Materia' })
  SubjectRows.countTrashItems.mockResolvedValue(0)
  SubjectRows.getArchivedSubjectIds.mockResolvedValue([])
  SubjectRows.getArchivedSubjectTree.mockResolvedValue({ tree: [] })
})

describe('NoteStore.data', () => {
  describe('loadNotes()', () => {
    it('carga notas desde NoteService y las asigna a state.notes', async () => {
      const notes = [makeNote({ id: 'a' })]
      NoteService.getAllNotes.mockResolvedValue(notes)

      await NoteStoreData.loadNotes()

      expect(state.notes).toEqual(notes)
    })

    it('llama notify() después de cargar', async () => {
      const { listener, unsubscribe } = listenForNotify()

      await NoteStoreData.loadNotes()

      expect(listener).toHaveBeenCalledWith(state)
      unsubscribe()
    })
  })

  describe('createNote()', () => {
    it('llama NoteService.createNote con los argumentos correctos', async () => {
      await NoteStoreData.createNote('Título', 'Contenido', 'subj-1')

      expect(NoteService.createNote).toHaveBeenCalledWith('Título', 'Contenido', 'subj-1')
    })

    it('agrega la nota al inicio de state.notes', async () => {
      state.notes = [makeNote({ id: 'old' })]
      NoteService.createNote.mockResolvedValue(makeNote({ id: 'new' }))

      await NoteStoreData.createNote('T', 'C')

      expect(state.notes.map(n => n.id)).toEqual(['new', 'old'])
    })

    it('limpia state.searchQuery después de crear', async () => {
      state.searchQuery = 'busqueda'

      await NoteStoreData.createNote('T', 'C')

      expect(state.searchQuery).toBe('')
    })

    it('limpia state.dateFilter después de crear', async () => {
      state.dateFilter = '2024-01-15'

      await NoteStoreData.createNote('T', 'C')

      expect(state.dateFilter).toBeNull()
    })

    it('llama loadSubjects() para actualizar conteos', async () => {
      await NoteStoreData.createNote('T', 'C')

      expect(SubjectService.getSubjectTree).toHaveBeenCalled()
    })

    it('llama notify()', async () => {
      const { listener, unsubscribe } = listenForNotify()

      await NoteStoreData.createNote('T', 'C')

      expect(listener).toHaveBeenCalledWith(state)
      unsubscribe()
    })

    it('usa activeSubjectId si viewMode es "subject"', async () => {
      state.viewMode = 'subject'
      state.activeSubjectId = 'subj-active'

      await NoteStoreData.createNote('T', 'C')

      expect(NoteService.createNote).toHaveBeenCalledWith('T', 'C', 'subj-active')
    })

    it('usa null como subjectId si viewMode es "inbox"', async () => {
      state.viewMode = 'inbox'
      state.activeSubjectId = 'subj-active'

      await NoteStoreData.createNote('T', 'C')

      expect(NoteService.createNote).toHaveBeenCalledWith('T', 'C', null)
    })

    it('usa el subjectId pasado explícitamente si se proporciona', async () => {
      state.viewMode = 'subject'
      state.activeSubjectId = 'subj-active'

      await NoteStoreData.createNote('T', 'C', 'explicit')

      expect(NoteService.createNote).toHaveBeenCalledWith('T', 'C', 'explicit')
    })

    it('si title es "Sin título" y content vacío, asigna content = "# "', async () => {
      await NoteStoreData.createNote('Sin título', '')

      expect(NoteService.createNote).toHaveBeenCalledWith('Sin título', '# ', null)
    })
  })

  describe('updateNote()', () => {
    it('actualiza la nota en state.notes', async () => {
      state.notes = [makeNote({ id: 'note-1', title: 'Vieja' })]
      NoteService.updateNote.mockResolvedValue(makeNote({ id: 'note-1', title: 'Nueva' }))

      await NoteStoreData.updateNote('note-1', { title: 'Nueva' })

      expect(state.notes[0].title).toBe('Nueva')
    })

    it('mueve la nota actualizada al inicio del array', async () => {
      state.notes = [makeNote({ id: 'a' }), makeNote({ id: 'b' })]
      NoteService.updateNote.mockResolvedValue(makeNote({ id: 'b', title: 'Nueva' }))

      await NoteStoreData.updateNote('b', { title: 'Nueva' })

      expect(state.notes.map(n => n.id)).toEqual(['b', 'a'])
    })

    it('llama notify()', async () => {
      state.notes = [makeNote({ id: 'note-1' })]
      const { listener, unsubscribe } = listenForNotify()

      await NoteStoreData.updateNote('note-1', { title: 'Nueva' })

      expect(listener).toHaveBeenCalledWith(state)
      unsubscribe()
    })
  })

  describe('updateNoteSilent()', () => {
    it('actualiza la nota en state.notes sin notificar subscribers', async () => {
      state.notes = [makeNote({ id: 'note-1', title: 'Vieja' })]
      NoteService.updateNote.mockResolvedValue(makeNote({ id: 'note-1', title: 'Nueva' }))
      const { listener, unsubscribe } = listenForNotify()

      await NoteStoreData.updateNoteSilent('note-1', { title: 'Nueva' })

      expect(NoteService.updateNote).toHaveBeenCalledWith('note-1', { title: 'Nueva' })
      expect(state.notes[0].title).toBe('Nueva')
      expect(listener).not.toHaveBeenCalled()
      unsubscribe()
    })

    it('rechaza la promesa si falla la persistencia para permitir rollback visual', async () => {
      const error = new DatabaseError('updateNote', new Error('boom'))
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      NoteService.updateNote.mockRejectedValueOnce(error)

      await expect(NoteStoreData.updateNoteSilent('note-1', { title: 'Nueva' })).rejects.toBe(error)

      errorSpy.mockRestore()
    })
  })

  describe('deleteNote()', () => {
    it('elimina la nota de state.notes', async () => {
      state.notes = [makeNote({ id: 'a' }), makeNote({ id: 'b' })]

      await NoteStoreData.deleteNote('a')

      expect(state.notes.map(n => n.id)).toEqual(['b'])
    })

    it('si la nota eliminada era la activa, pone activeNoteId = null', async () => {
      state.notes = [makeNote({ id: 'a' })]
      state.activeNoteId = 'a'

      await NoteStoreData.deleteNote('a')

      expect(state.activeNoteId).toBeNull()
    })

    it('llama loadTrashCount()', async () => {
      await NoteStoreData.deleteNote('a')

      expect(SubjectRows.countTrashItems).toHaveBeenCalled()
    })

    it('llama loadSubjects()', async () => {
      await NoteStoreData.deleteNote('a')

      expect(SubjectService.getSubjectTree).toHaveBeenCalled()
    })

    it('llama notify()', async () => {
      const { listener, unsubscribe } = listenForNotify()

      await NoteStoreData.deleteNote('a')

      expect(listener).toHaveBeenCalledWith(state)
      unsubscribe()
    })
  })

  describe('createSubject()', () => {
    it('llama SubjectService.createSubject con name, color, parentSubjectId', async () => {
      await NoteStoreData.createSubject('Materia', '#818cf8', 'parent')

      expect(SubjectService.createSubject).toHaveBeenCalledWith('Materia', '#818cf8', 'parent')
    })

    it('llama loadSubjects() después de crear', async () => {
      await NoteStoreData.createSubject('Materia')

      expect(SubjectService.getSubjectTree).toHaveBeenCalled()
    })

    it('retorna el subject creado', async () => {
      await expect(NoteStoreData.createSubject('Materia')).resolves.toEqual({ id: 'subj-1', name: 'Materia' })
    })
  })

  describe('deleteSubject()', () => {
    it('llama SubjectService.deleteSubject con el id', async () => {
      await NoteStoreData.deleteSubject('subj-1')

      expect(SubjectService.deleteSubject).toHaveBeenCalledWith('subj-1')
    })

    it('si el subject eliminado era el activo, cambia viewMode a "inbox"', async () => {
      state.viewMode = 'subject'
      state.activeSubjectId = 'subj-1'

      await NoteStoreData.deleteSubject('subj-1')

      expect(state.viewMode).toBe('inbox')
    })

    it('si el subject eliminado era el activo, pone activeSubjectId = null', async () => {
      state.viewMode = 'subject'
      state.activeSubjectId = 'subj-1'

      await NoteStoreData.deleteSubject('subj-1')

      expect(state.activeSubjectId).toBeNull()
    })

    it('llama loadNotes(), loadSubjects(), loadTrashCount()', async () => {
      await NoteStoreData.deleteSubject('subj-1')

      expect(NoteService.getAllNotes).toHaveBeenCalled()
      expect(SubjectService.getSubjectTree).toHaveBeenCalled()
      expect(SubjectRows.countTrashItems).toHaveBeenCalled()
    })
  })

  describe('archiveSubject()', () => {
    it('llama SubjectService.archiveSubject()', async () => {
      await NoteStoreData.archiveSubject('subj-1')

      expect(SubjectService.archiveSubject).toHaveBeenCalledWith('subj-1')
    })

    it('si el subject archivado era activo, vuelve a inbox', async () => {
      state.viewMode = 'subject'
      state.activeSubjectId = 'subj-1'

      await NoteStoreData.archiveSubject('subj-1')

      expect(state.viewMode).toBe('inbox')
      expect(state.activeSubjectId).toBeNull()
    })

    it('si una sección hija era activa, vuelve a inbox', async () => {
      state.subjects = {
        inboxCount: 0,
        tree: [{ id: 'subj-1', children: [{ id: 'sec-1' }] }],
      }
      state.viewMode = 'subject'
      state.activeSubjectId = 'sec-1'

      await NoteStoreData.archiveSubject('subj-1')

      expect(state.viewMode).toBe('inbox')
      expect(state.activeSubjectId).toBeNull()
    })

    it('recarga materias activas y archivadas sin recargar notas', async () => {
      await NoteStoreData.archiveSubject('subj-1')

      expect(NoteService.getAllNotes).not.toHaveBeenCalled()
      expect(SubjectService.getSubjectTree).toHaveBeenCalled()
      expect(SubjectRows.getArchivedSubjectTree).toHaveBeenCalled()
    })
  })

  describe('archiveSection()', () => {
    it('llama SubjectService.archiveSection con el id', async () => {
      await NoteStoreData.archiveSection('sec-1')

      expect(SubjectService.archiveSection).toHaveBeenCalledWith('sec-1')
    })

    it('si la sección era activa, vuelve a inbox', async () => {
      state.viewMode = 'subject'
      state.activeSubjectId = 'sec-1'

      await NoteStoreData.archiveSection('sec-1')

      expect(state.viewMode).toBe('inbox')
      expect(state.activeSubjectId).toBeNull()
    })

    it('recarga materias activas y archivadas sin recargar notas', async () => {
      await NoteStoreData.archiveSection('sec-1')

      expect(NoteService.getAllNotes).not.toHaveBeenCalled()
      expect(SubjectService.getSubjectTree).toHaveBeenCalled()
      expect(SubjectRows.getArchivedSubjectTree).toHaveBeenCalled()
    })
  })

  describe('unarchiveSubject()', () => {
    it('llama SubjectService.unarchiveSubject con el id', async () => {
      await NoteStoreData.unarchiveSubject('subj-1')

      expect(SubjectService.unarchiveSubject).toHaveBeenCalledWith('subj-1')
    })

    it('recarga materias activas y archivadas', async () => {
      await NoteStoreData.unarchiveSubject('subj-1')

      expect(SubjectService.getSubjectTree).toHaveBeenCalled()
      expect(SubjectRows.getArchivedSubjectTree).toHaveBeenCalled()
    })
  })

  describe('unarchiveSection()', () => {
    it('llama SubjectService.unarchiveSection con el id', async () => {
      await NoteStoreData.unarchiveSection('sec-1')

      expect(SubjectService.unarchiveSection).toHaveBeenCalledWith('sec-1')
    })

    it('recarga materias activas y archivadas', async () => {
      await NoteStoreData.unarchiveSection('sec-1')

      expect(SubjectService.getSubjectTree).toHaveBeenCalled()
      expect(SubjectRows.getArchivedSubjectTree).toHaveBeenCalled()
    })
  })

  describe('deleteSection()', () => {
    it('llama SubjectService.deleteSection con el id', async () => {
      await NoteStoreData.deleteSection('sec-1')

      expect(SubjectService.deleteSection).toHaveBeenCalledWith('sec-1')
    })

    it('si la sección era activa, vuelve a inbox', async () => {
      state.viewMode = 'subject'
      state.activeSubjectId = 'sec-1'

      await NoteStoreData.deleteSection('sec-1')

      expect(state.viewMode).toBe('inbox')
      expect(state.activeSubjectId).toBeNull()
    })
  })

  describe('restauración y borrado definitivo', () => {
    it('restoreNoteFromTrash() recarga notas, materias y contador', async () => {
      await NoteStoreData.restoreNoteFromTrash('note-1')

      expect(SubjectService.restoreNoteFromTrash).toHaveBeenCalledWith('note-1')
      expect(NoteService.getAllNotes).toHaveBeenCalled()
      expect(SubjectService.getSubjectTree).toHaveBeenCalled()
      expect(SubjectRows.countTrashItems).toHaveBeenCalled()
    })

    it('restoreSubjectFromTrash() recarga notas, materias y contador', async () => {
      await NoteStoreData.restoreSubjectFromTrash('subj-1')

      expect(SubjectService.restoreSubject).toHaveBeenCalledWith('subj-1')
      expect(NoteService.getAllNotes).toHaveBeenCalled()
      expect(SubjectService.getSubjectTree).toHaveBeenCalled()
      expect(SubjectRows.countTrashItems).toHaveBeenCalled()
    })

    it('restoreSectionFromTrash() recarga notas, materias y contador', async () => {
      await NoteStoreData.restoreSectionFromTrash('sec-1')

      expect(SubjectService.restoreSection).toHaveBeenCalledWith('sec-1')
      expect(NoteService.getAllNotes).toHaveBeenCalled()
      expect(SubjectService.getSubjectTree).toHaveBeenCalled()
      expect(SubjectRows.countTrashItems).toHaveBeenCalled()
    })

    it('permanentlyDeleteNote() borra la nota y recarga contador', async () => {
      await NoteStoreData.permanentlyDeleteNote('note-1')

      expect(NoteService.permanentlyDeleteNote).toHaveBeenCalledWith('note-1')
      expect(SubjectRows.countTrashItems).toHaveBeenCalled()
    })
  })

  describe('emptyTrash()', () => {
    it('llama SubjectService.emptyTrash()', async () => {
      await NoteStoreData.emptyTrash()

      expect(SubjectService.emptyTrash).toHaveBeenCalled()
    })

    it('llama loadNotes(), loadSubjects(), loadTrashCount()', async () => {
      await NoteStoreData.emptyTrash()

      expect(NoteService.getAllNotes).toHaveBeenCalled()
      expect(SubjectService.getSubjectTree).toHaveBeenCalled()
      expect(SubjectRows.countTrashItems).toHaveBeenCalled()
    })
  })

  describe('getFilteredNotes()', () => {
    it('delega en noteFilters con el state actual', () => {
      expect(NoteStoreData.getFilteredNotes()).toEqual(['filtered'])
      expect(noteFilters.getFilteredNotes).toHaveBeenCalledWith(state)
    })
  })
})
