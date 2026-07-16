import type { Metadata } from 'next'
import NavBar from '@/components/navbar'
import Footer from '@/components/Footer'
import AllBirdsClient from './AllBirdsClient'

export const metadata: Metadata = {
  title: 'All Birds | Because Birds',
  description: 'Browse all bird species with sightings, photos, and recordings.',
}

/* ── Page Component ───────────────────────── */

export default async function AllBirdsPage() {
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

        <main className="pt-10 pb-16 container mx-auto px-4 space-y-8">
          <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="border-b-2 border-black bg-lime-100 dark:bg-gray-800 px-5 py-4 md:px-6 md:py-5">
              <h1 className="text-3xl text-gray-800 dark:text-white tracking-tight uppercase md:text-4xl">
                All Birds
              </h1>
              <p className="mt-1 text-sm text-gray-800 dark:text-white font-semibold">
                Lifers &middot; Click a bird to see details
              </p>
            </div>
          </section>

          <AllBirdsClient birds={[]} baseUrl={baseUrl} />
        </main>

        <Footer />
      </div>
    </div>
  )
}
