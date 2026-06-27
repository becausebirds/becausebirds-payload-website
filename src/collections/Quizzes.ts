import type { CollectionConfig } from 'payload'

const Quizzes: CollectionConfig = {
  slug: 'quizzes',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    create: ({ req: { user } }) => {
      return Boolean(user);
    },
    read: () => true,
    update: ({ req: { user } }) => {
      return Boolean(user);
    },
    delete: ({ req: { user } }) => {
      return Boolean(user);
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Quiz Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Quiz Description',
    },
    {
      name: 'personalities',
      type: 'array',
      label: 'Personality Results',
      labels: {
        singular: 'Personality',
        plural: 'Personalities',
      },
      fields: [
        {
          name: 'forminatorId',
          type: 'text',
          label: 'Legacy ID',
          admin: {
            hidden: true,
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'Personality Title',
        },
        {
          name: 'description',
          type: 'richText',
          label: 'Personality Description',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Personality Image',
        },
      ],
    },
    {
      name: 'questions',
      type: 'array',
      label: 'Quiz Questions',
      labels: {
        singular: 'Question',
        plural: 'Questions',
      },
      fields: [
        {
          name: 'forminatorId',
          type: 'text',
          admin: {
            hidden: true,
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'Question',
        },
        {
          name: 'featuredImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Featured Image',
        },
        {
          name: 'answers',
          type: 'array',
          label: 'Answer Choices',
          labels: {
            singular: 'Answer',
            plural: 'Answers',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              label: 'Answer Text',
            },
            {
              name: 'personalityIndex',
              type: 'number',
              required: true,
              label: 'Personality Index',
              admin: {
                description: 'Enter the position number of the personality (0 = first, 1 = second, etc.)',
                step: 1,
              },
            },
          ],
        },
      ],
    },
  ],
}

export default Quizzes
