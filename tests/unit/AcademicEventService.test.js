import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as EventRows from '../../src/services/sqlite/academicEvents.js'
import * as SubjectRows from '../../src/services/sqlite/subjects.js'
import * as AcademicEventService from '../../src/services/AcademicEventService.js'

vi.mock('../../src/services/sqlite/academicEvents.js', () => ({
  createAcademicEventRow: vi.fn().mockResolvedValue(undefined),
  getAcademicEventRows: vi.fn().mockResolvedValue([]),
  getAcademicEventRowById: vi.fn().mockResolvedValue(undefined),
  getAcademicEventRowsByMonth: vi.fn().mockResolvedValue([]),
  getAcademicEventRowsByDate: vi.fn().mockResolvedValue([]),
  getUpcomingAcademicEventRows: vi.fn().mockResolvedValue([]),
  updateAcademicEventRow: vi.fn().mockResolvedValue(undefined),
  deleteAcademicEventRow: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../src/services/sqlite/subjects.js', () => ({
  getSubjectRowById: vi.fn().mockResolvedValue(undefined),
}))

function subject(overrides = {}) {
  return {
    id: 'subj-1',
    name: 'Algebra',
    parentSubjectId: null,
    archived: false,
    color: '#818cf8',
    createdAt: '2026-05-01T10:00:00.000Z',
    ...overrides,
  }
}

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

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-05-31T10:00:00.000Z'))
  vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'event-uuid') })

  EventRows.createAcademicEventRow.mockResolvedValue(undefined)
  EventRows.getAcademicEventRows.mockResolvedValue([])
  EventRows.getAcademicEventRowById.mockResolvedValue(undefined)
  EventRows.getAcademicEventRowsByMonth.mockResolvedValue([])
  EventRows.getAcademicEventRowsByDate.mockResolvedValue([])
  EventRows.getUpcomingAcademicEventRows.mockResolvedValue([])
  EventRows.updateAcademicEventRow.mockResolvedValue(undefined)
  EventRows.deleteAcademicEventRow.mockResolvedValue(undefined)
  SubjectRows.getSubjectRowById.mockResolvedValue(undefined)
})

