import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as AcademicEventRows from '../../../../src/services/sqlite/academicEvents.js'
import * as NoteRows from '../../../../src/services/sqlite/notes.js'
import * as SubjectRows from '../../../../src/services/sqlite/subjects.js'
import {
  collectBackupData,
  countBackupItems,
  hasBackupData,
} from '../../../../src/services/backup/BackupDataSource.ts'

vi.mock('../../../../src/services/sqlite/academicEvents.js', () => ({
  getAcademicEventRows: vi.fn(),
}))

vi.mock('../../../../src/services/sqlite/notes.js', () => ({
  getAllNotes: vi.fn(),
}))

vi.mock('../../../../src/services/sqlite/subjects.js', () => ({
  getAllSubjectRowsIncludingArchived: vi.fn(),
}))

const SUBJECTS = [
  {
    id: 'subj-1',
    name: 'Matemática',
    parentSubjectId: null,
    archived: false,
    color: '#38bdf8',
    createdAt: '2026-05-01T10:00:00.000Z',
  },
  {
    id: 'subj-archived',
    name: 'Historia',
    parentSubjectId: null,
    archived: true,
    color: '#f59e0b',
    createdAt: '2026-05-02T10:00:00.000Z',
  },
]

const NOTES = [
  {
    id: 'note-1',
    title: 'Parcial 1',
    content: '# Parcial 1',
    pinned: false,
    archived: false,
    statusEmoji: null,
    subjectId: 'subj-1',
    createdAt: '2026-05-03T10:00:00.000Z',
    updatedAt: '2026-05-04T10:00:00.000Z',
  },
]

const ACADEMIC_EVENTS = [
  {
    id: 'event-1',
    type: 'parcial',
    title: 'Primer parcial',
    date: '2026-06-20',
    subjectId: 'subj-1',
    createdAt: '2026-05-05T10:00:00.000Z',
    updatedAt: '2026-05-06T10:00:00.000Z',
  },
]

beforeEach(() => {
  vi.clearAllMocks()
  SubjectRows.getAllSubjectRowsIncludingArchived.mockResolvedValue(SUBJECTS)
  NoteRows.getAllNotes.mockResolvedValue(NOTES)
  AcademicEventRows.getAcademicEventRows.mockResolvedValue(ACADEMIC_EVENTS)
})

describe('BackupDataSource', () => {
  describe('collectBackupData()', () => {
    it('reune materias/secciones, notas y fechas academicas desde SQLite', async () => {
      const data = await collectBackupData()

      expect(SubjectRows.getAllSubjectRowsIncludingArchived).toHaveBeenCalledTimes(1)
      expect(NoteRows.getAllNotes).toHaveBeenCalledTimes(1)
      expect(AcademicEventRows.getAcademicEventRows).toHaveBeenCalledTimes(1)
      expect(data).toEqual({
        subjects: SUBJECTS,
        notes: NOTES,
        academicEvents: ACADEMIC_EVENTS,
      })
    })

    it('incluye materias archivadas porque el backup conserva datos archivados', async () => {
      const data = await collectBackupData()

      expect(data.subjects).toContainEqual(expect.objectContaining({
        id: 'subj-archived',
        archived: true,
      }))
    })

    it('propaga errores de SQLite para que la capa de UI pueda informar el fallo', async () => {
      NoteRows.getAllNotes.mockRejectedValue(new Error('SQLite no disponible'))

      await expect(collectBackupData()).rejects.toThrow('SQLite no disponible')
    })
  })

  describe('countBackupItems()', () => {
    it('cuenta los grupos de datos respaldables', () => {
      expect(countBackupItems({
        subjects: SUBJECTS,
        notes: NOTES,
        academicEvents: ACADEMIC_EVENTS,
      })).toEqual({
        subjects: 2,
        notes: 1,
        academicEvents: 1,
      })
    })

    it('usa cero cuando faltan colecciones', () => {
      expect(countBackupItems()).toEqual({
        subjects: 0,
        notes: 0,
        academicEvents: 0,
      })
    })
  })

  describe('hasBackupData()', () => {
    it('retorna true si existe al menos un dato respaldable', () => {
      expect(hasBackupData({ subjects: [], notes: NOTES, academicEvents: [] })).toBe(true)
    })

    it('retorna false si no hay datos respaldables', () => {
      expect(hasBackupData({ subjects: [], notes: [], academicEvents: [] })).toBe(false)
    })
  })
})
