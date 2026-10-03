import { describe, expect, it } from 'vitest'
import { formatBuildMetadata } from '../../../src/config/buildMetadata.js'
import { APP_METADATA } from '../../../src/config/appMetadata.js'
import { version } from '../../../package.json'

describe('build metadata', () => {
  it('mantiene versión base y desarrollo sin confundirlo con publicación', () => {
    expect(APP_METADATA.version).toBe(version)
    expect(APP_METADATA.compilation).toBe('Desarrollo (servidor local)')
    expect(Object.isFrozen(APP_METADATA)).toBe(true)
  })

  it.each([
    ['test', 'Prueba optimizada (variante no declarada)'],
    ['android-debug', 'Android debug · prueba privada'],
    ['android-candidate', 'Android · candidato (firma/publicación no verificadas)'],
    ['production', 'No disponible'],
    ['__proto__', 'No disponible'],
  ])('etiqueta %s sin acreditar firma o validación', (compilation, expected) => {
    expect(formatBuildMetadata({ compilation }).compilation).toBe(expected)
  })

  it.each([
    [true, 'cambios locales'], [false, 'sin cambios locales'], [null, 'estado local no disponible'],
  ])('muestra SHA y estado %s sin inferir limpieza', (dirty, state) => {
    expect(formatBuildMetadata({ commit: 'a'.repeat(40), dirty }).origin).toBe(`${'a'.repeat(40)} · ${state}`)
  })

  it('fallback honesto sin metadatos y sin interpolar SHA inválido', () => {
    expect(formatBuildMetadata()).toEqual({ compilation: 'No disponible', origin: 'No disponible' })
    expect(formatBuildMetadata({ commit: '<script>', dirty: false }).origin).toBe('No disponible')
  })
})
