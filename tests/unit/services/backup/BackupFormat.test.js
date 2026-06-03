import { describe, expect, it } from 'vitest'
import {
  BACKUP_DATA_POLICY,
  BACKUP_FORMAT_VERSION,
  buildBackupManifest,
  createBackupFilename,
  createUniqueFilename,
  getDefaultBackupFiles,
  slugifyBackupPath,
} from '../../../../src/services/backup/BackupFormat.js'

describe('BackupFormat', () => {
  describe('createBackupFilename()', () => {
    it('genera el nombre canonico con fecha y hora local', () => {
      const filename = createBackupFilename(new Date(2026, 5, 3, 12, 30, 45))

      expect(filename).toBe('lumapse-2026-06-03-12-30.zip')
    })

    it('lanza error si la fecha no es valida', () => {
      expect(() => createBackupFilename('fecha-rota')).toThrow('Fecha de backup invalida')
    })
  })

  describe('slugifyBackupPath()', () => {
    it('normaliza tildes, espacios y caracteres inseguros', () => {
      expect(slugifyBackupPath('  Prácticas: clase 1 / repaso?  ')).toBe('practicas-clase-1-repaso')
    })

    it('usa fallback cuando no hay texto util', () => {
      expect(slugifyBackupPath('///???')).toBe('sin-titulo')
      expect(slugifyBackupPath(null, { fallback: 'entrada' })).toBe('entrada')
    })

    it('limita el largo del slug sin terminar en guion', () => {
      const slug = slugifyBackupPath('Unidad '.repeat(30), { maxLength: 20 })

      expect(slug.length).toBeLessThanOrEqual(20)
      expect(slug.endsWith('-')).toBe(false)
    })
  })

  describe('createUniqueFilename()', () => {
    it('reserva nombres unicos con sufijo incremental', () => {
      const usedNames = new Set(['parcial-1.md', 'parcial-1-2.md'])

      expect(createUniqueFilename('Parcial 1', usedNames)).toBe('parcial-1-3.md')
      expect(createUniqueFilename('Parcial 1', usedNames)).toBe('parcial-1-4.md')
    })

    it('normaliza extensiones sin punto', () => {
      const usedNames = new Set()

      expect(createUniqueFilename('Notas', usedNames, 'txt')).toBe('notas.txt')
    })
  })

  describe('buildBackupManifest()', () => {
    it('construye el manifest versionado con politica de datos estable', () => {
      const createdAt = new Date('2026-06-03T12:30:00.000Z')
      const manifest = buildBackupManifest({
        createdAt,
        filename: 'lumapse-2026-06-03-12-30.zip',
        counts: {
          subjects: 2,
          notes: 5,
          academicEvents: 1,
        },
      })

      expect(manifest).toEqual({
        app: 'Lumapse',
        backupFormatVersion: BACKUP_FORMAT_VERSION,
        createdAt: createdAt.toISOString(),
        filename: 'lumapse-2026-06-03-12-30.zip',
        exportMode: 'manual',
        dataPolicy: BACKUP_DATA_POLICY,
        counts: {
          subjects: 2,
          notes: 5,
          academicEvents: 1,
          attachments: 0,
        },
        files: [
          'README.txt',
          'data/academic-events.json',
          'data/notes.json',
          'data/subjects.json',
          'manifest.json',
        ],
      })
    })

    it('elimina archivos duplicados en la lista del manifest', () => {
      const manifest = buildBackupManifest({
        createdAt: new Date('2026-06-03T12:30:00.000Z'),
        files: ['manifest.json', 'README.txt', 'manifest.json'],
      })

      expect(manifest.files).toEqual(['README.txt', 'manifest.json'])
    })

    it('devuelve una copia defensiva de los archivos por defecto', () => {
      const first = getDefaultBackupFiles()
      first.push('extra.txt')

      expect(getDefaultBackupFiles()).not.toContain('extra.txt')
    })
  })
})
