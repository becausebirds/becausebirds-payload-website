import { CollectionConfig } from 'payload';

const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'categories', 'price', 'externalUrl'],
  },
  access: {
    read: async () => true,
    create: async () => true,
    update: async () => true,
    delete: async () => true,
  },
  fields: [
    {
      name: 'id',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'price',
      type: 'number',
      min: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'categories',
      type: 'array',
      fields: [
        {
          name: 'category',
          type: 'text',
        },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'externalUrl',
      type: 'text',
      admin: {
        description: 'Affiliate or external product URL',
      },
    },
    {
      name: 'buttonText',
      type: 'text',
      defaultValue: 'View Product',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Published', value: 'publish' },
        { label: 'Draft', value: 'draft' },
      ],
      defaultValue: 'publish',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'author',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
  ],
};

export default Products;
