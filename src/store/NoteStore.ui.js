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

/**
 * Asigna o quita un marcador de estado académico (emoji) a una nota.
 * Si el emoji es el mismo que ya tiene, lo quita (toggle).
 * DP-005: Set curado de emojis académicos (📖 ❓ 🔥 ✅).
 * @param {string} id ID de la nota
 * @param {string|null} emoji Emoji a asignar o null para quitar
 */
export async function setNoteStatus(id, emoji) {
  const note = state.notes.find(n => n.id === id)
  if (!note) return
  
  // Toggle: si ya tiene el mismo emoji, lo quitamos
  const newEmoji = note.statusEmoji === emoji ? null : emoji
  const updatedNote = await NoteService.updateNote(id, { statusEmoji: newEmoji })
  state.notes = state.notes.map(n => n.id === id ? updatedNote : n)
  notify()
}

export async function setShowArchived(show) {
  if (show) {
    state.viewMode = 'archived'
    const { loadArchivedSubjects } = await import('./NoteStore.data.js')
    await loadArchivedSubjects()
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

/**
 * Cambia a la vista de Papelera de Reciclaje.
 */
export function setViewTrash() {
  state.viewMode = 'trash'
  state.activeSubjectId = null
  notify()
}

/**
 * Cambia a la vista de Backup manual.
 */
export function setViewBackup() {
  state.viewMode = 'backup'
  state.activeSubjectId = null
  notify()
}
