// =============================================================
// NoteStore.academicEvents — Estado y acciones de fechas academicas
// Fase 3: Store y selectores (DP-007)
//
// Responsabilidad: exponer fechas academicas al resto de la app
// sin acoplar componentes a servicios ni a SQLite.
// =============================================================

import * as AcademicEventService from '../services/AcademicEventService.ts'
import { runStoreAction } from './NoteStore.errors.js'
import { state, notify } from './NoteStore.state.js'

let academicEventsRequestVersion = 0
let monthRequestVersion = 0
let upcomingRequestVersion = 0
let mutationRevision = 0
const academicEventMutations = new Map()

function sortAcademicEvents(events) {
  return [...events].sort((a, b) => {
    const byDate = String(a.date).localeCompare(String(b.date))
    if (byDate !== 0) return byDate

    const byCreatedAt = new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
    if (byCreatedAt !== 0) return byCreatedAt

    return String(a.id).localeCompare(String(b.id))
  })
}

function dedupeAcademicEvents(events) {
  const byId = new Map()
  for (const event of events) {
    if (event?.id) byId.set(event.id, event)
  }
  return sortAcademicEvents([...byId.values()])
}

function upsertAcademicEvent(events, event) {
  return dedupeAcademicEvents([
    ...events.filter(existing => existing.id !== event.id),
    event,
  ])
}

function removeAcademicEvent(events, id) {
  return events.filter(event => event.id !== id)
}

function eventBelongsToMonth(event, monthState) {
  if (!event?.date || !monthState) return false

  const [year, month] = event.date.split('-').map(Number)
  return year === monthState.year && month === monthState.month
}

async function readLatest(load, isCurrent) {
  try {
    const value = await load()
    return isCurrent() ? { current: true, value } : { current: false }
  } catch (error) {
    if (isCurrent()) throw error
    return { current: false }
  }
}

function recordAcademicEventMutation(id, value) {
  mutationRevision += 1
  academicEventMutations.set(String(id).trim(), { revision: mutationRevision, value })
}

function reconcileReadWithMutations(events, readRevision, monthState = null) {
  let reconciled = dedupeAcademicEvents(events)

  for (const [id, mutation] of academicEventMutations) {
    if (mutation.revision <= readRevision) continue

    reconciled = removeAcademicEvent(reconciled, id)
    if (mutation.value && (!monthState || eventBelongsToMonth(mutation.value, monthState))) {
      reconciled = upsertAcademicEvent(reconciled, mutation.value)
    }
  }

  return reconciled
}

async function readUpcomingAcademicEvents(today, limit) {
  const requestVersion = ++upcomingRequestVersion
  return readLatest(
    () => AcademicEventService.getUpcomingAcademicEvents(today, limit),
    () => requestVersion === upcomingRequestVersion,
  )
}

function reconcileMonthEvent(event) {
  state.academicEventsForMonth = removeAcademicEvent(state.academicEventsForMonth, event.id)

  if (eventBelongsToMonth(event, state.academicEventsMonth)) {
    state.academicEventsForMonth = upsertAcademicEvent(state.academicEventsForMonth, event)
  }
}

async function reloadUpcomingAcademicEvents() {
  const result = await readUpcomingAcademicEvents()
  if (result.current) state.upcomingAcademicEvents = result.value
}

/**
 * Carga todas las fechas academicas disponibles.
 */
export async function loadAcademicEvents() {
  const requestVersion = ++academicEventsRequestVersion
  const readRevision = mutationRevision
  const result = await readLatest(
    () => AcademicEventService.getAcademicEvents(),
    () => requestVersion === academicEventsRequestVersion,
  )
  if (!result.current) return

  state.academicEvents = reconcileReadWithMutations(result.value, readRevision)
  notify()
}

/**
 * Carga las fechas academicas de un mes base 1 para consumo del Heatmap.
 */
export async function loadAcademicEventsByMonth(year, month) {
  const requestVersion = ++monthRequestVersion
  const readRevision = mutationRevision
  const result = await readLatest(
    () => AcademicEventService.getAcademicEventsByMonth(year, month),
    () => requestVersion === monthRequestVersion,
  )
  if (!result.current) return

  const monthState = { year, month }
  state.academicEventsForMonth = reconcileReadWithMutations(result.value, readRevision, monthState)
  state.academicEventsMonth = monthState
  state.academicEvents = reconcileReadWithMutations(
    [...state.academicEvents, ...result.value],
    readRevision,
  )
  notify()
}

/**
 * Carga las proximas fechas academicas para recordatorio pasivo.
 */
export async function loadUpcomingAcademicEvents(today, limit) {
  const result = await readUpcomingAcademicEvents(today, limit)
  if (!result.current) return

  state.upcomingAcademicEvents = result.value
  notify()
}

/**
 * Crea una fecha academica y sincroniza los caches del store.
 */
export async function createAcademicEvent(input) {
  return runStoreAction('createAcademicEvent', 'No se pudo crear la fecha academica. Intenta de nuevo.', async () => {
    const event = await AcademicEventService.createAcademicEvent(input)

    recordAcademicEventMutation(event.id, event)
    state.academicEvents = upsertAcademicEvent(state.academicEvents, event)
    reconcileMonthEvent(event)
    await reloadUpcomingAcademicEvents()
    notify()

    return event
  })
}

/**
 * Actualiza una fecha academica y sincroniza los caches del store.
 */
export async function updateAcademicEvent(id, changes) {
  return runStoreAction('updateAcademicEvent', 'No se pudo actualizar la fecha academica. Intenta de nuevo.', async () => {
    const event = await AcademicEventService.updateAcademicEvent(id, changes)

    recordAcademicEventMutation(event.id, event)
    state.academicEvents = upsertAcademicEvent(state.academicEvents, event)
    reconcileMonthEvent(event)
    await reloadUpcomingAcademicEvents()
    notify()

    return event
  })
}

/**
 * Elimina una fecha academica y limpia los caches del store.
 */
export async function deleteAcademicEvent(id) {
  return runStoreAction('deleteAcademicEvent', 'No se pudo eliminar la fecha academica. Intenta de nuevo.', async () => {
    await AcademicEventService.deleteAcademicEvent(id)
    const eventId = String(id).trim()

    recordAcademicEventMutation(eventId, null)
    state.academicEvents = removeAcademicEvent(state.academicEvents, eventId)
    state.academicEventsForMonth = removeAcademicEvent(state.academicEventsForMonth, eventId)
    await reloadUpcomingAcademicEvents()
    notify()
  })
}

/**
 * Selector para el Heatmap: eventos del mes visible cargado.
 */
export function getAcademicEventsForHeatmap() {
  return state.academicEventsForMonth
}

/**
 * Selector por fecha exacta (`YYYY-MM-DD`) usando los caches cargados.
 */
export function getAcademicEventsForDate(date) {
  if (!date) return []

  const events = dedupeAcademicEvents([
    ...state.academicEvents,
    ...state.academicEventsForMonth,
  ])

  return events.filter(event => event.date === date)
}

/**
 * Selector para la fecha seleccionada en el Heatmap.
 */
export function getAcademicEventsForSelectedDate() {
  return getAcademicEventsForDate(state.dateFilter)
}
