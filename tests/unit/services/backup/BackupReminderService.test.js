import { describe, expect, it } from 'vitest'
import {
  BACKUP_REMINDER_DAYS,
  BACKUP_REMINDER_REASONS,
  createBackupTimestamp,
  getBackupReminderState,
} from '../../../../src/services/backup/BackupReminderService.ts'

const NOW = new Date('2026-06-03T12:00:00.000Z')

describe('BackupReminderService', () => {
  describe('getBackupReminderState()', () => {
    it('no muestra recordatorio cuando no hay datos respaldables', () => {
      expect(getBackupReminderState({
        hasData: false,
        now: NOW,
      })).toEqual({
        shouldShow: false,
        reason: BACKUP_REMINDER_REASONS.NO_DATA,
        daysSinceLastBackup: null,
        thresholdDays: BACKUP_REMINDER_DAYS,
      })
    })

    it('muestra recordatorio si hay datos pero nunca hubo backup', () => {
      expect(getBackupReminderState({
        hasData: true,
        now: NOW,
      })).toMatchObject({
        shouldShow: true,
        reason: BACKUP_REMINDER_REASONS.NEVER_BACKED_UP,
        daysSinceLastBackup: null,
      })
    })

    it('muestra recordatorio cuando pasaron 30 dias desde el ultimo backup', () => {
      expect(getBackupReminderState({
        hasData: true,
        lastBackupCreatedAt: '2026-05-04T18:00:00.000Z',
        now: NOW,
      })).toMatchObject({
        shouldShow: true,
        reason: BACKUP_REMINDER_REASONS.BACKUP_DUE,
        daysSinceLastBackup: 30,
      })
    })

    it('no muestra recordatorio si el ultimo backup es reciente', () => {
      expect(getBackupReminderState({
        hasData: true,
        lastBackupCreatedAt: '2026-05-20T18:00:00.000Z',
        now: NOW,
      })).toMatchObject({
        shouldShow: false,
        reason: BACKUP_REMINDER_REASONS.RECENT_BACKUP,
        daysSinceLastBackup: 14,
      })
    })

    it('respeta un umbral personalizado', () => {
      expect(getBackupReminderState({
        hasData: true,
        lastBackupCreatedAt: '2026-05-20T18:00:00.000Z',
        now: NOW,
        thresholdDays: 10,
      })).toMatchObject({
        shouldShow: true,
        reason: BACKUP_REMINDER_REASONS.BACKUP_DUE,
        thresholdDays: 10,
      })
    })

    it('no repite el recordatorio si fue cerrado durante el mismo dia', () => {
      expect(getBackupReminderState({
        hasData: true,
        lastBackupCreatedAt: '2026-04-01T18:00:00.000Z',
        lastBackupReminderDismissedAt: '2026-06-03T08:00:00.000Z',
        now: NOW,
      })).toMatchObject({
        shouldShow: false,
        reason: BACKUP_REMINDER_REASONS.DISMISSED_TODAY,
        daysSinceLastBackup: null,
      })
    })

    it('vuelve a mostrar el recordatorio si fue cerrado otro dia', () => {
      expect(getBackupReminderState({
        hasData: true,
        lastBackupCreatedAt: '2026-04-01T18:00:00.000Z',
        lastBackupReminderDismissedAt: '2026-06-02T23:59:00.000Z',
        now: NOW,
      })).toMatchObject({
        shouldShow: true,
        reason: BACKUP_REMINDER_REASONS.BACKUP_DUE,
      })
    })
  })

  describe('createBackupTimestamp()', () => {
    it('normaliza una fecha valida a ISO', () => {
      expect(createBackupTimestamp(NOW)).toBe('2026-06-03T12:00:00.000Z')
    })

    it('lanza error si la fecha no es valida', () => {
      expect(() => createBackupTimestamp('fecha-rota')).toThrow('Fecha de backup invalida')
    })
  })
})
