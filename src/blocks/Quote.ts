import type { Block } from 'payload'

export const Quote: Block = {
  slug: 'quote',
  interfaceName: 'QuoteBlock',
  fields: [
    { name: 'text', type: 'textarea', required: true },
    { name: 'citation', type: 'text' },
  ],
}
