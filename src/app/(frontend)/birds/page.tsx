// app/(main)/birds/page.tsx
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import NavBar from '@/components/navbar'
import Footer from '@/components/Footer'
import AllBirdsClient from './AllBirdsClient'

export const metadata: Metadata = {
  title: 'All Birds | Because Birds',
  description: 'Browse all bird species with sightings, photos, and recordings.',
}

export const dynamic = 'force-static'
export const revalidate = false

function normalizeMediaUrl(url: unknown): string | null {
  if (typeof url !== 'string') return null
  if (!url) return null

  // Already absolute
  if (url.startsWith('http://') || url.startsWith('https://')) return url

  // Already correct path
  if (url.startsWith('/')) return url

  // Payload sometimes returns relative paths without a leading slash (e.g. "api/...").
  // Make it safe so AllBirdsClient will pass it through as-is.
  return `/${url}`
}

/* ── Page Component ───────────────────────── */
export default async function AllBirdsPage() {
  const payload = await getPayload({ config })

  // ── Fetch all checklists to determine which birds have sightings ──
  const checklistsResult = await payload.find({
    collection: 'bird-checklists',
    limit: 10000,
  })

  // Extract unique bird IDs from speciesRecords across all checklists
  const birdIdsFromChecklists = new Set<string>()
  for (const checklist of checklistsResult.docs) {
    const speciesRecords = checklist.speciesRecords ?? []
    for (const sr of speciesRecords) {
      const birdId = String(typeof sr.bird === 'object' ? sr.bird.id : sr.bird)
      if (birdId) birdIdsFromChecklists.add(birdId)
    }
  }

  const allBirdIds = Array.from(birdIdsFromChecklists)

  // ── Default empty state if no birds ──
  let birds: any[] = []
  let summaries: Record<string, any> = {}
  let allRegions: string[] = []

  if (allBirdIds.length > 0) {
    // ── Fetch bird records for every bird that appears in a checklist ──
    const birdsResult = await payload.find({
      collection: 'birds',
      where: {
        id: { in: allBirdIds },
      },
      limit: 1000,
    })

    // NOTE: Payload/DB ids are sometimes numbers (e.g. Postgres serial ids)
    // rather than strings. Every id is normalized to a string here and used
    // consistently below so that Map/Set lookups never silently fail due to
    // a type mismatch (string !== number). This was the root cause of bird
    // data (photos, checklist counts, dates) not appearing until a bird was
    // clicked: the comparisons below were comparing strings against an
    // array of numeric ids and always failing, so every server-computed
    // summary came back empty, and only the client's on-demand fetch
    // (triggered by clicking) ever populated real data.
    birds = birdsResult.docs
      .filter((b: any) => b.comName && !b.comName.includes('sp.'))
      .map((b: any) => ({ ...b, id: String(b.id) }))

    const birdIds: string[] = birds.map((b: any) => b.id)
    const birdIdSet = new Set(birdIds)

    // ── Fetch media for all sighted birds ──
    const mediaResult = await payload.find({
      collection: 'bird-media',
      where: {
        species: { in: birdIds },
      },
      depth: 2,
      limit: 10000,
    })

    // ── Group checklists and media by bird ID ──
    const checklistsByBird = new Map<string, any[]>()
    const mediaByBird = new Map<string, any[]>()
    const allRegionsSet = new Set<string>()

    for (const checklist of checklistsResult.docs) {
      const speciesRecords = checklist.speciesRecords ?? []
      for (const sr of speciesRecords) {
        const birdId = String(typeof sr.bird === 'object' ? sr.bird.id : sr.bird)
        if (!birdId || !birdIdSet.has(birdId)) continue
        if (!checklistsByBird.has(birdId)) checklistsByBird.set(birdId, [])
        checklistsByBird.get(birdId)!.push(checklist)
        if (checklist.region) allRegionsSet.add(checklist.region)
      }
    }

    for (const item of mediaResult.docs) {
      const speciesEntry = Array.isArray(item.species) ? item.species[0] : item.species
      const speciesId = String(
        speciesEntry && typeof speciesEntry === 'object'
          ? (speciesEntry as any).id
          : speciesEntry
      )
      if (!speciesId || speciesId === 'null' || speciesId === 'undefined' || !birdIdSet.has(speciesId)) continue
      if (!mediaByBird.has(speciesId)) mediaByBird.set(speciesId, [])
      mediaByBird.get(speciesId)!.push(item)
    }

    // ── Compute summary for each bird ──
    for (const id of birdIds) {
      const birdChecklists = (checklistsByBird.get(id) ?? []).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )

      const birdMedia = mediaByBird.get(id) ?? []

      const photos = birdMedia
        .filter((m: any) => m.mimeType?.startsWith('image/'))
        .sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0))

      const audios = birdMedia.filter((m: any) => m.mimeType?.startsWith('audio/'))

      const firstSighting = birdChecklists[0] ?? null
      const lastSighting = birdChecklists[birdChecklists.length - 1] ?? null

      const locations = Array.from(new Set(birdChecklists.map((c: any) => c.region).filter(Boolean)))

      const formatDate = (dateStr: string | null | undefined): string | null => {
        if (!dateStr) return null
        return new Date(dateStr).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      }

      // Build URL in a way that never depends on baseUrl.
      const topPhoto = photos[0]
      let topPhotoUrl: string | null = null

      if (topPhoto) {
        // Prefer Payload-provided url, but normalize so it always starts with "/"
        topPhotoUrl = normalizeMediaUrl((topPhoto as any).url)

        // If url is missing/unusable, fall back to the file endpoint
        if (!topPhotoUrl && (topPhoto as any).filename) {
          topPhotoUrl = `/api/bird-media/file/${(topPhoto as any).filename}`
        }
      }

      summaries[id] = {
        topPhotoUrl,
        firstLocation: firstSighting?.region ?? null,
        firstDate: formatDate(firstSighting?.date),
        lastDate: lastSighting?.date ?? null,
        lastDateFormatted: formatDate(lastSighting?.date),
        checklistCount: birdChecklists.length,
        photoCount: photos.length,
        audioCount: audios.length,
        locations,
      }
    }

    allRegions = Array.from(allRegionsSet).sort()
  }

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

  return (
    <div className="relative min-h-screen bg-white dark:bg-background p-2 sm:p-4 md:p-6 lg:p-8">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{ backgroundImage: 'url(/landing-dark.svg)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-full bg-white dark:bg-card border-2 border-black dark:border-border overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_hsl(var(--border))] sm:border-2 md:border-4 md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:md:shadow-[12px_12px_0px_0px_hsl(var(--border))] min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">
        <NavBar />

        <main className="pt-10 pb-16 container mx-auto px-4 space-y-8">
          <h1 className="text-3xl mb-2 text-gray-800 dark:text-white font-bold tracking-tight uppercase md:text-4xl">
            All Birds
          </h1>
          <p className="text-sm text-gray-800 dark:text-white">
            This is every bird I've ever seen. Explore them below to see my observations, photos, and recordings.
          </p>

          <AllBirdsClient
            birds={birds}
            initialDetails={summaries}
            initialRegions={allRegions}
            baseUrl={baseUrl}
          />
        </main>

        <Footer />
      </div>
    </div>
  )
}
