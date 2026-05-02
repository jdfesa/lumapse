// Lumapse — Punto de entrada principal
// Hito 02: Core del Editor

import './styles/main.css'
import * as NoteStore from './store/NoteStore.js'
import { NoteList } from './components/NoteList.js'

async function initApp() {
  const app = document.getElementById('app')
  
  // Restablecer estilos de #app para el layout completo
  app.style.display = 'flex'
  app.style.width = '100vw'
  app.style.height = '100vh'
  app.style.alignItems = 'stretch'
  app.style.justifyContent = 'flex-start'
  
  // Construir Layout inicial (Sidebar + Main Editor Placeholder)
  app.innerHTML = `
    <div id="sidebar-container"></div>
    <main id="editor-container" style="flex: 1; display: flex; align-items: center; justify-content: center; color: var(--color-text-muted);">
      <div style="text-align: center;">
        <p>Selecciona una nota de la lista o crea una nueva para comenzar.</p>
      </div>
    </main>
  `
  
  // Instanciar componentes
  const sidebarContainer = document.getElementById('sidebar-container')
  new NoteList(sidebarContainer)
  
  // Cargar datos iniciales (esto disparará el renderizado de la lista)
  await NoteStore.loadNotes()
}

// Iniciar aplicación
initApp()
