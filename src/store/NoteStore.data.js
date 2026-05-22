// =============================================================
// NoteStore.data.js — Operaciones de persistencia y datos
// =============================================================

import * as NoteService from '../services/sqlite/notes.js'
import * as SubjectService from '../services/SubjectService.js'
import { getFilteredNotes as applyFilters } from './noteFilters.js'
import { state, notify } from './NoteStore.state.js'

export async function loadNotes() {
  state.notes = await NoteService.getAllNotes()
  notify()
}

export async function loadSubjects() {
  state.subjects = await SubjectService.getSubjectTree()
  notify()
}

export async function createNote(title = 'Sin título', content = '', subjectId = undefined) {
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
}

export async function updateNote(id, changes) {
  const updatedNote = await NoteService.updateNote(id, changes)
  
  state.notes = state.notes.map(note => note.id === id ? updatedNote : note)
  
  const noteIndex = state.notes.findIndex(note => note.id === id)
  if (noteIndex > -1) {
    const [noteToMove] = state.notes.splice(noteIndex, 1)
    state.notes.unshift(noteToMove)
  }
  
  notify()
}

export async function moveNote(noteId, subjectId) {
  const updatedNote = await NoteService.updateNote(noteId, { subjectId })
  state.notes = state.notes.map(note => note.id === noteId ? updatedNote : note)
  await loadSubjects()
  notify()
}

export async function deleteNote(id) {
  await NoteService.deleteNote(id)
  state.notes = state.notes.filter(note => note.id !== id)
  
  if (state.activeNoteId === id) {
    state.activeNoteId = null
  }
  
  notify()
}

export function getFilteredNotes() {
  return applyFilters(state)
}

export async function createSubject(name, color = null, parentSubjectId = null) {
  const subject = await SubjectService.createSubject(name, color, parentSubjectId)
  await loadSubjects()
  return subject
}

export async function archiveSubject(id) {
  await SubjectService.archiveSubject(id)
  if (state.activeSubjectId === id) {
    state.viewMode = 'inbox'
    state.activeSubjectId = null
  }
  await loadSubjects()
}

export async function deleteSubject(id) {
  await SubjectService.deleteSubject(id)
  if (state.activeSubjectId === id) {
    state.viewMode = 'inbox'
    state.activeSubjectId = null
  }
  await loadNotes()
  await loadSubjects()
}
