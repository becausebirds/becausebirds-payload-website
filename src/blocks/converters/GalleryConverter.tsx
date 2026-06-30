'use client'

import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import type { Media } from '@/payload-types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import RichText from '@/components/RichText'
import { useLightbox } from '@/components/Lightbox'
import type { LightboxItem } from '@/components/Lightbox'

let _groupId = 0

type GalleryImage = {
  image?: number | Media | null
  alt?: string | null
  caption?: DefaultTypedEditorState | null
}

export const GalleryConverter: React.FC<{
  images?: Array<GalleryImage> | null
  columns?: '2' | '3' | '4' | null
}> = ({ images = [], columns = '3' }) => {
  const { open, registerImages, unregisterImages } = useLightbox()
  const groupId = useRef(`GalleryConverter-${_groupId++}`)

  const gridColsClass = {
    '2': 'grid-cols-2',
    '3': 'grid-cols-2 md:grid-cols-3',
    '4': 'grid-cols-2 md:grid-cols-4',
  }[columns ?? '3'] || 'grid-cols-2 md:grid-cols-3'

  // ✅ Memoize — only rebuilds when images actually change
  const lightboxItems: LightboxItem[] = useMemo(
    () =>
      (images ?? [])
        .filter((img): img is GalleryImage & { image: Media } =>
          typeof img?.image === 'object' && img.image !== null && 
!!img.image.url
        )
        .map((img) => ({
          src: img.image.url!,
          alt: img.alt || img.image.alt || 'Gallery image',
          width: img.image.width || 800,
          height: img.image.height || 600,
        })),
    [images],
  )

  // Register all gallery images for cross-block navigation
  useEffect(() => {
    if (lightboxItems.length > 0) {
      registerImages(groupId.current, lightboxItems)
    }
    return () => unregisterImages(groupId.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxItems, registerImages, unregisterImages])

  const handleClick = useCallback(
    (index: number) => {
      const item = lightboxItems[index]
      if (item) open(item)
    },
    [open, lightboxItems],
  )

  if (!images || images.length === 0) return null

  return (
    <div className={`grid ${gridColsClass} gap-x-3 gap-y-0.5 md:gap-y-3 my-3 md:my-4`}>
      {(images ?? []).map((img, index) => {
        if (!img?.image || typeof img.image === 'number') return null

        const imageData = img.image
        const altText = img.alt || imageData.alt
        const caption = img.caption

        if (!imageData?.url) return null

        return (
          <figure
            key={index}
            className="flex flex-col w-full cursor-pointer group !my-0"
            onClick={() => handleClick(index)}
          >
            <div className="relative w-full aspect-[4/3] flex-shrink-0 
overflow-hidden rounded-base transition-transform group-hover:scale-[1.02]">
              <Image
                src={imageData.url}
                alt={altText || 'Gallery image'}
                fill
                className="object-cover w-full h-full rounded-base"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-
black/10 transition-colors flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 
transition-opacity text-xs bg-black/50 px-2 py-1 rounded">
                  Click to enlarge
                </span>
              </div>
            </div>
            {caption && (
              <figcaption className="text-center text-sm mt-1 w-full">
                <RichText data={caption} enableGutter={false} 
enableProse={false} />
              </figcaption>
            )}
          </figure>
        )
      })}
    </div>
  )
}
