import assert from 'node:assert/strict'
import { test } from 'node:test'
import { join } from 'node:path'
import { createServer, isFileLoadingAllowed, normalizePath } from 'vite'
import { fixture, write } from './helpers.js'

test('Vite no convierte una ruta relativa importada en permiso para un archivo externo', async t => {
  const base = fixture(t)
  const root = join(base, 'project')
  const outside = normalizePath(join(base, 'outside.js'))
  // Solo archivos sintéticos; nunca /etc ni datos del equipo.
  const relative = outside.replace(/^(?:[A-Za-z]:)?\//, '')
  write(base, 'outside.js', 'export const value = "restringido"')
  write(root, relative, 'export const value = "permitido"')
  write(root, 'main.js', `import { value } from './${relative}'; export { value }`)
  const server = await createServer({
    root, configFile: false, envFile: false, logLevel: 'silent',
    server: { middlewareMode: true, ws: false, watch: null, fs: { strict: true, allow: [root] } },
    optimizeDeps: { noDiscovery: true, include: [] },
  })
  t.after(() => server.close())
  assert.ok((await server.transformRequest('/main.js'))?.code.includes(relative))
  assert.equal(isFileLoadingAllowed(server.config, normalizePath(join(root, relative))), true)
  assert.equal(isFileLoadingAllowed(server.config, outside), false)
  assert.equal(server.config.safeModulePaths.has(outside), false)
})
