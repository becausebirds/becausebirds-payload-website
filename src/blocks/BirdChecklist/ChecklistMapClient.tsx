'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface TrackPoint {
  lat: number
  lng: number
  timestamp?: string
}

interface ChecklistMapClientProps {
  trackPoints: TrackPoint[]
}

export default function ChecklistMapClient({ trackPoints }: ChecklistMapClientProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current || trackPoints.length === 0) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const map = L.map(mapContainerRef.current)
    mapInstanceRef.current = map

    const lats = trackPoints.map((p) => p.lat)
    const lngs = trackPoints.map((p) => p.lng)
    const bounds = L.latLngBounds(
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    )

    map.fitBounds(bounds, { padding: [35, 35] })

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 18,
}).addTo(map)


    const latLngs = trackPoints.map((p) => [p.lat, p.lng] as [number, number])
    L.polyline(latLngs, {
      color: '#2563eb',
      weight: 6,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map)

    L.circleMarker([trackPoints[0].lat, trackPoints[0].lng], {
      radius: 8,
      fillColor: '#22c55e',
      color: '#000',
      weight: 2,
      opacity: 1,
      fillOpacity: 1,
    })
      .addTo(map)
      .bindPopup('Start')

    const lastPoint = trackPoints[trackPoints.length - 1]
    L.circleMarker([lastPoint.lat, lastPoint.lng], {
      radius: 8,
      fillColor: '#2563eb',
      color: '#000',
      weight: 2,
      opacity: 1,
      fillOpacity: 1,
    })
      .addTo(map)
      .bindPopup('End')

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [trackPoints])

  // Default height for full view, but parent can override via CSS/containers
  return <div ref={mapContainerRef} className="h-[250px] w-full md:h-[400px]" />
}
