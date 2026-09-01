import { BackupImportError, type BackupImportSource } from '../../domain/backupImport'
import type { BackupZipPolicy } from './BackupImportPolicy'

type BackupZipSource = BackupImportSource | Blob | ArrayBuffer | Uint8Array | string

function sourceContent(source: BackupZipSource): Blob | ArrayBuffer | Uint8Array | string {
  if (typeof source === 'object' && source !== null && 'content' in source) {
    return source.content
  }
  return source
}

function assertSourceSize(size: number, policy: BackupZipPolicy): void {
  if (size <= 0) {
    throw new BackupImportError('El archivo de backup esta vacio.')
  }
  if (size > policy.maxSourceBytes) {
    throw new BackupImportError('El archivo de backup supera el limite permitido.')
  }
}

function base64Payload(value: string): string {
  if (!value.startsWith('data:')) return value

  const separator = value.indexOf(',')
  const header = separator >= 0 ? value.slice(0, separator).toLowerCase() : ''
  if (separator < 0 || !header.endsWith(';base64')) {
    throw new BackupImportError('El contenido del backup no usa base64 valido.')
  }
  return value.slice(separator + 1)
}

function decodeBase64(value: string, policy: BackupZipPolicy): Uint8Array {
  const payload = base64Payload(value)
  const maximumEncodedLength = Math.ceil(policy.maxSourceBytes / 3) * 4
  if (!payload || payload.length > maximumEncodedLength || payload.length % 4 !== 0) {
    throw new BackupImportError('El contenido base64 del backup supera el limite o es invalido.')
  }
  if (!/^[A-Za-z0-9+/]*={0,2}$/u.test(payload) || payload.slice(0, -2).includes('=')) {
    throw new BackupImportError('El contenido del backup no usa base64 valido.')
  }

  try {
    const binary = globalThis.atob(payload)
    assertSourceSize(binary.length, policy)
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index)
    }
    return bytes
  } catch (error) {
    if (error instanceof BackupImportError) throw error
    throw new BackupImportError('El contenido del backup no usa base64 valido.')
  }
}

export async function normalizeBackupZipSource(
  source: BackupZipSource,
  policy: BackupZipPolicy,
): Promise<Uint8Array> {
  const content = sourceContent(source)

  if (typeof content === 'string') return decodeBase64(content, policy)
  if (content instanceof Uint8Array) {
    assertSourceSize(content.byteLength, policy)
    return Uint8Array.from(content)
  }
  if (content instanceof ArrayBuffer) {
    assertSourceSize(content.byteLength, policy)
    return new Uint8Array(content.slice(0))
  }
  if (typeof Blob !== 'undefined' && content instanceof Blob) {
    assertSourceSize(content.size, policy)
    return new Uint8Array(await content.arrayBuffer())
  }

  throw new BackupImportError('El contenido del backup usa un formato no soportado.')
}
