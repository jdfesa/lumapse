// Una cola por conexión; el capability de una transacción nunca es ambiental.
export function createWriteCoordinator(db, persist) {
  let tail = Promise.resolve()
  let fault = null
  const scopes = new WeakMap()

  function assertHealthy() {
    if (fault) throw new Error('SQLite connection requires recovery', { cause: fault })
  }

  function enqueue(action) {
    const result = tail.then(() => {
      assertHealthy()
      return action()
    })
    // Recupera la cola, no el resultado público ni la salud de la conexión.
    tail = result.then(() => undefined, () => undefined)
    return result
  }

  function getScope(scope) {
    const state = scopes.get(scope)
    if (!state?.active) throw new Error('Invalid or expired SQLite transaction scope')
    assertHealthy()
    return state
  }

  function createScope() {
    const state = { active: true, tail: Promise.resolve(), failure: null }
    async function schedule(action) {
      getScope(scope)
      const result = state.tail.then(action)
      state.tail = result.then(() => undefined, error => { state.failure ??= error })
      return result
    }
    const scope = Object.freeze({
      run: (sql, values = []) => schedule(() => db.run(sql, values, false)),
      query: (sql, values = []) => schedule(() => db.query(sql, values)),
    })
    scopes.set(scope, state)
    return { scope, state }
  }

  async function executeTransaction(action) {
    const { scope, state } = createScope()
    let phase = 'begin'
    try {
      await db.beginTransaction()
      phase = 'action'
      const result = await action(scope)
      state.active = false
      await state.tail
      if (state.failure) throw state.failure
      phase = 'commit'
      await db.commitTransaction()
      phase = 'persist'
      await persist()
      return result
    } catch (error) {
      state.active = false
      await state.tail
      // Un begin/commit ambiguo o persistencia fallida exige recuperación explícita.
      if (phase !== 'action') fault = error
      if (phase !== 'persist') {
        try {
          await db.rollbackTransaction()
        } catch (rollbackError) {
          fault = error
          console.error('[SQLite] Falló rollback; conexión en cuarentena:', rollbackError)
        }
      }
      throw error
    } finally {
      state.active = false
    }
  }

  async function transaction(action, scope) {
    if (scope === undefined) return enqueue(() => executeTransaction(action))
    const state = getScope(scope)
    try {
      return await action(scope)
    } catch (error) {
      state.failure ??= error // Ni un catch interno puede confirmar una cascada incompleta.
      throw error
    }
  }

  const connection = Object.freeze({
    run: (sql, values) => transaction(scope => scope.run(sql, values)),
    query: (sql, values = []) => enqueue(() => db.query(sql, values)),
  })

  return {
    getDb(scope) {
      assertHealthy()
      if (scope !== undefined) getScope(scope)
      return scope === undefined ? connection : scope
    },
    transaction,
    isActive: scope => Boolean(scopes.get(scope)?.active),
    persist(scope) {
      if (scope !== undefined) {
        getScope(scope)
        return Promise.resolve() // Resultado provisional; persiste la propietaria.
      }
      return enqueue(async () => {
        try { await persist() } catch (error) { fault = error; throw error }
      })
    },
    invalidate(error) { fault = error },
    isHealthy: () => !fault,
    drain: () => tail,
  }
}
