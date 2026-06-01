import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/store/NoteStore.js', () => ({
  subscribe: vi.fn(() => vi.fn()),
  getFilteredNotes: vi.fn(() => []),
  getState: vi.fn(() => ({ notes: [] })),
  selectNote: vi.fn(),
  deleteNote: vi.fn(),
  updateNoteSilent: vi.fn(),
}))

import { NoteList } from '../../../src/components/NoteList.js'

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
