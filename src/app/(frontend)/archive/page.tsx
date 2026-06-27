import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import NavBar from '@/components/navbar'
import type { Post, Category } from '@/payload-types'

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

/* ── Post List Item ── */
const PostListItem = ({ post }: { post: Post }) => (
  <Link href={`/${post.slug}`} className="group block">
    <div className="flex gap-5 items-center border-b-2 border-black dark:border-white py-5 transition-all hover:bg-gray-50 dark:hover:bg-gray-900 px-4 -mx-4">
      {/* Thumbnail */}
      {post.heroImage &&
        typeof post.heroImage !== 'number' &&
        'url' in post.heroImage &&
        post.heroImage.url && (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 border-2 border-black dark:border-white overflow-hidden">
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
        <h2 className="text-base sm:text-lg font-black group-hover:underline underline-offset-2">
          {post.title}
        </h2>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">
          {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          {post.populatedAuthors && post.populatedAuthors.length > 0 && (
            <> — by {post.populatedAuthors.map((a) => a.name).join(', ')}</>
          )}
        </p>
        {post.content && (
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1 truncate">
            {truncate(extractTextFromContent(post.content), 150)}
          </p>
        )}
      </div>

      {/* Arrow */}
      <span className="text-2xl font-black flex-shrink-0 group-hover:translate-x-1 transition-transform">
        →
      </span>
    </div>
  </Link>
)

/* ── Filter Link (sidebar) ── */
const FilterLink = ({
  label,
  active,
  href,
  count,
  indent = 0,
}: {
  label: string
  active: boolean
  href: string
  count?: number
  indent?: number
}) => (
  <Link
    href={href}
    className={`flex items-center justify-between px-3 py-2 text-sm font-bold border-2 border-black dark:border-white transition-all ${
      active
        ? 'bg-black text-white dark:bg-white dark:text-black'
        : 'bg-white dark:bg-black text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900'
    }`}
    style={{ marginLeft: `${indent * 1.25}rem` }}
  >
    <span className="truncate">{label}</span>
    {count !== undefined && (
      <span className="text-xs ml-2 font-mono">{count}</span>
    )}
  </Link>
)

/* ── Build category tree, sorted by post count ── */
type CategoryNode = Category & { children: CategoryNode[]; postCount: number }

function buildCategoryTree(
  categories: Category[],
  counts: Record<string, number>,
): CategoryNode[] {
  const map = new Map<number, CategoryNode>()
  const roots: CategoryNode[] = []

  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [], postCount: counts[cat.id] || 0 })
  }

  for (const cat of categories) {
    const node = map.get(cat.id)!
    if (cat.parent && typeof cat.parent === 'object' && 'id' in cat.parent) {
      const parentNode = map.get(cat.parent.id)
      if (parentNode) {
        parentNode.children.push(node)
      } else {
        roots.push(node)
      }
    } else {
      roots.push(node)
    }
  }

  function sortTree(nodes: CategoryNode[]) {
    nodes.sort((a, b) => b.postCount - a.postCount)
    for (const node of nodes) {
      sortTree(node.children)
    }
  }
  sortTree(roots)

  return roots
}

function flattenTree(
  nodes: CategoryNode[],
  depth = 0,
): { cat: Category; depth: number; postCount: number }[] {
  const result: { cat: Category; depth: number; postCount: number }[] = []
  for (const node of nodes) {
    result.push({ cat: node, depth, postCount: node.postCount })
    if (node.children.length > 0) {
      result.push(...flattenTree(node.children, depth + 1))
    }
  }
  return result
}

