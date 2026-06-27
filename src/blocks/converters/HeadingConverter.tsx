import React from 'react'

export const HeadingConverter: React.FC<{
  text: string
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | null
  anchorId?: string | null
}> = ({ text, level = 'h2', anchorId }) => {
  const HeadingTag = level || 'h2'
  return (
    <HeadingTag id={anchorId || undefined}>
      {text}
    </HeadingTag>
  )
}
