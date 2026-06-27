import { Button } from '@/components/ui/button' // adjust to your Button component path

interface ButtonData {
  text: string
  url: string
  target: '_self' | '_blank'
  style: 'default' | 'noShadow' | 'outline' | 'ghost'
}

interface ButtonsBlockProps {
  buttons: ButtonData[]
  align: 'left' | 'center' | 'right'
}

export const ButtonsBlock: React.FC<ButtonsBlockProps> = ({ buttons, align }) => {
  const alignmentClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[align]

  return (
    <div className={`flex gap-4 ${alignmentClass}`}>
      {buttons.map((button, index) => (
        <a
          key={index}
          href={button.url}
          target={button.target}
          rel={button.target === '_blank' ? 'noopener noreferrer' : undefined}
        >
          <Button variant={button.style} className="rounded-base">
            {button.text}
          </Button>
        </a>
      ))}
    </div>
  )
}
