import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as connection from '../../../../src/services/sqlite/connection.js'
import { DatabaseError } from '../../../../src/services/sqlite/errors.js'
import * as AcademicEvents from '../../../../src/services/sqlite/academicEvents.js'

const mockDb = vi.hoisted(() => ({
  run: vi.fn(),
  query: vi.fn(),
}))

vi.mock('../../../../src/services/sqlite/connection.js', () => ({
  getDb: vi.fn(() => mockDb),
  persistWeb: vi.fn().mockResolvedValue(undefined),
  isWriteTransactionActive: vi.fn(() => false),
}))

function eventRow(overrides = {}) {
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
  mockDb.run.mockResolvedValue(undefined)
  mockDb.query.mockResolvedValue({ values: [] })
  connection.isWriteTransactionActive.mockReturnValue(false)
})

describe('sqlite/academicEvents', () => {
  describe('createAcademicEventRow()', () => {
    it('inserta una fila con los campos esperados', async () => {
      await AcademicEvents.createAcademicEventRow(eventRow())

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO academic_events'),
        [
          'event-1',
          'parcial',
          'Primer parcial',
          '2026-06-14',
          'subj-1',
          '2026-05-31T10:00:00.000Z',
          '2026-05-31T10:00:00.000Z',
        ],
      )
    })

    it('normaliza title y subjectId vacios a null', async () => {
      await AcademicEvents.createAcademicEventRow(eventRow({ title: '', subjectId: '' }))

      expect(mockDb.run.mock.calls[0][1]).toEqual([
        'event-1',
        'parcial',
        null,
        '2026-06-14',
        null,
        '2026-05-31T10:00:00.000Z',
        '2026-05-31T10:00:00.000Z',
      ])
    })

    it('llama persistWeb despues de insertar', async () => {
      await AcademicEvents.createAcademicEventRow(eventRow())

      expect(connection.persistWeb).toHaveBeenCalled()
      expect(mockDb.run.mock.invocationCallOrder[0]).toBeLessThan(connection.persistWeb.mock.invocationCallOrder[0])
    })

    it('desactiva la transaccion implicita si ya hay una transaccion explicita', async () => {
      connection.isWriteTransactionActive.mockReturnValue(true)

      await AcademicEvents.createAcademicEventRow(eventRow())

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO academic_events'),
        expect.any(Array),
        false,
      )
    })
  })

  describe('getAcademicEventRows()', () => {
    it('consulta todas las fechas ordenadas por fecha y creacion', async () => {
      await AcademicEvents.getAcademicEventRows()

      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT * FROM academic_events ORDER BY date ASC, createdAt ASC',
      )
    })

    it('retorna [] si db.query no trae values', async () => {
      mockDb.query.mockResolvedValue({ values: null })

      await expect(AcademicEvents.getAcademicEventRows()).resolves.toEqual([])
    })
  })

  describe('getAcademicEventRowById()', () => {
    it('consulta una fecha academica por id', async () => {
      mockDb.query.mockResolvedValue({ values: [eventRow()] })

      await expect(AcademicEvents.getAcademicEventRowById('event-1')).resolves.toMatchObject({
        id: 'event-1',
      })
      expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM academic_events WHERE id = ?', ['event-1'])
    })

    it('retorna undefined si no existe', async () => {
      mockDb.query.mockResolvedValue({ values: [] })

      await expect(AcademicEvents.getAcademicEventRowById('missing')).resolves.toBeUndefined()
    })
  })

  describe('getAcademicEventRowsByMonth()', () => {
    it('consulta por rango de mes base 1', async () => {
      await AcademicEvents.getAcademicEventRowsByMonth(2026, 6)

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE date >= ? AND date < ?'),
        ['2026-06-01', '2026-07-01'],
      )
      expect(mockDb.query.mock.calls[0][0]).toContain('ORDER BY date ASC, createdAt ASC')
    })

    it('calcula correctamente el salto de diciembre a enero', async () => {
      await AcademicEvents.getAcademicEventRowsByMonth(2026, 12)

      expect(mockDb.query.mock.calls[0][1]).toEqual(['2026-12-01', '2027-01-01'])
    })
  })

  describe('getAcademicEventRowsByDate()', () => {
    it('consulta eventos del dia ordenados por creacion', async () => {
      await AcademicEvents.getAcademicEventRowsByDate('2026-06-14')

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE date = ?'),
        ['2026-06-14'],
      )
      expect(mockDb.query.mock.calls[0][0]).toContain('ORDER BY createdAt ASC')
    })
  })

  describe('getUpcomingAcademicEventRows()', () => {
    it('consulta proximos eventos desde today inclusive con limite', async () => {
      await AcademicEvents.getUpcomingAcademicEventRows('2026-06-01', 5)

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE date >= ?'),
        ['2026-06-01', 5],
      )
      expect(mockDb.query.mock.calls[0][0]).toContain('LIMIT ?')
    })

    it('usa limite 5 por defecto', async () => {
      await AcademicEvents.getUpcomingAcademicEventRows('2026-06-01')

      expect(mockDb.query.mock.calls[0][1]).toEqual(['2026-06-01', 5])
    })
  })

  describe('updateAcademicEventRow()', () => {
    it('construye UPDATE solo con campos presentes', async () => {
      await AcademicEvents.updateAcademicEventRow('event-1', {
        title: 'Recuperatorio',
        subjectId: 'subj-2',
        updatedAt: '2026-06-01T12:00:00.000Z',
      })

      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE academic_events SET title = ?, subjectId = ?, updatedAt = ? WHERE id = ?',
        ['Recuperatorio', 'subj-2', '2026-06-01T12:00:00.000Z', 'event-1'],
      )
    })

    it('permite dejar title y subjectId en null', async () => {
      await AcademicEvents.updateAcademicEventRow('event-1', {
        title: '',
        subjectId: null,
      })

      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE academic_events SET title = ?, subjectId = ? WHERE id = ?',
        [null, null, 'event-1'],
      )
    })

    it('no ejecuta SQL si no hay campos para actualizar', async () => {
      await AcademicEvents.updateAcademicEventRow('event-1', {})

      expect(mockDb.run).not.toHaveBeenCalled()
      expect(connection.persistWeb).not.toHaveBeenCalled()
    })
  })

  describe('deleteAcademicEventRow()', () => {
    it('ejecuta DELETE fisico por id', async () => {
      await AcademicEvents.deleteAcademicEventRow('event-1')

      expect(mockDb.run).toHaveBeenCalledWith(
        'DELETE FROM academic_events WHERE id = ?',
        ['event-1'],
      )
    })

    it('llama persistWeb despues de borrar', async () => {
      await AcademicEvents.deleteAcademicEventRow('event-1')

      expect(connection.persistWeb).toHaveBeenCalled()
    })
  })

  it('envuelve errores de escritura en DatabaseError', async () => {
    mockDb.run.mockRejectedValue(new Error('sqlite fallo'))

    await expect(AcademicEvents.deleteAcademicEventRow('event-1')).rejects.toBeInstanceOf(DatabaseError)
  })
})
