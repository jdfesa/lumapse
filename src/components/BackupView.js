// =============================================================
// BackupView — Backup manual externo
//
// Responsabilidad: renderizar la vista de backup y conectar el
// flujo manual con la UI sin mezclarlo con el feed de notas.
// =============================================================

import {
  BACKUP_FLOW_STATUS,
  createAndShareCurrentBackup,
  getExternalBackupReadiness,
} from '../services/backup/BackupFlowService.js'
import { showErrorToast } from './Toast.js'
import './BackupView.css'

const UI_STATE = Object.freeze({
  LOADING: 'loading',
  READY: 'ready',
  WARNING: 'warning',
  OFFLINE: 'offline',
  BUSY: 'busy',
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

function renderBackupView(state) {
  const busy = state.uiState === UI_STATE.BUSY
  const success = state.uiState === UI_STATE.SUCCESS
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

      <div class="backup-view__actions">
        <button class="backup-view__button js-btn-create-backup" ${disabled ? 'disabled' : ''}>
          ${busy ? 'Preparando backup...' : state.actionLabel}
        </button>
        ${state.showRefresh ? '<button class="backup-view__button backup-view__button--secondary js-btn-refresh-backup">Actualizar estado</button>' : ''}
      </div>

      ${success ? '<p class="backup-view__result backup-view__result--success">Backup entregado al selector del sistema. Verificá que aparezca en Google Drive o en el destino elegido.</p>' : ''}
      ${error ? `<p class="backup-view__result backup-view__result--error">${state.errorMessage}</p>` : ''}

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
    this.createAndShare = deps.createAndShare || createAndShareCurrentBackup
    this.destroyed = false
    this.state = {
      uiState: UI_STATE.LOADING,
      title: 'Revisando conexion',
      message: 'Estamos comprobando si el backup externo está disponible.',
      actionLabel: 'Crear backup externo',
      disabled: true,
      showRefresh: false,
    }

    this.handleClick = this.handleClick.bind(this)
  }

  async init() {
    this.destroyed = false
    this.container.addEventListener('click', this.handleClick)
    this.render()
    await this.refresh()
  }

  destroy() {
    this.destroyed = true
    this.container.removeEventListener('click', this.handleClick)
  }

  render() {
    if (this.destroyed) return
    this.container.innerHTML = renderBackupView(this.state)
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
      const readiness = await this.getReadiness()
      if (this.destroyed) return
      this.state = {
        ...statusCopy(readiness.status),
        networkState: readiness.networkState,
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
    }
    this.render()

    try {
      const result = await this.createAndShare({ acceptNetworkWarning })
      if (this.destroyed) return
      if (result.status === BACKUP_FLOW_STATUS.REQUIRES_WARNING) {
        this.state = {
          ...statusCopy(result.status),
          networkState: result.networkState,
          showRefresh: true,
        }
      } else if (result.status === BACKUP_FLOW_STATUS.BLOCKED_OFFLINE) {
        this.state = {
          ...statusCopy(result.status),
          networkState: result.networkState,
          showRefresh: true,
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
        errorMessage: message,
      }
      showErrorToast(message)
    }

    this.render()
  }

  async handleClick(event) {
    const createButton = event.target.closest('.js-btn-create-backup')
    if (createButton) {
      await this.createBackup(this.state.uiState === UI_STATE.WARNING)
      return
    }

    if (event.target.closest('.js-btn-refresh-backup')) {
      await this.refresh()
    }
  }
}

export { UI_STATE, renderBackupView }
