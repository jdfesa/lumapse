// =============================================================
// SubjectService.trash — Operaciones de papelera de materias
// Extraído de SubjectService.js para reducir LOC.
// =============================================================

import {
  getSubjectRowById,
  getAllSubjectRowsIncludingArchived,
  updateSubjectRow,
  deleteSubjectRow,
  getDeletedSubjectRows,
  restoreSubjectRow,
  softDeleteChildSubjects,
  purgeOldDeletedSubjects,
  emptyTrashSubjects,
  countTrashItems,
  getChildSubjectIds,
  countDeletedNotesBySubject
} from './sqlite/subjects.js'
import {
  softDeleteNotesBySubject,
  restoreNotesBySubject,
  getDeletedNotes,
  purgeOldDeletedNotes,
  emptyTrashNotes,
  restoreNote as restoreNoteRow
} from './sqlite/notes.js'
import { runTransaction } from './sqlite/connection.js'

function getUniqueNameForLevel(name, parentSubjectId, excludeId, allSubjects) {
  const baseName = name.trim()
  const parentId = parentSubjectId || null
  const usedNames = new Set(
    allSubjects
      .filter(s => s.id !== excludeId && (s.parentSubjectId || null) === parentId)
      .map(s => s.name.trim().toLowerCase())
  )

  if (!usedNames.has(baseName.toLowerCase())) return baseName

  let suffix = 1
  let candidate = `${baseName} (restaurada)`
  while (usedNames.has(candidate.toLowerCase())) {
    suffix += 1
    candidate = `${baseName} (restaurada ${suffix})`
  }
  return candidate
}

async function restoreSubjectRowWithUniqueName(subject, parentSubjectId, allSubjects) {
  const targetParentId = parentSubjectId || null
  const uniqueName = getUniqueNameForLevel(subject.name, targetParentId, subject.id, allSubjects)
  const changes = {}

  if (uniqueName !== subject.name.trim()) {
    changes.name = uniqueName
  }
  if ((subject.parentSubjectId || null) !== targetParentId) {
    changes.parentSubjectId = targetParentId
  }
  if (subject.archived) {
    changes.archived = false
  }

  if (Object.keys(changes).length > 0) {
    await updateSubjectRow(subject.id, changes)
  }
  await restoreSubjectRow(subject.id)

  const restoredSubject = {
    ...subject,
    ...changes,
    parentSubjectId: targetParentId,
    name: uniqueName,
    archived: changes.archived ?? subject.archived,
    deletedAt: null
  }

  return [
    ...allSubjects.filter(s => s.id !== subject.id),
    restoredSubject
  ]
}

/**
 * Elimina una materia (soft-delete en cascada).
 * Envía a la papelera: la materia, sus secciones hijas y todas las notas.
 * @param {string} id ID de la materia
 */
export async function deleteSubject(id) {
  return runTransaction(async () => {
    // 1. Obtener secciones hijas para eliminar sus notas también
    const childIds = await getChildSubjectIds(id)

    // 2. Soft-delete de notas del subject padre
    await softDeleteNotesBySubject(id)

    // 3. Soft-delete de notas de cada sección hija
    for (const childId of childIds) {
      await softDeleteNotesBySubject(childId)
    }

    // 4. Soft-delete de secciones hijas
    await softDeleteChildSubjects(id)

    // 5. Soft-delete del subject padre
    await deleteSubjectRow(id)
  })
}

/**
 * Elimina una sección individual (soft-delete + sus notas).
 * La materia padre NO se elimina.
 * @param {string} id ID de la sección
 */
export async function deleteSection(id) {
  return runTransaction(async () => {
    // 1. Soft-delete de notas de esta sección
    await softDeleteNotesBySubject(id)

    // 2. Soft-delete de la sección
    await deleteSubjectRow(id)
  })
}

/**
 * Restaura una materia completa desde la papelera (cascada).
 * Restaura: la materia, sus secciones hijas y todas las notas.
 * @param {string} id ID de la materia
 */
export async function restoreSubject(id) {
  return runTransaction(async () => {
    const subject = await getSubjectRowById(id)
    if (!subject) return

    let allSubjects = await getAllSubjectRowsIncludingArchived()
    const deletedSubjects = await getDeletedSubjectRows()
    const childSubjects = deletedSubjects.filter(child => child.parentSubjectId === id)

    // 1. Restaurar la materia con un nombre navegable único.
    allSubjects = await restoreSubjectRowWithUniqueName(subject, null, allSubjects)

    // 2. Restaurar secciones hijas una por una para resolver duplicados previos.
    for (const child of childSubjects) {
      allSubjects = await restoreSubjectRowWithUniqueName(child, id, allSubjects)
    }

    // 3. Restaurar notas del subject padre
    await restoreNotesBySubject(id)

    // 4. Restaurar notas de cada sección hija
    for (const child of childSubjects) {
      await restoreNotesBySubject(child.id)
    }
  })
}

