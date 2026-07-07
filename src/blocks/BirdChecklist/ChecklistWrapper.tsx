'use client'

import { useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'

export default function BirdChecklistWrapper({
  children,
  mapPreview,
  isInitiallyMinimized = true,
}: {
  children: React.ReactNode
  mapPreview: React.ReactNode
  isInitiallyMinimized?: boolean
}) {
  const [expanded, setExpanded] = useState(!isInitiallyMinimized)

  return (
    <div className="bg-gray-100">
      {!expanded && (
        <div className="relative border-b-2 border-black">
          <div className="h-40 overflow-hidden">{mapPreview}</div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-100 pointer-events-none" />
        </div>
      )}

      {expanded && <div className="px-5 pt-4 pb-4 md:p-6">{children}</div>}

      <div className="p-6 text-center">
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-white px-6 py-3 font-bold text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-gray-100"
        >
          {expanded ? (
            <>
              <Minimize2 className="h-4 w-4" />
              Collapse Checklist
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4" />
              Expand Checklist
            </>
          )}
        </button>
      </div>
    </div>
  )
}
