// =============================================================
// noteFilters — Lógica de filtrado y ordenamiento de notas
// Hito 04: Organización y UX
//
// Responsabilidad: Funciones puras que filtran y ordenan notas
// según viewMode, búsqueda, fecha y pin. Extraídas de NoteStore
// para mantener el store enfocado en estado y acciones.
// =============================================================

/**
 * Retorna las notas filtradas y ordenadas.
 * Orden: pinned primero, luego por updatedAt (más reciente primero).
 *
 * viewMode controla el filtro principal:
 *   'inbox'    → notas sin materia (subjectId IS NULL), no archivadas
 *   'subject'  → notas de la materia activa (+ secciones hijas), no archivadas
 *   'archived' → solo notas archivadas (cualquier materia)
 *   'all'      → todas las no archivadas (usado por búsqueda global)
 *
 * @param {object} state Estado completo del store
 * @returns {object[]} Array de notas filtradas y ordenadas
 */
export function getFilteredNotes(state) {
  let filtered = state.notes

  // 0. Filtrar por viewMode
  switch (state.viewMode) {
    case 'inbox':
      filtered = filtered.filter(note => !note.archived && !note.subjectId)
      break
    case 'subject': {
      // Incluir notas de la materia activa Y de sus secciones hijas
      const childIds = getChildSubjectIds(state.subjects, state.activeSubjectId)
      const validIds = [state.activeSubjectId, ...childIds]
      filtered = filtered.filter(note => !note.archived && validIds.includes(note.subjectId))
      break
    }
    case 'archived':
      filtered = filtered.filter(note => note.archived === true)
      break
    case 'trash':
      // La vista de papelera carga sus datos por separado (getTrashItems)
      // El filtro normal retorna vacío para no mostrar notas activas
      return []
    case 'all':
    default:
      filtered = filtered.filter(note => !note.archived)
      break
  }

  // 1. Filtrar por búsqueda de texto (global, independiente de viewMode)
  if (state.searchQuery.trim()) {
    const query = state.searchQuery.toLowerCase().trim()
    filtered = filtered.filter(note => {
      const title = (note.title || '').toLowerCase()
      const content = (note.content || '').toLowerCase()
      return title.includes(query) || content.includes(query)
    })
  }

  // 2. Filtrar por fecha exacta (usando updatedAt)
  if (state.dateFilter) {
    filtered = filtered.filter(note => {
      if (!note.updatedAt) return false
      const noteDate = new Date(note.updatedAt).toISOString().split('T')[0]
      return noteDate === state.dateFilter
    })
  }

  // 3. Ordenar: pinned al tope, luego por updatedAt
  filtered.sort((a, b) => {
    // Pinned primero
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    // Dentro del mismo grupo, más reciente primero
    return new Date(b.updatedAt) - new Date(a.updatedAt)
  })

  return filtered
}

/**
 * Helper: obtiene los IDs de las secciones hijas de una materia.
 * Usa el árbol cargado en subjects para evitar queries extra.
 * @param {object} subjects Datos de materias con .tree
 * @param {string} parentId ID de la materia padre
 * @returns {string[]} IDs de las secciones hijas
 */
export function getChildSubjectIds(subjects, parentId) {
  if (!subjects || !subjects.tree) return []
  const parent = subjects.tree.find(s => s.id === parentId)
  if (!parent || !parent.children) return []
  return parent.children.map(c => c.id)
}
