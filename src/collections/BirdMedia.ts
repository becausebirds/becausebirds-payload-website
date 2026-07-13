import type { CollectionConfig } from 'payload'

export const BirdMedia: CollectionConfig = {
  slug: 'bird-media',

  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'mimeType', 'rating', 'species', 'checklistId', 'updatedAt'],
    group: 'Birding',
    description: 'Bird media — photos, audio recordings, and videos',
  },

  access: {
    read: () => true,
  },

  upload: {
    mimeTypes: ['image/*', 'audio/*', 'video/*'],
    staticDir: 'birdmedia',
  },

  fields: [
    // ─── Relationships ──────────────────────────────────────
    {
      name: 'checklistId',
      type: 'relationship',
      label: 'Checklist',
      relationTo: 'bird-checklists',
      hasMany: false,
      admin: {
        position: 'sidebar',
        description: 'Select the bird checklist this media is from.',
      },
    },

    {
      name: 'species',
      type: 'relationship',
      label: 'Species',
      relationTo: 'birds',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'One or more bird species featured in this media.',
      },
    },

    // ─── Sound Type Tags (Audio only) ──────────────────────
    {
      name: 'soundTypeTags',
      type: 'group',
      label: 'Sound Type Tags',
      admin: {
        description: 'Tag the types of sounds present in this audio recording.',
        condition: (_, siblingData) => siblingData?.mimeType?.startsWith('audio/'),
      },
      fields: [
        { name: 'song', type: 'checkbox', label: 'Song' },
        { name: 'call', type: 'checkbox', label: 'Call' },
        { name: 'flightSong', type: 'checkbox', label: 'Flight Song' },
        { name: 'flightCall', type: 'checkbox', label: 'Flight Call' },
        { name: 'mechanicalSound', type: 'checkbox', label: 'Mechanical Sound' },
        { name: 'dawnSong', type: 'checkbox', label: 'Dawn Song' },
        { name: 'duet', type: 'checkbox', label: 'Duet' },
      ],
    },

    // ─── Rating ─────────────────────────────────────────────
    {
      name: 'rating',
      type: 'number',
      label: 'Rating',
      min: 1,
      max: 5,
      admin: {
        position: 'sidebar',
        description: 'Quality rating out of 5 stars.',
      },
    },

    // ─── Equipment (Audio only) ─────────────────────────────
    {
      name: 'equipment',
      type: 'group',
      label: 'Equipment',
      admin: {
        condition: (_, siblingData) => siblingData?.mimeType?.startsWith('audio/'),
        description: 'Recording equipment used (for audio clips).',
      },
      fields: [
        { name: 'recorder', type: 'text', label: 'Recorder' },
        { name: 'microphone', type: 'text', label: 'Microphone' },
        { name: 'accessories', type: 'text', label: 'Accessories' },
      ],
    },

    // ─── Media Notes ─────────────────────────────────────────
    {
      name: 'mediaNotes',
      type: 'textarea',
      label: 'Media Notes',
      admin: {
        description: 'Any additional notes about this media file.',
      },
    },
  ],
}
