import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const storeMock = vi.hoisted(() => ({
  subscriber: null,
  unsubscribe: vi.fn(),
}))

const subjectServiceMock = vi.hoisted(() => ({
  getTrashItems: vi.fn(),
}))

vi.mock('../../../../src/store/NoteStore.js', () => ({
  subscribe: vi.fn((callback) => {
    storeMock.subscriber = callback
    return storeMock.unsubscribe
  }),
  getFilteredNotes: vi.fn(() => []),
  getState: vi.fn(() => ({ notes: [] })),
  selectNote: vi.fn(),
  setViewBackup: vi.fn(),
  deleteNote: vi.fn(),
  updateNoteSilent: vi.fn(),
  restoreNoteFromTrash: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../../src/services/SubjectService.js', () => ({
  getTrashItems: subjectServiceMock.getTrashItems,
}))

vi.mock('../../../../src/components/backup/BackupView.js', () => ({
  BackupView: class {
    constructor(container) {
      this.container = container
    }

    init() {
      this.container.innerHTML = '<div data-testid="backup-view">Backup</div>'
    }

    setPanel() {}
    destroy() {}
  },
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

function deferred() {
  let resolve
  let reject
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

function trashData(overrides = {}) {
  return {
    notes: [],
    subjects: [],
    orphanSections: [],
    totalCount: 0,
    ...overrides,
  }
}

function feedState(viewMode, overrides = {}) {
  return {
    viewMode,
    backupPanel: 'export',
    searchQuery: '',
    dateFilter: null,
    activeSubjectId: null,
    subjects: { tree: [] },
    ...overrides,
  }
}

async function flushPromises() {
  await Promise.resolve()
  await Promise.resolve()
}

beforeEach(() => {
  document.body.innerHTML = ''
  vi.useRealTimers()
  vi.clearAllMocks()
  storeMock.subscriber = null
  subjectServiceMock.getTrashItems.mockResolvedValue(trashData())
  NoteStore.getFilteredNotes.mockReturnValue([])
  NoteStore.restoreNoteFromTrash.mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    configurable: true,
  })
})

describe('NoteList trash request lifecycle', () => {
  it.each([
    ['feed', 'inbox', 'Todavía no hay notas en Entrada'],
    ['Backup', 'backup', 'Backup'],
    ['Acerca de', 'about', 'Acerca de'],
  ])('no permite que Papelera sobrescriba %s al resolver tarde', async (_name, viewMode, expectedText) => {
    const read = deferred()
    subjectServiceMock.getTrashItems.mockReturnValueOnce(read.promise)
    const list = createList()

    storeMock.subscriber(feedState('trash'))
    storeMock.subscriber(feedState(viewMode))
    const destinationHtml = list.feedContainer.innerHTML

    read.resolve(trashData())
    await flushPromises()

    expect(list.feedContainer.innerHTML).toBe(destinationHtml)
    expect(list.feedContainer.textContent).toContain(expectedText)
    list.destroy()
  })

  it('invalida las solicitudes de una visita anterior al salir y volver a Papelera', async () => {
    const firstVisit = deferred()
    const secondVisit = deferred()
    subjectServiceMock.getTrashItems
      .mockReturnValueOnce(firstVisit.promise)
      .mockReturnValueOnce(secondVisit.promise)
    const list = createList()

    storeMock.subscriber(feedState('trash'))
    storeMock.subscriber(feedState('about'))
    storeMock.subscriber(feedState('trash'))

    firstVisit.resolve(trashData({
      totalCount: 1,
      notes: [{ id: 'old', title: 'Visita anterior', content: '', deletedAt: '2026-09-01T10:00:00.000Z' }],
    }))
    await flushPromises()
    expect(list.feedContainer.textContent).not.toContain('Visita anterior')

    secondVisit.resolve(trashData({
      totalCount: 1,
      notes: [{ id: 'new', title: 'Visita vigente', content: '', deletedAt: '2026-09-01T10:00:00.000Z' }],
    }))
    await flushPromises()
    expect(list.feedContainer.textContent).toContain('Visita vigente')
    list.destroy()
  })

  it('solo presenta el refresh vigente cuando dos lecturas resuelven en orden inverso', async () => {
    const older = deferred()
    const newer = deferred()
    subjectServiceMock.getTrashItems
      .mockReturnValueOnce(older.promise)
      .mockReturnValueOnce(newer.promise)
    const list = createList()

    storeMock.subscriber(feedState('trash'))
    storeMock.subscriber(feedState('trash'))

    newer.resolve(trashData({
      totalCount: 1,
      notes: [{ id: 'new', title: 'Refresh vigente', content: '', deletedAt: '2026-09-01T10:00:00.000Z' }],
    }))
    await flushPromises()
    older.resolve(trashData({
      totalCount: 1,
      notes: [{ id: 'old', title: 'Refresh obsoleto', content: '', deletedAt: '2026-09-01T10:00:00.000Z' }],
    }))
    await flushPromises()

    expect(list.feedContainer.textContent).toContain('Refresh vigente')
    expect(list.feedContainer.textContent).not.toContain('Refresh obsoleto')
    list.destroy()
  })

  it('invalida una lectura pendiente al destruir el consumidor', async () => {
    const read = deferred()
    subjectServiceMock.getTrashItems.mockReturnValueOnce(read.promise)
    const list = createList()
    const detachedFeed = list.feedContainer

    storeMock.subscriber(feedState('trash'))
    list.destroy()
    read.resolve(trashData())
    await flushPromises()

    expect(detachedFeed.innerHTML).toBe('')
  })

  it('invalida una lectura pendiente cuando otro NoteList reemplaza al consumidor', async () => {
    const read = deferred()
    subjectServiceMock.getTrashItems.mockReturnValueOnce(read.promise)
    const container = document.createElement('div')
    document.body.appendChild(container)
    const previousList = new NoteList(container)
    const previousSubscriber = storeMock.subscriber
    const detachedFeed = previousList.feedContainer

    previousSubscriber(feedState('trash'))
    const currentList = new NoteList(container)
    read.resolve(trashData())
    await flushPromises()

    expect(detachedFeed.innerHTML).toBe('')
    expect(container.querySelector('#feed-items')).toBe(currentList.feedContainer)
    previousList.destroy()
    currentList.destroy()
  })

  it('reporta el rechazo vigente y consume en silencio el rechazo obsoleto', async () => {
    const currentRead = deferred()
    const staleRead = deferred()
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    subjectServiceMock.getTrashItems
      .mockReturnValueOnce(currentRead.promise)
      .mockReturnValueOnce(staleRead.promise)
    const list = createList()

    storeMock.subscriber(feedState('trash'))
    const currentError = new Error('current read failed')
    currentRead.reject(currentError)
    await flushPromises()

    expect(errorSpy).toHaveBeenCalledWith(
      '[NoteList] No se pudo cargar la papelera:',
      currentError,
    )

    storeMock.subscriber(feedState('trash'))
    storeMock.subscriber(feedState('about'))
    staleRead.reject(new Error('stale read failed'))
    await flushPromises()

    expect(errorSpy).toHaveBeenCalledTimes(1)
    errorSpy.mockRestore()
    list.destroy()
  })

  it('invalida el refresh iniciado por una acción cuando la navegación cambia', async () => {
    const actionRefresh = deferred()
    subjectServiceMock.getTrashItems
      .mockResolvedValueOnce(trashData({
        totalCount: 1,
        notes: [{ id: 'restore-me', title: 'Restaurar', content: '', deletedAt: '2026-09-01T10:00:00.000Z' }],
      }))
      .mockReturnValueOnce(actionRefresh.promise)
    const list = createList()

    storeMock.subscriber(feedState('trash'))
    await flushPromises()
    list.feedContainer.querySelector('.js-btn-restore').click()
    await flushPromises()
    expect(NoteStore.restoreNoteFromTrash).toHaveBeenCalledWith('restore-me')

    storeMock.subscriber(feedState('about'))
    const aboutHtml = list.feedContainer.innerHTML
    actionRefresh.resolve(trashData())
    await flushPromises()

    expect(list.feedContainer.innerHTML).toBe(aboutHtml)
    expect(list.feedContainer.textContent).toContain('Acerca de')
    list.destroy()
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
