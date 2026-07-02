import type { Block } from 'payload'

export const Buttons: Block = {
  slug: 'buttons',
  interfaceName: 'ButtonsBlock',
  fields: [
    {
      name: 'buttons',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'text', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
        { name: 'target', type: 'select', options: ['_self', '_blank'], defaultValue: '_self' },
        { name: 'style', type: 'select', options: ['primary', 'secondary', 'neutral'], defaultValue: 'primary' },
      ],
    },
    {
      name: 'align',
      type: 'select',
      options: ['left', 'center', 'right'],
      defaultValue: 'left',
    },
  ],
}
