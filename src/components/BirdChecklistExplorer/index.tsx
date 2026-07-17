import BirdChecklistExplorerClient from './BirdChecklistExplorerClient'
import type { Metadata } from 'next'


async function getChecklists() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/bird-checklists?limit=2000&where[
private][equals]=false&select[title]=true&select[slug]=true&select[ebirdChecklis
tId]=true&select[locationName]=true&select[locationId]=true&select[latitude]=tru
e&select[longitude]=true&select[region]=true&select[state]=true&select[county]=t
rue&select[speciesCount]=true&select[date]=true`,
  )

  if (!res.ok) return []

  const data = await res.json()

  return data.docs
}


export const metadata: Metadata = {
  title: "Jeff's Bird Checklist Explorer",
  description:
    'Explore all of the bird checklists I created while birdwatching.',
  openGraph: {
    title: "Jeff's Bird Checklist Explorer",
    description:
      'Explore all of the bird checklists I have created while birdwatching.',
  },
}


export default async function BirdChecklistExplorer() {


  const checklists = await getChecklists()

  const locationMap = new Map()


  checklists
    .filter(
      (c:any) =>
        typeof c.latitude === 'number' &&
        typeof c.longitude === 'number',
    )
    .forEach((c:any)=>{

      const coordinateKey =
        `${c.latitude.toFixed(4)},${c.longitude.toFixed(4)}`

      const key =
        c.locationId || coordinateKey


      if (!locationMap.has(key)) {

        locationMap.set(key, {

          id:key,

          locationId:c.locationId,

          name:
            c.locationName ||
            'Unknown Location',

          lat:c.latitude,

          lng:c.longitude,

          region:c.region,

          state:c.state,

          county:c.county,

          checklists:[],

          speciesTotal:0,

        })

      }


      const location = locationMap.get(key)


      location.checklists.push({

        id:c.ebirdChecklistId,

        slug:c.slug,

        date:c.date,

        speciesCount:c.speciesCount ?? 0,

      })


      location.speciesTotal += c.speciesCount ?? 0

    })


  const markers = Array.from(locationMap.values())


  return (

    <article className="pt-12 sm:pt-16 pb-10 sm:pb-16">

      <div className="
        flex
        flex-col
        items-center
        gap-3
        sm:gap-4
        pt-4
        sm:pt-8
      ">


        <div className="
          container
          max-w-full
          px-2
          sm:px-4
        ">

          <BirdChecklistExplorerClient
            checklists={checklists}
            markers={markers}
          />

        </div>


      </div>

    </article>

  )
}
