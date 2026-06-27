import type { Block } from 'payload'

export const Columns: Block = {
  slug: 'columns',
  interfaceName: 'ColumnsBlock',
  fields: [
    {
      name: 'columns',
      type: 'array',
      minRows: 2,
      maxRows: 6,
      fields: [
        {
          name: 'content',
          type: 'richText',
        },
        {
          name: 'width',
          type: 'select',
          options: ['25', '33', '50', '66', '75', '100'],
          defaultValue: '50',
        },
      ],
    },
  ],
}
