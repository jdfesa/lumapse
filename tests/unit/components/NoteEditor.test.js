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

function findPopupItem(container, text) {
  return [...container.querySelectorAll('.editor-popup__item')]
    .find(item => item.textContent.includes(text))
}

function pressEnter(input) {
  const event = new window.KeyboardEvent('keydown', {
    key: 'Enter',
    bubbles: true,
    cancelable: true,
  })
  input.dispatchEvent(event)
  return event
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

describe('NoteEditor insert menu', () => {
  it('usa el registry del editor para insertar callouts desde el boton +', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = 'Repaso\n'
    input.setSelectionRange(input.value.length, input.value.length)
    editor.container.querySelector('#composer-plus-btn').click()
    findPopupItem(editor.container, 'Importante').click()

    expect(input.value).toBe('Repaso\n> [!important]\n> ')
    expect(input.selectionStart).toBe(input.value.length)

    editor.destroy()
  })

  it('mantiene Modo Enfoque como accion del menu +', () => {
    const editor = createEditor()

    editor.container.querySelector('#composer-plus-btn').click()
    findPopupItem(editor.container, 'Modo Enfoque').click()

    expect(editor.container.querySelector('.composer').classList.contains('composer--focus')).toBe(true)
    expect(document.body.classList.contains('focus-mode-active')).toBe(true)

    editor.exitFocusMode()
    editor.destroy()
  })
})

describe('NoteEditor Markdown list continuation', () => {
  it('continua vinetas con Enter y sale con Enter sobre item vacio', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = '- repasar matrices'
    input.setSelectionRange(input.value.length, input.value.length)

    const firstEnter = pressEnter(input)

    expect(firstEnter.defaultPrevented).toBe(true)
    expect(input.value).toBe('- repasar matrices\n- ')
    expect(input.selectionStart).toBe(input.value.length)

    const secondEnter = pressEnter(input)

    expect(secondEnter.defaultPrevented).toBe(true)
    expect(input.value).toBe('- repasar matrices\n')
    expect(input.selectionStart).toBe(input.value.length)

    editor.destroy()
  })

  it('continua listas numeradas incrementando el numero', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = '1. leer capitulo'
    input.setSelectionRange(input.value.length, input.value.length)

    pressEnter(input)

    expect(input.value).toBe('1. leer capitulo\n2. ')
    expect(input.selectionStart).toBe(input.value.length)

    editor.destroy()
  })

  it('sale de lista numerada con Enter sobre item vacio', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = '1. leer capitulo\n2. '
    input.setSelectionRange(input.value.length, input.value.length)

    pressEnter(input)

    expect(input.value).toBe('1. leer capitulo\n')
    expect(input.selectionStart).toBe(input.value.length)

    editor.destroy()
  })

  it('mantiene tareas como checkbox pendiente al continuar', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = '- [x] entregar TP'
    input.setSelectionRange(input.value.length, input.value.length)

    pressEnter(input)

    expect(input.value).toBe('- [x] entregar TP\n- [ ] ')
    expect(input.selectionStart).toBe(input.value.length)

    editor.destroy()
  })

  it('no intercepta Enter en texto normal', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = 'texto normal'
    input.setSelectionRange(input.value.length, input.value.length)

    const event = pressEnter(input)

    expect(event.defaultPrevented).toBe(false)
    expect(input.value).toBe('texto normal')

    editor.destroy()
  })
})
