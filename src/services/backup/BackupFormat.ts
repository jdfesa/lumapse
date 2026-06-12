// =============================================================
// backup/BackupFormat
//
// Responsabilidad: definir el contrato estable del backup de
// Lumapse antes de construir la UI o la integracion nativa.
// =============================================================

import type { BackupCounts, BackupDataPolicy, BackupManifest } from '../../domain/backup'

type BackupDateInput = Date | string | number

interface SlugifyBackupPathOptions {
  fallback?: string
  maxLength?: number
}

interface BackupManifestInput {
  createdAt?: BackupDateInput
  filename?: string
  counts?: Partial<BackupCounts>
  files?: string[]
}

export const BACKUP_FORMAT_VERSION = 1 as const
export const BACKUP_APP_NAME = 'Lumapse' as const
export const BACKUP_FILENAME_PREFIX = 'lumapse'
export const BACKUP_FILENAME_EXTENSION = '.zip' as const

export const BACKUP_DATA_POLICY: Readonly<BackupDataPolicy> = Object.freeze({
  includesDeletedItems: false,
  includesArchivedItems: true,
  includesAttachments: false,
})

const DEFAULT_COUNTS: Readonly<BackupCounts> = Object.freeze({
  subjects: 0,
  notes: 0,
  academicEvents: 0,
  attachments: 0,
})

const DEFAULT_FILES = Object.freeze([
  'manifest.json',
  'data/subjects.json',
  'data/notes.json',
  'data/academic-events.json',
  'README.txt',
])

function padDatePart(value: number): string {
  return String(value).padStart(2, '0')
}

function coerceDate(date: BackupDateInput): Date {
  const value = date instanceof Date ? date : new Date(date)

  if (Number.isNaN(value.getTime())) {
    throw new Error('Fecha de backup invalida.')
  }

  return value
}

/**
 * Genera el nombre canonico del backup.
 * Usa hora local del dispositivo para que el archivo sea legible para el usuario.
 * @param {Date|string|number} date Fecha base
 * @returns {string} Nombre `lumapse-YYYY-MM-DD-HH-mm.zip`
 */
export function createBackupFilename(date: BackupDateInput = new Date()): string {
  const value = coerceDate(date)
  const year = value.getFullYear()
  const month = padDatePart(value.getMonth() + 1)
  const day = padDatePart(value.getDate())
  const hour = padDatePart(value.getHours())
  const minute = padDatePart(value.getMinutes())

  return `${BACKUP_FILENAME_PREFIX}-${year}-${month}-${day}-${hour}-${minute}${BACKUP_FILENAME_EXTENSION}`
}

/**
 * Convierte nombres de usuario en slugs seguros para rutas dentro del ZIP.
 * @param {unknown} value Texto original
 * @param {object} options Opciones de formato
 * @param {string} options.fallback Valor cuando no hay texto util
 * @param {number} options.maxLength Largo maximo del slug
 * @returns {string}
 */
export function slugifyBackupPath(value: unknown, options: SlugifyBackupPathOptions = {}): string {
  const fallback = options.fallback || 'sin-titulo'
  const maxLength = options.maxLength || 80
  const normalized = String(value ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\\/:"*?<>|]/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  const slug = normalized.slice(0, maxLength).replace(/-$/g, '')

  return slug || fallback
}

/**
 * Crea un nombre de archivo unico dentro de un conjunto.
 * Muta `usedNames` para reservar el resultado.
 * @param {string} baseName Nombre base sin extension
 * @param {Set<string>} usedNames Nombres ya usados
 * @param {string} extension Extension con punto
 * @returns {string}
 */
export function createUniqueFilename(baseName: string, usedNames: Set<string>, extension = '.md'): string {
  const safeBaseName = slugifyBackupPath(baseName)
  const normalizedExtension = extension.startsWith('.') ? extension : `.${extension}`
  let filename = `${safeBaseName}${normalizedExtension}`
  let counter = 2

  while (usedNames.has(filename)) {
    filename = `${safeBaseName}-${counter}${normalizedExtension}`
    counter += 1
  }

  usedNames.add(filename)
  return filename
}

function normalizeCounts(counts: Partial<BackupCounts> = {}): BackupCounts {
  return {
    ...DEFAULT_COUNTS,
    ...counts,
  }
}

function normalizeFiles(files: readonly string[] = DEFAULT_FILES): string[] {
  return [...new Set(files)].sort()
}

/**
 * Construye el manifest restaurable del backup.
 * @param {object} input Datos del manifest
 * @param {Date|string|number} input.createdAt Fecha de creacion
 * @param {string} input.filename Nombre del ZIP
 * @param {object} input.counts Conteos exportados
 * @param {string[]} input.files Entradas del ZIP
 * @returns {object}
 */
export function buildBackupManifest(input: BackupManifestInput = {}): BackupManifest {
  const createdAt = coerceDate(input.createdAt || new Date())
  const filename = input.filename || createBackupFilename(createdAt)

  return {
    app: BACKUP_APP_NAME,
    backupFormatVersion: BACKUP_FORMAT_VERSION,
    createdAt: createdAt.toISOString(),
    filename,
    exportMode: 'manual',
    dataPolicy: { ...BACKUP_DATA_POLICY },
    counts: normalizeCounts(input.counts),
    files: normalizeFiles(input.files),
  }
}

export function getDefaultBackupFiles(): string[] {
  return [...DEFAULT_FILES]
}
