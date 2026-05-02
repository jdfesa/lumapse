// Lumapse — Punto de entrada principal
// Hito 02: Core del Editor

import './styles/main.css'
import * as NoteStore from './store/NoteStore.js'
import { NoteList } from './components/NoteList.js'

import { NoteEditor } from './components/NoteEditor.js'

async function initApp() {
  const app = document.getElementById('app')
  
  // Restablecer estilos de #app para el layout completo
  app.style.display = 'flex'
  app.style.width = '100vw'
  app.style.height = '100vh'
  app.style.alignItems = 'stretch'
  app.style.justifyContent = 'flex-start'
  app.style.overflow = 'hidden' // Evitar scroll del body
  
  // Construir Layout inicial (Sidebar + Main Editor)
  app.innerHTML = `
    <div id="sidebar-container"></div>
    <main id="editor-container" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;"></main>
  `
  
  // Instanciar componentes
  const sidebarContainer = document.getElementById('sidebar-container')
  new NoteList(sidebarContainer)
  
  const editorContainer = document.getElementById('editor-container')
  new NoteEditor(editorContainer)
  
  // Cargar datos iniciales
  await NoteStore.loadNotes()
}

// Iniciar aplicación
initApp()
