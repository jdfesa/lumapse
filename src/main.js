// Lumapse — Punto de entrada principal
// Hito 01: Bootstrap del proyecto

import './styles/main.css'

const app = document.getElementById('app')

app.innerHTML = `
  <div class="splash">
    <h1 class="splash__logo">lumapse</h1>
    <p class="splash__tagline">Tu espacio de notas. Offline. Siempre.</p>
    <span class="splash__badge">hito 01 — fundación</span>
  </div>
`
