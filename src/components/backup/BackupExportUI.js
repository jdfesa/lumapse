import { BACKUP_FLOW_STATUS } from '../../services/backup/BackupFlowService.js'
import { BACKUP_REMINDER_REASONS } from '../../services/backup/BackupReminderService.ts'

export const UI_STATE = Object.freeze({
  LOADING: 'loading',
  READY: 'ready',
  WARNING: 'warning',
  OFFLINE: 'offline',
  BUSY: 'busy',
  SUCCESS: 'success',
  CANCELLED: 'cancelled',
  ERROR: 'error',
})

function escapeHtml(value) {
  const div = document.createElement('div')
  div.textContent = String(value ?? '')
  return div.innerHTML
}

export function statusCopy(status) {
  if (status === BACKUP_FLOW_STATUS.BLOCKED_OFFLINE) {
    return {
      uiState: UI_STATE.OFFLINE,
      title: 'Sin conexion',
      message: 'Tus notas siguen disponibles. Para exportar un ZIP a Google Drive u otro destino necesitás internet.',
      actionLabel: 'Exportar ZIP',
      disabled: true,
    }
  }

  if (status === BACKUP_FLOW_STATUS.REQUIRES_WARNING) {
    return {
      uiState: UI_STATE.WARNING,
      title: 'Conexion con advertencia',
      message: 'Podés exportar el ZIP ahora, pero la red actual puede consumir datos móviles o no estar identificada.',
      actionLabel: 'Exportar ZIP de todos modos',
      disabled: false,
    }
  }

  return {
    uiState: UI_STATE.READY,
    title: 'Listo para exportar ZIP',
    message: 'Lumapse va a crear un ZIP restaurable y abrir el selector de Android para elegir Google Drive u otro destino.',
    actionLabel: 'Exportar ZIP',
    disabled: false,
  }
}

function renderBackupIcon() {
  return `
    <svg class="backup-view__icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 21V9"></path>
      <path d="m17 14-5-5-5 5"></path>
      <path d="M5 3h14"></path>
    </svg>
  `
}

function reminderCopy(reminder) {
  if (!reminder?.shouldShow) return null

  if (reminder.reason === BACKUP_REMINDER_REASONS.BACKUP_DUE) {
    return {
      title: 'Exportar ZIP pendiente',
      message: `Pasaron ${reminder.daysSinceLastBackup} dias desde el ultimo ZIP exportado. Podes exportar uno ahora sin activar sincronizacion automatica.`,
    }
  }

  return {
    title: 'Primer ZIP pendiente',
    message: 'Todavia no registramos un ZIP exportado. Podes exportar uno para conservar tus notas fuera de la app.',
  }
}

function renderBackupReminder(reminder) {
  const copy = reminderCopy(reminder)
  if (!copy) return ''

  return `
    <div class="backup-view__reminder" role="status">
      <div class="backup-view__reminder-copy">
        <p class="backup-view__reminder-title">${copy.title}</p>
        <p class="backup-view__message">${copy.message}</p>
      </div>
      <button class="backup-view__reminder-dismiss js-btn-dismiss-backup-reminder" type="button" aria-label="Cerrar aviso de exportación ZIP" title="Cerrar aviso de exportación ZIP">
        Cerrar aviso
      </button>
    </div>
  `
}

export function renderBackupExportSection(state) {
  const busy = state.uiState === UI_STATE.BUSY
  const success = state.uiState === UI_STATE.SUCCESS
  const cancelled = state.uiState === UI_STATE.CANCELLED
  const error = state.uiState === UI_STATE.ERROR
  const disabled = state.disabled || busy
  const countText = state.counts
    ? `${state.counts.notes} nota(s), ${state.counts.subjects} materia(s), ${state.counts.academicEvents} fecha(s)`
    : ''

  return `
    <section class="backup-view__panel backup-view__panel--export">
      <div class="backup-view__header">
        ${renderBackupIcon()}
        <div class="backup-view__heading">
          <p class="backup-view__eyebrow">ZIP Lumapse</p>
          <h2 class="backup-view__title">Exportar ZIP</h2>
        </div>
      </div>

      <div class="backup-view__status">
        <p class="backup-view__status-title">${state.title}</p>
        <p class="backup-view__message">${state.message}</p>
        ${countText ? `<p class="backup-view__meta">Ultimo ZIP: ${countText}</p>` : ''}
      </div>

      ${renderBackupReminder(state.reminder)}

      <div class="backup-view__actions">
        <button class="backup-view__button js-btn-create-backup" type="button" aria-label="${busy ? 'Exportando ZIP' : state.actionLabel}" title="${busy ? 'Exportando ZIP' : state.actionLabel}" ${disabled ? 'disabled' : ''}>
          ${busy ? 'Exportando ZIP...' : state.actionLabel}
        </button>
        ${state.showRefresh ? '<button class="backup-view__button backup-view__button--secondary js-btn-refresh-backup" type="button" aria-label="Actualizar estado de backup" title="Actualizar estado de backup">Actualizar estado</button>' : ''}
      </div>

      ${success ? '<p class="backup-view__result backup-view__result--success">ZIP entregado al selector del sistema. Verificá que aparezca en Google Drive o en el destino elegido.</p>' : ''}
      ${cancelled ? '<p class="backup-view__result backup-view__result--neutral">Selector cerrado sin elegir destino. Podés volver a intentar cuando quieras.</p>' : ''}
      ${error ? `<p class="backup-view__result backup-view__result--error">${escapeHtml(state.errorMessage)}</p>` : ''}
    </section>
  `
}
