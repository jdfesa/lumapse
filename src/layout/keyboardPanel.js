// RNF-020: foco de paneles existentes; no intercepta diálogos externos al panel.
const FOCUSABLE = 'button, input, textarea, select, a[href], [tabindex]'

export function createKeyboardPanel({ panel, trigger, initialFocus, modal = false, onChange = () => {} }) {
  const isOpen = () => panel.classList.contains('is-open')
  const setOpen = (open, { restoreFocus = true } = {}) => {
    if (open === isOpen()) return
    panel.toggleAttribute('inert', !open)
    panel.classList.toggle('is-open', open)
    panel.setAttribute('aria-hidden', String(!open))
    trigger.setAttribute('aria-expanded', String(open))
    onChange(open)
    if (open) panel.querySelector(initialFocus)?.focus()
    else if (restoreFocus) trigger.focus()
  }
  panel.setAttribute('inert', '')
  panel.setAttribute('aria-hidden', 'true')
  trigger.setAttribute('aria-expanded', 'false')
  panel.addEventListener('keydown', event => {
    if (event.defaultPrevented || !isOpen()) return
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
    } else if (modal && event.key === 'Tab') {
      const items = [...panel.querySelectorAll(FOCUSABLE)].filter(element =>
        element.tabIndex >= 0 && !element.disabled && !element.closest('[hidden], [inert]')
        && element.getClientRects().length > 0 && window.getComputedStyle(element).visibility !== 'hidden')
      if (!items.length) return
      event.preventDefault()
      const index = items.indexOf(document.activeElement)
      const next = event.shiftKey ? (index <= 0 ? items.length - 1 : index - 1) : (index + 1) % items.length
      items[next].focus()
    }
  })
  return { isOpen, open: () => setOpen(true), close: options => setOpen(false, options), toggle: () => setOpen(!isOpen()) }
}
