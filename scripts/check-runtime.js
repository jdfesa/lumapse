#!/usr/bin/env node
// Diagnóstico sin dependencias: debe funcionar incluso antes de npm ci.
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export function validateRuntime({ nodeVersion, npmVersion, versionFile, engines, packageManager }) {
  const errors = []
  if (!/^\d+\.\d+\.\d+$/.test(versionFile) || engines?.node !== versionFile) {
    errors.push('.nvmrc y engines.node deben fijar la misma versión exacta.')
  }
  if (!/^\d+\.\d+\.\d+$/.test(engines?.npm ?? '') || packageManager !== `npm@${engines?.npm}`) {
    errors.push('engines.npm y packageManager deben fijar la misma versión exacta.')
  }
  if (nodeVersion !== engines?.node) {
    errors.push(`Node ${nodeVersion}; se requiere ${engines?.node}.`)
  }
  if (npmVersion !== engines?.npm) {
    errors.push(`npm ${npmVersion || 'no disponible'}; se requiere ${engines?.npm}.`)
  }
  return errors
}

function main() {
  try {
    const root = new URL('../', import.meta.url)
    const { engines, packageManager } = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'))
    const versionFile = readFileSync(new URL('.nvmrc', root), 'utf8').trim()
    // npm_execpath identifica el npm que lanzó el lifecycle, no otro del PATH.
    const options = { encoding: 'utf8', timeout: 10000 }
    const npm = process.env.npm_execpath
      ? spawnSync(process.execPath, [process.env.npm_execpath, '--version'], options)
      : spawnSync('npm', ['--version'], options)
    const npmVersion = !npm.error && npm.status === 0 ? npm.stdout.trim() : ''
    const errors = validateRuntime({ nodeVersion: process.versions.node, npmVersion, versionFile, engines, packageManager })
    if (errors.length) {
      console.error(`[FALLO] Entorno no canónico:\n- ${errors.join('\n- ')}`)
      console.error('Activá la versión de .nvmrc (por ejemplo, nvm install && nvm use), verificá npm y repetí npm ci. No uses NODE_OPTIONS para ocultar el desvío.')
      return 1
    }
    console.log(`[OK] Entorno canónico: Node ${process.versions.node} / npm ${npmVersion}.`)
    return 0
  } catch (error) {
    console.error(`[FALLO] No se pudo verificar el entorno: ${error.message}`)
    return 1
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main()
}
