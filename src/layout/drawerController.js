// =============================================================
// layout/drawerController — Lógica del Drawer (sidebar)
// Hito 04: Interfaz Microblog (estilo Memos)
//
// Responsabilidad: Inicializar apertura/cierre del drawer,
// búsqueda y filtro de archivados. Delega materias y tema
// a submódulos drawerSubjects y drawerTheme.
// =============================================================

import { initSubjects } from './drawerSubjects.js'
import { initTheme } from './drawerTheme.js'

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

  // --- Papelera de Reciclaje (RF-026) ---
  const btnTrash = document.getElementById('btn-trash')
  const trashCount = document.getElementById('trash-count')

  btnTrash.addEventListener('click', () => {
    showingArchived = false
    archivedLabel.textContent = 'Ver archivadas'
    btnArchiveToggle.classList.remove('drawer__nav-btn--active')
    NoteStore.setViewTrash()
    updateSubjectActiveState(null)
    closeDrawer()
  })

  // --- Subjects Navigation (Paso 9) ---
  const { updateSubjectActiveState, renderSubjects } = initSubjects({
    NoteStore,
    SUBJECT_COLORS,
    closeDrawer,
    getShowingArchived: () => showingArchived,
    resetArchived: () => {
      showingArchived = false
      archivedLabel.textContent = 'Ver archivadas'
      btnArchiveToggle.classList.remove('drawer__nav-btn--active')
    }
  })

  // Suscribirse a cambios del store para re-renderizar materias y trash badge
  NoteStore.subscribe((state) => {
    renderSubjects(state.subjects)
    // Actualizar badge de papelera
    if (state.trashCount > 0) {
      trashCount.textContent = state.trashCount
      trashCount.style.display = ''
    } else {
      trashCount.style.display = 'none'
    }
    // Actualizar estado activo del botón papelera
    btnTrash.classList.toggle('drawer__nav-btn--active', state.viewMode === 'trash')
  })

  // --- Theme Toggle (RF-019) ---
  initTheme(ThemeService)
}
