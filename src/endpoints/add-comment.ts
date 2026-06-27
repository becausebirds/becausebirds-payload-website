// src/endpoints/add-comment.ts
import type { PayloadHandler } from 'payload'

export const addCommentHandler: PayloadHandler = async (req): Promise<Response> => {
  const { payload } = req
  const body = await req.json?.() ?? req.body

  // Only check in 'posts' collection for replyPost validation
  const postCollections = ['posts'] as const

  if (!postCollections.length) {
    return Response.json({ saved: false, error: 'Your site is not configured to accept your submission.' })
  }

  // Validate replyPost exists in the posts collection
  if (body?.replyPost) {
    let found = false
    for (const collection of postCollections) {
      const result = await payload.find({
        collection,
        limit: 1,
        where: { id: { equals: body.replyPost } },
      })
      if (result.docs?.length > 0) {
        found = true
        break
      }
    }
    if (!found) {
      return Response.json({ saved: false, error: 'We were unable to find a target for your submission.' })
    }
  }

  // Determine auto-approval
  const autoPublish = false // ← set from config if needed
  const autoPublishConditions: string[] = []
  let isApproved = false

  if (autoPublish && body && typeof body === 'object') {
    if (!autoPublishConditions?.length) {
      isApproved = true
    } else {
      isApproved = autoPublishConditions.filter((cond) => !body[cond]).length === 0
    }
  }

  // Build comment data from fields present in body
  const fields = ['author', 'email', 'content', 'replyPost', 'replyComment']
  const commentData: Record<string, unknown> = { isApproved, date: new Date().toISOString() }
  for (const field of fields) {
    if (body[field]) {
      // Convert relationship IDs to numbers if they're numeric strings
      if ((field === 'replyPost' || field === 'replyComment') && typeof body[field] === 'string') {
        const numId = parseInt(body[field], 10)
        commentData[field] = isNaN(numId) ? body[field] : numId
      } else {
        commentData[field] = body[field]
      }
    }
  }

  const newComment = await payload.create({
    collection: 'comments',
    data: commentData,
  })

  if (!newComment) {
    return Response.json({ saved: false, error: 'We encountered an unexpected error while processing your submission.' })
  }

  // Optional: send email alert
  // if (sendAlert) { ... }

  return Response.json({ saved: true, isApproved }, { status: 200 })
}
