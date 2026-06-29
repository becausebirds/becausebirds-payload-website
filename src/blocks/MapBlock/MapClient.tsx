'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ── Types ──────────────────────────────────────────────────────────────────────
interface HotspotData {
  lat: number
  lng: number
  name: string
  totalBirds: number
  checklistCount: number
}

interface MapClientProps {
  csvFileUrl: string | null
  csvData: string | null
  mapType: 'dots' | 'heatmap'
  showHotspotsOnly: boolean
}

// ── Hotspot detection ──────────────────────────────────────────────────────────
function isHotspot(locationName: string): boolean {
  if (!locationName || locationName.trim() === 'Home') return false
  const name = locationName.trim()
  if (/US-[A-Z]{2}\s+\d+\.\d+/.test(name)) return false
  if (/\(\d+\.\d+/.test(name)) return false
  if (/Auto selected/.test(name)) return false
  if (/^\d+\s+\w+\s+(Loop|St|Ave|Blvd|Dr|Rd|Ln|Way|Ct|Cir|Pkwy)/i.test(name)) return false
  if (/,\s*[A-Z]{2}\s+\d{5}/.test(name)) return false
  return true
}

// ── CSV parser ─────────────────────────────────────────────────────────────────
function parseLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

function parseCSV(csv: string): HotspotData[] {
  const lines = csv.trim().split('\n')
  if (lines.length < 2) return []

  const header = parseLine(lines[0])
  const locIdx = header.findIndex((h) => h === 'Location')
  const latIdx = header.findIndex((h) => h === 'Latitude')
  const lngIdx = header.findIndex((h) => h === 'Longitude')
  const countIdx = header.findIndex((h) => h === 'Count')

  if (locIdx === -1 || latIdx === -1 || lngIdx === -1) return []

  const locationMap = new Map<string, HotspotData>()

  for (let i = 1; i < lines.length; i++) {
    const fields = parseLine(lines[i])
    const location = fields[locIdx] ?? ''
    const lat = parseFloat(fields[latIdx])
    const lng = parseFloat(fields[lngIdx])
    const birdCount = parseInt(fields[countIdx], 10) || 0

    if (isNaN(lat) || isNaN(lng)) continue

    const key = `${lat.toFixed(6)},${lng.toFixed(6)}`

    if (locationMap.has(key)) {
      const existing = locationMap.get(key)!
      existing.totalBirds += birdCount
      existing.checklistCount += 1
    } else {
      locationMap.set(key, {
        lat,
        lng,
        name: location,
        totalBirds: birdCount,
        checklistCount: 1,
      })
    }
  }

  return Array.from(locationMap.values())
}

function getColor(value: number, max: number): string {
  const ratio = value / max
  if (ratio > 0.75) return '#ef4444'
  if (ratio > 0.5) return '#f97316'
  if (ratio > 0.25) return '#eab308'
  return '#22c55e'
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function MapClient({
  csvFileUrl,
  csvData,
  mapType,
  showHotspotsOnly,
}: MapClientProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [hotspots, setHotspots] = useState<HotspotData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch & parse CSV data
  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setLoading(true)
      setError(null)

      try {
        let raw = csvData ?? ''

        // If no pasted data but a file URL exists, fetch it
        if (!raw && csvFileUrl) {
          const res = await fetch(csvFileUrl)
          if (!res.ok) throw new Error(`Failed to fetch CSV (${res.status})`)
          raw = await res.text()
        }

        if (!raw) {
          setHotspots([])
          setLoading(false)
          return
        }

        const data = parseCSV(raw)
        const filtered = showHotspotsOnly
          ? data.filter((d) => isHotspot(d.name))
          : data

        if (!cancelled) {
          setHotspots(filtered)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load CSV')
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [csvFileUrl, csvData, showHotspotsOnly])

  // Render map
  useEffect(() => {
    if (!mapContainerRef.current || hotspots.length === 0) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const map = L.map(mapContainerRef.current)
    mapInstanceRef.current = map

    const lats = hotspots.map((h) => h.lat)
    const lngs = hotspots.map((h) => h.lng)
    const center: [number, number] = [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2,
    ]
    map.setView(center, 4)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map)

    const bounds = L.latLngBounds([])
    const maxBirds = Math.max(...hotspots.map((h) => h.totalBirds), 1)

    if (mapType === 'dots') {
      hotspots.forEach((h) => {
        const radius = Math.max(6, (h.totalBirds / maxBirds) * 32)
        const color = getColor(h.totalBirds, maxBirds)

        L.circleMarker([h.lat, h.lng], {
          radius,
          fillColor: color,
          color: '#000',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.75,
        })
          .addTo(map)
          .bindPopup(
            `<strong>${h.name}</strong><br/>
             Checklists: ${h.checklistCount}<br/>
             Total birds: ${h.totalBirds}`,
          )

        bounds.extend([h.lat, h.lng])
      })
    }

    if (mapType === 'heatmap') {
      hotspots.forEach((h) => {
        const intensity = h.totalBirds / maxBirds

        L.circleMarker([h.lat, h.lng], {
          radius: 20 + intensity * 25,
          fillColor: '#ef4444',
          color: 'transparent',
          fillOpacity: 0.15 + intensity * 0.35,
        }).addTo(map)
      })

      hotspots.forEach((h) => {
        L.circleMarker([h.lat, h.lng], {
          radius: 6,
          fillColor: '#dc2626',
          color: '#000',
          weight: 2,
          fillOpacity: 1,
        })
          .addTo(map)
          .bindPopup(
            `<strong>${h.name}</strong><br/>
             Checklists: ${h.checklistCount}<br/>
             Total birds: ${h.totalBirds}`,
          )

        bounds.extend([h.lat, h.lng])
      })
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] })
    }

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [hotspots, mapType])

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/10">
        <p className="text-sm text-muted-foreground">Loading eBird data…</p>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/10">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    )
  }

  // ── Empty state ────────────────────────────────────────────────────────
  if (hotspots.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/10">
        <p className="text-sm text-muted-foreground">
          {showHotspotsOnly
            ? 'No hotspot locations found. Upload or paste your eBird CSV above.'
            : 'No location data could be parsed from the CSV.'}
        </p>
      </div>
    )
  }

  return <div ref={mapContainerRef} className="h-full w-full" />
}
