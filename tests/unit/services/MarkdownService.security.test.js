import createDOMPurify from 'dompurify'
import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '../../../src/services/MarkdownService.ts'

describe('GHSA-p98j-92pf-mc4p — contrato de DOMPurify', () => {
  // API upstream aislada: Lumapse no usa IN_PLACE ni hooks que retiren nodos.
  // Se comprueba la neutralización del subárbol, no ejecución de XSS o red.
  it.each([
    'beforeSanitizeElements', // Control: ya protegido antes de este parche.
    'afterSanitizeElements',
    'afterSanitizeAttributes',
  ])('neutraliza handlers del subárbol retirado por %s', (hook) => {
    const purifier = createDOMPurify(window)
    const root = document.createElement('div')
    root.innerHTML = '<section><img alt="prueba sintética" onerror="void 0"></section>'
    const removed = root.querySelector('section')
    const image = removed.querySelector('img')
    document.body.appendChild(root)

    purifier.addHook(hook, (node) => {
      if (node === removed) node.remove()
    })

    try {
      purifier.sanitize(root, { IN_PLACE: true })

      expect(removed.isConnected).toBe(false)
      expect(root.querySelector('section')).toBeNull()
      expect(image.hasAttribute('onerror')).toBe(false)
      expect(image.getAttribute('alt')).toBe('prueba sintética')
    } finally {
      purifier.removeAllHooks()
      root.remove()
    }
  })
})

describe('MarkdownService — política productiva tras el parche', () => {
  it('conserva Markdown y sanitiza HTML peligroso en renders repetidos', () => {
    const markdown = [
      '# Clase segura',
      '> [!note] Resumen\n> **Texto válido**',
      '- [x] Repasar',
      '[Apunte](./apunte.md)',
      '<div><p onclick="void 0">Contenido conservado</p><img src="./local.png" onerror="void 0"></div>',
      '<img src="https://tracker.invalid/pixel" onload="void 0">',
      '<script>void 0</script><svg onload="void 0"><a href="javascript:void 0">x</a></svg>',
    ].join('\n\n')
    const first = renderMarkdown(markdown)

    expect(renderMarkdown(markdown)).toBe(first)
    const template = document.createElement('template')
    template.innerHTML = first
    const content = template.content

    expect(content.querySelector('h1').textContent).toBe('Clase segura')
    expect(content.querySelector('.md-callout strong').textContent).toBe('Resumen')
    expect(content.querySelector('input[type="checkbox"]').checked).toBe(true)
    expect(content.querySelector('a').getAttribute('href')).toBe('./apunte.md')
    expect(content.querySelector('img').getAttribute('src')).toBe('./local.png')
    expect(content.textContent).toContain('Contenido conservado')
    expect(content.querySelector('script, svg, math, iframe, object, embed')).toBeNull()
    expect(content.querySelector('img[src^="https:"]')).toBeNull()

    for (const element of content.querySelectorAll('*')) {
      for (const attribute of element.attributes) {
        expect(attribute.name).not.toMatch(/^on/i)
        expect(attribute.value).not.toMatch(/^javascript:/i)
      }
    }
  })
})
