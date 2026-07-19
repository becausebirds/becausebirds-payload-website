//bird-checklists/slug/page.tsx

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import NavBar from '@/components/navbar'
import Footer from '@/components/Footer'
import BirdChecklistComponent from '@/blocks/BirdChecklist/Component'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-static'
export const revalidate = false

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

async function getChecklist(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/bird-checklists?where[slug][equals]=${slug}`,
  )

  if (!res.ok) {
    return null
  }

  const data = await res.json()

  if (!data.docs || data.docs.length === 0) {
    return null
  }

  return data.docs[0]
}

export async function generateStaticParams() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/bird-checklists?limit=1000&depth=0`,
  )

  if (!res.ok) return []

  const data = await res.json()

  return data.docs
    .filter((doc: unknown) => {
      if (!doc || typeof doc !== 'object') return false
      const slug = (doc as Record<string, unknown>).slug
      // Accept plain strings, or objects with a string value prop
      if (typeof slug === 'string') return true
      if (slug && typeof slug === 'object') {
        const maybe = (slug as Record<string, unknown>).value ?? 
                       (slug as Record<string, unknown>).slug
        return typeof maybe === 'string' && maybe.length > 0
      }
      return false
    })
    .map((doc: Record<string, unknown>) => {
      let slug = doc.slug
      // Unwrap if it's an object like { value: "S149067604" }
      if (typeof slug === 'object' && slug !== null) {
        slug = (slug as Record<string, unknown>).value ?? 
               (slug as Record<string, unknown>).slug
      }
      return { slug: slug as string }
    })
}


export default async function BirdChecklistPage({
  params,
}: PageProps) {
  const { slug } = await params

  const checklist = await getChecklist(slug)

  if (!checklist) {
    notFound()
  }

  return (
    <div className="relative min-h-screen bg-white dark:bg-background p-2 sm:p-4 md:p-6 lg:p-8">
      {/* SVG Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{ backgroundImage: 'url(/landing-dark.svg)' }}
        aria-hidden="true"
      />

      {/* Neobrutalism Frame */}
      <div className="relative z-10 mx-auto w-full max-w-full bg-white dark:bg-card border-2 border-black dark:border-border overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_hsl(var(--border))] sm:border-2 md:border-4 md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:md:shadow-[12px_12px_0px_0px_hsl(var(--border))] min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">
        <NavBar />

        <main className="pt-20 pb-16 container mx-auto px-4">
          <Link
        href="/bird-checklists"
        className="inline-flex items-center gap-1.5 rounded-lg border-2 font-bold dark:text-gray-800 border-black bg-green-400 px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:translate-x-px hover:translate-y-px hover:shadow-none"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All checklists
      </Link>
          <h1 className="text-4xl font-bold my-4">Bird Checklist</h1>
          <span className="text-md">I create lists of the birds I see and hear while birdwatching. I submit these bird lists to eBird and archive them here.</span>
          <BirdChecklistComponent
            checklist={{
              id: checklist.id,
            }}
            showMap
            showFullSpeciesList
          />
        </main>

        <Footer />
      </div>
    </div>
  )
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params

  const checklist = await getChecklist(slug)

  if (!checklist) {
    return {
      title: 'Bird Checklist Not Found',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
  const dateDisplay = new Date(checklist.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const region = checklist.region ?? ''
  const description = `A bird checklist by Jeff Mann from ${checklist.locationName ?? 'unknown location'} in ${checklist.region} with ${checklist.speciesCount ?? 0} species created on ${checklist.date.split('T')[0]}.`

  const ogImageUrl = `${baseUrl}/bird-checklists/${slug}/opengraph-image`

  return {
    title: `Jeff's Bird Checklist: ${checklist.locationName} | ${checklist.date.split('T')[0]}`,
    description,
    openGraph: {
      title: `Jeff's Bird Checklist: ${checklist.locationName} | ${checklist.date.split('T')[0]}`,
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `Bird checklist from ${dateDisplay}` }],
      type: 'website',
      siteName: 'Because Birds',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Jeff's Bird Checklist: ${checklist.locationName} | ${checklist.date.split('T')[0]}`,
      description,
      images: [ogImageUrl],
    },
  }
}
