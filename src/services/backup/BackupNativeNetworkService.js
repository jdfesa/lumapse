// =============================================================
// backup/BackupNativeNetworkService
//
// Responsabilidad: adaptar el plugin nativo Network de Capacitor
// a la logica de producto definida en BackupNetworkService.
// =============================================================

import { registerPlugin } from '@capacitor/core'
import {
  getBackupNetworkState,
  resolveBackupNetworkState,
} from './BackupNetworkService.ts'

const Network = registerPlugin('Network')

function getWebConnectionType() {
  const connection = globalThis.navigator?.connection ||
    globalThis.navigator?.mozConnection ||
    globalThis.navigator?.webkitConnection
  const type = connection?.type

  if (['bluetooth', 'cellular'].includes(type)) return 'cellular'
  if (['ethernet', 'wifi', 'wimax'].includes(type)) return 'wifi'
  if (type === 'none') return 'none'

  return 'unknown'
}

async function readNetworkStatus() {
  try {
    return await Network.getStatus()
  } catch {
    const connected = globalThis.navigator?.onLine !== false
    return {
      connected,
      connectionType: connected ? getWebConnectionType() : 'none',
    }
  }
}

export async function getCurrentBackupNetworkState() {
  return resolveBackupNetworkState(readNetworkStatus)
}

export async function onBackupNetworkStateChange(listener) {
  if (typeof listener !== 'function') {
    throw new Error('Se requiere un listener para observar cambios de red.')
  }

  try {
    return await Network.addListener('networkStatusChange', status => {
      listener(getBackupNetworkState(status))
    })
  } catch {
    const notifyOnline = () => listener(getBackupNetworkState({
      connected: true,
      connectionType: getWebConnectionType(),
    }))
    const notifyOffline = () => listener(getBackupNetworkState({
      connected: false,
      connectionType: 'none',
    }))

    globalThis.window?.addEventListener('online', notifyOnline)
    globalThis.window?.addEventListener('offline', notifyOffline)

    return {
      remove: async () => {
        globalThis.window?.removeEventListener('online', notifyOnline)
        globalThis.window?.removeEventListener('offline', notifyOffline)
      },
    }
  }
}
