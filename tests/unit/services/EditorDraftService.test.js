import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  DRAFT_VERSION,
  STORAGE_KEY,
  clearDraft,
  loadDraft,
  saveDraft,
} from '../../../src/services/EditorDraftService.js'

const SAVED_AT = new Date('2026-06-07T03:00:00.000Z')

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
  vi.setSystemTime(SAVED_AT)
})

describe('EditorDraftService', () => {
  it('guarda y carga un borrador de nota nueva normalizado', () => {
    const saved = saveDraft({
      mode: 'create',
      noteId: 'ignored-for-create',
      title: 'Clase 1',
      content: 'Matrices',
      subjectId: ' algebra ',
      baseUpdatedAt: '',
    })

    expect(saved).toEqual({
      version: DRAFT_VERSION,
      mode: 'create',
      noteId: null,
      title: 'Clase 1',
      content: 'Matrices',
      subjectId: 'algebra',
      baseUpdatedAt: null,
      savedAt: SAVED_AT.toISOString(),
    })
    expect(loadDraft()).toEqual(saved)
  })

  it('guarda y carga un borrador de edicion asociado a una nota', () => {
    const saved = saveDraft({
      mode: 'edit',
      noteId: 'note-1',
      title: 'Resumen actualizado',
      content: 'Contenido pendiente',
      subjectId: null,
      baseUpdatedAt: '2026-06-06T10:00:00.000Z',
    })

    expect(loadDraft()).toEqual({
      version: DRAFT_VERSION,
      mode: 'edit',
      noteId: 'note-1',
      title: 'Resumen actualizado',
      content: 'Contenido pendiente',
      subjectId: null,
      baseUpdatedAt: '2026-06-06T10:00:00.000Z',
      savedAt: SAVED_AT.toISOString(),
    })
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(saved))
  })

  it('limpia el borrador persistido', () => {
    saveDraft({ mode: 'create', title: 'Clase', content: '', subjectId: null })

    expect(clearDraft()).toBe(true)

    expect(loadDraft()).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('borra y retorna null cuando encuentra JSON corrupto', () => {
    localStorage.setItem(STORAGE_KEY, '{mal-json')

    expect(loadDraft()).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('borra y retorna null cuando encuentra un payload invalido', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: DRAFT_VERSION,
      mode: 'edit',
      noteId: '',
      title: 'Sin nota asociada',
      content: '',
      savedAt: SAVED_AT.toISOString(),
    }))

    expect(loadDraft()).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('no persiste payloads invalidos al guardar', () => {
    saveDraft({ mode: 'create', title: 'Valido', content: '' })

    expect(saveDraft({ mode: 'unknown', title: 'Invalido' })).toBeNull()
    expect(loadDraft()).toBeNull()
  })

  it('falla en silencio cuando localStorage no esta disponible', () => {
    const failingStorage = {
      getItem: vi.fn(() => {
        throw new Error('storage unavailable')
      }),
      setItem: vi.fn(() => {
        throw new Error('storage unavailable')
      }),
      removeItem: vi.fn(() => {
        throw new Error('storage unavailable')
      }),
    }
    vi.stubGlobal('localStorage', failingStorage)

    expect(() => saveDraft({ mode: 'create', title: 'Clase', content: '' })).not.toThrow()
    expect(() => loadDraft()).not.toThrow()
    expect(() => clearDraft()).not.toThrow()
    expect(saveDraft({ mode: 'create', title: 'Clase', content: '' })).toBeNull()
    expect(loadDraft()).toBeNull()
    expect(clearDraft()).toBe(false)
  })
})
