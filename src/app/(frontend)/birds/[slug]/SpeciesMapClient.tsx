'use client'

import { useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'
import type { LocationPin } from './page'

interface SpeciesMapClientProps {
  pins: LocationPin[]
}

export default function SpeciesMapClient({ pins }: SpeciesMapClientProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || pins.length === 0) return

    async function initMap() {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      // Suppress default marker icon requests
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '',
        iconUrl: '',
        shadowUrl: '',
      })

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      const map = L.map(mapRef.current!)
      mapInstanceRef.current = map

      const lats = pins.map((p) => p.lat)
      const lngs = pins.map((p) => p.lng)

      const bounds = L.latLngBounds(
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      )
      map.fitBounds(bounds, { padding: [40, 40] })

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18 },
      ).addTo(map)

      pins.forEach((pin) => {
        const dateStr = new Date(pin.date).toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })

        const marker = L.circleMarker([pin.lat, pin.lng], {
          radius: 8,
          fillColor: '#a855f7',
          color: '#000',
          weight: 2,
          opacity: 1,
          fillOpacity: 1,
        }).addTo(map)

        const checklistSlug = pin.ebirdChecklistId

        // Popup content with a link button
        const popupContent = `
          <div style="min-width: 140px;">
            <strong>${pin.name}</strong><br/>
            <span style="font-size: 0.8rem; color: #666;">${dateStr}</span>
            <div style="margin-top: 8px;">
              <a href="/bird-checklist/${checklistSlug}"
                 style="display: inline-block; padding: 4px 12px; font-size: 0.75rem; font-weight: 700;
                        border: 2px solid #000; border-radius: 8px;
                        background: #a5f3fc; color: #000; text-decoration: none;
                        box-shadow: 2px 2px 0px 0px rgba(0,0,0,1);">
                View Checklist →
              </a>
            </div>
          </div>
        `

        // Bind popup
        marker.bindPopup(popupContent)

        // Show popup on hover
        marker.on('mouseover', () => {
          marker.openPopup()
        })

        // Keep popup open on click (default behaviour), close on mouseout if not clicked
        marker.on('mouseout', () => {
          // Small delay so the popup doesn't flicker when hovering over the popup itself
          setTimeout(() => {
            if (!marker.isPopupOpen()) return
            // Check if mouse is actually over the popup
            const mapEl = map.getContainer()
            const popupEl = marker.getPopup()?.getElement()
            if (popupEl && !popupEl.matches(':hover') && !mapEl.matches(':hover')) {
              marker.closePopup()
            }
          }, 200)
        })
      })
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [pins])

  if (pins.length === 0) {
    return (
      <div className="flex h-[250px] w-full items-center justify-center rounded-lg border-2 border-black bg-white md:h-[350px]">
        <p className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
          <MapPin className="h-4 w-4" />
          No location data
        </p>
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      className="h-[250px] w-full rounded-lg border-2 border-black md:h-[350px]"
    />
  )
}
