import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as NoteService from '../../../src/services/sqlite/notes.js'
import { DatabaseError } from '../../../src/services/sqlite/errors.js'
import { subscribeToStoreErrors } from '../../../src/store/NoteStore.errors.js'
import { state, subscribe } from '../../../src/store/NoteStore.state.js'
import * as NoteStoreData from '../../../src/store/NoteStore.data.js'
import * as NoteStoreUi from '../../../src/store/NoteStore.ui.js'

vi.mock('../../../src/services/sqlite/notes.js', () => ({
  updateNote: vi.fn(),
}))

vi.mock('../../../src/store/NoteStore.data.js', () => ({
  loadArchivedSubjects: vi.fn().mockResolvedValue(undefined),
}))

function makeNote(overrides = {}) {
  return {
    id: 'note-1',
    title: 'Nota',
    content: 'Contenido',
    pinned: false,
    archived: false,
    statusEmoji: null,
    subjectId: null,
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function expectNotifyFrom(action) {
  const listener = vi.fn()
  const unsubscribe = subscribe(listener)
  listener.mockClear()
  action()
  expect(listener).toHaveBeenCalledWith(state)
  unsubscribe()
}

beforeEach(() => {
  state.notes = []
  state.notesLoaded = false
  state.activeNoteId = null
  state.searchQuery = ''
  state.dateFilter = null
  state.sidebarOpen = true
  state.subjects = []
  state.activeSubjectId = null
  state.viewMode = 'inbox'
  state.backupPanel = 'export'
  state.trashCount = 0
  state.showTrashWarning = false
  state.archivedSubjectIds = []
  state.archivedSubjects = null
  state.academicEvents = []
  state.academicEventsForMonth = []
  state.academicEventsMonth = null
  state.upcomingAcademicEvents = []
  vi.clearAllMocks()
})

describe('NoteStore.ui', () => {
  describe('selectNote()', () => {
    it('cambia state.activeNoteId al id pasado', () => {
      NoteStoreUi.selectNote('note-1')

      expect(state.activeNoteId).toBe('note-1')
    })

    it('llama notify() si el id es diferente al actual', () => {
      expectNotifyFrom(() => NoteStoreUi.selectNote('note-1'))
    })

    it('NO llama notify() si el mismo id ya está activo', () => {
      state.activeNoteId = 'note-1'
      const listener = vi.fn()
      const unsubscribe = subscribe(listener)
      listener.mockClear()

      NoteStoreUi.selectNote('note-1')

      expect(listener).not.toHaveBeenCalled()
      unsubscribe()
    })
  })

  describe('togglePin()', () => {
    it('llama NoteService.updateNote con pinned invertido', async () => {
      state.notes = [makeNote({ id: 'note-1', pinned: false })]
      NoteService.updateNote.mockResolvedValue(makeNote({ id: 'note-1', pinned: true }))

      await NoteStoreUi.togglePin('note-1')

      expect(NoteService.updateNote).toHaveBeenCalledWith('note-1', { pinned: true })
    })

    it('actualiza el note en state.notes', async () => {
      state.notes = [makeNote({ id: 'note-1', pinned: false })]
      NoteService.updateNote.mockResolvedValue(makeNote({ id: 'note-1', pinned: true }))

      await NoteStoreUi.togglePin('note-1')

      expect(state.notes[0].pinned).toBe(true)
    })

    it('llama notify()', async () => {
      state.notes = [makeNote({ id: 'note-1' })]
      NoteService.updateNote.mockResolvedValue(makeNote({ id: 'note-1', pinned: true }))
      const listener = vi.fn()
      const unsubscribe = subscribe(listener)
      listener.mockClear()

      await NoteStoreUi.togglePin('note-1')

      expect(listener).toHaveBeenCalledWith(state)
      unsubscribe()
    })

    it('no hace nada si la nota no existe en state.notes', async () => {
      await expect(NoteStoreUi.togglePin('missing')).resolves.toBeUndefined()

      expect(NoteService.updateNote).not.toHaveBeenCalled()
    })

    it('emite una vez, rechaza y no muta ni notifica ante DatabaseError', async () => {
      const originalNote = makeNote({ id: 'note-1', pinned: false })
      const error = new DatabaseError('updateNote', new Error('boom'))
      const storeError = vi.fn()
      const unsubscribeError = subscribeToStoreErrors(storeError)
      const listener = vi.fn()
      const unsubscribeNotify = subscribe(listener)
      listener.mockClear()
      state.notes = [originalNote]
      NoteService.updateNote.mockRejectedValueOnce(error)

      await expect(NoteStoreUi.togglePin('note-1')).rejects.toBe(error)

      expect(state.notes).toEqual([originalNote])
      expect(listener).not.toHaveBeenCalled()
      expect(storeError).toHaveBeenCalledTimes(1)
      expect(storeError).toHaveBeenCalledWith({
        operation: 'togglePin',
        message: 'No se pudo cambiar el pin de la nota. Intenta de nuevo.',
        cause: error,
      })

      unsubscribeError()
      unsubscribeNotify()
    })

    it('rechaza errores no SQLite sin emitir por el canal global', async () => {
      const error = new Error('unexpected')
      const storeError = vi.fn()
      const unsubscribe = subscribeToStoreErrors(storeError)
      state.notes = [makeNote({ id: 'note-1' })]
      NoteService.updateNote.mockRejectedValueOnce(error)

      await expect(NoteStoreUi.togglePin('note-1')).rejects.toBe(error)

      expect(storeError).not.toHaveBeenCalled()
      unsubscribe()
    })
  })

  describe('toggleArchive()', () => {
    it('llama NoteService.updateNote con archived invertido', async () => {
      state.notes = [makeNote({ id: 'note-1', archived: false })]
      NoteService.updateNote.mockResolvedValue(makeNote({ id: 'note-1', archived: true }))

      await NoteStoreUi.toggleArchive('note-1')

      expect(NoteService.updateNote).toHaveBeenCalledWith('note-1', { archived: true })
    })

    it('si se archiva la nota activa, pone activeNoteId = null', async () => {
      state.activeNoteId = 'note-1'
      state.notes = [makeNote({ id: 'note-1', archived: false })]
      NoteService.updateNote.mockResolvedValue(makeNote({ id: 'note-1', archived: true }))

      await NoteStoreUi.toggleArchive('note-1')

      expect(state.activeNoteId).toBeNull()
    })

    it('si se desarchiva, NO cambia activeNoteId', async () => {
      state.activeNoteId = 'note-1'
      state.notes = [makeNote({ id: 'note-1', archived: true })]
      NoteService.updateNote.mockResolvedValue(makeNote({ id: 'note-1', archived: false }))

      await NoteStoreUi.toggleArchive('note-1')

      expect(state.activeNoteId).toBe('note-1')
    })

    it('llama notify()', async () => {
      state.notes = [makeNote({ id: 'note-1' })]
      NoteService.updateNote.mockResolvedValue(makeNote({ id: 'note-1', archived: true }))
      const listener = vi.fn()
      const unsubscribe = subscribe(listener)
      listener.mockClear()

      await NoteStoreUi.toggleArchive('note-1')

      expect(listener).toHaveBeenCalledWith(state)
      unsubscribe()
    })

    it('conserva la nota activa y el estado sin notify ante DatabaseError', async () => {
      const originalNote = makeNote({ id: 'note-1', archived: false })
      const error = new DatabaseError('updateNote', new Error('boom'))
      const storeError = vi.fn()
      const unsubscribeError = subscribeToStoreErrors(storeError)
      const listener = vi.fn()
      const unsubscribeNotify = subscribe(listener)
      listener.mockClear()
      state.activeNoteId = 'note-1'
      state.notes = [originalNote]
      NoteService.updateNote.mockRejectedValueOnce(error)

      await expect(NoteStoreUi.toggleArchive('note-1')).rejects.toBe(error)

      expect(state.notes).toEqual([originalNote])
      expect(state.activeNoteId).toBe('note-1')
      expect(listener).not.toHaveBeenCalled()
      expect(storeError).toHaveBeenCalledTimes(1)
      expect(storeError).toHaveBeenCalledWith({
        operation: 'toggleArchive',
        message: 'No se pudo archivar la nota. Intenta de nuevo.',
        cause: error,
      })

      unsubscribeError()
      unsubscribeNotify()
    })
  })

  describe('setNoteStatus()', () => {
    it('llama updateNote con el emoji pasado', async () => {
      state.notes = [makeNote({ id: 'note-1', statusEmoji: null })]
      NoteService.updateNote.mockResolvedValue(makeNote({ id: 'note-1', statusEmoji: '📖' }))

      await NoteStoreUi.setNoteStatus('note-1', '📖')

      expect(NoteService.updateNote).toHaveBeenCalledWith('note-1', { statusEmoji: '📖' })
    })

    it('si el emoji ya era el mismo, lo pone a null', async () => {
      state.notes = [makeNote({ id: 'note-1', statusEmoji: '📖' })]
      NoteService.updateNote.mockResolvedValue(makeNote({ id: 'note-1', statusEmoji: null }))

      await NoteStoreUi.setNoteStatus('note-1', '📖')

      expect(NoteService.updateNote).toHaveBeenCalledWith('note-1', { statusEmoji: null })
    })

    it('llama notify()', async () => {
      state.notes = [makeNote({ id: 'note-1' })]
      NoteService.updateNote.mockResolvedValue(makeNote({ id: 'note-1', statusEmoji: '✅' }))
      const listener = vi.fn()
      const unsubscribe = subscribe(listener)
      listener.mockClear()

      await NoteStoreUi.setNoteStatus('note-1', '✅')

      expect(listener).toHaveBeenCalledWith(state)
      unsubscribe()
    })

    it('conserva el estado académico sin notify ante DatabaseError', async () => {
      const originalNote = makeNote({ id: 'note-1', statusEmoji: null })
      const error = new DatabaseError('updateNote', new Error('boom'))
      const storeError = vi.fn()
      const unsubscribeError = subscribeToStoreErrors(storeError)
      const listener = vi.fn()
      const unsubscribeNotify = subscribe(listener)
      listener.mockClear()
      state.notes = [originalNote]
      NoteService.updateNote.mockRejectedValueOnce(error)

      await expect(NoteStoreUi.setNoteStatus('note-1', '✅')).rejects.toBe(error)

      expect(state.notes).toEqual([originalNote])
      expect(listener).not.toHaveBeenCalled()
      expect(storeError).toHaveBeenCalledTimes(1)
      expect(storeError).toHaveBeenCalledWith({
        operation: 'setNoteStatus',
        message: 'No se pudo cambiar el estado de la nota. Intenta de nuevo.',
        cause: error,
      })

      unsubscribeError()
      unsubscribeNotify()
    })
  })

  describe('setViewMode()', () => {
    it('cambia state.viewMode al modo pasado', () => {
      NoteStoreUi.setViewMode('all')

      expect(state.viewMode).toBe('all')
    })

    it('si modo es "subject", asigna activeSubjectId', () => {
      NoteStoreUi.setViewMode('subject', 'subj-1')

      expect(state.activeSubjectId).toBe('subj-1')
    })

    it('si modo NO es "subject", pone activeSubjectId = null', () => {
      state.activeSubjectId = 'subj-1'

      NoteStoreUi.setViewMode('inbox')

      expect(state.activeSubjectId).toBeNull()
    })

    it('llama notify()', () => {
      expectNotifyFrom(() => NoteStoreUi.setViewMode('all'))
    })
  })

  describe('setActiveSubject()', () => {
    it('llama setViewMode("subject", id) si se pasa un id', () => {
      NoteStoreUi.setActiveSubject('subj-1')

      expect(state.viewMode).toBe('subject')
      expect(state.activeSubjectId).toBe('subj-1')
    })

    it('llama setViewMode("inbox") si id es null/undefined', () => {
      state.viewMode = 'subject'
      state.activeSubjectId = 'subj-1'

      NoteStoreUi.setActiveSubject(null)

      expect(state.viewMode).toBe('inbox')
      expect(state.activeSubjectId).toBeNull()
    })
  })

  describe('setSearchQuery()', () => {
    it('asigna el query a state.searchQuery', () => {
      NoteStoreUi.setSearchQuery('matemática')

      expect(state.searchQuery).toBe('matemática')
    })

    it('llama notify()', () => {
      expectNotifyFrom(() => NoteStoreUi.setSearchQuery('x'))
    })
  })

  describe('setShowArchived()', () => {
    it('con true cambia a viewMode archived', async () => {
      await NoteStoreUi.setShowArchived(true)

      expect(state.viewMode).toBe('archived')
    })

    it('con true carga materias archivadas', async () => {
      await NoteStoreUi.setShowArchived(true)

      expect(NoteStoreData.loadArchivedSubjects).toHaveBeenCalled()
    })

    it('conserva la vista actual si falla la carga de archivadas', async () => {
      const error = new DatabaseError('getArchivedSubjectTree', new Error('boom'))
      state.viewMode = 'subject'
      state.activeSubjectId = 'subj-1'
      NoteStoreData.loadArchivedSubjects.mockRejectedValueOnce(error)

      await expect(NoteStoreUi.setShowArchived(true)).rejects.toBe(error)

      expect(state.viewMode).toBe('subject')
      expect(state.activeSubjectId).toBe('subj-1')
    })

    it('con false vuelve a subject si hay activeSubjectId', async () => {
      state.activeSubjectId = 'subj-1'

      await NoteStoreUi.setShowArchived(false)

      expect(state.viewMode).toBe('subject')
    })

    it('con false vuelve a inbox si no hay activeSubjectId', async () => {
      state.activeSubjectId = null

      await NoteStoreUi.setShowArchived(false)

      expect(state.viewMode).toBe('inbox')
    })
  })

  describe('setDateFilter()', () => {
    it('asigna la fecha a state.dateFilter', () => {
      NoteStoreUi.setDateFilter('2024-01-15')

      expect(state.dateFilter).toBe('2024-01-15')
    })

    it('llama notify()', () => {
      expectNotifyFrom(() => NoteStoreUi.setDateFilter('2024-01-15'))
    })
  })

  describe('toggleSidebar()', () => {
    it('openSidebar() abre el sidebar', () => {
      state.sidebarOpen = false

      NoteStoreUi.openSidebar()

      expect(state.sidebarOpen).toBe(true)
    })

    it('closeSidebar() cierra el sidebar', () => {
      state.sidebarOpen = true

      NoteStoreUi.closeSidebar()

      expect(state.sidebarOpen).toBe(false)
    })

    it('cambia sidebarOpen de true a false', () => {
      state.sidebarOpen = true

      NoteStoreUi.toggleSidebar()

      expect(state.sidebarOpen).toBe(false)
    })

    it('cambia sidebarOpen de false a true', () => {
      state.sidebarOpen = false

      NoteStoreUi.toggleSidebar()

      expect(state.sidebarOpen).toBe(true)
    })

    it('llama notify()', () => {
      expectNotifyFrom(() => NoteStoreUi.toggleSidebar())
    })
  })

  describe('setViewTrash()', () => {
    it('pone viewMode = "trash"', () => {
      NoteStoreUi.setViewTrash()

      expect(state.viewMode).toBe('trash')
    })

    it('pone activeSubjectId = null', () => {
      state.activeSubjectId = 'subj-1'

      NoteStoreUi.setViewTrash()

      expect(state.activeSubjectId).toBeNull()
    })

    it('llama notify()', () => {
      expectNotifyFrom(() => NoteStoreUi.setViewTrash())
    })
  })

  describe('setViewBackup()', () => {
    it('pone viewMode = "backup"', () => {
      NoteStoreUi.setViewBackup()

      expect(state.viewMode).toBe('backup')
    })

    it('usa panel export por defecto', () => {
      NoteStoreUi.setViewBackup()

      expect(state.backupPanel).toBe('export')
    })

    it('permite abrir panel import', () => {
      NoteStoreUi.setViewBackup('import')

      expect(state.backupPanel).toBe('import')
    })

    it('pone activeSubjectId = null', () => {
      state.activeSubjectId = 'subj-1'

      NoteStoreUi.setViewBackup()

      expect(state.activeSubjectId).toBeNull()
    })

    it('llama notify()', () => {
      expectNotifyFrom(() => NoteStoreUi.setViewBackup())
    })
  })

  describe('setViewAbout()', () => {
    it('pone viewMode = "about"', () => {
      NoteStoreUi.setViewAbout()

      expect(state.viewMode).toBe('about')
    })

    it('pone activeSubjectId = null', () => {
      state.activeSubjectId = 'subj-1'

      NoteStoreUi.setViewAbout()

      expect(state.activeSubjectId).toBeNull()
    })

    it('llama notify()', () => {
      expectNotifyFrom(() => NoteStoreUi.setViewAbout())
    })
  })
})
