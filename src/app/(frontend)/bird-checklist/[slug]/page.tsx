import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import NavBar from '@/components/navbar'
import Footer from '@/components/Footer'
import BirdChecklistComponent from '@/blocks/BirdChecklist/Component'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

async function getChecklist(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/bird-checklists?where[slug][equals]=${slug}`,
    {
      next: {
        revalidate: 60,
      },
    },
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
          <h2 className="text-3xl font-bold mb-4">Bird Checklist</h2>
          <span className='text-md'>Like a lot of birders, I create lists of the birds I see and hear. These lists often contain a GPS track of where I walked. This is one of those bird checklists.</span>
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

  return {
    title: `Jeff's Bird Checklist: ${checklist.locationName} | ${checklist.date.split('T')[0]}`,
    description: `A bird checklist by Jeff Mann from ${
      checklist.locationName ?? 'unknown location'
    } with ${checklist.speciesCount ?? 0} species created on ${checklist.date.split('T')[0]}.`,
  }
}