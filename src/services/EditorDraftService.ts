import type { EntityId, ISODateTimeString } from '../domain/primitives'

export const DRAFT_VERSION = 1
export const STORAGE_KEY = 'lumapse-editor-draft-v1'
export const MODES = Object.freeze({ CREATE: 'create', EDIT: 'edit' } as const)

export type EditorDraftMode = (typeof MODES)[keyof typeof MODES]

export interface EditorDraft {
  version: typeof DRAFT_VERSION
  mode: EditorDraftMode
  noteId: EntityId | null
  title: string
  content: string
  subjectId: EntityId | null
  baseUpdatedAt: ISODateTimeString | null
  savedAt: ISODateTimeString
}

interface EditorDraftInputFields {
  title?: string | null
  content?: string | null
  subjectId?: EntityId | null
  baseUpdatedAt?: ISODateTimeString | null
  savedAt?: ISODateTimeString | null
}

export type EditorDraftInput = EditorDraftInputFields & (
  | {
    mode: typeof MODES.CREATE
    noteId?: EntityId | null
  }
  | {
    mode: typeof MODES.EDIT
    noteId: EntityId
  }
)

interface NormalizeDraftOptions {
  stampSavedAt?: boolean
}

function getStorage(): Storage | null {
  try {
    return globalThis.localStorage || null
  } catch {
    return null
  }
}

function nullableString(value: unknown): string | null {
  if (value === undefined || value === null) return null
  const text = String(value).trim()
  return text || null
}

function textValue(value: unknown): string {
  if (value === undefined || value === null) return ''
  return String(value)
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeDraft(draft: unknown, { stampSavedAt = true }: NormalizeDraftOptions = {}): EditorDraft | null {
  if (!isObject(draft)) return null

  const mode = draft.mode === MODES.EDIT ? MODES.EDIT : draft.mode === MODES.CREATE ? MODES.CREATE : null
  if (!mode) return null

  const noteId = mode === MODES.EDIT ? nullableString(draft.noteId) : null
  if (mode === MODES.EDIT && !noteId) return null

  const savedAt = stampSavedAt ? new Date().toISOString() : nullableString(draft.savedAt)
  if (!savedAt) return null

  return {
    version: DRAFT_VERSION,
    mode,
    noteId,
    title: textValue(draft.title),
    content: textValue(draft.content),
    subjectId: nullableString(draft.subjectId),
    baseUpdatedAt: nullableString(draft.baseUpdatedAt),
    savedAt,
  }
}

function normalizeStoredDraft(payload: unknown): EditorDraft | null {
  if (!isObject(payload) || payload.version !== DRAFT_VERSION) return null
  return normalizeDraft(payload, { stampSavedAt: false })
}

export function saveDraft(draft: EditorDraftInput): EditorDraft | null {
  const storage = getStorage()
  if (!storage) return null

  const normalized = normalizeDraft(draft)
  if (!normalized) {
    clearDraft()
    return null
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(normalized))
    return normalized
  } catch {
    return null
  }
}

export function loadDraft(): EditorDraft | null {
  const storage = getStorage()
  if (!storage) return null

  let rawDraft: string | null
  try {
    rawDraft = storage.getItem(STORAGE_KEY)
  } catch {
    return null
  }

  if (!rawDraft) return null

  let payload: unknown
  try {
    payload = JSON.parse(rawDraft)
  } catch {
    clearDraft()
    return null
  }

  const normalized = normalizeStoredDraft(payload)
  if (!normalized) {
    clearDraft()
    return null
  }

  return normalized
}

export function clearDraft(): boolean {
  const storage = getStorage()
  if (!storage) return false

  try {
    storage.removeItem(STORAGE_KEY)
    return true
  } catch {
    return false
  }
}
