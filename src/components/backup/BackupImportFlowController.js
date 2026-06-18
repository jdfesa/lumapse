import { showErrorToast } from '../common/Toast.js'
import {
  createInitialImportState,
  IMPORT_STATE,
  planImportSummary,
} from './BackupImportUI.js'

export class BackupImportFlowController {
  constructor(deps) {
    this.container = deps.container
    this.getState = deps.getState
    this.setState = deps.setState
    this.render = deps.render
    this.isDestroyed = deps.isDestroyed
    this.prepareImport = deps.prepareImport
    this.confirmImport = deps.confirmImport
    this.confirmDialog = deps.confirmDialog
    this.onImportComplete = deps.onImportComplete
  }

  selectFile() {
    const input = this.container.querySelector('.js-backup-import-input')
    input?.click()
  }

  clearPreview() {
    this.setState(createInitialImportState())
    this.render()
  }

  async prepareFromFile(file) {
    if (!file) return

    this.setState({
      ...createInitialImportState(),
      importStatus: IMPORT_STATE.READING,
      importFilename: file.name || '',
    })
    this.render()

    try {
      const plan = await this.prepareImport({ content: file, filename: file.name })
      if (this.isDestroyed()) return
      this.setState({
        importStatus: IMPORT_STATE.PREVIEW,
        importPlan: plan,
        importFilename: file.name || '',
      })
    } catch (error) {
      if (this.isDestroyed()) return
      const message = error.message || 'No se pudo leer el ZIP.'
      this.setState({
        ...createInitialImportState(),
        importStatus: IMPORT_STATE.ERROR,
        importErrorMessage: message,
      })
      showErrorToast(message)
    }

    this.render()
  }

  async confirmPrepared() {
    const plan = this.getState().importPlan
    if (!plan) return

    const confirmed = await this.confirmDialog({
      title: 'Confirmar importación ZIP',
      message: `Lumapse importará ${planImportSummary(plan)} desde este ZIP. Tus datos actuales no se reemplazan.`,
      confirmText: 'Importar ZIP',
    })
    if (!confirmed) return
    if (this.isDestroyed()) return

    this.setState({
      importStatus: IMPORT_STATE.IMPORTING,
      importErrorMessage: '',
    })
    this.render()

    try {
      const result = await this.confirmImport(plan)
      await this.onImportComplete(result)
      if (this.isDestroyed()) return
      this.setState({
        ...createInitialImportState(),
        importStatus: IMPORT_STATE.SUCCESS,
        importResult: result,
      })
    } catch (error) {
      if (this.isDestroyed()) return
      const message = error.message || 'No se pudo importar el ZIP.'
      this.setState({
        importStatus: IMPORT_STATE.ERROR,
        importResult: null,
        importErrorMessage: message,
      })
      showErrorToast(message)
    }

    this.render()
  }
}
