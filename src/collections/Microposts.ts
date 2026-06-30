import type { CollectionConfig } from 'payload'
import { BskyAgent } from '@atproto/api'

const crosspostToBluesky: CollectionConfig['hooks'] = {
  afterChange: [
    async ({ doc, operation }) => {
      console.log('[Microposts HOOK] FIRED for operation:', operation, 'doc id:', doc.id)

      if (operation !== 'create') return

      const handle = process.env.BLUESKY_HANDLE
      const password = process.env.BLUESKY_APP_PASSWORD
      if (!handle || !password) {
        console.warn('[Microposts] Bluesky env vars not set — skipping cross-post')
        return
      }

      try {
        const agent = new BskyAgent({ service: 'https://bsky.social' })
        await agent.login({ identifier: handle, password })

        const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://becausebirds.com'
        const postUrl = `${siteUrl}/microblog/${doc.slug || doc.id}`

        const response = await agent.post({
          text: doc.content,
          facets: [
            {
              index: {
                byteStart: doc.content.length,
                byteEnd: doc.content.length,
              },
              features: [
                {
                  $type: 'app.bsky.richtext.facet#link',
                  uri: postUrl,
                },
              ],
            },
          ],
          createdAt: new Date().toISOString(),
        })

        const bskyPostId = response.uri.split('/').pop()
        const bskyUrl = `https://bsky.app/profile/${handle}/post/${bskyPostId}`

        console.log(`[Microposts] ✅ Cross-posted to Bluesky: ${bskyUrl}`)
      } catch (err) {
        console.error('[Microposts] Bluesky cross-post failed:', err)
      }
    },
  ],
}

export const Microposts: CollectionConfig = {
  slug: 'microposts',
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['content', 'createdAt', 'syndicatedTo'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'content',
      type: 'textarea',
      required: true,
      maxLength: 300,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: { position: 'sidebar' },
      hooks: {
        beforeChange: [
          ({ data }) =>
            data?.content
              ?.toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/[\s_]+/g, '-')
              .replace(/-+/g, '-')
              .slice(0, 60) || '',
        ],
      },
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'syndicatedTo',
      type: 'array',
      fields: [
        { name: 'platform', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      defaultValue: () => new Date(),
    },
  ],
  hooks: crosspostToBluesky,
  timestamps: true,
}
