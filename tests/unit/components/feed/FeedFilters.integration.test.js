import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { postWriteRefreshHarness } from '../../store/postWriteRefreshHarness.js'

// DOM, store y filtros reales. SQLite en memoria solo prepara el store;
// cambiar filtros no debe leer ni escribir la base de datos.
let harness, list, heatmap, cleanups, documentListeners

vi.mock('../../../../src/components/backup/BackupView.js', () => ({
  BackupView: class {
    constructor(container) { this.container = container }
    init() { this.container.textContent = 'Backup' }
    setPanel() {}
    destroy() {}
  },
}))

function note(id, subjectId, overrides = {}) {
  return {
    id, subjectId, title: `Resumen ${id}`, content: `Resumen ${id}\nContenido`,
    archived: false, pinned: false, updatedAt: '2026-09-14T01:00:00.000Z',
    ...overrides,
  }
}

beforeEach(async () => {
  localStorage.clear()
  cleanups = []
  documentListeners = vi.spyOn(document, 'addEventListener')
  harness = await postWriteRefreshHarness()
  harness.state.subjects = {
    inboxCount: 1,
    tree: [{ id: 'math', name: 'Matemática', noteCount: 2, color: '#818cf8', children: [
      { id: 'logic', name: 'Lógica', noteCount: 1, color: '#818cf8' },
    ] }],
  }
  harness.state.notes = [
    note('inbox', null), note('parent', 'math'), note('child', 'logic'),
    note('other', 'other'), note('archived', null, { archived: true }),
    note('archived-subject', 'old'),
  ]
  harness.state.archivedSubjectIds = ['old']
  const { renderAppShell } = await import('../../../../src/layout/appShell.js')
  const { NoteList } = await import('../../../../src/components/feed/NoteList.js')
  const { Heatmap } = await import('../../../../src/components/academic-events/Heatmap.js')
  const { initDrawer } = await import('../../../../src/layout/drawerController.js')
  document.body.innerHTML = renderAppShell()
  list = new NoteList(document.getElementById('feed-items-container'))
  heatmap = new Heatmap('heatmap-container')
  initDrawer({
    NoteStore: { ...harness.store, subscribe(callback) {
      const unsubscribe = harness.store.subscribe(callback)
      cleanups.push(unsubscribe)
      return unsubscribe
    } },
    ThemeService: { init() {}, getTheme: () => 'dark', onThemeChange() {}, toggle() {} },
    SUBJECT_COLORS: ['#818cf8'],
  })
  harness.db.run.mockClear()
  harness.db.query.mockClear()
})

afterEach(() => {
  list?.destroy()
  heatmap?.destroy()
  cleanups?.forEach(unsubscribe => unsubscribe())
  documentListeners?.mock.calls.forEach(([type, listener, options]) => {
    document.removeEventListener(type, listener, options)
  })
  documentListeners?.mockRestore()
  harness?.fixture.close()
  document.body.innerHTML = ''
  document.body.style.overflow = ''
  vi.useRealTimers()
})

function filters() { return document.querySelector('.feed-filters') }
function clearDate() { return document.querySelector('[data-clear-date]') }
function clearSearch() { return document.querySelector('[data-clear-search]') }
function ids() { return harness.store.getFilteredNotes().map(item => item.id) }
function typeSearch(value) {
  const input = document.getElementById('drawer-search-input')
  input.value = value
  input.dispatchEvent(new window.Event('input', { bubbles: true }))
  return input
}

