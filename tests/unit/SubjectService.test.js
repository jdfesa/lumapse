import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as SubjectRows from '../../src/services/sqlite/subjects.js'
import * as NoteRows from '../../src/services/sqlite/notes.js'
import * as SubjectService from '../../src/services/SubjectService.js'

vi.mock('../../src/services/sqlite/subjects.js', () => ({
  createSubjectRow: vi.fn().mockResolvedValue(undefined),
  getAllSubjectRows: vi.fn().mockResolvedValue([]),
  getAllSubjectRowsIncludingArchived: vi.fn().mockResolvedValue([]),
  getSubjectRowById: vi.fn().mockResolvedValue(undefined),
  updateSubjectRow: vi.fn().mockResolvedValue(undefined),
  deleteSubjectRow: vi.fn().mockResolvedValue(undefined),
  countNotesBySubject: vi.fn().mockResolvedValue(0),
  getInboxCount: vi.fn().mockResolvedValue(0),
  getDeletedSubjectRows: vi.fn().mockResolvedValue([]),
  restoreSubjectRow: vi.fn().mockResolvedValue(undefined),
  softDeleteChildSubjects: vi.fn().mockResolvedValue(undefined),
  restoreChildSubjects: vi.fn().mockResolvedValue(undefined),
  archiveChildSubjects: vi.fn().mockResolvedValue(undefined),
  unarchiveChildSubjects: vi.fn().mockResolvedValue(undefined),
  purgeOldDeletedSubjects: vi.fn().mockResolvedValue(undefined),
  emptyTrashSubjects: vi.fn().mockResolvedValue(undefined),
  countTrashItems: vi.fn().mockResolvedValue(0),
  getChildSubjectIds: vi.fn().mockResolvedValue([]),
  countDeletedNotesBySubject: vi.fn().mockResolvedValue(0),
}))

vi.mock('../../src/services/sqlite/notes.js', () => ({
  getNoteById: vi.fn().mockResolvedValue(undefined),
  updateNote: vi.fn().mockResolvedValue(undefined),
  softDeleteNotesBySubject: vi.fn().mockResolvedValue(undefined),
  restoreNotesBySubject: vi.fn().mockResolvedValue(undefined),
  archiveNotesBySubject: vi.fn().mockResolvedValue(undefined),
  unarchiveNotesBySubject: vi.fn().mockResolvedValue(undefined),
  getDeletedNotes: vi.fn().mockResolvedValue([]),
  purgeOldDeletedNotes: vi.fn().mockResolvedValue(undefined),
  emptyTrashNotes: vi.fn().mockResolvedValue(undefined),
  restoreNote: vi.fn().mockResolvedValue(undefined),
}))

function subject(overrides = {}) {
  return {
    id: 'subj-1',
    name: 'Materia',
    parentSubjectId: null,
    archived: false,
    color: '#818cf8',
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2024-01-15T10:00:00.000Z'))
  vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'subject-uuid') })

  SubjectRows.getAllSubjectRows.mockResolvedValue([])
  SubjectRows.getAllSubjectRowsIncludingArchived.mockResolvedValue([])
  SubjectRows.getSubjectRowById.mockResolvedValue(undefined)
  SubjectRows.getChildSubjectIds.mockResolvedValue([])
  SubjectRows.getInboxCount.mockResolvedValue(0)
  SubjectRows.countNotesBySubject.mockResolvedValue(0)
})

