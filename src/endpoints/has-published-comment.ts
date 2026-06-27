// src/endpoints/has-published-comment.ts
import type { PayloadHandler } from 'payload'

export const hasPublishedCommentHandler: PayloadHandler = async (req): Promise<Response> => {
  const { payload } = req
  const body = await req.json?.() ?? req.body

  const hasPublishedCommentFields = ['email'] // ← matches what the plugin defaulted to

  if (!body || typeof body !== 'object' || !hasPublishedCommentFields.length) {
    return Response.json({ hasPublishedComment: false })
  }

  // Check all required fields are present in the body
  const missingField = hasPublishedCommentFields.find(
    (field) => !body[field]
  )
  if (missingField) {
    return Response.json({ hasPublishedComment: false })
  }

  // Build where clause: isApproved=true AND all specified fields must match
  const where = {
    and: [
      { isApproved: { equals: true } },
      ...hasPublishedCommentFields.map((field) => ({
        [field]: { equals: body[field] },
      })),
    ],
  }

  const { docs } = await payload.find({
    collection: 'comments',
    limit: 1,
    where,
  })

  return Response.json({ hasPublishedComment: docs?.length > 0 })
}
