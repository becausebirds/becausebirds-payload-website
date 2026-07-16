'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Link from 'next/link'
import {
  ChevronDown,
  ExternalLink,
  Loader2,
  Binoculars,
  Star,
  Heart,
  Search,
  ArrowUpDown,
  Filter,
  X,
  Camera,
  Mic,
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
  lastDate: string | null
  lastDateFormatted: string | null
  checklistCount: number
  photoCount: number
  audioCount: number
  locations: string[]
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

type SortMode = 'name' | 'date' | 'observations'

/* ── Helpers ──────────────────────────── */

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getPhotoUrl(detail: BirdDetail | undefined, baseUrl: string): string |
null {
  if (!detail?.topPhotoUrl) return null
  if (detail.topPhotoUrl.startsWith('http') ||
detail.topPhotoUrl.startsWith('/')) {
    return detail.topPhotoUrl
  }
  return `${baseUrl}${detail.topPhotoUrl}`
}

/* ── Component ────────────────────────── */

export default function AllBirdsClient({ birds, baseUrl }: Props) {
  /* ── Fetch lifers instead of using all birds ── */
  const [lifersLoading, setLifersLoading] = useState(true)
  const [liferBirds, setLiferBirds] = useState<Bird[]>([])

  useEffect(() => {
    const fetchLifers = async () => {
      setLifersLoading(true)
      try {
        const res = await fetch(`${baseUrl}/api/lifers?depth=1&limit=1000`)
        const data = await res.json()
        const birdsData = (data.docs ?? [])
          .map((lifer: any) => lifer.bird)
          .filter(Boolean)
        setLiferBirds(birdsData)
      } catch (err) {
        console.error('Failed to fetch lifers:', err)
        setLiferBirds([])
      } finally {
        setLifersLoading(false)
      }
    }
    fetchLifers()
  }, [baseUrl])

  const filteredBirds = useMemo(() => {
    return liferBirds.filter((b) => !b.comName.includes('sp.'))
  }, [liferBirds])

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [details, setDetails] = useState<Map<string, BirdDetail>>(new Map())
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('name')
  const [locationFilter, setLocationFilter] = useState('')

  const faveFive = filteredBirds.filter((b) => FAVE_FIVE_SLUGS.includes(b.slug))

  /* ── Reset pagination when filters change ── */
  const prevFilterKey = useRef('')
  const filterKey = `${search}|${locationFilter}|${sortMode}`

  useEffect(() => {
    if (prevFilterKey.current !== filterKey) {
      setVisibleCount(ITEMS_PER_PAGE)
      setExpandedId(null)
      prevFilterKey.current = filterKey
    }
  }, [filterKey])

  /* ── Available location options ── */
  const locationOptions = useMemo(() => {
    const set = new Set<string>()
    details.forEach((d) => d.locations.forEach((l) => set.add(l)))
    return Array.from(set).sort()
  }, [details])

  /* ── Apply search + location filter ──────── */
  const searchFilteredBirds = useMemo(() => {
    let list = [...filteredBirds]

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (b) =>
          b.comName.toLowerCase().includes(q) ||
          b.sciName.toLowerCase().includes(q),
      )
    }

    if (locationFilter) {
      list = list.filter((b) => {
        const detail = details.get(b.id)
        return detail?.locations.includes(locationFilter) ?? false
      })
    }

    return list
  }, [filteredBirds, search, locationFilter, details])

  /* ── Sort helper ──────────────────────────── */
  const sortBirds = useCallback(
    (list: Bird[]) => {
      const sorted = [...list]
      sorted.sort((a, b) => {
        const da = details.get(a.id)
        const db = details.get(b.id)

        switch (sortMode) {
          case 'date': {
            const ta = da?.lastDate ? new Date(da.lastDate).getTime() : 0
            const tb = db?.lastDate ? new Date(db.lastDate).getTime() : 0
            return tb - ta // newest first
          }
          case 'observations': {
            return (db?.checklistCount ?? 0) - (da?.checklistCount ?? 0)
          }
          case 'name':
          default:
            return a.comName.localeCompare(b.comName)
        }
      })
      return sorted
    },
    [sortMode, details],
  )

  /* ── Visible birds (pagination-aware) ────── */
  const visibleBirdsProcessed = useMemo(
    () => sortBirds(searchFilteredBirds).slice(0, visibleCount),
    [searchFilteredBirds, visibleCount, sortBirds],
  )

  const hasMoreFiltered = visibleCount < sortBirds(searchFilteredBirds).length

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
        const lastSighting = checklists[checklists.length - 1] ?? null

        // Collect unique locations
        const locations = Array.from(
          new Set(checklists.map((c: any) => c.locationName).filter(Boolean))
        )

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
            lastDate: lastSighting?.date ?? null,
            lastDateFormatted: lastSighting?.date
              ? new Date(lastSighting.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : null,
            checklistCount: checklists.length,
            photoCount: photos.length,
            audioCount: media.filter((m: any) =>
m.mimeType?.startsWith('audio/')).length, locations,})
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
    visibleBirdsProcessed.forEach((bird) => loadDetail(bird.id))
    faveFive.forEach((bird) => loadDetail(bird.id))
  }, [visibleCount, loadDetail, faveFive, visibleBirdsProcessed])

  /* ── Handlers ────────────────────────────── */

  const toggleExpand = (birdId: string) => {
    setExpandedId((prev) => (prev === birdId ? null : birdId))
  }

  const showMore = () => {
    setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE,
sortBirds(searchFilteredBirds).length))
  }

  /* ── Sorting: Birds with images first ──── */

  const sortedVisibleBirds = useMemo(() => {
    return [...visibleBirdsProcessed].sort((a, b) => {
      const aHasImage = details.get(a.id)?.topPhotoUrl ? 1 : 0
      const bHasImage = details.get(b.id)?.topPhotoUrl ? 1 : 0
      return bHasImage - aHasImage
    })
  }, [visibleBirdsProcessed, details])

  /* ── Render expanded detail card ──────────── */

  const renderExpandedDetail = (bird: Bird) => {
    const detail = details.get(bird.id)
    const photoUrl = getPhotoUrl(detail, baseUrl)

    return (
      <div className="relative z-50 my-2 w-full overflow-hidden border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:bg-gray-900 dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-6">
          <div className="flex-shrink-0 overflow-hidden rounded-lg border-2 border-black bg-emerald-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] sm:self-stretch sm:w-48">
            {photoUrl ? (
              <img src={photoUrl} alt={bird.comName} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-4xl">🦜</span>
            )}
          </div>
          <div className="flex-1 space-y-1.5">
            <div>
              <h3 className="text-lg font-black uppercase text-gray-800 dark:text-gray-100">{bird.comName}</h3>
              <p className="text-sm italic text-gray-500 dark:text-gray-400">{bird.sciName}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
              <Binoculars className="h-3.5 w-3.5 text-amber-500" />
              <span>{detail?.firstDate ?? '—'} &middot;{' '}
                {detail?.firstLocation ?? 'Unknown location'}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-2 border-black bg-emerald-300 px-2.5 py-1 text-[11px] font-black text-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                {detail?.checklistCount ?? '…'}{' '}
                observation{(detail?.checklistCount ?? 0) !== 1 ? 's' : ''}
              </Badge>
              <Badge className="flex items-center gap-1 border-2 border-black bg-sky-200 px-2.5 py-1 text-[11px] font-black text-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                <Camera className="h-3 w-3" />
                {detail?.photoCount ?? '…'}
              </Badge>
              <Badge className="flex items-center gap-1 border-2 border-black bg-purple-200 px-2.5 py-1 text-[11px] font-black text-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                <Mic className="h-3 w-3" />
                {detail?.audioCount ?? '…'}
              </Badge>
            </div>
          </div>
          <Link
            href={`/birds/${bird.slug}`}
            className="inline-flex items-center gap-1.5 self-start rounded-lg
border-2 border-black bg-sky-400 px-4 py-2 text-xs font-black text-white
shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition hover:translate-x-px
hover:translate-y-px hover:shadow-none dark:border-gray-600
dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]"
          >
            View Bird
          </Link>
        </div>
      </div>
    )
  }

  /* ── Render: search/filter controls bar ──────────── */
  const renderControls = () => (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      {/* Search */}
      <div className="relative min-w-0 flex-[2]">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search birds…"
          className="w-full rounded-md border-2 border-black bg-white py-1.5 pl-7 pr-7 text-xs font-semibold text-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-lime-400"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Sort dropdown */}
      <div className="relative shrink-0">
        <ArrowUpDown className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="appearance-none rounded-md border-2 border-black bg-white py-1.5 pl-7 pr-6 text-xs font-semibold text-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-lime-400"
        >
          <option value="name">Name</option>
          <option value="date">Last Reported</option>
          <option value="observations">Times Observed</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2
