import { describe, expect, it } from 'vitest'
import { APP_METADATA } from '../../../../src/config/appMetadata.js'
import { renderAboutView } from '../../../../src/components/about/AboutView.js'

function render(html) {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html
  return wrapper
}

describe('AboutView', () => {
  it('renderiza identidad, version, autor y licencia desde metadata', () => {
    const wrapper = render(renderAboutView())

    expect(wrapper.querySelector('#about-view-title')?.textContent).toBe('Lumapse')
    expect(wrapper.textContent).toContain(APP_METADATA.version)
    expect(wrapper.textContent).toContain(APP_METADATA.author)
    expect(wrapper.textContent).toContain(APP_METADATA.license)
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
      author: '<script>alert(1)</script>',
      license: 'GPL',
      purpose: 'Propósito',
      scope: ['<strong>scope</strong>'],
    }))

    expect(wrapper.querySelector('img[src="x"]')).toBeNull()
    expect(wrapper.querySelector('script')).toBeNull()
    expect(wrapper.textContent).toContain('<img src=x onerror=alert(1)>')
    expect(wrapper.textContent).toContain('<script>alert(1)</script>')
    expect(wrapper.textContent).toContain('<strong>scope</strong>')
  })
})
