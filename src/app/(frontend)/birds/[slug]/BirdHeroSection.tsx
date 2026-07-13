import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'

interface Bird {
  id: string
  comName: string
  sciName: string
  speciesCode: string
  slug: string
  familyComName?: string | null
  order?: string | null
  description?: string | null
  taxonomicStatus: string
}

export default async function BirdHeroSection({ bird }: { bird: Bird }) {
  // bird is already fetched in the parent page — no re-fetch needed

  return (
    <>
      <Link
        href="/birds"
        className="inline-flex items-center gap-1.5 rounded-lg border-2 font-black dark:text-gray-800 font-foreground border-black bg-green-400 px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:translate-x-px hover:translate-y-px hover:shadow-none"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        View All Birds
      </Link>

      <section className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="border-b-2 border-black bg-lime-100 dark:bg-gray-800 px-5 py-4 md:px-6 md:py-5">
          <h1 className="text-3xl text-gray-800 dark:text-white tracking-tight uppercase md:text-4xl">
            {bird.comName}
          </h1>
          <p className="mt-1 text-lg dark:text-white text-gray-800 italic text-muted-foreground">
            {bird.sciName}
          </p>
          {bird.familyComName && (
            <p className="mt-1 text-sm text-gray-800 dark:text-white font-semibold text-muted-foreground">
              {bird.familyComName}
              {bird.order && <> · {bird.order}</>}
            </p>
          )}
          {bird.taxonomicStatus !== 'current' && (
            <div className="mt-2 inline-block rounded-lg dark:text-white text-gray-800 border-2 border-black bg-yellow-200 px-3 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {bird.taxonomicStatus === 'lumped' ? '🔄 Lumped' : bird.taxonomicStatus === 'split' ? '✂️ Split' : '⛔ Deprecated'}
            </div>
          )}
        </div>
        {bird.description && (
          <div className="p-5 md:p-6">
            <p className="text-sm font-medium leading-relaxed">{bird.description}</p>
          </div>
        )}
        {/* Badges removed here — they'll come with the streaming content */}
      </section>
    </>
  )
}
