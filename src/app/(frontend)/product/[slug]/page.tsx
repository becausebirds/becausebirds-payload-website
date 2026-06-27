import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import NavBar from '@/components/navbar'
import type { Product } from '@/payload-types'

export default async function SingleProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const payload = await getPayload({ config: configPromise })

  const products = await payload.find({
    collection: 'products',
    limit: 1,
    where: {
      slug: { equals: slug },
      status: { equals: 'publish' },
    },
  })

  const product = products.docs[0]

  if (!product) {
    notFound()
  }

  return (
    <div className="relative min-h-screen bg-white dark:bg-black p-2 sm:p-4 md:p-6 lg:p-8">
      {/* SVG Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{ backgroundImage: 'url(/landing-dark.svg)' }}
        aria-hidden="true"
      />

      {/* Neobrutalism Frame */}
      <div className="relative z-10 mx-auto w-full max-w-full bg-white dark:bg-black border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#555555] sm:border-2 md:border-4 md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:md:shadow-[12px_12px_0px_0px_#555555] min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">
        <NavBar />

        <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            {/* Left — Thumbnail (uncropped) */}
            <div className="relative w-full aspect-square border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_#555555] overflow-hidden bg-gray-50 dark:bg-gray-950">
              {product.thumbnail &&
                typeof product.thumbnail !== 'number' &&
                'url' in product.thumbnail &&
                product.thumbnail.url ? (
                <Image
                  src={product.thumbnail.url}
                  alt={product.title}
                  fill
                  className="object-contain p-4"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-400 font-bold text-lg">
                  No Image
                </div>
              )}
            </div>

            {/* Right — Details */}
            <div className="flex flex-col gap-6">
              <Link
                href="/product"
                className="text-sm font-bold underline underline-offset-4 hover:opacity-70"
              >
                ← Back to all products
              </Link>

              <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                {product.title}
              </h1>

              {/* Button + Publish Date — moved to top */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                {product.externalUrl && (
                  <a
                    href={product.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="rounded-none text-base px-8 py-6">
                      {product.buttonText || 'View Product'} →
                    </Button>
                  </a>
                )}

                {product.publishedAt && (
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    Published{' '}
                    {new Date(product.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}{' '}
                    by Jeff Mann
                  </p>
                )}
              </div>

              {/* Description — RichText */}
              {product.description && (
                <div className="prose dark:prose-invert max-w-none text-base leading-relaxed">
                  <RichText data={product.description} />
                </div>
              )}

              {/* Tags */}
              {product.tags &&
                Array.isArray(product.tags) &&
                product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map((t, i) => (
                      <span
                        key={i}
                        className="text-xs font-bold px-2 py-0.5 border border-black dark:border-white"
                      >
                        #{t.tag}
                      </span>
                    ))}
                  </div>
                )}

              {/* Category Badges — moved to the bottom */}
              {product.categories &&
                Array.isArray(product.categories) &&
                product.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t-2 border-black dark:border-white">
                    {product.categories.map((cat, i) => (
                      <Badge key={i}>{cat.category}</Badge>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </main>

        <footer className="border-t-2 border-black dark:border-white mt-16">
          <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm font-bold">
            <p>© 2026 becausebirds. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
