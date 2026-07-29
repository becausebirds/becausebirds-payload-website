import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { MapPin, Calendar, Bird, ListChecks } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import ChecklistMapWrapper from '@/components/ChecklistMapWrapper'

/* ── Types ── */
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

/* ── Helpers (mirror RandomChecklists) ── */

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
  if (d.getHours() !== 0 || d.getMinutes() !== 0 || d.getSeconds() !== 0) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }
  return null
}

/* ── Component ── */

export default async function RecentChecklists() {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'bird-checklists',
    limit: 5,
    depth: 2,
    sort: '-date',
    where: {
      private: { not_equals: true },
    },
  })

  const checklists = result.docs
  if (!checklists.length) return null

  // For each checklist, fetch the first bird + its best photo
  const enrichedChecklists = await Promise.all(
    checklists.map(async (checklist: any) => {
      const speciesRecords: any[] = checklist.speciesRecords ?? []
      const firstRecord = speciesRecords[0] ?? null
      const bird = typeof firstRecord?.bird === 'object' ? firstRecord.bird : null
      const birdId = bird?.id ?? ''
      const photo = birdId ? await getBestPhotoForBird(birdId) : null

      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
      const photoUrl = photo?.url
        ? photo.url.startsWith('http') || photo.url.startsWith('/')
          ? photo.url
          : `${baseUrl}${photo.url}`
        : null

      return {
        id: checklist.id,
        slug: checklist.slug ?? checklist.ebirdChecklistId ?? checklist.id,
        locationName: checklist.locationName as string | undefined,
        date: checklist.date as string | undefined,
        startTime: checklist.startTime as string | undefined,
        gpsTrack: checklist.gpsTrack as TrackPoint[] | undefined,
        speciesCount: checklist.speciesCount ?? speciesRecords.length,
        totalSpeciesSeen: speciesRecords.length,
        birdPreview: bird
          ? {
              commonName: bird.comName ?? 'Unknown',
              count: firstRecord.count ?? '',
              photoUrl,
              photoAlt: photo?.alt ?? bird.comName ?? '',
            }
          : null,
      }
    }),
  )

  return (
    <section className="mb-12">
      <h2 className="text-4xl sm:text-2xl font-black mb-6 tracking-tight text-gray-900 dark:text-foreground">
        Recent checklists
        <ListChecks className="inline-block h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground ml-1.5" />
      </h2>

      <div className="space-y-4">
        {enrichedChecklists.map((checklist) => {
          const timeOfDay = formatTime(checklist.date) ?? checklist.startTime ?? null

          return (
            <Link
              key={checklist.id}
              href={`/bird-checklists/${checklist.slug}`}
              className="group block"
            >
              <div className="border-2 border-black bg-white dark:bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_hsl(var(--border))]">
                {/* Mini map row */}
                {checklist.gpsTrack && checklist.gpsTrack.length > 0 && (
                  <div className="overflow-hidden border-b-2 border-black">
                    <div className="h-28 [&_div]:!h-full [&_div]:!min-h-0">
                      <ChecklistMapWrapper trackPoints={checklist.gpsTrack} />
                    </div>
                  </div>
                )}

                {/* Info row */}
                <div className="bg-gray-200 dark:bg-gray-800 p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {/* Location */}
                      {checklist.locationName && (
                        <p className="flex items-center gap-1.5 text-sm font-bold text-gray-800 dark:text-gray-100 group-hover:underline">
                          <MapPin className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span className="truncate">{checklist.locationName}</span>
                        </p>
                      )}

                      {/* Meta row */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-muted-foreground">
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
                          {checklist.speciesCount}{' '}
                          {checklist.speciesCount === 1 ? 'species' : 'species'}
                        </span>
                      </div>
                    </div>

                    {/* First bird badge (compact) */}
                    {checklist.birdPreview && (
                      <div className="shrink-0 flex items-center gap-2 rounded-lg border-2 border-black bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="h-7 w-7 shrink-0 overflow-hidden rounded-md border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                          {checklist.birdPreview.photoUrl ? (
                            <Image
                              src={checklist.birdPreview.photoUrl}
                              alt={checklist.birdPreview.photoAlt}
                              width={28}
                              height={28}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-blue-200 dark:bg-blue-800 text-[10px] font-black text-black dark:text-white leading-none">
                              {checklist.birdPreview.commonName
                                .split(' ')
                                .map((w: string) => w[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight max-w-[120px] truncate">
                          {checklist.birdPreview.commonName}
                        </span>
                        {checklist.birdPreview.count && (
                          <span className="inline-flex items-center rounded-md border-2 border-black bg-emerald-300 px-1.5 py-0.5 text-[10px] font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            ×{checklist.birdPreview.count}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Extra species indicator */}
                  {checklist.totalSpeciesSeen > 1 && (
                    <p className="mt-2 text-[11px] font-bold text-gray-600 dark:text-gray-400 text-right">
                      +{checklist.totalSpeciesSeen - 1} more{' '}
                      {checklist.totalSpeciesSeen - 1 === 1 ? 'species' : 'species'}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* View all link */}
      <div className="flex justify-center mt-5">
        <Link
          href="/bird-checklists"
          className="inline-flex items-center gap-2 bg-background text-gray-900 dark:text-foreground rounded-lg border-2 border-black px-5 py-2.5 text-sm font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
        >
          <ListChecks className="h-4 w-4" />
          View all checklists →
        </Link>
      </div>
    </section>
  )
}
