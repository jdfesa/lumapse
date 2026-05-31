// =============================================================
// NoteStore.js — Estado reactivo en memoria (Barrel File)
// =============================================================
// Este archivo actúa como un Facade / Barrel File que re-exporta
// la lógica desde los submódulos, evitando romper importaciones
// en los componentes que ya dependen de NoteStore.

export { subscribe, getState } from './NoteStore.state.js'
export * from './NoteStore.data.js'
export * from './NoteStore.ui.js'
export * from './NoteStore.academicEvents.js'
