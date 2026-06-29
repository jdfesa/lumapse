// =============================================================
// Servicio: ExportService
//
// Responsabilidad: conservar la fachada historica de exportacion
// web, delegando el contenido al contrato canonico de backup v1.
// =============================================================

import { createCurrentBackupZip } from './backup/BackupService'
import type { BackupZipOptions, CurrentBackupZip } from '../domain/backup'

type DownloadContent = Blob

interface BrowserDownloadDeps {
  document?: Document
  URL?: Pick<typeof URL, 'createObjectURL' | 'revokeObjectURL'>
  setTimeout?: typeof setTimeout
}

interface ExportAllNotesOptions {
  backupOptions?: Omit<BackupZipOptions, 'type'>
  download?: (content: Blob, filename: string) => void
}

export function triggerBrowserDownload(
  content: DownloadContent,
  filename: string,
  deps: BrowserDownloadDeps = {}
): void {
  const doc = deps.document || globalThis.document
  const urlApi = deps.URL || globalThis.URL

  if (!doc?.body || !urlApi?.createObjectURL) {
    throw new Error('La descarga web no esta disponible en este entorno.')
  }

  const url = urlApi.createObjectURL(content)
  const link = doc.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'

  doc.body.appendChild(link)
  link.click()

  const scheduleCleanup = deps.setTimeout || globalThis.setTimeout
  scheduleCleanup(() => {
    link.remove()
    urlApi.revokeObjectURL(url)
  }, 0)
}

/**
 * RF-017: Exportar datos de Lumapse como ZIP canonico.
 * Fachada de compatibilidad para codigo legado/web; la UI Android
 * usa el flujo manual con share sheet desde BackupFlowService.
 */
export async function exportAllNotesToZip(options: ExportAllNotesOptions = {}): Promise<CurrentBackupZip> {
  const backup = await createCurrentBackupZip({
    ...(options.backupOptions || {}),
    type: 'blob',
  })
  const download = options.download || triggerBrowserDownload

  if (!(backup.content instanceof Blob)) {
    throw new Error('La descarga web requiere un backup en formato Blob.')
  }

  download(backup.content, backup.filename)
  return backup
}
