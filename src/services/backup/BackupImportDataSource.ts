// =============================================================
// backup/BackupImportDataSource
//
// Responsabilidad: aplicar un plan de importacion ya validado
// dentro de una transaccion SQLite.
// =============================================================

import { getDb, runTransaction } from '../sqlite/connection.js'
import type {
  BackupImportApplyResult,
  BackupImportPlan,
} from '../../domain/backupImport'
import type { AcademicEvent } from '../../domain/academicEvents'
import type { Note } from '../../domain/notes'
import type { Subject } from '../../domain/subjects'

type SqlValue = string | number | null

interface ImportDatabase {
  run: (sql: string, values: SqlValue[], transaction?: boolean) => Promise<unknown>
}

function boolToInteger(value: boolean): number {
  return value ? 1 : 0
}

function nullable(value: string | null | undefined): string | null {
  return value || null
}

async function runImportSql(db: ImportDatabase, sql: string, values: SqlValue[]): Promise<void> {
  await db.run(sql, values, false)
}

async function insertSubject(db: ImportDatabase, subject: Subject): Promise<void> {
  await runImportSql(
    db,
    `
      INSERT INTO subjects (id, name, parentSubjectId, archived, color, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      subject.id,
      subject.name,
      nullable(subject.parentSubjectId),
      boolToInteger(subject.archived),
      nullable(subject.color),
      subject.createdAt,
    ],
  )
}

async function insertNote(db: ImportDatabase, note: Note): Promise<void> {
  await runImportSql(
    db,
    `
      INSERT INTO notes (id, title, content, pinned, archived, statusEmoji, subjectId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      note.id,
      note.title,
      note.content,
      boolToInteger(note.pinned),
      boolToInteger(note.archived),
      nullable(note.statusEmoji),
      nullable(note.subjectId),
      note.createdAt,
      note.updatedAt,
    ],
  )
}

async function insertAcademicEvent(db: ImportDatabase, event: AcademicEvent): Promise<void> {
  await runImportSql(
    db,
    `
      INSERT INTO academic_events (id, type, title, date, subjectId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      event.id,
      event.type,
      nullable(event.title),
      event.date,
      nullable(event.subjectId),
      event.createdAt,
      event.updatedAt,
    ],
  )
}

function createApplyResult(plan: BackupImportPlan): BackupImportApplyResult {
  return {
    imported: {
      subjects: plan.data.subjects.length,
      notes: plan.data.notes.length,
      academicEvents: plan.data.academicEvents.length,
    },
    skipped: [...plan.skipped],
    renamedSubjects: [...plan.renamedSubjects],
    relationshipRepairs: [...plan.relationshipRepairs],
    warnings: [...plan.warnings],
  }
}

function hasImportableData(plan: BackupImportPlan): boolean {
  return plan.data.subjects.length + plan.data.notes.length + plan.data.academicEvents.length > 0
}

export async function applyBackupImportPlan(plan: BackupImportPlan): Promise<BackupImportApplyResult> {
  const result = createApplyResult(plan)

  if (!hasImportableData(plan)) {
    return result
  }

  await runTransaction(async () => {
    const db = getDb() as ImportDatabase

    for (const subject of plan.data.subjects) {
      await insertSubject(db, subject)
    }

    for (const note of plan.data.notes) {
      await insertNote(db, note)
    }

    for (const event of plan.data.academicEvents) {
      await insertAcademicEvent(db, event)
    }
  })

  return result
}
