// Migración one-time: ausencia comprobada es normal; errores de lectura no son vacío.
function readLegacyNotes() {
  return new Promise((resolve, reject) => {
    let absent = false
    let blocked = false
    const request = window.indexedDB.open('lumapse-db')
    request.onupgradeneeded = () => {
      absent = true
      request.transaction.abort() // No crear una base legada vacía para comprobar su ausencia.
    }
    request.onerror = () => absent ? resolve([]) : reject(request.error)
    request.onblocked = () => {
      blocked = true
      reject(new Error('Legacy IndexedDB open blocked'))
    }
    request.onsuccess = () => {
      const idb = request.result
      if (blocked || !idb.objectStoreNames.contains('notes')) {
        idb.close()
        resolve([])
        return
      }
      try {
        const transaction = idb.transaction('notes', 'readonly')
        const read = transaction.objectStore('notes').getAll()
        transaction.oncomplete = () => { idb.close(); resolve(read.result || []) }
        transaction.onerror = transaction.onabort = () => {
          idb.close()
          reject(transaction.error || read.error || new Error('Legacy IndexedDB read aborted'))
        }
      } catch (error) {
        idb.close()
        reject(error)
      }
    }
  })
}

export async function migrateLegacyNotes(coordinator) {
  try {
    const check = await coordinator.getDb().query('SELECT value FROM metadata WHERE key = ?', ['indexeddb_migrated'])
    if (check.values?.[0]?.value === 'true') return
    const notes = await readLegacyNotes()
    await coordinator.transaction(async db => {
      for (const note of notes) {
        // Un reintento nunca reemplaza una nota que ya existe en SQLite.
        await db.run(`INSERT OR IGNORE INTO notes (id, title, content, pinned, archived, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)`, [
          note.id, note.title || 'Sin título', note.content || '',
          note.pinned ? 1 : 0, note.archived ? 1 : 0,
          note.createdAt || new Date().toISOString(), note.updatedAt || new Date().toISOString(),
        ])
      }
      await db.run('INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)', ['indexeddb_migrated', 'true'])
    })
  } catch (cause) {
    throw new Error('SQLite migration failed: indexeddb_migrated', { cause })
  }
}
