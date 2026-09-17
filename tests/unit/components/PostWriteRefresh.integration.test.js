import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  academicInput,
  failSubjectRefreshAfterInsert,
  failUpcomingRead,
  postWriteRefreshHarness,
} from '../store/postWriteRefreshHarness.js'

// UI real -> store real -> servicios/coordinador reales -> SQLite en memoria.
// No son mocks exitosos del store ni evidencia de un teléfono Android.
let harness, editor, upcoming, Drafts, NoteEditor, openDialog, cleanups, errors, warnings, errorLog, scroll

beforeEach(async () => {
  document.body.innerHTML = '<div id="editor"></div><div id="upcoming"></div>'
  localStorage.clear()
  scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  harness = await postWriteRefreshHarness()
  Drafts = await import('../../../src/services/EditorDraftService.ts')
  ;({ NoteEditor } = await import('../../../src/components/note-editor/NoteEditor.js'))
  ;({ openAcademicEventDialog: openDialog } = await import('../../../src/components/academic-events/AcademicEventDialog.js'))
  const { UpcomingAcademicEvents } = await import('../../../src/components/academic-events/UpcomingAcademicEvents.js')
  const { showErrorToast, showPendingRefreshToast } = await import('../../../src/components/common/Toast.js')
  errors = []
  warnings = []
  cleanups = [
    harness.store.subscribeToStoreErrors(event => { errors.push(event); showErrorToast(event.message) }),
    harness.store.subscribeToPendingRefreshes(event => { warnings.push(event); showPendingRefreshToast(event) }),
  ]
  upcoming = new UpcomingAcademicEvents('upcoming')
  errorLog = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  editor?.destroy()
  editor = null
  upcoming?.destroy()
  cleanups?.forEach(unsubscribe => unsubscribe())
  harness?.fixture.close()
  errorLog?.mockRestore()
  scroll?.mockRestore()
  localStorage.clear()
  document.body.innerHTML = ''
})

function fillEditor() {
  editor = new NoteEditor(document.getElementById('editor'))
  const title = editor.container.querySelector('#composer-title-input')
  const input = editor.container.querySelector('#composer-input')
  title.value = 'PP3'
  input.value = 'Contenido que debe persistirse una sola vez'
  input.dispatchEvent(new window.Event('input'))
  return { title, input, save: editor.container.querySelector('#btn-save-note') }
}

function rows(table) {
  return harness.fixture.database.exec(`SELECT id FROM ${table}`)[0]?.values || []
}

function submitDialog() {
  document.querySelector('.academic-event-dialog__form')
    .dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }))
}

async function mountSubjectsDrawer() {
  document.body.insertAdjacentHTML('beforeend', `
    <button id="btn-inbox"><span id="inbox-count"></span></button>
    <button id="btn-add-subject"></button>
    <div id="subject-form-container" style="display:none">
      <input id="subject-name-input">
      <div id="subject-color-picker"></div>
      <button id="btn-subject-cancel"></button>
      <button id="btn-subject-save"></button>
    </div>
    <div id="subjects-list"></div>
  `)
  const { initSubjects } = await import('../../../src/layout/drawerSubjects.js')
  const drawer = initSubjects({
    NoteStore: harness.store,
    SUBJECT_COLORS: ['#818cf8', '#22c55e'],
    closeDrawer: vi.fn(),
    getShowingArchived: () => false,
    resetArchived: vi.fn(),
  })
  drawer.renderSubjects(harness.state.subjects)
  return drawer
}

