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
