import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createWriteCoordinator } from '../../../../src/services/sqlite/writeCoordinator.js'
import { sqliteFixture, deferred } from './sqliteFixture.js'

let fixture, db, coordinator, persist
beforeEach(async () => {
  fixture = await sqliteFixture()
  db = fixture.adapter
  await db.execute('CREATE TABLE items (id TEXT PRIMARY KEY)')
  persist = vi.fn(async () => {})
  coordinator = createWriteCoordinator(db, persist)
})
afterEach(() => fixture.close())
const insert = (scope, id) => scope.run('INSERT INTO items VALUES (?)', [id])
const rows = async () => (await coordinator.getDb().query('SELECT id FROM items ORDER BY id')).values

describe('propiedad explícita con SQLite real', () => {
  it('aísla dos transacciones intercaladas y la lectura externa no ve datos sucios', async () => {
    const entered = deferred(), release = deferred()
    const first = coordinator.transaction(async scope => {
      await insert(scope, 'A')
      entered.resolve()
      await release.promise
      throw new Error('A abortada')
    })
    const failure = expect(first).rejects.toThrow('A abortada')
    await entered.promise
    const second = coordinator.transaction(scope => insert(scope, 'B'))
    const read = rows()
    release.resolve()
    await Promise.all([failure, second])
    expect(await read).toEqual([{ id: 'B' }])
    expect(persist).toHaveBeenCalledTimes(1)
  })

  it('anida con el mismo capability, sin commits parciales ni deadlock', async () => {
    await expect(coordinator.transaction(async scope => {
      await insert(scope, 'A')
      await coordinator.transaction(inner => insert(inner, 'B'), scope)
      throw new Error('revertir ambas')
    })).rejects.toThrow('revertir ambas')
    expect(await rows()).toEqual([])
    expect(db.beginTransaction).toHaveBeenCalledTimes(1)
    expect(db.commitTransaction).not.toHaveBeenCalled()
    await coordinator.transaction(scope => insert(scope, 'C'))
    expect(await rows()).toEqual([{ id: 'C' }])
  })

  it('un fallo interno capturado sigue invalidando toda la transacción', async () => {
    const cause = new Error('inner')
    await expect(coordinator.transaction(async scope => {
      await insert(scope, 'A')
      await coordinator.transaction(async () => { throw cause }, scope).catch(() => {})
    })).rejects.toBe(cause)
    expect(await rows()).toEqual([])
  })

  it('un error SQL capturado tampoco permite confirmar parcialmente', async () => {
    await expect(coordinator.transaction(async scope => {
      await insert(scope, 'A')
      await insert(scope, 'A').catch(() => {})
    })).rejects.toThrow('UNIQUE')
    expect(await rows()).toEqual([])
  })

  it('rechaza capabilities falsos, expirados y de otra conexión', async () => {
    let expired
    await coordinator.transaction(async scope => { expired = scope })
    expect(() => coordinator.getDb(expired)).toThrow('expired')
    await expect(coordinator.transaction(async () => {}, {})).rejects.toThrow('Invalid')
    const other = createWriteCoordinator(db, persist)
    await coordinator.transaction(async scope => {
      expect(() => other.getDb(scope)).toThrow('Invalid')
    })
  })

  it('no libera la cola ni informa éxito antes de completar saveToStore', async () => {
    const saving = deferred(), release = deferred()
    persist.mockImplementationOnce(() => { saving.resolve(); return release.promise })
    let complete = false
    const first = coordinator.getDb().run('INSERT INTO items VALUES (?)', ['A']).then(() => { complete = true })
    await saving.promise
    const second = coordinator.getDb().run('INSERT INTO items VALUES (?)', ['B'])
    expect(complete).toBe(false)
    expect(db.beginTransaction).toHaveBeenCalledTimes(1)
    release.resolve()
    await Promise.all([first, second])
    expect(await rows()).toEqual([{ id: 'A' }, { id: 'B' }])
  })

  it.each(['beginTransaction', 'commitTransaction', 'rollbackTransaction'])('cuarentena tras fallo de %s sin sustituir la causa', async method => {
    const cause = new Error('original')
    db[method].mockRejectedValueOnce(method === 'rollbackTransaction' ? new Error('rollback') : cause)
    await expect(coordinator.transaction(async scope => {
      await insert(scope, 'A')
      if (method === 'rollbackTransaction') throw cause
    })).rejects.toBe(cause)
    const next = vi.fn()
    await expect(coordinator.transaction(next)).rejects.toMatchObject({ cause })
    expect(next).not.toHaveBeenCalled()
    await coordinator.drain()
  })

  it('una persistencia web fallida después de commit no intenta rollback ni permite reutilización', async () => {
    const cause = new Error('IndexedDB unavailable')
    persist.mockRejectedValueOnce(cause)
    const facade = coordinator.getDb()
    await expect(facade.run('INSERT INTO items VALUES (?)', ['A'])).rejects.toBe(cause)
    expect(db.rollbackTransaction).not.toHaveBeenCalled()
    await expect(facade.query('SELECT * FROM items')).rejects.toMatchObject({ cause })
    expect(coordinator.isHealthy()).toBe(false)
  })
})
