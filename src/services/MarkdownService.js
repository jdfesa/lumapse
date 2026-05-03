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
 * @returns {string} — HTML seguro listo para innerHTML
 *
 * @example
 *   renderMarkdown('# Título')
 *   // → '<h1>Título</h1>'
 *
 *   renderMarkdown('**negrita** y *cursiva*')
 *   // → '<p><strong>negrita</strong> y <em>cursiva</em></p>'
 */
export function renderMarkdown(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return ''
  }

  // 1. Parsear Markdown → HTML crudo
  const rawHtml = marked.parse(markdown)

  // 2. Sanitizar HTML para prevenir XSS
  //    DOMPurify elimina scripts, event handlers y cualquier
  //    contenido potencialmente peligroso.
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    // Permitimos etiquetas seguras para contenido de notas
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'strong', 'em', 'del', 's',
      'ul', 'ol', 'li',
      'blockquote',
      'code', 'pre',
      'a',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img',
    ],
    // Permitimos solo atributos seguros
    ALLOWED_ATTR: [
      'href', 'target', 'rel',   // enlaces
      'src', 'alt',              // imágenes
      'class',                   // estilos de bloques de código
    ],
    // Los enlaces se abren en nueva pestaña por seguridad
    ADD_ATTR: ['target'],
  })

  return cleanHtml
}

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
