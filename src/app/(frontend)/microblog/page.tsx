import type { Metadata } from 'next'
import NavBar from '@/components/navbar'
import Footer from '@/components/Footer'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const metadata: Metadata = {
  title: 'Microblog — Because Birds',
  description: 'Micro posts from Jeff Mann on Because Birds.',
  openGraph: {
    title: 'Microblog — Because Birds',
    description: 'A feed of short posts and updates from Jeff Mann on Because Birds.',
  },
}

export default async function MicroblogPage() {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'microposts',
    sort: '-createdAt',
    limit: 50,
  })

  return (
    <div className="relative min-h-screen bg-white dark:bg-background p-2 sm:p-4 md:p-6 lg:p-8">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{ backgroundImage: 'url(/landing-dark.svg)' }}
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto w-full max-w-full bg-white dark:bg-card border-2 border-black dark:border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_hsl(var(--border))] sm:border-2 md:border-4 md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:md:shadow-[12px_12px_0px_0px_hsl(var(--border))] min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">
        <NavBar />
        <article className="pt-16 pb-16">
          <div className="flex flex-col items-center gap-4 pt-8">
            <div className="container max-w-[36rem] mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter font-base mb-2">
                Because Birds Microblog
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
  A feed of short posts and updates from Jeff Mann on Because Birds. This feed is syndicated to Bluesky on the account{' '}
  <a href="https://bsky.app/profile/becausebirds.com" target="_blank" rel="noopener noreferrer">
    @becausebirds
  </a>
</p>


              <div className="flex flex-col gap-6">
                {docs.map((post: any) => (
                  <article key={post.id} className="h-entry border-2 border-black p-6 bg-[oklch(96.79%_0.0654_102.26)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 dark:text-black">
                    <div className="e-content p-name text-base leading-relaxed">
                      {post.content}
                    </div>
                    <div className="flex items-center gap-3 mt-4 text-sm text-gray-500 dark:text-gray-700 font-['Courier_New',monospace]">
                      <time className="dt-published" dateTime={post.createdAt}>
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                      <a
                        href={`/microblog/${post.slug || post.id}`}
                        className="underline hover:text-black dark:hover:text-white transition-colors"
                      >
                        permalink
                      </a>
                      {post.syndicatedTo?.map((s: any) => (
                        <a
                          key={s.platform}
                          href={s.url}
                          className="u-syndication underline hover:text-black dark:hover:text-white transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          also on {s.platform}
                        </a>
                      ))}
                    </div>
                  </article>
                ))}
                {docs.length === 0 && (
                  <p className="text-gray-500 italic dark:text-gray-400">
                    No microposts yet. Check back soon!
                  </p>
                )}
              </div>
            </div>
          </div>
        </article>
        <Footer />
      </div>
    </div>
  )
}
