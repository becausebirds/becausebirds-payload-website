import { CMSLink } from '@/components/Link'
import { getCachedGlobal } from '@/utilities/getGlobals'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()
  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-zinc-800">
      <div className="container py-8 gap-8 flex flex-col">
        <div className="prose text-center max-w-none flex flex-col items-center gap-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
            Explore More
          </h3>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3">
            {navItems.map(({ link }, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                <CMSLink
                  className="text-sm font-bold no-underline text-foreground"
                  {...link}
                />
                {link.newTab && <span className="text-xs">↗︎</span>}
              </span>
            ))}
          </nav>
          <p className="text-sm font-bold text-foreground">
            © 2026 becausebirds. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
