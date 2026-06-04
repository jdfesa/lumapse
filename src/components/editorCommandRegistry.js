import { INLINE_COMMANDS } from './editorInlineCommands.js'

export const EDITOR_COMMAND_GROUPS = [
  { id: 'basic', label: 'Bloques basicos' },
  { id: 'structure', label: 'Estructura' },
  { id: 'callout', label: 'Callouts' },
  { id: 'inline', label: 'Formato inline' },
  { id: 'utility', label: 'Utiles' },
]

function formatLocalDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function createCalloutCommand({ id, label, type, aliases, description }) {
  const snippet = `> [!${type}]\n> `
  return {
    id: `callout-${id}`,
    group: 'callout',
    label,
    aliases: ['callout', type, ...aliases],
    description,
    snippet,
    cursorOffset: snippet.length,
    surfaces: ['slash', 'insert'],
  }
}

const COMMAND_VISUALS = {
  text: { icon: 'text' },
  'heading-1': { icon: 'heading-1', hint: '#' },
  'heading-2': { icon: 'heading-2', hint: '##' },
  'heading-3': { icon: 'heading-3', hint: '###' },
  'heading-4': { icon: 'heading-4', hint: '####' },
  'bulleted-list': { icon: 'bullet', hint: '-' },
  'numbered-list': { icon: 'numbered-list', hint: '1.' },
  'task-list': { icon: 'check', hint: '[]' },
  quote: { icon: 'quote', hint: '>' },
  divider: { icon: 'divider', hint: '---' },
  'code-block': { icon: 'code', hint: '```' },
  table: { icon: 'table', hint: '|' },
  link: { icon: 'link', hint: 'url' },
  today: { icon: 'today' },
}

