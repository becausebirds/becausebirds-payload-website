'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, ClipboardList } from 'lucide-react'

interface BirdChecklist {
  id: string
  date: string
  slug?: string | null
  ebirdChecklistId?: string | null
  locationName?: string | null
  region?: string | null
  county?: string | null
  state?: string | null
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
const INCREMENT = 10
const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

const sorted = useMemo(
  () => [...checklists].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  [checklists],
)

const displayed = sorted.slice(0, visibleCount)
const hasMore = sorted.length > visibleCount
const isExpanded = visibleCount > ITEMS_PER_PAGE


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
                {cl.state && <> · {cl.state}</>}
                {cl.county && <> · {cl.county}</>}
                {cl.region && <> · {cl.region}</>}
              </p>
            </div>
            <a
              href={`/bird-checklist/${cl.slug ?? cl.ebirdChecklistId ?? cl.id}`}
              className="ml-3 shrink-0 rounded-lg border-2 border-black bg-cyan-200 px-3 py-1.5 text-xs text-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              View checklist →
            </a>
          </div>
        ))}
      </div>

            {hasMore && (
        <div className="flex bg-background justify-center p-4 md:p-5">
          <button
            onClick={() => setVisibleCount((prev) => prev + INCREMENT)}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-black text-black bg-emerald-200 px-5 py-2.5 text-sm font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            View more <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  )
}
