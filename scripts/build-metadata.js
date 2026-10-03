import { execFileSync } from 'node:child_process'
import { realpathSync } from 'node:fs'
import { relative, resolve } from 'node:path'

const MODULE_ID = 'virtual:lumapse-build-metadata'
const RESOLVED_ID = `\0${MODULE_ID}`
// Código, recursos y configuración que participan en la compilación; no docs/tests.
export const SOURCE_PATHS = Object.freeze([
  'src', 'public', 'android', 'index.html', 'package.json', 'package-lock.json',
  'vite.config.js', 'capacitor.config.json', 'tsconfig.json',
  'scripts/build-metadata.js', 'scripts/deploy-android.sh', 'scripts/release-helper.py',
])

function readGit(args, root) {
  return execFileSync('git', args, {
    cwd: root, encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'ignore'],
  }).trim()
}

export function collectBuildMetadata({ root, command, channel, git = readGit }) {
  // Un build optimizado no acredita variante Android, firma ni publicación.
  const compilation = command === 'serve' ? 'development'
    : ['android-debug', 'android-candidate'].includes(channel) ? channel : 'test'
  let commit = null
  let dirty = null
  try {
    // Un directorio exportado dentro de otro repo no debe heredar su origen.
    if (realpathSync(git(['rev-parse', '--show-toplevel'], root)) !== realpathSync(root)) {
      return { compilation, commit, dirty }
    }
    const head = git(['rev-parse', '--verify', 'HEAD'], root)
    if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(head)) return { compilation, commit, dirty }
    commit = head
    dirty = git(['status', '--porcelain=v1', '--untracked-files=all', '--', ...SOURCE_PATHS], root) !== ''
  } catch {
    // Sin Git/HEAD o sin estado legible: no inventar un origen ni un árbol limpio.
  }
  return { compilation, commit, dirty }
}

export function buildMetadataPlugin() {
  let root
  let command
  let channel
  function relevant(file) {
    const path = relative(root, resolve(file)).split('\\').join('/')
    return SOURCE_PATHS.some(source => path === source || path.startsWith(`${source}/`))
  }
  return {
    name: 'lumapse-build-metadata',
    configResolved(config) {
      root = config.root
      command = config.command
      channel = process.env.LUMAPSE_BUILD_CHANNEL
    },
    resolveId(id) {
      if (id === MODULE_ID) return RESOLVED_ID
    },
    load(id) {
      if (id === RESOLVED_ID) {
        return `export default ${JSON.stringify(collectBuildMetadata({ root, command, channel }))}`
      }
    },
    handleHotUpdate(context) {
      if (!relevant(context.file)) return
      const metadata = context.server.moduleGraph.getModuleById(RESOLVED_ID)
      if (metadata) {
        context.server.moduleGraph.invalidateModule(metadata)
        return [...context.modules, metadata]
      }
    },
  }
}
