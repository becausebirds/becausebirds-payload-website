// src/app/api/bird-details/batch/route.ts
import { NextRequest, NextResponse } from 'next/server'

const CMS_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
const API_KEY = process.env.PAYLOAD_API_KEY // or however you auth server→server

export async function POST(request: NextRequest) {
  const { ids } = await request.json()

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({})
  }

  // Fetch all checklists for these bird IDs in one query
  const checklistWhere = ids
    .map((id: string) => `speciesRecords.bird.equals=${id}`)
    .join(',')

  const [checklistsRes, mediaRes] = await Promise.all([
    fetch(
      `${CMS_URL}/api/bird-checklists?depth=1&limit=2000&sort=date&where[or][0][speciesRecords.bird][in]=${ids.join(',')}`,
      { headers: API_KEY ? { Authorization: API_KEY } : {} },
    ),
    fetch(
      `${CMS_URL}/api/bird-media?depth=2&limit=2000&where[species][in]=${ids.join(',')}`,
      { headers: API_KEY ? { Authorization: API_KEY } : {} },
    ),
  ])

  const checklistsData = await checklistsRes.json()
  const mediaData = await mediaRes.json()

  const allChecklists: any[] = checklistsData.docs ?? []
  const allMedia: any[] = mediaData.docs ?? []

  // Group by bird ID
  const result: Record<string, any> = {}

  for (const id of ids) {
    const birdChecklists = allChecklists.filter((c: any) =>
      c.speciesRecords?.some((sr: any) => sr.bird === id || sr.bird?.id === id)
    )

    const birdMedia = allMedia.filter(
      (m: any) => (m.species === id || m.species?.id === id)
    )

    const photos = birdMedia
      .filter((m: any) => m.mimeType?.startsWith('image/'))
      .sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0))

    const audio = birdMedia.filter((m: any) =>
      m.mimeType?.startsWith('audio/')
    )

    const firstSighting = birdChecklists[0] ?? null
    const lastSighting = birdChecklists[birdChecklists.length - 1] ?? null

    const locations = [
      ...new Set(
        birdChecklists
          .map((c: any) => c.locationName)
          .filter(Boolean)
      ),
    ]

    const topPhoto = photos[0]

    result[id] = {
      topPhoto: topPhoto
        ? {
            id: topPhoto.id,
            url: topPhoto.url ?? topPhoto.filename ?? '',
            alt: topPhoto.alt ?? '',
            filename: topPhoto.filename ?? '',
            rating: topPhoto.rating ?? null,
          }
        : null,
      firstLocation: firstSighting?.locationName ?? null,
      firstDate: firstSighting?.date ?? null,
      lastDate: lastSighting?.date ?? null,
      lastDateFormatted: lastSighting?.date
        ? new Date(lastSighting.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : null,
      checklistCount: birdChecklists.length,
      photoCount: photos.length,
      audioCount: audio.length,
      locations,
    }
  }

  return NextResponse.json(result)
}
