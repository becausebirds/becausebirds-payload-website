/**
 * eBird Import Utility - HTML Parser Version
 * Extracts all checklist data directly from HTML before Vue rendering
 */

import * as cheerio from 'cheerio'

export interface EBirdChecklistSummary {
  checklistId: string
  url: string
  title?: string
}

export interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
  checklists: any[]
}

/**
 * Parse duration like "1 hour(s), 11 minute(s)" to total minutes
 */
function parseDuration(durationStr: string): number | null {
  if (!durationStr) return null

  let totalMinutes = 0

  // Match hours
  const hourMatch = durationStr.match(/(\d+)\s*hour/i)
  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1]) * 60
  }

  // Match minutes
  const minMatch = durationStr.match(/(\d+)\s*minute/i)
  if (minMatch) {
    totalMinutes += parseInt(minMatch[1])
  }

  return totalMinutes > 0 ? totalMinutes : null
}

/**
 * Parse distance like "0.563 mile(s)" to float with 2 decimal places
 */
function parseDistance(distanceStr: string): number | null {
  if (!distanceStr) return null

  const match = distanceStr.match(/([\d.]+)/)
  if (match) {
    const distance = parseFloat(match[1])
    // Round to 2 decimal places
    return Math.round(distance * 100) / 100
  }
  return null
}

/**
 * Parse party size from string
 */
function parsePartySize(partyStr: string): number | null {
  if (!partyStr) return null

  try {
    return parseInt(partyStr.trim())
  } catch {
    return null
  }
}

/**
 * Clean location name by removing GPS coordinates if no locationId
 */
function cleanLocationName(locationName: string, hasLocationId: boolean): string
 {
  if (hasLocationId || !locationName) {
    return locationName
  }

  // Remove coordinates from end: "14726 Ramona Ave, Chino US-CA 33.98621, 
  // -117.70697"
  // → "14726 Ramona Ave, Chino US-CA"
  return locationName.replace(/\s*[\d.-]+\s*,\s*-?[\d.]+\s*$/, '').trim()
}

/**
 * Parse time string like "HH:MM" from obsDt format "2018-01-04 23:29"
 */
function parseTimeFromObsDt(obsDt: string): string {
  if (!obsDt) return ''
  const match = obsDt.match(/\d{2}:\d{2}/)
  return match ? match[0] : ''
}

/**
 * Extract the date portion ("YYYY-MM-DD") from an obsDt string ("YYYY-MM-DD 
 * HH:MM")
 * obsDt is already in local time, so no conversion is needed
 */
function extractDateFromObsDt(obsDt: string): string {
  if (!obsDt) return ''
  return obsDt.split(' ')[0]
}

/**
 * Parse eBird checklist HTML and extract all metadata
 */
