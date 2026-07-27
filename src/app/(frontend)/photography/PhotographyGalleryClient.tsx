'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Star,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Bird,
  Loader2,
} from 'lucide-react'
import type { PhotoWithChecklist } from '@/lib/getPhotographyData'

interface Props {
  initialPhotos: PhotoWithChecklist[]
  total: number
}

export default function PhotographyGalleryClient({
  initialPhotos,
  total,
}: Props) {
  const [dispayCount, setDisplayCount] = useState(30)
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const loaderRef = useRef<HTMLDivElement>(null)

  // ── Sort ALL photos in memory ──
  const sortedPhotos = useMemo(() => {
    const sorted = [...initialPhotos].sort((a, b) => {
      if (sortBy === 'rating') {
        const ratingA = a.rating ?? 0
        const ratingB = b.rating ?? 0
        if (ratingB !== ratingA) return ratingB - ratingA
      }
      // Default: sort by checklist date descending
      const dateA = getChecklist(a)?.date ?? ''
      const dateB = getChecklist(b)?.date ?? ''
      return dateB.localeCompare(dateA)
    })
    return sorted
  }, [initialPhotos, sortBy])

  const visiblePhotos = sortedPhotos.slice(0, dispayCount)
  const hasMore = dispayCount < sortedPhotos.length

  // ── Infinite scroll via IntersectionObserver ──
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0]
      if (target.isIntersecting && hasMore) {
        setDisplayCount((prev) => Math.min(prev + 30, sortedPhotos.length))
      }
    },
    [hasMore, sortedPhotos.length]
  )

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: '400px',
    })
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [handleObserver])

  // ── Helpers ──
  function getChecklist(photo: PhotoWithChecklist) {
    return photo.checklistId && typeof photo.checklistId === 'object'
      ? photo.checklistId
      : null
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  function getImageSrc(photo: PhotoWithChecklist) {
    const src = photo.url?.startsWith('http')
      ? photo.url.replace(/^https?:\/\/[^\/]+/, '')
      : photo.url ?? ''
    return src
  }

  function getSpeciesNames(photo: PhotoWithChecklist) {
    if (!photo.species || !Array.isArray(photo.species)) return null
    return photo.species
      .filter(
        (s): s is { id: string; comName?: string; sciName?: string } =>
          s !== null
      )
      .map((s) => s.comName ?? s.sciName ?? 'Unknown')
      .join(', ')
  }

  // ── Lightbox Navigation ──
  const currentPhoto =
    lightboxIndex !== null ? sortedPhotos[lightboxIndex] : null

  function prevLightbox() {
    setLightboxIndex((prev) =>
      prev !== null
        ? (prev - 1 + sortedPhotos.length) % sortedPhotos.length
        : null
    )
  }

  function nextLightbox() {
    setLightboxIndex((prev) =>
      prev !== null
        ? (prev + 1) % sortedPhotos.length
        : null
    )
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowLeft') prevLightbox()
      if (e.key === 'ArrowRight') nextLightbox()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex])

  return (
    <>
      {/* ── Sort Controls ── */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <span className="text-sm font-bold text-muted-foreground">
          Sort by:
        </span>
        <button
          onClick={() => setSortBy('recent')}
          className={`px-4 py-1.5 text-sm font-bold rounded-base border-2 transition-all ${
            sortBy === 'recent'
              ? 'border-black bg-yellow-300 dark:bg-yellow-400 dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              : 'border-black bg-white dark:bg-card'
          }`}
        >
          Most Recent
        </button>
        <button
          onClick={() => setSortBy('rating')}
          className={`px-4 py-1.5 text-sm font-bold rounded-base border-2 transition-all ${
            sortBy === 'rating'
              ? 'border-black bg-yellow-300 dark:bg-yellow-400 dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              : 'border-black bg-white dark:bg-card'
          }`}
        >
          Highest Rated
        </button>
        <span className="text-xs font-bold text-muted-foreground ml-auto">
          {dispayCount > sortedPhotos.length
            ? sortedPhotos.length
            : dispayCount}{' '}
          / {total} photos
        </span>
      </div>

      {/* ── Masonry Grid ── */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {visiblePhotos.map((photo, index) => {
          const checklist = getChecklist(photo)
          const dateStr = checklist?.date
          const locationName = checklist?.locationName
          const speciesNames = getSpeciesNames(photo)
          const src = getImageSrc(photo)

          return (
            <button
              key={photo.id}
              onClick={() => setLightboxIndex(index)}
              className="break-inside-avoid w-full border-2 border-black bg-white dark:bg-card shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-left group cursor-pointer"
            >
              {/* Image — using <img> so native aspect ratio is preserved in columns */}
              <div className="relative overflow-hidden">
                <img
                  src={src}
                  alt={photo.alt ?? photo.filename ?? 'Bird photo'}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {photo.rating && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 dark:bg-black/80 border border-black px-2 py-0.5 rounded-base text-xs font-bold shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{photo.rating}</span>
                  </div>
                )}
              </div>
              <div className="border-t-2 border-black p-3 space-y-1">
                {speciesNames && (
                  <p className="text-xs font-bold text-gray-900 dark:text-foreground truncate flex items-center gap-1">
                    <Bird className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                    <span>{speciesNames}</span>
                  </p>
                )}
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] font-semibold text-muted-foreground">
                  {dateStr && (
                    <span className="flex items-center gap-0.5">
                      <Calendar className="h-2.5 w-2.5" />
                      {formatDate(dateStr)}
                    </span>
                  )}
                  {locationName && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-2.5 w-2.5" />
                      {locationName}
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Infinite Scroll Trigger ── */}
      <div ref={loaderRef} className="flex justify-center py-10">
        {hasMore && (
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading more photos...
          </div>
        )}
        {!hasMore && sortedPhotos.length > 0 && (
          <p className="text-sm font-bold text-muted-foreground">
            You&apos;ve reached the end! 🐦
          </p>
        )}
      </div>

      {/* ═══════════════════════════════════════
          LIGHTBOX — redesigned for mobile
          ═══════════════════════════════════════ */}
      {lightboxIndex !== null && currentPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-2 sm:p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="flex flex-col lg:flex-row max-w-6xl max-h-[95vh] w-full h-full lg:h-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Top bar: Close + Nav buttons (mobile) / hidden on desktop ── */}
            <div className="flex items-center justify-between lg:hidden bg-white dark:bg-card border-2 border-black rounded-t-base px-2 py-1.5">
              <button
                onClick={prevLightbox}
                className="border-2 border-black bg-gray-100 dark:bg-gray-800 rounded-base p-1.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="text-xs font-bold text-muted-foreground">
                {lightboxIndex + 1} / {sortedPhotos.length}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={nextLightbox}
                  className="border-2 border-black bg-gray-100 dark:bg-gray-800 rounded-base p-1.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="border-2 border-black bg-gray-100 dark:bg-gray-800 rounded-base p-1.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all ml-1"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ── Image area ── */}
            <div className="relative flex-1 flex items-center justify-center bg-black/40 overflow-hidden min-h-[200px] max-h-[45vh] lg:max-h-[85vh] lg:rounded-l-base">
              <Image
                src={getImageSrc(currentPhoto)}
                alt={
                  currentPhoto.alt ?? currentPhoto.filename ?? 'Bird photo'
                }
                width={1200}
                height={800}
                quality={95}
                className="w-full h-full object-contain"
                priority
              />

              {/* Desktop nav buttons — positioned over the image edges */}
              <button
                onClick={prevLightbox}
                className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-card/90 border-2 border-black rounded-base p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 transition-all"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextLightbox}
                className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-card/90 border-2 border-black rounded-base p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:-translate-x-0.5 transition-all"
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Desktop close button */}
              <button
                onClick={() => setLightboxIndex(null)}
                className="hidden lg:flex absolute top-3 right-3 bg-white/90 dark:bg-card/90 border-2 border-black rounded-base p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ── Metadata Panel ── */}
            <div className="w-full lg:w-72 bg-white dark:bg-card border-2 border-black lg:border-l-0 rounded-b-base lg:rounded-r-base lg:rounded-bl-none overflow-y-auto flex-shrink-0 max-h-[45vh] lg:max-h-[85vh]">
              <div className="border-b-2 border-black bg-lime-100 dark:bg-gray-800 px-4 py-3">
                <h3 className="font-black text-sm">Photo Details</h3>
              </div>
              <div className="p-4 space-y-4 text-sm">
                {getSpeciesNames(currentPhoto) && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Species
                    </p>
                    <p className="font-bold flex items-center gap-1.5">
                      <Bird className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span>{getSpeciesNames(currentPhoto)}</span>
                    </p>
                  </div>
                )}

                {(() => {
                  const cl = getChecklist(currentPhoto)
                  return cl?.date ? (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                        Date
                      </p>
                      <p className="font-semibold flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        {formatDate(cl.date)}
                      </p>
                    </div>
                  ) : null
                })()}

                {(() => {
                  const cl = getChecklist(currentPhoto)
                  return cl?.locationName ? (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                        Location
                      </p>
                      <p className="font-semibold flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span>
                          {cl.locationName}
                          {cl.state && (
                            <span className="text-muted-foreground">
                              , {cl.state}
                            </span>
                          )}
                        </span>
                      </p>
                    </div>
                  ) : null
                })()}

                {currentPhoto.rating && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Rating
                    </p>
                    <p className="font-bold flex items-center gap-0.5">
                      {Array.from({ length: currentPhoto.rating }).map(
                        (_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                          />
                        )
                      )}
                      <span className="text-muted-foreground ml-1">
                        {currentPhoto.rating}/5
                      </span>
                    </p>
                  </div>
                )}

                {currentPhoto.mediaNotes && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Notes
                    </p>
                    <p className="text-muted-foreground italic text-xs leading-relaxed">
                      {currentPhoto.mediaNotes}
                    </p>
                  </div>
                )}

                {(() => {
                  const cl = getChecklist(currentPhoto)
                  const linkId =
                    cl?.ebirdChecklistId ?? cl?.slug ?? null
                  return linkId ? (
                    <Link
                      href={`/bird-checklists/${linkId}`}
                      className="block mt-4 text-center text-xs font-bold border-2 border-black bg-yellow-300 dark:bg-yellow-400 dark:text-black px-3 py-2 rounded-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                    >
                      View Full Checklist →
                    </Link>
                  ) : null
                })()}

                {/* Photo counter (mobile only — desktop shows counter in top metadata) */}
                <p className="text-[11px] text-muted-foreground text-center pt-2 lg:hidden">
                  {lightboxIndex + 1} / {sortedPhotos.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
