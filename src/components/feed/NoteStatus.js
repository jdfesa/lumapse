// =============================================================
// NoteStatus — Presentación visual de estados académicos
// =============================================================
//
// Los valores persistidos siguen siendo los emojis originales para
// conservar compatibilidad con notas existentes. La UI renderiza SVGs
// lineales propios para mantener una estética consistente con Lumapse.

const STATUS_ICONS = {
  reading: `
    <svg class="note-status-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 7v14" />
      <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H9a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H5.5A2.5 2.5 0 0 1 3 15.5v-10Z" />
      <path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H15a3 3 0 0 0-3 3v15a3 3 0 0 1 3-3h3.5a2.5 2.5 0 0 0 2.5-2.5v-10Z" />
    </svg>
  `,
  question: `
    <svg class="note-status-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.75 9.25a2.5 2.5 0 1 1 3.35 2.35c-.72.3-1.1.78-1.1 1.65v.25" />
      <path d="M12 17h.01" />
    </svg>
  `,
  important: `
    <svg class="note-status-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22c3.5 0 6-2.45 6-5.95 0-2.65-1.55-4.55-3.05-6.25-.95-1.08-1.85-2.12-1.95-3.35-1.85.95-3.1 2.35-3.1 4.35 0 .72.18 1.35.45 1.95-.9-.28-1.62-.9-2.1-1.7C7.1 12.45 6 14.1 6 16.05 6 19.55 8.5 22 12 22Z" />
      <path d="M12 18.5a2.25 2.25 0 0 0 2.25-2.25c0-.9-.48-1.6-1.02-2.22-.42-.48-.82-.92-.88-1.53-.92.48-1.6 1.3-1.6 2.38 0 .42.1.78.28 1.12-.42-.12-.78-.36-1.03-.72-.35.5-.55 1.02-.55 1.6A2.55 2.55 0 0 0 12 18.5Z" />
    </svg>
  `,
  reviewed: `
    <svg class="note-status-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.4 2.5 2.5L16.5 9" />
    </svg>
  `,
  clear: `
    <svg class="note-status-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  `,
}

export const NOTE_STATUSES = [
  {
    id: 'reading',
    value: '📖',
    label: 'Por completar',
    icon: STATUS_ICONS.reading,
  },
  {
    id: 'question',
    value: '❓',
    label: 'Tengo dudas',
    icon: STATUS_ICONS.question,
  },
  {
    id: 'important',
    value: '🔥',
    label: 'Importante',
    icon: STATUS_ICONS.important,
  },
  {
    id: 'reviewed',
    value: '✅',
    label: 'Repasado',
    icon: STATUS_ICONS.reviewed,
  },
]

function escapeAttribute(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function getNoteStatus(value) {
  return NOTE_STATUSES.find(status => status.value === value) || null
}

export function renderNoteStatusBadge(value) {
  const status = getNoteStatus(value)
  if (!status) return ''

  return `
    <span class="note-card__status-badge note-card__status-badge--${status.id}"
          title="${escapeAttribute(status.label)}"
          aria-label="${escapeAttribute(status.label)}">
      ${status.icon}
    </span>
  `
}

export function renderNoteStatusMenuItems(noteId, currentValue) {
  const safeNoteId = escapeAttribute(noteId)

  return NOTE_STATUSES.map(status => {
    const currentClass = currentValue === status.value ? ' note-card__status-btn--current' : ''
    return `
      <button class="note-card__status-btn js-btn-status${currentClass}"
              data-note-id="${safeNoteId}"
              data-emoji="${escapeAttribute(status.value)}"
              title="${escapeAttribute(status.label)}"
              aria-label="${escapeAttribute(status.label)}">
        ${status.icon}
      </button>
    `
  }).join('')
}

export function renderClearNoteStatusButton(noteId) {
  return `
    <button class="note-card__status-btn js-btn-status"
            data-note-id="${escapeAttribute(noteId)}"
            data-emoji=""
            title="Quitar estado"
            aria-label="Quitar estado">
      ${STATUS_ICONS.clear}
    </button>
  `
}
