import type { CollectionConfig } from 'payload'
import { generatePreviewPath } from '../utilities/generatePreviewPath'

export const BirdChecklists: CollectionConfig = {
  slug: 'bird-checklists',
admin: {
  useAsTitle: 'title',
  defaultColumns: ['title', 'date', 'locationName', 'speciesCount', 'updatedAt'],
  group: 'Birding',
  description: 'Bird checklists created and managed in your CMS',

  livePreview: {
    url: ({ data, req }) =>
      generatePreviewPath({
        slug: data?.slug,
        collection: 'bird-checklists',
        req,
      }),
  },

  preview: (data, { req }) =>
    generatePreviewPath({
      slug: data?.slug as string,
      collection: 'bird-checklists',
      req,
    }),
},
  access: {
    read: () => true,
  },
  fields: [
    // ─── File Upload Import ──────────────────────────────────────────
    {
      name: 'importField',
      type: 'text',
      label: 'Import from eBird',
      admin: {
        components: {
          Field: '@/collections/BirdChecklists/eBirdImportField#EbirdImportFieldClient',
        },
      },
    },

    // ─── Checklist Identifiers ───────────────────────────────────────
    {
      name: 'ebirdChecklistId',
      type: 'text',
      label: 'eBird Checklist ID',
      admin: { position: 'sidebar' },
      index: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Public URL slug. Automatically generated from eBird checklist ID.',
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (data?.ebirdChecklistId && !data.slug) {
              return data.ebirdChecklistId
            }

            return data?.slug
          },
        ],
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title',
    },

    // ─── Date & Time ─────────────────────────────────────────────────
    {
      name: 'date',
      type: 'date',
      label: 'Date',
      admin: { position: 'sidebar', date: { displayFormat: 'yyyy-MM-dd' } },
    },
    {
      name: 'startTime',
      type: 'text',
      label: 'Start Time',
      admin: { position: 'sidebar', width: '50%' },
    },

    // ─── Location ────────────────────────────────────────────────────
    {
      name: 'locationName',
      type: 'text',
      label: 'Location',
    },
    {
      name: 'locationId',
      type: 'text',
      label: 'eBird Location ID',
      admin: { position: 'sidebar' },
    },
    {
      name: 'latitude',
      type: 'number',
      label: 'Latitude',
      admin: { position: 'sidebar', width: '50%' },
    },
    {
      name: 'longitude',
      type: 'number',
      label: 'Longitude',
      admin: { position: 'sidebar', width: '50%' },
    },
    {
      name: 'county',
      type: 'text',
      label: 'County',
    },
    {
      name: 'state',
      type: 'text',
      label: 'State/Province',
    },
    {
      name: 'region',
      type: 'text',
      label: 'Region',
    },
    

    // ─── Protocol / Effort ───────────────────────────────────────────
    {
      name: 'protocol',
      type: 'select',
      label: 'Protocol',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Traveling', value: 'Traveling' },
        { label: 'Stationary', value: 'Stationary' },
        { label: 'Incidental', value: 'Incidental' },
        { label: 'Historical', value: 'Historical' },
        { label: 'Area', value: 'Area' },
      ],
    },
    {
      name: 'duration',
      type: 'number',
      label: 'Duration (minutes)',
      admin: { position: 'sidebar', width: '50%' },
    },
    {
      name: 'distance',
      type: 'number',
      label: 'Distance (miles)',
      admin: { position: 'sidebar', width: '50%' },
    },
    {
      name: 'numberOfObservers',
      type: 'number',
      label: 'Number of Observers',
      admin: { position: 'sidebar' },
    },
    {
      name: 'speciesCount',
      type: 'number',
      label: 'Total Species',
      admin: { position: 'sidebar' },
    },

    // ─── GPS Track ───────────────────────────────────────────────────
    {
      name: 'gpsTrack',
      type: 'json',
      label: 'GPS Track Data',
      admin: {
  description: 'Array of track points: [{ lat, lng, timestamp? }, ...]. GeoJSON-compatible.',
  style: {
    height: '300px',
    overflow: 'auto',
  },
},
    },
    {
      name: 'trackDistanceKm',
      type: 'number',
      label: 'Track Distance (km)',
    },

    // ─── Bird Species (JSON) ─────────────────────────────────────────
    {
      name: 'species',
      type: 'json',
      label: 'Bird Species Observed',
      admin: {
  description: 'Array of species: [{ commonName, scientificName, count, comments }, ...]. Imported from eBird CSV.',
  style: {
    height: '400px',
    overflow: 'auto',
  },
},
    },

    // ─── Notes ───────────────────────────────────────────────────────
    {
      name: 'notes',
      type: 'textarea',
      label: 'Personal Notes',
      admin: {
        description: 'Optional notes about this checklist (not overwritten on re-import).',
      },
    },

    // ─── Import Metadata ─────────────────────────────────────────────
    {
      name: 'lastImportedAt',
      type: 'date',
      label: 'Last Imported',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { displayFormat: 'yyyy-MM-dd HH:mm' },
      },
    },
    {
      name: 'rawImportData',
      type: 'json',
      label: 'Raw Import Data',
      admin: { readOnly: true, hidden: true },
    },
  ],
}
