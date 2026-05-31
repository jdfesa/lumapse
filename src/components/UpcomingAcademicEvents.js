// =============================================================
// UpcomingAcademicEvents — Recordatorio pasivo de fechas
// Fase 7: Proximas fechas academicas
// =============================================================

import './UpcomingAcademicEvents.css'

import * as NoteStore from '../store/NoteStore.js'
import {
  getAcademicEventSubjectColor,
  getAcademicEventSubjectLabel,
} from './AcademicEventSubjects.js'
import { renderAcademicEventListItem } from './AcademicEventTypes.js'

const MAX_UPCOMING_EVENTS = 5

function todayLocalDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function sortUpcomingEvents(events) {
  return [...events].sort((a, b) => {
    const byDate = String(a.date).localeCompare(String(b.date))
    if (byDate !== 0) return byDate

    const byCreatedAt = new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
    if (byCreatedAt !== 0) return byCreatedAt

    return String(a.id).localeCompare(String(b.id))
  })
}

function getUpcomingEvents(events, today = todayLocalDate()) {
  return sortUpcomingEvents(events || [])
    .filter(event => event?.date && event.date >= today)
    .slice(0, MAX_UPCOMING_EVENTS)
}

export class UpcomingAcademicEvents {
  constructor(containerId) {
    this.container = document.getElementById(containerId)
    if (!this.container) return

    this.collapsed = false
    this.events = []
    this.subjects = { tree: [] }

    this.unsubscribe = NoteStore.subscribe((state) => {
      this.events = getUpcomingEvents(state.upcomingAcademicEvents)
      this.subjects = state.subjects || { tree: [] }
      this.render()
    })
  }

  getEventColor(event) {
    return getAcademicEventSubjectColor(event, this.subjects)
  }

  getEventSubjectLabel(event) {
    return getAcademicEventSubjectLabel(event, this.subjects)
  }

  renderToggleIcon() {
    return `
      <svg class="upcoming-academic-events__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    `
  }

  renderList() {
    if (this.collapsed) return ''

    return `
      <div class="upcoming-academic-events__list">
        ${this.events.map(event => renderAcademicEventListItem(event, {
          color: this.getEventColor(event),
          subjectLabel: this.getEventSubjectLabel(event),
        })).join('')}
      </div>
    `
  }

  render() {
    if (!this.container) return

    if (this.events.length === 0) {
      this.container.hidden = true
      this.container.innerHTML = ''
      return
    }

    this.container.hidden = false
    this.container.innerHTML = `
      <section class="upcoming-academic-events ${this.collapsed ? 'upcoming-academic-events--collapsed' : ''}" aria-label="Proximas fechas academicas">
        <button class="upcoming-academic-events__header" id="upcoming-academic-events-toggle" type="button" aria-expanded="${String(!this.collapsed)}">
          <span class="upcoming-academic-events__title">Proximas fechas</span>
          <span class="upcoming-academic-events__count">${this.events.length}</span>
          ${this.renderToggleIcon()}
        </button>
        ${this.renderList()}
      </section>
    `

    this.container
      .querySelector('#upcoming-academic-events-toggle')
      ?.addEventListener('click', () => {
        this.collapsed = !this.collapsed
        this.render()
      })
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe()
  }
}

export { getUpcomingEvents }
