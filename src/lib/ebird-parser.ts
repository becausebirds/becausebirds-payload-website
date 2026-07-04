/**
 * eBird Checklist Parser - DEBUG VERSION
 *
 * This version logs what it finds (and doesn't find) to help debug.
 */

export interface EBirdSpecies {
  commonName: string
  scientificName: string | null
  count: string
  exotic: 'native' | 'naturalized' | 'provisional' | 'escapee' | null
  hasPhotos: boolean
  hasAudio: boolean
  comments: string
}

export interface EBirdTrackPoint {
  lat: number
  lng: number
  timestamp?: string
}

export interface EBirdChecklistData {
  checklistId: string
  observer: string
  date: string
  startTime: string
  locationName: string
  locationId: string | null
  latitude: number | null
  longitude: number | null
  region: string
  protocol: string
  duration: number | null
  distance: number | null
  numberOfObservers: number | null
  speciesCount: number
  species: EBirdSpecies[]
  gpsTrack: EBirdTrackPoint[]
  trackDistanceKm: number | null
  /** Debug info — what was extracted and how */
  _debug: {
    parsedFromTitle: any
    parsedFromMeta: any
    parsedFromTime: any
    parsedFromLocation: any
    parsedFromCoords: any
    parsedFromRegion: any
    parsedFromProtocol: any
    parsedFromSpecies: any
    parsedFromTrack: any
    titleTag: string | null
    metadataAuthor: string | null
    timeTag: string | null
    speciesSectionSnippet: string | null
    protocolSectionSnippet: string | null
    trackSectionSnippet: string | null
  }
}

