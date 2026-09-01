import { BackupImportError, type BackupImportSource } from '../../domain/backupImport'
import {
  BACKUP_IMPORT_ZIP_POLICY,
  BACKUP_JSON_PATHS,
  getBackupZipEntryLimit,
  type BackupZipPolicy,
} from './BackupImportPolicy'
import { normalizeBackupZipSource } from './BackupZipSource'
import {
  CENTRAL_SIGNATURE,
  LOCAL_SIGNATURE,
  readEndOfCentralDirectory,
  readUint16,
  readUint32,
  ZIP32_SENTINEL_32,
  type EndOfCentralDirectory,
} from './BackupZipStructure'

const UTF8_FLAG = 0x0800
const ALLOWED_FLAGS = UTF8_FLAG
const ZIP_VERSION_20 = 20

export const ZIP_METHOD_STORE = 0 as const
export const ZIP_METHOD_DEFLATE = 8 as const
export type SupportedZipMethod = typeof ZIP_METHOD_STORE | typeof ZIP_METHOD_DEFLATE

export interface BackupZipEntry {
  path: string
  method: SupportedZipMethod
  crc32: number
  compressedSize: number
  declaredUncompressedSize: number
  dataOffset: number
  maxOutputBytes: number
  directory: boolean
}

export interface PreflightedBackupZip {
  bytes: Uint8Array
  entries: readonly BackupZipEntry[]
}

interface EntryRange {
  start: number
  end: number
  path: string
}

interface CentralDirectoryRecord {
  version: number
  flags: number
  rawMethod: number
  crc32: number
  compressedSize: number
  declaredUncompressedSize: number
  nameLength: number
  diskStart: number
  localOffset: number
  entryEnd: number
}

function invalid(reason: string): never {
  throw new BackupImportError(`Backup invalido: ${reason}.`)
}

function decodeEntryPath(nameBytes: Uint8Array, flags: number): string {
  if (flags & UTF8_FLAG) {
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(nameBytes)
    } catch {
      return invalid('una ruta ZIP no contiene UTF-8 valido')
    }
  }
  if (nameBytes.some(byte => byte > 0x7f)) {
    return invalid('una ruta ZIP no ASCII no declara UTF-8')
  }
  return String.fromCharCode(...nameBytes)
}

function validateEntryPath(path: string, directory: boolean): void {
  if (!path || path.includes('\\') || path.startsWith('/') || /^[A-Za-z]:/u.test(path)) {
    return invalid('una entrada contiene una ruta insegura')
  }
  if ([...path].some(character => {
    const codePoint = character.codePointAt(0) || 0
    return codePoint < 0x20 || codePoint === 0x7f
  })) {
    return invalid('una entrada contiene caracteres de control en la ruta')
  }

  const comparablePath = directory ? path.slice(0, -1) : path
  const segments = comparablePath.split('/')
  if (!comparablePath || segments.some(segment => !segment || segment === '.' || segment === '..')) {
    return invalid('una entrada contiene una ruta ambigua')
  }
}

function validateLocalHeader(
  bytes: Uint8Array,
  view: DataView,
  centralOffset: number,
  centralName: Uint8Array,
  centralFlags: number,
  entry: Omit<BackupZipEntry, 'dataOffset'>,
  localOffset: number,
): { dataOffset: number, range: EntryRange } {
  if (localOffset + 30 > centralOffset || readUint32(view, localOffset) !== LOCAL_SIGNATURE) {
    return invalid('una entrada no tiene un header local valido')
  }

  const version = readUint16(view, localOffset + 4)
  const flags = readUint16(view, localOffset + 6)
  const method = readUint16(view, localOffset + 8)
  const crc = readUint32(view, localOffset + 14)
  const compressedSize = readUint32(view, localOffset + 18)
  const uncompressedSize = readUint32(view, localOffset + 22)
  const nameLength = readUint16(view, localOffset + 26)
  const extraLength = readUint16(view, localOffset + 28)
  const nameStart = localOffset + 30
  const dataOffset = nameStart + nameLength + extraLength
  const dataEnd = dataOffset + entry.compressedSize

  if (
    version > ZIP_VERSION_20 ||
    flags !== centralFlags ||
    method !== entry.method ||
    crc !== entry.crc32 ||
    compressedSize !== entry.compressedSize ||
    uncompressedSize !== entry.declaredUncompressedSize ||
    nameLength !== centralName.byteLength ||
    dataOffset > centralOffset ||
    dataEnd > centralOffset
  ) {
    return invalid('el header local no coincide con el directorio central')
  }

  const localName = bytes.subarray(nameStart, nameStart + nameLength)
  if (localName.some((byte, index) => byte !== centralName[index])) {
    return invalid('la ruta local no coincide con el directorio central')
  }

  return {
    dataOffset,
    range: { start: localOffset, end: dataEnd, path: entry.path },
  }
}

function validateMethod(method: number, directory: boolean): SupportedZipMethod {
  if (method !== ZIP_METHOD_STORE && method !== ZIP_METHOD_DEFLATE) {
    return invalid('una entrada usa un metodo de compresion no soportado')
  }
  if (directory && method !== ZIP_METHOD_STORE) {
    return invalid('una carpeta ZIP no usa el metodo STORE')
  }
  return method
}

function validateRanges(ranges: EntryRange[]): void {
  const sorted = [...ranges].sort((left, right) => left.start - right.start)
  for (let index = 1; index < sorted.length; index += 1) {
    if (sorted[index].start < sorted[index - 1].end) {
      return invalid('dos entradas ZIP comparten bytes locales')
    }
  }
}

function validateRequiredEntries(entries: BackupZipEntry[]): void {
  const paths = new Set(entries.map(entry => entry.path))
  for (const requiredPath of BACKUP_JSON_PATHS) {
    if (!paths.has(requiredPath)) return invalid(`falta ${requiredPath}`)
  }
}

