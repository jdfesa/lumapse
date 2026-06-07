import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/store/NoteStore.js', () => ({
  subscribe: vi.fn(() => vi.fn()),
  createNote: vi.fn(),
  updateNote: vi.fn(),
  selectNote: vi.fn(),
}))

vi.mock('../../../src/services/EditorDraftService.js', () => ({
  loadDraft: vi.fn(),
  saveDraft: vi.fn(),
  clearDraft: vi.fn(),
}))

vi.mock('../../../src/components/ConfirmDialog.js', () => ({
  confirmDialog: vi.fn(() => Promise.resolve(true)),
}))

import { NoteEditor } from '../../../src/components/NoteEditor.js'
import { confirmDialog } from '../../../src/components/ConfirmDialog.js'
import * as EditorDraftService from '../../../src/services/EditorDraftService.js'
import * as NoteStore from '../../../src/store/NoteStore.js'

function createEditor() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  return new NoteEditor(container)
}

function findPopupItem(container, text) {
  return [...container.querySelectorAll('.editor-popup__item')]
    .find(item => item.textContent.includes(text))
}

function pressEnter(input) {
  const event = new window.KeyboardEvent('keydown', {
    key: 'Enter',
    bubbles: true,
    cancelable: true,
  })
  input.dispatchEvent(event)
  return event
}

beforeEach(() => {
  document.body.innerHTML = ''
  vi.clearAllMocks()
  confirmDialog.mockResolvedValue(true)
  EditorDraftService.loadDraft.mockReturnValue(null)
})

describe('NoteEditor title extraction', () => {
  it('usa encabezados Markdown como título explícito', () => {
    const editor = createEditor()

    expect(editor.extractTitle('# Algebra lineal\nMatrices')).toBe('Algebra lineal')

    editor.destroy()
  })

  it('preserva títulos implícitos que empiezan con números', () => {
    const editor = createEditor()

    expect(editor.extractTitle('2026 parcial 1\nRepasar límites')).toBe('2026 parcial 1')

    editor.destroy()
  })

  it('limpia prefijos estructurales cuando el texto empieza como lista', () => {
    const editor = createEditor()

    expect(editor.extractTitle('1. Repasar matrices')).toBe('Repasar matrices')

    editor.destroy()
  })
})

describe('NoteEditor separate title UX', () => {
  it('muestra un titulo opcional separado del cuerpo', () => {
    const editor = createEditor()

    expect(editor.container.querySelector('#composer-title-input')?.placeholder).toBe('Sin título')
    expect(editor.container.querySelector('#composer-input')?.placeholder).toBe('Escribí algo...')

    editor.destroy()
  })

  it('permite guardar una nota con solo titulo', async () => {
    const editor = createEditor()
    const titleInput = editor.container.querySelector('#composer-title-input')
    const saveBtn = editor.container.querySelector('#btn-save-note')

    titleInput.value = 'Clase 1'
    titleInput.dispatchEvent(new window.Event('input'))

    expect(saveBtn.disabled).toBe(false)

    await editor.handleSave()

    expect(NoteStore.createNote).toHaveBeenCalledWith('Clase 1', '', null)

    editor.destroy()
  })

  it('usa un encabezado pegado en el cuerpo como titulo y lo quita del contenido guardado', async () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = '# Algebra lineal\n\nMatrices'
    input.dispatchEvent(new window.Event('input'))

    await editor.handleSave()

    expect(NoteStore.createNote).toHaveBeenCalledWith('Algebra lineal', 'Matrices', null)

    editor.destroy()
  })

  it('mantiene Sin titulo cuando el usuario deja el titulo vacio y escribe cuerpo normal', async () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = 'Apuntes de la clase'
    input.dispatchEvent(new window.Event('input'))

    await editor.handleSave()

    expect(NoteStore.createNote).toHaveBeenCalledWith('Sin título', 'Apuntes de la clase', null)

    editor.destroy()
  })

  it('carga notas antiguas separando la primera linea si ya era el titulo', () => {
    let subscriber
    NoteStore.subscribe.mockImplementationOnce((callback) => {
      subscriber = callback
      return vi.fn()
    })

    const editor = createEditor()
    subscriber({
      activeNoteId: 'note-1',
      notes: [{
        id: 'note-1',
        title: 'Resumen',
        content: 'Resumen\n\nCuerpo',
        subjectId: null,
      }],
      subjects: { tree: [] },
      viewMode: 'inbox',
    })

    expect(editor.container.querySelector('#composer-title-input').value).toBe('Resumen')
    expect(editor.container.querySelector('#composer-input').value).toBe('Cuerpo')

    editor.destroy()
  })
})

describe('NoteEditor maintenance views', () => {
  it('oculta el composer en la vista backup', () => {
    let subscriber
    NoteStore.subscribe.mockImplementationOnce((callback) => {
      subscriber = callback
      return vi.fn()
    })

    const editor = createEditor()
    subscriber({ viewMode: 'backup' })

    expect(editor.container.querySelector('.composer').style.display).toBe('none')

    editor.destroy()
  })
})

