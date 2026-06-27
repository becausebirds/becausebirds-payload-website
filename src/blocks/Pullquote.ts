import type { Block } from 'payload'

export const Pullquote: Block = {
  slug: 'pullquote',
  interfaceName: 'PullquoteBlock',
  fields: [
    { name: 'text', type: 'textarea', required: true },
    { name: 'citation', type: 'text' },
    {
      name: 'align',
      type: 'select',
      options: ['left', 'center', 'right'],
      defaultValue: 'center',
    },
  ],
}
