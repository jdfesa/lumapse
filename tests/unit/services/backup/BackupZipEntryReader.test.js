import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  BACKUP_IMPORT_ZIP_POLICY,
} from '../../../../src/services/backup/BackupImportPolicy.ts'
import { readBackupZipText } from '../../../../src/services/backup/BackupZipEntryReader.ts'
import { preflightBackupZip } from '../../../../src/services/backup/BackupZipPreflight.ts'
import {
  CANONICAL_BACKUP_FILES,
  currentBackupBytes,
  legacyBackupBytes,
  setDeclaredEntrySize,
} from './BackupZipSecurityTestUtils.js'

function policy(overrides = {}) {
  return {
    ...BACKUP_IMPORT_ZIP_POLICY,
    ...overrides,
    jsonBytes: {
      ...BACKUP_IMPORT_ZIP_POLICY.jsonBytes,
      ...overrides.jsonBytes,
    },
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('BackupZipEntryReader', () => {
  it('lee texto STORE y valida su CRC32', async () => {
    const archive = await preflightBackupZip(currentBackupBytes())

    await expect(readBackupZipText(archive, 'manifest.json'))
      .resolves.toBe('{"app":"Lumapse"}')
  })

  it('lee texto DEFLATE de backups historicos', async () => {
    const archive = await preflightBackupZip(await legacyBackupBytes())

    await expect(readBackupZipText(archive, 'manifest.json'))
      .resolves.toBe('{"app":"Lumapse"}')
  })

  it('mantiene STORE disponible y falla cerrado si el runtime no soporta DEFLATE', async () => {
    const stored = await preflightBackupZip(currentBackupBytes())
    const deflated = await preflightBackupZip(await legacyBackupBytes())
    vi.stubGlobal('DecompressionStream', undefined)

    await expect(readBackupZipText(stored, 'manifest.json'))
      .resolves.toBe('{"app":"Lumapse"}')
    await expect(readBackupZipText(deflated, 'manifest.json'))
      .rejects.toThrow('WebView debe actualizarse')
  })

  it('rechaza contenido STORE alterado aunque su metadata sea valida', async () => {
    const bytes = currentBackupBytes()
    const initial = await preflightBackupZip(bytes)
    const manifest = initial.entries.find(entry => entry.path === 'manifest.json')
    bytes[manifest.dataOffset] ^= 0xff
    const corrupted = await preflightBackupZip(bytes)

    await expect(readBackupZipText(corrupted, 'manifest.json'))
      .rejects.toThrow('verificacion CRC32')
  })

  it('rechaza contenido que no sea UTF-8 valido', async () => {
    const files = CANONICAL_BACKUP_FILES.map(file => (
      file.path === 'manifest.json'
        ? { ...file, content: new Uint8Array([0xff]) }
        : file
    ))
    const archive = await preflightBackupZip(currentBackupBytes(files))

    await expect(readBackupZipText(archive, 'manifest.json'))
      .rejects.toThrow('no contiene UTF-8 valido')
  })

  it('cancela DEFLATE cuando el contenido real supera el limite por entrada', async () => {
    const files = CANONICAL_BACKUP_FILES.map(file => (
      file.path === 'manifest.json'
        ? { ...file, content: 'A'.repeat(200_000) }
        : file
    ))
    const bytes = await legacyBackupBytes(files)
    setDeclaredEntrySize(bytes, 'manifest.json', 16)
    const archive = await preflightBackupZip(bytes, policy({
      jsonBytes: { 'manifest.json': 1_024 },
    }))

    await expect(readBackupZipText(archive, 'manifest.json'))
      .rejects.toThrow('limite real descomprimido')
  })

  it('rechaza tamanos descomprimidos que no coinciden con lo declarado', async () => {
    const bytes = await legacyBackupBytes()
    setDeclaredEntrySize(bytes, 'manifest.json', 1)
    const archive = await preflightBackupZip(bytes)

    await expect(readBackupZipText(archive, 'manifest.json'))
      .rejects.toThrow('no coincide con el tamano declarado')
  })

  it('rechaza rutas ausentes y carpetas como contenido de texto', async () => {
    const archive = await preflightBackupZip(await legacyBackupBytes())

    await expect(readBackupZipText(archive, 'missing.json')).rejects.toThrow('falta missing.json')
    await expect(readBackupZipText(archive, 'data/')).rejects.toThrow('falta data/')
  })
})
