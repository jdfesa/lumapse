// =============================================================
// backup/BackupZipService
//
// Responsabilidad: construir el ZIP de backup desde datos ya
// normalizados, sin depender de UI, Android ni SQLite directamente.
// =============================================================

import JSZip from 'jszip'
import {
  buildBackupManifest,
  createBackupFilename,
  createUniqueFilename,
  slugifyBackupPath,
} from './BackupFormat.js'

export const BACKUP_MIME_TYPE = 'application/zip'

function activeRows(rows = []) {
  return rows.filter(row => !row.deletedAt)
}

function normalizeBoolean(value) {
  return Boolean(value)
}

function normalizeSubjects(subjects = []) {
  return activeRows(subjects).map(subject => ({
    id: subject.id,
    name: subject.name,
    parentSubjectId: subject.parentSubjectId || null,
    archived: normalizeBoolean(subject.archived),
    color: subject.color || null,
    createdAt: subject.createdAt || null,
  }))
}

function normalizeNotes(notes = []) {
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

function normalizeAcademicEvents(academicEvents = []) {
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

function toPrettyJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

function buildSubjectPath(subject, subjectsById) {
  if (!subject) return ['entrada']

  if (subject.parentSubjectId) {
    const parent = subjectsById.get(subject.parentSubjectId)
    if (!parent) return ['entrada']
    return [slugifyBackupPath(parent.name), slugifyBackupPath(subject.name)]
  }

  return [slugifyBackupPath(subject.name)]
}

function frontMatterLine(key, value) {
  return `${key}: ${value ?? ''}`
}

export function noteToMarkdown(note) {
  const lines = [
    '---',
    frontMatterLine('id', note.id),
    frontMatterLine('title', note.title),
    frontMatterLine('subjectId', note.subjectId),
    frontMatterLine('createdAt', note.createdAt),
    frontMatterLine('updatedAt', note.updatedAt),
    '---',
    '',
  ]

  const content = (note.content || '').trim()
  lines.push(content || `# ${note.title}`)

  return `${lines.join('\n').trimEnd()}\n`
}

function addMarkdownNotes(zip, notes, subjects) {
  const subjectsById = new Map(subjects.map(subject => [subject.id, subject]))
  const usedNamesByDirectory = new Map()
  const paths = []

  for (const note of notes) {
    const subjectPath = buildSubjectPath(subjectsById.get(note.subjectId), subjectsById)
    const directory = `notes/${subjectPath.join('/')}`

    if (!usedNamesByDirectory.has(directory)) {
      usedNamesByDirectory.set(directory, new Set())
    }

    const filename = createUniqueFilename(note.title, usedNamesByDirectory.get(directory))
    const path = `${directory}/${filename}`
    zip.file(path, noteToMarkdown(note))
    paths.push(path)
  }

  return paths
}

function createReadmeText(manifest) {
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

/**
 * Genera un ZIP de backup desde datos ya leidos por la app.
 * @param {object} data Datos exportables
 * @param {object[]} data.subjects Materias y secciones
 * @param {object[]} data.notes Notas
 * @param {object[]} data.academicEvents Fechas academicas
 * @param {object} options Opciones de generacion
 * @param {Date|string|number} options.createdAt Fecha de creacion
 * @param {'blob'|'arraybuffer'|'base64'} options.type Tipo de salida JSZip
 * @returns {Promise<{content: Blob|ArrayBuffer|string, contentType: string, filename: string, manifest: object}>}
 */
export async function generateBackupZip(data = {}, options = {}) {
  const subjects = normalizeSubjects(data.subjects)
  const notes = normalizeNotes(data.notes)
  const academicEvents = normalizeAcademicEvents(data.academicEvents)

  if (subjects.length === 0 && notes.length === 0 && academicEvents.length === 0) {
    throw new Error('Todavia no hay notas, materias ni fechas para respaldar.')
  }

  const createdAt = options.createdAt || new Date()
  const filename = options.filename || createBackupFilename(createdAt)
  const zip = new JSZip()
  const files = [
    'data/subjects.json',
    'data/notes.json',
    'data/academic-events.json',
    'README.txt',
    'manifest.json',
  ]

  zip.file('data/subjects.json', toPrettyJson(subjects))
  zip.file('data/notes.json', toPrettyJson(notes))
  zip.file('data/academic-events.json', toPrettyJson(academicEvents))
  files.push(...addMarkdownNotes(zip, notes, subjects))

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

  zip.file('manifest.json', toPrettyJson(manifest))
  zip.file('README.txt', createReadmeText(manifest))

  const content = await zip.generateAsync({
    type: options.type || 'blob',
    compression: 'DEFLATE',
  })

  return {
    content,
    contentType: BACKUP_MIME_TYPE,
    filename,
    manifest,
  }
}
