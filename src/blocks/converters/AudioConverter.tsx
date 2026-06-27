import React from 'react'
import type { Media } from '@/payload-types'

export const AudioConverter: React.FC<{
  file: Media | number
  caption?: string | null
  autoplay?: boolean | null
}> = ({ file, caption, autoplay }) => {
  if (typeof file === 'number') return null

  return (
    <figure className="my-8">
      <audio controls autoPlay={autoplay ?? false} className="w-full" src={file.url || ''} />
      {caption && <figcaption className="text-center text-sm mt-2">{caption}</figcaption>}
    </figure>
  )
}
