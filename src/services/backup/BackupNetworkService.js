// =============================================================
// backup/BackupNetworkService
//
// Responsabilidad: traducir el estado de red del dispositivo en
// decisiones de producto para el backup externo manual.
// =============================================================

export const BACKUP_CONNECTION_TYPES = Object.freeze({
  WIFI: 'wifi',
  CELLULAR: 'cellular',
  NONE: 'none',
  UNKNOWN: 'unknown',
})

export const BACKUP_NETWORK_MESSAGES = Object.freeze({
  wifi: 'Con WiFi. Podes crear un backup externo.',
  cellular: 'Con datos moviles. Podes crear backup, pero puede consumir datos.',
  unknown: 'Hay conexion, pero no se pudo identificar el tipo de red.',
  offline: 'Sin conexion. Tus notas siguen disponibles. El backup en nube requiere conexion.',
})

function normalizeConnectionType(connectionType) {
  const value = String(connectionType || '').toLowerCase()
  const knownTypes = Object.values(BACKUP_CONNECTION_TYPES)

  return knownTypes.includes(value) ? value : BACKUP_CONNECTION_TYPES.UNKNOWN
}

/**
 * Traduce el estado reportado por Capacitor Network a una decision de UI.
 * @param {{connected?: boolean, connectionType?: string}} status Estado de red
 * @returns {{connected: boolean, connectionType: string, externalBackupAllowed: boolean, recommended: boolean, requiresWarning: boolean, message: string}}
 */
export function getBackupNetworkState(status = {}) {
  const connectionType = normalizeConnectionType(status.connectionType)
  const connected = status.connected === true && connectionType !== BACKUP_CONNECTION_TYPES.NONE

  if (!connected) {
    return {
      connected: false,
      connectionType: BACKUP_CONNECTION_TYPES.NONE,
      externalBackupAllowed: false,
      recommended: false,
      requiresWarning: false,
      message: BACKUP_NETWORK_MESSAGES.offline,
    }
  }

  if (connectionType === BACKUP_CONNECTION_TYPES.WIFI) {
    return {
      connected: true,
      connectionType,
      externalBackupAllowed: true,
      recommended: true,
      requiresWarning: false,
      message: BACKUP_NETWORK_MESSAGES.wifi,
    }
  }

  if (connectionType === BACKUP_CONNECTION_TYPES.CELLULAR) {
    return {
      connected: true,
      connectionType,
      externalBackupAllowed: true,
      recommended: false,
      requiresWarning: true,
      message: BACKUP_NETWORK_MESSAGES.cellular,
    }
  }

  return {
    connected: true,
    connectionType: BACKUP_CONNECTION_TYPES.UNKNOWN,
    externalBackupAllowed: true,
    recommended: false,
    requiresWarning: true,
    message: BACKUP_NETWORK_MESSAGES.unknown,
  }
}

/**
 * Permite enchufar un proveedor async de estado de red sin acoplar este modulo
 * a `@capacitor/network` hasta que se agregue la dependencia nativa.
 * @param {Function} readStatus Funcion que retorna `{ connected, connectionType }`
 * @returns {Promise<object>}
 */
export async function resolveBackupNetworkState(readStatus) {
  if (typeof readStatus !== 'function') {
    return getBackupNetworkState({ connected: false, connectionType: BACKUP_CONNECTION_TYPES.NONE })
  }

  const status = await readStatus()
  return getBackupNetworkState(status)
}
