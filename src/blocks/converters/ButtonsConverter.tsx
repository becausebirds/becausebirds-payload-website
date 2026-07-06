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
          className="inline-flex items-center justify-center no-underline whitespace-nowrap font-bold rounded-base text-sm font-base ring-offset-white transition-all gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-main-foreground bg-main border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none h-10 px-4 py-2 self-start"
        >
          {btn.label}
        </a>
      ))}
    </div>
  )
}
