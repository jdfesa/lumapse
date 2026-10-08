import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const PROJECT_ROOT = path.resolve(import.meta.dirname, '..', '..')

const TARGET_RULES = [
  ['src/styles/main.css', '.app-header__logo-icon-btn', ['width', 'height']],
  ['src/styles/main.css', '.icon-btn', ['width', 'height']],
  ['src/styles/drawer.css', '.search-box input', ['min-height']],
  ['src/styles/drawer.css', '.drawer__nav-btn', ['min-height']],
  ['src/styles/drawer-subjects.css', '.drawer__subjects-add', ['width', 'height']],
  ['src/styles/drawer-subjects.css', '.drawer__subject-btn', ['min-height']],
  ['src/styles/drawer-subjects.css', '.drawer__subject-collapse', ['min-width', 'height']],
  ['src/styles/drawer-subjects.css', '.drawer__subject-action', ['width', 'height']],
  ['src/components/note-editor/NoteEditor.css', '.composer__tool-btn', ['width', 'height']],
  ['src/components/note-editor/NoteEditor.css', '.composer__save-btn', ['min-height']],
  ['src/components/note-editor/NoteEditor.css', '.composer__subject-trigger', ['height']],
  ['src/components/note-editor/NoteEditor.css', '.composer__subject-option', ['min-height']],
  ['src/components/note-editor/NoteEditor.css', '.composer__subject-option--child', ['min-height']],
]

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function readRule(file, selector) {
  const css = fs.readFileSync(path.join(PROJECT_ROOT, file), 'utf8')
  const match = css.match(new RegExp(`${escapeRegExp(selector)}\\s*\\{([^}]*)\\}`))
  assert.ok(match, `${file} debe declarar el selector ${selector}`)
  return match[1]
}

function readDeclarations(block) {
  return Object.fromEntries(
    [...block.matchAll(/([\w-]+)\s*:\s*([^;]+);/g)].map(([, property, value]) => [
      property,
      value.trim(),
    ]),
  )
}

test('RNF-008 mantiene los controles principales con un área mínima de 44px', () => {
  for (const [file, selector, properties] of TARGET_RULES) {
    const declarations = readDeclarations(readRule(file, selector))

    for (const property of properties) {
      const value = declarations[property]
      assert.ok(value, `${file} ${selector} debe declarar ${property}`)
      assert.match(value, /^44px$/)
    }
  }
})
