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

const ADVERSARIAL_NOTE_ID = 'note-id"] data-injected="true # [odd'
const ADVERSARIAL_SUBJECT_ID = 'subject-id"] data-injected="true # [odd'
const INVALID_CSS_COLOR = '#38bdf8; position: fixed'

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

describe('NoteList presentation hardening', () => {
  function contaminatedSubjects() {
    return {
      tree: [
        {
          id: ADVERSARIAL_SUBJECT_ID,
          name: 'Álgebra "A" <B> & 😀',
          color: INVALID_CSS_COLOR,
          children: [],
        },
        {
          id: 'historic-color',
          name: 'Color histórico',
          color: '#38bdf8',
          children: [],
        },
      ],
    }
  }

  it('codifica IDs y texto, rechaza CSS arbitrario y conserva hex historico en badge y menu', () => {
    const list = createList()
    const html = list.renderCard(makeNote({
      id: ADVERSARIAL_NOTE_ID,
      subjectId: ADVERSARIAL_SUBJECT_ID,
      title: 'Resumen "A" <B> & 😀',
      content: 'Resumen "A" <B> & 😀\nCuerpo **Markdown**',
    }), contaminatedSubjects())
    const wrapper = document.createElement('div')
    wrapper.innerHTML = html

    const card = wrapper.querySelector('.note-card')
    const badge = wrapper.querySelector('.note-card__subject-badge')
    const moveButtons = [...wrapper.querySelectorAll('.js-btn-move-to')]
    const contaminatedMove = moveButtons.find(button => button.dataset.subjectId === ADVERSARIAL_SUBJECT_ID)
    const historicMove = moveButtons.find(button => button.dataset.subjectId === 'historic-color')

    expect(wrapper.querySelector('[data-injected]')).toBeNull()
    expect(wrapper.querySelectorAll('.note-card')).toHaveLength(1)
    expect(card?.dataset.id).toBe(ADVERSARIAL_NOTE_ID)
    expect(wrapper.querySelector('.note-card__implicit-title')?.textContent)
      .toBe('Resumen "A" <B> & 😀')
    expect(badge?.textContent).toBe('Álgebra "A" <B> & 😀')
    expect(badge?.style.getPropertyValue('--subject-color')).toBe('')
    expect(badge?.style.position).toBe('')
    expect(contaminatedMove?.dataset.noteId).toBe(ADVERSARIAL_NOTE_ID)
    expect(contaminatedMove?.querySelector('.note-card__move-color')?.style.position).toBe('')
    expect(historicMove?.querySelector('.note-card__move-color')?.getAttribute('style'))
      .toContain('background-color: #38bdf8')
    expect([...wrapper.querySelectorAll('[data-id]')].every(element => (
      element.dataset.id === ADVERSARIAL_NOTE_ID
    ))).toBe(true)
    expect([...wrapper.querySelectorAll('[data-note-id]')].every(element => (
      element.dataset.noteId === ADVERSARIAL_NOTE_ID
    ))).toBe(true)

    list.destroy()
  })

  it('usa la misma defensa en feed normal y ruta virtualizada', () => {
    const list = createList()
    const subjects = contaminatedSubjects()
    const contaminatedNote = makeNote({
      id: ADVERSARIAL_NOTE_ID,
      subjectId: ADVERSARIAL_SUBJECT_ID,
      content: 'Título <legítimo> "citado" & 😀\nTexto **Markdown**',
    })
    const state = { subjects }

    list.renderNotes([contaminatedNote], state)
    expect(list.feedContainer.querySelector('.note-card')?.dataset.id).toBe(ADVERSARIAL_NOTE_ID)
    expect(list.feedContainer.querySelector('[data-injected]')).toBeNull()

    const manyNotes = [
      contaminatedNote,
      ...Array.from({ length: 50 }, (_, index) => makeNote({ id: `note-${index + 2}` })),
    ]
    list.renderNotes(manyNotes, state)

    expect(list.feedContainer.classList.contains('feed--virtual')).toBe(true)
    expect(list.feedContainer.querySelector('.feed__window')).not.toBeNull()
    expect(list.feedContainer.querySelector('.note-card')?.dataset.id).toBe(ADVERSARIAL_NOTE_ID)
    expect(list.feedContainer.querySelector('[data-injected]')).toBeNull()
    expect(list.feedContainer.textContent).toContain('Título <legítimo> "citado" & 😀')

    list.destroy()
  })
})
