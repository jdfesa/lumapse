// =============================================================
// layout/drawerArchivedSubjects — Render de materias archivadas
// =============================================================

import { confirmDialog } from '../components/common/ConfirmDialog.js'
import { escapeHtml } from './appShell.js'

/**
 * Renderiza las materias archivadas con opción de desarchivar.
 * @param {object|null} archivedData Árbol de materias archivadas
 * @returns {string} HTML renderizado
 */
export function renderArchivedSubjects(archivedData) {
  if (!archivedData?.tree || archivedData.tree.length === 0) {
    return '<div class="drawer__empty-archived">No hay materias archivadas</div>'
  }

  return archivedData.tree.map(subject => {
    const rootButton = subject.archived
      ? `
          <button class="drawer__section-add drawer__section-add--visible js-btn-unarchive-subject"
                  data-subject-id="${subject.id}"
                  data-is-section="false"
                  data-subject-name="${escapeHtml(subject.name)}"
                  title="Desarchivar materia">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="21 8 21 21 3 21 3 8"></polyline>
              <rect x="1" y="3" width="22" height="5"></rect>
              <line x1="12" y1="12" x2="12" y2="18"></line>
              <polyline points="9 15 12 12 15 15"></polyline>
            </svg>
          </button>
        `
      : ''

    const childrenHtml = (subject.children || []).map(child => `
      <div class="drawer__subject-row drawer__subject-row--child">
        <div class="drawer__subject-btn drawer__subject-btn--child drawer__subject-btn--archived">
          <span class="drawer__subject-color" style="background-color: ${child.color || subject.color}; opacity: 0.5"></span>
          <span class="drawer__subject-name">${escapeHtml(child.name)}</span>
          <span class="drawer__subject-count">${child.noteCount || 0}</span>
        </div>
        <button class="drawer__section-add drawer__section-add--visible js-btn-unarchive-subject"
                data-subject-id="${child.id}"
                data-is-section="true"
                data-subject-name="${escapeHtml(child.name)}"
                title="Desarchivar sección">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="21 8 21 21 3 21 3 8"></polyline>
            <rect x="1" y="3" width="22" height="5"></rect>
            <line x1="12" y1="12" x2="12" y2="18"></line>
            <polyline points="9 15 12 12 15 15"></polyline>
          </svg>
        </button>
      </div>
    `).join('')

    return `
      <div class="drawer__subject-group drawer__subject-group--archived">
        <div class="drawer__subject-row">
          <div class="drawer__subject-btn ${subject.archived ? 'drawer__subject-btn--archived' : 'drawer__subject-btn--archive-context'}">
            <span class="drawer__subject-color" style="background-color: ${subject.color}; opacity: ${subject.archived ? '0.5' : '1'}"></span>
            <span class="drawer__subject-name">${escapeHtml(subject.name)}</span>
            <span class="drawer__subject-count">${subject.archived ? subject.noteCount || 0 : ''}</span>
          </div>
          ${rootButton}
        </div>
        ${childrenHtml}
      </div>
    `
  }).join('')
}

/**
 * Ejecuta la acción de desarchivar desde un botón del drawer.
 * @param {HTMLButtonElement} button Botón de desarchivar
 * @param {object} NoteStore Store de notas
 */
export async function handleUnarchiveSubjectButton(button, NoteStore) {
  const subjectId = button.dataset.subjectId
  const isSection = button.dataset.isSection === 'true'
  const subjectName = button.dataset.subjectName || ''
  const type = isSection ? 'sección' : 'materia'

  const confirmed = await confirmDialog({
    title: `Desarchivar ${type}`,
    message: `¿Desarchivar la ${type} "${subjectName}"?`,
    confirmText: 'Desarchivar',
  })
  if (!confirmed) return

  if (isSection) {
    await NoteStore.unarchiveSection(subjectId)
  } else {
    await NoteStore.unarchiveSubject(subjectId)
  }
}
