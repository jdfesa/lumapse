import { describe, expect, it } from 'vitest'

import { BackupImportError } from '../../../../src/domain/backupImport.ts'
import { buildBackupManifest } from '../../../../src/services/backup/BackupFormat.ts'
import {
  BACKUP_IMPORT_DATA_POLICY,
} from '../../../../src/services/backup/BackupImportPolicy.ts'
import {
  validateBackupImportEntities,
  validateBackupManifest,
} from '../../../../src/services/backup/BackupImportValidation.ts'

const CREATED_AT = '2026-06-03T12:30:00.000Z'

function rawManifest(overrides = {}) {
  const base = buildBackupManifest({
    createdAt: CREATED_AT,
    filename: 'lumapse-2026-06-03-12-30.zip',
    counts: { subjects: 1, notes: 1, academicEvents: 1 },
  })

  return {
    ...base,
    ...overrides,
    dataPolicy: overrides.dataPolicy === null || typeof overrides.dataPolicy !== 'object'
      ? (overrides.dataPolicy ?? base.dataPolicy)
      : { ...base.dataPolicy, ...overrides.dataPolicy },
    counts: overrides.counts === null || typeof overrides.counts !== 'object'
      ? (overrides.counts ?? base.counts)
      : { ...base.counts, ...overrides.counts },
  }
}

