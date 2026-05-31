// =============================================================
// AcademicEventDialog — Modal de fechas academicas
// Fase 6: Creacion y edicion discreta (DP-007)
// =============================================================

import './AcademicEventDialog.css'

import * as NoteStore from '../store/NoteStore.js'
import {
  createLabeledControl,
  getInitialDate,
  getInitialSubjectId,
  renderSubjectOptions,
  validateAcademicEventPayload,
} from './AcademicEventDialog.helpers.js'
import {
  ACADEMIC_EVENT_TYPE_ORDER,
  getAcademicEventType,
  renderAcademicEventIcon,
} from './AcademicEventTypes.js'

const DIALOG_EXIT_MS = 120
const FOCUSABLE_SELECTOR = 'button:not([disabled]), input:not([disabled]), select:not([disabled])'

let activeDialog = null

function createButton(text, className, type = 'button') {
  const button = document.createElement('button')
  button.type = type
  button.className = className
  button.textContent = text
  return button
}

function closeDialog(backdrop, resolve, result, cleanup) {
  backdrop.classList.add('academic-event-dialog-backdrop--leaving')
  setTimeout(() => {
    cleanup()
    backdrop.remove()
    activeDialog = null
    resolve(result)
  }, DIALOG_EXIT_MS)
}

export function openAcademicEventDialog(options = {}) {
  if (typeof document === 'undefined' || activeDialog) return Promise.resolve(null)

  return new Promise((resolve) => {
    const state = NoteStore.getState()
    const mode = options.mode === 'edit' || options.event ? 'edit' : 'create'
    const event = options.event || null
    const initialSubjectId = getInitialSubjectId(options, state, event)
    let selectedType = getAcademicEventType(event?.type || options.type)
      ? (event?.type || options.type)
      : 'parcial'
    let closing = false

    const previousFocus = document.activeElement
    const backdrop = document.createElement('div')
    const dialog = document.createElement('div')
    const form = document.createElement('form')
    const titleEl = document.createElement('h2')
    const typeGroup = document.createElement('div')
    const dateInput = document.createElement('input')
    const subjectSelect = document.createElement('select')
    const titleInput = document.createElement('input')
    const helper = document.createElement('p')
    const errorEl = document.createElement('p')
    const actions = document.createElement('div')
    const cancelBtn = createButton('Cancelar', 'academic-event-dialog__btn academic-event-dialog__btn--cancel')
    const saveBtn = createButton(mode === 'edit' ? 'Guardar cambios' : 'Guardar', 'academic-event-dialog__btn academic-event-dialog__btn--save', 'submit')

    backdrop.className = 'academic-event-dialog-backdrop'
    backdrop.setAttribute('role', 'presentation')

    dialog.className = 'academic-event-dialog'
    dialog.setAttribute('role', 'dialog')
    dialog.setAttribute('aria-modal', 'true')
    dialog.setAttribute('aria-labelledby', 'academic-event-dialog-title')
    dialog.setAttribute('aria-describedby', 'academic-event-dialog-helper academic-event-dialog-error')

    form.className = 'academic-event-dialog__form'
    form.noValidate = true

    titleEl.id = 'academic-event-dialog-title'
    titleEl.className = 'academic-event-dialog__title'
    titleEl.textContent = mode === 'edit' ? 'Editar fecha academica' : 'Nueva fecha academica'

    helper.id = 'academic-event-dialog-helper'
    helper.className = 'academic-event-dialog__helper'
    helper.textContent = 'Marcador puntual para el calendario, sin hora ni recordatorios.'

    typeGroup.className = 'academic-event-dialog__types'
    typeGroup.setAttribute('role', 'radiogroup')
    typeGroup.setAttribute('aria-label', 'Tipo de fecha academica')

    const typeButtons = ACADEMIC_EVENT_TYPE_ORDER.map(typeId => {
      const type = getAcademicEventType(typeId)
      const button = document.createElement('button')
      const icon = document.createElement('span')
      const text = document.createElement('span')

      button.type = 'button'
      button.className = 'academic-event-dialog__type'
      button.dataset.type = typeId
      button.setAttribute('role', 'radio')
      button.setAttribute('aria-checked', String(typeId === selectedType))
      icon.className = 'academic-event-dialog__type-icon'
      icon.innerHTML = renderAcademicEventIcon(typeId)
      text.className = 'academic-event-dialog__type-label'
      text.textContent = type.shortLabel
      button.append(icon, text)
      button.addEventListener('click', () => {
        selectedType = typeId
        updateTypeButtons()
      })
      typeGroup.appendChild(button)
      return button
    })

    function updateTypeButtons() {
      typeButtons.forEach(button => {
        const isSelected = button.dataset.type === selectedType
        button.classList.toggle('academic-event-dialog__type--active', isSelected)
        button.setAttribute('aria-checked', String(isSelected))
      })
    }
    updateTypeButtons()

    dateInput.className = 'academic-event-dialog__input'
    dateInput.name = 'date'
    dateInput.autocomplete = 'off'
    dateInput.inputMode = 'numeric'
    dateInput.placeholder = 'YYYY-MM-DD'
    dateInput.value = getInitialDate(options, state, event)

    subjectSelect.className = 'academic-event-dialog__input'
    subjectSelect.name = 'subjectId'
    renderSubjectOptions(subjectSelect, state.subjects, initialSubjectId)

    titleInput.className = 'academic-event-dialog__input'
    titleInput.name = 'title'
    titleInput.maxLength = 80
    titleInput.placeholder = 'Ej: Unidad 3, entrega informe, mesa regular'
    titleInput.value = event?.title || ''

    errorEl.id = 'academic-event-dialog-error'
    errorEl.className = 'academic-event-dialog__error'
    errorEl.setAttribute('role', 'alert')
    errorEl.hidden = true

    actions.className = 'academic-event-dialog__actions'
    actions.append(cancelBtn, saveBtn)

    form.append(
      titleEl,
      helper,
      createLabeledControl('Tipo', typeGroup, 'academic-event-dialog__field--types'),
      createLabeledControl('Fecha', dateInput),
      createLabeledControl('Materia', subjectSelect),
      createLabeledControl('Nota breve', titleInput),
      errorEl,
      actions,
    )
    dialog.appendChild(form)
    backdrop.appendChild(dialog)

    function getFocusables() {
      return [...dialog.querySelectorAll(FOCUSABLE_SELECTOR)]
    }

    function showError(message, field) {
      errorEl.textContent = message
      errorEl.hidden = false

      if (field === 'type') {
        typeButtons.find(button => button.dataset.type === selectedType)?.focus()
      } else if (field === 'date') {
        dateInput.focus()
      }
    }

    function clearError() {
      errorEl.hidden = true
      errorEl.textContent = ''
    }

    function readPayload() {
      const subjectId = subjectSelect.value.trim()
      const title = titleInput.value.trim()

      return {
        type: selectedType,
        date: dateInput.value.trim(),
        subjectId: subjectId || null,
        title: title || null,
      }
    }

    const cleanup = () => {
      document.removeEventListener('keydown', handleKeydown)
      previousFocus?.focus?.()
    }

    const finish = (result) => {
      if (closing) return
      closing = true
      closeDialog(backdrop, resolve, result, cleanup)
    }

    function handleKeydown(keyboardEvent) {
      if (keyboardEvent.key === 'Escape') {
        keyboardEvent.preventDefault()
        finish(null)
      } else if (keyboardEvent.key === 'Tab') {
        const focusables = getFocusables()
        const currentIndex = focusables.indexOf(document.activeElement)
        const atStart = currentIndex <= 0
        const atEnd = currentIndex >= focusables.length - 1
        const nextIndex = keyboardEvent.shiftKey
          ? (atStart ? focusables.length - 1 : currentIndex - 1)
          : (atEnd ? 0 : currentIndex + 1)

        keyboardEvent.preventDefault()
        focusables[nextIndex]?.focus()
      }
    }

    form.addEventListener('submit', async (submitEvent) => {
      submitEvent.preventDefault()
      clearError()

      const payload = readPayload()
      const validationError = validateAcademicEventPayload(payload)
      if (validationError) {
        showError(validationError.message, validationError.field)
        return
      }

      saveBtn.disabled = true
      saveBtn.textContent = 'Guardando...'

      try {
        const savedEvent = mode === 'edit'
          ? await NoteStore.updateAcademicEvent(event.id, payload)
          : await NoteStore.createAcademicEvent(payload)

        if (!savedEvent) {
          showError('No se pudo guardar la fecha academica.', 'date')
          saveBtn.disabled = false
          saveBtn.textContent = mode === 'edit' ? 'Guardar cambios' : 'Guardar'
          return
        }

        finish(savedEvent)
      } catch (error) {
        showError(error?.message || 'No se pudo guardar la fecha academica.', 'date')
        saveBtn.disabled = false
        saveBtn.textContent = mode === 'edit' ? 'Guardar cambios' : 'Guardar'
      }
    })

    backdrop.addEventListener('click', (clickEvent) => {
      if (clickEvent.target === backdrop) finish(null)
    })
    cancelBtn.addEventListener('click', () => finish(null))

    activeDialog = backdrop
    document.body.appendChild(backdrop)
    document.addEventListener('keydown', handleKeydown)
    dateInput.focus()
    dateInput.select()
  })
}

export const academicEventDialog = openAcademicEventDialog
