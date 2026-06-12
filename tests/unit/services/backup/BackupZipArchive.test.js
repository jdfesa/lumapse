import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'

import { createZipContent } from '../../../../src/services/backup/BackupZipArchive.ts'

const CREATED_AT = new Date('2026-06-03T12:30:00.000Z')

function backupFiles() {
  return [
    { path: 'README.txt', content: 'Backup legible' },
    { path: 'data/binario.dat', content: new Uint8Array([0, 1, 2, 255]) },
    { path: 'notes/matematica/álgebra.md', content: '# Álgebra\n' },
  ]
}

function base64ToArrayBuffer(value) {
  const binary = globalThis.atob(value)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes.buffer
}

describe('BackupZipArchive', () => {
  it('crea un ZIP ArrayBuffer legible con archivos de texto, binarios y rutas UTF-8', async () => {
    const content = createZipContent(backupFiles(), {
      createdAt: CREATED_AT,
      type: 'arraybuffer',
    })

    expect(content).toBeInstanceOf(ArrayBuffer)

    const zip = await JSZip.loadAsync(content)

    await expect(zip.file('README.txt').async('string')).resolves.toBe('Backup legible')
    await expect(zip.file('notes/matematica/álgebra.md').async('string')).resolves.toBe('# Álgebra\n')
    await expect(zip.file('data/binario.dat').async('uint8array')).resolves.toEqual(new Uint8Array([0, 1, 2, 255]))
  })

  it('crea contenido base64 decodificable como ZIP', async () => {
    const content = createZipContent(backupFiles(), {
      createdAt: CREATED_AT,
      type: 'base64',
    })

    expect(typeof content).toBe('string')

    const zip = await JSZip.loadAsync(base64ToArrayBuffer(content))

    await expect(zip.file('README.txt').async('string')).resolves.toBe('Backup legible')
  })

  it('crea un Blob application/zip por defecto', async () => {
    const content = createZipContent(backupFiles(), {
      createdAt: CREATED_AT,
    })

    expect(content).toBeInstanceOf(Blob)
    expect(content.type).toBe('application/zip')

    const zip = await JSZip.loadAsync(await content.arrayBuffer())

    await expect(zip.file('README.txt').async('string')).resolves.toBe('Backup legible')
  })
})
