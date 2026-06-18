// =============================================================
// backup/BackupImportPlanService
//
// Responsabilidad: calcular un preview de importacion seguro
// antes de escribir datos en SQLite.
// =============================================================

import { collectBackupData } from './BackupDataSource'
import type { AcademicEvent } from '../../domain/academicEvents'
import type { BackupData } from '../../domain/backup'
import type {
  BackupImportEntity,
  BackupImportPlan,
  BackupImportRelationshipRepair,
  BackupImportSkippedItem,
  BackupImportSubjectRename,
  ParsedBackupImport,
} from '../../domain/backupImport'
import type { Note } from '../../domain/notes'
import type { EntityId } from '../../domain/primitives'
import type { Subject } from '../../domain/subjects'

interface BackupImportPlanOptions {
  localData?: Partial<BackupData>
}

interface CurrentBackupImportPlanOptions {
  collectData?: () => Promise<BackupData>
}

type EntityWithId = {
  id: EntityId
}

type SubjectNameRegistry = Map<string, Set<string>>

const ROOT_PARENT_KEY = '__root__'

function rowsOrEmpty<T>(rows?: T[] | null): T[] {
  return rows || []
}

function idSet<T extends EntityWithId>(rows: T[]): Set<EntityId> {
  return new Set(rows.map(row => row.id))
}

function subjectParentKey(parentSubjectId: EntityId | null | undefined): string {
  return parentSubjectId || ROOT_PARENT_KEY
}

function normalizeComparableName(name: string): string {
  return name.trim().toLowerCase()
}

function addUsedSubjectName(
  usedNamesByParent: SubjectNameRegistry,
  parentSubjectId: EntityId | null,
  name: string,
): void {
  const key = subjectParentKey(parentSubjectId)
  const usedNames = usedNamesByParent.get(key) || new Set<string>()
  usedNames.add(normalizeComparableName(name))
  usedNamesByParent.set(key, usedNames)
}

function createSubjectNameRegistry(subjects: Subject[]): SubjectNameRegistry {
  const registry: SubjectNameRegistry = new Map()

  for (const subject of subjects) {
    addUsedSubjectName(registry, subject.parentSubjectId, subject.name)
  }

  return registry
}

function createUniqueImportedSubjectName(
  name: string,
  parentSubjectId: EntityId | null,
  usedNamesByParent: SubjectNameRegistry,
): string {
  const baseName = name.trim() || 'Sin titulo'
  const key = subjectParentKey(parentSubjectId)
  const usedNames = usedNamesByParent.get(key) || new Set<string>()

  if (!usedNames.has(normalizeComparableName(baseName))) {
    return baseName
  }

  let counter = 1
  let candidate = `${baseName} (importada)`

  while (usedNames.has(normalizeComparableName(candidate))) {
    counter += 1
    candidate = `${baseName} (importada ${counter})`
  }

  return candidate
}

function skipItem(
  skipped: BackupImportSkippedItem[],
  entity: BackupImportEntity,
  id: EntityId,
  reason: string,
): void {
  skipped.push({ entity, id, reason })
}

function addRepair(
  repairs: BackupImportRelationshipRepair[],
  repair: BackupImportRelationshipRepair,
): void {
  repairs.push(repair)
}

function firstUniqueRows<T extends EntityWithId>(
  rows: T[],
  entity: BackupImportEntity,
  skipped: BackupImportSkippedItem[],
): T[] {
  const seen = new Set<EntityId>()
  const uniqueRows: T[] = []

  for (const row of rows) {
    if (seen.has(row.id)) {
      skipItem(skipped, entity, row.id, 'ID duplicado dentro del backup.')
      continue
    }

    seen.add(row.id)
    uniqueRows.push(row)
  }

  return uniqueRows
}

function countSkipped(skipped: BackupImportSkippedItem[], entity: BackupImportEntity): number {
  return skipped.filter(item => item.entity === entity).length
}