describe('AcademicEventService', () => {
  it('centraliza los tipos permitidos', () => {
    expect(AcademicEventService.ACADEMIC_EVENT_TYPES).toEqual([
      'parcial',
      'final',
      'tp',
      'exposicion',
    ])
  })

  describe('createAcademicEvent()', () => {
    it('rechaza tipo vacio sin tocar SQLite', async () => {
      await expect(AcademicEventService.createAcademicEvent({
        type: '',
        date: '2026-06-14',
      })).rejects.toThrow('tipo')

      expect(EventRows.createAcademicEventRow).not.toHaveBeenCalled()
    })

    it('rechaza tipo no permitido sin tocar SQLite', async () => {
      await expect(AcademicEventService.createAcademicEvent({
        type: 'clase',
        date: '2026-06-14',
      })).rejects.toThrow('invalido')

      expect(EventRows.createAcademicEventRow).not.toHaveBeenCalled()
    })

    it('rechaza fecha vacia sin tocar SQLite', async () => {
      await expect(AcademicEventService.createAcademicEvent({
        type: 'parcial',
        date: '',
      })).rejects.toThrow('obligatoria')

      expect(EventRows.createAcademicEventRow).not.toHaveBeenCalled()
    })

    it('rechaza fecha fuera de formato YYYY-MM-DD', async () => {
      await expect(AcademicEventService.createAcademicEvent({
        type: 'parcial',
        date: '14/06/2026',
      })).rejects.toThrow('YYYY-MM-DD')

      expect(EventRows.createAcademicEventRow).not.toHaveBeenCalled()
    })

    it('rechaza una fecha inexistente aunque tenga formato correcto', async () => {
      await expect(AcademicEventService.createAcademicEvent({
        type: 'parcial',
        date: '2026-02-31',
      })).rejects.toThrow('valida')

      expect(EventRows.createAcademicEventRow).not.toHaveBeenCalled()
    })

    it('rechaza subjectId inexistente sin crear la fecha', async () => {
      SubjectRows.getSubjectRowById.mockResolvedValue(undefined)

      await expect(AcademicEventService.createAcademicEvent({
        type: 'parcial',
        date: '2026-06-14',
        subjectId: 'missing',
      })).rejects.toThrow('materia asociada')

      expect(EventRows.createAcademicEventRow).not.toHaveBeenCalled()
    })

    it('rechaza subjectId eliminado logicamente', async () => {
      SubjectRows.getSubjectRowById.mockResolvedValue(subject({ deletedAt: '2026-05-01T10:00:00.000Z' }))

      await expect(AcademicEventService.createAcademicEvent({
        type: 'parcial',
        date: '2026-06-14',
        subjectId: 'subj-1',
      })).rejects.toThrow('materia asociada')

      expect(EventRows.createAcademicEventRow).not.toHaveBeenCalled()
    })

    it('normaliza title, date y subjectId antes de insertar', async () => {
      SubjectRows.getSubjectRowById.mockResolvedValue(subject())

      await AcademicEventService.createAcademicEvent({
        type: 'tp',
        title: '  Entrega informe  ',
        date: ' 2026-06-14 ',
        subjectId: ' subj-1 ',
      })

      expect(SubjectRows.getSubjectRowById).toHaveBeenCalledWith('subj-1')
      expect(EventRows.createAcademicEventRow).toHaveBeenCalledWith({
        id: 'event-uuid',
        type: 'tp',
        title: 'Entrega informe',
        date: '2026-06-14',
        subjectId: 'subj-1',
        createdAt: '2026-05-31T10:00:00.000Z',
        updatedAt: '2026-05-31T10:00:00.000Z',
      })
    })

    it('permite crear fecha sin materia asociada', async () => {
      const created = await AcademicEventService.createAcademicEvent({
        type: 'final',
        title: '',
        date: '2026-07-01',
        subjectId: '',
      })

      expect(SubjectRows.getSubjectRowById).not.toHaveBeenCalled()
      expect(created).toMatchObject({
        title: null,
        subjectId: null,
      })
    })

    it('retorna un objeto consistente', async () => {
      const created = await AcademicEventService.createAcademicEvent({
        type: 'exposicion',
        date: '2026-06-20',
      })

      expect(Object.keys(created).sort()).toEqual([
        'createdAt',
        'date',
        'id',
        'subjectId',
        'title',
        'type',
        'updatedAt',
      ])
    })
  })

  describe('lecturas', () => {
    it('getAcademicEvents delega al CRUD bajo nivel', async () => {
      EventRows.getAcademicEventRows.mockResolvedValue([event()])

      await expect(AcademicEventService.getAcademicEvents()).resolves.toHaveLength(1)
      expect(EventRows.getAcademicEventRows).toHaveBeenCalled()
    })

    it('getAcademicEventById normaliza id antes de consultar', async () => {
      EventRows.getAcademicEventRowById.mockResolvedValue(event())

      await AcademicEventService.getAcademicEventById(' event-1 ')

      expect(EventRows.getAcademicEventRowById).toHaveBeenCalledWith('event-1')
    })

    it('getAcademicEventsByMonth valida mes base 1', async () => {
      await AcademicEventService.getAcademicEventsByMonth(2026, 6)

      expect(EventRows.getAcademicEventRowsByMonth).toHaveBeenCalledWith(2026, 6)
    })

    it('getAcademicEventsByMonth rechaza mes invalido', async () => {
      await expect(AcademicEventService.getAcademicEventsByMonth(2026, 13)).rejects.toThrow('mes')

      expect(EventRows.getAcademicEventRowsByMonth).not.toHaveBeenCalled()
    })

    it('getAcademicEventsByDate valida y normaliza fecha', async () => {
      await AcademicEventService.getAcademicEventsByDate(' 2026-06-14 ')

      expect(EventRows.getAcademicEventRowsByDate).toHaveBeenCalledWith('2026-06-14')
    })

    it('getUpcomingAcademicEvents usa la fecha actual local por defecto', async () => {
      await AcademicEventService.getUpcomingAcademicEvents()

      expect(EventRows.getUpcomingAcademicEventRows).toHaveBeenCalledWith('2026-05-31', 5)
    })

    it('getUpcomingAcademicEvents valida limite positivo', async () => {
      await expect(AcademicEventService.getUpcomingAcademicEvents('2026-06-01', 0)).rejects.toThrow('limite')

      expect(EventRows.getUpcomingAcademicEventRows).not.toHaveBeenCalled()
    })
  })

  describe('updateAcademicEvent()', () => {
    it('rechaza ids vacios', async () => {
      await expect(AcademicEventService.updateAcademicEvent('', { title: 'Nuevo' })).rejects.toThrow('id')

      expect(EventRows.updateAcademicEventRow).not.toHaveBeenCalled()
    })

    it('rechaza eventos inexistentes', async () => {
      EventRows.getAcademicEventRowById.mockResolvedValue(undefined)

      await expect(AcademicEventService.updateAcademicEvent('missing', { title: 'Nuevo' })).rejects.toThrow('no encontrada')

      expect(EventRows.updateAcademicEventRow).not.toHaveBeenCalled()
    })

    it('no actualiza si no hay cambios', async () => {
      EventRows.getAcademicEventRowById.mockResolvedValue(event())

      const result = await AcademicEventService.updateAcademicEvent('event-1', {})

      expect(result).toEqual(event())
      expect(EventRows.updateAcademicEventRow).not.toHaveBeenCalled()
    })

    it('normaliza cambios, genera updatedAt y retorna el objeto mergeado', async () => {
      EventRows.getAcademicEventRowById.mockResolvedValue(event({ title: 'Viejo', subjectId: null }))
      SubjectRows.getSubjectRowById.mockResolvedValue(subject())

      const updated = await AcademicEventService.updateAcademicEvent(' event-1 ', {
        type: 'final',
        title: '  Mesa regular  ',
        date: '2026-07-01',
        subjectId: ' subj-1 ',
      })

      expect(EventRows.updateAcademicEventRow).toHaveBeenCalledWith('event-1', {
        type: 'final',
        title: 'Mesa regular',
        date: '2026-07-01',
        subjectId: 'subj-1',
        updatedAt: '2026-05-31T10:00:00.000Z',
      })
      expect(updated).toMatchObject({
        id: 'event-1',
        type: 'final',
        title: 'Mesa regular',
        date: '2026-07-01',
        subjectId: 'subj-1',
        updatedAt: '2026-05-31T10:00:00.000Z',
      })
    })

    it('permite limpiar title y subjectId', async () => {
      EventRows.getAcademicEventRowById.mockResolvedValue(event())

      await AcademicEventService.updateAcademicEvent('event-1', {
        title: '',
        subjectId: '',
      })

      expect(SubjectRows.getSubjectRowById).not.toHaveBeenCalled()
      expect(EventRows.updateAcademicEventRow).toHaveBeenCalledWith('event-1', {
        title: null,
        subjectId: null,
        updatedAt: '2026-05-31T10:00:00.000Z',
      })
    })

    it('rechaza cambios invalidos antes de actualizar SQLite', async () => {
      EventRows.getAcademicEventRowById.mockResolvedValue(event())

      await expect(AcademicEventService.updateAcademicEvent('event-1', {
        date: '2026-13-01',
      })).rejects.toThrow('valida')

      expect(EventRows.updateAcademicEventRow).not.toHaveBeenCalled()
    })
  })

  describe('deleteAcademicEvent()', () => {
    it('normaliza id y delega el borrado fisico', async () => {
      await AcademicEventService.deleteAcademicEvent(' event-1 ')

      expect(EventRows.deleteAcademicEventRow).toHaveBeenCalledWith('event-1')
    })

    it('rechaza id vacio sin tocar SQLite', async () => {
      await expect(AcademicEventService.deleteAcademicEvent('   ')).rejects.toThrow('id')

      expect(EventRows.deleteAcademicEventRow).not.toHaveBeenCalled()
    })
  })
})
