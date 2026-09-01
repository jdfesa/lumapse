import {
  normalizeBackupImportEntities,
  type BackupImportJsonDocuments,
} from './BackupImportEntityValidation'
import { BACKUP_APP_NAME, BACKUP_FORMAT_VERSION } from './BackupFormat'
import { BACKUP_IMPORT_DATA_POLICY, BACKUP_IMPORT_ZIP_POLICY } from './BackupImportPolicy'
import type { BackupItemCounts, BackupManifest } from '../../domain/backup'
import { BackupImportError, type ParsedBackupImport } from '../../domain/backupImport'
import {
  parseBoundedOneLineText,
  parseLegacyBoolean,
  parseRFC3339Timestamp,
  parseUtf8ByteBoundedContent,
  PrimitiveValidationError,
} from '../../domain/primitiveValidation'

const SUBJECTS_PATH = 'data/subjects.json'
const NOTES_PATH = 'data/notes.json'
const ACADEMIC_EVENTS_PATH = 'data/academic-events.json'
const REQUIRED_JSON_FILES = [SUBJECTS_PATH, NOTES_PATH, ACADEMIC_EVENTS_PATH] as const

type UnknownRecord = Record<string, unknown>

function invalid(path: string, reason: string): never {
  throw new BackupImportError(`Backup invalido: ${path} ${reason}.`)
}

function recordAt(value: unknown, path: string): UnknownRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return invalid(path, 'debe ser un objeto')
  }
  return value as UnknownRecord
}

function primitiveAt<T>(path: string, parser: () => T): T {
  try {
    return parser()
  } catch (error) {
    if (error instanceof PrimitiveValidationError) return invalid(path, error.message)
    throw error
  }
}

function oneLineAt(value: unknown, path: string, maxCodePoints: number): string {
  return primitiveAt(path, () => parseBoundedOneLineText(value, {
    maxCodePoints,
    trim: true,
    allowEmpty: false,
  }))
}

function countAt(value: unknown, path: string, maxCount: number): number {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    !Number.isSafeInteger(value) ||
    value < 0 || value > maxCount
  ) {
    return invalid(path, 'debe ser un entero finito no negativo dentro del limite')
  }
  return value
}

function safeManifestPathAt(value: unknown, path: string): string {
  const file = primitiveAt(path, () => parseBoundedOneLineText(value, {
    maxCodePoints: BACKUP_IMPORT_ZIP_POLICY.maxPathBytes,
    allowEmpty: false,
  }))
  primitiveAt(path, () => parseUtf8ByteBoundedContent(
    file,
    BACKUP_IMPORT_ZIP_POLICY.maxPathBytes,
  ))
  const segments = file.split('/')
  if (
    file.includes('\\') ||
    file.startsWith('/') ||
    /^[A-Za-z]:/u.test(file) ||
    file.endsWith('/') ||
    segments.some(segment => !segment || segment === '.' || segment === '..')
  ) {
    return invalid(path, 'contiene una ruta insegura o ambigua')
  }
  return file
}

function manifestFilesAt(value: unknown): string[] {
  if (!Array.isArray(value)) return invalid('manifest.json.files', 'debe contener una lista')
  if (value.length > BACKUP_IMPORT_DATA_POLICY.maxManifestFiles) {
    return invalid('manifest.json.files', 'supera el limite de archivos')
  }

  const files: string[] = []
  const seen = new Set<string>()
  for (let index = 0; index < value.length; index += 1) {
    const file = safeManifestPathAt(value[index], `manifest.json.files[${index}]`)
    if (seen.has(file)) return invalid(`manifest.json.files[${index}]`, 'duplica una ruta anterior')
    seen.add(file)
    files.push(file)
  }
  return files
}

