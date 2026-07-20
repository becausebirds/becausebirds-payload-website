import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { MapPin, Calendar, Bird, ClipboardList, ListChecks } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import ChecklistMapWrapper from '@/components/ChecklistMapWrapper'

interface TrackPoint {
  lat: number
  lng: number
  timestamp?: string
}

interface BirdMediaItem {
  id: string
  filename?: string | null
  mimeType?: string | null
  url?: string | null
  alt?: string | null
  rating?: number | null
}

const FEATURED_CHECKLIST_SLUG = 'S367111873'

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

function formatTime(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  // Check if there's an actual time component (not just midnight)
  if (
    d.getHours() !== 0 ||
    d.getMinutes() !== 0 ||
    d.getSeconds() !== 0
  ) {
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }
  return null
}

export default async function RandomChecklists() {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'bird-checklists',
    limit: 1,
    depth: 2,
    where: {
      slug: { equals: FEATURED_CHECKLIST_SLUG },
      private: { not_equals: true },
    },
  })

  const checklist = result.docs[0]
  if (!checklist) return null

  const speciesRecords: any[] = checklist.speciesRecords ?? []
  const totalSpecies = checklist.speciesCount ?? speciesRecords.length

  const timeOfDay = formatTime(checklist.date) ?? (checklist.startTime as string | undefined) ?? null

  // Preview the first three birds + fetch their best photo
  const previewBirds = await Promise.all(
    speciesRecords.slice(0, 3).map(async (record: any) => {
      const bird = typeof record.bird === 'object' ? record.bird : null
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
        birdId,
        photoUrl,
        photoAlt: photo?.alt ?? bird?.comName ?? '',
      }
    }),
  )

  const checklistLink =
    checklist.slug ?? checklist.ebirdChecklistId ?? checklist.id

  return (
    <section className="mb-12">
      <h2 className="text-4xl sm:text2xl font-black mb-6 tracking-tight text-gray-900 dark:text-foreground">
  Featured bird checklist
  <ClipboardList className="inline-block h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground ml-1.5" />
</h2>


      <Link href={`/bird-checklists/${checklistLink}`} className="group block">
        <div className="border-2 border-black bg-white dark:bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_hsl(var(--border))]">
          {/* Mini map */}
          <div className="overflow-hidden border-b-2 border-black">
            <div className="h-36 [&_div]:!h-full [&_div]:!min-h-0">
              <ChecklistMapWrapper
                trackPoints={checklist.gpsTrack as TrackPoint[]}
              />
            </div>
          </div>

          {/* Info */}
          <div className="bg-gray-200 dark:bg-gray-800 p-4">
            {checklist.locationName && (
              <p className="flex items-center gap-1.5 text-sm font-bold text-gray-800 dark:text-gray-100 group-hover:underline">
                <MapPin className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="truncate">{checklist.locationName}</span>
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-muted-foreground">
              {checklist.date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(checklist.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              )}
              {timeOfDay && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {timeOfDay}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Bird className="h-3 w-3" />
                {totalSpecies} {totalSpecies === 1 ? 'species' : 'species'}
              </span>
            </div>

            {/* Bird preview — 3 birds with photos when available */}
            {previewBirds.length > 0 && (
              <div className="mt-3 border-t-2 border-dashed border-gray-400 dark:border-gray-600 pt-3 space-y-2">
                {previewBirds.map((bird, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 rounded-lg border-2 border-black bg-amber-50 dark:bg-amber-900/30 px-3 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    {/* Bird photo (or fallback monogram) */}
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      {bird.photoUrl ? (
                        <Image
                          src={bird.photoUrl}
                          alt={bird.photoAlt}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-blue-200 dark:bg-blue-800 text-[10px] font-black text-black dark:text-white leading-none">
                          {bird.commonName
                            .split(' ')
                            .map((w: string) => w[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>

                    <span className="flex-1 text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">
                      {bird.commonName}
                    </span>
                    {bird.count && (
                      <span className="inline-flex items-center rounded-md border-2 border-black bg-emerald-300 px-2 py-0.5 text-xs font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        ×{bird.count}
                      </span>
                    )}
                  </div>
                ))}
                {speciesRecords.length > 3 && (
                  <p className="text-center text-xs font-bold text-gray-600 dark:text-gray-400 pt-1">
                    +{speciesRecords.length - 3} more species
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>

      <div className="flex justify-center mt-5">
        <Link
          href="/bird-checklists"
          className="inline-flex items-center gap-2 bg-background text-gray-900 dark:text-foreground rounded-lg border-2 border-black px-5 py-2.5 text-sm font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
        >
          <ClipboardList className="h-4 w-4" />
          Explore checklists →
        </Link>
      </div>
    </section>
  )
}
