// =============================================================
// BackupView — Backup manual externo
//
// Responsabilidad: renderizar la vista de backup y conectar el
// flujo manual con la UI sin mezclarlo con el feed de notas.
// =============================================================

import {
  confirmBackupImport,
  prepareBackupImport,
} from '../../services/backup/BackupImportService.ts'
import {
  BACKUP_FLOW_STATUS,
  createAndShareCurrentBackup,
  dismissCurrentBackupReminder,
  getCurrentBackupReminder,
  getExternalBackupReadiness,
} from '../../services/backup/BackupFlowService.js'
import { BACKUP_REMINDER_REASONS } from '../../services/backup/BackupReminderService.ts'
import { confirmDialog } from '../common/ConfirmDialog.js'
import { showErrorToast } from '../common/Toast.js'
import './BackupView.css'

const UI_STATE = Object.freeze({
  LOADING: 'loading',
  READY: 'ready',
  WARNING: 'warning',
  OFFLINE: 'offline',
  BUSY: 'busy',
  SUCCESS: 'success', CANCELLED: 'cancelled',
  ERROR: 'error',
})

const IMPORT_STATE = Object.freeze({
  IDLE: 'idle',
  READING: 'reading',
  PREVIEW: 'preview',
  IMPORTING: 'importing',
  SUCCESS: 'success',
  ERROR: 'error',
})

function statusCopy(status) {
  if (status === BACKUP_FLOW_STATUS.BLOCKED_OFFLINE) {
    return {
      uiState: UI_STATE.OFFLINE,
      title: 'Sin conexion',
      message: 'Tus notas siguen disponibles. Para enviar un backup a Google Drive necesitás internet.',
      actionLabel: 'Crear backup externo',
      disabled: true,
    }
  }

  if (status === BACKUP_FLOW_STATUS.REQUIRES_WARNING) {
    return {
      uiState: UI_STATE.WARNING,
      title: 'Conexion con advertencia',
      message: 'Podés crear el backup ahora, pero la red actual puede consumir datos móviles o no estar identificada.',
      actionLabel: 'Crear backup de todos modos',
      disabled: false,
    }
  }

  return {
    uiState: UI_STATE.READY,
    title: 'Backup externo disponible',
    message: 'Lumapse va a crear un ZIP manual y abrir el selector de Android para elegir Google Drive u otro destino.',
    actionLabel: 'Crear backup externo',
    disabled: false,
  }
}

function renderBackupIcon() {
  return `
    <svg class="backup-view__icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 3v12"></path>
      <path d="m7 10 5 5 5-5"></path>
      <path d="M5 21h14"></path>
    </svg>
  `
}

function escapeHtml(value) {
  const div = document.createElement('div')
  div.textContent = String(value ?? '')
  return div.innerHTML
}

function backupItemSummary(counts) {
  if (!counts) return '0 nota(s), 0 materia(s), 0 fecha(s)'

  return `${counts.notes} nota(s), ${counts.subjects} materia(s), ${counts.academicEvents} fecha(s)`
}

function planImportSummary(plan) {
  if (!plan?.counts) return ''

  return `${plan.counts.notes.importable} nota(s), ${plan.counts.subjects.importable} materia(s), ${plan.counts.academicEvents.importable} fecha(s)`
}

function planSkippedSummary(plan) {
  if (!plan?.counts) return ''

  return `${plan.counts.notes.skipped} nota(s), ${plan.counts.subjects.skipped} materia(s), ${plan.counts.academicEvents.skipped} fecha(s)`
}

function renderImportPreview(state) {
  if (state.importStatus !== IMPORT_STATE.PREVIEW || !state.importPlan) return ''

  const plan = state.importPlan
  const skippedTotal = plan.counts.notes.skipped + plan.counts.subjects.skipped + plan.counts.academicEvents.skipped
  const adjustmentTotal = plan.counts.renamedSubjects + plan.counts.relationshipRepairs

  return `
    <div class="backup-view__import-preview" role="status">
      <p class="backup-view__status-title">Preview listo</p>
      <p class="backup-view__message">${escapeHtml(state.importFilename || 'backup.zip')}</p>
      <p class="backup-view__meta">Importará: ${planImportSummary(plan)}</p>
      ${skippedTotal > 0 ? `<p class="backup-view__meta">Omitirá duplicados: ${planSkippedSummary(plan)}</p>` : ''}
      ${adjustmentTotal > 0 ? `<p class="backup-view__meta">Ajustes: ${plan.counts.renamedSubjects} nombre(s), ${plan.counts.relationshipRepairs} relación(es)</p>` : ''}
      ${plan.warnings.length > 0 ? `<p class="backup-view__meta">Avisos: ${plan.warnings.length}</p>` : ''}
    </div>
  `
}

