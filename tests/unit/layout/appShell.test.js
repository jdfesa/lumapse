import { describe, expect, it } from 'vitest'
import { renderAppShell } from '../../../src/layout/appShell.js'

function renderShellDocument() {
  const container = document.createElement('div')
  container.innerHTML = renderAppShell()
  return container
}

function pathValues(container, selector) {
  return [...container.querySelectorAll(`${selector} path`)].map(path => path.getAttribute('d'))
}

describe('appShell', () => {
  it('nombra las acciones de símbolo y oculta los SVG decorativos (RNF-022)', () => {
    const container = renderShellDocument()

    expect(container.querySelector('#btn-close-drawer').getAttribute('aria-label')).toBe('Cerrar menú de notas')
    expect(container.querySelector('#btn-add-subject').getAttribute('aria-label')).toBe('Nueva materia')
    expect(container.querySelector('#btn-dismiss-toast').getAttribute('aria-label')).toBe('Cerrar aviso de papelera')
    expect([...container.querySelectorAll('svg')].every(svg => svg.getAttribute('aria-hidden') === 'true')).toBe(true)
  })

  it('usa iconos coherentes para exportar e importar ZIP', () => {
    const container = renderShellDocument()

    expect(container.querySelector('#export-backup-btn-label').textContent).toBe('Exportar ZIP')
    expect(container.querySelector('#import-backup-btn-label').textContent).toBe('Importar ZIP')
    expect(pathValues(container, '#btn-export-backup')).toContain('M12 21V9')
    expect(pathValues(container, '#btn-import-backup')).toContain('M12 3v12')
  })

  it('incluye acceso a la seccion Acerca de en el menu de app', () => {
    const container = renderShellDocument()

    expect(container.querySelector('#about-btn-label')?.textContent).toBe('Acerca de')
    expect(container.querySelector('#btn-about circle')?.getAttribute('r')).toBe('10')
  })
})
