import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { spawnSync } from 'node:child_process'

export function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'lumapse-tooling-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  return root
}

export function write(root, path, content, mode = 0o644) {
  const destination = join(root, path)
  mkdirSync(dirname(destination), { recursive: true })
  writeFileSync(destination, content, { mode })
}

export function copy(root, path) {
  write(root, path, readFileSync(new URL(`../../${path}`, import.meta.url)))
}

export function run(root, command, args, env = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    timeout: 30000,
  })
  if (result.error) throw result.error
  return { ...result, output: result.stdout + result.stderr }
}
