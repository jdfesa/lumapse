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
  vi.clearAllMocks()
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

describe('NoteEditor separate title UX', () => {
  it('muestra un titulo opcional separado del cuerpo', () => {
    const editor = createEditor()

    expect(editor.container.querySelector('#composer-title-input')?.placeholder).toBe('Sin título')
    expect(editor.container.querySelector('#composer-input')?.placeholder).toBe('Escribí algo...')

    editor.destroy()
  })

  it('permite guardar una nota con solo titulo', async () => {
    const editor = createEditor()
    const titleInput = editor.container.querySelector('#composer-title-input')
    const saveBtn = editor.container.querySelector('#btn-save-note')

    titleInput.value = 'Clase 1'
    titleInput.dispatchEvent(new window.Event('input'))

    expect(saveBtn.disabled).toBe(false)

    await editor.handleSave()

    expect(NoteStore.createNote).toHaveBeenCalledWith('Clase 1', '', null)

    editor.destroy()
  })

  it('usa un encabezado pegado en el cuerpo como titulo y lo quita del contenido guardado', async () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = '# Algebra lineal\n\nMatrices'
    input.dispatchEvent(new window.Event('input'))

    await editor.handleSave()

    expect(NoteStore.createNote).toHaveBeenCalledWith('Algebra lineal', 'Matrices', null)

    editor.destroy()
  })

  it('mantiene Sin titulo cuando el usuario deja el titulo vacio y escribe cuerpo normal', async () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = 'Apuntes de la clase'
    input.dispatchEvent(new window.Event('input'))

    await editor.handleSave()

    expect(NoteStore.createNote).toHaveBeenCalledWith('Sin título', 'Apuntes de la clase', null)

    editor.destroy()
  })

  it('carga notas antiguas separando la primera linea si ya era el titulo', () => {
    let subscriber
    NoteStore.subscribe.mockImplementationOnce((callback) => {
      subscriber = callback
      return vi.fn()
    })

    const editor = createEditor()
    subscriber({
      activeNoteId: 'note-1',
      notes: [{
        id: 'note-1',
        title: 'Resumen',
        content: 'Resumen\n\nCuerpo',
        subjectId: null,
      }],
      subjects: { tree: [] },
      viewMode: 'inbox',
    })

    expect(editor.container.querySelector('#composer-title-input').value).toBe('Resumen')
    expect(editor.container.querySelector('#composer-input').value).toBe('Cuerpo')

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
  it('ordena las acciones como Entrada, +, Aa y Modo Enfoque', () => {
    const editor = createEditor()
    const ids = [...editor.container.querySelector('.composer__tools').children]
      .map(element => element.id)

    expect(ids).toEqual([
      'composer-subject-picker',
      'composer-plus-btn',
      'composer-format-btn',
      'composer-focus-btn',
    ])

    editor.destroy()
  })

  it('muestra iconos y pistas Markdown en lugar de descripciones redundantes', () => {
    const editor = createEditor()

    editor.container.querySelector('#composer-plus-btn').click()
    const headingItem = findPopupItem(editor.container, 'Encabezado 1')

    expect(headingItem.querySelector('.editor-popup__icon-text').textContent).toBe('H1')
    expect(headingItem.querySelector('.editor-popup__hint-key').textContent).toBe('#')
    expect(headingItem.querySelector('.editor-popup__desc')).toBeNull()

    editor.destroy()
  })

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

  it('mantiene los menus de la toolbar disponibles en modo enfoque', () => {
    const editor = createEditor()

    editor.enterFocusMode()
    editor.container.querySelector('#composer-plus-btn').click()
    expect(findPopupItem(editor.container, 'Importante')).not.toBeUndefined()
    expect(editor.container.querySelector('.editor-popup').parentElement)
      .toBe(editor.container.querySelector('.composer__footer'))

    editor.container.querySelector('#composer-format-btn').click()
    expect(findPopupItem(editor.container, 'Negrita')).not.toBeUndefined()

    editor.updateSubjectSelect({
      tree: [{ id: 'subj-math', name: 'Matematica', color: '#60a5fa', children: [] }],
    })
    editor.container.querySelector('#composer-subject-trigger').click()
    expect(editor.container.querySelector('#composer-subject-menu').hidden).toBe(false)

    editor.exitFocusMode()
    editor.destroy()
  })

  it('cierra el menu + al tocar el boton de nuevo', () => {
    vi.useFakeTimers()
    let editor
    try {
      editor = createEditor()
      const plusBtn = editor.container.querySelector('#composer-plus-btn')

      plusBtn.dispatchEvent(new window.Event('pointerdown', { bubbles: true }))
      plusBtn.click()
      vi.advanceTimersByTime(60)
      expect(findPopupItem(editor.container, 'Importante')).not.toBeUndefined()

      plusBtn.dispatchEvent(new window.Event('pointerdown', { bubbles: true }))
      plusBtn.click()
      expect(editor.container.querySelector('.editor-popup__item')).toBeNull()
    } finally {
      editor?.destroy()
      vi.useRealTimers()
    }
  })

  it('usa un boton dedicado para Modo Enfoque fuera del menu +', () => {
    const editor = createEditor()

    editor.container.querySelector('#composer-plus-btn').click()
    expect(findPopupItem(editor.container, 'Modo Enfoque')).toBeUndefined()

    editor.container.querySelector('#composer-focus-btn').click()

    expect(editor.container.querySelector('.composer').classList.contains('composer--focus')).toBe(true)
    expect(document.body.classList.contains('focus-mode-active')).toBe(true)

    editor.exitFocusMode()
    editor.destroy()
  })
})

