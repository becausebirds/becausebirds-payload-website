//BirdChecklistExplorer/index.tsx
import BirdChecklistExplorerClient from './BirdChecklistExplorerClient'

import type { Metadata } from 'next'

// ── Types ──
interface BirdMediaItem {
  id: string
  filename?: string | null
  mimeType?: string | null
  url?: string | null
  alt?: string | null
  rating?: number | null
}

// ── Helpers (mirror RandomChecklists) ──
async function getBestPhotoForBird(birdId: string): Promise<BirdMediaItem | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/bird-media?where[species][equals]=${birdId}&depth=0&limit=10&fields=id,filename,mimeType,url,alt,rating&sort=-rating`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return null
    const data = await res.json()
    const photos: BirdMediaItem[] = data.docs ?? []
    return photos.find((m) => m.mimeType?.startsWith('image/') && m.url) ?? null
  } catch {
    return null
  }
}

// ── Existing data fetcher ──
async function getChecklists() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/bird-checklists?limit=2000&where[private][equals]=false&select[title]=true&select[slug]=true&select[ebirdChecklistId]=true&select[locationName]=true&select[locationId]=true&select[latitude]=true&select[longitude]=true&select[region]=true&select[state]=true&select[county]=true&select[speciesCount]=true&select[date]=true`,
  )
  if (!res.ok) return []
  const data = await res.json()
  return data.docs
}

// ── New: fetch 5 recent checklists for the recent section ──
async function getRecentChecklists() {
  // Fetch 5 most recent public checklists with full depth for species data & GPS
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/bird-checklists?limit=5&depth=2&sort=-date&where[private][equals]=false`,
    { next: { revalidate: 300 } },
  )
  if (!res.ok) return []
  const data = await res.json()
  return data.docs ?? []
}

// ── Enrich each recent checklist with first bird photo ──
async function enrichRecentChecklists(docs: any[]) {
  return Promise.all(
    docs.map(async (checklist: any) => {
      const speciesRecords: any[] = checklist.speciesRecords ?? []
      const previewRecords = speciesRecords.slice(0, 2)

      const birdPreviews = await Promise.all(
        previewRecords.map(async (record: any) => {
          const bird = typeof record?.bird === 'object' ? record.bird : null
          const birdId = bird?.id ?? ''
          const photo = birdId ? await getBestPhotoForBird(birdId) : null

          const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
          const photoUrl = photo?.url
            ? photo.url.startsWith('http') || photo.url.startsWith('/')
              ? photo.url
              : `${baseUrl}${photo.url}`
            : null

          return {
            commonName: bird?.comName ?? 'Unknown',
            count: record.count ?? '',
            photoUrl,
            photoAlt: photo?.alt ?? bird?.comName ?? '',
          }
        }),
      )

      return {
        id: checklist.id,
        slug: checklist.slug ?? checklist.ebirdChecklistId ?? checklist.id,
        locationName: checklist.locationName ?? null,
        date: checklist.date ?? null,
        startTime: checklist.startTime ?? null,
        gpsTrack: checklist.gpsTrack ?? null,
        speciesCount: checklist.speciesCount ?? speciesRecords.length,
        totalSpeciesSeen: speciesRecords.length,
        birdPreviews: birdPreviews.length > 0 ? birdPreviews : null,
      }
    }),
  )
}


export const metadata: Metadata = {
  title: "Jeff's Bird Checklist Explorer",
  description: 'Explore all of the bird checklists I created while birdwatching.',
  openGraph: {
    title: "Jeff's Bird Checklist Explorer",
    description: 'Explore all of the bird checklists I have created while birdwatching.',
  },
}

export default async function BirdChecklistExplorer() {
  const checklists = await getChecklists()
  const recentDocs = await getRecentChecklists()
  const recentChecklists = await enrichRecentChecklists(recentDocs)

  const locationMap = new Map()

  checklists
    .filter((c: any) => typeof c.latitude === 'number' && typeof c.longitude === 'number')
    .forEach((c: any) => {
      const coordinateKey = `${c.latitude.toFixed(4)},${c.longitude.toFixed(4)}`
      const key = c.locationId || coordinateKey

      if (!locationMap.has(key)) {
        locationMap.set(key, {
          id: key,
          locationId: c.locationId,
          name: c.locationName || 'Unknown Location',
          lat: c.latitude,
          lng: c.longitude,
          region: c.region,
          state: c.state,
          county: c.county,
          checklists: [],
          speciesTotal: 0,
        })
      }

      const location = locationMap.get(key)
      location.checklists.push({
        id: c.ebirdChecklistId,
        slug: c.slug,
        date: c.date,
        speciesCount: c.speciesCount ?? 0,
      })
      location.speciesTotal += c.speciesCount ?? 0
    })

  const markers = Array.from(locationMap.values())

  return (
    <article className="pt-12 sm:pt-16 pb-10 sm:pb-16">
      <div className="flex flex-col items-center gap-3 sm:gap-4 pt-4 sm:pt-8">
        <div className="container max-w-full px-2 sm:px-4">
          <BirdChecklistExplorerClient
            checklists={checklists}
            markers={markers}
            recentChecklists={recentChecklists}
          />
        </div>
      </div>
    </article>
  )
}
