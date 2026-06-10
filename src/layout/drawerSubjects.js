// =============================================================
// layout/drawerSubjects — Lógica de materias del drawer
// Extraído de drawerController.js para reducir LOC.
// =============================================================

import { escapeHtml } from './appShell.js'
import { showErrorToast } from '../components/Toast.js'
import { handleUnarchiveSubjectButton, renderArchivedSubjects } from './drawerArchivedSubjects.js'
import {
  isSubjectCollapsed,
  readCollapsedSubjectIds,
  setSubjectCollapsed,
  toggleSubjectCollapsed,
} from './drawerSubjectCollapseState.js'
import { setupSubjectContextMenu } from './drawerSubjectContextMenu.js'
import { renderSubjectsList } from './drawerSubjectsRender.js'

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

    // Botón para expandir/contraer secciones de una materia
    const btnCollapse = e.target.closest('.js-subject-collapse')
    if (btnCollapse) {
      e.preventDefault()
      e.stopPropagation()
      toggleSubjectCollapsed(btnCollapse.dataset.subject)
      renderSubjects(NoteStore.getState().subjects)
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
    if (expandSubject(parentId)) {
      renderSubjects(NoteStore.getState().subjects)
    }

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
    const wasCollapsed = isSubjectCollapsed(parentId)
    if (wasCollapsed) setSubjectCollapsed(parentId, false)
    try {
      await NoteStore.createSubject(name, parentColor, parentId)
      form.style.display = 'none'
    } catch (err) {
      if (wasCollapsed) setSubjectCollapsed(parentId, true)
      showErrorToast(err.message)
    }
  }

  /** Expande una materia si estaba colapsada. */
  function expandSubject(subjectId) {
    const collapsedSubjectIds = readCollapsedSubjectIds()
    if (!isSubjectCollapsed(subjectId, collapsedSubjectIds)) return false

    setSubjectCollapsed(subjectId, false, collapsedSubjectIds)
    return true
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
  /** Renderiza la lista de materias desde el árbol del store */
  function renderSubjects(subjectsData) {
    renderSubjectsList(subjectsData, { NoteStore, subjectsList, inboxCount, getShowingArchived })
  }

  return { updateSubjectActiveState, renderSubjects }
}
