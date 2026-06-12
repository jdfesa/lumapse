import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as AcademicEventService from '../../../src/services/AcademicEventService.ts'
import { DatabaseError } from '../../../src/services/sqlite/errors.js'
import { subscribeToStoreErrors } from '../../../src/store/NoteStore.errors.js'
import { state, subscribe } from '../../../src/store/NoteStore.state.js'
import * as NoteStoreAcademicEvents from '../../../src/store/NoteStore.academicEvents.js'

vi.mock('../../../src/services/AcademicEventService.ts', () => ({
  getAcademicEvents: vi.fn().mockResolvedValue([]),
  getAcademicEventsByMonth: vi.fn().mockResolvedValue([]),
  getUpcomingAcademicEvents: vi.fn().mockResolvedValue([]),
  createAcademicEvent: vi.fn(),
  updateAcademicEvent: vi.fn(),
  deleteAcademicEvent: vi.fn().mockResolvedValue(undefined),
}))

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

function listenForNotify() {
  const listener = vi.fn()
  const unsubscribe = subscribe(listener)
  listener.mockClear()
  return { listener, unsubscribe }
}

beforeEach(() => {
  state.notes = []
  state.notesLoaded = false
  state.activeNoteId = null
  state.searchQuery = ''
  state.dateFilter = null
  state.sidebarOpen = true
  state.subjects = []
  state.activeSubjectId = null
  state.viewMode = 'inbox'
  state.trashCount = 0
  state.showTrashWarning = false
  state.archivedSubjectIds = []
  state.archivedSubjects = null
  state.academicEvents = []
  state.academicEventsForMonth = []
  state.academicEventsMonth = null
  state.upcomingAcademicEvents = []

  vi.clearAllMocks()
  AcademicEventService.getAcademicEvents.mockResolvedValue([])
  AcademicEventService.getAcademicEventsByMonth.mockResolvedValue([])
  AcademicEventService.getUpcomingAcademicEvents.mockResolvedValue([])
  AcademicEventService.createAcademicEvent.mockResolvedValue(event({ id: 'created' }))
  AcademicEventService.updateAcademicEvent.mockResolvedValue(event({ title: 'Actualizado' }))
  AcademicEventService.deleteAcademicEvent.mockResolvedValue(undefined)
})

