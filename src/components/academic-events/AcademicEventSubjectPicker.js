// =============================================================
// AcademicEventSubjectPicker — Selector custom para fechas
// =============================================================

import {
  buildSubjectOptions,
  normalizeSubjectIdForAcademicEvent,
} from './AcademicEventDialog.helpers.js'

const OPTION_SELECTOR = '.academic-event-dialog__subject-option'

export class AcademicEventSubjectPicker {
  constructor(subjectsData, initialSubjectId = '') {
    const normalizedSubjectId = normalizeSubjectIdForAcademicEvent(subjectsData, initialSubjectId)

    this.options = buildSubjectOptions(subjectsData, normalizedSubjectId)
    this.selectedSubjectId = this.options.some(option => option.id === normalizedSubjectId)
      ? normalizedSubjectId
      : ''

    this.root = document.createElement('div')
    this.input = document.createElement('input')
    this.trigger = document.createElement('button')
    this.dot = document.createElement('span')
    this.label = document.createElement('span')
    this.icon = document.createElement('span')
    this.menu = document.createElement('div')

    this.handleTriggerClick = this.handleTriggerClick.bind(this)
    this.handleTriggerKeydown = this.handleTriggerKeydown.bind(this)
    this.handleMenuClick = this.handleMenuClick.bind(this)
    this.handleMenuKeydown = this.handleMenuKeydown.bind(this)

    this.init()
  }

  init() {
    this.root.className = 'academic-event-dialog__subject-picker'
    this.input.type = 'hidden'
    this.input.name = 'subjectId'

    this.trigger.type = 'button'
    this.trigger.className = 'academic-event-dialog__subject-trigger'
    this.trigger.setAttribute('aria-haspopup', 'listbox')
    this.trigger.setAttribute('aria-expanded', 'false')
    this.trigger.setAttribute('aria-controls', 'academic-event-dialog-subject-menu')
    this.trigger.setAttribute('aria-label', 'Seleccionar materia')

    this.dot.className = 'academic-event-dialog__subject-trigger-dot'
    this.label.className = 'academic-event-dialog__subject-trigger-label'
    this.icon.className = 'academic-event-dialog__subject-trigger-icon'
    this.icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>'
    this.trigger.append(this.dot, this.label, this.icon)

    this.menu.id = 'academic-event-dialog-subject-menu'
    this.menu.className = 'academic-event-dialog__subject-menu'
    this.menu.setAttribute('role', 'listbox')
    this.menu.setAttribute('aria-label', 'Materia')
    this.menu.hidden = true

    this.root.append(this.input, this.trigger, this.menu)
    this.renderMenu()
    this.setValue(this.selectedSubjectId, { renderMenu: false })

    this.trigger.addEventListener('click', this.handleTriggerClick)
    this.trigger.addEventListener('keydown', this.handleTriggerKeydown)
    this.menu.addEventListener('click', this.handleMenuClick)
    this.menu.addEventListener('keydown', this.handleMenuKeydown)
  }

  get element() {
    return this.root
  }

  getValue() {
    return this.input.value
  }

  contains(target) {
    return this.root.contains(target)
  }

  hasMenuFocus() {
    return this.menu.contains(document.activeElement)
  }

  isOpen() {
    return Boolean(!this.menu.hidden)
  }

  open() {
    this.menu.hidden = false
    this.trigger.setAttribute('aria-expanded', 'true')
  }

  close() {
    this.menu.hidden = true
    this.trigger.setAttribute('aria-expanded', 'false')
  }

  focusTrigger() {
    this.trigger.focus()
  }

  getSelectedOption() {
    return this.options.find(option => option.id === this.selectedSubjectId) || this.options[0]
  }

  setValue(value, setOptions = {}) {
    const { renderMenu = true } = setOptions
    const option = this.options.find(item => item.id === value) || this.options[0]

    this.selectedSubjectId = option.id
    this.input.value = option.id
    this.label.textContent = option.label
    this.trigger.style.setProperty('--subject-color', option.color || 'var(--color-accent)')
    this.trigger.classList.toggle('academic-event-dialog__subject-trigger--empty', !option.id)
    this.trigger.classList.toggle('academic-event-dialog__subject-trigger--unavailable', option.unavailable)

    if (renderMenu) this.renderMenu()
  }

