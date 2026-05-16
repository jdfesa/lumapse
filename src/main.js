// Lumapse — Punto de entrada principal
// Hito 04: Organización y UX (RF-020 mobile-first)

import './styles/main.css'
import * as NoteStore from './store/NoteStore.js'
import { NoteList } from './components/NoteList.js'
import { NoteEditor } from './components/NoteEditor.js'

/**
 * Detecta si el viewport actual es mobile (<768px).
 * @returns {boolean}
 */
function isMobile() {
  return window.innerWidth < 768
}

async function initApp() {
  const app = document.getElementById('app')
  
  // Construir Layout (Sidebar + Backdrop + Main Editor)
  app.innerHTML = `
    <div id="sidebar-container"></div>
    <div id="sidebar-backdrop" class="sidebar-backdrop"></div>
    <main id="editor-container"></main>
  `
  
  // Instanciar componentes
  const sidebarContainer = document.getElementById('sidebar-container')
  new NoteList(sidebarContainer)
  
  const editorContainer = document.getElementById('editor-container')
  new NoteEditor(editorContainer)
  
  // --- RF-020: Sistema de navegación mobile ---
  
  const backdrop = document.getElementById('sidebar-backdrop')
  
  // Cerrar sidebar al tocar el backdrop
  backdrop.addEventListener('click', () => {
    NoteStore.closeSidebar()
  })
  
  // Reaccionar a cambios de estado del sidebar
  NoteStore.subscribe((state) => {
    if (isMobile()) {
      sidebarContainer.classList.toggle('is-open', state.sidebarOpen)
      backdrop.classList.toggle('is-visible', state.sidebarOpen)
      
      // Prevenir scroll del body cuando sidebar está abierto
      document.body.style.overflow = state.sidebarOpen ? 'hidden' : ''
    } else {
      // En desktop, sidebar siempre visible
      sidebarContainer.classList.remove('is-open')
      backdrop.classList.remove('is-visible')
      document.body.style.overflow = ''
    }
  })
  
  // Escuchar resize para ajustar el layout
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      sidebarContainer.classList.remove('is-open')
      backdrop.classList.remove('is-visible')
      document.body.style.overflow = ''
    }
  })
  
  // Estado inicial: en mobile, mostrar sidebar; en desktop, sidebar ya es visible
  if (isMobile()) {
    NoteStore.openSidebar()
  }
  
  // Cargar datos iniciales
  await NoteStore.loadNotes()
}

// Iniciar aplicación
initApp()
