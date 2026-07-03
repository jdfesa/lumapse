export type InlineCommandId = 'bold' | 'italic' | 'strike' | 'code' | 'link'

export type InlineCommand = {
  id: `inline-${InlineCommandId}`
  group: 'inline'
  label: string
  aliases: string[]
  description: string
  before: string
  after: string
  placeholder: string
  selectTarget?: string
  surfaces: ['inline']
}

type InlineCommandConfig = {
  id: InlineCommandId
  label: string
  aliases: string[]
  description: string
  before: string
  after: string
  placeholder: string
  selectTarget?: string
}

function createInlineCommand({
  id,
  label,
  aliases,
  description,
  before,
  after,
  placeholder,
  selectTarget,
}: InlineCommandConfig): InlineCommand {
  return {
    id: `inline-${id}`,
    group: 'inline',
    label,
    aliases,
    description,
    before,
    after,
    placeholder,
    selectTarget,
    surfaces: ['inline'],
  }
}

export const INLINE_COMMANDS: InlineCommand[] = [
  createInlineCommand({
    id: 'bold',
    label: 'Negrita',
    aliases: ['bold', 'negrita'],
    description: 'Texto fuerte',
    before: '**',
    after: '**',
    placeholder: 'texto',
  }),
  createInlineCommand({
    id: 'italic',
    label: 'Cursiva',
    aliases: ['italic', 'cursiva'],
    description: 'Texto enfatizado',
    before: '*',
    after: '*',
    placeholder: 'texto',
  }),
  createInlineCommand({
    id: 'strike',
    label: 'Tachado',
    aliases: ['strike', 'tachado'],
    description: 'Texto tachado',
    before: '~~',
    after: '~~',
    placeholder: 'texto',
  }),
  createInlineCommand({
    id: 'code',
    label: 'Codigo inline',
    aliases: ['code', 'codigo'],
    description: 'Fragmento de codigo',
    before: '`',
    after: '`',
    placeholder: 'codigo',
  }),
  createInlineCommand({
    id: 'link',
    label: 'Link',
    aliases: ['link', 'enlace', 'url'],
    description: 'Enlace sobre texto',
    before: '[',
    after: '](url)',
    placeholder: 'texto',
    selectTarget: 'url',
  }),
]
