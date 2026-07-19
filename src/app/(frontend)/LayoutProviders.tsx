'use client'

import { AdminBar } from '@/components/AdminBar'
import { Providers } from '@/providers'
import { LightboxProvider } from '@/components/Lightbox'
import PlausibleProvider from 'next-plausible'
import { getServerSideURL } from '@/utilities/getURL'

// Import leaflet CSS only when this client component renders (not in root layout)
export default function LayoutProviders({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <LightboxProvider>
        <AdminBar adminBarProps={{ preview: false }} />
        <PlausibleProvider
          src="https://metrics.becausebirds.com/js/pa-0x7cC2UP7PJ-dvQ0KTwdv.js"
          enabled
        >
          {children}
        </PlausibleProvider>
      </LightboxProvider>
    </Providers>
  )
}
