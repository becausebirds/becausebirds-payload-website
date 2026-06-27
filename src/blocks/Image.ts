import type { Block } from 'payload'

export const ImageBlock: Block = {
  slug: 'image',
  interfaceName: 'ImageBlock',
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media', // your Media collection
      required: true,
    },
    { name: 'caption', type: 'richText', required: false },
    { name: 'alt', type: 'text' },
  ],
}
