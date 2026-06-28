import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  BACKUP_FLOW_STATUS,
  createAndShareCurrentBackup,
  dismissCurrentBackupReminder,
  getCurrentBackupReminder,
  getExternalBackupReadiness,
} from '../../../../src/services/backup/BackupFlowService.ts'
import { BACKUP_REMINDER_REASONS } from '../../../../src/services/backup/BackupReminderService.ts'

const WIFI_STATE = {
  connected: true,
  connectionType: 'wifi',
  externalBackupAllowed: true,
  recommended: true,
  requiresWarning: false,
  message: 'Con WiFi. Podes crear un backup externo.',
}

const CELLULAR_STATE = {
  connected: true,
  connectionType: 'cellular',
  externalBackupAllowed: true,
  recommended: false,
  requiresWarning: true,
  message: 'Con datos moviles. Podes crear backup, pero puede consumir datos.',
}

const OFFLINE_STATE = {
  connected: false,
  connectionType: 'none',
  externalBackupAllowed: false,
  recommended: false,
  requiresWarning: false,
  message: 'Sin conexion. Tus notas siguen disponibles.',
}

const BACKUP_RESULT = {
  content: new ArrayBuffer(8),
  contentType: 'application/zip',
  filename: 'lumapse-2026-06-03-12-30.zip',
  manifest: {
    app: 'Lumapse',
    backupFormatVersion: 1,
    createdAt: '2026-06-03T12:30:00.000Z',
  },
  counts: { subjects: 1, notes: 1, academicEvents: 0 },
}

const SHARE_RESULT = {
  filename: 'lumapse-2026-06-03-12-30.zip',
  path: 'lumapse-2026-06-03-12-30.zip',
  uri: 'file:///cache/lumapse.zip',
  shareResult: { activityType: 'drive' },
}

let readNetworkState
let createBackup
let shareBackup
let persistBackupCreatedAt

beforeEach(() => {
  readNetworkState = vi.fn().mockResolvedValue(WIFI_STATE)
  createBackup = vi.fn().mockResolvedValue(BACKUP_RESULT)
  shareBackup = vi.fn().mockResolvedValue(SHARE_RESULT)
  persistBackupCreatedAt = vi.fn().mockReturnValue('2026-06-03T12:30:00.000Z')
})

