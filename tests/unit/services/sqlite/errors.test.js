import { describe, expect, it } from 'vitest'
import { DatabaseError } from '../../../../src/services/sqlite/errors.js'

describe('DatabaseError', () => {
  it('incluye la operación y conserva el error original', () => {
    const originalError = new Error('disk full')
    const error = new DatabaseError('createNote', originalError)

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('DatabaseError')
    expect(error.operation).toBe('createNote')
    expect(error.originalError).toBe(originalError)
    expect(error.message).toContain('createNote')
    expect(error.message).toContain('disk full')
  })

  it('usa un mensaje fallback si el error original no tiene mensaje', () => {
    const error = new DatabaseError('emptyTrash', null)

    expect(error.message).toContain('Error desconocido')
  })
})
