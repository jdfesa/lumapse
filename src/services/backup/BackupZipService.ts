// =============================================================
// backup/BackupZipService
//
// Responsabilidad: construir el ZIP de backup desde datos ya
// normalizados, sin depender de UI, Android ni SQLite directamente.
// =============================================================

import {
  buildBackupManifest,
  createBackupFilename,
  createUniqueFilename,
  slugifyBackupPath,
} from './BackupFormat'
import { createZipContent } from './BackupZipArchive'
import { stripRedundantTitleFromContent } from '../NoteTitleService'
import type {
  BackupData,
  BackupZipContent,
  BackupZipOptions,
  GeneratedBackupZip,
} from '../../domain/backup'
import type { AcademicEventType } from '../../domain/academicEvents'
import type { EntityId, HexColor, ISODateString, ISODateTimeString } from '../../domain/primitives'

export const BACKUP_MIME_TYPE = 'application/zip'

type DeletedRow = {
  deletedAt?: ISODateTimeString | null
}

interface BackupSubjectRow extends DeletedRow {
  id: EntityId
  name: string
  parentSubjectId: EntityId | null
  archived: boolean
  color: HexColor | null
  createdAt: ISODateTimeString | null
}

interface BackupNoteRow extends DeletedRow {
  id: EntityId
  title: string
  content: string
  pinned: boolean
  archived: boolean
  statusEmoji: string | null
  subjectId: EntityId | null
  createdAt: ISODateTimeString | null
  updatedAt: ISODateTimeString | null
}

interface BackupAcademicEventRow {
  id: EntityId
  type: AcademicEventType
  title: string | null
  date: ISODateString
  subjectId: EntityId | null
  createdAt: ISODateTimeString | null
  updatedAt: ISODateTimeString | null
}

interface ZipTextFile {
  path: string
  content: string
}

function activeRows<T extends DeletedRow>(rows: T[] = []): T[] {
  return rows.filter(row => !row.deletedAt)
}

function normalizeBoolean(value: unknown): boolean {
  return Boolean(value)
}

function normalizeSubjects(subjects: BackupData['subjects'] = []): BackupSubjectRow[] {
  return activeRows(subjects).map(subject => ({
    id: subject.id,
    name: subject.name,
    parentSubjectId: subject.parentSubjectId || null,
    archived: normalizeBoolean(subject.archived),
    color: subject.color || null,
    createdAt: subject.createdAt || null,
  }))
}

function normalizeNotes(notes: BackupData['notes'] = []): BackupNoteRow[] {
  return activeRows(notes).map(note => ({
    id: note.id,
    title: note.title || 'Sin titulo',
    content: note.content || '',
    pinned: normalizeBoolean(note.pinned),
    archived: normalizeBoolean(note.archived),
    statusEmoji: note.statusEmoji || null,
    subjectId: note.subjectId || null,
    createdAt: note.createdAt || null,
    updatedAt: note.updatedAt || null,
  }))
}

function normalizeAcademicEvents(academicEvents: BackupData['academicEvents'] = []): BackupAcademicEventRow[] {
  return academicEvents.map(event => ({
    id: event.id,
    type: event.type,
    title: event.title || null,
    date: event.date,
    subjectId: event.subjectId || null,
    createdAt: event.createdAt || null,
    updatedAt: event.updatedAt || null,
  }))
}

function toPrettyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}

function buildSubjectPath(
  subject: BackupSubjectRow | undefined,
  subjectsById: Map<EntityId, BackupSubjectRow>,
): string[] {
  if (!subject) return ['entrada']

  if (subject.parentSubjectId) {
    const parent = subjectsById.get(subject.parentSubjectId)
    if (!parent) return ['entrada']
    return [slugifyBackupPath(parent.name), slugifyBackupPath(subject.name)]
  }

  return [slugifyBackupPath(subject.name)]
}

