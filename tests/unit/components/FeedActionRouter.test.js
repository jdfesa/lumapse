import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as NoteStore from '../../../src/store/NoteStore.js'
import { createFeedActionRouter } from '../../../src/components/FeedActionRouter.js'

vi.mock('../../../src/store/NoteStore.js', () => ({
  getState: vi.fn(),
  updateNoteSilent: vi.fn(),
}))

vi.mock('../../../src/components/TrashView.js', () => ({
  renderTrashView: vi.fn(),
}))

function createDeps(overrides = {}) {
  return {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onCopy: vi.fn(),
    closeAllDropdowns: vi.fn(),
    feedContainer: document.createElement('div'),
    ...overrides,
  }
}

function createRouter(overrides = {}) {
  return createFeedActionRouter(createDeps(overrides))
}

function renderCheckbox({ line = 1, checked = false } = {}) {
  const feed = document.createElement('div')
  feed.innerHTML = `
    <article class="note-card" data-id="note-1">
      <input type="checkbox" data-line="${line}" ${checked ? 'checked' : ''}>
    </article>
  `
  const checkbox = feed.querySelector('input')
  feed.addEventListener('click', createRouter())
  document.body.appendChild(feed)
  return { feed, checkbox }
}

function clickCheckbox(checkbox) {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true })
  checkbox.dispatchEvent(event)
  return event
}

function waitForCheckboxPaint() {
  return new Promise(resolve => window.setTimeout(resolve, 0))
}

beforeEach(() => {
  vi.clearAllMocks()
  NoteStore.getState.mockReturnValue({
    notes: [{
      id: 'note-1',
      content: 'intro\n- [ ] uno\ntexto\n  - [x] dos',
    }],
  })
  NoteStore.updateNoteSilent.mockResolvedValue(undefined)
})

describe('FeedActionRouter dropdown actions', () => {
  it('mantiene abierto el dropdown para que Copiar pueda mostrar feedback visual', () => {
    const deps = createDeps()
    const router = createFeedActionRouter(deps)
    const feed = document.createElement('div')
    feed.innerHTML = '<button class="note-card__dropdown-btn js-btn-copy" data-id="note-1">Copiar</button>'
    const button = feed.querySelector('button')
    feed.addEventListener('click', router)

    button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

    expect(deps.closeAllDropdowns).not.toHaveBeenCalled()
    expect(deps.onCopy).toHaveBeenCalledWith(button)
  })
})

describe('FeedActionRouter task checkboxes', () => {
  it('previene el toggle nativo y actualiza la línea real del markdown', async () => {
    const { checkbox } = renderCheckbox({ line: 1 })

    const event = clickCheckbox(checkbox)
    await waitForCheckboxPaint()

    expect(event.defaultPrevented).toBe(true)
    expect(NoteStore.updateNoteSilent).toHaveBeenCalledWith('note-1', {
      content: 'intro\n- [x] uno\ntexto\n  - [x] dos',
    })
    expect(checkbox.checked).toBe(true)
  })

  it('soporta task items indentados usando data-line real', async () => {
    const { checkbox } = renderCheckbox({ line: 3, checked: true })

    clickCheckbox(checkbox)
    await waitForCheckboxPaint()

    expect(NoteStore.updateNoteSilent).toHaveBeenCalledWith('note-1', {
      content: 'intro\n- [ ] uno\ntexto\n  - [ ] dos',
    })
    expect(checkbox.checked).toBe(false)
  })

  it('bloquea taps duplicados mientras la actualización sigue pendiente', () => {
    let resolveUpdate
    NoteStore.updateNoteSilent.mockReturnValue(new Promise(resolve => {
      resolveUpdate = resolve
    }))
    const { checkbox } = renderCheckbox({ line: 1 })

    clickCheckbox(checkbox)
    clickCheckbox(checkbox)

    expect(NoteStore.updateNoteSilent).toHaveBeenCalledTimes(1)
    expect(checkbox.disabled).toBe(true)
    resolveUpdate()
  })

  it('restaura el estado visual y re-habilita el checkbox si falla el guardado', async () => {
    const error = new Error('boom')
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    NoteStore.updateNoteSilent.mockRejectedValueOnce(error)
    const { checkbox } = renderCheckbox({ line: 1 })

    clickCheckbox(checkbox)
    await waitForCheckboxPaint()
    await waitForCheckboxPaint()

    expect(checkbox.checked).toBe(false)
    expect(checkbox.disabled).toBe(false)
    expect(errorSpy).toHaveBeenCalledWith('[FeedActionRouter] No se pudo actualizar checkbox:', error)
    errorSpy.mockRestore()
  })
})
