import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import NavBar from '@/components/navbar'
import Footer from '@/components/Footer'
import SpeciesMapClient from './SpeciesMapClient'
import SpeciesMediaCarousel from './SpeciesMediaCarousel'
import SpeciesAudioPlayer from './SpeciesAudioPlayer'
import BirdChecklistsSection from './BirdChecklistsSection'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Camera, Mic, Pin, Binoculars, ClipboardList } from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
}

/* ── Types ────────────────────────────────── */

interface Bird {
  id: string
  comName: string
  sciName: string
  speciesCode: string
  slug: string
  familyComName?: string | null
  order?: string | null
  description?: string | null
  taxonomicStatus: string
}

interface BirdChecklist {
  id: string
  title?: string | null
  date: string
  slug?: string | null
  ebirdChecklistId?: string | null
  locationName?: string | null
  locationId?: string | null
  latitude?: number | null
  longitude?: number | null
  county?: string | null
  state?: string | null
  region?: string | null
  speciesRecords?: Array<{
    id: string
    bird: string | { id: string; comName?: string; sciName?: string }
    count?: string | number | null
    comments?: string | null
  }>
  private?: boolean | null
}

interface BirdMediaItem {
  id: string
  filename?: string | null
  mimeType?: string | null
  url?: string | null
  alt?: string | null
  rating?: number | null
  soundTypeTags?: {
    song?: boolean | null
    call?: boolean | null
    flightSong?: boolean | null
    flightCall?: boolean | null
    mechanicalSound?: boolean | null
    dawnSong?: boolean | null
    duet?: boolean | null
  } | null
  equipment?: {
    recorder?: string | null
    microphone?: string | null
    accessories?: string | null
  } | null
  mediaNotes?: string | null
  checklistId?: string | { id: string; date?: string; locationName?: string } | null
  /** Added: populated from checklistId relationship */
  locationName?: string | null
  /** Added: formatted date string from checklistId relationship */
  date?: string | null
}

export interface LocationPin {
  lat: number
  lng: number
  name: string
  date: string
  checklistId: string
  ebirdChecklistId?: string | null
}

/* ── Data Fetching ────────────────────────── */

async function getBird(slug: string): Promise<Bird | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/birds?where[slug][equals]=${slug}&depth=1`,
    { next: { revalidate: 60 } },
  )
  if (!res.ok) return null
  const data = await res.json()
  return data.docs?.[0] ?? null
}

async function getChecklistsForBird(birdId: string): Promise<BirdChecklist[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/bird-checklists?where[speciesRecords.bird][equals]=${birdId}&depth=1&limit=200&sort=date`,
    { next: { revalidate: 60 } },
  )
  if (!res.ok) return []
  const data = await res.json()
  return data.docs ?? []
}

