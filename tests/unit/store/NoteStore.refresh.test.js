import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { notify } from '../../../src/store/NoteStore.state.js'
import { refreshAfterWrite, subscribeToPendingRefreshes } from '../../../src/store/NoteStore.refresh.js'
import { deferred } from '../services/sqlite/sqliteFixture.js'

vi.mock('../../../src/store/NoteStore.state.js', () => ({ notify: vi.fn() }))

let listener, unsubscribe
const context = { operation: 'createNote', entityId: 'note-1', message: 'Nota guardada; actualización pendiente.' }
beforeEach(() => {
  vi.clearAllMocks()
  notify.mockReset()
  listener = vi.fn()
  unsubscribe = subscribeToPendingRefreshes(listener)
})
afterEach(() => unsubscribe())

it('no emite aviso si la lectura tiene éxito', async () => {
  const refresh = vi.fn().mockResolvedValue(undefined)
  await refreshAfterWrite({ ...context, refresh })
  expect(refresh).toHaveBeenCalledTimes(1)
  expect(notify).toHaveBeenCalledTimes(1)
  expect(listener).not.toHaveBeenCalled()
})

it('mantiene una sola recuperación en curso y no vuelve a leer una vez recuperada', async () => {
  const read = deferred()
  const refresh = vi.fn().mockRejectedValueOnce(new Error('primera lectura')).mockReturnValueOnce(read.promise)
  await refreshAfterWrite({ ...context, refresh })
  const { retry } = listener.mock.calls[0][0]
  const pending = retry()
  expect(retry()).toBe(pending)
  await Promise.resolve()
  expect(refresh).toHaveBeenCalledTimes(2)
  read.resolve()
  await expect(pending).resolves.toBe(true)
  await expect(retry()).resolves.toBe(true)
  expect(refresh).toHaveBeenCalledTimes(2)
  expect(listener).toHaveBeenCalledTimes(1)
})

it('conserva la recuperación pendiente si el loader descarta una respuesta obsoleta', async () => {
  const refresh = vi.fn().mockRejectedValueOnce(new Error('lectura inicial'))
    .mockResolvedValueOnce(false).mockResolvedValueOnce(true)
  await refreshAfterWrite({ ...context, refresh })
  const { retry } = listener.mock.calls[0][0]
  await expect(retry()).resolves.toBe(false)
  await expect(retry()).resolves.toBe(true)
  expect(refresh).toHaveBeenCalledTimes(3)
  expect(listener).toHaveBeenCalledTimes(1)
})

it('aísla suscriptores defectuosos y permite desuscribir el canal', async () => {
  const stopBroken = subscribeToPendingRefreshes(() => { throw new Error('consumidor defectuoso') })
  const next = vi.fn()
  const stopNext = subscribeToPendingRefreshes(next)
  const refresh = () => { throw new Error('lectura síncrona') }
  try {
    await expect(refreshAfterWrite({ ...context, refresh })).resolves.toBeUndefined()
    expect(next).toHaveBeenCalledTimes(1)
    unsubscribe()
    await refreshAfterWrite({ ...context, refresh })
    expect(listener).toHaveBeenCalledTimes(1)
  } finally { stopBroken(); stopNext() }
})

it('no rechaza el guardado aunque publicar el estado persistido falle', async () => {
  notify.mockImplementation(() => { throw new Error('render fallido') })
  const refresh = vi.fn().mockResolvedValue(undefined)
  await expect(refreshAfterWrite({ ...context, refresh })).resolves.toBeUndefined()
  expect(listener).toHaveBeenCalledTimes(1)
  await expect(listener.mock.calls[0][0].retry()).resolves.toBe(false)
  notify.mockReset()
  await expect(listener.mock.calls[0][0].retry()).resolves.toBe(true)
})
