// =============================================================
// backup/BackupImportZipService
//
// Responsabilidad: leer y validar backups ZIP generados por
// Lumapse, sin tocar SQLite ni UI.
// =============================================================

import JSZip from 'jszip'
import {
  BACKUP_APP_NAME,
  BACKUP_FORMAT_VERSION,
} from './BackupFormat'
import {
  BackupImportError,
  type BackupImportAcademicEvent,
  type BackupImportNote,
  type BackupImportSource,
  type BackupImportSubject,
  type ParsedBackupImport,
} from '../../domain/backupImport'
import type { BackupData, BackupItemCounts, BackupManifest } from '../../domain/backup'
import type { AcademicEventType } from '../../domain/academicEvents'
import type { EntityId, HexColor, ISODateString, ISODateTimeString } from '../../domain/primitives'

const MANIFEST_PATH = 'manifest.json'
const SUBJECTS_PATH = 'data/subjects.json'
const NOTES_PATH = 'data/notes.json'
const ACADEMIC_EVENTS_PATH = 'data/academic-events.json'

const REQUIRED_JSON_FILES = Object.freeze([
  SUBJECTS_PATH,
  NOTES_PATH,
  ACADEMIC_EVENTS_PATH,
])

const ACADEMIC_EVENT_TYPES = new Set<AcademicEventType>([
  'parcial',
  'final',
  'tp',
  'exposicion',
])

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function textValue(value: unknown): string {
  return String(value ?? '').trim()
}

function optionalText(value: unknown): string | null {
  const normalized = textValue(value)
  return normalized || null
}

function requireText(value: unknown, field: string, itemType: string): string {
  const normalized = textValue(value)
  if (!normalized) {
    throw new BackupImportError(`Backup invalido: falta ${field} en ${itemType}.`)
  }
  return normalized
}

function normalizeBoolean(value: unknown): boolean {
  if (value === true || value === 1) return true
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === 'true' || normalized === '1'
  }
  return false
}

function normalizeDateTime(value: unknown, fallback: ISODateTimeString): ISODateTimeString {
  const normalized = textValue(value)
  return normalized || fallback
}

function normalizeDate(value: unknown, itemType: string): ISODateString {
  const normalized = requireText(value, 'date', itemType)
  if (!ISO_DATE_RE.test(normalized)) {
    throw new BackupImportError(`Backup invalido: fecha academica con date invalida "${normalized}".`)
  }
  return normalized
}

function normalizeSubjectId(value: unknown): EntityId | null {
  return optionalText(value)
}

function normalizeColor(value: unknown): HexColor | null {
  return optionalText(value)
}

function parseAcademicEventType(value: unknown): AcademicEventType {
  const normalized = requireText(value, 'type', 'fecha academica')
  if (!ACADEMIC_EVENT_TYPES.has(normalized as AcademicEventType)) {
    throw new BackupImportError(`Backup invalido: tipo de fecha academica no soportado "${normalized}".`)
  }
  return normalized as AcademicEventType
}

function normalizeArray(value: unknown, path: string): UnknownRecord[] {
  if (!Array.isArray(value)) {
    throw new BackupImportError(`Backup invalido: ${path} debe contener una lista.`)
  }

  return value.map((item, index) => {
    if (!isRecord(item)) {
      throw new BackupImportError(`Backup invalido: item ${index + 1} de ${path} no es un objeto.`)
    }
    return item
  })
}

function normalizeSubjects(
  value: unknown,
  fallbackDate: ISODateTimeString,
  warnings: string[],
): BackupImportSubject[] {
  const rows = normalizeArray(value, SUBJECTS_PATH)
  const subjects: BackupImportSubject[] = []

  for (const row of rows) {
    if (row.deletedAt) {
      warnings.push('Se omitio una materia en papelera incluida en el backup.')
      continue
    }

    subjects.push({
      id: requireText(row.id, 'id', 'materia'),
      name: requireText(row.name, 'name', 'materia'),
      parentSubjectId: normalizeSubjectId(row.parentSubjectId),
      archived: normalizeBoolean(row.archived),
      color: normalizeColor(row.color),
      createdAt: normalizeDateTime(row.createdAt, fallbackDate),
    })
  }

  return subjects
}

function normalizeNotes(
  value: unknown,
  fallbackDate: ISODateTimeString,
  warnings: string[],
): BackupImportNote[] {
  const rows = normalizeArray(value, NOTES_PATH)
  const notes: BackupImportNote[] = []

  for (const row of rows) {
    if (row.deletedAt) {
      warnings.push('Se omitio una nota en papelera incluida en el backup.')
      continue
    }

    const createdAt = normalizeDateTime(row.createdAt, fallbackDate)
    notes.push({
      id: requireText(row.id, 'id', 'nota'),
      title: textValue(row.title) || 'Sin titulo',
      content: String(row.content ?? ''),
      pinned: normalizeBoolean(row.pinned),
      archived: normalizeBoolean(row.archived),
      statusEmoji: optionalText(row.statusEmoji),
      subjectId: normalizeSubjectId(row.subjectId),
      createdAt,
      updatedAt: normalizeDateTime(row.updatedAt, createdAt),
    })
  }

  return notes
}

