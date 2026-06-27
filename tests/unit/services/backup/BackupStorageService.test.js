import { beforeEach, describe, expect, it } from 'vitest'
import {
  BACKUP_STORAGE_KEYS,
  getBackupReminderTimestamps,
  setLastBackupCreatedAt,
  setLastBackupReminderDismissedAt,
} from '../../../../src/services/backup/BackupStorageService.ts'

describe('BackupStorageService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('lee timestamps vacios cuando no hay persistencia previa', () => {
    expect(getBackupReminderTimestamps()).toEqual({
      lastBackupCreatedAt: null,
      lastBackupReminderDismissedAt: null,
    })
  })

  it('persiste la fecha del ultimo backup creado', () => {
    const timestamp = setLastBackupCreatedAt(new Date('2026-06-03T12:00:00.000Z'))

    expect(timestamp).toBe('2026-06-03T12:00:00.000Z')
    expect(localStorage.getItem(BACKUP_STORAGE_KEYS.LAST_BACKUP_CREATED_AT)).toBe(timestamp)
    expect(getBackupReminderTimestamps()).toMatchObject({
      lastBackupCreatedAt: timestamp,
    })
  })

  it('persiste la fecha de cierre del recordatorio', () => {
    const timestamp = setLastBackupReminderDismissedAt(new Date('2026-06-03T13:00:00.000Z'))

    expect(timestamp).toBe('2026-06-03T13:00:00.000Z')
    expect(localStorage.getItem(BACKUP_STORAGE_KEYS.LAST_BACKUP_REMINDER_DISMISSED_AT)).toBe(timestamp)
    expect(getBackupReminderTimestamps()).toMatchObject({
      lastBackupReminderDismissedAt: timestamp,
    })
  })

  it('rechaza fechas invalidas antes de persistir', () => {
    expect(() => setLastBackupCreatedAt('fecha-rota')).toThrow('Fecha de backup invalida')
    expect(localStorage.getItem(BACKUP_STORAGE_KEYS.LAST_BACKUP_CREATED_AT)).toBeNull()
  })
})
