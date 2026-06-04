import { describe, expect, it, vi } from 'vitest'

import {
  EDITOR_COMMANDS,
  getCommandSnippet,
  getEditorCommandsForSurface,
} from '../../../src/components/editorCommandRegistry.js'

describe('editorCommandRegistry', () => {
  it('mantiene ids unicos para todos los comandos', () => {
    const ids = EDITOR_COMMANDS.map(command => command.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('expone los comandos esperados para el slash menu', () => {
    const commands = getEditorCommandsForSurface('slash')
    const ids = commands.map(command => command.id)

    expect(ids).toContain('heading-1')
    expect(ids).toContain('bulleted-list')
    expect(ids).toContain('numbered-list')
    expect(ids).toContain('task-list')
    expect(ids).toContain('quote')
    expect(ids).toContain('divider')
    expect(ids).toContain('code-block')
    expect(ids).toContain('table')
    expect(ids).toContain('link')
    expect(ids).toContain('today')
    expect(ids).toContain('callout-note')
    expect(ids).toContain('callout-important')
    expect(ids).toContain('callout-question')
    expect(ids).toContain('callout-warning')
  })

  it('agrega groupLabel a los comandos filtrados por superficie', () => {
    const command = getEditorCommandsForSurface('slash')
      .find(item => item.id === 'heading-1')

    expect(command.groupLabel).toBe('Bloques basicos')
  })

  it('calcula la fecha local para el comando Fecha de hoy', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 4, 10, 30, 0))

    const command = getEditorCommandsForSurface('slash')
      .find(item => item.id === 'today')

    expect(getCommandSnippet(command)).toBe('2026-06-04')
  })

  it('mantiene labels en espanol y callouts Markdown en ingles', () => {
    const command = getEditorCommandsForSurface('slash')
      .find(item => item.id === 'callout-note')

    expect(command.label).toBe('Nota')
    expect(command.aliases).toContain('nota')
    expect(command.aliases).toContain('note')
    expect(getCommandSnippet(command)).toBe('> [!note]\n> ')
  })

  it('expone comandos para el boton insertar', () => {
    const commands = getEditorCommandsForSurface('insert')
    const ids = commands.map(command => command.id)

    expect(ids).toContain('heading-1')
    expect(ids).toContain('task-list')
    expect(ids).toContain('callout-important')
    expect(ids).toContain('focus-mode')
  })

  it('expone comandos de formato inline', () => {
    const commands = getEditorCommandsForSurface('inline')
    const ids = commands.map(command => command.id)
    const bold = commands.find(command => command.id === 'inline-bold')

    expect(ids).toEqual([
      'inline-bold',
      'inline-italic',
      'inline-strike',
      'inline-code',
      'inline-link',
    ])
    expect(bold.before).toBe('**')
    expect(bold.after).toBe('**')
    expect(bold.placeholder).toBe('texto')
  })
})
