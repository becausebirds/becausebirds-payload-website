import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import NavBar from '@/components/navbar'
import Footer from '@/components/Footer'
import BirdHeroSection from './BirdHeroSection'
import BirdStatsSection from './BirdStatsSection'
import { Skeleton } from '@/components/ui/skeleton'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getBird(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/birds?where[slug][equals]=${slug}&depth=2`,
    { next: { revalidate: 60 } },
  )
  if (!res.ok) return null
  const data = await res.json()
  return data.docs?.[0] ?? null
}

export default async function BirdSpeciesPage({ params }: PageProps) {
  const { slug } = await params

  // Single fetch — bird is passed to both the hero (immediate) and stats (bird.id)
  const bird = await getBird(slug)
  if (!bird) notFound()

  return (
    <div className="relative min-h-screen bg-white dark:bg-background p-2 sm:p-4 md:p-6 lg:p-8">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{ backgroundImage: 'url(/landing-dark.svg)' }}
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto w-full max-w-full bg-white dark:bg-card border-2 border-black dark:border-border overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_hsl(var(--border))] sm:border-2 md:border-4 md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:md:shadow-[12px_12px_0px_0px_hsl(var(--border))] min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">
        <NavBar />

        <main className="pt-10 pb-16 container mx-auto px-4 space-y-6">
          {/* Hero streams immediately — bird is already fetched, no re-fetch */}
          <Suspense fallback={<HeroSkeleton />}>
            <BirdHeroSection bird={bird} />
          </Suspense>

          {/* Everything below streams in — needs checklists + media data */}
          <Suspense fallback={<ContentSkeleton />}>
            <BirdStatsSection birdId={bird.id} />
          </Suspense>
        </main>

        <Footer />
      </div>
    </div>
  )
}

function HeroSkeleton() {
  return (
    <>
      <div className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-green-400 px-3 py-1.5 text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <span className="h-3.5 w-3.5" />
        View All Birds
      </div>
      <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="border-b-2 border-black bg-lime-100 dark:bg-gray-800 px-5 py-4 md:px-6 md:py-5 space-y-3">
          <Skeleton className="h-9 sm:w-[350px] w-[200px]" />
          <Skeleton className="h-6 sm:w-[250px] w-[150px]" />
          <Skeleton className="h-5 sm:w-[200px] w-[120px]" />
        </div>
        <div className="p-5 md:p-6 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </section>
    </>
  )
}

function ContentSkeleton() {
  return (
    <>
      <div className="flex flex-wrap gap-2 p-5 md:px-6 md:pb-6">
        <Skeleton className="h-7 w-28 rounded-lg" />
        <Skeleton className="h-7 w-28 rounded-lg" />
        <Skeleton className="h-7 w-24 rounded-lg" />
        <Skeleton className="h-7 w-28 rounded-lg" />
      </div>
      <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="border-b-2 border-black bg-gray-100 px-5 py-3 md:px-6">
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="bg-background p-5 md:p-6">
          <Skeleton className="h-[250px] md:h-[300px] w-full rounded-lg" />
        </div>
      </section>
      <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="border-b-2 border-black bg-gray-100 px-5 py-3 md:px-6">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="bg-background p-5 md:p-6">
          <Skeleton className="h-[250px] md:h-[300px] w-full rounded-lg" />
        </div>
      </section>
    </>
  )
}

/* ── Metadata & generateStaticParams ── */

export async function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
  const res = await fetch(
    `${baseUrl}/api/bird-checklists?depth=1&limit=10000&fields=speciesRecords.bird`,
    { next: { revalidate: 60 } },
  )
  if (!res.ok) return []

  const data = await res.json()
  const seenSlugs = new Set<string>()

  for (const checklist of data.docs ?? []) {
    for (const record of checklist.speciesRecords ?? []) {
      if (typeof record.bird === 'object' && record.bird?.slug) {
        seenSlugs.add(record.bird.slug)
      }
    }
  }

  return Array.from(seenSlugs).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
  const res = await fetch(`${baseUrl}/api/birds?where[slug][equals]=${slug}&depth=1`, { next: { revalidate: 60 } })
  const data = await res.json()
  const bird = data.docs?.[0] ?? null

  if (!bird) return { title: 'Bird Species Not Found' }

  return {
    title: `${bird.comName} | Because Birds`,
    description: `Sightings, photos, and audio recordings of ${bird.comName} (${bird.sciName})${bird.familyComName ? ` from the ${bird.familyComName} family` : ''}.`,
  }
}
