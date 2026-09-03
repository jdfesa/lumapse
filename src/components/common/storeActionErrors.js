// =============================================================
// storeActionErrors — Límite de errores de mutaciones en UI
// =============================================================

import { DatabaseError } from '../../services/sqlite/errors.js'

/**
 * Consume un rechazo de mutación en el límite UI sin duplicar feedback.
 * Los DatabaseError ya fueron emitidos por NoteStore y main muestra su toast.
 * Los errores inesperados pertenecen al consumidor que conoce el contexto.
 */
export function handleStoreMutationError(error, { context = 'UI', onUnexpected } = {}) {
  if (error instanceof DatabaseError) return

  if (onUnexpected) {
    onUnexpected(error)
    return
  }

  console.error(`[${context}] Error inesperado en mutación del store:`, error)
}
