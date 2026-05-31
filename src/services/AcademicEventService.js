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

export const ACADEMIC_EVENT_TYPES = Object.freeze(['parcial', 'final', 'tp', 'exposicion'])

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function todayLocalDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function assertId(id) {
  if (!id || !String(id).trim()) {
    throw new Error('El id de la fecha academica es obligatorio.')
  }
}

function normalizeTitle(title) {
  if (title === undefined || title === null) return null

  const normalized = String(title).trim()
  return normalized || null
}

function normalizeSubjectId(subjectId) {
  if (subjectId === undefined || subjectId === null) return null

  const normalized = String(subjectId).trim()
  return normalized || null
}

function normalizeType(type) {
  if (!type || !String(type).trim()) {
    throw new Error('El tipo de fecha academica es obligatorio.')
  }

  const normalized = String(type).trim()
  if (!ACADEMIC_EVENT_TYPES.includes(normalized)) {
    throw new Error(`Tipo de fecha academica invalido: "${normalized}".`)
  }

  return normalized
}

function isValidDateParts(year, month, day) {
  const parsed = new Date(Date.UTC(year, month - 1, day))

  return parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
}

function normalizeDate(date) {
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

function assertMonth(year, month) {
  if (!Number.isInteger(year) || year < 1) {
    throw new Error('El anio debe ser un numero entero valido.')
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error('El mes debe ser un numero entre 1 y 12.')
  }
}

function normalizeLimit(limit) {
  const normalized = Number(limit)

  if (!Number.isInteger(normalized) || normalized < 1) {
    throw new Error('El limite de fechas academicas debe ser un entero positivo.')
  }

  return normalized
}

async function validateSubjectExists(subjectId) {
  if (!subjectId) return null

  const subject = await getSubjectRowById(subjectId)
  if (!subject || subject.deletedAt) {
    throw new Error('La materia asociada no existe.')
  }

  return subjectId
}

async function normalizeCreateInput(input) {
  const event = input || {}

  return {
    type: normalizeType(event.type),
    title: normalizeTitle(event.title),
    date: normalizeDate(event.date),
    subjectId: await validateSubjectExists(normalizeSubjectId(event.subjectId)),
  }
}

async function normalizeUpdateInput(changes) {
  const normalized = {}

  if (changes.type !== undefined) {
    normalized.type = normalizeType(changes.type)
  }
  if (changes.title !== undefined) {
    normalized.title = normalizeTitle(changes.title)
  }
  if (changes.date !== undefined) {
    normalized.date = normalizeDate(changes.date)
  }
  if (changes.subjectId !== undefined) {
    normalized.subjectId = await validateSubjectExists(normalizeSubjectId(changes.subjectId))
  }

  return normalized
}

/**
 * Crea una fecha academica validada por dominio.
 */
export async function createAcademicEvent(input) {
  const normalized = await normalizeCreateInput(input)
  const now = new Date().toISOString()
  const event = {
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
export async function getAcademicEvents() {
  return await getAcademicEventRows()
}

/**
 * Obtiene una fecha academica por id.
 */
export async function getAcademicEventById(id) {
  assertId(id)
  return await getAcademicEventRowById(String(id).trim())
}

/**
 * Obtiene fechas academicas de un mes base 1.
 */
export async function getAcademicEventsByMonth(year, month) {
  assertMonth(year, month)
  return await getAcademicEventRowsByMonth(year, month)
}

/**
 * Obtiene fechas academicas de un dia especifico.
 */
export async function getAcademicEventsByDate(date) {
  return await getAcademicEventRowsByDate(normalizeDate(date))
}

/**
 * Obtiene proximas fechas academicas desde `today` inclusive.
 */
export async function getUpcomingAcademicEvents(today = todayLocalDate(), limit = 5) {
  return await getUpcomingAcademicEventRows(normalizeDate(today), normalizeLimit(limit))
}

/**
 * Actualiza una fecha academica existente.
 */
export async function updateAcademicEvent(id, changes = {}) {
  assertId(id)

  const eventId = String(id).trim()
  const existing = await getAcademicEventRowById(eventId)
  if (!existing) {
    throw new Error(`Fecha academica con id "${eventId}" no encontrada.`)
  }

  const normalized = await normalizeUpdateInput(changes || {})
  if (Object.keys(normalized).length === 0) return existing

  const updatedAt = new Date().toISOString()
  const update = {
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
export async function deleteAcademicEvent(id) {
  assertId(id)
  await deleteAcademicEventRow(String(id).trim())
}