function planSubjects(
  importedSubjects: Subject[],
  localSubjects: Subject[],
  skipped: BackupImportSkippedItem[],
  renamedSubjects: BackupImportSubjectRename[],
  relationshipRepairs: BackupImportRelationshipRepair[],
): Subject[] {
  const localSubjectIds = idSet(localSubjects)
  const importedById = new Map(importedSubjects.map(subject => [subject.id, subject]))
  const plannedById = new Map<EntityId, Subject>()
  const usedNamesByParent = createSubjectNameRegistry(localSubjects)
  const planning = new Set<EntityId>()
  const finished = new Set<EntityId>()

  function subjectExists(subjectId: EntityId): boolean {
    return localSubjectIds.has(subjectId) || plannedById.has(subjectId)
  }

  function planSubject(subject: Subject): void {
    if (finished.has(subject.id)) return
    if (plannedById.has(subject.id)) return

    if (localSubjectIds.has(subject.id)) {
      skipItem(skipped, 'subject', subject.id, 'Ya existe una materia o seccion con el mismo ID.')
      finished.add(subject.id)
      return
    }

    if (planning.has(subject.id)) {
      addRepair(relationshipRepairs, {
        entity: 'subject',
        id: subject.id,
        field: 'parentSubjectId',
        from: subject.parentSubjectId,
        to: null,
        reason: 'Se detecto una relacion circular entre materias/secciones.',
      })
      const planned = reservePlannedSubject(subject, null)
      plannedById.set(planned.id, planned)
      finished.add(planned.id)
      return
    }

    planning.add(subject.id)

    let parentSubjectId = subject.parentSubjectId
    if (parentSubjectId && !localSubjectIds.has(parentSubjectId)) {
      const importedParent = importedById.get(parentSubjectId)
      if (importedParent) {
        planSubject(importedParent)
      }

      if (!subjectExists(parentSubjectId)) {
        addRepair(relationshipRepairs, {
          entity: 'subject',
          id: subject.id,
          field: 'parentSubjectId',
          from: parentSubjectId,
          to: null,
          reason: 'La materia padre no existe en el backup ni en los datos locales.',
        })
        parentSubjectId = null
      }

      if (plannedById.has(subject.id)) {
        planning.delete(subject.id)
        finished.add(subject.id)
        return
      }
    }

    const planned = reservePlannedSubject(subject, parentSubjectId)
    plannedById.set(planned.id, planned)
    finished.add(planned.id)
    planning.delete(subject.id)
  }

  function reservePlannedSubject(subject: Subject, parentSubjectId: EntityId | null): Subject {
    const name = createUniqueImportedSubjectName(subject.name, parentSubjectId, usedNamesByParent)

    addUsedSubjectName(usedNamesByParent, parentSubjectId, name)

    if (name !== subject.name.trim()) {
      renamedSubjects.push({
        id: subject.id,
        from: subject.name,
        to: name,
        parentSubjectId,
      })
    }

    return {
      ...subject,
      name,
      parentSubjectId,
    }
  }

  for (const subject of importedSubjects) {
    planSubject(subject)
  }

  return [...plannedById.values()]
}

function planNotes(
  importedNotes: Note[],
  localNotes: Note[],
  availableSubjectIds: Set<EntityId>,
  skipped: BackupImportSkippedItem[],
  relationshipRepairs: BackupImportRelationshipRepair[],
): Note[] {
  const localNoteIds = idSet(localNotes)
  const plannedNotes: Note[] = []

  for (const note of importedNotes) {
    if (localNoteIds.has(note.id)) {
      skipItem(skipped, 'note', note.id, 'Ya existe una nota con el mismo ID.')
      continue
    }

    let subjectId = note.subjectId
    if (subjectId && !availableSubjectIds.has(subjectId)) {
      addRepair(relationshipRepairs, {
        entity: 'note',
        id: note.id,
        field: 'subjectId',
        from: subjectId,
        to: null,
        reason: 'La materia de la nota no existe en el backup ni en los datos locales.',
      })
      subjectId = null
    }

    plannedNotes.push({
      ...note,
      subjectId,
    })
  }

  return plannedNotes
}

