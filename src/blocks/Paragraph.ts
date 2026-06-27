import type { Block } from 'payload'

export const Paragraph: Block = {
  slug: 'paragraph',
  interfaceName: 'ParagraphBlock',
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
  ],
}
