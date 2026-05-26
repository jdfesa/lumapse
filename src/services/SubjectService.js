// =============================================================
// SubjectService.js — Lógica de negocio para Materias (Barrel)
// Paso 9: Categorización por materia (DP-002 / DP-004)
//
// Este archivo es un barrel que re-exporta desde los submódulos.
// Patrón idéntico al usado en NoteStore.js.
// =============================================================
export { SUBJECT_COLORS, createSubject, getAllSubjects, getSubjectById, updateSubject, archiveSubject, unarchiveSubject, archiveSection, unarchiveSection, getSubjectTree } from './SubjectService.crud.js'
export { deleteSubject, deleteSection, restoreSubject, restoreSection, restoreNoteFromTrash, getTrashItems, emptyTrash, autoPurge } from './SubjectService.trash.js'
