'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  ChevronDown,
  ExternalLink,
  Loader2,
  Binoculars,
  Star,
  Heart,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

/* ── Types ────────────────────────────────── */

interface Bird {
  id: string
  comName: string
  sciName: string
  speciesCode: string
  slug: string
}

interface BirdDetail {
  topPhotoUrl: string | null
  firstLocation: string | null
  firstDate: string | null
  checklistCount: number
}

interface Props {
  birds: Bird[]
  baseUrl: string
}

/* ── Config ────────────────────────────────── */

const FAVE_FIVE_SLUGS: string[] = [
  'bald-eagle',
  'northern-cardinal',
  'american-robin',
  'blue-jay',
  'ruby-throated-hummingbird',
]

const ITEMS_PER_PAGE = 30

/* ── Component ────────────────────────────── */

export default function AllBirdsClient({ birds, baseUrl }: Props) {
  const filteredBirds = useMemo(() => {
    return birds.filter((b) => !b.comName.includes('sp.'))
  }, [birds])

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [details, setDetails] = useState<Map<string, BirdDetail>>(new Map())
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())

  const visibleBirds = filteredBirds.slice(0, visibleCount)
  const hasMore = visibleCount < filteredBirds.length

  const faveFive = filteredBirds.filter((b) => FAVE_FIVE_SLUGS.includes(b.slug))

  /* ── Load bird detail data ────────────────── */

  const loadDetail = useCallback(
    async (birdId: string) => {
      if (details.has(birdId) || loadingIds.has(birdId)) return
      setLoadingIds((prev) => new Set(prev).add(birdId))

      try {
        const [checklistsRes, mediaRes] = await Promise.all([
          fetch(
            `${baseUrl}/api/bird-checklists?where[speciesRecords.bird][equals]=${birdId}&depth=1&limit=200&sort=date`,
          ),
          fetch(
            `${baseUrl}/api/bird-media?where[species][equals]=${birdId}&depth=2&limit=50`,
          ),
        ])

        const checklistsData = await checklistsRes.json()
        const mediaData = await mediaRes.json()
        const checklists = checklistsData.docs ?? []
        const media = mediaData.docs ?? []

        const photos = media
          .filter((m: any) => m.mimeType?.startsWith('image/'))
          .sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0))
        const topPhoto = photos[0]

        const firstSighting = checklists[0] ?? null

        setDetails((prev) => {
          const next = new Map(prev)
          next.set(birdId, {
            topPhotoUrl: topPhoto?.url ?? null,
            firstLocation: firstSighting?.locationName ?? null,
            firstDate: firstSighting?.date
              ? new Date(firstSighting.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : null,
            checklistCount: checklists.length,
          })
          return next
        })
      } catch (err) {
        console.error('Failed to load bird details:', err)
      } finally {
        setLoadingIds((prev) => {
          const next = new Set(prev)
          next.delete(birdId)
          return next
        })
      }
    },
    [baseUrl, details, loadingIds],
  )

  useEffect(() => {
    visibleBirds.forEach((bird) => loadDetail(bird.id))
    faveFive.forEach((bird) => loadDetail(bird.id))
  }, [visibleCount, loadDetail, faveFive])

  /* ── Handlers ────────────────────────────── */

  const toggleExpand = (birdId: string) => {
    setExpandedId((prev) => (prev === birdId ? null : birdId))
  }

  const showMore = () => {
    setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredBirds.length))
  }

  /* ── Sorting: Birds with images first ──── */

  const sortedVisibleBirds = useMemo(() => {
    return [...visibleBirds].sort((a, b) => {
      const aHasImage = details.get(a.id)?.topPhotoUrl ? 1 : 0
      const bHasImage = details.get(b.id)?.topPhotoUrl ? 1 : 0
      return bHasImage - aHasImage
    })
  }, [visibleBirds, details])

  /* ── Render expanded detail card ──────────── */

  const renderExpandedDetail = (bird: Bird) => {
    const detail = details.get(bird.id)
    const photoUrl = detail?.topPhotoUrl
      ? detail.topPhotoUrl.startsWith('http')
        ? detail.topPhotoUrl
        : `${baseUrl}${detail.topPhotoUrl}`
      : null

    return (
      <div className="my-2 w-full border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex-shrink-0 overflow-hidden rounded-lg border-2 border-black bg-emerald-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            {photoUrl ? (
              <img src={photoUrl} alt={bird.comName} className="h-24 w-24 object-cover md:h-28 md:w-28" />
            ) : (
              <span className="flex h-24 w-24 items-center justify-center text-4xl md:h-28 md:w-28">🦜</span>
            )}
          </div>
          <div className="flex-1 space-y-1.5">
            <div>
              <h3 className="text-lg font-black uppercase text-gray-800">{bird.comName}</h3>
              <p className="text-sm italic text-gray-500">{bird.sciName}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-600">
              <Binoculars className="h-3.5 w-3.5 text-amber-500" />
              <span>{detail?.firstDate ?? '—'} &middot; {detail?.firstLocation ?? 'Unknown location'}</span>
            </div>
            <Badge className="border-2 border-black bg-emerald-300 px-2.5 py-1 text-[11px] font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {detail?.checklistCount ?? '…'} observation{(detail?.checklistCount ?? 0) !== 1 ? 's' : ''}
            </Badge>
          </div>
          <Link
            href={`/birds/${bird.slug}`}
            className="inline-flex items-center gap-1.5 self-start rounded-lg border-2 border-black bg-sky-400 px-4 py-2 text-xs font-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition hover:translate-x-px hover:translate-y-px hover:shadow-none sm:self-center"
          >
            View Bird
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    )
  }

  /* ── Main render ──────────────────────────── */

  return (
    <div className="space-y-8">
      <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="border-b-2 border-black bg-pink-100 px-5 py-3 md:px-6">
          <h2 className="flex items-center gap-1.5 font-black text-gray-800 uppercase text-sm tracking-wide md:text-base">
            <Star className="h-4 w-4" /> Species Gallery
          </h2>
        </div>
        <div className="bg-background px-1 py-2 md:p-6">
          {filteredBirds.length === 0 ? (
            <p className="py-8 text-center text-sm font-semibold text-gray-500">No birds found.</p>
          ) : (
            <div className="space-y-2">
              {/* ── CSS Grid — each bird stays in its cell; expanded card spans all columns ── */}
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 justify-items-center gap-3">
                {sortedVisibleBirds.map((bird) => {
                  const isExpanded = expandedId === bird.id
                  const isLoading = loadingIds.has(bird.id)
                  const detail = details.get(bird.id)
                  const photoUrl = detail?.topPhotoUrl
                    ? detail.topPhotoUrl.startsWith('http')
                      ? detail.topPhotoUrl
                      : `${baseUrl}${detail.topPhotoUrl}`
                    : null

                  return (
                    <React.Fragment key={bird.id}>
                      {/* ── Thumbnail ── */}
                      <div
                        className={`flex flex-col items-center transition-opacity duration-300 ${
                          expandedId && !isExpanded ? 'opacity-20 pointer-events-none' : 'opacity-100'
                        }`}
                      >
                        <button onClick={() => toggleExpand(bird.id)} className="group relative">
                          <div
                            className={`h-16 w-16 md:h-20 md:w-20 overflow-hidden rounded-full border-2 transition-all duration-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                              isExpanded
                                ? 'border-lime-400 ring-2 ring-lime-400 ring-inset'
                                : 'border-black'
                            }`}
                          >
                            {photoUrl ? (
                              <img src={photoUrl} alt={bird.comName} className="h-full w-full object-cover" />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center bg-gray-100 p-1 text-center">
                                {isLoading ? (
                                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                                ) : (
                                  <span className="text-[7px] font-semibold text-gray-600 uppercase break-all px-0.5">
                                    {bird.comName}
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </button>
                      </div>

                      {/* ── Expanded card spans full width below this bird ── */}
                      {isExpanded && <div className="col-span-full">{renderExpandedDetail(bird)}</div>}
                    </React.Fragment>
                  )
                })}
              </div>

              {hasMore && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={showMore}
                    className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-green-400 px-6 py-2.5 text-sm font-black text-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition hover:translate-x-px hover:translate-y-px hover:shadow-none"
                  >
                    Show More
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {faveFive.length > 0 && (
        <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-2 border-black bg-amber-100 px-5 py-3 md:px-6">
            <h2 className="flex items-center gap-1.5 font-black text-gray-800 uppercase text-sm tracking-wide md:text-base">
              <Heart className="h-4 w-4 fill-red-500 text-red-500" /> Jeff&apos;s Fave Five
            </h2>
          </div>
          <div className="bg-background p-4 md:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {faveFive.map((bird) => {
                const detail = details.get(bird.id)
                const photoUrl = detail?.topPhotoUrl
                  ? detail.topPhotoUrl.startsWith('http')
                    ? detail.topPhotoUrl
                    : `${baseUrl}${detail.topPhotoUrl}`
                  : null
                return (
                  <div
                    key={bird.id}
                    className="flex flex-col items-center rounded-lg border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition hover:translate-x-px hover:translate-y-px hover:shadow-none"
                  >
                    <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                      {photoUrl ? (
                        <img src={photoUrl} alt={bird.comName} className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-gray-100 p-1 text-center">
                          <span className="text-[9px] leading-tight font-semibold text-gray-600 uppercase break-all px-0.5">
                            {bird.comName}
                          </span>
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-center text-sm font-black uppercase text-gray-800">{bird.comName}</h3>
                    <p className="text-xs italic text-gray-500">{bird.sciName}</p>
                    <Badge className="mt-2 border-2 border-black bg-emerald-300 px-2 py-1 text-[10px] font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {detail?.checklistCount ?? '…'} obs
                    </Badge>
                    <Link
                      href={`/birds/${bird.slug}`}
                      className="mt-3 inline-flex items-center gap-1 rounded-lg border-2 border-black bg-sky-400 px-3 py-1.5 text-[11px] font-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:translate-x-px hover:translate-y-px hover:shadow-none"
                    >
                      View Bird
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