function singleLineValue(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function frontMatterLine(key: string, value: unknown): string {
  return `${key}: ${singleLineValue(value)}`
}

function markdownTitle(title: unknown): string {
  return singleLineValue(title) || 'Sin titulo'
}

export function noteToMarkdown(note: Partial<BackupNoteRow> = {}): string {
  const title = markdownTitle(note.title)
  const content = stripRedundantTitleFromContent(note.content || '', title)
  const lines = [
    '---',
    frontMatterLine('id', note.id),
    frontMatterLine('title', title),
    frontMatterLine('subjectId', note.subjectId),
    frontMatterLine('createdAt', note.createdAt),
    frontMatterLine('updatedAt', note.updatedAt),
    '---',
    '',
  ]

  lines.push(`# ${title}`)
  if (content) lines.push('', content)

  return `${lines.join('\n').trimEnd()}\n`
}

function addMarkdownNotes(
  zipFiles: ZipTextFile[],
  notes: BackupNoteRow[],
  subjects: BackupSubjectRow[],
): string[] {
  const subjectsById = new Map(subjects.map(subject => [subject.id, subject]))
  const usedNamesByDirectory = new Map<string, Set<string>>()
  const paths: string[] = []

  for (const note of notes) {
    const subject = note.subjectId ? subjectsById.get(note.subjectId) : undefined
    const subjectPath = buildSubjectPath(subject, subjectsById)
    const directory = `notes/${subjectPath.join('/')}`

    let usedNames = usedNamesByDirectory.get(directory)
    if (!usedNames) {
      usedNames = new Set()
      usedNamesByDirectory.set(directory, usedNames)
    }

    const filename = createUniqueFilename(note.title, usedNames)
    const path = `${directory}/${filename}`
    zipFiles.push({ path, content: noteToMarkdown(note) })
    paths.push(path)
  }

  return paths
}

function createReadmeText(manifest: GeneratedBackupZip['manifest']): string {
  return [
    'Lumapse backup',
    '==============',
    '',
    `Archivo: ${manifest.filename}`,
    `Formato: ${manifest.backupFormatVersion}`,
    `Creado: ${manifest.createdAt}`,
    '',
    'Contenido:',
    `- Materias/secciones: ${manifest.counts.subjects}`,
    `- Notas: ${manifest.counts.notes}`,
    `- Fechas academicas: ${manifest.counts.academicEvents}`,
    '',
    'Este archivo es un backup manual. No representa sincronizacion automatica.',
    'Los archivos Markdown dentro de notes/ son legibles sin Lumapse.',
    'Los JSON dentro de data/ son el contrato restaurable para Lumapse.',
    '',
  ].join('\n')
}

/** Genera un ZIP de backup desde datos ya leidos por la app. */
export async function generateBackupZip(
  data: Partial<BackupData> = {},
  options: BackupZipOptions = {},
): Promise<GeneratedBackupZip> {
  const subjects = normalizeSubjects(data.subjects)
  const notes = normalizeNotes(data.notes)
  const academicEvents = normalizeAcademicEvents(data.academicEvents)

  if (subjects.length === 0 && notes.length === 0 && academicEvents.length === 0) {
    throw new Error('Todavia no hay notas, materias ni fechas para respaldar.')
  }

  const createdAt = options.createdAt || new Date()
  const filename = options.filename || createBackupFilename(createdAt)
  const zipFiles: ZipTextFile[] = []
  const files = [
    'data/subjects.json',
    'data/notes.json',
    'data/academic-events.json',
    'README.txt',
    'manifest.json',
  ]

  zipFiles.push(
    { path: 'data/subjects.json', content: toPrettyJson(subjects) },
    { path: 'data/notes.json', content: toPrettyJson(notes) },
    { path: 'data/academic-events.json', content: toPrettyJson(academicEvents) }
  )
  files.push(...addMarkdownNotes(zipFiles, notes, subjects))

  const manifest = buildBackupManifest({
    createdAt,
    filename,
    counts: {
      subjects: subjects.length,
      notes: notes.length,
      academicEvents: academicEvents.length,
    },
    files,
  })

  zipFiles.push(
    { path: 'manifest.json', content: toPrettyJson(manifest) },
    { path: 'README.txt', content: createReadmeText(manifest) }
  )

  const content = createZipContent(zipFiles, {
    createdAt,
    type: options.type || 'blob',
    mimeType: BACKUP_MIME_TYPE,
  }) as BackupZipContent

  return {
    content,
    contentType: BACKUP_MIME_TYPE,
    filename,
    manifest,
  }
}
