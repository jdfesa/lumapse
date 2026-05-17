// =============================================================
// NoteService — Capa de persistencia con IndexedDB
// Hito 04: Organización y UX
//
// Responsabilidad: CRUD de notas contra IndexedDB.
// No conoce la UI ni el estado de la app, solo la base de datos.
// =============================================================

import { openDB } from 'idb'

// --- Constantes de la base de datos ---

const DB_NAME = 'lumapse-db'
const DB_VERSION = 2
const STORE_NAME = 'notes'

// --- Inicialización ---

/**
 * Abre (o crea) la base de datos IndexedDB.
 *
 * Historial de versiones:
 *   v1: Store "notes" con índice by-updatedAt.
 *   v2: Backfill campos pinned y archived en notas existentes.
 *
 * @returns {Promise<IDBPDatabase>} instancia de la base de datos
 */
function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, _newVersion, transaction) {
      // v1: Crear store si no existe (primera instalación)
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('by-updatedAt', 'updatedAt')
      }

      // v2: Backfill pinned/archived en notas existentes
      if (oldVersion < 2) {
        const store = transaction.objectStore(STORE_NAME)
        store.openCursor().then(function backfill(cursor) {
          if (!cursor) return
          const note = cursor.value
          let needsUpdate = false
          if (note.pinned === undefined) { note.pinned = false; needsUpdate = true }
          if (note.archived === undefined) { note.archived = false; needsUpdate = true }
          if (needsUpdate) cursor.update(note)
          return cursor.continue().then(backfill)
        })
      }
    },
  })
}

// --- Operaciones CRUD ---

/**
 * Genera un UUID v4.
 * Fallback para contextos no seguros (HTTP en móvil) donde crypto.randomUUID no está disponible.
 */
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Crea una nueva nota con valores por defecto.
 *
 * @param {string} [title='Sin título'] — título inicial
 * @param {string} [content=''] — contenido inicial
 * @returns {Promise<object>} la nota creada (con id, timestamps, etc.)
 */
export async function createNote(title = 'Sin título', content = '') {
  const db = await getDB()

  const note = {
    id: generateUUID(),
    title,
    content,
    pinned: false,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await db.put(STORE_NAME, note)
  return note
}

/**
 * Obtiene una nota por su ID.
 *
 * @param {string} id — UUID de la nota
 * @returns {Promise<object|undefined>} la nota o undefined si no existe
 */
export async function getNoteById(id) {
  const db = await getDB()
  return db.get(STORE_NAME, id)
}

/**
 * Obtiene todas las notas, ordenadas por updatedAt descendente
 * (la más reciente primero).
 *
 * @returns {Promise<object[]>} array de notas ordenado
 */
export async function getAllNotes() {
  const db = await getDB()
  const notes = await db.getAllFromIndex(STORE_NAME, 'by-updatedAt')
  // El índice ordena ascendente; lo invertimos para más reciente primero
  return notes.reverse()
}

/**
 * Actualiza campos de una nota existente.
 * Solo modifica los campos que se pasen en `changes`.
 * Siempre actualiza `updatedAt` automáticamente.
 *
 * @param {string} id — UUID de la nota a actualizar
 * @param {object} changes — campos a modificar ({ title, content, ... })
 * @returns {Promise<object>} la nota actualizada
 * @throws {Error} si la nota no existe
 */
export async function updateNote(id, changes) {
  const db = await getDB()
  const note = await db.get(STORE_NAME, id)

  if (!note) {
    throw new Error(`Nota con id "${id}" no encontrada.`)
  }

  const updated = {
    ...note,
    ...changes,
    updatedAt: new Date().toISOString(),
  }

  await db.put(STORE_NAME, updated)
  return updated
}

/**
 * Elimina una nota por su ID.
 *
 * @param {string} id — UUID de la nota a eliminar
 * @returns {Promise<void>}
 */
export async function deleteNote(id) {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

/**
 * Cuenta el total de notas almacenadas.
 *
 * @returns {Promise<number>}
 */
export async function countNotes() {
  const db = await getDB()
  return db.count(STORE_NAME)
}
