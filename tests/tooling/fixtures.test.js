import assert from 'node:assert/strict'
import { test } from 'node:test'
import { run } from './helpers.js'

test('los perfiles y ZIP de F3 pasan las regresiones Python dentro del gate canónico', () => {
  const result = run(process.cwd(), 'python3', [
    '-m', 'unittest', 'discover', '-s', 'scripts/tests', '-p', 'test_*.py', '-v',
  ])
  assert.equal(result.status, 0, result.output)
  assert.match(result.output, /Ran [1-9]\d* tests?\b/)
  assert.match(result.output, /test_fixture_scripts/)
  assert.match(result.output, /test_f3_summarizer/)
})
