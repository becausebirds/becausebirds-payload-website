import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import NavBar from '@/components/navbar'
import type { Product } from '@/payload-types'

/* ── Product Card ── */
const ProductCard = ({ product }: { product: Product }) => (
  <div className="border-2 border-black dark:border-white h-full flex flex-col shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_#555555]">
    {/* Thumbnail */}
    {product.thumbnail &&
      typeof product.thumbnail !== 'number' &&
      'url' in product.thumbnail &&
      product.thumbnail.url && (
        <div className="relative w-full h-48 overflow-hidden border-b-2 border-black dark:border-white">
          <Image
            src={product.thumbnail.url}
            alt={product.title}
            fill
            className="object-cover"
          />
        </div>
      )}

    <div className="p-4 flex flex-col flex-1 gap-3">
      {/* Categories */}
      {product.categories &&
        Array.isArray(product.categories) &&
        product.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.categories.map((cat, i) => (
              <Badge key={i}>{cat.category}</Badge>
            ))}
          </div>
        )}

      {/* Title — links to product page */}
      <h2 className="text-xl font-black leading-tight">
        <Link href={`/product/${product.slug}`} className="hover:underline underline-offset-2">
          {product.title}
        </Link>
      </h2>

      {/* Price */}
      {product.price !== null && product.price !== undefined && (
        <p className="text-2xl font-black">${product.price.toFixed(2)}</p>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Tags */}
      {product.tags &&
        Array.isArray(product.tags) &&
        product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.map((t, i) => (
              <span key={i} className="text-[10px] font-bold px-1.5 py-0.5 border border-black dark:border-white">
                #{t.tag}
              </span>
            ))}
          </div>
        )}

      {/* CTA — links to external URL */}
      {product.externalUrl ? (
        <a href={product.externalUrl} target="_blank" rel="noopener noreferrer">
          <Button className="w-full rounded-none mt-2">
            {product.buttonText || 'View Product'} →
          </Button>
        </a>
      ) : (
        <Link href={`/product/${product.slug}`}>
          <Button className="w-full rounded-none mt-2">
            {product.buttonText || 'View Product'} →
          </Button>
        </Link>
      )}
    </div>
  </div>
)

/* ── Filter Button ── */
const FilterLink = ({
  label,
  active,
  href,
}: {
  label: string
  active: boolean
  href: string
}) => (
  <Link
    href={href}
    className={`px-4 py-2 text-sm font-bold border-2 border-black dark:border-white transition-all ${
      active
        ? 'bg-black text-white dark:bg-white dark:text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_#555555]'
        : 'bg-white dark:bg-black text-black dark:text-white hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[3px_3px_0px_0px_#555555]'
    }`}
  >
    {label}
  </Link>
)

/* ── Page ── */
export default async function AllProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams

  const payload = await getPayload({ config: configPromise })

  const where = {
    status: { equals: 'publish' },
    ...(category ? { 'categories.category': { equals: category } } : {}),
  }

  const products = await payload.find({
    collection: 'products',
    limit: 50,
    sort: '-publishedAt',
    where: where as any,
  })

  // Gather all unique categories for the filter bar
  const allProducts = await payload.find({
    collection: 'products',
    limit: 100,
    where: { status: { equals: 'publish' } },
    depth: 0,
  })

  const allCategories = Array.from(
    new Set(
      allProducts.docs.flatMap(
        (p) =>
          (p.categories as { category?: string }[] | undefined)?.map(
            (c) => c.category,
          ) ?? [],
      ),
    ),
  ).filter(Boolean) as string[]

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
          <h1 className="text-5xl font-black mb-8 tracking-tight">Birdwatcher Gift Guide</h1>

          {/* Category Filter Bar */}
          {allCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10 pb-6 border-b-2 border-black dark:border-white">
              <FilterLink
                label="All"
                active={!category}
                href="/bird-lover-gift-ideas"
              />
              {allCategories.map((cat) => (
                <FilterLink
                  key={cat}
                  label={cat}
                  active={category === cat}
                  href={`/bird-lover-gift-ideas?category=${encodeURIComponent(cat)}`}
                />
              ))}
            </div>
          )}

          {/* Product Grid */}
          {products.docs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.docs.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-2xl font-black mb-2">No products found</p>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                Try a different category filter.
              </p>
            </div>
          )}
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
