const DRAFT_VERSION = 1
const STORAGE_KEY = 'lumapse-editor-draft-v1'
const MODES = Object.freeze({ CREATE: 'create', EDIT: 'edit' })

function getStorage() {
  try {
    return globalThis.localStorage || null
  } catch {
    return null
  }
}

function nullableString(value) {
  if (value === undefined || value === null) return null
  const text = String(value).trim()
  return text || null
}

function textValue(value) {
  if (value === undefined || value === null) return ''
  return String(value)
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeDraft(draft, { stampSavedAt = true } = {}) {
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

function normalizeStoredDraft(payload) {
  if (!isObject(payload) || payload.version !== DRAFT_VERSION) return null
  return normalizeDraft(payload, { stampSavedAt: false })
}

export function saveDraft(draft) {
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

export function loadDraft() {
  const storage = getStorage()
  if (!storage) return null

  let rawDraft
  try {
    rawDraft = storage.getItem(STORAGE_KEY)
  } catch {
    return null
  }

  if (!rawDraft) return null

  let payload
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

export function clearDraft() {
  const storage = getStorage()
  if (!storage) return false

  try {
    storage.removeItem(STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

export { DRAFT_VERSION, MODES, STORAGE_KEY }