describe('NoteEditor subject picker', () => {
  it('usa un picker propio en lugar de un select nativo', () => {
    const editor = createEditor()

    expect(editor.container.querySelector('select#composer-subject-select')).toBeNull()
    expect(editor.container.querySelector('input#composer-subject-select[type="hidden"]')).not.toBeNull()
    expect(editor.container.querySelector('#composer-subject-trigger')?.textContent).toContain('Entrada')

    editor.destroy()
  })

  it('actualiza el subjectId oculto al elegir una seccion', () => {
    const editor = createEditor()
    editor.updateSubjectSelect({
      tree: [{
        id: 'subj-lit',
        name: 'Literatura Argentina',
        color: '#818cf8',
        children: [{ id: 'sec-borges', name: 'Borges' }],
      }],
    })

    editor.container.querySelector('#composer-subject-trigger').click()
    editor.container
      .querySelector('.composer__subject-option[data-subject-id="sec-borges"]')
      .click()

    expect(editor.container.querySelector('#composer-subject-select').value).toBe('sec-borges')
    expect(editor.container.querySelector('#composer-subject-label').textContent).toBe('Borges')
    expect(editor.container.querySelector('#composer-subject-menu').hidden).toBe(true)

    editor.destroy()
  })
})

describe('NoteEditor draft capture', () => {
  it('guarda un borrador de nota nueva al cambiar el titulo luego del debounce', () => {
    vi.useFakeTimers()
    const editor = createEditor()
    const titleInput = editor.container.querySelector('#composer-title-input')

    titleInput.value = 'Clase 1'
    titleInput.dispatchEvent(new window.Event('input'))

    expect(EditorDraftService.saveDraft).not.toHaveBeenCalled()

    vi.advanceTimersByTime(500)

    expect(EditorDraftService.saveDraft).toHaveBeenCalledWith({
      mode: 'create',
      noteId: null,
      title: 'Clase 1',
      content: '',
      subjectId: null,
      baseUpdatedAt: null,
    })

    editor.destroy()
  })

  it('no guarda borradores vacios de notas nuevas y limpia el borrador previo', () => {
    vi.useFakeTimers()
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = '   '
    input.dispatchEvent(new window.Event('input'))

    vi.advanceTimersByTime(500)

    expect(EditorDraftService.saveDraft).not.toHaveBeenCalled()
    expect(EditorDraftService.clearDraft).toHaveBeenCalledTimes(1)

    editor.destroy()
  })

  it('guarda el subjectId elegido junto con el contenido en progreso', () => {
    vi.useFakeTimers()
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')
    editor.updateSubjectSelect({
      tree: [{
        id: 'subj-lit',
        name: 'Literatura Argentina',
        color: '#818cf8',
        children: [{ id: 'sec-borges', name: 'Borges' }],
      }],
    })

    input.value = 'Apuntes de clase'
    input.dispatchEvent(new window.Event('input'))
    editor.container.querySelector('#composer-subject-trigger').click()
    editor.container
      .querySelector('.composer__subject-option[data-subject-id="sec-borges"]')
      .click()

    vi.advanceTimersByTime(500)

    expect(EditorDraftService.saveDraft).toHaveBeenCalledWith({
      mode: 'create',
      noteId: null,
      title: '',
      content: 'Apuntes de clase',
      subjectId: 'sec-borges',
      baseUpdatedAt: null,
    })

    editor.destroy()
  })

  it('guarda un borrador de edicion asociado a la nota original solo cuando el usuario modifica', () => {
    vi.useFakeTimers()
    let subscriber
    NoteStore.subscribe.mockImplementationOnce((callback) => {
      subscriber = callback
      return vi.fn()
    })

    const editor = createEditor()
    subscriber({
      activeNoteId: 'note-1',
      notes: [{
        id: 'note-1',
        title: 'Resumen',
        content: 'Resumen\n\nCuerpo',
        subjectId: 'subj-math',
        updatedAt: '2026-06-06T10:00:00.000Z',
      }],
      subjects: {
        tree: [{ id: 'subj-math', name: 'Matematica', color: '#60a5fa', children: [] }],
      },
      viewMode: 'inbox',
    })

    vi.advanceTimersByTime(500)
    expect(EditorDraftService.saveDraft).not.toHaveBeenCalled()

    const input = editor.container.querySelector('#composer-input')
    input.value = 'Cuerpo editado'
    input.dispatchEvent(new window.Event('input'))
    vi.advanceTimersByTime(500)

    expect(EditorDraftService.saveDraft).toHaveBeenCalledWith({
      mode: 'edit',
      noteId: 'note-1',
      title: 'Resumen',
      content: 'Cuerpo editado',
      subjectId: 'subj-math',
      baseUpdatedAt: '2026-06-06T10:00:00.000Z',
    })

    editor.destroy()
  })

  it('fuerza el guardado pendiente en pagehide sin esperar el debounce', () => {
    vi.useFakeTimers()
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = 'Antes de salir'
    input.dispatchEvent(new window.Event('input'))

    window.dispatchEvent(new window.Event('pagehide'))

    expect(EditorDraftService.saveDraft).toHaveBeenCalledWith({
      mode: 'create',
      noteId: null,
      title: '',
      content: 'Antes de salir',
      subjectId: null,
      baseUpdatedAt: null,
    })

    editor.destroy()
  })

  it('fuerza el guardado antes de cambiar a una nota activa', () => {
    vi.useFakeTimers()
    let subscriber
    NoteStore.subscribe.mockImplementationOnce((callback) => {
      subscriber = callback
      return vi.fn()
    })

    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')
    input.value = 'Borrador antes de editar otra nota'
    input.dispatchEvent(new window.Event('input'))

    subscriber({
      activeNoteId: 'note-2',
      notes: [{
        id: 'note-2',
        title: 'Otra nota',
        content: 'Otra nota\n\nContenido',
        subjectId: null,
      }],
      subjects: { tree: [] },
      viewMode: 'inbox',
    })

    expect(EditorDraftService.saveDraft).toHaveBeenCalledWith({
      mode: 'create',
      noteId: null,
      title: '',
      content: 'Borrador antes de editar otra nota',
      subjectId: null,
      baseUpdatedAt: null,
    })

    editor.destroy()
  })
})

