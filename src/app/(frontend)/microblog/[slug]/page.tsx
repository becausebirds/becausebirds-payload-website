import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import NavBar from '@/components/navbar'
import Footer from '@/components/Footer'
import { Feather } from 'lucide-react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'

type Args = {
  params: Promise<{ slug: string }>
}

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

async function getMicropost(slug: string) {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'microposts',
    limit: 1,
    where: { slug: { equals: slug } },
  })
  return result.docs?.[0] || null
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const post = await getMicropost(slug)
  if (!post) return {}

  const siteUrl = getServerSideURL()
  const postUrl = `${siteUrl}/microblog/${post.slug || post.id}`

  return {
  title: `@becausebirds — ${post.content?.slice(0, 60)}${post.content?.length > 60 ? '…' : ''}`,
  description: post.content?.slice(0, 160) || 'A micropost from Because Birds',
  openGraph: {
    title: `Micro blog — Because Birds`,
    description: post.content?.slice(0, 160),
    url: postUrl,
    type: 'article',
    publishedTime: post.publishedAt ?? undefined, 
  },
  twitter: {
    card: 'summary',
    title: `Micro blog — Because Birds`,
    description: post.content?.slice(0, 160),
  },
  alternates: {
    canonical: postUrl,
  },
}

}

export default async function MicropostPage({ params }: Args) {
  const { slug } = await params
  const post = await getMicropost(slug)

  if (!post) notFound()

  const postDate = new Date(post.publishedAt ?? '')
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
        <article className="pt-16 pb-16 h-entry">
          <div className="flex flex-col items-center gap-4 pt-8">
            <div className="container max-w-[36rem] mx-auto">
              {/* Back link */}
              <a
                href="/microblog"
                className="text-sm text-gray-500 dark:text-gray-400 underline mb-4 inline-block font-mono hover:text-black dark:hover:text-white transition-colors"
              >
                ← Back to micro blog
              </a>

              {/* Title with feather */}
              <div className="flex items-center gap-2 mb-6">
                <Feather className="w-8 h-8 text-black dark:text-white" />
                <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter">
                  Micro blog
                </h1>
              </div>

              {/* ── Post card ── */}
              <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-600 p-4 pb-6
                shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_hsl(var(--border))]
                transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px]
                hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                dark:hover:shadow-[8px_8px_0px_0px_hsl(var(--border))]">

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
                  <time className="dt-published text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap" dateTime={post.publishedAt ? post.publishedAt : undefined}
>
                    {dateStr} · {timeStr}
                  </time>
                </div>

                {/* Content — with clickable URLs */}
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
                          src={img.image?.url || `/media/${img.image?.filename}`}
                          alt={img.alt || 'Micro post image'}
                          width={img.image?.width || 800}
                          height={img.image?.height || 600}
                          className="max-h-[75vh] w-auto object-contain bg-gray-100 dark:bg-gray-800"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Syndication links at bottom (only if they exist) */}
                {post.syndicatedTo != null && post.syndicatedTo.length > 0 && (
                  <div className="mt-4 pt-3 flex items-center justify-end gap-3 border-t-2 border-dashed border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-400 dark:text-gray-500">Also on</span>
                    {post.syndicatedTo.map((s: any) => (
                      <a
                        key={s.platform}
                        href={s.url}
                        className="u-syndication text-xs underline hover:text-black dark:hover:text-white transition-colors text-gray-400 dark:text-gray-500"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {s.platform}
                      </a>
                    ))}
                  </div>
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
