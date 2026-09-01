import { describe, expect, it } from 'vitest'

import {
  parseBoundedOneLineText,
  parseHexColor,
  parseISODate,
  parseLegacyBoolean,
  parseOpaqueId,
  parseRFC3339Timestamp,
  parseUtf8ByteBoundedContent,
  PrimitiveValidationError,
} from '../../../src/domain/primitiveValidation.ts'

describe('primitiveValidation', () => {
  describe('parseOpaqueId', () => {
    it('acepta IDs historicos ASCII, recorta extremos y respeta el limite exacto', () => {
      expect(parseOpaqueId('  subj-math  ', 128)).toBe('subj-math')
      expect(parseOpaqueId('A.b_c:d-1', 128)).toBe('A.b_c:d-1')
      expect(parseOpaqueId(`a${'x'.repeat(127)}`, 128)).toHaveLength(128)
    })

    it.each([
      [{ id: 'note-1' }, 128],
      ['', 128],
      ['-starts-with-separator', 128],
      ['has space', 128],
      ['nota/1', 128],
      ['ñota-1', 128],
      [`a${'x'.repeat(128)}`, 128],
    ])('rechaza tipo, formato o longitud invalidos: %p', (value, limit) => {
      expect(() => parseOpaqueId(value, limit)).toThrow(PrimitiveValidationError)
    })
  })

  describe('parseHexColor', () => {
    it('acepta null y colores historicos de seis digitos normalizados', () => {
      expect(parseHexColor(null)).toBeNull()
      expect(parseHexColor('#38bdf8')).toBe('#38bdf8')
      expect(parseHexColor('#A78BFA')).toBe('#a78bfa')
    })

    it.each([undefined, 123, '#fff', 'red', ' #38bdf8', '#38bdf8; color:red'])
      ('rechaza colores fuera del contrato: %p', value => {
        expect(() => parseHexColor(value)).toThrow(PrimitiveValidationError)
      })
  })

  describe('parseISODate', () => {
    it.each(['2024-02-29', '2000-02-29', '2026-01-31'])
      ('acepta fechas reales, incluidos bisiestos: %s', value => {
        expect(parseISODate(value)).toBe(value)
      })

    it.each([
      '0000-01-01',
      '1900-02-29',
      '2100-02-29',
      '2026-02-29',
      '2026-04-31',
      '2026-13-01',
      '2026-1-01',
      '2026-01-01T00:00:00Z',
      20260101,
    ])('rechaza fechas mal tipadas, inexistentes o mal formadas: %p', value => {
      expect(() => parseISODate(value)).toThrow(PrimitiveValidationError)
    })
  })

  describe('parseRFC3339Timestamp', () => {
    it.each([
      ['2026-06-03T12:30:00Z', '2026-06-03T12:30:00.000Z'],
      ['2026-06-03t12:30:00.123z', '2026-06-03T12:30:00.123Z'],
      ['2026-06-03T09:30:00-03:00', '2026-06-03T12:30:00.000Z'],
      ['2026-06-03T18:00:00+05:30', '2026-06-03T12:30:00.000Z'],
      ['2024-02-29T23:59:59.999999999+00:00', '2024-02-29T23:59:59.999Z'],
    ])('acepta una zona explicita y normaliza el instante a UTC: %s', (value, expected) => {
      expect(parseRFC3339Timestamp(value)).toBe(expected)
    })

    it.each([
      '2026-06-03T12:30:00',
      '2026-02-29T12:30:00Z',
      '2026-06-03 12:30:00Z',
      '2026-06-03T24:00:00Z',
      '2026-06-03T12:60:00Z',
      '2026-06-03T12:30:60Z',
      '2026-06-03T12:30:00+24:00',
      '2026-06-03T12:30:00+01:60',
      'not-a-date',
      new Date('2026-06-03T12:30:00Z'),
    ])('rechaza timestamps sin zona, mal tipados o con componentes invalidos: %p', value => {
      expect(() => parseRFC3339Timestamp(value)).toThrow(PrimitiveValidationError)
    })
  })

  describe('parseBoundedOneLineText', () => {
    const options = { maxCodePoints: 4, trim: true, allowEmpty: false }

    it('preserva markup, comillas y emoji legitimos y cuenta code points', () => {
      expect(parseBoundedOneLineText('<😀>', options)).toBe('<😀>')
      expect(parseBoundedOneLineText('😀😀😀😀', options)).toBe('😀😀😀😀')
      expect(() => parseBoundedOneLineText('😀😀😀😀a', options)).toThrow('code points')
      expect(parseBoundedOneLineText('"md"', options)).toBe('"md"')
    })

    it.each(['', '   ', 'a\0b', 'a\nb', 'a\n', '\nb', 'a\rb', 'a\u0001b', 'a\u2028b', { text: 'ok' }])
      ('rechaza vacios, tipos incorrectos y controles: %p', value => {
        expect(() => parseBoundedOneLineText(value, options)).toThrow(PrimitiveValidationError)
      })
  })

  describe('parseUtf8ByteBoundedContent', () => {
    it('preserva Markdown multilinea y aplica el limite en bytes UTF-8', () => {
      expect(parseUtf8ByteBoundedContent('# Titulo\n\n> "<texto>"\t', 64))
        .toBe('# Titulo\n\n> "<texto>"\t')
      expect(parseUtf8ByteBoundedContent('😀😀', 8)).toBe('😀😀')
      expect(() => parseUtf8ByteBoundedContent('😀😀a', 8)).toThrow('bytes UTF-8')
    })

    it.each([null, {}, 'texto\0oculto', 'texto\u0001oculto', 'texto\u007foculto'])
      ('rechaza tipos incorrectos y controles no aptos para contenido: %p', value => {
        expect(() => parseUtf8ByteBoundedContent(value, 64)).toThrow(PrimitiveValidationError)
      })
  })

  describe('parseLegacyBoolean', () => {
    it.each([
      [true, true], [1, true], ['true', true], ['1', true],
      [false, false], [0, false], ['false', false], ['0', false],
    ])('acepta exclusivamente el valor legacy %p', (value, expected) => {
      expect(parseLegacyBoolean(value)).toBe(expected)
    })

    it.each([undefined, null, 2, -1, 'True', 'FALSE', ' true ', '', {}, []])
      ('rechaza coerciones no exactas: %p', value => {
        expect(() => parseLegacyBoolean(value)).toThrow(PrimitiveValidationError)
      })
  })
})
