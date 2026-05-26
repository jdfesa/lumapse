// =============================================================
// FeedActionRouter — Enrutador de acciones del feed
// Hito 04: Organización y UX
//
// Responsabilidad: Resolver clicks delegados del feed y ejecutar
// la acción correspondiente sin acoplar el componente NoteList.
// =============================================================

import * as NoteStore from '../store/NoteStore.js'
import { renderTrashView } from './TrashView.js'

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

const ACTION_MAP = [
  {
    selector: '.js-btn-empty-trash',
    handler: (_event, _button, deps) => {
      if (confirm('¿Vaciar la papelera? Esto eliminará permanentemente todas las notas y materias. Esta acción no se puede deshacer.')) {
        NoteStore.emptyTrash().then(() => refreshTrash(deps))
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
    handler: (_event, button, deps) => {
      if (confirm('¿Eliminar permanentemente esta nota? Esta acción no se puede deshacer.')) {
        NoteStore.permanentlyDeleteNote(button.dataset.id).then(() => refreshTrash(deps))
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
      const emoji = button.dataset.emoji || null
      NoteStore.setNoteStatus(noteId, emoji)
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
    // Checkbox interactivo: toggle de task list (- [ ] ↔ - [x])
    if (event.target.type === 'checkbox' && event.target.hasAttribute('data-line')) {
      event.preventDefault() // Prevenir toggle nativo del browser
      event.stopPropagation()
      
      const checkbox = event.target
      if (checkbox.disabled) return // Prevenir double-tap rápido
      checkbox.disabled = true // Bloquear el checkbox hasta el re-render
      
      // Toggle visual inmediato para mejor UX
      checkbox.checked = !checkbox.checked

      const checkboxIdx = parseInt(checkbox.dataset.line, 10)
      const card = checkbox.closest('.note-card')
      if (!card) return
      const noteId = card.dataset.id
      const state = NoteStore.getState()
      const note = state.notes.find(n => n.id === noteId)
      if (!note) return

      // Encontrar la línea del checkbox en el contenido original
      const lines = note.content.split('\n')
      let currentIdx = 0
      for (let i = 0; i < lines.length; i++) {
        if (/^- \[[ x]\] /.test(lines[i])) {
          if (currentIdx === checkboxIdx) {
            // Toggle
            if (lines[i].startsWith('- [ ] ')) {
              lines[i] = lines[i].replace('- [ ] ', '- [x] ')
            } else {
              lines[i] = lines[i].replace('- [x] ', '- [ ] ')
            }
            break
          }
          currentIdx++
        }
      }

      const newContent = lines.join('\n')
      // Usar updateNoteSilent: guarda en DB y state pero NO re-renderiza el feed.
      // El DOM ya refleja el cambio (checkbox.checked se toggleó arriba).
      NoteStore.updateNoteSilent(noteId, { content: newContent }).then(() => {
        checkbox.disabled = false // Re-habilitar después de guardar
      })
      return
    }

    const menuButton = event.target.closest('.js-btn-menu')

    if (!menuButton) {
      deps.closeAllDropdowns()
    }

    for (const entry of ACTION_MAP) {
      const button = event.target.closest(entry.selector)
      if (button) {
        entry.handler(event, button, deps)
        return
      }
    }
  }
}
