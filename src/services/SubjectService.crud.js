// =============================================================
// SubjectService.crud — CRUD de materias y árbol de navegación
// Extraído de SubjectService.js para reducir LOC.
// =============================================================

import {
  createSubjectRow,
  getAllSubjectRows,
  getAllSubjectRowsIncludingArchived,
  getSubjectRowById,
  updateSubjectRow,
  countNotesBySubject,
  getInboxCount,
  archiveChildSubjects
} from './sqlite/subjects.js'
import { runTransaction } from './sqlite/connection.js'
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

async function updateArchiveStateWithUniqueName(subject, archived, allSubjects) {
  const uniqueName = getUniqueNameForLevel(subject.name, subject.parentSubjectId, subject.id, allSubjects)
  const changes = uniqueName === subject.name.trim()
    ? { archived }
    : { archived, name: uniqueName }

  await updateSubjectRow(subject.id, changes)

  return allSubjects.map(s => s.id === subject.id
    ? { ...s, name: uniqueName, archived }
    : s)
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

  const allSubjects = await getAllSubjectRowsIncludingArchived()

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
    const allSubjects = await getAllSubjectRowsIncludingArchived()
    const parentId = changes.parentSubjectId !== undefined
      ? changes.parentSubjectId
      : existing.parentSubjectId
    validateNameUnique(changes.name, parentId, id, allSubjects)
    changes.name = changes.name.trim()
  }

  if (changes.parentSubjectId !== undefined) {
    const allSubjects = await getAllSubjectRowsIncludingArchived()
    validateMaxDepth(changes.parentSubjectId, allSubjects)
    validateNameUnique(changes.name || existing.name, changes.parentSubjectId, id, allSubjects)
  }

  await updateSubjectRow(id, changes)
}

/**
 * Archiva una materia completa (cascada a secciones, NO a notas).
 * Las notas se ocultan implícitamente porque su subject sale del árbol activo.
 * Orden: secciones hijas -> padre.
 * @param {string} id ID de la materia raíz
 */
export async function archiveSubject(id) {
  return runTransaction(async () => {
    // 1. Archivar secciones hijas
    await archiveChildSubjects(id)

    // 2. Archivar el subject padre
    await updateSubjectRow(id, { archived: true })
  })
}

/**
 * Restaura una materia archivada (cascada inversa a secciones, NO a notas).
 * Las notas reaparecen automáticamente porque su subject vuelve al árbol activo.
 * Orden: padre -> secciones hijas.
 * @param {string} id ID de la materia raíz
 */
export async function unarchiveSubject(id) {
  return runTransaction(async () => {
    const subject = await getSubjectRowById(id)
    if (!subject) return

    let allSubjects = await getAllSubjectRowsIncludingArchived()

    // 1. Desarchivar el subject padre con nombre navegable único
    allSubjects = await updateArchiveStateWithUniqueName(subject, false, allSubjects)

    // 2. Desarchivar secciones hijas una por una para resolver duplicados previos
    const childSubjects = allSubjects.filter(s => s.parentSubjectId === id && s.archived)
    for (const child of childSubjects) {
      allSubjects = await updateArchiveStateWithUniqueName(child, false, allSubjects)
    }
  })
}

/**
 * Archiva una sección individual.
 * Las notas se ocultan implícitamente.
 * La materia padre NO se archiva.
 * @param {string} id ID de la sección
 */
export async function archiveSection(id) {
  return runTransaction(async () => {
    await updateSubjectRow(id, { archived: true })
  })
}

/**
 * Restaura una sección archivada.
 * Si su materia padre sigue archivada, restaura también ese contenedor
 * para que la sección y sus notas tengan una ruta navegable.
 * @param {string} id ID de la sección
 */
export async function unarchiveSection(id) {
  return runTransaction(async () => {
    const section = await getSubjectRowById(id)
    if (!section) return

    let allSubjects = await getAllSubjectRowsIncludingArchived()

    if (section.parentSubjectId) {
      const parent = await getSubjectRowById(section.parentSubjectId)
      if (parent?.archived && !parent.deletedAt) {
        allSubjects = await updateArchiveStateWithUniqueName(parent, false, allSubjects)
      }
    }

    await updateArchiveStateWithUniqueName(section, false, allSubjects)
  })
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