describe('NoteEditor draft restoration', () => {
  it('restaura un borrador de nota nueva sin crear una nota final', () => {
    let subscriber
    EditorDraftService.loadDraft.mockReturnValueOnce({
      version: 1,
      mode: 'create',
      noteId: null,
      title: 'Clase recuperada',
      content: 'Contenido pendiente',
      subjectId: 'sec-borges',
      baseUpdatedAt: null,
      savedAt: '2026-06-07T03:00:00.000Z',
    })
    NoteStore.subscribe.mockImplementationOnce((callback) => {
      subscriber = callback
      return vi.fn()
    })

    const editor = createEditor()
    subscriber({
      activeNoteId: null,
      notes: [],
      subjects: {
        tree: [{
          id: 'subj-lit',
          name: 'Literatura Argentina',
          color: '#818cf8',
          children: [{ id: 'sec-borges', name: 'Borges' }],
        }],
      },
      activeSubjectId: '',
      viewMode: 'inbox',
    })

    expect(editor.container.querySelector('#composer-title-input').value).toBe('Clase recuperada')
    expect(editor.container.querySelector('#composer-input').value).toBe('Contenido pendiente')
    expect(editor.container.querySelector('#composer-subject-select').value).toBe('sec-borges')
    expect(editor.container.querySelector('#btn-save-note').textContent).toBe('Guardar')
    expect(editor.container.querySelector('#btn-save-note').disabled).toBe(false)
    expect(editor.container.querySelector('#composer-draft-status').textContent).toBe('Borrador recuperado')
    expect(document.activeElement).toBe(editor.container.querySelector('#composer-input'))
    expect(NoteStore.createNote).not.toHaveBeenCalled()
    expect(EditorDraftService.saveDraft).not.toHaveBeenCalled()

    editor.destroy()
  })

  it('enfoca el titulo cuando el borrador recuperado solo tiene titulo', () => {
    let subscriber
    EditorDraftService.loadDraft.mockReturnValueOnce({
      version: 1,
      mode: 'create',
      noteId: null,
      title: 'Idea suelta',
      content: '',
      subjectId: null,
      baseUpdatedAt: null,
      savedAt: '2026-06-07T03:00:00.000Z',
    })
    NoteStore.subscribe.mockImplementationOnce((callback) => {
      subscriber = callback
      return vi.fn()
    })

    const editor = createEditor()
    subscriber({
      activeNoteId: null,
      notes: [],
      subjects: { tree: [] },
      activeSubjectId: '',
      viewMode: 'inbox',
    })

    expect(document.activeElement).toBe(editor.container.querySelector('#composer-title-input'))

    editor.destroy()
  })

  it('espera a que exista la nota original antes de restaurar un borrador de edicion', () => {
    let subscriber
    EditorDraftService.loadDraft.mockReturnValueOnce({
      version: 1,
      mode: 'edit',
      noteId: 'note-1',
      title: 'Resumen pendiente',
      content: 'Cambios sin actualizar',
      subjectId: 'subj-math',
      baseUpdatedAt: '2026-06-06T10:00:00.000Z',
      savedAt: '2026-06-07T03:00:00.000Z',
    })
    NoteStore.subscribe.mockImplementationOnce((callback) => {
      subscriber = callback
      return vi.fn()
    })

    const editor = createEditor()
    subscriber({
      activeNoteId: null,
      notes: [],
      subjects: {
        tree: [{ id: 'subj-math', name: 'Matematica', color: '#60a5fa', children: [] }],
      },
      viewMode: 'inbox',
    })

    expect(editor.container.querySelector('#composer-title-input').value).toBe('')

    subscriber({
      activeNoteId: null,
      notes: [{
        id: 'note-1',
        title: 'Resumen original',
        content: 'Original',
        subjectId: 'subj-math',
        updatedAt: '2026-06-06T10:00:00.000Z',
      }],
      subjects: {
        tree: [{ id: 'subj-math', name: 'Matematica', color: '#60a5fa', children: [] }],
      },
      viewMode: 'inbox',
    })

    expect(editor.container.querySelector('#composer-title-input').value).toBe('Resumen pendiente')
    expect(editor.container.querySelector('#composer-input').value).toBe('Cambios sin actualizar')
    expect(editor.container.querySelector('#composer-subject-select').value).toBe('subj-math')
    expect(editor.container.querySelector('#btn-save-note').textContent).toBe('Actualizar')
    expect(editor.container.querySelector('#composer-draft-status').textContent).toBe('Cambios pendientes')
    expect(NoteStore.updateNote).not.toHaveBeenCalled()

    editor.destroy()
  })

  it('actualiza la nota original al guardar un borrador de edicion restaurado', async () => {
    let subscriber
    EditorDraftService.loadDraft.mockReturnValueOnce({
      version: 1,
      mode: 'edit',
      noteId: 'note-1',
      title: 'Resumen pendiente',
      content: 'Cambios sin actualizar',
      subjectId: 'subj-math',
      baseUpdatedAt: '2026-06-06T10:00:00.000Z',
      savedAt: '2026-06-07T03:00:00.000Z',
    })
    NoteStore.subscribe.mockImplementationOnce((callback) => {
      subscriber = callback
      return vi.fn()
    })

    const editor = createEditor()
    subscriber({
      activeNoteId: null,
      notes: [{
        id: 'note-1',
        title: 'Resumen original',
        content: 'Original',
        subjectId: 'subj-math',
        updatedAt: '2026-06-06T10:00:00.000Z',
      }],
      subjects: {
        tree: [{ id: 'subj-math', name: 'Matematica', color: '#60a5fa', children: [] }],
      },
      viewMode: 'inbox',
    })

    await editor.handleSave()

    expect(NoteStore.updateNote).toHaveBeenCalledWith('note-1', {
      title: 'Resumen pendiente',
      content: 'Cambios sin actualizar',
      subjectId: 'subj-math',
    })
    expect(NoteStore.createNote).not.toHaveBeenCalled()

    editor.destroy()
  })
})

