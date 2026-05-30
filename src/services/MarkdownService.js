// =============================================================
// MarkdownService — Renderizado de Markdown a HTML seguro
// Hito 03: MVP Completo
//
// Responsabilidad: Recibir texto en formato Markdown y devolver
// HTML sanitizado listo para insertar en el DOM.
//
// Dependencias:
//   - marked (v18)  → Parser de Markdown a HTML
//   - DOMPurify (v3) → Sanitizador de HTML contra XSS
//
// Uso:
//   import { renderMarkdown } from './services/MarkdownService.js'
//   const html = renderMarkdown('# Hola **mundo**')
//
// RFs cubiertos: RF-010 (renderizado en tiempo real),
//                RF-011 (sintaxis Markdown básica)
// =============================================================

import { marked } from 'marked'
import DOMPurify from 'dompurify'

// -------------------------------------------------------------
// Configuración de marked
// -------------------------------------------------------------
// Activamos solo las opciones necesarias para un editor de notas
// estudiantil. No habilitamos HTML crudo dentro del Markdown
// porque DOMPurify ya se encarga de sanitizar la salida.

marked.setOptions({
  breaks: true,       // Saltos de línea con Enter (sin necesidad de doble espacio)
  gfm: true,          // GitHub Flavored Markdown (tablas, tachado, etc.)
})

const TASK_LINE_REGEX = /^\s*[-*+]\s+\[[ xX]\]\s+/

function getTaskLineNumbers(markdown) {
  return markdown
    .split('\n')
    .reduce((lineNumbers, line, index) => {
      if (TASK_LINE_REGEX.test(line)) {
        lineNumbers.push(index)
      }
      return lineNumbers
    }, [])
}

// -------------------------------------------------------------
// Sintaxis soportada (RF-011):
//   ✅ Encabezados (# ## ### etc.)
//   ✅ Negritas (**texto**)
//   ✅ Cursivas (*texto* o _texto_)
//   ✅ Listas ordenadas y desordenadas
//   ✅ Código inline (`código`)
//   ✅ Bloques de código (```)
//   ✅ Enlaces [texto](url)
//   ✅ Tachado (~~texto~~)  — vía GFM
//   ✅ Tablas                — vía GFM
// -------------------------------------------------------------

/**
 * Renderiza texto Markdown a HTML sanitizado.
 *
 * @param {string} markdown — Texto en formato Markdown
 * @param {object} [options] — Opciones de renderizado
 * @param {number} [options.lineOffset] — Offset para mantener data-line real al renderizar fragmentos
 * @returns {string} — HTML seguro listo para innerHTML
 *
 * @example
 *   renderMarkdown('# Título')
 *   // → '<h1>Título</h1>'
 *
 *   renderMarkdown('**negrita** y *cursiva*')
 *   // → '<p><strong>negrita</strong> y <em>cursiva</em></p>'
 */
