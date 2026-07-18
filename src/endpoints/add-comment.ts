// src/endpoints/add-comment.ts
import type { PayloadHandler } from 'payload'

export const addCommentHandler: PayloadHandler = async (req): Promise<Response> => {
  const { payload } = req
  const body = await req.json?.() ?? req.body

  // Resolve which entity this comment belongs to
  let resolvedReplyPost: string | undefined
  let resolvedReplyBird: string | undefined

  // Smart routing: check posts first, then birds
  if (body?.replyPost) {
    const rawId = String(body.replyPost).trim()

    // Check posts collection
    const postResult = await payload.find({
      collection: 'posts',
      limit: 1,
      where: { id: { equals: rawId } },
    })
    if (postResult.docs?.length > 0) {
      resolvedReplyPost = rawId
    } else {
      // Fallback: check birds collection
      const birdResult = await payload.find({
        collection: 'birds',
        limit: 1,
        where: { id: { equals: rawId } },
      })
      if (birdResult.docs?.length > 0) {
        resolvedReplyBird = rawId
      } else {
        return Response.json({
          saved: false,
          error: 'We were unable to find a target for your submission.',
        })
      }
    }
  }

  // Determine auto-approval
  const autoPublish = false
  const autoPublishConditions: string[] = []
  let isApproved = false

  if (autoPublish && body && typeof body === 'object') {
    if (!autoPublishConditions?.length) {
      isApproved = true
    } else {
      isApproved = autoPublishConditions.filter((cond) => !body[cond]).length === 0
    }
  }

  // Build comment data from body fields (excluding replyPost — handled separately)
  const fields = ['author', 'email', 'content', 'replyComment']
  const commentData: Record<string, unknown> = {
    isApproved,
    date: new Date().toISOString(),
  }

  const toNumber = (val: string): string | number => {
    const num = parseInt(val, 10)
    return isNaN(num) ? val : num
  }

  for (const field of fields) {
    if (body[field]) {
      if (field === 'replyComment' && typeof body[field] === 'string') {
        commentData[field] = toNumber(body[field])
      } else {
        commentData[field] = body[field]
      }
    }
  }

  // Set the resolved entity field
  if (resolvedReplyPost) {
    commentData.replyPost = toNumber(resolvedReplyPost)
  }
  if (resolvedReplyBird) {
    commentData.replyBird = toNumber(resolvedReplyBird)
  }

  const newComment = await payload.create({
    collection: 'comments',
    data: commentData,
  })

  if (!newComment) {
    return Response.json({
      saved: false,
      error: 'We encountered an unexpected error while processing your submission.',
    })
  }

  return Response.json({ saved: true, isApproved }, { status: 200 })
}