describe('drawerSubjects con SQLite', () => {
  it('finaliza una materia confirmada y recupera el árbol sin repetir INSERT', async () => {
    await mountSubjectsDrawer()
    failSubjectRefreshAfterInsert(harness.db)
    document.getElementById('btn-add-subject').click()
    document.getElementById('subject-name-input').value = 'Programación III'
    document.getElementById('btn-subject-save').click()

    await vi.waitFor(() => expect(document.getElementById('subject-form-container').style.display).toBe('none'))
    expect(rows('subjects')).toHaveLength(1)
    expect(errors).toHaveLength(0)
    expect(warnings).toHaveLength(1)
    expect(document.querySelector('.toast--pending-refresh').textContent).toContain('Materia creada.')

    document.querySelector('.toast--pending-refresh button').click()
    await vi.waitFor(() => expect(document.querySelector('.toast--pending-refresh')).toBeNull())
    expect(harness.state.subjects.tree).toHaveLength(1)
    expect(harness.db.run.mock.calls.filter(([sql]) => sql.includes('INSERT INTO subjects'))).toHaveLength(1)
  })

  it('finaliza una sección confirmada y conserva su relación sin repetir INSERT', async () => {
    const root = await harness.store.createSubject('Programación III', '#818cf8')
    harness.db.run.mockClear()
    await mountSubjectsDrawer()
    document.querySelector('.js-btn-add-section').click()
    document.querySelector('.js-section-name-input').value = 'Práctica'
    failSubjectRefreshAfterInsert(harness.db)
    document.querySelector('.js-btn-section-save').click()

    await vi.waitFor(() => expect(document.querySelector('.drawer__section-form').style.display).toBe('none'))
    const persisted = harness.fixture.database.exec(
      'SELECT name, color, parentSubjectId FROM subjects WHERE parentSubjectId IS NOT NULL',
    )[0]?.values
    expect(persisted).toEqual([['Práctica', '#818cf8', root.id]])
    expect(errors).toHaveLength(0)
    expect(warnings).toHaveLength(1)
    expect(document.querySelector('.toast--pending-refresh').textContent).toContain('Sección creada.')

    document.querySelector('.toast--pending-refresh button').click()
    await vi.waitFor(() => expect(document.querySelector('.toast--pending-refresh')).toBeNull())
    expect(harness.state.subjects.tree[0].children).toHaveLength(1)
    expect(harness.db.run.mock.calls.filter(([sql]) => sql.includes('INSERT INTO subjects'))).toHaveLength(1)
  })
})

describe('NoteEditor con SQLite', () => {
  it.each([false, true])('completa el formulario y descarta el borrador tras confirmar (refresco fallido: %s)', async (failRefresh) => {
    const { input, title, save } = fillEditor()
    if (failRefresh) harness.db.query.mockRejectedValueOnce(new Error('conteos pendientes'))
    const saving = editor.handleSave()
    await editor.handleSave()
    await saving

    const [note] = harness.state.notes
    expect(rows('notes')).toEqual([[note.id]])
    expect(input.value).toBe('')
    expect(title.value).toBe('')
    expect(save.disabled).toBe(true)
    expect(Drafts.loadDraft()).toBeNull()
    expect(errors).toHaveLength(0)
    expect(warnings).toHaveLength(failRefresh ? 1 : 0)
    await editor.handleSave()
    expect(rows('notes')).toEqual([[note.id]])

    if (failRefresh) {
      expect(document.querySelector('.toast--pending-refresh').textContent).toContain('Nota guardada.')
      expect(harness.state.subjects.inboxCount).toBe(0)
      document.querySelector('.toast--pending-refresh button').click()
      await vi.waitFor(() => expect(document.querySelector('.toast--pending-refresh')).toBeNull())
    }
    expect(harness.state.subjects.inboxCount).toBe(1)
    expect(harness.db.run).toHaveBeenCalledTimes(1)
    editor.destroy()
    editor = new NoteEditor(document.getElementById('editor'))
    expect(editor.container.querySelector('#composer-input').value).toBe('')
    await harness.store.loadNotes()
    expect(harness.state.notes.map(note => note.id)).toEqual([note.id])
  })

  it('mantiene borrador y formulario si falla INSERT y permite un reintento legítimo', async () => {
    const { title, input, save } = fillEditor()
    harness.db.run.mockRejectedValueOnce(new Error('fallo de inserción'))
    await expect(editor.handleSave()).rejects.toThrow('fallo de inserción')
    expect(rows('notes')).toEqual([])
    expect(title.value).toBe('PP3')
    expect(input.value).toBe('Contenido que debe persistirse una sola vez')
    expect(Drafts.loadDraft()).toMatchObject({ title: title.value, content: input.value, mode: 'create' })
    expect(save.disabled).toBe(false)
    expect(editor.isSaving).toBe(false)
    expect(warnings).toHaveLength(0)
    expect(errors).toHaveLength(1)
    expect(document.querySelectorAll('.toast--error')).toHaveLength(1)

    await editor.handleSave()
    expect(rows('notes')).toHaveLength(1)
    expect(Drafts.loadDraft()).toBeNull()
    expect(save.disabled).toBe(true)
  })
})

