// =============================================================
// backup/BackupShareService
//
// Responsabilidad: preparar un ZIP de backup en cache y abrir
// el selector nativo para compartir/guardar el archivo.
// =============================================================

import { registerPlugin } from '@capacitor/core'

export const BACKUP_SHARE_TITLE = 'Backup Lumapse'
export const BACKUP_SHARE_TEXT = 'Backup manual de Lumapse.'
export const BACKUP_SHARE_DIALOG_TITLE = 'Guardar backup de Lumapse'
export const BACKUP_CACHE_DIRECTORY = 'CACHE'

const Filesystem = registerPlugin('Filesystem')
const Share = registerPlugin('Share')

function encodeBinaryString(binary) {
  if (typeof globalThis.btoa === 'function') {
    return globalThis.btoa(binary)
  }

  const BufferCtor = globalThis.Buffer
  if (BufferCtor) {
    return BufferCtor.from(binary, 'binary').toString('base64')
  }

  throw new Error('No se pudo codificar el backup en base64.')
}

export function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize)
    binary += String.fromCharCode(...chunk)
  }

  return encodeBinaryString(binary)
}

function isArrayBufferLike(content) {
  return Object.prototype.toString.call(content) === '[object ArrayBuffer]'
}

function isShareCancelledError(error) {
  const value = `${error?.code || ''} ${error?.message || error || ''}`.toLowerCase()
  return value.includes('cancel') || value.includes('dismiss')
}

export async function backupContentToBase64(content) {
  if (typeof content === 'string') {
    return content.includes(',') && content.startsWith('data:')
      ? content.slice(content.indexOf(',') + 1)
      : content
  }

  if (isArrayBufferLike(content)) {
    return arrayBufferToBase64(content)
  }

  if (ArrayBuffer.isView(content)) {
    return arrayBufferToBase64(content.buffer.slice(
      content.byteOffset,
      content.byteOffset + content.byteLength
    ))
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
export async function writeBackupToCache(backup) {
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

export async function shareBackupFile(fileRef, options = {}) {
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

export async function shareBackupZip(backup, options = {}) {
  const fileRef = await writeBackupToCache(backup)
  const shareResult = await shareBackupFile(fileRef, options)

  return {
    ...fileRef,
    shareResult,
  }
}
