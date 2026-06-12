import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as BackupDataSource from '../../../../src/services/backup/BackupDataSource.ts'
import * as BackupZipService from '../../../../src/services/backup/BackupZipService.ts'
import {
  EMPTY_BACKUP_ERROR,
  createCurrentBackupZip,
} from '../../../../src/services/backup/BackupService.ts'

vi.mock('../../../../src/services/backup/BackupDataSource.ts', () => ({
  collectBackupData: vi.fn(),
  countBackupItems: vi.fn(),
  hasBackupData: vi.fn(),
}))

vi.mock('../../../../src/services/backup/BackupZipService.ts', () => ({
  generateBackupZip: vi.fn(),
}))

const BACKUP_DATA = {
  subjects: [{ id: 'subj-1', name: 'Matemática' }],
  notes: [{ id: 'note-1', title: 'Parcial 1' }],
  academicEvents: [{ id: 'event-1', type: 'parcial' }],
}

const BACKUP_RESULT = {
  content: new ArrayBuffer(8),
  contentType: 'application/zip',
  filename: 'lumapse-2026-06-03-12-30.zip',
  manifest: {
    app: 'Lumapse',
    backupFormatVersion: 1,
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  BackupDataSource.collectBackupData.mockResolvedValue(BACKUP_DATA)
  BackupDataSource.hasBackupData.mockReturnValue(true)
  BackupDataSource.countBackupItems.mockReturnValue({
    subjects: 1,
    notes: 1,
    academicEvents: 1,
  })
  BackupZipService.generateBackupZip.mockResolvedValue(BACKUP_RESULT)
})

describe('BackupService', () => {
  describe('createCurrentBackupZip()', () => {
    it('reune datos actuales y genera el ZIP con las opciones recibidas', async () => {
      const options = {
        createdAt: new Date('2026-06-03T12:30:00.000Z'),
        type: 'arraybuffer',
      }

      const result = await createCurrentBackupZip(options)

      expect(BackupDataSource.collectBackupData).toHaveBeenCalledTimes(1)
      expect(BackupDataSource.hasBackupData).toHaveBeenCalledWith(BACKUP_DATA)
      expect(BackupZipService.generateBackupZip).toHaveBeenCalledWith(BACKUP_DATA, options)
      expect(result).toEqual({
        ...BACKUP_RESULT,
        counts: {
          subjects: 1,
          notes: 1,
          academicEvents: 1,
        },
      })
    })

    it('no intenta generar ZIP cuando no hay datos respaldables', async () => {
      BackupDataSource.collectBackupData.mockResolvedValue({
        subjects: [],
        notes: [],
        academicEvents: [],
      })
      BackupDataSource.hasBackupData.mockReturnValue(false)

      await expect(createCurrentBackupZip()).rejects.toThrow(EMPTY_BACKUP_ERROR)
      expect(BackupZipService.generateBackupZip).not.toHaveBeenCalled()
    })

    it('propaga errores del generador para que la UI pueda informar el fallo', async () => {
      BackupZipService.generateBackupZip.mockRejectedValue(new Error('No se pudo generar ZIP'))

      await expect(createCurrentBackupZip()).rejects.toThrow('No se pudo generar ZIP')
    })
  })
})
