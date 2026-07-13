import { Skeleton } from '@/components/ui/skeleton'
import NavBar from '@/components/navbar'
import Footer from '@/components/Footer'

export default function BirdSpeciesLoading() {
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
          <Skeleton className="h-9 w-32 rounded-lg" />
          <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="border-b-2 border-black bg-lime-100 dark:bg-gray-800 px-5 py-4 md:px-6 md:py-5 space-y-3">
              <Skeleton className="h-9 sm:w-[350px] w-[200px]" />
              <Skeleton className="h-6 sm:w-[250px] w-[150px]" />
              <Skeleton className="h-5 sm:w-[200px] w-[120px]" />
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </div>
  )
}
