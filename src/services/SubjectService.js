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
  getInboxCount
} from './sqlite/subjects.js'

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
 * Elimina una materia permanentemente.
 * Las notas asociadas quedan con subjectId = NULL (FK ON DELETE SET NULL).
 * También elimina las secciones hijas (FK ON DELETE CASCADE).
 * @param {string} id ID de la materia
 */
export async function deleteSubject(id) {
  await deleteSubjectRow(id)
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
