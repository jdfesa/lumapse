// =============================================================
// layout/drawerSubjects — Lógica de materias del drawer
// Extraído de drawerController.js para reducir LOC.
// =============================================================

import { escapeHtml } from './appShell.js'
import { showErrorToast } from '../components/Toast.js'
import { handleUnarchiveSubjectButton, renderArchivedSubjects } from './drawerArchivedSubjects.js'
import { setupSubjectContextMenu } from './drawerSubjectContextMenu.js'

/**
 * Inicializa la lógica de materias en el drawer.
 * @param {object} deps Dependencias
 * @param {object} deps.NoteStore Store de notas
 * @param {string[]} deps.SUBJECT_COLORS Paleta de colores
 * @param {function} deps.closeDrawer Función para cerrar el drawer
 * @param {function} deps.getShowingArchived Getter del estado archived
 * @param {function} deps.resetArchived Función para resetear el toggle de archivados
 * @returns {{ updateSubjectActiveState: function, renderSubjects: function }}
 */
export function initSubjects({ NoteStore, SUBJECT_COLORS, closeDrawer, getShowingArchived, resetArchived }) {
  const subjectsList = document.getElementById('subjects-list')
  const btnInbox = document.getElementById('btn-inbox')
  const inboxCount = document.getElementById('inbox-count')
  const btnAddSubject = document.getElementById('btn-add-subject')
  const subjectFormContainer = document.getElementById('subject-form-container')
  const subjectNameInput = document.getElementById('subject-name-input')
  const colorPickerContainer = document.getElementById('subject-color-picker')
  const btnSubjectCancel = document.getElementById('btn-subject-cancel')
  const btnSubjectSave = document.getElementById('btn-subject-save')
  let selectedColor = SUBJECT_COLORS[0]
  const subjectContextMenu = setupSubjectContextMenu({
    subjectsList,
    NoteStore,
    startRenameSubject,
  })

  // Renderizar paleta de colores
  colorPickerContainer.innerHTML = SUBJECT_COLORS.map((color, i) => `
    <button class="drawer__color-dot${i === 0 ? ' drawer__color-dot--active' : ''}" 
            data-color="${color}" 
            style="background-color: ${color}" 
            title="${color}"></button>
  `).join('')

  colorPickerContainer.addEventListener('click', (e) => {
    const dot = e.target.closest('.drawer__color-dot')
    if (!dot) return
    selectedColor = dot.dataset.color
    colorPickerContainer.querySelectorAll('.drawer__color-dot').forEach(d => d.classList.remove('drawer__color-dot--active'))
    dot.classList.add('drawer__color-dot--active')
  })

  // Mostrar/ocultar formulario
  btnAddSubject.addEventListener('click', () => {
    const isVisible = subjectFormContainer.style.display !== 'none'
    subjectFormContainer.style.display = isVisible ? 'none' : 'block'
    if (!isVisible) {
      subjectNameInput.value = ''
      subjectNameInput.focus()
    }
  })

  btnSubjectCancel.addEventListener('click', () => {
    subjectFormContainer.style.display = 'none'
    subjectNameInput.value = ''
  })

  btnSubjectSave.addEventListener('click', async () => {
    const name = subjectNameInput.value.trim()
    if (!name) return
    try {
      await NoteStore.createSubject(name, selectedColor)
      subjectFormContainer.style.display = 'none'
      subjectNameInput.value = ''
    } catch (err) {
      showErrorToast(err.message)
    }
  })

  // Enter para guardar, Escape para cancelar
  subjectNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      btnSubjectSave.click()
    } else if (e.key === 'Escape') {
      btnSubjectCancel.click()
    }
  })

  // Click en Entrada
  btnInbox.addEventListener('click', () => {
    NoteStore.setActiveSubject(null)
    resetArchived()
    updateSubjectActiveState(null)
    closeDrawer()
  })

  // Delegación para clicks en materias del listado
  subjectsList.addEventListener('click', (e) => {
    if (subjectContextMenu.consumeSuppressedClick()) {
      e.preventDefault()
      e.stopPropagation()
      return
    }

    // Botón "+" para agregar sección
    const btnAddSection = e.target.closest('.js-btn-add-section')
    if (btnAddSection) {
      e.stopPropagation()
      toggleSectionForm(btnAddSection.dataset.parentId)
      return
    }

    // Botón desarchivar materia/sección
    const btnUnarchive = e.target.closest('.js-btn-unarchive-subject')
    if (btnUnarchive) {
      e.stopPropagation()
      handleUnarchiveSubjectButton(btnUnarchive, NoteStore)
      return
    }

    // Guardar sección
    const btnSaveSection = e.target.closest('.js-btn-section-save')
    if (btnSaveSection) {
      e.stopPropagation()
      saveSectionForm(btnSaveSection.dataset.parentId, btnSaveSection.dataset.parentColor)
      return
    }

    // Cancelar sección
    const btnCancelSection = e.target.closest('.js-btn-section-cancel')
    if (btnCancelSection) {
      e.stopPropagation()
      closeSectionForm(btnCancelSection.dataset.parentId)
      return
    }

    // Evitar que el click dentro del input de renombrar dispare la navegación
    if (e.target.closest('.js-rename-input')) {
      return
    }

    // Navegación a materia/sección
    const subjectBtn = e.target.closest('.js-subject-nav')
    if (!subjectBtn) return
    navigateToSubject(subjectBtn.dataset.subject)
  })

  // Enter/Escape en inputs de sección (delegación)
  subjectsList.addEventListener('keydown', (e) => {
    // Input de renombrar materia/sección
    const renameInput = e.target.closest('.js-rename-input')
    if (renameInput) {
      if (e.key === 'Enter') {
        e.preventDefault()
        saveRenameSubject(renameInput.dataset.subjectId, renameInput.value)
      } else if (e.key === 'Escape') {
        cancelRenameSubject(renameInput.dataset.subjectId, renameInput.dataset.originalName)
      }
      return
    }

    const subjectBtn = e.target.closest('.js-subject-nav')
    if (subjectBtn && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      navigateToSubject(subjectBtn.dataset.subject)
      return
    }

    const input = e.target.closest('.js-section-name-input')
    if (!input) return
    if (e.key === 'Enter') {
      e.preventDefault()
      saveSectionForm(input.dataset.parentId, input.dataset.parentColor)
    } else if (e.key === 'Escape') {
      closeSectionForm(input.dataset.parentId)
    }
  })

  /** Navega a una materia/sección desde el drawer */
  function navigateToSubject(subjectId) {
    if (!subjectId) return

    NoteStore.setActiveSubject(subjectId)
    resetArchived()
    updateSubjectActiveState(subjectId)
    closeDrawer()
  }

  /** Muestra/oculta el formulario inline de sección para una materia */
  function toggleSectionForm(parentId) {
    // Cerrar cualquier otro formulario abierto
    subjectsList.querySelectorAll('.drawer__section-form').forEach(form => {
      form.style.display = 'none'
    })
    const form = subjectsList.querySelector(`#section-form-${parentId}`)
    if (!form) return
    const isVisible = form.style.display !== 'none'
    form.style.display = isVisible ? 'none' : 'block'
    if (!isVisible) {
      const input = form.querySelector('.js-section-name-input')
      if (input) {
        input.value = ''
        input.focus()
      }
    }
  }

  /** Guarda una nueva sección bajo la materia padre */
  async function saveSectionForm(parentId, parentColor) {
    const form = subjectsList.querySelector(`#section-form-${parentId}`)
    if (!form) return
    const input = form.querySelector('.js-section-name-input')
    const name = input ? input.value.trim() : ''
    if (!name) return
    try {
      await NoteStore.createSubject(name, parentColor, parentId)
      form.style.display = 'none'
    } catch (err) {
      showErrorToast(err.message)
    }
  }

  /** Cierra el formulario de sección */
  function closeSectionForm(parentId) {
    const form = subjectsList.querySelector(`#section-form-${parentId}`)
    if (form) form.style.display = 'none'
  }

  /** Activa el modo edición inline para renombrar una materia/sección */
  function startRenameSubject(subjectId) {
    const nameSpan = subjectsList.querySelector(`.drawer__subject-name[data-name-id="${subjectId}"]`)
    if (!nameSpan) return
    const currentName = nameSpan.textContent

    const input = document.createElement('input')
    input.type = 'text'
    input.className = 'drawer__rename-input js-rename-input'
    input.value = currentName
    input.dataset.subjectId = subjectId
    input.dataset.originalName = currentName
    input.maxLength = 40
    input.autocomplete = 'off'

    nameSpan.replaceWith(input)
    input.focus()
    input.select()

    // Guardar al perder foco (si no se canceló con Escape)
    input.addEventListener('blur', () => {
      // Pequeño delay para permitir que Escape cancele antes del blur
      setTimeout(() => {
        if (input.isConnected) {
          saveRenameSubject(subjectId, input.value)
        }
      }, 100)
    })
  }

  /** Guarda el nuevo nombre de una materia/sección */
  async function saveRenameSubject(subjectId, newName) {
    const trimmed = newName.trim()
    if (!trimmed) {
      // Si está vacío, cancelar y restaurar
      const input = subjectsList.querySelector(`.js-rename-input[data-subject-id="${subjectId}"]`)
      if (input) cancelRenameSubject(subjectId, input.dataset.originalName)
      return
    }
    try {
      await NoteStore.updateSubject(subjectId, { name: trimmed })
    } catch (err) {
      showErrorToast(err.message)
    }
  }

  /** Cancela el renombrado y restaura el nombre original */
  function cancelRenameSubject(subjectId, originalName) {
    const input = subjectsList.querySelector(`.js-rename-input[data-subject-id="${subjectId}"]`)
    if (!input) return

    const span = document.createElement('span')
    span.className = 'drawer__subject-name'
    span.dataset.nameId = subjectId
    span.textContent = originalName
    input.replaceWith(span)
  }

  /** Actualiza qué botón de materia tiene la clase --active */
  function updateSubjectActiveState(activeId) {
    const state = NoteStore.getState()
    // Inbox
    btnInbox.classList.toggle('drawer__subject-btn--active', state.viewMode === 'inbox' && activeId === null && !getShowingArchived())
    // Materias
    subjectsList.querySelectorAll('.js-subject-nav').forEach(btn => {
      btn.classList.toggle('drawer__subject-btn--active', btn.dataset.subject === activeId)
    })
  }

  /** Renderiza la lista de materias desde el árbol del store */
  function renderSubjects(subjectsData) {
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

    subjectsList.innerHTML = subjectsData.tree.map(subject => {
      const isActive = state.activeSubjectId === subject.id
      const childrenHtml = (subject.children || []).map(child => {
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
          ${childrenHtml}
          ${sectionFormHtml}
        </div>
      `
    }).join('')
  }

  return { updateSubjectActiveState, renderSubjects }
}
