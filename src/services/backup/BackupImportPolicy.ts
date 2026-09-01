import { ACADEMIC_EVENT_TITLE_MAX_LENGTH } from '../AcademicEventRules'

const MEBIBYTE = 1024 * 1024

export const BACKUP_JSON_PATHS = Object.freeze([
  'manifest.json',
  'data/subjects.json',
  'data/notes.json',
  'data/academic-events.json',
] as const)

export type BackupJsonPath = typeof BACKUP_JSON_PATHS[number]

export interface BackupZipPolicy {
  maxSourceBytes: number
  maxEntries: number
  maxCentralDirectoryBytes: number
  maxDeclaredUncompressedBytes: number
  maxPathBytes: number
  maxReadmeBytes: number
  maxMarkdownBytes: number
  jsonBytes: Readonly<Record<BackupJsonPath, number>>
}

export interface BackupImportDataPolicy {
  maxSubjects: number
  maxNotes: number
  maxAcademicEvents: number
  maxSubjectNameCodePoints: number
  maxNoteTitleCodePoints: number
  maxNoteContentBytes: number
  maxNoteStatusCodePoints: number
  maxAcademicEventTitleCodePoints: number
  maxManifestFilenameCodePoints: number
  maxIdAsciiCharacters: number
  maxManifestFiles: number
}

export const BACKUP_IMPORT_ZIP_POLICY: BackupZipPolicy = Object.freeze({
  maxSourceBytes: 64 * MEBIBYTE,
  maxEntries: 5_100,
  maxCentralDirectoryBytes: 4 * MEBIBYTE,
  maxDeclaredUncompressedBytes: 64 * MEBIBYTE,
  maxPathBytes: 512,
  maxReadmeBytes: 1 * MEBIBYTE,
  maxMarkdownBytes: 2 * MEBIBYTE,
  jsonBytes: Object.freeze({
    'manifest.json': 4 * MEBIBYTE,
    'data/subjects.json': 2 * MEBIBYTE,
    'data/notes.json': 24 * MEBIBYTE,
    'data/academic-events.json': 8 * MEBIBYTE,
  }),
})

export const BACKUP_IMPORT_DATA_POLICY: BackupImportDataPolicy = Object.freeze({
  maxSubjects: 1_000,
  maxNotes: 5_000,
  maxAcademicEvents: 5_000,
  maxSubjectNameCodePoints: 120,
  maxNoteTitleCodePoints: 4_096,
  maxNoteContentBytes: BACKUP_IMPORT_ZIP_POLICY.maxMarkdownBytes,
  maxNoteStatusCodePoints: 16,
  maxAcademicEventTitleCodePoints: ACADEMIC_EVENT_TITLE_MAX_LENGTH,
  maxManifestFilenameCodePoints: 255,
  maxIdAsciiCharacters: 128,
  maxManifestFiles: BACKUP_IMPORT_ZIP_POLICY.maxEntries,
})

export function getBackupZipEntryLimit(path: string, policy: BackupZipPolicy): number | null {
  if (Object.prototype.hasOwnProperty.call(policy.jsonBytes, path)) {
    return policy.jsonBytes[path as BackupJsonPath]
  }
  if (path === 'README.txt') return policy.maxReadmeBytes
  if (/^notes\/(?:[^/]+\/)*[^/]+\.md$/u.test(path)) return policy.maxMarkdownBytes
  if (path === 'data/' || /^notes\/(?:[^/]+\/)*$/u.test(path)) return 0
  return null
}
