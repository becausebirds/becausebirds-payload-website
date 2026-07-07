import type { Block } from 'payload'

export const BirdChecklistBlock: Block = {
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
      defaultValue: true,
    },
    {
      name: 'showFullSpeciesList',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'disableInnerContainer',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'minimized',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
