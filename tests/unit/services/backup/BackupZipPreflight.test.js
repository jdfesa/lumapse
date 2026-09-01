import { describe, expect, it } from 'vitest'

import { BackupImportError } from '../../../../src/domain/backupImport.ts'
import {
  BACKUP_IMPORT_ZIP_POLICY,
} from '../../../../src/services/backup/BackupImportPolicy.ts'
import {
  preflightBackupZip,
  ZIP_METHOD_DEFLATE,
  ZIP_METHOD_STORE,
} from '../../../../src/services/backup/BackupZipPreflight.ts'
import {
  bytesToBase64,
  CANONICAL_BACKUP_FILES,
  centralRecord,
  currentBackupBytes,
  endOfCentralDirectoryOffset,
  legacyBackupBytes,
  renameEntry,
  setDeclaredEntrySize,
  setEntryFlags,
  setEntryMethod,
  setUint16,
  setUint32,
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

describe('BackupZipPreflight', () => {
  it('acepta el ZIP STORE actual y conserva metadata acotada', async () => {
    const archive = await preflightBackupZip(currentBackupBytes())

    expect(archive.entries).toHaveLength(4)
    expect(archive.entries.map(entry => entry.path)).toEqual(
      CANONICAL_BACKUP_FILES.map(file => file.path),
    )
    expect(archive.entries.every(entry => entry.method === ZIP_METHOD_STORE)).toBe(true)
    expect(archive.entries.every(entry => entry.maxOutputBytes > 0)).toBe(true)
  })

  it('acepta ZIPs DEFLATE historicos con carpetas y rutas UTF-8', async () => {
    const bytes = await legacyBackupBytes([
      ...CANONICAL_BACKUP_FILES,
      { path: 'notes/álgebra.md', content: '# Álgebra\n' },
    ])

    const archive = await preflightBackupZip(bytes)
    const manifest = archive.entries.find(entry => entry.path === 'manifest.json')

    expect(manifest.method).toBe(ZIP_METHOD_DEFLATE)
    expect(archive.entries.map(entry => entry.path)).toEqual(expect.arrayContaining([
      'data/',
      'notes/',
      'notes/álgebra.md',
    ]))
  })

  it('normaliza las fuentes soportadas y conserva un snapshot propio', async () => {
    const bytes = currentBackupBytes()
    const base64 = bytesToBase64(bytes)
    const sources = [
      bytes,
      bytes.slice().buffer,
      new Blob([bytes], { type: 'application/zip' }),
      base64,
      `data:application/zip;base64,${base64}`,
      { content: bytes, filename: 'backup.zip' },
    ]

    for (const source of sources) {
      await expect(preflightBackupZip(source)).resolves.toMatchObject({
        entries: expect.any(Array),
      })
    }

    const mutable = currentBackupBytes()
    const expected = mutable.slice()
    const pending = preflightBackupZip(mutable)
    mutable.fill(0)
    const archive = await pending

    expect(archive.bytes).toEqual(expected)
  })

  it('rechaza fuentes vacias, sobredimensionadas y base64 invalido', async () => {
    const bytes = currentBackupBytes()

    await expect(preflightBackupZip(new Uint8Array())).rejects.toThrow('esta vacio')
    await expect(preflightBackupZip(bytes, policy({
      maxSourceBytes: bytes.byteLength - 1,
    }))).rejects.toThrow('supera el limite permitido')
    await expect(preflightBackupZip('%%%no-base64%%%')).rejects.toThrow('base64')
  })

  it('aplica limites de entradas, directorio central, entrada y total declarado', async () => {
    const bytes = currentBackupBytes()

    await expect(preflightBackupZip(bytes, policy({ maxEntries: 3 })))
      .rejects.toThrow('cantidad de entradas ZIP')
    await expect(preflightBackupZip(bytes, policy({ maxCentralDirectoryBytes: 1 })))
      .rejects.toThrow('directorio central supera')
    await expect(preflightBackupZip(bytes, policy({
      jsonBytes: { 'manifest.json': 1 },
    }))).rejects.toThrow('limite descomprimido declarado')
    await expect(preflightBackupZip(bytes, policy({ maxDeclaredUncompressedBytes: 1 })))
      .rejects.toThrow('limite total')
  })

  it('rechaza traversal, rutas no soportadas y duplicados', async () => {
    const files = [...CANONICAL_BACKUP_FILES, { path: 'notes/a.md', content: '# A' }]
    const traversal = currentBackupBytes(files)
    const unexpected = currentBackupBytes(files)
    const inheritedKey = currentBackupBytes([
      ...CANONICAL_BACKUP_FILES,
      { path: 'toString', content: 'unexpected' },
    ])
    const duplicate = currentBackupBytes([
      ...CANONICAL_BACKUP_FILES,
      { path: 'manifest.json', content: '{}' },
    ])
    renameEntry(traversal, 'notes/a.md', '../evil.md')
    renameEntry(unexpected, 'notes/a.md', 'other/a.md')

    await expect(preflightBackupZip(traversal)).rejects.toThrow('ruta')
    await expect(preflightBackupZip(unexpected)).rejects.toThrow('entrada no soportada')
    await expect(preflightBackupZip(inheritedKey)).rejects.toThrow('entrada no soportada')
    await expect(preflightBackupZip(duplicate)).rejects.toThrow('rutas duplicadas')
  })

  it('rechaza flags peligrosos, metodos desconocidos, ZIP64 y multidisk', async () => {
    const descriptor = currentBackupBytes()
    const encrypted = currentBackupBytes()
    const unknownMethod = currentBackupBytes()
    const zip64 = currentBackupBytes()
    const multidisk = currentBackupBytes()
    setEntryFlags(descriptor, 'manifest.json', 0x0808)
    setEntryFlags(encrypted, 'manifest.json', 0x0801)
    setEntryMethod(unknownMethod, 'manifest.json', 99)
    setUint16(zip64, endOfCentralDirectoryOffset(zip64) + 8, 0xffff)
    setUint16(zip64, endOfCentralDirectoryOffset(zip64) + 10, 0xffff)
    setUint16(multidisk, endOfCentralDirectoryOffset(multidisk) + 4, 1)

    await expect(preflightBackupZip(descriptor)).rejects.toThrow('flags o version ZIP')
    await expect(preflightBackupZip(encrypted)).rejects.toThrow('flags o version ZIP')
    await expect(preflightBackupZip(unknownMethod)).rejects.toThrow('metodo de compresion')
    await expect(preflightBackupZip(zip64)).rejects.toThrow('ZIP64')
    await expect(preflightBackupZip(multidisk)).rejects.toThrow('multidisk')
  })

  it('rechaza discrepancias entre headers locales y el directorio central', async () => {
    const bytes = currentBackupBytes()
    const record = centralRecord(bytes, 'manifest.json')
    setUint32(bytes, record.localOffset + 14, 0)

    await expect(preflightBackupZip(bytes)).rejects.toThrow('header local no coincide')
  })

  it('rechaza tamanos STORE incompatibles y archivos canonicos faltantes', async () => {
    const invalidStore = currentBackupBytes()
    setDeclaredEntrySize(invalidStore, 'manifest.json', 1)
    const missing = currentBackupBytes(CANONICAL_BACKUP_FILES.slice(0, -1))

    await expect(preflightBackupZip(invalidStore)).rejects.toThrow('STORE declara tamanos')
    await expect(preflightBackupZip(missing)).rejects.toThrow('falta data/academic-events.json')
    await expect(preflightBackupZip(missing)).rejects.toBeInstanceOf(BackupImportError)
  })
})
