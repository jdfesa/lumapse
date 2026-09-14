// =============================================================
// Toast — Feedback no intrusivo
// Hito 04: Organización y UX
//
// Responsabilidad: Mostrar errores y actualizaciones pendientes en el DOM.
// =============================================================

const TOAST_DURATION_MS = 4000
const TOAST_EXIT_MS = 200
const pendingRefreshToasts = new WeakMap()
function ensureToastContainer() {
  let container = document.getElementById('toast-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'toast-container'
    container.setAttribute('aria-live', 'polite')
    container.setAttribute('aria-atomic', 'true')
    document.body.appendChild(container)
  }
  return container
}
/**
 * Muestra un toast de error no-intrusivo.
 * Se auto-destruye después de 4 segundos.
 * @param {string} message Mensaje para el usuario (en español)
 */
export function showErrorToast(message) {
  if (typeof document === 'undefined') return

  const container = ensureToastContainer()
  const toast = document.createElement('div')
  toast.className = 'toast toast--error'
  toast.textContent = message
  container.appendChild(toast)

  setTimeout(() => {
    toast.classList.add('toast--leaving')
    setTimeout(() => toast.remove(), TOAST_EXIT_MS)
  }, TOAST_DURATION_MS)
}

/**
 * Aviso persistente de guardado confirmado. Actualizar solo repite lecturas;
 * cerrar el aviso no modifica la entidad (la carga normal también recupera datos).
 */
export function showPendingRefreshToast(event) {
  if (typeof document === 'undefined') return
  if (pendingRefreshToasts.has(event)) return pendingRefreshToasts.get(event)

  const toast = document.createElement('div')
  toast.className = 'toast toast--pending-refresh'
  const message = document.createElement('div')
  message.setAttribute('role', 'status')
  message.textContent = event.message
  const actions = document.createElement('div')
  actions.className = 'toast__actions'
  const retry = document.createElement('button')
  retry.type = 'button'
  retry.className = 'toast__action'
  retry.textContent = 'Actualizar'
  const dismiss = document.createElement('button')
  dismiss.type = 'button'
  dismiss.className = 'toast__action'
  dismiss.textContent = 'Cerrar aviso'
  dismiss.addEventListener('click', () => toast.remove())
  retry.addEventListener('click', async () => {
    if (retry.disabled) return
    retry.disabled = true
    retry.textContent = 'Actualizando...'
    try {
      if (await event.retry()) {
        toast.remove()
        return
      }
    } catch (error) {
      // Protección del límite UI si un proveedor de recuperación rechaza.
      console.warn('[Toast] No se pudo actualizar la información:', error)
    }
    message.textContent = `${event.message} No se pudo actualizar; podés volver a intentarlo.`
    retry.disabled = false
    retry.textContent = 'Actualizar'
  })
  actions.append(retry, dismiss)
  toast.append(message, actions)
  pendingRefreshToasts.set(event, toast)
  ensureToastContainer().appendChild(toast)
  return toast
}
