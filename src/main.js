// =============================================================
// Lumapse — Punto de entrada principal
// Hito 04: Interfaz Microblog (estilo Memos)
// =============================================================

import './styles/main.css'
import { initDatabase } from './services/SqliteService.js'
import * as NoteStore from './store/NoteStore.js'
import * as ThemeService from './services/ThemeService.js'
import { SUBJECT_COLORS } from './services/SubjectService.js'
import { NoteList as Feed } from './components/NoteList.js'
import { NoteEditor as Composer } from './components/NoteEditor.js'
import { Heatmap } from './components/Heatmap.js'

async function initApp() {
  // Inicializar base de datos SQLite antes de renderizar componentes o cargar notas
  await initDatabase()
  
  const app = document.getElementById('app')
  
  // Construir Layout (Microblog: Drawer + Feed)
  app.innerHTML = `
    <!-- Drawer (Sidebar derecho para búsqueda y extras) -->
    <aside id="drawer" class="drawer">
      <div class="drawer__header">
        <div class="app-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          Lumapse
        </div>
        <button id="btn-close-drawer" class="icon-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="drawer__content">
        <!-- Search (RF-015) -->
        <div class="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="drawer-search-input" placeholder="Buscar notas..." autocomplete="off">
        </div>

        <!-- Navegación por materia (DP-002 / Paso 9) -->
        <nav class="drawer__subjects">
          <div class="drawer__subjects-header">
            <span class="drawer__subjects-title">Materias</span>
            <button id="btn-add-subject" class="drawer__subjects-add" title="Nueva materia">+</button>
          </div>
          <div id="subject-form-container" class="drawer__subject-form" style="display:none">
            <input type="text" id="subject-name-input" class="drawer__subject-form-input" placeholder="Nombre de materia" maxlength="40" autocomplete="off">
            <div id="subject-color-picker" class="drawer__color-picker"></div>
            <div class="drawer__subject-form-actions">
              <button id="btn-subject-cancel" class="drawer__subject-form-btn">Cancelar</button>
              <button id="btn-subject-save" class="drawer__subject-form-btn drawer__subject-form-btn--primary">Crear</button>
            </div>
          </div>
          <button id="btn-inbox" class="drawer__subject-btn drawer__subject-btn--active" data-subject="inbox">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
            <span>Entrada</span>
            <span id="inbox-count" class="drawer__subject-count">0</span>
          </button>
          <div id="subjects-list"></div>
        </nav>

        <!-- Filtro: Archivadas -->
        <button id="btn-toggle-archived" class="drawer__nav-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
          <span id="archived-btn-label">Ver archivadas</span>
        </button>

        <!-- Toggle Tema (RF-019) -->
        <button id="btn-toggle-theme" class="drawer__nav-btn">
          <svg id="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>
          <span id="theme-btn-label">Cambiar tema</span>
        </button>
        
        <!-- Heatmap (RF-017) -->
        <div id="heatmap-container"></div>
      </div>
    </aside>
    <div id="drawer-backdrop" class="drawer-backdrop"></div>

    <!-- Main Content -->
    <main class="main-layout">
      <div class="feed-container">
        <header class="app-header">
          <div class="app-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            Lumapse
          </div>
          <button id="btn-open-drawer" class="icon-btn" title="Menú">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </header>
        
        <!-- Composer (crear/editar nota) -->
        <section id="composer-container"></section>
        
        <!-- Timeline (lista de notas) -->
        <section id="feed-items-container"></section>
      </div>
    </main>
  `
  
  // Instanciar componentes
  const composerContainer = document.getElementById('composer-container')
  new Composer(composerContainer)
  
  const feedItemsContainer = document.getElementById('feed-items-container')
  new Feed(feedItemsContainer)

  new Heatmap('heatmap-container')
  
  // --- Drawer Navigation ---
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

      return `
        <div class="drawer__subject-group">
          <button class="drawer__subject-btn${isActive ? ' drawer__subject-btn--active' : ''}" data-subject="${subject.id}">
            <span class="drawer__subject-color" style="background-color: ${subject.color}"></span>
            <span class="drawer__subject-name">${escapeHtml(subject.name)}</span>
            <span class="drawer__subject-count">${subject.noteCount || 0}</span>
          </button>
          ${childrenHtml}
        </div>
      `
    }).join('')
  }

  function escapeHtml(text) {
    if (!text) return ''
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
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

  // Cargar datos iniciales
  await NoteStore.loadSubjects()
  await NoteStore.loadNotes()
}

// Iniciar aplicación
initApp()
