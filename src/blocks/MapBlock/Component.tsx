'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] w-full items-center justify-center rounded-lg border-2 border-black bg-muted/30">
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading map…</p>
      </div>
    </div>
  ),
})

interface MapBlockProps {
  title?: string
  description?: string | null
  mapType?: 'dots' | 'heatmap'
  csvFile?: { url: string } | null
  csvData?: string | null
  showHotspotsOnly?: boolean
}

export default function MapBlock({
  title,
  description,
  mapType = 'dots',
  csvFile,
  csvData,
  showHotspotsOnly = true,
}: MapBlockProps) {
  return (
    <Card className="border-2 border-black bg-secondary-background text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full overflow-hidden rounded-lg border-2 border-black">
          <MapClient
            csvFileUrl={csvFile?.url ?? null}
            csvData={csvData ?? null}
            mapType={mapType}
            showHotspotsOnly={showHotspotsOnly}
          />
        </div>
      </CardContent>
    </Card>
  )
}
