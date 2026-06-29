'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Media } from '@/payload-types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import RichText from '@/components/RichText'
import { useLightbox } from '@/components/Lightbox'

let _groupId = 0

export const ImageConverter: React.FC<{
  image: Media | number
  caption?: DefaultTypedEditorState | null
  alt?: string | null
}> = ({ image, caption, alt }) => {
  const { open, registerImages, unregisterImages } = useLightbox()
  const groupId = useRef(`ImageConverter-${_groupId++}`)

  if (typeof image === 'number') return null

  const src = image.url || ''
  const imgAlt = alt || image.alt || ''

  // Register this image for cross-block navigation
  const lightboxItem = {
    src,
    alt: imgAlt,
    width: image.width || 800,
    height: image.height || 600,
  }

  useEffect(() => {
    registerImages(groupId.current, [lightboxItem])
    return () => unregisterImages(groupId.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, imgAlt, image.width, image.height, registerImages, unregisterImages])

  const handleClick = () => open(lightboxItem)

  return (
    <figure className="my-8 cursor-pointer group" onClick={handleClick}>
      <div className="relative w-full h-auto transition-transform group-hover:scale-[1.01] group-hover:opacity-90">
        <Image
          src={src}
          alt={imgAlt}
          width={image.width || 800}
          height={image.height || 600}
          className="w-full h-auto rounded-base object-contain max-h-[70vh]"
        />
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-white text-xs px-2 py-1 rounded">
          Click to enlarge
        </div>
      </div>
      {caption && (
        <figcaption className="text-center text-sm mt-2">
          <RichText data={caption} enableGutter={false} enableProse={false} />
        </figcaption>
      )}
    </figure>
  )
}