export function parseEBirdHTML(html: string): {
  checklistId: string
  date: string
  locationName: string
  locationId: string
  county: string
  state: string
  region: string
  latitude: number | null
  longitude: number | null
  gpsTrack: Array<{ lat: number; lng: number }>
  gpsPointCount: number
  trackDistance: number | null
  protocol: string
  duration: number | null
  distance: number | null
  partySize: number | null
  startTime: string
  endTime: string
} {
  // ── CHECKLIST ID ──
  let checklistId = ''
  const idMatch = html.match(/Checklist\s+(S\d+)/i)
  if (idMatch) {
    checklistId = idMatch[1]
  } else {
    const fallbackMatch = html.match(/\b(S\d{6,})\b/)
    checklistId = fallbackMatch ? fallbackMatch[1] : ''
  }

  // ── DATE ──
  let date = ''
  const timeMatch = html.match(/<time\s+datetime="(\d{4}-\d{2}-\d{2})/)
  if (timeMatch) {
    date = timeMatch[1]
  }

  // ── LOCATION NAME ──
  let locationName = ''
  const locMatch = html.match(/data-locationname>([^<]+)/i)
  if (locMatch) {
    locationName = locMatch[1].trim()
  }

  // ── LOCATION ID ──
  let locationId = ''
  const locIdMatch = html.match(/data-locationid>([^<]+)/i)
  if (locIdMatch) {
    locationId = locIdMatch[1].trim()
  }

  // ── COUNTY / STATE / REGION (from breadcrumbs) ──
  let county = ''
  let state = ''
  let region = ''

  const breadcrumbMatch = html.match(/<nav class="Breadcrumbs[\s\S]*?<\/nav>/i)
  if (breadcrumbMatch) {
    const breadcrumbHtml = breadcrumbMatch[0]
    // Equivalent of Python's re.findall — iterate exec to capture group 
    // contents directly
    const nameRegex = /<a[^>]*title="Region page for [^"]*"[^>]*>\s*(?:<span>)?([^<]+)/gi
    const names: string[] = []
    let match
    while ((match = nameRegex.exec(breadcrumbHtml)) !== null) {
      names.push(match[1].trim())
    }

    if (names.length >= 1) {
      // Strip trailing " County" (case-insensitive) so e.g. "Orange County" → 
      // "Orange"
      county = names[0].replace(/\s+county$/i, '')
    }
    if (names.length >= 2) {
      state = names[1]
    }
    if (names.length >= 3) {
      region = names[2]
    }
  }

  // Clean location name if no locationId
  locationName = cleanLocationName(locationName, !!locationId)

  // ── CENTER COORDINATES ──
  let latitude: number | null = null
  let longitude: number | null = null

  const coordMatch = html.match(/query=([\d.-]+),([\d.-]+)/)
  if (coordMatch) {
    latitude = parseFloat(coordMatch[1])
    longitude = parseFloat(coordMatch[2])
  }

  // ── GPS TRACK ──
  let gpsTrack: Array<{ lat: number; lng: number }> = []

  // Current eBird Vue format: :path="[lng,lat,lng,lat,...]"
  let pathMatch = html.match(/:path="\[([\d.,\s\-]+)\]"/)

  if (pathMatch) {
    const coords = pathMatch[1].split(',')

    for (let i = 0; i < coords.length; i += 2) {
      try {
        const lng = parseFloat(coords[i].trim())
        const lat = parseFloat(coords[i + 1].trim())

        if (!isNaN(lng) && !isNaN(lat)) {
          gpsTrack.push({ lat, lng })
        }
      } catch {
        // Skip invalid coordinates
      }
    }
  }

  // Fallback: older data-maptrack-data format
  if (gpsTrack.length === 0) {
    const trackMatch = html.match(/data-maptrack-data="([\d.,\s\-]+)"/)

    if (trackMatch) {
      const coords = trackMatch[1].split(',')

      for (let i = 0; i < coords.length; i += 2) {
        try {
          const lng = parseFloat(coords[i].trim())
          const lat = parseFloat(coords[i + 1].trim())

          if (!isNaN(lng) && !isNaN(lat)) {
            gpsTrack.push({ lat, lng })
          }
        } catch {
          // Skip invalid coordinates
        }
      }
    }
  }

  // ── TRACK DISTANCE (calculated from GPS points) ──
  let trackDistance: number | null = null
  if (gpsTrack.length > 1) {
    let totalDistance = 0
    for (let i = 0; i < gpsTrack.length - 1; i++) {
      const lat1 = gpsTrack[i].lat
      const lng1 = gpsTrack[i].lng
      const lat2 = gpsTrack[i + 1].lat
      const lng2 = gpsTrack[i + 1].lng

      // Haversine formula for distance between two points
      const R = 3959 // Earth's radius in miles
      const dLat = ((lat2 - lat1) * Math.PI) / 180
      const dLng = ((lng2 - lng1) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      totalDistance += R * c
    }
    // Round to 2 decimal places
    trackDistance = Math.round(totalDistance * 100) / 100
  }

  // ── PROTOCOL (from HTML title attribute) ──
  let protocol = ''
  const protocolMatch = html.match(/title="Protocol:\s*([^"]+)"/i)
  if (protocolMatch) {
    protocol = protocolMatch[1].trim()
  }

  // ── DURATION (from HTML title attribute: title="Duration:1 hour(s), 11 
  // minute(s)") ──
  let duration: number | null = null
  const durationMatch = html.match(/title="Duration:([^"]+)"/i)
  if (durationMatch) {
    duration = parseDuration(durationMatch[1])
  }

  // ── DISTANCE (from HTML title attribute) ──
  let distance: number | null = null
  const distanceMatch = html.match(/title="Distance:([^"]+)"/i)
  if (distanceMatch) {
    distance = parseDistance(distanceMatch[1])
  }

  // ── PARTY SIZE (from HTML title attribute: title="Observers:1") ──
  let partySize: number | null = null
  const partySizeMatch = html.match(/title="Observers:\s*(\d+)"/i)
  if (partySizeMatch) {
    partySize = parsePartySize(partySizeMatch[1])
  }

  // ── START TIME (from <time datetime="2026-07-03T08:34">) ──
  let startTime = ''
  const timeDtMatch = 
  html.match(/<time\s+datetime="\d{4}-\d{2}-\d{2}T(\d{2}:\d{2})/)
  if (timeDtMatch) {
    startTime = timeDtMatch[1]
  }

  // ── END TIME ──
  let endTime = ''
  const endTimeMatch = html.match(/End\s+Time[^<]*<[^>]*>([^<]+)/i)
  if (endTimeMatch) {
    endTime = endTimeMatch[1].trim()
  }

  return {
    checklistId,
    date,
    locationName,
    locationId,
    county,
    state,
    region,
    latitude,
    longitude,
    gpsTrack,
    gpsPointCount: gpsTrack.length,
    trackDistance,
    protocol,
    duration,
    distance,
    partySize,
    startTime,
    endTime,
  }
}

