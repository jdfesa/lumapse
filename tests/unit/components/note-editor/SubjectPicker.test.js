import { beforeEach, describe, expect, it } from 'vitest'

import { SubjectPicker } from '../../../../src/components/note-editor/SubjectPicker.js'

const ADVERSARIAL_ID = 'subject-id"] data-injected="true # [odd'
const INVALID_CSS_COLOR = '#38bdf8; position: fixed'

function createPicker() {
  document.body.innerHTML = `
    <div id="composer-root">
      <input id="composer-subject-select" type="hidden">
      <button id="composer-subject-trigger" type="button" aria-expanded="false">
        <span class="composer__subject-trigger-dot"></span>
        <span id="composer-subject-label"></span>
      </button>
      <div id="composer-subject-menu" hidden></div>
    </div>
  `

  return new SubjectPicker(document.getElementById('composer-root'))
}

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('SubjectPicker presentation hardening', () => {
  it('preserva texto e IDs, descarta CSS arbitrario y conserva hex historico', () => {
    const picker = createPicker()
    const legitimateLabel = 'Materia "A" <B> & 😀'

    picker.update({
      tree: [
        {
          id: ADVERSARIAL_ID,
          name: legitimateLabel,
          color: INVALID_CSS_COLOR,
          children: [],
        },
        {
          id: 'historic-color',
          name: 'Histórica "2025" <segura> & 🧪',
          color: '#38bdf8',
          children: [],
        },
      ],
    })

    const options = [...picker.menu.querySelectorAll('.composer__subject-option')]
    const contaminatedOption = options.find(option => option.dataset.subjectId === ADVERSARIAL_ID)
    const historicOption = options.find(option => option.dataset.subjectId === 'historic-color')

    expect(picker.menu.querySelector('[data-injected]')).toBeNull()
    expect(contaminatedOption?.getAttribute('aria-label')).toBe(legitimateLabel)
    expect(contaminatedOption?.querySelector('.composer__subject-option-label')?.textContent)
      .toBe(legitimateLabel)
    expect(contaminatedOption?.querySelector('.composer__subject-option-dot')?.getAttribute('style'))
      .toBeNull()
    expect(historicOption?.querySelector('.composer__subject-option-dot')?.getAttribute('style'))
      .toContain('--subject-color: #38bdf8')

    contaminatedOption.click()
    expect(picker.getValue()).toBe(ADVERSARIAL_ID)
    expect(picker.label.textContent).toBe(legitimateLabel)
    expect(picker.trigger.style.getPropertyValue('--subject-color')).toBe('')
    expect(picker.trigger.style.position).toBe('')

    picker.setValue('historic-color')
    expect(picker.trigger.style.getPropertyValue('--subject-color')).toBe('#38bdf8')

    picker.destroy()
  })
})
