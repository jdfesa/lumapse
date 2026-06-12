import { describe, expect, it, vi } from 'vitest'
import { DatabaseError } from '../../../src/services/sqlite/errors.js'
import {
  emitStoreError,
  runStoreAction,
  subscribeToStoreErrors,
} from '../../../src/store/NoteStore.errors.js'

describe('NoteStore.errors', () => {
  it('notifica errores de store a los suscriptores', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeToStoreErrors(listener)
    const cause = new Error('boom')

    const event = emitStoreError({
      operation: 'createNote',
      message: 'No se pudo crear la nota.',
      cause,
    })

    expect(listener).toHaveBeenCalledWith(event)
    expect(event).toEqual({
      operation: 'createNote',
      message: 'No se pudo crear la nota.',
      cause,
    })

    unsubscribe()
  })

  it('permite desuscribirse de errores de store', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeToStoreErrors(listener)

    unsubscribe()
    emitStoreError({
      operation: 'updateNote',
      message: 'No se pudo actualizar la nota.',
      cause: new Error('boom'),
    })

    expect(listener).not.toHaveBeenCalled()
  })

  it('runStoreAction retorna el resultado de una accion exitosa', async () => {
    await expect(runStoreAction('ok', 'No importa.', async () => 'resultado')).resolves.toBe('resultado')
  })

  it('runStoreAction emite evento y retorna undefined ante DatabaseError', async () => {
    const listener = vi.fn()
    const unsubscribe = subscribeToStoreErrors(listener)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new DatabaseError('insert', new Error('boom'))

    await expect(runStoreAction('createNote', 'No se pudo crear la nota.', async () => {
      throw error
    })).resolves.toBeUndefined()

    expect(listener).toHaveBeenCalledWith({
      operation: 'createNote',
      message: 'No se pudo crear la nota.',
      cause: error,
    })

    unsubscribe()
    errorSpy.mockRestore()
  })

  it('runStoreAction relanza errores que no son de base de datos', async () => {
    const listener = vi.fn()
    const unsubscribe = subscribeToStoreErrors(listener)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('boom')

    await expect(runStoreAction('createNote', 'No se pudo crear la nota.', async () => {
      throw error
    })).rejects.toBe(error)

    expect(listener).not.toHaveBeenCalled()

    unsubscribe()
    errorSpy.mockRestore()
  })
})
