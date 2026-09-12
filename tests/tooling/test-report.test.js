import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validateTestReport } from '../../scripts/check-test-report.js'

export function passingReport(files) {
  return {
    success: true,
    numTotalTestSuites: files.length,
    numPassedTestSuites: files.length,
    numFailedTestSuites: 0,
    numPendingTestSuites: 0,
    numTotalTests: files.length,
    numPassedTests: files.length,
    numFailedTests: 0,
    numPendingTests: 0,
    numTodoTests: 0,
    testResults: files.map(name => ({
      name, status: 'passed',
      assertionResults: [{ status: 'passed', failureMessages: [] }],
    })),
  }
}

const files = ['/repo/tests/unit/a.test.js', '/repo/tests/unit/b.test.js']

test('acepta un reporte exitoso y completo, sin fijar un número histórico de tests', () => {
  assert.deepEqual(validateTestReport(passingReport(files), files), [])
})

test('rechaza reportes vacíos, parciales, duplicados o con archivos inesperados', () => {
  for (const report of [
    null, {}, passingReport([]), passingReport(files.slice(1)),
    passingReport([files[0], files[0]]), passingReport([files[0], '/unexpected.test.js']),
  ]) {
    assert.ok(validateTestReport(report, files).length)
  }
})

test('rechaza tests pendientes, omitidos, fallidos o totales inconsistentes', () => {
  for (const changes of [
    { success: false }, { numFailedTests: 1 }, { numPendingTests: 1 }, { numTodoTests: 1 },
    { numFailedTestSuites: 1 }, { numPendingTestSuites: 1 }, { numPassedTests: 1 },
    { numTotalTests: 3, numPassedTests: 3 }, { numPassedTestSuites: 1 },
  ]) {
    assert.ok(validateTestReport({ ...passingReport(files), ...changes }, files).length)
  }
  for (const status of ['pending', 'skipped', 'failed', 'todo']) {
    const report = passingReport(files)
    report.testResults[0].assertionResults[0].status = status
    assert.ok(validateTestReport(report, files).length)
  }
  const report = passingReport(files)
  report.testResults[0].assertionResults = []
  assert.ok(validateTestReport(report, files).length)
})
