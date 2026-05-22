// =============================================================
// Lumapse — Punto de entrada principal
// Hito 04: Interfaz Microblog (estilo Memos)
//
// Responsabilidad: Orquestar la inicialización de la app.
// La estructura HTML está en layout/appShell.js y la lógica
// interactiva del drawer en layout/drawerController.js.
// =============================================================

import './styles/main.css'
import { initDatabase } from './services/sqlite/connection.js'
import * as NoteStore from './store/NoteStore.js'
import * as ThemeService from './services/ThemeService.js'
import { SUBJECT_COLORS } from './services/SubjectService.js'
import { NoteList as Feed } from './components/NoteList.js'
import { NoteEditor as Composer } from './components/NoteEditor.js'
import { Heatmap } from './components/Heatmap.js'
import { renderAppShell } from './layout/appShell.js'
import { initDrawer } from './layout/drawerController.js'

async function initApp() {
  // 1. Inicializar base de datos SQLite
  await initDatabase()
  
  // 2. Renderizar el shell HTML
  const app = document.getElementById('app')
  app.innerHTML = renderAppShell()
  
  // 3. Instanciar componentes
  new Composer(document.getElementById('composer-container'))
  new Feed(document.getElementById('feed-items-container'))
  new Heatmap('heatmap-container')
  
  // 4. Inicializar drawer (búsqueda, materias, tema, archivados)
  initDrawer({ NoteStore, ThemeService, SUBJECT_COLORS })

  // 5. Calendar popup toggle (DP-006)
  const btnCalendar = document.getElementById('btn-toggle-calendar')
  const calendarPopup = document.getElementById('calendar-popup')

  btnCalendar.addEventListener('click', (e) => {
    e.stopPropagation()
    calendarPopup.classList.toggle('is-open')
  })

  calendarPopup.addEventListener('click', (e) => {
    e.stopPropagation()
  })

  document.addEventListener('click', () => {
    calendarPopup.classList.remove('is-open')
  })
  
  // 6. Cargar datos iniciales
  await NoteStore.loadSubjects()
  await NoteStore.loadNotes()
}

// Iniciar aplicación
initApp()
