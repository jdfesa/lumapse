// =============================================================
// AcademicEventSubjects — Metadatos de materia para fechas
// =============================================================

function findInTree(subjectId, tree, archived = false) {
  if (!subjectId || !Array.isArray(tree)) return null

  for (const root of tree) {
    if (root.id === subjectId) {
      return {
        label: root.name,
        color: root.color,
        archived,
      }
    }

    for (const child of (root.children || [])) {
      if (child.id === subjectId) {
        return {
          label: `${root.name} > ${child.name}`,
          color: child.color || root.color,
          archived,
        }
      }
    }
  }

  return null
}

export function createAcademicEventSubjectCatalog(state) {
  return {
    tree: state?.subjects?.tree || state?.tree || [],
    archivedTree: state?.archivedSubjects?.tree || state?.archivedTree || [],
    archivedSubjectIds: state?.archivedSubjectIds || [],
  }
}

export function findAcademicEventSubjectMeta(subjectId, subjectsData) {
  if (!subjectId) return null

  const catalog = createAcademicEventSubjectCatalog(subjectsData)
  const activeMeta = findInTree(subjectId, catalog.tree, false)
  if (activeMeta) return activeMeta

  const archivedMeta = findInTree(subjectId, catalog.archivedTree, true)
  if (archivedMeta) return archivedMeta

  if (catalog.archivedSubjectIds.includes(subjectId)) {
    return {
      label: 'Materia archivada',
      color: null,
      archived: true,
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

export function isAcademicEventSubjectArchived(event, subjectsData) {
  return findAcademicEventSubjectMeta(event?.subjectId, subjectsData)?.archived || false
}
