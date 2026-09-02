import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as SubjectService from '../../../../src/services/SubjectService.js'
import { renderTrashView } from '../../../../src/components/feed/TrashView.js'

const ADVERSARIAL_ID = 'entity-id"] data-injected="true # [odd'
const INVALID_CSS_COLOR = '#38bdf8; position: fixed'

vi.mock('../../../../src/services/SubjectService.js', () => ({
  getTrashItems: vi.fn(),
}))

function trashData(overrides = {}) {
  return {
    notes: [],
    subjects: [],
    orphanSections: [],
    totalCount: 0,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2024-01-15T10:00:00.000Z'))
})

describe('TrashView', () => {
  it('renderiza secciones eliminadas individualmente con botón de restaurar sección', async () => {
    SubjectService.getTrashItems.mockResolvedValue(trashData({
      totalCount: 2,
      orphanSections: [{
        id: 'sec-1',
        name: 'Unidad I',
        color: '#818cf8',
        parentName: 'Programación II',
        noteCount: 3,
        deletedAt: '2024-01-15T09:00:00.000Z',
      }],
    }))
    const container = document.createElement('div')

    await renderTrashView(container)

    expect(container.textContent).toContain('Secciones eliminadas')
    expect(container.textContent).toContain('Unidad I')
    expect(container.textContent).toContain('3 nota(s) · Programación II')
    expect(container.querySelector('.js-btn-restore-section')?.dataset.id).toBe('sec-1')
  })

  it('renderiza secciones incluidas dentro de una materia eliminada sin acción separada', async () => {
    SubjectService.getTrashItems.mockResolvedValue(trashData({
      totalCount: 4,
      subjects: [{
        id: 'subj-1',
        name: 'Programación II',
        color: '#818cf8',
        noteCount: 1,
        deletedAt: '2024-01-15T09:00:00.000Z',
        children: [{
          id: 'sec-1',
          name: 'Unidad I',
          color: '#818cf8',
          noteCount: 3,
          deletedAt: '2024-01-15T09:00:00.000Z',
        }],
      }],
    }))
    const container = document.createElement('div')

    await renderTrashView(container)

    expect(container.textContent).toContain('Programación II')
    expect(container.textContent).toContain('Unidad I')
    expect(container.textContent).toContain('incluida en la materia eliminada')
    expect(container.querySelector('.js-btn-restore-subject')?.dataset.id).toBe('subj-1')
    expect(container.querySelector('.trash-item--nested .js-btn-restore-section')).toBeNull()
  })

  it('distingue notas eliminadas con títulos repetidos usando sufijos visuales', async () => {
    SubjectService.getTrashItems.mockResolvedValue(trashData({
      totalCount: 3,
      notes: [
        { id: 'note-1', title: 'Sin título', content: '', deletedAt: '2024-01-15T09:00:00.000Z' },
        { id: 'note-2', title: 'Sin título', content: '', deletedAt: '2024-01-15T09:00:00.000Z' },
        { id: 'note-3', title: 'Sin título', content: '', deletedAt: '2024-01-15T09:00:00.000Z' },
      ],
    }))
    const container = document.createElement('div')

    await renderTrashView(container)

    const names = [...container.querySelectorAll('.trash-item__name')].map(node => node.textContent)
    expect(names).toEqual(['Sin título', 'Sin título (1)', 'Sin título (2)'])
  })

  it('protege entidades contaminadas borradas sin inyectar DOM, atributos ni CSS', async () => {
    SubjectService.getTrashItems.mockResolvedValue(trashData({
      totalCount: 4,
      subjects: [{
        id: ADVERSARIAL_ID,
        name: 'Materia "A" <B> & 😀',
        color: INVALID_CSS_COLOR,
        noteCount: 1,
        deletedAt: '2024-01-15T09:00:00.000Z',
        children: [{
          id: 'child-id"] data-injected="true',
          name: 'Sección <1> "citada" & 🧪',
          color: '#38bdf8',
          noteCount: 1,
          deletedAt: '2024-01-15T09:00:00.000Z',
        }],
      }],
      orphanSections: [{
        id: 'orphan-id"] data-injected="true',
        name: 'Huérfana <segura> & 😀',
        color: INVALID_CSS_COLOR,
        parentColor: '#38bdf8',
        parentName: 'Padre "histórico" <2025>',
        noteCount: 1,
        deletedAt: '2024-01-15T09:00:00.000Z',
      }],
      notes: [{
        id: 'note-id"] data-injected="true',
        title: 'Nota "legítima" < > & 😀',
        content: '# Markdown <dato> "citado" & 😀',
        deletedAt: '2024-01-15T09:00:00.000Z',
      }],
    }))
    const container = document.createElement('div')

    await renderTrashView(container)

    const restoreSubject = container.querySelector('.js-btn-restore-subject')
    const colorDots = container.querySelectorAll('.drawer__subject-color')

    expect(container.querySelector('[data-injected]')).toBeNull()
    expect(restoreSubject?.dataset.id).toBe(ADVERSARIAL_ID)
    expect(container.textContent).toContain('Materia "A" <B> & 😀')
    expect(container.textContent).toContain('Nota "legítima" < > & 😀')
    expect(colorDots[0].style.backgroundColor).toBe('')
    expect(colorDots[0].style.position).toBe('')
    expect(colorDots[1].getAttribute('style')).toContain('background-color: #38bdf8')
    expect(colorDots[2].getAttribute('style')).toContain('background-color: #38bdf8')
    expect([...container.querySelectorAll('[data-id]')].map(element => element.dataset.id))
      .toEqual([
        ADVERSARIAL_ID,
        'orphan-id"] data-injected="true',
        'note-id"] data-injected="true',
        'note-id"] data-injected="true',
      ])
  })
})
