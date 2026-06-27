// src/collections/Comments.ts
import type { CollectionConfig } from 'payload'
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
