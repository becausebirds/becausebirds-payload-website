import type { Metadata } from 'next'
import NavBar from '@/components/navbar'
import Footer from '@/components/Footer'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Link, Feather } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Microblog — Because Birds',
  description: 'Micro posts from Jeff Mann on Because Birds.',
  openGraph: {
    title: 'Microblog — Because Birds',
    description: 'A feed of short posts and updates from Jeff Mann on Because Birds.',
  },
}

/* ── URL linkifier ─────────────────────────────────── */
function linkifyText(text: string): string {
  // 1. Escape HTML to prevent XSS
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  // 2. Turn URLs into clickable links
  const urlPattern = /(https?:\/\/[^\s<]+[^\s<.,;:!?)}\]'"])/g

  return escaped.replace(urlPattern, (url) =>
    `<a href="${url}" target="_blank" rel="noopener noreferrer"
        class="underline text-[#0088CC] hover:text-[#005580] decoration-dotted
               hover:decoration-solid transition-all duration-200 break-all">${url}</a>`
  )
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
      <div className="relative z-10 mx-auto w-full max-w-full bg-white dark:bg-card border-2 border-black dark:border-border
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_hsl(var(--border))] sm:border-2 md:border-4
        md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:md:shadow-[12px_12px_0px_0px_hsl(var(--border))] min-h-[calc(100vh-1rem)]
        sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">
        <NavBar />
        <article className="pt-2 pb-16">
          <div className="flex flex-col items-center gap-4 pt-8">
            <div className="container max-w-[36rem] mx-auto">
              <div className="flex items-center gap-2 mb-2">
  <Feather className="w-8 h-8" />
  <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter font-base">
    Microblog
  </h1>
</div>

              <p className="text-gray-600 dark:text-gray-400 mb-8">
                A feed of short posts and updates from Jeff Mann on Because Birds. This feed
                is syndicated to Bluesky on the account{' '}
                <a href="https://bsky.app/profile/becausebirds.com" target="_blank" rel="noopener noreferrer">
                  @becausebirds.com
                </a>
              </p>

              <div className="flex flex-col gap-10">
                {docs.map((post: any) => (
                  <article key={post.id} className="h-entry">
                    <div className="bg-white border-2 border-black p-4 pb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                      transition-all duration-200">

                      {/* Author stamp at top */}
                      <div className="flex items-center gap-2 mb-3 border-b-2 border-dashed border-gray-200 pb-3">
                        <img
                          src="/jeff_mann.jpg"
                          alt="Jeff Mann"
                          width={32}
                          height={32}
                          className="rounded-full object-cover border-2 border-black/20"
                        />
                        <span className="font-bold text-xs uppercase tracking-widest">Jeff Mann</span>
                      </div>

                      {/* Content — with clickable URLs */}
                      <div
                        className="e-content p-name text-base leading-relaxed whitespace-pre-wrap [&_a]:font-medium"
                        style={{ fontFamily: "'Courier New', 'Segoe Print', cursive" }}
                        dangerouslySetInnerHTML={{ __html: linkifyText(post.content) }}
                      />

                      {/* Images — the star of the Polaroid */}
                      {post.images && post.images.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {post.images.map((img: any, i: number) => (
                            <div key={img.id || i} className="border-2 border-black/10">
                              <img
                                src={img.image?.url || `/media/${img.image?.filename}`}
                                alt={img.alt || 'Micro post image'}
                                width={img.image?.width || 800}
                                height={img.image?.height || 600}
                                className="w-full h-auto object-contain"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Handwritten-style timestamp + links */}
                      <div className="mt-4 pt-3 flex items-center justify-between border-t-2 border-dashed border-gray-200"
                        style={{ fontFamily: "'Segoe Print', 'Comic Sans MS', cursive", fontSize: '0.75rem' }}>
                        <time className="dt-published text-gray-500" dateTime={post.createdAt}>
                          🖊 {new Date(post.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </time>
                        <div className="flex gap-3 text-gray-400">
                          <a href={`/microblog/${post.slug || post.id}`}
                            className="underline hover:text-black transition-colors">
                            <Link className="w-5 h-5"></Link>
                          </a>
                          {post.syndicatedTo?.map((s: any) => (
                            <a key={s.platform} href={s.url}
                              className="u-syndication underline hover:text-black transition-colors"
                              target="_blank" rel="noopener noreferrer">
                              {s.platform}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
                {docs.length === 0 && (
                  <p className="text-gray-500 italic dark:text-gray-400">No microposts yet. Check back soon!</p>
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
