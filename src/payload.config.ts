import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import postmarkTransport from 'nodemailer-postmark-transport'
import { createTransport } from 'nodemailer'

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
import { BirdChecklists } from './collections/BirdChecklists'
import { BirdChecklistBlock } from './blocks/BirdChecklist'
import { Birds } from './collections/Birds'
import { BirdMedia } from './collections/BirdMedia'

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
  collections: [Posts, Pages, Quizzes, Media, BirdMedia, Comments, Visitors,
BirdChecklists, Birds, Categories, Tags, Products, Users, Microposts],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  endpoints: [
                {
                  path: '/micropub',
                  method: 'get',
                  handler: async () => {
                    const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://becausebirds.com'
                    return Response.json({
                      'media-endpoint': `${siteUrl}/api/micropub`,
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
                    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.slice(7) !== validToken) {
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
                    } else if (contentType.includes('multipart/form-data')) {
                      const formData = await req.formData!()
                      content = (formData.get('content') as string) || ''

                      // Handle photo upload
                      const photoFile = formData.get('photo') as File | null
                      if (photoFile && photoFile.size > 0) {
                        const payload = await req.payload
                        const mediaDoc = await payload.create({
                          collection: 'media',
                          data: {},
                          file: {
                            name: photoFile.name,
                            data: Buffer.from(await photoFile.arrayBuffer()),
                            mimetype: photoFile.type,
                            size: photoFile.size,
                          },
                        })
                        console.log('mediaDoc:', JSON.stringify(mediaDoc, null, 2))
                        photoUrls = [String(mediaDoc.id)]
                      }

                      // Handle video upload
                      const videoFile = formData.get('video') as File | null
                      if (!photoFile && videoFile && videoFile.size > 0) {
                        const payload = await req.payload
                        const mediaDoc = await payload.create({
                          collection: 'media',
                          data: {},
                          file: {
                            name: videoFile.name,
                            data: Buffer.from(await videoFile.arrayBuffer()),
                            mimetype: videoFile.type,
                            size: videoFile.size,
                          },
                        })
                        photoUrls = [String(mediaDoc.id)]
                      }
                    } else {
                      return Response.json({ error: 'unsupported content type' }, { status:
                            400 })
                        }

                        if (!content?.trim()) {
                          return Response.json({ error: 'content is required' }, { status: 400     })
                        }
                        const payload = await req.payload
                        const doc = await payload.create({
                          collection: 'microposts',
                          data: {
                            content: content.trim(),
                            images: photoUrls.map((id) => ({ image: id })),
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
  path: '/birds-with-data',
  method: 'get',
  handler: async (req) => {
    const payload = await req.payload

    const { docs: birds } = await payload.find({
      collection: 'birds',
      limit: 10000,
      depth: 0,
    })

    const { docs: checklists } = await payload.find({
      collection: 'bird-checklists',
      limit: 1000,
      depth: 1, // Increased depth to populate speciesRecords
    })

    // Build set of bird IDs
    const checklistBirdIds = new Set<string>()
    checklists.forEach((c: any) => {
      c.speciesRecords?.forEach((r: any) => {
        // Safely extract bird ID whether populated or not
        const birdId = typeof r.bird === 'object' && r.bird !== null ? r.bird.id : r.bird
        if (birdId) checklistBirdIds.add(String(birdId))
      })
    })

    // Filter: Must be in checklist AND not contain 'sp.'
    const filtered = birds
      .filter((b: any) => checklistBirdIds.has(String(b.id)) && !b.comName.includes('sp.'))
      .map((b: any) => ({ 
        id: String(b.id), 
        comName: b.comName, 
        sciName: b.sciName, 
        speciesCode: b.speciesCode, 
        slug: b.slug 
      }))

    return Response.json({ docs: filtered, totalDocs: filtered.length })
  },
},

{
  path: '/bird-details/batch',
  method: 'post',
  handler: async (req) => {
    const body = await req.json?.() ?? {}
    const { ids } = body
    if (!ids || !Array.isArray(ids)) {
      return Response.json({ error: 'ids array required' }, { status: 400 })
    }
    const payload = await req.payload
    const numericIds = ids.map((id: string) => parseInt(id))
    const [checklistsRes, mediaRes] = await Promise.all([
      payload.find({
        collection: 'bird-checklists',
        where: { 'speciesRecords.bird': { in: numericIds } },
        depth: 1,
        limit: 10000,
      }),
      payload.find({
        collection: 'bird-media',
        where: { species: { in: numericIds } },
        depth: 2,
        limit: 10000,
      }),
    ])

    // Build details map per bird
    const detailsMap = new Map<string, any>()

    // Group checklists by bird
    const checklistsByBird = new Map<string, any[]>()
    for (const checklist of checklistsRes.docs) {
      for (const record of (checklist as any).speciesRecords ?? []) {
        const birdId = String(record.bird?.id ?? record.bird)
        const arr = checklistsByBird.get(birdId) || []
        arr.push(checklist)
        checklistsByBird.set(birdId, arr)
      }
    }

    // Group media by bird
    const mediaByBird = new Map<string, any[]>()
    for (const m of mediaRes.docs) {
      const birdId = String((m as any).species?.id ?? (m as any).species)
      const arr = mediaByBird.get(birdId) || []
      arr.push(m)
      mediaByBird.set(birdId, arr)
    }

    // Merge all bird IDs
    const allBirdIds = new Set([...checklistsByBird.keys(), ...mediaByBird.keys()])

    for (const birdId of allBirdIds) {
      const checklists = checklistsByBird.get(birdId) ?? []
      const media = mediaByBird.get(birdId) ?? []

      const photos = media
        .filter((m: any) => m.mimeType?.startsWith('image/'))
        .sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0))

      const audios = media.filter((m: any) => m.mimeType?.startsWith('audio/'))

      const sortedChecklists = [...checklists].sort(
        (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      const newestChecklist = sortedChecklists[0] ?? null
      const oldestChecklist = sortedChecklists[sortedChecklists.length - 1] ?? null

      const locations = [...new Set(
        checklists.map((c: any) => c.state).filter(Boolean)
      )]

      const lastDateRaw = newestChecklist?.date ?? null

      detailsMap.set(birdId, {
        topPhotoUrl: photos[0]?.url ?? null,
        firstLocation: oldestChecklist?.locationName ?? null,
        firstDate: oldestChecklist?.date ?? null,
        lastDate: lastDateRaw,
        lastDateFormatted: lastDateRaw
          ? new Date(lastDateRaw).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric',
            })
          : null,
        checklistCount: checklists.length,
        photoCount: photos.length,
        audioCount: audios.length,
        locations,
      })
    }

    return Response.json(Object.fromEntries(detailsMap))
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

  // Use Postmark when token is available (prod), fall back to Ethereal (build/dev)
  email: process.env.POSTMARK_SERVER_TOKEN
    ? nodemailerAdapter({
        defaultFromAddress: 'jeff@becausebirds.com',
        defaultFromName: 'Because Birds',
        transport: createTransport(
          postmarkTransport({
            auth: {
              apiKey: process.env.POSTMARK_SERVER_TOKEN,
            },
          })
        ),
      })
    : nodemailerAdapter({
        defaultFromAddress: 'jeff@becausebirds.com',
        defaultFromName: 'Because Birds',
        // No transport config = automatically uses Ethereal (dev-friendly, no API key needed)
      }),
})
