// =============================================================
// NoteStore — Estado reactivo en memoria
// Hito 04: Organización y UX
//
// Responsabilidad: Mantener el estado en memoria (lista de notas,
// nota activa, query de búsqueda, visibilidad del sidebar),
// conectar con NoteService y notificar a la UI
// sobre los cambios usando el patrón Observer.
// =============================================================

import * as NoteService from '../services/NoteService.js'

// --- Estado Interno ---
const state = {
  notes: [],           // Todas las notas cargadas
  activeNoteId: null,  // ID de la nota seleccionada actualmente
  searchQuery: '',     // RF-015: Query de búsqueda actual
  dateFilter: null,    // Filtro por fecha (YYYY-MM-DD)
  showArchived: false, // Mostrar notas archivadas (toggle desde drawer)
  sidebarOpen: true,   // RF-020: Sidebar visible (true por defecto en desktop)
}

// --- Sistema de Suscripciones (Observer Pattern) ---
const subscribers = new Set()

/**
 * Notifica a todos los componentes que escuchan cambios.
 */
function notify() {
  for (const callback of subscribers) {
    callback(state)
  }
}

/**
 * Permite a un componente suscribirse a los cambios del estado.
 * @param {Function} callback Función a ejecutar cuando el estado cambie
 * @returns {Function} Función para cancelar la suscripción (unsubscribe)
 */
export function subscribe(callback) {
  subscribers.add(callback)
  // Al suscribirse, enviamos el estado actual inmediatamente
  callback(state)
  
  // Retorna función para desuscribirse
  return () => subscribers.delete(callback)
}

/**
 * Retorna el estado actual sincrónicamente.
 */
export function getState() {
  return state
}

// --- Acciones de Estado ---

/**
 * Carga inicial de todas las notas desde IndexedDB.
 */
export async function loadNotes() {
  state.notes = await NoteService.getAllNotes()
  notify()
}

/**
 * Crea una nueva nota, la pone primera y la selecciona como activa.
 * DP-001: El contenido por defecto comienza con "# " para que el
 * usuario escriba el título directamente en el cuerpo Markdown.
 * El campo 'title' se deriva automáticamente del contenido.
 *
 * @param {string} title Título inicial (opcional, usado por ImportService)
 * @param {string} content Contenido inicial (opcional)
 */
export async function createNote(title = 'Sin título', content = '') {
  // Si no se proporcionó contenido explícito (nota nueva desde la UI),
  // inicializamos con "# " para guiar al usuario
  if (!content && title === 'Sin título') {
    content = '# '
  }
  
  const newNote = await NoteService.createNote(title, content)
  state.notes = [newNote, ...state.notes]
  state.activeNoteId = newNote.id
  // RF-015: Limpiar búsqueda y filtros al crear nota nueva
  state.searchQuery = ''
  state.dateFilter = null
  notify()
}

/**
 * Cambia la nota activa en la vista.
 * @param {string|null} id ID de la nota a seleccionar
 */
export function selectNote(id) {
  if (state.activeNoteId !== id) {
    state.activeNoteId = id
    notify()
  }
}

/**
 * Actualiza una nota existente, modifica la DB y la memoria,
 * y reordena la lista poniendo la nota actualizada primero.
 * @param {string} id ID de la nota
 * @param {object} changes Cambios a aplicar (title, content)
 */
export async function updateNote(id, changes) {
  const updatedNote = await NoteService.updateNote(id, changes)
  
  // Reemplazar la nota vieja con la nueva
  state.notes = state.notes.map(note => note.id === id ? updatedNote : note)
  
  // Moverla al principio de la lista porque es la modificada más recientemente
  const noteIndex = state.notes.findIndex(note => note.id === id)
  if (noteIndex > -1) {
    const [noteToMove] = state.notes.splice(noteIndex, 1)
    state.notes.unshift(noteToMove)
  }
  
  notify()
}

/**
 * Elimina una nota por su ID de la DB y del estado en memoria.
 * @param {string} id ID de la nota a eliminar
 */
