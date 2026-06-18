import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../../src/services/backup/BackupFlowService.js', () => ({
  BACKUP_FLOW_STATUS: {
    READY: 'ready',
    BLOCKED_OFFLINE: 'blocked-offline',
    REQUIRES_WARNING: 'requires-warning',
    CANCELLED: 'cancelled',
    SHARED: 'shared',
  },
  createAndShareCurrentBackup: vi.fn(),
  dismissCurrentBackupReminder: vi.fn(),
  getCurrentBackupReminder: vi.fn(),
  getExternalBackupReadiness: vi.fn(),
}))

vi.mock('../../../../src/services/backup/BackupImportService.ts', () => ({
  confirmBackupImport: vi.fn(),
  prepareBackupImport: vi.fn(),
}))

vi.mock('../../../../src/components/common/ConfirmDialog.js', () => ({
  confirmDialog: vi.fn(),
}))

vi.mock('../../../../src/components/common/Toast.js', () => ({
  showErrorToast: vi.fn(),
}))

import {
  BACKUP_FLOW_STATUS,
  createAndShareCurrentBackup,
  dismissCurrentBackupReminder,
  getCurrentBackupReminder,
  getExternalBackupReadiness,
} from '../../../../src/services/backup/BackupFlowService.js'
import { confirmDialog } from '../../../../src/components/common/ConfirmDialog.js'
import { showErrorToast } from '../../../../src/components/common/Toast.js'
import { BackupView } from '../../../../src/components/backup/BackupView.js'

const WIFI_READINESS = {
  status: BACKUP_FLOW_STATUS.READY,
  ready: true,
  message: 'Con WiFi. Podes exportar un ZIP.',
  networkState: {
    connectionType: 'wifi',
    externalBackupAllowed: true,
    requiresWarning: false,
  },
}

const CELLULAR_READINESS = {
  status: BACKUP_FLOW_STATUS.REQUIRES_WARNING,
  ready: false,
  message: 'Con datos moviles. Podes exportar un ZIP, pero puede consumir datos.',
  networkState: {
    connectionType: 'cellular',
    externalBackupAllowed: true,
    requiresWarning: true,
  },
}

const OFFLINE_READINESS = {
  status: BACKUP_FLOW_STATUS.BLOCKED_OFFLINE,
  ready: false,
  message: 'Sin conexion.',
  networkState: {
    connectionType: 'none',
    externalBackupAllowed: false,
    requiresWarning: false,
  },
}

function createContainer() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  return container
}

