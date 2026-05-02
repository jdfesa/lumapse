// =============================================================
// NoteService — Capa de persistencia con IndexedDB
// Hito 02: Core del Editor
//
// Responsabilidad: CRUD de notas contra IndexedDB.
// No conoce la UI ni el estado de la app, solo la base de datos.
// =============================================================

import { openDB } from 'idb'

// --- Constantes de la base de datos ---

const DB_NAME = 'lumapse-db'
const DB_VERSION = 1
const STORE_NAME = 'notes'

// --- Inicialización ---

/**
 * Abre (o crea) la base de datos IndexedDB.
 * Si es la primera vez, crea el object store "notes" con un índice
 * por updatedAt para poder ordenar las notas.
 *
 * @returns {Promise<IDBPDatabase>} instancia de la base de datos
 */
function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Se ejecuta solo cuando la DB no existe o sube de versión
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        // Índice para ordenar por fecha de última modificación
        store.createIndex('by-updatedAt', 'updatedAt')
      }
    },
  })
}

// --- Operaciones CRUD ---

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
    id: crypto.randomUUID(),
    title,
    content,
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
