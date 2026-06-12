// =============================================================
// NoteStore.errors.js — Canal de errores de dominio del store
// =============================================================

import { DatabaseError } from '../services/sqlite/errors.js'

const errorSubscribers = new Set()

function createStoreErrorEvent(operation, message, cause) {
  return Object.freeze({
    operation,
    message,
    cause,
  })
}

export function emitStoreError({ operation, message, cause }) {
  const event = createStoreErrorEvent(operation, message, cause)

  for (const callback of errorSubscribers) {
    try {
      callback(event)
    } catch (error) {
      console.warn('[NoteStore] store error subscriber failed:', error)
    }
  }

  return event
}

export function subscribeToStoreErrors(callback) {
  errorSubscribers.add(callback)
  return () => errorSubscribers.delete(callback)
}

export async function runStoreAction(operation, errorMessage, action) {
  try {
    return await action()
  } catch (error) {
    console.error(`[NoteStore] ${operation} failed:`, error)

    if (error instanceof DatabaseError) {
      emitStoreError({
        operation,
        message: errorMessage,
        cause: error,
      })
      return undefined
    }

    throw error
  }
}
