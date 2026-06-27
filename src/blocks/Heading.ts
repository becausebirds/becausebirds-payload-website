import type { Block } from 'payload'

export const Heading: Block = {
  slug: 'heading',
  interfaceName: 'HeadingBlock',
  fields: [
    {
      name: 'text',
      type: 'text',
      required: true,
    },
    {
      name: 'level',
      type: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      defaultValue: 'h2',
    },
{
      name: 'anchorId',
      type: 'text',
      label: 'Anchor ID (for linking)',
      admin: {
        description: 'e.g., "my-section" - will create a link like #my-section',
      },
    },
  ],
}
