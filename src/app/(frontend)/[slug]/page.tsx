// app/(pages)/[slug]/page.tsx
import type { Metadata } from 'next'

import NavBar from '@/components/navbar'
import Footer from '@/components/Footer'
import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'
import { homeStatic } from '@/endpoints/seed/home-static'
import BlogComments from '@/components/BlogComments'

import type { Post, Page } from '@/payload-types'

import { PostHero } from '@/heros/PostHero'
//import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })

  // Get pages
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    depth: 0,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
     })

  // Get posts
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    depth: 0,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const pageParams = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    }) || []

  const postParams = posts.docs.map(({ slug }) => {
    return { slug }
  })

  return [...pageParams, ...postParams]
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/' + decodedSlug

  // Try to find as a post first
  let post = await queryPostBySlug({ slug: decodedSlug })
  if (post) {
    // Fetch comments for this post
    const payload = await getPayload({ config: configPromise })
    const commentsResult = await payload.find({
      collection: 'comments' as any,
      where: {
        replyPost: {
          equals: post.id,
        },
      },
    depth:0,
    })
    const comments = commentsResult.docs || []

    return (
      <div className="relative min-h-screen bg-white dark:bg-background p-2 sm:p-4 md:p-6 lg:p-8">
        {/* SVG Background */}
        <div
          className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
          style={{ backgroundImage: 'url(/landing-dark.svg)' }}
          aria-hidden="true"
        />

        {/* Neobrutalism Frame */}
        <div className="relative z-10 mx-auto w-full max-w-full bg-white dark:bg-card border-2 border-black dark:border-border overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_hsl(var(--border))] sm:border-2 md:border-4 md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:md:shadow-[12px_12px_0px_0px_hsl(var(--border))] min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">
          <NavBar />
          <article className="pt-16 pb-16">
            <PageClient />
            <PayloadRedirects disableNotFound url={url} />
            {draft && <LivePreviewListener />}
            <PostHero post={post} />
            <div className="flex flex-col items-center gap-4 pt-8">
              <div className="container">
                <RichText
                  className="max-w-[48rem] mx-auto"
                  data={post.content}
                  enableGutter={false}
                />
               {/* {post.layout && <RenderBlocks blocks={post.layout} />} */}
                {post.relatedPosts && post.relatedPosts.length > 0 && (
                  <RelatedPosts
                    className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
                    docs={post.relatedPosts.filter((post) => typeof post === 'object')}
                  />
                )}
              </div>
            </div>
            {/* Comments Section */}
            <div className="flex flex-col items-center gap-4 pt-8">
              <div className="container max-w-[48rem] mx-auto">
              <BlogComments comments={comments} postId={String(post.id).trim()} />
              </div>
            </div>
          </article>
          <Footer />
        </div>
      </div>
    )
  }

  // Otherwise, try to find as a page
  let page: Page | null

  page = await queryPageBySlug({
    slug: decodedSlug,
  }) as Page | null

  if (!page && slug === 'home') {
    page = homeStatic as Page
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { heroImage } = page
  const content = page.content
  // Render pages with the same layout as posts
  return (
    <div className="relative min-h-screen bg-white dark:bg-background p-2 sm:p-4 md:p-6 lg:p-8">
      {/* SVG Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{ backgroundImage: 'url(/landing-dark.svg)' }}
        aria-hidden="true"
      />

      {/* Neobrutalism Frame */}
      <div className="relative z-10 mx-auto w-full max-w-full bg-white dark:bg-card border-2 border-black dark:border-border overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_hsl(var(--border))] sm:border-2 md:border-4 md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:md:shadow-[12px_12px_0px_0px_hsl(var(--border))] min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">
        <NavBar />
        <article className="pt-16 pb-16">
          <PageClient />
          <PayloadRedirects disableNotFound url={url} />
          {draft && <LivePreviewListener />}
           {heroImage && <RenderHero {...(heroImage as object)} />}
          <div className="flex flex-col items-center gap-4 pt-8">
            <div className="container">
              {content && (
                <RichText
                  className="max-w-[48rem] mx-auto"
                  data={content}
                  enableGutter={false}
                />
              )}
            </div>
          </div>
        </article>
        <Footer />
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)

  // Try post first
  let post = await queryPostBySlug({ slug: decodedSlug })
  if (post) {
    console.log('Post ID:', post.id, 'Type:', typeof post.id)
    return generateMeta({ doc: post })
  }

  // Otherwise try page
  const page = await queryPageBySlug({
    slug: decodedSlug,
  })

  return generateMeta({ doc: page })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
    depth: 2,
  })

  return result.docs?.[0] || null
})

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
    select: {
      slug: true,
      heroImage: true,
      content: true,
      meta: true,
      publishedAt: true,
    },
    depth: 1,
  })

  return result.docs?.[0] as Page | null ?? null
})