function manifest(overrides = {}) {
  return validateBackupManifest(rawManifest(overrides))
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

function documents(overrides = {}) {
  return {
    subjects: [subject()],
    notes: [note()],
    academicEvents: [academicEvent()],
    ...overrides,
  }
}

function validateDocuments(input, manifestOverrides = {}) {
  return validateBackupImportEntities(manifest(manifestOverrides), input)
}

describe('BackupImportValidation - manifest', () => {
  it('normaliza timestamp, filename y booleans legacy sin coercion amplia', () => {
    const parsed = validateBackupManifest(rawManifest({
      createdAt: '2026-06-03T09:30:00-03:00',
      filename: ' backup <manual> 😀.zip ',
      dataPolicy: {
        includesDeletedItems: '0',
        includesArchivedItems: 1,
        includesAttachments: 'false',
      },
    }))

    expect(parsed.createdAt).toBe(CREATED_AT)
    expect(parsed.filename).toBe('backup <manual> 😀.zip')
    expect(parsed.dataPolicy).toEqual({
      includesDeletedItems: false,
      includesArchivedItems: true,
      includesAttachments: false,
    })
  })

  it('acepta limites exactos de conteos y filename y rechaza limite + 1', () => {
    const exact = rawManifest({
      filename: '😀'.repeat(BACKUP_IMPORT_DATA_POLICY.maxManifestFilenameCodePoints),
      counts: {
        subjects: BACKUP_IMPORT_DATA_POLICY.maxSubjects,
        notes: BACKUP_IMPORT_DATA_POLICY.maxNotes,
        academicEvents: BACKUP_IMPORT_DATA_POLICY.maxAcademicEvents,
      },
    })

    expect(validateBackupManifest(exact).counts).toMatchObject(exact.counts)
    expect(() => validateBackupManifest({
      ...exact,
      filename: `${exact.filename}a`,
    })).toThrow('manifest.json.filename')
    expect(() => validateBackupManifest(rawManifest({
      counts: { subjects: BACKUP_IMPORT_DATA_POLICY.maxSubjects + 1 },
    }))).toThrow('manifest.json.counts.subjects')
    expect(() => validateBackupManifest(rawManifest({
      counts: { notes: BACKUP_IMPORT_DATA_POLICY.maxNotes + 1 },
    }))).toThrow('manifest.json.counts.notes')
    expect(() => validateBackupManifest(rawManifest({
      counts: { academicEvents: BACKUP_IMPORT_DATA_POLICY.maxAcademicEvents + 1 },
    }))).toThrow('manifest.json.counts.academicEvents')
  })

  it.each([
    ['app', { app: 'OtraApp' }, 'no parece ser un backup de Lumapse'],
    ['version', { backupFormatVersion: { version: 1 } }, 'Version de backup no soportada'],
    ['createdAt', { createdAt: {} }, 'manifest.json.createdAt'],
    ['filename', { filename: 123 }, 'manifest.json.filename'],
    ['exportMode', { exportMode: 'automatic' }, 'manifest.json.exportMode'],
    ['dataPolicy', { dataPolicy: 'all' }, 'manifest.json.dataPolicy'],
    ['boolean', { dataPolicy: { includesDeletedItems: 'True' } }, 'includesDeletedItems'],
    ['count string', { counts: { subjects: '1' } }, 'counts.subjects'],
    ['count fraction', { counts: { notes: 1.5 } }, 'counts.notes'],
    ['count negative', { counts: { academicEvents: -1 } }, 'counts.academicEvents'],
    ['count non-finite', { counts: { attachments: Number.POSITIVE_INFINITY } }, 'counts.attachments'],
    ['files missing', { files: undefined }, 'manifest.json.files'],
    ['files type', { files: {} }, 'manifest.json.files'],
  ])('rechaza manifest mal formado (%s)', (_case, overrides, expectedPath) => {
    expect(() => validateBackupManifest(rawManifest(overrides))).toThrow(expectedPath)
  })

  it.each([
    '../manifest.json',
    '/manifest.json',
    'C:/manifest.json',
    'data\\notes.json',
    'data//notes.json',
    'data/./notes.json',
    'data/../notes.json',
    'data/',
    'data/notes\n.json',
  ])('rechaza rutas inseguras sin reflejar el valor: %p', file => {
    let error
    try {
      validateBackupManifest(rawManifest({ files: [file] }))
    } catch (caught) {
      error = caught
    }

    expect(error).toBeInstanceOf(BackupImportError)
    expect(error.message).toContain('manifest.json.files[0]')
    expect(error.message).not.toContain(file)
  })

  it('rechaza tipos y rutas duplicadas e impone el limite de archivos antes de mapear', () => {
    expect(() => validateBackupManifest(rawManifest({ files: [123] })))
      .toThrow('manifest.json.files[0]')
    expect(() => validateBackupManifest(rawManifest({
      files: ['manifest.json', 'manifest.json'],
    }))).toThrow('manifest.json.files[1]')

    const exactFiles = Array.from(
      { length: BACKUP_IMPORT_DATA_POLICY.maxManifestFiles },
      (_, index) => `notes/${index}.md`,
    )
    expect(validateBackupManifest(rawManifest({ files: exactFiles })).files).toHaveLength(
      BACKUP_IMPORT_DATA_POLICY.maxManifestFiles,
    )
    expect(() => validateBackupManifest(rawManifest({
      files: [...exactFiles, 'notes/extra.md'],
    }))).toThrow('supera el limite de archivos')
  })
})

describe('BackupImportValidation - entidades', () => {
  it('preserva compatibilidad v1 explicita y texto/Markdown legitimos', () => {
    const parsed = validateDocuments(documents({
      subjects: [subject({
        id: ' historical.subject:1 ',
        name: ' Materia <A> "😀" ',
        archived: '1',
        color: '#A78BFA',
        createdAt: null,
      })],
      notes: [
        note({
          id: 'note_legacy-1',
          title: null,
          content: null,
          pinned: 0,
          archived: 'false',
          createdAt: null,
          updatedAt: null,
        }),
        note({
          id: 'note-markdown',
          title: ' "<Resumen>" 😀 ',
          content: '# Markdown\n\n> <tag literal> & "comillas" 😀',
          pinned: 'true',
          archived: '0',
          statusEmoji: ' ✅ ',
          subjectId: '',
        }),
      ],
      academicEvents: [academicEvent({
        id: 'event-legacy',
        type: 'exposicion',
        title: ' "<Oral>" 😀 ',
        date: '2024-02-29',
        createdAt: null,
        updatedAt: null,
      })],
    }), { counts: { subjects: 1, notes: 2, academicEvents: 1 } })

    expect(parsed.data.subjects[0]).toMatchObject({
      id: 'historical.subject:1',
      name: 'Materia <A> "😀"',
      archived: true,
      color: '#a78bfa',
      createdAt: CREATED_AT,
    })
    expect(parsed.data.notes[0]).toMatchObject({
      title: 'Sin titulo', content: '', pinned: false, archived: false,
      createdAt: CREATED_AT, updatedAt: CREATED_AT,
    })
    expect(parsed.data.notes[1]).toMatchObject({
      title: '"<Resumen>" 😀',
      content: '# Markdown\n\n> <tag literal> & "comillas" 😀',
      statusEmoji: '✅',
      subjectId: null,
    })
    expect(parsed.data.academicEvents[0]).toMatchObject({
      type: 'exposicion', title: '"<Oral>" 😀', date: '2024-02-29',
      createdAt: CREATED_AT, updatedAt: CREATED_AT,
    })
    expect(parsed.warnings).toEqual([])
  })

  it('omite papelera con avisos consolidados y conserva duplicados para el plan', () => {
    const deletedAt = '2026-06-01T00:00:00.000Z'
    const parsed = validateDocuments({
      subjects: [
        subject({ id: 'deleted-subject-1', deletedAt }),
        subject({ id: 'deleted-subject-2', deletedAt }),
        subject({ id: 'active-subject' }),
        subject({ id: 'active-subject', name: 'Duplicada' }),
      ],
      notes: [note({ id: 'deleted-note-1', deletedAt }), note({ id: 'active-note' })],
      academicEvents: [
        academicEvent({ id: 'deleted-event-1', deletedAt }),
        academicEvent({ id: 'deleted-event-2', deletedAt }),
        academicEvent({ id: 'active-event' }),
      ],
    }, { counts: { subjects: 4, notes: 2, academicEvents: 3 } })

    expect(parsed.data.subjects.map(item => item.id)).toEqual(['active-subject', 'active-subject'])
    expect(parsed.data.notes.map(item => item.id)).toEqual(['active-note'])
    expect(parsed.data.academicEvents.map(item => item.id)).toEqual(['active-event'])
    expect(parsed.warnings.filter(warning => warning.includes('papelera'))).toEqual([
      'Se omitieron 2 materias en papelera incluidas en el backup.',
      'Se omitio una nota en papelera incluida en el backup.',
      'Se omitieron 2 fechas academicas en papelera incluidas en el backup.',
    ])
  })

  it('acepta los limites exactos de entidades antes de construir los arrays normalizados', () => {
    const input = {
      subjects: Array.from(
        { length: BACKUP_IMPORT_DATA_POLICY.maxSubjects },
        (_, index) => subject({ id: `subject-${index}` }),
      ),
      notes: Array.from(
        { length: BACKUP_IMPORT_DATA_POLICY.maxNotes },
        (_, index) => note({ id: `note-${index}`, title: null, content: null }),
      ),
      academicEvents: Array.from(
        { length: BACKUP_IMPORT_DATA_POLICY.maxAcademicEvents },
        (_, index) => academicEvent({ id: `event-${index}`, title: null }),
      ),
    }
    const parsed = validateDocuments(input, {
      counts: {
        subjects: BACKUP_IMPORT_DATA_POLICY.maxSubjects,
        notes: BACKUP_IMPORT_DATA_POLICY.maxNotes,
        academicEvents: BACKUP_IMPORT_DATA_POLICY.maxAcademicEvents,
      },
    })

    expect(parsed.counts).toEqual({
      subjects: BACKUP_IMPORT_DATA_POLICY.maxSubjects,
      notes: BACKUP_IMPORT_DATA_POLICY.maxNotes,
      academicEvents: BACKUP_IMPORT_DATA_POLICY.maxAcademicEvents,
    })
  })

  it.each([
    ['subjects', BACKUP_IMPORT_DATA_POLICY.maxSubjects, subject],
    ['notes', BACKUP_IMPORT_DATA_POLICY.maxNotes, note],
    ['academicEvents', BACKUP_IMPORT_DATA_POLICY.maxAcademicEvents, academicEvent],
  ])('rechaza %s en limite + 1 antes de normalizar items', (key, limit, factory) => {
    const input = { subjects: [], notes: [], academicEvents: [] }
    input[key] = Array.from({ length: limit + 1 }, (_, index) => factory({ id: `item-${index}` }))

    expect(() => validateDocuments(input, {
      counts: { subjects: 0, notes: 0, academicEvents: 0 },
    })).toThrow('supera el limite de entidades')
  })

  it('genera una fixture practica de 500 notas sin incorporarla al repositorio', () => {
    const input = {
      subjects: [subject()],
      notes: Array.from({ length: 500 }, (_, index) => note({
        id: `fixture-note-${index}`,
        title: `Nota ${index} 😀`,
        content: `# Nota ${index}\n\nContenido **Markdown** <literal> 😀`,
      })),
      academicEvents: [],
    }
    const parsed = validateDocuments(input, {
      counts: { subjects: 1, notes: 500, academicEvents: 0 },
    })

    expect(parsed.counts).toEqual({ subjects: 1, notes: 500, academicEvents: 0 })
    expect(parsed.data.notes[499].content).toContain('**Markdown** <literal> 😀')
  })

  it('aplica limites exactos de campos y rechaza limite + 1', () => {
    const exact = validateDocuments(documents({
      subjects: [subject({
        id: `s${'x'.repeat(BACKUP_IMPORT_DATA_POLICY.maxIdAsciiCharacters - 1)}`,
        name: '😀'.repeat(BACKUP_IMPORT_DATA_POLICY.maxSubjectNameCodePoints),
      })],
      notes: [note({
        title: '😀'.repeat(BACKUP_IMPORT_DATA_POLICY.maxNoteTitleCodePoints),
        content: 'x'.repeat(BACKUP_IMPORT_DATA_POLICY.maxNoteContentBytes),
        statusEmoji: '😀'.repeat(BACKUP_IMPORT_DATA_POLICY.maxNoteStatusCodePoints),
      })],
      academicEvents: [academicEvent({
        title: '😀'.repeat(BACKUP_IMPORT_DATA_POLICY.maxAcademicEventTitleCodePoints),
      })],
    }))

    expect(exact.data.subjects[0].name).toHaveLength(
      BACKUP_IMPORT_DATA_POLICY.maxSubjectNameCodePoints * 2,
    )
    expect(exact.data.notes[0].content).toHaveLength(BACKUP_IMPORT_DATA_POLICY.maxNoteContentBytes)

    const cases = [
      documents({ subjects: [subject({ name: 'a'.repeat(BACKUP_IMPORT_DATA_POLICY.maxSubjectNameCodePoints + 1) })] }),
      documents({ subjects: [subject({ id: `s${'x'.repeat(BACKUP_IMPORT_DATA_POLICY.maxIdAsciiCharacters)}` })] }),
      documents({ notes: [note({ title: 'a'.repeat(BACKUP_IMPORT_DATA_POLICY.maxNoteTitleCodePoints + 1) })] }),
      documents({ notes: [note({ content: 'a'.repeat(BACKUP_IMPORT_DATA_POLICY.maxNoteContentBytes + 1) })] }),
      documents({ notes: [note({ statusEmoji: 'a'.repeat(BACKUP_IMPORT_DATA_POLICY.maxNoteStatusCodePoints + 1) })] }),
      documents({ academicEvents: [academicEvent({
        title: 'a'.repeat(BACKUP_IMPORT_DATA_POLICY.maxAcademicEventTitleCodePoints + 1),
      })] }),
    ]
    for (const input of cases) {
      expect(() => validateDocuments(input)).toThrow(BackupImportError)
    }
  })

  it.each([
    ['subject id', documents({ subjects: [subject({ id: {} })] }), 'data/subjects.json[0].id'],
    ['subject name', documents({ subjects: [subject({ name: 3 })] }), 'data/subjects.json[0].name'],
    ['subject parent', documents({ subjects: [subject({ parentSubjectId: [] })] }), 'parentSubjectId'],
    ['subject boolean', documents({ subjects: [subject({ archived: 'yes' })] }), '.archived'],
    ['subject color', documents({ subjects: [subject({ color: '#fff; color:red' })] }), '.color'],
    ['subject timestamp', documents({ subjects: [subject({ createdAt: 'yesterday' })] }), '.createdAt'],
    ['note title', documents({ notes: [note({ title: {} })] }), 'data/notes.json[0].title'],
    ['note content', documents({ notes: [note({ content: [] })] }), '.content'],
    ['note boolean', documents({ notes: [note({ pinned: null })] }), '.pinned'],
    ['note status', documents({ notes: [note({ statusEmoji: 'ok\nno' })] }), '.statusEmoji'],
    ['note subject', documents({ notes: [note({ subjectId: 1 })] }), '.subjectId'],
    ['note timestamp', documents({ notes: [note({ updatedAt: '2026-01-01' })] }), '.updatedAt'],
    ['event type', documents({ academicEvents: [academicEvent({ type: 'quiz' })] }), '.type'],
    ['event title', documents({ academicEvents: [academicEvent({ title: {} })] }), '.title'],
    ['event date', documents({ academicEvents: [academicEvent({ date: '2026-02-30' })] }), '.date'],
    ['deletedAt', documents({ notes: [note({ deletedAt: false })] }), '.deletedAt'],
  ])('rechaza tipo/formato invalido y señala indice/campo (%s)', (_case, input, path) => {
    expect(() => validateDocuments(input)).toThrow(path)
  })

  it('no refleja payloads grandes o con markup en errores', () => {
    const payload = `#123456"><img src=x>${'x'.repeat(1_000)}`
    let error
    try {
      validateDocuments(documents({ subjects: [subject({ color: payload })] }))
    } catch (caught) {
      error = caught
    }

    expect(error).toBeInstanceOf(BackupImportError)
    expect(error.message).toContain('data/subjects.json[0].color')
    expect(error.message).not.toContain('<img')
    expect(error.message.length).toBeLessThan(200)
  })

  it('rechaza un backup sin entidades importables despues de validar y omitir papelera', () => {
    const deletedAt = '2026-06-01T00:00:00Z'
    expect(() => validateDocuments({
      subjects: [subject({ deletedAt })],
      notes: [],
      academicEvents: [],
    }, { counts: { subjects: 1, notes: 0, academicEvents: 0 } }))
      .toThrow('no contiene datos importables')
  })
})
