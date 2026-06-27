import type { Block } from 'payload'

export const Embed: Block = {
  slug: 'embed',
  interfaceName: 'EmbedBlock',
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: { description: 'oEmbed-compatible URL (YouTube, Twitter, etc.)' },
    },
    { name: 'caption', type: 'text' },
  ],
}
