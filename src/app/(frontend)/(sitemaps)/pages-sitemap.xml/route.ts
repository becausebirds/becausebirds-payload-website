// route.ts — Pages
import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getPagesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL || 'https://becausebirds.com'

    // 1. Fetch Pages
    const pages = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: { _status: { equals: 'published' } },
      select: { slug: true, updatedAt: true },
    })

    // 2. Fetch Products
    const products = await payload.find({
      collection: 'products',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      select: { slug: true, updatedAt: true },
    })

    const dateFallback = new Date().toISOString()

    const defaultSitemap = [
      { loc: `${SITE_URL}/search`, lastmod: dateFallback },
      { loc: `${SITE_URL}/posts`, lastmod: dateFallback },
      { loc: `${SITE_URL}/birds`, lastmod: dateFallback },
      { loc: `${SITE_URL}/bird-checklists`, lastmod: dateFallback },
    ]

    // Map Pages
    const pageEntries = pages.docs.map((page) => ({
      loc: page.slug === 'home' ? `${SITE_URL}/` : `${SITE_URL}/${page.slug}`,
      lastmod: page.updatedAt || dateFallback,
    }))

    // Map Products
    const productEntries = products.docs.map((product) => ({
      loc: `${SITE_URL}/product/${product.slug}`,
      lastmod: product.updatedAt || dateFallback,
    }))

    return [...defaultSitemap, ...pageEntries, ...productEntries]
  },
  ['pages-sitemap'],
  { tags: ['pages-sitemap'] },
)

export async function GET() {
  const sitemap = await getPagesSitemap()
  return getServerSideSitemap(sitemap)
}
