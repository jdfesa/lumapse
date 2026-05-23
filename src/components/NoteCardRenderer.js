// =============================================================
// NoteCardRenderer — Funciones de renderizado de tarjetas
// Extraído de NoteList.js para reducir LOC.
// =============================================================

// UX-03: Timestamps relativos
export function formatRelativeDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'ahora';
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours} h`;
  if (diffDays === 1) return 'ayer';
  if (diffDays < 7) return `hace ${diffDays} d`;
    
  // Fallback: ej. "16 may 2026"
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Prevenir inyección de HTML en campos de texto puro
export function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Busca una materia en el árbol de subjects por ID.
 * Retorna { subject, parent } donde parent es la materia raíz
 * si subject es una sección hija, o null si es raíz.
 * @param {string} subjectId ID de la materia
 * @param {object} subjectsData Árbol de materias
 * @returns {{subject: object, parent: object|null}|null}
 */
export function findSubject(subjectId, subjectsData) {
  if (!subjectId || !subjectsData || !subjectsData.tree) return null;
  for (const root of subjectsData.tree) {
    if (root.id === subjectId) return { subject: root, parent: null };
    for (const child of (root.children || [])) {
      if (child.id === subjectId) return { subject: child, parent: root };
    }
  }
  return null;
}

/**
 * Genera un botón individual del submenú "Mover a".
 * @param {string} noteId ID de la nota
 * @param {string} subjectId ID de la materia destino ('' = Entrada)
 * @param {string} label Nombre visible
 * @param {string} color Color de la materia ('' = sin dot)
 * @param {boolean} isCurrent Si es la materia actual de la nota
 * @param {boolean} isChild Si es una sección hija (indentada)
 * @returns {string} HTML del botón
 */
export function renderMoveItem(noteId, subjectId, label, color, isCurrent, isChild = false) {
  const currentClass = isCurrent ? ' note-card__dropdown-btn--current' : ''
  const childClass = isChild ? ' note-card__dropdown-btn--child' : ''
  const colorDot = color
    ? `<span class="note-card__move-color" style="background-color: ${color}"></span>`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>`
  const check = isCurrent ? ' ✓' : ''

  return `
    <button class="note-card__dropdown-btn${childClass} js-btn-move-to${currentClass}" 
            data-note-id="${noteId}" 
            data-subject-id="${subjectId}"
            ${isCurrent ? 'disabled' : ''}>
      ${colorDot}
      ${escapeHtml(label)}${check}
    </button>
  `
}

/**
 * Genera el HTML del submenú "Mover a" con todas las materias disponibles.
 * Marca como activa (y no clickeable) la materia actual de la nota.
 * @param {string} noteId ID de la nota
 * @param {string|null} currentSubjectId ID de la materia actual de la nota
 * @param {object} subjectsData Árbol de materias del store
 * @returns {string} HTML del submenú
 */
export function buildMoveMenu(noteId, currentSubjectId, subjectsData) {
  const items = []

  // Opción "Entrada" (inbox)
  items.push(renderMoveItem(noteId, '', 'Entrada', '', !currentSubjectId))

  // Materias del árbol
  if (subjectsData && subjectsData.tree) {
    for (const subject of subjectsData.tree) {
      items.push(renderMoveItem(noteId, subject.id, subject.name, subject.color, currentSubjectId === subject.id))
      for (const child of (subject.children || [])) {
        items.push(renderMoveItem(noteId, child.id, child.name, child.color || subject.color, currentSubjectId === child.id, true))
      }
    }
  }

  return items.join('')
}
