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
  LayoutGrid,
  List,
  Search,
  ArrowUpDown,
  Filter,
  X,
  Eye,
  Camera,
  Mic,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Marquee from '@/components/ui/marquee'

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

const FAVE_SLUGS: string[] = [
  'great-tailed-grackle',
  'laughing-gull',
  'scissor-tailed-flycatcher',
  'northern-mockingbird',
  'canyon-wren',
]

const ITEMS_PER_PAGE = 30

type ViewMode = 'grid' | 'list'
type SortMode = 'name' | 'date' | 'observations'

/* ── Helpers ──────────────────────────────── */

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getPhotoUrl(
  detail: BirdDetail | undefined,
  baseUrl: string,
): string | null {
  if (!detail?.topPhotoUrl) return null
  return detail.topPhotoUrl.startsWith('http')
    ? detail.topPhotoUrl
    : `${baseUrl}${detail.topPhotoUrl}`
}

/* ── Component ────────────────────────────── */

export default function AllBirdsClient({ birds, baseUrl }: Props) {
  /* ── Derived data ───────────────────────── */
  const filteredBirds = useMemo(
    () => birds.filter((b) => !b.comName.includes('sp.')),
    [birds],
  )

  const faveMarqueeItems = useMemo(
    () =>
      birds
        .filter((b) => FAVE_SLUGS.includes(b.slug))
        .sort((a, b) => FAVE_SLUGS.indexOf(a.slug) - FAVE_SLUGS.indexOf(b.slug))
        .map((b) => b.comName),
    [birds],
  )

  /* ── View state ─────────────────────────── */
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  /* ── Data state ─────────────────────────── */
  const [details, setDetails] = useState<Map<string, BirdDetail>>(new Map())
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())

  // Ref-based guard so loadDetail never re-fetches what's already loaded
  const loadedRef = useRef<Set<string>>(new Set())

  /* ── Controls state (shared by BOTH views) ── */
  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('name')
  const [locationFilter, setLocationFilter] = useState('')

  /* ── Reset pagination when filters or view change ── */
  const prevFilterKey = useRef('')
  const filterKey = `${viewMode}|${search}|${locationFilter}|${sortMode}`

  useEffect(() => {
    if (prevFilterKey.current !== filterKey) {
      setVisibleCount(ITEMS_PER_PAGE)
      setExpandedId(null)
      prevFilterKey.current = filterKey
    }
  }, [filterKey])

  /* ── Available location options (populated as detail loads) ── */
  const locationOptions = useMemo(() => {
    const set = new Set<string>()
    details.forEach((d) => d.locations.forEach((l) => set.add(l)))
    return Array.from(set).sort()
  }, [details])

  /* ── Apply search + location filter (for BOTH views) ──────── */
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

  /* ── Sort helper (shared between grid and list) ──────────── */
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

  /* ── Process (sort) for list view ─────────── */
  const processedListBirds = useMemo(
    () => sortBirds(searchFilteredBirds),
    [searchFilteredBirds, sortBirds],
  )

  /* ── Visible birds (pagination-aware) ────── */
  const visibleBirds = useMemo(
    () =>
      viewMode === 'grid'
        ? searchFilteredBirds.slice(0, visibleCount)
        : processedListBirds.slice(0, visibleCount),
    [viewMode, searchFilteredBirds, visibleCount, processedListBirds],
  )

  const hasMore =
    viewMode === 'grid'
      ? visibleCount < searchFilteredBirds.length
      : visibleCount < processedListBirds.length

  /* ── Load bird detail data ───────────────── */
  const loadDetail = useCallback(
    async (birdId: string) => {
      if (loadedRef.current.has(birdId)) return
      loadedRef.current.add(birdId)

      setLoadingIds((prev) => new Set(prev).add(birdId))

      try {
        const [checklistsRes, mediaRes] = await Promise.all([
          fetch(
            `${baseUrl}/api/bird-checklists?where[speciesRecords.bird][equals]=${birdId}&depth=1&limit=200&sort=-date`,
          ),
          fetch(
            `${baseUrl}/api/bird-media?where[species][equals]=${birdId}&depth=2&limit=50`,
          ),
        ])

        const checklistsData = await checklistsRes.json()
        const mediaData = await mediaRes.json()
        const checklists: any[] = checklistsData.docs ?? []
        const media: any[] = mediaData.docs ?? []

        // Best photo by rating
        const photos = media
          .filter((m: any) => m.mimeType?.startsWith('image/'))
          .sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0))
        const topPhoto = photos[0]

        // Audio count
        const audios = media.filter((m: any) =>
          m.mimeType?.startsWith('audio/'),
        )

        // With sort=-date, newest checklist is first, oldest is last
        const newestChecklist = checklists[0] ?? null
        const oldestChecklist = checklists[checklists.length - 1] ?? null
        const lastDateRaw = newestChecklist?.date ?? null

        // Collect unique locations (using state from checklists)
        const locations = [
          ...new Set(
            checklists
              .map((c: any) => c.state)
              .filter((s: string | undefined) => s),
          ),
        ]

        setDetails((prev) => {
          const next = new Map(prev)
          next.set(birdId, {
            topPhotoUrl: topPhoto?.url ?? null,
            firstLocation: oldestChecklist?.locationName ?? null,
            firstDate: oldestChecklist?.date
              ? formatDate(oldestChecklist.date)
              : null,
            lastDate: lastDateRaw,
            lastDateFormatted: lastDateRaw
              ? formatDate(lastDateRaw)
              : null,
            checklistCount: checklists.length,
            photoCount: photos.length,
            audioCount: audios.length,
            locations,
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
    [baseUrl],
  )

  /* ── Trigger detail loads ───────────────── */
  useEffect(() => {
    const idsToLoad = new Set<string>()
    visibleBirds.forEach((b) => idsToLoad.add(b.id))
    idsToLoad.forEach((id) => loadDetail(id))
  }, [visibleBirds, loadDetail])

  /* ── Handlers ───────────────────────────── */
  const handleToggleView = (mode: ViewMode) => {
    setViewMode(mode)
  }

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE)
  }

  const handleToggleExpand = (birdId: string) => {
    setExpandedId((prev) => (prev === birdId ? null : birdId))
  }

  const handleDismissExpanded = () => {
    setExpandedId(null)
  }

  /* ── Grid: sort by sortMode FIRST, then photos-first as tiebreaker ── */
  const sortedForGrid = useMemo(() => {
    const sorted = [...visibleBirds]
    sorted.sort((a, b) => {
      const da = details.get(a.id)
      const db = details.get(b.id)

      // Primary sort by selected sortMode
      let sortResult = 0
      switch (sortMode) {
        case 'date': {
          const ta = da?.lastDate ? new Date(da.lastDate).getTime() : 0
          const tb = db?.lastDate ? new Date(db.lastDate).getTime() : 0
          sortResult = tb - ta
          break
        }
        case 'observations': {
          sortResult = (db?.checklistCount ?? 0) - (da?.checklistCount ?? 0)
          break
        }
        case 'name':
        default:
          sortResult = a.comName.localeCompare(b.comName)
      }

      // If sortResult is 0 (equal), fall through to photos-first tiebreaker
      if (sortResult !== 0) return sortResult

      const aHas = da?.topPhotoUrl ? 1 : 0
      const bHas = db?.topPhotoUrl ? 1 : 0
      return bHas - aHas
    })
    return sorted
  }, [visibleBirds, details, sortMode])

  /* ── Render: expanded detail card (grid) ── */
  const renderExpandedDetail = (bird: Bird) => {
    const detail = details.get(bird.id)
    const photoUrl = getPhotoUrl(detail, baseUrl)

    return (
      <div className="relative z-50 my-2 w-full overflow-hidden border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:bg-gray-900 dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-6">
          <div className="flex-shrink-0 overflow-hidden rounded-lg border-2 
border-black bg-emerald-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:border-
gray-600 dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] sm:self-stretch sm:w-48">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={bird.comName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-4xl">
                🦜
              </span>
            )}
          </div>
          <div className="flex-1 space-y-1.5">
            <div>
              <h3 className="text-lg font-black uppercase text-gray-800 dark:text-gray-100">
                {bird.comName}
              </h3>
              <p className="text-sm italic text-gray-500 dark:text-gray-400">
                {bird.sciName}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
              <Binoculars className="h-3.5 w-3.5 text-amber-500" />
              <span>
                {detail?.firstDate ?? '—'} &middot;{' '}
                {detail?.firstLocation ?? 'Unknown location'}
              </span>
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
            className="inline-flex items-center gap-1.5 self-start rounded-lg border-2 border-black bg-sky-400 px-4 py-2 text-xs font-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition hover:translate-x-px hover:translate-y-px hover:shadow-none dark:border-gray-600 dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]"
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
          className="w-full rounded-md border-2 border-black bg-white py-1.5 pl-7 pr-7 text-xs font-semibold text-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-lime-400 dark:border-gray-600 dark:bg-white dark:text-gray-800 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
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
          className="appearance-none rounded-md border-2 border-black bg-white py-1.5 pl-7 pr-6 text-xs font-semibold text-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-lime-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
        >
          <option value="name">Name</option>
          <option value="date">Last Reported</option>
          <option value="observations">Times Observed</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
      </div>

      {/* Location filter dropdown */}
      <div className="relative shrink-0">
        <Filter className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="appearance-none rounded-md border-2 border-black bg-white py-1.5 pl-7 pr-6 text-xs font-semibold text-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-lime-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
        >
          <option value="">All Locations</option>
          {locationOptions.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  )

  /* ── Render: results count ──────────────── */
  const renderResultsCount = () => {
    const total =
      viewMode === 'grid'
        ? searchFilteredBirds.length
        : processedListBirds.length
    const showing = Math.min(visibleCount, total)

    let msg = `${showing} of ${total} species`
    if (search) msg += ` matching \u201C${search}\u201D`
    if (locationFilter) msg += ` in ${locationFilter}`

    return (
      <p className="px-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
        {msg}
      </p>
    )
  }

  /* ── Render: grid view ──────────────────── */
  const renderGridView = () => (
    <div className="space-y-2">
      {/*
        auto-fill / minmax creates a fluid grid with as many columns
        as will fit — no fixed breakpoints needed
      */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] justify-items-center gap-3 sm:gap-4">
        {sortedForGrid.map((bird) => {
          const isExpanded = expandedId === bird.id
          const isLoading = loadingIds.has(bird.id)
          const detail = details.get(bird.id)
          const photoUrl = getPhotoUrl(detail, baseUrl)

          return (
            <React.Fragment key={bird.id}>
              {/* Thumbnail circle */}
              <div
                className={`flex flex-col items-center transition-opacity duration-300 ${
                  expandedId && !isExpanded
                    ? 'pointer-events-none opacity-20'
                    : 'opacity-100'
                }`}
              >
                <button
                  onClick={() => handleToggleExpand(bird.id)}
                  className="group relative"
                >
                  <div
                    className={`h-16 w-16 overflow-hidden rounded-full border-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 md:h-20 md:w-20 ${
                      isExpanded
                        ? 'border-lime-400 ring-2 ring-lime-400 ring-inset'
                        : 'border-black dark:border-gray-600'
                    } dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]`}
                  >
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={bird.comName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-gray-100 p-1 text-center dark:bg-gray-700">
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        ) : (
                          <span className="break-all px-0.5 text-[7px] font-semibold uppercase text-gray-600 dark:text-gray-300">
                            {bird.comName}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </button>
              </div>

              {/* Expanded card spans full width — elevated above backdrop */}
              {isExpanded && (
                <div className="col-span-full">
                  {renderExpandedDetail(bird)}
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleShowMore}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-green-400 px-6 py-2.5 text-sm font-black text-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition hover:translate-x-px hover:translate-y-px hover:shadow-none dark:border-gray-600 dark:bg-green-600 dark:text-gray-100 dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
          >
            Show More
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )

  /* ── Render: list view ──────────────────── */
  const renderListView = () => (
    <div className="space-y-3">
      {/* ── List rows ── */}
      <div className="divide-y-2 divide-black bg-white sm:border-2 sm:border-black 
sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:divide-gray-600 sm:dark:border-gray-600
dark:bg-gray-900 sm:dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">

        {visibleBirds.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">
            No birds match your filters.{' '}
            <button
              onClick={() => {
                setSearch('')
                setLocationFilter('')
              }}
              className="underline hover:text-gray-700 dark:hover:text-gray-200"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          visibleBirds.map((bird) => {
            const detail = details.get(bird.id)
            const isLoading = loadingIds.has(bird.id)
            const photoUrl = getPhotoUrl(detail, baseUrl)

            return (
              <Link
                key={bird.id}
                href={`/birds/${bird.slug}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 sm:gap-4 sm:px-5"
              >
                {/* Thumbnail */}
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-gray-100 text-xs dark:bg-gray-700">
                      {isLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
                      ) : (
                        '🦜'
                      )}
                    </span>
                  )}
                </div>

                {/* Name + Eye icon + last date — wraps instead of truncating */}
                <div className="min-w-0 flex-1">
                  <p className="break-words whitespace-normal text-sm font-black uppercase text-gray-800 dark:text-gray-100">
                    {bird.comName}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Eye className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-semibold">
                      {detail?.lastDateFormatted ?? (
                        <span className="text-gray-300 dark:text-gray-500">
                          Loading…
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Observation count badge */}
                <Badge className="flex-shrink-0 border-2 border-black bg-emerald-300 px-2 py-1 text-[10px] font-black text-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:bg-emerald-700 dark:text-gray-100 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                  {detail?.checklistCount ?? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                </Badge>

                {/* Arrow */}
                <ChevronDown className="h-4 w-4 flex-shrink-0 -rotate-90 text-gray-400 dark:text-gray-500" />
              </Link>
            )
          })
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleShowMore}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-green-400 px-6 py-2.5 text-sm font-black text-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition hover:translate-x-px hover:translate-y-px hover:shadow-none dark:border-gray-600 dark:bg-green-600 dark:text-gray-100 dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
          >
            Show More
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )

  /* ── Main Render ──────────────────────────── */

  return (
    <div className="space-y-8">
      <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-gray-700 dark:bg-gray-900 dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]">
        {/* Header with search/filter controls */}
        <div className="border-b-2 border-black bg-pink-100 px-3 py-2 sm:px-5 sm:py-2.5 dark:border-gray-700 dark:bg-gray-800">
          {renderControls()}
        </div>

        {/* Body area */}
        <div className="bg-background px-1 pb-6 pt-2 md:px-6 md:pb-3 md:pt-4">
          <div className="space-y-2">
            {/* Grid/List toggle — centered */}
            <div className="flex justify-center">
              <div className="inline-flex overflow-hidden rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                <button
                  onClick={() => handleToggleView('grid')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-black transition ${
                    viewMode === 'grid'
                      ? 'bg-lime-400 text-gray-800 dark:bg-lime-600 dark:text-gray-100'
                      : 'bg-white text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" /> Grid
                </button>
                <button
                  onClick={() => handleToggleView('list')}
                  className={`flex items-center gap-1 border-l-2 border-black px-3 py-1.5 text-xs font-black transition ${
                    viewMode === 'list'
                      ? 'bg-lime-400 text-gray-800 dark:bg-lime-600 dark:text-gray-100'
                      : 'bg-white text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  <List className="h-3.5 w-3.5" /> List
                </button>
              </div>
            </div>

            {/* Results count */}
            {renderResultsCount()}

            {filteredBirds.length === 0 ? (
              <p className="py-8 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">
                No birds found.
              </p>
            ) : (
              <>
                {/* Backdrop overlay for dismissing expanded card in grid view */}
                {viewMode === 'grid' && expandedId && (
                  <div
                    className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40"
                    onClick={handleDismissExpanded}
                    aria-hidden="true"
                  />
                )}

                {viewMode === 'grid' ? renderGridView() : renderListView()}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Fave Birds Marquee ── */}
      {faveMarqueeItems.length > 0 && (
        <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-gray-700 dark:bg-gray-900 dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]">
          <div className="border-b-2 border-black bg-amber-100 px-5 py-3 md:px-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="flex items-center gap-1.5 text-sm font-black uppercase tracking-wide text-gray-800 md:text-base dark:text-gray-100">
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />{' '}
              Jeff&apos;s Fave Birds
            </h2>
          </div>
          <div className="bg-background p-4 md:p-6">
            <Marquee items={faveMarqueeItems} />
          </div>
        </section>
      )}
    </div>
  )
}
