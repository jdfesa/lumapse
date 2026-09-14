import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { fixture, write, copy, run } from './helpers.js'

const required = [
  'check:runtime', 'lint', 'test:tooling', 'test', 'build', 'typecheck', 'check:toolchain',
  'check:version', 'check:db-smoke', 'check:size', 'check:native-dialogs', 'check:a11y',
  'check:traceability', 'check:docs', 'check:schema', 'check:dbml', 'check:subjects', 'check:offline',
]

function gate(t, { fail = '', exit = '1', report = 'complete', binary } = {}) {
  const root = fixture(t)
  copy(root, 'scripts/quality.sh')
  copy(root, 'scripts/check-test-report.js')
  write(root, 'package.json', '{"type":"module"}')
  write(root, 'tests/unit/a.test.js', '// fixture')
  write(root, 'tests/unit/nested/b.test.js', '// fixture')
  for (const name of ['check-file-size', 'check-docs']) {
    write(root, `scripts/${name}.sh`, `#!/usr/bin/env bash\necho ${name} >> calls\n`)
  }
  if (binary !== undefined) {
    write(root, 'scripts/lumapse-audit-bin', `#!/usr/bin/env bash\ntouch binary-was-run\nexit ${binary}\n`, 0o755)
  }
  write(root, 'bin/npm', `#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
const check = process.argv[3]
fs.appendFileSync('calls', check + '\\n')
if (check === 'test') {
  console.log('Test Files  2 passed (2)\\nTests  2 passed (2)')
  const output = process.argv.find(arg => arg.startsWith('--outputFile.json='))?.split('=').slice(1).join('=')
  let files = ['tests/unit/a.test.js', 'tests/unit/nested/b.test.js']
  if (process.env.FAKE_REPORT === 'incomplete') files.pop()
  const report = {
    success: true, numTotalTestSuites: files.length, numPassedTestSuites: files.length,
    numFailedTestSuites: 0, numPendingTestSuites: 0,
    numTotalTests: files.length, numPassedTests: files.length,
    numFailedTests: 0, numPendingTests: 0, numTodoTests: 0,
    testResults: files.map(name => ({ name: path.resolve(name), status: 'passed',
      assertionResults: [{ status: 'passed', failureMessages: [] }] })),
  }
  if (output && process.env.FAKE_REPORT !== 'missing') {
    fs.writeFileSync(output, process.env.FAKE_REPORT === 'invalid' ? '{' : JSON.stringify(report))
  }
}
if (check === process.env.FAKE_FAIL) process.exit(Number(process.env.FAKE_EXIT))
`, 0o755)
  const result = run(root, 'bash', ['scripts/quality.sh'], {
    PATH: `${join(root, 'bin')}:${process.env.PATH}`,
    FAKE_FAIL: fail, FAKE_EXIT: exit, FAKE_REPORT: report,
  })
  assert.ok(existsSync(join(root, 'calls')), result.output)
  return { ...result, root, calls: readFileSync(join(root, 'calls'), 'utf8').trim().split('\n') }
}

test('ejecuta la unión completa y los diagnósticos sin binario Rust', t => {
  const result = gate(t)
  assert.equal(result.status, 0, result.output)
  assert.deepEqual(result.calls, [...required, 'check-file-size', 'check-docs'])
})

for (const binary of [0, 1, 139]) {
  test(`un binario optativo con exit ${binary} no cambia ni omite el gate`, t => {
    const result = gate(t, { binary })
    assert.equal(result.status, 0, result.output)
    assert.equal(existsSync(join(result.root, 'binary-was-run')), false)
    assert.deepEqual(result.calls, [...required, 'check-file-size', 'check-docs'])
  })
}

for (const check of required) {
  test(`el fallo de ${check} bloquea el agregado`, t => {
    const result = gate(t, { fail: check })
    assert.equal(result.status, 1, result.output)
    if (check === 'check:runtime') assert.deepEqual(result.calls, ['check:runtime'])
    else assert.ok(result.calls.includes('check:offline'), result.output)
  })
}

for (const exit of ['1', '137', '139', '143']) {
  test(`un resumen exitoso seguido de exit ${exit} nunca aprueba`, t => {
    const result = gate(t, { fail: 'test', exit })
    assert.equal(result.status, 1, result.output)
    assert.match(result.output, new RegExp('test \\(exit ' + exit + '\\)'))
  })
}

for (const report of ['missing', 'invalid', 'incomplete']) {
  test(`exit cero con reporte ${report} no basta para aprobar`, t => {
    const result = gate(t, { report })
    assert.equal(result.status, 1, result.output)
    assert.match(result.output, /Reporte de tests inválido o ausente/)
  })
}

test('npm y CI invocan el mismo gate sin listas alternativas', () => {
  const read = path => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
  const pkg = JSON.parse(read('package.json'))
  const workflow = read('.github/workflows/lint.yml')
  assert.equal(pkg.scripts.verify, 'npm run quality')
  assert.equal(pkg.scripts.quality, 'bash scripts/quality.sh')
  assert.match(workflow, /node-version-file: "\.nvmrc"/)
  assert.deepEqual([...workflow.matchAll(/run: (.+)/g)].map(match => match[1]), [
    'npm run check:runtime', 'npm ci', 'npm run verify',
  ])
  assert.doesNotMatch(workflow, /continue-on-error|NODE_OPTIONS|lumapse-audit-bin/)
  assert.match(read('scripts/quality.sh'), /--allowOnly=false/)
  assert.match(read('vitest.config.js'), /include: \['tests\/unit\/\*\*\/\*\.test\.js'\]/)
})