/**
 * Restaura una sección individual (+ sus notas).
 * Si la materia padre sigue eliminada o archivada, restaura ese contenedor
 * para que la sección tenga una ruta navegable.
 * @param {string} id ID de la sección
 */
export async function restoreSection(id) {
  return runTransaction(async () => {
    const section = await getSubjectRowById(id)
    if (!section) return

    let allSubjects = await getAllSubjectRowsIncludingArchived()
    let targetParentId = section.parentSubjectId || null

    // Verificar si el padre sigue existiendo como contenedor navegable.
    if (section.parentSubjectId) {
      const parent = await getSubjectRowById(section.parentSubjectId)
      if (!parent) {
        targetParentId = null
      } else if (parent.deletedAt) {
        allSubjects = await restoreSubjectRowWithUniqueName(parent, null, allSubjects)
      } else if (parent.archived) {
        allSubjects = await restoreSubjectRowWithUniqueName(parent, parent.parentSubjectId, allSubjects)
      }
    }

    // Restaurar la sección con nombre único en su nivel.
    await restoreSubjectRowWithUniqueName(section, targetParentId, allSubjects)

    // Restaurar sus notas
    await restoreNotesBySubject(id)
  })
}

/**
 * Restaura una nota individual desde la papelera.
 * Si su materia padre está eliminada, la nota cae en Entrada (subjectId = null).
 * @param {string} noteId ID de la nota
 */
export async function restoreNoteFromTrash(noteId) {
  // Primero necesitamos leer la nota para saber si su materia sigue viva
  const { getNoteById, updateNote } = await import('./sqlite/notes.js')
  const note = await getNoteById(noteId)
  if (!note) return

  // Restaurar la nota
  await restoreNoteRow(noteId)

  // Si tenía materia, verificar que siga activa
  if (note.subjectId) {
    const subject = await getSubjectRowById(note.subjectId)
    if (!subject || subject.deletedAt) {
      // Materia eliminada: la nota pierde su subject (va a Entrada)
      await updateNote(noteId, { subjectId: null })
    }
  }
}

/**
 * Obtiene los items en la papelera organizados para la vista.
 * @returns {object} { notes, subjects, totalCount }
 */
export async function getTrashItems() {
  const deletedNotes = await getDeletedNotes()
  const deletedSubjects = await getDeletedSubjectRows()
  const activeSubjects = await getAllSubjectRowsIncludingArchived()

  // Separar raíces y secciones eliminadas
  const roots = deletedSubjects.filter(s => !s.parentSubjectId)
  const sections = deletedSubjects.filter(s => s.parentSubjectId)
  const deletedSubjectIds = new Set(deletedSubjects.map(s => s.id))
  const activeSubjectsById = new Map(activeSubjects.map(subject => [subject.id, subject]))

  // Construir árbol con conteos
  const subjectTree = []
  for (const root of roots) {
    const rootNoteCount = await countDeletedNotesBySubject(root.id)
    const rootChildren = []

    for (const child of sections.filter(c => c.parentSubjectId === root.id)) {
      const childNoteCount = await countDeletedNotesBySubject(child.id)
      rootChildren.push({ ...child, noteCount: childNoteCount })
    }

    subjectTree.push({
      ...root,
      noteCount: rootNoteCount,
      children: rootChildren
    })
  }

  // Notas sueltas: eliminadas cuyo subject NO está eliminado (o sin subject)
  const looseNotes = deletedNotes.filter(n =>
    !n.subjectId || !deletedSubjectIds.has(n.subjectId)
  )

  // Secciones huérfanas (su padre no está eliminado)
  const orphanSections = []
  for (const section of sections.filter(s => !deletedSubjectIds.has(s.parentSubjectId))) {
    const parent = activeSubjectsById.get(section.parentSubjectId)
    const noteCount = await countDeletedNotesBySubject(section.id)
    orphanSections.push({
      ...section,
      parentName: parent?.name || 'Materia original no disponible',
      parentColor: parent?.color || section.color,
      noteCount
    })
  }

  const totalCount = await countTrashItems()

  return {
    notes: looseNotes,
    subjects: subjectTree,
    orphanSections,
    totalCount
  }
}

/**
 * Vacía toda la papelera (notas + materias). DELETE físico.
 */
export async function emptyTrash() {
  await emptyTrashNotes()
  await emptyTrashSubjects()
}

/**
 * Auto-purgado: elimina permanentemente items > 30 días en la papelera.
 * Se ejecuta al inicio de cada sesión.
 * @param {number} days Días de retención (default: 30)
 */
export async function autoPurge(days = 30) {
  await purgeOldDeletedNotes(days)
  await purgeOldDeletedSubjects(days)
}
