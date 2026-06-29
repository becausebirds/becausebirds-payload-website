'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import NavBar from '@/components/navbar'
import Footer from '@/components/Footer'

declare const plausible: (event: string, options?: { props?: Record<string, string> }) => void

export default function NotFound() {
  useEffect(() => {
    if (typeof plausible === 'function') {
      plausible('404', { props: { path: document.location.pathname } })
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-white dark:bg-black p-2 sm:p-4 md:p-6 lg:p-8">
      {/* SVG Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{ backgroundImage: 'url(/landing-dark.svg)' }}
        aria-hidden="true"
      />

      {/* Neobrutalism Frame */}
      <div className="relative z-10 mx-auto w-full max-w-full bg-white dark:bg-black border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#555555] sm:border-2 md:border-4 md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:md:shadow-[12px_12px_0px_0px_#555555] min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">
        {/* Navbar */}
        <NavBar />

        {/* Main Content */}
        <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <h1 className="text-8xl sm:text-9xl font-black tracking-tight mb-4">404</h1>
            <p className="text-lg sm:text-xl font-bold text-gray-600 dark:text-gray-400 mb-8">
              This page could not be found.
            </p>
            <Button asChild variant="default" className="rounded-base">
              <Link href="/">Go home</Link>
            </Button>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