async function getMediaForBird(birdId: string): Promise<BirdMediaItem[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/bird-media?where[species][equals]=${birdId}&depth=2&limit=100`,
    { next: { revalidate: 60 } },
  )
  if (!res.ok) return []
  const data = await res.json()
  return data.docs ?? []
}

/* ── Page Component ───────────────────────── */

export default async function BirdSpeciesPage({ params }: PageProps) {
  const { slug } = await params

  const bird = await getBird(slug)
  if (!bird) notFound()

  const [checklists, media] = await Promise.all([
    getChecklistsForBird(bird.id),
    getMediaForBird(bird.id),
  ])

if (checklists.length === 0) notFound()

  // ── Map photos to include location & date from checklistId ──
  const photos = media
    .filter((m) => m.mimeType?.startsWith('image/'))
    .map((m) => {
      const checklist =
        typeof m.checklistId === 'object' && m.checklistId !== null
          ? (m.checklistId as { id: string; date?: string; locationName?: string })
          : null
      return {
        ...m,
        locationName: checklist?.locationName ?? null,
        date: checklist?.date
          ? new Date(checklist.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : null,
      }
    })

  const audioRecordings = media.filter((m) => m.mimeType?.startsWith('audio/'))

  // Build unique location pins
  const locationPins: LocationPin[] = []
  const seenLocations = new Set<string>()

  for (const cl of checklists) {
    if (cl.latitude != null && cl.longitude != null && cl.locationName) {
      const key = `${cl.latitude.toFixed(4)}-${cl.longitude.toFixed(4)}`
      if (!seenLocations.has(key)) {
        seenLocations.add(key)
        locationPins.push({
          lat: cl.latitude,
          lng: cl.longitude,
          name: cl.locationName,
          date: cl.date,
          checklistId: cl.id,
          ebirdChecklistId: cl.ebirdChecklistId,
        })
      }
    }
  }

  const firstSighting = checklists.length > 0 ? checklists[0] : null
  const checklistCount = checklists.length

  // ── Find the oldest photo (earliest date) for the first sighting thumbnail ──
  const oldestPhoto = photos.length > 0
    ? photos.reduce((oldest, photo) => {
        if (!photo.url) return oldest
        if (!oldest || !oldest.url) return photo
        // Compare raw date strings (ISO format sorts lexicographically)
        const checklistOldest =
          typeof oldest.checklistId === 'object' && oldest.checklistId !== null
            ? (oldest.checklistId as { date?: string }).date
            : null
        const checklistPhoto =
          typeof photo.checklistId === 'object' && photo.checklistId !== null
            ? (photo.checklistId as { date?: string }).date
            : null
        if (!checklistPhoto) return oldest
        if (!checklistOldest) return photo
        return checklistPhoto < checklistOldest ? photo : oldest
      }, null as (typeof photos)[0] | null)
    : null

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

  return (
    <div className="relative min-h-screen bg-white dark:bg-background p-2 sm:p-4 md:p-6 lg:p-8">
      {/* SVG Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{ backgroundImage: 'url(/landing-dark.svg)' }}
        aria-hidden="true"
      />

      {/* Neobrutalism Frame */}
      <div className="relative z-10 mx-auto w-full max-w-full bg-white dark:bg-card border-2 border-black dark:border-border overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_hsl(var(--border))] sm:border-2 md:border-4 md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:md:shadow-[12px_12px_0px_0px_hsl(var(--border))] min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">
        <NavBar />

        <main className="pt-10 pb-16 container mx-auto px-4 space-y-6">

          {/* ── View All Birds Button ─────────────────────────── */}
          <Link
            href="/birds"
            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-green-400 px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:translate-x-px hover:translate-y-px hover:shadow-none"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            View All Birds
          </Link>

          {/* ── Bird Hero ──────────────────────────────────── */}
          <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="border-b-2 border-black bg-lime-100 px-5 py-4 md:px-6 md:py-5">
              <h1 className="text-3xl font-black tracking-tight uppercase md:text-4xl">
                {bird.comName}
              </h1>
              <p className="mt-1 text-lg italic text-muted-foreground">
                {bird.sciName}
              </p>
              {bird.familyComName && (
                <p className="mt-1 text-sm font-semibold text-muted-foreground">
                  {bird.familyComName}
                  {bird.order && <> · {bird.order}</>}
                </p>
              )}
              {bird.taxonomicStatus !== 'current' && (
                <div className="mt-2 inline-block rounded-lg border-2 border-black bg-yellow-200 px-3 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {bird.taxonomicStatus === 'lumped'
                    ? '🔄 Lumped'
                    : bird.taxonomicStatus === 'split'
                      ? '✂️ Split'
                      : '⛔ Deprecated'}
                </div>
              )}
            </div>
            {bird.description && (
              <div className="p-5 md:p-6">
                <p className="text-sm font-medium leading-relaxed">
                  {bird.description}
                </p>
              </div>
            )}

            {/* ── Stats Row (Badges) ─────────────────────────── */}
            <div className="flex flex-wrap gap-2 p-5 md:px-6 md:pb-6">
              <Badge className="border-2 border-black bg-emerald-300 px-3 py-1.5 text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {checklistCount} checklists
              </Badge>
              <Badge className="border-2 border-black bg-sky-300 px-3 py-1.5 text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {locationPins.length} locations
              </Badge>
              <Badge className="border-2 border-black bg-orange-300 px-3 py-1.5 text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {photos.length} photos
              </Badge>
              <Badge className="border-2 border-black bg-fuchsia-300 px-3 py-1.5 text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {audioRecordings.length} recordings
              </Badge>
            </div>
          </section>

          {/* ── Photo Carousel ──────────────────────────────── */}
          {photos.length > 0 && (
            <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="border-b-2 border-black bg-pink-100 px-5 py-3 md:px-6">
                <h2 className="flex items-center gap-1.5 font-black uppercase text-sm tracking-wide md:text-base">
                  <Camera className="h-4 w-4" /> Photos ({photos.length})
                </h2>
              </div>
              <div className="p-5 md:p-6">
                <SpeciesMediaCarousel photos={photos} />
              </div>
            </section>
          )}

          {/* ── Audio Recordings ────────────────────────────── */}
          {audioRecordings.length > 0 && (
            <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="border-b-2 border-black bg-fuchsia-100 px-5 py-3 md:px-6">
                <h2 className="flex items-center gap-1.5 font-black uppercase text-sm tracking-wide md:text-base">
                  <Mic className="h-4 w-4" />  Audio Recordings ({audioRecordings.length})
                </h2>
              </div>
              <div className="p-5 md:p-6">
                <SpeciesAudioPlayer recordings={audioRecordings} />
              </div>
            </section>
          )}

          {/* ── Map Section ──────────────────────────────────── */}
          {locationPins.length > 0 && (
            <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="border-b-2 border-black bg-sky-100 px-5 py-3 md:px-6">
                <h2 className="flex items-center gap-1.5 font-black uppercase text-sm tracking-wide md:text-base">
                  <Pin className="h-4 w-4" />  Sightings Map ({locationPins.length} locations)
                </h2>
              </div>
              <div className="p-4 md:p-5">
                <SpeciesMapClient pins={locationPins} />
              </div>
            </section>
          )}

          {/* ── First Sighting ──────────────────────────────── */}
          {firstSighting && (
            <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
           <div className="border-b-2 border-black bg-amber-100 px-5 py-3 md:px-6">
  <h2 className="flex items-center gap-1.5 font-black uppercase text-sm tracking-wide md:text-base">
    <Binoculars className="h-4 w-4" /> First Sighting
  </h2>
</div>

              <div className="p-5 md:p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 overflow-hidden rounded-lg border-2 border-black bg-emerald-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    {oldestPhoto?.url ? (
                      <img
                        src={
                          oldestPhoto.url.startsWith('http')
                            ? oldestPhoto.url
                            : `${baseUrl}${oldestPhoto.url}`
                        }
                        alt={oldestPhoto.alt ?? oldestPhoto.filename ?? 'Oldest photo'}
                        className="h-14 w-14 object-cover md:h-16 md:w-16"
                      />
                    ) : (
                      <span className="flex h-14 w-14 items-center justify-center text-3xl md:h-16 md:w-16">
                        🦜
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-bold">
                      {new Date(firstSighting.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {firstSighting.locationName}
                      {firstSighting.county && <> · {firstSighting.county}</>}
                      {firstSighting.state && <> · {firstSighting.state}</>}
                      {!firstSighting.county && !firstSighting.state && firstSighting.region && <> · {firstSighting.region}</>}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── Checklist Dates (5 + View More) ──────────────── */}
          {checklists.length > 0 && (
            <BirdChecklistsSection checklists={checklists} totalCount={checklistCount} />
          )}
        </main>

        <Footer />
      </div>
    </div>
  )
}

/* ── Static Generation ────────────────────── */

export async function generateStaticParams() {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

  // Fetch all checklists with bird slugs embedded (shallow depth, minimal fields)
  const res = await fetch(
    `${baseUrl}/api/bird-checklists?depth=1&limit=10000&fields=speciesRecords.bird`,
    { next: { revalidate: 60 } },
  )
  if (!res.ok) return []

  const data = await res.json()
  const seenSlugs = new Set<string>()

  for (const checklist of data.docs ?? []) {
    for (const record of checklist.speciesRecords ?? []) {
      // record.bird could be a string (just the ID) or an object with slug
      if (typeof record.bird === 'object' && record.bird?.slug) {
        seenSlugs.add(record.bird.slug)
      }
    }
  }

  return Array.from(seenSlugs).map((slug) => ({ slug }))
}


/* ── Metadata ───────────────────────────────── */

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const bird = await getBird(slug)

  if (!bird) {
    return { title: 'Bird Species Not Found' }
  }

  return {
    title: `${bird.comName} | Because Birds`,
    description: `Sightings, photos, and audio recordings of ${bird.comName} (${bird.sciName})${bird.familyComName ? ` from the ${bird.familyComName} family` : ''}.`,
  }
}
