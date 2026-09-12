import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fixture, write, copy, run } from './helpers.js'

function audit(t, files) {
  const root = fixture(t)
  copy(root, 'scripts/check-offline.sh')
  copy(root, 'scripts/check-offline.py')
  for (const [path, content] of Object.entries(files)) write(root, path, content)
  return run(root, 'bash', ['scripts/check-offline.sh'])
}

const csp = content => `<meta http-equiv="Content-Security-Policy" content="${content}">`

test('permite solo los orígenes locales requeridos dentro de la CSP real', t => {
  const result = audit(t, {
    'index.html': `${csp("\n default-src 'self' capacitor://localhost http://localhost;\n img-src data: http://localhost;\n")}`,
    'src/local.js': "const imagen = '/assets/local.png'",
  })
  assert.equal(result.status, 0, result.output)
})

test('reconoce atributos CSP reordenados, mayúsculas y comillas simples', t => {
  const result = audit(t, {
    'index.html': "<META content='default-src http://localhost;' HTTP-EQUIV='Content-Security-Policy'>",
  })
  assert.equal(result.status, 0, result.output)
})

for (const url of [
  'https://cdn.example.org/app.js',
  'http://localhost.example.org',
  'http://localhost:5173',
  'http://localhost@evil.example.org',
  'http://localhost/path',
]) {
  test(`rechaza ${url} junto al origen local en la misma línea CSP`, t => {
    const result = audit(t, { 'index.html': csp(`default-src http://localhost ${url};`) })
    assert.equal(result.status, 1, result.output)
    assert.ok(result.output.includes(url), result.output)
  })
}

test('no permite localhost fuera de CSP ni dentro de otra directiva', t => {
  for (const content of [
    '<script src="http://localhost/app.js"></script>',
    '<meta name="description" content="default-src http://localhost;">',
    csp('script-src http://localhost;'),
  ]) {
    const result = audit(t, { 'index.html': content })
    assert.equal(result.status, 1, result.output)
  }
})

test('no oculta otro atributo ni otro elemento en la misma línea de la CSP', t => {
  for (const content of [
    `${csp('default-src http://localhost;')}<script src="https://evil.example.org/a.js"></script>`,
    '<meta http-equiv="Content-Security-Policy" content="default-src http://localhost;" data-url="https://evil.example.org/a.js">',
  ]) {
    const result = audit(t, { 'index.html': content })
    assert.equal(result.status, 1, result.output)
  }
})

for (const path of ['src/a.js', 'src/a.ts', 'src/a.css', 'src/a.html', 'public/a.js', 'public/a.css', 'public/a.html']) {
  test(`detecta assets externos en ${path}`, t => {
    const result = audit(t, { [path]: 'https://cdn.example.org/asset' })
    assert.equal(result.status, 1, result.output)
    assert.ok(result.output.includes(`${path}:1`), result.output)
  })
}

test('permite comparación defensiva de prefijos, no toda su línea', t => {
  const safe = "if (href.startsWith('http://') || href.includes('https://')) {}"
  assert.equal(audit(t, { 'src/check.ts': safe }).status, 0)
  assert.equal(audit(t, { 'src/check.ts': `${safe} fetch('https://evil.example.org')` }).status, 1)
  assert.equal(audit(t, { 'src/check.ts': "url.startsWith('https://evil.example.org')" }).status, 1)
})

test('conserva líneas de diagnóstico, comentarios y lectura de assets binarios', t => {
  const result = audit(t, {
    'src/a.js': "// Documentación https://example.org\nconst a = 'https://cdn.example.org/a.js'",
    'public/a.png': Buffer.from([0, 255, 10]),
  })
  assert.equal(result.status, 1, result.output)
  assert.ok(result.output.includes('src/a.js:2'), result.output)
})

test('no confunde un selector universal CSS ni código tras un comentario con documentación', t => {
  for (const [path, content] of [
    ['src/a.css', '* { background: url(https://cdn.example.org/a.png); }'],
    ['src/a.js', "/* https://example.org */ fetch('https://evil.example.org')"],
    ['src/a.js', "\x00fetch('https://evil.example.org')"],
  ]) {
    assert.equal(audit(t, { [path]: content }).status, 1)
  }
})
