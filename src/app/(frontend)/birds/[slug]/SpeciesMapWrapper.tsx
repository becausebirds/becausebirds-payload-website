'use client'

import dynamic from 'next/dynamic'
import type { LocationPin } from './BirdStatsSection'

const SpeciesMapClient = dynamic(
  () => import('./SpeciesMapClient'),
  {
    ssr: false,
    loading: () => <div className="h-64 w-full rounded-lg bg-gray-100 animate-pulse" />,
  },
)

export default function SpeciesMapWrapper({ pins }: { pins: LocationPin[] }) {
  return <SpeciesMapClient pins={pins} />
}
