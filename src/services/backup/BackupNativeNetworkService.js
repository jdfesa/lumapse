// =============================================================
// backup/BackupNativeNetworkService
//
// Responsabilidad: adaptar @capacitor/network a la logica de
// producto definida en BackupNetworkService.
// =============================================================

import { Network } from '@capacitor/network'
import {
  getBackupNetworkState,
  resolveBackupNetworkState,
} from './BackupNetworkService.js'

export async function getCurrentBackupNetworkState() {
  return resolveBackupNetworkState(() => Network.getStatus())
}

export async function onBackupNetworkStateChange(listener) {
  if (typeof listener !== 'function') {
    throw new Error('Se requiere un listener para observar cambios de red.')
  }

  return Network.addListener('networkStatusChange', status => {
    listener(getBackupNetworkState(status))
  })
}
