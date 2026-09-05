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
import { createWriteCoordinator } from './writeCoordinator.js'
import { migrateLegacyNotes } from './legacyMigration.js'

// --- Constantes de la base de datos ---
const DB_NAME = 'lumapse-db'
let sqliteConnection = null
let db = null
let coordinator = null
let initialization = null
let ready = false

// No se expone la conexión nativa: incluso el CRUD independiente pasa por la cola.
export function getDb(scope) {
  if (!ready || !coordinator) throw new Error('Database not initialized')
  return coordinator.getDb(scope)
}

export function isWriteTransactionActive(scope) {
  return coordinator?.isActive(scope) || false
}

async function saveWebStore() {
  if (Capacitor.getPlatform() === 'web') {
    await sqliteConnection.saveToStore(DB_NAME)
  }
}

export function persistWeb(scope) {
  if (!coordinator) return Promise.reject(new Error('Database not initialized'))
  return coordinator.persist(scope)
}

// El callback recibe el capability que debe pasar explícitamente a sus colaboradores.
/**
 * @template T
 * @param {(scope: object) => Promise<T>} action
 * @param {object} [scope]
 * @returns {Promise<T>}
 */
export async function runTransaction(action, scope) {
  getDb(scope)
  return coordinator.transaction(action, scope)
}

async function readConnectionFlag(method) {
  const { result } = await db[method]()
  if (typeof result !== 'boolean') throw new Error(`SQLite ${method} state unknown`)
  return result
}

async function recoverConnection() {
  await coordinator?.drain()
  // Cerrar jeep-sqlite puede persistir: nunca cerrar con una transacción incierta.
  if (db) {
    if (await readConnectionFlag('isDBOpen')) {
      if (await readConnectionFlag('isTransactionActive')) await db.rollbackTransaction()
      if (await readConnectionFlag('isTransactionActive')) throw new Error('SQLite transaction still active')
    }
    await sqliteConnection.closeConnection(DB_NAME, false)
    db = null
  }
}

/**
 * Inicializa el componente jeep-sqlite en web.
 */
async function initWebComponent() {
  defineCustomElements(window)
  if (!document.querySelector('jeep-sqlite')) {
    const jeepSqlite = document.createElement('jeep-sqlite')
    jeepSqlite.setAttribute('wasmPath', '/assets')
    document.body.appendChild(jeepSqlite)
  }
  await window.customElements.whenDefined('jeep-sqlite')
}

/**
 * Inicializa la conexión SQLite, crea las tablas y realiza
 * la migración desde IndexedDB si es la primera vez.
 */
export function initDatabase() {
  if (initialization) return initialization
  if (ready && coordinator?.isHealthy()) return Promise.resolve()
  ready = false
  initialization = initialize().finally(() => { initialization = null })
  return initialization
}

async function initialize() {
  try {
    await recoverConnection()
    sqliteConnection ??= new SQLiteConnection(CapacitorSQLite)
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
      CREATE TABLE IF NOT EXISTS academic_events (
        id        TEXT    PRIMARY KEY,
        type      TEXT    NOT NULL CHECK(type IN ('parcial', 'final', 'tp', 'exposicion')),
        title     TEXT,
        date      TEXT    NOT NULL,
        subjectId TEXT    REFERENCES subjects(id) ON DELETE SET NULL,
        createdAt TEXT    NOT NULL,
        updatedAt TEXT    NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_academic_events_date
        ON academic_events(date);
      CREATE INDEX IF NOT EXISTS idx_academic_events_subject
        ON academic_events(subjectId);
      CREATE TABLE IF NOT EXISTS metadata (
        key   TEXT PRIMARY KEY,
        value TEXT
      );
    `
    await db.execute(schema)
    await saveWebStore()

    // Migraciones idempotentes para instalaciones existentes
    await runMigrations()
    await saveWebStore()

    // Realizar migración de IndexedDB a SQLite si corresponde
    coordinator = createWriteCoordinator(db, saveWebStore)
    await migrateLegacyNotes(coordinator)
    ready = true

    console.log('Base de datos SQLite inicializada correctamente.')
  } catch (error) {
    coordinator?.invalidate(error)
    console.error('Error crítico al inicializar base de datos SQLite:', error)
    throw error
  }
}

/**
 * Ejecuta migraciones de schema de forma idempotente.
 * Consulta columnas reales antes del ALTER; ningún fallo SQL se interpreta por mensaje.
 */
async function runMigrations() {
  if (!db) return

  // Cada entrada: [nombre descriptivo, SQL idempotente de schema]
  const migrations = [
    // v1.1 — Estructura Materia > Sección (DP-004)
    ['notes.subjectId',              'ALTER TABLE notes ADD COLUMN subjectId TEXT REFERENCES subjects(id) ON DELETE SET NULL'],
    ['subjects.parentSubjectId',     'ALTER TABLE subjects ADD COLUMN parentSubjectId TEXT REFERENCES subjects(id) ON DELETE CASCADE'],
    ['subjects.archived',            'ALTER TABLE subjects ADD COLUMN archived INTEGER DEFAULT 0'],
    ['subjects.color',               'ALTER TABLE subjects ADD COLUMN color TEXT'],
    // v1.2 — Marcadores de estado académico (DP-005)
    ['notes.statusEmoji',            'ALTER TABLE notes ADD COLUMN statusEmoji TEXT'],
    // v1.3 — Papelera de Reciclaje (Soft Delete)
    ['notes.deletedAt',              'ALTER TABLE notes ADD COLUMN deletedAt TEXT'],
    ['subjects.deletedAt',           'ALTER TABLE subjects ADD COLUMN deletedAt TEXT'],
    // v1.4 — Fechas académicas discretas (DP-007)
    ['academic_events.table',         `CREATE TABLE IF NOT EXISTS academic_events (
      id        TEXT    PRIMARY KEY,
      type      TEXT    NOT NULL CHECK(type IN ('parcial', 'final', 'tp', 'exposicion')),
      title     TEXT,
      date      TEXT    NOT NULL,
      subjectId TEXT    REFERENCES subjects(id) ON DELETE SET NULL,
      createdAt TEXT    NOT NULL,
      updatedAt TEXT    NOT NULL
    )`],
    ['academic_events.date_index',    'CREATE INDEX IF NOT EXISTS idx_academic_events_date ON academic_events(date)'],
    ['academic_events.subject_index', 'CREATE INDEX IF NOT EXISTS idx_academic_events_subject ON academic_events(subjectId)'],
  ]

  for (const [migrationName, sql] of migrations) {
    try {
      if (sql.startsWith('ALTER ')) {
        const [table, column] = migrationName.split('.')
        const result = await db.query(`PRAGMA table_info(${table})`)
        if (!result.values?.length) throw new Error(`Missing migration table: ${table}`)
        if (result.values.some(field => field.name === column)) continue
      }
      await db.run(sql)
    } catch (cause) {
      throw new Error(`SQLite migration failed: ${migrationName}`, { cause })
    }
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
