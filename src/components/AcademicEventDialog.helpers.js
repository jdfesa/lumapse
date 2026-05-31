// =============================================================
// Helpers puros/DOM para AcademicEventDialog
// =============================================================

import { getAcademicEventType } from './AcademicEventTypes.js'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function todayLocalDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function isValidDateParts(year, month, day) {
  const parsed = new Date(Date.UTC(year, month - 1, day))

  return parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
}

function appendSubjectOption(select, subject, selectedSubjectId, depth = 0) {
  const option = document.createElement('option')
  option.value = subject.id
  option.textContent = `${depth > 0 ? '  ' : ''}${subject.name}`
  option.selected = subject.id === selectedSubjectId
  select.appendChild(option)

  return option.selected
}

export function getInitialSubjectId(options, state, event) {
  if (event?.subjectId) return event.subjectId
  if (options.subjectId) return options.subjectId
  if (state.viewMode === 'subject' && state.activeSubjectId) return state.activeSubjectId
  return ''
}

export function getInitialDate(options, state, event) {
  return event?.date || options.date || state.dateFilter || todayLocalDate()
}

export function createLabeledControl(labelText, control, className = '') {
  const isNativeControl = ['INPUT', 'SELECT', 'TEXTAREA'].includes(control.tagName)
  const wrapper = document.createElement(isNativeControl ? 'label' : 'div')
  wrapper.className = `academic-event-dialog__field ${className}`.trim()

  const labelSpan = document.createElement('span')
  labelSpan.className = 'academic-event-dialog__label'
  labelSpan.textContent = labelText

  wrapper.append(labelSpan, control)
  return wrapper
}

export function renderSubjectOptions(select, subjectsData, selectedSubjectId) {
  let hasSelectedSubject = !selectedSubjectId

  const emptyOption = document.createElement('option')
  emptyOption.value = ''
  emptyOption.textContent = 'Sin materia'
  emptyOption.selected = !selectedSubjectId
  select.appendChild(emptyOption)

  const tree = Array.isArray(subjectsData?.tree) ? subjectsData.tree : []
  tree.forEach(subject => {
    hasSelectedSubject = appendSubjectOption(select, subject, selectedSubjectId) || hasSelectedSubject

    const children = subject.children || []
    children.forEach(child => {
      hasSelectedSubject = appendSubjectOption(select, child, selectedSubjectId, 1) || hasSelectedSubject
    })
  })

  if (selectedSubjectId && !hasSelectedSubject) {
    const option = document.createElement('option')
    option.value = selectedSubjectId
    option.textContent = 'Materia no disponible'
    option.selected = true
    select.appendChild(option)
  }
}

export function validateAcademicEventPayload(payload) {
  if (!getAcademicEventType(payload.type)) {
    return {
      message: 'Elegi un tipo de fecha academica.',
      field: 'type',
    }
  }

  if (!payload.date) {
    return {
      message: 'La fecha es obligatoria.',
      field: 'date',
    }
  }

  if (!DATE_RE.test(payload.date)) {
    return {
      message: 'Usa el formato YYYY-MM-DD.',
      field: 'date',
    }
  }

  const [year, month, day] = payload.date.split('-').map(Number)
  if (!isValidDateParts(year, month, day)) {
    return {
      message: 'La fecha ingresada no existe.',
      field: 'date',
    }
  }

  return null
}
