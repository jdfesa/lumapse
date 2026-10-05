import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EditorDraftCapture, createEditorDraftPayload } from '../../../../src/components/note-editor/NoteEditorDrafts.js'
import { saveDraft, clearDraft } from '../../../../src/services/EditorDraftService.ts'
import { deferred } from '../../services/sqlite/sqliteFixture.js'

vi.mock('../../../../src/services/EditorDraftService.ts', () => ({ saveDraft: vi.fn(), clearDraft: vi.fn(), loadDraft: vi.fn() }))
let fields, blocked, capture, onError
beforeEach(() => {
  vi.resetAllMocks()
  saveDraft.mockResolvedValue(null)
  clearDraft.mockResolvedValue(undefined)
  fields = { currentEditId: null, currentEditBaseUpdatedAt: null, title: 'Clase', content: 'Texto base', subjectId: 'section-1' }
  blocked = false
  onError = vi.fn()
  capture = new EditorDraftCapture({ createPayload: () => createEditorDraftPayload(fields), isBlocked: () => blocked, onError })
})

describe('EditorDraftCapture asíncrono', () => {
  it('envía snapshots por cada input sin debounce ni eventos de salida', async () => {
    capture.schedule()
    fields.title = 'Clase 2'
    capture.schedule()
    fields.content += 'Z'
    await capture.schedule()
    expect(saveDraft.mock.calls.map(([draft]) => [draft.title, draft.content])).toEqual([
      ['Clase', 'Texto base'], ['Clase 2', 'Texto base'], ['Clase 2', 'Texto baseZ'],
    ])
    expect(capture.hasChanges).toBe(false)
  })

  it('captura identidad y base de edición', async () => {
    fields.currentEditId = 'note-1'
    fields.currentEditBaseUpdatedAt = '2026-10-04T12:00:00.000Z'
    await capture.schedule()
    expect(saveDraft).toHaveBeenCalledWith(expect.objectContaining({ mode: 'edit', noteId: 'note-1', baseUpdatedAt: fields.currentEditBaseUpdatedAt }))
  })

  it('no sobrescribe durante aplicación de estado o guardado', async () => {
    await capture.schedule()
    blocked = true
    fields.content = 'intermedio'
    await capture.schedule()
    await capture.flush()
    expect(saveDraft).toHaveBeenCalledTimes(1)
  })

  it('vaciar creación limpia; vaciar edición conserva la identidad', async () => {
    fields.title = ' '
    fields.content = ''
    await capture.schedule()
    expect(clearDraft).toHaveBeenCalledTimes(1)
    fields.currentEditId = 'note-1'
    await capture.schedule()
    expect(saveDraft).toHaveBeenCalledWith(expect.objectContaining({ mode: 'edit', noteId: 'note-1', content: '' }))
  })

  it('una confirmación antigua no marca limpio un snapshot más reciente', async () => {
    const first = deferred(), second = deferred()
    saveDraft.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    const a = capture.schedule()
    fields.content += 'Z'
    const b = capture.schedule()
    first.resolve()
    await a
    expect(capture.hasChanges).toBe(true)
    expect(capture.flush()).toBe(b)
    expect(saveDraft).toHaveBeenCalledTimes(2)
    second.resolve()
    await b
    expect(capture.hasChanges).toBe(false)
  })

  it('informa fallos y reintenta el snapshot capturado, sin rechazo huérfano', async () => {
    saveDraft.mockRejectedValueOnce(new Error('write failed'))
    await capture.schedule()
    expect(capture.hasChanges).toBe(true)
    expect(onError).toHaveBeenCalledTimes(1)
    fields.content = 'cambio programático no capturado'
    await capture.flush()
    expect(saveDraft).toHaveBeenLastCalledWith(expect.objectContaining({ content: 'Texto base' }))
    expect(capture.hasChanges).toBe(false)
  })

  it('espera la limpieza antes de descartar y no recrea al salir', async () => {
    await capture.schedule()
    const clearing = deferred()
    clearDraft.mockReturnValueOnce(clearing.promise)
    const discard = capture.discard()
    clearing.resolve()
    await discard
    await capture.flush()
    expect(saveDraft).toHaveBeenCalledTimes(1)
    expect(clearDraft).toHaveBeenCalledTimes(1)
  })

  it('no captura una selección sin cambios ni vuelve a limpiar tras guardado atómico', async () => {
    fields.currentEditId = 'note-1'
    await capture.flush()
    capture.markSaved()
    await capture.flush()
    expect(saveDraft).not.toHaveBeenCalled()
    expect(clearDraft).not.toHaveBeenCalled()
  })
})
