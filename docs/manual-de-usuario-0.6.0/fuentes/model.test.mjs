import test from 'node:test'
import assert from 'node:assert/strict'
import { SCENES, follow, targetFor, gestureAt, WRITE_SECONDS, MARK_SECONDS } from './model.mjs'

test('cuatro tareas únicas corresponden a los cuatro apartados', () => {
  assert.equal(SCENES.length, 4)
  assert.equal(new Set(SCENES.map(s => s.id)).size, 4)
  assert.deepEqual(SCENES.map(s => s.id), ['escribir', 'organizar', 'fechas', 'copias'])
})
test('sólo organización desplaza el cajón y sólo copias desplaza la memoria', () => {
  assert.deepEqual([0, 1, 2, 3].map(i => targetFor(i).organizar), [0, 1, 0, 0])
  assert.deepEqual([0, 1, 2, 3].map(i => targetFor(i).copias), [0, 0, 0, 1])
})
test('movimiento reducido salta al destino sin animación', () => assert.equal(follow(0, 1, 1 / 60, true), 1))
test('el movimiento converge sin sobrepasar el objetivo', () => {
  let value = 0
  for (let i = 0; i < 300; i++) { const next = follow(value, 1, 1 / 60); assert(next >= value && next <= 1); value = next }
  assert.equal(value, 1)
})
test('una pausa larga no introduce un salto grande', () => assert.equal(follow(0, 1, 30), follow(0, 1, 1 / 30)))
test('una inversión vuelve sin atravesar el destino', () => {
  let value = .7
  for (let i = 0; i < 300; i++) { const next = follow(value, 0, 1 / 60); assert(next <= value && next >= 0); value = next }
  assert.equal(value, 0)
})
test('el texto y la lapicera comparten un progreso acotado, monótono y finito', () => {
  let previous = 0
  for (let age = 0; age < 4; age += .01) {
    const gesture = gestureAt(0, age)
    assert(gesture.writing >= previous && gesture.writing <= 1)
    previous = gesture.writing
  }
  assert.equal(gestureAt(0, 0).writing, 0)
  assert.equal(gestureAt(0, WRITE_SECONDS + .25).writing, 1)
  assert.equal(gestureAt(0, WRITE_SECONDS + .25).active, false)
})
test('la fecha se señala con un gesto breve y se detiene', () => {
  assert.equal(gestureAt(2, 0).date, 0)
  assert(gestureAt(2, .7).date > 0 && gestureAt(2, .7).date < 1)
  assert.equal(gestureAt(2, MARK_SECONDS + .25).date, 1)
  assert.equal(gestureAt(2, MARK_SECONDS + .25).active, false)
})
test('movimiento reducido deja texto y fecha terminados sin iniciar un gesto', () => {
  for (const scene of [0, 1, 2, 3]) assert.deepEqual(gestureAt(scene, 0, true), { writing: 1, date: 1, active: false })
})
test('cambiar de tarea no borra el texto escrito', () => {
  for (const scene of [1, 2, 3]) assert.equal(gestureAt(scene, 0).writing, 1)
})
