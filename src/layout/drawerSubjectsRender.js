import { escapeHtml } from './appShell.js'
import { renderArchivedSubjects } from './drawerArchivedSubjects.js'
import {
  isSubjectCollapsed,
  readCollapsedSubjectIds,
  setSubjectCollapsed
} from './drawerSubjectCollapseState.js'

/**
 * Renderiza la lista de materias desde el árbol del store.
 * Extraído de drawerSubjects.js para reducir tamaño de archivo.
 */
export function renderSubjectsList(subjectsData, { NoteStore, subjectsList, inboxCount }) {
  if (!subjectsData) return

  const state = NoteStore.getState()
  if (state.viewMode === 'archived') {
    inboxCount.textContent = ''
    subjectsList.innerHTML = renderArchivedSubjects(state.archivedSubjects)
    return
  }

  inboxCount.textContent = subjectsData.inboxCount || 0

  if (!subjectsData.tree || subjectsData.tree.length === 0) {
    subjectsList.innerHTML = ''
    return
  }

  let collapsedSubjectIds = readCollapsedSubjectIds()

  subjectsList.innerHTML = subjectsData.tree.map(subject => {
    const isActive = state.activeSubjectId === subject.id
    const children = subject.children || []
    const hasChildren = children.length > 0
    const hasActiveChild = children.some(child => child.id === state.activeSubjectId)
    if (hasChildren && hasActiveChild && isSubjectCollapsed(subject.id, collapsedSubjectIds)) {
      collapsedSubjectIds = setSubjectCollapsed(subject.id, false, collapsedSubjectIds)
    }

    const isCollapsed = hasChildren && isSubjectCollapsed(subject.id, collapsedSubjectIds)
    const collapseButtonHtml = hasChildren
      ? renderCollapseButton(subject, isCollapsed)
      : ''
    const childrenHtml = isCollapsed ? '' : children.map(child => {
      const isChildActive = state.activeSubjectId === child.id
      return `
        <div class="drawer__subject-row drawer__subject-row--child">
          <div class="drawer__subject-btn drawer__subject-btn--child js-subject-nav${isChildActive ? ' drawer__subject-btn--active' : ''}" 
               role="button" tabindex="0" 
               data-subject="${child.id}"
               data-subject-name="${escapeHtml(child.name)}"
               data-is-section="true">
            <span class="drawer__subject-color" style="background-color: ${child.color || subject.color}"></span>
            <span class="drawer__subject-name" data-name-id="${child.id}">${escapeHtml(child.name)}</span>
            <span class="drawer__subject-count">${child.noteCount || 0}</span>
          </div>
        </div>
      `
    }).join('')
    const childrenGroupHtml = hasChildren
      ? `
        <div id="subject-children-${subject.id}" class="drawer__subject-children"${isCollapsed ? ' hidden' : ''}>
          ${childrenHtml}
        </div>
      `
      : ''

    // Formulario inline para crear sección (oculto por defecto)
    const sectionFormHtml = `
      <div id="section-form-${subject.id}" class="drawer__section-form" style="display:none">
        <input type="text" 
               class="drawer__section-form-input js-section-name-input" 
               placeholder="Nombre de sección" 
               maxlength="40" 
               autocomplete="off"
               data-parent-id="${subject.id}"
               data-parent-color="${subject.color}">
        <div class="drawer__section-form-actions">
          <button class="drawer__subject-form-btn js-btn-section-cancel" data-parent-id="${subject.id}">Cancelar</button>
          <button class="drawer__subject-form-btn drawer__subject-form-btn--primary js-btn-section-save" data-parent-id="${subject.id}" data-parent-color="${subject.color}">Crear</button>
        </div>
      </div>
    `

    return `
      <div class="drawer__subject-group">
        <div class="drawer__subject-row">
          ${collapseButtonHtml}
          <div class="drawer__subject-btn js-subject-nav${isActive ? ' drawer__subject-btn--active' : ''}" 
               role="button" tabindex="0" 
               data-subject="${subject.id}"
               data-subject-name="${escapeHtml(subject.name)}"
               data-is-section="false">
            <span class="drawer__subject-color" style="background-color: ${subject.color}"></span>
            <span class="drawer__subject-name" data-name-id="${subject.id}">${escapeHtml(subject.name)}</span>
            <span class="drawer__subject-count">${subject.noteCount || 0}</span>
          </div>
          <button class="drawer__section-add js-btn-add-section" data-parent-id="${subject.id}" data-parent-color="${subject.color}" title="Agregar sección">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>
        ${childrenGroupHtml}
        ${sectionFormHtml}
      </div>
    `
  }).join('')
}

function renderCollapseButton(subject, isCollapsed) {
  const subjectName = escapeHtml(subject.name)
  const action = isCollapsed ? 'Expandir' : 'Contraer'

  return `
    <button class="drawer__subject-collapse js-subject-collapse"
            type="button"
            data-subject="${subject.id}"
            aria-expanded="${String(!isCollapsed)}"
            aria-controls="subject-children-${subject.id}"
            aria-label="${action} secciones de ${subjectName}"
            title="${action} secciones">
      <svg class="drawer__subject-collapse-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  `
}
