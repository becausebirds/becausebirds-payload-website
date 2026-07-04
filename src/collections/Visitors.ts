import type { CollectionConfig } from 'payload'
import { sendAdminNotification } from '@/utilities/sendAdminNotification'

export const Visitors: CollectionConfig = {
  slug: 'visitors',
  labels: {
    singular: 'Visitor',
    plural: 'Visitors',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'location', 'favoriteBird', 'date'],
    group: 'Guest Book',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
      required: true,
    },
    {
      name: 'location',
      type: 'text',
      label: 'Location',
      required: true,
    },
    {
      name: 'favoriteBird',
      type: 'text',
      label: 'Favorite Bird',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Message',
      required: false,
    },
    {
      name: 'date',
      type: 'date',
      label: 'Date Signed',
      required: true,
      defaultValue: () => new Date(),
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  hooks: {
    afterChange: [sendAdminNotification],
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

}
