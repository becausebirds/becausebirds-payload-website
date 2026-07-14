import Image from 'next/image'
import SpeciesMapWrapper from './SpeciesMapWrapper'
import SpeciesMediaCarousel from './SpeciesMediaCarousel'
import SpeciesAudioPlayer from './SpeciesAudioPlayer'
import BirdChecklistsSection from './BirdChecklistsSection'
import { Badge } from '@/components/ui/badge'
import { Camera, Mic, Pin, Binoculars, ClipboardList } from 'lucide-react'

interface BirdStatsSectionProps {
  birdId: string
}

/* ── Types ── */
interface BirdChecklist {
  id: string
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
  locationName?: string | null
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

async function getChecklistsForBird(birdId: string): Promise<BirdChecklist[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/bird-checklists?where[speciesRecords.bird][equals]=${birdId}&depth=0&limit=50&sort=date&fields=id,date,slug,ebirdChecklistId,locationName,locationId,latitude,longitude,county,state,region,speciesRecords.id,speciesRecords.bird,speciesRecords.count,speciesRecords.comments`,
    { next: { revalidate: 60 } },
  )
  if (!res.ok) return []
  const data = await res.json()
  return data.docs ?? []
}

async function getMediaForBird(birdId: string): Promise<BirdMediaItem[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/bird-media?where[species][equals]=${birdId}&depth=1&limit=50&fields=id,filename,mimeType,url,alt,rating,soundTypeTags,equipment,mediaNotes,checklistId,locationName,date`,
    { next: { revalidate: 60 } },
  )
  if (!res.ok) return []
  const data = await res.json()
  return data.docs ?? []
}

export default async function BirdStatsSection({ birdId }: BirdStatsSectionProps) {
  const [checklists, media] = await Promise.all([
    getChecklistsForBird(birdId),
    getMediaForBird(birdId),
  ])

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

  const oldestPhoto = photos.length > 0
    ? photos.reduce((oldest, photo) => {
        if (!photo.url) return oldest
        if (!oldest || !oldest.url) return photo
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
    <>
      {/* ── Stats Row ── */}
      <div className="flex flex-wrap bg-background gap-2 p-5 md:px-6 md:pb-6">
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

      {/* ── Photo Carousel ── */}
      {photos.length > 0 && (
        <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-2 border-black bg-pink-100 px-5 py-3 md:px-6">
            <h2 className="flex items-center gap-1.5 font-black dark:text-gray-800 uppercase text-sm tracking-wide md:text-base">
              <Camera className="h-4 w-4" /> Photos ({photos.length})
            </h2>
          </div>
          <div className="bg-background p-5 md:p-6">
            <SpeciesMediaCarousel photos={photos} />
          </div>
        </section>
      )}

      {/* ── Audio Recordings ── */}
      {audioRecordings.length > 0 && (
        <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-2 border-black bg-fuchsia-100 dark:bg-gray-800 px-5 py-3 md:px-6">
            <h2 className="flex items-center gap-1.5 font-black uppercase text-sm tracking-wide md:text-base">
              <Mic className="h-4 w-4" /> Audio Recordings ({audioRecordings.length})
            </h2>
          </div>
          <div className="px-0">
            <SpeciesAudioPlayer recordings={audioRecordings} />
          </div>
        </section>
      )}

      {/* ── Map Section — lazily loaded via Client Component wrapper ── */}
      {locationPins.length > 0 && (
        <section className="border-2 border-black bg-background shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-2 border-black bg-sky-100 px-5 py-3 md:px-6">
            <h2 className="flex items-center gap-1.5 font-black dark:text-gray-800 uppercase text-sm tracking-wide md:text-base">
              <Pin className="h-4 w-4" /> Sightings Map ({locationPins.length} locations)
            </h2>
          </div>
          <div className="p-4 md:p-5">
            <SpeciesMapWrapper pins={locationPins} />
          </div>
        </section>
      )}

      {/* ── First Sighting ── */}
      {firstSighting && (
        <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-2 border-black bg-amber-100 dark:bg-emerald-800  px-5 py-3 md:px-6">
            <h2 className="flex items-center gap-1.5 font-black font-foreground uppercase text-sm tracking-wide md:text-base">
              <Binoculars className="h-4 w-4" /> First Sighting
            </h2>
          </div>
          <div className="p-5 bg-background md:p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0 overflow-hidden rounded-lg border-2 border-black bg-emerald-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                {oldestPhoto?.url ? (
                  <Image
                    src={oldestPhoto.url.startsWith('http') ? oldestPhoto.url : `${baseUrl}${oldestPhoto.url}`}
                    alt={oldestPhoto.alt ?? oldestPhoto.filename ?? 'Oldest photo'}
                    width={64}
                    height={64}
                    className="aspect-square object-cover"
                    unoptimized={oldestPhoto.url.startsWith('http')}
                  />
                ) : (
                  <span className="flex h-14 w-14 items-center justify-center text-3xl md:h-16 md:w-16">🦜</span>
                )}
              </div>
              <div>
                <p className="text-lg font-black dark:text-gray-100 font-bold">
                  {new Date(firstSighting.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-sm font-black dark:text-gray-100 font-semibold text-muted-foreground">
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

      {/* ── Checklists ── */}
      {checklists.length > 0 && (
        <BirdChecklistsSection checklists={checklists} totalCount={checklistCount} />
      )}
    </>
  )
}