describe('NoteEditor draft discard', () => {
  it('muestra indicador visual y accion de descarte al escribir una nota nueva', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = 'Borrador en progreso'
    input.dispatchEvent(new window.Event('input'))

    expect(editor.container.querySelector('.composer').classList.contains('composer--draft-pending')).toBe(true)
    expect(editor.container.querySelector('#composer-draft-actions').hidden).toBe(false)
    expect(editor.container.querySelector('#composer-draft-status').textContent).toBe('Borrador sin guardar')
    expect(editor.container.querySelector('#btn-discard-draft').textContent).toBe('Descartar')

    editor.destroy()
  })

  it('descarta una nota nueva luego de confirmar', async () => {
    const editor = createEditor()
    const titleInput = editor.container.querySelector('#composer-title-input')
    const input = editor.container.querySelector('#composer-input')

    titleInput.value = 'Clase temporal'
    titleInput.dispatchEvent(new window.Event('input'))
    input.value = 'Texto temporal'
    input.dispatchEvent(new window.Event('input'))

    await editor.handleDiscardDraft()

    expect(confirmDialog).toHaveBeenCalledWith({
      title: 'Descartar borrador',
      message: '¿Descartar este borrador?',
      confirmText: 'Descartar',
      cancelText: 'Conservar',
      danger: true,
    })
    expect(EditorDraftService.clearDraft).toHaveBeenCalled()
    expect(titleInput.value).toBe('')
    expect(input.value).toBe('')
    expect(editor.container.querySelector('#btn-save-note').disabled).toBe(true)
    expect(editor.container.querySelector('#composer-draft-actions').hidden).toBe(true)
    expect(editor.container.querySelector('.composer').classList.contains('composer--draft-pending')).toBe(false)
    expect(NoteStore.createNote).not.toHaveBeenCalled()

    editor.destroy()
  })

  it('conserva el borrador si el usuario cancela el descarte', async () => {
    confirmDialog.mockResolvedValueOnce(false)
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = 'No descartar'
    input.dispatchEvent(new window.Event('input'))

    await editor.handleDiscardDraft()

    expect(EditorDraftService.clearDraft).not.toHaveBeenCalled()
    expect(input.value).toBe('No descartar')
    expect(editor.container.querySelector('#composer-draft-actions').hidden).toBe(false)

    editor.destroy()
  })

  it('descarta cambios de edicion sin actualizar la nota original', async () => {
    let subscriber
    NoteStore.subscribe.mockImplementationOnce((callback) => {
      subscriber = callback
      return vi.fn()
    })

    const editor = createEditor()
    subscriber({
      activeNoteId: 'note-1',
      notes: [{
        id: 'note-1',
        title: 'Resumen original',
        content: 'Resumen original\n\nContenido original',
        subjectId: null,
        updatedAt: '2026-06-06T10:00:00.000Z',
      }],
      subjects: { tree: [] },
      viewMode: 'inbox',
    })

    const input = editor.container.querySelector('#composer-input')
    input.value = 'Cambio pendiente'
    input.dispatchEvent(new window.Event('input'))

    expect(editor.container.querySelector('#composer-draft-status').textContent).toBe('Cambios pendientes')
    expect(editor.container.querySelector('#btn-discard-draft').textContent).toBe('Descartar cambios')

    await editor.handleDiscardDraft()

    expect(EditorDraftService.clearDraft).toHaveBeenCalled()
    expect(NoteStore.updateNote).not.toHaveBeenCalled()
    expect(NoteStore.selectNote).toHaveBeenCalledWith(null)
    expect(editor.container.querySelector('#composer-title-input').value).toBe('')
    expect(editor.container.querySelector('#composer-input').value).toBe('')
    expect(editor.container.querySelector('#composer-draft-actions').hidden).toBe(true)

    editor.destroy()
  })
})

