// =============================================================
// sqlite/notes — Operaciones CRUD de notas
// Hito 04: Organización y UX
//
// Responsabilidad: Crear, leer, actualizar, eliminar y contar
// notas en la tabla `notes` de SQLite.
// =============================================================

import { getDb, persistWeb, generateUUID } from './connection.js'
import { DatabaseError } from './errors.js'

// --- Operaciones CRUD ---

async function runWriteOperation(operation, action) {
  try {
    return await action()
  } catch (error) {
    console.error(`[SQLite] Error en ${operation}:`, error)
    throw new DatabaseError(operation, error)
  }
}

async function runSql(db, sql, values) {
  const args = values === undefined ? [sql] : [sql, values]
  await db.run(...args)
  await persistWeb()
}

/**
 * Crea una nueva nota en la base de datos.
 * @param {string} title Título de la nota
 * @param {string} content Contenido Markdown
 * @param {string|null} subjectId ID de materia asociada (null = Entrada)
 */
export async function createNote(title = 'Sin título', content = '', subjectId = null) {
  return runWriteOperation('createNote', async () => {
    const db = getDb()

    const note = {
      id: generateUUID(),
      title,
      content,
      pinned: 0,
      archived: 0,
      statusEmoji: null,
      subjectId: subjectId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const sql = `
      INSERT INTO notes (id, title, content, pinned, archived, statusEmoji, subjectId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    const values = [note.id, note.title, note.content, note.pinned, note.archived, note.statusEmoji, note.subjectId, note.createdAt, note.updatedAt]

    await runSql(db, sql, values)

    return {
      ...note,
      pinned: false,
      archived: false,
      statusEmoji: null,
    }
  })
}

/**
 * Obtiene una nota por su ID.
 */
export async function getNoteById(id) {
  const db = getDb()

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
  const db = getDb()

  const sql = `SELECT * FROM notes WHERE deletedAt IS NULL ORDER BY updatedAt DESC`
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
  return runWriteOperation('updateNote', async () => {
    const db = getDb()

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
    if (changes.statusEmoji !== undefined) {
      fields.push('statusEmoji = ?')
      values.push(changes.statusEmoji)
    }

    fields.push('updatedAt = ?')
    values.push(updatedAt)

    values.push(id)

    const sql = `UPDATE notes SET ${fields.join(', ')} WHERE id = ?`
    await runSql(db, sql, values)

    return {
      ...existing,
      ...changes,
      updatedAt
    }
  })
}

/**
 * Soft-delete: marca una nota como eliminada (papelera).
 */
export async function deleteNote(id) {
  return runWriteOperation('deleteNote', async () => {
    const db = getDb()

    const sql = `UPDATE notes SET deletedAt = ? WHERE id = ?`
    await runSql(db, sql, [new Date().toISOString(), id])
  })
}

/**
 * Cuenta el total de notas activas (no eliminadas).
 */
export async function countNotes() {
  const db = getDb()

  const sql = `SELECT COUNT(*) as count FROM notes WHERE deletedAt IS NULL`
  const res = await db.query(sql)

  if (res.values && res.values.length > 0) {
    return res.values[0].count
  }
  return 0
}

// --- Operaciones de Papelera ---

/**
 * Obtiene todas las notas en la papelera, ordenadas por fecha de eliminación.
 */
export async function getDeletedNotes() {
  const db = getDb()

  const sql = `SELECT * FROM notes WHERE deletedAt IS NOT NULL ORDER BY deletedAt DESC`
  const res = await db.query(sql)

  return (res.values || []).map(row => ({
    ...row,
    pinned: row.pinned === 1,
    archived: row.archived === 1
  }))
}

/**
 * Restaura una nota eliminada (quita deletedAt).
 */
export async function restoreNote(id) {
  return runWriteOperation('restoreNote', async () => {
    const db = getDb()

    const sql = `UPDATE notes SET deletedAt = NULL WHERE id = ?`
    await runSql(db, sql, [id])
  })
}

/**
 * Elimina permanentemente una nota (DELETE físico).
 */
export async function permanentlyDeleteNote(id) {
  return runWriteOperation('permanentlyDeleteNote', async () => {
    const db = getDb()

    const sql = `DELETE FROM notes WHERE id = ?`
    await runSql(db, sql, [id])
  })
}

/**
 * Vacía la papelera de notas (DELETE físico de todas las eliminadas).
 */
export async function emptyTrashNotes() {
  return runWriteOperation('emptyTrashNotes', async () => {
    const db = getDb()

    const sql = `DELETE FROM notes WHERE deletedAt IS NOT NULL`
    await runSql(db, sql)
  })
}

/**
 * Cuenta las notas en la papelera.
 */
export async function countDeletedNotes() {
  const db = getDb()

  const sql = `SELECT COUNT(*) as count FROM notes WHERE deletedAt IS NOT NULL`
  const res = await db.query(sql)

  return (res.values && res.values.length > 0) ? res.values[0].count : 0
}

/**
 * Purga notas eliminadas hace más de N días (auto-purgado).
 * @param {number} days Días de retención (default: 30)
 */
export async function purgeOldDeletedNotes(days = 30) {
  return runWriteOperation('purgeOldDeletedNotes', async () => {
    const db = getDb()

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffISO = cutoff.toISOString()

    const sql = `DELETE FROM notes WHERE deletedAt IS NOT NULL AND deletedAt < ?`
    await runSql(db, sql, [cutoffISO])
  })
}

/**
 * Soft-delete en cascada: todas las notas de un subject.
 * @param {string} subjectId ID de la materia
 */
export async function softDeleteNotesBySubject(subjectId) {
  return runWriteOperation('softDeleteNotesBySubject', async () => {
    const db = getDb()
    const now = new Date().toISOString()

    const sql = `UPDATE notes SET deletedAt = ? WHERE subjectId = ? AND deletedAt IS NULL`
    await runSql(db, sql, [now, subjectId])
  })
}

/**
 * Restaurar en cascada: todas las notas eliminadas de un subject.
 * Solo restaura notas cuyo deletedAt no sea NULL.
 * @param {string} subjectId ID de la materia
 */
export async function restoreNotesBySubject(subjectId) {
  return runWriteOperation('restoreNotesBySubject', async () => {
    const db = getDb()

    const sql = `UPDATE notes SET deletedAt = NULL WHERE subjectId = ? AND deletedAt IS NOT NULL`
    await runSql(db, sql, [subjectId])
  })
}
