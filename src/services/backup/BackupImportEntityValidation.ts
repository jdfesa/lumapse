import { BACKUP_IMPORT_DATA_POLICY } from './BackupImportPolicy'
import type { AcademicEvent, AcademicEventType } from '../../domain/academicEvents'
import type { BackupData } from '../../domain/backup'
import { BackupImportError } from '../../domain/backupImport'
import type { Note } from '../../domain/notes'
import {
  parseBoundedOneLineText,
  parseHexColor,
  parseISODate,
  parseLegacyBoolean,
  parseOpaqueId,
  parseRFC3339Timestamp,
  parseUtf8ByteBoundedContent,
  PrimitiveValidationError,
} from '../../domain/primitiveValidation'
import type { ISODateTimeString } from '../../domain/primitives'
import type { Subject } from '../../domain/subjects'

const SUBJECTS_PATH = 'data/subjects.json'
const NOTES_PATH = 'data/notes.json'
const ACADEMIC_EVENTS_PATH = 'data/academic-events.json'
const ACADEMIC_EVENT_TYPES = new Set<AcademicEventType>(['parcial', 'final', 'tp', 'exposicion'])

type UnknownRecord = Record<string, unknown>
type NormalizedRows<T> = { items: T[]; deleted: number }

export interface BackupImportJsonDocuments {
  subjects: unknown
  notes: unknown
  academicEvents: unknown
}

export interface NormalizedBackupImportEntities {
  data: BackupData
  deleted: { subjects: number; notes: number; academicEvents: number }
}

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

function rowsAt(value: unknown, path: string, maxItems: number): unknown[] {
  if (!Array.isArray(value)) return invalid(path, 'debe contener una lista')
  if (value.length > maxItems) return invalid(path, 'supera el limite de entidades')
  return value
}

function idAt(value: unknown, path: string): string {
  return primitiveAt(path, () => parseOpaqueId(value, BACKUP_IMPORT_DATA_POLICY.maxIdAsciiCharacters))
}

function optionalIdAt(value: unknown, path: string): string | null {
  if (value === undefined || value === null) return null
  if (typeof value === 'string' && value.trim() === '') {
    primitiveAt(path, () => parseBoundedOneLineText(value, {
      maxCodePoints: BACKUP_IMPORT_DATA_POLICY.maxIdAsciiCharacters,
      trim: true,
    }))
    return null
  }
  return idAt(value, path)
}

function oneLineAt(value: unknown, path: string, maxCodePoints: number): string {
  return primitiveAt(path, () => parseBoundedOneLineText(value, {
    maxCodePoints,
    trim: true,
    allowEmpty: false,
  }))
}

function optionalOneLineAt(value: unknown, path: string, maxCodePoints: number): string | null {
  if (value === undefined || value === null) return null
  const normalized = primitiveAt(path, () => parseBoundedOneLineText(value, {
    maxCodePoints,
    trim: true,
  }))
  return normalized || null
}

function timestampAt(value: unknown, path: string): ISODateTimeString {
  return primitiveAt(path, () => parseRFC3339Timestamp(value))
}

function optionalTimestampAt(
  value: unknown,
  path: string,
  fallback: ISODateTimeString,
): ISODateTimeString {
  if (value === undefined || value === null || value === '') return fallback
  return timestampAt(value, path)
}

function isDeleted(row: UnknownRecord, path: string): boolean {
  if (row.deletedAt === undefined || row.deletedAt === null) return false
  timestampAt(row.deletedAt, `${path}.deletedAt`)
  return true
}

function normalizeSubjects(value: unknown, fallback: ISODateTimeString): NormalizedRows<Subject> {
  const rows = rowsAt(value, SUBJECTS_PATH, BACKUP_IMPORT_DATA_POLICY.maxSubjects)
  const items: Subject[] = []
  let deleted = 0
  for (let index = 0; index < rows.length; index += 1) {
    const path = `${SUBJECTS_PATH}[${index}]`
    const row = recordAt(rows[index], path)
    if (isDeleted(row, path)) {
      deleted += 1
      continue
    }
    items.push({
      id: idAt(row.id, `${path}.id`),
      name: oneLineAt(row.name, `${path}.name`, BACKUP_IMPORT_DATA_POLICY.maxSubjectNameCodePoints),
      parentSubjectId: optionalIdAt(row.parentSubjectId, `${path}.parentSubjectId`),
      archived: primitiveAt(`${path}.archived`, () => parseLegacyBoolean(row.archived)),
      color: primitiveAt(`${path}.color`, () => parseHexColor(row.color === undefined ? null : row.color)),
      createdAt: optionalTimestampAt(row.createdAt, `${path}.createdAt`, fallback),
    })
  }
  return { items, deleted }
}

