// =============================================================
// backup/BackupStorageService
//
// Responsabilidad: persistir estado liviano del backup manual
// para recordatorios locales. No guarda datos de usuario.
// =============================================================

import { createBackupTimestamp } from './BackupReminderService'

export const BACKUP_STORAGE_KEYS = Object.freeze({
  LAST_BACKUP_CREATED_AT: 'lumapse-backup-last-created-at',
  LAST_BACKUP_REMINDER_DISMISSED_AT: 'lumapse-backup-reminder-dismissed-at',
} as const)

type BackupStorageKey = typeof BACKUP_STORAGE_KEYS[keyof typeof BACKUP_STORAGE_KEYS]
type BackupTimestampInput = Parameters<typeof createBackupTimestamp>[0]

interface BackupTimestampStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface BackupStorageOptions {
  storage?: BackupTimestampStorage | null
}

export interface BackupReminderTimestamps {
  lastBackupCreatedAt: string | null
  lastBackupReminderDismissedAt: string | null
}

function resolveStorage(storage?: BackupTimestampStorage | null): BackupTimestampStorage | null {
  if (storage) return storage

  try {
    return globalThis.localStorage || null
  } catch {
    return null
  }
}

function getItem(storage: BackupTimestampStorage | null, key: BackupStorageKey): string | null {
  if (!storage) return null

  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

function setTimestamp(
  key: BackupStorageKey,
  date: BackupTimestampInput,
  options: BackupStorageOptions = {}
): string {
  const value = createBackupTimestamp(date)
  const storage = resolveStorage(options.storage)
  if (!storage) return value

  storage.setItem(key, value)
  return value
}

export function getBackupReminderTimestamps(options: BackupStorageOptions = {}): BackupReminderTimestamps {
  const storage = resolveStorage(options.storage)

  return {
    lastBackupCreatedAt: getItem(storage, BACKUP_STORAGE_KEYS.LAST_BACKUP_CREATED_AT),
    lastBackupReminderDismissedAt: getItem(storage, BACKUP_STORAGE_KEYS.LAST_BACKUP_REMINDER_DISMISSED_AT),
  }
}

export function setLastBackupCreatedAt(
  date: BackupTimestampInput = new Date(),
  options: BackupStorageOptions = {}
): string {
  return setTimestamp(BACKUP_STORAGE_KEYS.LAST_BACKUP_CREATED_AT, date, options)
}

export function setLastBackupReminderDismissedAt(
  date: BackupTimestampInput = new Date(),
  options: BackupStorageOptions = {}
): string {
  return setTimestamp(BACKUP_STORAGE_KEYS.LAST_BACKUP_REMINDER_DISMISSED_AT, date, options)
}