describe('filtros visibles con store real', () => {
  it.each([
    ['math', 'Matemática', ['parent', 'child']],
    ['logic', 'Matemática › Lógica', ['child']],
  ])('expone fecha con calendario cerrado y recupera %s sin cambiar datos ni conteos', (subjectId, label, expectedIds) => {
    const original = structuredClone({ notes: harness.state.notes, subjects: harness.state.subjects })
    const popup = document.getElementById('calendar-popup')
    popup.classList.add('is-open')
    heatmap.currentYear = 2026
    heatmap.currentMonth = 8
    heatmap.render()
    popup.querySelector('[data-date="2026-09-15"]').click()
    // Simula el cierre del popup del shell; el control debe estar fuera de él.
    popup.classList.remove('is-open')
    document.querySelector(`.js-subject-nav[data-subject="${subjectId}"]`).click()

    expect(ids()).toEqual([])
    expect(list.feedContainer.textContent).toContain('No hay notas en esta fecha')
    expect(filters()).not.toBeNull()
    expect(filters().hidden).toBe(false)
    expect(filters().textContent).toContain(label)
    expect(filters().textContent).toContain('totales sin filtrar')
    expect(clearDate().textContent).toContain('15/09/2026')
    expect(popup.contains(clearDate())).toBe(false)
    expect(list.feedContainer.contains(filters())).toBe(false)
    clearDate().click()

    expect(ids()).toEqual(expectedIds)
    expect(harness.state).toMatchObject({ dateFilter: null, activeSubjectId: subjectId, viewMode: 'subject' })
    expect(heatmap.selectedDate).toBeNull()
    expect(popup.querySelector('#hm-clear')).toBeNull()
    expect(filters().hidden).toBe(true)
    expect({ notes: harness.state.notes, subjects: harness.state.subjects }).toEqual(original)
    expect(harness.db.run).not.toHaveBeenCalled()
    expect(harness.db.query).not.toHaveBeenCalled()
  })

  it('expone búsqueda global y quita fecha/búsqueda de forma independiente', () => {
    harness.store.setActiveSubject('logic')
    harness.store.setSearchQuery('RÉSUMEN')
    harness.store.setDateFilter('2026-09-15')
    expect(filters()).not.toBeNull()
    expect(filters().textContent).toContain('Búsqueda global · notas activas')
    expect(ids()).toEqual([])
    expect(list.feedContainer.textContent).toContain('fecha y la búsqueda')
    clearDate().click()
    expect(harness.state.searchQuery).toBe('RÉSUMEN')
    expect(ids()).toEqual(['inbox', 'parent', 'child', 'other'])
    expect(clearSearch().textContent).toContain('RÉSUMEN')
    clearSearch().click()
    expect(ids()).toEqual(['child'])
    expect(harness.state.activeSubjectId).toBe('logic')
    expect(document.getElementById('drawer-search-input').value).toBe('')
    expect(filters().hidden).toBe(true)
  })

  it('quitar búsqueda conserva fecha y devuelve el alcance de la sección', () => {
    harness.store.setActiveSubject('logic')
    harness.store.setDateFilter('2026-09-14')
    harness.store.setSearchQuery('Resumen')
    expect(clearSearch()).not.toBeNull()
    clearSearch().click()
    expect(harness.state.dateFilter).toBe('2026-09-14')
    expect(ids()).toEqual(['child'])
    expect(filters().textContent).toContain('Matemática › Lógica')
    expect(clearDate().textContent).toContain('14/09/2026')
    // 01:00 UTC todavía es el día anterior en Argentina: no convertir el día.
  })

  it('conserva controles y foco entre feed vacío, normal y virtualizado', () => {
    harness.state.notes = Array.from({ length: 500 }, (_, i) => note(`n${i}`, null))
    harness.store.setDateFilter('2026-09-15')
    harness.store.setSearchQuery('Resumen')
    const button = clearDate()
    expect(button).not.toBeNull()
    button.focus()
    harness.store.setDateFilter('2026-09-14')
    expect(list.feedContainer.classList.contains('feed--virtual')).toBe(true)
    expect(document.activeElement).toBe(button)
    expect(clearDate()).toBe(button)
    button.click()
    expect(document.activeElement).toBe(clearSearch())
    clearSearch().click()
    expect(document.activeElement).toBe(list.feedContainer)
    expect(ids()).toHaveLength(500)
    expect(list.feedContainer.querySelectorAll('.note-card').length).toBeLessThan(500)
    harness.state.notes = harness.state.notes.slice(0, 50)
    harness.store.setDateFilter('2026-09-14')
    expect(list.feedContainer.classList.contains('feed--virtual')).toBe(false)
    expect(list.feedContainer.querySelectorAll('.note-card')).toHaveLength(50)
    expect(clearDate()).toBe(button)
    harness.store.setDateFilter('2026-09-15')
    expect(list.feedContainer.querySelectorAll('.note-card')).toHaveLength(0)
    expect(filters().hidden).toBe(false)
    expect(clearDate()).toBe(button)
  })

  it.each(['trash', 'backup', 'about'])('oculta los filtros en %s sin perderlos al volver', async view => {
    harness.store.setDateFilter('2026-09-15')
    harness.store.setSearchQuery('Resumen')
    harness.store.setViewMode(view)
    await Promise.resolve()
    expect(filters()).not.toBeNull()
    expect(filters().hidden).toBe(true)
    harness.store.setActiveSubject('math')
    expect(filters().hidden).toBe(false)
    expect(harness.state).toMatchObject({ dateFilter: '2026-09-15', searchQuery: 'Resumen' })
  })

  it('no presenta la búsqueda de Archivadas como global en notas activas', () => {
    harness.store.setViewMode('archived')
    harness.store.setDateFilter('2026-09-14')
    harness.store.setSearchQuery('Resumen')
    expect(filters()).not.toBeNull()
    expect(filters().textContent).toContain('Archivadas')
    expect(filters().textContent).not.toContain('Búsqueda global')
    expect(ids()).toEqual(['archived', 'archived-subject'])
    clearSearch().click()
    expect(harness.state.viewMode).toBe('archived')
    expect(harness.state.dateFilter).toBe('2026-09-14')
    clearDate().click()
    expect(ids()).toEqual(['archived', 'archived-subject'])
  })

  it('sincroniza el drawer y cancela el debounce obsoleto al quitar búsqueda', async () => {
    vi.useFakeTimers()
    const input = typeSearch('Resumen')
    await vi.advanceTimersByTimeAsync(200)
    typeSearch('otra consulta pendiente')
    expect(clearSearch()).not.toBeNull()
    clearSearch().click()
    expect(input.value).toBe('')
    const listener = vi.fn()
    cleanups.push(harness.store.subscribe(listener))
    listener.mockClear()
    await vi.advanceTimersByTimeAsync(250)
    expect(listener).not.toHaveBeenCalled()
    expect(harness.state.searchQuery).toBe('')
    expect(filters().hidden).toBe(true)
  })

  it('no borra texto en escritura por una notificación ajena durante el debounce', async () => {
    vi.useFakeTimers()
    const input = typeSearch('Resumen')
    harness.store.setDateFilter('2026-09-14')
    expect(input.value).toBe('Resumen')
    await vi.advanceTimersByTimeAsync(200)
    expect(harness.state.searchQuery).toBe('Resumen')
    expect(filters()).not.toBeNull()
    expect(filters().textContent).toContain('Búsqueda global')
  })
})
