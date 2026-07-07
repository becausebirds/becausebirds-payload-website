'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Species {
  commonName: string
  scientificName: string
  count: string
  comments?: string
}

export function SpeciesListClient({ species }: { species: Species[] }) {
  const [showAll, setShowAll] = useState(false)
  const ITEMS_PER_PAGE = 5
  const displayed = showAll ? species : species.slice(0, ITEMS_PER_PAGE)

  return (
    <div className="mb-6">
      <h3 className="mb-3 text-lg font-black uppercase tracking-wide">
        Species Observed{' '}
        <span className="text-muted-foreground">({species.length})</span>
      </h3>

      <div className="divide-y-2 divide-black rounded-lg border-2 border-black bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {displayed.map((s: Species, i: number) => (
          <div
            key={`${s.scientificName}-${i}`}
            className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-accent/20"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-bold text-muted-foreground">{i + 1}.</span>
                <span className="font-bold text-sm">{s.commonName}</span>
                {s.scientificName && (
                  <span className="hidden text-xs italic text-muted-foreground sm:inline">
                    {s.scientificName}
                  </span>
                )}
              </div>
              {s.comments && (
                <p className="mt-0.5 text-xs text-muted-foreground">{s.comments}</p>
              )}
            </div>
            {s.count && (
              <span className="ml-3 shrink-0 rounded-md border-2 border-black bg-amber-300 px-3 py-1 text-sm font-bold text-gray-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {s.count}
              </span>
            )}
          </div>
        ))}
      </div>

      {species.length > ITEMS_PER_PAGE && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mx-auto mt-4 flex items-center gap-2 rounded-lg border-2 border-black bg-cyan-200 px-5 py-2 font-bold text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
        >
          {showAll ? (
            <>
              Show less <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show all {species.length} species <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  )
}
