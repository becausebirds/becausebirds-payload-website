/**
 * eBird Checklist Parser
 *
 * Parses eBird checklist HTML to extract species, GPS tracks, and metadata.
 * Also parses eBird observation CSV exports for the species list.
 */

export interface EBirdSpecies {
  commonName: string
  scientificName: string | null
  count: string
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
}

// ═══════════════════════════════════════════════════════════════════
//  CSV SPECIES PARSER
// ═══════════════════════════════════════════════════════════════════

function parseCsvToRows(csv: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let inQuotes = false

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i]
    const nextChar = csv[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField)
      currentField = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++

      currentRow.push(currentField)
      rows.push(currentRow)
      currentRow = []
      currentField = ''
    } else {
      currentField += char
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField)
    rows.push(currentRow)
  }

  return rows.map(row => row.map(field => field.trim().replace(/^"|"$/g, '')))
}

function parseSpeciesName(
  speciesStr: string,
): { commonName: string; scientificName: string | null } {
  if (!speciesStr) return { commonName: '', scientificName: null }
  const match = speciesStr.match(/^(.+?)\s*\(([^)]+)\)$/)
  if (match) {
    return { commonName: match[1].trim(), scientificName: match[2].trim() }
  }
  return { commonName: speciesStr.trim(), scientificName: null }
}

export function parseEbirdCsvSpecies(csv: string): EBirdSpecies[] {
  const rows = parseCsvToRows(csv.replace(/^\ufeff/, ''))

  if (rows.length < 2) return []

  const header = rows[0].map(h => h.toLowerCase())
  const speciesIdx = header.findIndex((h) => h.includes('species'))
  const countIdx = header.findIndex((h) => h.includes('count'))
  const detailsIdx = header.findIndex((h) => h.includes('details'))

  if (speciesIdx === -1) {
    throw new Error('CSV must have a "Species" column. Found: ' + header.join(', '))
  }

  const species: EBirdSpecies[] = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]

    // Skip empty rows
    if (row.length === 0 || !row[0]) continue

    const speciesField = row[speciesIdx]
    const countField = countIdx !== -1 ? (row[countIdx] || '') : ''
    const detailsField = detailsIdx !== -1 ? (row[detailsIdx] || '') : ''

    if (!speciesField) continue

    const { commonName, scientificName } = parseSpeciesName(speciesField)

    species.push({
      commonName,
      scientificName,
      count: countField,
      comments: detailsField,
    })
  }

  return species
}

export function detectFileType(content: string): 'html' | 'csv' {
  const trimmed = content.trim()
  if (/^\s*</.test(trimmed) || /<html/i.test(trimmed)) return 'html'
  const firstLine = trimmed.replace(/^\ufeff/, '').split('\n')[0].trim().toLowerCase()
  if (/species/.test(firstLine) && /count/.test(firstLine)) return 'csv'
  return 'html'
}

