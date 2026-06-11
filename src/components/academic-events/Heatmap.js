// =============================================================
// Componente: Heatmap (Calendario)
// Hito 04: Navegación por fechas y actividad
// =============================================================

import * as NoteStore from '../../store/NoteStore.js'
import { bindAcademicEventActions } from './AcademicEventActions.js'
import {
  renderAcademicEventDot,
  renderAcademicEventListItem,
} from './AcademicEventTypes.js'
import {
  createAcademicEventSubjectCatalog,
  getAcademicEventSubjectColor,
  getAcademicEventSubjectLabel,
  isAcademicEventSubjectArchived,
} from './AcademicEventSubjects.js'
import { openAcademicEventDialog } from './AcademicEventDialog.js'
import './Heatmap.css'

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export class Heatmap {
  constructor(containerId) {
    this.container = document.getElementById(containerId)
    if (!this.container) return

    this.currentDate = new Date()
    this.currentMonth = this.currentDate.getMonth()
    this.currentYear = this.currentDate.getFullYear()
    
    this.activityMap = {} // { 'YYYY-MM-DD': count }
    this.eventMap = {} // { 'YYYY-MM-DD': academicEvent[] }
    this.selectedDate = null
    this.subjects = { tree: [] }

    // Suscribirse a cambios en el NoteStore
    this.unsubscribe = NoteStore.subscribe((state) => {
      this.selectedDate = state.dateFilter
      this.subjects = createAcademicEventSubjectCatalog(state)
      this.calculateActivity(state.notes)
      this.calculateEventMap(state.academicEventsForMonth || [])
      this.render()
    })

    this.render()
  }

  /**
   * Calcula la frecuencia de notas por día para el heatmap
   */
  calculateActivity(notes) {
    this.activityMap = {}
    notes.forEach(note => {
      if (!note.updatedAt) return
      const dateStr = new Date(note.updatedAt).toISOString().split('T')[0]
      this.activityMap[dateStr] = (this.activityMap[dateStr] || 0) + 1
    })
  }

  /**
   * Agrupa eventos academicos por dia para renderizar indicadores.
   */
  calculateEventMap(events) {
    this.eventMap = {}
    events.forEach(event => {
      if (!event.date) return
      this.eventMap[event.date] = [...(this.eventMap[event.date] || []), event]
    })

    Object.keys(this.eventMap).forEach(date => {
      this.eventMap[date].sort((a, b) => {
        const byCreatedAt = new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        if (byCreatedAt !== 0) return byCreatedAt
        return String(a.id).localeCompare(String(b.id))
      })
    })
  }

  /**
   * Cambia el mes actual a mostrar
   */
  changeMonth(offset) {
    this.currentMonth += offset
    if (this.currentMonth < 0) {
      this.currentMonth = 11
      this.currentYear--
    } else if (this.currentMonth > 11) {
      this.currentMonth = 0
      this.currentYear++
    }
    this.eventMap = {}
    this.render()
    NoteStore.loadAcademicEventsByMonth(this.currentYear, this.currentMonth + 1)
      .catch(error => console.warn('[Heatmap] No se pudieron cargar fechas academicas del mes:', error))
  }

  /**
   * Maneja el click en un día
   */
  handleDayClick(dateStr) {
    if (this.selectedDate === dateStr) {
      NoteStore.setDateFilter(null) // Deseleccionar
    } else {
      NoteStore.setDateFilter(dateStr)
    }
  }

  getEventColor(event) {
    return getAcademicEventSubjectColor(event, this.subjects)
  }

  getEventSubjectLabel(event) {
    return getAcademicEventSubjectLabel(event, this.subjects)
  }

  getEventSubjectArchived(event) {
    return isAcademicEventSubjectArchived(event, this.subjects)
  }

  getEventById(eventId) {
    for (const events of Object.values(this.eventMap)) {
      const event = events.find(item => item.id === eventId)
      if (event) return event
    }

    return null
  }

  renderEventDots(events) {
    if (!events.length) return ''

    return `
      <span class="heatmap-event-dots">
        ${events.slice(0, 3).map(event => renderAcademicEventDot(event, {
          color: this.getEventColor(event),
        })).join('')}
      </span>
    `
  }

  renderSelectedDateEvents() {
    if (!this.selectedDate) return ''

    const events = this.eventMap[this.selectedDate] || []
    if (events.length === 0) return ''

    return `
      <section class="heatmap-events-card" aria-label="Fechas academicas del dia">
        <h4 class="heatmap-events-card__title">Fechas academicas</h4>
        <div class="heatmap-events-card__list">
          ${events.map(event => renderAcademicEventListItem(event, {
            color: this.getEventColor(event),
            subjectLabel: this.getEventSubjectLabel(event),
            subjectArchived: this.getEventSubjectArchived(event),
            actions: true,
          })).join('')}
        </div>
      </section>
    `
  }

  renderSelectedDateActions() {
    if (!this.selectedDate) return ''

    return `
      <div class="heatmap-events-actions">
        <button class="heatmap-add-event" id="hm-add-event" type="button" title="Agregar fecha academica">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M12 5v14"></path>
            <path d="M5 12h14"></path>
          </svg>
          <span>Agregar fecha</span>
        </button>
      </div>
    `
  }

  getActivityLevel(count) {
    if (count === 1) return 1
    if (count >= 2 && count <= 3) return 2
    if (count > 3) return 3
    return 0
  }

  renderDayCell(day, todayStr) {
    const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const count = this.activityMap[dateStr] || 0
    const events = this.eventMap[dateStr] || []
    const level = this.getActivityLevel(count)
    const isToday = dateStr === todayStr ? 'heatmap-day--today' : ''
    const isActive = dateStr === this.selectedDate ? 'heatmap-day--active' : ''

    return `
      <div class="heatmap-day ${isToday} ${isActive}" data-date="${dateStr}" data-level="${level}" data-event-count="${events.length}">
        <span class="heatmap-day__number">${day}</span>
        ${this.renderEventDots(events)}
      </div>
    `
  }

  render() {
    if (!this.container) return

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    const dayNames = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']

    // Cálculos del calendario
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay()
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate()
    
    const todayStr = new Date().toISOString().split('T')[0]

    let html = `
      <div class="heatmap-container">
        <div class="heatmap-header">
          <h3 class="heatmap-title">${monthNames[this.currentMonth]} ${this.currentYear}</h3>
          <div class="heatmap-controls">
            <button class="heatmap-btn" id="hm-prev" title="Mes anterior">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button class="heatmap-btn" id="hm-next" title="Mes siguiente">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
        <div class="heatmap-grid">
    `

    // Encabezados de días
    dayNames.forEach(day => {
      html += `<div class="heatmap-day-header">${day}</div>`
    })

    // Espacios vacíos antes del primer día
    for (let i = 0; i < firstDay; i++) {
      html += `<div class="heatmap-day heatmap-day--empty"></div>`
    }

    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      html += this.renderDayCell(i, todayStr)
    }

    html += `</div>` // close grid

    html += this.renderSelectedDateEvents()
    html += this.renderSelectedDateActions()

    if (this.selectedDate) {
      html += `<button class="heatmap-clear" id="hm-clear" title="Limpiar filtro de fecha">Limpiar filtro: ${escapeHtml(this.selectedDate)}</button>`
    }

    html += `</div>` // close container

    this.container.innerHTML = html

    // Listeners
    this.container.querySelector('#hm-prev')?.addEventListener('click', () => this.changeMonth(-1))
    this.container.querySelector('#hm-next')?.addEventListener('click', () => this.changeMonth(1))
    
    const clearBtn = this.container.querySelector('#hm-clear')
    if (clearBtn) {
      clearBtn.addEventListener('click', () => NoteStore.setDateFilter(null))
    }

    const addEventBtn = this.container.querySelector('#hm-add-event')
    if (addEventBtn) {
      addEventBtn.addEventListener('click', () => {
        openAcademicEventDialog({
          mode: 'create',
          date: this.selectedDate,
        }).catch(error => console.warn('[Heatmap] No se pudo abrir el dialogo de fecha academica:', error))
      })
    }

    bindAcademicEventActions(this.container, eventId => this.getEventById(eventId))

    const dayEls = this.container.querySelectorAll('.heatmap-day:not(.heatmap-day--empty)')
    dayEls.forEach(el => {
      el.addEventListener('click', (e) => {
        const date = e.currentTarget.dataset.date
        if (date) this.handleDayClick(date)
      })
    })
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe()
  }
}
