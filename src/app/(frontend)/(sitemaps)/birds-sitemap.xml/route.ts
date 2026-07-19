import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getBirdsSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||      'https://becausebirds.com'

    // Fetch all bird checklists (non-private only)
    const checklists = await payload.find({
      collection: 'bird-checklists',
      overrideAccess: false,
      draft: false,
      depth: 2,
      limit: 10000,
      pagination: false,
      where: { private: { equals: false } },
      select: {
        speciesRecords: true,
      },
    })

    // Collect unique bird IDs from all checklists, excluding 'sp.' birds
    const birdIds = new Set<string>()
    checklists.docs.forEach((checklist) => {
      if (checklist.speciesRecords && Array.isArray(checklist.speciesRecords)) {
        checklist.speciesRecords.forEach((record) => {
          const bird = record.bird as any
          if (bird && typeof bird === 'object' && 'id' in bird) {
            // Filter out 'sp.' birds
            if (!bird.comName?.includes(' sp.')) {
              birdIds.add(bird.id)
            }
          }
        })
      }
    })

    // Fetch only birds that appear on checklists
    const birds = await payload.find({
      collection: 'birds',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 10000,
      pagination: false,
      where: {
        id: {
          in: Array.from(birdIds),
        },
      },
      select: { slug: true, updatedAt: true },
    })

    const dateFallback = new Date().toISOString()

    const birdEntries = birds.docs
      .filter((bird) => Boolean(bird?.slug))
      .map((bird) => ({
        loc: `${SITE_URL}/birds/${bird.slug}`,
        lastmod: bird.updatedAt || dateFallback,
      }))

    return birdEntries
  },
  ['birds-sitemap'],
  {
    tags: ['birds-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getBirdsSitemap()
  return getServerSideSitemap(sitemap)
}
