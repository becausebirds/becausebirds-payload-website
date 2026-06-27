import type { Block } from 'payload'

export const Spacer: Block = {
  slug: 'spacer',
  interfaceName: 'SpacerBlock',
  fields: [
    {
      name: 'height',
      type: 'number',
      admin: { description: 'Height in pixels' },
    },
  ],
}
