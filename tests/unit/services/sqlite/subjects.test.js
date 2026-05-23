import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as connection from '../../../../src/services/sqlite/connection.js'
import * as Subjects from '../../../../src/services/sqlite/subjects.js'

const mockDb = vi.hoisted(() => ({
  run: vi.fn(),
  query: vi.fn(),
}))

vi.mock('../../../../src/services/sqlite/connection.js', () => ({
  getDb: vi.fn(() => mockDb),
  persistWeb: vi.fn().mockResolvedValue(undefined),
}))

function row(overrides = {}) {
  return {
    id: 'subj-1',
    name: 'Materia',
    parentSubjectId: null,
    archived: 0,
    color: '#818cf8',
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2024-01-15T10:00:00.000Z'))
  mockDb.run.mockResolvedValue(undefined)
  mockDb.query.mockResolvedValue({ values: [] })
})

describe('sqlite/subjects', () => {
  describe('createSubjectRow()', () => {
    it('inserta una fila con archived convertido a 0/1', async () => {
      await Subjects.createSubjectRow({
        id: 'subj-1',
        name: 'Matemática',
        parentSubjectId: null,
        archived: true,
        color: '#818cf8',
        createdAt: '2024-01-01T00:00:00.000Z',
      })

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO subjects'),
        ['subj-1', 'Matemática', null, 1, '#818cf8', '2024-01-01T00:00:00.000Z'],
      )
    })

    it('llama persistWeb después de insertar', async () => {
      await Subjects.createSubjectRow(row())

      expect(connection.persistWeb).toHaveBeenCalled()
    })
  })

  describe('getAllSubjectRows()', () => {
    it('consulta solo materias activas no eliminadas', async () => {
      await Subjects.getAllSubjectRows()

      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('archived = 0 AND deletedAt IS NULL'))
    })

    it('convierte archived 1 a true', async () => {
      mockDb.query.mockResolvedValue({ values: [row({ archived: 1 })] })

      expect((await Subjects.getAllSubjectRows())[0].archived).toBe(true)
    })

    it('convierte archived 0 a false', async () => {
      mockDb.query.mockResolvedValue({ values: [row({ archived: 0 })] })

      expect((await Subjects.getAllSubjectRows())[0].archived).toBe(false)
    })
  })

  describe('getSubjectRowById()', () => {
    it('retorna undefined si no hay fila', async () => {
      mockDb.query.mockResolvedValue({ values: [] })

      expect(await Subjects.getSubjectRowById('missing')).toBeUndefined()
    })

    it('retorna la fila con archived booleano', async () => {
      mockDb.query.mockResolvedValue({ values: [row({ archived: 1 })] })

      expect(await Subjects.getSubjectRowById('subj-1')).toMatchObject({ id: 'subj-1', archived: true })
    })
  })

  describe('updateSubjectRow()', () => {
    it('construye UPDATE solo con campos presentes', async () => {
      await Subjects.updateSubjectRow('subj-1', { name: 'Nueva', archived: true })

      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE subjects SET name = ?, archived = ? WHERE id = ?',
        ['Nueva', 1, 'subj-1'],
      )
    })

    it('no ejecuta SQL si no hay campos para actualizar', async () => {
      await Subjects.updateSubjectRow('subj-1', {})

      expect(mockDb.run).not.toHaveBeenCalled()
      expect(connection.persistWeb).not.toHaveBeenCalled()
    })
  })

  describe('deleteSubjectRow()', () => {
    it('usa soft-delete con deletedAt', async () => {
      await Subjects.deleteSubjectRow('subj-1')

      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE subjects SET deletedAt = ? WHERE id = ?',
        ['2024-01-15T10:00:00.000Z', 'subj-1'],
      )
    })
  })

  describe('papelera CRUD', () => {
    it('getDeletedSubjectRows() consulta materias eliminadas y convierte archived', async () => {
      mockDb.query.mockResolvedValue({ values: [row({ archived: 1, deletedAt: '2024-01-01T00:00:00.000Z' })] })

      const [subject] = await Subjects.getDeletedSubjectRows()

      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('deletedAt IS NOT NULL'))
      expect(subject.archived).toBe(true)
    })

    it('restoreSubjectRow() quita deletedAt', async () => {
      await Subjects.restoreSubjectRow('subj-1')

      expect(mockDb.run).toHaveBeenCalledWith('UPDATE subjects SET deletedAt = NULL WHERE id = ?', ['subj-1'])
    })

    it('permanentlyDeleteSubjectRow() ejecuta DELETE físico', async () => {
      await Subjects.permanentlyDeleteSubjectRow('subj-1')

      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM subjects WHERE id = ?', ['subj-1'])
    })

    it('emptyTrashSubjects() borra materias eliminadas', async () => {
      await Subjects.emptyTrashSubjects()

      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM subjects WHERE deletedAt IS NOT NULL')
    })

    it('countDeletedNotesBySubject() retorna conteo de notas eliminadas por subject', async () => {
      mockDb.query.mockResolvedValue({ values: [{ count: 6 }] })

      expect(await Subjects.countDeletedNotesBySubject('subj-1')).toBe(6)
    })
  })

  describe('conteos', () => {
    it('countNotesBySubject retorna el count de la query', async () => {
      mockDb.query.mockResolvedValue({ values: [{ count: 5 }] })

      expect(await Subjects.countNotesBySubject('subj-1')).toBe(5)
    })

    it('getInboxCount retorna 0 si no hay resultado', async () => {
      mockDb.query.mockResolvedValue({ values: [] })

      expect(await Subjects.getInboxCount()).toBe(0)
    })

    it('countTrashItems suma notas y materias eliminadas', async () => {
      mockDb.query
        .mockResolvedValueOnce({ values: [{ count: 3 }] })
        .mockResolvedValueOnce({ values: [{ count: 2 }] })

      expect(await Subjects.countTrashItems()).toBe(5)
    })
  })

  describe('papelera y jerarquía', () => {
    it('softDeleteChildSubjects marca secciones hijas como eliminadas', async () => {
      await Subjects.softDeleteChildSubjects('subj-1')

      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE subjects SET deletedAt = ? WHERE parentSubjectId = ? AND deletedAt IS NULL',
        ['2024-01-15T10:00:00.000Z', 'subj-1'],
      )
    })

    it('restoreChildSubjects quita deletedAt de secciones hijas', async () => {
      await Subjects.restoreChildSubjects('subj-1')

      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE subjects SET deletedAt = NULL WHERE parentSubjectId = ? AND deletedAt IS NOT NULL',
        ['subj-1'],
      )
    })

    it('getChildSubjectIds retorna IDs de secciones hijas', async () => {
      mockDb.query.mockResolvedValue({ values: [{ id: 'sec-1' }, { id: 'sec-2' }] })

      expect(await Subjects.getChildSubjectIds('subj-1')).toEqual(['sec-1', 'sec-2'])
    })

    it('purgeOldDeletedSubjects usa 30 días por defecto', async () => {
      await Subjects.purgeOldDeletedSubjects()

      expect(mockDb.run).toHaveBeenCalledWith(
        'DELETE FROM subjects WHERE deletedAt IS NOT NULL AND deletedAt < ?',
        ['2023-12-16T10:00:00.000Z'],
      )
    })
  })
})
