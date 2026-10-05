import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { postWriteRefreshHarness } from '../store/postWriteRefreshHarness.js'

let harness, drafts, restarted, key
const input = { mode: 'create', title: 'Clase', content: 'Matrices', subjectId: null }
const legacy = { ...input, version: 1, noteId: null, baseUpdatedAt: null, savedAt: '2026-06-07T03:00:00.000Z' }

beforeEach(async () => {
  localStorage.clear()
  harness = await postWriteRefreshHarness()
  drafts = await import('../../../src/services/EditorDraftService.ts')
  key = drafts.STORAGE_KEY
  restarted = () => drafts.createEditorDraftService()
})
afterEach(() => { harness?.fixture.close(); localStorage.clear() })

function persisted() {
  return harness.fixture.database.exec(`SELECT value FROM metadata WHERE key = '${key}'`)[0]?.values[0][0]
}

describe('EditorDraftService con SQLite real', () => {
  it('normaliza creación y edición, y recupera desde otra instancia sin localStorage', async () => {
    await drafts.initializeDraftStorage()
    const saved = await drafts.saveDraft({ ...input, noteId: 'ignored', subjectId: ' algebra ' })
    expect(saved).toMatchObject({ ...input, version: 1, noteId: null, subjectId: 'algebra', baseUpdatedAt: null })
    expect(persisted()).toBe(JSON.stringify(saved))
    const edit = await drafts.saveDraft({ ...input, mode: 'edit', noteId: 'note-1', baseUpdatedAt: legacy.savedAt })
    const fresh = restarted()
    await fresh.initializeDraftStorage()
    expect(fresh.loadDraft()).toEqual(edit)
    expect(localStorage.getItem(key)).toBeNull()
    expect(harness.state.notes).toHaveLength(0)
    fresh.loadDraft().title = 'mutación externa'
    expect(fresh.loadDraft().title).toBe('Clase')
  })

  it('migra una sola vez y elimina legacy solo después del commit', async () => {
    localStorage.setItem(key, JSON.stringify(legacy))
    const commit = harness.db.commitTransaction.getMockImplementation()
    harness.db.commitTransaction.mockImplementation(async () => {
      expect(localStorage.getItem(key)).toBe(JSON.stringify(legacy))
      return commit()
    })
    await Promise.all([drafts.initializeDraftStorage(), drafts.initializeDraftStorage()])
    expect(drafts.loadDraft()).toEqual(legacy)
    expect(localStorage.getItem(key)).toBeNull()
    expect(harness.db.run.mock.calls.filter(([, values]) => values?.[0] === key)).toHaveLength(1)
  })

  it('retiene legacy si falla la migración y permite reintentar', async () => {
    localStorage.setItem(key, JSON.stringify(legacy))
    harness.db.run.mockRejectedValueOnce(new Error('write failed'))
    await expect(drafts.initializeDraftStorage()).rejects.toThrow('write failed')
    expect(localStorage.getItem(key)).toBe(JSON.stringify(legacy))
    expect(persisted()).toBeUndefined()
    expect(() => drafts.loadDraft()).toThrow('not initialized')
    await drafts.initializeDraftStorage()
    expect(drafts.loadDraft()).toEqual(legacy)
  })

  it('no confunde fallo de lectura legacy con ausencia', async () => {
    const service = drafts.createEditorDraftService(undefined, () => { throw new Error('legacy unavailable') })
    await expect(service.initializeDraftStorage()).rejects.toThrow('legacy unavailable')
    expect(persisted()).toBeUndefined()
  })

  it('el marcador null impide resucitar legacy aunque falle su limpieza', async () => {
    await drafts.initializeDraftStorage()
    await drafts.saveDraft(input)
    await drafts.clearDraft()
    localStorage.setItem(key, JSON.stringify(legacy))
    const fresh = drafts.createEditorDraftService(undefined, () => { throw new Error('legacy unavailable') })
    await fresh.initializeDraftStorage()
    expect(fresh.loadDraft()).toBeNull()
    expect(persisted()).toBe('null')
  })

  it.each(['{broken', JSON.stringify({ version: 99 })])('rechaza SQLite inválido sin sobrescribirlo: %s', async raw => {
    harness.fixture.database.run('INSERT INTO metadata VALUES (?, ?)', [key, raw])
    await expect(drafts.initializeDraftStorage()).rejects.toThrow()
    expect(persisted()).toBe(raw)
  })

  it.each(['{broken', JSON.stringify({ version: 1, mode: 'edit', noteId: '' })])('descarta legacy inválido como antes: %s', async raw => {
    localStorage.setItem(key, raw)
    await drafts.initializeDraftStorage()
    expect(drafts.loadDraft()).toBeNull()
    expect(persisted()).toBe('null')
  })

  it('conserva el último commit si falla guardar, limpiar o validar el payload', async () => {
    await drafts.initializeDraftStorage()
    const saved = await drafts.saveDraft(input)
    for (const operation of [() => drafts.saveDraft({ ...input, title: 'otro' }), () => drafts.clearDraft()]) {
      harness.db.run.mockRejectedValueOnce(new Error('write failed'))
      await expect(operation()).rejects.toThrow('write failed')
      expect(drafts.loadDraft()).toEqual(saved)
      expect(persisted()).toBe(JSON.stringify(saved))
    }
    await expect(drafts.saveDraft({ mode: 'unknown' })).rejects.toThrow('Invalid')
    expect(drafts.loadDraft()).toEqual(saved)
  })

  it('ordena capturas rápidas y limpieza sin resurrección ni notas automáticas', async () => {
    await drafts.initializeDraftStorage()
    await Promise.all([drafts.saveDraft(input), drafts.saveDraft({ ...input, content: 'último' }), drafts.clearDraft()])
    const fresh = restarted()
    await fresh.initializeDraftStorage()
    expect(fresh.loadDraft()).toBeNull()
    expect(harness.fixture.database.exec('SELECT id FROM notes')).toEqual([])
  })

  it.each(['create', 'edit'])('confirma nota y limpieza en la misma transacción: %s', async mode => {
    await drafts.initializeDraftStorage()
    const old = mode === 'edit' ? await harness.store.createNote('Original', 'Antes') : null
    await drafts.saveDraft(input)
    const note = old
      ? await harness.store.updateNote(old.id, { title: 'Final' }, { clearDraft: true })
      : await harness.store.createNote('Final', 'Texto', null, { clearDraft: true })
    expect(note.title).toBe('Final')
    expect(drafts.loadDraft()).toBeNull()
    expect(persisted()).toBe('null')
    expect(harness.fixture.database.exec('SELECT id FROM notes')[0].values).toEqual([[note.id]])
  })

  it.each(['create', 'edit'])('revierte la nota si falla limpiar su borrador: %s', async mode => {
    await drafts.initializeDraftStorage()
    const old = mode === 'edit' ? await harness.store.createNote('Original', 'Antes') : null
    const saved = await drafts.saveDraft(input)
    const run = harness.db.run.getMockImplementation()
    harness.db.run.mockImplementation((sql, values) => {
      if (values?.[0] === key) throw new Error('clear failed')
      return run(sql, values)
    })
    const operation = old
      ? harness.store.updateNote(old.id, { title: 'Final' }, { clearDraft: true })
      : harness.store.createNote('Final', 'Texto', null, { clearDraft: true })
    await expect(operation).rejects.toThrow('clear failed')
    expect(drafts.loadDraft()).toEqual(saved)
    expect(persisted()).toBe(JSON.stringify(saved))
    expect(harness.fixture.database.exec('SELECT title FROM notes')[0]?.values || []).toEqual(old ? [['Original']] : [])
  })

  it('CRUD ajeno al editor no consume su borrador', async () => {
    await drafts.initializeDraftStorage()
    const saved = await drafts.saveDraft(input)
    const note = await harness.store.createNote('Otra nota', 'contenido')
    await harness.store.updateNote(note.id, { title: 'Renombrada' })
    expect(drafts.loadDraft()).toEqual(saved)
    expect(persisted()).toBe(JSON.stringify(saved))
  })
})
