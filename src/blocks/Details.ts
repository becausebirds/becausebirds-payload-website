import type { Block } from 'payload'

export const Details: Block = {
  slug: 'details',
  interfaceName: 'DetailsBlock',
  fields: [
    { name: 'summary', type: 'text', required: true },
    { name: 'content', type: 'richText', required: true },
    {
      name: 'openByDefault',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
