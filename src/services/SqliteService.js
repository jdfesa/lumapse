// =============================================================
// SqliteService — Capa de persistencia con SQLite
// Hito 04: Organización y UX
//
// Responsabilidad: CRUD de notas y materias contra SQLite.
// Soporta tanto plataformas nativas como navegador (web).
// =============================================================

import { Capacitor } from '@capacitor/core'
import { SQLiteConnection, CapacitorSQLite } from '@capacitor-community/sqlite'
import { defineCustomElements } from 'jeep-sqlite/loader'

// --- Constantes de la base de datos ---
const DB_NAME = 'lumapse-db'
let sqliteConnection = null
let db = null

/**
 * Helper para persistir cambios en la versión Web (WASM).
 * En la web, los cambios en memoria deben guardarse a IndexedDB explícitamente.
 */
async function persistWeb() {
  if (Capacitor.getPlatform() === 'web' && sqliteConnection) {
    try {
      await sqliteConnection.saveToStore(DB_NAME)
    } catch (e) {
      console.error('Error al guardar datos SQLite en el almacenamiento Web:', e)
    }
  }
}

/**
 * Inicializa el componente jeep-sqlite en web.
 */
async function initWebComponent() {
  defineCustomElements(window)
  const jeepSqlite = document.createElement('jeep-sqlite')
  jeepSqlite.setAttribute('wasmPath', '/assets')
  document.body.appendChild(jeepSqlite)
  await window.customElements.whenDefined('jeep-sqlite')
}

/**
 * Inicializa la conexión SQLite, crea las tablas y realiza
 * la migración desde IndexedDB si es la primera vez.
 */
export async function initDatabase() {
  try {
    sqliteConnection = new SQLiteConnection(CapacitorSQLite)
    const platform = Capacitor.getPlatform()

    if (platform === 'web') {
      await initWebComponent()
      await sqliteConnection.initWebStore()
    }

    // Comprobar consistencia y abrir conexión
    const isConn = (await sqliteConnection.isConnection(DB_NAME, false)).result
    if (isConn) {
      db = await sqliteConnection.retrieveConnection(DB_NAME, false)
    } else {
      db = await sqliteConnection.createConnection(DB_NAME, false, 'no-encryption', 1, false)
    }

    await db.open()

    // Definición del esquema (nuevas instalaciones)
    // subjects debe crearse ANTES que notes por la FK
    const schema = `
      CREATE TABLE IF NOT EXISTS subjects (
        id              TEXT    PRIMARY KEY,
        name            TEXT    NOT NULL,
        parentSubjectId TEXT    REFERENCES subjects(id) ON DELETE CASCADE,
        archived        INTEGER DEFAULT 0,
        color           TEXT,
        createdAt       TEXT    NOT NULL
      );
      CREATE TABLE IF NOT EXISTS notes (
        id        TEXT    PRIMARY KEY,
        title     TEXT,
        content   TEXT,
        pinned    INTEGER DEFAULT 0,
        archived  INTEGER DEFAULT 0,
        subjectId TEXT    REFERENCES subjects(id) ON DELETE SET NULL,
        createdAt TEXT    NOT NULL,
        updatedAt TEXT    NOT NULL
      );
      CREATE TABLE IF NOT EXISTS metadata (
        key   TEXT PRIMARY KEY,
        value TEXT
      );
    `
    await db.execute(schema)
    await persistWeb()

    // Migraciones idempotentes para instalaciones existentes
    await runMigrations()

    // Realizar migración de IndexedDB a SQLite si corresponde
    await migrateFromIndexedDB()

    console.log('Base de datos SQLite inicializada correctamente.')
  } catch (error) {
    console.error('Error crítico al inicializar base de datos SQLite:', error)
    throw error
  }
}

/**
 * Ejecuta migraciones de schema de forma idempotente.
 * SQLite lanza un error si la columna ya existe — lo ignoramos silenciosamente.
 * Esto permite que el mismo código sirva tanto para instalaciones nuevas
 * (donde las columnas ya están en el CREATE TABLE) como para las existentes.
 */
async function runMigrations() {
  if (!db) return

  // Cada entrada: [nombre descriptivo, SQL de ALTER TABLE]
  const migrations = [
    // v1.1 — Estructura Materia > Sección (DP-004)
    ['notes.subjectId',              'ALTER TABLE notes ADD COLUMN subjectId TEXT REFERENCES subjects(id) ON DELETE SET NULL'],
    ['subjects.parentSubjectId',     'ALTER TABLE subjects ADD COLUMN parentSubjectId TEXT REFERENCES subjects(id) ON DELETE CASCADE'],
    ['subjects.archived',            'ALTER TABLE subjects ADD COLUMN archived INTEGER DEFAULT 0'],
    ['subjects.color',               'ALTER TABLE subjects ADD COLUMN color TEXT'],
  ]

  for (const [migrationName, sql] of migrations) {
    try {
      await db.run(sql)
    } catch (e) {
      const msg = e?.message || ''
      if (!msg.includes('duplicate column name') && !msg.includes('already exists')) {
        console.warn(`[Migración] Advertencia en "${migrationName}": ${msg}`)
      }
    }
  }
}

