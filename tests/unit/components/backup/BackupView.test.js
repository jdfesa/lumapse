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
import { showErrorToast } from '../../../../src/components/common/Toast.js'
import { BackupView } from '../../../../src/components/backup/BackupView.js'

const WIFI_READINESS = {
  status: BACKUP_FLOW_STATUS.READY,
  ready: true,
  message: 'Con WiFi. Podes crear un backup externo.',
  networkState: {
    connectionType: 'wifi',
    externalBackupAllowed: true,
    requiresWarning: false,
  },
}

const CELLULAR_READINESS = {
  status: BACKUP_FLOW_STATUS.REQUIRES_WARNING,
  ready: false,
  message: 'Con datos moviles. Podes crear backup, pero puede consumir datos.',
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

    expect(container.textContent).toContain('Backup externo disponible')
    expect(container.textContent).toContain('Crear backup externo')
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
    expect(container.textContent).toContain('Backup preparado')

    view.destroy()
  })

  it('muestra resultado exitoso despues de compartir', async () => {
    const container = createContainer()
    const view = new BackupView(container)

    await view.init()
    container.querySelector('.js-btn-create-backup').click()
    await Promise.resolve()
    await Promise.resolve()

    expect(container.textContent).toContain('Backup preparado')
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

    expect(container.textContent).toContain('Backup sin destino elegido')
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

    expect(container.textContent).toContain('Primer backup pendiente')
    expect(container.textContent).toContain('Todavia no registramos un backup manual')

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
    expect(container.textContent).not.toContain('Backup pendiente')

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
    expect(container.textContent).toContain('Backup pendiente')

    container.querySelector('.js-btn-create-backup').click()
    await Promise.resolve()
    await Promise.resolve()

    expect(container.textContent).toContain('Backup preparado')
    expect(container.textContent).not.toContain('Backup pendiente')

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

    expect(container.textContent).toContain('No se pudo crear el backup')
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
