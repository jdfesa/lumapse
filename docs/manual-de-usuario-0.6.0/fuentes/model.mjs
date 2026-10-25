// Modelo de la ilustración, no de una base de datos ni de métricas reales.
export const SCENES = Object.freeze([
  { id: 'escribir', label: 'Escribí', title: 'Primero, capturá una idea.', readout: 'Una idea · título opcional', body: 'Escribí y guardá tu nota. Podés ordenarla después.', highlight: 'lapicera-cuerpo' },
  { id: 'organizar', label: 'Organizá', title: 'Cada apunte en su lugar.', readout: 'Entrada · materia · sección', body: 'Agrupá tus apuntes y encontralos cuando los necesites.', highlight: 'cajon-3-ficha' },
  { id: 'fechas', label: 'Consultá fechas', title: 'Consultá tu calendario.', readout: '28 OCT · fecha de ejemplo', body: 'En el calendario de la izquierda ves parciales y entregas. Las fechas no envían alarmas.', highlight: 'calendario-hoja-2' },
  { id: 'copias', label: 'Guardá una copia', title: 'Tus notas siguen siendo tuyas.', readout: 'ZIP + Markdown · fuera del celular', body: 'Conservá una copia y llevá tus notas a otro editor si querés.', highlight: 'memoria-tapa' },
])
export const DRAWER_TRAVEL = 22
export const MEMORY_TRAVEL = 8
export const WRITE_TRAVEL = 62
export const WRITE_SECONDS = 2.4
export const MARK_SECONDS = 1.1
export const EASE_SECONDS = .24
export const TOUR_SECONDS = 4.8
export function targetFor(scene) {
  return { organizar: scene === 1 ? 1 : 0, copias: scene === 3 ? 1 : 0 }
}
export function follow(value, target, dt, reduced = false) {
  if (reduced || Math.abs(target - value) < .0001) return target
  return value + (target - value) * (1 - Math.exp(-Math.min(dt, 1 / 30) / EASE_SECONDS))
}
// El gesto y su tinta comparten progreso. Sólo avanzan cuando la figura se ve.
export function gestureAt(scene, age, reduced = false) {
  const ease = value => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t) }
  const duration = scene === 0 ? WRITE_SECONDS : scene === 2 ? MARK_SECONDS : 0
  const progress = reduced || !duration ? 1 : ease((age - .25) / duration)
  return { writing: scene === 0 ? progress : 1, date: scene === 2 ? progress : 1,
    active: !reduced && duration > 0 && age < duration + .25 }
}
