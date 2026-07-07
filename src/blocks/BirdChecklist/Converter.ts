import type {
  SerializedBlockNode,
} from '@payloadcms/richtext-lexical'

export const BirdChecklistConverter = {
  converter: ({ node }: { node: SerializedBlockNode }) => {
    const fields = node.fields as {
      checklist?: { id: string } | string
      showMap?: boolean
      showFullSpeciesList?: boolean
      disableInnerContainer?: boolean
      blockType?: string
    }

    return {
      type: 'bird-checklist',
      props: {
        checklist: fields.checklist,
        showMap: fields.showMap ?? true,
        showFullSpeciesList: fields.showFullSpeciesList ?? true,
        disableInnerContainer: fields.disableInnerContainer ?? false,
      },
    }
  },
}
