/* global document, localStorage */

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { initSubjects } from '../../../src/layout/drawerSubjects.js'
import { DRAWER_SUBJECT_COLLAPSE_STORAGE_KEY } from '../../../src/layout/drawerSubjectCollapseState.js'

const SUBJECT_COLORS = ['#818cf8', '#22c55e']

function makeSubjectsData() {
  return {
    inboxCount: 2,
    tree: [
      {
        id: 'subj-1',
        name: 'Programacion',
        color: '#818cf8',
        noteCount: 3,
        children: [
          {
            id: 'sec-1',
            name: 'Unidad 1',
            color: '#818cf8',
            noteCount: 1,
          },
        ],
      },
      {
        id: 'subj-2',
        name: 'Algebra',
        color: '#22c55e',
        noteCount: 0,
        children: [],
      },
    ],
  }
}

function mountDrawerDom() {
  document.body.innerHTML = `
    <button id="btn-inbox" class="drawer__subject-btn drawer__subject-btn--active">
      <span id="inbox-count"></span>
    </button>
    <button id="btn-add-subject"></button>
    <div id="subject-form-container" style="display:none">
      <input id="subject-name-input">
      <div id="subject-color-picker"></div>
      <button id="btn-subject-cancel"></button>
      <button id="btn-subject-save"></button>
    </div>
    <div id="subjects-list"></div>
  `
}

function setupSubjectsDrawer({ stateOverrides = {}, subjectsData = makeSubjectsData() } = {}) {
  mountDrawerDom()

  const currentState = {
    viewMode: 'inbox',
    activeSubjectId: null,
    archivedSubjects: null,
    subjects: subjectsData,
    ...stateOverrides,
  }
  const NoteStore = {
    getState: vi.fn(() => currentState),
    setActiveSubject: vi.fn((subjectId) => {
      currentState.activeSubjectId = subjectId
      currentState.viewMode = subjectId ? 'subject' : 'inbox'
    }),
    createSubject: vi.fn().mockResolvedValue({ id: 'new-section' }),
    updateSubject: vi.fn().mockResolvedValue(undefined),
    archiveSubject: vi.fn().mockResolvedValue(undefined),
    archiveSection: vi.fn().mockResolvedValue(undefined),
    deleteSubject: vi.fn().mockResolvedValue(undefined),
    deleteSection: vi.fn().mockResolvedValue(undefined),
  }
  const closeDrawer = vi.fn()
  const resetArchived = vi.fn()
  const api = initSubjects({
    NoteStore,
    SUBJECT_COLORS,
    closeDrawer,
    getShowingArchived: () => false,
    resetArchived,
  })
  api.renderSubjects(subjectsData)

  return {
    api,
    closeDrawer,
    currentState,
    NoteStore,
    resetArchived,
    subjectsList: document.getElementById('subjects-list'),
  }
}

function getStoredCollapsedIds() {
  const rawValue = localStorage.getItem(DRAWER_SUBJECT_COLLAPSE_STORAGE_KEY)
  return rawValue ? JSON.parse(rawValue) : null
}

beforeEach(() => {
  localStorage.clear()
})

