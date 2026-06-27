import type { Block } from 'payload'

export const Group: Block = {
  slug: 'group',
  interfaceName: 'GroupBlock',
  fields: [
    { name: 'label', type: 'text' },
    {
      name: 'backgroundColor',
      type: 'text',
      admin: { description: 'Hex or CSS color value' },
    },
    {
      name: 'innerBlocks',
      type: 'richText',
      admin: { description: 'Grouped content' },
    },
  ],
}
