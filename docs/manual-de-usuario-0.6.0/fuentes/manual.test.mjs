import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { relative, isAbsolute } from 'node:path'
import { SCENES } from './model.mjs'

const manual = new URL('../', import.meta.url)
const entry = new URL('Manual-de-usuario-Lumapse.html', manual)
const html = readFileSync(entry, 'utf8')

test('el HTML versionado se reproduce desde las fuentes sin escribir archivos', { timeout: 30000 }, () => {
  const result = execFileSync(process.execPath, [fileURLToPath(new URL('./build.mjs', import.meta.url)), '--check'], {
    cwd: fileURLToPath(new URL('../../../', import.meta.url)), encoding: 'utf8', timeout: 25000,
  })
  assert.match(result, /HTML sincronizado con sus fuentes/)
})

test('todas las imágenes y anclas del manual son locales y existen', () => {
  const ids = [...html.matchAll(/(?:^|\s)id="([^"]+)"/g)].map(match => match[1])
  assert.equal(new Set(ids).size, ids.length)
  for (const [, ref] of html.matchAll(/(?:^|\s)(?:src|href)="([^"]+)"/g)) {
    const target = new URL(ref, entry)
    assert.equal(target.protocol, 'file:', ref)
    const path = relative(fileURLToPath(manual), fileURLToPath(target))
    assert(!path.startsWith('..') && !isAbsolute(path), ref)
    assert(existsSync(target), ref)
    if (target.hash) assert(ids.includes(decodeURIComponent(target.hash.slice(1))), ref)
  }
  assert.doesNotMatch(html, /@font-face|@import\s|\/home\/|\/Users\/|localhost|file:\/\//)
})

test('el lector encuentra una sola entrada HTML, sin enlaces al texto fuente', () => {
  assert.deepEqual(readdirSync(manual).filter(name => name.endsWith('.html')), ['Manual-de-usuario-Lumapse.html'])
  assert.doesNotMatch(html, /Guardar el texto|href="[^"]+\.md"/)
  assert.equal((html.match(/<article class="chapter"/g) || []).length, 4)
})

test('hay siete capturas PNG con las dimensiones previstas y el aviso de terceros', () => {
  const shots = readdirSync(new URL('assets/capturas/', manual))
  assert.equal(shots.length, 7)
  for (const name of shots) {
    const data = readFileSync(new URL(`assets/capturas/${name}`, manual))
    assert.deepEqual([...data.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
    assert.equal(data.readUInt32BE(16), 720)
    assert.equal(data.readUInt32BE(20), 1280)
  }
  const license = readFileSync(new URL('./LICENSE-ILUSTRACION.txt', import.meta.url), 'utf8')
  assert(html.includes(license.trim()))
})

test('los gestos del modelo se refieren a partes de la ilustración terminada', () => {
  const svg = readFileSync(new URL('./ilustracion.svg', import.meta.url), 'utf8')
  for (const scene of SCENES) assert(svg.includes(`data-name="${scene.highlight}"`), scene.id)
  assert(svg.includes('data-ink-clip'))
  assert(svg.includes('data-date-ring'))
})
