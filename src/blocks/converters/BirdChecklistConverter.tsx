'use server'

import type { JSXConverters } from '@payloadcms/richtext-lexical/react'
import BirdChecklistBlock from '../BirdChecklist/Component'

export const BirdChecklistConverter: JSXConverters = {
  'bird-checklist': ({ node }) => {
    return (
      <BirdChecklistBlock
        checklist={node.fields.checklist}
        disableInnerContainer={node.fields.disableInnerContainer}
      />
    )
  },
}