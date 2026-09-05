import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAppStartup } from '../../../src/layout/appStartup.js'
import { deferred } from '../services/sqlite/sqliteFixture.js'

let app
beforeEach(() => {
  document.body.innerHTML = '<div id="app"></div>'
  app = document.querySelector('#app')
})

describe('arranque single-flight', () => {
  it('devuelve la misma promesa mientras prepara y no repite un montaje exitoso', async () => {
    const ready = deferred()
    const prepare = vi.fn(() => ready.promise), mount = vi.fn()
    const startup = createAppStartup({ app, prepare, mount })
    const first = startup.start()
    expect(startup.start()).toBe(first)
    expect(app.querySelector('[role="status"]')).not.toBeNull()
    ready.resolve()
    await expect(first).resolves.toBe(true)
    await expect(startup.start()).resolves.toBe(true)
    expect(prepare).toHaveBeenCalledTimes(1)
    expect(mount).toHaveBeenCalledTimes(1)
  })

  it('un error de montaje obliga a recargar, no a duplicar componentes parciales', async () => {
    const prepare = vi.fn(), mount = vi.fn(() => { throw new Error('partial mount') }), reload = vi.fn()
    const startup = createAppStartup({ app, prepare, mount, reload })
    await expect(startup.start()).resolves.toBe(false)
    expect(document.activeElement.id).toBe('startup-title')
    const button = app.querySelector('button')
    button.click()
    button.click()
    await expect(startup.start()).resolves.toBe(false)
    await vi.dynamicImportSettled()
    expect(reload).toHaveBeenCalledTimes(1)
    expect(mount).toHaveBeenCalledTimes(1)
    expect(prepare).toHaveBeenCalledTimes(1)
  })

  it('puede reintentar también una lectura inicial fallida sin montar una UI incompleta', async () => {
    const prepare = vi.fn().mockRejectedValueOnce(new Error('SQL private')).mockResolvedValue(undefined)
    const mount = vi.fn()
    const startup = createAppStartup({ app, prepare, mount })
    await expect(startup.start()).resolves.toBe(false)
    expect(mount).not.toHaveBeenCalled()
    expect(app.textContent).not.toContain('SQL private')
    await expect(startup.start()).resolves.toBe(true)
    expect(mount).toHaveBeenCalledTimes(1)
  })

  it('espera liberar la conexión nativa antes de recargar una WebView parcialmente montada', async () => {
    const release = deferred(), reload = vi.fn(), beforeReload = vi.fn(() => release.promise)
    const startup = createAppStartup({
      app, prepare: vi.fn(), mount: () => { throw new Error('mount') },
      beforeReload, reload,
    })
    await startup.start()
    app.querySelector('button').click()
    app.querySelector('button').click()
    await Promise.resolve()
    expect(beforeReload).toHaveBeenCalledTimes(1)
    expect(reload).not.toHaveBeenCalled()
    release.resolve()
    await vi.dynamicImportSettled()
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('mantiene reintento si el cierre nativo falla, sin recargar ni duplicar componentes', async () => {
    const reload = vi.fn(), mount = vi.fn(() => { throw new Error('mount') })
    const startup = createAppStartup({
      app, prepare: vi.fn(), mount, reload,
      beforeReload: vi.fn().mockRejectedValue(new Error('uncertain connection')),
    })
    await startup.start()
    app.querySelector('button').click()
    await vi.dynamicImportSettled()
    expect(reload).not.toHaveBeenCalled()
    expect(app.querySelector('button').disabled).toBe(false)
    expect(mount).toHaveBeenCalledTimes(1)
  })
})
