'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Calendar, Clock, Bird, ChevronDown, ChevronUp } from 'lucide-react'
import type { BirdChecklist } from '@/payload-types'
import type { TrackPoint } from './ChecklistMapClient'

type SpeciesRecord = {
  bird?: {
    id: string
    comName?: string
    sciName?: string
    slug?: string
  } | string
  count?: number | string | null
  comments?: string | null
}

type OldSpecies = {
  commonName?: string
  scientificName?: string
  count?: number | string | null
  comments?: string | null
}

type DisplaySpecies = {
  commonName: string
  scientificName: string
  count: string
  comments: string
}

const ChecklistMapClient = dynamic(() => import('./ChecklistMapClient'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[250px] w-full items-center justify-center rounded-lg border-2 border-black bg-white md:h-[400px]">
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading map…</p>
      </div>
    </div>
  ),
})

interface BirdChecklistBlockProps {
  blockType: 'bird-checklist'
  checklist: BirdChecklist | string
  disableInnerContainer?: boolean
  minimized?: boolean
}

export const BirdChecklistBlock: React.FC<BirdChecklistBlockProps> = ({
  checklist,
  disableInnerContainer,
}) => {
  const [showAllSpecies, setShowAllSpecies] = useState(false)

  if (typeof checklist === 'string') {
    return (
      <div className="rounded-lg border-2 border-black bg-red-50 p-6 text-center font-bold text-red-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        Checklist not loaded properly
      </div>
    )
  }

  if (!checklist) {
    return (
      <div className="rounded-lg border-2 border-black bg-gray-50 p-6 text-center font-bold text-gray-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        No checklist selected
      </div>
    )
  }

  // ── Build display species from the new relationship field ─────────────
  // Falls back to the old JSON species field during migration
  const speciesArray: DisplaySpecies[] = []

  if (Array.isArray(checklist.speciesRecords) && checklist.speciesRecords.length > 0) {
    for (const record of checklist.speciesRecords as unknown as SpeciesRecord[]) {      const bird = typeof record.bird === 'object' ? record.bird : null
      speciesArray.push({
        commonName: bird?.comName ?? 'Unknown',
        scientificName: bird?.sciName ?? '',
        count: String(record.count ?? ''),
        comments: record.comments ?? '',
      })
    }
  } else if (Array.isArray(checklist.species)) {
    // Fallback: old JSON format (remove once migration is complete)
    for (const s of checklist.species as OldSpecies[]) {
      speciesArray.push({
        commonName: s.commonName ?? 'Unknown',
        scientificName: s.scientificName ?? '',
        count: String(s.count ?? ''),
        comments: s.comments ?? '',
      })
    }
  }

  const trackPoints: TrackPoint[] = Array.isArray(checklist.gpsTrack)
    ? (checklist.gpsTrack as TrackPoint[])
    : []

  const totalSpecies = checklist.speciesCount ?? speciesArray.length
  const totalCount = speciesArray.reduce(
    (sum: number, s: DisplaySpecies) =>
      sum + (parseInt(s.count, 10) || 0),
    0,
  )

  const ITEMS_PER_PAGE = 5
  const displayedSpecies = showAllSpecies
    ? speciesArray
    : speciesArray.slice(0, ITEMS_PER_PAGE)

  return (
    <div className={!disableInnerContainer ? 'container' : ''}>
      <div className="border-2 border-black bg-white text-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="border-b-2 border-black bg-lime-100 px-5 py-4 md:px-6 md:py-5">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-black tracking-tight uppercase md:text-3xl">
              <Bird className="mr-2 inline-block h-6 w-6 md:h-7 md:w-7" />
              Bird Checklist
            </h2>
            {checklist.ebirdChecklistId && (
              <div className="shrink-0 rounded-lg border-2 border-black bg-yellow-200 px-2.5 py-1.5 text-xs font-mono font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:px-3 md:py-2">
                {checklist.ebirdChecklistId}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-emerald-300 px-3 py-2 font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:px-4 md:py-2.5">
              <Bird className="h-5 w-5" />
              <span className="text-xl md:text-2xl">{totalSpecies}</span>
              <span className="text-xs md:text-sm">species</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-sky-300 px-3 py-2 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:px-4 md:py-2.5">
              <span className="text-xl md:text-2xl">{totalCount}</span>
              <span className="text-xs md:text-sm">individuals</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs font-semibold md:text-sm">
            {checklist.date && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span>
                  {new Date(checklist.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
            {checklist.startTime && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span>Started at {checklist.startTime}</span>
              </div>
            )}
            {checklist.locationName && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span>
                  {checklist.locationName}
                  {checklist.region && <> · {checklist.region}</>}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-5 md:p-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-1">
              <div className="rounded-lg border-2 border-black bg-orange-100 p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="mb-3 flex items-center gap-2 font-black uppercase text-xs tracking-wide md:text-sm">
                  <Calendar className="h-4 w-4" />
                  Effort
                </h3>
                <div className="space-y-2 text-xs md:text-sm">
                  {checklist.protocol && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Protocol</span>
                      <span className="font-bold">{checklist.protocol}</span>
                    </div>
                  )}
                  {checklist.duration && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-bold">{checklist.duration} min</span>
                    </div>
                  )}
                  {checklist.distance && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distance</span>
                      <span className="font-bold">{checklist.distance} mi</span>
                    </div>
                  )}
                  {checklist.trackDistanceKm && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Track</span>
                      <span className="font-bold">{checklist.trackDistanceKm} km</span>
                    </div>
                  )}
                  {checklist.numberOfObservers && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Observers</span>
                      <span className="font-bold">{checklist.numberOfObservers}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              {trackPoints.length > 0 ? (
                <div className="overflow-hidden rounded-lg border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <ChecklistMapClient trackPoints={trackPoints} />
                </div>
              ) : (
                <div className="flex h-[250px] items-center justify-center rounded-lg border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:h-[400px]">
                  <p className="text-sm font-bold text-muted-foreground">No GPS track data</p>
                </div>
              )}
            </div>
          </div>

          {speciesArray.length > 0 && (
            <div className="mt-6 border-t-2 border-black pt-6">
              <h3 className="mb-4 flex items-center gap-2 text-base font-black uppercase tracking-wide md:text-lg">
                <Bird className="h-4 w-4 md:h-5 md:w-5" />
                Species Observed
                <span className="text-muted-foreground">({speciesArray.length})</span>
              </h3>
              <div className="divide-y-2 divide-black rounded-lg border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {displayedSpecies.map((species: DisplaySpecies, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white px-4 py-3 transition-colors hover:bg-accent/20"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-muted-foreground">
                          {idx + 1}.
                        </span>
                        <span className="text-sm font-bold md:text-sm">
                          {species.commonName}
                        </span>
                        {species.scientificName && (
                          <span className="hidden text-xs italic text-muted-foreground sm:inline">
                            {species.scientificName}
                          </span>
                        )}
                      </div>
                      {species.comments && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{species.comments}</p>
                      )}
                    </div>
                    {species.count && (
                      <span className="ml-3 shrink-0 rounded-md border-2 border-black bg-fuchsia-200 px-2.5 py-1 text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:px-3 md:py-1 md:text-sm">
                        {species.count}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {speciesArray.length > ITEMS_PER_PAGE && (
                <button
                  onClick={() => setShowAllSpecies(!showAllSpecies)}
                  className="mx-auto mt-4 flex items-center gap-2 rounded-lg border-2 border-black bg-cyan-200 px-4 py-2 text-sm font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none md:px-5"
                >
                  {showAllSpecies ? (
                    <>
                      Show less <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show all {speciesArray.length} species <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {checklist.notes && (
            <div className="mt-6 rounded-lg border-2 border-black bg-amber-100 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="mb-2 flex items-center gap-2 font-black uppercase text-xs tracking-wide md:text-sm">
                <Clock className="h-4 w-4" />
                Notes
              </h3>
              <p className="whitespace-pre-wrap text-sm font-medium">{checklist.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
