import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const storeMock = vi.hoisted(() => {
  const mock = {
    state: null,
    subscriber: null,
    unsubscribe: vi.fn(),
    subscribe: vi.fn(),
    setDateFilter: vi.fn(),
    loadAcademicEventsByMonth: vi.fn().mockResolvedValue(undefined),
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
  setDateFilter: storeMock.setDateFilter,
  loadAcademicEventsByMonth: storeMock.loadAcademicEventsByMonth,
}))

import { Heatmap } from '../../../src/components/Heatmap.js'

function note(overrides = {}) {
  return {
    id: 'note-1',
    updatedAt: '2026-06-14T12:00:00.000Z',
    ...overrides,
  }
}

function event(overrides = {}) {
  return {
    id: 'event-1',
    type: 'final',
    title: 'Mesa regular',
    date: '2026-06-14',
    subjectId: 'subj-1',
    createdAt: '2026-05-31T10:00:00.000Z',
    ...overrides,
  }
}

function defaultState(overrides = {}) {
  return {
    notes: [],
    dateFilter: null,
    academicEventsForMonth: [],
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

function createHeatmap() {
  document.body.innerHTML = '<div id="heatmap-container"></div>'
  return new Heatmap('heatmap-container')
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-06-01T12:00:00.000Z'))
  vi.clearAllMocks()
  storeMock.state = defaultState()
  storeMock.subscriber = null
  storeMock.loadAcademicEventsByMonth.mockResolvedValue(undefined)
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('Heatmap eventos academicos read-only', () => {
  it('renderiza notas y eventos academicos en el mismo dia sin perder data-level', () => {
    storeMock.state = defaultState({
      notes: [note()],
      academicEventsForMonth: [event()],
    })

    const heatmap = createHeatmap()
    const day = document.querySelector('.heatmap-day[data-date="2026-06-14"]')

    expect(day?.dataset.level).toBe('1')
    expect(day?.dataset.eventCount).toBe('1')
    expect(day?.querySelector('.academic-event-dot--final')).not.toBeNull()

    heatmap.destroy()
  })

  it('mantiene el filtro por fecha al hacer click sobre el dot del evento', () => {
    storeMock.state = defaultState({
      academicEventsForMonth: [event()],
    })

    const heatmap = createHeatmap()
    const dot = document.querySelector('.heatmap-day[data-date="2026-06-14"] .academic-event-dot')

    dot.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(storeMock.setDateFilter).toHaveBeenCalledWith('2026-06-14')
    heatmap.destroy()
  })

  it('limpia el filtro si se vuelve a hacer click sobre el dia seleccionado', () => {
    storeMock.state = defaultState({
      dateFilter: '2026-06-14',
      academicEventsForMonth: [event()],
    })

    const heatmap = createHeatmap()
    const day = document.querySelector('.heatmap-day[data-date="2026-06-14"]')

    day.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(storeMock.setDateFilter).toHaveBeenCalledWith(null)
    heatmap.destroy()
  })

  it('muestra detalle compacto para eventos del dia seleccionado', () => {
    storeMock.state = defaultState({
      dateFilter: '2026-06-14',
      academicEventsForMonth: [event({ type: 'tp', title: 'Entrega informe', subjectId: 'sec-1' })],
    })

    const heatmap = createHeatmap()
    const card = document.querySelector('.heatmap-events-card')

    expect(card).not.toBeNull()
    expect(card?.querySelector('.academic-event-item')?.dataset.eventType).toBe('tp')
    expect(card?.querySelector('.academic-event-item__title')?.textContent).toBe('Entrega informe')
    expect(card?.querySelector('.academic-event-item__subject')?.textContent).toBe('Algebra > Unidad I')
    expect(card?.querySelector('svg.academic-event-icon')).not.toBeNull()

    heatmap.destroy()
  })

  it('recarga eventos del mes visible al navegar y limpia dots anteriores mientras carga', () => {
    storeMock.state = defaultState({
      academicEventsForMonth: [event()],
    })

    const heatmap = createHeatmap()

    heatmap.changeMonth(1)

    expect(storeMock.loadAcademicEventsByMonth).toHaveBeenCalledWith(2026, 7)
    expect(document.querySelector('.heatmap-title')?.textContent).toBe('Julio 2026')
    expect(document.querySelector('.academic-event-dot')).toBeNull()

    heatmap.destroy()
  })

  it('re-renderiza dots cuando el store publica eventos nuevos', () => {
    const heatmap = createHeatmap()

    storeMock.state = defaultState({
      academicEventsForMonth: [event({ type: 'parcial' })],
    })
    storeMock.subscriber(storeMock.state)

    expect(document.querySelector('.heatmap-day[data-date="2026-06-14"] .academic-event-dot--parcial')).not.toBeNull()

    heatmap.destroy()
  })
})