  renderMenu() {
    this.menu.replaceChildren()

    this.options.forEach(option => {
      const button = document.createElement('button')
      const dot = document.createElement('span')
      const label = document.createElement('span')
      const childClass = option.isChild ? ' academic-event-dialog__subject-option--child' : ''
      const emptyClass = option.id ? '' : ' academic-event-dialog__subject-option--empty'
      const unavailableClass = option.unavailable ? ' academic-event-dialog__subject-option--unavailable' : ''

      button.type = 'button'
      button.tabIndex = -1
      button.className = `academic-event-dialog__subject-option${childClass}${emptyClass}${unavailableClass}`
      button.dataset.subjectId = option.id
      button.setAttribute('role', 'option')
      button.setAttribute('aria-selected', String(option.id === this.selectedSubjectId))

      dot.className = 'academic-event-dialog__subject-option-dot'
      if (option.color) dot.style.setProperty('--subject-color', option.color)

      label.className = 'academic-event-dialog__subject-option-label'
      label.textContent = option.label

      button.append(dot, label)
      this.menu.appendChild(button)
    })
  }

  getOptionButtons() {
    return [...this.menu.querySelectorAll(OPTION_SELECTOR)]
  }

  focusSelectedOption(offset = 0) {
    const buttons = this.getOptionButtons()
    if (!buttons.length) return

    const selectedId = this.getSelectedOption().id
    const selectedIndex = buttons.findIndex(button => button.dataset.subjectId === selectedId)
    const fallbackIndex = selectedIndex >= 0 ? selectedIndex : 0
    const nextIndex = Math.max(0, Math.min(buttons.length - 1, fallbackIndex + offset))
    buttons[nextIndex]?.focus()
  }

  moveOptionFocus(offset) {
    const buttons = this.getOptionButtons()
    const currentIndex = buttons.indexOf(document.activeElement)
    const baseIndex = currentIndex >= 0 ? currentIndex : 0
    const nextIndex = (baseIndex + offset + buttons.length) % buttons.length

    buttons[nextIndex]?.focus()
  }

  handleTriggerClick() {
    if (this.isOpen()) {
      this.close()
    } else {
      this.open()
    }
  }

  handleTriggerKeydown(keyboardEvent) {
    if (keyboardEvent.key !== 'ArrowDown' && keyboardEvent.key !== 'ArrowUp') return

    keyboardEvent.preventDefault()
    this.open()
    this.focusSelectedOption(keyboardEvent.key === 'ArrowUp' ? -1 : 0)
  }

  handleMenuClick(clickEvent) {
    const option = clickEvent.target.closest(OPTION_SELECTOR)
    if (!option) return

    this.setValue(option.dataset.subjectId || '')
    this.close()
    this.focusTrigger()
  }

  handleMenuKeydown(keyboardEvent) {
    if (keyboardEvent.key === 'Escape') {
      keyboardEvent.preventDefault()
      keyboardEvent.stopPropagation()
      this.close()
      this.focusTrigger()
      return
    }

    if (keyboardEvent.key === 'ArrowDown' || keyboardEvent.key === 'ArrowUp') {
      keyboardEvent.preventDefault()
      this.moveOptionFocus(keyboardEvent.key === 'ArrowDown' ? 1 : -1)
      return
    }

    if (keyboardEvent.key === 'Home' || keyboardEvent.key === 'End') {
      const buttons = this.getOptionButtons()

      keyboardEvent.preventDefault()
      buttons[keyboardEvent.key === 'Home' ? 0 : buttons.length - 1]?.focus()
      return
    }

    if ((keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') && keyboardEvent.target.closest(OPTION_SELECTOR)) {
      keyboardEvent.preventDefault()
      keyboardEvent.target.click()
    }
  }

  destroy() {
    this.trigger.removeEventListener('click', this.handleTriggerClick)
    this.trigger.removeEventListener('keydown', this.handleTriggerKeydown)
    this.menu.removeEventListener('click', this.handleMenuClick)
    this.menu.removeEventListener('keydown', this.handleMenuKeydown)
  }
}
