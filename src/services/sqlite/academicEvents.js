// =============================================================
// sqlite/academicEvents — CRUD bajo nivel de fechas academicas
// Fase 1: Fechas academicas discretas (DP-007)
//
// Responsabilidad: Persistir y consultar filas de `academic_events`.
// La validacion de negocio la hace AcademicEventService.
// =============================================================

import { getDb } from './connection.js'
import { DatabaseError } from './errors.js'

async function runWriteOperation(operation, action) {
  try {
    return await action()
  } catch (error) {
    console.error(`[SQLite] Error en ${operation}:`, error)
    throw new DatabaseError(operation, error)
  }
}


function normalizeNullable(value) {
  return value || null
}

function rowsFrom(result) {
  return result.values || []
}

function monthRange(year, month) {
  const start = new Date(Date.UTC(year, month - 1, 1))
  const end = new Date(Date.UTC(year, month, 1))

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

/**
 * Inserta una fecha academica.
 * @param {object} event Objeto con id, type, title, date, subjectId, createdAt, updatedAt
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function createAcademicEventRow(event, scope) {
  return runWriteOperation('createAcademicEventRow', async () => {
    const db = getDb(scope)

    const sql = `
      INSERT INTO academic_events (id, type, title, date, subjectId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    const values = [
      event.id,
      event.type,
      normalizeNullable(event.title),
      event.date,
      normalizeNullable(event.subjectId),
      event.createdAt,
      event.updatedAt,
    ]

    await db.run(sql, values)
  })
}

/**
 * Obtiene todas las fechas academicas ordenadas cronologicamente.
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function getAcademicEventRows(scope) {
  const db = getDb(scope)
  const sql = `SELECT * FROM academic_events ORDER BY date ASC, createdAt ASC`
  const res = await db.query(sql)

  return rowsFrom(res)
}

/**
 * Obtiene una fecha academica por su ID.
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function getAcademicEventRowById(id, scope) {
  const db = getDb(scope)
  const sql = `SELECT * FROM academic_events WHERE id = ?`
  const res = await db.query(sql, [id])

  return rowsFrom(res)[0]
}

/**
 * Obtiene las fechas academicas de un mes. El mes usa base 1: enero = 1.
 * @param {number} year Año completo, por ejemplo 2026
 * @param {number} month Mes base 1, por ejemplo 6 para junio
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function getAcademicEventRowsByMonth(year, month, scope) {
  const db = getDb(scope)
  const { start, end } = monthRange(year, month)

  const sql = `
    SELECT * FROM academic_events
    WHERE date >= ? AND date < ?
    ORDER BY date ASC, createdAt ASC
  `
  const res = await db.query(sql, [start, end])

  return rowsFrom(res)
}

/**
 * Obtiene las fechas academicas de un dia especifico (`YYYY-MM-DD`).
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function getAcademicEventRowsByDate(date, scope) {
  const db = getDb(scope)

  const sql = `
    SELECT * FROM academic_events
    WHERE date = ?
    ORDER BY createdAt ASC
  `
  const res = await db.query(sql, [date])

  return rowsFrom(res)
}

/**
 * Obtiene proximas fechas academicas desde `today` inclusive.
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function getUpcomingAcademicEventRows(today, limit = 5, scope) {
  const db = getDb(scope)

  const sql = `
    SELECT * FROM academic_events
    WHERE date >= ?
    ORDER BY date ASC, createdAt ASC
    LIMIT ?
  `
  const res = await db.query(sql, [today, limit])

  return rowsFrom(res)
}

/**
 * Actualiza campos de una fecha academica existente.
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function updateAcademicEventRow(id, changes, scope) {
  return runWriteOperation('updateAcademicEventRow', async () => {
    const db = getDb(scope)
    const fields = []
    const values = []

    if (changes.type !== undefined) {
      fields.push('type = ?')
      values.push(changes.type)
    }
    if (changes.title !== undefined) {
      fields.push('title = ?')
      values.push(normalizeNullable(changes.title))
    }
    if (changes.date !== undefined) {
      fields.push('date = ?')
      values.push(changes.date)
    }
    if (changes.subjectId !== undefined) {
      fields.push('subjectId = ?')
      values.push(normalizeNullable(changes.subjectId))
    }
    if (changes.updatedAt !== undefined) {
      fields.push('updatedAt = ?')
      values.push(changes.updatedAt)
    }

    if (fields.length === 0) return

    values.push(id)
    const sql = `UPDATE academic_events SET ${fields.join(', ')} WHERE id = ?`
    await db.run(sql, values)
  })
}

/**
 * Elimina fisicamente una fecha academica.
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function deleteAcademicEventRow(id, scope) {
  return runWriteOperation('deleteAcademicEventRow', async () => {
    const db = getDb(scope)
    const sql = `DELETE FROM academic_events WHERE id = ?`

    await db.run(sql, [id])
  })
}
