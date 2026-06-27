'use client'

import Script from 'next/script'

export function ThemeScript() {
  return (
    <Script
      id="theme-init"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function () {
            try {
              const theme = localStorage.getItem('theme') || 'light'
              if (theme === 'dark') {
                document.documentElement.classList.add('dark')
              } else {
                document.documentElement.classList.remove('dark')
              }
            } catch (e) {}
          })()
        `,
      }}
    />
  )
}
