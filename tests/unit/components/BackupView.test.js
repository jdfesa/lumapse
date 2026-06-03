import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/services/backup/BackupFlowService.js', () => ({
  BACKUP_FLOW_STATUS: {
    READY: 'ready',
    BLOCKED_OFFLINE: 'blocked-offline',
    REQUIRES_WARNING: 'requires-warning',
    SHARED: 'shared',
  },
  createAndShareCurrentBackup: vi.fn(),
  getExternalBackupReadiness: vi.fn(),
}))

vi.mock('../../../src/components/Toast.js', () => ({
  showErrorToast: vi.fn(),
}))

import {
  BACKUP_FLOW_STATUS,
  createAndShareCurrentBackup,
  getExternalBackupReadiness,
} from '../../../src/services/backup/BackupFlowService.js'
import { showErrorToast } from '../../../src/components/Toast.js'
import { BackupView } from '../../../src/components/BackupView.js'

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
