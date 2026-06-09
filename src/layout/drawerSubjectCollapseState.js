// =============================================================
// drawerSubjectCollapseState — Persistencia local del drawer
// =============================================================

export const DRAWER_SUBJECT_COLLAPSE_STORAGE_KEY = 'lumapse-drawer-collapsed-subjects'

function getLocalStorage() {
  if (typeof localStorage === 'undefined') return null
  return localStorage
}

function normalizeSubjectId(subjectId) {
  return String(subjectId || '').trim()
}

function normalizeSubjectIds(subjectIds) {
  if (!Array.isArray(subjectIds)) return []

  return [...new Set(
    subjectIds
      .map(normalizeSubjectId)
      .filter(Boolean),
  )].sort()
}

export function readCollapsedSubjectIds() {
  const storage = getLocalStorage()
  if (!storage) return new Set()

  try {
    const rawValue = storage.getItem(DRAWER_SUBJECT_COLLAPSE_STORAGE_KEY)
    if (!rawValue) return new Set()

    const parsedValue = JSON.parse(rawValue)
    return new Set(normalizeSubjectIds(parsedValue))
  } catch {
    return new Set()
  }
}

export function writeCollapsedSubjectIds(subjectIds) {
  const storage = getLocalStorage()
  if (!storage) return false

  try {
    const normalizedIds = normalizeSubjectIds([...subjectIds])

    if (normalizedIds.length === 0) {
      storage.removeItem(DRAWER_SUBJECT_COLLAPSE_STORAGE_KEY)
    } else {
      storage.setItem(DRAWER_SUBJECT_COLLAPSE_STORAGE_KEY, JSON.stringify(normalizedIds))
    }

    return true
  } catch {
    return false
  }
}

export function isSubjectCollapsed(subjectId, collapsedSubjectIds = readCollapsedSubjectIds()) {
  const normalizedId = normalizeSubjectId(subjectId)
  if (!normalizedId) return false

  return collapsedSubjectIds.has(normalizedId)
}

export function setSubjectCollapsed(subjectId, collapsed, collapsedSubjectIds = readCollapsedSubjectIds()) {
  const normalizedId = normalizeSubjectId(subjectId)
  const nextCollapsedSubjectIds = new Set(collapsedSubjectIds)

  if (!normalizedId) return nextCollapsedSubjectIds

  if (collapsed) {
    nextCollapsedSubjectIds.add(normalizedId)
  } else {
    nextCollapsedSubjectIds.delete(normalizedId)
  }

  writeCollapsedSubjectIds(nextCollapsedSubjectIds)
  return nextCollapsedSubjectIds
}

export function toggleSubjectCollapsed(subjectId, collapsedSubjectIds = readCollapsedSubjectIds()) {
  return setSubjectCollapsed(
    subjectId,
    !isSubjectCollapsed(subjectId, collapsedSubjectIds),
    collapsedSubjectIds,
  )
}