function planAcademicEvents(
  importedEvents: AcademicEvent[],
  localEvents: AcademicEvent[],
  availableSubjectIds: Set<EntityId>,
  skipped: BackupImportSkippedItem[],
  relationshipRepairs: BackupImportRelationshipRepair[],
): AcademicEvent[] {
  const localEventIds = idSet(localEvents)
  const plannedEvents: AcademicEvent[] = []

  for (const event of importedEvents) {
    if (localEventIds.has(event.id)) {
      skipItem(skipped, 'academicEvent', event.id, 'Ya existe una fecha academica con el mismo ID.')
      continue
    }

    let subjectId = event.subjectId
    if (subjectId && !availableSubjectIds.has(subjectId)) {
      addRepair(relationshipRepairs, {
        entity: 'academicEvent',
        id: event.id,
        field: 'subjectId',
        from: subjectId,
        to: null,
        reason: 'La materia de la fecha academica no existe en el backup ni en los datos locales.',
      })
      subjectId = null
    }

    plannedEvents.push({
      ...event,
      subjectId,
    })
  }

  return plannedEvents
}

export function createBackupImportPlan(
  parsed: ParsedBackupImport,
  options: BackupImportPlanOptions = {},
): BackupImportPlan {
  const localData = options.localData || {}
  const localSubjects = rowsOrEmpty(localData.subjects)
  const localNotes = rowsOrEmpty(localData.notes)
  const localAcademicEvents = rowsOrEmpty(localData.academicEvents)
  const skipped: BackupImportSkippedItem[] = []
  const renamedSubjects: BackupImportSubjectRename[] = []
  const relationshipRepairs: BackupImportRelationshipRepair[] = []

  const importedSubjects = firstUniqueRows(parsed.data.subjects, 'subject', skipped)
  const importedNotes = firstUniqueRows(parsed.data.notes, 'note', skipped)
  const importedAcademicEvents = firstUniqueRows(parsed.data.academicEvents, 'academicEvent', skipped)

  const plannedSubjects = planSubjects(
    importedSubjects,
    localSubjects,
    skipped,
    renamedSubjects,
    relationshipRepairs,
  )
  const availableSubjectIds = new Set<EntityId>([
    ...localSubjects.map(subject => subject.id),
    ...plannedSubjects.map(subject => subject.id),
  ])
  const plannedNotes = planNotes(
    importedNotes,
    localNotes,
    availableSubjectIds,
    skipped,
    relationshipRepairs,
  )
  const plannedAcademicEvents = planAcademicEvents(
    importedAcademicEvents,
    localAcademicEvents,
    availableSubjectIds,
    skipped,
    relationshipRepairs,
  )

  return {
    manifest: parsed.manifest,
    sourceCounts: parsed.counts,
    data: {
      subjects: plannedSubjects,
      notes: plannedNotes,
      academicEvents: plannedAcademicEvents,
    },
    counts: {
      subjects: {
        source: parsed.data.subjects.length,
        importable: plannedSubjects.length,
        skipped: countSkipped(skipped, 'subject'),
      },
      notes: {
        source: parsed.data.notes.length,
        importable: plannedNotes.length,
        skipped: countSkipped(skipped, 'note'),
      },
      academicEvents: {
        source: parsed.data.academicEvents.length,
        importable: plannedAcademicEvents.length,
        skipped: countSkipped(skipped, 'academicEvent'),
      },
      renamedSubjects: renamedSubjects.length,
      relationshipRepairs: relationshipRepairs.length,
    },
    skipped,
    renamedSubjects,
    relationshipRepairs,
    warnings: [...parsed.warnings],
  }
}

export async function createCurrentBackupImportPlan(
  parsed: ParsedBackupImport,
  options: CurrentBackupImportPlanOptions = {},
): Promise<BackupImportPlan> {
  const collectData = options.collectData || collectBackupData
  const localData = await collectData()

  return createBackupImportPlan(parsed, { localData })
}
