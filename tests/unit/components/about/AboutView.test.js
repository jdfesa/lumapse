import { describe, expect, it } from 'vitest'
import { APP_METADATA } from '../../../../src/config/appMetadata.js'
import { renderAboutView } from '../../../../src/components/about/AboutView.js'

function render(html) {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html
  return wrapper
}

describe('AboutView', () => {
  it('renderiza identidad, versión base, compilación, origen, autor y licencia', () => {
    const wrapper = render(renderAboutView())

    expect(wrapper.querySelector('#about-view-title')?.textContent).toBe('Lumapse')
    expect(wrapper.textContent).toContain(APP_METADATA.version)
    expect(wrapper.textContent).toContain(APP_METADATA.author)
    expect(wrapper.textContent).toContain(APP_METADATA.license)
    const items = [...wrapper.querySelectorAll('dt')].map(item => item.textContent)
    expect(items).toEqual(['Versión base', 'Autor', 'Licencia', 'Compilación', 'Origen'])
    expect(wrapper.textContent).toContain(APP_METADATA.compilation)
    expect(wrapper.textContent).toContain(APP_METADATA.origin)
    expect(wrapper.textContent).toContain('no el hash del APK ni su validación')
  })

  it('explicita alcance local sin prometer sincronizacion automatica', () => {
    const wrapper = render(renderAboutView())

    expect(wrapper.textContent).toContain('Los datos viven en el dispositivo')
    expect(wrapper.textContent).toContain('no sincroniza ni envía datos automáticamente')
  })

  it('escapa metadata dinamica', () => {
    const wrapper = render(renderAboutView({
      name: '<img src=x onerror=alert(1)>',
      tagline: 'Tagline',
      version: '0.0.0',
      compilation: '<svg onload=alert(1)>',
      origin: '<img src=origin onerror=alert(1)>',
      author: '<script>alert(1)</script>',
      license: 'GPL',
      purpose: 'Propósito',
      scope: ['<strong>scope</strong>'],
    }))

    expect(wrapper.querySelector('img[src="x"]')).toBeNull()
    expect(wrapper.querySelector('script')).toBeNull()
    expect(wrapper.querySelector('svg[onload]')).toBeNull()
    expect(wrapper.querySelector('img[src="origin"]')).toBeNull()
    expect(wrapper.textContent).toContain('<svg onload=alert(1)>')
    expect(wrapper.textContent).toContain('<img src=origin onerror=alert(1)>')
    expect(wrapper.textContent).toContain('<img src=x onerror=alert(1)>')
    expect(wrapper.textContent).toContain('<script>alert(1)</script>')
    expect(wrapper.textContent).toContain('<strong>scope</strong>')
  })

  it('no inventa compilación u origen si faltan en metadata externa', () => {
    const { compilation: _compilation, origin: _origin, ...withoutBuild } = APP_METADATA
    const wrapper = render(renderAboutView(withoutBuild))
    expect([...wrapper.querySelectorAll('dd')].slice(-2).map(item => item.textContent)).toEqual([
      'No disponible', 'No disponible',
    ])
  })
})
