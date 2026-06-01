import { describe, expect, it, vi } from 'vitest'
import {
  getShareContent,
  getShareFileName,
  getShareTitle,
  shareNoteAsMarkdown,
} from '../../../src/services/ShareNoteService.js'

describe('ShareNoteService', () => {
  it('prepara título, nombre de archivo y contenido Markdown de la nota', () => {
    const note = {
      title: 'Álgebra I / Unidad 2',
      content: '# Matrices\n\n- Determinantes',
    }

    expect(getShareTitle(note)).toBe('Álgebra I / Unidad 2')
    expect(getShareFileName(note)).toBe('álgebra-i-unidad-2.md')
    expect(getShareContent(note)).toBe('# Matrices\n\n- Determinantes')
  })

  it('usa share sheet con archivo Markdown cuando está disponible', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    const canShare = vi.fn().mockReturnValue(true)

    await expect(shareNoteAsMarkdown({
      title: 'Parcial',
      content: '# Repaso',
    }, { share, canShare })).resolves.toBe('shared')

    expect(canShare).toHaveBeenCalled()
    expect(share).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Parcial',
      text: 'Parcial',
      files: [expect.any(globalThis.File)],
    }))
  })

  it('cae a copiar el contenido si no hay share sheet', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)

    await expect(shareNoteAsMarkdown({
      title: 'Clase',
      content: '# Tema',
    }, { clipboard: { writeText } })).resolves.toBe('copied')

    expect(writeText).toHaveBeenCalledWith('# Tema')
  })

  it('rechaza notas sin contenido significativo', async () => {
    await expect(shareNoteAsMarkdown({
      title: 'Vacía',
      content: '   ',
    }, {})).rejects.toThrow('La nota no tiene contenido')
  })
})
