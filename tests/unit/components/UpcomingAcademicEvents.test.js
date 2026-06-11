import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const storeMock = vi.hoisted(() => {
  const mock = {
    state: null,
    subscriber: null,
    unsubscribe: vi.fn(),
    subscribe: vi.fn(),
    deleteAcademicEvent: vi.fn().mockResolvedValue(undefined),
  }

  mock.subscribe.mockImplementation(callback => {
    mock.subscriber = callback
    callback(mock.state)
    return mock.unsubscribe
  })

  return mock
})

vi.mock('../../../src/store/NoteStore.js', () => ({
  subscribe: storeMock.subscribe,
  deleteAcademicEvent: storeMock.deleteAcademicEvent,
}))

const dialogMock = vi.hoisted(() => ({
  openAcademicEventDialog: vi.fn().mockResolvedValue(null),
}))

const confirmMock = vi.hoisted(() => ({
  confirmDialog: vi.fn().mockResolvedValue(true),
}))

vi.mock('../../../src/components/academic-events/AcademicEventDialog.js', () => ({
  openAcademicEventDialog: dialogMock.openAcademicEventDialog,
}))

vi.mock('../../../src/components/common/ConfirmDialog.js', () => ({
  confirmDialog: confirmMock.confirmDialog,
}))

import {
  UpcomingAcademicEvents,
  getUpcomingEvents,
} from '../../../src/components/academic-events/UpcomingAcademicEvents.js'

function event(overrides = {}) {
  return {
    id: 'event-1',
    type: 'parcial',
    title: 'Primer parcial',
    date: '2026-06-14',
    subjectId: 'subj-1',
    createdAt: '2026-05-31T10:00:00.000Z',
    updatedAt: '2026-05-31T10:00:00.000Z',
    ...overrides,
  }
}

function defaultState(overrides = {}) {
  return {
    upcomingAcademicEvents: [],
    subjects: {
      tree: [
        {
          id: 'subj-1',
          name: 'Algebra',
          color: '#818cf8',
          children: [{ id: 'sec-1', name: 'Unidad I', color: '#34d399' }],
        },
      ],
    },
    archivedSubjects: { tree: [] },
    archivedSubjectIds: [],
    ...overrides,
  }
}