describe('NoteEditor inline format menu', () => {
  it('cierra el menu Aa al tocar el boton de nuevo', () => {
    vi.useFakeTimers()
    let editor
    try {
      editor = createEditor()
      const formatBtn = editor.container.querySelector('#composer-format-btn')

      formatBtn.dispatchEvent(new window.Event('pointerdown', { bubbles: true }))
      formatBtn.click()
      vi.advanceTimersByTime(60)
      expect(findPopupItem(editor.container, 'Negrita')).not.toBeUndefined()

      formatBtn.dispatchEvent(new window.Event('pointerdown', { bubbles: true }))
      formatBtn.click()
      expect(editor.container.querySelector('.editor-popup__item')).toBeNull()
    } finally {
      editor?.destroy()
      vi.useRealTimers()
    }
  })

  it('envuelve seleccion con negrita desde el boton Aa', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = 'parcial'
    input.setSelectionRange(0, input.value.length)
    editor.container.querySelector('#composer-format-btn').click()
    findPopupItem(editor.container, 'Negrita').click()

    expect(input.value).toBe('**parcial**')
    expect(input.selectionStart).toBe(2)
    expect(input.selectionEnd).toBe(9)

    editor.destroy()
  })

  it('inserta placeholder seleccionado cuando no hay seleccion', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = 'hola '
    input.setSelectionRange(input.value.length, input.value.length)
    editor.container.querySelector('#composer-format-btn').click()
    findPopupItem(editor.container, 'Cursiva').click()

    expect(input.value).toBe('hola *texto*')
    expect(input.selectionStart).toBe(6)
    expect(input.selectionEnd).toBe(11)

    editor.destroy()
  })

  it('selecciona url al crear link desde texto seleccionado', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = 'web'
    input.setSelectionRange(0, input.value.length)
    editor.container.querySelector('#composer-format-btn').click()
    findPopupItem(editor.container, 'Link').click()

    expect(input.value).toBe('[web](url)')
    expect(input.selectionStart).toBe(6)
    expect(input.selectionEnd).toBe(9)

    editor.destroy()
  })

  it('selecciona texto al crear link sin seleccion', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.setSelectionRange(0, 0)
    editor.container.querySelector('#composer-format-btn').click()
    findPopupItem(editor.container, 'Link').click()

    expect(input.value).toBe('[texto](url)')
    expect(input.selectionStart).toBe(1)
    expect(input.selectionEnd).toBe(6)

    editor.destroy()
  })

  it('usa backticks para codigo inline', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = 'const x'
    input.setSelectionRange(0, input.value.length)
    editor.container.querySelector('#composer-format-btn').click()
    findPopupItem(editor.container, 'Codigo inline').click()

    expect(input.value).toBe('`const x`')
    expect(input.selectionStart).toBe(1)
    expect(input.selectionEnd).toBe(8)

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

  it('continua callouts y sale con Enter sobre linea vacia', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = '> [!warning]\n> esta es una advertencia'
    input.setSelectionRange(input.value.length, input.value.length)

    const firstEnter = pressEnter(input)

    expect(firstEnter.defaultPrevented).toBe(true)
    expect(input.value).toBe('> [!warning]\n> esta es una advertencia\n> ')
    expect(input.selectionStart).toBe(input.value.length)

    const secondEnter = pressEnter(input)

    expect(secondEnter.defaultPrevented).toBe(true)
    expect(input.value).toBe('> [!warning]\n> esta es una advertencia\n')
    expect(input.selectionStart).toBe(input.value.length)

    editor.destroy()
  })

  it('continua blockquotes simples con el prefijo >', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = '> cita de clase'
    input.setSelectionRange(input.value.length, input.value.length)

    pressEnter(input)

    expect(input.value).toBe('> cita de clase\n> ')
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
