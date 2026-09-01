import JSZip from 'jszip'

import { createZipContent } from '../../../../src/services/backup/BackupZipArchive.ts'

export const CANONICAL_BACKUP_FILES = Object.freeze([
  { path: 'manifest.json', content: '{"app":"Lumapse"}' },
  { path: 'data/subjects.json', content: '[]' },
  { path: 'data/notes.json', content: '[]' },
  { path: 'data/academic-events.json', content: '[]' },
])

export function currentBackupBytes(files = CANONICAL_BACKUP_FILES) {
  return new Uint8Array(createZipContent(files, {
    createdAt: new Date('2026-06-03T12:30:00.000Z'),
    type: 'arraybuffer',
  }))
}

export async function legacyBackupBytes(files = CANONICAL_BACKUP_FILES) {
  const zip = new JSZip()
  for (const file of files) zip.file(file.path, file.content)
  return zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
    streamFiles: false,
  })
}

function findSignature(bytes, signature, from = 0) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  for (let offset = from; offset <= bytes.byteLength - 4; offset += 1) {
    if (view.getUint32(offset, true) === signature) return offset
  }
  throw new Error(`ZIP signature ${signature.toString(16)} not found`)
}

export function endOfCentralDirectoryOffset(bytes) {
  return findSignature(bytes, 0x06054b50, Math.max(0, bytes.byteLength - 65_557))
}

export function centralRecord(bytes, expectedPath) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const eocdOffset = endOfCentralDirectoryOffset(bytes)
  const count = view.getUint16(eocdOffset + 10, true)
  let offset = view.getUint32(eocdOffset + 16, true)

  for (let index = 0; index < count; index += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) throw new Error('Invalid central directory')
    const nameLength = view.getUint16(offset + 28, true)
    const extraLength = view.getUint16(offset + 30, true)
    const commentLength = view.getUint16(offset + 32, true)
    const name = new TextDecoder().decode(bytes.subarray(offset + 46, offset + 46 + nameLength))

    if (name === expectedPath) {
      return {
        offset,
        localOffset: view.getUint32(offset + 42, true),
        nameLength,
      }
    }
    offset += 46 + nameLength + extraLength + commentLength
  }

  throw new Error(`ZIP entry ${expectedPath} not found`)
}

export function setUint16(bytes, offset, value) {
  new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).setUint16(offset, value, true)
}

export function setUint32(bytes, offset, value) {
  new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).setUint32(offset, value, true)
}

export function setEntryFlags(bytes, path, flags) {
  const record = centralRecord(bytes, path)
  setUint16(bytes, record.offset + 8, flags)
  setUint16(bytes, record.localOffset + 6, flags)
}

export function setEntryMethod(bytes, path, method) {
  const record = centralRecord(bytes, path)
  setUint16(bytes, record.offset + 10, method)
  setUint16(bytes, record.localOffset + 8, method)
}

export function setDeclaredEntrySize(bytes, path, size) {
  const record = centralRecord(bytes, path)
  setUint32(bytes, record.offset + 24, size)
  setUint32(bytes, record.localOffset + 22, size)
}

export function renameEntry(bytes, path, replacement) {
  const record = centralRecord(bytes, path)
  const encoded = new TextEncoder().encode(replacement)
  if (encoded.byteLength !== record.nameLength) throw new Error('Replacement path length differs')

  bytes.set(encoded, record.offset + 46)
  bytes.set(encoded, record.localOffset + 30)
}

export function bytesToBase64(bytes) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return globalThis.btoa(binary)
}