function createDeferred() {
  let resolve
  let reject
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

async function flushPromises(times = 4) {
  for (let index = 0; index < times; index += 1) {
    await Promise.resolve()
  }
}

function importPlan(overrides = {}) {
  return {
    counts: {
      subjects: { source: 2, importable: 2, skipped: 0 },
      notes: { source: 5, importable: 5, skipped: 0 },
      academicEvents: { source: 1, importable: 1, skipped: 0 },
      renamedSubjects: 0,
      relationshipRepairs: 0,
      ...(overrides.counts || {}),
    },
    warnings: overrides.warnings || [],
    ...(overrides.extra || {}),
  }
}

function importResult(overrides = {}) {
  return {
    imported: {
      subjects: 2,
      notes: 5,
      academicEvents: 1,
      ...(overrides.imported || {}),
    },
    skipped: [],
    renamedSubjects: [],
    relationshipRepairs: [],
    warnings: [],
  }
}

function selectImportFile(container, file = new File(['zip'], 'lumapse.zip', { type: 'application/zip' })) {
  const input = container.querySelector('.js-backup-import-input')
  Object.defineProperty(input, 'files', {
    value: [file],
    configurable: true,
  })
  input.dispatchEvent(new Event('change', { bubbles: true }))
  return file
}

beforeEach(() => {
  document.body.innerHTML = ''
  vi.clearAllMocks()
  getExternalBackupReadiness.mockResolvedValue(WIFI_READINESS)
  getCurrentBackupReminder.mockResolvedValue({
    shouldShow: false,
    reason: 'recent-backup',
    daysSinceLastBackup: 2,
    thresholdDays: 30,
  })
  dismissCurrentBackupReminder.mockReturnValue('2026-06-03T12:00:00.000Z')
  confirmDialog.mockResolvedValue(true)
  createAndShareCurrentBackup.mockResolvedValue({
    status: BACKUP_FLOW_STATUS.SHARED,
    networkState: WIFI_READINESS.networkState,
    backup: {
      counts: {
        subjects: 2,
        notes: 5,
        academicEvents: 1,
      },
    },
    share: {
      uri: 'file:///cache/lumapse.zip',
    },
  })
})

describe('BackupView', () => {
  it('renderiza estado disponible cuando hay WiFi', async () => {
    const container = createContainer()
    const view = new BackupView(container)

    await view.init()

    expect(container.textContent).toContain('Listo para exportar ZIP')
    expect(container.textContent).toContain('Exportar ZIP')
    expect(container.textContent).toContain('Importar ZIP')
    expect(container.querySelector('.js-btn-create-backup').disabled).toBe(false)

    view.destroy()
  })

  it('renderiza estado offline con accion deshabilitada', async () => {
    getExternalBackupReadiness.mockResolvedValue(OFFLINE_READINESS)
    const container = createContainer()
    const view = new BackupView(container)

    await view.init()

    expect(container.textContent).toContain('Sin conexion')
    expect(container.querySelector('.js-btn-create-backup').disabled).toBe(true)

    view.destroy()
  })

  it('renderiza advertencia para datos moviles y confirma al hacer click', async () => {
    getExternalBackupReadiness.mockResolvedValue(CELLULAR_READINESS)
    const container = createContainer()
    const view = new BackupView(container)

    await view.init()

    expect(container.textContent).toContain('Conexion con advertencia')

    container.querySelector('.js-btn-create-backup').click()
    await Promise.resolve()
    await Promise.resolve()

    expect(createAndShareCurrentBackup).toHaveBeenCalledWith({ acceptNetworkWarning: true })
    expect(container.textContent).toContain('ZIP preparado')

    view.destroy()
  })

  it('muestra resultado exitoso despues de compartir', async () => {
    const container = createContainer()
    const view = new BackupView(container)

    await view.init()
    container.querySelector('.js-btn-create-backup').click()
    await Promise.resolve()
    await Promise.resolve()

    expect(container.textContent).toContain('ZIP preparado')
    expect(container.textContent).toContain('5 nota(s), 2 materia(s), 1 fecha(s)')

    view.destroy()
  })

  it('muestra estado neutral si el usuario cierra el selector sin elegir destino', async () => {
    createAndShareCurrentBackup.mockResolvedValue({
      status: BACKUP_FLOW_STATUS.CANCELLED,
      message: 'El selector se cerro sin elegir un destino para el backup.',
      networkState: WIFI_READINESS.networkState,
    })
    const container = createContainer()
    const view = new BackupView(container)

    await view.init()
    container.querySelector('.js-btn-create-backup').click()
    await Promise.resolve()
    await Promise.resolve()

    expect(container.textContent).toContain('ZIP sin destino elegido')
    expect(container.textContent).toContain('Selector cerrado sin elegir destino')
    expect(showErrorToast).not.toHaveBeenCalled()

    view.destroy()
  })

  it('muestra recordatorio cuando nunca hubo backup previo', async () => {
    getCurrentBackupReminder.mockResolvedValue({
      shouldShow: true,
      reason: 'never-backed-up',
      daysSinceLastBackup: null,
      thresholdDays: 30,
    })
    const container = createContainer()
    const view = new BackupView(container)

    await view.init()

    expect(container.textContent).toContain('Primer ZIP pendiente')
    expect(container.textContent).toContain('Todavia no registramos un ZIP exportado')

    view.destroy()
  })

  it('permite cerrar el recordatorio sin iniciar backup', async () => {
    getCurrentBackupReminder.mockResolvedValue({
      shouldShow: true,
      reason: 'backup-due',
      daysSinceLastBackup: 35,
      thresholdDays: 30,
    })
    const container = createContainer()
    const view = new BackupView(container)

    await view.init()
    container.querySelector('.js-btn-dismiss-backup-reminder').click()
    await Promise.resolve()
    await Promise.resolve()

    expect(dismissCurrentBackupReminder).toHaveBeenCalledTimes(1)
    expect(createAndShareCurrentBackup).not.toHaveBeenCalled()
    expect(container.textContent).not.toContain('Exportar ZIP pendiente')

    view.destroy()
  })

  it('oculta el recordatorio despues de crear un backup exitoso', async () => {
    getCurrentBackupReminder.mockResolvedValue({
      shouldShow: true,
      reason: 'backup-due',
      daysSinceLastBackup: 35,
      thresholdDays: 30,
    })
    const container = createContainer()
    const view = new BackupView(container)

    await view.init()
    expect(container.textContent).toContain('Exportar ZIP pendiente')

    container.querySelector('.js-btn-create-backup').click()
    await Promise.resolve()
    await Promise.resolve()

    expect(container.textContent).toContain('ZIP preparado')
    expect(container.textContent).not.toContain('Exportar ZIP pendiente')

    view.destroy()
  })

  it('muestra error y toast si falla el flujo', async () => {
    createAndShareCurrentBackup.mockRejectedValue(new Error('No se pudo compartir'))
    const container = createContainer()
    const view = new BackupView(container)

    await view.init()
    container.querySelector('.js-btn-create-backup').click()
    await Promise.resolve()
    await Promise.resolve()

    expect(container.textContent).toContain('No se pudo exportar el ZIP')
    expect(container.textContent).toContain('No se pudo compartir')
    expect(showErrorToast).toHaveBeenCalledWith('No se pudo compartir')

    view.destroy()
  })

  it('permite refrescar el estado de red', async () => {
    const container = createContainer()
    const view = new BackupView(container)

    await view.init()
    container.querySelector('.js-btn-refresh-backup').click()
    await Promise.resolve()
    await Promise.resolve()

    expect(getExternalBackupReadiness).toHaveBeenCalledTimes(2)

    view.destroy()
  })

  it('abre el selector de archivo al tocar Seleccionar ZIP', async () => {
    const container = createContainer()
    const view = new BackupView(container, { initialPanel: 'import' })

    await view.init()
    const input = container.querySelector('.js-backup-import-input')
    const clickSpy = vi.spyOn(input, 'click')

    container.querySelector('.js-btn-select-import').click()

    expect(clickSpy).toHaveBeenCalledTimes(1)

    view.destroy()
  })

  it('prepara preview al seleccionar un ZIP', async () => {
    const prepareImport = vi.fn().mockResolvedValue(importPlan())
    const container = createContainer()
    const view = new BackupView(container, { initialPanel: 'import', prepareImport })

    await view.init()
    const file = selectImportFile(container)
    await flushPromises()

    expect(prepareImport).toHaveBeenCalledWith({ content: file, filename: 'lumapse.zip' })
    expect(container.textContent).toContain('Preview listo')
    expect(container.textContent).toContain('Importará: 5 nota(s), 2 materia(s), 1 fecha(s)')
    expect(container.querySelector('.js-btn-confirm-import').textContent).toContain('Importar ZIP')

    view.destroy()
  })

  it('confirma importacion preparada, refresca datos y muestra resultado', async () => {
    const plan = importPlan()
    const result = importResult()
    const prepareImport = vi.fn().mockResolvedValue(plan)
    const confirmImport = vi.fn().mockResolvedValue(result)
    const onImportComplete = vi.fn().mockResolvedValue(undefined)
    const container = createContainer()
    const view = new BackupView(container, {
      initialPanel: 'import',
      prepareImport,
      confirmImport,
      onImportComplete,
      confirmDialog,
    })

    await view.init()
    selectImportFile(container)
    await flushPromises()

    container.querySelector('.js-btn-confirm-import').click()
    await flushPromises()

    expect(confirmDialog).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Confirmar importación ZIP',
      confirmText: 'Importar ZIP',
    }))
    expect(confirmImport).toHaveBeenCalledWith(plan)
    expect(onImportComplete).toHaveBeenCalledWith(result)
    expect(container.textContent).toContain('Importación completada: 5 nota(s), 2 materia(s), 1 fecha(s).')

    view.destroy()
  })

  it('cancela preview sin aplicar importacion', async () => {
    const prepareImport = vi.fn().mockResolvedValue(importPlan())
    const confirmImport = vi.fn()
    const container = createContainer()
    const view = new BackupView(container, { initialPanel: 'import', prepareImport, confirmImport })

    await view.init()
    selectImportFile(container)
    await flushPromises()

    expect(container.textContent).toContain('Preview listo')

    container.querySelector('.js-btn-cancel-import').click()

    expect(confirmImport).not.toHaveBeenCalled()
    expect(container.textContent).not.toContain('Preview listo')

    view.destroy()
  })

  it('no aplica importacion si la confirmacion se cancela', async () => {
    const prepareImport = vi.fn().mockResolvedValue(importPlan())
    const confirmImport = vi.fn()
    const cancelConfirm = vi.fn().mockResolvedValue(false)
    const container = createContainer()
    const view = new BackupView(container, {
      initialPanel: 'import',
      prepareImport,
      confirmImport,
      confirmDialog: cancelConfirm,
    })

    await view.init()
    selectImportFile(container)
    await flushPromises()

    container.querySelector('.js-btn-confirm-import').click()
    await flushPromises()

    expect(cancelConfirm).toHaveBeenCalledTimes(1)
    expect(confirmImport).not.toHaveBeenCalled()
    expect(container.textContent).toContain('Preview listo')

    view.destroy()
  })

  it('muestra error y toast si falla la lectura del ZIP', async () => {
    const prepareImport = vi.fn().mockRejectedValue(new Error('ZIP invalido'))
    const container = createContainer()
    const view = new BackupView(container, { initialPanel: 'import', prepareImport })

    await view.init()
    selectImportFile(container)
    await flushPromises()

    expect(container.textContent).toContain('ZIP invalido')
    expect(showErrorToast).toHaveBeenCalledWith('ZIP invalido')

    view.destroy()
  })

  it('permite cambiar de exportar a importar con pestañas internas', async () => {
    const container = createContainer()
    const view = new BackupView(container)

    await view.init()

    expect(container.textContent).toContain('Exportar ZIP')
    expect(container.textContent).not.toContain('Seleccioná un ZIP compatible')

    container.querySelector('[data-panel="import"]').click()

    expect(container.textContent).toContain('Importar ZIP')
    expect(container.textContent).toContain('Seleccioná un ZIP compatible')

    view.destroy()
  })

  it('no repinta el contenedor si la vista se destruye durante la consulta de red', async () => {
    const deferred = createDeferred()
    const container = createContainer()
    const view = new BackupView(container, {
      getReadiness: vi.fn(() => deferred.promise),
    })

    const initPromise = view.init()
    view.destroy()
    container.innerHTML = '<p>Feed actual</p>'

    deferred.resolve(WIFI_READINESS)
    await initPromise

    expect(container.textContent).toBe('Feed actual')
  })
})
