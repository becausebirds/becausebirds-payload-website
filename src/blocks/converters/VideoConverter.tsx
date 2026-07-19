'use client'
import React, { useRef, useState } from 'react'
import type { Media } from '@/payload-types'

export const VideoConverter: React.FC<{
  source?: 'upload' | 'youtube' | 'vimeo' | 'url' | null
  file?: Media | number | null
  url?: string | null
  caption?: string | null
}> = ({ source = 'url', file, url, caption }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loaded, setLoaded] = useState(false)
  let videoSrc = ''

  if (source === 'upload' && typeof file !== 'number' && file) {
    videoSrc = file.url || ''
  } else if (source === 'youtube' && url) {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop()
    // Use YouTube's built-in thumbnail as poster
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    return (
      <figure className="my-8">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            frameBorder="0"
            allowFullScreen
            title="YouTube video"
            loading="lazy"
          />
        </div>
        {caption && <figcaption className="text-center text-sm mt-2">{caption}</figcaption>}
      </figure>
    )
  } else if (source === 'vimeo' && url) {
    const videoId = url.split('/').pop()
    return (
      <figure className="my-8">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://player.vimeo.com/video/${videoId}`}
            frameBorder="0"
            allowFullScreen
            title="Vimeo video"
            loading="lazy"
          />
        </div>
        {caption && <figcaption className="text-center text-sm mt-2">{caption}</figcaption>}
      </figure>
    )
  } else if (source === 'url' && url) {
    videoSrc = url
  }

  // For uploaded videos: show poster overlay until user clicks play
  return (
    <figure className="my-8">
      <div className="relative w-full">
        <video
          ref={videoRef}
          controls
          className="w-full max-h-[75vh]"
          src={videoSrc}
          muted
          playsInline
          preload="none"
          onLoadedData={() => setLoaded(true)}
        />
        {/* Play button overlay before user interaction */}
        {!loaded && (
          <button
            className="absolute inset-0 flex items-center justify-center bg-black/20 
              hover:bg-black/30 transition cursor-pointer group"
            aria-label="Play video"
            onClick={() => {
              const video = videoRef.current
              if (video) {
                video.preload = 'metadata'
                video.load()
                video.play().catch(() => {})
              }
            }}
          >
            <svg
              className="w-16 h-16 text-white drop-shadow-lg 
                group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
      </div>
      {caption && <figcaption className="text-center text-sm mt-2">{caption}</figcaption>}
    </figure>
  )
}
