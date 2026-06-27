import React from 'react'
import RichText from '@/components/RichText'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

export const ParagraphConverter: React.FC<{
  content: DefaultTypedEditorState
}> = ({ content }) => {
  return (
    <div className="paragraph-block">
      <RichText data={content} enableGutter={false} />
    </div>
  )
}
