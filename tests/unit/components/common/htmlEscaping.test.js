import { describe, expect, it } from 'vitest'

import {
  escapeHtmlAttribute,
  escapeHtmlText,
} from '../../../../src/components/common/htmlEscaping.js'

describe('htmlEscaping', () => {
  it('distingue texto visible de valores de atributo', () => {
    const value = `Comillas "dobles" y 'simples' < > & 😀`

    expect(escapeHtmlText(value))
      .toBe(`Comillas "dobles" y 'simples' &lt; &gt; &amp; 😀`)
    expect(escapeHtmlAttribute(value))
      .toBe('Comillas &quot;dobles&quot; y &#39;simples&#39; &lt; &gt; &amp; 😀')
  })

  it('convierte primitivas defensivamente sin lanzar ante coercion hostil', () => {
    const hostileValue = {
      toString() {
        throw new Error('coercion blocked')
      },
    }

    expect(escapeHtmlText(42)).toBe('42')
    expect(escapeHtmlText(null)).toBe('')
    expect(escapeHtmlAttribute(undefined)).toBe('')
    expect(() => escapeHtmlText(hostileValue)).not.toThrow()
    expect(escapeHtmlText(hostileValue)).toBe('')
  })
})
