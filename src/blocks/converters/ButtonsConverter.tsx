import React from 'react'

export const ButtonsConverter: React.FC<{
  buttons?: Array<{ label: string; link: string }> | null
  align?: 'left' | 'center' | 'right' | null
}> = ({ buttons = [], align = 'left' }) => {
  const alignClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[align ?? 'left'] || 'justify-start'

  return (
    <div className={`flex flex-wrap gap-4 ${alignClass} my-4`}>
      {(buttons ?? []).map((btn, index) => (
        <a
          key={index}
          href={btn.link}
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {btn.label}
        </a>
      ))}
    </div>
  )
}
