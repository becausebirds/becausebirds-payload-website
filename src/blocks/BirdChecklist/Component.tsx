'use client'

import { useState } from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  Binoculars,
  Pencil,
  Bird,
  Tally5,
  ExternalLink,
  ChevronsUpDown,
  ChevronsDownUp,
  Minimize2,
  Globe,
  Link,
} from 'lucide-react'
import ChecklistMapClient from './ChecklistMapClient'
import { SpeciesListClient } from './SpeciesListClient'

interface BirdChecklistComponentProps {
  checklistData: any
  showMap?: boolean
  showFullSpeciesList?: boolean
  disableInnerContainer?: boolean
  minimized?: boolean
}

interface Species {
  commonName: string
  scientificName: string
  count: string
  comments?: string
  slug?: string
}

type SpeciesRecord = {
  bird?:
    | {
        id: number
        comName?: string
        sciName?: string
        slug?: string
      }
    | number
  count?: number | string | null
  comments?: string | null
}

interface TrackPoint {
  lat: number
  lng: number
  timestamp?: string
}

export default function BirdChecklistComponent({
  checklistData,
  showMap = true,
  showFullSpeciesList = true,
  disableInnerContainer = false,
  minimized = false,
}: BirdChecklistComponentProps) {
  const [isExpanded, setIsExpanded] = useState(!minimized)
  const c = checklistData

  if (!c) {
    return (
      <div className="rounded-lg border-2 border-black bg-amber-50 p-6 text-center font-bold text-amber-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        No checklist data available.
      </div>
    )
  }

  // ── Normalize species ─────────────────────────────────────────
  const species: Species[] = []
  if (Array.isArray(c.speciesRecords) && c.speciesRecords.length > 0) {
    for (const record of c.speciesRecords as SpeciesRecord[]) {
      const bird = typeof record.bird === 'object' ? record.bird : null
      species.push({
        commonName: bird?.comName ?? 'Unknown',
        scientificName: bird?.sciName ?? '',
        count: String(record.count ?? ''),
        comments: record.comments ?? undefined,
        slug: bird?.slug,
      })
    }
  } else if (Array.isArray(c.species) && c.species.length > 0) {
    for (const s of c.species as Species[]) {
      species.push({
        commonName: s.commonName,
        scientificName: s.scientificName,
        count: s.count,
        comments: s.comments,
        slug: s.slug,
      })
    }
  }

  const trackPoints: TrackPoint[] = c.gpsTrack ?? []
  const totalSpecies = c.speciesCount ?? species.length
  const totalCount = species.reduce((sum: number, s: Species) => sum + (parseInt(s.count, 10) || 0), 0)
  const containerClass = disableInnerContainer ? '' : 'mx-auto max-w-4xl'

  // ── Minimized View (Collapsed State) ────────────────────────
  if (minimized && !isExpanded) {
    return (
      <div className={`my-6 ${containerClass}`}>
        <div className="border-2 border-black bg-background text-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-2 border-black bg-gray-500 px-4 py-3 text-white md:px-5 md:py-4">
            <h2 className="mt-0 flex items-center gap-2 text-lg font-black uppercase tracking-tight text-gray-200 md:text-3xl">
              <Binoculars className="h-6 w-6 md:h-7 md:w-7" />
              {c.locationName}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 border-2 border-black bg-emerald-300 px-3 py-2 font-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:px-4 md:py-2.5">
                <Bird className="h-5 w-5" />
                <span className="text-xl md:text-2xl">{totalSpecies}</span>
                <span className="text-xs md:text-sm">species</span>
              </div>
              <div className="inline-flex items-center gap-2 border-2 border-black bg-sky-300 px-3 py-2 font-bold text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:px-4 md:py-2.5">
                <Tally5 className="h-5 w-5" />
                <span className="text-xl md:text-2xl">{totalCount}</span>
                <span className="text-xs md:text-sm">individuals</span>
              </div>
            </div>

            {c.date && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold md:text-sm">
                <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                {new Date(c.date).toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
                <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                {c.startTime && <> {c.startTime}</>}
              </p>
            )}

            {c.locationName && (
              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold md:text-sm">
                <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4" />
                {c.locationId ? (
                  <a href={`https://ebird.org/hotspot/${c.locationId}`} target="_blank" rel="noopener noreferrer" className="underline text-white hover:text-blue-300">
                    {c.locationName}
                  </a>
                ) : c.county}
                {c.state && <>, {c.state}</>}
                {c.region && <><Globe className="h-3.5 w-3.5 md:h-4 md:w-4" /> {c.region}</>}
              </p>
            )}

            <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
              {c.protocol && (
                <span className="rounded-md border-2 border-black bg-purple-200 text-black px-2.5 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {c.protocol}
                </span>
              )}
              {c.duration && (
                <span className="rounded-md border-2 border-black bg-orange-200 text-black px-2.5 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {c.duration} min
                </span>
              )}
              {c.distance && (
                <span className="rounded-md border-2 border-black bg-cyan-200 text-black px-2.5 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {Number(c.distance).toFixed(1)} mi
                </span>
              )}
            </div>
          </div>

          {/* ── BODY — show a few bird species instead of map ── */}
<div className="bg-gray-100 px-5 pt-4 pb-4 md:p-6">

            {/* Smaller Expand Button — not blue */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsExpanded(true)}
                className="inline-flex items-center gap-1.5 rounded border-2 border-black bg-green-700 px-3 py-1.5 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-stone-600 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px]"
              >
                <ChevronsUpDown className="h-3 w-3" />
                Expand checklist
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Full View ──────────────────────────────────────────────
  return (
    <div className={`my-6 ${containerClass}`}>
      <div className="border-2 border-black bg-background text-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="border-b-2 border-black bg-gray-500 px-5 py-4 text-white md:px-6 md:py-5">
          <div className="flex items-center justify-between">
            <h2 className="mt-0 flex items-center gap-2 text-lg font-black uppercase tracking-tight text-gray-200 md:text-3xl">
              <Binoculars className="h-6 w-6 md:h-7 md:w-7" />
              {c.locationName}
            </h2>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 border-2 border-black bg-emerald-300 px-3 py-2 font-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:px-4 md:py-2.5">
              <Bird className="h-5 w-5" />
              <span className="text-xl md:text-2xl">{totalSpecies}</span>
              <span className="text-xs md:text-sm">species</span>
            </div>
            <div className="inline-flex items-center gap-2 border-2 border-black bg-sky-300 px-3 py-2 font-bold text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:px-4 md:py-2.5">
              <Tally5 className="h-5 w-5" />
              <span className="text-xl md:text-2xl">{totalCount}</span>
              <span className="text-xs md:text-sm">individuals</span>
            </div>
          </div>

          {c.locationName && (
            <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold md:text-sm">
              <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4" />
              {c.locationId ? (
                <a href={`https://ebird.org/hotspot/${c.locationId}`} target="_blank" rel="noopener noreferrer" className="underline text-white hover:text-blue-300">
                  {c.locationName}
                </a>
              ) : c.county}
              {c.state && <>, {c.state}</>}
              <Globe className="h-3.5 w-3.5 md:h-4 md:w-4" />{c.region && <> {c.region}</>}
            </p>
          )}

          {c.date && (
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold md:text-sm">
              <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
              {new Date(c.date).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
              <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
              {c.startTime && <> {c.startTime}</>}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            {c.protocol && (
              <span className="rounded-md border-2 border-black bg-purple-200 text-black px-2.5 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{c.protocol}</span>
            )}
            {c.duration && (
              <span className="rounded-md border-2 border-black bg-orange-200 text-black px-2.5 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{c.duration} min</span>
            )}
            {c.distance && (
              <span className="rounded-md border-2 border-black bg-cyan-200 text-black px-2.5 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{Number(c.distance).toFixed(1)} mi</span>
            )}
          </div>
        </div>

        <div className="bg-gray-200 px-5 pt-4 pb-2 dark:bg-gray-800 md:p-6">
          {showMap && (trackPoints.length > 0 || (c.latitude && c.longitude)) && (
            <div className="mb-6 overflow-hidden rounded-lg border-2 border-black bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <ChecklistMapClient trackPoints={trackPoints.length > 0 ? trackPoints : [{ lat: c.latitude, lng: c.longitude }]} />
            </div>
          )}

          {showFullSpeciesList && species.length > 0 && <SpeciesListClient species={species} />}

          {showFullSpeciesList && species.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-black bg-background p-8 text-center text-sm font-bold text-gray-400">
              <Bird className="mx-auto mb-2 h-6 w-6" />
              No species data available for this checklist.
            </div>
          )}

          {c.notes && (
            <div className="mt-6 rounded-lg border-2 border-black bg-amber-100 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-taupe-400">
              <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-black">
                <Pencil className="h-4 w-4" />
                Notes
              </span>
              <p className="whitespace-pre-wrap text-sm font-medium text-black">{c.notes}</p>
            </div>
          )}

          <div className="mt-2 text-center">
            <a href={`/bird-checklists/${c.ebirdChecklistId}`} rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground underline">
              Permalink
              <Link className="h-3 w-3" />
            </a>
            <span className="px-3">|</span>
            <a href={`https://ebird.org/checklist/${c.ebirdChecklistId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground underline">
              eBird
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
