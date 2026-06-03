import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/store/NoteStore.js', () => ({
  subscribe: vi.fn(() => vi.fn()),
  createNote: vi.fn(),
  updateNote: vi.fn(),
  selectNote: vi.fn(),
}))

import { NoteEditor } from '../../../src/components/NoteEditor.js'
import * as NoteStore from '../../../src/store/NoteStore.js'

function createEditor() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  return new NoteEditor(container)
}

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('NoteEditor title extraction', () => {
  it('usa encabezados Markdown como título explícito', () => {
    const editor = createEditor()

    expect(editor.extractTitle('# Algebra lineal\nMatrices')).toBe('Algebra lineal')

    editor.destroy()
  })

  it('preserva títulos implícitos que empiezan con números', () => {
    const editor = createEditor()

    expect(editor.extractTitle('2026 parcial 1\nRepasar límites')).toBe('2026 parcial 1')

    editor.destroy()
  })

  it('limpia prefijos estructurales cuando el texto empieza como lista', () => {
    const editor = createEditor()

    expect(editor.extractTitle('1. Repasar matrices')).toBe('Repasar matrices')

    editor.destroy()
  })
})

describe('NoteEditor maintenance views', () => {
  it('oculta el composer en la vista backup', () => {
    let subscriber
    NoteStore.subscribe.mockImplementationOnce((callback) => {
      subscriber = callback
      return vi.fn()
    })

    const editor = createEditor()
    subscriber({ viewMode: 'backup' })

    expect(editor.container.querySelector('.composer').style.display).toBe('none')

    editor.destroy()
  })
})

describe('NoteEditor subject picker', () => {
  it('usa un picker propio en lugar de un select nativo', () => {
    const editor = createEditor()

    expect(editor.container.querySelector('select#composer-subject-select')).toBeNull()
    expect(editor.container.querySelector('input#composer-subject-select[type="hidden"]')).not.toBeNull()
    expect(editor.container.querySelector('#composer-subject-trigger')?.textContent).toContain('Entrada')

    editor.destroy()
  })

  it('actualiza el subjectId oculto al elegir una seccion', () => {
    const editor = createEditor()
    editor.updateSubjectSelect({
      tree: [{
        id: 'subj-lit',
        name: 'Literatura Argentina',
        color: '#818cf8',
        children: [{ id: 'sec-borges', name: 'Borges' }],
      }],
    })

    editor.container.querySelector('#composer-subject-trigger').click()
    editor.container
      .querySelector('.composer__subject-option[data-subject-id="sec-borges"]')
      .click()

    expect(editor.container.querySelector('#composer-subject-select').value).toBe('sec-borges')
    expect(editor.container.querySelector('#composer-subject-label').textContent).toBe('Borges')
    expect(editor.container.querySelector('#composer-subject-menu').hidden).toBe(true)

    editor.destroy()
  })
})
