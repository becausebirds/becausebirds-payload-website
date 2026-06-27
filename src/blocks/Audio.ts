import type { Block } from 'payload'

export const Audio: Block = {
  slug: 'audio',
  interfaceName: 'AudioBlock',
  fields: [
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    { name: 'caption', type: 'text' },
    {
      name: 'autoplay',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