function normalizeNotes(value: unknown, fallback: ISODateTimeString): NormalizedRows<Note> {
  const rows = rowsAt(value, NOTES_PATH, BACKUP_IMPORT_DATA_POLICY.maxNotes)
  const items: Note[] = []
  let deleted = 0
  for (let index = 0; index < rows.length; index += 1) {
    const path = `${NOTES_PATH}[${index}]`
    const row = recordAt(rows[index], path)
    if (isDeleted(row, path)) {
      deleted += 1
      continue
    }
    const createdAt = optionalTimestampAt(row.createdAt, `${path}.createdAt`, fallback)
    items.push({
      id: idAt(row.id, `${path}.id`),
      title: optionalOneLineAt(row.title, `${path}.title`, BACKUP_IMPORT_DATA_POLICY.maxNoteTitleCodePoints) || 'Sin titulo',
      content: primitiveAt(`${path}.content`, () => parseUtf8ByteBoundedContent(
        row.content === undefined || row.content === null ? '' : row.content,
        BACKUP_IMPORT_DATA_POLICY.maxNoteContentBytes,
      )),
      pinned: primitiveAt(`${path}.pinned`, () => parseLegacyBoolean(row.pinned)),
      archived: primitiveAt(`${path}.archived`, () => parseLegacyBoolean(row.archived)),
      statusEmoji: optionalOneLineAt(row.statusEmoji, `${path}.statusEmoji`, BACKUP_IMPORT_DATA_POLICY.maxNoteStatusCodePoints),
      subjectId: optionalIdAt(row.subjectId, `${path}.subjectId`),
      createdAt,
      updatedAt: optionalTimestampAt(row.updatedAt, `${path}.updatedAt`, createdAt),
    })
  }
  return { items, deleted }
}

function academicEventTypeAt(value: unknown, path: string): AcademicEventType {
  if (typeof value !== 'string' || !ACADEMIC_EVENT_TYPES.has(value as AcademicEventType)) {
    return invalid(path, 'no pertenece a la allowlist academica')
  }
  return value as AcademicEventType
}

function normalizeAcademicEvents(
  value: unknown,
  fallback: ISODateTimeString,
): NormalizedRows<AcademicEvent> {
  const rows = rowsAt(value, ACADEMIC_EVENTS_PATH, BACKUP_IMPORT_DATA_POLICY.maxAcademicEvents)
  const items: AcademicEvent[] = []
  let deleted = 0
  for (let index = 0; index < rows.length; index += 1) {
    const path = `${ACADEMIC_EVENTS_PATH}[${index}]`
    const row = recordAt(rows[index], path)
    if (isDeleted(row, path)) {
      deleted += 1
      continue
    }
    const createdAt = optionalTimestampAt(row.createdAt, `${path}.createdAt`, fallback)
    items.push({
      id: idAt(row.id, `${path}.id`),
      type: academicEventTypeAt(row.type, `${path}.type`),
      title: optionalOneLineAt(row.title, `${path}.title`, BACKUP_IMPORT_DATA_POLICY.maxAcademicEventTitleCodePoints),
      date: primitiveAt(`${path}.date`, () => parseISODate(row.date)),
      subjectId: optionalIdAt(row.subjectId, `${path}.subjectId`),
      createdAt,
      updatedAt: optionalTimestampAt(row.updatedAt, `${path}.updatedAt`, createdAt),
    })
  }
  return { items, deleted }
}

export function normalizeBackupImportEntities(
  documents: BackupImportJsonDocuments,
  fallback: ISODateTimeString,
): NormalizedBackupImportEntities {
  const subjects = normalizeSubjects(documents.subjects, fallback)
  const notes = normalizeNotes(documents.notes, fallback)
  const academicEvents = normalizeAcademicEvents(documents.academicEvents, fallback)
  return {
    data: {
      subjects: subjects.items,
      notes: notes.items,
      academicEvents: academicEvents.items,
    },
    deleted: {
      subjects: subjects.deleted,
      notes: notes.deleted,
      academicEvents: academicEvents.deleted,
    },
  }
}
