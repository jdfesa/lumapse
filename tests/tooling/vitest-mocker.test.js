import assert from 'node:assert/strict'
import { test } from 'node:test'
import { join } from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { resolveConfig } from 'vite'
import { fixture, write } from './helpers.js'

// Ejercitar el mocker instalado por Vitest, sin agregarlo como dependencia directa.
const require = createRequire(import.meta.url)
const vitestRequire = createRequire(require.resolve('vitest/package.json'))
const { interceptorPlugin } = await import(pathToFileURL(vitestRequire.resolve('@vitest/mocker/node')).href)
const allowedSource = 'export const value = "fixture permitida"'
const deniedSource = 'export const value = "fixture restringida, sin datos reales"'

async function mocker(t, options = {}) {
  const base = fixture(t)
  const root = join(base, 'project')
  write(root, 'allowed.js', allowedSource)
  write(root, 'denied.js', deniedSource)
  write(base, 'outside.js', deniedSource)
  // Solo resolver configuración: no leer .env/config del proyecto ni abrir un servidor.
  const config = await resolveConfig({
    root, configFile: false, envFile: false, logLevel: 'silent',
    server: { fs: { strict: true, allow: [root], deny: ['**/denied.js'] } },
  }, 'serve')
  const handlers = new Map()
  const sent = []
  const plugin = interceptorPlugin(options)
  plugin.configureServer({
    config,
    ws: { on: (event, handler) => handlers.set(event, handler), send: event => sent.push(event) },
  })
  return {
    handlers,
    async redirect(target) {
      const register = handlers.get('vitest:interceptor:register')
      assert.equal(typeof register, 'function')
      const id = join(root, 'requested.js')
      register({ type: 'redirect', raw: './requested.js', id, url: '/requested.js', redirect: target })
      assert.deepEqual(sent, ['vitest:interceptor:register:result'])
      return plugin.load.handler(id)
    },
  }
}

test('el mocker de Vitest conserva redirects a un archivo permitido', async t => {
  const client = await mocker(t)
  assert.equal(await client.redirect('fixture:allowed.js'), allowedSource)
})

test('el mocker de Vitest rechaza redirects fuera de la raíz permitida', async t => {
  const client = await mocker(t)
  assert.equal(await client.redirect('fixture:../outside.js'), undefined)
})

test('el mocker de Vitest respeta fs.deny incluso dentro de la raíz', async t => {
  const client = await mocker(t)
  assert.equal(await client.redirect('fixture:denied.js'), undefined)
})

test('el mocker permite desactivar el registro por WebSocket', async t => {
  const client = await mocker(t, { registerWebSocketEvents: false })
  assert.equal(client.handlers.size, 0)
})
