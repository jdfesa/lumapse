// =============================================================
// backup/BackupReminderService
//
// Responsabilidad: decidir si corresponde recordar al usuario que
// haga backup manual, sin iniciar subidas automaticas.
// =============================================================

export const BACKUP_REMINDER_DAYS = 30

export const BACKUP_REMINDER_REASONS = Object.freeze({
  NO_DATA: 'no-data',
  NEVER_BACKED_UP: 'never-backed-up',
  BACKUP_DUE: 'backup-due',
  RECENT_BACKUP: 'recent-backup',
  DISMISSED_TODAY: 'dismissed-today',
} as const)

export type BackupReminderReason =
  typeof BACKUP_REMINDER_REASONS[keyof typeof BACKUP_REMINDER_REASONS]

const DAY_MS = 24 * 60 * 60 * 1000

type BackupReminderDateInput = Date | string | null | undefined

export interface BackupReminderInput {
  hasData?: boolean
  lastBackupCreatedAt?: BackupReminderDateInput
  lastBackupReminderDismissedAt?: BackupReminderDateInput
  now?: BackupReminderDateInput
  thresholdDays?: number
}

export interface BackupReminderState {
  shouldShow: boolean
  reason: BackupReminderReason
  daysSinceLastBackup: number | null
  thresholdDays: number
}

function parseOptionalDate(value: BackupReminderDateInput): Date | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function daysSince(date: Date, now: Date): number {
  return Math.floor((startOfLocalDay(now).getTime() - startOfLocalDay(date).getTime()) / DAY_MS)
}

function wasDismissedToday(lastDismissedAt: BackupReminderDateInput, now: Date): boolean {
  const dismissedAt = parseOptionalDate(lastDismissedAt)
  if (!dismissedAt) return false

  return startOfLocalDay(dismissedAt).getTime() === startOfLocalDay(now).getTime()
}

/**
 * Calcula si debe mostrarse un recordatorio local de backup.
 * @param {object} input Datos para evaluar recordatorio
 * @param {boolean} input.hasData Indica si hay datos respaldables
 * @param {Date|string|null} input.lastBackupCreatedAt Ultimo backup creado
 * @param {Date|string|null} input.lastBackupReminderDismissedAt Ultima vez que se cerro el aviso
 * @param {Date|string} input.now Fecha actual
 * @param {number} input.thresholdDays Dias para considerar backup vencido
 * @returns {{shouldShow: boolean, reason: string, daysSinceLastBackup: number|null, thresholdDays: number}}
 */
export function getBackupReminderState(input: BackupReminderInput = {}): BackupReminderState {
  const now = parseOptionalDate(input.now) || new Date()
  const thresholdDays = input.thresholdDays || BACKUP_REMINDER_DAYS

  if (!input.hasData) {
    return {
      shouldShow: false,
      reason: BACKUP_REMINDER_REASONS.NO_DATA,
      daysSinceLastBackup: null,
      thresholdDays,
    }
  }

  if (wasDismissedToday(input.lastBackupReminderDismissedAt, now)) {
    return {
      shouldShow: false,
      reason: BACKUP_REMINDER_REASONS.DISMISSED_TODAY,
      daysSinceLastBackup: null,
      thresholdDays,
    }
  }

  const lastBackupCreatedAt = parseOptionalDate(input.lastBackupCreatedAt)

  if (!lastBackupCreatedAt) {
    return {
      shouldShow: true,
      reason: BACKUP_REMINDER_REASONS.NEVER_BACKED_UP,
      daysSinceLastBackup: null,
      thresholdDays,
    }
  }

  const elapsedDays = daysSince(lastBackupCreatedAt, now)
  const backupDue = elapsedDays >= thresholdDays

  return {
    shouldShow: backupDue,
    reason: backupDue
      ? BACKUP_REMINDER_REASONS.BACKUP_DUE
      : BACKUP_REMINDER_REASONS.RECENT_BACKUP,
    daysSinceLastBackup: elapsedDays,
    thresholdDays,
  }
}

export function createBackupTimestamp(date: BackupReminderDateInput = new Date()): string {
  const value = parseOptionalDate(date)
  if (!value) throw new Error('Fecha de backup invalida.')

  return value.toISOString()
}
