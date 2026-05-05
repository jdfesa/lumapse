// =============================================================
// NoteStore — Estado reactivo en memoria
// Hito 02: Core del Editor
//
// Responsabilidad: Mantener el estado en memoria (lista de notas,
// nota activa), conectar con NoteService y notificar a la UI
// sobre los cambios usando el patrón Observer.
// =============================================================

import * as NoteService from '../services/NoteService.js'

// --- Estado Interno ---
const state = {
  notes: [],           // Todas las notas cargadas
  activeNoteId: null   // ID de la nota seleccionada actualmente
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
