// =============================================================
// sqlite/connection — Conexión y esquema SQLite
// Hito 04: Organización y UX
//
// Responsabilidad: Inicializar la conexión SQLite, definir
// el esquema, ejecutar migraciones y proveer helpers compartidos
// (persistWeb, getDb, generateUUID) para los módulos CRUD.
// =============================================================

import { Capacitor } from '@capacitor/core'
import { SQLiteConnection, CapacitorSQLite } from '@capacitor-community/sqlite'
import { defineCustomElements } from 'jeep-sqlite/loader'

// --- Constantes de la base de datos ---
const DB_NAME = 'lumapse-db'
let sqliteConnection = null
let db = null

/**
 * Retorna la instancia activa de la base de datos.
 * Los módulos CRUD (notes.js, subjects.js) usan este getter
 * en lugar de acceder directamente a la variable `db`.
 * @returns {object} Instancia de conexión SQLite
 * @throws {Error} Si la base de datos no fue inicializada
 */
export function getDb() {
  if (!db) throw new Error('Database not initialized')
  return db
}

/**
 * Helper para persistir cambios en la versión Web (WASM).
 * En la web, los cambios en memoria deben guardarse a IndexedDB explícitamente.
 */
export async function persistWeb() {
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
    // v1.2 — Marcadores de estado académico (DP-005)
    ['notes.statusEmoji',            'ALTER TABLE notes ADD COLUMN statusEmoji TEXT'],
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

/**
 * Genera un UUID v4. Usa crypto.randomUUID() cuando está disponible,
 * con fallback a generación manual para entornos sin soporte.
 * @returns {string} UUID v4
 */
export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