describe('NoteEditor draft cleanup on save', () => {
  it('limpia el borrador despues de guardar una nota nueva con exito', async () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = 'Apuntes listos'
    input.dispatchEvent(new window.Event('input'))

    await editor.handleSave()

    expect(EditorDraftService.saveDraft).toHaveBeenCalledWith({
      mode: 'create',
      noteId: null,
      title: '',
      content: 'Apuntes listos',
      subjectId: null,
      baseUpdatedAt: null,
    })
    expect(EditorDraftService.clearDraft).toHaveBeenCalled()
    expect(editor.container.querySelector('#composer-input').value).toBe('')
    expect(editor.container.querySelector('#composer-draft-actions').hidden).toBe(true)

    editor.destroy()
  })

  it('conserva el borrador si falla el guardado de una nota nueva', async () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')
    NoteStore.createNote.mockRejectedValueOnce(new Error('create failed'))

    input.value = 'Apuntes recuperables'
    input.dispatchEvent(new window.Event('input'))

    await expect(editor.handleSave()).rejects.toThrow('create failed')

    expect(EditorDraftService.saveDraft).toHaveBeenCalledWith({
      mode: 'create',
      noteId: null,
      title: '',
      content: 'Apuntes recuperables',
      subjectId: null,
      baseUpdatedAt: null,
    })
    expect(EditorDraftService.clearDraft).not.toHaveBeenCalled()
    expect(input.value).toBe('Apuntes recuperables')
    expect(editor.container.querySelector('#composer-draft-actions').hidden).toBe(false)

    editor.destroy()
  })

  it('limpia el borrador despues de actualizar una nota con exito', async () => {
    let subscriber
    NoteStore.subscribe.mockImplementationOnce((callback) => {
      subscriber = callback
      return vi.fn()
    })

    const editor = createEditor()
    subscriber({
      activeNoteId: 'note-1',
      notes: [{
        id: 'note-1',
        title: 'Resumen',
        content: 'Resumen\n\nCuerpo',
        subjectId: null,
        updatedAt: '2026-06-06T10:00:00.000Z',
      }],
      subjects: { tree: [] },
      viewMode: 'inbox',
    })

    const input = editor.container.querySelector('#composer-input')
    input.value = 'Cuerpo actualizado'
    input.dispatchEvent(new window.Event('input'))

    await editor.handleSave()

    expect(NoteStore.updateNote).toHaveBeenCalledWith('note-1', {
      title: 'Resumen',
      content: 'Cuerpo actualizado',
      subjectId: null,
    })
    expect(EditorDraftService.clearDraft).toHaveBeenCalled()
    expect(editor.container.querySelector('#composer-input').value).toBe('')

    editor.destroy()
  })

  it('conserva el borrador si falla la actualizacion de una nota', async () => {
    let subscriber
    NoteStore.updateNote.mockRejectedValueOnce(new Error('update failed'))
    NoteStore.subscribe.mockImplementationOnce((callback) => {
      subscriber = callback
      return vi.fn()
    })

    const editor = createEditor()
    subscriber({
      activeNoteId: 'note-1',
      notes: [{
        id: 'note-1',
        title: 'Resumen',
        content: 'Resumen\n\nCuerpo',
        subjectId: null,
        updatedAt: '2026-06-06T10:00:00.000Z',
      }],
      subjects: { tree: [] },
      viewMode: 'inbox',
    })

    const input = editor.container.querySelector('#composer-input')
    input.value = 'Cuerpo no guardado'
    input.dispatchEvent(new window.Event('input'))

    await expect(editor.handleSave()).rejects.toThrow('update failed')

    expect(EditorDraftService.saveDraft).toHaveBeenCalledWith({
      mode: 'edit',
      noteId: 'note-1',
      title: 'Resumen',
      content: 'Cuerpo no guardado',
      subjectId: null,
      baseUpdatedAt: '2026-06-06T10:00:00.000Z',
    })
    expect(EditorDraftService.clearDraft).not.toHaveBeenCalled()
    expect(input.value).toBe('Cuerpo no guardado')
    expect(editor.container.querySelector('#composer-draft-actions').hidden).toBe(false)

    editor.destroy()
  })
})