function createUpcoming() {
  document.body.innerHTML = '<div id="upcoming"></div>'
  return new UpcomingAcademicEvents('upcoming')
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-06-01T12:00:00.000Z'))
  vi.clearAllMocks()
  storeMock.state = defaultState()
  storeMock.subscriber = null
  storeMock.deleteAcademicEvent.mockResolvedValue(undefined)
  confirmMock.confirmDialog.mockResolvedValue(true)
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('getUpcomingEvents()', () => {
  it('filtra pasados, ordena cronologicamente y limita a cinco', () => {
    const events = [
      event({ id: 'past', date: '2026-05-31' }),
      event({ id: 'july', date: '2026-07-01' }),
      event({ id: 'jun-05', date: '2026-06-05' }),
      event({ id: 'jun-02-b', date: '2026-06-02', createdAt: '2026-05-31T12:00:00.000Z' }),
      event({ id: 'jun-02-a', date: '2026-06-02', createdAt: '2026-05-31T10:00:00.000Z' }),
      event({ id: 'jun-20', date: '2026-06-20' }),
      event({ id: 'aug', date: '2026-08-01' }),
    ]

    expect(getUpcomingEvents(events, '2026-06-01').map(item => item.id)).toEqual([
      'jun-02-a',
      'jun-02-b',
      'jun-05',
      'jun-20',
      'july',
    ])
  })
})

describe('UpcomingAcademicEvents', () => {
  it('no ocupa espacio si no hay eventos futuros', () => {
    const component = createUpcoming()
    const container = document.getElementById('upcoming')

    expect(container.hidden).toBe(true)
    expect(container.innerHTML).toBe('')

    component.destroy()
  })

  it('renderiza proximas fechas con materia, color e icono', () => {
    storeMock.state = defaultState({
      upcomingAcademicEvents: [
        event({ id: 'tp', type: 'tp', title: 'Entrega informe', date: '2026-06-14', subjectId: 'sec-1' }),
      ],
    })

    const component = createUpcoming()
    const item = document.querySelector('.academic-event-item')

    expect(document.getElementById('upcoming').hidden).toBe(false)
    expect(document.querySelector('.upcoming-academic-events__title')?.textContent).toBe('Proximas fechas')
    expect(document.querySelector('.upcoming-academic-events__count')?.textContent).toBe('1')
    expect(item?.dataset.eventId).toBe('tp')
    expect(item?.dataset.eventType).toBe('tp')
    expect(item?.getAttribute('style')).toContain('--academic-event-color: #34d399')
    expect(document.querySelector('.academic-event-item__title')?.textContent).toBe('Entrega informe')
    expect(document.querySelector('.academic-event-item__subject')?.textContent).toBe('Algebra > Unidad I')
    expect(document.querySelector('svg.academic-event-icon')).not.toBeNull()
    expect(document.querySelector('[data-event-action="edit"]')).not.toBeNull()
    expect(document.querySelector('[data-event-action="delete"]')).not.toBeNull()

    component.destroy()
  })

  it('atenúa materia archivada y omite materia eliminada', () => {
    storeMock.state = defaultState({
      subjects: { tree: [] },
      archivedSubjectIds: ['arch-subj'],
      archivedSubjects: {
        tree: [
          { id: 'arch-subj', name: 'Fisica archivada', color: '#22d3ee', children: [] },
        ],
      },
      upcomingAcademicEvents: [
        event({ id: 'archived', title: 'Final archivo', date: '2026-06-10', subjectId: 'arch-subj' }),
        event({ id: 'deleted', title: 'Evento huerfano', date: '2026-06-12', subjectId: 'deleted-subj' }),
      ],
    })

    const component = createUpcoming()
    const archivedSubject = document
      .querySelector('[data-event-id="archived"]')
      ?.querySelector('.academic-event-item__subject')
    const deletedSubject = document
      .querySelector('[data-event-id="deleted"]')
      ?.querySelector('.academic-event-item__subject')

    expect(archivedSubject?.textContent).toBe('Fisica archivada')
    expect(archivedSubject?.classList.contains('academic-event-item__subject--archived')).toBe(true)
    expect(deletedSubject).toBeNull()

    component.destroy()
  })

  it('renderiza en tema oscuro sin emojis nativos y sin perder acciones', () => {
    document.documentElement.removeAttribute('data-theme')
    storeMock.state = defaultState({
      upcomingAcademicEvents: [
        event({ id: 'dark-event', type: 'exposicion', title: 'Defensa oral', date: '2026-06-14' }),
      ],
    })

    const component = createUpcoming()
    const container = document.querySelector('.upcoming-academic-events')

    expect(document.documentElement.getAttribute('data-theme')).toBeNull()
    expect(container?.textContent).not.toMatch(/[📖❓🔥✅📅🚀]/u)
    expect(container?.querySelector('.academic-event-item--with-actions')).not.toBeNull()

    component.destroy()
  })

  it('abre edicion desde proximas fechas', () => {
    const upcomingEvent = event({ id: 'edit-upcoming', title: 'Final oral', date: '2026-06-20' })
    storeMock.state = defaultState({
      upcomingAcademicEvents: [upcomingEvent],
    })

    const component = createUpcoming()

    document.querySelector('[data-event-action="edit"]').click()

    expect(dialogMock.openAcademicEventDialog).toHaveBeenCalledWith({
      mode: 'edit',
      event: upcomingEvent,
    })

    component.destroy()
  })

  it('elimina desde proximas fechas y actualiza via store', async () => {
    storeMock.state = defaultState({
      upcomingAcademicEvents: [
        event({ id: 'delete-upcoming', title: 'Entrega informe', date: '2026-06-14' }),
      ],
    })

    const component = createUpcoming()

    document.querySelector('[data-event-action="delete"]').click()
    await Promise.resolve()
    await Promise.resolve()

    expect(confirmMock.confirmDialog).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Eliminar fecha academica',
      confirmText: 'Eliminar',
      danger: true,
    }))
    expect(storeMock.deleteAcademicEvent).toHaveBeenCalledWith('delete-upcoming')

    component.destroy()
  })

  it('colapsa y expande la lista manteniendo el bloque compacto', () => {
    storeMock.state = defaultState({
      upcomingAcademicEvents: [
        event({ id: 'final', type: 'final', title: 'Mesa final', date: '2026-06-20' }),
      ],
    })

    const component = createUpcoming()
    const toggle = document.querySelector('#upcoming-academic-events-toggle')

    expect(toggle?.getAttribute('aria-expanded')).toBe('true')
    expect(document.querySelector('.upcoming-academic-events__list')).not.toBeNull()

    toggle.click()

    expect(document.querySelector('#upcoming-academic-events-toggle')?.getAttribute('aria-expanded')).toBe('false')
    expect(document.querySelector('.upcoming-academic-events--collapsed')).not.toBeNull()
    expect(document.querySelector('.upcoming-academic-events__list')).toBeNull()

    document.querySelector('#upcoming-academic-events-toggle').click()

    expect(document.querySelector('#upcoming-academic-events-toggle')?.getAttribute('aria-expanded')).toBe('true')
    expect(document.querySelector('.upcoming-academic-events__list')).not.toBeNull()

    component.destroy()
  })

  it('re-renderiza cuando el store publica cambios', () => {
    const component = createUpcoming()

    storeMock.state = defaultState({
      upcomingAcademicEvents: [
        event({ id: 'parcial', title: 'Segundo parcial', date: '2026-06-10' }),
      ],
    })
    storeMock.subscriber(storeMock.state)

    expect(document.getElementById('upcoming').hidden).toBe(false)
    expect(document.querySelector('.academic-event-item')?.dataset.eventId).toBe('parcial')

    storeMock.state = defaultState({ upcomingAcademicEvents: [] })
    storeMock.subscriber(storeMock.state)

    expect(document.getElementById('upcoming').hidden).toBe(true)
    expect(document.getElementById('upcoming').innerHTML).toBe('')

    component.destroy()
  })
})