export function renderMarkdown(markdown, options = {}) {
  if (!markdown || typeof markdown !== 'string') {
    return ''
  }
  const lineOffset = Number.isInteger(options.lineOffset) ? options.lineOffset : 0

  // 1. Parsear Markdown → HTML crudo
  const rawHtml = marked.parse(markdown)

  // 2. Sanitizar HTML para prevenir XSS
  //    DOMPurify elimina scripts, event handlers y cualquier
  //    contenido potencialmente peligroso.
  //
  //    ── Decisión de seguridad (Paso 7, Hito 04 — rev. 2) ──
  //    Se PERMITE la etiqueta <img> con src local (data:, blob:,
  //    rutas relativas) pero se BLOQUEAN URLs externas (http/https).
  //
  //    Política de dos capas (defensa en profundidad):
  //    Capa 1 — DOMPurify (este archivo): el hook afterSanitizeAttributes
  //      elimina src con http:// o https:// en <img>.
  //    Capa 2 — CSP (index.html): el meta tag Content-Security-Policy
  //      restringe img-src a 'self' data: blob: capacitor://localhost,
  //      bloqueando a nivel de WebView cualquier request externo.
  //
  //    Esto permite al usuario insertar imágenes locales en sus
  //    apuntes (data URI, blob, ruta relativa) sin exponer su IP
  //    ante un pixel espía remoto.
  //    ─────────────────────────────────────────────

  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    // Whitelist estricta: solo tags necesarios para notas de texto
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'strong', 'em', 'del', 's',
      'ul', 'ol', 'li',
      'blockquote',
      'code', 'pre',
      'a',
      'img',
      'input',  // checkboxes de task lists
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    // Atributos permitidos: solo los necesarios para enlaces
    ALLOWED_ATTR: [
      'href', 'target', 'rel',     // enlaces
      'src', 'alt',                 // imágenes locales (data:, blob:, relativas)
      'class',                      // estilos de bloques de código
      'type', 'checked',            // checkboxes de task lists
      'data-line',                   // índice de línea para toggle de checkbox
    ],
    // Blacklist explícita como defensa en profundidad
    // (redundante con ALLOWED_TAGS, pero protege ante errores de config)
    FORBID_TAGS: [
      // img PERMITIDO con src local — ver decisión de seguridad arriba
      // input PERMITIDO solo type=checkbox — ver ALLOWED_TAGS arriba
      'script', 'iframe', 'object', 'embed',
      'form', 'textarea', 'select', 'button',
      'style', 'link', 'meta', 'base', 'svg', 'math',
    ],
    // Blacklist de atributos peligrosos
    FORBID_ATTR: [
      'onerror', 'onload', 'onclick', 'onmouseover',
      'onfocus', 'onblur', 'onsubmit', 'onchange',
      // src PERMITIDO en img — filtrado por hook afterSanitizeAttributes
      'srcset', 'data', 'action', 'formaction',
      'xlink:href', 'poster', 'background',
    ],
    // Los enlaces se abren en nueva pestaña por seguridad
    ADD_ATTR: ['target'],
  })

  // Post-proceso: habilitar checkboxes interactivos con número de línea real.
  // El handler usa data-line para togglear la línea exacta del markdown.
  const taskLineNumbers = getTaskLineNumbers(markdown)
  let checkboxIndex = 0
  const processedHtml = cleanHtml.replace(
    /<input\b([^>]*\btype=["']?checkbox["']?[^>]*)>/gi,
    (_match, attrs) => {
      const lineNumber = (taskLineNumbers[checkboxIndex] ?? checkboxIndex) + lineOffset
      checkboxIndex++
      const isChecked = attrs.includes('checked')
      return `<input type="checkbox" data-line="${lineNumber}"${isChecked ? ' checked' : ''}>`
    }
  )

  return processedHtml
}


// -------------------------------------------------------------
// Hook de defensa en profundidad: URLs externas
// -------------------------------------------------------------
// Elimina cualquier atributo que contenga una URL http/https
// en tags que hayan sobrevivido la sanitización. Esto protege
// contra configuraciones futuras que agreguen tags con atributos
// de carga de recursos sin considerar el contexto offline-first.
//
// El hook se registra una sola vez al cargar el módulo.
// -------------------------------------------------------------
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  // Verificar href en enlaces: permitir solo URLs relativas o anclas
  if (node.tagName === 'A') {
    const href = node.getAttribute('href') || ''
    // Bloquear javascript: en href (XSS clásico)
    if (href.startsWith('javascript:') || href.startsWith('data:')) {
      node.removeAttribute('href')
      node.setAttribute('rel', 'noopener noreferrer')
    }
    // Forzar rel seguro en enlaces externos
    if (href.startsWith('http://') || href.startsWith('https://')) { // lumapse-ignore-offline
      node.setAttribute('rel', 'noopener noreferrer nofollow')
      node.setAttribute('target', '_blank')
    }
  }

  // Defensa para <img>: permitir solo src local (data:, blob:, relativo)
  // Bloquear cualquier src externo (http/https) para prevenir tracking
  if (node.tagName === 'IMG' && node.hasAttribute('src')) {
    const src = node.getAttribute('src')
    if (src.startsWith('http://') || src.startsWith('https://')) {
      node.removeAttribute('src')
    }
  }

  // Defensa general: eliminar src/srcset/data en tags que NO sean img
  // (no debería ocurrir con la config actual, pero protege ante cambios)
  if (node.tagName !== 'IMG') {
    for (const attr of ['src', 'srcset', 'data', 'poster', 'background']) {
      if (node.hasAttribute(attr)) {
        node.removeAttribute(attr)
      }
    }
  }
})

/**
 * Verifica si un texto contiene sintaxis Markdown.
 * Útil para decidir si mostrar el panel de preview.
 *
 * @param {string} text — Texto a evaluar
 * @returns {boolean} — true si contiene sintaxis Markdown reconocible
 */
export function hasMarkdownSyntax(text) {
  if (!text || typeof text !== 'string') {
    return false
  }

  // Patrones básicos de Markdown
  const markdownPatterns = [
    /^#{1,6}\s/m,           // Encabezados
    /\*\*.+\*\*/,           // Negritas
    /\*.+\*/,               // Cursivas
    /^[-*+]\s/m,            // Listas desordenadas
    /^\d+\.\s/m,            // Listas ordenadas
    /`.+`/,                 // Código inline
    /^```/m,                // Bloques de código
    /\[.+\]\(.+\)/,         // Enlaces
    /~~.+~~/,               // Tachado
  ]

  return markdownPatterns.some(pattern => pattern.test(text))
}
