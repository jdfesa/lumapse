import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createFeedFilters } from '../../../../src/components/feed/FeedFilters.js'

let filters, state, root, onClearDate, onClearSearch

beforeEach(() => {
  document.body.innerHTML = '<div id="filters"></div><div id="feed" tabindex="-1"></div>'
  state = { viewMode: 'inbox', searchQuery: '', dateFilter: null, subjects: { tree: [] } }
  onClearDate = vi.fn(() => { state.dateFilter = null; filters.update(state) })
  onClearSearch = vi.fn(() => { state.searchQuery = ''; filters.update(state) })
  filters = createFeedFilters(document.getElementById('filters'), {
    onClearDate, onClearSearch, focusTarget: document.getElementById('feed'),
  })
  root = document.querySelector('.feed-filters')
})

afterEach(() => {
  filters.destroy()
  document.body.innerHTML = ''
})

describe('FeedFilters presentación y lifecycle', () => {
  it.each(['', '  ', '\u0301'])('no muestra filtros cuando la búsqueda %j no tiene efecto', query => {
    state.searchQuery = query
    filters.update(state)
    expect(root.hidden).toBe(true)
    expect(root.querySelector('[data-clear-date]').hidden).toBe(true)
    expect(root.querySelector('[data-clear-search]').hidden).toBe(true)
  })

  it.each([
    ['inbox', 'Entrada'],
    ['all', 'Notas activas'],
    ['subject', 'Materia o sección seleccionada'],
    ['archived', 'Archivadas'],
  ])('describe %s sin búsqueda global ni depender de un árbol disponible', (viewMode, label) => {
    filters.update({ ...state, subjects: null, viewMode, dateFilter: '2024-02-29' })
    expect(root.hidden).toBe(false)
    expect(root.querySelector('.feed-filters__scope').textContent).toBe(label)
    expect(root.querySelector('[data-clear-date]').textContent).toContain('29/02/2024')
  })

  it.each(['2026-02-30', 'no-date', '<img src=x onerror=alert(1)>'])('permite quitar fecha inválida %j sin interpretarla como HTML', dateFilter => {
    state.dateFilter = dateFilter
    filters.update(state)
    expect(root.hidden).toBe(false)
    const button = root.querySelector('[data-clear-date]')
    expect(button.textContent).toContain('Fecha no válida')
    expect(root.querySelector('img')).toBeNull()
    button.querySelector('span').click()
    expect(onClearDate).toHaveBeenCalledTimes(1)
    expect(root.hidden).toBe(true)
  })

  it('presenta nombres y consulta largos/adversariales solo como texto', () => {
    const name = '<img src=x onerror=alert(1)> "&" 😀'.repeat(20)
    state = { ...state, viewMode: 'subject', activeSubjectId: 'child', dateFilter: '2026-09-14', subjects: {
      tree: [{ id: 'parent', name, children: [{ id: 'child', name: 'Sección <script>1</script>' }] }],
    } }
    filters.update(state)
    expect(root.querySelector('.feed-filters__scope').textContent).toBe(`${name} › Sección <script>1</script>`)
    state.searchQuery = name
    filters.update(state)
    expect(root.querySelector('[data-search-label]').textContent).toBe(`Búsqueda: ${name}`)
    expect(root.querySelectorAll('img, script, [onerror]')).toHaveLength(0)
    expect(root.querySelectorAll('button')).toHaveLength(2)
  })

  it('conserva botones nativos, nombres visibles y foco al quitar el último filtro', () => {
    state.dateFilter = '2026-09-14'
    filters.update(state)
    const button = root.querySelector('[data-clear-date]')
    expect(button.type).toBe('button')
    expect(button.textContent).toContain('Quitar fecha')
    button.focus()
    button.click()
    expect(document.activeElement).toBe(document.getElementById('feed'))
    expect(onClearSearch).not.toHaveBeenCalled()
  })

  it('no roba foco ante una limpieza accionada sin foco ni ejecuta controles ocultos', () => {
    state.dateFilter = '2026-09-14'
    filters.update(state)
    const feed = document.getElementById('feed')
    feed.focus()
    root.querySelector('[data-clear-date]').click()
    expect(document.activeElement).toBe(feed)
    root.querySelector('[data-clear-date]').click()
    root.querySelector('[data-clear-search]').click()
    expect(onClearDate).toHaveBeenCalledTimes(1)
    expect(onClearSearch).not.toHaveBeenCalled()
    filters.update({ ...state, viewMode: 'trash', dateFilter: '2026-09-14' })
    root.querySelector('[data-clear-date]').click()
    expect(onClearDate).toHaveBeenCalledTimes(1)
  })

  it('retira listeners y contenido al destruir aunque se conserve un botón separado', () => {
    state.searchQuery = 'Resumen'
    filters.update(state)
    const button = root.querySelector('[data-clear-search]')
    filters.destroy()
    button.click()
    expect(onClearSearch).not.toHaveBeenCalled()
    expect(document.getElementById('filters').innerHTML).toBe('')
  })
})
