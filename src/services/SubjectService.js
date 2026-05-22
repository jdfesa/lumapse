// =============================================================
// SubjectService — Lógica de negocio para Materias
// Paso 9: Categorización por materia (DP-002 / DP-004)
//
// Responsabilidad: CRUD de materias con validación de negocio.
// Reglas DP-004:
//   - Nombre requerido y no vacío
//   - Nombre único por nivel (dos materias raíz no pueden
//     llamarse igual; dos secciones dentro del mismo padre tampoco)
//   - Profundidad máxima: 2 niveles (Materia → Sección)
//
// Depende de SqliteService para persistencia.
// =============================================================

import {
  createSubjectRow,
  getAllSubjectRows,
  getSubjectRowById,
  updateSubjectRow,
  deleteSubjectRow,
  countNotesBySubject,
  getInboxCount,
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

// --- Paleta de colores predefinidos (estilo Notion) ---
// 8 colores armoniosos, aptos para dark/light mode
export const SUBJECT_COLORS = [
  '#818cf8', // Indigo (accent default)
  '#f87171', // Rojo suave
  '#fb923c', // Naranja
  '#fbbf24', // Amarillo
  '#34d399', // Verde
  '#22d3ee', // Cyan
  '#a78bfa', // Violeta
  '#f472b6', // Rosa
]

// --- Helper UUID ---
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// --- Validaciones de negocio (DP-004) ---

/**
 * Valida que el nombre no esté vacío.
 * @param {string} name Nombre de la materia
 * @throws {Error} Si el nombre está vacío o es solo espacios
 */
function validateNameRequired(name) {
  if (!name || !name.trim()) {
    throw new Error('El nombre de la materia es obligatorio.')
  }
}

/**
 * Valida que no exista otra materia con el mismo nombre en el mismo nivel.
 * Nivel se define por parentSubjectId: null = raíz, un ID = mismo padre.
 * @param {string} name Nombre a validar
 * @param {string|null} parentSubjectId Padre (null = raíz)
 * @param {string|null} excludeId ID a excluir (para edición)
 * @param {object[]} allSubjects Lista completa de materias
 * @throws {Error} Si ya existe una materia con ese nombre en ese nivel
 */
function validateNameUnique(name, parentSubjectId, excludeId, allSubjects) {
  const normalized = name.trim().toLowerCase()
  const duplicate = allSubjects.find(s =>
    s.id !== excludeId &&
    s.name.trim().toLowerCase() === normalized &&
    (s.parentSubjectId || null) === (parentSubjectId || null)
  )
  if (duplicate) {
    const level = parentSubjectId ? 'sección' : 'materia'
    throw new Error(`Ya existe una ${level} con el nombre "${name.trim()}".`)
  }
}

/**
 * Valida que la profundidad no exceda 2 niveles (DP-004).
 * Nivel 1 = materia raíz (parentSubjectId = null)
 * Nivel 2 = sección (parentSubjectId = ID de materia raíz)
 * No se permite nivel 3+ (sección de sección).
 * @param {string|null} parentSubjectId Padre propuesto
 * @param {object[]} allSubjects Lista completa de materias
 * @throws {Error} Si el padre ya es una sección (nivel 2)
 */
function validateMaxDepth(parentSubjectId, allSubjects) {
  if (!parentSubjectId) return // Nivel 1, siempre válido

  const parent = allSubjects.find(s => s.id === parentSubjectId)
  if (!parent) {
    throw new Error('La materia padre no existe.')
  }
  if (parent.parentSubjectId) {
    throw new Error('No se pueden crear más de 2 niveles de profundidad (Materia → Sección).')
  }
}

// --- Operaciones CRUD ---

/**
 * Crea una nueva materia o sección.
 * @param {string} name Nombre de la materia
 * @param {string|null} color Color hex (de SUBJECT_COLORS) o null para usar el primero
 * @param {string|null} parentSubjectId ID del padre (null = materia raíz)
 * @returns {object} La materia creada
 */
export async function createSubject(name, color = null, parentSubjectId = null) {
  validateNameRequired(name)

  const allSubjects = await getAllSubjectRows()

  validateNameUnique(name, parentSubjectId, null, allSubjects)
  validateMaxDepth(parentSubjectId, allSubjects)

  const subject = {
    id: generateUUID(),
    name: name.trim(),
    parentSubjectId: parentSubjectId || null,
    archived: false,
    color: color || SUBJECT_COLORS[0],
    createdAt: new Date().toISOString()
  }

  await createSubjectRow(subject)
  return subject
}

/**
 * Obtiene todas las materias no archivadas.
 * @returns {object[]} Lista plana de materias
 */
export async function getAllSubjects() {
  return await getAllSubjectRows()
}

/**
 * Obtiene una materia por su ID.
 * @param {string} id ID de la materia
 * @returns {object|undefined}
 */
export async function getSubjectById(id) {
  return await getSubjectRowById(id)
}

/**
 * Actualiza una materia existente.
 * Revalida nombre único si cambia el nombre.
 * @param {string} id ID de la materia
 * @param {object} changes Campos a actualizar (name, color, parentSubjectId)
 */
export async function updateSubject(id, changes) {
  const existing = await getSubjectRowById(id)
  if (!existing) {
    throw new Error(`Materia con id "${id}" no encontrada.`)
  }

  if (changes.name !== undefined) {
    validateNameRequired(changes.name)
    const allSubjects = await getAllSubjectRows()
    const parentId = changes.parentSubjectId !== undefined
      ? changes.parentSubjectId
      : existing.parentSubjectId
    validateNameUnique(changes.name, parentId, id, allSubjects)
    changes.name = changes.name.trim()
  }

  if (changes.parentSubjectId !== undefined) {
    const allSubjects = await getAllSubjectRows()
    validateMaxDepth(changes.parentSubjectId, allSubjects)
  }

  await updateSubjectRow(id, changes)
}

/**
 * Archiva una materia (soft-delete).
 * Las notas asociadas NO se archivan, solo pierden el filtro visual.
 * @param {string} id ID de la materia
 */
export async function archiveSubject(id) {
  await updateSubjectRow(id, { archived: true })
}

/**
 * Restaura una materia archivada.
 * @param {string} id ID de la materia
 */
export async function unarchiveSubject(id) {
  await updateSubjectRow(id, { archived: false })
}

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

/**
 * Retorna las materias organizadas como árbol (padres con hijos).
 * Incluye conteo de notas por materia y conteo de Entrada (inbox).
 *
 * Estructura retornada:
 * {
 *   inboxCount: number,
 *   tree: [
 *     { ...subject, noteCount: number, children: [{ ...child, noteCount }] }
 *   ]
 * }
 */
export async function getSubjectTree() {
  const allSubjects = await getAllSubjectRows()
  const inboxCount = await getInboxCount()

  // Separar raíces y secciones
  const roots = allSubjects.filter(s => !s.parentSubjectId)
  const children = allSubjects.filter(s => s.parentSubjectId)

  // Construir árbol con conteos
  const tree = []
  for (const root of roots) {
    const rootCount = await countNotesBySubject(root.id)
    const rootChildren = []

    for (const child of children.filter(c => c.parentSubjectId === root.id)) {
      const childCount = await countNotesBySubject(child.id)
      rootChildren.push({ ...child, noteCount: childCount })
    }

    tree.push({
      ...root,
      noteCount: rootCount,
      children: rootChildren
    })
  }

  return { inboxCount, tree }
}

