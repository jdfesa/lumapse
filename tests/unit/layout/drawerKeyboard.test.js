import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderAppShell } from '../../../src/layout/appShell.js'
import { initDrawer } from '../../../src/layout/drawerController.js'

vi.mock('../../../src/layout/drawerSubjects.js', () => ({
  initSubjects: () => ({ updateSubjectActiveState() {}, renderSubjects() {} }),
}))
vi.mock('../../../src/layout/drawerTheme.js', () => ({ initTheme() {} }))

let listeners
const get = id => document.getElementById(id)
const key = (target, value, shiftKey = false) => {
  const event = new KeyboardEvent('keydown', { key: value, shiftKey, bubbles: true, cancelable: true })
  target.dispatchEvent(event)
  return event
}

beforeEach(() => {
  listeners = vi.spyOn(document, 'addEventListener')
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([{}])
  document.body.innerHTML = renderAppShell()
  initDrawer({ NoteStore: { subscribe() {} }, ThemeService: {}, SUBJECT_COLORS: [] })
})
afterEach(() => {
  listeners.mock.calls.forEach(([type, listener, options]) => document.removeEventListener(type, listener, options))
  vi.restoreAllMocks()
  document.body.innerHTML = ''
  document.body.style.overflow = ''
})

describe('paneles de navegación por teclado (RNF-020)', () => {
  it.each([
    ['drawer', 'btn-open-drawer', 'btn-close-drawer', 'btn-trash'],
    ['app-menu-drawer', 'btn-open-app-menu', 'btn-close-app-menu', 'btn-about'],
  ])('%s no enfoca controles ocultos y contiene Tab/Shift+Tab al abrir', (panelId, triggerId, firstId, lastId) => {
    const panel = get(panelId), trigger = get(triggerId)
    expect(panel.hasAttribute('inert')).toBe(true)
    trigger.focus()
    trigger.click()
    expect(panel.hasAttribute('inert')).toBe(false)
    expect(panel.getAttribute('aria-hidden')).toBe('false')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(get(firstId))
    expect(document.querySelector('.main-layout').hasAttribute('inert')).toBe(true)
    key(get(firstId), 'Tab', true)
    expect(document.activeElement).toBe(get(lastId))
    key(get(lastId), 'Tab')
    expect(document.activeElement).toBe(get(firstId))
    const escape = key(get(firstId), 'Escape')
    expect(escape.defaultPrevented).toBe(true)
    expect(panel.classList.contains('is-open')).toBe(false)
    expect(panel.hasAttribute('inert')).toBe(true)
    expect(document.activeElement).toBe(trigger)
    expect(document.querySelector('.main-layout').hasAttribute('inert')).toBe(false)
  })

  it('un diálogo externo no cierra el panel subyacente con Escape', () => {
    get('btn-open-drawer').click()
    const dialogButton = document.createElement('button')
    document.body.append(dialogButton)
    dialogButton.focus()
    key(dialogButton, 'Escape')
    expect(get('drawer').classList.contains('is-open')).toBe(true)
    expect(document.activeElement).toBe(dialogButton)
  })
})
