import React from 'react'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import RichText from '@/components/RichText'

export const GroupConverter: React.FC<{
  content?: DefaultTypedEditorState | null
  label?: string | null
  backgroundColor?: string | null
  id?: string | null
  blockName?: string | null
  blockType?: 'group'
}> = ({ content, label, backgroundColor }) => {
  return (
    <div
      className="my-8 p-4 bg-gray-50 rounded"
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      {label && <h3 className="font-bold mb-2">{label}</h3>}
      {content && (
        <RichText data={content} enableGutter={false} enableProse={false} />
      )}
    </div>
  )
}
