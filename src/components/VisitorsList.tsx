import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { Badge } from '@/components/ui/badge'

interface Visitor {
  id: string
  name: string
  location: string
  favoriteBird: string
  message?: string | null
  date: string
  createdAt: string
}

// 20 distinct pastel card colors
const CARD_COLORS = [
  '#fef08a', // yellow-200
  '#bae6fd', // sky-200
  '#fbcfe8', // pink-200
  '#a7f3d0', // emerald-200
  '#e9d5ff', // purple-200
  '#fed7aa', // orange-200
  '#bbf7d0', // green-200
  '#c7d2fe', // indigo-200
  '#fecaca', // red-200
  '#ddd6fe', // violet-200
  '#fde68a', // amber-200
  '#a5f3fc', // cyan-200
  '#f5d0fe', // fuchsia-200
  '#bfdbfe', // blue-200
  '#d1fae5', // emerald-100
  '#fce7f3', // pink-100
  '#e0e7ff', // indigo-100
  '#ffedd5', // orange-100
  '#ccfbf1', // teal-100
  '#fef3c7', // amber-100
]

export default async function VisitorsList() {
  const payload = await getPayload({ config: configPromise })

  const visitorsResult = await payload.find({
    collection: 'visitors' as any,
    sort: '-createdAt',
    limit: 100,
  })

  const visitors = (visitorsResult.docs || []) as unknown as Visitor[]

  if (visitors.length === 0) {
    return (
      <div className="border-2 border-black dark:border-border p-8 text-center 
bg-white dark:bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
dark:shadow-[4px_4px_0px_0px_hsl(var(--border))]">
        <p className="text-lg font-bold font-['Courier_New',monospace]">No 
guests yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      {visitors.map((visitor, index) => {
        const backgroundColor = CARD_COLORS[index % CARD_COLORS.length]

        return (
          <div
            key={visitor.id}
            style={{ backgroundColor }}
            className="relative border-2 border-black dark:border-border p-6 
shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] 
dark:shadow-[8px_8px_0px_0px_hsl(var(--border))] dark:text-black"
          >
            {/* Name Header */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-
between mb-4 gap-2">
              <h4 className="text-2xl font-black 
font-['Courier_New',monospace]">
                {visitor.name}
              </h4>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold opacity-70">
                  {new Date(visitor.date || 
visitor.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                {/* Location with full border */}
                <span className="text-sm font-bold border-2 border-black 
dark:border-border bg-white dark:bg-card px-2 py-0.5 dark:text-foreground">
                  🌐 {visitor.location}
                </span>
              </div>
            </div>

            {/* Message Bubble */}
            {visitor.message && (
              <div className="bg-white dark:bg-card border-2 border-black 
dark:border-border p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
dark:shadow-[4px_4px_0px_0px_hsl(var(--border))]">
                <p className="text-sm leading-relaxed font-medium italic 
dark:text-foreground">
                  &ldquo;{visitor.message}&rdquo;
                </p>
              </div>
            )}

            {/* Favorite Bird Area */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider">🐦‍ Favorite bird:</span>
              <Badge
                variant="default"
                className="border-2 border-black dark:border-border bg-white 
dark:bg-card shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] 
dark:shadow-[3px_3px_0px_0px_hsl(var(--border))] px-3 py-1 text-sm font-black 
dark:text-foreground max-w-full whitespace-normal break-words"
              >
                {visitor.favoriteBird}
              </Badge>
            </div>

            {/* Entry number */}
            <div className="absolute top-2 right-2 text-[14px] font-bold">
              #{visitors.length - index}
            </div>
          </div>
        )
      })}
    </div>
  )
}
