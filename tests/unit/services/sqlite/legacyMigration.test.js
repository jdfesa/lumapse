import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { migrateLegacyNotes } from '../../../../src/services/sqlite/legacyMigration.js'
import { createWriteCoordinator } from '../../../../src/services/sqlite/writeCoordinator.js'
import { sqliteFixture } from './sqliteFixture.js'

let fixture, coordinator
beforeEach(async () => {
  fixture = await sqliteFixture()
  fixture.database.run(`CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT);
    CREATE TABLE notes (id TEXT PRIMARY KEY, title TEXT, content TEXT, pinned INTEGER, archived INTEGER, createdAt TEXT, updatedAt TEXT)`)
  coordinator = createWriteCoordinator(fixture.adapter, async () => {})
})
afterEach(() => fixture.close())

function legacyStore({ notes = [], absent = false, missingStore = false, openError, readError, blocked = false } = {}) {
  const idb = { close: vi.fn(), objectStoreNames: { contains: () => !missingStore } }
  const transaction = { objectStore: () => ({ getAll: () => ({ result: notes }) }), error: readError }
  idb.transaction = () => {
    queueMicrotask(() => readError ? transaction.onerror() : transaction.oncomplete())
    return transaction
  }
  const open = vi.fn(() => {
    const request = { result: idb, error: openError, transaction: { abort: () => queueMicrotask(() => request.onerror()) } }
    queueMicrotask(() => {
      if (absent) request.onupgradeneeded()
      else if (openError) request.onerror()
      else if (blocked) { request.onblocked(); request.onsuccess() }
      else request.onsuccess()
    })
    return request
  })
  vi.stubGlobal('indexedDB', { open })
  return { open, idb }
}
const flag = async () => (await coordinator.getDb().query('SELECT * FROM metadata')).values

describe('migración legada estricta y no destructiva', () => {
  it.each([{ absent: true }, { missingStore: true }])('tolera ausencia comprobada %j y registra el resultado', async options => {
    legacyStore(options)
    await migrateLegacyNotes(coordinator)
    expect(await flag()).toEqual([{ key: 'indexeddb_migrated', value: 'true' }])
  })

  it('no reemplaza notas SQLite existentes y no vuelve a importar después del éxito', async () => {
    fixture.database.run("INSERT INTO notes (id,title) VALUES ('same','SQLite conservada')")
    const { open, idb } = legacyStore({ notes: [{ id: 'same', title: 'Legada antigua' }, { id: 'new', title: 'Nueva' }] })
    await migrateLegacyNotes(coordinator)
    await migrateLegacyNotes(coordinator)
    expect(open).toHaveBeenCalledTimes(1)
    expect(idb.close).toHaveBeenCalledTimes(1)
    expect((await coordinator.getDb().query('SELECT title FROM notes ORDER BY id')).values)
      .toEqual([{ title: 'Nueva' }, { title: 'SQLite conservada' }])
  })

  it.each(['openError', 'readError'])('no interpreta %s como base vacía', async errorType => {
    const cause = new Error('read unavailable')
    legacyStore({ [errorType]: cause })
    await expect(migrateLegacyNotes(coordinator)).rejects.toMatchObject({ cause })
    expect(await flag()).toEqual([])
    expect(fixture.adapter.beginTransaction).not.toHaveBeenCalled()
  })

  it('cierra una apertura tardía bloqueada y no marca éxito', async () => {
    const { idb } = legacyStore({ blocked: true })
    await expect(migrateLegacyNotes(coordinator)).rejects.toMatchObject({ cause: expect.objectContaining({ message: 'Legacy IndexedDB open blocked' }) })
    expect(idb.close).toHaveBeenCalledTimes(1)
    expect(await flag()).toEqual([])
  })

  it('revierte notas y marcador conjuntamente cuando falla una escritura', async () => {
    legacyStore({ notes: [{ id: 'one' }, { id: 'two' }] })
    const cause = new Error('disk I/O')
    const original = fixture.adapter.run.getMockImplementation()
    fixture.adapter.run.mockImplementation(async (sql, values, transaction) => {
      if (values[0] === 'two') throw cause
      return original(sql, values, transaction)
    })
    await expect(migrateLegacyNotes(coordinator)).rejects.toMatchObject({ cause })
    expect(await flag()).toEqual([])
    expect((await coordinator.getDb().query('SELECT * FROM notes')).values).toEqual([])
    fixture.adapter.run.mockImplementation(original)
    await migrateLegacyNotes(coordinator)
    expect((await coordinator.getDb().query('SELECT * FROM notes')).values).toHaveLength(2)
  })
})
