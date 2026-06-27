import React from 'react'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import RichText from '@/components/RichText'

export const DetailsConverter: React.FC<{
  summary?: string | null
  content?: DefaultTypedEditorState | null
  id?: string | null
  blockName?: string | null
  blockType?: 'details'
}> = ({ summary, content }) => {
  return (
    <details className="my-4 p-4 border border-gray-300 rounded">
      <summary className="cursor-pointer font-semibold">{summary}</summary>
      <div className="mt-2">
        {content && (
          <RichText data={content} enableGutter={false} enableProse={false} />
        )}
      </div>
    </details>
  )
}
