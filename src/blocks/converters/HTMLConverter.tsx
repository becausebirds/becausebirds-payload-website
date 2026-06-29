'use client'

import React, { useEffect, useRef } from 'react'

export const HTMLConverter: React.FC<{
  code?: string
}> = ({ code }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  // Disable iframe scroll hijacking
  useEffect(() => {
    if (!containerRef.current) return
    const iframes = containerRef.current.querySelectorAll('iframe')
    iframes.forEach((iframe) => {
      iframe.setAttribute('scrolling', 'no')
      iframe.style.overflow = 'hidden'
      // For older browsers
      ;(iframe as any).scrolling = 'no'
    })
  }, [code])

  return (
    <div
      className="flex flex-col items-center overflow-hidden max-w-full"
      style={{ overscrollBehavior: 'contain' }}
    >
      <div className="flex justify-center items-center w-full max-w-full overflow-hidden">
        <div
          ref={containerRef}
          dangerouslySetInnerHTML={{ __html: code || '' }}
          className="w-full max-w-full"
          style={{ overflow: 'hidden', lineHeight: 0 }}
        />
      </div>
    </div>
  )
}