/**
 * Ejecuta una migración automática (one-time) de IndexedDB a SQLite.
 */
async function migrateFromIndexedDB() {
  if (!db) return

  try {
    // Verificar si ya se migró
    const checkRes = await db.query('SELECT value FROM metadata WHERE key = ?', ['indexeddb_migrated'])
    if (checkRes.values && checkRes.values.length > 0 && checkRes.values[0].value === 'true') {
      return // Ya migrado anteriormente
    }

    console.log('Iniciando chequeo de migración de IndexedDB...')
    const notesToMigrate = await new Promise((resolve) => {
      // Intentar abrir la IndexedDB nativa del MVP
      const request = window.indexedDB.open('lumapse-db')
      
      request.onsuccess = (event) => {
        const idb = event.target.result
        if (!idb.objectStoreNames.contains('notes')) {
          idb.close()
          resolve([])
          return
        }
        
        const transaction = idb.transaction('notes', 'readonly')
        const store = transaction.objectStore('notes')
        const getAllRequest = store.getAll()
        
        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result || [])
          idb.close()
        }
        
        getAllRequest.onerror = () => {
          resolve([])
          idb.close()
        }
      }
      
      request.onerror = () => {
        resolve([])
      }
    })

    if (notesToMigrate.length > 0) {
      console.log(`Se encontraron ${notesToMigrate.length} notas en IndexedDB. Migrando a SQLite...`)
      for (const note of notesToMigrate) {
        const sql = `
          INSERT OR REPLACE INTO notes (id, title, content, pinned, archived, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `
        const values = [
          note.id,
          note.title || 'Sin título',
          note.content || '',
          note.pinned ? 1 : 0,
          note.archived ? 1 : 0,
          note.createdAt || new Date().toISOString(),
          note.updatedAt || new Date().toISOString()
        ]
        await db.run(sql, values)
      }
      console.log('Notas migradas exitosamente a SQLite.')
    }
    
    // Marcar migración como completada
    await db.run("INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)", ['indexeddb_migrated', 'true'])
    await persistWeb()
  } catch (error) {
    console.warn('Advertencia durante la migración de IndexedDB:', error)
  }
}

// --- Helper UUID ---
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

// --- Operaciones CRUD ---

/**
 * Crea una nueva nota en la base de datos.
 * @param {string} title Título de la nota
 * @param {string} content Contenido Markdown
 * @param {string|null} subjectId ID de materia asociada (null = Entrada)
 */
