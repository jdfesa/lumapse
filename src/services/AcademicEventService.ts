// =============================================================
// AcademicEventService — Logica de dominio para fechas academicas
// Fase 2: Fechas academicas discretas (DP-007)
//
// Responsabilidad: validar y normalizar inputs antes de tocar SQLite.
// El store y la UI consumen este servicio, no el CRUD bajo nivel.
// =============================================================

import {
  createAcademicEventRow,
  getAcademicEventRows,
  getAcademicEventRowById,
  getAcademicEventRowsByMonth,
  getAcademicEventRowsByDate,
  getUpcomingAcademicEventRows,
  updateAcademicEventRow,
  deleteAcademicEventRow,
} from './sqlite/academicEvents.js'
import { getSubjectRowById } from './sqlite/subjects.js'
import type {
  AcademicEvent,
  AcademicEventChanges,
  AcademicEventInput,
  AcademicEventType,
} from '../domain/academicEvents'
import type { EntityId, ISODateString, ISODateTimeString } from '../domain/primitives'
import { ACADEMIC_EVENT_TITLE_MAX_LENGTH } from './AcademicEventRules'

export const ACADEMIC_EVENT_TYPES = Object.freeze([
  'parcial',
  'final',
  'tp',
  'exposicion',
] as const satisfies readonly AcademicEventType[])
export { ACADEMIC_EVENT_TITLE_MAX_LENGTH }

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

type AcademicEventCreateInput = Partial<AcademicEventInput> | null | undefined
type AcademicEventUpdateInput = Partial<AcademicEventChanges> | null | undefined
type NormalizedAcademicEventInput = Pick<AcademicEvent, 'type' | 'title' | 'date' | 'subjectId'>
type NormalizedAcademicEventChanges = Partial<NormalizedAcademicEventInput>
type AcademicEventUpdateRow = NormalizedAcademicEventChanges & {
  updatedAt: ISODateTimeString
}

interface SubjectLookupRow {
  id: EntityId
  deletedAt?: ISODateTimeString | null
}

