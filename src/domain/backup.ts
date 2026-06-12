import type { AcademicEvent } from './academicEvents'
import type { Note } from './notes'
import type { ISODateTimeString } from './primitives'
import type { Subject } from './subjects'

export interface BackupData {
  subjects: Subject[]
  notes: Note[]
  academicEvents: AcademicEvent[]
}

export interface BackupDataPolicy {
  includesDeletedItems: boolean
  includesArchivedItems: boolean
  includesAttachments: boolean
}

export interface BackupCounts {
  subjects: number
  notes: number
  academicEvents: number
  attachments: number
}

export type BackupItemCounts = Pick<BackupCounts, 'subjects' | 'notes' | 'academicEvents'>

export interface BackupManifest {
  app: 'Lumapse'
  backupFormatVersion: number
  createdAt: ISODateTimeString
  filename: string
  exportMode: 'manual'
  dataPolicy: BackupDataPolicy
  counts: BackupCounts
  files: string[]
}

export type BackupZipContent = Blob | ArrayBuffer | string

export interface BackupZipOptions {
  createdAt?: Date | string | number
  filename?: string
  type?: string
}

export interface GeneratedBackupZip {
  content: BackupZipContent
  contentType: string
  filename: string
  manifest: BackupManifest
}

export interface CurrentBackupZip extends GeneratedBackupZip {
  counts: BackupItemCounts
}
