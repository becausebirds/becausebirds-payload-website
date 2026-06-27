import Link from 'next/link'

const exploreLinks = [
  { label: 'About', href: '/about' },
  { label: 'Visitor Stats', href: '/website-metrics' },
  { label: 'Personality Quizzes', href: '/archive?category=16',},
  { label: 'Archive', href: '/archive',},
  { label: 'eBird Profile', href: 'https://ebird.org/profile/NDI2NTk5/world', external: true },
  { label: 'iNaturalist Profile', href: 'https://www.inaturalist.org/people/1715077', external: true },
  { label: 'Bluesky Profile', href: 'https://bsky.app/profile/becausebirds.com', external: true },
]

export default function Footer() {
  return (
    <footer className="border-t-2 border-black dark:border-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Explore More */}
        <div className="text-center mb-8">
          <h3 className="text-sm font-black uppercase tracking-wider mb-4 text-foreground">
            Explore More
          </h3>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
            {exploreLinks.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold hover:underline underline-offset-2 text-foreground"
                >
                  {link.label} &#x2197;&#xFE0E;
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-bold hover:underline underline-offset-2 text-foreground"
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm font-bold text-foreground">
          <p>© 2026 becausebirds. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
