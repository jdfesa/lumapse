import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../../src/store/NoteStore.js', () => ({
  subscribe: vi.fn(() => vi.fn()),
  getFilteredNotes: vi.fn(() => []),
  getState: vi.fn(() => ({ notes: [] })),
  selectNote: vi.fn(),
  deleteNote: vi.fn(),
  updateNoteSilent: vi.fn(),
}))

import * as NoteStore from '../../../../src/store/NoteStore.js'
import { NoteList } from '../../../../src/components/feed/NoteList.js'

function makeNote(overrides = {}) {
  return {
    id: 'note-1',
    title: 'Resumen',
    content: 'Resumen\nCuerpo',
    pinned: false,
    archived: false,
    subjectId: null,
    statusEmoji: null,
    updatedAt: '2024-01-15T10:00:00.000Z',
    ...overrides,
  }
}

function createList() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  return new NoteList(container)
}

beforeEach(() => {
  document.body.innerHTML = ''
  vi.useRealTimers()
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    configurable: true,
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('NoteList implicit titles', () => {
  it('mantiene data-line real en checkboxes cuando hay líneas en blanco después del título', () => {
    const list = createList()

    const html = list.renderCard(makeNote({
      content: 'Resumen\n\n- [ ] repasar integrales',
    }), { tree: [] })

    const wrapper = document.createElement('div')
    wrapper.innerHTML = html

    expect(wrapper.querySelector('.note-card__implicit-title')?.textContent).toBe('Resumen')
    expect(wrapper.querySelector('input[type="checkbox"]')?.dataset.line).toBe('2')

    list.destroy()
  })

  it('usa SVGs para estados académicos sin mostrar emojis nativos en la tarjeta', () => {
    const list = createList()

    const html = list.renderCard(makeNote({ statusEmoji: '🔥' }), { tree: [] })
    const wrapper = document.createElement('div')
    wrapper.innerHTML = html

    expect(wrapper.querySelector('.note-card__status-badge svg.note-status-icon')).not.toBeNull()
    expect(wrapper.querySelector('.note-card__status-btn--current')?.dataset.emoji).toBe('🔥')
    expect(wrapper.textContent).not.toContain('🔥')

    list.destroy()
  })
})

describe('NoteList empty states', () => {
  it('muestra un estado vacío específico para búsquedas sin resultados', () => {
    const list = createList()

    list.renderNotes([], {
      searchQuery: 'algebra',
      viewMode: 'inbox',
      dateFilter: null,
      activeSubjectId: null,
      subjects: { tree: [] },
    })

    expect(list.feedContainer.textContent).toContain('No encontramos notas para "algebra"')
    expect(list.feedContainer.textContent).toContain('limpiá la búsqueda')

    list.destroy()
  })

  it('muestra un estado vacío específico para una materia sin notas', () => {
    const list = createList()

    list.renderNotes([], {
      searchQuery: '',
      viewMode: 'subject',
      dateFilter: null,
      activeSubjectId: 'subject-1',
      subjects: {
        tree: [{ id: 'subject-1', name: 'Programación I', children: [] }],
      },
    })

    expect(list.feedContainer.textContent).toContain('Programación I todavía no tiene notas')
    expect(list.feedContainer.textContent).toContain('materia seleccionada')

    list.destroy()
  })
})

describe('NoteList copy feedback', () => {
  it('muestra Copiado con check antes de cerrar suavemente el dropdown', async () => {
    vi.useFakeTimers()
    NoteStore.getFilteredNotes.mockReturnValueOnce([makeNote()])
    const list = createList()
    const wrapper = document.createElement('div')
    wrapper.innerHTML = `
      <div class="note-card__dropdown is-open">
        <button class="note-card__dropdown-btn js-btn-copy" data-id="note-1">
          <span>Copiar</span>
        </button>
      </div>
    `
    const dropdown = wrapper.querySelector('.note-card__dropdown')
    const button = wrapper.querySelector('button')
    document.body.appendChild(wrapper)

    await list.handleCopy(button)

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Resumen\nCuerpo')
    expect(button.textContent).toContain('Copiado')
    expect(button.disabled).toBe(true)
    expect(button.classList.contains('note-card__dropdown-btn--copied')).toBe(true)

    await vi.advanceTimersByTimeAsync(1000)
    expect(dropdown.classList.contains('is-closing')).toBe(true)

    await vi.advanceTimersByTimeAsync(220)
    expect(dropdown.classList.contains('is-open')).toBe(false)
    expect(dropdown.classList.contains('is-closing')).toBe(false)
    expect(button.disabled).toBe(false)
    expect(button.textContent).toContain('Copiar')

    list.destroy()
  })
})