describe('BackupFlowService', () => {
  describe('getExternalBackupReadiness()', () => {
    it('retorna ready cuando la red permite backup externo sin advertencia', async () => {
      await expect(getExternalBackupReadiness({ readNetworkState })).resolves.toEqual({
        status: BACKUP_FLOW_STATUS.READY,
        ready: true,
        networkState: WIFI_STATE,
        message: WIFI_STATE.message,
      })
    })

    it('retorna requires-warning para datos moviles', async () => {
      readNetworkState.mockResolvedValue(CELLULAR_STATE)

      await expect(getExternalBackupReadiness({ readNetworkState })).resolves.toEqual({
        status: BACKUP_FLOW_STATUS.REQUIRES_WARNING,
        ready: false,
        networkState: CELLULAR_STATE,
        message: CELLULAR_STATE.message,
      })
    })

    it('retorna blocked-offline sin conexion', async () => {
      readNetworkState.mockResolvedValue(OFFLINE_STATE)

      await expect(getExternalBackupReadiness({ readNetworkState })).resolves.toMatchObject({
        status: BACKUP_FLOW_STATUS.BLOCKED_OFFLINE,
        ready: false,
        networkState: OFFLINE_STATE,
      })
    })
  })

  describe('createAndShareCurrentBackup()', () => {
    it('con WiFi crea el backup actual y abre el share sheet', async () => {
      const result = await createAndShareCurrentBackup({
        readNetworkState,
        createBackup,
        shareBackup,
        persistBackupCreatedAt,
      })

      expect(createBackup).toHaveBeenCalledWith({ type: 'arraybuffer' })
      expect(shareBackup).toHaveBeenCalledWith(BACKUP_RESULT, {})
      expect(persistBackupCreatedAt).toHaveBeenCalledWith('2026-06-03T12:30:00.000Z')
      expect(result).toEqual({
        status: BACKUP_FLOW_STATUS.SHARED,
        ready: true,
        networkState: WIFI_STATE,
        message: WIFI_STATE.message,
        backup: BACKUP_RESULT,
        lastBackupCreatedAt: '2026-06-03T12:30:00.000Z',
        share: SHARE_RESULT,
      })
    })

    it('fusiona opciones de backup y share al ejecutar el flujo', async () => {
      const backupOptions = {
        createdAt: new Date('2026-06-03T12:30:00.000Z'),
        filename: 'custom.zip',
      }
      const shareOptions = {
        dialogTitle: 'Compartir backup',
      }

      await createAndShareCurrentBackup({
        readNetworkState,
        createBackup,
        shareBackup,
        persistBackupCreatedAt,
        backupOptions,
        shareOptions,
      })

      expect(createBackup).toHaveBeenCalledWith({
        type: 'arraybuffer',
        ...backupOptions,
      })
      expect(shareBackup).toHaveBeenCalledWith(BACKUP_RESULT, shareOptions)
    })

    it('con datos moviles retorna advertencia y no genera ZIP sin confirmacion', async () => {
      readNetworkState.mockResolvedValue(CELLULAR_STATE)

      const result = await createAndShareCurrentBackup({
        readNetworkState,
        createBackup,
        shareBackup,
        persistBackupCreatedAt,
      })

      expect(result).toEqual({
        status: BACKUP_FLOW_STATUS.REQUIRES_WARNING,
        ready: false,
        networkState: CELLULAR_STATE,
        message: CELLULAR_STATE.message,
      })
      expect(createBackup).not.toHaveBeenCalled()
      expect(shareBackup).not.toHaveBeenCalled()
      expect(persistBackupCreatedAt).not.toHaveBeenCalled()
    })

    it('con datos moviles confirmado continua con backup y share', async () => {
      readNetworkState.mockResolvedValue(CELLULAR_STATE)

      const result = await createAndShareCurrentBackup({
        readNetworkState,
        createBackup,
        shareBackup,
        persistBackupCreatedAt,
        acceptNetworkWarning: true,
      })

      expect(result.status).toBe(BACKUP_FLOW_STATUS.SHARED)
      expect(createBackup).toHaveBeenCalledTimes(1)
      expect(shareBackup).toHaveBeenCalledTimes(1)
      expect(persistBackupCreatedAt).toHaveBeenCalledTimes(1)
    })

    it('sin conexion bloquea el flujo y no genera ZIP', async () => {
      readNetworkState.mockResolvedValue(OFFLINE_STATE)

      const result = await createAndShareCurrentBackup({
        readNetworkState,
        createBackup,
        shareBackup,
        persistBackupCreatedAt,
      })

      expect(result).toMatchObject({
        status: BACKUP_FLOW_STATUS.BLOCKED_OFFLINE,
        ready: false,
        networkState: OFFLINE_STATE,
      })
      expect(createBackup).not.toHaveBeenCalled()
      expect(shareBackup).not.toHaveBeenCalled()
      expect(persistBackupCreatedAt).not.toHaveBeenCalled()
    })

    it('propaga errores de generacion para que la UI los informe', async () => {
      createBackup.mockRejectedValue(new Error('No se pudo generar ZIP'))

      await expect(createAndShareCurrentBackup({
        readNetworkState,
        createBackup,
        shareBackup,
        persistBackupCreatedAt,
      })).rejects.toThrow('No se pudo generar ZIP')
      expect(shareBackup).not.toHaveBeenCalled()
      expect(persistBackupCreatedAt).not.toHaveBeenCalled()
    })

    it('propaga errores del share sheet', async () => {
      shareBackup.mockRejectedValue(new Error('No se pudo compartir'))

      await expect(createAndShareCurrentBackup({
        readNetworkState,
        createBackup,
        shareBackup,
        persistBackupCreatedAt,
      })).rejects.toThrow('No se pudo compartir')
      expect(persistBackupCreatedAt).not.toHaveBeenCalled()
    })

    it('si el usuario cancela el selector no marca el backup como completado', async () => {
      shareBackup.mockResolvedValue({
        ...SHARE_RESULT,
        shareResult: { cancelled: true },
      })

      const result = await createAndShareCurrentBackup({
        readNetworkState,
        createBackup,
        shareBackup,
        persistBackupCreatedAt,
      })

      expect(result).toMatchObject({
        status: BACKUP_FLOW_STATUS.CANCELLED,
        ready: true,
        networkState: WIFI_STATE,
      })
      expect(persistBackupCreatedAt).not.toHaveBeenCalled()
    })

    it('no falla el flujo si no puede persistir la fecha del backup', async () => {
      persistBackupCreatedAt.mockImplementation(() => {
        throw new Error('localStorage bloqueado')
      })

      const result = await createAndShareCurrentBackup({
        readNetworkState,
        createBackup,
        shareBackup,
        persistBackupCreatedAt,
      })

      expect(result.status).toBe(BACKUP_FLOW_STATUS.SHARED)
      expect(result.lastBackupCreatedAt).toBeNull()
    })
  })

  describe('getCurrentBackupReminder()', () => {
    it('muestra recordatorio si hay datos y no existe backup previo', async () => {
      const result = await getCurrentBackupReminder({
        collectData: vi.fn().mockResolvedValue({
          subjects: [],
          notes: [{ id: 'note-1' }],
          academicEvents: [],
        }),
        readTimestamps: vi.fn().mockReturnValue({
          lastBackupCreatedAt: null,
          lastBackupReminderDismissedAt: null,
        }),
        now: new Date('2026-06-03T12:00:00.000Z'),
      })

      expect(result).toMatchObject({
        shouldShow: true,
        reason: BACKUP_REMINDER_REASONS.NEVER_BACKED_UP,
      })
    })

    it('no muestra recordatorio si no hay datos respaldables', async () => {
      const result = await getCurrentBackupReminder({
        collectData: vi.fn().mockResolvedValue({
          subjects: [],
          notes: [],
          academicEvents: [],
        }),
        readTimestamps: vi.fn().mockReturnValue({
          lastBackupCreatedAt: null,
          lastBackupReminderDismissedAt: null,
        }),
      })

      expect(result).toMatchObject({
        shouldShow: false,
        reason: BACKUP_REMINDER_REASONS.NO_DATA,
      })
    })
  })

  describe('dismissCurrentBackupReminder()', () => {
    it('persiste la fecha de cierre del recordatorio', () => {
      const persistDismissedAt = vi.fn().mockReturnValue('2026-06-03T12:00:00.000Z')

      const result = dismissCurrentBackupReminder({
        now: new Date('2026-06-03T12:00:00.000Z'),
        persistDismissedAt,
      })

      expect(persistDismissedAt).toHaveBeenCalledWith(
        new Date('2026-06-03T12:00:00.000Z'),
        { storage: undefined }
      )
      expect(result).toBe('2026-06-03T12:00:00.000Z')
    })
  })
})