export const EDITOR_COMMANDS = [
  {
    id: 'text',
    group: 'basic',
    label: 'Texto',
    aliases: ['texto', 'p', 'normal'],
    description: 'Linea normal',
    snippet: '',
    cursorOffset: 0,
    surfaces: ['slash', 'insert'],
  },
  {
    id: 'heading-1',
    group: 'basic',
    label: 'Encabezado 1',
    aliases: ['h1', 'titulo', 'title'],
    description: 'Titulo principal',
    snippet: '# ',
    cursorOffset: 2,
    surfaces: ['slash', 'insert'],
  },
  {
    id: 'heading-2',
    group: 'basic',
    label: 'Encabezado 2',
    aliases: ['h2', 'subtitulo', 'subtitle'],
    description: 'Subtitulo',
    snippet: '## ',
    cursorOffset: 3,
    surfaces: ['slash', 'insert'],
  },
  {
    id: 'heading-3',
    group: 'basic',
    label: 'Encabezado 3',
    aliases: ['h3'],
    description: 'Titulo menor',
    snippet: '### ',
    cursorOffset: 4,
    surfaces: ['slash'],
  },
  {
    id: 'heading-4',
    group: 'basic',
    label: 'Encabezado 4',
    aliases: ['h4'],
    description: 'Titulo pequeno',
    snippet: '#### ',
    cursorOffset: 5,
    surfaces: ['slash'],
  },
  {
    id: 'bulleted-list',
    group: 'basic',
    label: 'Lista con vinetas',
    aliases: ['lista', 'bullet', 'ul', 'vinetas'],
    description: 'Item con punto',
    snippet: '- ',
    cursorOffset: 2,
    surfaces: ['slash', 'insert'],
  },
  {
    id: 'numbered-list',
    group: 'basic',
    label: 'Lista numerada',
    aliases: ['numero', 'number', 'ol', 'ordenada'],
    description: 'Item numerado',
    snippet: '1. ',
    cursorOffset: 3,
    surfaces: ['slash', 'insert'],
  },
  {
    id: 'task-list',
    group: 'basic',
    label: 'Lista de tareas',
    aliases: ['todo', 'tarea', 'check', 'checkbox'],
    description: 'Checkbox pendiente',
    snippet: '- [ ] ',
    cursorOffset: 6,
    surfaces: ['slash', 'insert'],
  },
  {
    id: 'quote',
    group: 'basic',
    label: 'Cita',
    aliases: ['quote', 'cita'],
    description: 'Bloque citado',
    snippet: '> ',
    cursorOffset: 2,
    surfaces: ['slash', 'insert'],
  },
  {
    id: 'divider',
    group: 'basic',
    label: 'Separador',
    aliases: ['hr', 'linea', 'divider', 'separador'],
    description: 'Linea horizontal',
    snippet: '---',
    cursorOffset: 3,
    surfaces: ['slash', 'insert'],
  },
  {
    id: 'code-block',
    group: 'structure',
    label: 'Codigo',
    aliases: ['code', 'codigo', 'bloque'],
    description: 'Bloque de codigo',
    snippet: '```\n\n```',
    cursorOffset: 4,
    surfaces: ['slash', 'insert'],
  },
  {
    id: 'table',
    group: 'structure',
    label: 'Tabla simple',
    aliases: ['table', 'tabla'],
    description: 'Tabla Markdown 2x2',
    snippet: '| Header | Header |\n| ------ | ------ |\n| Cell   | Cell   |',
    cursorOffset: 2,
    selectLength: 6,
    surfaces: ['slash', 'insert'],
  },
  {
    id: 'link',
    group: 'structure',
    label: 'Link',
    aliases: ['link', 'enlace', 'url'],
    description: 'Enlace Markdown',
    snippet: '[texto](url)',
    cursorOffset: 1,
    selectLength: 5,
    surfaces: ['slash', 'insert'],
  },
  {
    id: 'today',
    group: 'utility',
    label: 'Fecha de hoy',
    aliases: ['fecha', 'date', 'hoy'],
    description: 'Inserta YYYY-MM-DD',
    snippet: () => formatLocalDate(),
    surfaces: ['slash', 'insert'],
  },
  createCalloutCommand({
    id: 'note',
    label: 'Nota',
    type: 'note',
    aliases: ['nota', 'destacado'],
    description: 'Callout general',
  }),
  createCalloutCommand({
    id: 'info',
    label: 'Info',
    type: 'info',
    aliases: ['informacion'],
    description: 'Dato aclaratorio',
  }),
  createCalloutCommand({
    id: 'todo',
    label: 'Tarea',
    type: 'todo',
    aliases: ['tarea', 'pendiente'],
    description: 'Accion pendiente',
  }),
  createCalloutCommand({
    id: 'important',
    label: 'Importante',
    type: 'important',
    aliases: ['importante'],
    description: 'Punto clave',
  }),
  createCalloutCommand({
    id: 'question',
    label: 'Pregunta',
    type: 'question',
    aliases: ['pregunta', 'duda'],
    description: 'Duda para resolver',
  }),
  createCalloutCommand({
    id: 'warning',
    label: 'Advertencia',
    type: 'warning',
    aliases: ['advertencia', 'cuidado', 'warning'],
    description: 'Atencion o riesgo',
  }),
  createCalloutCommand({
    id: 'example',
    label: 'Ejemplo',
    type: 'example',
    aliases: ['ejemplo'],
    description: 'Caso o ejercicio',
  }),
  createCalloutCommand({
    id: 'quote',
    label: 'Cita destacada',
    type: 'quote',
    aliases: ['cita'],
    description: 'Referencia textual',
  }),
  ...INLINE_COMMANDS,
]

export function getCommandGroupLabel(groupId) {
  return EDITOR_COMMAND_GROUPS.find(group => group.id === groupId)?.label || ''
}

export function getEditorCommandsForSurface(surface) {
  return EDITOR_COMMANDS
    .filter(command => command.surfaces.includes(surface))
    .map(command => ({
      ...command,
      groupLabel: getCommandGroupLabel(command.group),
      ...getCommandVisual(command),
    }))
}

export function getCommandSnippet(command) {
  if (!command) return ''
  return typeof command.snippet === 'function' ? command.snippet() : (command.snippet || '')
}

function getCommandVisual(command) {
  if (command.group === 'callout') {
    return { icon: command.id, hint: '>' }
  }
  if (command.group === 'inline') {
    return { icon: command.id, hint: command.before || '' }
  }
  return COMMAND_VISUALS[command.id] || { icon: 'text' }
}
