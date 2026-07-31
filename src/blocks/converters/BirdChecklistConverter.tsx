// /blocks/converters/BirdChecklistConverter.tsx
import type { JSXConverters } from '@payloadcms/richtext-lexical/react'
import BirdChecklistWrapper from '../BirdChecklist/ChecklistWrapper'

export const BirdChecklistConverter: JSXConverters = {
  'bird-checklist': ({ node }) => {
    console.log('[BirdChecklistConverter] Full node:', JSON.stringify(node, null, 2))
    console.log('[BirdChecklistConverter] node.fields:', node.fields)
    console.log('[BirdChecklistConverter] node.fields.checklist:', node.fields?.checklist)
    console.log('[BirdChecklistConverter] node.type:', node.type)

    return <BirdChecklistWrapper block={node.fields} />
  },
}
