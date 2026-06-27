import type { Block } from 'payload'

export const List: Block = {
  slug: 'list',
  interfaceName: 'ListBlock',
  fields: [
    {
      name: 'style',
      type: 'select',
      options: ['unordered', 'ordered'],
      defaultValue: 'unordered',
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'text', type: 'richText', required: true },
      ],
    },
  ],
}
