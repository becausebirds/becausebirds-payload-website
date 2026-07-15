import type { Metadata } from 'next'
import NavBar from '@/components/navbar'
import Footer from '@/components/Footer'
import AllBirdsClient from './AllBirdsClient'

export const metadata: Metadata = {
  title: 'All Birds | Because Birds',
  description: 'Browse all my bird species with sightings, photos, and recordings.',
}

/* ── Types ────────────────────────────────── */

interface Bird {
  id: string
  comName: string
  sciName: string
  speciesCode: string
  slug: string
}

interface SpeciesRecord {
  bird?: {
    id: string
  }
}

interface Checklist {
  speciesRecords?: SpeciesRecord[]
}

/* ── Data Fetching ────────────────────────── */

async function getAllBirds(): Promise<Bird[]> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

  console.log('🔍 DEBUG: Starting getAllBirds()')
  console.log('📍 baseUrl:', baseUrl)

  // Step 1: Fetch ALL birds (paginate through all pages)
  console.log('📥 Fetching all birds...')
  const allBirds: Bird[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const birdRes = await fetch(
      `${baseUrl}/api/birds?limit=1000&page=${page}&depth=0`,
      { next: { revalidate: 60 } }
    )

    if (!birdRes.ok) {
      console.error(`❌ Failed to fetch birds page ${page}:`, birdRes.status, birdRes.statusText)
      break
    }

    const birdData = await birdRes.json()
    const docs = birdData.docs ?? []

    if (docs.length === 0) {
      hasMore = false
      break
    }

    allBirds.push(...docs)
    console.log(`✅ Fetched page ${page}: ${docs.length} birds (total: ${allBirds.length})`)

    // Check if there are more pages
    if (birdData.hasNextPage === false || !birdData.hasNextPage) {
      hasMore = false
    }

    page++
  }

  console.log(`✅ Total birds fetched: ${allBirds.length}`)

  // Step 2: Fetch all checklists
  console.log('📥 Fetching all checklists...')
  const checklistRes = await fetch(
    `${baseUrl}/api/bird-checklists?limit=1000&depth=1`,
    { next: { revalidate: 60 } }
  )

  if (!checklistRes.ok) {
    console.error('❌ Failed to fetch checklists:', checklistRes.status, checklistRes.statusText)
    return []
  }

  const checklistData = await checklistRes.json()
  const checklists = checklistData.docs ?? []
  console.log(`✅ Fetched ${checklists.length} total checklists`)

  // Step 3: Build set of bird IDs that appear in checklists
  console.log('🔄 Building set of birds in checklists...')
  const birdsWithChecklists = new Set<string>()
  let totalSpeciesRecords = 0

  checklists.forEach((checklist: Checklist) => {
    const speciesRecords = checklist.speciesRecords ?? []
    totalSpeciesRecords += speciesRecords.length

    speciesRecords.forEach((record: SpeciesRecord) => {
      if (record.bird?.id) {
        birdsWithChecklists.add(record.bird.id)
      }
    })
  })

  console.log(`✅ Found ${birdsWithChecklists.size} unique birds in checklists`)
  console.log(`   (from ${totalSpeciesRecords} total species records)`)

  // Step 4: Filter birds - only include birds with checklists, exclude 'spuh'
  console.log('🔄 Filtering birds...')

  const filtered = allBirds.filter((bird: Bird) => {
    const hasChecklist = birdsWithChecklists.has(bird.id)
    const hasSpuh = bird.speciesCode.includes('spuh')

    return hasChecklist && !hasSpuh
  })

  console.log(`✅ Final filtered count: ${filtered.length} birds`)

  return filtered
}

/* ── Page Component ───────────────────────── */

export default async function AllBirdsPage() {
  console.log('🚀 AllBirdsPage rendering...')
  const birds = await getAllBirds()
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

  console.log(`📊 Page received ${birds.length} birds`)

  
  return (
    <div className="relative min-h-screen bg-white dark:bg-background p-2 sm:p-4 md:p-6 lg:p-8">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{ backgroundImage: 'url(/landing-dark.svg)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-full bg-white dark:bg-card border-2 border-black dark:border-border overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_hsl(var(--border))] sm:border-2 md:border-4 md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:md:shadow-[12px_12px_0px_0px_hsl(var(--border))] min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">
        <NavBar />

        <main className="pt-10 pb-16 container mx-auto px-4 space-y-4">
         <h1 className='text-3xl font-bold'>All Birds </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Here is every bird I've ever seen. Each bird has its own page with my photos, recordings and observations of it.
          </p>

          <AllBirdsClient birds={birds} baseUrl={baseUrl} />
        </main>

        <Footer />
      </div>
    </div>
  )
}
