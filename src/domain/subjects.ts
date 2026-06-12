import type { EntityId, HexColor, ISODateTimeString } from './primitives'

export interface Subject {
  id: EntityId
  name: string
  parentSubjectId: EntityId | null
  archived: boolean
  color: HexColor | null
  createdAt: ISODateTimeString
  deletedAt?: ISODateTimeString | null
  noteCount?: number
  children?: Subject[]
}

export interface SubjectTree {
  inboxCount: number
  tree: Subject[]
}

export interface ArchivedSubjectTree {
  tree: Subject[]
}

export interface SubjectChanges {
  name?: string
  color?: HexColor | null
  parentSubjectId?: EntityId | null
  archived?: boolean
}
