import { parseHexColor, parseISODate } from '../../domain/primitiveValidation.ts'

/**
 * Devuelve un color CSS apto para presentacion o null si el dato persistido es invalido.
 * @param {unknown} value Color potencialmente contaminado
 * @returns {string|null} Color hexadecimal canonico
 */
export function getSafeHexColor(value) {
  try {
    return parseHexColor(value)
  } catch {
    return null
  }
}

/**
 * Devuelve una fecha de calendario valida o null para datos persistidos invalidos.
 * @param {unknown} value Fecha potencialmente contaminada
 * @returns {string|null} Fecha YYYY-MM-DD valida
 */
export function getSafeISODate(value) {
  try {
    return parseISODate(value)
  } catch {
    return null
  }
}
