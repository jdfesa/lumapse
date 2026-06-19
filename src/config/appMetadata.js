import {
  author as packageAuthor,
  license as packageLicense,
  version as packageVersion,
} from '../../package.json'

export const APP_METADATA = Object.freeze({
  name: 'Lumapse',
  tagline: 'Notas académicas offline-first',
  version: packageVersion,
  author: packageAuthor,
  license: packageLicense,
  purpose: 'Lumapse ayuda a capturar apuntes rápidos, organizarlos por materias y conservar el trabajo localmente sin depender de una cuenta.',
  scope: Object.freeze([
    'Los datos viven en el dispositivo y la app funciona sin conexión para el flujo central de notas.',
    'El ZIP de respaldo se exporta o importa manualmente desde las opciones de la app.',
    'Lumapse no sincroniza ni envía datos automáticamente.',
  ]),
})
