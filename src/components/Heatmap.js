// =============================================================
// Componente: Heatmap (Calendario)
// Hito 04: Navegación por fechas y actividad
// =============================================================

import * as NoteStore from '../store/NoteStore.js'

export class Heatmap {
  constructor(containerId) {
    this.container = document.getElementById(containerId)
    if (!this.container) return

    this.currentDate = new Date()
    this.currentMonth = this.currentDate.getMonth()
    this.currentYear = this.currentDate.getFullYear()
    
    this.activityMap = {} // { 'YYYY-MM-DD': count }
    this.selectedDate = null

    // Suscribirse a cambios en el NoteStore
    this.unsubscribe = NoteStore.subscribe((state) => {
      this.selectedDate = state.dateFilter
      this.calculateActivity(state.notes)
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
    this.render()
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
      const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      const count = this.activityMap[dateStr] || 0
      
      let level = 0
      if (count === 1) level = 1
      else if (count >= 2 && count <= 3) level = 2
      else if (count > 3) level = 3

      const isToday = dateStr === todayStr ? 'heatmap-day--today' : ''
      const isActive = dateStr === this.selectedDate ? 'heatmap-day--active' : ''

      html += `
        <div class="heatmap-day ${isToday} ${isActive}" data-date="${dateStr}" data-level="${level}">
          ${i}
        </div>
      `
    }

    html += `</div>` // close grid

    if (this.selectedDate) {
      html += `<button class="heatmap-clear" id="hm-clear">Limpiar filtro: ${this.selectedDate}</button>`
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

    const dayEls = this.container.querySelectorAll('.heatmap-day:not(.heatmap-day--empty)')
    dayEls.forEach(el => {
      el.addEventListener('click', (e) => {
        const date = e.target.dataset.date
        if (date) this.handleDayClick(date)
      })
    })
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe()
  }
}
