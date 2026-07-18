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
  )
  if (!res.ok) return []
  const data = await res.json()
  return data.docs ?? []
}

async function getMediaForBird(birdId: string): Promise<BirdMediaItem[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/bird-media?where[species][equals]=${birdId}&depth=1&limit=50&fields=id,filename,mimeType,url,alt,rating,soundTypeTags,equipment,mediaNotes,checklistId,locationName,date`,
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
      {/* ── Jeff's Stats ── */}
<div className="bg-white dark:bg-card border-2 border-black dark:border-gray-600 
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
  <div className="border-b-2 border-black bg-amber-100 px-4 py-2 md:px-5 md:py-2.5
                  dark:border-gray-600 dark:bg-amber-900/80">
    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-700 dark:text-amber-200">
      <img
        src="/jeff_mann.jpg"
        alt="Jeff"
        width={24}
        height={24}
        className="rounded-full object-cover border border-black"
      />
      Jeff's stats for this bird
    </p>
  </div>
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-200 dark:bg-gray-700">
    <div className="bg-white dark:bg-card p-3 text-center">
      <p className="text-xl font-black text-gray-800 dark:text-white">{photos.length}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {photos.length === 1 ? 'Photo' : 'Photos'}
      </p>
    </div>
    <div className="bg-white dark:bg-card p-3 text-center">
      <p className="text-xl font-black text-gray-800 dark:text-white">{audioRecordings.length}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {audioRecordings.length === 1 ? 'Recording' : 'Recordings'}
      </p>
    </div>
    <div className="bg-white dark:bg-card p-3 text-center">
      <p className="text-xl font-black text-gray-800 dark:text-white">{locationPins.length}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {locationPins.length === 1 ? 'Location' : 'Locations'}
      </p>
    </div>
    <div className="bg-white dark:bg-card p-3 text-center">
      <p className="text-xl font-black text-gray-800 dark:text-white">{checklistCount}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {checklistCount === 1 ? 'Checklist' : 'Checklists'}
      </p>
    </div>
  </div>
</div>


      {/* ── Photo Carousel ── */}
      {photos.length > 0 && (
        <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:bg-gray-900 dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]">
          <div className="border-b-2 border-black bg-sky-200 px-5 py-3 md:px-6 dark:border-gray-600 dark:bg-sky-900">
            <h2 className="flex items-center gap-1.5 font-black text-gray-800 dark:text-gray-100 uppercase text-sm tracking-wide md:text-base">
              <Camera className="h-4 w-4" /> Photos ({photos.length})
            </h2>
          </div>
          <div className="bg-background p-5 md:p-6 dark:bg-gray-800">
            <SpeciesMediaCarousel photos={photos} />
          </div>
        </section>
      )}

      {/* ── Audio Recordings ── */}
      {audioRecordings.length > 0 && (
        <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:bg-purple-900 dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]">
          <div className="border-b-2 border-black bg-fuchsia-100 px-5 py-3 md:px-6 dark:border-gray-600 dark:bg-purple-900">
            <h2 className="flex items-center gap-1.5 font-black text-gray-800 dark:text-gray-100 uppercase text-sm tracking-wide md:text-base">
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
        <section className="border-2 border-black bg-background shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]">
          <div className="border-b-2 border-black bg-yellow-400 px-5 py-3 md:px-6 dark:border-gray-600 dark:bg-yellow-700">
            <h2 className="flex items-center gap-1.5 font-black text-gray-800 dark:text-gray-100 uppercase text-sm tracking-wide md:text-base">
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
  <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:bg-gray-900 dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]">
    <div className="border-b-2 border-black bg-amber-100 px-5 py-3 md:px-6 dark:border-gray-600 dark:bg-amber-900">
      <h2 className="flex items-center gap-1.5 font-black text-gray-800 dark:text-gray-100 uppercase text-sm tracking-wide md:text-base">
        <Binoculars className="h-4 w-4" /> First Sighting
      </h2>
    </div>
    <div className="p-5 bg-background md:p-6 dark:bg-gray-800">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 border-black bg-emerald-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:bg-emerald-900 dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]">
          {oldestPhoto?.url ? (
            <Image
              src={oldestPhoto.url.startsWith('http') || oldestPhoto.url.startsWith('/') ? oldestPhoto.url : `${baseUrl}${oldestPhoto.url}`}
              alt={oldestPhoto.alt ?? oldestPhoto.filename ?? 'Oldest photo'}
              fill
              className="object-cover"
              sizes="64px"
              unoptimized={oldestPhoto.url.startsWith('http')}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-3xl">🦜</span>
          )}
        </div>
        <div>
          <p className="text-lg font-black text-gray-800 dark:text-gray-100">
            {new Date(firstSighting.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
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
