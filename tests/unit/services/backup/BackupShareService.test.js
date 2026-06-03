import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Directory, Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import {
  backupContentToBase64,
  shareBackupFile,
  shareBackupZip,
  writeBackupToCache,
} from '../../../../src/services/backup/BackupShareService.js'

vi.mock('@capacitor/filesystem', () => ({
  Directory: {
    Cache: 'CACHE',
  },
  Filesystem: {
    writeFile: vi.fn(),
    getUri: vi.fn(),
  },
}))

vi.mock('@capacitor/share', () => ({
  Share: {
    canShare: vi.fn(),
    share: vi.fn(),
  },
}))

function arrayBufferFromText(text) {
  return new TextEncoder().encode(text).buffer
}

beforeEach(() => {
  vi.clearAllMocks()
  Filesystem.writeFile.mockResolvedValue(undefined)
  Filesystem.getUri.mockResolvedValue({ uri: 'file:///cache/lumapse.zip' })
  Share.canShare.mockResolvedValue({ value: true })
  Share.share.mockResolvedValue({ activityType: 'drive' })
})

describe('BackupShareService', () => {
  describe('backupContentToBase64()', () => {
    it('convierte ArrayBuffer a base64', async () => {
      await expect(backupContentToBase64(arrayBufferFromText('Lumapse'))).resolves.toBe('THVtYXBzZQ==')
    })

    it('acepta strings base64 sin modificarlos', async () => {
      await expect(backupContentToBase64('THVtYXBzZQ==')).resolves.toBe('THVtYXBzZQ==')
    })

    it('extrae base64 de un data URL', async () => {
      await expect(backupContentToBase64('data:application/zip;base64,THVtYXBzZQ==')).resolves.toBe('THVtYXBzZQ==')
    })

    it('rechaza contenidos no soportados', async () => {
      await expect(backupContentToBase64({ nope: true })).rejects.toThrow('no soportado')
    })
  })

  describe('writeBackupToCache()', () => {
    it('escribe el ZIP en cache y retorna una URI compartible', async () => {
      const fileRef = await writeBackupToCache({
        filename: 'lumapse-2026-06-03-12-30.zip',
        content: arrayBufferFromText('Lumapse'),
      })

      expect(Filesystem.writeFile).toHaveBeenCalledWith({
        path: 'lumapse-2026-06-03-12-30.zip',
        data: 'THVtYXBzZQ==',
        directory: Directory.Cache,
      })
      expect(Filesystem.getUri).toHaveBeenCalledWith({
        path: 'lumapse-2026-06-03-12-30.zip',
        directory: Directory.Cache,
      })
      expect(fileRef).toEqual({
        filename: 'lumapse-2026-06-03-12-30.zip',
        path: 'lumapse-2026-06-03-12-30.zip',
        uri: 'file:///cache/lumapse.zip',
      })
    })

    it('rechaza backups incompletos', async () => {
      await expect(writeBackupToCache({ filename: 'backup.zip' })).rejects.toThrow('Backup incompleto')
    })
  })

  describe('shareBackupFile()', () => {
    it('abre el share sheet con el archivo preparado', async () => {
      await expect(shareBackupFile({
        uri: 'file:///cache/lumapse.zip',
      })).resolves.toEqual({ activityType: 'drive' })

      expect(Share.canShare).toHaveBeenCalledTimes(1)
      expect(Share.share).toHaveBeenCalledWith({
        title: 'Backup Lumapse',
        text: 'Backup manual de Lumapse.',
        files: ['file:///cache/lumapse.zip'],
        dialogTitle: 'Guardar backup de Lumapse',
      })
    })

    it('rechaza si el dispositivo no permite compartir', async () => {
      Share.canShare.mockResolvedValue({ value: false })

      await expect(shareBackupFile({ uri: 'file:///cache/lumapse.zip' })).rejects.toThrow('no permite compartir')
      expect(Share.share).not.toHaveBeenCalled()
    })
  })

  describe('shareBackupZip()', () => {
    it('prepara el ZIP y lo comparte en una sola operacion', async () => {
      const result = await shareBackupZip({
        filename: 'lumapse-2026-06-03-12-30.zip',
        content: arrayBufferFromText('Lumapse'),
      })

      expect(Filesystem.writeFile).toHaveBeenCalledTimes(1)
      expect(Share.share).toHaveBeenCalledTimes(1)
      expect(result).toEqual({
        filename: 'lumapse-2026-06-03-12-30.zip',
        path: 'lumapse-2026-06-03-12-30.zip',
        uri: 'file:///cache/lumapse.zip',
        shareResult: { activityType: 'drive' },
      })
    })
  })
})
