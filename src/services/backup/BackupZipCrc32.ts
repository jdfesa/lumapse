const CRC32_TABLE = createCrc32Table()

function createCrc32Table(): Uint32Array {
  const table = new Uint32Array(256)
  for (let index = 0; index < table.length; index += 1) {
    let value = index
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    }
    table[index] = value >>> 0
  }
  return table
}

export function beginCrc32(): number {
  return 0xffffffff
}

export function updateCrc32(checksum: number, bytes: Uint8Array): number {
  let next = checksum >>> 0
  for (const byte of bytes) {
    next = CRC32_TABLE[(next ^ byte) & 0xff] ^ (next >>> 8)
  }
  return next >>> 0
}

export function finishCrc32(checksum: number): number {
  return (checksum ^ 0xffffffff) >>> 0
}

export function crc32(bytes: Uint8Array): number {
  return finishCrc32(updateCrc32(beginCrc32(), bytes))
}
