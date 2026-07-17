'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronDown,
  Loader2,
  Star,
  Heart,
  Search,
  ArrowUpDown,
  Filter,
  X,
  Camera,
  Mic,
  Grid3x3,
  List,
  Eye,
  CheckSquare,
  Calendar,
  Bird,
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
  initialDetails: Record<string, BirdDetail>
  initialRegions: string[]
  baseUrl: string
}

/* ── Config ────────────────────────── */

const FAVE_SLUGS: string[] = [
  'great-tailed-grackle',
  'laughing-gull',
  'scissor-tailed-flycatcher',
  'northern-mockingbird',
  'canyon-wren',
]

const ITEMS_PER_PAGE = 30

type SortMode = 'name' | 'date' | 'observations'
type ViewMode = 'grid' | 'list'

/* ── Helpers ──────────────────────── */

function getPhotoUrl(detail: BirdDetail | undefined, baseUrl: string): string | null {
  if (!detail?.topPhotoUrl) return null
  if (detail.topPhotoUrl.startsWith('http') || detail.topPhotoUrl.startsWith('/')) {
    return detail.topPhotoUrl
  }
  return `${baseUrl}${detail.topPhotoUrl}`
}

/* ── Component ────────────────────────── */

export default function AllBirdsClient({
  birds,
  initialDetails,
  initialRegions,
  baseUrl,
}: Props) {
  const [details, setDetails] = useState<Map<string, BirdDetail>>(
    new Map(Object.entries(initialDetails))
  )
  const [allRegions, setAllRegions] = useState<string[]>(initialRegions)

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('date')
  const [regionFilter, setRegionFilter] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredBirds = useMemo(() => {
    return birds.filter((b) => !b.comName.includes('sp.'))
  }, [birds])

  const faveFive = filteredBirds.filter((b) => FAVE_SLUGS.includes(b.slug))

  const faveMarqueeItems = useMemo(
    () =>
      filteredBirds
        .filter((b) => FAVE_SLUGS.includes(b.slug))
        .sort((a, b) => FAVE_SLUGS.indexOf(a.slug) - FAVE_SLUGS.indexOf(b.slug))
        .map((b) => b.comName),
    [filteredBirds],
  )

  /* ── Reset pagination when filters change ── */
  const prevFilterKey = useRef('')
  const filterKey = `${search}|${regionFilter}|${sortMode}`

  useEffect(() => {
    if (prevFilterKey.current !== filterKey) {
      setVisibleCount(ITEMS_PER_PAGE)
      setExpandedId(null)
      prevFilterKey.current = filterKey
    }
  }, [filterKey])

  /* ── Apply search + region filter ──────── */
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

    if (regionFilter) {
      list = list.filter((b) => {
        const detail = details.get(b.id)
        return detail?.locations.includes(regionFilter) ?? false
      })
    }

    return list
  }, [filteredBirds, search, regionFilter, details])

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
            return tb - ta
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

  const visibleBirdsProcessed = useMemo(
    () => sortBirds(searchFilteredBirds).slice(0, visibleCount),
    [searchFilteredBirds, visibleCount, sortMode, details],
  )

  const hasMoreFiltered = visibleCount < sortBirds(searchFilteredBirds).length

  /* ── On-demand detail loading ────────────────── */
  const loadingRef = useRef<Set<string>>(new Set())

  const loadDetail = useCallback(
    async (birdId: string) => {
      if (details.has(birdId) || loadingRef.current.has(birdId)) return

      loadingRef.current.add(birdId)

      try {
        const [checklistsRes, mediaRes] = await Promise.all([
          fetch(
            `${baseUrl}/api/bird-checklists?where[speciesRecords.bird][equals]=${birdId}&depth=1&limit=200&sort=date`
          ),
          fetch(`${baseUrl}/api/bird-media?where[species][equals]=${birdId}&depth=2&limit=50`),
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

        const locations: string[] = Array.from(
          new Set(checklists.map((c: any) => c.region).filter(Boolean))
        )

        setDetails((prev) => {
          const next = new Map(prev)
          next.set(birdId, {
            topPhotoUrl: topPhoto?.url ?? null,
            firstLocation: firstSighting?.region ?? null,
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
            audioCount: media.filter((m: any) => m.mimeType?.startsWith('audio/')).length,
            locations,
          })
          return next
        })
      } catch (err) {
        console.error('Failed to load bird details:', err)
      } finally {
        loadingRef.current.delete(birdId)
      }
    },
    [baseUrl, details],
  )

  useEffect(() => {
    visibleBirdsProcessed.forEach((bird) => loadDetail(bird.id))
  }, [visibleBirdsProcessed, loadDetail])

  const handleGridBirdClick = useCallback(
    (birdId: string) => {
      setExpandedId((prev) => {
        const isClosing = prev === birdId
        if (!isClosing) {
          loadDetail(birdId)
        }
        return isClosing ? null : birdId
      })
    },
    [loadDetail],
  )

  const expandedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!expandedId) return
    const handleClickOutside = (e: MouseEvent) => {
      if (expandedRef.current && !expandedRef.current.contains(e.target as Node)) {
        setExpandedId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [expandedId])

  const showMore = () => {
    setVisibleCount((prev) =>
      Math.min(prev + ITEMS_PER_PAGE, sortBirds(searchFilteredBirds).length)
    )
  }

  const sortedVisibleBirds = useMemo(() => {
    return [...visibleBirdsProcessed].sort((a, b) => {
      const aHasImage = details.get(a.id)?.topPhotoUrl ? 1 : 0
      const bHasImage = details.get(b.id)?.topPhotoUrl ? 1 : 0
      return bHasImage - aHasImage
    })
  }, [visibleBirdsProcessed, details])

  /* ── Render expanded detail card ──────────────── */
  const renderExpandedDetail = (bird: Bird) => {
    const detail = details.get(bird.id)
    const photoUrl = getPhotoUrl(detail, baseUrl)

    return (
      <div
        ref={expandedRef}
        className="overflow-hidden rounded-xl border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:bg-gray-900 dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]"
      >
        <div className="flex flex-col gap-3 p-4">
          {/* Image banner */}
          <div className="relative h-32 w-full flex-shrink-0 overflow-hidden rounded-xl border-2 border-black bg-emerald-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:bg-gray-800 dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={bird.comName}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 176px"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-4xl">
                🦜
              </span>
            )}
          </div>
          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {/* Name only — no scientific name */}
            <h3 className="truncate text-base font-black uppercase text-gray-800 dark:text-gray-100">
              {bird.comName}
            </h3>
            {/* Latest observation with Eye icon */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-gray-600 dark:text-gray-400">
              <Eye className="h-3 w-3 text-amber-500" />
              <span className="truncate">
                {detail?.lastDateFormatted ?? '—'} &middot; {detail?.firstLocation ?? 'Unknown location'}
              </span>
            </div>
            {/* Badges + View Bird button in same row on desktop */}
            <div className="flex flex-wrap items-center gap-1.5 md:flex-nowrap">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge className="flex items-center gap-1 border-2 border-black bg-emerald-300 px-2 py-1 text-[10px] font-black text-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:bg-emerald-900 dark:text-gray-100 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                  <CheckSquare className="h-2.5 w-2.5" />
                  {detail?.checklistCount ?? '…'}{' '}
                  {(detail?.checklistCount ?? 0) !== 1 ? 'checklists' : 'checklist'}
                </Badge>
                <Badge className="flex items-center gap-1 border-2 border-black bg-sky-200 px-2 py-1 text-[10px] font-black text-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:bg-sky-900 dark:text-gray-100 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                  <Camera className="h-2.5 w-2.5" />
                  {detail?.photoCount ?? '…'}
                </Badge>
                <Badge className="flex items-center gap-1 border-2 border-black bg-purple-200 px-2 py-1 text-[10px] font-black text-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:bg-purple-900 dark:text-gray-100 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                  <Mic className="h-2.5 w-2.5" />
                  {detail?.audioCount ?? '…'}
                </Badge>
              </div>
              <Link
                href={`/birds/${bird.slug}`}
                className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-sky-400 px-3.5 py-1.5 text-[11px] font-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition hover:translate-x-px hover:translate-y-px hover:shadow-none dark:border-gray-600 dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] md:ml-auto"
              >
                <Bird className="h-3 w-3" /> View Bird
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderControls = () => (
    <div className="space-y-1.5">
      {/* Search – full width on its own line */}
      <div className="relative w-full">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search birds…"
          className="w-full rounded-md border-2 border-black bg-white py-1.5 pl-7 pr-7 text-xs font-semibold text-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-lime-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {/* Sort + Region filter – side by side */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <div className="relative flex-1 min-w-0 sm:flex-none">
          <ArrowUpDown className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="w-full appearance-none rounded-md border-2 border-black bg-white py-1.5 pl-7 pr-6 text-xs font-semibold text-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-lime-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
          >
            <option value="name">Name</option>
            <option value="date">Last Reported</option>
            <option value="observations">Times Observed</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        </div>
        <div className="relative flex-1 min-w-0 sm:flex-none">
          <Filter className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="w-full appearance-none rounded-md border-2 border-black bg-white py-1.5 pl-7 pr-6 text-xs font-semibold text-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-lime-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
          >
            <option value="">All Regions</option>
            {allRegions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        </div>
      </div>
    </div>
  )

  const renderResultsCount = () => {
    const total = sortBirds(searchFilteredBirds).length
    const showing = Math.min(visibleCount, total)
    let msg = `${showing} of ${total} species`
    if (search) msg += ` matching "${search}"`
    if (regionFilter) msg += ` in ${regionFilter}`
    return (
      <p className="mb-2 px-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
        {msg}
      </p>
    )
  }

  const renderGridView = () => (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start justify-center gap-1">
        {sortedVisibleBirds.map((bird) => {
          const isExpanded = expandedId === bird.id
          const detail = details.get(bird.id)
          const photoUrl = getPhotoUrl(detail, baseUrl)
          return (
            <div key={bird.id} className="relative flex flex-col items-center py-0.5 px-0.5">
              {/* Circle button – always rendered, never replaced */}
              <button
                onClick={() => handleGridBirdClick(bird.id)}
                className="group relative"
              >
                <div
                  className={`relative h-16 w-16 md:h-20 md:w-20 overflow-hidden rounded-full border-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] ${
                    isExpanded
                      ? 'border-lime-400 ring-2 ring-lime-400 ring-inset'
                      : 'border-black hover:border-lime-400 dark:border-gray-600'
                  }`}
                >
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt={bird.comName}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-gray-100 p-1 text-center dark:bg-gray-700">
                      <span className="break-all px-0.5 text-[7px] font-semibold uppercase text-gray-600 dark:text-gray-300">
                        {bird.comName}
                      </span>
                    </span>
                  )}
                </div>
              </button>

              {/* Expanded popup */}
              {isExpanded && (
                <>
                  {/* Mobile: semi-transparent backdrop */}
                  <div
                    className="fixed inset-0 z-40 bg-black/30 md:hidden"
                    onClick={() => setExpandedId(null)}
                  />
                  {/* Mobile: fixed centered card */}
                  <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 md:hidden">
                    {renderExpandedDetail(bird)}
                  </div>
                  {/* Desktop/tablet: absolute below circle */}
                  <div className="absolute left-1/2 top-full z-50 mt-2 hidden w-96 md:block -translate-x-1/2">
                    {renderExpandedDetail(bird)}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
      {hasMoreFiltered && (
        <div className="flex justify-center pt-4">
          <button
            onClick={showMore}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-green-400 px-6 py-2.5 text-sm font-black text-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition hover:translate-x-px hover:translate-y-px hover:shadow-none dark:border-gray-600 dark:bg-green-600 dark:text-gray-100 dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
          >
            Show More <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )

  const renderListView = () => (
    <div className="space-y-2">
      {sortedVisibleBirds.map((bird) => {
        const detail = details.get(bird.id)
        const photoUrl = getPhotoUrl(detail, baseUrl)
        return (
          <div
            key={bird.id}
            className="flex items-center gap-3 border-2 border-black bg-white p-3 dark:border-gray-600 dark:bg-gray-800"
          >
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded border-2 border-black dark:border-gray-600">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={bird.comName}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-gray-100 text-lg dark:bg-gray-700">
                  🦜
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-black text-gray-800 dark:text-gray-100">
                {bird.comName}
              </h3>
              <p className="truncate text-xs italic text-gray-500 dark:text-gray-400">
                {bird.sciName}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge className="flex items-center gap-1 border-2 border-black bg-emerald-300 px-2 py-1 text-[10px] font-black text-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:bg-emerald-900 dark:text-gray-100 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                  <CheckSquare className="h-2.5 w-2.5" /> {detail?.checklistCount ?? '…'}
                </Badge>
                <Badge className="flex items-center gap-1 border-2 border-black bg-sky-200 px-2 py-1 text-[10px] font-black text-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:bg-sky-900 dark:text-gray-100 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                  <Camera className="h-2.5 w-2.5" /> {detail?.photoCount ?? '…'}
                </Badge>
                <Badge className="flex items-center gap-1 border-2 border-black bg-purple-200 px-2 py-1 text-[10px] font-black text-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:bg-purple-900 dark:text-gray-100 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                  <Mic className="h-2.5 w-2.5" /> {detail?.audioCount ?? '…'}
                </Badge>
                {detail?.lastDateFormatted && (
                  <Badge className="flex items-center gap-1 border-2 border-black bg-amber-200 px-2 py-1 text-[10px] font-black text-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:bg-amber-900 dark:text-gray-100 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                    <Eye className="h-2.5 w-2.5" />
                    {detail.lastDateFormatted}
                  </Badge>
                )}
              </div>
            </div>
            <Link
              href={`/birds/${bird.slug}`}
              className="flex-shrink-0 rounded-lg border-2 border-black bg-sky-300 px-3 py-2 text-xs font-black text-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:translate-x-px hover:translate-y-px hover:shadow-none dark:border-gray-600 dark:bg-sky-700 dark:text-gray-100 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
            >
              View
            </Link>
          </div>
        )
      })}
      {hasMoreFiltered && (
        <div className="flex justify-center pt-4">
          <button
            onClick={showMore}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-green-400 px-6 py-2.5 text-sm font-black text-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition hover:translate-x-px hover:translate-y-px hover:shadow-none dark:border-gray-600 dark:bg-green-600 dark:text-gray-100 dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
          >
            Show More <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-8">
      <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:bg-gray-900 dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]">
        <div className="border-b-2 border-black bg-pink-100 px-3 py-2 sm:px-5 sm:py-2.5 dark:border-gray-600 dark:bg-pink-900">
          {renderControls()}
        </div>
        <div className="flex justify-center border-b-2 border-black bg-white px-3 py-3 sm:px-5 dark:border-gray-600 dark:bg-gray-800">
          <div className="flex shrink-0 gap-0 rounded-lg border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:bg-gray-800 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-l-lg px-4 py-2 text-sm font-semibold transition ${
                viewMode === 'grid'
                  ? 'bg-lime-300 text-gray-800 dark:bg-lime-600 dark:text-gray-100'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
              title="Grid view"
            >
              <Grid3x3 className="mr-1 inline h-4 w-4" /> Grid
            </button>
            <div className="border-r border-gray-300 dark:border-gray-600" />
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-r-lg px-4 py-2 text-sm font-semibold transition ${
                viewMode === 'list'
                  ? 'bg-lime-300 text-gray-800 dark:bg-lime-600 dark:text-gray-100'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
              title="List view"
            >
              <List className="mr-1 inline h-4 w-4" /> List
            </button>
          </div>
        </div>
        <div className="bg-background px-1 py-2 dark:bg-gray-800 md:p-6">
          {renderResultsCount()}
          {sortBirds(searchFilteredBirds).length === 0 ? (
            <p className="py-8 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">
              {search || regionFilter ? 'No birds match your filters.' : 'No birds found.'}
              {(search || regionFilter) && (
                <button
                  onClick={() => {
                    setSearch('')
                    setRegionFilter('')
                  }}
                  className="ml-2 underline hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Clear filters
                </button>
              )}
            </p>
          ) : viewMode === 'grid' ? (
            renderGridView()
          ) : (
            renderListView()
          )}
        </div>
      </section>
      {faveFive.length > 0 && (
        <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-gray-600 dark:bg-gray-900 dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]">
          <div className="border-b-2 border-black bg-amber-100 px-5 py-3 dark:border-gray-600 dark:bg-amber-900 md:px-6">
            <h2 className="flex items-center gap-1.5 text-sm font-black uppercase tracking-wide text-gray-800 dark:text-gray-100 md:text-base">
              <Heart className="h-4 w-4 fill-red-500 text-red-500" /> Jeff&apos;s Fave Birds
            </h2>
          </div>
          <div className="bg-background p-4 dark:bg-gray-800 md:p-6">
            <Marquee items={faveMarqueeItems} />
          </div>
        </section>
      )}
    </div>
  )
}
