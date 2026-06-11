// =============================================================
// Toast — Feedback no intrusivo
// Hito 04: Organización y UX
//
// Responsabilidad: Mostrar mensajes temporales de error en el DOM.
// =============================================================

const TOAST_DURATION_MS = 4000
const TOAST_EXIT_MS = 200
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
