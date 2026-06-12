import type { EntityId, ISODateTimeString } from './primitives'

export interface Note {
  id: EntityId
  title: string
  content: string
  pinned: boolean
  archived: boolean
  statusEmoji: string | null
  subjectId: EntityId | null
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
  deletedAt?: ISODateTimeString | null
}

export interface NoteChanges {
  title?: string
  content?: string
  pinned?: boolean
  archived?: boolean
  statusEmoji?: string | null
  subjectId?: EntityId | null
}
