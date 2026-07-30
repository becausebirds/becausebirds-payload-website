import { Feather, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import NavBar from '@/components/navbar'
import Footer from '@/components/Footer'
import configPromise from '@payload-config'
import { getPayload } from 'payload'


/* ── URL linkifier ─────────────────────────────────── */
function linkifyText(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  const urlPattern = /(https?:\/\/[^\s<]+[^\s<.,;:!?)}\]'"])/g

  return escaped.replace(urlPattern, (url) =>
    `<a href="${url}" target="_blank" rel="noopener noreferrer"
        class="underline text-[#0088CC] dark:text-[#66B2FF] hover:text-[#005580]
               dark:hover:text-[#99CCFF] decoration-dotted
               hover:decoration-solid transition-all duration-200 break-all">${url}</a>`
  )
}

async function getMicroposts() {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'microposts',
    sort: '-publishedAt',
  })
  return result.docs || []
}

export default async function MicropostIndex() {
  const docs = await getMicroposts()

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
        <div className="pt-16 pb-16">
          <div className="flex flex-col items-center gap-4 pt-8">
            <div className="container max-w-[36rem] mx-auto">
              {/* Back link */}
              <Link
                href="/"
                className="text-sm text-gray-500 dark:text-gray-400 underline mb-4 inline-block font-mono hover:text-black dark:hover:text-white transition-colors"
              >
                ← Back to home
              </Link>

              {/* Title */}
              <div className="flex items-center gap-2 mb-8">
                <Feather className="w-8 h-8 text-black dark:text-white" />
                <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter">
                  Micro blog
                </h1>
              </div>

              {/* Post list */}
              <div className="flex flex-col gap-10">
                {docs.map((post: any) => {
                  const postDate = new Date(post.publishedAt)
                  const dateStr = postDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                  const timeStr = postDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })

                  return (
                    <article key={post.id} className="h-entry">
                      <Link href={`/microblog/${post.slug || post.id}`} className="group block">
                        <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-600 p-4 pb-6
                          shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_hsl(var(--border))]
                          transition-all duration-200 group-hover:translate-x-[-2px] group-hover:translate-y-[-2px]
                          group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                          dark:group-hover:shadow-[8px_8px_0px_0px_hsl(var(--border))]">

                          {/* Author stamp + date — top section */}
                          <div className="flex items-center justify-between mb-3 border-b-2 border-dashed border-gray-200 dark:border-gray-700 pb-3">
                            <div className="flex items-center gap-2">
                              <img
                                src="/jeff_mann.jpg"
                                alt="Jeff Mann"
                                width={32}
                                height={32}
                                className="rounded-full object-cover border-2 border-black/20 dark:border-white/20"
                              />
                              <span className="font-bold text-xs uppercase tracking-widest text-black dark:text-white">Jeff Mann</span>
                            </div>
                            <time className="dt-published text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap" dateTime={post.createdAt}>
                              {dateStr} · {timeStr}
                            </time>
                          </div>

                          {/* Content */}
                          <div
                            className="e-content p-name text-base leading-relaxed whitespace-pre-wrap [&_a]:font-medium text-black dark:text-gray-200"
                            dangerouslySetInnerHTML={{ __html: linkifyText(post.content) }}
                          />

                          {/* Images — centered, border hugs image */}
                          {post.images && post.images.length > 0 && (
                            <div className="mt-4 space-y-3">
                              {post.images.map((img: any, i: number) => (
                                <div key={img.id || i} className="border-2 border-black/10 dark:border-gray-700 rounded-sm overflow-hidden w-fit mx-auto">
                                  <img
  src={img.image?.sizes?.medium?.url || img.image?.url || `/media/${img.image?.filename}`}
  alt={img.alt || 'Micro post image'}
  width={img.image?.sizes?.medium?.width || img.image?.width || 800}
  height={img.image?.sizes?.medium?.height || img.image?.height || 600}
  className="max-h-[75vh] w-auto object-contain bg-gray-100 dark:bg-gray-800"
/>

                                </div>
                              ))}
                            </div>
                          )}

                          {/* Syndication links at bottom */}
                          {post.syndicatedTo?.length > 0 && (
                            <div className="mt-4 pt-3 flex items-center justify-end gap-3 border-t-2 border-dashed border-gray-200 dark:border-gray-700">
                              <span className="text-xs text-gray-400 dark:text-gray-500">Also on</span>
                              {post.syndicatedTo.map((s: any) => (
                                <span
                                  key={s.platform}
                                  className="text-xs text-gray-400 dark:text-gray-500"
                                >
                                  {s.platform}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                    </article>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}
