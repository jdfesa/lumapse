import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as connection from '../../../../src/services/sqlite/connection.js'
import * as Notes from '../../../../src/services/sqlite/notes.js'

const mockDb = vi.hoisted(() => ({
  run: vi.fn(),
  query: vi.fn(),
}))

vi.mock('../../../../src/services/sqlite/connection.js', () => ({
  getDb: vi.fn(() => mockDb),
  persistWeb: vi.fn().mockResolvedValue(undefined),
  generateUUID: vi.fn(() => 'test-uuid-1234'),
  isWriteTransactionActive: vi.fn(() => false),
}))

function dbRow(overrides = {}) {
  return {
    id: 'note-1',
    title: 'Nota',
    content: 'Contenido',
    pinned: 0,
    archived: 0,
    statusEmoji: null,
    subjectId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2024-01-15T10:00:00.000Z'))
  mockDb.run.mockResolvedValue(undefined)
  mockDb.query.mockResolvedValue({ values: [] })
  connection.isWriteTransactionActive.mockReturnValue(false)
})

describe('sqlite/notes', () => {
  describe('createNote()', () => {
    it('llama db.run con los parámetros correctos', async () => {
      await Notes.createNote('Título', 'Contenido', 'subj-1')

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO notes'),
        [
          'test-uuid-1234',
          'Título',
          'Contenido',
          0,
          0,
          null,
          'subj-1',
          '2024-01-15T10:00:00.000Z',
          '2024-01-15T10:00:00.000Z',
        ],
      )
    })

    it('usa generateUUID() para el id', async () => {
      const note = await Notes.createNote()

      expect(connection.generateUUID).toHaveBeenCalled()
      expect(note.id).toBe('test-uuid-1234')
    })

    it('usa subjectId null si no se pasa', async () => {
      const note = await Notes.createNote()

      expect(note.subjectId).toBeNull()
    })

    it('usa el subjectId pasado como argumento', async () => {
      const note = await Notes.createNote('T', 'C', 'subj-1')

      expect(note.subjectId).toBe('subj-1')
    })

    it('retorna objeto con pinned: false', async () => {
      await expect(Notes.createNote()).resolves.toMatchObject({ pinned: false })
    })

    it('retorna objeto con archived: false', async () => {
      await expect(Notes.createNote()).resolves.toMatchObject({ archived: false })
    })

    it('llama persistWeb() después de db.run', async () => {
      await Notes.createNote()

      expect(connection.persistWeb).toHaveBeenCalled()
      expect(mockDb.run.mock.invocationCallOrder[0]).toBeLessThan(connection.persistWeb.mock.invocationCallOrder[0])
    })
  })

  describe('getAllNotes()', () => {
    it('ejecuta SELECT con WHERE deletedAt IS NULL', async () => {
      await Notes.getAllNotes()

      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('WHERE deletedAt IS NULL'))
    })

    it('convierte pinned: 1 a pinned: true', async () => {
      mockDb.query.mockResolvedValue({ values: [dbRow({ pinned: 1 })] })

      expect((await Notes.getAllNotes())[0].pinned).toBe(true)
    })

    it('convierte pinned: 0 a pinned: false', async () => {
      mockDb.query.mockResolvedValue({ values: [dbRow({ pinned: 0 })] })

      expect((await Notes.getAllNotes())[0].pinned).toBe(false)
    })

    it('convierte archived: 1 a archived: true', async () => {
      mockDb.query.mockResolvedValue({ values: [dbRow({ archived: 1 })] })

      expect((await Notes.getAllNotes())[0].archived).toBe(true)
    })

    it('retorna [] si db.query retorna { values: [] }', async () => {
      mockDb.query.mockResolvedValue({ values: [] })

      expect(await Notes.getAllNotes()).toEqual([])
    })

    it('retorna [] si db.query retorna { values: null }', async () => {
      mockDb.query.mockResolvedValue({ values: null })

      expect(await Notes.getAllNotes()).toEqual([])
    })
  })

  describe('getNoteById()', () => {
    it('retorna undefined si no existe', async () => {
      mockDb.query.mockResolvedValue({ values: [] })

      expect(await Notes.getNoteById('missing')).toBeUndefined()
    })

    it('convierte pinned y archived a booleanos', async () => {
      mockDb.query.mockResolvedValue({ values: [dbRow({ pinned: 1, archived: 1 })] })

      await expect(Notes.getNoteById('note-1')).resolves.toMatchObject({
        pinned: true,
        archived: true,
      })
    })
  })

  describe('updateNote()', () => {
    it('lanza Error si la nota no existe', async () => {
      mockDb.query.mockResolvedValue({ values: [] })

      await expect(Notes.updateNote('missing', { title: 'Nueva' })).rejects.toThrow('no encontrada')
    })

    it('construye query dinámica solo con campos presentes en changes', async () => {
      mockDb.query.mockResolvedValue({ values: [dbRow()] })

      await Notes.updateNote('note-1', { title: 'Nueva' })

      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE notes SET title = ?, updatedAt = ? WHERE id = ?',
        ['Nueva', '2024-01-15T10:00:00.000Z', 'note-1'],
      )
    })

    it('convierte pinned: true a 1 en la query SQL', async () => {
      mockDb.query.mockResolvedValue({ values: [dbRow()] })

      await Notes.updateNote('note-1', { pinned: true })

      expect(mockDb.run.mock.calls[0][1]).toContain(1)
    })

    it('convierte archived: true a 1 en la query SQL', async () => {
      mockDb.query.mockResolvedValue({ values: [dbRow()] })

      await Notes.updateNote('note-1', { archived: true })

      expect(mockDb.run.mock.calls[0][1]).toContain(1)
    })

    it('siempre actualiza updatedAt', async () => {
      mockDb.query.mockResolvedValue({ values: [dbRow()] })

      const updated = await Notes.updateNote('note-1', { content: 'Nuevo' })

      expect(mockDb.run.mock.calls[0][0]).toContain('updatedAt = ?')
      expect(updated.updatedAt).toBe('2024-01-15T10:00:00.000Z')
    })

    it('llama persistWeb() después de db.run', async () => {
      mockDb.query.mockResolvedValue({ values: [dbRow()] })

      await Notes.updateNote('note-1', { title: 'Nueva' })

      expect(connection.persistWeb).toHaveBeenCalled()
    })

    it('retorna el objeto merged de existing + changes + updatedAt', async () => {
      mockDb.query.mockResolvedValue({ values: [dbRow({ title: 'Vieja', pinned: 0 })] })

      const updated = await Notes.updateNote('note-1', { title: 'Nueva', pinned: true })

      expect(updated).toMatchObject({
        id: 'note-1',
        title: 'Nueva',
        pinned: true,
        updatedAt: '2024-01-15T10:00:00.000Z',
      })
    })
  })

  describe('deleteNote() — soft delete', () => {
    it('ejecuta UPDATE con deletedAt = NOW', async () => {
      await Notes.deleteNote('note-1')

      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE notes SET deletedAt = ? WHERE id = ?',
        ['2024-01-15T10:00:00.000Z', 'note-1'],
      )
    })

    it('llama persistWeb()', async () => {
      await Notes.deleteNote('note-1')

      expect(connection.persistWeb).toHaveBeenCalled()
    })

    it('desactiva la transacción implícita si ya hay una transacción explícita', async () => {
      connection.isWriteTransactionActive.mockReturnValue(true)

      await Notes.deleteNote('note-1')

      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE notes SET deletedAt = ? WHERE id = ?',
        ['2024-01-15T10:00:00.000Z', 'note-1'],
        false,
      )
    })
  })

  describe('permanentlyDeleteNote()', () => {
    it('ejecuta DELETE FROM notes WHERE id = ?', async () => {
      await Notes.permanentlyDeleteNote('note-1')

      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM notes WHERE id = ?', ['note-1'])
    })

    it('llama persistWeb()', async () => {
      await Notes.permanentlyDeleteNote('note-1')

      expect(connection.persistWeb).toHaveBeenCalled()
    })
  })

  describe('papelera', () => {
    it('getDeletedNotes() consulta notas con deletedAt IS NOT NULL', async () => {
      await Notes.getDeletedNotes()

      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('deletedAt IS NOT NULL'))
    })

    it('getDeletedNotes() convierte flags a booleanos', async () => {
      mockDb.query.mockResolvedValue({ values: [dbRow({ pinned: 1, archived: 0, deletedAt: '2024-01-01T00:00:00.000Z' })] })

      const [note] = await Notes.getDeletedNotes()

      expect(note.pinned).toBe(true)
      expect(note.archived).toBe(false)
    })

    it('restoreNote() quita deletedAt', async () => {
      await Notes.restoreNote('note-1')

      expect(mockDb.run).toHaveBeenCalledWith('UPDATE notes SET deletedAt = NULL WHERE id = ?', ['note-1'])
    })

    it('emptyTrashNotes() elimina físicamente notas en papelera', async () => {
      await Notes.emptyTrashNotes()

      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM notes WHERE deletedAt IS NOT NULL')
    })

    it('countDeletedNotes() retorna el count de papelera', async () => {
      mockDb.query.mockResolvedValue({ values: [{ count: 4 }] })

      expect(await Notes.countDeletedNotes()).toBe(4)
    })

    it('softDeleteNotesBySubject() marca deletedAt solo en notas activas del subject', async () => {
      await Notes.softDeleteNotesBySubject('subj-1')

      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE notes SET deletedAt = ? WHERE subjectId = ? AND deletedAt IS NULL',
        ['2024-01-15T10:00:00.000Z', 'subj-1'],
      )
    })

    it('restoreNotesBySubject() restaura notas eliminadas del subject', async () => {
      await Notes.restoreNotesBySubject('subj-1')

      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE notes SET deletedAt = NULL WHERE subjectId = ? AND deletedAt IS NOT NULL',
        ['subj-1'],
      )
    })
  })

  describe('countNotes()', () => {
    it('retorna 0 si no hay notas', async () => {
      mockDb.query.mockResolvedValue({ values: [] })

      expect(await Notes.countNotes()).toBe(0)
    })

    it('retorna el count del resultado de la query', async () => {
      mockDb.query.mockResolvedValue({ values: [{ count: 7 }] })

      expect(await Notes.countNotes()).toBe(7)
    })
  })

  describe('purgeOldDeletedNotes()', () => {
    it('usa 30 días por defecto', async () => {
      await Notes.purgeOldDeletedNotes()

      expect(mockDb.run).toHaveBeenCalledWith(
        'DELETE FROM notes WHERE deletedAt IS NOT NULL AND deletedAt < ?',
        ['2023-12-16T10:00:00.000Z'],
      )
    })

    it('llama db.run con una fecha de cutoff en el pasado', async () => {
      await Notes.purgeOldDeletedNotes(10)

      expect(mockDb.run.mock.calls[0][1][0]).toBe('2024-01-05T10:00:00.000Z')
    })
  })
})
