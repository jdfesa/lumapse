// =============================================================
// backup/BackupShareService
//
// Responsabilidad: preparar un ZIP de backup en cache y abrir
// el selector nativo para compartir/guardar el archivo.
// =============================================================

import { registerPlugin } from '@capacitor/core'
import type { BackupZipContent } from '../../domain/backup'

export const BACKUP_SHARE_TITLE = 'Backup Lumapse'
export const BACKUP_SHARE_TEXT = 'Backup manual de Lumapse.'
export const BACKUP_SHARE_DIALOG_TITLE = 'Guardar backup de Lumapse'
export const BACKUP_CACHE_DIRECTORY = 'CACHE'

interface FilesystemPlugin {
  writeFile: (options: {
    path: string
    data: string
    directory: string
  }) => Promise<unknown>
  getUri: (options: {
    path: string
    directory: string
  }) => Promise<{ uri: string }>
}

interface SharePlugin {
  canShare: () => Promise<{ value: boolean }>
  share: (options: {
    title: string
    text: string
    files: string[]
    dialogTitle: string
  }) => Promise<Record<string, unknown>>
}

interface BufferValue {
  toString: (encoding: 'base64') => string
}

interface BufferConstructorLike {
  from: (input: string, encoding: 'binary') => BufferValue
}

type GlobalWithBuffer = typeof globalThis & {
  Buffer?: BufferConstructorLike
}

export type BackupShareContent = BackupZipContent | ArrayBufferView

export interface ShareableBackup {
  content: BackupShareContent
  filename: string
}

export interface BackupFileReference {
  filename: string
  path: string
  uri: string
}

export interface BackupShareOptions {
  title?: string
  text?: string
  dialogTitle?: string
}

export interface BackupSharePluginResult {
  cancelled?: boolean
  [key: string]: unknown
}

export interface SharedBackupFile extends BackupFileReference {
  shareResult: BackupSharePluginResult
}

const Filesystem = registerPlugin<FilesystemPlugin>('Filesystem')
const Share = registerPlugin<SharePlugin>('Share')

function encodeBinaryString(binary: string): string {
  if (typeof globalThis.btoa === 'function') {
    return globalThis.btoa(binary)
  }

  const BufferCtor = (globalThis as GlobalWithBuffer).Buffer
  if (BufferCtor) {
    return BufferCtor.from(binary, 'binary').toString('base64')
  }

  throw new Error('No se pudo codificar el backup en base64.')
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize)
    binary += String.fromCharCode(...chunk)
  }

  return encodeBinaryString(binary)
}

function isArrayBufferLike(content: unknown): content is ArrayBuffer {
  return Object.prototype.toString.call(content) === '[object ArrayBuffer]'
}

function isShareCancelledError(error: unknown): boolean {
  const details = typeof error === 'object' && error !== null
    ? error as { code?: unknown, message?: unknown }
    : null
  const value = `${details?.code || ''} ${details?.message || error || ''}`.toLowerCase()
  return value.includes('cancel') || value.includes('dismiss')
}

function copyViewToArrayBuffer(content: ArrayBufferView): ArrayBuffer {
  const source = new Uint8Array(content.buffer, content.byteOffset, content.byteLength)
  const copy = new Uint8Array(source.byteLength)
  copy.set(source)
  return copy.buffer
}

export async function backupContentToBase64(content: BackupShareContent): Promise<string>
export async function backupContentToBase64(content: unknown): Promise<string> {
  if (typeof content === 'string') {
    return content.includes(',') && content.startsWith('data:')
      ? content.slice(content.indexOf(',') + 1)
      : content
  }

  if (isArrayBufferLike(content)) {
    return arrayBufferToBase64(content)
  }

  if (ArrayBuffer.isView(content)) {
    return arrayBufferToBase64(copyViewToArrayBuffer(content))
  }

  if (typeof Blob !== 'undefined' && content instanceof Blob) {
    return arrayBufferToBase64(await content.arrayBuffer())
  }

  throw new Error('Contenido de backup no soportado para compartir.')
}

/**
 * Escribe el ZIP en cache de la app y devuelve una URI compartible.
 * @param {{content: Blob|ArrayBuffer|string, filename: string}} backup Backup generado
 * @returns {Promise<{filename: string, path: string, uri: string}>}
 */
export async function writeBackupToCache(
  backup?: Partial<ShareableBackup> | null,
): Promise<BackupFileReference> {
  if (!backup?.content || !backup?.filename) {
    throw new Error('Backup incompleto: falta contenido o nombre de archivo.')
  }

  const data = await backupContentToBase64(backup.content)
  const path = backup.filename

  await Filesystem.writeFile({
    path,
    data,
    directory: BACKUP_CACHE_DIRECTORY,
  })

  const result = await Filesystem.getUri({
    path,
    directory: BACKUP_CACHE_DIRECTORY,
  })

  return {
    filename: backup.filename,
    path,
    uri: result.uri,
  }
}

export async function shareBackupFile(
  fileRef?: Partial<BackupFileReference> | null,
  options: BackupShareOptions = {},
): Promise<BackupSharePluginResult> {
  if (!fileRef?.uri) {
    throw new Error('No hay archivo de backup preparado para compartir.')
  }

  const canShare = await Share.canShare()
  if (!canShare.value) {
    throw new Error('El dispositivo no permite compartir archivos desde Lumapse.')
  }

  try {
    return await Share.share({
      title: options.title || BACKUP_SHARE_TITLE,
      text: options.text || BACKUP_SHARE_TEXT,
      files: [fileRef.uri],
      dialogTitle: options.dialogTitle || BACKUP_SHARE_DIALOG_TITLE,
    })
  } catch (error) {
    if (isShareCancelledError(error)) {
      return { cancelled: true }
    }

    throw error
  }
}

export async function shareBackupZip(
  backup: ShareableBackup,
  options: BackupShareOptions = {},
): Promise<SharedBackupFile> {
  const fileRef = await writeBackupToCache(backup)
  const shareResult = await shareBackupFile(fileRef, options)

  return {
    ...fileRef,
    shareResult,
  }
}
