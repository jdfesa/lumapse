import assert from 'node:assert/strict'
import { test } from 'node:test'
import { realpathSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { build, createServer } from 'vite'
import { buildMetadataPlugin, collectBuildMetadata, SOURCE_PATHS } from '../../scripts/build-metadata.js'

const root = realpathSync(process.cwd())
const head = 'a'.repeat(40)
function collect(options = {}) {
  const { status = '', failAt, sha = head, top = root, ...rest } = options
  return collectBuildMetadata({
    root, command: 'build', ...rest,
    git(args, cwd) {
      assert.equal(cwd, root)
      if (args[0] === failAt) throw new Error('Git no disponible')
      if (args[1] === '--show-toplevel') return top
      if (args[0] === 'rev-parse') return sha
      assert.deepEqual(args, ['status', '--porcelain=v1', '--untracked-files=all', '--', ...SOURCE_PATHS])
      return status
    },
  })
}

test('build/CI optimizado no implica release; deploy y helper declaran su variante', () => {
  assert.equal(collect().compilation, 'test')
  for (const channel of ['android-debug', 'android-candidate']) {
    assert.equal(collect({ channel }).compilation, channel)
    assert.equal(collect({ command: 'serve', channel }).compilation, 'development')
  }
  assert.equal(collect({ channel: '/ruta/privada/secreto' }).compilation, 'test')
  assert.equal(collect({ channel: 'production' }).compilation, 'test')
})

test('origen se recalcula y distingue cambios seguidos y nuevos relevantes', () => {
  assert.deepEqual(collect(), { compilation: 'test', commit: head, dirty: false })
  assert.equal(collect({ sha: 'b'.repeat(40) }).commit, 'b'.repeat(40))
  for (const status of [' M src/main.js', '?? src/new.js', 'D  public/icon.png']) {
    assert.equal(collect({ status }).dirty, true)
  }
  assert.ok(!SOURCE_PATHS.includes('docs'))
  assert.ok(!SOURCE_PATHS.includes('tests'))
})

test('sin Git, sin HEAD válido o exportado dentro de otro repo no inventa origen', () => {
  for (const options of [{ failAt: 'rev-parse' }, { sha: 'invalid' }, { top: resolve(root, '..') }]) {
    assert.deepEqual(collect(options), { compilation: 'test', commit: null, dirty: null })
  }
  assert.deepEqual(collect({ failAt: 'status' }), { compilation: 'test', commit: head, dirty: null })
  assert.equal(collect({ sha: 'c'.repeat(64) }).commit, 'c'.repeat(64))
})

test('módulo virtual solo serializa canal, commit y estado; no código Node en cliente', () => {
  const plugin = buildMetadataPlugin()
  plugin.configResolved({ root, command: 'build' })
  const id = plugin.resolveId('virtual:lumapse-build-metadata')
  assert.equal(plugin.resolveId('other'), undefined)
  assert.equal(plugin.load('other'), undefined)
  const metadata = JSON.parse(plugin.load(id).replace('export default ', ''))
  assert.deepEqual(Object.keys(metadata), ['compilation', 'commit', 'dirty'])
  assert.ok(!plugin.load(id).includes(root))
})

test('HMR invalida metadata junto al código, pero no por documentos', () => {
  const plugin = buildMetadataPlugin()
  plugin.configResolved({ root, command: 'serve' })
  const metadata = {}
  const invalidated = []
  const context = {
    modules: ['source'],
    server: { moduleGraph: {
      getModuleById: () => metadata,
      invalidateModule: module => invalidated.push(module),
    } },
  }
  assert.equal(plugin.handleHotUpdate({ ...context, file: resolve(root, 'docs/README.md') }), undefined)
  assert.deepEqual(plugin.handleHotUpdate({ ...context, file: resolve(root, 'src/main.js') }), ['source', metadata])
  assert.deepEqual(invalidated, [metadata])
})

test('deploy habitual declara debug automáticamente sin cambiar ruta de instalación', () => {
  const source = readFileSync('scripts/deploy-android.sh', 'utf8')
  assert.match(source, /LUMAPSE_BUILD_CHANNEL=android-debug npm run build/)
  assert.match(source, /npx cap run android --target "\$TARGET_DEVICE"/)
  assert.ok(!source.includes('--release'))
})

test('Vite dev y builds reales consumen metadata; production no se convierte en release', async () => {
  const previous = process.env.LUMAPSE_BUILD_CHANNEL
  try {
    process.env.LUMAPSE_BUILD_CHANNEL = 'android-candidate'
    const server = await createServer({
      configFile: resolve(root, 'vite.config.js'), mode: 'production',
      server: { middlewareMode: true, open: false }, logLevel: 'silent',
    })
    try {
      const transformed = await server.transformRequest('virtual:lumapse-build-metadata')
      assert.match(transformed.code, /"compilation":"development"/)
    } finally {
      await server.close()
    }
    for (const [channel, label] of [
      [undefined, 'Prueba optimizada (variante no declarada)'],
      ['android-debug', 'Android debug · prueba privada'],
      ['android-candidate', 'Android · candidato (firma/publicación no verificadas)'],
    ]) {
      if (channel === undefined) delete process.env.LUMAPSE_BUILD_CHANNEL
      else process.env.LUMAPSE_BUILD_CHANNEL = channel
      const result = await build({
        configFile: resolve(root, 'vite.config.js'), logLevel: 'silent',
        build: { write: false, lib: { entry: resolve(root, 'src/config/appMetadata.js'), formats: ['es'] } },
      })
      const output = (Array.isArray(result) ? result[0] : result).output
      const code = output.find(item => item.type === 'chunk').code
      const { APP_METADATA } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
      assert.equal(APP_METADATA.version, JSON.parse(readFileSync('package.json', 'utf8')).version)
      assert.equal(APP_METADATA.compilation, label)
      assert.match(APP_METADATA.origin, /^(?:[a-f0-9]{40} · (?:sin )?cambios locales|No disponible)/)
      assert.ok(!code.includes(root))
      assert.ok(!code.includes('node:child_process'))
    }
  } finally {
    if (previous === undefined) delete process.env.LUMAPSE_BUILD_CHANNEL
    else process.env.LUMAPSE_BUILD_CHANNEL = previous
  }
})
