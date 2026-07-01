// micropubMedia.ts
import type { PayloadHandler } from 'payload'

export const micropubMedia: PayloadHandler = async (req) => {
  // Auth check — same as your post handler
  const authHeader = req.headers.get('authorization')
  const expectedToken = process.env.MICROPUB_TOKEN
  if (!authHeader || !authHeader.startsWith('Bearer ') || !expectedToken) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (authHeader.slice(7) !== expectedToken) {
    return Response.json({ error: 'forbidden' }, { status: 403 })
  }

  // Get the uploaded file from multipart form
  if (!req.formData) {
    return Response.json({ error: 'formData not available' }, { status: 400 })
  }
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return Response.json({ error: 'file is required' }, { status: 400 })
  }

  // Upload to your Payload media collection
  const payload = await req.payload
  const media = await payload.create({
    collection: 'media',
    data: {},
    file: {
      data: Buffer.from(await file.arrayBuffer()),
      mimetype: file.type,
      name: file.name,
      size: file.size,
    },
  })

  const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 
'https://becausebirds.com'
  const mediaUrl = `${siteUrl}${media.url}`

  return new Response(mediaUrl, {
    status: 201,
    headers: { 'Content-Type': 'text/plain' },
  })
}
