import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const storeMock = vi.hoisted(() => ({
  state: null,
  getState: vi.fn(),
  createAcademicEvent: vi.fn(),
  updateAcademicEvent: vi.fn(),
}))

vi.mock('../../../src/store/NoteStore.js', () => ({
  getState: storeMock.getState,
  createAcademicEvent: storeMock.createAcademicEvent,
  updateAcademicEvent: storeMock.updateAcademicEvent,
}))

let openAcademicEventDialog

function event(overrides = {}) {
  return {
    id: 'event-1',
    type: 'parcial',
    title: 'Primer parcial',
    date: '2026-06-14',
    subjectId: 'subj-1',
    createdAt: '2026-05-31T10:00:00.000Z',
    updatedAt: '2026-05-31T10:00:00.000Z',
    ...overrides,
  }
}

function defaultState(overrides = {}) {
  return {
    dateFilter: null,
    viewMode: 'inbox',
    activeSubjectId: null,
    subjects: {
      tree: [
        {
          id: 'subj-1',
          name: 'Algebra',
          color: '#818cf8',
          children: [
            { id: 'sec-1', name: 'Unidad I', color: '#34d399' },
          ],
        },
      ],
    },
    ...overrides,
  }
}

async function finishAnimation() {
  await vi.advanceTimersByTimeAsync(120)
}

async function submitDialog() {
  document
    .querySelector('.academic-event-dialog__form')
    .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  await Promise.resolve()
}

