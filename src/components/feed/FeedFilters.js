import { normalizeSearchText } from '../../store/noteFilters.ts'
import { getSafeISODate } from '../common/presentationValidation.js'
import { findSubject } from './NoteCardRenderer.js'
import './FeedFilters.css'

function describeScope(state, hasQuery) {
  if (hasQuery && ['inbox', 'subject', 'all'].includes(state.viewMode)) {
    return 'Búsqueda global · notas activas'
  }
  if (state.viewMode === 'archived') return 'Archivadas'
  if (state.viewMode === 'inbox') return 'Entrada'
  if (state.viewMode !== 'subject') return 'Notas activas'

  const found = findSubject(state.activeSubjectId, state.subjects)
  if (!found) return 'Materia o sección seleccionada'
  return found.parent
    ? `${found.parent.name} › ${found.subject.name}`
    : `${found.subject.name} · incluye secciones`
}

// Hermano del feed reemplazable: los controles conservan identidad y foco
// durante notificaciones del store y cambios de ventana de VirtualFeed.
export function createFeedFilters(container, { onClearDate, onClearSearch, focusTarget }) {
  container.innerHTML = `
    <aside class="feed-filters" aria-label="Filtros del feed" hidden>
      <p class="feed-filters__scope" role="status"></p>
      <div class="feed-filters__controls">
        <button class="feed-filters__chip" type="button" title="Quitar solo el filtro de fecha" data-clear-date hidden>
          <span data-date-label></span><span class="feed-filters__action">Quitar fecha</span>
        </button>
        <button class="feed-filters__chip" type="button" title="Quitar solo el filtro de búsqueda" data-clear-search hidden>
          <span data-search-label></span><span class="feed-filters__action">Quitar búsqueda</span>
        </button>
      </div>
      <p class="feed-filters__hint">Conteos del menú: totales sin filtrar.</p>
    </aside>
  `
  const root = container.querySelector('.feed-filters')
  const scope = root.querySelector('.feed-filters__scope')
  const dateButton = root.querySelector('[data-clear-date]')
  const searchButton = root.querySelector('[data-clear-search]')
  const dateLabel = root.querySelector('[data-date-label]')
  const searchLabel = root.querySelector('[data-search-label]')

  function clearFilter(event) {
    const button = event.target.closest('button')
    if (root.hidden || !button || button.hidden) return
    const hadFocus = document.activeElement === button
    if (button === dateButton) onClearDate()
    else if (button === searchButton) onClearSearch()
    // Los setters notifican sincrónicamente. No dejar foco en un botón oculto.
    if (hadFocus && (root.hidden || button.hidden)) {
      const next = root.hidden ? focusTarget : [dateButton, searchButton].find(item => !item.hidden)
      next?.focus({ preventScroll: true })
    }
  }
  root.addEventListener('click', clearFilter)

  return {
    update(state) {
      const hasQuery = Boolean(normalizeSearchText(state.searchQuery))
      const hasDate = Boolean(state.dateFilter)
      const isFeed = ['inbox', 'subject', 'all', 'archived'].includes(state.viewMode)
      root.hidden = !isFeed || (!hasQuery && !hasDate)
      dateButton.hidden = !hasDate
      searchButton.hidden = !hasQuery
      scope.textContent = describeScope(state, hasQuery)
      const date = getSafeISODate(state.dateFilter)
      dateLabel.textContent = date ? `Fecha: ${date.split('-').reverse().join('/')}` : 'Fecha no válida'
      searchLabel.textContent = `Búsqueda: ${String(state.searchQuery || '').trim()}`
    },
    destroy() {
      root.removeEventListener('click', clearFilter)
      container.innerHTML = ''
    },
  }
}
