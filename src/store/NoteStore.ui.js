// =============================================================
// NoteStore.ui.js — Navegación, UI y Filtros
// =============================================================

import * as NoteService from '../services/sqlite/notes.js'
import { state, notify } from './NoteStore.state.js'

export function selectNote(id) {
  if (state.activeNoteId !== id) {
    state.activeNoteId = id
    notify()
  }
}

export async function togglePin(id) {
  const note = state.notes.find(n => n.id === id)
  if (!note) return
  
  const updatedNote = await NoteService.updateNote(id, { pinned: !note.pinned })
  state.notes = state.notes.map(n => n.id === id ? updatedNote : n)
  notify()
}

export async function toggleArchive(id) {
  const note = state.notes.find(n => n.id === id)
  if (!note) return
  
  const updatedNote = await NoteService.updateNote(id, { archived: !note.archived })
  state.notes = state.notes.map(n => n.id === id ? updatedNote : n)
  
  if (state.activeNoteId === id && updatedNote.archived) {
    state.activeNoteId = null
  }
  
  notify()
}

export function setShowArchived(show) {
  if (show) {
    state.viewMode = 'archived'
  } else {
    state.viewMode = state.activeSubjectId ? 'subject' : 'inbox'
  }
  notify()
}

export function setSearchQuery(query) {
  state.searchQuery = query
  notify()
}

export function setDateFilter(dateStr) {
  state.dateFilter = dateStr
  notify()
}

export function setViewMode(mode, subjectId = null) {
  state.viewMode = mode
  state.activeSubjectId = mode === 'subject' ? subjectId : null
  notify()
}

export function setActiveSubject(id) {
  if (id) {
    setViewMode('subject', id)
  } else {
    setViewMode('inbox')
  }
}

export function openSidebar() {
  state.sidebarOpen = true
  notify()
}

export function closeSidebar() {
  state.sidebarOpen = false
  notify()
}

export function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen
  notify()
}
