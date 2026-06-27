import clsx from 'clsx'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import type { Post } from '@/payload-types'
import { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

export type RelatedPostsProps = {
  className?: string
  docs?: Post[]
  introContent?: DefaultTypedEditorState
}

export const RelatedPosts: React.FC<RelatedPostsProps> = (props) => {
  const { className, docs, introContent } = props

  return (
    <div className={clsx('lg:container', className)}>
      {introContent && <RichText data={introContent} enableGutter={false} />}

      <h2 className="text-4xl font-black text-gray-900 dark:text-foreground mb-8 tracking-tight">
        Related Posts
      </h2>

      {/* Grid updated to match homepage: 3 columns on large screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs?.map((post, index) => {
          if (typeof post === 'string') return null

          return (
            <Card key={index} className="border-2 border-black dark:border-border h-full flex flex-col">
              {/* Featured Image */}
              {post.heroImage && typeof post.heroImage !== 'number' && 'url' in post.heroImage && post.heroImage.url && (
                <div className="px-4 sm:px-2 md:px-4 pt-4">
                  <div className="relative w-full h-48 rounded-base overflow-hidden flex-shrink-0">
                    <Image
                      src={post.heroImage.url}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              <CardHeader className="pb-0">
                <CardTitle className="text-xl font-black">
                  <Link href={`/${post.slug}`} className="hover:underline text-foreground">
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className="text-sm font-bold text-gray-500 dark:text-muted-foreground">
                  {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardDescription>
                {post.categories && Array.isArray(post.categories) && post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 my-3">
                    {post.categories.map((category) => {
                      if (typeof category === 'object' && 'id' in category) {
                        return <Badge key={category.id}>{category.title}</Badge>
                      }
                      return null
                    })}
                  </div>
                )}
              </CardHeader>

              <CardContent className="flex-1 flex flex-col pt-0">
                <p className="leading-relaxed text-base flex-1 text-gray-700 dark:text-gray-300 mt-2">
                  {post.meta?.description || 'No description available'}
                </p>
                <Link href={`/${post.slug}`}>
                  <Button className="mt-3 rounded-base">Read more →</Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
