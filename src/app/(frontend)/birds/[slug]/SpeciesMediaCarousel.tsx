//SpeciesMediaCarousel.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'
import { ImageIcon, Star } from 'lucide-react'

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

interface SpeciesMediaCarouselProps {
  photos: PhotoItem[]
}

export default function SpeciesMediaCarousel({ photos }: SpeciesMediaCarouselProps) {
  if (photos.length === 0) {
    return (
      <div className="flex h-[250px] w-full items-center justify-center rounded-lg border-2 border-black bg-white md:h-[300px]">
        <p className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          No photos available
        </p>
      </div>
    )
  }

  const sortedPhotos = [...photos].sort((a, b) => {
    const ratingA = a.rating ?? 0
    const ratingB = b.rating ?? 0
    if (ratingB !== ratingA) return ratingB - ratingA
    const dateA = a.date ?? ''
    const dateB = b.date ?? ''
    return dateB.localeCompare(dateA)
  })

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Carousel className="w-full max-w-sm md:max-w-md lg:max-w-lg">
        <CarouselContent>
          {sortedPhotos.map((photo) => {
            // Get checklist data from populated relationship or flattened fields
            const checklist =
              photo.checklistId && typeof photo.checklistId === 'object'
                ? photo.checklistId
                : null

            const dateStr = checklist?.date ?? photo.date
            const locationName = checklist?.locationName ?? photo.locationName
            const checklistSlug =
              photo.ebirdChecklistId ??
              checklist?.ebirdChecklistId ??
              checklist?.slug ??
              null

            // Use relative path - remove the domain if it exists
            const src = photo.url?.startsWith('http')
              ? photo.url.replace(/^https?:\/\/[^\/]+/, '')
              : photo.url ?? ''

            return (
              <CarouselItem key={photo.id}>
                <div className="p-[10px]">
                  <Card className="mx-auto w-fit border-2 border-black bg-white p-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <CardContent className="flex items-center justify-center p-0">
                      <Image
                        src={src}
                        alt={photo.alt ?? photo.filename ?? 'Bird photo'}
                        width={1000}
                        height={600}
                        quality={85}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 500px, 500px"
                        className="max-h-[250px] w-auto rounded-[inherit] md:max-h-[300px]"
                      />
                    </CardContent>
                  </Card>
                </div>
                <div className="mt-2 flex items-center justify-between px-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {dateStr ? formatDate(dateStr) : 'Date unknown'}
                    {locationName && <> · {locationName}</>}
                    {checklistSlug && (
                      <>
                        {' · '}
                        <Link
                          href={`/bird-checklists/${checklistSlug}`}
                          className="font-bold underline hover:underline"
                        >
                          View checklist
                        </Link>
                      </>
                    )}
                  </p>
                  {photo.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold">{photo.rating}</span>
                    </div>
                  )}
                </div>
                {photo.mediaNotes && (
                  <p className="mt-1 px-3 text-xs italic text-muted-foreground">
                    {photo.mediaNotes}
                  </p>
                )}
              </CarouselItem>
            )
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
