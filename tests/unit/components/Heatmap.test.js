import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const storeMock = vi.hoisted(() => {
  const mock = {
    state: null,
    subscriber: null,
    unsubscribe: vi.fn(),
    subscribe: vi.fn(),
    setDateFilter: vi.fn(),
    loadAcademicEventsByMonth: vi.fn().mockResolvedValue(undefined),
    deleteAcademicEvent: vi.fn().mockResolvedValue(undefined),
  }

  mock.subscribe.mockImplementation(callback => {
    mock.subscriber = callback
    callback(mock.state)
    return mock.unsubscribe
  })

  return mock
})

const dialogMock = vi.hoisted(() => ({
  openAcademicEventDialog: vi.fn().mockResolvedValue(null),
}))

const confirmMock = vi.hoisted(() => ({
  confirmDialog: vi.fn().mockResolvedValue(true),
}))

vi.mock('../../../src/store/NoteStore.js', () => ({
  subscribe: storeMock.subscribe,
  setDateFilter: storeMock.setDateFilter,
  loadAcademicEventsByMonth: storeMock.loadAcademicEventsByMonth,
  deleteAcademicEvent: storeMock.deleteAcademicEvent,
}))

vi.mock('../../../src/components/academic-events/AcademicEventDialog.js', () => ({
  openAcademicEventDialog: dialogMock.openAcademicEventDialog,
}))

vi.mock('../../../src/components/common/ConfirmDialog.js', () => ({
  confirmDialog: confirmMock.confirmDialog,
}))

