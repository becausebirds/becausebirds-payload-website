'use client'

import { useMemo, useState } from 'react' // ✨ added useMemo
import { ChevronDown, ChevronUp, ClipboardList } from 'lucide-react'

interface BirdChecklist {
  id: string
  date: string
  slug?: string | null
  ebirdChecklistId?: string | null
  locationName?: string | null
  region?: string | null
  county?: string | null
  state?: string | null       // ✨ added state/province
}

interface BirdChecklistsSectionProps {
  checklists: BirdChecklist[]
  totalCount: number
}

export default function BirdChecklistsSection({
  checklists,
  totalCount,
}: BirdChecklistsSectionProps) {
  const ITEMS_PER_PAGE = 5
  const [showAll, setShowAll] = useState(false)

  // ✨ Sort newest to oldest by date
  const sorted = useMemo(
    () => [...checklists].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [checklists],
  )

  const displayed = showAll ? sorted : sorted.slice(0, ITEMS_PER_PAGE) // ✨ use sorted
  const hasMore = sorted.length > ITEMS_PER_PAGE                        // ✨ use sorted

  return (
    <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="border-b-2 border-black bg-purple-100 dark:bg-gray-800 px-5 py-3 md:px-6">
        <h2 className="flex items-center gap-1.5 font-black dark:text-gray-100 uppercase text-sm tracking-wide md:text-base">
          <ClipboardList className="h-4 w-4" />  Included on these checklists ({totalCount})
        </h2>
      </div>
      <div className="divide-y-2 divide-black">
        {displayed.map((cl) => (
          <div
            key={cl.id}
            className="flex items-center justify-between px-5 py-3 md:px-6 transition-colors bg-background hover:bg-accent/20"
          >
            <div className="min-w-0 flex-1 bg-background">
              <p className="text-sm font-bold">
                {new Date(cl.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <p className="truncate text-xs font-semibold text-muted-foreground">
                {cl.locationName}
                {cl.state && <> · {cl.state}</>}        {/* ✨ state first */}
                {cl.county && <> · {cl.county}</>}
                {cl.region && <> · {cl.region}</>}
              </p>
            </div>
            <a
              href={`/bird-checklist/${cl.slug ?? cl.ebirdChecklistId ?? 
cl.id}`}
              className="ml-3 shrink-0 rounded-lg border-2 border-black bg-cyan-200 px-3 py-1.5 text-xs text-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              View Checklist →
            </a>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="p-4 bg-background text-center md:p-5">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-black text-black bg-cyan-200 px-4 py-2 text-sm font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            {showAll ? (
              <>
                Show less <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                View all {sorted.length} checklists <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  )
}
