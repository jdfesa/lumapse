import assert from 'node:assert/strict'
import { test } from 'node:test'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { copy, fixture, run, write } from './helpers.js'

function deploy(t, scenario, args = []) {
  const root = fixture(t)
  copy(root, 'scripts/deploy-android.sh')
  write(root, 'data-preserved', 'notas y borrador de prueba')
  const stub = `#!${process.execPath}
const fs = require('node:fs'), path = require('node:path');
const command = path.basename(process.argv[1]), args = process.argv.slice(2);
const root = process.env.FIXTURE_ROOT, scenario = process.env.SCENARIO;
fs.appendFileSync(path.join(root, 'calls.jsonl'), JSON.stringify([command, ...args])+'\\n');
const erase = () => fs.rmSync(path.join(root, 'data-preserved'), {force:true});
if(command==='npm' && scenario==='build-failure') process.exit(1);
if(command==='gradlew') {
  if(scenario==='build-failure') process.exit(1);
  fs.mkdirSync(path.join(root,'android/app/build/outputs/apk/debug'), {recursive:true});
  fs.writeFileSync(path.join(root,'android/app/build/outputs/apk/debug/app-debug.apk'), 'fixture');
}
if(command==='npx' && args[1]==='run') {
  if(scenario==='signature-mismatch') erase(); // Caracteriza el fallback anterior.
}
if(command==='apksigner') {
  const installed = args.at(-1).endsWith('installed.apk');
  if(scenario==='unreadable-certificate' && installed) process.exit(1);
  const digest = installed && scenario==='signature-mismatch' ? 'b' : 'a';
  console.log('Signer #1 certificate SHA-256 digest: '+digest.repeat(64));
}
if(command==='adb') {
  if(args[0]==='devices') { console.log('List of devices attached\\nphone device'); process.exit(0); }
  const op=args.slice(2);
  if(op[0]==='uninstall') { erase(); console.log('Success'); }
  if(op[0]==='install') {
    if(scenario==='downgrade') { console.error('Failure [INSTALL_FAILED_VERSION_DOWNGRADE]'); process.exit(1); }
    if(scenario==='failure-exit-zero') console.log('Failure [INSTALL_FAILED_UPDATE_INCOMPATIBLE]');
    else console.log('Success');
  }
  if(op[0]==='shell' && op[1]==='pm' && op[2]==='list' && scenario!=='fresh') console.log('package:com.lumapse.app');
  if(op[0]==='shell' && op[1]==='pm' && op[2]==='path') console.log('package:/data/app/fixture/base.apk');
  if(op[0]==='pull') fs.writeFileSync(op.at(-1), 'installed fixture');
}
`
  for (const name of ['adb', 'npm', 'npx', 'apksigner']) write(root, `bin/${name}`, stub, 0o755)
  write(root, 'android/gradlew', stub, 0o755)
  const result = run(root, 'bash', ['scripts/deploy-android.sh', '--target', 'phone', ...args], {
    FIXTURE_ROOT: root, SCENARIO: scenario, PATH: `${join(root, 'bin')}:${process.env.PATH}`,
    ANDROID_HOME: '', ANDROID_SDK_ROOT: '',
  })
  const calls = readFileSync(join(root, 'calls.jsonl'), 'utf8').trim().split('\n').map(JSON.parse)
  return { ...result, calls, preserved: existsSync(join(root, 'data-preserved')) }
}

const operations = (r, op) => r.calls.filter(c => c[0] === 'adb' && c[3] === op)
const noImplicitRunner = r => assert.ok(!r.calls.some(c => c[0] === 'npx' && c[2] === 'run'))

test('deploy normal compara certificados y actualiza sin borrar datos', t => {
  const r = deploy(t, 'compatible')
  assert.equal(r.status, 0, r.output)
  assert.equal(r.preserved, true)
  assert.equal(operations(r, 'uninstall').length, 0)
  assert.deepEqual(operations(r, 'install')[0].slice(4, 6), ['-r', '-t'])
  assert.equal(r.calls.filter(c => c[0] === 'apksigner').length, 2)
  noImplicitRunner(r)
})

test('firma distinta aborta antes de instalar, sin fallback destructivo', t => {
  const r = deploy(t, 'signature-mismatch')
  assert.notEqual(r.status, 0)
  assert.equal(r.preserved, true)
  assert.equal(operations(r, 'install').length, 0)
  assert.equal(operations(r, 'uninstall').length, 0)
  noImplicitRunner(r)
})

test('no poder verificar la firma instalada falla cerrado', t => {
  const r = deploy(t, 'unreadable-certificate')
  assert.notEqual(r.status, 0)
  assert.equal(r.preserved, true)
  assert.equal(operations(r, 'install').length, 0)
  assert.equal(operations(r, 'uninstall').length, 0)
})

test('downgrade rechazado no desinstala ni reintenta', t => {
  const r = deploy(t, 'downgrade')
  assert.notEqual(r.status, 0)
  assert.equal(r.preserved, true)
  assert.equal(operations(r, 'install').length, 1)
  assert.equal(operations(r, 'uninstall').length, 0)
  noImplicitRunner(r)
})

test('Failure de ADB con exit cero no se anuncia como éxito', t => {
  const r = deploy(t, 'failure-exit-zero')
  assert.notEqual(r.status, 0)
  assert.equal(r.preserved, true)
  assert.equal(operations(r, 'uninstall').length, 0)
  assert.ok(!r.calls.some(c => c[0] === 'adb' && c.includes('start')))
})

test('--clean no borra la app antes de un build fallido', t => {
  const r = deploy(t, 'build-failure', ['--clean'])
  assert.notEqual(r.status, 0)
  assert.equal(r.preserved, true)
  assert.equal(operations(r, 'uninstall').length, 0)
})

test('--clean mantiene la desinstalación como una elección explícita', t => {
  const r = deploy(t, 'compatible', ['--clean'])
  assert.equal(r.status, 0, r.output)
  assert.equal(r.preserved, false)
  assert.equal(operations(r, 'uninstall').length, 1)
  assert.equal(operations(r, 'install').length, 1)
  noImplicitRunner(r)
})

test('instalación inicial verifica APK y no necesita firma instalada', t => {
  const r = deploy(t, 'fresh')
  assert.equal(r.status, 0, r.output)
  assert.equal(r.calls.filter(c => c[0] === 'apksigner').length, 1)
  assert.equal(operations(r, 'pull').length, 0)
  assert.equal(operations(r, 'uninstall').length, 0)
  assert.equal(operations(r, 'install').length, 1)
  noImplicitRunner(r)
})
