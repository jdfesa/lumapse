// =============================================================
// SubjectService.validation — Validaciones de negocio (DP-004)
// Extraído de SubjectService.js para reducir LOC.
// =============================================================

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

export { generateUUID, validateNameRequired, validateNameUnique, validateMaxDepth }
