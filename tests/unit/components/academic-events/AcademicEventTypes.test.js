import { describe, expect, it } from 'vitest'
import {
  ACADEMIC_EVENT_TYPES,
  ACADEMIC_EVENT_TYPE_ORDER,
  getAcademicEventColor,
  getAcademicEventType,
  renderAcademicEventDot,
  renderAcademicEventIcon,
  renderAcademicEventListItem,
} from '../../../../src/components/academic-events/AcademicEventTypes.ts'

function render(html) {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html
  return wrapper
}

function hexToRgb(hex) {
  const [r, g, b] = hex.match(/\w\w/g).map(value => parseInt(value, 16) / 255)
  return [r, g, b]
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(value =>
    value <= 0.03928
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4
  )

  return (0.2126 * r) + (0.7152 * g) + (0.0722 * b)
}

function contrastRatio(foreground, background) {
  const fg = luminance(foreground)
  const bg = luminance(background)
  return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05)
}

describe('AcademicEventTypes', () => {
  it('define los cuatro tipos academicos esperados', () => {
    expect(ACADEMIC_EVENT_TYPE_ORDER).toEqual(['parcial', 'final', 'tp', 'exposicion'])
    expect(Object.keys(ACADEMIC_EVENT_TYPES)).toEqual(ACADEMIC_EVENT_TYPE_ORDER)
  })

  it('obtiene config por tipo y retorna null para tipos desconocidos', () => {
    expect(getAcademicEventType('parcial')?.label).toBe('Parcial')
    expect(getAcademicEventType('missing')).toBeNull()
  })

  it('renderiza todos los iconos como SVG lineales, no como emoji visible', () => {
    for (const type of ACADEMIC_EVENT_TYPE_ORDER) {
      const wrapper = render(renderAcademicEventIcon(type))
      const svg = wrapper.querySelector('svg.academic-event-icon')

      expect(svg).not.toBeNull()
      expect(svg?.getAttribute('fill')).toBe('none')
      expect(svg?.getAttribute('stroke')).toBe('currentColor')
      expect(wrapper.textContent.trim()).toBe('')
    }
  })

  it('renderiza un dot de Heatmap con color semantico y metadata', () => {
    const wrapper = render(renderAcademicEventDot({ type: 'final' }))
    const dot = wrapper.querySelector('.academic-event-dot')

    expect(dot?.classList.contains('academic-event-dot--final')).toBe(true)
    expect(dot?.dataset.eventType).toBe('final')
    expect(dot?.getAttribute('style')).toContain('--academic-event-color: #dc2626')
    expect(dot?.getAttribute('aria-label')).toBe('Final')
  })

  it('renderiza un item de lista con icono SVG, fecha, tipo, titulo y materia', () => {
    const wrapper = render(renderAcademicEventListItem(
      {
        id: 'event-1',
        type: 'tp',
        title: 'Entrega informe',
        date: '2026-06-14',
      },
      { subjectLabel: 'Programacion II' },
    ))
    const item = wrapper.querySelector('.academic-event-item')

    expect(item?.dataset.eventId).toBe('event-1')
    expect(item?.dataset.eventType).toBe('tp')
    expect(item?.querySelector('svg.academic-event-icon')).not.toBeNull()
    expect(item?.querySelector('.academic-event-item__date')?.textContent).toBe('14 Jun')
    expect(item?.querySelector('.academic-event-item__type')?.textContent).toBe('TP')
    expect(item?.querySelector('.academic-event-item__title')?.textContent).toBe('Entrega informe')
    expect(item?.querySelector('.academic-event-item__subject')?.textContent).toBe('Programacion II')
  })

  it('escapa contenido dinamico del item de lista', () => {
    const wrapper = render(renderAcademicEventListItem({
      id: 'event-1',
      type: 'parcial',
      title: '<img src=x onerror=alert(1)>',
      date: '2026-06-14',
      subjectName: '<script>alert(1)</script>',
    }))

    expect(wrapper.querySelector('img')).toBeNull()
    expect(wrapper.querySelector('script')).toBeNull()
    expect(wrapper.textContent).toContain('<img src=x onerror=alert(1)>')
    expect(wrapper.textContent).toContain('<script>alert(1)</script>')
  })

  it('permite usar color de materia como override visual', () => {
    expect(getAcademicEventColor({ type: 'parcial' }, '#818cf8')).toBe('#818cf8')
    expect(renderAcademicEventDot({ type: 'parcial' }, { color: '#818cf8' })).toContain('#818cf8')
  })

  it('mantiene contraste minimo contra superficies dark y light', () => {
    for (const type of ACADEMIC_EVENT_TYPE_ORDER) {
      const { color } = ACADEMIC_EVENT_TYPES[type]

      expect(contrastRatio(color, '#202020')).toBeGreaterThanOrEqual(3)
      expect(contrastRatio(color, '#f7f7f5')).toBeGreaterThanOrEqual(3)
    }
  })
})
