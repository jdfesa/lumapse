// =============================================================
// AcademicEventTypes — Tipos visuales de fechas academicas
// Fase 4: Iconografia minimalista (DP-007)
//
// Responsabilidad: centralizar labels, colores, SVGs inline y
// helpers de render reutilizables por Heatmap y listas.
// =============================================================

const ICON_CLASS = 'academic-event-icon'

const ICONS = {
  parcial: `
    <svg class="${ICON_CLASS}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M6.5 3.5h8.25L18 6.75V20a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5 20V5a1.5 1.5 0 0 1 1.5-1.5Z" />
      <path d="M14.5 3.5v3.25H18" />
      <path d="M8.5 11h7" />
      <path d="M8.5 15h7" />
      <path d="M8.5 18.5h4" />
    </svg>
  `,
  final: `
    <svg class="${ICON_CLASS}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4.25" />
      <path d="M9.2 11.2 7.5 21l4.5-2.8 4.5 2.8-1.7-9.8" />
      <path d="m10.2 8 1.25 1.25L14 6.75" />
    </svg>
  `,
  tp: `
    <svg class="${ICON_CLASS}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M9 4.5h6a1.5 1.5 0 0 1 1.5 1.5v1H7.5V6A1.5 1.5 0 0 1 9 4.5Z" />
      <path d="M7.5 6.5H6A2 2 0 0 0 4 8.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.5a2 2 0 0 0-2-2h-1.5" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  `,
  exposicion: `
    <svg class="${ICON_CLASS}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="11" rx="1.75" />
      <path d="M12 15.5V20" />
      <path d="M8 20h8" />
      <path d="m9 12 2-2 2 1.5 2.5-3" />
    </svg>
  `,
}

export const ACADEMIC_EVENT_TYPE_ORDER = Object.freeze(['parcial', 'final', 'tp', 'exposicion'])

export const ACADEMIC_EVENT_TYPES = Object.freeze({
  parcial: Object.freeze({
    id: 'parcial',
    label: 'Parcial',
    shortLabel: 'Parcial',
    color: '#b45309',
    icon: ICONS.parcial,
  }),
  final: Object.freeze({
    id: 'final',
    label: 'Final',
    shortLabel: 'Final',
    color: '#dc2626',
    icon: ICONS.final,
  }),
  tp: Object.freeze({
    id: 'tp',
    label: 'Trabajo práctico',
    shortLabel: 'TP',
    color: '#2563eb',
    icon: ICONS.tp,
  }),
  exposicion: Object.freeze({
    id: 'exposicion',
    label: 'Exposición',
    shortLabel: 'Exposición',
    color: '#15803d',
    icon: ICONS.exposicion,
  }),
})

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function escapeAttribute(value) {
  return escapeHtml(value)
}

function dateLabel(date) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return ''

  const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const [, month, day] = date.split('-').map(Number)

  if (month < 1 || month > 12 || day < 1 || day > 31) return date
  return `${String(day).padStart(2, '0')} ${monthLabels[month - 1]}`
}

function renderEventActions(event, title) {
  const eventId = escapeAttribute(event.id || '')
  const safeTitle = escapeAttribute(title)

  return `
    <span class="academic-event-item__actions" aria-label="Acciones de fecha academica">
      <button class="academic-event-item__action js-academic-event-action"
              type="button"
              data-event-action="edit"
              data-event-id="${eventId}"
              title="Editar ${safeTitle}"
              aria-label="Editar ${safeTitle}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
        </svg>
      </button>
      <button class="academic-event-item__action academic-event-item__action--danger js-academic-event-action"
              type="button"
              data-event-action="delete"
              data-event-id="${eventId}"
              title="Eliminar ${safeTitle}"
              aria-label="Eliminar ${safeTitle}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </span>
  `
}

export function getAcademicEventType(type) {
  return ACADEMIC_EVENT_TYPES[type] || null
}

export function getAcademicEventColor(eventOrType, fallbackColor = null) {
  const type = typeof eventOrType === 'string' ? eventOrType : eventOrType?.type
  return fallbackColor || getAcademicEventType(type)?.color || '#71717a'
}

export function renderAcademicEventIcon(type) {
  return getAcademicEventType(type)?.icon || ''
}

export function renderAcademicEventDot(event, options = {}) {
  const type = getAcademicEventType(event?.type)
  if (!type) return ''

  const color = getAcademicEventColor(event, options.color)
  const label = options.label || type.label

  return `
    <span class="academic-event-dot academic-event-dot--${type.id}"
          data-event-type="${escapeAttribute(type.id)}"
          style="--academic-event-color: ${escapeAttribute(color)}"
          title="${escapeAttribute(label)}"
          aria-label="${escapeAttribute(label)}"></span>
  `
}

export function renderAcademicEventListItem(event, options = {}) {
  const type = getAcademicEventType(event?.type)
  if (!type) return ''

  const color = getAcademicEventColor(event, options.color)
  const subjectLabel = options.subjectLabel ?? event.subjectName ?? ''
  const title = event.title || type.label
  const date = dateLabel(event.date)
  const subjectClass = options.subjectArchived
    ? 'academic-event-item__subject academic-event-item__subject--archived'
    : 'academic-event-item__subject'
  const subject = subjectLabel
    ? `<span class="${subjectClass}">${escapeHtml(subjectLabel)}</span>`
    : ''
  const actions = options.actions ? renderEventActions(event, title) : ''
  const actionsClass = options.actions ? ' academic-event-item--with-actions' : ''

  return `
    <article class="academic-event-item academic-event-item--${type.id}${actionsClass}"
             data-event-id="${escapeAttribute(event.id || '')}"
             data-event-type="${escapeAttribute(type.id)}"
             style="--academic-event-color: ${escapeAttribute(color)}">
      <span class="academic-event-item__icon" aria-hidden="true">${type.icon}</span>
      <span class="academic-event-item__body">
        <span class="academic-event-item__meta">
          <time class="academic-event-item__date" datetime="${escapeAttribute(event.date || '')}">${escapeHtml(date)}</time>
          <span class="academic-event-item__type">${escapeHtml(type.shortLabel)}</span>
        </span>
        <span class="academic-event-item__title">${escapeHtml(title)}</span>
        ${subject}
      </span>
      ${actions}
    </article>
  `
}
