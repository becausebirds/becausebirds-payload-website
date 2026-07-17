'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet'

import MarkerClusterGroup from 'react-leaflet-cluster'
import { useEffect as useReactEffect } from 'react'


function ZoomOutButton(){

  const map = useMap()

  return (

    <button
      className="
        absolute
        top-4
        right-4
        z-[1000]
        bg-white
        border-2
        border-black
        px-3
        py-2
        text-black
        shadow-[3px_3px_0_black]
      "
      onClick={()=>map.setZoom(3)}
    >
      Zoom Out
    </button>

  )

}


const hotspotIcon = new L.Icon({

  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',

  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',

  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',

  iconSize:[35,55],

  iconAnchor:[17,55],

})


const checklistIcon = new L.Icon({

  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',

  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',

  iconSize:[20,32],

  iconAnchor:[10,32],

})


function FitBounds({ markers }: { markers:any[] }) {

  const map = useMap()

  const hasFit = useRef(false)


  useEffect(()=>{

    if (hasFit.current) return

    if (!markers.length) return


    const bounds = L.latLngBounds(
      markers.map((m)=>[
        m.lat,
        m.lng,
      ])
    )


    map.fitBounds(bounds,{
      padding:[
        window.innerWidth < 640 ? 25 : 50,
        window.innerWidth < 640 ? 25 : 50,
      ],
      maxZoom:
        window.innerWidth < 640 ? 5 : 7,
    })


    hasFit.current = true


  },[markers,map])


  return null

}



export default function ChecklistExplorerMap({
  markers,
  onSelect,
}: any) {


  useReactEffect(() => {

    delete (L.Icon.Default.prototype as any)._getIconUrl


    L.Icon.Default.mergeOptions({

      iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',

      iconUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',

      shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',

    })


  }, [])



  const validMarkers = markers.filter(
    (m:any)=>
      typeof m.lat === 'number' &&
      typeof m.lng === 'number'
  )



  return (

    <div
      className="
        w-full
        h-[45vh]
        min-h-[320px]
        max-h-[520px]
        sm:h-[55vh]
        md:h-[600px]
      "
    >


      <MapContainer

        center={[39,-98]}

        zoom={3}

        style={{
          height:'100%',
          width:'100%',
        }}

        className="h-full w-full"

      >


        <ZoomOutButton />


        <FitBounds markers={validMarkers} />


{/* CartoDB Positron — clean, modern look with well-styled labels & boundaries */}
<TileLayer
  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
  attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OSM</a> &copy; <a href='https://carto.com/attribution'>CARTO</a>"
/>




        <MarkerClusterGroup

          showCoverageOnHover={false}

          spiderfyOnMaxZoom={true}

          zoomToBoundsOnClick={true}

        >


          {
            validMarkers.map((m:any)=>(

              <Marker

                key={m.id}

                position={[
                  m.lat,
                  m.lng,
                ]}

                eventHandlers={{
                  click:(e)=>{
                    onSelect(m.id)
                    e.target.openPopup()
                  }
                }}

              >


                <Popup
  className="checklist-popup"
>
  <div
    className="
      w-[min(65vw,320px)]
      sm:w-[360px]
      max-w-full
      font-bold
    "
  >

    <h3
      className="
        text-base
        sm:text-lg
        font-black
        uppercase
        border-b-2
        border-black
        pb-2
        leading-tight
        break-words
      "
    >
      {m.name}
    </h3>


    {m.checklists.length > 1 && (

      <div
        className="
          mt-2
          flex
        "
      >

        <span
          className="
            border-2
            border-black
            bg-green-300
            px-2
            py-1
            text-sm
            shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
          "
        >

          <span className="mr-2">
            {m.checklists.length}
          </span>

          checklist{m.checklists.length !== 1 && 's'}

        </span>

      </div>

    )}


    <div
      className="
        mt-3
        max-h-[32vh]
        sm:max-h-56
        overflow-y-auto
        space-y-2
        pr-1
      "
    >

      {m.checklists.map((c:any)=>(

        <a

          key={c.id}

          href={`/bird-checklists/${c.slug}`}

          className="
            block
            border-2
            border-black
            bg-yellow-100
            p-2
            sm:p-3
            transition-all
            hover:bg-yellow-200
            hover:translate-x-[2px]
            hover:translate-y-[2px]
          "

        >

          <div
            className="
              flex
              flex-col
              gap-1
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <span
              className="
                font-black
                text-xs
                sm:text-sm
              "
            >

              {new Date(c.date).toLocaleDateString(
                'en-US',
                {
                  year:'numeric',
                  month:'short',
                  day:'numeric',
                }
              )}

            </span>


            <span
              className="
                self-start
                border-2
                border-black
                bg-blue-200
                px-2
                py-0.5
                text-[10px]
                sm:text-xs
                font-black
                shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
              "
            >

              {c.id}

            </span>


          </div>


          <div
            className="
              mt-1
              text-xs
              sm:text-sm
            "
          >

            {c.speciesCount} species

          </div>


        </a>

      ))}

    </div>


  </div>

</Popup>


              </Marker>


            ))
          }


        </MarkerClusterGroup>


      </MapContainer>


    </div>

  )

}