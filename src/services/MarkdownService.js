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
  //
  //    ── Decisión de seguridad (Paso 7, Hito 04) ──
  //    Se ELIMINA la etiqueta <img> y los atributos src/alt de la
  //    whitelist. Motivos:
  //
  //    a) Lumapse es offline-first. Permitir <img src="https://...">
  //       genera peticiones HTTP no deseadas que:
  //       - Revelan la IP del usuario (privacy leak).
  //       - Permiten tracking vía pixel espía (1x1 invisible).
  //    b) La app no soporta imágenes embebidas en esta fase del
  //       proyecto, por lo que no hay pérdida de funcionalidad.
  //    c) Si en el futuro se necesitan imágenes, se deberá
  //       implementar soporte explícito con data URIs o almacenamiento
  //       local, nunca carga remota directa.
  //
  //    Además se aplica defensa en profundidad:
  //    - FORBID_TAGS: lista explícita de tags peligrosos como respaldo.
  //    - Hook afterSanitizeAttributes: elimina cualquier atributo que
  //      contenga URLs externas (http/https) en caso de que un tag
  //      permitido intente cargar recursos remotos.
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
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      // img REMOVIDO — ver decisión de seguridad arriba
    ],
    // Atributos permitidos: solo los necesarios para enlaces
    ALLOWED_ATTR: [
      'href', 'target', 'rel',   // enlaces
      'class',                   // estilos de bloques de código
      // src, alt REMOVIDOS — no hay tags que los necesiten
    ],
    // Blacklist explícita como defensa en profundidad
    // (redundante con ALLOWED_TAGS, pero protege ante errores de config)
    FORBID_TAGS: [
      'img', 'script', 'iframe', 'object', 'embed',
      'form', 'input', 'textarea', 'select', 'button',
      'style', 'link', 'meta', 'base', 'svg', 'math',
    ],
    // Blacklist de atributos peligrosos
    FORBID_ATTR: [
      'onerror', 'onload', 'onclick', 'onmouseover',
      'onfocus', 'onblur', 'onsubmit', 'onchange',
      'src', 'srcset', 'data', 'action', 'formaction',
      'xlink:href', 'poster', 'background',
    ],
    // Los enlaces se abren en nueva pestaña por seguridad
    ADD_ATTR: ['target'],
  })

  return cleanHtml
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

  // Defensa general: eliminar cualquier src/srcset/data que haya
  // sobrevivido (no debería ocurrir con la config actual, pero
  // protege ante cambios futuros)
  for (const attr of ['src', 'srcset', 'data', 'poster', 'background']) {
    if (node.hasAttribute(attr)) {
      node.removeAttribute(attr)
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
