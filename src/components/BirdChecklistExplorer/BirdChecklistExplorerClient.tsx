'use client'
// REMOVED: import RecentChecklists from '@/components/RecentChecklists'
import ChecklistMapWrapper from '@/components/ChecklistMapWrapper' 
import {
  Bird,
  MapPin,
  Search,
  ChevronDown,
  ExternalLink,
  Calendar,
  ListChecks,
  ClipboardList,
  Clock
} from 'lucide-react'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'

const ChecklistExplorerMap = dynamic(
  () => import('./ChecklistExplorerMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] flex items-center justify-center font-bold">
        Loading map...
      </div>
    ),
  },
)

// ── Helper ──
function formatTime(dateStr: string | null | undefined, startTime?: string | null): string | null {
  // First, try to format the date if it has time info
  if (dateStr) {
    const d = new Date(dateStr)
    if (d.getUTCHours() !== 0 || d.getUTCMinutes() !== 0 || d.getUTCSeconds() !== 0) {
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    }
  }

  // If no time in date, try to format startTime
  if (startTime) {
    // Handle HH:MM format (24-hour)
    const match = startTime.match(/^(\d{1,2}):(\d{2})/)
    if (match) {
      const [, hours, minutes] = match
      const d = new Date()
      d.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0)
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    }
  }

  return null
}





