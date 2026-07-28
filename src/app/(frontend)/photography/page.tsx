import { Suspense } from 'react'
import NavBar from '@/components/navbar'
import Footer from '@/components/Footer'
import PhotographyGalleryClient from './PhotographyGalleryClient'
import { getPhotographyData } from '@/lib/getPhotographyData'

export const dynamic = 'force-static'
export const revalidate = 3600

export const metadata = {
  title: 'Bird photography | Because Birds',
  description:
    'A gallery of bird photography — browse through hundreds of bird photos with location and species details.',
}

export default async function PhotographyPage() {
  const photos = await getPhotographyData()

  return (
    <div className="relative min-h-screen bg-white dark:bg-background p-2 sm:p-4 md:p-6 lg:p-8">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{ backgroundImage: 'url(/landing-dark.svg)' }}
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto w-full max-w-full bg-white dark:bg-card border-2 border-black dark:border-border 
shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
dark:shadow-[4px_4px_0px_0px_hsl(var(--border))] sm:border-2 md:border-4 
md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] 
dark:md:shadow-[12px_12px_0px_0px_hsl(var(--border))] min-h-[calc(100vh-1rem)] 
sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] 
lg:min-h-[calc(100vh-4rem)]">
        <NavBar />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-foreground">
              Bird photography
            </h1>
            <p className="mt-2 text-base font-semibold text-muted-foreground">
              The photos of birds I've taken while birdwatching.
            </p>
          </div>

          <Suspense fallback={<GallerySkeleton />}>
            <PhotographyGalleryClient initialPhotos={photos} />
          </Suspense>
        </main>

        <Footer />
      </div>
    </div>
  )
}

function GallerySkeleton() {
  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="break-inside-avoid border-2 border-black bg-white dark:bg-card shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] animate-pulse"
        >
          <div
            className={`w-full ${
              i % 3 === 0 ? 'h-72' : i % 3 === 1 ? 'h-56' : 'h-64'
            } bg-gray-200 dark:bg-gray-700`}
          />
          <div className="border-t-2 border-black p-3 space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