/* ── Page ── */
export default async function AllPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>
}) {
  const { category: categoryId, page: pageParam } = await searchParams
  const page = Number(pageParam) || 1
  const limit = 50

  const payload = await getPayload({ config: configPromise })

  const categoriesResult = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'title',
  })
  const allCategories = categoriesResult.docs as Category[]

  const allPublishedPosts = await payload.find({
    collection: 'posts',
    limit: 500,
    where: { _status: { equals: 'published' } },
    depth: 0,
    select: { categories: true },
  })

  const totalPublishedPosts = allPublishedPosts.docs.length

  const categoryPostCounts: Record<string, number> = {}
  for (const post of allPublishedPosts.docs) {
    if (!post.categories) continue
    const cats = Array.isArray(post.categories)
      ? post.categories
      : [post.categories]
    for (const cat of cats) {
      const catId = typeof cat === 'number' ? cat : (cat as { id: number }).id
      if (catId !== undefined && catId !== null) {
        categoryPostCounts[catId] = (categoryPostCounts[catId] || 0) + 1
      }
    }
  }

  const categoryTree = buildCategoryTree(allCategories, categoryPostCounts)
  const orderedCategories = flattenTree(categoryTree)

  const where: any = {
    _status: { equals: 'published' as const },
  }

  if (categoryId) {
    where.categories = { equals: Number(categoryId) }
  }

  const posts = await payload.find({
    collection: 'posts',
    limit,
    page,
    sort: '-publishedAt',
    where,
    depth: 1,
  })

  const DESKTOP_SHOWN = 10
  const MOBILE_SHOWN = 3

  const desktopVisible = orderedCategories.slice(0, DESKTOP_SHOWN)
  const extraCategories = orderedCategories.slice(DESKTOP_SHOWN)

  const mobileAlways = desktopVisible.slice(0, MOBILE_SHOWN)
  const mobileTucked = desktopVisible.slice(MOBILE_SHOWN)

  const baseUrl = categoryId ? `/archive?category=${categoryId}&` : '/archive?'

  return (
    <div className="relative min-h-screen bg-white dark:bg-black p-2 sm:p-4 md:p-6 lg:p-8">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{ backgroundImage: 'url(/landing-dark.svg)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-full bg-white dark:bg-black border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#555555] sm:border-2 md:border-4 md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:md:shadow-[12px_12px_0px_0px_#555555] min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">
        <NavBar />

        <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
          <div className="mb-10 pb-8 border-b-2 border-black dark:border-white">
            <h1 className="text-5xl font-black mb-4 tracking-tight">All Posts</h1>
            <p className="text-base leading-relaxed max-w-3xl text-gray-600 dark:text-gray-400">
              Because Birds is a birding website ran by Jeff Mann since 2013.
            </p>
            <br />
            <p className="text-base leading-relaxed max-w-3xl text-gray-600 dark:text-gray-400">
              Browse through my posts about birding, birdsong recording, photography, technology, travel, and more.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <aside className="lg:col-span-1 order-first lg:order-none">
              {allCategories.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-black uppercase tracking-wider mb-3">Categories</h3>
                  <div className="flex flex-col gap-2">
                    <FilterLink
                      label="All Posts"
                      active={!categoryId}
                      href="/archive"
                      count={totalPublishedPosts}
                    />
                    {mobileAlways.map(({ cat, depth, postCount }) => (
                      <FilterLink
                        key={cat.id}
                        label={cat.title || cat.id?.toString() || 'Untitled'}
                        active={categoryId === String(cat.id)}
                        href={`/archive?category=${cat.id}`}
                        count={postCount}
                        indent={depth}
                      />
                    ))}
                    {mobileTucked.map(({ cat, depth, postCount }) => (
                      <div className="hidden sm:block" key={cat.id}>
                        <FilterLink
                          label={cat.title || cat.id?.toString() || 'Untitled'}
                          active={categoryId === String(cat.id)}
                          href={`/archive?category=${cat.id}`}
                          count={postCount}
                          indent={depth}
                        />
                      </div>
                    ))}
                    {(mobileTucked.length + extraCategories.length) > 0 && (
                      <details className="sm:hidden group">
                        <summary className="cursor-pointer text-xs font-bold text-gray-400 dark:text-gray-500 mt-1 pl-1 list-none hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                          <span className="group-open:hidden">+{mobileTucked.length + extraCategories.length} more categories</span>
                          <span className="hidden group-open:inline">▲ Show less</span>
                        </summary>
                        <div className="flex flex-col gap-2 mt-2">
                          {mobileTucked.map(({ cat, depth, postCount }) => (
                            <FilterLink
                              key={cat.id}
                              label={cat.title || cat.id?.toString() || 'Untitled'}
                              active={categoryId === String(cat.id)}
                              href={`/archive?category=${cat.id}`}
                              count={postCount}
                              indent={depth}
                            />
                          ))}
                          {extraCategories.map(({ cat, depth, postCount }) => (
                            <FilterLink
                              key={cat.id}
                              label={cat.title || cat.id?.toString() || 'Untitled'}
                              active={categoryId === String(cat.id)}
                              href={`/archive?category=${cat.id}`}
                              count={postCount}
                              indent={depth}
                            />
                          ))}
                        </div>
                      </details>
                    )}
                    {extraCategories.length > 0 && (
                      <details className="hidden sm:block group">
                        <summary className="cursor-pointer text-xs font-bold text-gray-400 dark:text-gray-500 mt-1 pl-1 list-none hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                          <span className="group-open:hidden">+{extraCategories.length} more categories</span>
                          <span className="hidden group-open:inline">▲ Show less</span>
                        </summary>
                        <div className="flex flex-col gap-2 mt-2">
                          {extraCategories.map(({ cat, depth, postCount }) => (
                            <FilterLink
                              key={cat.id}
                              label={cat.title || cat.id?.toString() || 'Untitled'}
                              active={categoryId === String(cat.id)}
                              href={`/archive?category=${cat.id}`}
                              count={postCount}
                              indent={depth}
                            />
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              )}
            </aside>

            <div className="lg:col-span-3">
              {posts.docs.length > 0 ? (
                <div>
                  {posts.docs.map((post) => (
                    <PostListItem key={post.id} post={post} />
                  ))}

                  {/* Pagination Controls */}
                  {(posts.hasNextPage || posts.hasPrevPage) && (
                    <div className="flex justify-between items-center mt-8 pt-8 border-t-2 border-black dark:border-white">
                      {posts.hasPrevPage ? (
                        <Link href={`${baseUrl}page=${posts.prevPage}`} className="font-black hover:underline">← Previous</Link>
                      ) : <div />}

                      <span className="text-sm font-bold text-gray-500">Page {posts.page} of {posts.totalPages}</span>

                      {posts.hasNextPage ? (
                        <Link href={`${baseUrl}page=${posts.nextPage}`} className="font-black hover:underline">Next →</Link>
                      ) : <div />}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-2xl font-black mb-2">No posts found</p>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                    Try a different filter combination.
                  </p>
                </div>
              )}

              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-6 text-right">
                Showing {posts.docs.length} post{posts.docs.length !== 1 ? 's' : ''}
                {categoryId ? ' (filtered)' : ''}
              </p>
            </div>
          </div>
        </main>

        <footer className="border-t-2 border-black dark:border-white mt-16">
          <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm font-bold">
            <p>© 2026 becausebirds. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
