import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

interface ChecklistInfo {
  id: string
  slug?: string | null
  ebirdChecklistId?: string | null
  date?: string | null
  locationName?: string | null
}

interface PhotoItem {
  id: string
  url?: string | null
  filename?: string | null
  alt?: string | null
  rating?: number | null
  mediaNotes?: string | null
  locationName?: string | null
  date?: string | null
  checklistId?: ChecklistInfo | string | null
  ebirdChecklistId?: string | null
}

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

interface BirdMediaItem {
  id: string
  filename?: string | null
  mimeType?: string | null
  url?: string | null
  alt?: string | null
  rating?: number | null
  mediaNotes?: string | null
  checklistId?: string | { id: string; date?: string; locationName?: string } | null
  locationName?: string | null
  date?: string | null
}

async function getMediaForBird(birdId: string): Promise<BirdMediaItem[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/bird-media?where[species][equals]=${birdId}&depth=1&limit=50&fields=id,filename,mimeType,url,alt,rating,mediaNotes,checklistId,locationName,date`,
  )
  if (!res.ok) return []
  const data = await res.json()
  return data.docs ?? []
}

export default async function BirdHeroSection({
  bird,
  photos,
}: {
  bird: Bird
  photos?: PhotoItem[]
}) {
  // Fetch the most recent photos from the API
  const mediaItems = await getMediaForBird(bird.id)

  const apiPhotos = mediaItems
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

  // Sort by rating desc, then date desc — same as SpeciesMediaCarousel
  const sortedPhotos = apiPhotos.length > 0
    ? [...apiPhotos].sort((a, b) => {
        const ratingA = a.rating ?? 0
        const ratingB = b.rating ?? 0
        if (ratingB !== ratingA) return ratingB - ratingA
        const dateA = a.date ?? ''
        const dateB = b.date ?? ''
        return dateB.localeCompare(dateA)
      })
    : (photos
        ? [...photos].sort((a, b) => {
            const ratingA = a.rating ?? 0
            const ratingB = b.rating ?? 0
            if (ratingB !== ratingA) return ratingB - ratingA
            const dateA = a.date ?? ''
            const dateB = b.date ?? ''
            return dateB.localeCompare(dateA)
          })
        : [])

  // Most recent photo for the hero circle
  const heroPhoto = sortedPhotos[0] ?? null

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
  const heroSrc = heroPhoto?.url
    ? heroPhoto.url.startsWith('http') || heroPhoto.url.startsWith('/')
      ? heroPhoto.url
      : `${baseUrl}${heroPhoto.url}`
    : null

  return (
    <>
      <Link
        href="/birds"
        className="inline-flex items-center gap-1.5 rounded-lg border-2 font-bold dark:text-gray-800 border-black bg-green-400 px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:translate-x-px hover:translate-y-px hover:shadow-none"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        View all birds
      </Link>

      <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="border-b-2 border-black bg-lime-100 dark:bg-gray-800 px-5 py-4 md:px-6 md:py-5">
          <div className="flex items-start gap-5">
            {heroSrc && (
  <div className="shrink-0 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
    <Image
      src={heroSrc}
      alt={heroPhoto?.alt ?? heroPhoto?.filename ?? bird.comName}
      width={120}
      height={120}
      quality={85}
      className="h-[60px] w-[60px] rounded-full object-cover md:h-[120px] md:w-[120px]"
    />
  </div>
)}

            <div className="min-w-0 flex-1">
              <h1 className="text-3xl text-gray-800 font-bold dark:text-white tracking-tight uppercase md:text-4xl">
                {bird.comName}
              </h1>
              <p className="mt-1 text-lg dark:text-white text-gray-800 italic text-muted-foreground">
                {bird.sciName}
              </p>
              {bird.familyComName && (
                <p className="mt-1 text-sm text-gray-800 dark:text-white font-semibold text-muted-foreground">
                  {bird.familyComName}
                  {bird.order && <> · {bird.order}</>}
                </p>
              )}
              {bird.taxonomicStatus !== 'current' && (
                <div className="mt-2 inline-block rounded-lg dark:text-white text-gray-800 border-2 border-black bg-yellow-200 px-3 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {bird.taxonomicStatus === 'lumped' ? '🔄 Lumped' : bird.taxonomicStatus === 'split' ? '✂️ Split' : '⛔ Deprecated'}
                </div>
              )}
            </div>
          </div>
        </div>
        {bird.description && (
          <div className="p-5 md:p-6">
            <p className="text-sm font-medium leading-relaxed">{bird.description}</p>
          </div>
        )}
      </section>
    </>
  )
}
