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
import { SUBJECT_COLORS, autoPurge } from './services/SubjectService.js'
import { NoteList as Feed } from './components/feed/NoteList.js'
import { NoteEditor as Composer } from './components/note-editor/NoteEditor.js'
import { Heatmap } from './components/academic-events/Heatmap.js'
import { UpcomingAcademicEvents } from './components/academic-events/UpcomingAcademicEvents.js'
import { confirmDialog } from './components/common/ConfirmDialog.js'
import { renderAppShell } from './layout/appShell.js'
import { initDrawer } from './layout/drawerController.js'
// import { seedTiktokData, seedStressTest } from './utils/seeder.js'

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
  new UpcomingAcademicEvents('upcoming-academic-events-container')
  
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

  /* 
  // 6. Test & QA Seeders (Ocultos por defecto)
  document.getElementById('btn-seed-tiktok')?.addEventListener('click', async () => {
    await seedTiktokData()
  })
  
  document.getElementById('btn-seed-stress')?.addEventListener('click', async () => {
    await seedStressTest(1000)
  })
  */

  document.addEventListener('click', () => {
    calendarPopup.classList.remove('is-open')
  })
  
  // 6. Cargar datos iniciales
  await NoteStore.loadSubjects()
  await NoteStore.loadNotes()
  await NoteStore.loadAcademicEvents()
  const today = new Date()
  await NoteStore.loadAcademicEventsByMonth(today.getFullYear(), today.getMonth() + 1)
  await NoteStore.loadUpcomingAcademicEvents()

  // 7. Auto-purgado de papelera (RF-026): elimina items > 30 días
  try {
    await autoPurge(30)
    console.log('[Lumapse] Auto-purge completado.')
  } catch (err) {
    console.warn('[Lumapse] Error en auto-purge:', err)
  }

  // 8. Cargar conteo de papelera (para badge)
  await NoteStore.loadTrashCount()

  // 9. Toast de alerta de papelera (RF-026)
  const trashToast = document.getElementById('trash-warning-toast')
  const btnEmptyTrashToast = document.getElementById('btn-empty-trash-toast')
  const btnDismissToast = document.getElementById('btn-dismiss-toast')

  NoteStore.subscribe((state) => {
    if (state.showTrashWarning && trashToast.style.display === 'none') {
      trashToast.style.display = ''
    }
  })

  btnDismissToast?.addEventListener('click', () => {
    trashToast.style.display = 'none'
  })

  btnEmptyTrashToast?.addEventListener('click', async () => {
    const confirmed = await confirmDialog({
      title: 'Vaciar papelera',
      message: '¿Vaciar toda la papelera? Esta acción no se puede deshacer.',
      confirmText: 'Vaciar',
      danger: true,
    })
    if (confirmed) {
      await NoteStore.emptyTrash()
      trashToast.style.display = 'none'
    }
  })
}

// Iniciar aplicación
initApp()
