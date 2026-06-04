import { beforeEach, describe, expect, it, vi } from 'vitest'

let MarkdownService

beforeEach(async () => {
  vi.resetModules()
  MarkdownService = await import('../../../src/services/MarkdownService.js')
})

describe('renderMarkdown()', () => {
  describe('Casos límite de input', () => {
    it('retorna "" para null', () => {
      expect(MarkdownService.renderMarkdown(null)).toBe('')
    })

    it('retorna "" para undefined', () => {
      expect(MarkdownService.renderMarkdown(undefined)).toBe('')
    })

    it('retorna "" para string vacío', () => {
      expect(MarkdownService.renderMarkdown('')).toBe('')
    })

    it('retorna "" para número', () => {
      expect(MarkdownService.renderMarkdown(42)).toBe('')
    })

    it('retorna "" para objeto', () => {
      expect(MarkdownService.renderMarkdown({})).toBe('')
    })
  })

  describe('Sintaxis Markdown básica', () => {
    it('convierte # Título en <h1>', () => {
      expect(MarkdownService.renderMarkdown('# Título')).toContain('<h1>Título</h1>')
    })

    it('convierte ## SubTítulo en <h2>', () => {
      expect(MarkdownService.renderMarkdown('## SubTítulo')).toContain('<h2>SubTítulo</h2>')
    })

    it('convierte **negrita** en <strong>', () => {
      expect(MarkdownService.renderMarkdown('**negrita**')).toContain('<strong>negrita</strong>')
    })

    it('convierte *cursiva* en <em>', () => {
      expect(MarkdownService.renderMarkdown('*cursiva*')).toContain('<em>cursiva</em>')
    })

    it('convierte `código` en <code>', () => {
      expect(MarkdownService.renderMarkdown('`código`')).toContain('<code>código</code>')
    })

    it('convierte ~~tachado~~ en <del>', () => {
      expect(MarkdownService.renderMarkdown('~~tachado~~')).toContain('<del>tachado</del>')
    })

    it('convierte lista desordenada en <ul>', () => {
      const html = MarkdownService.renderMarkdown('- item')

      expect(html).toContain('<ul>')
      expect(html).toContain('<li>item</li>')
    })

    it('convierte lista ordenada en <ol>', () => {
      const html = MarkdownService.renderMarkdown('1. item')

      expect(html).toContain('<ol>')
      expect(html).toContain('<li>item</li>')
    })

    it('convierte bloque de código en <pre><code>', () => {
      const html = MarkdownService.renderMarkdown('```\nbloque\n```')

      expect(html).toContain('<pre><code>bloque')
    })

    it('convierte separador Markdown en <hr>', () => {
      expect(MarkdownService.renderMarkdown('---')).toContain('<hr>')
    })

    it('convierte blockquote simple en <blockquote>', () => {
      const html = MarkdownService.renderMarkdown('> Cita de clase')

      expect(html).toContain('<blockquote>')
      expect(html).toContain('<p>Cita de clase</p>')
    })

    it('convierte [texto](url) en enlace', () => {
      const html = MarkdownService.renderMarkdown('[texto](./nota.md)')

      expect(html).toContain('<a href="./nota.md"')
      expect(html).toContain('>texto</a>')
    })

    it('convierte salto de línea simple en <br>', () => {
      expect(MarkdownService.renderMarkdown('a\nb')).toContain('a<br>')
    })

    it('agrega data-line con el número real de línea del task item', () => {
      const html = MarkdownService.renderMarkdown('intro\n- [ ] uno\ntexto\n  - [x] dos')

      expect(html).toContain('data-line="1"')
      expect(html).toContain('data-line="3"')
    })

    it('respeta lineOffset al renderizar fragmentos de una nota', () => {
      const html = MarkdownService.renderMarkdown('- [ ] uno', { lineOffset: 2 })

      expect(html).toContain('data-line="2"')
    })

    it('renderiza callout note con clase, titulo e icono', () => {
      const html = MarkdownService.renderMarkdown('> [!note]\n> Como este.')

      expect(html).toContain('class="md-callout md-callout--note"')
      expect(html).toContain('class="md-callout__icon"')
      expect(html).toContain('<strong>Nota</strong>')
      expect(html).toContain('<p>Como este.</p>')
    })

    it('respeta titulo personalizado en callouts', () => {
      const html = MarkdownService.renderMarkdown('> [!warning] Revisar antes del final\n> Fechas tentativas.')

      expect(html).toContain('class="md-callout md-callout--warning"')
      expect(html).toContain('<strong>Revisar antes del final</strong>')
      expect(html).toContain('<p>Fechas tentativas.</p>')
    })

    it('renderiza callout solo con titulo aunque no tenga cuerpo', () => {
      const html = MarkdownService.renderMarkdown('> [!question] Duda para clase')

      expect(html).toContain('class="md-callout md-callout--question"')
      expect(html).toContain('<strong>Duda para clase</strong>')
    })

    it('escapa HTML peligroso en titulos de callout', () => {
      const html = MarkdownService.renderMarkdown('> [!note] <img src=x onerror=alert(1)>')

      expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
      expect(html).not.toContain('<img src=x')
    })

    it('sanitiza HTML peligroso dentro del cuerpo de un callout', () => {
      const html = MarkdownService.renderMarkdown('> [!warning]\n> <script>alert(1)</script>\n> Texto seguro')

      expect(html).toContain('class="md-callout md-callout--warning"')
      expect(html).not.toContain('<script')
      expect(html).toContain('Texto seguro')
    })
  })

  describe('Sanitización XSS', () => {
    it('permite <img> pero elimina src externo (https://)', () => {
      const html = MarkdownService.renderMarkdown('![alt](https://example.com/x.png)')

      expect(html).toContain('<img')
      expect(html).toContain('alt="alt"')
      expect(html).not.toContain('https://example.com')
    })

    it('permite <img> con src data: URI (imagen local embebida)', () => {
      const html = MarkdownService.renderMarkdown('<img src="data:image/png;base64,abc" alt="local">')

      expect(html).toContain('<img')
      expect(html).toContain('src="data:image/png;base64,abc"')
    })

    it('permite <img> con src relativo (./imagen.png)', () => {
      const html = MarkdownService.renderMarkdown('<img src="./imagen.png" alt="local">')

      expect(html).toContain('src="./imagen.png"')
    })

    it('elimina <script>alert("xss")</script>', () => {
      const html = MarkdownService.renderMarkdown('<script>alert("xss")</script><p>ok</p>')

      expect(html).not.toContain('<script')
      expect(html).toContain('<p>ok</p>')
    })

    it('elimina atributos onclick del HTML', () => {
      const html = MarkdownService.renderMarkdown('<a href="./x" onclick="alert(1)">x</a>')

      expect(html).toContain('<a href="./x"')
      expect(html).not.toContain('onclick')
    })

    it('elimina <iframe> del contenido', () => {
      expect(MarkdownService.renderMarkdown('<iframe src="x"></iframe>')).not.toContain('<iframe')
    })

    it('elimina atributo src de tags que no sean img', () => {
      expect(MarkdownService.renderMarkdown('<a href="./x" src="https://tracker.test">x</a>')).not.toContain('src=')
    })

    it('elimina href con "javascript:"', () => {
      const html = MarkdownService.renderMarkdown('<a href="javascript:alert(1)">x</a>')

      expect(html).not.toContain('javascript:')
    })

    it('elimina href con "data:text/html"', () => {
      const html = MarkdownService.renderMarkdown('<a href="data:text/html,boom">x</a>')

      expect(html).not.toContain('data:text/html')
    })

    it('los enlaces http:// sobreviven sanitización', () => {
      const html = MarkdownService.renderMarkdown('[web](http://example.com)')

      expect(html).toContain('href="http://example.com"')
    })

    it('fuerza rel seguro en enlaces externos', () => {
      const html = MarkdownService.renderMarkdown('[web](https://example.com)')

      expect(html).toContain('rel="noopener noreferrer nofollow"')
    })

    it('fuerza target="_blank" en enlaces externos', () => {
      const html = MarkdownService.renderMarkdown('[web](https://example.com)')

      expect(html).toContain('target="_blank"')
    })

    it('las tablas GFM pasan sanitización', () => {
      const html = MarkdownService.renderMarkdown('| A | B |\n|---|---|\n| 1 | 2 |')

      expect(html).toContain('<table>')
      expect(html).toContain('<thead>')
      expect(html).toContain('<tbody>')
      expect(html).toContain('<td>1</td>')
    })

    it('elimina atributos peligrosos en tablas HTML permitidas', () => {
      const html = MarkdownService.renderMarkdown(
        '<table onclick="alert(1)"><tr><td onmouseover="alert(1)">ok</td></tr></table>'
      )

      expect(html).toContain('<table>')
      expect(html).toContain('<td>ok</td>')
      expect(html).not.toContain('onclick')
      expect(html).not.toContain('onmouseover')
    })
  })

  describe('Defensa en profundidad', () => {
    it('elimina src externo que haya sobrevivido en un tag no-img', () => {
      const html = MarkdownService.renderMarkdown('<a href="./x" src="https://example.com/pixel">x</a>')

      expect(html).not.toContain('src=')
    })

    it('elimina srcset de cualquier elemento', () => {
      const html = MarkdownService.renderMarkdown('<a href="./x" srcset="https://example.com/a 1x">x</a>')

      expect(html).not.toContain('srcset=')
    })

    it('elimina poster de cualquier elemento', () => {
      const html = MarkdownService.renderMarkdown('<a href="./x" poster="https://example.com/p">x</a>')

      expect(html).not.toContain('poster=')
    })

    it('bloquea http:// en img src pero permite data: en img src', () => {
      const external = MarkdownService.renderMarkdown('<img src="http://tracker.com/pixel.png">')
      const local = MarkdownService.renderMarkdown('<img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==">')

      expect(external).not.toContain('http://tracker.com')
      expect(local).toContain('data:image/gif')
    })
  })
})

