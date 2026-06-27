import React from 'react'
import Image from 'next/image'
import type { Media } from '@/payload-types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import RichText from '@/components/RichText'

export const ImageConverter: React.FC<{
  image: Media | number
  caption?: DefaultTypedEditorState | null
  alt?: string | null
}> = ({ image, caption, alt }) => {
  if (typeof image === 'number') return null

  return (
    <figure className="my-8">
      <div className="relative w-full h-auto">
        <Image
          src={image.url || ''}
          alt={alt || image.alt || ''}
          width={image.width || 800}
          height={image.height || 600}
          className="w-full h-auto rounded-base object-contain max-h-[70vh]"
        />
      </div>
      {caption && (
        <figcaption className="text-center text-sm mt-2">
          <RichText data={caption} enableGutter={false} enableProse={false} />
        </figcaption>
      )}
    </figure>
  )
}
