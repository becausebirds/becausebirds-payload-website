import type { Block } from 'payload'

export const BirdChecklist: Block = {
  slug: 'bird-checklist',
  interfaceName: 'BirdChecklistBlock',
  labels: {
    singular: 'Bird Checklist',
    plural: 'Bird Checklists',
  },
  fields: [
    {
      name: 'checklist',
      type: 'relationship',
      relationTo: 'bird-checklists',
      required: true,
      label: 'Select Checklist',
    },
    {
      name: 'showMap',
      type: 'checkbox',
      label: 'Show Location Map',
      defaultValue: true,
    },
    {
      name: 'showFullSpeciesList',
      type: 'checkbox',
      label: 'Show Full Species List',
      defaultValue: true,
    },
  ],
}
