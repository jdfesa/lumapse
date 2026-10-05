import { getDb, runTransaction } from './connection.js'
import { DatabaseError } from './errors.js'

export const EDITOR_DRAFT_KEY = 'lumapse-editor-draft-v1'

// Una fila ausente permite migrar; el JSON "null" registra una limpieza durable.
export const editorDraftStorage = {
  async read() {
    const result = await getDb().query('SELECT value FROM metadata WHERE key = ?', [EDITOR_DRAFT_KEY])
    return result.values?.[0]?.value
  },
  write(value, scope) {
    return getDb(scope).run('INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)', [EDITOR_DRAFT_KEY, value])
  },
  async transaction(action) {
    try {
      return await runTransaction(action)
    } catch (error) {
      // También los fallos de limpieza/commit deben llegar al canal de error del store.
      throw error instanceof DatabaseError ? error : new DatabaseError('saveEditorNote', error)
    }
  },
}
