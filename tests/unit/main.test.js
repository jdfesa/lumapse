import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  initDatabase: vi.fn(), closeDatabaseForReload: vi.fn(), load: vi.fn(), mount: vi.fn(),
  subscribe: vi.fn(() => vi.fn()),
}))
vi.mock('../../src/services/sqlite/connection.js', () => ({ initDatabase: mocks.initDatabase, closeDatabaseForReload: mocks.closeDatabaseForReload }))
vi.mock('../../src/store/NoteStore.js', () => ({
  loadSubjects: mocks.load, loadNotes: mocks.load, loadAcademicEvents: mocks.load,
  loadAcademicEventsByMonth: mocks.load, loadUpcomingAcademicEvents: mocks.load,
  loadTrashCount: mocks.load, subscribe: mocks.subscribe, subscribeToStoreErrors: mocks.subscribe,
}))
vi.mock('../../src/services/SubjectService.js', () => ({ SUBJECT_COLORS: [], autoPurge: vi.fn() }))
vi.mock('../../src/components/feed/NoteList.js', () => ({ NoteList: mocks.mount }))
vi.mock('../../src/components/note-editor/NoteEditor.js', () => ({ NoteEditor: mocks.mount }))
vi.mock('../../src/components/academic-events/Heatmap.js', () => ({ Heatmap: mocks.mount }))
vi.mock('../../src/components/academic-events/UpcomingAcademicEvents.js', () => ({ UpcomingAcademicEvents: mocks.mount }))
vi.mock('../../src/layout/drawerController.js', () => ({ initDrawer: mocks.mount }))

function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  document.body.innerHTML = '<div id="app"></div>'
  mocks.initDatabase.mockResolvedValue(undefined)
  mocks.closeDatabaseForReload.mockResolvedValue(undefined)
  mocks.load.mockResolvedValue(undefined)
  mocks.mount.mockImplementation(function () {})
})

describe('AUD-005: composition root recuperable', () => {
  it('no monta componentes ni suscripciones antes de completar los datos iniciales', async () => {
    const data = deferred()
    mocks.load.mockReturnValueOnce(data.promise)
    await import('../../src/main.js')
    expect(mocks.mount).not.toHaveBeenCalled()
    expect(mocks.subscribe).not.toHaveBeenCalled()
    data.resolve()
    await vi.dynamicImportSettled()
  })

  it('muestra error seguro y permite reintentar sin doble inicialización', async () => {
    const database = deferred()
    mocks.initDatabase.mockReturnValueOnce(database.promise)
    await import('../../src/main.js')
    database.reject(new Error('SQL: private title'))
    await vi.dynamicImportSettled()
    const alert = document.querySelector('[role="alert"]')
    expect(alert?.textContent).toContain('No se pudo iniciar Lumapse')
    expect(document.body.textContent).not.toContain('private title')
    expect(mocks.mount).not.toHaveBeenCalled()
    const retry = document.querySelector('#startup-retry')
    expect(retry).not.toBeNull()
    retry.click()
    retry.click()
    await vi.dynamicImportSettled()
    expect(mocks.initDatabase).toHaveBeenCalledTimes(2)
    expect(mocks.mount).toHaveBeenCalledTimes(5)
    expect(mocks.subscribe).toHaveBeenCalledTimes(2)
    expect(document.querySelector('#composer-container')).not.toBeNull()
  })
})


it('conecta el cierre SQLite al reintento de un montaje parcial fallido', async () => {
  const release = deferred()
  mocks.mount.mockImplementationOnce(function () { throw new Error('partial mount') })
  mocks.closeDatabaseForReload.mockReturnValueOnce(release.promise)
  await import('../../src/main.js')
  await vi.dynamicImportSettled()
  document.querySelector('#startup-retry').click()
  await Promise.resolve()
  expect(mocks.closeDatabaseForReload).toHaveBeenCalledTimes(1)
  release.reject(new Error('native connection uncertain'))
  await vi.dynamicImportSettled()
  expect(document.querySelector('#startup-retry').disabled).toBe(false)
  expect(mocks.mount).toHaveBeenCalledTimes(1)
})
