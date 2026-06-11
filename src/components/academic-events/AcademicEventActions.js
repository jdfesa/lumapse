// =============================================================
// AcademicEventActions — Acciones UI para fechas academicas
// =============================================================

import * as NoteStore from '../../store/NoteStore.js'
import { confirmDialog } from '../common/ConfirmDialog.js'
import { openAcademicEventDialog } from './AcademicEventDialog.js'

function eventTitle(event) {
  return event?.title || 'esta fecha academica'
}

export async function handleAcademicEventAction(action, event) {
  if (!event?.id) return

  if (action === 'edit') {
    await openAcademicEventDialog({
      mode: 'edit',
      event,
    })
    return
  }

  if (action === 'delete') {
    const confirmed = await confirmDialog({
      title: 'Eliminar fecha academica',
      message: `¿Eliminar ${eventTitle(event)}? Esta accion no afecta notas ni materias.`,
      confirmText: 'Eliminar',
      danger: true,
    })

    if (confirmed) {
      await NoteStore.deleteAcademicEvent(event.id)
    }
  }
}

export function bindAcademicEventActions(container, getEventById) {
  if (!container) return

  container.querySelectorAll('.js-academic-event-action').forEach(button => {
    button.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()
      clickEvent.stopPropagation()

      const action = button.dataset.eventAction
      const event = getEventById(button.dataset.eventId)

      handleAcademicEventAction(action, event)
        .catch(error => console.warn('[AcademicEventActions] No se pudo ejecutar la accion:', error))
    })
  })
}
