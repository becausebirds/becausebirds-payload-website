import React from 'react'

type AlignKey = keyof typeof alignClasses
type StyleKey = keyof typeof styleClasses

const styleClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700',
  outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  ghost: 'text-blue-600 hover:bg-blue-50',
}

const alignClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
}

type ButtonsBlockProps = {
  buttons?: {
    url?: string
    target?: string
    style?: string
    text?: string
  }[]
  align?: AlignKey
  blockType?: string
}

export const ButtonsBlock: React.FC<ButtonsBlockProps> = ({ buttons, align = 'left' }) => {
  return (
    <div className="flex flex-col items-center gap-4 pt-8">
      <div className="container max-w-[48rem] mx-auto">
        <div className={`flex flex-wrap gap-4 ${alignClasses[align as AlignKey]}`}>
          {buttons?.map((button, index) => (
            <a
              key={index}
              href={button.url}
              target={button.target}
              rel={button.target === '_blank' ? 'noopener noreferrer' : undefined}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${styleClasses[button.style as StyleKey]}`}
            >
              {button.text}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