beforeEach(async () => {
  vi.useFakeTimers()
  vi.resetModules()
  vi.clearAllMocks()
  document.body.innerHTML = '<button id="origin">Origen</button>'

  storeMock.state = defaultState()
  storeMock.getState.mockReturnValue(storeMock.state)
  storeMock.createAcademicEvent.mockResolvedValue(event({ id: 'created' }))
  storeMock.updateAcademicEvent.mockResolvedValue(event({ id: 'updated', title: 'Actualizado' }))

  ;({ openAcademicEventDialog } = await import('../../../src/components/AcademicEventDialog.js'))
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('AcademicEventDialog', () => {
  it('prefill fecha seleccionada y materia activa en modo create', () => {
    storeMock.state = defaultState({
      dateFilter: '2026-06-20',
      viewMode: 'subject',
      activeSubjectId: 'sec-1',
    })
    storeMock.getState.mockReturnValue(storeMock.state)

    openAcademicEventDialog()

    expect(document.querySelector('.academic-event-dialog__title').textContent).toBe('Nueva fecha academica')
    expect(document.querySelector('input[name="date"]').value).toBe('2026-06-20')
    expect(document.querySelector('select[name="subjectId"]')).toBeNull()
    expect(document.querySelector('input[name="subjectId"]').value).toBe('subj-1')
    expect(document.querySelector('.academic-event-dialog__subject-trigger-label').textContent).toBe('Algebra')
    expect(document.querySelector('.academic-event-dialog__type--active')?.dataset.type).toBe('parcial')
    expect(document.activeElement).toBe(document.querySelector('input[name="date"]'))
  })

  it('muestra solo materias raiz en el picker academico', () => {
    storeMock.state = defaultState({
      subjects: {
        tree: [
          {
            id: 'subj-lit',
            name: 'Literatura Argentina',
            color: '#818cf8',
            children: [
              { id: 'sec-borges', name: 'Borges' },
              { id: 'sec-cortazar', name: 'Cortazar' },
            ],
          },
          {
            id: 'subj-prog',
            name: 'Programacion I',
            color: '#34d399',
            children: [
              { id: 'sec-u1', name: 'Unidad I' },
              { id: 'sec-u2', name: 'Unidad II' },
            ],
          },
          { id: 'subj-db', name: 'Base de Datos', color: '#f97316', children: [] },
        ],
      },
    })
    storeMock.getState.mockReturnValue(storeMock.state)

    openAcademicEventDialog({ subjectId: 'sec-u2' })
    document.querySelector('.academic-event-dialog__subject-trigger').click()

    const optionLabels = [...document.querySelectorAll('.academic-event-dialog__subject-option-label')]
      .map(label => label.textContent)

    expect(document.querySelector('input[name="subjectId"]').value).toBe('subj-prog')
    expect(optionLabels).toEqual([
      'Sin materia',
      'Literatura Argentina',
      'Programacion I',
      'Base de Datos',
    ])
    expect(optionLabels).not.toContain('Unidad II')
    expect(document.querySelector('.academic-event-dialog__subject-option--child')).toBeNull()
  })

  it('cancela sin tocar el store y restaura el foco', async () => {
    const origin = document.getElementById('origin')
    origin.focus()

    const promise = openAcademicEventDialog({ date: '2026-06-14' })

    document.querySelector('.academic-event-dialog__btn--cancel').click()
    await finishAnimation()

    await expect(promise).resolves.toBeNull()
    expect(storeMock.createAcademicEvent).not.toHaveBeenCalled()
    expect(storeMock.updateAcademicEvent).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(origin)
  })

  it('valida fecha antes de guardar y no usa dialogos nativos', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true)
    const promptSpy = vi.spyOn(window, 'prompt').mockImplementation(() => '')

    openAcademicEventDialog({ date: '2026-02-31' })

    await submitDialog()

    expect(document.querySelector('.academic-event-dialog__error').hidden).toBe(false)
    expect(document.querySelector('.academic-event-dialog__error').textContent).toContain('no existe')
    expect(storeMock.createAcademicEvent).not.toHaveBeenCalled()
    expect(alertSpy).not.toHaveBeenCalled()
    expect(confirmSpy).not.toHaveBeenCalled()
    expect(promptSpy).not.toHaveBeenCalled()

    alertSpy.mockRestore()
    confirmSpy.mockRestore()
    promptSpy.mockRestore()
  })

  it('crea una fecha academica con payload normalizado', async () => {
    const saved = event({
      id: 'created',
      type: 'tp',
      title: 'Entrega informe',
      date: '2026-06-14',
      subjectId: 'subj-1',
    })
    storeMock.createAcademicEvent.mockResolvedValue(saved)

    const promise = openAcademicEventDialog({ date: '2026-06-14' })

    document.querySelector('.academic-event-dialog__type[data-type="tp"]').click()
    document.querySelector('.academic-event-dialog__subject-trigger').click()
    document
      .querySelector('.academic-event-dialog__subject-option[data-subject-id="subj-1"]')
      .click()
    document.querySelector('input[name="title"]').value = '  Entrega informe  '

    await submitDialog()

    expect(storeMock.createAcademicEvent).toHaveBeenCalledWith({
      type: 'tp',
      date: '2026-06-14',
      subjectId: 'subj-1',
      title: 'Entrega informe',
    })

    await finishAnimation()
    await expect(promise).resolves.toBe(saved)
    expect(document.querySelector('.academic-event-dialog-backdrop')).toBeNull()
  })

  it('edita una fecha existente sin cambiar de contrato de store', async () => {
    const original = event({
      id: 'event-7',
      type: 'final',
      title: 'Mesa regular',
      date: '2026-07-20',
      subjectId: 'subj-1',
    })
    const updated = event({ ...original, title: 'Mesa especial' })
    storeMock.updateAcademicEvent.mockResolvedValue(updated)

    const promise = openAcademicEventDialog({ mode: 'edit', event: original })

    expect(document.querySelector('.academic-event-dialog__title').textContent).toBe('Editar fecha academica')
    expect(document.querySelector('.academic-event-dialog__type--active')?.dataset.type).toBe('final')
    expect(document.querySelector('input[name="date"]').value).toBe('2026-07-20')
    expect(document.querySelector('input[name="title"]').value).toBe('Mesa regular')

    document.querySelector('input[name="title"]').value = '  Mesa especial  '
    await submitDialog()

    expect(storeMock.updateAcademicEvent).toHaveBeenCalledWith('event-7', {
      type: 'final',
      date: '2026-07-20',
      subjectId: 'subj-1',
      title: 'Mesa especial',
    })

    await finishAnimation()
    await expect(promise).resolves.toBe(updated)
  })

  it('cierra con Escape y cicla foco dentro del modal', async () => {
    const promise = openAcademicEventDialog({ date: '2026-06-14' })
    const dateInput = document.querySelector('input[name="date"]')
    const subjectTrigger = document.querySelector('.academic-event-dialog__subject-trigger')

    expect(document.activeElement).toBe(dateInput)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement).toBe(subjectTrigger)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await finishAnimation()

    await expect(promise).resolves.toBeNull()
  })
})
