import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as NoteStore from '../../../../src/store/NoteStore.js'
import { createFeedActionRouter } from '../../../../src/components/feed/FeedActionRouter.js'
import { DatabaseError } from '../../../../src/services/sqlite/errors.js'
import { confirmDialog } from '../../../../src/components/common/ConfirmDialog.js'

vi.mock('../../../../src/store/NoteStore.js', () => ({
  getState: vi.fn(),
  updateNoteSilent: vi.fn(),
  emptyTrash: vi.fn(),
  restoreNoteFromTrash: vi.fn(),
  permanentlyDeleteNote: vi.fn(),
  restoreSubjectFromTrash: vi.fn(),
  restoreSectionFromTrash: vi.fn(),
  togglePin: vi.fn(),
  toggleArchive: vi.fn(),
  moveNote: vi.fn(),
  setNoteStatus: vi.fn(),
}))

vi.mock('../../../../src/components/feed/TrashView.js', () => ({
  renderTrashView: vi.fn(),
}))

vi.mock('../../../../src/components/common/ConfirmDialog.js', () => ({
  confirmDialog: vi.fn(),
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

async function settleAction() {
  await Promise.resolve()
  await waitForCheckboxPaint()
}

function dispatchAction(className, attributes = '', overrides = {}) {
  const deps = createDeps(overrides)
  const feed = document.createElement('div')
  feed.innerHTML = `<button class="${className}" ${attributes}>Acción</button>`
  const button = feed.querySelector('button')
  feed.addEventListener('click', createFeedActionRouter(deps))
  document.body.appendChild(feed)
  button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  return { button, deps, feed }
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
  NoteStore.emptyTrash.mockResolvedValue(undefined)
  NoteStore.restoreNoteFromTrash.mockResolvedValue(undefined)
  NoteStore.permanentlyDeleteNote.mockResolvedValue(undefined)
  NoteStore.restoreSubjectFromTrash.mockResolvedValue(undefined)
  NoteStore.restoreSectionFromTrash.mockResolvedValue(undefined)
  NoteStore.togglePin.mockResolvedValue(undefined)
  NoteStore.toggleArchive.mockResolvedValue(undefined)
  NoteStore.moveNote.mockResolvedValue(undefined)
  NoteStore.setNoteStatus.mockResolvedValue(undefined)
  confirmDialog.mockResolvedValue(true)
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

  it.each([
    ['pin', 'js-btn-pin', 'data-id="note-1"', 'togglePin'],
    ['archive', 'js-btn-archive', 'data-id="note-1"', 'toggleArchive'],
    ['move', 'js-btn-move-to', 'data-note-id="note-1" data-subject-id="subj-1"', 'moveNote'],
    ['status', 'js-btn-status', 'data-note-id="note-1" data-emoji="✅"', 'setNoteStatus'],
  ])('cierra el menú de %s solo después de una mutación exitosa', async (_name, className, attributes, method) => {
    const { deps } = dispatchAction(className, attributes)

    expect(deps.closeAllDropdowns).not.toHaveBeenCalled()
    await settleAction()

    expect(NoteStore[method]).toHaveBeenCalledTimes(1)
    expect(deps.closeAllDropdowns).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['pin', 'js-btn-pin', 'data-id="note-1"', 'togglePin'],
    ['archive', 'js-btn-archive', 'data-id="note-1"', 'toggleArchive'],
    ['move', 'js-btn-move-to', 'data-note-id="note-1" data-subject-id="subj-1"', 'moveNote'],
    ['status', 'js-btn-status', 'data-note-id="note-1" data-emoji="✅"', 'setNoteStatus'],
  ])('consume el rechazo de %s sin cerrar el menú', async (_name, className, attributes, method) => {
    const error = new Error('boom')
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    NoteStore[method].mockRejectedValueOnce(error)

    const { deps } = dispatchAction(className, attributes)
    await settleAction()

    expect(deps.closeAllDropdowns).not.toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith(
      '[FeedActionRouter] Error inesperado en mutación del store:',
      error,
    )
    errorSpy.mockRestore()
  })

  it('no registra nuevamente un DatabaseError ya emitido por el store', async () => {
    const error = new DatabaseError('updateNote', new Error('boom'))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    NoteStore.togglePin.mockRejectedValueOnce(error)

    const { deps } = dispatchAction('js-btn-pin', 'data-id="note-1"')
    await settleAction()

    expect(deps.closeAllDropdowns).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})

describe('FeedActionRouter trash actions', () => {
  it('rechaza la vía alternativa sin ownership y consume el error en el límite del router', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    dispatchAction('js-btn-restore', 'data-id="trash-id"')
    await settleAction()

    expect(NoteStore.restoreNoteFromTrash).toHaveBeenCalledWith('trash-id')
    expect(errorSpy).toHaveBeenCalledWith(
      '[FeedActionRouter] Error inesperado en mutación del store:',
      expect.objectContaining({
        message: 'FeedActionRouter requires an owned refreshTrash callback',
      }),
    )
    errorSpy.mockRestore()
  })

  it.each([
    ['note', 'js-btn-restore', 'restoreNoteFromTrash'],
    ['subject', 'js-btn-restore-subject', 'restoreSubjectFromTrash'],
    ['section', 'js-btn-restore-section', 'restoreSectionFromTrash'],
  ])('refresca después de restaurar %s con éxito', async (_name, className, method) => {
    const refreshTrash = vi.fn()
    dispatchAction(className, 'data-id="trash-id"', { refreshTrash })

    await settleAction()

    expect(NoteStore[method]).toHaveBeenCalledWith('trash-id')
    expect(refreshTrash).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['note', 'js-btn-restore', 'restoreNoteFromTrash'],
    ['subject', 'js-btn-restore-subject', 'restoreSubjectFromTrash'],
    ['section', 'js-btn-restore-section', 'restoreSectionFromTrash'],
  ])('no refresca si falla la restauración de %s', async (_name, className, method) => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const refreshTrash = vi.fn()
    NoteStore[method].mockRejectedValueOnce(new Error('boom'))

    dispatchAction(className, 'data-id="trash-id"', { refreshTrash })
    await settleAction()

    expect(refreshTrash).not.toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalledTimes(1)
    errorSpy.mockRestore()
  })

  it.each([
    ['vaciar', 'js-btn-empty-trash', '', 'emptyTrash'],
    ['borrar definitivamente', 'js-btn-permanent-delete', 'data-id="trash-id"', 'permanentlyDeleteNote'],
  ])('no refresca al %s si la mutación rechaza', async (_name, className, attributes, method) => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const refreshTrash = vi.fn()
    NoteStore[method].mockRejectedValueOnce(new Error('boom'))

    dispatchAction(className, attributes, { refreshTrash })
    await settleAction()

    expect(refreshTrash).not.toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalledTimes(1)
    errorSpy.mockRestore()
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
    expect(errorSpy).toHaveBeenCalledWith(
      '[FeedActionRouter] Error inesperado en mutación del store:',
      error,
    )
    errorSpy.mockRestore()
  })

  it('revierte un DatabaseError sin duplicar su registro global', async () => {
    const error = new DatabaseError('updateNote', new Error('boom'))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    NoteStore.updateNoteSilent.mockRejectedValueOnce(error)
    const { checkbox } = renderCheckbox({ line: 1 })

    clickCheckbox(checkbox)
    await waitForCheckboxPaint()
    await waitForCheckboxPaint()

    expect(checkbox.checked).toBe(false)
    expect(checkbox.disabled).toBe(false)
    expect(errorSpy).not.toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})
