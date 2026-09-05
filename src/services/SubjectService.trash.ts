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
  getNoteById,
  purgeOldDeletedNotes,
  emptyTrashNotes,
  restoreNote as restoreNoteRow,
  updateNote
} from './sqlite/notes.js'
import { runTransaction } from './sqlite/connection.js'
import type { EntityId, HexColor } from '../domain/primitives'
import type { Note, NoteChanges } from '../domain/notes'
import type { Subject, SubjectChanges } from '../domain/subjects'

type SectionSubject = Subject & { parentSubjectId: EntityId }
type TrashSubjectSection = SectionSubject & { noteCount: number }
type TrashSubjectRoot = Subject & { noteCount: number, children: TrashSubjectSection[] }
type TrashOrphanSection = SectionSubject & {
  parentName: string
  parentColor: HexColor | null
  noteCount: number
}

export interface TrashItems {
  notes: Note[]
  subjects: TrashSubjectRoot[]
  orphanSections: TrashOrphanSection[]
  totalCount: number
}

function getUniqueNameForLevel(
  name: string,
  parentSubjectId: EntityId | null | undefined,
  excludeId: EntityId | null,
  allSubjects: Subject[]
): string {
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

async function restoreSubjectRowWithUniqueName(
  subject: Subject,
  parentSubjectId: EntityId | null,
  allSubjects: Subject[],
  scope: object
): Promise<Subject[]> {
  const targetParentId = parentSubjectId || null
  const uniqueName = getUniqueNameForLevel(subject.name, targetParentId, subject.id, allSubjects)
  const changes: SubjectChanges = {}

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
    await updateSubjectRow(subject.id, changes, scope)
  }
  await restoreSubjectRow(subject.id, scope)

  const restoredSubject: Subject = {
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
export async function deleteSubject(id: EntityId, parentScope?: object): Promise<void> {
  return runTransaction(async (scope) => {
    // 1. Obtener secciones hijas para eliminar sus notas también
    const childIds = (await getChildSubjectIds(id, scope)) as EntityId[]

    // 2. Soft-delete de notas del subject padre
    await softDeleteNotesBySubject(id, scope)

    // 3. Soft-delete de notas de cada sección hija
    for (const childId of childIds) {
      await softDeleteNotesBySubject(childId, scope)
    }

    // 4. Soft-delete de secciones hijas
    await softDeleteChildSubjects(id, scope)

    // 5. Soft-delete del subject padre
    await deleteSubjectRow(id, scope)
  }, parentScope)
}

/**
 * Elimina una sección individual (soft-delete + sus notas).
 * La materia padre NO se elimina.
 * @param {string} id ID de la sección
 */
export async function deleteSection(id: EntityId, parentScope?: object): Promise<void> {
  return runTransaction(async (scope) => {
    // 1. Soft-delete de notas de esta sección
    await softDeleteNotesBySubject(id, scope)

    // 2. Soft-delete de la sección
    await deleteSubjectRow(id, scope)
  }, parentScope)
}

/**
 * Restaura una materia completa desde la papelera (cascada).
 * Restaura: la materia, sus secciones hijas y todas las notas.
 * @param {string} id ID de la materia
 */
export async function restoreSubject(id: EntityId, parentScope?: object): Promise<void> {
  return runTransaction(async (scope) => {
    const subject = (await getSubjectRowById(id, scope)) as Subject | undefined
    if (!subject) return

    let allSubjects = (await getAllSubjectRowsIncludingArchived(scope)) as Subject[]
    const deletedSubjects = (await getDeletedSubjectRows(scope)) as Subject[]
    const childSubjects = deletedSubjects.filter(child => child.parentSubjectId === id)

    // 1. Restaurar la materia con un nombre navegable único.
    allSubjects = await restoreSubjectRowWithUniqueName(subject, null, allSubjects, scope)

    // 2. Restaurar secciones hijas una por una para resolver duplicados previos.
    for (const child of childSubjects) {
      allSubjects = await restoreSubjectRowWithUniqueName(child, id, allSubjects, scope)
    }

    // 3. Restaurar notas del subject padre
    await restoreNotesBySubject(id, scope)

    // 4. Restaurar notas de cada sección hija
    for (const child of childSubjects) {
      await restoreNotesBySubject(child.id, scope)
    }
  }, parentScope)
}

/**
 * Restaura una sección individual (+ sus notas).
 * Si la materia padre sigue eliminada o archivada, restaura ese contenedor
 * para que la sección tenga una ruta navegable.
 * @param {string} id ID de la sección
 */
export async function restoreSection(id: EntityId, parentScope?: object): Promise<void> {
  return runTransaction(async (scope) => {
    const section = (await getSubjectRowById(id, scope)) as Subject | undefined
    if (!section) return

    let allSubjects = (await getAllSubjectRowsIncludingArchived(scope)) as Subject[]
    let targetParentId: EntityId | null = section.parentSubjectId || null

    // Verificar si el padre sigue existiendo como contenedor navegable.
    if (section.parentSubjectId) {
      const parent = (await getSubjectRowById(section.parentSubjectId, scope)) as Subject | undefined
      if (!parent) {
        targetParentId = null
      } else if (parent.deletedAt) {
        allSubjects = await restoreSubjectRowWithUniqueName(parent, null, allSubjects, scope)
      } else if (parent.archived) {
        allSubjects = await restoreSubjectRowWithUniqueName(parent, parent.parentSubjectId, allSubjects, scope)
      }
    }

    // Restaurar la sección con nombre único en su nivel.
    await restoreSubjectRowWithUniqueName(section, targetParentId, allSubjects, scope)

    // Restaurar sus notas
    await restoreNotesBySubject(id, scope)
  }, parentScope)
}

/**
 * Restaura una nota individual desde la papelera.
 * Si su materia padre está eliminada, la nota cae en Entrada (subjectId = null).
 * @param {string} noteId ID de la nota
 */
export async function restoreNoteFromTrash(noteId: EntityId, parentScope?: object): Promise<void> {
  return runTransaction(async (scope) => {
    // Primero necesitamos leer la nota para saber si su materia sigue viva
    const note = (await getNoteById(noteId, scope)) as Note | undefined
    if (!note) return

    // Restaurar la nota
    await restoreNoteRow(noteId, scope)

    // Si tenía materia, verificar que siga activa
    if (note.subjectId) {
      const subject = (await getSubjectRowById(note.subjectId, scope)) as Subject | undefined
      if (!subject || subject.deletedAt) {
        // Materia eliminada: la nota pierde su subject (va a Entrada)
        const changes: NoteChanges = { subjectId: null }
        await updateNote(noteId, changes, scope)
      }
    }
  }, parentScope)
}

/**
 * Obtiene los items en la papelera organizados para la vista.
 * @returns {object} { notes, subjects, totalCount }
 */
export async function getTrashItems(): Promise<TrashItems> {
  const deletedNotes = (await getDeletedNotes()) as Note[]
  const deletedSubjects = (await getDeletedSubjectRows()) as Subject[]
  const activeSubjects = (await getAllSubjectRowsIncludingArchived()) as Subject[]

  // Separar raíces y secciones eliminadas
  const roots = deletedSubjects.filter(s => !s.parentSubjectId)
  const sections = deletedSubjects.filter((s): s is SectionSubject => Boolean(s.parentSubjectId))
  const deletedSubjectIds = new Set<EntityId>(deletedSubjects.map(s => s.id))
  const activeSubjectsById = new Map<EntityId, Subject>(
    activeSubjects.map((subject): [EntityId, Subject] => [subject.id, subject])
  )

  // Construir árbol con conteos
  const subjectTree: TrashSubjectRoot[] = []
  for (const root of roots) {
    const rootNoteCount = (await countDeletedNotesBySubject(root.id)) as number
    const rootChildren: TrashSubjectSection[] = []

    for (const child of sections.filter(c => c.parentSubjectId === root.id)) {
      const childNoteCount = (await countDeletedNotesBySubject(child.id)) as number
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
  const orphanSections: TrashOrphanSection[] = []
  for (const section of sections.filter(s => !deletedSubjectIds.has(s.parentSubjectId))) {
    const parent = activeSubjectsById.get(section.parentSubjectId)
    const noteCount = (await countDeletedNotesBySubject(section.id)) as number
    orphanSections.push({
      ...section,
      parentName: parent?.name || 'Materia original no disponible',
      parentColor: parent?.color || section.color,
      noteCount
    })
  }

  const totalCount = (await countTrashItems()) as number

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
export async function emptyTrash(parentScope?: object): Promise<void> {
  return runTransaction(async (scope) => {
    await emptyTrashNotes(scope)
    await emptyTrashSubjects(scope)
  }, parentScope)
}

/**
 * Auto-purgado: elimina permanentemente items > 30 días en la papelera.
 * Se ejecuta al inicio de cada sesión.
 * @param {number} days Días de retención (default: 30)
 */
export async function autoPurge(days = 30, parentScope?: object): Promise<void> {
  return runTransaction(async (scope) => {
    await purgeOldDeletedNotes(days, scope)
    await purgeOldDeletedSubjects(days, scope)
  }, parentScope)
}
