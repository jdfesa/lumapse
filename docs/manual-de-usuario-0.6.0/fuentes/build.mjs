import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { marked } from './vendor/marked/marked.esm.js'
import { SCENES, follow, targetFor, gestureAt, EASE_SECONDS, TOUR_SECONDS, WRITE_TRAVEL, WRITE_SECONDS, MARK_SECONDS } from './model.mjs'

const root = new URL('./', import.meta.url)
const delivery = new URL('../', root)
const read = name => readFileSync(new URL(name, root), 'utf8')
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const source = read('manual-usuario.md')
const sections = source.split(/(?=^## \d\. )/m).slice(1)
if (sections.length !== 4) throw new Error('La fuente debe conservar sus cuatro apartados.')
const shortLabels = [['Principal'], ['Materias', 'Acciones', 'Estados'], ['Calendario', 'Agregar fecha'], ['Opciones']]
const navLabels = ['Escribí', 'Organizá y encontrá', 'Consultá fechas', 'Guardá una copia']
const content = sections.map((chunk, index) => {
  const title = chunk.match(/^## \d\. (.+)/)[1]
  const block = chunk.match(/<div class="figures">[\s\S]*?<\/div>/)?.[0] || ''
  const images = [...block.matchAll(/<figure>[\s\S]*?<img src="([^"]+)" alt="([^"]+)"[^>]*>[\s\S]*?<figcaption>([\s\S]*?)<\/figcaption><\/figure>/g)]
  const body = chunk.replace(/^## .+\n/, '').replace(block, '').trim()
  const copy = marked.parse(body)
  const gallery = images.map((match, i) => {
    const path = match[1].replace(/^\.\.\//, '')
    if (!path.startsWith('assets/') || path.includes('..') || !existsSync(new URL(path, delivery))) throw new Error(`Captura local inexistente: ${path}`)
    const alt = match[2]
    const caption = match[3]
    return `<figure class="shot${i === 0 ? ' is-current' : ''}"><a href="${escape(path)}" aria-label="Ampliar: ${escape(caption)}"><img src="${escape(path)}" alt="${escape(alt)}" width="720" height="1280" loading="lazy" decoding="async"></a><figcaption>${caption}</figcaption></figure>`
  }).join('')
  const tabs = images.length > 1 ? `<div class="gallery-tabs" data-enhance role="group" aria-label="Capturas del apartado ${index + 1}">${images.map((_, i) => `<button type="button" data-shot="${i}" aria-pressed="${i === 0}">${shortLabels[index][i]}</button>`).join('')}</div>` : ''
  return `<article class="chapter" id="paso-${index + 1}" aria-labelledby="titulo-${index + 1}"><header class="chapter-heading"><span class="chapter-number" aria-hidden="true">0${index + 1}</span><h2 id="titulo-${index + 1}">${escape(title)}</h2></header><div class="chapter-grid"><div class="chapter-copy">${copy}</div><aside class="gallery" data-gallery aria-label="Pantallas del apartado ${index + 1}"><div class="gallery-head"><span>En tu pantalla</span><span>↗</span></div>${gallery}${tabs}<p class="zoom-hint">Tocá la imagen para ampliarla.</p></aside></div></article>`
}).join('\n')

const unknown = process.argv.slice(2).filter(arg => arg !== '--check')
if (unknown.length) throw new Error(`Argumentos no admitidos: ${unknown.join(', ')}`)
const illustration = read('ilustracion.svg').trim()
const parts = [...illustration.matchAll(/class="figure-part"/g)].length
if (!illustration.startsWith('<svg') || !parts) throw new Error('La ilustración SVG no es válida.')
const notice = `<!--\nAviso de terceros: kit gráfico Anatomy (SVG/CSS incorporados).\n${read('LICENSE-ILUSTRACION.txt').trim()}\n-->\n`
const CSS = read('ilustracion.css') + '\n' + read('style.css')
const runtime = `const EASE_SECONDS=${EASE_SECONDS},WRITE_SECONDS=${WRITE_SECONDS},MARK_SECONDS=${MARK_SECONDS};window.MANUAL_FIGURE={scenes:${JSON.stringify(SCENES)},tourMilliseconds:${TOUR_SECONDS * 1000},follow:${follow.toString()},targetFor:${targetFor.toString()},gestureAt:${gestureAt.toString()},writeTravel:${WRITE_TRAVEL}};\n` + read('app.js')
const scenes = SCENES.map((scene, i) => `<button type="button" data-scene="${i}" data-number="0${i + 1}" aria-pressed="${i === 0}">${scene.label}</button>`).join('')
const nav = navLabels.map((label, i) => `<li><a href="#paso-${i + 1}"${i === 0 ? ' aria-current="location"' : ''}><span>0${i + 1}</span>${label}</a></li>`).join('')
function document(theme = null) {
  return `<!doctype html>
${notice}<html lang="es-AR" data-theme="${theme || 'light'}"${theme ? ` data-initial-theme="${theme}"` : ''}>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="Guía breve e interactiva de Lumapse: escribí, organizá y guardá una copia de tus notas."><meta name="robots" content="noindex"><meta name="color-scheme" content="light dark"><link rel="icon" href="assets/lumapse.png"><title>Lumapse · Guía de usuario</title><style>${CSS}</style></head>
<body id="inicio"><a class="skip" href="#guia">Saltar al manual</a>
<header class="topbar"><a class="brand" href="#inicio"><img src="assets/lumapse.png" alt="" width="33" height="33"><span>Lumapse<small>Guía de usuario</small></span></a><div class="top-actions"><span class="version">ANDROID · 0.6.0</span><button class="theme-button" data-enhance data-theme-toggle type="button" aria-label="Cambiar a tema oscuro">☾</button></div></header>
<main>
<section class="hero" aria-labelledby="manual-title"><div class="hero-copy"><p class="eyebrow">Tus notas. A tu manera.</p><h1 id="manual-title">Una guía breve<br>para <em>tus notas.</em></h1><p class="hero-lead">Escribí lo que importa, encontralo después y guardá una copia.<br>Sin cuenta. Sin depender de internet.</p><a class="hero-link" href="#guia">Empezá por acá <span aria-hidden="true">↓</span></a><p class="hero-foot">CUATRO APARTADOS · A TU RITMO</p></div>
<div class="figure-shell"><div class="anatomy-card iso iso-plate" data-theme="${theme || 'light'}" data-figure><div class="figure-head"><span>Fig. 01</span><strong>El recorrido de un apunte</strong></div><div class="iso-stage">${illustration}</div><div class="figure-foot"><span>Elegí una tarea para explorar</span><span data-readout>${SCENES[0].readout}</span></div></div><div class="scene-controls" data-enhance role="group" aria-label="Explorar las cuatro tareas">${scenes}</div><div class="scene-detail"><p><strong data-scene-title>${SCENES[0].title}</strong><span data-scene-copy>${SCENES[0].body}</span></p><button class="tour-button" data-enhance data-tour type="button" aria-pressed="true">Ⅱ Pausar recorrido</button></div><p class="concept-label">Ilustración conceptual. Las pantallas de Lumapse están más abajo.</p></div></section>
<section class="guide-start" id="guia" aria-labelledby="guide-title"><div><h2 id="guide-title">¿Qué querés hacer?</h2><p>Elegí un apartado o seguí la guía completa.</p></div><label class="guide-search" data-enhance><span aria-hidden="true">⌕</span><input type="search" data-search placeholder="Buscar en esta guía" aria-label="Buscar en esta guía" autocomplete="off"><button type="button" data-search-clear hidden aria-label="Limpiar búsqueda de la guía">×</button></label></section>
<noscript><p>Podés leer la guía completa y abrir las capturas. La exploración animada, la búsqueda y el cambio de tema requieren JavaScript.</p></noscript>
<div class="reader"><nav class="side-nav" aria-label="Índice del manual"><p class="side-label">En esta guía</p><ol>${nav}</ol><div class="progress-track" aria-hidden="true"><div class="progress-bar" data-progress></div></div><span class="progress-label" data-progress-label>Apartado 1 de 4</span></nav>
<div class="chapters"><p class="search-status" data-search-status role="status" hidden></p><div class="no-results" data-no-results hidden><p>No encontramos esa palabra en la guía.</p><button class="tour-button" data-reset-search type="button">Volver a ver todo</button></div>${content}</div></div>
<footer class="page-footer"><div><strong>Tus notas son tuyas.</strong>En tu equipo. Sin cuenta. Sin internet para el uso cotidiano.</div><a href="#inicio">Volver al inicio ↑</a></footer>
</main>
<dialog class="image-dialog" data-image-dialog aria-labelledby="dialog-title"><div class="dialog-bar"><span id="dialog-title" data-dialog-title>Captura de Lumapse</span><button type="button" data-dialog-close>Cerrar ×</button></div><img src="assets/lumapse.png" alt="" width="720" height="1280"><a class="original" href="assets/lumapse.png" target="_blank" rel="noopener">Abrir imagen a tamaño original ↗</a></dialog>
<script>${runtime}</script></body></html>`
}
const target = new URL('Manual-de-usuario-Lumapse.html', delivery)
const output = document()
if (process.argv.includes('--check')) {
  if (!existsSync(target) || readFileSync(target, 'utf8') !== output) {
    console.error('El HTML no coincide con las fuentes. Ejecutá node fuentes/build.mjs desde la carpeta del manual.')
    process.exitCode = 1
  } else console.log('HTML sincronizado con sus fuentes.')
} else {
  writeFileSync(target, output)
  console.log(`Guía generada: ${fileURLToPath(target)}; ${parts} piezas; cuatro apartados.`)
}
