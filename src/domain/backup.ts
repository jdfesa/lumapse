import type { ISODateTimeString } from './primitives'

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
