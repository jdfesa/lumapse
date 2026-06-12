// =============================================================
// backup/BackupService
//
// Responsabilidad: orquestar el backup actual de Lumapse reuniendo
// datos desde SQLite y generando el ZIP restaurable/legible.
// =============================================================

import {
  collectBackupData,
  countBackupItems,
  hasBackupData,
} from './BackupDataSource'
import { generateBackupZip } from './BackupZipService.js'
import type { CurrentBackupZip, GeneratedBackupZip, BackupZipOptions } from '../../domain/backup'

export const EMPTY_BACKUP_ERROR = 'Todavia no hay notas, materias ni fechas para respaldar.'

/**
 * Crea un backup ZIP con los datos actuales de Lumapse.
 * Esta funcion es la entrada que deberia usar la UI cuando exista el boton.
 * @param {object} options Opciones delegadas al generador ZIP
 * @returns {Promise<{content: Blob|ArrayBuffer|string, contentType: string, filename: string, manifest: object, counts: object}>}
 */
export async function createCurrentBackupZip(options: BackupZipOptions = {}): Promise<CurrentBackupZip> {
  const data = await collectBackupData()

  if (!hasBackupData(data)) {
    throw new Error(EMPTY_BACKUP_ERROR)
  }

  const result = await generateBackupZip(data, options) as GeneratedBackupZip

  return {
    ...result,
    counts: countBackupItems(data),
  }
}
