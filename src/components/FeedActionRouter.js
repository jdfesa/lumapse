// =============================================================
// FeedActionRouter — Enrutador de acciones del feed
// Hito 04: Organización y UX
//
// Responsabilidad: Resolver clicks delegados del feed y ejecutar
// la acción correspondiente sin acoplar el componente NoteList.
// =============================================================

import * as NoteStore from '../store/NoteStore.js'
import { renderTrashView } from './TrashView.js'
import { confirmDialog } from './ConfirmDialog.js'

const TASK_LINE_REGEX = /^(\s*[-*+]\s+\[)([ xX])(\]\s+)/
const pendingCheckboxToggles = new Set()

function refreshTrash(deps) {
  if (deps.refreshTrash) {
    deps.refreshTrash()
    return
  }
  renderTrashView(deps.feedContainer)
}

function handleMenuToggle(event, button, deps) {
  event.stopPropagation()
  const dropdown = button.nextElementSibling
  const isOpen = dropdown.classList.contains('is-open')
  deps.closeAllDropdowns()
  if (!isOpen) {
    dropdown.classList.add('is-open')
  }
}

function getTaskToggle(content, lineIndex) {
  const lines = content.split('\n')
  const line = lines[lineIndex]
  const match = line?.match(TASK_LINE_REGEX)
  if (!match) return null

  const nextChecked = match[2].toLowerCase() !== 'x'
  lines[lineIndex] = line.replace(TASK_LINE_REGEX, `$1${nextChecked ? 'x' : ' '}$3`)

  return {
    content: lines.join('\n'),
    checked: nextChecked
  }
}

function setCheckboxChecked(checkbox, checked) {
  checkbox.checked = checked
  window.setTimeout(() => {
    if (checkbox.isConnected) {
      checkbox.checked = checked
    }
  }, 0)
}

async function handleTaskCheckbox(event) {
  event.preventDefault()
  event.stopPropagation()

  const checkbox = event.target
  if (checkbox.disabled) return

  const card = checkbox.closest('.note-card')
  const lineIndex = Number.parseInt(checkbox.dataset.line, 10)
  if (!card || Number.isNaN(lineIndex)) return

  const noteId = card.dataset.id
  const note = NoteStore.getState().notes.find(n => n.id === noteId)
  const toggle = note ? getTaskToggle(note.content, lineIndex) : null
  if (!note || !toggle) return

  const lockKey = `${noteId}:${lineIndex}`
  if (pendingCheckboxToggles.has(lockKey)) return

  const previousChecked = !toggle.checked
  pendingCheckboxToggles.add(lockKey)
  checkbox.disabled = true
  setCheckboxChecked(checkbox, toggle.checked)

  try {
    await NoteStore.updateNoteSilent(noteId, { content: toggle.content })
  } catch (error) {
    setCheckboxChecked(checkbox, previousChecked)
    console.error('[FeedActionRouter] No se pudo actualizar checkbox:', error)
  } finally {
    pendingCheckboxToggles.delete(lockKey)
    if (checkbox.isConnected) {
      checkbox.disabled = false
    }
  }
}

const ACTION_MAP = [
  {
    selector: '.js-btn-empty-trash',
    handler: async (_event, _button, deps) => {
      const confirmed = await confirmDialog({
        title: 'Vaciar papelera',
        message: 'Esto eliminará permanentemente todas las notas y materias. Esta acción no se puede deshacer.',
        confirmText: 'Vaciar',
        danger: true,
      })
      if (confirmed) {
        await NoteStore.emptyTrash()
        refreshTrash(deps)
      }
    }
  },
  {
    selector: '.js-btn-restore',
    handler: (_event, button, deps) => {
      NoteStore.restoreNoteFromTrash(button.dataset.id).then(() => refreshTrash(deps))
    }
  },
  {
    selector: '.js-btn-permanent-delete',
    handler: async (_event, button, deps) => {
      const confirmed = await confirmDialog({
        title: 'Eliminar nota',
        message: '¿Eliminar permanentemente esta nota? Esta acción no se puede deshacer.',
        confirmText: 'Eliminar',
        danger: true,
      })
      if (confirmed) {
        await NoteStore.permanentlyDeleteNote(button.dataset.id)
        refreshTrash(deps)
      }
    }
  },
  {
    selector: '.js-btn-restore-subject',
    handler: (_event, button, deps) => {
      NoteStore.restoreSubjectFromTrash(button.dataset.id).then(() => refreshTrash(deps))
    }
  },
  {
    selector: '.js-btn-restore-section',
    handler: (_event, button, deps) => {
      NoteStore.restoreSectionFromTrash(button.dataset.id).then(() => refreshTrash(deps))
    }
  },
  {
    selector: '.js-btn-menu',
    handler: handleMenuToggle
  },
  {
    selector: '.js-btn-pin',
    handler: (_event, button) => NoteStore.togglePin(button.dataset.id)
  },
  {
    selector: '.js-btn-archive',
    handler: (_event, button) => NoteStore.toggleArchive(button.dataset.id)
  },
  {
    selector: '.js-btn-move-to',
    handler: (_event, button, deps) => {
      const noteId = button.dataset.noteId
      const targetSubject = button.dataset.subjectId || null
      NoteStore.moveNote(noteId, targetSubject)
      deps.closeAllDropdowns()
    }
  },
  {
    selector: '.js-btn-status',
    handler: (_event, button, deps) => {
      const noteId = button.dataset.noteId
      const statusValue = button.dataset.emoji || null
      NoteStore.setNoteStatus(noteId, statusValue)
      deps.closeAllDropdowns()
    }
  },
  {
    selector: '.js-btn-edit',
    handler: (_event, button, deps) => deps.onEdit(button.dataset.id)
  },
  {
    selector: '.js-btn-delete',
    handler: (_event, button, deps) => deps.onDelete(button.dataset.id)
  },
  {
    selector: '.js-btn-copy',
    handler: (_event, button, deps) => deps.onCopy(button)
  }
]

/**
 * Crea un router de acciones para el feed.
 * @param {object} deps Dependencias inyectadas
 * @param {Function} deps.onEdit Callback para editar nota (recibe id)
 * @param {Function} deps.onDelete Callback para eliminar nota (recibe id)
 * @param {Function} deps.onCopy Callback para copiar nota (recibe el elemento botón)
 * @param {Function} deps.closeAllDropdowns Cierra todos los dropdowns abiertos
 * @param {Function} deps.refreshTrash Re-renderiza la vista de papelera
 * @returns {Function} Event handler para el listener de clicks del feed
 */
export function createFeedActionRouter(deps) {
  return (event) => {
    // Checkbox interactivo: toggle de task list (- [ ] <-> - [x])
    if (event.target.type === 'checkbox' && event.target.hasAttribute('data-line')) {
      handleTaskCheckbox(event)
      return
    }

    for (const entry of ACTION_MAP) {
      const button = event.target.closest(entry.selector)
      if (button) {
        if (entry.selector !== '.js-btn-menu' && entry.selector !== '.js-btn-copy') {
          deps.closeAllDropdowns()
        }
        entry.handler(event, button, deps)
        return
      }
    }

    deps.closeAllDropdowns()
  }
}
