import type { Block } from 'payload'

export const Code: Block = {
  slug: 'code',
  interfaceName: 'CodeBlock',
  fields: [
    { name: 'code', type: 'code', required: true },
    {
      name: 'language',
      type: 'select',
      options: ['javascript', 'typescript', 'php', 'bash', 'css', 'html', 'python'],
    },
  ],
}
