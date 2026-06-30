'use client'

import React, { useEffect, useRef } from 'react'

export const HTMLConverter: React.FC<{
  code?: string
}> = ({ code }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  // Make iframes responsive
  useEffect(() => {
    if (!containerRef.current) return
    const iframes = containerRef.current.querySelectorAll('iframe')
    iframes.forEach((iframe) => {
      const width = iframe.getAttribute('width')
      const height = iframe.getAttribute('height')
      if (width && height) {
        iframe.style.maxWidth = `${width}px`
        iframe.style.width = '100%'
        iframe.style.aspectRatio = `${width} / ${height}`
        iframe.removeAttribute('width')
      }
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
