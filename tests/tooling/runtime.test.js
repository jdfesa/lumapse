import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { validateRuntime } from '../../scripts/check-runtime.js'

const canonical = {
  nodeVersion: '22.20.0',
  npmVersion: '10.9.3',
  versionFile: '22.20.0',
  engines: { node: '22.20.0', npm: '10.9.3' },
  packageManager: 'npm@10.9.3',
}

test('acepta únicamente las versiones canónicas', () => {
  assert.deepEqual(validateRuntime(canonical), [])
  for (const nodeVersion of ['20.19.0', '22.19.0', '22.21.0', '26.7.0']) {
    assert.match(validateRuntime({ ...canonical, nodeVersion }).join(' '), /Node .*se requiere 22.20.0/)
  }
  for (const npmVersion of ['', '10.9.4', '12.0.2']) {
    assert.match(validateRuntime({ ...canonical, npmVersion }).join(' '), /npm .*se requiere 10.9.3/)
  }
})

test('rechaza metadatos desalineados o rangos ambiguos', () => {
  for (const changes of [
    { versionFile: '22' },
    { versionFile: '22.21.0' },
    { engines: { node: '>=22', npm: '10.9.3' } },
    { engines: { node: '22.20.0', npm: '^10.9.3' } },
    { packageManager: 'npm@12.0.2' },
    { engines: undefined },
  ]) {
    assert.ok(validateRuntime({ ...canonical, ...changes }).length > 0)
  }
})

test('el repositorio y el lockfile conservan los mismos pins', () => {
  const read = path => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
  const pkg = JSON.parse(read('package.json'))
  const lock = JSON.parse(read('package-lock.json'))
  assert.deepEqual(pkg.engines, canonical.engines)
  assert.deepEqual(lock.packages[''].engines, pkg.engines)
  assert.equal(pkg.packageManager, canonical.packageManager)
  assert.equal(read('.nvmrc').trim(), canonical.versionFile)
  for (const entry of ['preinstall', 'pretest', 'predev', 'prebuild']) {
    assert.match(pkg.scripts[entry], /check:runtime/)
  }
})
