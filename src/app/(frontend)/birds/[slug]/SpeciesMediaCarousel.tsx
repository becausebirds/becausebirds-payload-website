'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'
import { ImageIcon, Star } from 'lucide-react'

interface PhotoItem {
  id: string
  url?: string | null
  filename?: string | null
  alt?: string | null
  rating?: number | null
  mediaNotes?: string | null
  locationName?: string | null
  date?: string | null
}

interface SpeciesMediaCarouselProps {
  photos: PhotoItem[]
}

export default function SpeciesMediaCarousel({ photos }: 
SpeciesMediaCarouselProps) {
  if (photos.length === 0) {
    return (
      <div className="flex h-[250px] w-full items-center justify-center rounded-
lg border-2 border-black bg-white md:h-[300px]">
        <p className="flex items-center gap-2 text-sm font-bold text-muted-
foreground">
          <ImageIcon className="h-4 w-4" />
          No photos available
        </p>
      </div>
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

  // Default to highest rated, then newest first
  const sortedPhotos = [...photos].sort((a, b) => {
    const ratingA = a.rating ?? 0
    const ratingB = b.rating ?? 0
    if (ratingB !== ratingA) return ratingB - ratingA

    const dateA = a.date ?? ''
    const dateB = b.date ?? ''
    return dateB.localeCompare(dateA)
  })

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Carousel className="w-full max-w-sm md:max-w-md lg:max-w-lg">
        <CarouselContent>
          {sortedPhotos.map((photo) => {
            const src = photo.url?.startsWith('http')
              ? photo.url
              : `${baseUrl}${photo.url ?? ''}`

            return (
              <CarouselItem key={photo.id}>
                <div className="p-[10px]">
                  <Card className="border-2 border-black bg-white p-0 
shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <CardContent className="flex aspect-[4/3] items-center 
justify-center p-0">
                      <img
                        src={src}
                        alt={photo.alt ?? photo.filename ?? 'Bird photo'}
                        className="h-full w-full rounded-[inherit] object-cover"
                      />
                    </CardContent>
                  </Card>
                </div>
                {/* Caption row — shows location and date */}
                <div className="mt-2 flex items-center justify-between px-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {photo.locationName && photo.date
                      ? `${photo.locationName} • ${photo.date}`
                      : photo.locationName
                        ? photo.locationName
                        : photo.date
                          ? photo.date
                          : `Photo ${sortedPhotos.indexOf(photo) + 1}`}
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
