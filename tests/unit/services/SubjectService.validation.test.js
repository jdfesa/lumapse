import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  generateUUID,
  validateMaxDepth,
  validateNameRequired,
  validateNameUnique,
} from '../../../src/services/SubjectService.validation.ts'

function subject(overrides = {}) {
  return {
    id: 'subject-1',
    name: 'Programacion',
    parentSubjectId: null,
    ...overrides,
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('SubjectService.validation', () => {
  it('usa crypto.randomUUID cuando esta disponible', () => {
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'uuid-from-crypto') })

    expect(generateUUID()).toBe('uuid-from-crypto')
  })

  it('genera UUID v4 fallback si crypto.randomUUID no esta disponible', () => {
    vi.stubGlobal('crypto', {})

    expect(generateUUID()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  })

  it('valida nombre obligatorio', () => {
    expect(() => validateNameRequired('Materia')).not.toThrow()
    expect(() => validateNameRequired('')).toThrow('obligatorio')
    expect(() => validateNameRequired('   ')).toThrow('obligatorio')
    expect(() => validateNameRequired(null)).toThrow('obligatorio')
  })

  it('detecta nombres duplicados en el mismo nivel', () => {
    const allSubjects = [
      subject({ id: 'root-a', name: 'Matematica' }),
      subject({ id: 'section-a', name: 'Unidad I', parentSubjectId: 'root-a' }),
    ]

    expect(() => validateNameUnique('matematica', null, null, allSubjects)).toThrow('Ya existe una materia')
    expect(() => validateNameUnique('unidad i', 'root-a', null, allSubjects)).toThrow('Ya existe una sección')
  })

  it('permite nombres repetidos en distinto padre o excluyendo el mismo id', () => {
    const allSubjects = [
      subject({ id: 'root-a', name: 'Programacion' }),
      subject({ id: 'root-b', name: 'Base de Datos' }),
      subject({ id: 'section-a', name: 'Unidad I', parentSubjectId: 'root-a' }),
    ]

    expect(() => validateNameUnique('Unidad I', 'root-b', null, allSubjects)).not.toThrow()
    expect(() => validateNameUnique('Programacion', null, 'root-a', allSubjects)).not.toThrow()
  })

  it('valida profundidad maxima de dos niveles', () => {
    const allSubjects = [
      subject({ id: 'root-a' }),
      subject({ id: 'section-a', parentSubjectId: 'root-a' }),
    ]

    expect(() => validateMaxDepth(null, allSubjects)).not.toThrow()
    expect(() => validateMaxDepth('root-a', allSubjects)).not.toThrow()
    expect(() => validateMaxDepth('missing', allSubjects)).toThrow('padre no existe')
    expect(() => validateMaxDepth('section-a', allSubjects)).toThrow('2 niveles')
  })
})
