import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as SubjectService from '../../../src/services/SubjectService.js'
import { renderTrashView } from '../../../src/components/TrashView.js'

vi.mock('../../../src/services/SubjectService.js', () => ({
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
})
