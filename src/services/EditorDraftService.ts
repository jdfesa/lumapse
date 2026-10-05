import { editorDraftStorage, EDITOR_DRAFT_KEY } from './sqlite/editorDrafts.js'
import type { EntityId, ISODateTimeString } from '../domain/primitives'

export const DRAFT_VERSION = 1
export const STORAGE_KEY = EDITOR_DRAFT_KEY
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

interface DraftStorage {
  read(): Promise<string | undefined>
  write(value: string, scope?: object): Promise<unknown>
  transaction<T>(action: (scope: object) => Promise<T>): Promise<T>
}

export function createEditorDraftService(
  storage: DraftStorage = editorDraftStorage,
  legacyStorage: () => Storage | undefined = () => globalThis.localStorage,
) {
  let cached: EditorDraft | null = null
  let initialized = false
  let initialization: Promise<void> | null = null

  function requireInitialized() {
    if (!initialized) throw new Error('Editor draft storage is not initialized')
  }

  function removeLegacy() {
    // SQLite ya es autoritativo. Un fallo de limpieza no habilita reimportación.
    try { legacyStorage()?.removeItem(STORAGE_KEY) } catch { /* limpieza best-effort */ }
  }

  async function initialize() {
    const stored = await storage.read()
    let draft: EditorDraft | null = null
    if (stored === undefined) {
      // No confundir una lectura fallida con la ausencia de un borrador anterior.
      const raw = legacyStorage()?.getItem(STORAGE_KEY)
      if (raw) {
        try { draft = normalizeStoredDraft(JSON.parse(raw)) } catch { /* legacy inválido */ }
      }
      await storage.write(JSON.stringify(draft))
    } else if (stored !== 'null') {
      draft = normalizeStoredDraft(JSON.parse(stored))
      if (!draft) throw new Error('Invalid persisted editor draft')
    }
    cached = draft
    initialized = true
    removeLegacy()
  }

  return {
    initializeDraftStorage(): Promise<void> {
      if (initialized) return Promise.resolve()
      if (!initialization) {
        initialization = initialize().catch(error => {
          initialization = null
          throw error
        })
      }
      return initialization
    },
    loadDraft(): EditorDraft | null {
      requireInitialized()
      return cached ? { ...cached } : null
    },
    async saveDraft(input: EditorDraftInput): Promise<EditorDraft> {
      requireInitialized()
      const draft = normalizeDraft(input)
      if (!draft) throw new Error('Invalid editor draft input')
      await storage.write(JSON.stringify(draft))
      cached = draft
      return { ...draft }
    },
    async clearDraft(): Promise<void> {
      requireInitialized()
      await storage.write('null')
      cached = null
    },
    async consumeDraft<T>(writeNote: (scope: object) => Promise<T>): Promise<T> {
      requireInitialized()
      const result = await storage.transaction(async scope => {
        const note = await writeNote(scope)
        await storage.write('null', scope)
        return note
      })
      cached = null
      return result
    },
  }
}

export const { initializeDraftStorage, saveDraft, loadDraft, clearDraft, consumeDraft } = createEditorDraftService()
