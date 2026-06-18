import { beforeEach, describe, expect, it, vi } from 'vitest'
import { generateBackupZip } from '../../../../src/services/backup/BackupZipService.ts'
import {
  confirmBackupImport,
  importBackupZip,
  prepareBackupImport,
} from '../../../../src/services/backup/BackupImportService.ts'

const sqliteMocks = vi.hoisted(() => ({
  db: {
    run: vi.fn(),
  },
  runTransaction: vi.fn(async action => action()),
}))

const backupDataSourceMocks = vi.hoisted(() => ({
  collectBackupData: vi.fn(),
}))

vi.mock('../../../../src/services/sqlite/connection.js', () => ({
  getDb: vi.fn(() => sqliteMocks.db),
  runTransaction: sqliteMocks.runTransaction,
}))

vi.mock('../../../../src/services/backup/BackupDataSource.ts', () => ({
  collectBackupData: backupDataSourceMocks.collectBackupData,
}))

const CREATED_AT = new Date('2026-06-03T12:30:00.000Z')
const CREATED_AT_ISO = '2026-06-03T12:30:00.000Z'

function emptyData() {
  return {
    subjects: [],
    notes: [],
    academicEvents: [],
  }
}

function subject(overrides = {}) {
  return {
    id: 'subj-math',
    name: 'Matematica',
    parentSubjectId: null,
    archived: false,
    color: '#38bdf8',
    createdAt: '2026-05-01T10:00:00.000Z',
    ...overrides,
  }
}

function note(overrides = {}) {
  return {
    id: 'note-1',
    title: 'Parcial 1',
    content: '# Parcial 1\n\nIntegrales y matrices.',
    pinned: false,
    archived: false,
    statusEmoji: null,
    subjectId: 'subj-math',
    createdAt: '2026-05-02T10:00:00.000Z',
    updatedAt: '2026-05-03T10:00:00.000Z',
    ...overrides,
  }
}

function academicEvent(overrides = {}) {
  return {
    id: 'event-1',
    type: 'parcial',
    title: 'Primer parcial',
    date: '2026-06-20',
    subjectId: 'subj-math',
    createdAt: '2026-05-10T10:00:00.000Z',
    updatedAt: '2026-05-11T10:00:00.000Z',
    ...overrides,
  }
}

function cleanBackupData() {
  return {
    subjects: [
      subject({ archived: true }),
      subject({
        id: 'sec-algebra',
        name: 'Algebra',
        parentSubjectId: 'subj-math',
        color: '#a78bfa',
      }),
      subject({
        id: 'deleted-subject',
        name: 'Papelera',
        deletedAt: '2026-06-01T00:00:00.000Z',
      }),
    ],
    notes: [
      note({
        id: 'note-active',
        title: 'Matrices',
        subjectId: 'sec-algebra',
      }),
      note({
        id: 'note-archived',
        title: 'Archivada',
        archived: true,
        subjectId: 'subj-math',
      }),
      note({
        id: 'deleted-note',
        title: 'Eliminada',
        deletedAt: '2026-06-01T00:00:00.000Z',
      }),
    ],
    academicEvents: [
      academicEvent({ id: 'event-partial' }),
    ],
  }
}

async function createBackup(data) {
  return generateBackupZip(data, {
    createdAt: CREATED_AT,
    filename: 'lumapse-fase-6.zip',
    type: 'arraybuffer',
  })
}

function insertValues(tableName) {
  return sqliteMocks.db.run.mock.calls
    .filter(([sql]) => sql.includes(`INSERT INTO ${tableName}`))
    .map(([, values]) => values)
}

beforeEach(() => {
  vi.clearAllMocks()
  sqliteMocks.db.run.mockResolvedValue(undefined)
  sqliteMocks.runTransaction.mockImplementation(async action => action())
  backupDataSourceMocks.collectBackupData.mockResolvedValue(emptyData())
})

