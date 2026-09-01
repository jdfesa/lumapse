import { BackupImportError } from '../../domain/backupImport'
import { beginCrc32, finishCrc32, updateCrc32 } from './BackupZipCrc32'
import {
  ZIP_METHOD_DEFLATE,
  ZIP_METHOD_STORE,
  type BackupZipEntry,
  type PreflightedBackupZip,
} from './BackupZipPreflight'

interface CollectedEntry {
  bytes: Uint8Array
  checksum: number
}

function invalid(reason: string): BackupImportError {
  return new BackupImportError(`Backup invalido: ${reason}.`)
}

function findEntry(archive: PreflightedBackupZip, path: string): BackupZipEntry {
  const entry = archive.entries.find(candidate => candidate.path === path)
  if (!entry || entry.directory) throw invalid(`falta ${path}`)
  return entry
}

function compressedBytes(archive: PreflightedBackupZip, entry: BackupZipEntry): Uint8Array {
  return archive.bytes.subarray(entry.dataOffset, entry.dataOffset + entry.compressedSize)
}

function joinChunks(chunks: Uint8Array[], totalBytes: number): Uint8Array {
  const output = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    output.set(chunk, offset)
    offset += chunk.byteLength
  }
  return output
}

function collectStoredEntry(archive: PreflightedBackupZip, entry: BackupZipEntry): CollectedEntry {
  const bytes = compressedBytes(archive, entry)
  if (bytes.byteLength > entry.maxOutputBytes) {
    throw invalid(`${entry.path} supera el limite permitido`)
  }
  return {
    bytes,
    checksum: finishCrc32(updateCrc32(beginCrc32(), bytes)),
  }
}

function createRawDeflateStream(): DecompressionStream {
  if (typeof globalThis.DecompressionStream !== 'function') {
    throw invalid('el WebView debe actualizarse para importar backups DEFLATE historicos')
  }

  try {
    return new globalThis.DecompressionStream('deflate-raw')
  } catch {
    throw invalid('el WebView no soporta backups DEFLATE historicos')
  }
}

async function collectDeflatedEntry(
  archive: PreflightedBackupZip,
  entry: BackupZipEntry,
): Promise<CollectedEntry> {
  const compressed = compressedBytes(archive, entry)
  const decompressor = createRawDeflateStream()
  const compressedStream = new ReadableStream<BufferSource>({
    start(controller) {
      controller.enqueue(Uint8Array.from(compressed))
      controller.close()
    },
  })
  const stream = compressedStream.pipeThrough(decompressor)
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0
  let checksum = beginCrc32()

  try {
    while (true) {
      const result = await reader.read()
      if (result.done) break
      const chunk = result.value
      totalBytes += chunk.byteLength
      if (totalBytes > entry.maxOutputBytes) {
        await reader.cancel('backup entry limit exceeded')
        throw invalid(`${entry.path} supera el limite real descomprimido`)
      }
      checksum = updateCrc32(checksum, chunk)
      chunks.push(chunk)
    }
  } catch (error) {
    if (error instanceof BackupImportError) throw error
    throw invalid(`no se pudo descomprimir ${entry.path}`)
  } finally {
    reader.releaseLock()
  }

  return {
    bytes: joinChunks(chunks, totalBytes),
    checksum: finishCrc32(checksum),
  }
}

function validateCollectedEntry(entry: BackupZipEntry, collected: CollectedEntry): Uint8Array {
  if (collected.bytes.byteLength !== entry.declaredUncompressedSize) {
    throw invalid(`${entry.path} no coincide con el tamano declarado`)
  }
  if (collected.checksum !== entry.crc32) {
    throw invalid(`${entry.path} no supera la verificacion CRC32`)
  }
  return collected.bytes
}

export async function readBackupZipText(
  archive: PreflightedBackupZip,
  path: string,
): Promise<string> {
  const entry = findEntry(archive, path)
  const collected = entry.method === ZIP_METHOD_STORE
    ? collectStoredEntry(archive, entry)
    : entry.method === ZIP_METHOD_DEFLATE
      ? await collectDeflatedEntry(archive, entry)
      : null

  if (!collected) throw invalid(`${path} usa un metodo no soportado`)
  const bytes = validateCollectedEntry(entry, collected)

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    throw invalid(`${path} no contiene UTF-8 valido`)
  }
}
