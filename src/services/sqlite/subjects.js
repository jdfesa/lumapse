// =============================================================
// sqlite/subjects — Operaciones CRUD de materias
// Paso 9: Categorización por materia (DP-002 / DP-004)
//
// Responsabilidad: Crear, leer, actualizar, eliminar y contar
// filas en la tabla `subjects` de SQLite.
// La validación de negocio la hace SubjectService.
// =============================================================

import { getDb, persistWeb } from './connection.js'

/**
 * Inserta una materia en la base de datos.
 * La validación de negocio (nombre, unicidad, profundidad) la hace SubjectService.
 * @param {object} subject Objeto con id, name, color, parentSubjectId, createdAt
 */
export async function createSubjectRow(subject) {
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
}

/**
 * Obtiene todas las materias no archivadas, ordenadas por nombre.
 */
export async function getAllSubjectRows() {
  const db = getDb()

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
}

/**
 * Elimina una materia por ID. Las notas quedan con subjectId = NULL (FK ON DELETE SET NULL).
 */
export async function deleteSubjectRow(id) {
  const db = getDb()

  const sql = `DELETE FROM subjects WHERE id = ?`
  await db.run(sql, [id])
  await persistWeb()
}

/**
 * Cuenta las notas no archivadas asignadas a una materia específica.
 * @param {string} subjectId ID de la materia
 */
export async function countNotesBySubject(subjectId) {
  const db = getDb()

  const sql = `SELECT COUNT(*) as count FROM notes WHERE subjectId = ? AND archived = 0`
  const res = await db.query(sql, [subjectId])

  return (res.values && res.values.length > 0) ? res.values[0].count : 0
}

/**
 * Cuenta las notas no archivadas sin materia asignada (Entrada/Inbox).
 */
export async function getInboxCount() {
  const db = getDb()

  const sql = `SELECT COUNT(*) as count FROM notes WHERE subjectId IS NULL AND archived = 0`
  const res = await db.query(sql)

  return (res.values && res.values.length > 0) ? res.values[0].count : 0
}
