import { beforeEach, describe, expect, it, vi } from 'vitest'

let confirmDialog

beforeEach(async () => {
  vi.useFakeTimers()
  vi.resetModules()
  document.body.innerHTML = '<button id="origin">Origen</button>'
  ;({ confirmDialog } = await import('../../../src/components/common/ConfirmDialog.js'))
})

async function finishAnimation() {
  await vi.advanceTimersByTimeAsync(120)
}

describe('ConfirmDialog', () => {
  it('renderiza el mensaje como texto seguro y enfoca Cancelar', async () => {
    document.getElementById('origin').focus()

    confirmDialog({ message: '<img src=x onerror=alert(1)>', confirmText: 'Eliminar' })

    expect(document.querySelector('.dialog__message').textContent).toBe('<img src=x onerror=alert(1)>')
    expect(document.querySelector('.dialog__message img')).toBeNull()
    expect(document.activeElement).toBe(document.querySelector('.dialog__btn--cancel'))
  })

  it('confirma con botón confirm y espera la animación de salida', async () => {
    const promise = confirmDialog({ title: 'Vaciar papelera', message: 'Irreversible', danger: true })

    document.querySelector('.dialog__btn--confirm').click()
    expect(document.querySelector('.dialog-backdrop')).not.toBeNull()
    await finishAnimation()

    await expect(promise).resolves.toBe(true)
    expect(document.querySelector('.dialog-backdrop')).toBeNull()
  })

  it('cancela con backdrop y restaura el foco anterior', async () => {
    const origin = document.getElementById('origin')
    origin.focus()
    const promise = confirmDialog({ message: 'Cancelar' })

    document.querySelector('.dialog-backdrop').click()
    await finishAnimation()

    await expect(promise).resolves.toBe(false)
    expect(document.activeElement).toBe(origin)
  })

  it('cicla el foco con Tab y confirma con Enter solo en Confirmar', async () => {
    const promise = confirmDialog({ message: 'Confirmar?' })
    const [cancelBtn, confirmBtn] = document.querySelectorAll('.dialog__btn')

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(document.querySelector('.dialog-backdrop')).not.toBeNull()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement).toBe(confirmBtn)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement).toBe(cancelBtn)

    confirmBtn.focus()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await finishAnimation()
    await expect(promise).resolves.toBe(true)
  })

  it('ignora una segunda petición mientras hay un diálogo activo', async () => {
    const first = confirmDialog({ message: 'Primero' })
    const second = confirmDialog({ message: 'Segundo' })

    await expect(second).resolves.toBe(false)
    document.querySelector('.dialog__btn--cancel').click()
    await finishAnimation()
    await expect(first).resolves.toBe(false)
  })
})
