// /blocks/BirdChecklist/config.ts
import type { Block } from 'payload'

export const BirdChecklist: Block = {
  slug: 'bird-checklist',
  interfaceName: 'BirdChecklistBlock',
  fields: [
    { name: 'checklist', type: 'relationship', relationTo: 'bird-checklists', required: true },
    { name: 'showMap', type: 'checkbox', label: 'Show Location Map', defaultValue: true },
    { name: 'showFullSpeciesList', type: 'checkbox', label: 'Show Full Species List', defaultValue: true },
    { name: 'minimized', type: 'checkbox', label: 'Start Minimized', defaultValue: false },
  ],
}
