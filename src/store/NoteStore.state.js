// =============================================================
// NoteStore.state.js — Estado reactivo base
// =============================================================

export const state = {
  notes: [],              // Todas las notas cargadas
  activeNoteId: null,     // ID de la nota seleccionada actualmente
  searchQuery: '',        // RF-015: Query de búsqueda actual
  dateFilter: null,       // Filtro por fecha (YYYY-MM-DD)
  sidebarOpen: true,      // RF-020: Sidebar visible (true por defecto en desktop)
  subjects: [],           // Materias cargadas (árbol con conteos)
  activeSubjectId: null,  // Filtro: null = Entrada, ID = materia específica
  viewMode: 'inbox',      // 'inbox' | 'subject' | 'archived' | 'trash' | 'all'
  trashCount: 0,          // Cantidad total de items en papelera (para badge)
  showTrashWarning: false, // Flag: papelera tiene >50 items
  archivedSubjectIds: [], // IDs de subjects archivados (para filtros)
  archivedSubjects: null, // Árbol de subjects archivados (para drawer)
}

const subscribers = new Set()

export function notify() {
  for (const callback of subscribers) {
    callback(state)
  }
}

export function subscribe(callback) {
  subscribers.add(callback)
  callback(state)
  return () => subscribers.delete(callback)
}

export function getState() {
  return state
}
