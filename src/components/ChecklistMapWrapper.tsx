'use client'

import dynamic from 'next/dynamic'

const ChecklistMapClient = dynamic(
  () => import('@/components/ChecklistMapClient'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-24 items-center justify-center rounded-lg border-2 border-black bg-gray-100">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    ),
  },
)

interface TrackPoint {
  lat: number
  lng: number
  timestamp?: string
}

interface Props {
  trackPoints: TrackPoint[]
}

export default function ChecklistMapWrapper({ trackPoints }: Props) {
  return <ChecklistMapClient trackPoints={trackPoints} />
}
