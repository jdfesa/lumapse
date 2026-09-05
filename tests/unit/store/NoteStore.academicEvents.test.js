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

function deferred() {
  let resolve
  let reject
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
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

    it('impide que una carga completa anterior reintroduzca un evento eliminado', async () => {
      const read = deferred()
      const deleted = event({ id: 'deleted' })
      AcademicEventService.getAcademicEvents.mockReturnValueOnce(read.promise)
      state.academicEvents = [deleted]

      const pendingRead = NoteStoreAcademicEvents.loadAcademicEvents()
      await NoteStoreAcademicEvents.deleteAcademicEvent('deleted')
      read.resolve([deleted])
      await pendingRead

      expect(state.academicEvents).toEqual([])
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

    it('conserva B cuando A resuelve despues', async () => {
      const monthA = deferred()
      const monthB = deferred()
      AcademicEventService.getAcademicEventsByMonth
        .mockReturnValueOnce(monthA.promise)
        .mockReturnValueOnce(monthB.promise)

      const requestA = NoteStoreAcademicEvents.loadAcademicEventsByMonth(2026, 6)
      const requestB = NoteStoreAcademicEvents.loadAcademicEventsByMonth(2026, 7)
      monthB.resolve([event({ id: 'b', date: '2026-07-10' })])
      await requestB
      monthA.resolve([event({ id: 'a', date: '2026-06-10' })])
      await requestA

      expect(state.academicEventsMonth).toEqual({ year: 2026, month: 7 })
      expect(state.academicEventsForMonth.map(item => item.id)).toEqual(['b'])
      expect(state.academicEvents.map(item => item.id)).toEqual(['b'])
    })

    it('distingue generaciones en A -> B -> A', async () => {
      const firstA = deferred()
      const monthB = deferred()
      const latestA = deferred()
      AcademicEventService.getAcademicEventsByMonth
        .mockReturnValueOnce(firstA.promise)
        .mockReturnValueOnce(monthB.promise)
        .mockReturnValueOnce(latestA.promise)

      const firstRequest = NoteStoreAcademicEvents.loadAcademicEventsByMonth(2026, 6)
      const middleRequest = NoteStoreAcademicEvents.loadAcademicEventsByMonth(2026, 7)
      const latestRequest = NoteStoreAcademicEvents.loadAcademicEventsByMonth(2026, 6)
      latestA.resolve([event({ id: 'latest-a', date: '2026-06-20' })])
      await latestRequest
      monthB.resolve([event({ id: 'b', date: '2026-07-20' })])
      firstA.resolve([event({ id: 'first-a', date: '2026-06-10' })])
      await Promise.all([firstRequest, middleRequest])

      expect(state.academicEventsMonth).toEqual({ year: 2026, month: 6 })
      expect(state.academicEventsForMonth.map(item => item.id)).toEqual(['latest-a'])
    })

    it('descarta solicitudes repetidas del mismo mes resueltas fuera de orden', async () => {
      const older = deferred()
      const newer = deferred()
      AcademicEventService.getAcademicEventsByMonth
        .mockReturnValueOnce(older.promise)
        .mockReturnValueOnce(newer.promise)

      const olderRequest = NoteStoreAcademicEvents.loadAcademicEventsByMonth(2026, 6)
      const newerRequest = NoteStoreAcademicEvents.loadAcademicEventsByMonth(2026, 6)
      newer.resolve([event({ id: 'newer' })])
      await newerRequest
      older.resolve([event({ id: 'older' })])
      await olderRequest

      expect(state.academicEventsForMonth.map(item => item.id)).toEqual(['newer'])
    })

    it('conserva una creacion confirmada si resuelve una lectura anterior', async () => {
      const read = deferred()
      const created = event({ id: 'created' })
      state.academicEventsMonth = { year: 2026, month: 6 }
      AcademicEventService.getAcademicEventsByMonth.mockReturnValueOnce(read.promise)
      AcademicEventService.createAcademicEvent.mockResolvedValueOnce(created)

      const pendingRead = NoteStoreAcademicEvents.loadAcademicEventsByMonth(2026, 6)
      await NoteStoreAcademicEvents.createAcademicEvent({ date: created.date })
      read.resolve([])
      await pendingRead

      expect(state.academicEventsForMonth.map(item => item.id)).toEqual(['created'])
    })

    it('conserva una edicion confirmada si resuelve una lectura anterior', async () => {
      const read = deferred()
      const original = event({ id: 'existing', title: 'Anterior' })
      const updated = event({ id: 'existing', title: 'Vigente' })
      state.academicEvents = [original]
      state.academicEventsForMonth = [original]
      state.academicEventsMonth = { year: 2026, month: 6 }
      AcademicEventService.getAcademicEventsByMonth.mockReturnValueOnce(read.promise)
      AcademicEventService.updateAcademicEvent.mockResolvedValueOnce(updated)

      const pendingRead = NoteStoreAcademicEvents.loadAcademicEventsByMonth(2026, 6)
      await NoteStoreAcademicEvents.updateAcademicEvent('existing', { title: 'Vigente' })
      read.resolve([original])
      await pendingRead

      expect(state.academicEventsForMonth).toEqual([updated])
      expect(state.academicEvents).toEqual([updated])
    })

    it('no reintroduce una eliminacion confirmada si resuelve una lectura anterior', async () => {
      const read = deferred()
      const deleted = event({ id: 'deleted' })
      state.academicEvents = [deleted]
      state.academicEventsForMonth = [deleted]
      state.academicEventsMonth = { year: 2026, month: 6 }
      AcademicEventService.getAcademicEventsByMonth.mockReturnValueOnce(read.promise)

      const pendingRead = NoteStoreAcademicEvents.loadAcademicEventsByMonth(2026, 6)
      await NoteStoreAcademicEvents.deleteAcademicEvent('deleted')
      read.resolve([deleted])
      await pendingRead

      expect(state.academicEventsForMonth).toEqual([])
      expect(state.academicEvents).toEqual([])
    })

    it('consume un rechazo tardio sin modificar estado ni notificar', async () => {
      const stale = deferred()
      const current = deferred()
      const { listener, unsubscribe } = listenForNotify()
      AcademicEventService.getAcademicEventsByMonth
        .mockReturnValueOnce(stale.promise)
        .mockReturnValueOnce(current.promise)

      const staleRequest = NoteStoreAcademicEvents.loadAcademicEventsByMonth(2026, 6)
      const currentRequest = NoteStoreAcademicEvents.loadAcademicEventsByMonth(2026, 7)
      current.resolve([event({ id: 'current', date: '2026-07-10' })])
      await currentRequest
      stale.reject(new Error('late failure'))
      await expect(staleRequest).resolves.toBeUndefined()

      expect(state.academicEventsMonth).toEqual({ year: 2026, month: 7 })
      expect(state.academicEventsForMonth.map(item => item.id)).toEqual(['current'])
      expect(listener).toHaveBeenCalledTimes(1)
      unsubscribe()
    })

    it('permite una nueva solicitud exitosa despues de un error vigente', async () => {
      const error = new Error('current failure')
      AcademicEventService.getAcademicEventsByMonth.mockRejectedValueOnce(error)

      await expect(NoteStoreAcademicEvents.loadAcademicEventsByMonth(2026, 6)).rejects.toBe(error)
      expect(state.academicEventsMonth).toBeNull()

      AcademicEventService.getAcademicEventsByMonth.mockResolvedValueOnce([
        event({ id: 'recovered', date: '2026-07-10' }),
      ])
      await NoteStoreAcademicEvents.loadAcademicEventsByMonth(2026, 7)

      expect(state.academicEventsMonth).toEqual({ year: 2026, month: 7 })
      expect(state.academicEventsForMonth.map(item => item.id)).toEqual(['recovered'])
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

    it('no permite que una carga anterior deshaga el refresh posterior a una mutacion', async () => {
      const older = deferred()
      const created = event({ id: 'created', date: '2026-07-01' })
      AcademicEventService.getUpcomingAcademicEvents
        .mockReturnValueOnce(older.promise)
        .mockResolvedValueOnce([created])
      AcademicEventService.createAcademicEvent.mockResolvedValueOnce(created)

      const pendingRead = NoteStoreAcademicEvents.loadUpcomingAcademicEvents()
      await NoteStoreAcademicEvents.createAcademicEvent({ date: created.date })
      older.resolve([])
      await pendingRead

      expect(state.upcomingAcademicEvents).toEqual([created])
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

    it('emite una vez, rechaza y conserva caches ante DatabaseError', async () => {
      const storeError = vi.fn()
      const unsubscribe = subscribeToStoreErrors(storeError)
      const { listener, unsubscribe: unsubscribeNotify } = listenForNotify()
      const error = new DatabaseError('createAcademicEvent', new Error('boom'))
      const existing = event({ id: 'existing' })
      state.academicEvents = [existing]
      state.academicEventsForMonth = [existing]
      state.upcomingAcademicEvents = [existing]
      AcademicEventService.createAcademicEvent.mockRejectedValue(error)

      await expect(NoteStoreAcademicEvents.createAcademicEvent({})).rejects.toBe(error)

      expect(storeError).toHaveBeenCalledTimes(1)
      expect(storeError).toHaveBeenCalledWith({
        operation: 'createAcademicEvent',
        message: 'No se pudo crear la fecha academica. Intenta de nuevo.',
        cause: error,
      })
      expect(state.academicEvents).toEqual([existing])
      expect(state.academicEventsForMonth).toEqual([existing])
      expect(state.upcomingAcademicEvents).toEqual([existing])
      expect(listener).not.toHaveBeenCalled()
      unsubscribe()
      unsubscribeNotify()
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
