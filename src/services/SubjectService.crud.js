// =============================================================
// SubjectService.crud — CRUD de materias y árbol de navegación
// Extraído de SubjectService.js para reducir LOC.
// =============================================================

import {
  createSubjectRow,
  getAllSubjectRows,
  getSubjectRowById,
  updateSubjectRow,
  countNotesBySubject,
  getInboxCount
} from './sqlite/subjects.js'
import { generateUUID, validateNameRequired, validateNameUnique, validateMaxDepth } from './SubjectService.validation.js'

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
