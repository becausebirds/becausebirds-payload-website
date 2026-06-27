import React from 'react'
import Image from 'next/image'
import type { Media } from '@/payload-types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import RichText from '@/components/RichText'

export const GalleryConverter: React.FC<{
  images?: Array<{
    image?: number | Media | null
    alt?: string | null
    caption?: DefaultTypedEditorState | null
  }> | null
  columns?: '2' | '3' | '4' | null
}> = ({ images = [], columns = '3' }) => {
  const gridColsClass = {
    '2': 'grid-cols-2',
    '3': 'grid-cols-2 md:grid-cols-3',
    '4': 'grid-cols-2 md:grid-cols-4',
  }[columns ?? '3'] || 'grid-cols-2 md:grid-cols-3'

  return (
    <div className={`grid ${gridColsClass} gap-6 my-8`}>
      {(images ?? []).map((img, index) => {
        if (!img?.image || typeof img.image === 'number') return null

        const imageData = img.image
        const altText = img.alt || imageData.alt
        const caption = img.caption

        if (!imageData?.url) return null

        return (
          <figure key={index} className="flex flex-col w-full">
            <div className="relative w-full aspect-square flex-shrink-0 overflow-hidden rounded-base">
              <Image
                src={imageData.url}
                alt={altText || 'Gallery image'}
                fill
                className="object-cover w-full h-full rounded-base"
              />
            </div>
            {caption && (
              <figcaption className="text-center text-sm mt-3 w-full pt-2">
                <div className="payload-richtext max-w-none">
                  <RichText data={caption} enableGutter={false} enableProse={false} />
                </div>
              </figcaption>
            )}
          </figure>
        )
      })}
    </div>
  )
}
