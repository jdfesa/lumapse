import './ConfirmDialog.css'

const DIALOG_EXIT_MS = 120
let activeDialog = null

function createButton(text, className) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = className
  button.textContent = text
  return button
}

function closeDialog(backdrop, resolve, result, cleanup) {
  backdrop.classList.add('dialog-backdrop--leaving')
  setTimeout(() => {
    cleanup()
    backdrop.remove()
    activeDialog = null
    resolve(result)
  }, DIALOG_EXIT_MS)
}

export function confirmDialog({ title = '', message, confirmText = 'Confirmar', cancelText = 'Cancelar', danger = false } = {}) {
  if (typeof document === 'undefined' || activeDialog) return Promise.resolve(false)
  return new Promise((resolve) => {
    const previousFocus = document.activeElement
    const backdrop = document.createElement('div')
    const dialog = document.createElement('div')
    const messageEl = document.createElement('p')
    const actions = document.createElement('div')
    const cancelBtn = createButton(cancelText, 'dialog__btn dialog__btn--cancel')
    const confirmBtn = createButton(confirmText, `dialog__btn dialog__btn--confirm${danger ? ' dialog__btn--danger' : ''}`)
    let closing = false
    backdrop.className = 'dialog-backdrop'
    backdrop.setAttribute('role', 'presentation')
    dialog.className = 'dialog'
    dialog.setAttribute('role', 'alertdialog')
    dialog.setAttribute('aria-modal', 'true')
    dialog.setAttribute('aria-describedby', 'dialog-message')

    if (title) {
      const titleEl = document.createElement('h2')
      titleEl.className = 'dialog__title'
      titleEl.id = 'dialog-title'
      titleEl.textContent = title
      dialog.setAttribute('aria-labelledby', 'dialog-title')
      dialog.appendChild(titleEl)
    } else {
      dialog.setAttribute('aria-label', confirmText)
    }
    messageEl.className = 'dialog__message'
    messageEl.id = 'dialog-message'
    messageEl.textContent = message || ''
    actions.className = 'dialog__actions'
    actions.append(cancelBtn, confirmBtn)
    dialog.append(messageEl, actions)
    backdrop.appendChild(dialog)
    const cleanup = () => {
      document.removeEventListener('keydown', handleKeydown)
      previousFocus?.focus?.()
    }
    const focusables = [cancelBtn, confirmBtn]
    const finish = (result) => {
      if (closing) return
      closing = true
      closeDialog(backdrop, resolve, result, cleanup)
    }
    function handleKeydown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        finish(false)
      } else if (event.key === 'Tab') {
        event.preventDefault()
        const currentIndex = focusables.indexOf(document.activeElement)
        const atStart = currentIndex <= 0
        const atEnd = currentIndex >= focusables.length - 1
        const nextIndex = event.shiftKey ? (atStart ? focusables.length - 1 : currentIndex - 1) : (atEnd ? 0 : currentIndex + 1)
        focusables[nextIndex].focus()
      } else if (event.key === 'Enter' && document.activeElement === confirmBtn) {
        event.preventDefault()
        finish(true)
      }
    }
    activeDialog = backdrop
    document.body.appendChild(backdrop)
    document.addEventListener('keydown', handleKeydown)
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) finish(false)
    })
    cancelBtn.addEventListener('click', () => finish(false))
    confirmBtn.addEventListener('click', () => finish(true))
    cancelBtn.focus()
  })
}