function renderImportResult(state) {
  if (state.importStatus === IMPORT_STATE.SUCCESS && state.importResult) {
    return `
      <p class="backup-view__result backup-view__result--success">
        Importación completada: ${backupItemSummary(state.importResult.imported)}.
      </p>
    `
  }

  if (state.importStatus === IMPORT_STATE.ERROR) {
    return `
      <p class="backup-view__result backup-view__result--error">
        ${escapeHtml(state.importErrorMessage || 'No se pudo importar el backup.')}
      </p>
    `
  }

  return ''
}

function renderImportPanel(state) {
  const reading = state.importStatus === IMPORT_STATE.READING
  const importing = state.importStatus === IMPORT_STATE.IMPORTING
  const busy = reading || importing
  const hasPreview = state.importStatus === IMPORT_STATE.PREVIEW && state.importPlan

  return `
    <div class="backup-view__import">
      <input class="js-backup-import-input" type="file" accept=".zip,application/zip,application/x-zip-compressed" hidden>
      <div class="backup-view__import-copy">
        <p class="backup-view__status-title">Importar backup</p>
        <p class="backup-view__message">Recuperá un ZIP generado por Lumapse.</p>
      </div>
      ${renderImportPreview(state)}
      <div class="backup-view__actions">
        <button class="backup-view__button backup-view__button--secondary js-btn-select-import" type="button" aria-label="Importar ZIP" title="Importar ZIP" ${busy ? 'disabled' : ''}>
          ${reading ? 'Leyendo ZIP...' : 'Importar ZIP'}
        </button>
        ${hasPreview ? `
          <button class="backup-view__button js-btn-confirm-import" type="button" aria-label="Confirmar importación" title="Confirmar importación" ${busy ? 'disabled' : ''}>
            ${importing ? 'Importando...' : 'Confirmar importación'}
          </button>
          <button class="backup-view__button backup-view__button--secondary js-btn-cancel-import" type="button" aria-label="Cancelar importación" title="Cancelar importación" ${busy ? 'disabled' : ''}>
            Cancelar
          </button>
        ` : ''}
      </div>
      ${renderImportResult(state)}
    </div>
  `
}

