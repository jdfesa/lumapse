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
  // RF-015: Limpiar búsqueda al crear nota nueva para que sea visible
  state.searchQuery = ''
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
 * Retorna las notas filtradas por el query de búsqueda actual.
 * Busca por título y contenido (case-insensitive).
 * @returns {object[]} Array de notas filtradas
 */
export function getFilteredNotes() {
  if (!state.searchQuery.trim()) {
    return state.notes
  }

  const query = state.searchQuery.toLowerCase().trim()

  return state.notes.filter(note => {
    const title = (note.title || '').toLowerCase()
    const content = (note.content || '').toLowerCase()
    return title.includes(query) || content.includes(query)
  })
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
