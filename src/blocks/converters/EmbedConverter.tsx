import React from 'react'

export const EmbedConverter: React.FC<{
  url?: string | null
  caption?: string | null
}> = ({ url, caption }) => {
  if (!url) return null

  return (
    <figure className="my-8">
      <div className="aspect-video">
        <iframe
          src={url}
          className="w-full h-full rounded"
          allowFullScreen
        />
      </div>
      {caption && <figcaption className="text-center text-sm mt-2">{caption}</figcaption>}
    </figure>
  )
}