/**
 * Fetch all checklist links from eBird "My Checklists" page
 */
export async function fetchEBirdChecklistLinks(
  ebirdUsername: string,
  ebirdPassword: string
): Promise<EBirdChecklistSummary[]> {
  const checklists: EBirdChecklistSummary[] = []

  try {
    const { chromium } = await import('playwright')

    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const context = await browser.newContext()
    const page = await context.newPage()

    // Login
    const loginUrl = 'https://secure.birds.cornell.edu/cassso/login'
    await page.goto(loginUrl, { waitUntil: 'networkidle' })

    await page.fill('#input-user-name', ebirdUsername)
    await page.fill('#input-password', ebirdPassword)
    await page.press('#input-password', 'Enter')

    // Wait for Duo 2FA if present
    try {
      await page.waitForSelector('#duo_iframe, iframe[src*="duo"]', {
        timeout: 5000,
      })
      console.log('Waiting for Duo 2FA approval...')
      await page.waitForTimeout(20000)
    } catch {
      // No 2FA
    }

    await page.waitForLoadState('networkidle')

    // Navigate to My Checklists
    await 
    page.goto('https://ebird.org/mychecklists?currentRow=1&sortBy=date&o=desc', {
      waitUntil: 'networkidle',
    })

    // Get the HTML
    const html = await page.content()

    // Parse checklist links
    const $ = cheerio.load(html)

    $('a[href*="/checklist/S"]').each((_, el) => {
      const href = $(el).attr('href')
      const text = $(el).text().trim()

      if (href && href.includes('/checklist/S')) {
        const match = href.match(/\/checklist\/(S\d+)/)
        if (match) {
          checklists.push({
            checklistId: match[1],
            url: `https://ebird.org${href}`,
            title: text || undefined,
          })
        }
      }
    })

    await browser.close()
  } catch (error) {
    console.error('Error fetching eBird checklists:', error)
    throw error
  }

  return checklists
}

/**
 * Fetch checklist data from eBird API
 */
