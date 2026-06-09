import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  DRAWER_SUBJECT_COLLAPSE_STORAGE_KEY,
  isSubjectCollapsed,
  readCollapsedSubjectIds,
  setSubjectCollapsed,
  toggleSubjectCollapsed,
  writeCollapsedSubjectIds,
} from '../../../src/layout/drawerSubjectCollapseState.js'

function setStoredValue(value) {
  localStorage.setItem(DRAWER_SUBJECT_COLLAPSE_STORAGE_KEY, JSON.stringify(value))
}

beforeEach(() => {
  localStorage.clear()
  vi.unstubAllGlobals()
})

describe('drawerSubjectCollapseState', () => {
  it('usa vista expandida por defecto cuando no hay preferencia guardada', () => {
    expect(readCollapsedSubjectIds()).toEqual(new Set())
    expect(isSubjectCollapsed('subj-1')).toBe(false)
  })

  it('lee ids colapsados desde localStorage normalizados y ordenados', () => {
    setStoredValue([' subj-2 ', '', 'subj-1', 'subj-1'])

    expect([...readCollapsedSubjectIds()]).toEqual(['subj-1', 'subj-2'])
  })

  it('ignora payloads corruptos o invalidos sin romper la app', () => {
    localStorage.setItem(DRAWER_SUBJECT_COLLAPSE_STORAGE_KEY, '{bad-json')

    expect(readCollapsedSubjectIds()).toEqual(new Set())

    localStorage.setItem(DRAWER_SUBJECT_COLLAPSE_STORAGE_KEY, JSON.stringify({ id: 'subj-1' }))

    expect(readCollapsedSubjectIds()).toEqual(new Set())
  })

  it('escribe ids colapsados normalizados', () => {
    const saved = writeCollapsedSubjectIds(new Set(['subj-2', ' ', 'subj-1', 'subj-2']))

    expect(saved).toBe(true)
    expect(localStorage.getItem(DRAWER_SUBJECT_COLLAPSE_STORAGE_KEY)).toBe(JSON.stringify(['subj-1', 'subj-2']))
  })

  it('elimina la preferencia cuando no quedan materias colapsadas', () => {
    setStoredValue(['subj-1'])

    expect(writeCollapsedSubjectIds(new Set())).toBe(true)
    expect(localStorage.getItem(DRAWER_SUBJECT_COLLAPSE_STORAGE_KEY)).toBeNull()
  })

  it('colapsa y expande una materia especifica', () => {
    let collapsedIds = setSubjectCollapsed('subj-1', true)

    expect(isSubjectCollapsed('subj-1', collapsedIds)).toBe(true)
    expect(localStorage.getItem(DRAWER_SUBJECT_COLLAPSE_STORAGE_KEY)).toBe(JSON.stringify(['subj-1']))

    collapsedIds = setSubjectCollapsed('subj-1', false, collapsedIds)

    expect(isSubjectCollapsed('subj-1', collapsedIds)).toBe(false)
    expect(localStorage.getItem(DRAWER_SUBJECT_COLLAPSE_STORAGE_KEY)).toBeNull()
  })

  it('alterna una materia manteniendo las demas preferencias', () => {
    setStoredValue(['subj-1'])

    let collapsedIds = toggleSubjectCollapsed('subj-2')

    expect([...collapsedIds]).toEqual(['subj-1', 'subj-2'])
    expect(localStorage.getItem(DRAWER_SUBJECT_COLLAPSE_STORAGE_KEY)).toBe(JSON.stringify(['subj-1', 'subj-2']))

    collapsedIds = toggleSubjectCollapsed('subj-1', collapsedIds)

    expect([...collapsedIds]).toEqual(['subj-2'])
    expect(localStorage.getItem(DRAWER_SUBJECT_COLLAPSE_STORAGE_KEY)).toBe(JSON.stringify(['subj-2']))
  })

  it('falla en silencio cuando localStorage no esta disponible', () => {
    const failingStorage = {
      getItem: vi.fn(() => {
        throw new Error('storage unavailable')
      }),
      removeItem: vi.fn(() => {
        throw new Error('storage unavailable')
      }),
      setItem: vi.fn(() => {
        throw new Error('storage unavailable')
      }),
    }
    vi.stubGlobal('localStorage', failingStorage)

    expect(() => readCollapsedSubjectIds()).not.toThrow()
    expect(() => writeCollapsedSubjectIds(new Set(['subj-1']))).not.toThrow()
    expect(() => setSubjectCollapsed('subj-1', true)).not.toThrow()
    expect(readCollapsedSubjectIds()).toEqual(new Set())
    expect(writeCollapsedSubjectIds(new Set(['subj-1']))).toBe(false)
    expect(isSubjectCollapsed('subj-1')).toBe(false)
  })
})
