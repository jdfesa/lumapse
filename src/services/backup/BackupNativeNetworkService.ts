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
  type BackupConnectionType,
  type BackupNetworkState,
} from './BackupNetworkService'

interface NetworkStatus {
  connected: boolean
  connectionType?: string | null
}

interface PluginListenerHandle {
  remove: () => Promise<void>
}

interface NetworkPlugin {
  getStatus: () => Promise<NetworkStatus>
  addListener: (
    eventName: 'networkStatusChange',
    listener: (status: NetworkStatus) => void,
  ) => Promise<PluginListenerHandle>
}

interface BrowserConnection {
  type?: string | null
}

type NavigatorWithConnection = Navigator & {
  connection?: BrowserConnection
  mozConnection?: BrowserConnection
  webkitConnection?: BrowserConnection
}

export type BackupNetworkStateListener = (state: BackupNetworkState) => void

const Network = registerPlugin<NetworkPlugin>('Network')

function getWebConnectionType(): BackupConnectionType {
  const navigator = globalThis.navigator as NavigatorWithConnection | undefined
  const connection = navigator?.connection ||
    navigator?.mozConnection ||
    navigator?.webkitConnection
  const type = connection?.type

  if (type && ['bluetooth', 'cellular'].includes(type)) return 'cellular'
  if (type && ['ethernet', 'wifi', 'wimax'].includes(type)) return 'wifi'
  if (type === 'none') return 'none'

  return 'unknown'
}

async function readNetworkStatus(): Promise<NetworkStatus> {
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

export async function getCurrentBackupNetworkState(): Promise<BackupNetworkState> {
  return resolveBackupNetworkState(readNetworkStatus)
}

export async function onBackupNetworkStateChange(
  listener: BackupNetworkStateListener,
): Promise<PluginListenerHandle> {
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
