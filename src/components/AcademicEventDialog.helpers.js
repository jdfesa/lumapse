// =============================================================
// Helpers puros/DOM para AcademicEventDialog
// =============================================================

import { getAcademicEventType } from './AcademicEventTypes.js'
import { ACADEMIC_EVENT_TITLE_MAX_LENGTH } from '../services/AcademicEventRules.js'

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

export function getInitialSubjectId(options, state, event) {
  if (event?.subjectId) return event.subjectId
  if (options.subjectId) return options.subjectId
  if (state.viewMode === 'subject' && state.activeSubjectId) return state.activeSubjectId
  return ''
}

export function getInitialDate(options, state, event) {
  return event?.date || options.date || state.dateFilter || todayLocalDate()
}

export function createLabeledControl(labelText, control, className = '', afterControl = null) {
  const isNativeControl = ['INPUT', 'SELECT', 'TEXTAREA'].includes(control.tagName)
  const useExternalLabel = Boolean(afterControl && isNativeControl && control.id)
  const wrapper = document.createElement(isNativeControl && !useExternalLabel ? 'label' : 'div')
  wrapper.className = `academic-event-dialog__field ${className}`.trim()

  const labelSpan = document.createElement(useExternalLabel ? 'label' : 'span')
  labelSpan.className = 'academic-event-dialog__label'
  labelSpan.textContent = labelText
  if (useExternalLabel) labelSpan.htmlFor = control.id

  wrapper.append(labelSpan, control)
  if (afterControl) wrapper.appendChild(afterControl)
  return wrapper
}

export function normalizeSubjectIdForAcademicEvent(subjectsData, selectedSubjectId) {
  if (!selectedSubjectId) return ''

  const tree = Array.isArray(subjectsData?.tree) ? subjectsData.tree : []
  for (const subject of tree) {
    if (subject.id === selectedSubjectId) return subject.id

    const children = subject.children || []
    if (children.some(child => child.id === selectedSubjectId)) {
      return subject.id
    }
  }

  return selectedSubjectId
}

export function buildSubjectOptions(subjectsData, selectedSubjectId) {
  const normalizedSubjectId = normalizeSubjectIdForAcademicEvent(subjectsData, selectedSubjectId)
  const options = [{
    id: '',
    label: 'Sin materia',
    color: '',
    isChild: false,
    unavailable: false,
  }]
  let hasSelectedSubject = !normalizedSubjectId

  const tree = Array.isArray(subjectsData?.tree) ? subjectsData.tree : []
  tree.forEach(subject => {
    options.push({
      id: subject.id,
      label: subject.name,
      color: subject.color || '',
      isChild: false,
      unavailable: false,
    })
    hasSelectedSubject = subject.id === normalizedSubjectId || hasSelectedSubject
  })

  if (normalizedSubjectId && !hasSelectedSubject) {
    options.push({
      id: normalizedSubjectId,
      label: 'Materia no disponible',
      color: '',
      isChild: false,
      unavailable: true,
    })
  }

  return options
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

  if (payload.title && payload.title.length > ACADEMIC_EVENT_TITLE_MAX_LENGTH) {
    return {
      message: `La nota breve no puede superar ${ACADEMIC_EVENT_TITLE_MAX_LENGTH} caracteres.`,
      field: 'title',
    }
  }

  return null
}
