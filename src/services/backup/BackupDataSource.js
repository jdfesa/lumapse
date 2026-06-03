// =============================================================
// backup/BackupDataSource
//
// Responsabilidad: reunir desde SQLite los datos respaldables
// para entregarlos al generador ZIP sin acoplarlo a la base.
// =============================================================

import { getAcademicEventRows } from '../sqlite/academicEvents.js'
import { getAllNotes } from '../sqlite/notes.js'
import { getAllSubjectRowsIncludingArchived } from '../sqlite/subjects.js'

/**
 * Lee los datos actuales que forman parte del backup v1.
 * Las funciones SQLite usadas ya excluyen papelera y conservan archivados.
 * @returns {Promise<{subjects: object[], notes: object[], academicEvents: object[]}>}
 */
export async function collectBackupData() {
  const [subjects, notes, academicEvents] = await Promise.all([
    getAllSubjectRowsIncludingArchived(),
    getAllNotes(),
    getAcademicEventRows(),
  ])

  return {
    subjects,
    notes,
    academicEvents,
  }
}

export function countBackupItems(data = {}) {
  return {
    subjects: data.subjects?.length || 0,
    notes: data.notes?.length || 0,
    academicEvents: data.academicEvents?.length || 0,
  }
}

export function hasBackupData(data = {}) {
  const counts = countBackupItems(data)
  return counts.subjects + counts.notes + counts.academicEvents > 0
}
