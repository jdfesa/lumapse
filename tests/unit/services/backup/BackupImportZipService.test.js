import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { buildBackupManifest } from '../../../../src/services/backup/BackupFormat.ts'
import { generateBackupZip } from '../../../../src/services/backup/BackupZipService.ts'
import {
  parseBackupImportZip,
} from '../../../../src/services/backup/BackupImportZipService.ts'
import { BackupImportError } from '../../../../src/domain/backupImport.ts'

const CREATED_AT = new Date('2026-06-03T12:30:00.000Z')

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

function manifest(overrides = {}) {
  const base = buildBackupManifest({
    createdAt: CREATED_AT,
    filename: 'lumapse-2026-06-03-12-30.zip',
    counts: {
      subjects: 1,
      notes: 1,
      academicEvents: 1,
    },
    files: [
      'manifest.json',
      'data/subjects.json',
      'data/notes.json',
      'data/academic-events.json',
      'README.txt',
    ],
  })

  return {
    ...base,
    ...overrides,
  }
}

async function createZip(files) {
  const zip = new JSZip()

  for (const [path, content] of Object.entries(files)) {
    zip.file(path, typeof content === 'string' ? content : JSON.stringify(content, null, 2))
  }

  return zip.generateAsync({ type: 'arraybuffer' })
}

async function createValidZip(overrides = {}) {
  return createZip({
    'manifest.json': manifest(overrides.manifest),
    'data/subjects.json': overrides.subjects || [subject()],
    'data/notes.json': overrides.notes || [note()],
    'data/academic-events.json': overrides.academicEvents || [academicEvent()],
  })
}

describe('BackupImportZipService', () => {
  it('lee un ZIP generado por Lumapse y devuelve datos canonicos normalizados', async () => {
    const backup = await generateBackupZip({
      subjects: [subject({ archived: true })],
      notes: [note({ pinned: true, statusEmoji: 'pin' })],
      academicEvents: [academicEvent()],
    }, {
      createdAt: CREATED_AT,
      filename: 'lumapse-2026-06-03-12-30.zip',
      type: 'arraybuffer',
    })

    const parsed = await parseBackupImportZip({ content: backup.content, filename: backup.filename })

    expect(parsed.manifest).toMatchObject({
      app: 'Lumapse',
      backupFormatVersion: 1,
    })
    expect(parsed.counts).toEqual({
      subjects: 1,
      notes: 1,
      academicEvents: 1,
    })
    expect(parsed.data.subjects[0]).toMatchObject({
      id: 'subj-math',
      archived: true,
    })
    expect(parsed.data.notes[0]).toMatchObject({
      id: 'note-1',
      pinned: true,
      statusEmoji: 'pin',
    })
    expect(parsed.data.academicEvents[0]).toMatchObject({
      id: 'event-1',
      type: 'parcial',
    })
    expect(parsed.warnings).toEqual([])
  })

  it('rechaza un ZIP que no contiene manifest.json', async () => {
    const content = await createZip({
      'data/subjects.json': [],
      'data/notes.json': [],
      'data/academic-events.json': [],
    })

    await expect(parseBackupImportZip(content)).rejects.toThrow('falta manifest.json')
    await expect(parseBackupImportZip(content)).rejects.toBeInstanceOf(BackupImportError)
  })

  it('rechaza manifest de otra app', async () => {
    const content = await createValidZip({
      manifest: {
        app: 'OtraApp',
      },
    })

    await expect(parseBackupImportZip(content)).rejects.toThrow('no parece ser un backup de Lumapse')
  })

  it('rechaza versiones de backup no soportadas', async () => {
    const content = await createValidZip({
      manifest: {
        backupFormatVersion: 99,
      },
    })

    await expect(parseBackupImportZip(content)).rejects.toThrow('Version de backup no soportada')
  })

  it('rechaza ZIP sin JSON canonico requerido', async () => {
    const content = await createZip({
      'manifest.json': manifest(),
      'data/subjects.json': [subject()],
      'data/notes.json': [note()],
    })

    await expect(parseBackupImportZip(content)).rejects.toThrow('falta data/academic-events.json')
  })

  it('rechaza JSON canonico mal formado', async () => {
    const content = await createZip({
      'manifest.json': manifest(),
      'data/subjects.json': '[}',
      'data/notes.json': [note()],
      'data/academic-events.json': [academicEvent()],
    })

    await expect(parseBackupImportZip(content)).rejects.toThrow('data/subjects.json no contiene JSON valido')
  })

  it('normaliza datos opcionales y avisa cuando omite papelera', async () => {
    const content = await createValidZip({
      subjects: [
        subject({
          id: 'deleted-subject',
          deletedAt: '2026-06-01T00:00:00.000Z',
        }),
        {
          id: 'subj-lite',
          name: 'Lite',
          archived: 'true',
        },
      ],
      notes: [
        note({
          id: 'deleted-note',
          deletedAt: '2026-06-01T00:00:00.000Z',
        }),
        {
          id: 'note-lite',
          title: '',
          content: null,
          pinned: '1',
          archived: 'false',
        },
      ],
      academicEvents: [],
    })

    const parsed = await parseBackupImportZip(content)

    expect(parsed.data.subjects).toEqual([
      expect.objectContaining({
        id: 'subj-lite',
        name: 'Lite',
        archived: true,
        parentSubjectId: null,
        createdAt: CREATED_AT.toISOString(),
      }),
    ])
    expect(parsed.data.notes).toEqual([
      expect.objectContaining({
        id: 'note-lite',
        title: 'Sin titulo',
        content: '',
        pinned: true,
        archived: false,
        subjectId: null,
        createdAt: CREATED_AT.toISOString(),
      }),
    ])
    expect(parsed.warnings).toEqual(expect.arrayContaining([
      'Se omitio una materia en papelera incluida en el backup.',
      'Se omitio una nota en papelera incluida en el backup.',
      'El conteo de fechas academicas del manifest no coincide con los datos del backup.',
    ]))
  })

  it('rechaza backups sin datos importables', async () => {
    const content = await createValidZip({
      manifest: {
        counts: {
          subjects: 0,
          notes: 0,
          academicEvents: 0,
        },
      },
      subjects: [],
      notes: [],
      academicEvents: [],
    })

    await expect(parseBackupImportZip(content)).rejects.toThrow('no contiene datos importables')
  })
})
