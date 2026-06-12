// =============================================================
// backup/BackupFlowService
//
// Responsabilidad: orquestar el flujo manual de backup externo:
// conectividad -> ZIP actual -> cache -> share sheet.
// =============================================================

import { getCurrentBackupNetworkState } from './BackupNativeNetworkService.js'
import { collectBackupData, hasBackupData } from './BackupDataSource.ts'
import { getBackupReminderState } from './BackupReminderService.ts'
import { createCurrentBackupZip } from './BackupService.ts'
import { shareBackupZip } from './BackupShareService.js'
import {
  getBackupReminderTimestamps,
  setLastBackupCreatedAt,
  setLastBackupReminderDismissedAt,
} from './BackupStorageService.js'

export const BACKUP_FLOW_STATUS = Object.freeze({
  READY: 'ready',
  BLOCKED_OFFLINE: 'blocked-offline',
  REQUIRES_WARNING: 'requires-warning',
  CANCELLED: 'cancelled',
  SHARED: 'shared',
})

function readinessFromNetwork(networkState) {
  if (!networkState.externalBackupAllowed) {
    return {
      status: BACKUP_FLOW_STATUS.BLOCKED_OFFLINE,
      ready: false,
      networkState,
      message: networkState.message,
    }
  }

  if (networkState.requiresWarning) {
    return {
      status: BACKUP_FLOW_STATUS.REQUIRES_WARNING,
      ready: false,
      networkState,
      message: networkState.message,
    }
  }

  return {
    status: BACKUP_FLOW_STATUS.READY,
    ready: true,
    networkState,
    message: networkState.message,
  }
}

/**
 * Consulta si el backup externo puede iniciarse sin advertencias.
 * @param {object} deps Dependencias inyectables para tests/UI
 * @param {Function} deps.readNetworkState Lector de estado de red ya traducido
 * @returns {Promise<{status: string, ready: boolean, networkState: object, message: string}>}
 */
export async function getExternalBackupReadiness(deps = {}) {
  const readNetworkState = deps.readNetworkState || getCurrentBackupNetworkState
  const networkState = await readNetworkState()

  return readinessFromNetwork(networkState)
}

/**
 * Calcula el recordatorio local de backup con datos reales y timestamps persistidos.
 * @param {object} options Dependencias/opciones inyectables
 * @param {Function} options.collectData Lector de datos respaldables
 * @param {Function} options.readTimestamps Lector de timestamps persistidos
 * @returns {Promise<{shouldShow: boolean, reason: string, daysSinceLastBackup: number|null, thresholdDays: number}>}
 */
export async function getCurrentBackupReminder(options = {}) {
  const collectData = options.collectData || collectBackupData
  const readTimestamps = options.readTimestamps || getBackupReminderTimestamps
  const data = await collectData()
  const timestamps = readTimestamps({ storage: options.storage })

  return getBackupReminderState({
    hasData: hasBackupData(data),
    lastBackupCreatedAt: timestamps.lastBackupCreatedAt,
    lastBackupReminderDismissedAt: timestamps.lastBackupReminderDismissedAt,
    now: options.now,
    thresholdDays: options.thresholdDays,
  })
}

export function dismissCurrentBackupReminder(options = {}) {
  const persistDismissedAt = options.persistDismissedAt || setLastBackupReminderDismissedAt
  return persistDismissedAt(options.now || new Date(), { storage: options.storage })
}

function persistBackupCreatedAt(persistBackupAt, backup, options = {}) {
  const createdAt = backup?.manifest?.createdAt || new Date()

  try {
    if ('storage' in options) {
      return persistBackupAt(createdAt, { storage: options.storage })
    }

    return persistBackupAt(createdAt)
  } catch (error) {
    console.warn('No se pudo guardar la fecha del ultimo backup:', error)
    return null
  }
}

function shareWasCancelled(share) {
  return share?.cancelled === true || share?.shareResult?.cancelled === true
}

/**
 * Crea el backup actual y abre el share sheet si la red lo permite.
 * No avanza en datos moviles/red desconocida salvo confirmacion explicita.
 * @param {object} options Opciones del flujo
 * @param {boolean} options.acceptNetworkWarning Permite continuar si la red requiere advertencia
 * @param {object} options.backupOptions Opciones para el generador ZIP
 * @param {object} options.shareOptions Opciones para el share sheet
 * @param {Function} options.readNetworkState Dependencia inyectable
 * @param {Function} options.createBackup Dependencia inyectable
 * @param {Function} options.shareBackup Dependencia inyectable
 * @returns {Promise<object>}
 */
export async function createAndShareCurrentBackup(options = {}) {
  const readNetworkState = options.readNetworkState || getCurrentBackupNetworkState
  const createBackup = options.createBackup || createCurrentBackupZip
  const shareBackup = options.shareBackup || shareBackupZip
  const persistBackupAt = options.persistBackupCreatedAt || setLastBackupCreatedAt
  const networkState = await readNetworkState()
  const readiness = readinessFromNetwork(networkState)

  if (readiness.status === BACKUP_FLOW_STATUS.BLOCKED_OFFLINE) {
    return readiness
  }

  if (readiness.status === BACKUP_FLOW_STATUS.REQUIRES_WARNING && !options.acceptNetworkWarning) {
    return readiness
  }

  const backup = await createBackup({
    type: 'arraybuffer',
    ...(options.backupOptions || {}),
  })
  const share = await shareBackup(backup, options.shareOptions || {})

  if (shareWasCancelled(share)) {
    return {
      status: BACKUP_FLOW_STATUS.CANCELLED,
      ready: true,
      networkState,
      message: 'El selector se cerro sin elegir un destino para el backup.',
      backup,
      share,
    }
  }

  const lastBackupCreatedAt = persistBackupCreatedAt(persistBackupAt, backup, options)

  return {
    status: BACKUP_FLOW_STATUS.SHARED,
    ready: true,
    networkState,
    message: networkState.message,
    backup,
    lastBackupCreatedAt,
    share,
  }
}
