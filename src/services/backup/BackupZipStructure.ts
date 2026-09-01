import { BackupImportError } from '../../domain/backupImport'

const EOCD_SIGNATURE = 0x06054b50
const MAX_EOCD_SEARCH_BYTES = 65_557
const ZIP32_SENTINEL_16 = 0xffff

export const CENTRAL_SIGNATURE = 0x02014b50
export const LOCAL_SIGNATURE = 0x04034b50
export const ZIP32_SENTINEL_32 = 0xffffffff

export interface EndOfCentralDirectory {
  offset: number
  centralOffset: number
  centralSize: number
  entryCount: number
}

function invalid(reason: string): never {
  throw new BackupImportError(`Backup invalido: ${reason}.`)
}

export function readUint16(view: DataView, offset: number): number {
  return view.getUint16(offset, true)
}

export function readUint32(view: DataView, offset: number): number {
  return view.getUint32(offset, true)
}

function findEndOfCentralDirectory(bytes: Uint8Array, view: DataView): number {
  const minimumOffset = Math.max(0, bytes.byteLength - MAX_EOCD_SEARCH_BYTES)
  for (let offset = bytes.byteLength - 22; offset >= minimumOffset; offset -= 1) {
    if (readUint32(view, offset) !== EOCD_SIGNATURE) continue
    const commentLength = readUint16(view, offset + 20)
    if (offset + 22 + commentLength === bytes.byteLength) return offset
  }
  return invalid('no se encontro un cierre ZIP32 valido')
}

export function readEndOfCentralDirectory(
  bytes: Uint8Array,
  view: DataView,
): EndOfCentralDirectory {
  if (bytes.byteLength < 22) return invalid('el archivo ZIP esta truncado')
  const offset = findEndOfCentralDirectory(bytes, view)
  const diskNumber = readUint16(view, offset + 4)
  const centralDisk = readUint16(view, offset + 6)
  const entriesOnDisk = readUint16(view, offset + 8)
  const entryCount = readUint16(view, offset + 10)
  const centralSize = readUint32(view, offset + 12)
  const centralOffset = readUint32(view, offset + 16)

  if (diskNumber !== 0 || centralDisk !== 0 || entriesOnDisk !== entryCount) {
    return invalid('los ZIP multidisk no estan soportados')
  }
  if (
    entryCount === ZIP32_SENTINEL_16 ||
    centralSize === ZIP32_SENTINEL_32 ||
    centralOffset === ZIP32_SENTINEL_32
  ) {
    return invalid('ZIP64 no esta soportado')
  }
  return { offset, centralOffset, centralSize, entryCount }
}
