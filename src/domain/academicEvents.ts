import type { EntityId, HexColor, ISODateString, ISODateTimeString } from './primitives'

export type AcademicEventType = 'parcial' | 'final' | 'tp' | 'exposicion'

export interface AcademicEvent {
  id: EntityId
  type: AcademicEventType
  title: string | null
  date: ISODateString
  subjectId: EntityId | null
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
  subjectName?: string | null
  subjectColor?: HexColor | null
}

export interface AcademicEventInput {
  type: AcademicEventType
  title?: string | null
  date: ISODateString
  subjectId?: EntityId | null
}

export interface AcademicEventChanges {
  type?: AcademicEventType
  title?: string | null
  date?: ISODateString
  subjectId?: EntityId | null
}

export interface AcademicEventsMonth {
  year: number
  month: number
}
