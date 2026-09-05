// =============================================================
// TrashRequestOwner — Vigencia de lecturas de Papelera
// =============================================================

import { renderTrashView } from './TrashView.js'

const consumerOwners = new WeakMap()

export function createTrashRequestOwner(consumer, feedContainer) {
  const owner = Symbol('trash-request-owner')
  let active = false
  let destroyed = false
  let requestVersion = 0

  consumerOwners.set(consumer, owner)

  const isConsumerCurrent = () => (
    !destroyed && active && consumerOwners.get(consumer) === owner
  )

  const invalidate = () => {
    requestVersion += 1
  }

  return {
    setActive(nextActive) {
      if (active === nextActive) return
      active = nextActive
      invalidate()
    },

    async update(nextActive) {
      this.setActive(nextActive)
      return nextActive ? this.refresh() : false
    },

    async refresh() {
      if (!isConsumerCurrent()) return false

      const ownedVersion = ++requestVersion
      const isCurrent = () => (
        isConsumerCurrent() && ownedVersion === requestVersion
      )

      try {
        return await renderTrashView(feedContainer, { isCurrent })
      } catch (error) {
        if (isCurrent()) console.error('[NoteList] No se pudo cargar la papelera:', error)
        return false
      }
    },

    destroy() {
      destroyed = true
      active = false
      invalidate()
      if (consumerOwners.get(consumer) === owner) {
        consumerOwners.delete(consumer)
      }
    },
  }
}
