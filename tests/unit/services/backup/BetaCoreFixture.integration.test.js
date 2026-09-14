import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { postWriteRefreshHarness } from '../../store/postWriteRefreshHarness.js'

// Evidencia del contrato y los conteos, NO benchmark Android/FPS.
let directory, harness
const backups = new Map()

beforeAll(() => {
  directory = mkdtempSync(join(tmpdir(), 'lumapse-f3-'))
  for (const profile of ['f3-small', 'f3-500']) {
    const output = join(directory, profile)
    execFileSync('python3', ['scripts/generate-test-fixture.py', '--profile', profile, '--output-dir', output])
    const zip = join(directory, `${profile}.zip`)
    execFileSync('python3', ['scripts/test-fixture-db.py', 'export-backup', join(output, 'dataset.json'), zip, '--seed-date', '2026-09-13'])
    backups.set(profile, new Uint8Array(readFileSync(zip)))
  }
})
afterAll(() => rmSync(directory, { recursive: true, force: true }))
beforeEach(async () => { harness = await postWriteRefreshHarness() })
afterEach(() => { harness?.fixture.close(); vi.restoreAllMocks() })

async function importProfile(profile) {
  const service = await import('../../../../src/services/backup/BackupImportService.ts')
  const result = await service.importBackupZip(backups.get(profile))
  await harness.store.loadNotes()
  await harness.store.loadSubjects()
  harness.store.setViewMode('all')
  harness.store.setSearchQuery('')
  harness.store.setDateFilter(null)
  return { service, ...result }
}

describe('fixture F3 con importador, store, coordinador y DDL productivos', () => {
  for (const [profile, visible] of [['f3-small', 50], ['f3-500', 500]]) {
    it(`${profile}: caracteriza consultas y notificaciones sin atribuir tiempos nativos`, async () => {
      const { store, db } = harness
      await importProfile(profile)
      const subjects = await import('../../../../src/services/SubjectService.js')
      const subscriber = vi.fn()
      const unsubscribe = store.subscribe(subscriber)
      const trace = []
      async function record(operation, action) {
        db.query.mockClear()
        db.run.mockClear()
        subscriber.mockClear() // subscribe emite un estado inicial, no es una acción.
        await action()
        trace.push({
          operation, queries: db.query.mock.calls.length, writes: db.run.mock.calls.length,
          notifications: subscriber.mock.calls.length,
        })
      }
      try {
        let note
        await record('create', async () => { note = await store.createNote('Traza F3', 'Sintética', null) })
        await record('edit', () => store.updateNote(note.id, { content: 'Editada' }))
        await record('move', () => store.moveNote(note.id, `${profile}-section-01`))
        await record('trash', () => store.deleteNote(note.id))
        await record('loadSubjects', () => store.loadSubjects())
        await record('getTrashItems', () => subjects.getTrashItems())
        process.stdout.write(`[F3 diagnóstico SQLite, no Android] ${profile}: ${JSON.stringify(trace)}\n`)
        expect(trace).toEqual([
          { operation: 'create', queries: 33, writes: 1, notifications: 2 },
          { operation: 'edit', queries: 1, writes: 1, notifications: 1 },
          { operation: 'move', queries: 34, writes: 1, notifications: 2 },
          { operation: 'trash', queries: 35, writes: 1, notifications: 3 },
          { operation: 'loadSubjects', queries: 33, writes: 0, notifications: 1 },
          { operation: 'getTrashItems', queries: 5, writes: 0, notifications: 0 },
        ])
        expect(store.getFilteredNotes()).toHaveLength(visible)
      } finally {
        unsubscribe()
      }
    })

    it(`${profile}: importa y reimporta sin duplicados, con ${visible} notas visibles`, async () => {
      const { store, db, fixture } = harness
      const { service, result, plan } = await importProfile(profile)
      expect(plan.warnings).toEqual([])
      expect(result.imported).toEqual({ subjects: 30, notes: visible + 18, academicEvents: 20 })
      expect(store.getFilteredNotes()).toHaveLength(visible)
      expect(store.getState().notes.filter(note => note.archived)).toHaveLength(18)
      expect(store.getFilteredNotes().filter(note => note.pinned)).toHaveLength(visible * 6 / 100)
      expect(fixture.database.exec('PRAGMA foreign_key_check')).toEqual([])
      db.run.mockClear()
      const repeated = await service.importBackupZip(backups.get(profile))
      expect(repeated.result.imported).toEqual({ subjects: 0, notes: 0, academicEvents: 0 })
      expect(db.run).not.toHaveBeenCalled()
      expect(store.getFilteredNotes()).toHaveLength(visible)
    })

    it(`${profile}: papelera y archivo no restan las ${visible} activas del perfil`, async () => {
      const { store, fixture } = harness
      await importProfile(profile)
      // El ZIP no importa las 12 eliminadas. Se crean casos adicionales, no se
      // eliminan las notas que componen el volumen exigido por RNF-004.
      for (let index = 1; index <= 12; index++) {
        const note = await store.createNote(`Papelera F3 ${index}`, 'Caso sintético adicional', null)
        await store.deleteNote(note.id)
      }
      expect(store.getFilteredNotes()).toHaveLength(visible)
      expect(store.getState().trashCount).toBe(12)
      expect(fixture.database.exec('SELECT COUNT(*) FROM notes')[0].values[0][0]).toBe(visible + 30)
      const { collectBackupData } = await import('../../../../src/services/backup/BackupDataSource.ts')
      const { generateBackupZip } = await import('../../../../src/services/backup/BackupZipService.ts')
      const { parseBackupImportZip } = await import('../../../../src/services/backup/BackupImportZipService.ts')
      const exported = await generateBackupZip(await collectBackupData(), { type: 'arraybuffer', createdAt: '2026-09-13T12:00:00Z' })
      const parsed = await parseBackupImportZip(exported.content)
      expect(parsed.counts.notes).toBe(visible + 18)
      expect(parsed.data.notes.filter(note => !note.archived)).toHaveLength(visible)
    })
  }
})
