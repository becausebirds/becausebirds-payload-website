// src/heros/PostHero/index.tsx
import { formatDateTime } from 'src/utilities/formatDateTime'
import React from 'react'
import Image from 'next/image'

import type { Post } from '@/payload-types'

import { formatAuthors } from '@/utilities/formatAuthors'
import { Badge } from '@/components/ui/badge'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 &&
    formatAuthors(populatedAuthors) !== ''

  return (
    <div className="relative -mt-[10.4rem] flex items-end overflow-hidden min-h-[80vh]">
      {/* Background image fills the entire hero */}
      {heroImage && typeof heroImage === 'object' && heroImage.url && typeof heroImage.url === 'string' && (
        <div className="absolute inset-0" suppressHydrationWarning>
          <Image
            src={heroImage.url}
            alt={heroImage.alt || 'Hero image'}
            fill
            priority
            quality={75}
            sizes="100vw"
            className="object-cover"
          />
          {/* Dark overlay for text legibility */}
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
          {/* Gradient fade at bottom */}
          <div className="absolute pointer-events-none left-0 bottom-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent" />
        </div>
      )}

      {/* Content overlay */}
      <div className="container z-10 relative lg:grid lg:grid-cols-[1fr_48rem_1fr] text-white pb-8">
        <div className="col-start-1 col-span-1 md:col-start-2 md:col-span-2">
          <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl font-black">
            {title}
          </h1>
          {categories && Array.isArray(categories) && categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => {
                if (typeof category === 'object' && category !== null && 'id' in category) {
                  const { title: categoryTitle } = category
                  return (
                    <Badge key={category.id}>
                      {categoryTitle || 'Untitled category'}
                    </Badge>
                  )
                }
                return null
              })}
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-4 md:gap-16">
            {hasAuthors && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold">Author</p>
                  <p className="font-semibold">{formatAuthors(populatedAuthors)}</p>
                </div>
              </div>
            )}
            {publishedAt && (
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold">Date Published</p>
                <time dateTime={publishedAt} className="font-semibold">
                  {formatDateTime(publishedAt)}
                </time>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
