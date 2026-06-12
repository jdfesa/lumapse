// =============================================================
// backup/BackupZipArchive
//
// Responsabilidad: escribir un ZIP minimo, sin compresion, para
// archivos de texto del backup. Evita cargar dependencias pesadas.
// =============================================================

const ZIP_UTF8_FLAG = 0x0800
const ZIP_STORE_METHOD = 0
const ZIP_VERSION = 20
const CRC32_TABLE = createCrc32Table()
const encoder = new globalThis.TextEncoder()

export interface ZipArchiveFile {
  path: string
  content: string | Uint8Array
}

export interface ZipArchiveOptions {
  createdAt?: Date | string | number
  type?: 'arraybuffer' | 'base64' | 'blob' | string
  mimeType?: string
}

export type ZipArchiveContent = Blob | ArrayBuffer | string

interface DosDateParts {
  time: number
  date: number
}

function createCrc32Table(): Uint32Array {
  const table = new Uint32Array(256)

  for (let index = 0; index < 256; index += 1) {
    let value = index
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1
        ? 0xedb88320 ^ (value >>> 1)
        : value >>> 1
    }
    table[index] = value >>> 0
  }

  return table
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff

  for (const byte of bytes) {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }

  return (crc ^ 0xffffffff) >>> 0
}

function dateToDosParts(value: Date | string | number): DosDateParts {
  const date = value instanceof Date ? value : new Date(value)
  const year = Math.max(1980, date.getFullYear())

  return {
    time: (
      (date.getHours() << 11) |
      (date.getMinutes() << 5) |
      Math.floor(date.getSeconds() / 2)
    ) & 0xffff,
    date: (
      ((year - 1980) << 9) |
      ((date.getMonth() + 1) << 5) |
      date.getDate()
    ) & 0xffff,
  }
}

function uint16(value: number): number[] {
  return [value & 0xff, (value >>> 8) & 0xff]
}

function uint32(value: number): number[] {
  return [
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  ]
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0)
  const output = new Uint8Array(totalLength)
  let offset = 0

  for (const part of parts) {
    output.set(part, offset)
    offset += part.length
  }

  return output
}

function toBytes(content: string | Uint8Array): Uint8Array {
  return content instanceof Uint8Array ? content : encoder.encode(String(content))
}

function createZip(files: ZipArchiveFile[], createdAt: Date | string | number): Uint8Array {
  const localParts: Uint8Array[] = []
  const centralParts: Uint8Array[] = []
  const dos = dateToDosParts(createdAt)
  let offset = 0

  for (const file of files) {
    const nameBytes = encoder.encode(file.path)
    const data = toBytes(file.content)
    const checksum = crc32(data)
    const localHeader = new Uint8Array([
      ...uint32(0x04034b50),
      ...uint16(ZIP_VERSION),
      ...uint16(ZIP_UTF8_FLAG),
      ...uint16(ZIP_STORE_METHOD),
      ...uint16(dos.time),
      ...uint16(dos.date),
      ...uint32(checksum),
      ...uint32(data.length),
      ...uint32(data.length),
      ...uint16(nameBytes.length),
      ...uint16(0),
    ])
    const centralHeader = new Uint8Array([
      ...uint32(0x02014b50),
      ...uint16(ZIP_VERSION),
      ...uint16(ZIP_VERSION),
      ...uint16(ZIP_UTF8_FLAG),
      ...uint16(ZIP_STORE_METHOD),
      ...uint16(dos.time),
      ...uint16(dos.date),
      ...uint32(checksum),
      ...uint32(data.length),
      ...uint32(data.length),
      ...uint16(nameBytes.length),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint32(0),
      ...uint32(offset),
    ])

    localParts.push(localHeader, nameBytes, data)
    centralParts.push(centralHeader, nameBytes)
    offset += localHeader.length + nameBytes.length + data.length
  }

  const centralDirectory = concatBytes(centralParts)
  const endOfCentralDirectory = new Uint8Array([
    ...uint32(0x06054b50),
    ...uint16(0),
    ...uint16(0),
    ...uint16(files.length),
    ...uint16(files.length),
    ...uint32(centralDirectory.length),
    ...uint32(offset),
    ...uint16(0),
  ])

  return concatBytes([...localParts, centralDirectory, endOfCentralDirectory])
}

function arrayBufferFromBytes(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return copy.buffer
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }

  return globalThis.btoa(binary)
}

export function createZipContent(
  files: ZipArchiveFile[],
  options: ZipArchiveOptions = {},
): ZipArchiveContent {
  const bytes = createZip(files, options.createdAt || new Date())
  const arrayBuffer = arrayBufferFromBytes(bytes)

  if (options.type === 'arraybuffer') return arrayBuffer
  if (options.type === 'base64') return bytesToBase64(bytes)

  return new Blob([arrayBuffer], { type: options.mimeType || 'application/zip' })
}
