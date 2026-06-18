// =============================================================
// BackupView — Backup manual externo
//
// Responsabilidad: orquestar exportacion/importacion desde la
// vista de backup sin mezclar servicios, render ni store.
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
import { confirmDialog } from '../common/ConfirmDialog.js'
import { showErrorToast } from '../common/Toast.js'
import {
  renderBackupExportSection,
  statusCopy,
  UI_STATE,
} from './BackupExportUI.js'
import {
  createInitialImportState,
  IMPORT_STATE,
  renderImportPanel,
} from './BackupImportUI.js'
import { BackupImportFlowController } from './BackupImportFlowController.js'
import {
  BACKUP_PANEL,
  normalizeBackupPanel,
  renderBackupPanelTabs,
} from './BackupViewPanels.js'
import './BackupView.css'

function renderBackupView(state) {
  const panel = normalizeBackupPanel(state.activePanel)

  return `
    <div class="backup-view" data-state="${state.uiState}" data-panel="${panel}">
      ${renderBackupPanelTabs(panel)}
      ${panel === BACKUP_PANEL.EXPORT ? renderBackupExportSection(state) : renderImportPanel(state)}
      <p class="backup-view__note">
        Esto no sincroniza automáticamente. Exportar crea un ZIP restaurable; importar recupera un ZIP compatible.
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
    this.onPanelChange = deps.onPanelChange || (() => {})
    this.destroyed = false
    this.state = {
      uiState: UI_STATE.LOADING,
      title: 'Revisando conexion',
      message: 'Estamos comprobando si la exportación ZIP está disponible.',
      actionLabel: 'Exportar ZIP',
      disabled: true,
      showRefresh: false,
      reminder: null,
      activePanel: normalizeBackupPanel(deps.initialPanel),
      ...createInitialImportState(),
    }
    this.importFlow = new BackupImportFlowController({
      container: this.container,
      getState: () => this.state,
      setState: (patch) => this.setState(patch),
      render: () => this.render(),
      isDestroyed: () => this.destroyed,
      prepareImport: deps.prepareImport || prepareBackupImport,
      confirmImport: deps.confirmImport || confirmBackupImport,
      confirmDialog: deps.confirmDialog || confirmDialog,
      onImportComplete: deps.onImportComplete || (async () => {}),
    })

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

  setState(patch) {
    this.state = {
      ...this.state,
      ...patch,
    }
  }

  setPanel(panel, options = {}) {
    const nextPanel = normalizeBackupPanel(panel)
    if (this.state.activePanel === nextPanel) return

    this.state = {
      ...this.state,
      activePanel: nextPanel,
    }
    this.render()
    if (options.notify) this.onPanelChange(nextPanel)
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
      message: 'Estamos comprobando si la exportación ZIP está disponible.',
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
        ...this.state,
        ...statusCopy(readiness.status),
        networkState: readiness.networkState,
        reminder,
        showRefresh: true,
      }
    } catch (error) {
      if (this.destroyed) return
      this.state = {
        ...this.state,
        uiState: UI_STATE.ERROR,
        title: 'No se pudo revisar la conexion',
        message: 'Intentá nuevamente en unos segundos.',
        actionLabel: 'Exportar ZIP',
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
      title: 'Preparando ZIP',
      message: 'Creando ZIP y preparando el selector de Android.',
      disabled: true,
      showRefresh: false,
    }
    this.render()

    try {
      const result = await this.createAndShare({ acceptNetworkWarning })
      if (this.destroyed) return
      this.updateAfterBackupFlow(result)
    } catch (error) {
      if (this.destroyed) return
      const message = error.message || 'No se pudo exportar el ZIP.'
      this.state = {
        ...this.state,
        uiState: UI_STATE.ERROR,
        title: 'No se pudo exportar el ZIP',
        message: 'Revisá la conexión o intentá nuevamente.',
        actionLabel: 'Reintentar exportación',
        disabled: false,
        showRefresh: true,
        errorMessage: message,
      }
      showErrorToast(message)
    }

    this.render()
  }

  updateAfterBackupFlow(result) {
    if (result.status === BACKUP_FLOW_STATUS.REQUIRES_WARNING || result.status === BACKUP_FLOW_STATUS.BLOCKED_OFFLINE) {
      this.state = {
        ...this.state,
        ...statusCopy(result.status),
        networkState: result.networkState,
        showRefresh: true,
      }
      return
    }

    if (result.status === BACKUP_FLOW_STATUS.CANCELLED) {
      this.state = {
        ...this.state,
        uiState: UI_STATE.CANCELLED,
        title: 'ZIP sin destino elegido',
        message: result.message || 'El selector se cerró antes de guardar o compartir el ZIP.',
        actionLabel: 'Exportar ZIP de nuevo',
        disabled: false,
        showRefresh: true,
        networkState: result.networkState,
      }
      return
    }

    this.state = {
      ...this.state,
      uiState: UI_STATE.SUCCESS,
      title: 'ZIP preparado',
      message: 'Android abrió el selector para guardar o compartir el ZIP.',
      actionLabel: 'Exportar otro ZIP',
      disabled: false,
      showRefresh: true,
      networkState: result.networkState,
      counts: result.backup?.counts,
      reminder: { shouldShow: false },
    }
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

  async handleChange(event) {
    const input = event.target.closest?.('.js-backup-import-input')
    if (!input) return

    const file = input.files?.[0]
    input.value = ''
    await this.importFlow.prepareFromFile(file)
  }

  async handleClick(event) {
    const panelTab = event.target.closest('.js-backup-panel-tab')
    if (panelTab) {
      this.setPanel(panelTab.dataset.panel, { notify: true })
      return
    }

    if (event.target.closest('.js-btn-dismiss-backup-reminder')) {
      await this.dismissBackupReminder()
      return
    }

    if (event.target.closest('.js-btn-create-backup')) {
      await this.createBackup(this.state.uiState === UI_STATE.WARNING)
      return
    }

    if (event.target.closest('.js-btn-refresh-backup')) {
      await this.refresh()
      return
    }

    if (event.target.closest('.js-btn-select-import')) {
      this.importFlow.selectFile()
      return
    }

    if (event.target.closest('.js-btn-confirm-import')) {
      await this.importFlow.confirmPrepared()
      return
    }

    if (event.target.closest('.js-btn-cancel-import')) {
      this.importFlow.clearPreview()
    }
  }
}

export { BACKUP_PANEL, IMPORT_STATE, UI_STATE, renderBackupView }
