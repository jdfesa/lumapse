import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/services/backup/BackupService.js', () => ({
  createCurrentBackupZip: vi.fn(),
}))

import { createCurrentBackupZip } from '../../../src/services/backup/BackupService.js'
import {
  exportAllNotesToZip,
  triggerBrowserDownload,
} from '../../../src/services/ExportService.js'

const BACKUP = {
  content: new Blob(['zip']),
  contentType: 'application/zip',
  filename: 'lumapse-2026-06-03-12-30.zip',
  manifest: {
    backupFormatVersion: 1,
  },
  counts: {
    subjects: 1,
    notes: 2,
    academicEvents: 0,
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  createCurrentBackupZip.mockResolvedValue(BACKUP)
})

describe('ExportService', () => {
  describe('exportAllNotesToZip()', () => {
    it('delega el contenido al backup canonico y dispara la descarga web', async () => {
      const download = vi.fn()

      const result = await exportAllNotesToZip({ download })

      expect(createCurrentBackupZip).toHaveBeenCalledWith({ type: 'blob' })
      expect(download).toHaveBeenCalledWith(BACKUP.content, BACKUP.filename)
      expect(result).toBe(BACKUP)
    })

    it('fusiona opciones del generador de backup', async () => {
      const createdAt = new Date('2026-06-03T12:30:00.000Z')

      await exportAllNotesToZip({
        download: vi.fn(),
        backupOptions: {
          createdAt,
          filename: 'custom.zip',
        },
      })

      expect(createCurrentBackupZip).toHaveBeenCalledWith({
        type: 'blob',
        createdAt,
        filename: 'custom.zip',
      })
    })
  })

  describe('triggerBrowserDownload()', () => {
    it('crea un link temporal, lo clickea y limpia la URL', () => {
      const link = {
        click: vi.fn(),
        remove: vi.fn(),
        style: {},
      }
      const doc = {
        body: {
          appendChild: vi.fn(),
        },
        createElement: vi.fn().mockReturnValue(link),
      }
      const urlApi = {
        createObjectURL: vi.fn().mockReturnValue('blob:lumapse-backup'),
        revokeObjectURL: vi.fn(),
      }
      const setTimeout = vi.fn((callback) => callback())

      triggerBrowserDownload(BACKUP.content, BACKUP.filename, {
        document: doc,
        URL: urlApi,
        setTimeout,
      })

      expect(urlApi.createObjectURL).toHaveBeenCalledWith(BACKUP.content)
      expect(link.href).toBe('blob:lumapse-backup')
      expect(link.download).toBe(BACKUP.filename)
      expect(doc.body.appendChild).toHaveBeenCalledWith(link)
      expect(link.click).toHaveBeenCalledTimes(1)
      expect(link.remove).toHaveBeenCalledTimes(1)
      expect(urlApi.revokeObjectURL).toHaveBeenCalledWith('blob:lumapse-backup')
    })
  })
})