export function parseEbirdChecklistHtml(html: string): EBirdChecklistData {
  const idMatch = html.match(/Checklist\s+(S\d+)/i)
  const checklistId = idMatch?.[1] || ''

  const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
  let speciesCount = 0
  if (titleMatch) {
    const sc = titleMatch[1].match(/(\d+)\s+species/i)
    speciesCount = sc ? parseInt(sc[1], 10) : 0
  }

  const authorMatch = html.match(/<meta\s+name="author"\s+content="([^"]+)"\s*\/?>/i)
  const observer = authorMatch?.[1] || ''

  const timeMatch = html.match(/<time\s+datetime="(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})"/i)
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

  const locNameHidden = html.match(/data-locationname>([^<]+)<\/div>/i)
  const hotspotLink = html.match(/\/hotspot\/(L\d+)"[^>]*title="[^"]*"[^>]*>\s*<span>([^<]+)<\/span>/i)
  const locationName = locNameHidden?.[1] || hotspotLink?.[2] || ''
  const locationId = hotspotLink?.[1] || html.match(/\/hotspot\/(L\d+)/i)?.[1] || null

  const coordMatch = html.match(/query=([\d.-]+),([\d.-]+)/)
  const latitude = coordMatch ? parseFloat(coordMatch[1]) : null
  const longitude = coordMatch ? parseFloat(coordMatch[2]) : null

  const regionLinks: string[] = []
  const regionRe = /<a\s+href="\/region\/[^"]+"\s+title="[^"]*"[^>]*>\s*<span>([^<]+)<\/span>\s*<\/a>/gi
  let rMatch
  while ((rMatch = regionRe.exec(html)) !== null) {
    regionLinks.push(rMatch[1].trim())
  }
  const region = regionLinks.join(' > ')

  let protocol = ''
  let duration: number | null = null
  let distance: number | null = null
  let numberOfObservers: number | null = null

  const protMatch = html.match(/<span class="Heading-main u-inline-sm">([^<]+)<\/span>/)
  protocol = protMatch?.[1]?.trim() || ''

  const durMatch = html.match(/datetime="PT(\d+)M"/)
  if (durMatch) duration = parseInt(durMatch[1], 10)

  const distMatch = html.match(/title="Distance:([\d.]+)\s*mile/)
  distance = distMatch ? parseFloat(distMatch[1]) : null

  const obsMatch = html.match(/title="Observers:(\d+)"/)
  numberOfObservers = obsMatch ? parseInt(obsMatch[1], 10) : null

  const species: EBirdSpecies[] = []
  const speciesRegex = /<section\s+id="[^"]+"\s+class="Observation[^"]*"[^>]*aria-labelledBy="([^"]+)"[^>]*>([\s\S]*?)<\/section>/gi
  let speciesMatch

  while ((speciesMatch = speciesRegex.exec(html)) !== null) {
    const sectionContent = speciesMatch[2]
    const commonMatch = sectionContent.match(/<span class="Heading-main"\s*[^>]*>([^<]+)<\/span>/)
    const commonName = commonMatch?.[1]?.trim() || ''
    if (!commonName) continue

    const sciMatch = sectionContent.match(/<span\s+class="Heading-sub Heading-sub--inline Heading-sub--sci"[^>]*>([^<]+)<\/span>/)
    const scientificName = sciMatch?.[1]?.trim() || null

    const countMatch = sectionContent.match(/<div class="Observation-numberObserved">[\s\S]*?<span>(\d+)<\/span>/)
    const count = countMatch?.[1] || ''

    const commentsMatch = sectionContent.match(/<div class="Observation-comments">([\s\S]*?)<\/div>/i)
    const comments = commentsMatch?.[1]?.replace(/<[^>]+>/g, '').trim() || ''

    species.push({ commonName, scientificName, count, comments })
  }

  const gpsTrack: EBirdTrackPoint[] = []
  let trackDistanceKm: number | null = null

  const pathMatch = html.match(/:path="\[([\d.,\s\-]+)\]"/)
  if (pathMatch) {
    try {
      const coords = pathMatch[1].split(',').map((c) => c.trim())
      for (let i = 0; i < coords.length; i += 2) {
        const lng = parseFloat(coords[i])
        const lat = parseFloat(coords[i + 1])
        if (!isNaN(lng) && !isNaN(lat)) gpsTrack.push({ lng, lat })
      }
    } catch { }
  }

  if (gpsTrack.length === 0) {
    const trackDataMatch = html.match(/data-maptrack-data="([\d.,\s\-]+)"/)
    if (trackDataMatch) {
      try {
        const coords = trackDataMatch[1].split(',').map((c) => c.trim())
        for (let i = 0; i < coords.length; i += 2) {
          const lng = parseFloat(coords[i])
          const lat = parseFloat(coords[i + 1])
          if (!isNaN(lng) && !isNaN(lat)) gpsTrack.push({ lng, lat })
        }
      } catch { }
    }
  }

  const trackDistMatch = html.match(/title="Distance:([\d.]+)\s*mile/)
  trackDistanceKm = trackDistMatch ? parseFloat((parseFloat(trackDistMatch[1]) * 1.60934).toFixed(2)) : null

  return {
    checklistId,
    observer,
    date,
    startTime,
    locationName,
    locationId,
    latitude,
    longitude,
    region,
    protocol,
    duration,
    distance,
    numberOfObservers,
    speciesCount,
    species,
    gpsTrack,
    trackDistanceKm,
  }
}
