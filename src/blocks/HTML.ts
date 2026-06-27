import type { Block } from 'payload'

export const HTML: Block = {
  slug: 'html',
  interfaceName: 'HTMLBlock',
  fields: [
    {
      name: 'code',
      type: 'code',
      admin: { language: 'html' },
      required: true,
    },
  ],
}

