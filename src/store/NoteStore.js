// =============================================================
// NoteStore — Estado reactivo en memoria
// Hito 04: Organización y UX
//
// Responsabilidad: Mantener el estado en memoria (lista de notas,
// nota activa, materias, query de búsqueda, visibilidad del sidebar),
// conectar con SqliteService/SubjectService y notificar a la UI
// sobre los cambios usando el patrón Observer.
// =============================================================

import * as NoteService from '../services/sqlite/notes.js'
import * as SubjectService from '../services/SubjectService.js'
import { getFilteredNotes as applyFilters } from './noteFilters.js'

// --- Estado Interno ---
const state = {
  notes: [],              // Todas las notas cargadas
  activeNoteId: null,     // ID de la nota seleccionada actualmente
  searchQuery: '',        // RF-015: Query de búsqueda actual
  dateFilter: null,       // Filtro por fecha (YYYY-MM-DD)
  sidebarOpen: true,      // RF-020: Sidebar visible (true por defecto en desktop)
  // --- Paso 9: Materias (DP-002 / DP-004) ---
  subjects: [],           // Materias cargadas (árbol con conteos)
  activeSubjectId: null,  // Filtro: null = Entrada, ID = materia específica
  viewMode: 'inbox',      // 'inbox' | 'subject' | 'archived' | 'all'
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
 * Carga inicial de todas las notas desde SQLite.
 */
export async function loadNotes() {
  state.notes = await NoteService.getAllNotes()
  notify()
}

/**
 * Carga las materias desde SubjectService (árbol con conteos).
 * Se llama al inicio y después de crear/archivar/eliminar materias.
 */
export async function loadSubjects() {
  state.subjects = await SubjectService.getSubjectTree()
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
export async function createNote(title = 'Sin título', content = '', subjectId = undefined) {
  // Si no se proporcionó contenido explícito (nota nueva desde la UI),
  // inicializamos con "# " para guiar al usuario
  if (!content && title === 'Sin título') {
    content = '# '
  }

  // Si no se especificó materia, usar la materia activa del filtro actual
  // (solo si estamos en viewMode 'subject', no en 'inbox')
  const resolvedSubjectId = subjectId !== undefined
    ? subjectId
    : (state.viewMode === 'subject' ? state.activeSubjectId : null)
  
  const newNote = await NoteService.createNote(title, content, resolvedSubjectId)
  state.notes = [newNote, ...state.notes]
  // Se remueve state.activeNoteId = newNote.id para evitar el "ghost edit state" en el composer
  // RF-015: Limpiar búsqueda y filtros al crear nota nueva
  state.searchQuery = ''
  state.dateFilter = null
  // Recargar conteos de materias (la nueva nota afecta el conteo)
  await loadSubjects()
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
 * Mantiene compatibilidad con el toggle del drawer.
 */
export function setShowArchived(show) {
  if (show) {
    state.viewMode = 'archived'
  } else {
    // Volver al modo anterior: inbox o la materia que estaba seleccionada
    state.viewMode = state.activeSubjectId ? 'subject' : 'inbox'
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
 * Filtra las notas por una fecha específica.
 * @param {string|null} dateStr Fecha en formato 'YYYY-MM-DD' o null para limpiar
 */
export function setDateFilter(dateStr) {
  state.dateFilter = dateStr
  notify()
}

/**
 * Retorna las notas filtradas y ordenadas.
 * Delega a noteFilters.js pasando el estado actual.
 * @returns {object[]} Array de notas filtradas y ordenadas
 */
export function getFilteredNotes() {
  return applyFilters(state)
}

// --- Paso 9: Acciones de Materias ---

/**
 * Cambia el modo de vista y la materia activa.
 * @param {'inbox'|'subject'|'archived'|'all'} mode Modo de vista
 * @param {string|null} subjectId ID de materia (solo relevante si mode = 'subject')
 */
export function setViewMode(mode, subjectId = null) {
  state.viewMode = mode
  state.activeSubjectId = mode === 'subject' ? subjectId : null
  notify()
}

/**
 * Atajo: selecciona una materia y cambia a viewMode 'subject'.
 * Si id es null, vuelve a Entrada (inbox).
 * @param {string|null} id ID de la materia
 */
export function setActiveSubject(id) {
  if (id) {
    setViewMode('subject', id)
  } else {
    setViewMode('inbox')
  }
}

/**
 * Crea una nueva materia vía SubjectService y recarga el árbol.
 * @param {string} name Nombre de la materia
 * @param {string|null} color Color hex
 * @param {string|null} parentSubjectId ID del padre
 * @returns {object} La materia creada
 */
export async function createSubject(name, color = null, parentSubjectId = null) {
  const subject = await SubjectService.createSubject(name, color, parentSubjectId)
  await loadSubjects()
  return subject
}

/**
 * Archiva una materia y recarga el árbol.
 * Si la materia archivada era la activa, vuelve a Entrada.
 * @param {string} id ID de la materia
 */
export async function archiveSubject(id) {
  await SubjectService.archiveSubject(id)
  if (state.activeSubjectId === id) {
    setViewMode('inbox')
  }
  await loadSubjects()
}

/**
 * Elimina una materia permanentemente y recarga el árbol.
 * @param {string} id ID de la materia
 */
export async function deleteSubject(id) {
  await SubjectService.deleteSubject(id)
  if (state.activeSubjectId === id) {
    setViewMode('inbox')
  }
  // Recargar notas (subjectId puede haber cambiado a NULL por FK)
  await loadNotes()
  await loadSubjects()
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
