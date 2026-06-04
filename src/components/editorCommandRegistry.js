// =============================================================
// editorCommandRegistry — Catalogo unico de comandos del editor
// Fase 1: Slash menu enriquecido
// =============================================================

export const EDITOR_COMMAND_GROUPS = [
  { id: 'basic', label: 'Bloques basicos' },
  { id: 'structure', label: 'Estructura' },
  { id: 'utility', label: 'Utiles' },
]

function formatLocalDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
    surfaces: ['slash'],
  },
  {
    id: 'heading-1',
    group: 'basic',
    label: 'Encabezado 1',
    aliases: ['h1', 'titulo', 'title'],
    description: 'Titulo principal',
    snippet: '# ',
    cursorOffset: 2,
    surfaces: ['slash'],
  },
  {
    id: 'heading-2',
    group: 'basic',
    label: 'Encabezado 2',
    aliases: ['h2', 'subtitulo', 'subtitle'],
    description: 'Subtitulo',
    snippet: '## ',
    cursorOffset: 3,
    surfaces: ['slash'],
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
    surfaces: ['slash'],
  },
  {
    id: 'numbered-list',
    group: 'basic',
    label: 'Lista numerada',
    aliases: ['numero', 'number', 'ol', 'ordenada'],
    description: 'Item numerado',
    snippet: '1. ',
    cursorOffset: 3,
    surfaces: ['slash'],
  },
  {
    id: 'task-list',
    group: 'basic',
    label: 'Lista de tareas',
    aliases: ['todo', 'tarea', 'check', 'checkbox'],
    description: 'Checkbox pendiente',
    snippet: '- [ ] ',
    cursorOffset: 6,
    surfaces: ['slash'],
  },
  {
    id: 'quote',
    group: 'basic',
    label: 'Cita',
    aliases: ['quote', 'cita'],
    description: 'Bloque citado',
    snippet: '> ',
    cursorOffset: 2,
    surfaces: ['slash'],
  },
  {
    id: 'divider',
    group: 'basic',
    label: 'Separador',
    aliases: ['hr', 'linea', 'divider', 'separador'],
    description: 'Linea horizontal',
    snippet: '---',
    cursorOffset: 3,
    surfaces: ['slash'],
  },
  {
    id: 'code-block',
    group: 'structure',
    label: 'Codigo',
    aliases: ['code', 'codigo', 'bloque'],
    description: 'Bloque de codigo',
    snippet: '```\n\n```',
    cursorOffset: 4,
    surfaces: ['slash'],
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
    surfaces: ['slash'],
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
    surfaces: ['slash'],
  },
  {
    id: 'today',
    group: 'utility',
    label: 'Fecha de hoy',
    aliases: ['fecha', 'date', 'hoy'],
    description: 'Inserta YYYY-MM-DD',
    snippet: () => formatLocalDate(),
    surfaces: ['slash'],
  },
  {
    id: 'callout',
    group: 'utility',
    label: 'Destacado',
    aliases: ['callout', 'destacado', 'nota'],
    description: 'Bloque resaltado',
    snippet: '> [!nota]\n> ',
    cursorOffset: 12,
    surfaces: ['slash'],
  },
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
    }))
}

export function getCommandSnippet(command) {
  if (!command) return ''
  return typeof command.snippet === 'function' ? command.snippet() : (command.snippet || '')
}

