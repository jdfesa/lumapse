// =============================================================
// AcademicEventSubjects — Metadatos de materia para fechas
// =============================================================

export function findAcademicEventSubjectMeta(subjectId, subjectsData) {
  if (!subjectId || !subjectsData?.tree) return null

  for (const root of subjectsData.tree) {
    if (root.id === subjectId) {
      return {
        label: root.name,
        color: root.color,
      }
    }

    for (const child of (root.children || [])) {
      if (child.id === subjectId) {
        return {
          label: `${root.name} > ${child.name}`,
          color: child.color || root.color,
        }
      }
    }
  }

  return null
}

export function getAcademicEventSubjectColor(event, subjectsData) {
  return findAcademicEventSubjectMeta(event?.subjectId, subjectsData)?.color || null
}

export function getAcademicEventSubjectLabel(event, subjectsData) {
  return findAcademicEventSubjectMeta(event?.subjectId, subjectsData)?.label || ''
}
