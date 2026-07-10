'use client'

import {
  Bird,
  MapPin,
  Search,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'

import {useMemo,useState} from 'react'
import dynamic from 'next/dynamic'


const ChecklistExplorerMap = dynamic(
  () => import('./ChecklistExplorerMap'),
  {
    ssr:false,
    loading:()=>(
      <div className="h-[600px] flex items-center justify-center font-bold">
        Loading map...
      </div>
    )
  }
)

export default function BirdChecklistExplorerClient({
  checklists,
  markers,
}:any){


const [search,setSearch]=useState('')
const [selected,setSelected]=useState<string|null>(null)


const publicChecklists = useMemo(
  ()=>checklists.filter((c:any)=>!c.private),
  [checklists]
)


const grouped = useMemo(()=>{

 const regions:any={}


 publicChecklists.forEach((c:any)=>{

  const region=c.region || 'Unknown Region'
  const state=c.state || 'Unknown State'
  const county=c.county || 'Unknown County'
  const location=c.locationName || 'Unknown Location'


  regions[region] ??={}
  regions[region][state] ??={}
  regions[region][state][county] ??={}
  regions[region][state][county][location] ??=[]


  regions[region][state][county][location].push(c)

 })


 return regions

},[publicChecklists])


const sortedRegions = useMemo(()=>{

 return Object.entries(grouped)
 .sort(([a],[b])=>a.localeCompare(b))

},[grouped])


const filteredMarkers =
markers
.filter((m:any)=>!m.private)
.filter((m:any)=>
 `${m.name} ${m.region} ${m.state}`
 .toLowerCase()
 .includes(search.toLowerCase())
)



return (

<div className="space-y-8">


<div className="
border-2 border-black
bg-yellow-300
p-6
shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
">

<h1 className="
text-3xl
text-black
uppercase
font-bold
flex gap-3
items-center
">
Bird Checklist Explorer

</h1>


<p className="mt-3 font-base text-black">
Explore my {publicChecklists.length} birding checklists by using the map or list below.
</p>


</div>



<div className="
border-2 border-black
shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
overflow-hidden
">

<ChecklistExplorerMap
markers={filteredMarkers}
onSelect={setSelected}
/>

</div>



<section>

<h2 className="
text-3xl
font-black
uppercase
mb-5
">

Regions

</h2>



{sortedRegions.map(
([region,states]:any)=>(

<details
key={region}
className="
border-2 border-black
mb-4
bg-gray-100
dark:bg-gray-800
"
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
href={`/bird-checklist/${c.slug}`}
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