describe('NoteEditor draft edge cases', () => {
  it('fuerza guardado al cambiar a Backup sin perder el texto del editor', () => {
    let subscriber
    NoteStore.subscribe.mockImplementationOnce((callback) => {
      subscriber = callback
      return vi.fn()
    })

    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')
    input.value = 'Revisar antes de backup'
    input.dispatchEvent(new window.Event('input'))

    subscriber({
      activeNoteId: null,
      notes: [],
      notesLoaded: true,
      subjects: { tree: [] },
      viewMode: 'backup',
    })

    expect(EditorDraftService.saveDraft).toHaveBeenCalledWith({
      mode: 'create',
      noteId: null,
      title: '',
      content: 'Revisar antes de backup',
      subjectId: null,
      baseUpdatedAt: null,
    })
    expect(input.value).toBe('Revisar antes de backup')
    expect(editor.container.querySelector('.composer').style.display).toBe('none')

    editor.destroy()
  })

  it('convierte una edicion en borrador de creacion si la nota desaparece del store', async () => {
    let subscriber
    NoteStore.subscribe.mockImplementationOnce((callback) => {
      subscriber = callback
      return vi.fn()
    })

    const editor = createEditor()
    subscriber({
      activeNoteId: 'note-1',
      notes: [{
        id: 'note-1',
        title: 'Resumen',
        content: 'Resumen\n\nCuerpo',
        subjectId: null,
        updatedAt: '2026-06-06T10:00:00.000Z',
      }],
      notesLoaded: true,
      subjects: { tree: [] },
      viewMode: 'inbox',
    })

    const input = editor.container.querySelector('#composer-input')
    input.value = 'Cambio pendiente'
    input.dispatchEvent(new window.Event('input'))

    subscriber({
      activeNoteId: null,
      notes: [],
      notesLoaded: true,
      subjects: { tree: [] },
      viewMode: 'inbox',
    })

    expect(EditorDraftService.saveDraft).toHaveBeenCalledWith({
      mode: 'edit',
      noteId: 'note-1',
      title: 'Resumen',
      content: 'Cambio pendiente',
      subjectId: null,
      baseUpdatedAt: '2026-06-06T10:00:00.000Z',
    })
    expect(input.value).toBe('Cambio pendiente')
    expect(editor.container.querySelector('#btn-save-note').textContent).toBe('Guardar')
    expect(editor.container.querySelector('#composer-draft-status').textContent).toBe('Borrador recuperado')

    await editor.handleSave()

    expect(NoteStore.createNote).toHaveBeenCalledWith('Resumen', 'Cambio pendiente', null)
    expect(NoteStore.updateNote).not.toHaveBeenCalled()

    editor.destroy()
  })

  it('restaura como creacion un borrador de edicion cuyo noteId ya no existe', () => {
    let subscriber
    EditorDraftService.loadDraft.mockReturnValueOnce({
      version: 1,
      mode: 'edit',
      noteId: 'missing-note',
      title: 'Apunte rescatado',
      content: 'Texto pendiente',
      subjectId: null,
      baseUpdatedAt: '2026-06-06T10:00:00.000Z',
      savedAt: '2026-06-07T03:00:00.000Z',
    })
    NoteStore.subscribe.mockImplementationOnce((callback) => {
      subscriber = callback
      return vi.fn()
    })

    const editor = createEditor()
    subscriber({
      activeNoteId: null,
      notes: [],
      notesLoaded: true,
      subjects: { tree: [] },
      viewMode: 'inbox',
    })

    expect(editor.container.querySelector('#composer-title-input').value).toBe('Apunte rescatado')
    expect(editor.container.querySelector('#composer-input').value).toBe('Texto pendiente')
    expect(editor.container.querySelector('#btn-save-note').textContent).toBe('Guardar')
    expect(editor.container.querySelector('#composer-draft-status').textContent).toBe('Borrador recuperado')
    expect(NoteStore.updateNote).not.toHaveBeenCalled()

    editor.destroy()
  })

  it('mantiene el borrador al entrar y salir de Modo Enfoque', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = 'Escritura en foco'
    input.dispatchEvent(new window.Event('input'))
    editor.enterFocusMode()
    editor.exitFocusMode()
    window.dispatchEvent(new window.Event('pagehide'))

    expect(editor.container.querySelector('.composer').classList.contains('composer--focus')).toBe(false)
    expect(input.value).toBe('Escritura en foco')
    expect(EditorDraftService.saveDraft).toHaveBeenCalledWith({
      mode: 'create',
      noteId: null,
      title: '',
      content: 'Escritura en foco',
      subjectId: null,
      baseUpdatedAt: null,
    })

    editor.destroy()
  })

  it('guarda borrador con solo titulo y no crea nota automaticamente', () => {
    vi.useFakeTimers()
    const editor = createEditor()
    const titleInput = editor.container.querySelector('#composer-title-input')

    titleInput.value = 'Solo titulo'
    titleInput.dispatchEvent(new window.Event('input'))
    vi.advanceTimersByTime(500)

    expect(EditorDraftService.saveDraft).toHaveBeenCalledWith({
      mode: 'create',
      noteId: null,
      title: 'Solo titulo',
      content: '',
      subjectId: null,
      baseUpdatedAt: null,
    })
    expect(NoteStore.createNote).not.toHaveBeenCalled()

    editor.destroy()
  })

  it('guarda borrador con solo cuerpo y no crea nota automaticamente', () => {
    vi.useFakeTimers()
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = 'Solo cuerpo'
    input.dispatchEvent(new window.Event('input'))
    vi.advanceTimersByTime(500)

    expect(EditorDraftService.saveDraft).toHaveBeenCalledWith({
      mode: 'create',
      noteId: null,
      title: '',
      content: 'Solo cuerpo',
      subjectId: null,
      baseUpdatedAt: null,
    })
    expect(NoteStore.createNote).not.toHaveBeenCalled()

    editor.destroy()
  })

  it('preserva un cuerpo pegado con encabezado y lo normaliza recien al guardar', async () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = '# Algebra lineal\n\nMatrices'
    input.dispatchEvent(new window.Event('input'))
    window.dispatchEvent(new window.Event('pagehide'))

    expect(EditorDraftService.saveDraft).toHaveBeenCalledWith({
      mode: 'create',
      noteId: null,
      title: '',
      content: '# Algebra lineal\n\nMatrices',
      subjectId: null,
      baseUpdatedAt: null,
    })

    await editor.handleSave()

    expect(NoteStore.createNote).toHaveBeenCalledWith('Algebra lineal', 'Matrices', null)

    editor.destroy()
  })
})

