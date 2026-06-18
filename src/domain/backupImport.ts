import type { AcademicEvent } from './academicEvents'
import type { BackupData, BackupItemCounts, BackupManifest } from './backup'
import type { Note } from './notes'
import type { EntityId } from './primitives'
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

export type BackupImportEntity = 'subject' | 'note' | 'academicEvent'
export type BackupImportRepairField = 'parentSubjectId' | 'subjectId'

export interface BackupImportEntityCount {
  source: number
  importable: number
  skipped: number
}

export interface BackupImportPlanCounts {
  subjects: BackupImportEntityCount
  notes: BackupImportEntityCount
  academicEvents: BackupImportEntityCount
  renamedSubjects: number
  relationshipRepairs: number
}

export interface BackupImportSkippedItem {
  entity: BackupImportEntity
  id: EntityId
  reason: string
}

export interface BackupImportSubjectRename {
  id: EntityId
  from: string
  to: string
  parentSubjectId: EntityId | null
}

export interface BackupImportRelationshipRepair {
  entity: BackupImportEntity
  id: EntityId
  field: BackupImportRepairField
  from: EntityId | null
  to: EntityId | null
  reason: string
}

export interface BackupImportPlan {
  manifest: BackupManifest
  sourceCounts: BackupItemCounts
  data: BackupData
  counts: BackupImportPlanCounts
  skipped: BackupImportSkippedItem[]
  renamedSubjects: BackupImportSubjectRename[]
  relationshipRepairs: BackupImportRelationshipRepair[]
  warnings: string[]
}

export interface BackupImportApplyResult {
  imported: BackupItemCounts
  skipped: BackupImportSkippedItem[]
  renamedSubjects: BackupImportSubjectRename[]
  relationshipRepairs: BackupImportRelationshipRepair[]
  warnings: string[]
}

export class BackupImportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BackupImportError'
  }
}
