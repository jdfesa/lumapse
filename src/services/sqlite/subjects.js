// =============================================================
// sqlite/subjects — Operaciones CRUD de materias
// Paso 9: Categorización por materia (DP-002 / DP-004)
//
// Responsabilidad: Crear, leer, actualizar, eliminar y contar
// filas en la tabla `subjects` de SQLite.
// La validación de negocio la hace SubjectService.
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


/**
 * Inserta una materia en la base de datos.
 * La validación de negocio (nombre, unicidad, profundidad) la hace SubjectService.
 * @param {object} subject Objeto con id, name, color, parentSubjectId, createdAt
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function createSubjectRow(subject, scope) {
  return runWriteOperation('createSubjectRow', async () => {
    const db = getDb(scope)

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
  })
}

/**
 * Obtiene todas las materias no archivadas, ordenadas por nombre.
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function getAllSubjectRows(scope) {
  const db = getDb(scope)

  const sql = `SELECT * FROM subjects WHERE archived = 0 AND deletedAt IS NULL ORDER BY name ASC`
  const res = await db.query(sql)

  return (res.values || []).map(row => ({
    ...row,
    archived: row.archived === 1
  }))
}

/**
 * Obtiene todas las materias no eliminadas, incluyendo archivadas.
 * Usado por validaciones para evitar duplicados invisibles.
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function getAllSubjectRowsIncludingArchived(scope) {
  const db = getDb(scope)

  const sql = `SELECT * FROM subjects WHERE deletedAt IS NULL ORDER BY name ASC`
  const res = await db.query(sql)

  return (res.values || []).map(row => ({
    ...row,
    archived: row.archived === 1
  }))
}

/**
 * Obtiene una materia por su ID.
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function getSubjectRowById(id, scope) {
  const db = getDb(scope)

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
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function updateSubjectRow(id, changes, scope) {
  return runWriteOperation('updateSubjectRow', async () => {
    const db = getDb(scope)

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
  })
}

/**
 * Soft-delete: marca una materia como eliminada (papelera).
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function deleteSubjectRow(id, scope) {
  return runWriteOperation('deleteSubjectRow', async () => {
    const db = getDb(scope)

    const sql = `UPDATE subjects SET deletedAt = ? WHERE id = ?`
    await db.run(sql, [new Date().toISOString(), id])
  })
}

/**
 * Cuenta las notas activas (no archivadas, no eliminadas) de una materia.
 * @param {string} subjectId ID de la materia
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function countNotesBySubject(subjectId, scope) {
  const db = getDb(scope)

  const sql = `SELECT COUNT(*) as count FROM notes WHERE subjectId = ? AND archived = 0 AND deletedAt IS NULL`
  const res = await db.query(sql, [subjectId])

  return (res.values && res.values.length > 0) ? res.values[0].count : 0
}

/**
 * Cuenta las notas activas sin materia asignada (Entrada/Inbox).
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function getInboxCount(scope) {
  const db = getDb(scope)

  const sql = `SELECT COUNT(*) as count FROM notes WHERE subjectId IS NULL AND archived = 0 AND deletedAt IS NULL`
  const res = await db.query(sql)

  return (res.values && res.values.length > 0) ? res.values[0].count : 0
}

/**
 * Obtiene los IDs de todos los subjects archivados (no eliminados).
 * Usado por noteFilters para saber qué notas ocultar/mostrar por herencia.
 * @returns {string[]} IDs de subjects archivados
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function getArchivedSubjectIds(scope) {
  const db = getDb(scope)

  const sql = `SELECT id FROM subjects WHERE archived = 1 AND deletedAt IS NULL`
  const res = await db.query(sql)

  return (res.values || []).map(row => row.id)
}

/**
 * Cuenta notas de un subject (incluyendo notas archivadas, excluyendo eliminadas).
 * Se usa para el conteo en la vista de materias archivadas.
 * @param {string} subjectId ID de la materia/sección
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function countNotesBySubjectIncludingArchived(subjectId, scope) {
  const db = getDb(scope)

  const sql = `SELECT COUNT(*) as count FROM notes WHERE subjectId = ? AND deletedAt IS NULL`
  const res = await db.query(sql, [subjectId])

  return (res.values && res.values.length > 0) ? res.values[0].count : 0
}

/**
 * Obtiene materias archivadas como árbol (para mostrar en drawer/vista archivadas).
 * Incluye materias activas como contenedor cuando tienen secciones archivadas.
 * @returns {{ tree: object[] }}
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function getArchivedSubjectTree(scope) {
  const db = getDb(scope)

  const sql = `SELECT * FROM subjects WHERE deletedAt IS NULL ORDER BY name ASC`
  const res = await db.query(sql)

  const all = (res.values || []).map(row => ({
    ...row,
    archived: row.archived === 1
  }))
  const roots = all.filter(s => !s.parentSubjectId)
  const archivedChildren = all.filter(s => s.parentSubjectId && s.archived)

  const tree = []
  for (const root of roots) {
    const rootChildren = archivedChildren.filter(c => c.parentSubjectId === root.id)
    if (!root.archived && rootChildren.length === 0) continue

    const rootCount = await countNotesBySubjectIncludingArchived(root.id, scope)
    const childrenWithCounts = []

    for (const child of rootChildren) {
      const childCount = await countNotesBySubjectIncludingArchived(child.id, scope)
      childrenWithCounts.push({ ...child, noteCount: childCount })
    }

    tree.push({
      ...root,
      noteCount: rootCount,
      children: childrenWithCounts
    })
  }

  return { tree }
}

// --- Operaciones de Papelera ---

/**
 * Obtiene materias/secciones eliminadas.
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function getDeletedSubjectRows(scope) {
  const db = getDb(scope)

  const sql = `SELECT * FROM subjects WHERE deletedAt IS NOT NULL ORDER BY deletedAt DESC`
  const res = await db.query(sql)

  return (res.values || []).map(row => ({
    ...row,
    archived: row.archived === 1
  }))
}

/**
 * Restaura una materia eliminada (quita deletedAt).
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function restoreSubjectRow(id, scope) {
  return runWriteOperation('restoreSubjectRow', async () => {
    const db = getDb(scope)

    const sql = `UPDATE subjects SET deletedAt = NULL WHERE id = ?`
    await db.run(sql, [id])
  })
}

/**
 * Elimina permanentemente una materia (DELETE físico).
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function permanentlyDeleteSubjectRow(id, scope) {
  return runWriteOperation('permanentlyDeleteSubjectRow', async () => {
    const db = getDb(scope)

    const sql = `DELETE FROM subjects WHERE id = ?`
    await db.run(sql, [id])
  })
}

/**
 * Vacía la papelera de materias (DELETE físico).
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function emptyTrashSubjects(scope) {
  return runWriteOperation('emptyTrashSubjects', async () => {
    const db = getDb(scope)

    const sql = `DELETE FROM subjects WHERE deletedAt IS NOT NULL`
    await db.run(sql)
  })
}

/**
 * Soft-delete secciones hijas de una materia.
 * @param {string} parentId ID de la materia padre
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function softDeleteChildSubjects(parentId, scope) {
  return runWriteOperation('softDeleteChildSubjects', async () => {
    const db = getDb(scope)
    const now = new Date().toISOString()

    const sql = `UPDATE subjects SET deletedAt = ? WHERE parentSubjectId = ? AND deletedAt IS NULL`
    await db.run(sql, [now, parentId])
  })
}

/**
 * Restaura secciones hijas de una materia.
 * @param {string} parentId ID de la materia padre
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function restoreChildSubjects(parentId, scope) {
  return runWriteOperation('restoreChildSubjects', async () => {
    const db = getDb(scope)

    const sql = `UPDATE subjects SET deletedAt = NULL WHERE parentSubjectId = ? AND deletedAt IS NOT NULL`
    await db.run(sql, [parentId])
  })
}

/**
 * Archiva secciones hijas de una materia (cascada).
 * Solo archiva las que NO están archivadas y NO están eliminadas.
 * @param {string} parentId ID de la materia padre
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function archiveChildSubjects(parentId, scope) {
  return runWriteOperation('archiveChildSubjects', async () => {
    const db = getDb(scope)
    const sql = `UPDATE subjects SET archived = 1 WHERE parentSubjectId = ? AND archived = 0 AND deletedAt IS NULL`
    await db.run(sql, [parentId])
  })
}

/**
 * Desarchiva secciones hijas de una materia (cascada).
 * Solo desarchiva las que están archivadas y NO están eliminadas.
 * @param {string} parentId ID de la materia padre
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function unarchiveChildSubjects(parentId, scope) {
  return runWriteOperation('unarchiveChildSubjects', async () => {
    const db = getDb(scope)
    const sql = `UPDATE subjects SET archived = 0 WHERE parentSubjectId = ? AND archived = 1 AND deletedAt IS NULL`
    await db.run(sql, [parentId])
  })
}

/**
 * Purga materias eliminadas hace más de N días.
 * @param {number} days Días de retención (default: 30)
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function purgeOldDeletedSubjects(days = 30, scope) {
  return runWriteOperation('purgeOldDeletedSubjects', async () => {
    const db = getDb(scope)

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffISO = cutoff.toISOString()

    const sql = `DELETE FROM subjects WHERE deletedAt IS NOT NULL AND deletedAt < ?`
    await db.run(sql, [cutoffISO])
  })
}

/**
 * Cuenta el total de items en papelera (notas + materias).
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function countTrashItems(scope) {
  const db = getDb(scope)

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
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function getChildSubjectIds(parentId, scope) {
  const db = getDb(scope)

  const sql = `SELECT id FROM subjects WHERE parentSubjectId = ?`
  const res = await db.query(sql, [parentId])

  return (res.values || []).map(row => row.id)
}

/**
 * Cuenta notas eliminadas de un subject específico (para preview en papelera).
 * @param {string} subjectId ID de la materia
 * @param {object} [scope] Propietario explícito para composición transaccional.
 */
export async function countDeletedNotesBySubject(subjectId, scope) {
  const db = getDb(scope)

  const sql = `SELECT COUNT(*) as count FROM notes WHERE subjectId = ? AND deletedAt IS NOT NULL`
  const res = await db.query(sql, [subjectId])

  return (res.values && res.values.length > 0) ? res.values[0].count : 0
}