describe('AcademicEventDialog con SQLite', () => {
  it.each([false, true])('cierra con la entidad persistida sin duplicados (refresco fallido: %s)', async (failRefresh) => {
    const restore = failRefresh ? failUpcomingRead(harness.db) : () => {}
    const dialog = openDialog({ date: academicInput.date, type: academicInput.type })
    document.querySelector('input[name="title"]').value = academicInput.title
    submitDialog()
    submitDialog()
    await vi.waitFor(() => expect(document.querySelector('.academic-event-dialog-backdrop--leaving')).not.toBeNull())
    submitDialog()
    const event = await dialog

    expect(rows('academic_events')).toEqual([[event.id]])
    expect(event).toMatchObject(academicInput)
    expect(document.querySelector('.academic-event-dialog-backdrop')).toBeNull()
    expect(errors).toHaveLength(0)
    expect(warnings).toHaveLength(failRefresh ? 1 : 0)

    if (failRefresh) {
      expect(document.getElementById('upcoming').hidden).toBe(true)
      const button = document.querySelector('.toast--pending-refresh button')
      expect(button.parentElement.parentElement.textContent).toContain('Fecha académica guardada.')
      button.click()
      await vi.waitFor(() => expect(button.disabled).toBe(false))
      expect(document.querySelectorAll('.toast--pending-refresh')).toHaveLength(1)
      expect(rows('academic_events')).toEqual([[event.id]])
      restore()
      button.click()
      button.dispatchEvent(new window.MouseEvent('click'))
      await vi.waitFor(() => expect(document.querySelector('.toast--pending-refresh')).toBeNull())
    }

    expect(document.getElementById('upcoming').hidden).toBe(false)
    expect(document.getElementById('upcoming').textContent).toContain(academicInput.title)
    expect(harness.state.upcomingAcademicEvents.map(item => item.id)).toEqual([event.id])
    expect(harness.db.run).toHaveBeenCalledTimes(1)
    expect(warnings).toHaveLength(failRefresh ? 1 : 0)
  })

  it('no cierra ni pierde datos tras fallar INSERT y recupera el guardado legítimo', async () => {
    harness.db.run.mockRejectedValueOnce(new Error('fallo de inserción'))
    const dialog = openDialog({ date: academicInput.date, type: academicInput.type })
    document.querySelector('input[name="title"]').value = academicInput.title
    submitDialog()
    const save = document.querySelector('.academic-event-dialog__btn--save')
    await vi.waitFor(() => expect(save.disabled).toBe(false))
    expect(rows('academic_events')).toEqual([])
    expect(document.querySelector('input[name="title"]').value).toBe(academicInput.title)
    expect(document.querySelector('input[name="date"]').value).toBe(academicInput.date)
    expect(document.querySelector('.academic-event-dialog__btn--cancel').disabled).toBe(false)
    expect(document.querySelector('.academic-event-dialog__error').hidden).toBe(true)
    expect(document.querySelectorAll('.toast--error')).toHaveLength(1)
    expect(errors).toHaveLength(1)
    expect(warnings).toHaveLength(0)

    submitDialog()
    const event = await dialog
    expect(rows('academic_events')).toEqual([[event.id]])
    expect(document.querySelector('.academic-event-dialog-backdrop')).toBeNull()
  })
})
