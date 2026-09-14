import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { showErrorToast, showPendingRefreshToast } from '../../../../src/components/common/Toast.js'
import { deferred } from '../../services/sqlite/sqliteFixture.js'

beforeEach(() => { document.body.innerHTML = ''; vi.useFakeTimers() })
afterEach(() => { document.body.innerHTML = ''; vi.useRealTimers() })

function pendingEvent(retry = vi.fn().mockResolvedValue(true)) {
  return { message: 'Nota guardada. La actualización de conteos quedó pendiente.', retry }
}

it('mantiene el aviso de actualización sin timeout y no duplica el mismo evento', async () => {
  const event = pendingEvent()
  const toast = showPendingRefreshToast(event)
  expect(showPendingRefreshToast(event)).toBe(toast)
  await vi.advanceTimersByTimeAsync(10000)
  expect(document.querySelectorAll('.toast--pending-refresh')).toHaveLength(1)
  expect(document.querySelector('#toast-container').getAttribute('aria-live')).toBe('polite')
  expect(toast.querySelector('[role="status"]').textContent).toBe(event.message)
  expect(toast.querySelector('button').textContent).toBe('Actualizar')
  expect(toast.querySelector('button').type).toBe('button')
})

it('bloquea taps concurrentes y elimina solo su aviso tras recuperar', async () => {
  const read = deferred()
  const event = pendingEvent(vi.fn(() => read.promise))
  const toast = showPendingRefreshToast(event)
  showErrorToast('Otro error independiente')
  const button = toast.querySelector('button')
  button.click()
  button.dispatchEvent(new window.MouseEvent('click'))
  expect(event.retry).toHaveBeenCalledTimes(1)
  expect(button.disabled).toBe(true)
  expect(button.textContent).toBe('Actualizando...')
  read.resolve(true)
  await Promise.resolve()
  expect(toast.isConnected).toBe(false)
  expect(document.querySelector('.toast--error')).not.toBeNull()
})

it.each(['false', 'rejection'])('permite repetir una recuperación fallida (%s) sin otro aviso', async (failure) => {
  const retry = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true)
  if (failure === 'rejection') retry.mockReset().mockRejectedValueOnce(new Error('lectura fallida')).mockResolvedValueOnce(true)
  const toast = showPendingRefreshToast(pendingEvent(retry))
  const button = toast.querySelector('button')
  button.click()
  await Promise.resolve()
  expect(button.disabled).toBe(false)
  expect(toast.textContent).toContain('Nota guardada.')
  expect(toast.textContent).toContain('podés volver a intentarlo')
  expect(document.querySelectorAll('.toast')).toHaveLength(1)
  button.click()
  await Promise.resolve()
  expect(toast.isConnected).toBe(false)
})

it('cerrar el aviso no ejecuta la recuperación ni una mutación', () => {
  const event = pendingEvent()
  const toast = showPendingRefreshToast(event)
  toast.querySelectorAll('button')[1].click()
  expect(toast.isConnected).toBe(false)
  expect(event.retry).not.toHaveBeenCalled()
})

it('renderiza texto, no HTML, y conserva el timeout de errores existente', async () => {
  const toast = showPendingRefreshToast({ ...pendingEvent(), message: '<img src=x onerror=alert(1)>' })
  expect(toast.querySelector('img')).toBeNull()
  showErrorToast('Fallo de escritura')
  await vi.advanceTimersByTimeAsync(4200)
  expect(document.querySelector('.toast--error')).toBeNull()
  expect(toast.isConnected).toBe(true)
})