describe('NoteEditor insert menu', () => {
  it('ordena las acciones como Entrada, +, Aa y Modo Enfoque', () => {
    const editor = createEditor()
    const ids = [...editor.container.querySelector('.composer__tools').children]
      .map(element => element.id)

    expect(ids).toEqual([
      'composer-subject-picker',
      'composer-plus-btn',
      'composer-format-btn',
      'composer-focus-btn',
    ])

    editor.destroy()
  })

  it('muestra iconos y pistas Markdown en lugar de descripciones redundantes', () => {
    const editor = createEditor()

    editor.container.querySelector('#composer-plus-btn').click()
    const headingItem = findPopupItem(editor.container, 'Encabezado 1')

    expect(headingItem.querySelector('.editor-popup__icon-text').textContent).toBe('H1')
    expect(headingItem.querySelector('.editor-popup__hint-key').textContent).toBe('#')
    expect(headingItem.querySelector('.editor-popup__desc')).toBeNull()

    editor.destroy()
  })

  it('usa el registry del editor para insertar callouts desde el boton +', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = 'Repaso\n'
    input.setSelectionRange(input.value.length, input.value.length)
    editor.container.querySelector('#composer-plus-btn').click()
    findPopupItem(editor.container, 'Importante').click()

    expect(input.value).toBe('Repaso\n> [!important]\n> ')
    expect(input.selectionStart).toBe(input.value.length)

    editor.destroy()
  })

  it('mantiene los menus de la toolbar disponibles en modo enfoque', () => {
    const editor = createEditor()

    editor.enterFocusMode()
    editor.container.querySelector('#composer-plus-btn').click()
    expect(findPopupItem(editor.container, 'Importante')).not.toBeUndefined()
    expect(editor.container.querySelector('.editor-popup').parentElement)
      .toBe(editor.container.querySelector('.composer__footer'))

    editor.container.querySelector('#composer-format-btn').click()
    expect(findPopupItem(editor.container, 'Negrita')).not.toBeUndefined()

    editor.updateSubjectSelect({
      tree: [{ id: 'subj-math', name: 'Matematica', color: '#60a5fa', children: [] }],
    })
    editor.container.querySelector('#composer-subject-trigger').click()
    expect(editor.container.querySelector('#composer-subject-menu').hidden).toBe(false)

    editor.exitFocusMode()
    editor.destroy()
  })

  it('cierra el menu + al tocar el boton de nuevo', () => {
    vi.useFakeTimers()
    let editor
    try {
      editor = createEditor()
      const plusBtn = editor.container.querySelector('#composer-plus-btn')

      plusBtn.dispatchEvent(new window.Event('pointerdown', { bubbles: true }))
      plusBtn.click()
      vi.advanceTimersByTime(60)
      expect(findPopupItem(editor.container, 'Importante')).not.toBeUndefined()

      plusBtn.dispatchEvent(new window.Event('pointerdown', { bubbles: true }))
      plusBtn.click()
      expect(editor.container.querySelector('.editor-popup__item')).toBeNull()
    } finally {
      editor?.destroy()
      vi.useRealTimers()
    }
  })

  it('usa un boton dedicado para Modo Enfoque fuera del menu +', () => {
    const editor = createEditor()

    editor.container.querySelector('#composer-plus-btn').click()
    expect(findPopupItem(editor.container, 'Modo Enfoque')).toBeUndefined()

    editor.container.querySelector('#composer-focus-btn').click()

    expect(editor.container.querySelector('.composer').classList.contains('composer--focus')).toBe(true)
    expect(document.body.classList.contains('focus-mode-active')).toBe(true)

    editor.exitFocusMode()
    editor.destroy()
  })
})

