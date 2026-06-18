import type { AcademicEvent } from './academicEvents'
import type { BackupData, BackupItemCounts, BackupManifest } from './backup'
import type { Note } from './notes'
import type { Subject } from './subjects'

export interface ParsedBackupImport {
  manifest: BackupManifest
  data: BackupData
  counts: BackupItemCounts
  warnings: string[]
}

export interface BackupImportSource {
  content: Blob | ArrayBuffer | Uint8Array | string
  filename?: string
}

export type BackupImportSubject = Subject
export type BackupImportNote = Note
export type BackupImportAcademicEvent = AcademicEvent

export class BackupImportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BackupImportError'
  }
}
