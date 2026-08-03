'use client'

import { useEffect, useRef } from 'react'

interface TrackPoint {
  lat: number
  lng: number
  timestamp?: string
}

interface Props {
  trackPoints: TrackPoint[]
}

export default function ChecklistMapClient({ trackPoints }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)

  useEffect(() => {
    // Dynamically import Leaflet so it only runs on the client
    async function initMap() {
      const L = (await import('leaflet')).default

      // Fix default icon path issue with webpack/vite
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (!mapRef.current || mapInstance.current) return

      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        keyboard: false,
      })

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 19,
  attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
}).addTo(map)


      // Plot GPS track as a polyline
      const latlngs = trackPoints.map((p) => [p.lat, p.lng] as [number, number])
      const polyline = L.polyline(latlngs, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.8,
      }).addTo(map)

      // Fit bounds with some padding
      map.fitBounds(polyline.getBounds().pad(0.3))

      // Add start/end markers
      if (latlngs.length > 0) {
        L.circleMarker(latlngs[0], {
          radius: 7,
          color: '#047857',
          fillColor: '#34d399',
          fillOpacity: 1,
          weight: 2,
        }).addTo(map)

        if (latlngs.length > 1) {
          L.circleMarker(latlngs[latlngs.length - 1], {
            radius: 7,
            color: '#b91c1c',
            fillColor: '#f87171',
            fillOpacity: 1,
            weight: 2,
          }).addTo(map)
        }
      }

      mapInstance.current = map
    }

    initMap()

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [trackPoints])

  return (
    <div
      ref={mapRef}
      className="w-full h-full min-h-[6rem] rounded-[inherit]"
      style={{ background: '#f5f5f4' }}
    />
  )
}
