import { CollectionConfig } from 'payload'

export const Forms: CollectionConfig = {
  slug: 'forms',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Form Name',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
  ],
}
