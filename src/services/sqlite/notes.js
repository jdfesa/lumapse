// =============================================================
// sqlite/notes — Operaciones CRUD de notas
// Hito 04: Organización y UX
//
// Responsabilidad: Crear, leer, actualizar, eliminar y contar
// notas en la tabla `notes` de SQLite.
// =============================================================

import { getDb, persistWeb, generateUUID } from './connection.js'

// --- Operaciones CRUD ---

/**
 * Crea una nueva nota en la base de datos.
 * @param {string} title Título de la nota
 * @param {string} content Contenido Markdown
 * @param {string|null} subjectId ID de materia asociada (null = Entrada)
 */
export async function createNote(title = 'Sin título', content = '', subjectId = null) {
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
  
  await db.run(sql, values)
  await persistWeb()

  return {
    ...note,
    pinned: false,
    archived: false,
    statusEmoji: null,
  }
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
  const db = getDb()

  const sql = `DELETE FROM notes WHERE id = ?`
  await db.run(sql, [id])
  await persistWeb()
}

/**
 * Cuenta el total de notas almacenadas.
 */
export async function countNotes() {
  const db = getDb()

  const sql = `SELECT COUNT(*) as count FROM notes`
  const res = await db.query(sql)

  if (res.values && res.values.length > 0) {
    return res.values[0].count
  }
  return 0
}
