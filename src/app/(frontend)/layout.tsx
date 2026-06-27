import '@/globals.css'
import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { Public_Sans } from 'next/font/google'

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-public-sans',
})

import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Providers } from '@/providers'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import { cookies } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  // Check if a Payload admin user is logged in via the HTTP-only cookie
  const cookieStore = await cookies()
  const isPayloadUser = cookieStore.has('payload-token')

  return (
      <html className={cn(publicSans.variable)} lang="en" suppressHydrationWarning>
      <head>
        {!isPayloadUser && (
          <>
            {/* Plausible Analytics (tagged-events + outbound-links) */}
            <script
              defer
              data-domain="becausebirds.com"
              src="https://metrics.becausebirds.com/js/script.tagged-events.outbound-links.js"
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`,
              }}
            />
            {/* Privacy-friendly analytics by Plausible (PA tag) */}
            <script
              async
              src="https://metrics.becausebirds.com/js/pa-0x7cC2UP7PJ-dvQ0KTwdv.js"
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)};
                  plausible.init=plausible.init||function(i){plausible.o=i||{}};
                  plausible.init()
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="bg-background text-foreground">
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />
          {children}
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  title: {
    default: 'Because Birds',        // fallback for the homepage
    template: '%s', 
  },
  description: 'A website for people who love birds.',
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}
