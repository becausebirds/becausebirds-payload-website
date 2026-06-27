import type { Metadata } from 'next'

import NavBar from '@/components/navbar'
import Footer from '@/components/Footer'
import SignGuestBookForm from '@/components/SignGuestBookForm'
import VisitorsList from '@/components/VisitorsList'

export const metadata: Metadata = {
  title: 'Because Birds Guest Book',
  description: 'Share your favorite bird in the guest book.',
}

export default async function GuestBookPage() {
  return (
    <div className="relative min-h-screen bg-white dark:bg-background p-2 sm:p-4 md:p-6 lg:p-8">
      {/* SVG Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{ backgroundImage: 'url(/landing-dark.svg)' }}
        aria-hidden="true"
      />

      {/* Neobrutalism Frame */}
      <div className="relative z-10 mx-auto w-full max-w-full bg-white dark:bg-card border-2 border-black dark:border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_hsl(var(--border))] sm:border-2 md:border-4 md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:md:shadow-[12px_12px_0px_0px_hsl(var(--border))] min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">
        <NavBar />
        <article className="pt-16 pb-16">
          <div className="flex flex-col items-center gap-4 pt-8">
            <div className="container max-w-[48rem] mx-auto">
              {/* Page header */}
              <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter font-base mb-2">
                Guest Book
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Sign the guestbook and share your favorite bird.
              </p>
             <p className="text-gray-800 dark:text-gray-400 mb-8">
              <a className="underline" href="#visitors">Jump to past visitors ↓</a>
             </p>
              {/* Form */}
              <SignGuestBookForm />

              {/* Divider */}
              <hr id="visitors" className="border-t-2 border-black dark:border-border my-12" />

              {/* Visitors list */}
              <h2 className="text-2xl font-bold uppercase tracking-tighter font-['Courier_New',monospace] mb-6">
               Past visitors
              </h2>

              <VisitorsList />
            </div>
          </div>
        </article>
        <Footer />
      </div>
    </div>
  )
}
