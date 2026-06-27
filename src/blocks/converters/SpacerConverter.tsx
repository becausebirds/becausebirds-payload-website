import React from 'react'

export const SpacerConverter: React.FC<{
  height?: number | null
}> = ({ height = 32 }) => {
  return <div style={{ height: `${height}px` }} />
}
