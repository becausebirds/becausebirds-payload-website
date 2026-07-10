import type { CollectionConfig } from 'payload'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, '') // remove apostrophes
    .replace(/[^a-z0-9]+/g, '-') // replace special chars with hyphens
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
}

export const Birds: CollectionConfig = {
  slug: 'birds',

  admin: {
    useAsTitle: 'comName',
    defaultColumns: ['comName', 'sciName', 'speciesCode', 'taxonomicStatus', 'updatedAt'],
    group: 'Birding',
    description: 'Bird species from the eBird/Clements taxonomy',
  },

  access: {
    read: () => true,
  },

  fields: [
    // ─── eBird Identifiers ──────────────────────────────────────
    {
      name: 'speciesCode',
      type: 'text',
      label: 'Species Code (eBird)',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: '6-letter eBird code, e.g. "cangoo" for Canada Goose.',
      },
    },

    {
      name: 'sciName',
      type: 'text',
      label: 'Scientific Name',
      required: true,
      index: true,
    },

    {
      name: 'comName',
      type: 'text',
      label: 'Common Name',
      required: true,
    },

    // ─── Taxonomy Hierarchy ─────────────────────────────────────
    {
      name: 'order',
      type: 'text',
      label: 'Order',
      admin: { position: 'sidebar', width: '50%' },
    },

    {
      name: 'familyComName',
      type: 'text',
      label: 'Family (Common Name)',
      admin: { position: 'sidebar', width: '50%' },
    },

    {
      name: 'familySciName',
      type: 'text',
      label: 'Family (Scientific Name)',
      admin: { position: 'sidebar', width: '50%' },
    },

    // ─── Taxonomic Status (Splits / Lumps) ──────────────────────
    {
      name: 'taxonomicStatus',
      type: 'select',
      label: 'Taxonomic Status',
      required: true,
      defaultValue: 'current',
      admin: {
        position: 'sidebar',
        description: 'Lumped/split birds keep their entry for historical pages.',
      },
      options: [
        { label: '✅ Current', value: 'current' },
        { label: '🔄 Lumped', value: 'lumped' },
        { label: '✂️ Split', value: 'split' },
        { label: '⛔ Deprecated', value: 'deprecated' },
      ],
    },

    // Lumped → points to current species
    {
      name: 'lumpedInto',
      type: 'relationship',
      label: 'Lumped Into',
      relationTo: 'birds',
      hasMany: false,
      admin: {
        position: 'sidebar',
        condition: (_, siblingData) => siblingData?.taxonomicStatus === 'lumped',
        description: 'The single species this was lumped into. Old page stays live as a historical record.',
      },
    },

    // Current → lists species that were lumped into this one
    {
      name: 'lumpedFrom',
      type: 'relationship',
      label: 'Lumped From',
      relationTo: 'birds',
      hasMany: true,
      admin: {
        position: 'sidebar',
        condition: (_, siblingData) => siblingData?.taxonomicStatus === 'current',
      },
    },

    // Split → points to new species
    {
      name: 'splitInto',
      type: 'relationship',
      label: 'Split Into',
      relationTo: 'birds',
      hasMany: true,
      admin: {
        position: 'sidebar',
        condition: (_, siblingData) => siblingData?.taxonomicStatus === 'split',
        description: 'The species this was split into. Original stays live as a historical record.',
      },
    },

    // Current → points back to original pre-split species
    {
      name: 'splitFrom',
      type: 'relationship',
      label: 'Split From',
      relationTo: 'birds',
      hasMany: false,
      admin: {
        position: 'sidebar',
        condition: (_, siblingData) => siblingData?.taxonomicStatus === 'current',
      },
    },

    // ─── Slug (from common name) ────────────────────────────────
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      index: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'Auto-generated from common name. Pages at /birds/{slug}.',
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (data?.comName) {
              return slugify(data.comName)
            }
            return data?.slug
          },
        ],
      },
    },

    // ─── Public Page Content ────────────────────────────────────
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Optional notes for the public species page.',
      },
    },

    // ─── Sync Metadata ──────────────────────────────────────────
    {
      name: 'lastSyncedAt',
      type: 'date',
      label: 'Last Synced with eBird',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { displayFormat: 'yyyy-MM-dd HH:mm' },
      },
    },

    {
      name: 'rawTaxonomyData',
      type: 'json',
      label: 'Raw Taxonomy Data',
      admin: { readOnly: true, hidden: true },
    },
  ],
}
