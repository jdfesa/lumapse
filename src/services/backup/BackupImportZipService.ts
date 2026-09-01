// =============================================================
// backup/BackupImportZipService
//
// Responsabilidad: orquestar la fuente ZIP, preflight, lectura
// JSON secuencial y validacion runtime, sin tocar SQLite ni UI.
// =============================================================

import { readBackupZipText } from './BackupZipEntryReader'
import {
  validateBackupImportEntities,
  validateBackupManifest,
} from './BackupImportValidation'
import {
  preflightBackupZip,
  type PreflightedBackupZip,
} from './BackupZipPreflight'
import {
  BackupImportError,
  type BackupImportSource,
  type ParsedBackupImport,
} from '../../domain/backupImport'

const MANIFEST_PATH = 'manifest.json'
const SUBJECTS_PATH = 'data/subjects.json'
const NOTES_PATH = 'data/notes.json'
const ACADEMIC_EVENTS_PATH = 'data/academic-events.json'

async function readJsonFile(zip: PreflightedBackupZip, path: string): Promise<unknown> {
  const content = await readBackupZipText(zip, path)
  try {
    return JSON.parse(content)
  } catch {
    throw new BackupImportError(`Backup invalido: ${path} no contiene JSON valido.`)
  }
}

export async function parseBackupImportZip(
  source: BackupImportSource | Blob | ArrayBuffer | Uint8Array | string,
): Promise<ParsedBackupImport> {
  const zip = await preflightBackupZip(source)
  const manifest = validateBackupManifest(await readJsonFile(zip, MANIFEST_PATH))
  const subjects = await readJsonFile(zip, SUBJECTS_PATH)
  const notes = await readJsonFile(zip, NOTES_PATH)
  const academicEvents = await readJsonFile(zip, ACADEMIC_EVENTS_PATH)

  return validateBackupImportEntities(manifest, { subjects, notes, academicEvents })
}

export {
  ACADEMIC_EVENTS_PATH,
  MANIFEST_PATH,
  NOTES_PATH,
  SUBJECTS_PATH,
}
