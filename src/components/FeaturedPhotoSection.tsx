import { getPayload } from 'payload'
import configPromise from '@payload-config'
import ImageCard from '@/components/ui/image-card'
import Link from 'next/link'
import { Bird, Camera } from 'lucide-react'

// ═══ Hardcode the bird-media ID you want to feature here ═══
const FEATURED_MEDIA_ID = '3533'

export default async function FeaturedPhotoSection() {
  const payload = await getPayload({ config: configPromise })

  let imageUrl = ''
  let birdName = ''
  let locationName = ''
  let dateStr = ''
  let speciesSlug: string | null = null
  let checklistSlug: string | null = null
  let checklistId: string | null = null

  try {
    const media = await payload.findByID({
      collection: 'bird-media',
      id: FEATURED_MEDIA_ID,
      depth: 2,
    })

    const m = media as any
    imageUrl = m.url ?? ''

    // species is hasMany: true — handle as array
    const speciesArray = Array.isArray(m.species)
      ? m.species
      : m.species
        ? [m.species]
        : []
    const firstSpecies = speciesArray.find(
      (s: any) => s && typeof s === 'object' && !Array.isArray(s),
    ) as { comName?: string; slug?: string } | undefined ?? null
    birdName = firstSpecies?.comName ?? ''
    speciesSlug = firstSpecies?.slug ?? null

    // locationName, date, and checklist link come from the linked checklist
    const checklistRel =
      m.checklistId && typeof m.checklistId === 'object' && !Array.isArray(m.checklistId)
        ? (m.checklistId as any)
        : null
    if (checklistRel) {
      locationName = checklistRel.locationName ?? ''
      dateStr = checklistRel.date
        ? new Date(checklistRel.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : ''
      checklistSlug = checklistRel.slug ?? null
      checklistId = checklistRel.ebirdChecklistId ?? checklistRel.id ?? null
    }
  } catch {
    return null
  }

  if (!imageUrl) return null

  const checklistHref = checklistSlug
    ? `/bird-checklist/${checklistSlug}`
    : checklistId
      ? `/bird-checklist/${checklistId}`
      : null

  // ── Richer caption: bird name on top, location · date below, lighter ──
  const hasCaption = birdName || locationName || dateStr
  const caption = hasCaption ? (
    <div className="flex flex-col gap-0.5">
      {birdName && (
        <span className="block font-black leading-tight">
          {birdName}
        </span>
      )}
      {(locationName || dateStr) && (
        <span className="block text-xs font-medium text-muted-foreground leading-tight">
          {[locationName, dateStr].filter(Boolean).join(' · ')}
        </span>
      )}
    </div>
  ) : (
    'Featured photo'
  )

  return (
    <section className="mb-12">
      <h2 className="text-4xl sm:text2xl font-black mb-6 tracking-tight text-gray-900 dark:text-foreground">
  Photo spotlight
  <Camera className="inline-block h-6 w-6 sm:h-6 sm:w-6 text-muted-foreground ml-1.5" />
</h2>
       
      <ImageCard caption={caption} imageUrl={imageUrl} className="w-full" />

      <div className="mt-5 text-center">
        <Link
          href={'/birds'}
          className="inline-flex items-center gap-2 rounded-lg bg-background border-2 border-black px-5 py-2.5 text-sm font-bold text-gray-900 dark:text-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <Bird className="inline-block h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground ml-1.5" />
          View more birds →
        </Link>
      </div>
    </section>
  )
}
