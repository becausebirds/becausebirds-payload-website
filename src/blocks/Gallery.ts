import type { Block } from 'payload'

export const Gallery: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  fields: [
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            // This prevents the upload field from re-rendering unnecessarily
            condition: (data, siblingData) => true,
          },
        },
        { 
          name: 'caption', 
          type: 'richText' 
        },
        { 
          name: 'alt', 
          type: 'text' 
        },
      ],
    },
    {
      name: 'columns',
      type: 'select',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
      defaultValue: '3',
    },
  ],
}
