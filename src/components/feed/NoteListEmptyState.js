import { normalizeSearchText } from '../../store/noteFilters.ts'
import { escapeHtmlText } from '../common/htmlEscaping.js'
import { findSubject } from './NoteCardRenderer.js'

export function renderEmptyState(state) {
  const query = (state.searchQuery || '').trim()
  const hasQuery = Boolean(normalizeSearchText(query))
  const activeSubject = findSubject(state.activeSubjectId, state.subjects)?.subject

  let title = 'Todavía no hay notas en Entrada.'
  let copy = 'Escribí una idea arriba o asignala a una materia cuando la guardes.'

  if (hasQuery && state.dateFilter) {
    title = 'No hay notas con esta combinación de filtros.'
    copy = 'Revisá la fecha y la búsqueda indicadas arriba. Podés quitar cada filtro por separado.'
  } else if (hasQuery) {
    title = `No encontramos notas para "${query}".`
    copy = 'Probá con otra palabra o limpiá la búsqueda para volver al feed.'
  } else if (state.dateFilter) {
    title = 'No hay notas en esta fecha.'
    copy = 'Quitá el filtro de fecha indicado arriba para ver las notas de esta vista.'
  } else if (state.viewMode === 'subject') {
    title = activeSubject
      ? `${activeSubject.name} todavía no tiene notas.`
      : 'Esta materia todavía no tiene notas.'
    copy = 'Guardá la próxima idea con esta materia seleccionada.'
  } else if (state.viewMode === 'archived') {
    title = 'No hay notas archivadas.'
    copy = 'Cuando archives apuntes, vas a poder consultarlos desde acá.'
  }

  return `
    <div class="feed__empty">
      <svg class="feed__empty-icon" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        <line x1="8" y1="7" x2="16" y2="7"></line>
        <line x1="8" y1="11" x2="14" y2="11"></line>
      </svg>
      <p class="feed__empty-title">${escapeHtmlText(title)}</p>
      <p class="feed__empty-copy">${escapeHtmlText(copy)}</p>
    </div>
  `
}