describe('NoteStore.academicEvents', () => {
  describe('loadAcademicEvents()', () => {
    it('carga fechas academicas en state.academicEvents', async () => {
      const events = [event({ id: 'a' })]
      AcademicEventService.getAcademicEvents.mockResolvedValue(events)

      await NoteStoreAcademicEvents.loadAcademicEvents()

      expect(state.academicEvents).toEqual(events)
    })

    it('llama notify despues de cargar', async () => {
      const { listener, unsubscribe } = listenForNotify()

      await NoteStoreAcademicEvents.loadAcademicEvents()

      expect(listener).toHaveBeenCalledWith(state)
      unsubscribe()
    })
  })

  describe('loadAcademicEventsByMonth()', () => {
    it('carga eventos del mes visible para Heatmap', async () => {
      const monthEvents = [event({ id: 'junio' })]
      AcademicEventService.getAcademicEventsByMonth.mockResolvedValue(monthEvents)

      await NoteStoreAcademicEvents.loadAcademicEventsByMonth(2026, 6)

      expect(AcademicEventService.getAcademicEventsByMonth).toHaveBeenCalledWith(2026, 6)
      expect(state.academicEventsForMonth).toEqual(monthEvents)
      expect(state.academicEventsMonth).toEqual({ year: 2026, month: 6 })
    })

    it('fusiona eventos del mes con los ya cargados sin duplicar ids', async () => {
      state.academicEvents = [event({ id: 'a', date: '2026-06-10' })]
      AcademicEventService.getAcademicEventsByMonth.mockResolvedValue([
        event({ id: 'a', title: 'Actualizado', date: '2026-06-10' }),
        event({ id: 'b', date: '2026-06-11' }),
      ])

      await NoteStoreAcademicEvents.loadAcademicEventsByMonth(2026, 6)

      expect(state.academicEvents.map(item => item.id)).toEqual(['a', 'b'])
      expect(state.academicEvents.find(item => item.id === 'a').title).toBe('Actualizado')
    })
  })

  describe('loadUpcomingAcademicEvents()', () => {
    it('carga proximas fechas academicas', async () => {
      const upcoming = [event({ id: 'future', date: '2026-07-01' })]
      AcademicEventService.getUpcomingAcademicEvents.mockResolvedValue(upcoming)

      await NoteStoreAcademicEvents.loadUpcomingAcademicEvents('2026-06-01', 3)

      expect(AcademicEventService.getUpcomingAcademicEvents).toHaveBeenCalledWith('2026-06-01', 3)
      expect(state.upcomingAcademicEvents).toEqual(upcoming)
    })
  })

  describe('createAcademicEvent()', () => {
    it('crea un evento y actualiza todos los caches relevantes', async () => {
      const created = event({ id: 'created', date: '2026-06-14' })
      state.academicEventsMonth = { year: 2026, month: 6 }
      AcademicEventService.createAcademicEvent.mockResolvedValue(created)
      AcademicEventService.getUpcomingAcademicEvents.mockResolvedValue([created])

      const result = await NoteStoreAcademicEvents.createAcademicEvent({
        type: 'parcial',
        date: '2026-06-14',
      })

      expect(result).toBe(created)
      expect(state.academicEvents).toEqual([created])
      expect(state.academicEventsForMonth).toEqual([created])
      expect(state.upcomingAcademicEvents).toEqual([created])
    })

    it('llama notify despues de crear', async () => {
      const { listener, unsubscribe } = listenForNotify()

      await NoteStoreAcademicEvents.createAcademicEvent({ type: 'parcial', date: '2026-06-14' })

      expect(listener).toHaveBeenCalledWith(state)
      unsubscribe()
    })

    it('no agrega al cache mensual si el evento pertenece a otro mes', async () => {
      state.academicEventsMonth = { year: 2026, month: 6 }
      AcademicEventService.createAcademicEvent.mockResolvedValue(event({ id: 'julio', date: '2026-07-01' }))

      await NoteStoreAcademicEvents.createAcademicEvent({ type: 'final', date: '2026-07-01' })

      expect(state.academicEvents.map(item => item.id)).toEqual(['julio'])
      expect(state.academicEventsForMonth).toEqual([])
    })

    it('emite error de store y retorna undefined ante DatabaseError', async () => {
      const storeError = vi.fn()
      const unsubscribe = subscribeToStoreErrors(storeError)
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new DatabaseError('createAcademicEvent', new Error('boom'))
      AcademicEventService.createAcademicEvent.mockRejectedValue(error)

      await expect(NoteStoreAcademicEvents.createAcademicEvent({})).resolves.toBeUndefined()

      expect(storeError).toHaveBeenCalledWith({
        operation: 'createAcademicEvent',
        message: 'No se pudo crear la fecha academica. Intenta de nuevo.',
        cause: error,
      })
      expect(state.academicEvents).toEqual([])
      unsubscribe()
      errorSpy.mockRestore()
    })
  })

  describe('updateAcademicEvent()', () => {
    it('actualiza el evento en los caches y recarga proximas fechas', async () => {
      const original = event({ id: 'event-1', title: 'Viejo', date: '2026-06-14' })
      const updated = event({ id: 'event-1', title: 'Nuevo', date: '2026-06-20' })
      state.academicEvents = [original]
      state.academicEventsForMonth = [original]
      state.academicEventsMonth = { year: 2026, month: 6 }
      AcademicEventService.updateAcademicEvent.mockResolvedValue(updated)
      AcademicEventService.getUpcomingAcademicEvents.mockResolvedValue([updated])

      await NoteStoreAcademicEvents.updateAcademicEvent('event-1', { title: 'Nuevo' })

      expect(state.academicEvents).toEqual([updated])
      expect(state.academicEventsForMonth).toEqual([updated])
      expect(state.upcomingAcademicEvents).toEqual([updated])
    })

    it('llama notify despues de actualizar', async () => {
      const { listener, unsubscribe } = listenForNotify()

      await NoteStoreAcademicEvents.updateAcademicEvent('event-1', { title: 'Nuevo' })

      expect(listener).toHaveBeenCalledWith(state)
      unsubscribe()
    })

    it('quita del cache mensual si la fecha editada sale del mes visible', async () => {
      const original = event({ id: 'event-1', date: '2026-06-14' })
      const updated = event({ id: 'event-1', date: '2026-07-01' })
      state.academicEvents = [original]
      state.academicEventsForMonth = [original]
      state.academicEventsMonth = { year: 2026, month: 6 }
      AcademicEventService.updateAcademicEvent.mockResolvedValue(updated)

      await NoteStoreAcademicEvents.updateAcademicEvent('event-1', { date: '2026-07-01' })

      expect(state.academicEvents).toEqual([updated])
      expect(state.academicEventsForMonth).toEqual([])
    })
  })

  describe('deleteAcademicEvent()', () => {
    it('elimina de los caches y recarga proximas fechas', async () => {
      state.academicEvents = [event({ id: 'a' }), event({ id: 'b' })]
      state.academicEventsForMonth = [event({ id: 'a' })]
      state.upcomingAcademicEvents = [event({ id: 'a' })]
      AcademicEventService.getUpcomingAcademicEvents.mockResolvedValue([event({ id: 'b' })])

      await NoteStoreAcademicEvents.deleteAcademicEvent('a')

      expect(AcademicEventService.deleteAcademicEvent).toHaveBeenCalledWith('a')
      expect(state.academicEvents.map(item => item.id)).toEqual(['b'])
      expect(state.academicEventsForMonth).toEqual([])
      expect(state.upcomingAcademicEvents.map(item => item.id)).toEqual(['b'])
    })

    it('normaliza id al limpiar caches despues de borrar', async () => {
      state.academicEvents = [event({ id: 'a' })]
      state.academicEventsForMonth = [event({ id: 'a' })]

      await NoteStoreAcademicEvents.deleteAcademicEvent(' a ')

      expect(AcademicEventService.deleteAcademicEvent).toHaveBeenCalledWith(' a ')
      expect(state.academicEvents).toEqual([])
      expect(state.academicEventsForMonth).toEqual([])
    })

    it('llama notify despues de borrar', async () => {
      const { listener, unsubscribe } = listenForNotify()

      await NoteStoreAcademicEvents.deleteAcademicEvent('event-1')

      expect(listener).toHaveBeenCalledWith(state)
      unsubscribe()
    })
  })

  describe('selectores', () => {
    it('getAcademicEventsForHeatmap retorna el cache mensual', () => {
      state.academicEventsForMonth = [event({ id: 'month' })]

      expect(NoteStoreAcademicEvents.getAcademicEventsForHeatmap()).toEqual(state.academicEventsForMonth)
    })

    it('getAcademicEventsForDate fusiona caches, deduplica y filtra por fecha', () => {
      state.academicEvents = [
        event({ id: 'a', date: '2026-06-14' }),
        event({ id: 'b', date: '2026-06-15' }),
      ]
      state.academicEventsForMonth = [
        event({ id: 'a', title: 'Actualizado', date: '2026-06-14' }),
        event({ id: 'c', date: '2026-06-14' }),
      ]

      expect(NoteStoreAcademicEvents.getAcademicEventsForDate('2026-06-14').map(item => item.id)).toEqual(['a', 'c'])
      expect(NoteStoreAcademicEvents.getAcademicEventsForDate('2026-06-14')[0].title).toBe('Actualizado')
    })

    it('getAcademicEventsForSelectedDate usa state.dateFilter', () => {
      state.dateFilter = '2026-06-14'
      state.academicEvents = [event({ id: 'selected', date: '2026-06-14' })]

      expect(NoteStoreAcademicEvents.getAcademicEventsForSelectedDate()).toEqual([
        event({ id: 'selected', date: '2026-06-14' }),
      ])
    })

    it('getAcademicEventsForSelectedDate retorna [] sin fecha seleccionada', () => {
      state.dateFilter = null
      state.academicEvents = [event({ id: 'selected', date: '2026-06-14' })]

      expect(NoteStoreAcademicEvents.getAcademicEventsForSelectedDate()).toEqual([])
    })
  })
})
