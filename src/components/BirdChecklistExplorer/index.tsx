import BirdChecklistExplorerClient from './BirdChecklistExplorerClient'
import type { Metadata } from 'next'

import NavBar from '@/components/navbar'
import Footer from '@/components/Footer'
import PageClient from '@/app/(frontend)/[slug]/page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

import { draftMode } from 'next/headers'


async function getChecklists() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/bird-checklists?limit=2000&where[private][equals]=false&select[title]=true&select[slug]=true&select[ebirdChecklistId]=true&select[locationName]=true&select[locationId]=true&select[latitude]=true&select[longitude]=true&select[region]=true&select[state]=true&select[county]=true&select[speciesCount]=true&select[date]=true`,
    {
      next: {
        revalidate: 300,
      },
    },
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

  const { isEnabled: draft } = await draftMode()

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

    <div className="
      relative
      min-h-screen
      bg-white
      dark:bg-background
      p-2
      sm:p-4
      md:p-6
      lg:p-8
    ">


      <div
        className="
          pointer-events-none
          fixed
          inset-0
          z-0
          bg-cover
          bg-center
          bg-no-repeat
          opacity-100
        "
        style={{ backgroundImage:'url(/landing-dark.svg)' }}
        aria-hidden="true"
      />


      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-full
          bg-white
          dark:bg-card
          border-2
          border-black
          dark:border-border
          overflow-hidden
          shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
          dark:shadow-[4px_4px_0px_0px_hsl(var(--border))]
          md:border-4
          md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]
          min-h-[calc(100vh-1rem)]
        "
      >


        <NavBar />


        <article className="pt-12 sm:pt-16 pb-10 sm:pb-16">

          <PageClient />

          {draft && <LivePreviewListener />}


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


        <Footer />


      </div>


    </div>

  )
}