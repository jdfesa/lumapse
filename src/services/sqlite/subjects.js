// =============================================================
// sqlite/subjects — Operaciones CRUD de materias
// Paso 9: Categorización por materia (DP-002 / DP-004)
//
// Responsabilidad: Crear, leer, actualizar, eliminar y contar
// filas en la tabla `subjects` de SQLite.
// La validación de negocio la hace SubjectService.
// =============================================================

import { getDb, persistWeb } from './connection.js'
import { DatabaseError } from './errors.js'

async function runWriteOperation(operation, action) {
  try {
    return await action()
  } catch (error) {
    console.error(`[SQLite] Error en ${operation}:`, error)
    throw new DatabaseError(operation, error)
  }
}

/**
 * Inserta una materia en la base de datos.
 * La validación de negocio (nombre, unicidad, profundidad) la hace SubjectService.
 * @param {object} subject Objeto con id, name, color, parentSubjectId, createdAt
 */
export async function createSubjectRow(subject) {
  return runWriteOperation('createSubjectRow', async () => {
    const db = getDb()

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
  })
}

/**
 * Obtiene todas las materias no archivadas, ordenadas por nombre.
 */
export async function getAllSubjectRows() {
  const db = getDb()

  const sql = `SELECT * FROM subjects WHERE archived = 0 AND deletedAt IS NULL ORDER BY name ASC`
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
  const db = getDb()

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
  return runWriteOperation('updateSubjectRow', async () => {
    const db = getDb()

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
  })
}

/**
 * Soft-delete: marca una materia como eliminada (papelera).
 */
export async function deleteSubjectRow(id) {
  return runWriteOperation('deleteSubjectRow', async () => {
    const db = getDb()

    const sql = `UPDATE subjects SET deletedAt = ? WHERE id = ?`
    await db.run(sql, [new Date().toISOString(), id])
    await persistWeb()
  })
}

/**
 * Cuenta las notas activas (no archivadas, no eliminadas) de una materia.
 * @param {string} subjectId ID de la materia
 */
export async function countNotesBySubject(subjectId) {
  const db = getDb()

  const sql = `SELECT COUNT(*) as count FROM notes WHERE subjectId = ? AND archived = 0 AND deletedAt IS NULL`
  const res = await db.query(sql, [subjectId])

  return (res.values && res.values.length > 0) ? res.values[0].count : 0
}

/**
 * Cuenta las notas activas sin materia asignada (Entrada/Inbox).
 */
export async function getInboxCount() {
  const db = getDb()

  const sql = `SELECT COUNT(*) as count FROM notes WHERE subjectId IS NULL AND archived = 0 AND deletedAt IS NULL`
  const res = await db.query(sql)

  return (res.values && res.values.length > 0) ? res.values[0].count : 0
}

// --- Operaciones de Papelera ---

/**
 * Obtiene materias/secciones eliminadas.
 */
export async function getDeletedSubjectRows() {
  const db = getDb()

  const sql = `SELECT * FROM subjects WHERE deletedAt IS NOT NULL ORDER BY deletedAt DESC`
  const res = await db.query(sql)

  return (res.values || []).map(row => ({
    ...row,
    archived: row.archived === 1
  }))
}

/**
 * Restaura una materia eliminada (quita deletedAt).
 */
export async function restoreSubjectRow(id) {
  return runWriteOperation('restoreSubjectRow', async () => {
    const db = getDb()

    const sql = `UPDATE subjects SET deletedAt = NULL WHERE id = ?`
    await db.run(sql, [id])
    await persistWeb()
  })
}

/**
 * Elimina permanentemente una materia (DELETE físico).
 */
export async function permanentlyDeleteSubjectRow(id) {
  return runWriteOperation('permanentlyDeleteSubjectRow', async () => {
    const db = getDb()

    const sql = `DELETE FROM subjects WHERE id = ?`
    await db.run(sql, [id])
    await persistWeb()
  })
}

/**
 * Vacía la papelera de materias (DELETE físico).
 */
export async function emptyTrashSubjects() {
  return runWriteOperation('emptyTrashSubjects', async () => {
    const db = getDb()

    const sql = `DELETE FROM subjects WHERE deletedAt IS NOT NULL`
    await db.run(sql)
    await persistWeb()
  })
}

/**
 * Soft-delete secciones hijas de una materia.
 * @param {string} parentId ID de la materia padre
 */
export async function softDeleteChildSubjects(parentId) {
  return runWriteOperation('softDeleteChildSubjects', async () => {
    const db = getDb()
    const now = new Date().toISOString()

    const sql = `UPDATE subjects SET deletedAt = ? WHERE parentSubjectId = ? AND deletedAt IS NULL`
    await db.run(sql, [now, parentId])
    await persistWeb()
  })
}

/**
 * Restaura secciones hijas de una materia.
 * @param {string} parentId ID de la materia padre
 */
export async function restoreChildSubjects(parentId) {
  return runWriteOperation('restoreChildSubjects', async () => {
    const db = getDb()

    const sql = `UPDATE subjects SET deletedAt = NULL WHERE parentSubjectId = ? AND deletedAt IS NOT NULL`
    await db.run(sql, [parentId])
    await persistWeb()
  })
}

/**
 * Purga materias eliminadas hace más de N días.
 * @param {number} days Días de retención (default: 30)
 */
export async function purgeOldDeletedSubjects(days = 30) {
  return runWriteOperation('purgeOldDeletedSubjects', async () => {
    const db = getDb()

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffISO = cutoff.toISOString()

    const sql = `DELETE FROM subjects WHERE deletedAt IS NOT NULL AND deletedAt < ?`
    await db.run(sql, [cutoffISO])
    await persistWeb()
  })
}

/**
 * Cuenta el total de items en papelera (notas + materias).
 */
export async function countTrashItems() {
  const db = getDb()

  const notesRes = await db.query(`SELECT COUNT(*) as count FROM notes WHERE deletedAt IS NOT NULL`)
  const subjectsRes = await db.query(`SELECT COUNT(*) as count FROM subjects WHERE deletedAt IS NOT NULL`)

  const notesCount = (notesRes.values && notesRes.values.length > 0) ? notesRes.values[0].count : 0
  const subjectsCount = (subjectsRes.values && subjectsRes.values.length > 0) ? subjectsRes.values[0].count : 0

  return notesCount + subjectsCount
}

/**
 * Obtiene los IDs de las secciones hijas de una materia (incluye eliminadas).
 * @param {string} parentId ID de la materia padre
 * @returns {string[]} IDs de secciones hijas
 */
export async function getChildSubjectIds(parentId) {
  const db = getDb()

  const sql = `SELECT id FROM subjects WHERE parentSubjectId = ?`
  const res = await db.query(sql, [parentId])

  return (res.values || []).map(row => row.id)
}

/**
 * Cuenta notas eliminadas de un subject específico (para preview en papelera).
 * @param {string} subjectId ID de la materia
 */
export async function countDeletedNotesBySubject(subjectId) {
  const db = getDb()

  const sql = `SELECT COUNT(*) as count FROM notes WHERE subjectId = ? AND deletedAt IS NOT NULL`
  const res = await db.query(sql, [subjectId])

  return (res.values && res.values.length > 0) ? res.values[0].count : 0
}
