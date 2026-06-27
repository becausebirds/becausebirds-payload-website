import React from 'react'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import RichText from '@/components/RichText'

export const ColumnsConverter: React.FC<{
  columns?: Array<{
    content?: DefaultTypedEditorState | null
    width?: string | null
  }> | null
}> = ({ columns = [] }) => {
  const filtered = columns?.filter(Boolean) ?? []

  return (
    <div className={`grid grid-cols-${filtered.length} gap-4 my-8`}>
      {filtered.map((col, index) => (
        <div key={index}>
          {col.content && (
            <RichText data={col.content} enableGutter={false} enableProse={false} />
          )}
        </div>
      ))}
    </div>
  )
}
