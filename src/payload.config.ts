import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Archive } from './blocks/ArchiveBlock/config'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Microposts } from './collections/Microposts'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import Products from './collections/Products'
import Quizzes from './collections/Quizzes'
import { Comments } from './collections/Comments'
import { Users } from './collections/Users'
import { Visitors } from './collections/Visitors'
import { Tags } from './collections/Tags'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { QuizBlock } from '@/blocks/Quiz/config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // beforeLogin: ['@/components/BeforeLogin'],
      // beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other
  // editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    push: true,
  }),
  collections: [Pages, Posts, Quizzes, Media, Comments, Visitors, Categories,
  Tags, Products, Users, Microposts],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  endpoints: [
    {
      path: '/micropub',
      method: 'get',
      handler: async () => {
        const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL ||
'https://becausebirds.com'
        return Response.json({
          'media-endpoint': `${siteUrl}/api/micropub/media`,
          'syndicate-to': [
            { uid: 'bluesky', name: 'Bluesky' },
          ],
          'post-types': [
            { type: 'entry', name: 'Note' },
          ],
        })
      },
    },
    {
      path: '/micropub',
      method: 'post',
      handler: async (req) => {
        const validToken = process.env.MICROPUB_TOKEN
        const authHeader = req.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ') ||
authHeader.slice(7) !== validToken) {
          return Response.json({ error: 'unauthorized' }, { status: 401 })
        }

        const contentType = req.headers.get('content-type') || ''
        let content = ''
        let photoUrls: string[] = []

        if (contentType.includes('application/x-www-form-urlencoded')) {
          const formData = await req.formData!()
          content = (formData.get('content') as string) || ''
        } else if (contentType.includes('application/json')) {
          const json = await req.json!()
          if (json.properties) {
            // Micropub JSON format
            content = json.properties.content?.[0] || ''
            photoUrls = json.properties.photo || []
          } else {
            content = json.content || ''
            photoUrls = json.photo || []
          }
        } else {
          return Response.json({ error: 'unsupported content type' }, { status:
400 })
        }

        if (!content?.trim()) {
          return Response.json({ error: 'content is required' }, { status: 400
})
        }

        const payload = await req.payload
        const doc = await payload.create({
          collection: 'microposts',
          data: {
            content: content.trim(),
            images: photoUrls.map((url: string) => ({ image: url })),
          } as any,
        })

        const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL ||
'https://becausebirds.com'
        const postUrl = `${siteUrl}/microblog/${doc.slug || doc.id}`

        return new Response(null, {
          status: 201,
          headers: { Location: postUrl },
        })
      },
    },
    {
      path: '/micropub/media',
      method: 'post',
      handler: async (req) => {
        const validToken = process.env.MICROPUB_TOKEN
        const authHeader = req.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ') ||
authHeader.slice(7) !== validToken) {
          return Response.json({ error: 'unauthorized' }, { status: 401 })
        }

        try {
          const formData = await req.formData!()
          const file = formData.get('file') as File | null
          if (!file) {
            return Response.json({ error: 'file is required' }, { status: 400 })
          }

          const arrayBuffer = await file.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)

          const payload = await req.payload
          const mediaDoc = await payload.create({
            collection: 'media',
            data: {},
            file: {
              name: file.name,
              data: buffer,
              mimetype: file.type,
              size: buffer.length,
            },
          })

          const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL ||
'https://becausebirds.com'
          return new Response(null, {
            status: 201,
            headers: { Location: `${siteUrl}${mediaDoc.url}` },
          })
        } catch (err) {
          console.error('[Micropub Media] Upload failed:', err)
          return Response.json({ error: 'upload failed' }, { status: 500 })
        }
      },
    },
  ],
  plugins: [
    ...plugins,
    //    comments(),
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
