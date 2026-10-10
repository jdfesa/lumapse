import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const PROJECT_ROOT = path.resolve(import.meta.dirname, '..', '..')
const EDITOR = 'src/components/note-editor/NoteEditor.css'
const CARD = 'src/components/feed/NoteCard.css'
const PREVIEW = 'src/components/markdown/MarkdownPreview.css'
const MARKDOWN = 'src/components/markdown/markdown-elements.css'

// Guardia de las declaraciones fuente; no simula layout ni mide el APK.
function fontSize(file, selector) {
  const css = fs.readFileSync(path.join(PROJECT_ROOT, file), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const rule = css.match(new RegExp(`(?:^|})\\s*${escaped}\\s*\\{([^}]*)\\}`))
  assert.ok(rule, `${file} debe declarar ${selector}`)
  const declarations = [...rule[1].matchAll(/font-size\s*:\s*([^;]+);/g)]
  assert.equal(declarations.length, 1, `${selector} debe declarar un tamaño inequívoco`)
  return declarations[0][1].trim()
}

function assertMinimumRem(file, selector) {
  const value = fontSize(file, selector)
  assert.match(value, /^\d+(?:\.\d+)?rem$/, `${selector} debe usar la escala raíz`)
  assert.ok(parseFloat(value) >= 1, `${selector}: ${value} es menor que 1rem`)
}

test('RNF-007 mantiene el cuerpo del editor en al menos 1rem', () => {
  assertMinimumRem(EDITOR, '.composer__textarea')
})

test('RNF-007 conserva títulos y modo enfoque por encima del mínimo', () => {
  for (const selector of [
    '.composer__title-input',
    '.composer--focus .composer__textarea',
    '.composer--focus .composer__title-input',
  ]) assertMinimumRem(EDITOR, selector)
  assertMinimumRem(CARD, '.note-card__implicit-title')
})

test('RNF-007 mantiene el texto de lectura en tarjetas y preview en al menos 1rem', () => {
  assertMinimumRem(CARD, '.note-card__content')
  assertMinimumRem(PREVIEW, '.md-preview__content')
})

test('RNF-007 pone un piso en code sin perder su proporción en encabezados grandes', () => {
  for (const [selector, ratio] of [
    ['.md-preview__content code', '0.85'],
    ['.note-card__content code', '0.9'],
  ]) {
    assert.equal(fontSize(MARKDOWN, selector).replace(/\s/g, ''), `max(1rem,${ratio}em)`)
  }
})

test('RNF-007 mantiene celdas y encabezados de tablas en al menos 1rem', () => {
  assertMinimumRem(MARKDOWN, ':is(.md-preview__content, .note-card__content) table')
  assertMinimumRem(MARKDOWN, '.note-card__content th')
})

test('RNF-007 conserva la jerarquía tipográfica de los encabezados de lectura', () => {
  for (const [file, prefix] of [[CARD, '.note-card__content'], [PREVIEW, '.md-preview__content']]) {
    const h1 = parseFloat(fontSize(file, `${prefix} h1`))
    const h2 = parseFloat(fontSize(file, `${prefix} h2`))
    assertMinimumRem(file, `${prefix} h1`)
    assertMinimumRem(file, `${prefix} h2`)
    assert.ok(h1 > h2 && h2 > 1, `${prefix} debe conservar títulos mayores que el cuerpo`)
  }
})

test('RNF-007 evita que los estilos del navegador reduzcan h4, h5 y h6', () => {
  assertMinimumRem(MARKDOWN, ':is(.md-preview__content, .note-card__content) :is(h4, h5, h6)')
})