export async function fetchChecklistFromAPI(
  checklistId: string,
  ebirdApiToken: string
): Promise<any> {
  const url = `https://api.ebird.org/v2/product/checklist/view/${checklistId}`

  const response = await fetch(url, {
    headers: {
      'X-eBirdApiToken': ebirdApiToken,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch checklist ${checklistId}: 
    ${response.statusText}`)
  }

  return response.json()
}

/**
 * Extract checklist HTML and parse all metadata
 */
export async function extractChecklistHTMLData(
  checklistId: string,
  ebirdUsername: string,
  ebirdPassword: string,
  debug: boolean = false
): Promise<ReturnType<typeof parseEBirdHTML>> {
  try {
    const { chromium } = await import('playwright')

    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const context = await browser.newContext()
    const page = await context.newPage()

    // Login
    const loginUrl = 'https://secure.birds.cornell.edu/cassso/login'
    await page.goto(loginUrl, { waitUntil: 'networkidle' })

    await page.fill('#input-user-name', ebirdUsername)
    await page.fill('#input-password', ebirdPassword)
    await page.press('#input-password', 'Enter')

    // Wait for Duo 2FA if present
    try {
      await page.waitForSelector('#duo_iframe, iframe[src*="duo"]', {
        timeout: 5000,
      })
      if (debug) console.log('   Waiting for Duo 2FA approval...')
      await page.waitForTimeout(20000)
    } catch {
      // No 2FA
    }

    await page.waitForLoadState('networkidle')

    // Navigate to checklist
    const checklistUrl = `https://ebird.org/checklist/${checklistId}`
    const response = await page.goto(checklistUrl, { waitUntil: 'networkidle' })

    // Get original HTML from server response (before Vue rendering)
    const originalHtml = await response?.text()

    if (!originalHtml) {
      if (debug) console.log(`   ⚠️  [DEBUG] No HTML response for 
      ${checklistId}`)
      await browser.close()
      return {
        checklistId,
        date: '',
        locationName: '',
        locationId: '',
        county: '',
        state: '',
        region: '',
        latitude: null,
        longitude: null,
        gpsTrack: [],
        gpsPointCount: 0,
        trackDistance: null,
        protocol: '',
        duration: null,
        distance: null,
        partySize: null,
        startTime: '',
        endTime: '',
      }
    }

    // Parse the HTML
    const parsedData = parseEBirdHTML(originalHtml)

    if (debug) {
      console.log(`   ✅ [DEBUG] Extracted checklist data for ${checklistId}`)
      console.log(`      Date: ${parsedData.date}`)
      console.log(`      Location: ${parsedData.locationName}`)
      console.log(`      Location ID: ${parsedData.locationId}`)
      console.log(`      Region: ${parsedData.region}`)
      console.log(`      Protocol: ${parsedData.protocol}`)
      console.log(`      GPS Points: ${parsedData.gpsPointCount}`)
      console.log(`      Track Distance: ${parsedData.trackDistance} miles`)
      console.log(`      Duration: ${parsedData.duration} minutes`)
      console.log(`      Distance: ${parsedData.distance} miles`)
      console.log(`      Start Time: ${parsedData.startTime}`)
      console.log(`      Party Size: ${parsedData.partySize}`)
    }

    await browser.close()
    return parsedData
  } catch (error) {
    console.error(`Error extracting HTML data for ${checklistId}:`, error)
    throw error
  }
}

/**
 * Fetch all birds from CMS and create lookup dictionaries
 */
export async function fetchAllBirds(payload: any): Promise<{
  byScientificName: Record<string, any>
  byCommonName: Record<string, any>
  bySpeciesCode: Record<string, any>
}> {
  const byScientificName: Record<string, any> = {}
  const byCommonName: Record<string, any> = {}
  const bySpeciesCode: Record<string, any> = {}

  try {
    console.log('🔍 [DEBUG] Fetching all birds from CMS...')
    let page = 1
    let totalPages = 1
    let totalBirds = 0

    while (page <= totalPages) {
      console.log(`   📄 [DEBUG] Fetching birds page ${page}...`)
      const result = await payload.find({
        collection: 'birds',
        limit: 50,
        page,
        depth: 0,
      })

      for (const doc of result.docs) {
        const sciName = (doc.sciName || '').trim().toLowerCase()
        const comName = (doc.comName || '').trim().toLowerCase()
        const speciesCode = (doc.speciesCode || '').trim().toUpperCase()

        if (sciName) {
          byScientificName[sciName] = doc
        }
        if (comName) {
          byCommonName[comName] = doc
        }
        if (speciesCode) {
          bySpeciesCode[speciesCode] = doc
        }
        totalBirds++
      }

      totalPages = result.totalPages
      console.log(`   ✅ [DEBUG] Page ${page}: ${result.docs.length} birds loaded
      (total: ${totalBirds})`)
      page++
    }

    console.log(
      `✅ [DEBUG] Bird lookup complete: ${Object.keys(byScientificName).length} 
      scientific names, ${Object.keys(byCommonName).length} common names, 
      ${Object.keys(bySpeciesCode).length} species codes\n`
    )
  } catch (error) {
    console.error('❌ [DEBUG] Error fetching birds:', error)
    throw error
  }

  return { byScientificName, byCommonName, bySpeciesCode }
}

/**
 * Normalize text for fuzzy matching
 */
function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * Match an eBird observation to a bird in the CMS
 */
export function matchBird(
  observation: any,
  byScientificName: Record<string, any>,
  byCommonName: Record<string, any>,
  bySpeciesCode: Record<string, any>,
  debug: boolean = false
): { bird: any | null; method: string } {
  const sciRaw = (observation.sciName || '').trim()
  const comRaw = (observation.commonName || '').trim()
  const speciesCodeRaw = (observation.speciesCode || '').trim().toUpperCase()

  // 1. Species code match (most reliable)
  if (speciesCodeRaw) {
    if (speciesCodeRaw in bySpeciesCode) {
      if (debug) console.log(`   ✅ [DEBUG] Matched "${comRaw}" (${sciRaw}) 
      [${speciesCodeRaw}] → speciesCode exact`)
      return { bird: bySpeciesCode[speciesCodeRaw], method: 'speciesCode exact' 
      }
    }
  }

  // 2. Exact scientific name match
  if (sciRaw) {
    const sciKey = sciRaw.toLowerCase()
    if (sciKey in byScientificName) {
      if (debug) console.log(`   ✅ [DEBUG] Matched "${comRaw}" (${sciRaw}) → 
      sciName exact`)
      return { bird: byScientificName[sciKey], method: 'sciName exact' }
    }
  }

  // 3. Exact common name match
  if (comRaw) {
    const comKey = comRaw.toLowerCase()
    if (comKey in byCommonName) {
      if (debug) console.log(`   ✅ [DEBUG] Matched "${comRaw}" (${sciRaw}) → 
      comName exact`)
      return { bird: byCommonName[comKey], method: 'comName exact' }
    }
  }

  // 4. Fuzzy common name match
  if (comRaw) {
    const fuzzy = normalize(comRaw)
    for (const [key, doc] of Object.entries(byCommonName)) {
      if (normalize(key) === fuzzy) {
        if (debug) console.log(`   ✅ [DEBUG] Matched "${comRaw}" (${sciRaw}) → 
        comName fuzzy`)
        return { bird: doc, method: 'comName fuzzy' }
      }
    }
  }

  // 5. No match
  if (!sciRaw && !comRaw && !speciesCodeRaw) {
    if (debug) console.log(`   ⚠️  [DEBUG] No match: empty scientificName, commonName, and speciesCode`)
    return { bird: null, method: 'empty scientificName, commonName, and speciesCode' }
  }
  if (debug) console.log(`   ⚠️  [DEBUG] No match for "${comRaw}" (${sciRaw}) 
    [${speciesCodeRaw}]`)
  return { bird: null, method: `no match for sciName='${sciRaw}' / 
    comName='${comRaw}' / speciesCode='${speciesCodeRaw}'` }
}

/**
 * Transform eBird API response to Payload CMS format with linked bird species
 * Now includes HTML-parsed metadata with correct field precedence
 */
export async function transformEBirdData(

  

  apiData: any,
  htmlData: ReturnType<typeof parseEBirdHTML>,
  byScientificName: Record<string, any>,
  byCommonName: Record<string, any>,
  bySpeciesCode: Record<string, any>,
  debug: boolean = false
): Promise<any> {
  const {
    profile,
    loc,
    obs,
    subnational1Code,
    subnational2Code,
    numSpecies,
    durationMinutes,
    effortDistanceKm,
    numObservers,
    startTime,
    endTime,
    creationDt,
    obsDt,
  } = apiData

  if (debug) console.log(`\n📋 [DEBUG] Transforming checklist: ${apiData.subId}`)
  if (debug) console.log(`   Location: ${loc?.name || 'Unknown'}`)
  if (debug) console.log(`   Observations: ${obs?.length || 0}`)

  // Transform observations to species records with linked birds
  const speciesRecords: any[] = []
  const unmatchedObservations: any[] = []

  if (obs && Array.isArray(obs)) {
    if (debug) console.log(`   🔄 [DEBUG] Processing ${obs.length} observations...`)
    for (let i = 0; i < obs.length; i++) {
      const observation = obs[i]
      const { bird, method } = matchBird(observation, byScientificName, 
      byCommonName, bySpeciesCode, debug)

      if (bird) {
        speciesRecords.push({
          bird: bird.id,
          count: observation.howManyStr || 'X',
          comments: observation.comments || '',
        })
      } else {
        unmatchedObservations.push({
          commonName: observation.commonName || '',
          scientificName: observation.sciName || '',
          speciesCode: observation.speciesCode || '',
          reason: method,
        })
      }
    }
  }

  if (debug) {
    console.log(`   ✅ [DEBUG] Matched: ${speciesRecords.length} observations`)
    console.log(`   ⚠️  [DEBUG] Unmatched: ${unmatchedObservations.length} observations`)
    if (unmatchedObservations.length > 0) {
      console.log(`   Unmatched details:`)
      unmatchedObservations.forEach((u) => {
        console.log(`      - "${u.commonName}" (${u.scientificName}) [${u.speciesCode}] → ${u.reason}`)
      })
    }
  }

  // Use HTML-parsed GPS track (more complete)
  const gpsTrack = htmlData.gpsTrack.map((point) => ({
    lat: point.lat,
    lng: point.lng,
  }))

  // Parse date and time from API obsDt (e.g., "2018-01-04 23:29")
  // Add +1 day to the date
  const obsDtDate = extractDateFromObsDt(apiData.obsDt)
  const obsDtTime = parseTimeFromObsDt(apiData.obsDt)
  const dateObj = new Date(obsDtDate)
  dateObj.setDate(dateObj.getDate() + 1)
  const adjustedDate = dateObj.toISOString().split('T')[0]



  if (debug) {
    console.log(`   Protocol: ${htmlData.protocol || 'Traveling'} (from HTML)`)
    console.log(`   Duration: ${htmlData.duration} min (from HTML)`)
    console.log(`   Date: ${adjustedDate} (adjusted from obsDt: ${apiData.obsDt})`)
    console.log(`   Start Time: ${obsDtTime || ''} (from obsDt: ${apiData.obsDt})`)
    console.log(`   Location ID: ${loc?.locId || htmlData.locationId || null} (from API locId: ${loc?.locId})`)
    console.log(`   State: ${htmlData.state} (from HTML breadcrumbs)`)
    console.log(`   Region: ${htmlData.region} (from HTML breadcrumbs)`)
  }

  return {
    ebirdChecklistId: apiData.subId,
    title: `${htmlData.locationName || loc?.name || 'Unknown Location'} - ${apiData.obsDt.split(' ')[0]}`,
    date: adjustedDate, // Use the +1 day date here
    startTime: obsDtTime || '',
    endTime: htmlData.endTime || endTime || '',
    locationName: htmlData.locationName || loc?.name || '',
    // Location ID: primary source is the API response's locId (e.g., "L99381")
    locationId: loc?.locId || htmlData.locationId || null,
    latitude: htmlData.latitude || loc?.lat || null,
    longitude: htmlData.longitude || loc?.lng || null,
    // State & region: from HTML breadcrumbs only, NOT from API subnational codes
    county: htmlData.county || subnational2Code || '',
    state: htmlData.state || '',
    region: htmlData.region || '',
    // Protocol & duration: parsed from HTML
    protocol: htmlData.protocol || 'Traveling',
    duration: htmlData.duration || durationMinutes || null,
    distance: htmlData.distance || (effortDistanceKm ? 
    Math.round((effortDistanceKm / 1.60934) * 100) / 100 : null),
    trackDistance: htmlData.trackDistance || null,
    numberOfObservers: htmlData.partySize || numObservers || null,
    speciesCount: numSpecies || speciesRecords.length,
    gpsTrack,
    speciesRecords,
    notes: '',
    rawImportData: {
      apiResponse: apiData,
      htmlData,
      unmatchedObservations,
    },
  }
}


/**
 * Check if checklist already exists in CMS
 */
export async function checklistExists(
  checklistId: string,
  payload: any,
  debug: boolean = false
): Promise<boolean> {
  try {
    if (debug) console.log(`   🔍 [DEBUG] Checking if checklist ${checklistId} 
    exists...`)
    const result = await payload.find({
      collection: 'bird-checklists',
      where: {
        ebirdChecklistId: {
          equals: checklistId,
        },
      },
      limit: 1,
    })

    const exists = result.totalDocs > 0
    if (debug) console.log(`   ${exists ? '✅' : '⚠️'} [DEBUG] Checklist exists: 
    ${exists}`)
    return exists
  } catch (error) {
    console.error('❌ [DEBUG] Error checking if checklist exists:', error)
    return false
  }
}

/**
 * Create a new checklist in Payload CMS
 */
export async function createChecklist(
  data: any,
  payload: any,
  debug: boolean = false
): Promise<any> {
  try {
    if (debug) console.log(`   📝 [DEBUG] Creating checklist: 
    ${data.ebirdChecklistId}`)
    if (debug) console.log(`      Title: ${data.title}`)
    if (debug) console.log(`      Species records: ${data.speciesRecords?.length
    || 0}`)

    const result = await payload.create({
      collection: 'bird-checklists',
      data,
    })

    if (debug) console.log(`   ✅ [DEBUG] Checklist created with ID: 
    ${result.id}`)
    return result
  } catch (error) {
    console.error(`❌ [DEBUG] Error creating checklist:`, error)
    throw error
  }
}
