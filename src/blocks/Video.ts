import type { Block } from 'payload'

export const Video: Block = {
  slug: 'video',
  interfaceName: 'VideoBlock',
  fields: [
    {
      name: 'source',
      type: 'select',
      options: ['upload', 'youtube', 'vimeo', 'url'],
      defaultValue: 'upload',  // default to upload
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      // No condition — always mounted, drawer stays alive
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.source !== 'upload',
        description: 'YouTube, Vimeo, or direct video URL',
      },
    },
    { name: 'caption', type: 'text' },
  ],
}