function normalizeAcademicEvents(
  value: unknown,
  fallbackDate: ISODateTimeString,
): BackupImportAcademicEvent[] {
  const rows = normalizeArray(value, ACADEMIC_EVENTS_PATH)

  return rows.map(row => {
    const createdAt = normalizeDateTime(row.createdAt, fallbackDate)
    return {
      id: requireText(row.id, 'id', 'fecha academica'),
      type: parseAcademicEventType(row.type),
      title: optionalText(row.title),
      date: normalizeDate(row.date, 'fecha academica'),
      subjectId: normalizeSubjectId(row.subjectId),
      createdAt,
      updatedAt: normalizeDateTime(row.updatedAt, createdAt),
    }
  })
}

function countItems(data: BackupData): BackupItemCounts {
  return {
    subjects: data.subjects.length,
    notes: data.notes.length,
    academicEvents: data.academicEvents.length,
  }
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

function validateManifest(value: unknown): BackupManifest {
  if (!isRecord(value)) {
    throw new BackupImportError('Backup invalido: manifest.json no es un objeto.')
  }

  if (value.app !== BACKUP_APP_NAME) {
    throw new BackupImportError('El ZIP seleccionado no parece ser un backup de Lumapse.')
  }

  if (value.backupFormatVersion !== BACKUP_FORMAT_VERSION) {
    throw new BackupImportError(`Version de backup no soportada: ${String(value.backupFormatVersion)}.`)
  }

  if (!isRecord(value.counts)) {
    throw new BackupImportError('Backup invalido: manifest.json no incluye conteos validos.')
  }

  return {
    app: BACKUP_APP_NAME,
    backupFormatVersion: BACKUP_FORMAT_VERSION,
    createdAt: requireText(value.createdAt, 'createdAt', 'manifest') as ISODateTimeString,
    filename: textValue(value.filename),
    exportMode: 'manual',
    dataPolicy: {
      includesDeletedItems: Boolean(isRecord(value.dataPolicy) && value.dataPolicy.includesDeletedItems),
      includesArchivedItems: Boolean(isRecord(value.dataPolicy) && value.dataPolicy.includesArchivedItems),
      includesAttachments: Boolean(isRecord(value.dataPolicy) && value.dataPolicy.includesAttachments),
    },
    counts: {
      subjects: Number(value.counts.subjects || 0),
      notes: Number(value.counts.notes || 0),
      academicEvents: Number(value.counts.academicEvents || 0),
      attachments: Number(value.counts.attachments || 0),
    },
    files: Array.isArray(value.files)
      ? value.files.map(file => String(file))
      : [],
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

function normalizeSource(source: BackupImportSource | Blob | ArrayBuffer | Uint8Array | string): Blob | ArrayBuffer | Uint8Array | string {
  if (isRecord(source) && 'content' in source) {
    const content = source.content
    if (
      typeof content === 'string' ||
      content instanceof ArrayBuffer ||
      content instanceof Uint8Array ||
      (typeof Blob !== 'undefined' && content instanceof Blob)
    ) {
      return content
    }
  }

  return source as Blob | ArrayBuffer | Uint8Array | string
}

function normalizeStringSource(content: string): { content: string, base64: boolean } {
  if (content.startsWith('data:') && content.includes(',')) {
    return {
      content: content.slice(content.indexOf(',') + 1),
      base64: true,
    }
  }

  return {
    content,
    base64: true,
  }
}

async function loadZip(source: BackupImportSource | Blob | ArrayBuffer | Uint8Array | string): Promise<JSZip> {
  const content = normalizeSource(source)

  try {
    if (typeof content === 'string') {
      const normalized = normalizeStringSource(content)
      return await JSZip.loadAsync(normalized.content, { base64: normalized.base64 })
    }

    return await JSZip.loadAsync(content)
  } catch {
    throw new BackupImportError('No se pudo leer el ZIP de backup seleccionado.')
  }
}

async function readJsonFile(zip: JSZip, path: string): Promise<unknown> {
  const file = zip.file(path)
  if (!file) {
    throw new BackupImportError(`Backup invalido: falta ${path}.`)
  }

  try {
    return JSON.parse(await file.async('string'))
  } catch {
    throw new BackupImportError(`Backup invalido: ${path} no contiene JSON valido.`)
  }
}

export async function parseBackupImportZip(
  source: BackupImportSource | Blob | ArrayBuffer | Uint8Array | string,
): Promise<ParsedBackupImport> {
  const zip = await loadZip(source)
  const warnings: string[] = []
  const manifest = validateManifest(await readJsonFile(zip, MANIFEST_PATH))

  addManifestWarnings(manifest, warnings)

  const [subjectsJson, notesJson, academicEventsJson] = await Promise.all([
    readJsonFile(zip, SUBJECTS_PATH),
    readJsonFile(zip, NOTES_PATH),
    readJsonFile(zip, ACADEMIC_EVENTS_PATH),
  ])
  const data: BackupData = {
    subjects: normalizeSubjects(subjectsJson, manifest.createdAt, warnings),
    notes: normalizeNotes(notesJson, manifest.createdAt, warnings),
    academicEvents: normalizeAcademicEvents(academicEventsJson, manifest.createdAt),
  }
  const counts = countItems(data)

  addCountWarnings(manifest, counts, warnings)

  if (counts.subjects + counts.notes + counts.academicEvents === 0) {
    throw new BackupImportError('El backup no contiene datos importables.')
  }

  return {
    manifest,
    data,
    counts,
    warnings,
  }
}

export {
  ACADEMIC_EVENTS_PATH,
  MANIFEST_PATH,
  NOTES_PATH,
  SUBJECTS_PATH,
}
