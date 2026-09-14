#!/usr/bin/env node
// Vitest debe terminar normalmente Y reportar todos los archivos/casos.
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export function validateTestReport(report, expectedFiles) {
  const errors = []
  if (!report || report.success !== true) errors.push('Vitest no informó éxito.')
  for (const counter of ['numFailedTests', 'numPendingTests', 'numTodoTests', 'numFailedTestSuites', 'numPendingTestSuites']) {
    if (report?.[counter] !== 0) errors.push(`${counter} debe ser cero.`)
  }
  for (const [total, passed] of [['numTotalTests', 'numPassedTests'], ['numTotalTestSuites', 'numPassedTestSuites']]) {
    if (!Number.isInteger(report?.[total]) || report[total] < 1 || report[total] !== report[passed]) {
      errors.push(`${total}/${passed}: ejecución incompleta.`)
    }
  }
  const results = Array.isArray(report?.testResults) ? report.testResults : []
  const names = results.map(result => typeof result?.name === 'string' ? resolve(result.name) : '')
  const expected = new Set(expectedFiles.map(path => resolve(path)))
  if (!expected.size || names.length !== expected.size || new Set(names).size !== names.length
    || names.some(name => !expected.has(name))) {
    errors.push('El reporte no cubre exactamente tests/unit/**/*.test.js.')
  }
  let assertions = 0
  for (const result of results) {
    const cases = Array.isArray(result?.assertionResults) ? result.assertionResults : []
    assertions += cases.length
    if (result?.status !== 'passed' || !cases.length || cases.some(item => item.status !== 'passed'
      || !Array.isArray(item.failureMessages) || item.failureMessages.length)) {
      errors.push(`Archivo incompleto o fallido: ${result?.name ?? '(sin nombre)'}.`)
    }
  }
  if (assertions !== report?.numTotalTests) errors.push('El total no coincide con las aserciones reportadas.')
  return errors
}

function testFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return testFiles(path)
    return entry.isFile() && entry.name.endsWith('.test.js') ? [path] : []
  })
}

function main() {
  try {
    if (process.argv.length !== 3) throw new Error('Uso: node scripts/check-test-report.js <reporte.json>')
    const report = JSON.parse(readFileSync(process.argv[2], 'utf8'))
    const expected = testFiles(fileURLToPath(new URL('../tests/unit/', import.meta.url)))
    const errors = validateTestReport(report, expected)
    if (errors.length) throw new Error(errors.join('\n'))
    console.log(`[OK] Reporte completo: ${expected.length} archivos / ${report.numTotalTests} tests.`)
    return 0
  } catch (error) {
    console.error(`[FALLO] Reporte de tests inválido o ausente: ${error.message}`)
    return 1
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main()
}
