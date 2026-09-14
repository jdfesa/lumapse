// Refrescos secundarios: nunca convierten una escritura confirmada en un fallo.
// La composición presenta el aviso; el store solo ofrece recuperación de lecturas.
import { notify } from './NoteStore.state.js'

const pendingRefreshSubscribers = new Set()

export function subscribeToPendingRefreshes(callback) {
  pendingRefreshSubscribers.add(callback)
  return () => pendingRefreshSubscribers.delete(callback)
}

function createReadOnlyRetry(refresh) {
  let inFlight = null
  let recovered = false

  return () => {
    if (recovered) return Promise.resolve(true)
    if (inFlight) return inFlight

    inFlight = Promise.resolve().then(async () => {
      try {
        // Un loader con ownership puede descartar una respuesta obsoleta.
        // Eso no confirma que esta recuperación haya actualizado el estado.
        if (await refresh() === false) return false
        notify()
        recovered = true
        return true
      } catch (error) {
        console.warn('[NoteStore] La actualización sigue pendiente:', error)
        return false
      } finally {
        inFlight = null
      }
    })
    return inFlight
  }
}

export async function refreshAfterWrite({ operation, entityId, message, refresh }) {
  try {
    await refresh()
    notify()
  } catch (cause) {
    // La entidad ya está en memoria: publicarla incluso si no hubo recarga.
    // Un consumidor defectuoso tampoco debe invitar a repetir el INSERT.
    try {
      notify()
    } catch (error) {
      console.warn('[NoteStore] No se pudo publicar el estado persistido:', error)
    }

    console.warn('[NoteStore] Escritura confirmada; actualización pendiente:', cause)
    const event = Object.freeze({
      operation, entityId, message, cause, retry: createReadOnlyRetry(refresh),
    })
    for (const callback of pendingRefreshSubscribers) {
      try {
        callback(event)
      } catch (error) {
        console.warn('[NoteStore] Falló un consumidor del aviso de actualización:', error)
      }
    }
  }
}
