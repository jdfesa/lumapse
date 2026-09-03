import { describe, expect, it, vi } from 'vitest'
import { handleStoreMutationError } from '../../../../src/components/common/storeActionErrors.js'
import { DatabaseError } from '../../../../src/services/sqlite/errors.js'

describe('storeActionErrors', () => {
  it('no duplica feedback para un DatabaseError ya emitido por el store', () => {
    const onUnexpected = vi.fn()
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    handleStoreMutationError(new DatabaseError('updateNote', new Error('boom')), {
      context: 'TestBoundary',
      onUnexpected,
    })

    expect(onUnexpected).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
    errorSpy.mockRestore()
  })

  it('entrega un error no SQLite una sola vez al límite responsable', () => {
    const onUnexpected = vi.fn()
    const error = new Error('boom')

    handleStoreMutationError(error, { onUnexpected })

    expect(onUnexpected).toHaveBeenCalledTimes(1)
    expect(onUnexpected).toHaveBeenCalledWith(error)
  })

  it('registra una vez un error inesperado cuando no hay callback contextual', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('boom')

    handleStoreMutationError(error, { context: 'TestBoundary' })

    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith(
      '[TestBoundary] Error inesperado en mutación del store:',
      error,
    )
    errorSpy.mockRestore()
  })
})
