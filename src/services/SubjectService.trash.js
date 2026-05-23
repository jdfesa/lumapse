// =============================================================
// SubjectService.trash — Operaciones de papelera de materias
// Extraído de SubjectService.js para reducir LOC.
// =============================================================

import {
  getSubjectRowById,
  updateSubjectRow,
  deleteSubjectRow,
  getDeletedSubjectRows,
  restoreSubjectRow,
  softDeleteChildSubjects,
  restoreChildSubjects,
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

/**
 * Elimina una materia (soft-delete en cascada).
 * Envía a la papelera: la materia, sus secciones hijas y todas las notas.
 * @param {string} id ID de la materia
 */
export async function deleteSubject(id) {
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
}

/**
 * Elimina una sección individual (soft-delete + sus notas).
 * La materia padre NO se elimina.
 * @param {string} id ID de la sección
 */
export async function deleteSection(id) {
  // 1. Soft-delete de notas de esta sección
  await softDeleteNotesBySubject(id)

  // 2. Soft-delete de la sección
  await deleteSubjectRow(id)
}

/**
 * Restaura una materia completa desde la papelera (cascada).
 * Restaura: la materia, sus secciones hijas y todas las notas.
 * @param {string} id ID de la materia
 */
export async function restoreSubject(id) {
  // 1. Restaurar la materia
  await restoreSubjectRow(id)

  // 2. Obtener secciones hijas (están eliminadas)
  const childIds = await getChildSubjectIds(id)

  // 3. Restaurar secciones hijas
  await restoreChildSubjects(id)

  // 4. Restaurar notas del subject padre
  await restoreNotesBySubject(id)

  // 5. Restaurar notas de cada sección hija
  for (const childId of childIds) {
    await restoreNotesBySubject(childId)
  }
}

/**
 * Restaura una sección individual (+ sus notas).
 * Si la materia padre sigue eliminada, la sección va a Entrada (pierde parentSubjectId).
 * @param {string} id ID de la sección
 */
export async function restoreSection(id) {
  const section = await getSubjectRowById(id)
  if (!section) return

  // Verificar si el padre sigue existiendo (no eliminado)
  if (section.parentSubjectId) {
    const parent = await getSubjectRowById(section.parentSubjectId)
    if (!parent || parent.deletedAt) {
      // Padre eliminado: la sección se restaura como materia raíz
      await updateSubjectRow(id, { parentSubjectId: null })
    }
  }

  // Restaurar la sección
  await restoreSubjectRow(id)

  // Restaurar sus notas
  await restoreNotesBySubject(id)
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

  // Separar raíces y secciones eliminadas
  const roots = deletedSubjects.filter(s => !s.parentSubjectId)
  const sections = deletedSubjects.filter(s => s.parentSubjectId)

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
  const deletedSubjectIds = new Set(deletedSubjects.map(s => s.id))
  const looseNotes = deletedNotes.filter(n =>
    !n.subjectId || !deletedSubjectIds.has(n.subjectId)
  )

  // Secciones huérfanas (su padre no está eliminado)
  const orphanSections = sections.filter(s =>
    !roots.some(r => r.id === s.parentSubjectId)
  )

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
