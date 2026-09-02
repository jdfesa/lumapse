function toPresentationString(value) {
  if (value === null || value === undefined) return ''

  try {
    return String(value)
  } catch {
    return ''
  }
}

/**
 * Codifica un valor para insertarlo como texto dentro de HTML.
 * @param {unknown} value Valor de presentacion
 * @returns {string} Texto codificado
 */
export function escapeHtmlText(value) {
  return toPresentationString(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Codifica un valor para insertarlo en un atributo HTML entre comillas.
 * @param {unknown} value Valor de presentacion
 * @returns {string} Valor de atributo codificado
 */
export function escapeHtmlAttribute(value) {
  return toPresentationString(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
