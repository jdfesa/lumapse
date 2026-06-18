import { describe, expect, it, vi } from 'vitest'
import { buildBackupManifest } from '../../../../src/services/backup/BackupFormat.ts'
import {
  confirmBackupImport,
  importBackupZip,
  prepareBackupImport,
} from '../../../../src/services/backup/BackupImportService.ts'

const CREATED_AT = '2026-06-03T12:30:00.000Z'

function parsedBackup() {
  return {
    manifest: buildBackupManifest({
      createdAt: CREATED_AT,
      counts: {
        subjects: 1,
        notes: 0,
        academicEvents: 0,
      },
    }),
    data: {
      subjects: [
        {
          id: 'subj-1',
          name: 'Matematica',
          parentSubjectId: null,
          archived: false,
          color: '#38bdf8',
          createdAt: '2026-05-01T10:00:00.000Z',
        },
      ],
      notes: [],
      academicEvents: [],
    },
    counts: {
      subjects: 1,
      notes: 0,
      academicEvents: 0,
    },
    warnings: [],
  }
}

function importPlan() {
  const parsed = parsedBackup()

  return {
    manifest: parsed.manifest,
    sourceCounts: parsed.counts,
    data: parsed.data,
    counts: {
      subjects: { source: 1, importable: 1, skipped: 0 },
      notes: { source: 0, importable: 0, skipped: 0 },
      academicEvents: { source: 0, importable: 0, skipped: 0 },
      renamedSubjects: 0,
      relationshipRepairs: 0,
    },
    skipped: [],
    renamedSubjects: [],
    relationshipRepairs: [],
    warnings: [],
  }
}

function applyResult() {
  return {
    imported: {
      subjects: 1,
      notes: 0,
      academicEvents: 0,
    },
    skipped: [],
    renamedSubjects: [],
    relationshipRepairs: [],
    warnings: [],
  }
}

describe('BackupImportService', () => {
  it('prepara preview parseando el ZIP y creando el plan una sola vez', async () => {
    const source = { content: new ArrayBuffer(4), filename: 'lumapse.zip' }
    const parsed = parsedBackup()
    const plan = importPlan()
    const parseZip = vi.fn().mockResolvedValue(parsed)
    const createPlan = vi.fn().mockResolvedValue(plan)

    await expect(prepareBackupImport(source, { parseZip, createPlan })).resolves.toBe(plan)

    expect(parseZip).toHaveBeenCalledWith(source)
    expect(createPlan).toHaveBeenCalledWith(parsed)
    expect(parseZip).toHaveBeenCalledTimes(1)
    expect(createPlan).toHaveBeenCalledTimes(1)
  })

  it('confirma importacion aplicando un plan ya calculado sin parsear de nuevo', async () => {
    const plan = importPlan()
    const result = applyResult()
    const applyPlan = vi.fn().mockResolvedValue(result)

    await expect(confirmBackupImport(plan, { applyPlan })).resolves.toBe(result)

    expect(applyPlan).toHaveBeenCalledWith(plan)
    expect(applyPlan).toHaveBeenCalledTimes(1)
  })

  it('importa un ZIP programaticamente en orden parsear -> planificar -> aplicar', async () => {
    const source = 'base64-zip'
    const parsed = parsedBackup()
    const plan = importPlan()
    const result = applyResult()
    const parseZip = vi.fn().mockResolvedValue(parsed)
    const createPlan = vi.fn().mockResolvedValue(plan)
    const applyPlan = vi.fn().mockResolvedValue(result)

    await expect(importBackupZip(source, { parseZip, createPlan, applyPlan })).resolves.toEqual({
      plan,
      result,
    })

    expect(parseZip).toHaveBeenCalledWith(source)
    expect(createPlan).toHaveBeenCalledWith(parsed)
    expect(applyPlan).toHaveBeenCalledWith(plan)
    expect(parseZip.mock.invocationCallOrder[0]).toBeLessThan(createPlan.mock.invocationCallOrder[0])
    expect(createPlan.mock.invocationCallOrder[0]).toBeLessThan(applyPlan.mock.invocationCallOrder[0])
  })

  it('propaga errores de preparacion y no intenta aplicar si el ZIP falla', async () => {
    const parseZip = vi.fn().mockRejectedValue(new Error('zip invalido'))
    const createPlan = vi.fn()
    const applyPlan = vi.fn()

    await expect(importBackupZip('bad-zip', { parseZip, createPlan, applyPlan })).rejects.toThrow('zip invalido')

    expect(createPlan).not.toHaveBeenCalled()
    expect(applyPlan).not.toHaveBeenCalled()
  })
})
