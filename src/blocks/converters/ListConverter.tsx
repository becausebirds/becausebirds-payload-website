import React from 'react'

export const ListConverter: React.FC<{
  items?: string[] | null
  ordered?: boolean | null
}> = ({ items = [], ordered = false }) => {
  const Tag = ordered ? 'ol' : 'ul'
  return (
    <Tag className={`my-4 ${ordered ? 'list-decimal' : 'list-disc'} pl-6`}>
      {(items ?? []).map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </Tag>
  )
}
