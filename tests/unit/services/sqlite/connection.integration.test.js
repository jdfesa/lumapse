import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { importConnection } from './connectionHarness.js'
import { sqliteFixture, deferred } from './sqliteFixture.js'

let fixture, module, db, manager
beforeEach(async () => {
  document.body.innerHTML = ''
  fixture = await sqliteFixture()
  const harness = await importConnection({ platform: 'android' })
  module = harness.module
  db = harness.mockDb
  manager = harness.mockSqliteConnection
  Object.assign(db, fixture.adapter)
  fixture.database.run("CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT); INSERT INTO metadata VALUES ('indexeddb_migrated', 'true')")
})
afterEach(() => fixture.close())

describe('schema y recuperación sobre SQLite real', () => {
  it('migra una instalación existente sin perder notas y no repite ALTERs al reabrir', async () => {
    fixture.database.run(`CREATE TABLE notes (id TEXT PRIMARY KEY, title TEXT, content TEXT, pinned INTEGER DEFAULT 0,
      archived INTEGER DEFAULT 0, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL);
      INSERT INTO notes (id,title,createdAt,updatedAt) VALUES ('old','Fixture conservada','2026','2026')`)
    await module.initDatabase()
    expect((await module.getDb().query('SELECT title, deletedAt, subjectId, statusEmoji FROM notes')).values)
      .toEqual([{ title: 'Fixture conservada', deletedAt: null, subjectId: null, statusEmoji: null }])
    // Forzar reapertura segura a través de una avería controlada, no de datos reales.
    db.beginTransaction.mockRejectedValueOnce(new Error('begin failed'))
    await expect(module.runTransaction(async () => {})).rejects.toThrow('begin failed')
    db.run.mockClear()
    await module.initDatabase()
    expect(db.run.mock.calls.some(([sql]) => sql.startsWith('ALTER TABLE'))).toBe(false)
    expect((await module.getDb().query('SELECT title FROM notes')).values).toEqual([{ title: 'Fixture conservada' }])
    expect(manager.closeConnection).toHaveBeenCalledTimes(1)
  })

  it('una migración fallida conserva contexto y el reintento completa el schema', async () => {
    const cause = new Error('disk I/O error')
    db.run.mockRejectedValueOnce(cause)
    await expect(module.initDatabase()).rejects.toMatchObject({ message: 'SQLite migration failed: notes.statusEmoji', cause })
    expect(() => module.getDb()).toThrow('not initialized')
    await module.initDatabase()
    const fields = (await module.getDb().query('PRAGMA table_info(notes)')).values.map(field => field.name)
    expect(fields).toEqual(expect.arrayContaining(['subjectId', 'deletedAt', 'statusEmoji']))
    expect(manager.closeConnection).toHaveBeenCalledTimes(1)
  })

  it('un rollback incierto bloquea el reintento hasta comprobar una recuperación segura', async () => {
    await module.initDatabase()
    const cause = new Error('write failed')
    db.rollbackTransaction.mockRejectedValueOnce(new Error('rollback failed'))
    await expect(module.runTransaction(async () => { throw cause })).rejects.toBe(cause)
    db.rollbackTransaction.mockRejectedValueOnce(new Error('still unavailable'))
    await expect(module.initDatabase()).rejects.toThrow('still unavailable')
    expect(manager.closeConnection).not.toHaveBeenCalled()
    await module.initDatabase()
    expect(manager.closeConnection).toHaveBeenCalledTimes(1)
    await expect(module.getDb().query('SELECT * FROM notes')).resolves.toEqual({ values: [] })
  })

  it('no cierra una conexión si el plugin no confirma su estado transaccional', async () => {
    await module.initDatabase()
    db.beginTransaction.mockRejectedValueOnce(new Error('begin failed'))
    await expect(module.runTransaction(async () => {})).rejects.toThrow('begin failed')
    db.isTransactionActive.mockResolvedValueOnce({})
    await expect(module.initDatabase()).rejects.toThrow('state unknown')
    expect(manager.closeConnection).not.toHaveBeenCalled()
    await module.initDatabase()
    expect(manager.closeConnection).toHaveBeenCalledTimes(1)
  })
})

