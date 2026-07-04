import type { CollectionConfig } from 'payload'

export const BirdChecklists: CollectionConfig = {
  slug: 'bird-checklists',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'locationName', 'speciesCount', 'updatedAt'],
    group: 'Birding',
    description: 'eBird checklists imported and managed in your CMS',
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
      name: 'title',
      type: 'text',
      label: 'Title',
    },

    // ─── Observer ────────────────────────────────────────────────────
    {
      name: 'observer',
      type: 'text',
      label: 'Observer',
      admin: { position: 'sidebar' },
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
        description:
          'Array of track points: [{ lat, lng, timestamp? }, ...]. GeoJSON-compatible.',
      },
    },
    {
      name: 'trackDistanceKm',
      type: 'number',
      label: 'Track Distance (km)',
    },

    // ─── Bird Species (Array) ────────────────────────────────────────
    {
      name: 'species',
      type: 'array',
      label: 'Bird Species Observed',
      labels: { singular: 'Species', plural: 'Species' },
      fields: [
        {
          name: 'commonName',
          type: 'text',
          label: 'Common Name',
          required: true,
        },
        {
          name: 'scientificName',
          type: 'text',
          label: 'Scientific Name',
        },
        {
          name: 'count',
          type: 'text',
          label: 'Count',
        },
        {
          name: 'exotic',
          type: 'select',
          label: 'Exotic Status',
          options: [
            { label: 'Native', value: 'native' },
            { label: 'Naturalized', value: 'naturalized' },
            { label: 'Provisional', value: 'provisional' },
            { label: 'Escapee', value: 'escapee' },
          ],
        },
        {
          name: 'hasPhotos',
          type: 'checkbox',
          label: 'Has Photos',
        },
        {
          name: 'hasAudio',
          type: 'checkbox',
          label: 'Has Audio Recording',
        },
        {
          name: 'comments',
          type: 'textarea',
          label: 'Comments',
        },
      ],
    },

    // ─── Notes ───────────────────────────────────────────────────────
    {
      name: 'notes',
      type: 'textarea',
      label: 'Personal Notes',
      admin: {
        description:
          'Optional notes about this checklist (not overwritten on re-import).',
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