function reminderCopy(reminder) {
  if (!reminder?.shouldShow) return null

  if (reminder.reason === BACKUP_REMINDER_REASONS.BACKUP_DUE) {
    return {
      title: 'Backup pendiente',
      message: `Pasaron ${reminder.daysSinceLastBackup} dias desde el ultimo backup. Podes crear uno ahora sin activar sincronizacion automatica.`,
    }
  }

  return {
    title: 'Primer backup pendiente',
    message: 'Todavia no registramos un backup manual. Podes crear un ZIP externo para conservar tus notas fuera de la app.',
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
      <button class="backup-view__reminder-dismiss js-btn-dismiss-backup-reminder" type="button" aria-label="Cerrar aviso de backup" title="Cerrar aviso de backup">
        Cerrar aviso
      </button>
    </div>
  `
}

function renderBackupView(state) {
  const busy = state.uiState === UI_STATE.BUSY
  const success = state.uiState === UI_STATE.SUCCESS
  const cancelled = state.uiState === UI_STATE.CANCELLED
  const error = state.uiState === UI_STATE.ERROR
  const disabled = state.disabled || busy
  const countText = state.counts
    ? `${state.counts.notes} nota(s), ${state.counts.subjects} materia(s), ${state.counts.academicEvents} fecha(s)`
    : ''

  return `
    <div class="backup-view" data-state="${state.uiState}">
      <div class="backup-view__header">
        ${renderBackupIcon()}
        <div class="backup-view__heading">
          <p class="backup-view__eyebrow">Backup manual</p>
          <h2 class="backup-view__title">Respaldo externo</h2>
        </div>
      </div>

      <div class="backup-view__status">
        <p class="backup-view__status-title">${state.title}</p>
        <p class="backup-view__message">${state.message}</p>
        ${countText ? `<p class="backup-view__meta">Ultimo ZIP: ${countText}</p>` : ''}
      </div>

      ${renderBackupReminder(state.reminder)}

      <div class="backup-view__actions">
        <button class="backup-view__button js-btn-create-backup" type="button" aria-label="${busy ? 'Preparando backup' : state.actionLabel}" title="${busy ? 'Preparando backup' : state.actionLabel}" ${disabled ? 'disabled' : ''}>
          ${busy ? 'Preparando backup...' : state.actionLabel}
        </button>
        ${state.showRefresh ? '<button class="backup-view__button backup-view__button--secondary js-btn-refresh-backup" type="button" aria-label="Actualizar estado de backup" title="Actualizar estado de backup">Actualizar estado</button>' : ''}
      </div>

      ${success ? '<p class="backup-view__result backup-view__result--success">Backup entregado al selector del sistema. Verificá que aparezca en Google Drive o en el destino elegido.</p>' : ''}
      ${cancelled ? '<p class="backup-view__result backup-view__result--neutral">Selector cerrado sin elegir destino. Podés volver a intentar cuando quieras.</p>' : ''}
      ${error ? `<p class="backup-view__result backup-view__result--error">${escapeHtml(state.errorMessage)}</p>` : ''}

      ${renderImportPanel(state)}

      <p class="backup-view__note">
        Esto no sincroniza automáticamente. Lumapse crea un ZIP restaurable y legible para que vos elijas dónde guardarlo.
      </p>
    </div>
  `
}

export class BackupView {
  constructor(container, deps = {}) {
    this.container = container
    this.getReadiness = deps.getReadiness || getExternalBackupReadiness
    this.getReminder = deps.getReminder || getCurrentBackupReminder
    this.dismissReminder = deps.dismissReminder || dismissCurrentBackupReminder
    this.createAndShare = deps.createAndShare || createAndShareCurrentBackup
    this.prepareImport = deps.prepareImport || prepareBackupImport
    this.confirmImport = deps.confirmImport || confirmBackupImport
    this.confirmDialog = deps.confirmDialog || confirmDialog
    this.onImportComplete = deps.onImportComplete || (async () => {})
    this.destroyed = false
    this.state = {
      uiState: UI_STATE.LOADING,
      title: 'Revisando conexion',
      message: 'Estamos comprobando si el backup externo está disponible.',
      actionLabel: 'Crear backup externo',
      disabled: true,
      showRefresh: false,
      reminder: null,
      importStatus: IMPORT_STATE.IDLE,
      importPlan: null,
      importResult: null,
      importFilename: '',
      importErrorMessage: '',
    }

    this.handleClick = this.handleClick.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  async init() {
    this.destroyed = false
    this.container.addEventListener('click', this.handleClick)
    this.container.addEventListener('change', this.handleChange)
    this.render()
    await this.refresh()
  }

  destroy() {
    this.destroyed = true
    this.container.removeEventListener('click', this.handleClick)
    this.container.removeEventListener('change', this.handleChange)
  }

  render() {
    if (this.destroyed) return
    this.container.innerHTML = renderBackupView(this.state)
  }

  async loadReminder() {
    try {
      return await this.getReminder()
    } catch {
      return null
    }
  }

  async refresh() {
    this.state = {
      ...this.state,
      uiState: UI_STATE.LOADING,
      title: 'Revisando conexion',
      message: 'Estamos comprobando si el backup externo está disponible.',
      disabled: true,
      showRefresh: false,
    }
    this.render()

    try {
      const [readiness, reminder] = await Promise.all([
        this.getReadiness(),
        this.loadReminder(),
      ])
      if (this.destroyed) return
      this.state = {
        ...statusCopy(readiness.status),
        networkState: readiness.networkState,
        reminder,
        showRefresh: true,
      }
    } catch (error) {
      if (this.destroyed) return
      this.state = {
        uiState: UI_STATE.ERROR,
        title: 'No se pudo revisar la conexion',
        message: 'Intentá nuevamente en unos segundos.',
        actionLabel: 'Crear backup externo',
        disabled: true,
        showRefresh: true,
        reminder: this.state.reminder,
        errorMessage: error.message || 'Error desconocido.',
      }
    }

    this.render()
  }

  async createBackup(acceptNetworkWarning = false) {
    this.state = {
      ...this.state,
      uiState: UI_STATE.BUSY,
      title: 'Preparando backup',
      message: 'Creando ZIP y preparando el selector de Android.',
      disabled: true,
      showRefresh: false,
      reminder: this.state.reminder,
    }
    this.render()

    try {
      const result = await this.createAndShare({ acceptNetworkWarning })
      if (this.destroyed) return
      if (result.status === BACKUP_FLOW_STATUS.REQUIRES_WARNING) {
        this.state = {
          ...statusCopy(result.status),
          networkState: result.networkState,
          reminder: this.state.reminder,
          showRefresh: true,
        }
      } else if (result.status === BACKUP_FLOW_STATUS.BLOCKED_OFFLINE) {
        this.state = {
          ...statusCopy(result.status),
          networkState: result.networkState,
          reminder: this.state.reminder,
          showRefresh: true,
        }
      } else if (result.status === BACKUP_FLOW_STATUS.CANCELLED) {
        this.state = {
          uiState: UI_STATE.CANCELLED,
          title: 'Backup sin destino elegido',
          message: result.message || 'El selector se cerró antes de guardar o compartir el ZIP.',
          actionLabel: 'Intentar de nuevo',
          disabled: false,
          showRefresh: true,
          networkState: result.networkState,
          reminder: this.state.reminder,
        }
      } else {
        this.state = {
          uiState: UI_STATE.SUCCESS,
          title: 'Backup preparado',
          message: 'Android abrió el selector para guardar o compartir el ZIP.',
          actionLabel: 'Crear otro backup',
          disabled: false,
          showRefresh: true,
          networkState: result.networkState,
          counts: result.backup?.counts,
          reminder: { shouldShow: false },
        }
      }
    } catch (error) {
      if (this.destroyed) return
      const message = error.message || 'No se pudo crear el backup.'
      this.state = {
        ...this.state,
        uiState: UI_STATE.ERROR,
        title: 'No se pudo crear el backup',
        message: 'Revisá la conexión o intentá nuevamente.',
        actionLabel: 'Reintentar backup',
        disabled: false,
        showRefresh: true,
        reminder: this.state.reminder,
        errorMessage: message,
      }
      showErrorToast(message)
    }

    this.render()
  }

  async dismissBackupReminder() {
    try {
      await this.dismissReminder()
    } catch {
      // El cierre del aviso no debe bloquear la pantalla de backup.
    }

    if (this.destroyed) return
    this.state = {
      ...this.state,
      reminder: {
        ...(this.state.reminder || {}),
        shouldShow: false,
      },
    }
    this.render()
  }

  selectImportFile() {
    const input = this.container.querySelector('.js-backup-import-input')
    input?.click()
  }

  clearImportPreview() {
    this.state = {
      ...this.state,
      importStatus: IMPORT_STATE.IDLE,
      importPlan: null,
      importResult: null,
      importFilename: '',
      importErrorMessage: '',
    }
    this.render()
  }

  async prepareImportFromFile(file) {
    if (!file) return

    this.state = {
      ...this.state,
      importStatus: IMPORT_STATE.READING,
      importPlan: null,
      importResult: null,
      importFilename: file.name || '',
      importErrorMessage: '',
    }
    this.render()

    try {
      const plan = await this.prepareImport({ content: file, filename: file.name })
      if (this.destroyed) return

      this.state = {
        ...this.state,
        importStatus: IMPORT_STATE.PREVIEW,
        importPlan: plan,
        importResult: null,
        importFilename: file.name || '',
        importErrorMessage: '',
      }
    } catch (error) {
      if (this.destroyed) return
      const message = error.message || 'No se pudo leer el backup.'
      this.state = {
        ...this.state,
        importStatus: IMPORT_STATE.ERROR,
        importPlan: null,
        importResult: null,
        importErrorMessage: message,
      }
      showErrorToast(message)
    }

    this.render()
  }

  async confirmPreparedImport() {
    if (!this.state.importPlan) return

    const importSummary = planImportSummary(this.state.importPlan)
    const confirmed = await this.confirmDialog({
      title: 'Confirmar importación',
      message: `Lumapse importará ${importSummary}. Tus datos actuales no se reemplazan.`,
      confirmText: 'Importar',
    })
    if (!confirmed) return

    this.state = {
      ...this.state,
      importStatus: IMPORT_STATE.IMPORTING,
      importErrorMessage: '',
    }
    this.render()

    try {
      const result = await this.confirmImport(this.state.importPlan)
      await this.onImportComplete(result)
      if (this.destroyed) return

      this.state = {
        ...this.state,
        importStatus: IMPORT_STATE.SUCCESS,
        importPlan: null,
        importResult: result,
        importErrorMessage: '',
      }
    } catch (error) {
      if (this.destroyed) return
      const message = error.message || 'No se pudo importar el backup.'
      this.state = {
        ...this.state,
        importStatus: IMPORT_STATE.ERROR,
        importResult: null,
        importErrorMessage: message,
      }
      showErrorToast(message)
    }

    this.render()
  }

  async handleChange(event) {
    const input = event.target.closest?.('.js-backup-import-input')
    if (!input) return

    const file = input.files?.[0]
    input.value = ''
    await this.prepareImportFromFile(file)
  }

  async handleClick(event) {
    if (event.target.closest('.js-btn-dismiss-backup-reminder')) {
      await this.dismissBackupReminder()
      return
    }

    const createButton = event.target.closest('.js-btn-create-backup')
    if (createButton) {
      await this.createBackup(this.state.uiState === UI_STATE.WARNING)
      return
    }

    if (event.target.closest('.js-btn-refresh-backup')) {
      await this.refresh()
      return
    }

    if (event.target.closest('.js-btn-select-import')) {
      this.selectImportFile()
      return
    }

    if (event.target.closest('.js-btn-confirm-import')) {
      await this.confirmPreparedImport()
      return
    }

    if (event.target.closest('.js-btn-cancel-import')) {
      this.clearImportPreview()
    }
  }
}

export { IMPORT_STATE, UI_STATE, renderBackupView }
