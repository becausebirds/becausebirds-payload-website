'use client'

import { useEffect } from 'react'

interface PlausiblePageTrackerProps {
  customProperties: Record<string, string>
  children: React.ReactNode
}

export default function PlausiblePageTracker({
  customProperties,
  children,
}: PlausiblePageTrackerProps) {
  useEffect(() => {
    const plausible = (window as any).plausible
    if (plausible && plausible.init) {
      plausible.init({
        ...(plausible.o || {}),
        customProperties,
      })
    }
  }, [customProperties])

  return <>{children}</>
}
