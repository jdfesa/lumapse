// =============================================================
// layout/drawerController — Lógica del Drawer (sidebar)
// Hito 04: Interfaz Microblog (estilo Memos)
//
// Responsabilidad: Inicializar todos los event listeners del
// drawer: apertura/cierre, búsqueda, materias (crear, navegar),
// archivados y toggle de tema. Extraído de main.js.
// =============================================================

import { escapeHtml } from './appShell.js'

/**
 * Inicializa toda la lógica interactiva del drawer.
 * Debe llamarse después de que el HTML del shell esté en el DOM.
 *
 * @param {object} deps Dependencias inyectadas
 * @param {object} deps.NoteStore Store de notas
 * @param {object} deps.ThemeService Servicio de tema
 * @param {string[]} deps.SUBJECT_COLORS Paleta de colores de materias
 */
export function initDrawer({ NoteStore, ThemeService, SUBJECT_COLORS }) {
  // --- Drawer Open/Close ---
  const drawer = document.getElementById('drawer')
  const backdrop = document.getElementById('drawer-backdrop')
  const btnOpen = document.getElementById('btn-open-drawer')
  const btnClose = document.getElementById('btn-close-drawer')
  
  function openDrawer() {
    drawer.classList.add('is-open')
    backdrop.classList.add('is-visible')
    document.body.style.overflow = 'hidden'
  }
  
  function closeDrawer() {
    drawer.classList.remove('is-open')
    backdrop.classList.remove('is-visible')
    document.body.style.overflow = ''
  }

  btnOpen.addEventListener('click', openDrawer)
  btnClose.addEventListener('click', closeDrawer)
  backdrop.addEventListener('click', closeDrawer)

  // --- Search Logic ---
  const searchInput = document.getElementById('drawer-search-input')
  let searchTimeout

  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      NoteStore.setSearchQuery(e.target.value)
    }, 200) // 200ms debounce
  })

  // --- Archive Toggle ---
  const btnArchiveToggle = document.getElementById('btn-toggle-archived')
  const archivedLabel = document.getElementById('archived-btn-label')
  let showingArchived = false

  btnArchiveToggle.addEventListener('click', () => {
    showingArchived = !showingArchived
    NoteStore.setShowArchived(showingArchived)
    archivedLabel.textContent = showingArchived ? 'Ver notas activas' : 'Ver archivadas'
    btnArchiveToggle.classList.toggle('drawer__nav-btn--active', showingArchived)
    // Desactivar materia seleccionada cuando se muestran archivadas
    if (showingArchived) {
      updateSubjectActiveState(null)
    }
    closeDrawer()
  })

  // --- Subjects Navigation (Paso 9) ---
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
      alert(err.message)
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
    showingArchived = false
    archivedLabel.textContent = 'Ver archivadas'
    btnArchiveToggle.classList.remove('drawer__nav-btn--active')
    updateSubjectActiveState(null)
    closeDrawer()
  })

  // Delegación para clicks en materias del listado
  subjectsList.addEventListener('click', (e) => {
    // Botón "+" para agregar sección
    const btnAddSection = e.target.closest('.js-btn-add-section')
    if (btnAddSection) {
      e.stopPropagation()
      toggleSectionForm(btnAddSection.dataset.parentId)
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

    // Navegación a materia/sección
    const subjectBtn = e.target.closest('.drawer__subject-btn')
    if (!subjectBtn) return
    const subjectId = subjectBtn.dataset.subject
    if (!subjectId) return

    NoteStore.setActiveSubject(subjectId)
    showingArchived = false
    archivedLabel.textContent = 'Ver archivadas'
    btnArchiveToggle.classList.remove('drawer__nav-btn--active')
    updateSubjectActiveState(subjectId)
    closeDrawer()
  })

  // Enter/Escape en inputs de sección (delegación)
  subjectsList.addEventListener('keydown', (e) => {
    const input = e.target.closest('.js-section-name-input')
    if (!input) return
    if (e.key === 'Enter') {
      e.preventDefault()
      saveSectionForm(input.dataset.parentId, input.dataset.parentColor)
    } else if (e.key === 'Escape') {
      closeSectionForm(input.dataset.parentId)
    }
  })

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
      alert(err.message)
    }
  }

  /** Cierra el formulario de sección */
  function closeSectionForm(parentId) {
    const form = subjectsList.querySelector(`#section-form-${parentId}`)
    if (form) form.style.display = 'none'
  }

  /** Actualiza qué botón de materia tiene la clase --active */
  function updateSubjectActiveState(activeId) {
    // Inbox
    btnInbox.classList.toggle('drawer__subject-btn--active', activeId === null && !showingArchived)
    // Materias
    subjectsList.querySelectorAll('.drawer__subject-btn').forEach(btn => {
      btn.classList.toggle('drawer__subject-btn--active', btn.dataset.subject === activeId)
    })
  }

  /** Renderiza la lista de materias desde el árbol del store */
  function renderSubjects(subjectsData) {
    if (!subjectsData) return

    inboxCount.textContent = subjectsData.inboxCount || 0

    if (!subjectsData.tree || subjectsData.tree.length === 0) {
      subjectsList.innerHTML = ''
      return
    }

    const state = NoteStore.getState()
    subjectsList.innerHTML = subjectsData.tree.map(subject => {
      const isActive = state.activeSubjectId === subject.id
      const childrenHtml = (subject.children || []).map(child => {
        const isChildActive = state.activeSubjectId === child.id
        return `
          <button class="drawer__subject-btn drawer__subject-btn--child${isChildActive ? ' drawer__subject-btn--active' : ''}" data-subject="${child.id}">
            <span class="drawer__subject-color" style="background-color: ${child.color || subject.color}"></span>
            <span class="drawer__subject-name">${escapeHtml(child.name)}</span>
            <span class="drawer__subject-count">${child.noteCount || 0}</span>
          </button>
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
            <button class="drawer__subject-btn${isActive ? ' drawer__subject-btn--active' : ''}" data-subject="${subject.id}">
              <span class="drawer__subject-color" style="background-color: ${subject.color}"></span>
              <span class="drawer__subject-name">${escapeHtml(subject.name)}</span>
              <span class="drawer__subject-count">${subject.noteCount || 0}</span>
            </button>
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

  // Suscribirse a cambios del store para re-renderizar materias
  NoteStore.subscribe((state) => {
    renderSubjects(state.subjects)
  })

  // --- Theme Toggle (RF-019) ---
  ThemeService.init()

  const themeIcon = document.getElementById('theme-icon')
  const themeLabel = document.getElementById('theme-btn-label')
  const btnToggleTheme = document.getElementById('btn-toggle-theme')

  /** Actualiza el ícono y el label del botón según el tema activo */
  function updateThemeUI(theme) {
    if (theme === 'light') {
      // En modo claro, el botón ofrece cambiar a oscuro → ícono luna
      themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>'
      themeLabel.textContent = 'Modo oscuro'
    } else {
      // En modo oscuro, el botón ofrece cambiar a claro → ícono sol
      themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>'
      themeLabel.textContent = 'Modo claro'
    }
  }

  updateThemeUI(ThemeService.getTheme())
  ThemeService.onThemeChange(updateThemeUI)

  btnToggleTheme.addEventListener('click', () => {
    ThemeService.toggle()
  })
}
