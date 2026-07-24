// microblog/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import NavBar from '@/components/navbar'
import Footer from '@/components/Footer'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'

type Args = {
  params: Promise<{ slug: string }>
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
      title: `Microblog — Because Birds`,
      description: post.content?.slice(0, 160),
      url: postUrl,
      type: 'article',
      publishedTime: post.createdAt,
    },
    twitter: {
      card: 'summary',
      title: `Microblog — Because Birds`,
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

  return (
    <div className="relative min-h-screen bg-white dark:bg-background p-2 sm:p-4 md:p-6 lg:p-8">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{ backgroundImage: 'url(/landing-dark.svg)' }}
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto w-full max-w-full bg-white dark:bg-card border-2 border-black dark:border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_hsl(var(--border))] sm:border-2 md:border-4 md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:md:shadow-[12px_12px_0px_0px_hsl(var(--border))] min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">
        <NavBar />
        <article className="pt-16 pb-16 h-entry">
          <div className="flex flex-col items-center gap-4 pt-8">
            <div className="container max-w-[36rem] mx-auto">
              <a
                href="/microblog"
                className="text-sm text-gray-500 dark:text-gray-400 underline mb-4 inline-block font-['Courier_New',monospace] hover:text-black dark:hover:text-white transition-colors"
              >
                ← Back to microblog
              </a>

              <div className="border-2 border-black p-6 bg-[oklch(96.79%_0.0654_102.26)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:text-black mt-4">
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
              </div>
            </div>
          </div>
        </article>
        <Footer />
      </div>
    </div>
  )
}
