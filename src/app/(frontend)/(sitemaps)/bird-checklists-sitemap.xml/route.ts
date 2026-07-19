import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getBirdChecklistsSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    // Fetch only public (non-private) checklists
    const checklists = await payload.find({
      collection: 'bird-checklists',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 10000,
      pagination: false,
      where: { private: { equals: false } },
      select: { slug: true, updatedAt: true },
    })

    const dateFallback = new Date().toISOString()

    const checklistEntries = checklists.docs
      .filter((checklist) => Boolean(checklist?.slug))
      .map((checklist) => ({
        loc: `${SITE_URL}/bird-checklists/${checklist.slug}`,
        lastmod: checklist.updatedAt || dateFallback,
      }))

    return checklistEntries
  },
  ['bird-checklists-sitemap'],
  {
    tags: ['bird-checklists-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getBirdChecklistsSitemap()
  return getServerSideSitemap(sitemap)
}
