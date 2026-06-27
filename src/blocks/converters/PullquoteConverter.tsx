import React from 'react'

export const PullquoteConverter: React.FC<{
  text?: string
  attribution?: string
}> = ({ text, attribution }) => {
  return (
    <aside className="border-l-4 border-blue-500 pl-4 my-8 text-lg italic">
      <p>{text}</p>
      {attribution && <footer className="text-sm mt-2">— {attribution}</footer>}
    </aside>
  )
}
