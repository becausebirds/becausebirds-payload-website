// collections/Microposts.ts
import type { CollectionConfig } from 'payload'
import path from 'path'
import { BskyAgent } from '@atproto/api'
import { RichText } from '@atproto/api'

const crosspostToBluesky: CollectionConfig['hooks'] = {
  afterChange: [
    async ({ doc, operation, req }) => {
      if (operation !== 'create') return
      console.log('[Microposts HOOK] FIRED for operation:', operation, 'doc id:', doc.id)

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

        const textWithLink = `${doc.content}\n\n${postUrl}`

        let embed: any = undefined

        if (doc.images && doc.images.length > 0) {
          const firstImage = doc.images[0]
          const mediaDoc = firstImage.image

          if (mediaDoc?.filename) {
            const filePath = path.join(process.cwd(), 'public', 'media', mediaDoc.filename)

            try {
              const fileBuffer = await require('fs').promises.readFile(filePath)
              const mimeType = mediaDoc.mimeType || 'image/jpeg'

              const upload = await agent.uploadBlob(fileBuffer, { encoding: mimeType })

              const bskyPostId = response.uri.split('/').pop()
              const bskyUrl = `https://bsky.app/profile/${handle}/post/${bskyPostId}`

              embed = {
                $type: 'app.bsky.embed.images',
                images: [
                  {
                    image: upload.data.blob,
                    alt: firstImage.alt || 'Micro post image',
                  },
                ],
              }
            } catch (fileErr) {
              console.error('[DEBUG] Failed to read media file:', filePath, fileErr)
            }
          }
        }

        const rt = new RichText({ text: textWithLink })
        await rt.detectFacets(agent)

        await agent.post({
          text: textWithLink,
          facets: rt.facets,
          embed: embed,
          createdAt: new Date().toISOString(),
        })

        console.log('[Microposts] ✅ Cross-posted to Bluesky')
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
    defaultColumns: ['content', 'publishedAt', 'slug'],
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
        { name: 'alt', type: 'text', label: 'Alt Text' },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      defaultValue: () => new Date(),
    },
    {
  name: 'syndicatedTo',
  type: 'array',
  fields: [
    {
      name: 'platform',
      type: 'text',
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      required: true,
    },
  ],
},
  ],
  hooks: crosspostToBluesky,
  timestamps: true,
}
