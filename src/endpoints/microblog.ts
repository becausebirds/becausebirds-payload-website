import type { PayloadHandler } from 'payload'

export const micropubPost: PayloadHandler = async (req) => {
  // 1. Validate Bearer token against env variable
  const authHeader = req.headers.get('authorization')
  const expectedToken = process.env.MICROPUB_TOKEN

  if (
    !authHeader ||
    !authHeader.startsWith('Bearer ') ||
    !expectedToken
  ) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const token = authHeader.slice(7)

  if (token !== expectedToken) {
    return Response.json({ error: 'forbidden' }, { status: 403 })
  }

  // 2. Parse the form/JSON body
  const contentType = req.headers.get('content-type') || ''
  let content: string

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await req.formData?.()
    content = formData?.get('content') as string || ''
  } else if (contentType.includes('application/json')) {
    const json = await req.json?.()
    content = json?.content || json?.properties?.content?.[0] || ''
  } else {
    return Response.json({ error: 'unsupported content type' }, { status: 400 })
  }

  if (!content?.trim()) {
    return Response.json({ error: 'content is required' }, { status: 400 })
  }

  // 3. Create the micropost
  const payload = await req.payload
  const doc = await payload.create({
    collection: 'microposts',
    data: { content: content.trim() },
  })

  const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://becausebirds.com'
  const postUrl = `${siteUrl}/microblog/${doc.slug || doc.id}`

  return new Response(null, {
    status: 201,
    headers: { Location: postUrl },
  })
}

export const micropubGet: PayloadHandler = async () => {
  const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://becausebirds.com'
  return Response.json({
    'media-endpoint': `${siteUrl}/api/micropub/media`,
    'syndicate-to': [
      { uid: 'bluesky', name: 'Bluesky' },
    ],
    'post-types': [
      { type: 'entry', name: 'Note' },
    ],
  })
}
