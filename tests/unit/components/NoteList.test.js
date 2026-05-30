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

    const html = list.renderCard({
      id: 'note-1',
      title: 'Resumen',
      content: 'Resumen\n\n- [ ] repasar integrales',
      pinned: false,
      archived: false,
      subjectId: null,
      statusEmoji: null,
      updatedAt: '2024-01-15T10:00:00.000Z',
    }, { tree: [] })

    const wrapper = document.createElement('div')
    wrapper.innerHTML = html

    expect(wrapper.querySelector('.note-card__implicit-title')?.textContent).toBe('Resumen')
    expect(wrapper.querySelector('input[type="checkbox"]')?.dataset.line).toBe('2')

    list.destroy()
  })
})