export async function createNote(title = 'Sin título', content = '', subjectId = null) {
  if (!db) throw new Error('Database not initialized')

  const note = {
    id: generateUUID(),
    title,
    content,
    pinned: 0,
    archived: 0,
    subjectId: subjectId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const sql = `
    INSERT INTO notes (id, title, content, pinned, archived, subjectId, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `
  const values = [note.id, note.title, note.content, note.pinned, note.archived, note.subjectId, note.createdAt, note.updatedAt]
  
  await db.run(sql, values)
  await persistWeb()

  return {
    ...note,
    pinned: false,
    archived: false,
  }
}

/**
 * Obtiene una nota por su ID.
 */
export async function getNoteById(id) {
  if (!db) throw new Error('Database not initialized')

  const sql = `SELECT * FROM notes WHERE id = ?`
  const res = await db.query(sql, [id])
  
  if (res.values && res.values.length > 0) {
    const row = res.values[0]
    return {
      ...row,
      pinned: row.pinned === 1,
      archived: row.archived === 1
    }
  }
  return undefined
}

/**
 * Obtiene todas las notas ordenadas por fecha de actualización descendente.
 */
export async function getAllNotes() {
  if (!db) throw new Error('Database not initialized')

  const sql = `SELECT * FROM notes ORDER BY updatedAt DESC`
  const res = await db.query(sql)

  return (res.values || []).map(row => ({
    ...row,
    pinned: row.pinned === 1,
    archived: row.archived === 1
  }))
}

/**
 * Actualiza campos de una nota existente.
 */
export async function updateNote(id, changes) {
  if (!db) throw new Error('Database not initialized')

  const existing = await getNoteById(id)
  if (!existing) {
    throw new Error(`Nota con id "${id}" no encontrada.`)
  }

  const fields = []
  const values = []
  const updatedAt = new Date().toISOString()

  if (changes.title !== undefined) {
    fields.push('title = ?')
    values.push(changes.title)
  }
  if (changes.content !== undefined) {
    fields.push('content = ?')
    values.push(changes.content)
  }
  if (changes.pinned !== undefined) {
    fields.push('pinned = ?')
    values.push(changes.pinned ? 1 : 0)
  }
  if (changes.archived !== undefined) {
    fields.push('archived = ?')
    values.push(changes.archived ? 1 : 0)
  }
  if (changes.subjectId !== undefined) {
    fields.push('subjectId = ?')
    values.push(changes.subjectId)
  }

  fields.push('updatedAt = ?')
  values.push(updatedAt)

  values.push(id)

  const sql = `UPDATE notes SET ${fields.join(', ')} WHERE id = ?`
  await db.run(sql, values)
  await persistWeb()

  return {
    ...existing,
    ...changes,
    updatedAt
  }
}

/**
 * Elimina una nota por su ID.
 */
export async function deleteNote(id) {
  if (!db) throw new Error('Database not initialized')

  const sql = `DELETE FROM notes WHERE id = ?`
  await db.run(sql, [id])
  await persistWeb()
}

/**
 * Cuenta el total de notas almacenadas.
 */
export async function countNotes() {
  if (!db) throw new Error('Database not initialized')

  const sql = `SELECT COUNT(*) as count FROM notes`
  const res = await db.query(sql)

  if (res.values && res.values.length > 0) {
    return res.values[0].count
  }
  return 0
}

// =============================================================
// Operaciones CRUD — Materias (subjects)
// Paso 9: Categorización por materia (DP-002 / DP-004)
// =============================================================

/**
 * Inserta una materia en la base de datos.
 * La validación de negocio (nombre, unicidad, profundidad) la hace SubjectService.
 * @param {object} subject Objeto con id, name, color, parentSubjectId, createdAt
 */
export async function createSubjectRow(subject) {
  if (!db) throw new Error('Database not initialized')

  const sql = `
    INSERT INTO subjects (id, name, parentSubjectId, archived, color, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `
  const values = [
    subject.id,
    subject.name,
    subject.parentSubjectId || null,
    subject.archived ? 1 : 0,
    subject.color || null,
    subject.createdAt
  ]

  await db.run(sql, values)
  await persistWeb()
}

/**
 * Obtiene todas las materias no archivadas, ordenadas por nombre.
 */
export async function getAllSubjectRows() {
  if (!db) throw new Error('Database not initialized')

  const sql = `SELECT * FROM subjects WHERE archived = 0 ORDER BY name ASC`
  const res = await db.query(sql)

  return (res.values || []).map(row => ({
    ...row,
    archived: row.archived === 1
  }))
}

/**
 * Obtiene una materia por su ID.
 */
export async function getSubjectRowById(id) {
  if (!db) throw new Error('Database not initialized')

  const sql = `SELECT * FROM subjects WHERE id = ?`
  const res = await db.query(sql, [id])

  if (res.values && res.values.length > 0) {
    const row = res.values[0]
    return { ...row, archived: row.archived === 1 }
  }
  return undefined
}

/**
 * Actualiza campos de una materia existente.
 */
export async function updateSubjectRow(id, changes) {
  if (!db) throw new Error('Database not initialized')

  const fields = []
  const values = []

  if (changes.name !== undefined) {
    fields.push('name = ?')
    values.push(changes.name)
  }
  if (changes.color !== undefined) {
    fields.push('color = ?')
    values.push(changes.color)
  }
  if (changes.parentSubjectId !== undefined) {
    fields.push('parentSubjectId = ?')
    values.push(changes.parentSubjectId)
  }
  if (changes.archived !== undefined) {
    fields.push('archived = ?')
    values.push(changes.archived ? 1 : 0)
  }

  if (fields.length === 0) return

  values.push(id)
  const sql = `UPDATE subjects SET ${fields.join(', ')} WHERE id = ?`
  await db.run(sql, values)
  await persistWeb()
}

/**
 * Elimina una materia por ID. Las notas quedan con subjectId = NULL (FK ON DELETE SET NULL).
 */
export async function deleteSubjectRow(id) {
  if (!db) throw new Error('Database not initialized')

  const sql = `DELETE FROM subjects WHERE id = ?`
  await db.run(sql, [id])
  await persistWeb()
}

/**
 * Cuenta las notas no archivadas asignadas a una materia específica.
 * @param {string} subjectId ID de la materia
 */
export async function countNotesBySubject(subjectId) {
  if (!db) throw new Error('Database not initialized')

  const sql = `SELECT COUNT(*) as count FROM notes WHERE subjectId = ? AND archived = 0`
  const res = await db.query(sql, [subjectId])

  return (res.values && res.values.length > 0) ? res.values[0].count : 0
}

/**
 * Cuenta las notas no archivadas sin materia asignada (Entrada/Inbox).
 */
export async function getInboxCount() {
  if (!db) throw new Error('Database not initialized')

  const sql = `SELECT COUNT(*) as count FROM notes WHERE subjectId IS NULL AND archived = 0`
  const res = await db.query(sql)

  return (res.values && res.values.length > 0) ? res.values[0].count : 0
}