export function parseEbirdChecklistHtml(html: string): EBirdChecklistData {
  const debug: any = { titleTag: null, metadataAuthor: null, timeTag: null, speciesSectionSnippet: null, protocolSectionSnippet: null, trackSectionSnippet: null }

  // ═══ 1. CHECKLIST ID ═══
  const idMatch = html.match(/Checklist\s+(S\d+)/i)
  debug.parsedFromTitle = { method: 'Checklist S\\d+ match', result: idMatch?.[1] || null }
  const checklistId = idMatch?.[1] || ''

  // ═══ 2. TITLE TAG ═══
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
  debug.titleTag = titleMatch?.[1] || null
  debug.parsedFromTitle.speciesFromTitle = null
  let speciesCount = 0
  if (titleMatch) {
    const sc = titleMatch[1].match(/(\d+)\s+species/i)
    speciesCount = sc ? parseInt(sc[1], 10) : 0
    debug.parsedFromTitle.speciesFromTitle = speciesCount
  }

  // ═══ 3. OBSERVER ═══
  // Option A: <meta name="author">
  const authorMatch = html.match(/<meta\s+name="author"\s+content="([^"]+)"\s*\/?>/i)
  debug.metadataAuthor = authorMatch?.[1] || null
  // Option B: <bdo dir="auto">
  const bdoMatch = html.match(/<bdo\s+dir="auto"[^>]*>([^<]+)<\/bdo>/i)
  const observer = authorMatch?.[1] || bdoMatch?.[1] || ''

  // ═══ 4. DATE & TIME ═══
  const timeMatch = html.match(/<time\s+datetime="(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})"/i)
  debug.timeTag = timeMatch ? timeMatch[0].substring(0, 80) : null
  debug.parsedFromTime = { datetimeMatch: timeMatch?.[0] || null }
  let date = ''
  let startTime = ''
  if (timeMatch) {
    date = timeMatch[1]
    const [h, m] = timeMatch[2].split(':')
    const hour = parseInt(h, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    startTime = `${hour12}:${m} ${ampm}`
  }

  // ═══ 5. LOCATION NAME ═══
  // From the data-locationname hidden div
  const locNameHidden = html.match(/data-locationname>([^<]+)<\/div>/i)
  // From the hotspot link
  const hotspotLink = html.match(/\/hotspot\/(L\d+)"[^>]*title="[^"]*"[^>]*>\s*<span>([^<]+)<\/span>/i)
  debug.parsedFromLocation = { hiddenDiv: locNameHidden?.[1] || null, hotspotLink: hotspotLink?.[2] || null }
  const locationName = locNameHidden?.[1] || hotspotLink?.[2] || ''
  const locationId = hotspotLink?.[1] || (html.match(/\/hotspot\/(L\d+)/i)?.[1] ?? null)

  // ═══ 6. COORDINATES ═══
  const coordMatch = html.match(/query=([\d.-]+),([\d.-]+)/)
  debug.parsedFromCoords = { raw: coordMatch?.[0] || null, lat: coordMatch?.[1], lng: coordMatch?.[2] }
  const latitude = coordMatch ? parseFloat(coordMatch[1]) : null
  const longitude = coordMatch ? parseFloat(coordMatch[2]) : null

  // ═══ 7. REGION (breadcrumbs) ═══
  const regionLinks: string[] = []
  const regionRe = /<a\s+href="\/region\/[^"]+"\s+title="[^"]*"[^>]*>\s*<span>([^<]+)<\/span>\s*<\/a>/gi
  let rMatch
  while ((rMatch = regionRe.exec(html)) !== null) {
    regionLinks.push(rMatch[1].trim())
  }
  debug.parsedFromRegion = { breadcrumbCount: regionLinks.length, items: regionLinks }
  const region = regionLinks.join(' > ')

  // ═══ 8. PROTOCOL / EFFORT ═══
  // Find the protocol-fields table
  let protocol = ''
  let duration: number | null = null
  let distance: number | null = null
  let numberOfObservers: number | null = null

  // Look for the StatsToolbar section which contains these values
  const statsSection = html.match(/StatsToolbar[^>]*>([\s\S]*?)StatsToolbar/i)
  debug.protocolSectionSnippet = statsSection ? statsSection[1].substring(0, 500) : null

  // Protocol - try various patterns
  const protMatch1 = html.match(/Protocol[^:]*:\s*<\/[^>]+>\s*<[^>]+>\s*<span[^>]*>([^<]+)<\/span>/i)
  const protMatch2 = html.match(/Protocol[^<]*<[^>]+>([^<]*?(?:Traveling|Stationary|Incidental|Historical|Area)[^<]*)</i)
  protocol = protMatch1?.[1]?.trim() || protMatch2?.[1]?.trim() || ''

  // Duration in minutes
  const durMatch = html.match(/(\d+)\s*min/i)
  duration = durMatch ? parseInt(durMatch[1], 10) : null

  // Distance in miles
  const distMatch = html.match(/([\d.]+)\s*mi/i)
  distance = distMatch ? parseFloat(distMatch[1]) : null

  // Observers
  const obsMatch = html.match(/Observers?[^:]*:\s*<\/[^>]+>\s*<[^>]+>\s*<span[^>]*>\s*(\d+)\s*<\/span>/i)
  const obsMatch2 = html.match(/Number\s+of\s+Observers?[^<]*<[^>]*>[^<]*<[^>]*>\s*(\d+)\s*</i)
  numberOfObservers = obsMatch ? parseInt(obsMatch[1], 10) : obsMatch2 ? parseInt(obsMatch2[1], 10) : null

  debug.parsedFromProtocol = { protocol, duration, distance, numberOfObservers }

  // ═══ 9. SPECIES LIST ═══
  const species: EBirdSpecies[] = []

  // eBird renders species in list items with class "Observation"
  // Find the species list section - look for an ordered list or section containing observations
  const speciesSection = html.match(/<ol[^>]*class="[^"]*Observation-list[^"]*"[^>]*>([\s\S]*?)<\/ol>/i)
    || html.match(/<section[^>]*id="list"[^>]*>([\s\S]*?)<\/section>/i)
    || html.match(/id="list"[^>]*>([\s\S]*?)(?:<\/section>|<\/div>\s*<div[^>]*class="[^"]*Page-section)/i)

  debug.parsedFromSpecies = { sectionFound: !!speciesSection }

  let speciesHtml = speciesSection ? speciesSection[1] : ''
  debug.speciesSectionSnippet = speciesHtml.substring(0, 1000)

  // Try to extract from the species section using observation items
  if (speciesHtml) {
    // Pattern: <li class="Observation ..."> ... </li>
    const obsItems = speciesHtml.match(/<li[^>]*class="[^"]*Observation[^"]*"[^>]*>[\s\S]*?<\/li>/gi)

    if (obsItems) {
      debug.parsedFromSpecies.obsItemCount = obsItems.length

      for (const item of obsItems) {
        // Count - eBird uses Observation-numberObserved
        let count = ''
        const countMatch = item.match(/Observation-numberObserved[^>]*>([^<]+)</i)
        if (countMatch) {
          count = countMatch[1].trim()
        } else {
          // Fallback: just a number at the start
          const simpleCount = item.match(/>(\d+)<\/span>\s*<div/i) || item.match(/class="[^"]*count[^"]*"[^>]*>\s*(\d+)/i)
          count = simpleCount?.[1] || ''
        }

        // Common name
        const commonMatch = item.match(/Observation-commonName[^>]*>([^<]+)</i)
          || item.match(/<span[^>]*class="[^"]*commonName[^"]*"[^>]*>([^<]+)</i)
        const commonName = commonMatch?.[1]?.trim() || ''
        if (!commonName) continue

        // Scientific name
        const sciMatch = item.match(/Observation-sciName[^>]*>([^<]+)</i)
          || item.match(/<em[^>]*>\(?([A-Z][a-z]+[\sA-Za-z.'-]*)\)?<\/em>/)
        const scientificName = sciMatch?.[1]?.trim() || null

        // Exotic status
        let exotic: EBirdSpecies['exotic'] = null
        if (/exoticNaturalized/i.test(item)) exotic = 'naturalized'
        else if (/exoticProvisional/i.test(item)) exotic = 'provisional'
        else if (/exoticEscapee/i.test(item)) exotic = 'escapee'

        // Media badges
        const hasPhotos = /badgePhotographed/i.test(item) || /Icon--badgePhotographed/i.test(item)
        const hasAudio = /badgeRecordedAudio/i.test(item) || /Icon--badgeRecordedAudio/i.test(item)

        // Comments
        const commentsMatch = item.match(/Observation-comments[^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i)
        const comments = commentsMatch?.[1]?.replace(/<[^>]+>/g, '').trim() || ''

        species.push({ commonName, scientificName, count, exotic, hasPhotos, hasAudio, comments })
      }
    }
  }

  // Fallback pattern: look for species names directly
  if (species.length === 0) {
    // Try an alternative - look for species in the checklist area more broadly
    const lines = html.split('\n')
    let inList = false
    for (const line of lines) {
      if (/id="list"/i.test(line) || /Observation-list/i.test(line)) { inList = true; continue }
      if (!inList) continue
      if (/<\/ol>/i.test(line) || /<!-- /.test(line) && inList) break

      // Try to find bird entries - count + name pattern
      const birdMatch = line.match(/>(\d+)<[^>]*>[^<]*<[^>]*><a[^>]*>([A-Z][a-z]+[\sA-Za-z'-]*)</)
      if (birdMatch) {
        species.push({ commonName: birdMatch[2].trim(), scientificName: null, count: birdMatch[1], exotic: null, hasPhotos: false, hasAudio: false, comments: '' })
      }
    }
  }

  debug.parsedFromSpecies.speciesFound = species.length

  // ═══ 10. GPS TRACK ═══
  const gpsTrack: EBirdTrackPoint[] = []
  let trackDistanceKm: number | null = null

  // Look for track data
  const trackScript = html.match(/tracks\s*=\s*(\[[\s\S]*?\]);/i)
  debug.trackSectionSnippet = trackScript ? trackScript[1].substring(0, 300) : null
  debug.parsedFromTrack = { trackScriptFound: !!trackScript }

  if (trackScript) {
    try {
      const parsed = JSON.parse(trackScript[1])
      if (Array.isArray(parsed)) {
        for (const pt of parsed) {
          if (pt && typeof pt.lat === 'number' && typeof pt.lng === 'number') {
            gpsTrack.push({ lat: pt.lat, lng: pt.lng })
          }
        }
      }
    } catch { /* skip */ }
  }

  // Also try to find GeoJSON coordinates
  if (gpsTrack.length === 0) {
    const geoMatch = html.match(/"coordinates"\s*:\s*\[(\[[\d.,\s-]+\](?:,\s*\[[\d.,\s-]+\])*)\]/i)
    debug.parsedFromTrack.geoJsonFound = !!geoMatch
    if (geoMatch) {
      try {
        const coords = JSON.parse(`[${geoMatch[1]}]`)
        if (Array.isArray(coords)) {
          for (const pt of coords) {
            if (Array.isArray(pt) && pt.length >= 2) {
              gpsTrack.push({ lng: pt[0], lat: pt[1] })
            }
          }
        }
      } catch { /* skip */ }
    }
  }

  const trackDistMatch = html.match(/([\d.]+)\s*km\s*track/i)
  trackDistanceKm = trackDistMatch ? parseFloat(trackDistMatch[1]) : null
  debug.parsedFromTrack.trackPoints = gpsTrack.length

  return {
    checklistId, observer, date, startTime, locationName, locationId,
    latitude, longitude, region, protocol, duration, distance,
    numberOfObservers, speciesCount, species, gpsTrack, trackDistanceKm,
    _debug: debug,
  }
}
