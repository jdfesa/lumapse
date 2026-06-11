// =============================================================
// NoteStore.data.js — Operaciones de persistencia y datos
// =============================================================

import * as NoteService from '../services/sqlite/notes.js'
import * as SubjectService from '../services/SubjectService.js'
import { DatabaseError } from '../services/sqlite/errors.js'
import { showErrorToast } from '../components/common/Toast.js'
import { getFilteredNotes as applyFilters } from './noteFilters.js'
import { state, notify } from './NoteStore.state.js'

// Umbral para alerta de papelera llena
const TRASH_WARNING_THRESHOLD = 50

async function runStoreAction(operation, errorMessage, action) {
  try {
    return await action()
  } catch (error) {
    console.error(`[NoteStore] ${operation} failed:`, error)
    if (error instanceof DatabaseError) {
      showErrorToast(errorMessage)
      return undefined
    }
    throw error
  }
}

export async function loadNotes() {
  state.notes = await NoteService.getAllNotes()
  state.notesLoaded = true
  notify()
}

export async function loadSubjects() {
  state.subjects = await SubjectService.getSubjectTree()
  const { getArchivedSubjectIds } = await import('../services/sqlite/subjects.js')
  state.archivedSubjectIds = await getArchivedSubjectIds()
  notify()
}

/**
 * Carga el árbol de materias archivadas para mostrar en el drawer.
 */
export async function loadArchivedSubjects() {
  const { getArchivedSubjectTree } = await import('../services/sqlite/subjects.js')
  state.archivedSubjects = await getArchivedSubjectTree()
  notify()
}

/**
 * Carga el conteo de items en la papelera y actualiza el flag de alerta.
 */
export async function loadTrashCount() {
  const { countTrashItems } = await import('../services/sqlite/subjects.js')
  state.trashCount = await countTrashItems()
  state.showTrashWarning = state.trashCount >= TRASH_WARNING_THRESHOLD
  notify()
}

export async function createNote(title = 'Sin título', content = '', subjectId = undefined) {
  return runStoreAction('createNote', 'No se pudo crear la nota. Intenta de nuevo.', async () => {
    if (!content && title === 'Sin título') {
      content = '# '
    }

    const resolvedSubjectId = subjectId !== undefined
      ? subjectId
      : (state.viewMode === 'subject' ? state.activeSubjectId : null)

    const newNote = await NoteService.createNote(title, content, resolvedSubjectId)
    state.notes = [newNote, ...state.notes]
    state.searchQuery = ''
    state.dateFilter = null
    await loadSubjects()
    notify()
  })
}

export async function updateNote(id, changes) {
  return runStoreAction('updateNote', 'No se pudo actualizar la nota. Intenta de nuevo.', async () => {
    const updatedNote = await NoteService.updateNote(id, changes)

    state.notes = state.notes.map(note => note.id === id ? updatedNote : note)

    const noteIndex = state.notes.findIndex(note => note.id === id)
    if (noteIndex > -1) {
      const [noteToMove] = state.notes.splice(noteIndex, 1)
      state.notes.unshift(noteToMove)
    }

    notify()
  })
}

/**
 * Actualiza el contenido de una nota sin disparar re-render del feed.
 * Uso exclusivo para toggles de checkbox interactivos, donde el DOM
 * ya fue actualizado manualmente y un re-render causaría ghost clicks.
 */
export async function updateNoteSilent(id, changes) {
  try {
    const updatedNote = await NoteService.updateNote(id, changes)
    state.notes = state.notes.map(note => note.id === id ? updatedNote : note)
    // NO notify() — el DOM ya refleja el cambio
    return updatedNote
  } catch (error) {
    console.error('[NoteStore] updateNoteSilent failed:', error)
    if (error instanceof DatabaseError) {
      showErrorToast('No se pudo actualizar la nota.')
    }
    throw error
  }
}

export async function moveNote(noteId, subjectId) {
  return runStoreAction('moveNote', 'No se pudo mover la nota. Intenta de nuevo.', async () => {
    const updatedNote = await NoteService.updateNote(noteId, { subjectId })
    state.notes = state.notes.map(note => note.id === noteId ? updatedNote : note)
    await loadSubjects()
    notify()
  })
}

export async function deleteNote(id) {
  return runStoreAction('deleteNote', 'No se pudo enviar la nota a la papelera. Intenta de nuevo.', async () => {
    await NoteService.deleteNote(id)
    state.notes = state.notes.filter(note => note.id !== id)

    if (state.activeNoteId === id) {
      state.activeNoteId = null
    }

    await loadTrashCount()
    await loadSubjects()
    notify()
  })
}

export function getFilteredNotes() {
  return applyFilters(state)
}

export async function createSubject(name, color = null, parentSubjectId = null) {
  return runStoreAction('createSubject', 'No se pudo crear la materia. Intenta de nuevo.', async () => {
    const subject = await SubjectService.createSubject(name, color, parentSubjectId)
    await loadSubjects()
    return subject
  })
}

export async function updateSubject(id, changes) {
  return runStoreAction('updateSubject', 'No se pudo actualizar la materia. Intenta de nuevo.', async () => {
    await SubjectService.updateSubject(id, changes)
    await loadSubjects()
  })
}

