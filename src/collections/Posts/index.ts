import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
  UnorderedListFeature,
  OrderedListFeature
} from '@payloadcms/richtext-lexical'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'

// Original blocks
// import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'

// Step 4 blocks
import { Paragraph } from '../../blocks/Paragraph'
import { Heading } from '../../blocks/Heading'
import { ImageBlock } from '../../blocks/Image'
import { List } from '../../blocks/List'
import { HTML } from '../../blocks/HTML'
import { QuizBlock } from '../../blocks/QuizBlock'
import { Quote } from '../../blocks/Quote'
import { Separator } from '../../blocks/Separator'
import { Spacer } from '../../blocks/Spacer'
import { EXPERIMENTAL_TableFeature } from '@payloadcms/richtext-lexical'

// Step 5 blocks
import { Audio } from '../../blocks/Audio'
import { Video } from '../../blocks/Video'
import { Gallery } from '../../blocks/Gallery'
import { Embed } from '../../blocks/Embed'
import { Columns } from '../../blocks/Columns'
import { Group } from '../../blocks/Group'
import { Details } from '../../blocks/Details'
import { Pullquote } from '../../blocks/Pullquote'
// import { GBContainer } from '../../blocks/GBContainer'
// import { GBGrid } from '../../blocks/GBGrid'
// import { GBButton } from '../../blocks/GBButton'
import { Buttons } from '../../blocks/Buttons'
import { BirdChecklistBlock } from '@/blocks/BirdChecklist'

import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { populateAuthors } from './hooks/populateAuthors'
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost'

// Chart block
import { BarChartBlock } from '../../blocks/BarChart'
import { PieChartBlock } from '../../blocks/PieChart'
import { MapBlock } from '../../blocks/MapBlock'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

export const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a post is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'posts'>
  defaultPopulate: {
  title: true,
  slug: true,
  excerpt: true,
  heroImage: true,
  categories: true,
  content: true,
  meta: {
    image: true,
    description: true,
  },
},
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'posts',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'posts',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
   {
    name: 'heroImage',
    type: 'upload',
    relationTo: 'media',
   },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    UnorderedListFeature(),
                    OrderedListFeature(),
                    EXPERIMENTAL_TableFeature(),
                    BlocksFeature({
                      blocks: [
                        // Original
                        // Banner,
                        Code,
                        MediaBlock,
                        // Content
                        Paragraph,
                        Heading,
                        ImageBlock,
                        List,
                        HTML,
                        Quote,
                        Separator,
                        Spacer,
                        // Media
                        Audio,
                        Video,
                        Gallery,
                        Embed,
                        // Layout
                        Columns,
                        QuizBlock,
                        BirdChecklistBlock,
                        Group,
                        Details,
                        Pullquote,
                        Buttons,
                        BarChartBlock,
                        PieChartBlock,
                        MapBlock,
                      ],
                    }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
              required: true,
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'relatedPosts',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                }
              },
              hasMany: true,
              relationTo: 'posts',
            },
            {
              name: 'categories',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              hasMany: true,
              relationTo: 'categories',
            },
{
  name: 'excerpt',
  type: 'textarea',
  admin: {
    position: 'sidebar',
  },
  maxLength: 600,
},
{
              name: 'tags',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              hasMany: true,
              relationTo: 'tags',
            },

          ],
          label: 'Meta',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
    },
    // This field is only used to populate the user data via the `populateAuthors` hook
    // This is because the `user` collection has access control locked to protect user privacy
    // GraphQL will also not return mutated user data that differs from the underlying schema
    {
      name: 'populatedAuthors',
      type: 'array',
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        {
          name: 'id',
          type: 'text',
        },
        {
          name: 'name',
          type: 'text',
        },
        {
    name: 'heroImage',
    type: 'upload',
    relationTo: 'media',
        },
      ],
    },
    slugField(),
{
  name: '__lexical_blocks',
  type: 'blocks',
  hidden: true,
  admin: {
    disabled: true,
  },
  blocks: [
    // Original
    // Banner,
    Code,
    MediaBlock,
    QuizBlock,
    // Content
    Paragraph,
    Heading,
    ImageBlock,
    List,
    HTML,
    Quote,
    Separator,
    Spacer,
    // Media
    Audio,
    Video,
    Gallery,
    Embed,
    // Layout
    Columns,
    Group,
    Details,
    Pullquote,
    Buttons,
    BarChartBlock,
    MapBlock,
  ],
},
  ],
  hooks: {
    afterChange: [revalidatePost],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete],
  },

versions: {
  drafts: {
    autosave: true,
  },
  maxPerDoc: 50,
},

}