describe('NoteEditor inline format menu', () => {
  it('cierra el menu Aa al tocar el boton de nuevo', () => {
    vi.useFakeTimers()
    let editor
    try {
      editor = createEditor()
      const formatBtn = editor.container.querySelector('#composer-format-btn')

      formatBtn.dispatchEvent(new window.Event('pointerdown', { bubbles: true }))
      formatBtn.click()
      vi.advanceTimersByTime(60)
      expect(findPopupItem(editor.container, 'Negrita')).not.toBeUndefined()

      formatBtn.dispatchEvent(new window.Event('pointerdown', { bubbles: true }))
      formatBtn.click()
      expect(editor.container.querySelector('.editor-popup__item')).toBeNull()
    } finally {
      editor?.destroy()
      vi.useRealTimers()
    }
  })

  it('envuelve seleccion con negrita desde el boton Aa', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = 'parcial'
    input.setSelectionRange(0, input.value.length)
    editor.container.querySelector('#composer-format-btn').click()
    findPopupItem(editor.container, 'Negrita').click()

    expect(input.value).toBe('**parcial**')
    expect(input.selectionStart).toBe(2)
    expect(input.selectionEnd).toBe(9)

    editor.destroy()
  })

  it('inserta placeholder seleccionado cuando no hay seleccion', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = 'hola '
    input.setSelectionRange(input.value.length, input.value.length)
    editor.container.querySelector('#composer-format-btn').click()
    findPopupItem(editor.container, 'Cursiva').click()

    expect(input.value).toBe('hola *texto*')
    expect(input.selectionStart).toBe(6)
    expect(input.selectionEnd).toBe(11)

    editor.destroy()
  })

  it('selecciona url al crear link desde texto seleccionado', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = 'web'
    input.setSelectionRange(0, input.value.length)
    editor.container.querySelector('#composer-format-btn').click()
    findPopupItem(editor.container, 'Link').click()

    expect(input.value).toBe('[web](url)')
    expect(input.selectionStart).toBe(6)
    expect(input.selectionEnd).toBe(9)

    editor.destroy()
  })

  it('selecciona texto al crear link sin seleccion', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.setSelectionRange(0, 0)
    editor.container.querySelector('#composer-format-btn').click()
    findPopupItem(editor.container, 'Link').click()

    expect(input.value).toBe('[texto](url)')
    expect(input.selectionStart).toBe(1)
    expect(input.selectionEnd).toBe(6)

    editor.destroy()
  })

  it('usa backticks para codigo inline', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = 'const x'
    input.setSelectionRange(0, input.value.length)
    editor.container.querySelector('#composer-format-btn').click()
    findPopupItem(editor.container, 'Codigo inline').click()

    expect(input.value).toBe('`const x`')
    expect(input.selectionStart).toBe(1)
    expect(input.selectionEnd).toBe(8)

    editor.destroy()
  })
})

describe('NoteEditor Markdown list continuation', () => {
  it('continua vinetas con Enter y sale con Enter sobre item vacio', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = '- repasar matrices'
    input.setSelectionRange(input.value.length, input.value.length)

    const firstEnter = pressEnter(input)

    expect(firstEnter.defaultPrevented).toBe(true)
    expect(input.value).toBe('- repasar matrices\n- ')
    expect(input.selectionStart).toBe(input.value.length)

    const secondEnter = pressEnter(input)

    expect(secondEnter.defaultPrevented).toBe(true)
    expect(input.value).toBe('- repasar matrices\n')
    expect(input.selectionStart).toBe(input.value.length)

    editor.destroy()
  })

  it('continua listas numeradas incrementando el numero', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = '1. leer capitulo'
    input.setSelectionRange(input.value.length, input.value.length)

    pressEnter(input)

    expect(input.value).toBe('1. leer capitulo\n2. ')
    expect(input.selectionStart).toBe(input.value.length)

    editor.destroy()
  })

  it('sale de lista numerada con Enter sobre item vacio', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = '1. leer capitulo\n2. '
    input.setSelectionRange(input.value.length, input.value.length)

    pressEnter(input)

    expect(input.value).toBe('1. leer capitulo\n')
    expect(input.selectionStart).toBe(input.value.length)

    editor.destroy()
  })

  it('mantiene tareas como checkbox pendiente al continuar', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = '- [x] entregar TP'
    input.setSelectionRange(input.value.length, input.value.length)

    pressEnter(input)

    expect(input.value).toBe('- [x] entregar TP\n- [ ] ')
    expect(input.selectionStart).toBe(input.value.length)

    editor.destroy()
  })

  it('continua callouts y sale con Enter sobre linea vacia', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = '> [!warning]\n> esta es una advertencia'
    input.setSelectionRange(input.value.length, input.value.length)

    const firstEnter = pressEnter(input)

    expect(firstEnter.defaultPrevented).toBe(true)
    expect(input.value).toBe('> [!warning]\n> esta es una advertencia\n> ')
    expect(input.selectionStart).toBe(input.value.length)

    const secondEnter = pressEnter(input)

    expect(secondEnter.defaultPrevented).toBe(true)
    expect(input.value).toBe('> [!warning]\n> esta es una advertencia\n')
    expect(input.selectionStart).toBe(input.value.length)

    editor.destroy()
  })

  it('continua blockquotes simples con el prefijo >', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = '> cita de clase'
    input.setSelectionRange(input.value.length, input.value.length)

    pressEnter(input)

    expect(input.value).toBe('> cita de clase\n> ')
    expect(input.selectionStart).toBe(input.value.length)

    editor.destroy()
  })

  it('no intercepta Enter en texto normal', () => {
    const editor = createEditor()
    const input = editor.container.querySelector('#composer-input')

    input.value = 'texto normal'
    input.setSelectionRange(input.value.length, input.value.length)

    const event = pressEnter(input)

    expect(event.defaultPrevented).toBe(false)
    expect(input.value).toBe('texto normal')

    editor.destroy()
  })
})
