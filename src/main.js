// Lumapse — Punto de entrada principal
// Hito 02: Core del Editor

import './styles/main.css'
import * as NoteStore from './store/NoteStore.js'

// --- Exponer NoteStore en consola para testing (temporal) ---
window.NoteStore = NoteStore

const app = document.getElementById('app')

app.innerHTML = `
  <div class="splash">
    <h1 class="splash__logo">lumapse</h1>
    <p class="splash__tagline">Tu espacio de notas. Offline. Siempre.</p>
    <span class="splash__badge">hito 01 — fundación</span>
  </div>
`
