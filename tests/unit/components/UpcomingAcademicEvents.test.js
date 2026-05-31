import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const storeMock = vi.hoisted(() => {
  const mock = {
    state: null,
    subscriber: null,
    unsubscribe: vi.fn(),
    subscribe: vi.fn(),
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
}))

import {
  UpcomingAcademicEvents,
  getUpcomingEvents,
} from '../../../src/components/UpcomingAcademicEvents.js'

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