describe('hasMarkdownSyntax()', () => {
  it('retorna false para null', () => {
    expect(MarkdownService.hasMarkdownSyntax(null)).toBe(false)
  })

  it('retorna false para string vacío', () => {
    expect(MarkdownService.hasMarkdownSyntax('')).toBe(false)
  })

  it('retorna false para texto plano sin sintaxis Markdown', () => {
    expect(MarkdownService.hasMarkdownSyntax('solo texto plano')).toBe(false)
  })

  it('retorna true para texto con encabezado', () => {
    expect(MarkdownService.hasMarkdownSyntax('# Título')).toBe(true)
  })

  it('retorna true para texto con negrita', () => {
    expect(MarkdownService.hasMarkdownSyntax('**negrita**')).toBe(true)
  })

  it('retorna true para texto con cursiva', () => {
    expect(MarkdownService.hasMarkdownSyntax('*cursiva*')).toBe(true)
  })

  it('retorna true para texto con lista', () => {
    expect(MarkdownService.hasMarkdownSyntax('- item')).toBe(true)
  })

  it('retorna true para texto con lista numerada', () => {
    expect(MarkdownService.hasMarkdownSyntax('1. item')).toBe(true)
  })

  it('retorna true para texto con código inline', () => {
    expect(MarkdownService.hasMarkdownSyntax('`código`')).toBe(true)
  })

  it('retorna true para texto con bloque de código', () => {
    expect(MarkdownService.hasMarkdownSyntax('```\nbloque\n```')).toBe(true)
  })

  it('retorna true para texto con enlace', () => {
    expect(MarkdownService.hasMarkdownSyntax('[enlace](url)')).toBe(true)
  })

  it('retorna true para texto con tachado', () => {
    expect(MarkdownService.hasMarkdownSyntax('~~tachado~~')).toBe(true)
  })

  it('retorna true para texto con callout', () => {
    expect(MarkdownService.hasMarkdownSyntax('> [!note]\n> dato')).toBe(true)
  })
})
