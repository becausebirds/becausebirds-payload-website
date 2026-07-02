import { cn } from '@/utilities/ui'
import { Public_Sans } from 'next/font/google'
import type { Metadata } from 'next'
import PlausibleProvider from 'next-plausible'

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-public-sans',
})

import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Providers } from '@/providers'
import { LightboxProvider } from '@/components/Lightbox'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import { cookies } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  const cookieStore = await cookies()
  const isPayloadUser = cookieStore.has('payload-token')

  return (
    <html className={cn(publicSans.variable)} lang="en" suppressHydrationWarning>
      <head>
        <link rel="micropub" href={`${getServerSideURL()}/api/micropub`} />
        <link rel="authorization_endpoint" href="https://indieauth.com/auth" />
        <link rel="token_endpoint" href="https://tokens.indieauth.com/token" />
        <link
          rel="webmention"
          href={`https://webmention.io/${new URL(getServerSideURL()).hostname}/webmention`}
        />
        <link
          rel="pingback"
          href={`https://webmention.io/${new URL(getServerSideURL()).hostname}/xmlrpc`}
        />
        <link rel="me" href="https://github.com/becausebirds" />
        <link rel="me atproto" href="https://bsky.app/profile/becausebirds.com" />
      </head>
      <body className="bg-background text-foreground">
        <Providers>
          <LightboxProvider>
            <AdminBar
              adminBarProps={{
                preview: isEnabled,
              }}
            />
            <PlausibleProvider
              src="https://metrics.becausebirds.com/js/pa-0x7cC2UP7PJ-dvQ0KTwdv.js"
              enabled={!isPayloadUser}
            >
              {children}
            </PlausibleProvider>
          </LightboxProvider>
        </Providers>
      </body>
    </html>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const url = getServerSideURL()
  return {
    title: {
      default: 'Because Birds',
      template: '%s',
    },
    description: 'A birding blog by Jeff Mann For anyone who loves birds.',
    metadataBase: new URL(url),
    openGraph: mergeOpenGraph(),
    twitter: {
      card: 'summary_large_image',
      creator: '@payloadcms',
    },
  }
}