function generateUUID(): EntityId {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function todayLocalDate(): ISODateString {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function assertId(id: unknown): asserts id is EntityId {
  if (!id || !String(id).trim()) {
    throw new Error('El id de la fecha academica es obligatorio.')
  }
}

function normalizeTitle(title: unknown): string | null {
  if (title === undefined || title === null) return null

  const normalized = String(title).trim()
  if (normalized.length > ACADEMIC_EVENT_TITLE_MAX_LENGTH) {
    throw new Error(`La nota breve no puede superar ${ACADEMIC_EVENT_TITLE_MAX_LENGTH} caracteres.`)
  }

  return normalized || null
}

function normalizeSubjectId(subjectId: unknown): EntityId | null {
  if (subjectId === undefined || subjectId === null) return null

  const normalized = String(subjectId).trim()
  return normalized || null
}

function isAcademicEventType(type: string): type is AcademicEventType {
  return (ACADEMIC_EVENT_TYPES as readonly string[]).includes(type)
}

function normalizeType(type: unknown): AcademicEventType {
  if (!type || !String(type).trim()) {
    throw new Error('El tipo de fecha academica es obligatorio.')
  }

  const normalized = String(type).trim()
  if (!isAcademicEventType(normalized)) {
    throw new Error(`Tipo de fecha academica invalido: "${normalized}".`)
  }

  return normalized
}

function isValidDateParts(year: number, month: number, day: number): boolean {
  const parsed = new Date(Date.UTC(year, month - 1, day))

  return parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
}

function normalizeDate(date: unknown): ISODateString {
  if (!date || !String(date).trim()) {
    throw new Error('La fecha academica es obligatoria.')
  }

  const normalized = String(date).trim()
  if (!DATE_RE.test(normalized)) {
    throw new Error('La fecha academica debe usar formato YYYY-MM-DD.')
  }

  const [year, month, day] = normalized.split('-').map(Number)
  if (!isValidDateParts(year, month, day)) {
    throw new Error('La fecha academica debe ser una fecha valida.')
  }

  return normalized
}

function assertMonth(year: number, month: number): void {
  if (!Number.isInteger(year) || year < 1) {
    throw new Error('El anio debe ser un numero entero valido.')
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error('El mes debe ser un numero entre 1 y 12.')
  }
}

function normalizeLimit(limit: unknown): number {
  const normalized = Number(limit)

  if (!Number.isInteger(normalized) || normalized < 1) {
    throw new Error('El limite de fechas academicas debe ser un entero positivo.')
  }

  return normalized
}

async function validateSubjectExists(subjectId: EntityId | null): Promise<EntityId | null> {
  if (!subjectId) return null

  const subject = await getSubjectRowById(subjectId) as SubjectLookupRow | undefined
  if (!subject || subject.deletedAt) {
    throw new Error('La materia asociada no existe.')
  }

  return subjectId
}

async function normalizeCreateInput(input: AcademicEventCreateInput): Promise<NormalizedAcademicEventInput> {
  const event = input || {}

  return {
    type: normalizeType(event.type),
    title: normalizeTitle(event.title),
    date: normalizeDate(event.date),
    subjectId: await validateSubjectExists(normalizeSubjectId(event.subjectId)),
  }
}

async function normalizeUpdateInput(changes: AcademicEventUpdateInput): Promise<NormalizedAcademicEventChanges> {
  const eventChanges = changes || {}
  const normalized: NormalizedAcademicEventChanges = {}

  if (eventChanges.type !== undefined) {
    normalized.type = normalizeType(eventChanges.type)
  }
  if (eventChanges.title !== undefined) {
    normalized.title = normalizeTitle(eventChanges.title)
  }
  if (eventChanges.date !== undefined) {
    normalized.date = normalizeDate(eventChanges.date)
  }
  if (eventChanges.subjectId !== undefined) {
    normalized.subjectId = await validateSubjectExists(normalizeSubjectId(eventChanges.subjectId))
  }

  return normalized
}

/**
 * Crea una fecha academica validada por dominio.
 */
export async function createAcademicEvent(input: AcademicEventCreateInput): Promise<AcademicEvent> {
  const normalized = await normalizeCreateInput(input)
  const now = new Date().toISOString()
  const event: AcademicEvent = {
    id: generateUUID(),
    ...normalized,
    createdAt: now,
    updatedAt: now,
  }

  await createAcademicEventRow(event)
  return event
}

/**
 * Obtiene todas las fechas academicas.
 */
export async function getAcademicEvents(): Promise<AcademicEvent[]> {
  return await getAcademicEventRows() as AcademicEvent[]
}

/**
 * Obtiene una fecha academica por id.
 */
export async function getAcademicEventById(id: unknown): Promise<AcademicEvent | undefined> {
  assertId(id)
  return await getAcademicEventRowById(String(id).trim()) as AcademicEvent | undefined
}

/**
 * Obtiene fechas academicas de un mes base 1.
 */
export async function getAcademicEventsByMonth(year: number, month: number): Promise<AcademicEvent[]> {
  assertMonth(year, month)
  return await getAcademicEventRowsByMonth(year, month) as AcademicEvent[]
}

/**
 * Obtiene fechas academicas de un dia especifico.
 */
export async function getAcademicEventsByDate(date: unknown): Promise<AcademicEvent[]> {
  return await getAcademicEventRowsByDate(normalizeDate(date)) as AcademicEvent[]
}

/**
 * Obtiene proximas fechas academicas desde `today` inclusive.
 */
export async function getUpcomingAcademicEvents(
  today: unknown = todayLocalDate(),
  limit: unknown = 5,
): Promise<AcademicEvent[]> {
  return await getUpcomingAcademicEventRows(normalizeDate(today), normalizeLimit(limit)) as AcademicEvent[]
}

/**
 * Actualiza una fecha academica existente.
 */
export async function updateAcademicEvent(
  id: unknown,
  changes: AcademicEventUpdateInput = {},
): Promise<AcademicEvent> {
  assertId(id)

  const eventId = String(id).trim()
  const existing = await getAcademicEventRowById(eventId) as AcademicEvent | undefined
  if (!existing) {
    throw new Error(`Fecha academica con id "${eventId}" no encontrada.`)
  }

  const normalized = await normalizeUpdateInput(changes)
  if (Object.keys(normalized).length === 0) return existing

  const updatedAt = new Date().toISOString()
  const update: AcademicEventUpdateRow = {
    ...normalized,
    updatedAt,
  }

  await updateAcademicEventRow(eventId, update)

  return {
    ...existing,
    ...update,
  }
}

/**
 * Elimina una fecha academica.
 */
export async function deleteAcademicEvent(id: unknown): Promise<void> {
  assertId(id)
  await deleteAcademicEventRow(String(id).trim())
}
