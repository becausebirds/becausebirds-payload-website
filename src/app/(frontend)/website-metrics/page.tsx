import Link from 'next/link'
import NavBar from '@/components/navbar'
import Footer from '@/components/Footer'

export default function MetricsPage() {
  return (
    <div className="relative min-h-screen bg-white dark:bg-background p-2 sm:p-4 md:p-6 lg:p-8">
      {/* SVG Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{ backgroundImage: 'url(/landing-dark.svg)' }}
        aria-hidden="true"
      />

      {/* Neobrutalism Frame */}
      <div className="relative z-10 mx-auto w-full max-w-full bg-white dark:bg-card border-2 border-black dark:border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_hsl(var(--border))] sm:border-2 md:border-4 md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:md:shadow-[12px_12px_0px_0px_hsl(var(--border))] min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">
        {/* Navbar */}
        <NavBar />

        {/* Main Content */}
        <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-black tracking-tight text-gray-900 dark:text-foreground">
              Site Metrics
            </h1>
            <p className="text-base font-medium text-gray-600 dark:text-muted-foreground mt-2">
              Real-time analytics for becausebirds.com
            </p>
          </div>

          {/* Analytics Dashboard */}
          <div className="border-2 border-black dark:border-border bg-white dark:bg-card p-4 sm:p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_hsl(var(--border))]">
            <iframe
              plausible-embed
              src="https://metrics.becausebirds.com/share/becausebirds.com?auth=3IWL1foEBKAJwOjXRouAi&embed=true&theme=system"
              frameBorder="0"
              loading="lazy"
              style={{ width: '1px', minWidth: '100%', height: '1600px', colorScheme: 'auto' }}
            />
            <div style={{ fontSize: '14px', paddingBottom: '14px' }}>
              Stats powered by{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#4F46E5', textDecoration: 'underline' }}
                href="https://plausible.io"
              >
                Plausible Analytics
              </a>
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Plausible embed script */}
      <script async src="https://metrics.becausebirds.com/js/embed.host.js" />
    </div>
  )
}
