// =============================================================
// layout/drawerSubjectContextMenu — Menú contextual de materias
// =============================================================

import { confirmDialog } from '../components/common/ConfirmDialog.js'
import { handleStoreMutationError } from '../components/common/storeActionErrors.js'

/**
 * Configura un único menú contextual reutilizable para materias/secciones.
 * @param {object} deps Dependencias
 * @param {HTMLElement} deps.subjectsList Contenedor de materias
 * @param {object} deps.NoteStore Store de notas
 * @param {function} deps.startRenameSubject Inicia renombrado inline
 * @returns {{ consumeSuppressedClick: function, close: function }}
 */
export function setupSubjectContextMenu({ subjectsList, NoteStore, startRenameSubject }) {
  const existingCtxMenu = document.getElementById('subject-context-menu')
  if (existingCtxMenu) existingCtxMenu.remove()

  const ctxMenu = document.createElement('div')
  ctxMenu.id = 'subject-context-menu'
  ctxMenu.className = 'drawer__ctx-menu'
  ctxMenu.setAttribute('role', 'menu')
  ctxMenu.style.display = 'none'
  ctxMenu.innerHTML = `
    <button class="drawer__ctx-item js-ctx-rename" type="button" role="menuitem">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
      Renombrar
    </button>
    <button class="drawer__ctx-item js-ctx-archive" type="button" role="menuitem">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
      <span class="js-ctx-archive-label">Archivar</span>
    </button>
    <div class="drawer__ctx-divider"></div>
    <button class="drawer__ctx-item drawer__ctx-item--danger js-ctx-delete" type="button" role="menuitem">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      Enviar a Papelera
    </button>
  `
  document.body.appendChild(ctxMenu)

  let ctxTarget = null
  let longPressTimer = null
  let suppressNextClick = false
  let activeTrigger = null

  function openCtxMenu(e, subjectId, isSection, subjectName, trigger = null) {
    e.preventDefault()
    e.stopPropagation()
    ctxTarget = { subjectId, isSection, subjectName }
    activeTrigger?.setAttribute('aria-expanded', 'false')
    activeTrigger = trigger
    activeTrigger?.setAttribute('aria-expanded', 'true')

    const type = isSection ? 'sección' : 'materia'
    ctxMenu.querySelector('.js-ctx-archive-label').textContent = `Archivar ${type}`

    const subjectBtn = e.target.closest('.drawer__subject-row')?.querySelector('.drawer__subject-btn')
    const nameRect = subjectBtn?.querySelector('.drawer__subject-name')?.getBoundingClientRect()
    const anchorRect = (trigger || subjectBtn)?.getBoundingClientRect()

    ctxMenu.style.display = 'block'
    ctxMenu.style.visibility = 'hidden'
    if (anchorRect) {
      const menuWidth = ctxMenu.offsetWidth
      const menuHeight = ctxMenu.offsetHeight
      const preferredLeft = trigger
        ? anchorRect.right - menuWidth
        : (nameRect?.left || anchorRect.left)
      const left = Math.max(8, Math.min(preferredLeft, window.innerWidth - menuWidth - 8))
      const preferredTop = anchorRect.bottom + 4
      const top = preferredTop + menuHeight <= window.innerHeight - 8
        ? preferredTop
        : Math.max(8, anchorRect.top - menuHeight - 4)
      ctxMenu.style.top = `${top}px`
      ctxMenu.style.left = `${left}px`
    } else {
      ctxMenu.style.top = `${e.clientY}px`
      ctxMenu.style.left = `${e.clientX}px`
    }
    ctxMenu.style.visibility = 'visible'
  }

  function closeCtxMenu() {
    ctxMenu.style.display = 'none'
    ctxMenu.style.visibility = ''
    ctxTarget = null
    activeTrigger?.setAttribute('aria-expanded', 'false')
    activeTrigger = null
  }

  function consumeSuppressedClick() {
    if (!suppressNextClick) return false
    suppressNextClick = false
    return true
  }

  subjectsList.addEventListener('contextmenu', (e) => {
    const subjectBtn = e.target.closest('.js-subject-nav')
    if (!subjectBtn) return
    openCtxMenu(
      e,
      subjectBtn.dataset.subject,
      subjectBtn.dataset.isSection === 'true',
      subjectBtn.dataset.subjectName || ''
    )
  })

  subjectsList.addEventListener('click', (e) => {
    const trigger = e.target.closest('.js-subject-actions')
    if (!trigger) return

    const isCurrentTrigger = activeTrigger === trigger && ctxMenu.style.display === 'block'
    if (isCurrentTrigger) {
      e.preventDefault()
      e.stopPropagation()
      closeCtxMenu()
      return
    }

    openCtxMenu(
      e,
      trigger.dataset.subject,
      trigger.dataset.isSection === 'true',
      trigger.dataset.subjectName || '',
      trigger,
    )
  })

  subjectsList.addEventListener('touchstart', (e) => {
    const subjectBtn = e.target.closest('.js-subject-nav')
    if (!subjectBtn) return
    longPressTimer = setTimeout(() => {
      longPressTimer = null
      suppressNextClick = true
      setTimeout(() => {
        suppressNextClick = false
      }, 700)
      openCtxMenu(
        e,
        subjectBtn.dataset.subject,
        subjectBtn.dataset.isSection === 'true',
        subjectBtn.dataset.subjectName || ''
      )
    }, 500)
  }, { passive: false })

  subjectsList.addEventListener('touchend', () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
  })

  subjectsList.addEventListener('touchmove', () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
  })

  function closeOnOutsidePress(e) {
    if (ctxMenu.style.display !== 'block') return
    if (ctxMenu.contains(e.target) || e.target.closest?.('.js-subject-actions')) return
    closeCtxMenu()
  }

  // En Android, cerrar al comenzar el toque evita depender del click sintetizado
  // que puede no llegar después de que la navegación oculta o re-renderiza el drawer.
  document.addEventListener('pointerdown', closeOnOutsidePress, true)
  document.addEventListener('touchstart', closeOnOutsidePress, { capture: true, passive: true })

  document.addEventListener('click', (e) => {
    if (!ctxMenu.contains(e.target)) closeCtxMenu()
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCtxMenu()
  })

  ctxMenu.querySelector('.js-ctx-rename').addEventListener('click', () => {
    if (!ctxTarget) return
    startRenameSubject(ctxTarget.subjectId)
    closeCtxMenu()
  })

  ctxMenu.querySelector('.js-ctx-archive').addEventListener('click', async () => {
    try {
      if (!ctxTarget) return
      const { subjectId, isSection, subjectName } = ctxTarget
      const type = isSection ? 'sección' : 'materia'
      closeCtxMenu()
      const confirmed = await confirmDialog({
        title: `Archivar ${type}`,
        message: `¿Archivar la ${type} "${subjectName}" y todas sus notas?`,
        confirmText: 'Archivar',
      })
      if (confirmed) {
        if (isSection) {
          await NoteStore.archiveSection(subjectId)
        } else {
          await NoteStore.archiveSubject(subjectId)
        }
      }
    } catch (error) {
      handleStoreMutationError(error, { context: 'drawerSubjectContextMenu' })
    }
  })

  ctxMenu.querySelector('.js-ctx-delete').addEventListener('click', async () => {
    try {
      if (!ctxTarget) return
      const { subjectId, isSection, subjectName } = ctxTarget
      const type = isSection ? 'sección' : 'materia'
      closeCtxMenu()
      const confirmed = await confirmDialog({
        title: `Enviar ${type} a papelera`,
        message: `¿Enviar la ${type} "${subjectName}" y todas sus notas a la Papelera de reciclaje?`,
        confirmText: 'Enviar',
      })
      if (confirmed) {
        if (isSection) {
          await NoteStore.deleteSection(subjectId)
        } else {
          await NoteStore.deleteSubject(subjectId)
        }
      }
    } catch (error) {
      handleStoreMutationError(error, { context: 'drawerSubjectContextMenu' })
    }
  })

  return { consumeSuppressedClick, close: closeCtxMenu }
}