import { Heatmap } from '../../../src/components/academic-events/Heatmap.js'

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
    archivedSubjects: { tree: [] },
    archivedSubjectIds: [],
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
  storeMock.deleteAcademicEvent.mockResolvedValue(undefined)
  confirmMock.confirmDialog.mockResolvedValue(true)
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('Heatmap eventos academicos read-only', () => {
  it('mantiene legible un dia con notas pero sin eventos', () => {
    storeMock.state = defaultState({
      notes: [note()],
      academicEventsForMonth: [],
    })

    const heatmap = createHeatmap()
    const day = document.querySelector('.heatmap-day[data-date="2026-06-14"]')

    expect(day?.dataset.level).toBe('1')
    expect(day?.dataset.eventCount).toBe('0')
    expect(day?.querySelector('.academic-event-dot')).toBeNull()

    heatmap.destroy()
  })

  it('mantiene legible un dia con eventos pero sin notas', () => {
    storeMock.state = defaultState({
      notes: [],
      academicEventsForMonth: [event({ type: 'parcial' })],
    })

    const heatmap = createHeatmap()
    const day = document.querySelector('.heatmap-day[data-date="2026-06-14"]')

    expect(day?.dataset.level).toBe('0')
    expect(day?.dataset.eventCount).toBe('1')
    expect(day?.querySelector('.academic-event-dot--parcial')).not.toBeNull()

    heatmap.destroy()
  })

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

  it('limita dots cuando hay muchos eventos el mismo dia sin ocultar el detalle', () => {
    storeMock.state = defaultState({
      dateFilter: '2026-06-14',
      academicEventsForMonth: [
        event({ id: 'a', type: 'parcial' }),
        event({ id: 'b', type: 'final' }),
        event({ id: 'c', type: 'tp' }),
        event({ id: 'd', type: 'exposicion' }),
      ],
    })

    const heatmap = createHeatmap()
    const day = document.querySelector('.heatmap-day[data-date="2026-06-14"]')

    expect(day?.dataset.eventCount).toBe('4')
    expect(day?.querySelectorAll('.academic-event-dot')).toHaveLength(3)
    expect(document.querySelectorAll('.heatmap-events-card .academic-event-item')).toHaveLength(4)

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
    expect(card?.querySelector('[data-event-action="edit"]')).not.toBeNull()
    expect(card?.querySelector('[data-event-action="delete"]')).not.toBeNull()

    heatmap.destroy()
  })

  it('abre edicion desde el mini-card del dia seleccionado', () => {
    const selectedEvent = event({ id: 'edit-me', type: 'final', title: 'Mesa regular' })
    storeMock.state = defaultState({
      dateFilter: '2026-06-14',
      academicEventsForMonth: [selectedEvent],
    })

    const heatmap = createHeatmap()

    document.querySelector('[data-event-action="edit"]').click()

    expect(dialogMock.openAcademicEventDialog).toHaveBeenCalledWith({
      mode: 'edit',
      event: selectedEvent,
    })

    heatmap.destroy()
  })

  it('elimina desde el mini-card con confirmacion accesible', async () => {
    storeMock.state = defaultState({
      dateFilter: '2026-06-14',
      academicEventsForMonth: [event({ id: 'delete-me', title: 'Mesa regular' })],
    })

    const heatmap = createHeatmap()

    document.querySelector('[data-event-action="delete"]').click()
    await Promise.resolve()
    await Promise.resolve()

    expect(confirmMock.confirmDialog).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Eliminar fecha academica',
      confirmText: 'Eliminar',
      danger: true,
    }))
    expect(storeMock.deleteAcademicEvent).toHaveBeenCalledWith('delete-me')

    heatmap.destroy()
  })

  it('no elimina si el usuario cancela la confirmacion', async () => {
    confirmMock.confirmDialog.mockResolvedValue(false)
    storeMock.state = defaultState({
      dateFilter: '2026-06-14',
      academicEventsForMonth: [event({ id: 'keep-me' })],
    })

    const heatmap = createHeatmap()

    document.querySelector('[data-event-action="delete"]').click()
    await Promise.resolve()
    await Promise.resolve()

    expect(storeMock.deleteAcademicEvent).not.toHaveBeenCalled()

    heatmap.destroy()
  })

  it('atenúa la materia archivada si el store conserva su label', () => {
    storeMock.state = defaultState({
      dateFilter: '2026-06-14',
      subjects: { tree: [] },
      archivedSubjectIds: ['arch-child'],
      archivedSubjects: {
        tree: [
          {
            id: 'arch-root',
            name: 'Historia',
            color: '#f87171',
            children: [{ id: 'arch-child', name: 'Unidad II', color: '#fb923c' }],
          },
        ],
      },
      academicEventsForMonth: [
        event({ id: 'archived-event', subjectId: 'arch-child' }),
      ],
    })

    const heatmap = createHeatmap()
    const subject = document.querySelector('.academic-event-item__subject')

    expect(subject?.textContent).toBe('Historia > Unidad II')
    expect(subject?.classList.contains('academic-event-item__subject--archived')).toBe(true)

    heatmap.destroy()
  })

  it('deja el evento sin materia visible si la materia fue eliminada', () => {
    storeMock.state = defaultState({
      dateFilter: '2026-06-14',
      academicEventsForMonth: [
        event({ id: 'orphan-event', subjectId: 'deleted-subject' }),
      ],
    })

    const heatmap = createHeatmap()

    expect(document.querySelector('.academic-event-item__subject')).toBeNull()
    heatmap.destroy()
  })

  it('abre el dialogo de nueva fecha con la fecha seleccionada', () => {
    storeMock.state = defaultState({
      dateFilter: '2026-06-14',
    })

    const heatmap = createHeatmap()

    document.querySelector('#hm-add-event').click()

    expect(dialogMock.openAcademicEventDialog).toHaveBeenCalledWith({
      mode: 'create',
      date: '2026-06-14',
    })

    heatmap.destroy()
  })

  it('renderiza en ancho mobile y tema claro sin emojis nativos en fechas academicas', () => {
    Object.defineProperty(window, 'innerWidth', { value: 360, configurable: true })
    document.documentElement.setAttribute('data-theme', 'light')
    storeMock.state = defaultState({
      dateFilter: '2026-06-14',
      academicEventsForMonth: [event({ id: 'mobile-event', type: 'tp', title: 'Entrega mobile' })],
    })

    const heatmap = createHeatmap()
    const container = document.querySelector('.heatmap-container')

    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(container?.textContent).not.toMatch(/[📖❓🔥✅📅🚀]/u)
    expect(container?.querySelector('.academic-event-item--with-actions')).not.toBeNull()

    document.documentElement.removeAttribute('data-theme')
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
