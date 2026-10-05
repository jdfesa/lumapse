import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  EditorDraftCapture,
  createEditorDraftPayload,
} from '../../../../src/components/note-editor/NoteEditorDrafts.js'
import { loadDraft, STORAGE_KEY } from '../../../../src/services/EditorDraftService.ts'

let fields
let blocked
let capture

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
  fields = {
    currentEditId: null,
    currentEditBaseUpdatedAt: null,
    title: 'Clase',
    content: 'Texto base',
    subjectId: 'section-1',
  }
  blocked = false
  capture = new EditorDraftCapture({
    createPayload: () => createEditorDraftPayload(fields),
    isBlocked: () => blocked,
  })
})

describe('EditorDraftCapture con almacenamiento real', () => {
  it('captura una nota nueva sin esperar timers ni eventos de salida', () => {
    capture.schedule()

    expect(loadDraft()).toMatchObject({
      mode: 'create', noteId: null, title: 'Clase', content: 'Texto base',
      subjectId: 'section-1', baseUpdatedAt: null,
    })
  })

  it('reemplaza inmediatamente cada cambio de titulo, contenido y seccion', () => {
    capture.schedule()
    for (const [field, value] of [
      ['title', 'Clase 2'], ['content', 'Texto baseZ'], ['subjectId', 'section-2'],
    ]) {
      fields[field] = value
      capture.schedule()
      expect(loadDraft()?.[field]).toBe(value)
    }
  })

  it('captura la ultima escritura de edicion con su identidad y version base', () => {
    fields.currentEditId = 'note-1'
    fields.currentEditBaseUpdatedAt = '2026-10-04T12:00:00.000Z'
    capture.schedule()
    fields.content += 'Z'
    capture.schedule()

    expect(loadDraft()).toMatchObject({
      mode: 'edit', noteId: 'note-1', content: 'Texto baseZ',
      baseUpdatedAt: fields.currentEditBaseUpdatedAt,
    })
  })

  it('no sobrescribe el borrador durante aplicacion de estado o guardado', () => {
    capture.schedule()
    const previous = localStorage.getItem(STORAGE_KEY)
    blocked = true
    fields.content = 'Estado intermedio'
    capture.schedule()
    capture.flush()
    vi.runAllTimers()

    expect(loadDraft()?.content).toBe('Texto base')
    expect(localStorage.getItem(STORAGE_KEY)).toBe(previous)
  })

  it('elimina inmediatamente un borrador de creacion al vaciar sus campos', () => {
    capture.schedule()
    vi.advanceTimersByTime(500)
    expect(loadDraft()).not.toBeNull()
    fields.title = ' '
    fields.content = ''
    capture.schedule()

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('no recrea el borrador descartado al salir o ejecutar timers', () => {
    capture.schedule()
    expect(loadDraft()).not.toBeNull()
    capture.discard()
    capture.flush()
    vi.runAllTimers()

    expect(loadDraft()).toBeNull()
  })

  it('no captura una nota seleccionada sin cambios al salir', () => {
    fields.currentEditId = 'note-1'
    capture.flush()

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
