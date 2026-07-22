import type { CollectionConfig } from 'payload'
import path from 'path'
import { BskyAgent } from '@atproto/api'
import { RichText } from '@atproto/api'

const crosspostToBluesky: CollectionConfig['hooks'] = {
  afterChange: [
    async ({ doc, operation, req }) => {
      if (operation !== 'create') return
      console.log('[DEBUG] Hook triggered for doc:', doc.id)

      const handle = process.env.BLUESKY_HANDLE
      const password = process.env.BLUESKY_APP_PASSWORD
      if (!handle || !password) {
        console.error('[DEBUG] Bluesky credentials missing')
        return
      }

      try {
        const agent = new BskyAgent({ service: 'https://bsky.social' })
        await agent.login({ identifier: handle, password })
        console.log('[DEBUG] Logged into Bluesky')

        const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://becausebirds.com'
        const postUrl = `${siteUrl}/microblog/${doc.slug || doc.id}`

        // Build text with link
        const textWithLink = `${doc.content}\n\n${postUrl}`

        let embed: any = undefined

        if (doc.images && doc.images.length > 0) {
          const firstImage = doc.images[0]
          const mediaDoc = firstImage.image  // ✅ Already the full object

          if (mediaDoc?.filename) {
            const filePath = path.join(process.cwd(), 'public', 'media', mediaDoc.filename)

            try {
              const fileBuffer = await require('fs').promises.readFile(filePath)
              const mimeType = mediaDoc.mimeType || 'image/jpeg'

              const upload = await agent.uploadBlob(fileBuffer, { encoding: mimeType })

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

        // Use RichText to properly parse facets
        const rt = new RichText({ text: textWithLink })
        await rt.detectFacets(agent)

        await agent.post({
          text: textWithLink,
          facets: rt.facets,
          embed: embed,
          createdAt: new Date().toISOString(),
        })
        console.log('[DEBUG] Post successfully sent to Bluesky')
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
    { name: 'content', type: 'textarea', required: true, maxLength: 300 },
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
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'alt', type: 'text', label: 'Alt Text' },
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
    { name: 'publishedAt', type: 'date', defaultValue: () => new Date() },
  ],
  hooks: crosspostToBluesky,
  timestamps: true,
}
