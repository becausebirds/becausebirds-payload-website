import React from 'react'

export const QuoteConverter: React.FC<{
  text: string
  citation?: string | null
}> = ({ text, citation }) => {
  return (
    <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic">
      <p>{text}</p>
      {citation && <footer className="text-sm mt-2">— {citation}</footer>}
    </blockquote>
  )
}
