import { describe, expect, it } from 'vitest'
import {
  NOTE_STATUSES,
  getNoteStatus,
  renderClearNoteStatusButton,
  renderNoteStatusBadge,
  renderNoteStatusMenuItems,
} from '../../../src/components/feed/NoteStatus.js'

function render(html) {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html
  return wrapper
}

describe('NoteStatus', () => {
  it('mantiene los emojis como valores persistidos', () => {
    expect(NOTE_STATUSES.map(status => status.value)).toEqual(['📖', '❓', '🔥', '✅'])
    expect(getNoteStatus('🔥')?.id).toBe('important')
  })

  it('renderiza badges con SVG, no con emoji visible', () => {
    const wrapper = render(renderNoteStatusBadge('🔥'))

    expect(wrapper.querySelector('.note-card__status-badge--important')).not.toBeNull()
    expect(wrapper.querySelector('svg.note-status-icon')).not.toBeNull()
    expect(wrapper.textContent).not.toContain('🔥')
  })

  it('renderiza el menú con botones SVG y conserva data-emoji para el store', () => {
    const wrapper = render(renderNoteStatusMenuItems('note-1', '✅'))
    const buttons = [...wrapper.querySelectorAll('.js-btn-status')]

    expect(buttons).toHaveLength(4)
    expect(buttons.map(button => button.dataset.emoji)).toEqual(['📖', '❓', '🔥', '✅'])
    expect(wrapper.querySelector('.note-card__status-btn--current')?.dataset.emoji).toBe('✅')
    expect(wrapper.textContent).not.toContain('✅')
  })

  it('renderiza la acción de limpiar sin depender de un caracter Unicode visible', () => {
    const wrapper = render(renderClearNoteStatusButton('note-1'))
    const button = wrapper.querySelector('.js-btn-status')

    expect(button?.dataset.emoji).toBe('')
    expect(button?.querySelector('svg.note-status-icon')).not.toBeNull()
    expect(button?.textContent).not.toContain('✕')
  })
})