describe('Backup import regression - ZIP exportado por Lumapse', () => {
  it('recupera materias, secciones, notas archivadas y fechas en una instalacion limpia', async () => {
    const backup = await createBackup(cleanBackupData())

    const plan = await prepareBackupImport({
      content: backup.content,
      filename: backup.filename,
    })
    const result = await confirmBackupImport(plan)

    expect(backupDataSourceMocks.collectBackupData).toHaveBeenCalledTimes(1)
    expect(plan.counts.subjects).toEqual({ source: 2, importable: 2, skipped: 0 })
    expect(plan.counts.notes).toEqual({ source: 2, importable: 2, skipped: 0 })
    expect(plan.counts.academicEvents).toEqual({ source: 1, importable: 1, skipped: 0 })
    expect(result.imported).toEqual({
      subjects: 2,
      notes: 2,
      academicEvents: 1,
    })

    expect(sqliteMocks.runTransaction).toHaveBeenCalledTimes(1)
    expect(sqliteMocks.db.run).toHaveBeenCalledTimes(5)
    expect(insertValues('subjects')).toEqual([
      ['subj-math', 'Matematica', null, 1, '#38bdf8', '2026-05-01T10:00:00.000Z'],
      ['sec-algebra', 'Algebra', 'subj-math', 0, '#a78bfa', '2026-05-01T10:00:00.000Z'],
    ])
    expect(insertValues('notes').map(values => [values[0], values[4], values[6]])).toEqual([
      ['note-active', 0, 'sec-algebra'],
      ['note-archived', 1, 'subj-math'],
    ])
    expect(insertValues('academic_events')[0]).toEqual([
      'event-partial',
      'parcial',
      'Primer parcial',
      '2026-06-20',
      'subj-math',
      '2026-05-10T10:00:00.000Z',
      '2026-05-11T10:00:00.000Z',
    ])
  })

  it('importa en un workspace con datos existentes sin sobrescribir nombres locales', async () => {
    backupDataSourceMocks.collectBackupData.mockResolvedValue({
      subjects: [subject({ id: 'local-math', name: 'Matematica' })],
      notes: [],
      academicEvents: [],
    })
    const backup = await createBackup({
      subjects: [subject()],
      notes: [note()],
      academicEvents: [],
    })

    const flow = await importBackupZip({ content: backup.content, filename: backup.filename })

    expect(flow.plan.renamedSubjects).toEqual([
      {
        id: 'subj-math',
        from: 'Matematica',
        to: 'Matematica (importada)',
        parentSubjectId: null,
      },
    ])
    expect(flow.result.imported).toEqual({
      subjects: 1,
      notes: 1,
      academicEvents: 0,
    })
    expect(insertValues('subjects')[0][1]).toBe('Matematica (importada)')
    expect(insertValues('notes')[0][6]).toBe('subj-math')
  })

  it('omite duplicados por ID al repetir la importacion del mismo ZIP', async () => {
    const data = {
      subjects: [subject()],
      notes: [note()],
      academicEvents: [academicEvent()],
    }
    backupDataSourceMocks.collectBackupData.mockResolvedValue(data)
    const backup = await createBackup(data)

    const flow = await importBackupZip({ content: backup.content, filename: backup.filename })

    expect(flow.plan.data).toEqual(emptyData())
    expect(flow.plan.counts.subjects.skipped).toBe(1)
    expect(flow.plan.counts.notes.skipped).toBe(1)
    expect(flow.plan.counts.academicEvents.skipped).toBe(1)
    expect(flow.result.imported).toEqual({
      subjects: 0,
      notes: 0,
      academicEvents: 0,
    })
    expect(flow.result.skipped).toEqual(expect.arrayContaining([
      expect.objectContaining({ entity: 'subject', id: 'subj-math' }),
      expect.objectContaining({ entity: 'note', id: 'note-1' }),
      expect.objectContaining({ entity: 'academicEvent', id: 'event-1' }),
    ]))
    expect(sqliteMocks.runTransaction).not.toHaveBeenCalled()
    expect(sqliteMocks.db.run).not.toHaveBeenCalled()
  })

  it('repara referencias rotas sin descartar notas ni fechas academicas', async () => {
    const backup = await createBackup({
      subjects: [
        subject({
          id: 'sec-orphan',
          name: 'Unidad I',
          parentSubjectId: 'missing-parent',
        }),
      ],
      notes: [
        note({
          id: 'note-orphan',
          subjectId: 'missing-subject',
        }),
      ],
      academicEvents: [
        academicEvent({
          id: 'event-orphan',
          subjectId: 'missing-subject',
        }),
      ],
    })

    const flow = await importBackupZip({ content: backup.content, filename: backup.filename })

    expect(flow.plan.counts.relationshipRepairs).toBe(3)
    expect(flow.plan.relationshipRepairs).toEqual(expect.arrayContaining([
      expect.objectContaining({ entity: 'subject', id: 'sec-orphan', field: 'parentSubjectId', to: null }),
      expect.objectContaining({ entity: 'note', id: 'note-orphan', field: 'subjectId', to: null }),
      expect.objectContaining({ entity: 'academicEvent', id: 'event-orphan', field: 'subjectId', to: null }),
    ]))
    expect(flow.result.imported).toEqual({
      subjects: 1,
      notes: 1,
      academicEvents: 1,
    })
    expect(insertValues('subjects')[0][2]).toBeNull()
    expect(insertValues('notes')[0][6]).toBeNull()
    expect(insertValues('academic_events')[0][4]).toBeNull()
  })

  it('usa la fecha del manifest como fallback si faltan timestamps opcionales', async () => {
    const backup = await createBackup({
      subjects: [subject({ createdAt: null })],
      notes: [note({ createdAt: null, updatedAt: null })],
      academicEvents: [academicEvent({ createdAt: null, updatedAt: null })],
    })

    const flow = await importBackupZip({ content: backup.content, filename: backup.filename })

    expect(flow.result.imported).toEqual({
      subjects: 1,
      notes: 1,
      academicEvents: 1,
    })
    expect(insertValues('subjects')[0][5]).toBe(CREATED_AT_ISO)
    expect(insertValues('notes')[0][7]).toBe(CREATED_AT_ISO)
    expect(insertValues('notes')[0][8]).toBe(CREATED_AT_ISO)
    expect(insertValues('academic_events')[0][5]).toBe(CREATED_AT_ISO)
    expect(insertValues('academic_events')[0][6]).toBe(CREATED_AT_ISO)
  })
})
