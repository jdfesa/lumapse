const COMPILATIONS = Object.freeze({
  development: 'Desarrollo (servidor local)',
  test: 'Prueba optimizada (variante no declarada)',
  'android-debug': 'Android debug · prueba privada',
  'android-candidate': 'Android · candidato (firma/publicación no verificadas)',
})

export function formatBuildMetadata(metadata = {}) {
  const compilation = Object.prototype.hasOwnProperty.call(COMPILATIONS, metadata.compilation)
    ? COMPILATIONS[metadata.compilation] : 'No disponible'
  let origin = 'No disponible'
  if (typeof metadata.commit === 'string' && /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(metadata.commit)) {
    const state = metadata.dirty === true ? 'cambios locales'
      : metadata.dirty === false ? 'sin cambios locales' : 'estado local no disponible'
    origin = `${metadata.commit} · ${state}`
  }
  return Object.freeze({ compilation, origin })
}
