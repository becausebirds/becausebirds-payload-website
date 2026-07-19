// RichText/Serializers/HTMLBlock.tsx
import React from 'react'

interface HTMLBlockProps {
  node: {
    fields: {
      code: string
    }
  }
}

export const HTMLBlockSerializer: React.FC<HTMLBlockProps> = ({ node }) => {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="flex justify-center items-center overflow-x-auto">
        <div
          dangerouslySetInnerHTML={{ __html: node.fields.code }}
        />
      </div>
    </div>
  )
}
