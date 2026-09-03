import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DatabaseError } from '../../../../src/services/sqlite/errors.js'
import { bindAcademicEventActions } from '../../../../src/components/academic-events/AcademicEventActions.js'
import * as NoteStore from '../../../../src/store/NoteStore.js'
import { confirmDialog } from '../../../../src/components/common/ConfirmDialog.js'

vi.mock('../../../../src/store/NoteStore.js', () => ({
  deleteAcademicEvent: vi.fn(),
}))

vi.mock('../../../../src/components/common/ConfirmDialog.js', () => ({
  confirmDialog: vi.fn(),
}))

vi.mock('../../../../src/components/academic-events/AcademicEventDialog.js', () => ({
  openAcademicEventDialog: vi.fn(),
}))

function bindDeleteAction() {
  const container = document.createElement('div')
  container.innerHTML = `
    <button
      class="js-academic-event-action"
      data-event-action="delete"
      data-event-id="event-1"
    >Eliminar</button>
  `
  document.body.appendChild(container)
  bindAcademicEventActions(container, () => ({ id: 'event-1', title: 'Parcial' }))
  return container.querySelector('button')
}

async function settleAction() {
  await Promise.resolve()
  await Promise.resolve()
  await new Promise(resolve => window.setTimeout(resolve, 0))
}

beforeEach(() => {
  document.body.innerHTML = ''
  vi.clearAllMocks()
  confirmDialog.mockResolvedValue(true)
  NoteStore.deleteAcademicEvent.mockResolvedValue(undefined)
})

describe('AcademicEventActions mutation boundary', () => {
  it('espera y completa una eliminación confirmada', async () => {
    bindDeleteAction().click()
    await settleAction()

    expect(NoteStore.deleteAcademicEvent).toHaveBeenCalledWith('event-1')
  })

  it('consume DatabaseError sin duplicar el registro global', async () => {
    const warningSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    NoteStore.deleteAcademicEvent.mockRejectedValueOnce(
      new DatabaseError('deleteAcademicEvent', new Error('boom')),
    )

    bindDeleteAction().click()
    await settleAction()

    expect(warningSpy).not.toHaveBeenCalled()
    warningSpy.mockRestore()
  })

  it('registra una sola vez un error no SQLite', async () => {
    const warningSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const error = new Error('boom')
    NoteStore.deleteAcademicEvent.mockRejectedValueOnce(error)

    bindDeleteAction().click()
    await settleAction()

    expect(warningSpy).toHaveBeenCalledTimes(1)
    expect(warningSpy).toHaveBeenCalledWith(
      '[AcademicEventActions] No se pudo ejecutar la accion:',
      error,
    )
    warningSpy.mockRestore()
  })
})