function readCentralDirectoryRecord(
  view: DataView,
  offset: number,
  centralEnd: number,
): CentralDirectoryRecord {
  if (offset + 46 > centralEnd || readUint32(view, offset) !== CENTRAL_SIGNATURE) {
    return invalid('el directorio central esta truncado')
  }

  const nameLength = readUint16(view, offset + 28)
  const extraLength = readUint16(view, offset + 30)
  const commentLength = readUint16(view, offset + 32)
  return {
    version: readUint16(view, offset + 6),
    flags: readUint16(view, offset + 8),
    rawMethod: readUint16(view, offset + 10),
    crc32: readUint32(view, offset + 16),
    compressedSize: readUint32(view, offset + 20),
    declaredUncompressedSize: readUint32(view, offset + 24),
    nameLength,
    diskStart: readUint16(view, offset + 34),
    localOffset: readUint32(view, offset + 42),
    entryEnd: offset + 46 + nameLength + extraLength + commentLength,
  }
}

function validateCentralDirectoryRecord(
  record: CentralDirectoryRecord,
  centralEnd: number,
  policy: BackupZipPolicy,
): void {
  if (record.version > ZIP_VERSION_20 || record.flags & ~ALLOWED_FLAGS) {
    return invalid('una entrada usa flags o version ZIP no soportados')
  }
  if (record.diskStart !== 0 || record.localOffset === ZIP32_SENTINEL_32) {
    return invalid('una entrada requiere multidisk o ZIP64')
  }
  if (!record.nameLength || record.nameLength > policy.maxPathBytes || record.entryEnd > centralEnd) {
    return invalid('una entrada tiene metadata o ruta fuera de limite')
  }
}

function validateEntrySizes(
  method: SupportedZipMethod,
  directory: boolean,
  compressedSize: number,
  declaredUncompressedSize: number,
  maxOutputBytes: number,
): void {
  if (declaredUncompressedSize > maxOutputBytes) {
    return invalid('una entrada supera el limite descomprimido declarado')
  }
  if (method === ZIP_METHOD_STORE && compressedSize !== declaredUncompressedSize) {
    return invalid('una entrada STORE declara tamanos incompatibles')
  }
  if (directory && (compressedSize !== 0 || declaredUncompressedSize !== 0)) {
    return invalid('una carpeta ZIP contiene datos inesperados')
  }
}

function parseEntries(
  bytes: Uint8Array,
  view: DataView,
  eocd: EndOfCentralDirectory,
  policy: BackupZipPolicy,
): BackupZipEntry[] {
  const entries: BackupZipEntry[] = []
  const ranges: EntryRange[] = []
  const paths = new Set<string>()
  const centralEnd = eocd.centralOffset + eocd.centralSize
  let offset = eocd.centralOffset
  let declaredTotal = 0

  for (let index = 0; index < eocd.entryCount; index += 1) {
    const record = readCentralDirectoryRecord(view, offset, centralEnd)
    validateCentralDirectoryRecord(record, centralEnd, policy)

    const centralName = bytes.subarray(offset + 46, offset + 46 + record.nameLength)
    const path = decodeEntryPath(centralName, record.flags)
    const directory = path.endsWith('/')
    validateEntryPath(path, directory)
    if (paths.has(path)) return invalid('el ZIP contiene rutas duplicadas')
    paths.add(path)

    const maxOutputBytes = getBackupZipEntryLimit(path, policy)
    if (maxOutputBytes === null) return invalid('el ZIP contiene una entrada no soportada')
    const method = validateMethod(record.rawMethod, directory)
    validateEntrySizes(
      method,
      directory,
      record.compressedSize,
      record.declaredUncompressedSize,
      maxOutputBytes,
    )

    const withoutOffset = {
      path,
      method,
      crc32: record.crc32,
      compressedSize: record.compressedSize,
      declaredUncompressedSize: record.declaredUncompressedSize,
      maxOutputBytes,
      directory,
    }
    const local = validateLocalHeader(
      bytes,
      view,
      eocd.centralOffset,
      centralName,
      record.flags,
      withoutOffset,
      record.localOffset,
    )
    entries.push(Object.freeze({ ...withoutOffset, dataOffset: local.dataOffset }))
    ranges.push(local.range)
    declaredTotal += record.declaredUncompressedSize
    if (declaredTotal > policy.maxDeclaredUncompressedBytes) {
      return invalid('el contenido descomprimido declarado supera el limite total')
    }

    offset = record.entryEnd
  }

  if (offset !== centralEnd) return invalid('el directorio central contiene bytes inesperados')
  validateRanges(ranges)
  validateRequiredEntries(entries)
  return entries
}

export async function preflightBackupZip(
  source: BackupImportSource | Blob | ArrayBuffer | Uint8Array | string,
  policy: BackupZipPolicy = BACKUP_IMPORT_ZIP_POLICY,
): Promise<PreflightedBackupZip> {
  const bytes = await normalizeBackupZipSource(source, policy)
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const eocd = readEndOfCentralDirectory(bytes, view)

  if (!eocd.entryCount || eocd.entryCount > policy.maxEntries) {
    return invalid('la cantidad de entradas ZIP esta fuera de limite')
  }
  if (!eocd.centralSize || eocd.centralSize > policy.maxCentralDirectoryBytes) {
    return invalid('el directorio central supera el limite permitido')
  }
  if (eocd.centralOffset + eocd.centralSize !== eocd.offset) {
    return invalid('el directorio central tiene offsets inconsistentes')
  }

  return Object.freeze({
    bytes,
    entries: Object.freeze(parseEntries(bytes, view, eocd, policy)),
  })
}
