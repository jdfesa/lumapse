// =============================================================
// backup/BackupStorageService
//
// Responsabilidad: persistir estado liviano del backup manual
// para recordatorios locales. No guarda datos de usuario.
// =============================================================

import { createBackupTimestamp } from './BackupReminderService.js'

export const BACKUP_STORAGE_KEYS = Object.freeze({
  LAST_BACKUP_CREATED_AT: 'lumapse-backup-last-created-at',
  LAST_BACKUP_REMINDER_DISMISSED_AT: 'lumapse-backup-reminder-dismissed-at',
})

function resolveStorage(storage) {
  if (storage) return storage

  try {
    return globalThis.localStorage || null
  } catch {
    return null
  }
}

function getItem(storage, key) {
  if (!storage) return null

  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

function setTimestamp(key, date, options = {}) {
  const value = createBackupTimestamp(date)
  const storage = resolveStorage(options.storage)
  if (!storage) return value

  storage.setItem(key, value)
  return value
}

export function getBackupReminderTimestamps(options = {}) {
  const storage = resolveStorage(options.storage)

  return {
    lastBackupCreatedAt: getItem(storage, BACKUP_STORAGE_KEYS.LAST_BACKUP_CREATED_AT),
    lastBackupReminderDismissedAt: getItem(storage, BACKUP_STORAGE_KEYS.LAST_BACKUP_REMINDER_DISMISSED_AT),
  }
}

export function setLastBackupCreatedAt(date = new Date(), options = {}) {
  return setTimestamp(BACKUP_STORAGE_KEYS.LAST_BACKUP_CREATED_AT, date, options)
}

export function setLastBackupReminderDismissedAt(date = new Date(), options = {}) {
  return setTimestamp(BACKUP_STORAGE_KEYS.LAST_BACKUP_REMINDER_DISMISSED_AT, date, options)
}