/**
 * Archiva una materia completa en cascada (materia + secciones).
 * @param {string} id ID de la materia
 */
export async function archiveSubject(id) {
  return runStoreAction('archiveSubject', 'No se pudo archivar la materia. Intenta de nuevo.', async () => {
    await SubjectService.archiveSubject(id)

    // Si la materia activa (o una de sus secciones) era la archivada, volver a Entrada
    const childIds = state.subjects?.tree
      ?.find(s => s.id === id)?.children?.map(c => c.id) || []
    const affectedIds = [id, ...childIds]
    if (affectedIds.includes(state.activeSubjectId)) {
      state.viewMode = 'inbox'
      state.activeSubjectId = null
    }

    await loadSubjects()
    await loadArchivedSubjects()
  })
}

/**
 * Archiva una sección individual.
 * @param {string} id ID de la sección
 */
export async function archiveSection(id) {
  return runStoreAction('archiveSection', 'No se pudo archivar la sección. Intenta de nuevo.', async () => {
    await SubjectService.archiveSection(id)
    if (state.activeSubjectId === id) {
      state.viewMode = 'inbox'
      state.activeSubjectId = null
    }
    await loadSubjects()
    await loadArchivedSubjects()
  })
}

/**
 * Desarchiva una materia completa (cascada a secciones).
 * @param {string} id ID de la materia
 */
export async function unarchiveSubject(id) {
  return runStoreAction('unarchiveSubject', 'No se pudo desarchivar la materia. Intenta de nuevo.', async () => {
    await SubjectService.unarchiveSubject(id)
    await loadSubjects()
    await loadArchivedSubjects()
  })
}

/**
 * Desarchiva una sección individual.
 * @param {string} id ID de la sección
 */
export async function unarchiveSection(id) {
  return runStoreAction('unarchiveSection', 'No se pudo desarchivar la sección. Intenta de nuevo.', async () => {
    await SubjectService.unarchiveSection(id)
    await loadSubjects()
    await loadArchivedSubjects()
  })
}

export async function deleteSubject(id) {
  return runStoreAction('deleteSubject', 'No se pudo enviar la materia a la papelera. Intenta de nuevo.', async () => {
    await SubjectService.deleteSubject(id)
    if (state.activeSubjectId === id) {
      state.viewMode = 'inbox'
      state.activeSubjectId = null
    }
    await loadNotes()
    await loadSubjects()
    await loadTrashCount()
  })
}

/**
 * Elimina una sección individual (soft-delete + sus notas).
 * @param {string} id ID de la sección
 */
export async function deleteSection(id) {
  return runStoreAction('deleteSection', 'No se pudo eliminar la sección. Intenta de nuevo.', async () => {
    await SubjectService.deleteSection(id)
    if (state.activeSubjectId === id) {
      state.viewMode = 'inbox'
      state.activeSubjectId = null
    }
    await loadNotes()
    await loadSubjects()
    await loadTrashCount()
  })
}

/**
 * Restaura una nota desde la papelera.
 * Si su materia está eliminada, va a Entrada.
 * @param {string} id ID de la nota
 */
export async function restoreNoteFromTrash(id) {
  return runStoreAction('restoreNoteFromTrash', 'No se pudo restaurar la nota. Intenta de nuevo.', async () => {
    await SubjectService.restoreNoteFromTrash(id)
    await loadNotes()
    await loadSubjects()
    await loadTrashCount()
  })
}

/**
 * Restaura una materia completa desde la papelera (cascada).
 * @param {string} id ID de la materia
 */
export async function restoreSubjectFromTrash(id) {
  return runStoreAction('restoreSubjectFromTrash', 'No se pudo restaurar la materia. Intenta de nuevo.', async () => {
    await SubjectService.restoreSubject(id)
    await loadNotes()
    await loadSubjects()
    await loadTrashCount()
  })
}

/**
 * Restaura una sección desde la papelera (+ sus notas).
 * @param {string} id ID de la sección
 */
export async function restoreSectionFromTrash(id) {
  return runStoreAction('restoreSectionFromTrash', 'No se pudo restaurar la sección. Intenta de nuevo.', async () => {
    await SubjectService.restoreSection(id)
    await loadNotes()
    await loadSubjects()
    await loadTrashCount()
  })
}

/**
 * Elimina permanentemente una nota (DELETE físico).
 * @param {string} id ID de la nota
 */
export async function permanentlyDeleteNote(id) {
  return runStoreAction('permanentlyDeleteNote', 'No se pudo eliminar la nota permanentemente. Intenta de nuevo.', async () => {
    await NoteService.permanentlyDeleteNote(id)
    await loadTrashCount()
  })
}

/**
 * Vacía toda la papelera (DELETE físico de todo).
 */
export async function emptyTrash() {
  return runStoreAction('emptyTrash', 'No se pudo vaciar la papelera. Intenta de nuevo.', async () => {
    await SubjectService.emptyTrash()
    await loadNotes()
    await loadSubjects()
    await loadTrashCount()
  })
}
