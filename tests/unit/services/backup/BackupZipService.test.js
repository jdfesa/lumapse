import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import {
  BACKUP_MIME_TYPE,
  generateBackupZip,
  noteToMarkdown,
} from '../../../../src/services/backup/BackupZipService.js'

const CREATED_AT = new Date('2026-06-03T12:30:00.000Z')

function subject(overrides = {}) {
  return {
    id: 'subj-math',
    name: 'Matemática',
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

async function loadZip(result) {
  return JSZip.loadAsync(result.content)
}

async function readJson(zip, path) {
  const text = await zip.file(path).async('string')
  return JSON.parse(text)
}

describe('BackupZipService', () => {
  it('genera un ZIP con manifest, JSON estructurado, README y Markdown legible', async () => {
    const result = await generateBackupZip({
      subjects: [subject()],
      notes: [note()],
      academicEvents: [academicEvent()],
    }, {
      createdAt: CREATED_AT,
      filename: 'lumapse-2026-06-03-12-30.zip',
      type: 'arraybuffer',
    })

    const zip = await loadZip(result)
    const files = Object.keys(zip.files).filter(path => !zip.files[path].dir).sort()

    expect(result.contentType).toBe(BACKUP_MIME_TYPE)
    expect(result.filename).toBe('lumapse-2026-06-03-12-30.zip')
    expect(files).toEqual([
      'README.txt',
      'data/academic-events.json',
      'data/notes.json',
      'data/subjects.json',
      'manifest.json',
      'notes/matematica/parcial-1.md',
    ])

    await expect(zip.file('README.txt').async('string')).resolves.toContain('backup manual')
    await expect(zip.file('notes/matematica/parcial-1.md').async('string')).resolves.toContain('Integrales y matrices')
  })

  it('incluye archivadas y excluye items en papelera', async () => {
    const result = await generateBackupZip({
      subjects: [
        subject({ archived: true }),
        subject({ id: 'deleted-subject', deletedAt: '2026-06-01T00:00:00.000Z' }),
      ],
      notes: [
        note({ archived: true }),
        note({ id: 'deleted-note', deletedAt: '2026-06-01T00:00:00.000Z' }),
      ],
      academicEvents: [],
    }, {
      createdAt: CREATED_AT,
      type: 'arraybuffer',
    })

    const zip = await loadZip(result)
    const subjects = await readJson(zip, 'data/subjects.json')
    const notes = await readJson(zip, 'data/notes.json')
    const manifest = await readJson(zip, 'manifest.json')

    expect(subjects).toHaveLength(1)
    expect(subjects[0]).toMatchObject({ id: 'subj-math', archived: true })
    expect(notes).toHaveLength(1)
    expect(notes[0]).toMatchObject({ id: 'note-1', archived: true })
    expect(manifest.counts).toMatchObject({
      subjects: 1,
      notes: 1,
      academicEvents: 0,
      attachments: 0,
    })
    expect(manifest.dataPolicy).toMatchObject({
      includesDeletedItems: false,
      includesArchivedItems: true,
      includesAttachments: false,
    })
  })

  it('organiza notas por materia y seccion, resolviendo nombres duplicados', async () => {
    const result = await generateBackupZip({
      subjects: [
        subject({ id: 'subj-history', name: 'Historia' }),
        subject({ id: 'sec-medieval', name: 'Unidad I', parentSubjectId: 'subj-history' }),
      ],
      notes: [
        note({ id: 'note-a', title: 'Clase', subjectId: 'sec-medieval' }),
        note({ id: 'note-b', title: 'Clase', subjectId: 'sec-medieval' }),
        note({ id: 'note-c', title: 'Entrada rápida', subjectId: null }),
      ],
      academicEvents: [],
    }, {
      createdAt: CREATED_AT,
      type: 'arraybuffer',
    })

    const zip = await loadZip(result)
    const files = Object.keys(zip.files).filter(path => !zip.files[path].dir).sort()

    expect(files).toContain('notes/historia/unidad-i/clase.md')
    expect(files).toContain('notes/historia/unidad-i/clase-2.md')
    expect(files).toContain('notes/entrada/entrada-rapida.md')
  })

  it('exporta notas con materia inconsistente dentro de entrada', async () => {
    const result = await generateBackupZip({
      subjects: [],
      notes: [note({ subjectId: 'missing-subject' })],
      academicEvents: [],
    }, {
      createdAt: CREATED_AT,
      type: 'arraybuffer',
    })

    const zip = await loadZip(result)

    expect(zip.file('notes/entrada/parcial-1.md')).toBeTruthy()
  })

  it('lanza error si no hay datos para respaldar', async () => {
    await expect(generateBackupZip({
      subjects: [],
      notes: [],
      academicEvents: [],
    })).rejects.toThrow('Todavia no hay notas')
  })

  it('convierte una nota vacia a Markdown con titulo fallback', () => {
    expect(noteToMarkdown(note({
      title: 'Resumen',
      content: '',
    }))).toContain('# Resumen')
  })
})