h-3 w-3 -translate-y-1/2 text-gray-400" />
      </div>

      {/* Location filter dropdown */}
      <div className="relative shrink-0">
        <Filter className="pointer-events-none absolute left-2 top-1/2 h-3.5
w-3.5 -translate-y-1/2 text-gray-400" />
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="appearance-none rounded-md border-2 border-black bg-white
py-1.5 pl-7 pr-6 text-xs font-semibold text-gray-800
shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2
focus:ring-lime-400"
        >
          <option value="">All Locations</option>
          {locationOptions.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2
h-3 w-3 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  )

  /* ── Render: results count ──────────────── */
  const renderResultsCount = () => {
    const total = sortBirds(searchFilteredBirds).length
    const showing = Math.min(visibleCount, total)

    let msg = `${showing} of ${total} species`
    if (search) msg += ` matching "${search}"`
    if (locationFilter) msg += ` in ${locationFilter}`

    return (
      <p className="px-1 mb-2 text-xs font-semibold text-gray-500">
        {msg}
      </p>
    )
  }

  /* ── Main render ──────────────────────────── */

  return (
    <div className="space-y-8">
      <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        {/* Header with search/filter controls */}
        <div className="border-b-2 border-black bg-pink-100 px-3 py-2 sm:px-5 sm:py-2.5">
          {renderControls()}
        </div>

        <div className="bg-background px-1 py-2 md:p-6">
          {/* Results count */}
          {renderResultsCount()}

          {lifersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-sm font-semibold text-gray-500">
                Loading your lifers…
              </span>
            </div>
          ) : sortBirds(searchFilteredBirds).length === 0 ? (
            <p className="py-8 text-center text-sm font-semibold text-gray-500">
              {search || locationFilter ? 'No birds match your filters.' : 'No birds found.'}
              {(search || locationFilter) && (
                <button
                  onClick={() => {
                    setSearch('')
                    setLocationFilter('')
                  }}
                  className="ml-2 underline hover:text-gray-700"
                >
                  Clear filters
                </button>
              )}
            </p>
          ) : (
            <div className="space-y-2">
              {/* ── Flexbox layout — circles flow naturally into rows ── */}
              <div className="flex flex-wrap items-start justify-center gap-1">
                {sortedVisibleBirds.map((bird) => {
                  const isExpanded = expandedId === bird.id
                  const isLoading = loadingIds.has(bird.id)
                  const detail = details.get(bird.id)
                  const photoUrl = getPhotoUrl(detail, baseUrl)

                  if (isExpanded) {
                    // When expanded, render the full-width detail card
                    return (
                      <div key={bird.id} className="w-full">
                        {renderExpandedDetail(bird)}
                      </div>
                    )
                  }

                  return (
                    <div key={bird.id} className="flex flex-col items-center px-0.5">
                      <button onClick={() => toggleExpand(bird.id)}
className="group relative">
                        <div
                          className={`h-16 w-16 md:h-20 md:w-20 overflow-hidden rounded-full border-2 transition-all duration-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                            isExpanded
                              ? 'border-lime-400 ring-2 ring-lime-400 ring-inset'
                              : 'border-black'
                          }`}
                        >
                          {photoUrl ? (
                            <img src={photoUrl} alt={bird.comName}
className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center
justify-center bg-gray-100 p-1 text-center">
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
                  )
                })}
              </div>

              {hasMoreFiltered && (
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
        <section className="border-2 border-black bg-white
shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-2 border-black bg-amber-100 px-5 py-3
md:px-6">
            <h2 className="flex items-center gap-1.5 font-black text-gray-800 uppercase text-sm tracking-wide md:text-base">
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
Jeff&apos;s Fave Five
            </h2>
          </div>
          <div className="bg-background p-4 md:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {faveFive.map((bird) => {
                const detail = details.get(bird.id)
                const photoUrl = getPhotoUrl(detail, baseUrl)
                return (
                  <div
                    key={bird.id}
                    className="flex flex-col items-center rounded-lg border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition
hover:translate-x-px hover:translate-y-px hover:shadow-none"
                  >
                    <div className="h-20 w-20 overflow-hidden rounded-full
border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
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
