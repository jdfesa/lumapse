import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { SlashCommandHandler } from '../../../src/components/SlashCommandHandler.js'

let textarea
let container
let handler

function createHandler() {
  container = document.createElement('div')
  textarea = document.createElement('textarea')
  container.appendChild(textarea)
  document.body.appendChild(container)
  handler = new SlashCommandHandler(textarea, container)
}

function setTextareaValue(value, cursor = value.length) {
  textarea.value = value
  textarea.setSelectionRange(cursor, cursor)
  textarea.dispatchEvent(new window.Event('input', { bubbles: true }))
}

function findPopupItem(text) {
  return [...container.querySelectorAll('.editor-popup__item')]
    .find(item => item.textContent.includes(text))
}

beforeEach(() => {
  document.body.innerHTML = ''
  createHandler()
})

afterEach(() => {
  handler.destroy()
  document.body.innerHTML = ''
})

describe('SlashCommandHandler', () => {
  it('activa el menu slash solo al inicio de linea', () => {
    setTextareaValue('/')

    expect(handler.isActive()).toBe(true)
    expect(container.querySelector('.editor-popup')?.classList.contains('is-visible')).toBe(true)

    handler.deactivate()
    setTextareaValue('hola /')

    expect(handler.isActive()).toBe(false)
  })

  it('filtra comandos usando aliases', () => {
    setTextareaValue('/')
    setTextareaValue('/h1')

    const popupText = container.querySelector('.editor-popup')?.textContent || ''

    expect(popupText).toContain('Encabezado 1')
    expect(popupText).not.toContain('Lista de tareas')
  })

  it('mantiene el popup abierto cuando no hay resultados', () => {
    setTextareaValue('/')
    setTextareaValue('/zzzz')

    const popup = container.querySelector('.editor-popup')

    expect(handler.isActive()).toBe(true)
    expect(popup?.classList.contains('is-visible')).toBe(true)
    expect(popup?.textContent).toContain('Sin resultados')
  })

  it('inserta tabla simple reemplazando el trigger escrito', () => {
    setTextareaValue('/')
    setTextareaValue('/tabla')

    findPopupItem('Tabla simple').dispatchEvent(new window.MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    }))

    expect(textarea.value).toBe('| Header | Header |\n| ------ | ------ |\n| Cell   | Cell   |')
    expect(textarea.selectionStart).toBe(2)
    expect(textarea.selectionEnd).toBe(8)
  })

  it('inserta link y selecciona el texto editable', () => {
    setTextareaValue('/')
    setTextareaValue('/enlace')

    findPopupItem('Link').dispatchEvent(new window.MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    }))

    expect(textarea.value).toBe('[texto](url)')
    expect(textarea.selectionStart).toBe(1)
    expect(textarea.selectionEnd).toBe(6)
  })
})

