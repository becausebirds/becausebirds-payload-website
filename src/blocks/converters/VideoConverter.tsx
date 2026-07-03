import React from 'react'
import type { Media } from '@/payload-types'

export const VideoConverter: React.FC<{
  source?: 'upload' | 'youtube' | 'vimeo' | 'url' | null
  file?: Media | number | null
  url?: string | null
  caption?: string | null
}> = ({ source = 'url', file, url, caption }) => {
  let videoSrc = ''

  if (source === 'upload' && typeof file !== 'number' && file) {
    videoSrc = file.url || ''
  } else if (source === 'youtube' && url) {
    const videoId = url.split('v=')[1] || url.split('/').pop()
    return (
      <figure className="my-8">
        <iframe
          width="100%"
          height="400"
          src={`https://www.youtube.com/embed/${videoId}`}
          frameBorder="0"
          allowFullScreen
        />
        {caption && <figcaption className="text-center text-sm mt-2">{caption}</figcaption>}
      </figure>
    )
  } else if (source === 'vimeo' && url) {
    const videoId = url.split('/').pop()
    return (
      <figure className="my-8">
        <iframe
          width="100%"
          height="400"
          src={`https://player.vimeo.com/video/${videoId}`}
          frameBorder="0"
          allowFullScreen
        />
        {caption && <figcaption className="text-center text-sm mt-2">{caption}</figcaption>}
      </figure>
    )
  } else if (source === 'url' && url) {
    videoSrc = url
  }

  return (
    <figure className="my-8">
      <video controls className="w-full" src={`${videoSrc}#t=0.001`} preload="metadata" />
      {caption && <figcaption className="text-center text-sm mt-2">{caption}</figcaption>}
    </figure>
  )
}
