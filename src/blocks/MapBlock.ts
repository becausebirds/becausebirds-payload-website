import type { Block } from 'payload'

export const MapBlock: Block = {
  slug: 'map',
  labels: {
    singular: 'Map Block',
    plural: 'Map Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'mapType',
      type: 'select',
      defaultValue: 'dots',
      options: [
        { label: 'Dot Plot', value: 'dots' },
        { label: 'Heatmap', value: 'heatmap' },
      ],
      label: 'Map Style',
    },
    // ── Option A: Upload a CSV file ──────────────────────────────────────
    {
      name: 'csvFile',
      type: 'upload',
      label: 'eBird CSV File',
      relationTo: 'media',
      admin: {
        description:
          'Upload your MyEBirdData.csv export. Only CSV files are supported.',
      },
    },
    // ── Option B: Or paste CSV data directly (for small snippets) ─────────
    {
      name: 'csvData',
      type: 'code',
      label: 'Or paste CSV data directly',
      admin: {
        language: 'plain',
        description:
          'Paste CSV data here instead of uploading a file (good for small test datasets). If a file is uploaded above, this is ignored.',
      },
    },
    {
      name: 'showHotspotsOnly',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show only hotspot checklists (hide personal/address locations)',
    },
  ],
}