describe('consumidores reales, sin acceso a una transacción ajena', () => {
  it.each(['notes', 'subjects', 'academicEvents'])('CRUD %s durante una transacción no se revierte con ella', async kind => {
    await module.initDatabase()
    const notes = await import('../../../../src/services/sqlite/notes.js')
    const subjects = await import('../../../../src/services/sqlite/subjects.js')
    const events = await import('../../../../src/services/sqlite/academicEvents.js')
    const entered = deferred(), release = deferred()
    const first = module.runTransaction(async scope => {
      await notes.createNote('solo A', '', null, scope)
      entered.resolve()
      await release.promise
      throw new Error('A failed')
    })
    const rejected = expect(first).rejects.toThrow('A failed')
    await entered.promise
    const writes = {
      notes: () => notes.createNote('solo B'),
      subjects: () => subjects.createSubjectRow({ id: 'B', name: 'B', createdAt: '2026' }),
      academicEvents: () => events.createAcademicEventRow({ id: 'B', type: 'tp', date: '2026-09-04', createdAt: '2026', updatedAt: '2026' }),
    }
    const second = writes[kind]()
    release.resolve()
    await Promise.all([rejected, second])
    const table = kind === 'academicEvents' ? 'academic_events' : kind
    expect((await module.getDb().query(`SELECT * FROM ${table}`)).values).toHaveLength(1)
    expect((await notes.getAllNotes()).some(note => note.title === 'solo A')).toBe(false)
  })

  it('las cascadas de materia conservan atomicidad ante un fallo en la segunda escritura', async () => {
    await module.initDatabase()
    const subjects = await import('../../../../src/services/SubjectService.js')
    const root = await subjects.createSubject('Materia')
    await subjects.createSubject('Sección', null, root.id)
    const original = db.run.getMockImplementation()
    db.run.mockImplementation(async (sql, values, transaction) => {
      if (sql.includes('WHERE id = ?')) throw new Error('parent failed')
      return original(sql, values, transaction)
    })
    await expect(subjects.archiveSubject(root.id)).rejects.toThrow('parent failed')
    expect((await module.getDb().query('SELECT archived FROM subjects')).values).toEqual([{ archived: 0 }, { archived: 0 }])
    db.run.mockImplementation(original)
    await subjects.archiveSubject(root.id)
    expect((await module.getDb().query('SELECT archived FROM subjects')).values).toEqual([{ archived: 1 }, { archived: 1 }])
  })

  it('vaciar papelera no confirma notas si falla el borrado de materias', async () => {
    await module.initDatabase()
    const subjects = await import('../../../../src/services/SubjectService.js')
    const notes = await import('../../../../src/services/sqlite/notes.js')
    const note = await notes.createNote('Fixture papelera')
    await notes.deleteNote(note.id)
    const original = db.run.getMockImplementation()
    db.run.mockImplementation(async (sql, ...args) => {
      if (sql.includes('DELETE FROM subjects')) throw new Error('subjects failed')
      return original(sql, ...args)
    })
    await expect(subjects.emptyTrash()).rejects.toThrow('subjects failed')
    expect(await notes.getDeletedNotes()).toHaveLength(1)
  })

  it('una cascada puede componerse con su propietario y revierte junto a él', async () => {
    await module.initDatabase()
    const subjects = await import('../../../../src/services/SubjectService.js')
    const root = await subjects.createSubject('Materia')
    await expect(module.runTransaction(async scope => {
      await subjects.archiveSubject(root.id, scope)
      throw new Error('outer failed')
    })).rejects.toThrow('outer failed')
    expect((await subjects.getSubjectById(root.id)).archived).toBe(false)
  })

  it('importa atómicamente sin borrar datos previos, incluso ante un ID duplicado', async () => {
    await module.initDatabase()
    const { applyBackupImportPlan } = await import('../../../../src/services/backup/BackupImportDataSource.ts')
    const notes = await import('../../../../src/services/sqlite/notes.js')
    const existing = await notes.createNote('Existente')
    const plan = {
      data: {
        subjects: [{ id: 'import-subject', name: 'Importada', createdAt: '2026' }],
        notes: [{ ...existing, title: 'No reemplazar' }], academicEvents: [],
      },
      skipped: [], renamedSubjects: [], relationshipRepairs: [], warnings: [],
    }
    await expect(applyBackupImportPlan(plan)).rejects.toThrow('UNIQUE')
    expect((await module.getDb().query('SELECT * FROM subjects')).values).toEqual([])
    expect((await notes.getNoteById(existing.id)).title).toBe('Existente')
    plan.data.notes[0].id = 'import-note'
    await expect(applyBackupImportPlan(plan)).resolves.toMatchObject({ imported: { subjects: 1, notes: 1, academicEvents: 0 } })
    expect(await notes.getAllNotes()).toHaveLength(2)
  })
})