export function validateBackupManifest(value: unknown): BackupManifest {
  const manifest = recordAt(value, 'manifest.json')
  if (manifest.app !== BACKUP_APP_NAME) {
    throw new BackupImportError('El ZIP seleccionado no parece ser un backup de Lumapse.')
  }
  if (manifest.backupFormatVersion !== BACKUP_FORMAT_VERSION) {
    throw new BackupImportError('Version de backup no soportada.')
  }
  if (manifest.exportMode !== 'manual') return invalid('manifest.json.exportMode', 'debe ser manual')

  const dataPolicy = recordAt(manifest.dataPolicy, 'manifest.json.dataPolicy')
  const counts = recordAt(manifest.counts, 'manifest.json.counts')
  return {
    app: BACKUP_APP_NAME,
    backupFormatVersion: BACKUP_FORMAT_VERSION,
    createdAt: primitiveAt('manifest.json.createdAt', () => (
      parseRFC3339Timestamp(manifest.createdAt)
    )),
    filename: oneLineAt(
      manifest.filename,
      'manifest.json.filename',
      BACKUP_IMPORT_DATA_POLICY.maxManifestFilenameCodePoints,
    ),
    exportMode: 'manual',
    dataPolicy: {
      includesDeletedItems: primitiveAt('manifest.json.dataPolicy.includesDeletedItems', () => (
        parseLegacyBoolean(dataPolicy.includesDeletedItems)
      )),
      includesArchivedItems: primitiveAt('manifest.json.dataPolicy.includesArchivedItems', () => (
        parseLegacyBoolean(dataPolicy.includesArchivedItems)
      )),
      includesAttachments: primitiveAt('manifest.json.dataPolicy.includesAttachments', () => (
        parseLegacyBoolean(dataPolicy.includesAttachments)
      )),
    },
    counts: {
      subjects: countAt(
        counts.subjects,
        'manifest.json.counts.subjects',
        BACKUP_IMPORT_DATA_POLICY.maxSubjects,
      ),
      notes: countAt(
        counts.notes,
        'manifest.json.counts.notes',
        BACKUP_IMPORT_DATA_POLICY.maxNotes,
      ),
      academicEvents: countAt(
        counts.academicEvents,
        'manifest.json.counts.academicEvents',
        BACKUP_IMPORT_DATA_POLICY.maxAcademicEvents,
      ),
      attachments: countAt(
        counts.attachments === undefined ? 0 : counts.attachments,
        'manifest.json.counts.attachments',
        BACKUP_IMPORT_DATA_POLICY.maxManifestFiles,
      ),
    },
    files: manifestFilesAt(manifest.files),
  }
}

function addManifestWarnings(manifest: BackupManifest, warnings: string[]): void {
  if (manifest.dataPolicy.includesDeletedItems) {
    warnings.push('El manifest declara items eliminados; Lumapse no importara papelera en esta version.')
  }
  if (manifest.dataPolicy.includesAttachments) {
    warnings.push('El manifest declara adjuntos, pero la importacion actual no soporta adjuntos.')
  }
  for (const path of REQUIRED_JSON_FILES) {
    if (manifest.files.length > 0 && !manifest.files.includes(path)) {
      warnings.push(`El manifest no lista ${path}, aunque se intentara leer el archivo canonico.`)
    }
  }
}

function addDeletedWarning(count: number, singular: string, plural: string, warnings: string[]): void {
  if (count === 1) warnings.push(`Se omitio ${singular} en papelera incluida en el backup.`)
  if (count > 1) warnings.push(`Se omitieron ${count} ${plural} en papelera incluidas en el backup.`)
}

function addCountWarnings(manifest: BackupManifest, counts: BackupItemCounts, warnings: string[]): void {
  if (manifest.counts.subjects !== counts.subjects) {
    warnings.push('El conteo de materias del manifest no coincide con los datos del backup.')
  }
  if (manifest.counts.notes !== counts.notes) {
    warnings.push('El conteo de notas del manifest no coincide con los datos del backup.')
  }
  if (manifest.counts.academicEvents !== counts.academicEvents) {
    warnings.push('El conteo de fechas academicas del manifest no coincide con los datos del backup.')
  }
}

export function validateBackupImportEntities(
  manifest: BackupManifest,
  documents: BackupImportJsonDocuments,
): ParsedBackupImport {
  const warnings: string[] = []
  addManifestWarnings(manifest, warnings)

  const normalized = normalizeBackupImportEntities(documents, manifest.createdAt)
  const counts = {
    subjects: normalized.data.subjects.length,
    notes: normalized.data.notes.length,
    academicEvents: normalized.data.academicEvents.length,
  }
  addDeletedWarning(normalized.deleted.subjects, 'una materia', 'materias', warnings)
  addDeletedWarning(normalized.deleted.notes, 'una nota', 'notas', warnings)
  addDeletedWarning(
    normalized.deleted.academicEvents,
    'una fecha academica',
    'fechas academicas',
    warnings,
  )
  addCountWarnings(manifest, counts, warnings)

  if (counts.subjects + counts.notes + counts.academicEvents === 0) {
    throw new BackupImportError('El backup no contiene datos importables.')
  }
  return { manifest, data: normalized.data, counts, warnings }
}

export type { BackupImportJsonDocuments }