export default function BirdChecklistExplorerClient({
  checklists,
  markers,
  recentChecklists,
}: any) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const publicChecklists = useMemo(
    () => checklists.filter((c: any) => !c.private),
    [checklists],
  )

  const grouped = useMemo(() => {
    const regions: any = {}
    publicChecklists.forEach((c: any) => {
      const region = c.region || 'Unknown Region'
      const state = c.state || 'Unknown State'
      const county = c.county || 'Unknown County'
      const location = c.locationName || 'Unknown Location'

      regions[region] ??= {}
      regions[region][state] ??= {}
      regions[region][state][county] ??= {}
      regions[region][state][county][location] ??= []
      regions[region][state][county][location].push(c)
    })
    return regions
  }, [publicChecklists])

  const sortedRegions = useMemo(() => {
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
  }, [grouped])

  const filteredMarkers = markers
    .filter((m: any) => !m.private)
    .filter((m: any) =>
      `${m.name} ${m.region} ${m.state}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="border-2 border-black bg-yellow-300 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-3xl text-black uppercase font-bold flex gap-3 items-center">
          Bird Checklist Explorer
        </h1>
        <p className="mt-3 font-base text-black">
          Explore my {publicChecklists.length} birding checklists by using the
          map or list below. Click to zoom in to see bird checklists I created
          at specific locations.
        </p>
      </div>

      {/* ── Map ── */}
      <div className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <ChecklistExplorerMap markers={filteredMarkers} onSelect={setSelected} />
      </div>

      {/* ── Recent Checklists ── */}
{recentChecklists && recentChecklists.length > 0 && (
  <section className="mb-4">
    <h2 className="text-2xl font-black mb-5 text-center tracking-tight text-gray-900 dark:text-foreground">
  Recent checklists
  <ClipboardList className="inline-block h-5 w-5 text-muted-foreground ml-1.5" />
</h2>


    <div className="space-y-4 mx-auto max-w-xl">
      {recentChecklists.map((checklist: any) => {
        const timeOfDay =
  formatTime(checklist.date, checklist.startTime)

        return (
          <div
            key={checklist.id}
            className="border-2 border-black bg-white dark:bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_hsl(var(--border))]"
          >
            {/* Mini map */}
            {checklist.gpsTrack && checklist.gpsTrack.length > 0 && (
              <div className="overflow-hidden border-b-2 border-black">
                <div className="h-36 [&_div]:!h-full [&_div]:!min-h-0">
                  <ChecklistMapWrapper trackPoints={checklist.gpsTrack} />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="bg-gray-200 dark:bg-gray-800 p-4 sm:p-5">
              {/* Location — own line */}
              {checklist.locationName && (
                <p className="flex items-center gap-1.5 text-base font-bold text-gray-800 dark:text-gray-100">
                  <MapPin className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{checklist.locationName}</span>
                </p>
              )}

              {/* Date · Time · Species — same line, one calendar icon */}
<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-muted-foreground">
  {checklist.date && (
    <span className="flex items-center gap-1">
      <Calendar className="h-3 w-3" />
      {new Date(checklist.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}
    </span>
  )}
  {timeOfDay && (
  <span className="flex items-center gap-1">
    <Clock className="h-3 w-3" />
    {timeOfDay}
  </span>
)}

</div>


                            {/* Bird previews — own line */}
{checklist.birdPreviews && checklist.birdPreviews.length > 0 && (
  <div className="mt-3 bg-white dark:bg-gray-700 border-2 border-black rounded-lg p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_hsl(var(--border))]">
    <div className="flex flex-col items-center gap-2">
      {checklist.birdPreviews.map((bird: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2">
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            {bird.photoUrl ? (
              <Image
                src={bird.photoUrl}
                alt={bird.photoAlt}
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-blue-200 dark:bg-blue-800 text-[10px] font-black text-black dark:text-white leading-none">
                {bird.commonName
                  .split(' ')
                  .map((w: string) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
          </div>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
            {bird.commonName}
          </span>
          {bird.count && (
            <span className="inline-flex items-center rounded-md border-2 border-black bg-emerald-300 px-1.5 py-0.5 text-[10px] ont-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              ×{bird.count}
            </span>
          )}
        </div>
      ))}
      {checklist.totalSpeciesSeen > 2 && (
        <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 text-center">
          +{checklist.totalSpeciesSeen - 2} more{' '}
          {checklist.totalSpeciesSeen - 2 === 1 ? 'species' : 'species'}
        </span>
      )}
    </div>
  </div>
)}



              {/* View checklist button */}
              <div className="mt-3 flex justify-center">
                <Link
  href={`/bird-checklists/${checklist.slug}`}
  className="flex sm:inline-flex items-center justify-center gap-1.5 bg-amber-300 text-black rounded-md border-2 border-black px-3 py-1.5 text-xs font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
>

                  <ClipboardList className="h-3.5 w-3.5" />
                  View checklist →
                </Link>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  </section>
)}


<section>

<h2 className="text-3xl font-black uppercase mb-5">

Explore by region

</h2>



{sortedRegions.map(
([region,states]:any)=>(

<details
key={region}
className="border-2 border-black mb-4 bg-gray-100 dark:bg-gray-800"
>

<summary
className="
cursor-pointer
font-black
text-xl
p-4
flex
items-center
gap-2
"
>

<ChevronDown/>
{region}

</summary>



<div className="p-4">


{Object.entries(states)
.sort(([a],[b])=>a.localeCompare(b))
.map(
([state,counties]:any)=>(


<details
key={state}
className="
border-2
border-black
mb-3
bg-background
text-foreground
"
>


<summary
className="
p-3
cursor-pointer
font-bold
"
>

{state}

</summary>


<div className="p-3 pl-8 sm:pl-6">


{Object.entries(counties)
.sort(([a],[b])=>a.localeCompare(b))
.map(
([county,locations]:any)=>(


<details
key={county}
className="
mb-3
"
>


<summary
className="
cursor-pointer
font-bold
"
>

{county}

</summary>



<div className="pl-4">


{
Object.entries(locations)
.sort(([a],[b])=>a.localeCompare(b))
.map(
([location,list]:any)=>{


const sortedList = [...list].sort(
(a:any,b:any)=>
new Date(b.date).getTime() -
new Date(a.date).getTime()
)


return (

<div
id={`location-${list[0].locationId}`}
key={location}
className="
border-l-4
border-black
p-3
mb-3
bg-green-100
dark:bg-green-900
"
>


<div className="
font-black
flex
items-center
gap-2
">


{location}

</div>


<div className="text-sm font-bold mb-2">

{list.length} checklists

</div>


<div className="mt-2 space-y-1">

{
sortedList.map((c:any)=>(

<div
key={c.id}
className="font-bold"
>

<strong>
{new Date(c.date)
.toLocaleDateString()}
</strong>

{' - '}

<a
id={`checklist-${c.ebirdChecklistId}`}
href={`/bird-checklists/${c.slug}`}
className="underline font-normal"
>

{c.ebirdChecklistId}

</a>

{' - '}

{c.speciesCount || 0} species

</div>

))

}

</div>


</div>

)

})

}


</div>


</details>


))

}


</div>


</details>


))

}


</div>

</details>


))

}



</section>


</div>

)

}