describe('drawerSubjects collapse', () => {
  it('renderiza flecha solo en materias con secciones', () => {
    const { subjectsList } = setupSubjectsDrawer()

    const collapseButtons = subjectsList.querySelectorAll('.js-subject-collapse')

    expect(collapseButtons).toHaveLength(1)
    expect(collapseButtons[0].dataset.subject).toBe('subj-1')
    expect(collapseButtons[0].getAttribute('aria-expanded')).toBe('true')
    expect(subjectsList.querySelector('[data-subject="sec-1"]')).not.toBeNull()
    expect(subjectsList.querySelector('[data-subject="subj-2"]')?.parentElement.querySelector('.js-subject-collapse')).toBeNull()
  })

  it('renderiza contador agregado en materia y contador propio en sección', () => {
    const { subjectsList } = setupSubjectsDrawer()

    expect(subjectsList.querySelector('[data-subject="subj-1"] .drawer__subject-count').textContent).toBe('3')
    expect(subjectsList.querySelector('[data-subject="sec-1"] .drawer__subject-count').textContent).toBe('1')
  })

  it('colapsa y expande secciones persistiendo la preferencia local', () => {
    const { subjectsList } = setupSubjectsDrawer()

    subjectsList.querySelector('.js-subject-collapse').click()

    expect(getStoredCollapsedIds()).toEqual(['subj-1'])
    expect(subjectsList.querySelector('.js-subject-collapse').getAttribute('aria-expanded')).toBe('false')
    expect(subjectsList.querySelector('[data-subject="sec-1"]')).toBeNull()

    subjectsList.querySelector('.js-subject-collapse').click()

    expect(getStoredCollapsedIds()).toBeNull()
    expect(subjectsList.querySelector('.js-subject-collapse').getAttribute('aria-expanded')).toBe('true')
    expect(subjectsList.querySelector('[data-subject="sec-1"]')).not.toBeNull()
  })

  it('respeta materias previamente colapsadas en localStorage', () => {
    localStorage.setItem(DRAWER_SUBJECT_COLLAPSE_STORAGE_KEY, JSON.stringify(['subj-1']))

    const { subjectsList } = setupSubjectsDrawer()

    expect(subjectsList.querySelector('.js-subject-collapse').getAttribute('aria-expanded')).toBe('false')
    expect(subjectsList.querySelector('[data-subject="sec-1"]')).toBeNull()
  })

  it('no navega cuando se toca la flecha de colapsar', () => {
    const { closeDrawer, NoteStore, resetArchived, subjectsList } = setupSubjectsDrawer()

    subjectsList.querySelector('.js-subject-collapse').click()

    expect(NoteStore.setActiveSubject).not.toHaveBeenCalled()
    expect(resetArchived).not.toHaveBeenCalled()
    expect(closeDrawer).not.toHaveBeenCalled()
  })

  it('expande automaticamente una materia colapsada cuando su seccion esta activa', () => {
    localStorage.setItem(DRAWER_SUBJECT_COLLAPSE_STORAGE_KEY, JSON.stringify(['subj-1']))

    const { subjectsList } = setupSubjectsDrawer({
      stateOverrides: {
        activeSubjectId: 'sec-1',
        viewMode: 'subject',
      },
    })

    expect(getStoredCollapsedIds()).toBeNull()
    expect(subjectsList.querySelector('.js-subject-collapse').getAttribute('aria-expanded')).toBe('true')
    expect(subjectsList.querySelector('[data-subject="sec-1"]')).not.toBeNull()
  })

  it('expande la materia padre al abrir el formulario para crear una seccion', () => {
    localStorage.setItem(DRAWER_SUBJECT_COLLAPSE_STORAGE_KEY, JSON.stringify(['subj-1']))

    const { subjectsList } = setupSubjectsDrawer()

    subjectsList.querySelector('.js-btn-add-section').click()

    expect(getStoredCollapsedIds()).toBeNull()
    expect(subjectsList.querySelector('[data-subject="sec-1"]')).not.toBeNull()
    expect(subjectsList.querySelector('#section-form-subj-1').style.display).toBe('block')
  })

  it('crea una seccion manteniendo expandida la materia padre', async () => {
    localStorage.setItem(DRAWER_SUBJECT_COLLAPSE_STORAGE_KEY, JSON.stringify(['subj-1']))
    const { NoteStore, subjectsList } = setupSubjectsDrawer()

    subjectsList.querySelector('.js-btn-add-section').click()
    subjectsList.querySelector('.js-section-name-input').value = 'Practica'
    subjectsList.querySelector('.js-btn-section-save').click()
    await Promise.resolve()
    await Promise.resolve()

    expect(NoteStore.createSubject).toHaveBeenCalledWith('Practica', '#818cf8', 'subj-1')
    expect(getStoredCollapsedIds()).toBeNull()
  })
})
