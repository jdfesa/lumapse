import type { AcademicEvent, AcademicEventsMonth } from './academicEvents'
import type { Note } from './notes'
import type { ArchivedSubjectTree, SubjectTree } from './subjects'
import type { EntityId, ISODateString } from './primitives'

export type ViewMode = 'inbox' | 'subject' | 'archived' | 'trash' | 'backup' | 'all'

export interface AppState {
  notes: Note[]
  notesLoaded: boolean
  activeNoteId: EntityId | null
  searchQuery: string
  dateFilter: ISODateString | null
  sidebarOpen: boolean
  subjects: SubjectTree | []
  activeSubjectId: EntityId | null
  viewMode: ViewMode
  trashCount: number
  showTrashWarning: boolean
  archivedSubjectIds: EntityId[]
  archivedSubjects: ArchivedSubjectTree | null
  academicEvents: AcademicEvent[]
  academicEventsForMonth: AcademicEvent[]
  academicEventsMonth: AcademicEventsMonth | null
  upcomingAcademicEvents: AcademicEvent[]
}
