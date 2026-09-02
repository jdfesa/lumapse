import { describe, expect, it } from 'vitest'

import {
  getSafeHexColor,
  getSafeISODate,
} from '../../../../src/components/common/presentationValidation.js'

describe('presentationValidation', () => {
  it('conserva colores hex historicos y normaliza mayusculas', () => {
    expect(getSafeHexColor('#38bdf8')).toBe('#38bdf8')
    expect(getSafeHexColor('#A78BFA')).toBe('#a78bfa')
  })

  it.each([
    '#38bdf8; position: fixed',
    'red',
    '#fff',
    undefined,
  ])('descarta colores CSS fuera de la allowlist sin lanzar: %p', value => {
    expect(() => getSafeHexColor(value)).not.toThrow()
    expect(getSafeHexColor(value)).toBeNull()
  })

  it('acepta fechas reales y descarta fechas antiguas contaminadas', () => {
    expect(getSafeISODate('2024-02-29')).toBe('2024-02-29')
    expect(getSafeISODate('2026-02-29')).toBeNull()
    expect(getSafeISODate('__proto__')).toBeNull()
  })
})