export async function deleteNote(id) {
  await NoteService.deleteNote(id)
  state.notes = state.notes.filter(note => note.id !== id)
  
  // Si la nota eliminada era la activa, deseleccionarla
  if (state.activeNoteId === id) {
    state.activeNoteId = null
  }
  
  notify()
}

// --- Pin y Archivo ---

/**
 * Fija o desfija una nota. Las notas fijadas aparecen al tope del feed.
 * @param {string} id ID de la nota
 */
export async function togglePin(id) {
  const note = state.notes.find(n => n.id === id)
  if (!note) return
  
  const updatedNote = await NoteService.updateNote(id, { pinned: !note.pinned })
  state.notes = state.notes.map(n => n.id === id ? updatedNote : n)
  notify()
}

/**
 * Archiva o desarchiva una nota. Las notas archivadas no aparecen en el feed principal.
 * @param {string} id ID de la nota
 */
export async function toggleArchive(id) {
  const note = state.notes.find(n => n.id === id)
  if (!note) return
  
  const updatedNote = await NoteService.updateNote(id, { archived: !note.archived })
  state.notes = state.notes.map(n => n.id === id ? updatedNote : n)
  
  // Si la nota archivada era la activa, deseleccionarla
  if (state.activeNoteId === id && updatedNote.archived) {
    state.activeNoteId = null
  }
  
  notify()
}

/**
 * Alterna la visibilidad de notas archivadas.
 */
export function setShowArchived(show) {
  state.showArchived = show
  notify()
}

// --- RF-015: Búsqueda ---

/**
 * Actualiza el query de búsqueda y notifica a los suscriptores.
 * El filtrado se realiza en getFilteredNotes(), no aquí.
 * @param {string} query Texto a buscar
 */
export function setSearchQuery(query) {
  state.searchQuery = query
  notify()
}

/**
 * Filtra las notas por una fecha específica.
 * @param {string|null} dateStr Fecha en formato 'YYYY-MM-DD' o null para limpiar
 */
export function setDateFilter(dateStr) {
  state.dateFilter = dateStr
  notify()
}

/**
 * Retorna las notas filtradas y ordenadas.
 * Orden: pinned primero, luego por updatedAt (más reciente primero).
 * Por defecto, oculta las archivadas salvo que showArchived esté activo.
 * @returns {object[]} Array de notas filtradas y ordenadas
 */
export function getFilteredNotes() {
  let filtered = state.notes

  // 0. Filtrar por estado de archivo
  if (state.showArchived) {
    // En modo archivo: mostrar SOLO las archivadas
    filtered = filtered.filter(note => note.archived === true)
  } else {
    // En modo normal: ocultar las archivadas
    filtered = filtered.filter(note => !note.archived)
  }

  // 1. Filtrar por búsqueda de texto
  if (state.searchQuery.trim()) {
    const query = state.searchQuery.toLowerCase().trim()
    filtered = filtered.filter(note => {
      const title = (note.title || '').toLowerCase()
      const content = (note.content || '').toLowerCase()
      return title.includes(query) || content.includes(query)
    })
  }

  // 2. Filtrar por fecha exacta (usando updatedAt)
  if (state.dateFilter) {
    filtered = filtered.filter(note => {
      if (!note.updatedAt) return false
      const noteDate = new Date(note.updatedAt).toISOString().split('T')[0]
      return noteDate === state.dateFilter
    })
  }

  // 3. Ordenar: pinned al tope, luego por updatedAt
  filtered.sort((a, b) => {
    // Pinned primero
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    // Dentro del mismo grupo, más reciente primero
    return new Date(b.updatedAt) - new Date(a.updatedAt)
  })

  return filtered
}

// --- RF-020: Sidebar / Navegación mobile ---

/**
 * Abre el sidebar (visible en mobile).
 */
export function openSidebar() {
  state.sidebarOpen = true
  notify()
}

/**
 * Cierra el sidebar.
 */
export function closeSidebar() {
  state.sidebarOpen = false
  notify()
}

/**
 * Toggle del sidebar.
 */
export function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen
  notify()
}
