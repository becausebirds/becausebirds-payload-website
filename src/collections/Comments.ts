// src/collections/Comments.ts
import type { CollectionConfig } from 'payload'
import { sendAdminNotification } from '@/utilities/sendAdminNotification'
import { addCommentHandler } from '../endpoints/add-comment'
import { hasPublishedCommentHandler } from '../endpoints/has-published-comment'

export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    defaultColumns: ['id', 'author', 'email', 'isApproved', 'content'],
    useAsTitle: 'id',
  },
  access: {
    create: () => true,
    read: () => true,
    update: ({ req: { user } }) => {
      return Boolean(user);
    },
    delete: ({ req: { user } }) => {
      return Boolean(user);
    },
  },
  timestamps: true,
  hooks: {
    afterChange: [
      sendAdminNotification,
      // ✨ Revalidate bird page when a comment is approved
      async ({ doc, previousDoc, operation, req }) => {
        // Only act when a comment becomes newly approved
        const becameApproved =
          (operation === 'create' && doc.isApproved) ||
          (operation === 'update' && doc.isApproved && !previousDoc?.isApproved)

        if (!becameApproved) return

        // Revalidate the bird page
        const birdId = doc.replyBird
        if (birdId) {
          try {
            const bird = await req.payload.findByID({
              collection: 'birds',
              id: birdId,
              depth: 0,
            })
            if (bird?.slug) {
              const params = new URLSearchParams({
                secret: process.env.REVALIDATION_SECRET || '',
                path: `/birds/${bird.slug}`,
              })
              await fetch(
                `${process.env.REVALIDATION_SERVER_URL}/api/revalidate?${params}`,
                { signal: AbortSignal.timeout(5000) },
              )
            }
          } catch (err) {
            console.error('Failed to revalidate bird page after comment approval:', err)
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'author',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'date',
      type: 'date',
      admin: {
        date: {
          displayFormat: 'MMM d, yyyy h:mm a',
        },
      },
    },
    {
      name: 'content',
      type: 'textarea',
    },
    {
      name: 'replyPost',
      type: 'relationship',
      relationTo: 'posts',
    },
    {
      name: 'replyBird',
      type: 'relationship',
      relationTo: 'birds',
    },
    {
      name: 'replyComment',
      type: 'relationship',
      relationTo: 'comments',
    },
    {
      name: 'isApproved',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  endpoints: [
    {
      path: '/add-comment',
      method: 'post',
      handler: addCommentHandler,
    },
    {
      path: '/has-published-comment',
      method: 'post',
      handler: hasPublishedCommentHandler,
    },
  ],
}
