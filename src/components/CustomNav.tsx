// components/CustomNav.tsx
import React from 'react'
import Link from 'next/link'

export const CustomNav: React.FC = () => {
  return (
    <Link 
      href="/admin/micropost-creator" 
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 20px',
        color: 'var(--theme-elevation-800)', // Use CSS variables for theme consistency
        textDecoration: 'none',
        fontWeight: '500'
      }}
    >
      New Micropost
    </Link>
  )
}
