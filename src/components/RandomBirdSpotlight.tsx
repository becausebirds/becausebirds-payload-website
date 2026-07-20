import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { Bird, Shuffle } from 'lucide-react'

export default async function RandomBirdSpotlight() {
  const payload = await getPayload({ config: configPromise })

  // Fetch a manageable set of birds
  const birds = await payload.find({
    collection: 'birds',
    limit: 500,
    depth: 0,
select: {
  comName: true,
  sciName: true,
  familyComName: true,
  slug: true,
},

  })

  if (birds.docs.length === 0) return null

  const randomBird = birds.docs[Math.floor(Math.random() * birds.docs.length)]
  const bird = randomBird as unknown as {
    id: string
    comName: string
    sciName: string
    familyComName?: string | null
    slug: string
  }

  return (
    <section className="mb-12">
      <h2 className="text-4xl font-black mb-6 tracking-tight text-gray-900 dark:text-foreground">
        Random Bird Spotlight
      </h2>
      <Link href={`/birds/${bird.slug}`}>
        <div className="border-2 border-black bg-white dark:bg-card shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_hsl(var(--border))] p-6 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-cyan-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Bird className="h-8 w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black group-hover:underline">
                  {bird.comName}
                </h3>
                <Shuffle className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
              <p className="text-sm italic text-muted-foreground">
                {bird.sciName}
              </p>
              {bird.familyComName && (
                <p className="mt-1 inline-block rounded-md border-2 border-black bg-purple-100 dark:bg-purple-900 px-2.5 py-0.5 text-xs font-bold shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                  {bird.familyComName}
                </p>
              )}
              <p className="mt-3 text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                View species page →
              </p>
            </div>
          </div>
        </div>
      </Link>
    </section>
  )
}
