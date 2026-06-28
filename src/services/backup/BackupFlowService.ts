// =============================================================
// backup/BackupFlowService
//
// Responsabilidad: orquestar el flujo manual de backup externo:
// conectividad -> ZIP actual -> cache -> share sheet.
// =============================================================

import { getCurrentBackupNetworkState } from './BackupNativeNetworkService.js'
import { collectBackupData, hasBackupData } from './BackupDataSource'
import { getBackupReminderState, type BackupReminderState } from './BackupReminderService'
import { createCurrentBackupZip } from './BackupService'
import { shareBackupZip } from './BackupShareService.js'
import {
  getBackupReminderTimestamps,
  setLastBackupCreatedAt,
  setLastBackupReminderDismissedAt,
  type BackupReminderTimestamps,
  type BackupStorageOptions,
} from './BackupStorageService'
import type { BackupData, CurrentBackupZip } from '../../domain/backup'
import type { BackupNetworkState } from './BackupNetworkService'

export const BACKUP_FLOW_STATUS = Object.freeze({
  READY: 'ready',
  BLOCKED_OFFLINE: 'blocked-offline',
  REQUIRES_WARNING: 'requires-warning',
  CANCELLED: 'cancelled',
  SHARED: 'shared',
} as const)

export type BackupFlowStatus =
  typeof BACKUP_FLOW_STATUS[keyof typeof BACKUP_FLOW_STATUS]

export interface BackupReadiness {
  status:
    | typeof BACKUP_FLOW_STATUS.READY
    | typeof BACKUP_FLOW_STATUS.BLOCKED_OFFLINE
    | typeof BACKUP_FLOW_STATUS.REQUIRES_WARNING
  ready: boolean
  networkState: BackupNetworkState
  message: string
}

interface BackupShareResult {
  cancelled?: boolean
  shareResult?: {
    cancelled?: boolean
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface SharedBackupResult {
  status: typeof BACKUP_FLOW_STATUS.SHARED
  ready: true
  networkState: BackupNetworkState
  message: string
  backup: CurrentBackupZip
  lastBackupCreatedAt: string | null
  share: BackupShareResult
}

interface CancelledBackupResult {
  status: typeof BACKUP_FLOW_STATUS.CANCELLED
  ready: true
  networkState: BackupNetworkState
  message: string
  backup: CurrentBackupZip
  share: BackupShareResult
}

export type BackupFlowResult = BackupReadiness | SharedBackupResult | CancelledBackupResult

type ReadNetworkState = () => Promise<BackupNetworkState> | BackupNetworkState
type CollectBackupData = () => Promise<BackupData> | BackupData
type ReadBackupTimestamps = (options?: BackupStorageOptions) => BackupReminderTimestamps
type PersistBackupTimestamp = (
  date?: Date | string | null | undefined,
  options?: BackupStorageOptions
) => string
type CreateBackup = (options?: Record<string, unknown>) => Promise<CurrentBackupZip> | CurrentBackupZip
type ShareBackup = (
  backup: CurrentBackupZip,
  options?: Record<string, unknown>
) => Promise<BackupShareResult> | BackupShareResult

export interface BackupReadinessDeps {
  readNetworkState?: ReadNetworkState
}

export interface CurrentBackupReminderOptions extends BackupStorageOptions {
  collectData?: CollectBackupData
  readTimestamps?: ReadBackupTimestamps
  now?: Date | string | null
  thresholdDays?: number
}

export interface DismissBackupReminderOptions extends BackupStorageOptions {
  persistDismissedAt?: PersistBackupTimestamp
  now?: Date | string | null
}

export interface CreateAndShareBackupOptions extends BackupStorageOptions {
  acceptNetworkWarning?: boolean
  backupOptions?: Record<string, unknown>
  shareOptions?: Record<string, unknown>
  readNetworkState?: ReadNetworkState
  createBackup?: CreateBackup
  shareBackup?: ShareBackup
  persistBackupCreatedAt?: PersistBackupTimestamp
}

function readinessFromNetwork(networkState: BackupNetworkState): BackupReadiness {
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
export async function getExternalBackupReadiness(
  deps: BackupReadinessDeps = {}
): Promise<BackupReadiness> {
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
export async function getCurrentBackupReminder(
  options: CurrentBackupReminderOptions = {}
): Promise<BackupReminderState> {
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

export function dismissCurrentBackupReminder(
  options: DismissBackupReminderOptions = {}
): string {
  const persistDismissedAt = options.persistDismissedAt || setLastBackupReminderDismissedAt
  return persistDismissedAt(options.now || new Date(), { storage: options.storage })
}

function persistBackupCreatedAt(
  persistBackupAt: PersistBackupTimestamp,
  backup: CurrentBackupZip,
  options: BackupStorageOptions = {}
): string | null {
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

function shareWasCancelled(share: BackupShareResult): boolean {
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
export async function createAndShareCurrentBackup(
  options: CreateAndShareBackupOptions = {}
): Promise<BackupFlowResult> {
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
