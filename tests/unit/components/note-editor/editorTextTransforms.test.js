import { describe, expect, it, vi } from 'vitest'
import {
  applyInlineCommand,
  getMarkdownContinuation,
} from '../../../../src/components/note-editor/editorTextTransforms.ts'

describe('editorTextTransforms', () => {
  describe('getMarkdownContinuation()', () => {
    it('continua listas de tareas manteniendo indentacion y texto', () => {
      expect(getMarkdownContinuation('  - [x] Leer capitulo')).toEqual({
        prefix: '  - [ ] ',
        text: 'Leer capitulo',
      })
    })

    it('incrementa listas numeradas', () => {
      expect(getMarkdownContinuation('9. Repasar integrales')).toEqual({
        prefix: '10. ',
        text: 'Repasar integrales',
      })
    })

    it('continua blockquotes y retorna null para lineas normales', () => {
      expect(getMarkdownContinuation('> idea')).toEqual({
        prefix: '> ',
        text: 'idea',
      })
      expect(getMarkdownContinuation('idea suelta')).toBeNull()
    })
  })

  describe('applyInlineCommand()', () => {
    it('envuelve el texto seleccionado y lo deja seleccionado dentro de los marcadores', () => {
      const textarea = document.createElement('textarea')
      textarea.value = 'hola mundo'
      textarea.setSelectionRange(5, 10)
      textarea.focus = vi.fn()
      const inputListener = vi.fn()
      textarea.addEventListener('input', inputListener)

      applyInlineCommand(textarea, { before: '**', after: '**', placeholder: 'texto' })

      expect(textarea.value).toBe('hola **mundo**')
      expect(textarea.selectionStart).toBe(7)
      expect(textarea.selectionEnd).toBe(12)
      expect(inputListener).toHaveBeenCalledTimes(1)
      expect(textarea.focus).toHaveBeenCalledTimes(1)
    })

    it('selecciona el placeholder de url cuando aplica un link sobre texto seleccionado', () => {
      const textarea = document.createElement('textarea')
      textarea.value = 'apunte'
      textarea.setSelectionRange(0, 6)

      applyInlineCommand(textarea, {
        before: '[',
        after: '](url)',
        placeholder: 'texto',
        selectTarget: 'url',
      })

      expect(textarea.value).toBe('[apunte](url)')
      expect(textarea.selectionStart).toBe(9)
      expect(textarea.selectionEnd).toBe(12)
    })
  })
})
