import type { Metadata } from 'next'
import NavBar from '@/components/navbar'
import Footer from '@/components/Footer'
import AllBirdsClient from './AllBirdsClient'

export const metadata: Metadata = {
  title: 'All Birds | Because Birds',
  description: 'Browse all my bird species with sightings, photos, and recordings.',
}

interface Bird {
  id: string
  comName: string
  sciName: string
  speciesCode: string
  slug: string
}

async function getAllBirds(): Promise<{ birds: Bird[]; details: Record<string, any> }> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

  const res = await fetch(`${baseUrl}/api/birds-with-data`, {
    next: { revalidate: 300 },
  })

  // DEBUG: Log the status and raw response
  if (!res.ok) {
    console.error('API Fetch Failed:', res.status, res.statusText)
    return { birds: [], details: {} }
  }

  const data = await res.json()
  console.log('API Response Data:', data) // DEBUG: Check if 'docs' exists here

  const birds: Bird[] = data.docs ?? []
  console.log('Birds loaded:', birds.length) // DEBUG: Check count

  const detailRes = await fetch(`${baseUrl}/api/bird-details/batch`, {
    method: 'POST',
    body: JSON.stringify({ ids: birds.map(b => b.id) }),
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 300 },
  })

  const details = detailRes.ok ? await detailRes.json() : {}
  return { birds, details }
}

export default async function AllBirdsPage() {
  const { birds, details } = await getAllBirds()
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

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
          <h1 className="text-3xl font-bold">All Birds</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Here is every bird I've ever seen. Each bird has its own page with
            my photos, recordings and observations of it.
          </p>
          <AllBirdsClient birds={birds} baseUrl={baseUrl} initialDetails={details} />
        </main>
        <Footer />
      </div>
    </div>
  )
}
