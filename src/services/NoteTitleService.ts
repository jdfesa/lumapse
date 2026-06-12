export const DEFAULT_NOTE_TITLE = 'Sin título'

const MARKDOWN_HEADING_REGEX = /^\s{0,3}#{1,6}\s+/
const STRUCTURAL_MARKDOWN_REGEX = /^\s*(?:[-*+]\s+|\d+\.\s+|>\s+|```|\|)/

interface NoteTitleSource {
  title?: string | null
  content?: string | null
}

interface SplitNoteForEditingResult {
  title: string
  body: string
}

interface NoteContentPresentation {
  title: string
  body: string
  lineOffset: number
}

interface RedundantTitleLine {
  lines: string[]
  titleLineIndex: number
}

function normalizeWhitespace(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

export function cleanTitleCandidate(line: unknown): string {
  return normalizeWhitespace(line)
    .replace(/^\s{0,3}#{1,6}\s+/, '')
    .replace(/^\s*(?:[-*+>]\s+|\d+\.\s+)/, '')
    .replace(/[*_~`[\]()]/g, '')
    .trim()
}

export function normalizeNoteTitle(title: unknown): string {
  const value = normalizeWhitespace(title)
  return value || DEFAULT_NOTE_TITLE
}

export function isDefaultNoteTitle(title: unknown): boolean {
  return normalizeNoteTitle(title).toLocaleLowerCase('es') === DEFAULT_NOTE_TITLE.toLocaleLowerCase('es')
}

function comparableTitle(value: unknown): string {
  return cleanTitleCandidate(value).toLocaleLowerCase('es')
}

export function extractNoteTitle(content: unknown, fallback: unknown = DEFAULT_NOTE_TITLE): string {
  const lines = String(content || '').split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('# ')) {
      return normalizeNoteTitle(trimmed.slice(2))
    }
  }

  for (const line of lines) {
    const clean = cleanTitleCandidate(line)
    if (clean) {
      return clean.length > 60 ? `${clean.substring(0, 57)}...` : clean
    }
  }

  return normalizeNoteTitle(fallback)
}

export function shouldDisplayNoteTitle(title: unknown): boolean {
  return Boolean(normalizeWhitespace(title)) && !isDefaultNoteTitle(title)
}

function lineMatchesNoteTitle(line: string, title: unknown): boolean {
  const trimmed = line.trim()
  const expected = comparableTitle(title)
  if (!trimmed || !expected) return false

  if (MARKDOWN_HEADING_REGEX.test(trimmed)) {
    return comparableTitle(trimmed.replace(MARKDOWN_HEADING_REGEX, '')) === expected
  }

  if (STRUCTURAL_MARKDOWN_REGEX.test(trimmed)) return false

  return comparableTitle(trimmed) === expected
}

function getRedundantTitleLine(content: unknown, title: unknown): RedundantTitleLine | null {
  const text = String(content || '')
  if (!text.trim() || !shouldDisplayNoteTitle(title)) return null

  const lines = text.split('\n')
  const titleLineIndex = lines.findIndex(line => line.trim())
  if (titleLineIndex === -1) return null

  if (!lineMatchesNoteTitle(lines[titleLineIndex], title)) {
    return null
  }

  return { lines, titleLineIndex }
}

export function stripRedundantTitleFromContent(content: unknown, title: unknown): string {
  const text = String(content || '')
  const redundantTitle = getRedundantTitleLine(text, title)
  if (!redundantTitle) {
    return text.trim()
  }

  const bodyLines = redundantTitle.lines.slice(redundantTitle.titleLineIndex + 1)
  while (bodyLines.length > 0 && !bodyLines[0].trim()) {
    bodyLines.shift()
  }

  return bodyLines.join('\n').trim()
}

export function splitNoteForEditing(note: NoteTitleSource = {}): SplitNoteForEditingResult {
  const title = shouldDisplayNoteTitle(note.title) ? normalizeNoteTitle(note.title) : ''
  const body = stripRedundantTitleFromContent(note.content || '', note.title)

  return { title, body }
}

export function getNoteContentPresentation(note: NoteTitleSource = {}): NoteContentPresentation {
  const title = shouldDisplayNoteTitle(note.title) ? normalizeNoteTitle(note.title) : ''
  const content = String(note.content || '')
  const redundantTitle = getRedundantTitleLine(content, title)

  if (!redundantTitle) {
    return {
      title,
      body: content,
      lineOffset: 0,
    }
  }

  const bodyLines = redundantTitle.lines.slice(redundantTitle.titleLineIndex + 1)
  let skippedBodyLines = 0

  while (bodyLines.length > 0 && !bodyLines[0].trim()) {
    bodyLines.shift()
    skippedBodyLines += 1
  }

  return {
    title,
    body: bodyLines.join('\n'),
    lineOffset: redundantTitle.titleLineIndex + 1 + skippedBodyLines,
  }
}

export function resolveNoteTitleForSave(title: unknown, content: unknown): string {
  const explicitTitle = normalizeWhitespace(title)
  if (explicitTitle) return normalizeNoteTitle(explicitTitle)

  const firstContentLine = String(content || '').split('\n').find(line => line.trim()) || ''
  const trimmed = firstContentLine.trim()
  if (trimmed.startsWith('# ')) {
    return normalizeNoteTitle(trimmed.slice(2))
  }

  return DEFAULT_NOTE_TITLE
}
