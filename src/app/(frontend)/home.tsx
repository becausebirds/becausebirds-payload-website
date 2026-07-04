import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from
'@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import NavBar from '@/components/navbar'
import { Footer } from '@/Footer/Component'
import type { Post } from '@/payload-types'
import BirdingStats from '@/components/BirdingStats'

const PostCard = ({ post }: { post: Post }) => (
  <Card className="border-2 border-black dark:border-border h-full flex flex-col">
    {/* Featured Image */}
     {post.heroImage && typeof post.heroImage !== 'number' && 'url' in
post.heroImage && post.heroImage.url && (
      <div className="px-4 sm:px-2 md:px-4">
        <div className="relative w-full h-48 rounded-base
overflow-hidden flex-shrink-0">
          <Image
            src={post.heroImage.url}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      </div>
    )}

    <CardHeader className="pb-0">
      <CardTitle className="text-xl font-black">
        <Link href={`/${post.slug}`} className="hover:underline text-
foreground">
          {post.title}
        </Link>
      </CardTitle>
      <CardDescription className="text-sm font-bold text-gray-500
dark:text-muted-foreground">
        {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </CardDescription>
      {post.categories && Array.isArray(post.categories) &&
post.categories.length > 0 && (
        <div className="flex flex-wrap gap-2 my-3">
          {post.categories.map((category) => {
            // category could be just a number (ID only) or a populated object
            if (typeof category === 'object' && 'id' in category) {
              return <Badge key={category.id}>{category.title}</Badge>
            }
            return null
          })}
        </div>
      )}
    </CardHeader>

    <CardContent className="flex-1 flex flex-col pt-0">
      {/* Use meta.description instead of excerpt */}
      <p className="leading-relaxed text-base flex-1 text-gray-700
dark:text-gray-300">
        {post.meta?.description || 'No description available'}
      </p>
      <Link href={`/${post.slug}`}>
        <Button className="mt-3 rounded-base">Read more →</Button>
      </Link>
    </CardContent>
  </Card>
)

/* ── Extract plain text from Lexical rich content ── */
function extractTextFromContent(content: any): string {
  if (!content || !content.root) return ''

  const children = content.root.children || []
  const texts: string[] = []

  function walk(nodes: any[]) {
    for (const node of nodes) {
      if (node.type === 'text' && typeof node.text === 'string') {
        texts.push(node.text)
      }
      if (node.children) {
        walk(node.children)
      }
    }
  }

  walk(children)
  return texts.join(' ').replace(/\s+/g, ' ').trim()
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…'
}

/* ── Project List Item (compact, matching archive style) ── */
const ProjectListItem = ({ post }: { post: Post }) => (
  <Link href={`/${post.slug}`} className="group block">
    <div className="flex gap-5 items-center border-b-2 border-black
dark:border-border py-5 transition-all hover:bg-gray-50
dark:hover:bg-muted px-4 -mx-4">
      {/* Thumbnail */}
      {post.heroImage &&
        typeof post.heroImage !== 'number' &&
        'url' in post.heroImage &&
        post.heroImage.url && (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0
border-2 border-black dark:border-border overflow-hidden">
            <Image
              src={post.heroImage.url}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h2 className="text-base sm:text-lg font-black group-hover:underline
underline-offset-2 text-gray-900 dark:text-foreground">
          {post.title}
        </h2>
        <p className="text-xs font-bold text-gray-500 dark:text-muted-foreground
mt-1">
          {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        {post.content && (
          <p className="text-sm font-medium text-gray-600
dark:text-muted-foreground mt-1 truncate">
            {truncate(extractTextFromContent(post.content), 150)}
          </p>
        )}
      </div>

      {/* Arrow */}
      <span className="text-2xl font-black flex-shrink-0
group-hover:translate-x-1 transition-transform text-gray-900
dark:text-foreground">
        →
      </span>
    </div>
  </Link>
)

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  // Fetch latest posts sorted by publishedAt
  const posts = await payload.find({
    collection: 'posts',
    limit: 3,
    depth: 1,
    sort: '-publishedAt',
    where: {
      _status: {
       equals: 'published',
    },
  },
  })

  // DEBUG: Log the first post to see what fields are being returned
  console.log('First post:', JSON.stringify(posts.docs[0], null, 2))

  // Fetch projects (posts with 'projects' category)
  const projects = await payload.find({
    collection: 'posts',
    limit: 3,
    depth: 1,
    sort: '-publishedAt',
    where: {
      _status: {
      equals: 'published',
    },
       categories: {
        equals: 23,
      },
    },
  })

  return (
    <div className="relative min-h-screen bg-white dark:bg-background p-2 sm:p-4
md:p-6 lg:p-8">
      {/* SVG Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-
no-repeat opacity-100"
        style={{ backgroundImage: 'url(/landing-dark.svg)' }}
        aria-hidden="true"
      />

      {/* Neobrutalism Frame */}
      <div className="relative z-10 mx-auto w-full max-w-full bg-white
dark:bg-card border-2 border-black dark:border-border
shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
dark:shadow-[4px_4px_0px_0px_hsl(var(--border))]
sm:border-2 md:border-4
md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]
dark:md:shadow-[12px_12px_0px_0px_hsl(var(--border))]
min-h-[calc(100vh-1rem)]
sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)]
lg:min-h-[calc(100vh-4rem)]">
        {/* Navbar */}
        <NavBar />

        {/* Main Content */}
        <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">

<div className="flex items-center justify-center gap-3 mb-8 text-center">
  <img
    src="/jeff_mann.jpg"
    alt="Jeff Mann"
    className="w-7 h-7 rounded-full border-1 border-black dark:border-border
object-cover flex-shrink-0"
  />
  <p className="text-sm italic leading-relaxed text-gray-600
dark:text-gray-400">
    This website is handwritten by Jeff Mann since 2013.
  </p>
</div>

          {/* Latest Posts Section */}
          <section className="mb-12">
            <h1 className="text-5xl font-black mb-8 tracking-tight text-gray-900
dark:text-foreground">Latest
Posts</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
gap-6">
              {posts.docs.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <Link href="/archive">
                <Button className="rounded-base" variant="neutral">View all
posts →</Button>
              </Link>
            </div>
          </section>
<BirdingStats />
          {/* Projects Section */}
          {projects.docs.length > 0 && (
            <section className="mb-24">
              <h2 className="text-5xl font-black text-gray-900
dark:text-foreground mb-8 tracking-
tight">Projects</h2>
              <div>
                {projects.docs.map((project) => (
                  <ProjectListItem key={project.id} post={project} />
                ))}
              </div>
              <div className="flex justify-center mt-8">
                <Link href="/archive?category=5">
                  <Button className="rounded-base" variant="neutral">View all
projects →</Button>
                </Link>
              </div>
            </section>
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