describe('SubjectService', () => {
  describe('createSubject() — Validaciones DP-004', () => {
    it('lanza Error si name está vacío', async () => {
      await expect(SubjectService.createSubject('')).rejects.toThrow('obligatorio')
    })

    it('lanza Error si name es solo espacios', async () => {
      await expect(SubjectService.createSubject('   ')).rejects.toThrow('obligatorio')
    })

    it('lanza Error si name es null', async () => {
      await expect(SubjectService.createSubject(null)).rejects.toThrow('obligatorio')
    })

    it('lanza Error si ya existe una materia raíz con el mismo nombre', async () => {
      SubjectRows.getAllSubjectRowsIncludingArchived.mockResolvedValue([subject({ id: 'existing', name: 'Matemática' })])

      await expect(SubjectService.createSubject('matemática')).rejects.toThrow('Ya existe una materia')
    })

    it('lanza Error si ya existe una sección con el mismo nombre en el mismo padre', async () => {
      SubjectRows.getAllSubjectRowsIncludingArchived.mockResolvedValue([
        subject({ id: 'parent', name: 'Programación' }),
        subject({ id: 'sec-1', name: 'TP', parentSubjectId: 'parent' }),
      ])

      await expect(SubjectService.createSubject('tp', null, 'parent')).rejects.toThrow('Ya existe una sección')
    })

    it('NO lanza Error si mismo nombre pero diferente padre', async () => {
      SubjectRows.getAllSubjectRowsIncludingArchived.mockResolvedValue([
        subject({ id: 'parent-a', name: 'Programación' }),
        subject({ id: 'parent-b', name: 'Base de Datos' }),
        subject({ id: 'sec-a', name: 'TP', parentSubjectId: 'parent-a' }),
      ])

      await expect(SubjectService.createSubject('TP', null, 'parent-b')).resolves.toMatchObject({
        name: 'TP',
        parentSubjectId: 'parent-b',
      })
    })

    it('lanza Error si se intenta crear una sección de sección', async () => {
      SubjectRows.getAllSubjectRowsIncludingArchived.mockResolvedValue([
        subject({ id: 'parent', name: 'Programación' }),
        subject({ id: 'section', name: 'TP', parentSubjectId: 'parent' }),
      ])

      await expect(SubjectService.createSubject('Clase 1', null, 'section')).rejects.toThrow('2 niveles')
    })

    it('lanza Error si parentSubjectId referencia un padre que no existe', async () => {
      SubjectRows.getAllSubjectRowsIncludingArchived.mockResolvedValue([])

      await expect(SubjectService.createSubject('TP', null, 'missing')).rejects.toThrow('padre no existe')
    })

    it('lanza Error si ya existe una sección archivada con el mismo nombre', async () => {
      SubjectRows.getAllSubjectRowsIncludingArchived.mockResolvedValue([
        subject({ id: 'parent', name: 'Programación' }),
        subject({ id: 'archived-sec', name: 'Unidad I', parentSubjectId: 'parent', archived: true }),
      ])

      await expect(SubjectService.createSubject('unidad i', null, 'parent')).rejects.toThrow('Ya existe una sección')
    })
  })

  describe('createSubject() — Comportamiento esperado', () => {
    it('crea una materia raíz con color default si no se pasa color', async () => {
      const created = await SubjectService.createSubject('Matemática')

      expect(created).toMatchObject({
        id: 'subject-uuid',
        name: 'Matemática',
        color: '#818cf8',
        parentSubjectId: null,
        archived: false,
      })
    })

    it('usa SUBJECT_COLORS[0] como color por defecto', async () => {
      const created = await SubjectService.createSubject('Matemática')

      expect(created.color).toBe(SubjectService.SUBJECT_COLORS[0])
    })

    it('trim-ea el nombre antes de guardar', async () => {
      await SubjectService.createSubject('  Matemática  ')

      expect(SubjectRows.createSubjectRow).toHaveBeenCalledWith(expect.objectContaining({ name: 'Matemática' }))
    })

    it('llama a createSubjectRow con la estructura correcta', async () => {
      await SubjectService.createSubject('Matemática', '#f87171', null)

      expect(SubjectRows.createSubjectRow).toHaveBeenCalledWith({
        id: 'subject-uuid',
        name: 'Matemática',
        parentSubjectId: null,
        archived: false,
        color: '#f87171',
        createdAt: '2024-01-15T10:00:00.000Z',
      })
    })

    it('retorna el objeto materia creado', async () => {
      await expect(SubjectService.createSubject('Matemática')).resolves.toEqual(expect.objectContaining({
        id: 'subject-uuid',
        name: 'Matemática',
      }))
    })

    it('el objeto retornado tiene los campos esperados', async () => {
      const created = await SubjectService.createSubject('Matemática')

      expect(Object.keys(created).sort()).toEqual([
        'archived',
        'color',
        'createdAt',
        'id',
        'name',
        'parentSubjectId',
      ])
    })
  })

  describe('updateSubject() — Validaciones', () => {
    it('lanza Error si la materia no existe', async () => {
      await expect(SubjectService.updateSubject('missing', { name: 'Nueva' })).rejects.toThrow('no encontrada')
    })

    it('lanza Error si el nuevo nombre está vacío', async () => {
      SubjectRows.getSubjectRowById.mockResolvedValue(subject())

      await expect(SubjectService.updateSubject('subj-1', { name: '   ' })).rejects.toThrow('obligatorio')
    })

    it('lanza Error si el nuevo nombre colisiona con otro en el mismo nivel', async () => {
      SubjectRows.getSubjectRowById.mockResolvedValue(subject({ id: 'subj-1', parentSubjectId: null }))
      SubjectRows.getAllSubjectRowsIncludingArchived.mockResolvedValue([
        subject({ id: 'subj-1', name: 'Vieja' }),
        subject({ id: 'subj-2', name: 'Nueva' }),
      ])

      await expect(SubjectService.updateSubject('subj-1', { name: 'Nueva' })).rejects.toThrow('Ya existe una materia')
    })

    it('lanza Error si se cambia parentSubjectId a un subject que ya es sección', async () => {
      SubjectRows.getSubjectRowById.mockResolvedValue(subject({ id: 'subj-1' }))
      SubjectRows.getAllSubjectRowsIncludingArchived.mockResolvedValue([
        subject({ id: 'root', name: 'Root' }),
        subject({ id: 'section', name: 'Section', parentSubjectId: 'root' }),
      ])

      await expect(SubjectService.updateSubject('subj-1', { parentSubjectId: 'section' })).rejects.toThrow('2 niveles')
    })

    it('permite cambiar el nombre si no hay colisión', async () => {
      SubjectRows.getSubjectRowById.mockResolvedValue(subject({ id: 'subj-1' }))
      SubjectRows.getAllSubjectRowsIncludingArchived.mockResolvedValue([subject({ id: 'subj-1', name: 'Vieja' })])

      await SubjectService.updateSubject('subj-1', { name: ' Nueva ' })

      expect(SubjectRows.updateSubjectRow).toHaveBeenCalledWith('subj-1', { name: 'Nueva' })
    })

    it('permite cambiar el color sin validación de nombre', async () => {
      SubjectRows.getSubjectRowById.mockResolvedValue(subject({ id: 'subj-1' }))

      await SubjectService.updateSubject('subj-1', { color: '#f87171' })

      expect(SubjectRows.getAllSubjectRows).not.toHaveBeenCalled()
      expect(SubjectRows.updateSubjectRow).toHaveBeenCalledWith('subj-1', { color: '#f87171' })
    })
  })

  describe('deleteSubject() — Cascada', () => {
    it('llama softDeleteNotesBySubject para el subject padre', async () => {
      await SubjectService.deleteSubject('subj-1')

      expect(NoteRows.softDeleteNotesBySubject).toHaveBeenCalledWith('subj-1')
    })

    it('llama getChildSubjectIds para obtener secciones hijas', async () => {
      await SubjectService.deleteSubject('subj-1')

      expect(SubjectRows.getChildSubjectIds).toHaveBeenCalledWith('subj-1')
    })

    it('llama softDeleteNotesBySubject para cada sección hija', async () => {
      SubjectRows.getChildSubjectIds.mockResolvedValue(['sec-1', 'sec-2'])

      await SubjectService.deleteSubject('subj-1')

      expect(NoteRows.softDeleteNotesBySubject).toHaveBeenCalledWith('sec-1')
      expect(NoteRows.softDeleteNotesBySubject).toHaveBeenCalledWith('sec-2')
    })

    it('llama softDeleteChildSubjects para el subject padre', async () => {
      await SubjectService.deleteSubject('subj-1')

      expect(SubjectRows.softDeleteChildSubjects).toHaveBeenCalledWith('subj-1')
    })

    it('llama deleteSubjectRow para el subject padre', async () => {
      await SubjectService.deleteSubject('subj-1')

      expect(SubjectRows.deleteSubjectRow).toHaveBeenCalledWith('subj-1')
    })

    it('el orden es correcto: notas padre, notas hijos, hijos, padre', async () => {
      SubjectRows.getChildSubjectIds.mockResolvedValue(['sec-1'])

      await SubjectService.deleteSubject('subj-1')

      const parentNotes = NoteRows.softDeleteNotesBySubject.mock.invocationCallOrder[0]
      const childNotes = NoteRows.softDeleteNotesBySubject.mock.invocationCallOrder[1]
      const children = SubjectRows.softDeleteChildSubjects.mock.invocationCallOrder[0]
      const parent = SubjectRows.deleteSubjectRow.mock.invocationCallOrder[0]
      expect(parentNotes).toBeLessThan(childNotes)
      expect(childNotes).toBeLessThan(children)
      expect(children).toBeLessThan(parent)
    })
  })

  describe('restoreSubject() — Cascada', () => {
    it('llama restoreSubjectRow para el subject', async () => {
      await SubjectService.restoreSubject('subj-1')

      expect(SubjectRows.restoreSubjectRow).toHaveBeenCalledWith('subj-1')
    })

    it('llama restoreChildSubjects para restaurar secciones', async () => {
      await SubjectService.restoreSubject('subj-1')

      expect(SubjectRows.restoreChildSubjects).toHaveBeenCalledWith('subj-1')
    })

    it('llama restoreNotesBySubject para el subject padre', async () => {
      await SubjectService.restoreSubject('subj-1')

      expect(NoteRows.restoreNotesBySubject).toHaveBeenCalledWith('subj-1')
    })

    it('llama restoreNotesBySubject para cada sección hija', async () => {
      SubjectRows.getChildSubjectIds.mockResolvedValue(['sec-1', 'sec-2'])

      await SubjectService.restoreSubject('subj-1')

      expect(NoteRows.restoreNotesBySubject).toHaveBeenCalledWith('sec-1')
      expect(NoteRows.restoreNotesBySubject).toHaveBeenCalledWith('sec-2')
    })
  })

  describe('archiveSubject() — Cascada (solo subjects)', () => {
    it('archiva secciones hijas', async () => {
      await SubjectService.archiveSubject('subj-1')

      expect(SubjectRows.archiveChildSubjects).toHaveBeenCalledWith('subj-1')
    })

    it('archiva el subject padre', async () => {
      await SubjectService.archiveSubject('subj-1')

      expect(SubjectRows.updateSubjectRow).toHaveBeenCalledWith('subj-1', { archived: true })
    })

    it('NO archiva las notas', async () => {
      await SubjectService.archiveSubject('subj-1')

      expect(NoteRows.archiveNotesBySubject).not.toHaveBeenCalled()
    })

    it('el orden es correcto: hijos primero, padre después', async () => {
      await SubjectService.archiveSubject('subj-1')

      const children = SubjectRows.archiveChildSubjects.mock.invocationCallOrder[0]
      const parent = SubjectRows.updateSubjectRow.mock.invocationCallOrder[0]
      expect(children).toBeLessThan(parent)
    })
  })

  describe('unarchiveSubject() — Cascada inversa', () => {
    it('desarchiva el subject padre primero', async () => {
      SubjectRows.getSubjectRowById.mockResolvedValue(subject({ id: 'subj-1', archived: true }))
      SubjectRows.getAllSubjectRowsIncludingArchived.mockResolvedValue([
        subject({ id: 'subj-1', archived: true }),
        subject({ id: 'sec-1', parentSubjectId: 'subj-1', archived: true }),
      ])

      await SubjectService.unarchiveSubject('subj-1')

      expect(SubjectRows.updateSubjectRow).toHaveBeenCalledWith('subj-1', { archived: false })
    })

    it('desarchiva secciones hijas una por una', async () => {
      SubjectRows.getSubjectRowById.mockResolvedValue(subject({ id: 'subj-1', archived: true }))
      SubjectRows.getAllSubjectRowsIncludingArchived.mockResolvedValue([
        subject({ id: 'subj-1', archived: true }),
        subject({ id: 'sec-1', parentSubjectId: 'subj-1', archived: true }),
      ])

      await SubjectService.unarchiveSubject('subj-1')

      expect(SubjectRows.updateSubjectRow).toHaveBeenCalledWith('sec-1', { archived: false })
    })

    it('NO desarchiva las notas', async () => {
      SubjectRows.getSubjectRowById.mockResolvedValue(subject({ id: 'subj-1', archived: true }))
      SubjectRows.getAllSubjectRowsIncludingArchived.mockResolvedValue([subject({ id: 'subj-1', archived: true })])

      await SubjectService.unarchiveSubject('subj-1')

      expect(NoteRows.unarchiveNotesBySubject).not.toHaveBeenCalled()
    })

    it('renombra al restaurar si ya existe una materia activa con el mismo nombre', async () => {
      SubjectRows.getSubjectRowById.mockResolvedValue(subject({ id: 'archived-root', name: 'Programación II', archived: true }))
      SubjectRows.getAllSubjectRowsIncludingArchived.mockResolvedValue([
        subject({ id: 'active-root', name: 'Programación II', archived: false }),
        subject({ id: 'archived-root', name: 'Programación II', archived: true }),
      ])

      await SubjectService.unarchiveSubject('archived-root')

      expect(SubjectRows.updateSubjectRow).toHaveBeenCalledWith('archived-root', {
        archived: false,
        name: 'Programación II (restaurada)',
      })
    })
  })

  describe('archiveSection()', () => {
    it('archiva solo la sección, sin tocar notas', async () => {
      await SubjectService.archiveSection('sec-1')

      expect(SubjectRows.updateSubjectRow).toHaveBeenCalledWith('sec-1', { archived: true })
      expect(NoteRows.archiveNotesBySubject).not.toHaveBeenCalled()
    })
  })

  describe('unarchiveSection()', () => {
    it('no hace nada si la sección no existe', async () => {
      SubjectRows.getSubjectRowById.mockResolvedValue(undefined)

      await SubjectService.unarchiveSection('missing')

      expect(SubjectRows.updateSubjectRow).not.toHaveBeenCalled()
    })

    it('desarchiva solo la sección, sin tocar notas', async () => {
      SubjectRows.getSubjectRowById.mockResolvedValue(subject({ id: 'sec-1', parentSubjectId: null }))
      SubjectRows.getAllSubjectRowsIncludingArchived.mockResolvedValue([
        subject({ id: 'sec-1', parentSubjectId: null, archived: true }),
      ])

      await SubjectService.unarchiveSection('sec-1')

      expect(SubjectRows.updateSubjectRow).toHaveBeenCalledWith('sec-1', { archived: false })
      expect(NoteRows.unarchiveNotesBySubject).not.toHaveBeenCalled()
    })

    it('si el padre está archivado, desarchiva el padre antes que la sección', async () => {
      SubjectRows.getSubjectRowById
        .mockResolvedValueOnce(subject({ id: 'sec-1', parentSubjectId: 'subj-1', archived: true }))
        .mockResolvedValueOnce(subject({ id: 'subj-1', archived: true }))
      SubjectRows.getAllSubjectRowsIncludingArchived.mockResolvedValue([
        subject({ id: 'subj-1', archived: true }),
        subject({ id: 'sec-1', parentSubjectId: 'subj-1', archived: true }),
      ])

      await SubjectService.unarchiveSection('sec-1')

      expect(SubjectRows.updateSubjectRow).toHaveBeenCalledWith('subj-1', { archived: false })
      expect(SubjectRows.updateSubjectRow).toHaveBeenCalledWith('sec-1', { archived: false })
      expect(SubjectRows.updateSubjectRow.mock.invocationCallOrder[0])
        .toBeLessThan(SubjectRows.updateSubjectRow.mock.invocationCallOrder[1])
    })

    it('si el padre está activo, no lo toca', async () => {
      SubjectRows.getSubjectRowById
        .mockResolvedValueOnce(subject({ id: 'sec-1', parentSubjectId: 'subj-1', archived: true }))
        .mockResolvedValueOnce(subject({ id: 'subj-1', archived: false }))
      SubjectRows.getAllSubjectRowsIncludingArchived.mockResolvedValue([
        subject({ id: 'subj-1', archived: false }),
        subject({ id: 'sec-1', parentSubjectId: 'subj-1', archived: true }),
      ])

      await SubjectService.unarchiveSection('sec-1')

      expect(SubjectRows.updateSubjectRow).toHaveBeenCalledTimes(1)
      expect(SubjectRows.updateSubjectRow).toHaveBeenCalledWith('sec-1', { archived: false })
    })

    it('renombra al restaurar si ya existe una sección hermana con el mismo nombre', async () => {
      SubjectRows.getSubjectRowById
        .mockResolvedValueOnce(subject({ id: 'archived-sec', name: 'Unidad I', parentSubjectId: 'subj-1', archived: true }))
        .mockResolvedValueOnce(subject({ id: 'subj-1', archived: false }))
      SubjectRows.getAllSubjectRowsIncludingArchived.mockResolvedValue([
        subject({ id: 'subj-1', archived: false }),
        subject({ id: 'active-sec', name: 'Unidad I', parentSubjectId: 'subj-1', archived: false }),
        subject({ id: 'archived-sec', name: 'Unidad I', parentSubjectId: 'subj-1', archived: true }),
      ])

      await SubjectService.unarchiveSection('archived-sec')

      expect(SubjectRows.updateSubjectRow).toHaveBeenCalledWith('archived-sec', {
        archived: false,
        name: 'Unidad I (restaurada)',
      })
    })
  })

  describe('operaciones simples', () => {
    it('getAllSubjects() delega en getAllSubjectRows()', async () => {
      const rows = [subject({ id: 'subj-1' })]
      SubjectRows.getAllSubjectRows.mockResolvedValue(rows)

      await expect(SubjectService.getAllSubjects()).resolves.toBe(rows)
    })

    it('getSubjectById() delega en getSubjectRowById()', async () => {
      const row = subject({ id: 'subj-1' })
      SubjectRows.getSubjectRowById.mockResolvedValue(row)

      await expect(SubjectService.getSubjectById('subj-1')).resolves.toBe(row)
    })
  })

  describe('deleteSection()', () => {
    it('elimina notas de la sección y luego la sección', async () => {
      await SubjectService.deleteSection('sec-1')

      expect(NoteRows.softDeleteNotesBySubject).toHaveBeenCalledWith('sec-1')
      expect(SubjectRows.deleteSubjectRow).toHaveBeenCalledWith('sec-1')
      expect(NoteRows.softDeleteNotesBySubject.mock.invocationCallOrder[0])
        .toBeLessThan(SubjectRows.deleteSubjectRow.mock.invocationCallOrder[0])
    })
  })

  describe('restoreSection()', () => {
    it('no hace nada si la sección no existe', async () => {
      SubjectRows.getSubjectRowById.mockResolvedValue(undefined)

      await SubjectService.restoreSection('missing')

      expect(SubjectRows.restoreSubjectRow).not.toHaveBeenCalled()
    })

    it('si el padre sigue eliminado, restaura la sección como raíz', async () => {
      SubjectRows.getSubjectRowById
        .mockResolvedValueOnce(subject({ id: 'sec-1', parentSubjectId: 'subj-1' }))
        .mockResolvedValueOnce(subject({ id: 'subj-1', deletedAt: '2024-01-01T00:00:00.000Z' }))

      await SubjectService.restoreSection('sec-1')

      expect(SubjectRows.updateSubjectRow).toHaveBeenCalledWith('sec-1', { parentSubjectId: null })
      expect(SubjectRows.restoreSubjectRow).toHaveBeenCalledWith('sec-1')
      expect(NoteRows.restoreNotesBySubject).toHaveBeenCalledWith('sec-1')
    })

    it('si el padre está activo, conserva parentSubjectId', async () => {
      SubjectRows.getSubjectRowById
        .mockResolvedValueOnce(subject({ id: 'sec-1', parentSubjectId: 'subj-1' }))
        .mockResolvedValueOnce(subject({ id: 'subj-1', deletedAt: null }))

      await SubjectService.restoreSection('sec-1')

      expect(SubjectRows.updateSubjectRow).not.toHaveBeenCalledWith('sec-1', { parentSubjectId: null })
      expect(SubjectRows.restoreSubjectRow).toHaveBeenCalledWith('sec-1')
    })
  })

  describe('restoreNoteFromTrash()', () => {
    it('no hace nada si la nota no existe', async () => {
      NoteRows.getNoteById.mockResolvedValue(undefined)

      await SubjectService.restoreNoteFromTrash('missing')

      expect(NoteRows.restoreNote).not.toHaveBeenCalled()
    })

    it('restaura una nota con materia activa sin moverla', async () => {
      NoteRows.getNoteById.mockResolvedValue({ id: 'note-1', subjectId: 'subj-1' })
      SubjectRows.getSubjectRowById.mockResolvedValue(subject({ id: 'subj-1', deletedAt: null }))

      await SubjectService.restoreNoteFromTrash('note-1')

      expect(NoteRows.restoreNote).toHaveBeenCalledWith('note-1')
      expect(NoteRows.updateNote).not.toHaveBeenCalled()
    })

    it('si la materia de la nota está eliminada, la mueve a Entrada', async () => {
      NoteRows.getNoteById.mockResolvedValue({ id: 'note-1', subjectId: 'subj-1' })
      SubjectRows.getSubjectRowById.mockResolvedValue(subject({ id: 'subj-1', deletedAt: '2024-01-01T00:00:00.000Z' }))

      await SubjectService.restoreNoteFromTrash('note-1')

      expect(NoteRows.updateNote).toHaveBeenCalledWith('note-1', { subjectId: null })
    })
  })

  describe('getTrashItems()', () => {
    it('organiza materias eliminadas como árbol y calcula totalCount', async () => {
      NoteRows.getDeletedNotes.mockResolvedValue([
        { id: 'loose', subjectId: null },
        { id: 'inside-deleted', subjectId: 'subj-1' },
      ])
      SubjectRows.getDeletedSubjectRows.mockResolvedValue([
        subject({ id: 'subj-1', name: 'Materia', deletedAt: '2024-01-01T00:00:00.000Z' }),
        subject({ id: 'sec-1', name: 'Sección', parentSubjectId: 'subj-1', deletedAt: '2024-01-01T00:00:00.000Z' }),
      ])
      SubjectRows.countDeletedNotesBySubject.mockResolvedValue(2)
      SubjectRows.countTrashItems.mockResolvedValue(4)

      const trash = await SubjectService.getTrashItems()

      expect(trash.notes).toEqual([{ id: 'loose', subjectId: null }])
      expect(trash.subjects[0]).toMatchObject({
        id: 'subj-1',
        noteCount: 2,
        children: [expect.objectContaining({ id: 'sec-1', noteCount: 2 })],
      })
      expect(trash.totalCount).toBe(4)
    })

    it('reporta secciones huérfanas cuando su padre no está eliminado', async () => {
      SubjectRows.getDeletedSubjectRows.mockResolvedValue([
        subject({ id: 'sec-1', parentSubjectId: 'subj-active', deletedAt: '2024-01-01T00:00:00.000Z' }),
      ])

      const trash = await SubjectService.getTrashItems()

      expect(trash.orphanSections).toEqual([expect.objectContaining({ id: 'sec-1' })])
    })
  })

  describe('papelera global', () => {
    it('emptyTrash() vacía notas y materias', async () => {
      await SubjectService.emptyTrash()

      expect(NoteRows.emptyTrashNotes).toHaveBeenCalled()
      expect(SubjectRows.emptyTrashSubjects).toHaveBeenCalled()
    })

    it('autoPurge() purga notas y materias con el mismo umbral', async () => {
      await SubjectService.autoPurge(15)

      expect(NoteRows.purgeOldDeletedNotes).toHaveBeenCalledWith(15)
      expect(SubjectRows.purgeOldDeletedSubjects).toHaveBeenCalledWith(15)
    })
  })

  describe('getSubjectTree()', () => {
    it('retorna { inboxCount, tree } con tree vacío si no hay materias', async () => {
      SubjectRows.getInboxCount.mockResolvedValue(3)

      await expect(SubjectService.getSubjectTree()).resolves.toEqual({ inboxCount: 3, tree: [] })
    })

    it('construye árbol de 2 niveles correctamente', async () => {
      SubjectRows.getAllSubjectRows.mockResolvedValue([
        subject({ id: 'root', name: 'Root' }),
        subject({ id: 'child', name: 'Child', parentSubjectId: 'root' }),
      ])

      const result = await SubjectService.getSubjectTree()

      expect(result.tree).toHaveLength(1)
      expect(result.tree[0]).toMatchObject({ id: 'root', children: [expect.objectContaining({ id: 'child' })] })
    })

    it('incluye noteCount en cada nodo del árbol', async () => {
      SubjectRows.getAllSubjectRows.mockResolvedValue([
        subject({ id: 'root', name: 'Root' }),
        subject({ id: 'child', name: 'Child', parentSubjectId: 'root' }),
      ])
      SubjectRows.countNotesBySubject.mockImplementation(async id => (id === 'root' ? 4 : 2))

      const result = await SubjectService.getSubjectTree()

      expect(result.tree[0].noteCount).toBe(4)
      expect(result.tree[0].children[0].noteCount).toBe(2)
    })

    it('asocia correctamente los children con su padre', async () => {
      SubjectRows.getAllSubjectRows.mockResolvedValue([
        subject({ id: 'root-a', name: 'A' }),
        subject({ id: 'root-b', name: 'B' }),
        subject({ id: 'child-a', name: 'Child A', parentSubjectId: 'root-a' }),
      ])

      const result = await SubjectService.getSubjectTree()

      expect(result.tree.find(s => s.id === 'root-a').children.map(s => s.id)).toEqual(['child-a'])
      expect(result.tree.find(s => s.id === 'root-b').children).toEqual([])
    })

    it('incluye inboxCount del resultado de getInboxCount()', async () => {
      SubjectRows.getInboxCount.mockResolvedValue(7)

      const result = await SubjectService.getSubjectTree()

      expect(result.inboxCount).toBe(7)
    })
  })

  describe('SUBJECT_COLORS', () => {
    it('exporta exactamente 8 colores', () => {
      expect(SubjectService.SUBJECT_COLORS).toHaveLength(8)
    })

    it('el primer color es "#818cf8"', () => {
      expect(SubjectService.SUBJECT_COLORS[0]).toBe('#818cf8')
    })
  })
})
