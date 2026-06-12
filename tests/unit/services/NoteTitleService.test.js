import { describe, expect, it } from 'vitest'
import {
  DEFAULT_NOTE_TITLE,
  cleanTitleCandidate,
  extractNoteTitle,
  getNoteContentPresentation,
  isDefaultNoteTitle,
  normalizeNoteTitle,
  resolveNoteTitleForSave,
  shouldDisplayNoteTitle,
  splitNoteForEditing,
  stripRedundantTitleFromContent,
} from '../../../src/services/NoteTitleService.ts'

describe('NoteTitleService', () => {
  it('normaliza titulos vacios al titulo por defecto', () => {
    expect(normalizeNoteTitle('')).toBe(DEFAULT_NOTE_TITLE)
    expect(normalizeNoteTitle('   ')).toBe(DEFAULT_NOTE_TITLE)
    expect(normalizeNoteTitle(null)).toBe(DEFAULT_NOTE_TITLE)
  })

  it('detecta el titulo por defecto ignorando mayusculas locales', () => {
    expect(isDefaultNoteTitle('Sin título')).toBe(true)
    expect(isDefaultNoteTitle('sin título')).toBe(true)
    expect(isDefaultNoteTitle('Clase 1')).toBe(false)
  })

  it('limpia prefijos Markdown estructurales de candidatos a titulo', () => {
    expect(cleanTitleCandidate('# Algebra lineal')).toBe('Algebra lineal')
    expect(cleanTitleCandidate('1. Repasar matrices')).toBe('Repasar matrices')
    expect(cleanTitleCandidate('- [x] Tarea')).toBe('x Tarea')
    expect(cleanTitleCandidate('> Idea central')).toBe('Idea central')
  })

  it('extrae encabezado Markdown H1 como titulo explicito', () => {
    expect(extractNoteTitle('Intro\n# Algebra lineal\nMatrices')).toBe('Algebra lineal')
  })

  it('usa primera linea significativa como titulo implicito y lo recorta', () => {
    const longLine = 'a'.repeat(70)

    expect(extractNoteTitle('\n\nRepasar limites')).toBe('Repasar limites')
    expect(extractNoteTitle(longLine)).toBe(`${'a'.repeat(57)}...`)
  })

  it('usa fallback cuando no hay contenido significativo', () => {
    expect(extractNoteTitle('', 'Borrador')).toBe('Borrador')
    expect(extractNoteTitle('   ', '')).toBe(DEFAULT_NOTE_TITLE)
  })

  it('solo muestra titulos explicitos no vacios ni por defecto', () => {
    expect(shouldDisplayNoteTitle('Clase 1')).toBe(true)
    expect(shouldDisplayNoteTitle('')).toBe(false)
    expect(shouldDisplayNoteTitle(DEFAULT_NOTE_TITLE)).toBe(false)
  })

  it('quita la primera linea si duplica el titulo de la nota', () => {
    expect(stripRedundantTitleFromContent('Resumen\n\nCuerpo', 'Resumen')).toBe('Cuerpo')
    expect(stripRedundantTitleFromContent('# Resumen\n\nCuerpo', 'Resumen')).toBe('Cuerpo')
    expect(stripRedundantTitleFromContent('- Resumen\n\nCuerpo', 'Resumen')).toBe('- Resumen\n\nCuerpo')
  })

  it('separa titulo y cuerpo para edicion', () => {
    expect(splitNoteForEditing({
      title: 'Resumen',
      content: 'Resumen\n\nCuerpo',
    })).toEqual({
      title: 'Resumen',
      body: 'Cuerpo',
    })

    expect(splitNoteForEditing({
      title: DEFAULT_NOTE_TITLE,
      content: 'Cuerpo',
    })).toEqual({
      title: '',
      body: 'Cuerpo',
    })
  })

  it('presenta contenido con offset de linea cuando oculta titulo redundante', () => {
    expect(getNoteContentPresentation({
      title: 'Resumen',
      content: '\nResumen\n\nCuerpo',
    })).toEqual({
      title: 'Resumen',
      body: 'Cuerpo',
      lineOffset: 3,
    })
  })

  it('resuelve titulo de guardado desde titulo explicito o encabezado del cuerpo', () => {
    expect(resolveNoteTitleForSave('Clase 1', '# Ignorado')).toBe('Clase 1')
    expect(resolveNoteTitleForSave('', '# Algebra')).toBe('Algebra')
    expect(resolveNoteTitleForSave('', 'Apuntes')).toBe(DEFAULT_NOTE_TITLE)
  })
})
