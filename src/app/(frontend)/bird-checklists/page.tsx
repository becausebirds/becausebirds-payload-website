//bird-checklists/page.tsx
import BirdChecklistExplorer from '@/components/BirdChecklistExplorer'
import NavBar from '@/components/navbar'
import Footer from '@/components/Footer'
import RecentChecklists from '@/components/RecentChecklists'

export const dynamic = 'force-static'
export const revalidate = false

export default async function BirdChecklistPage() {
  return (
    <main className="w-full overflow-x-hidden">
      <div className="
        relative
        min-h-screen
        bg-white
        dark:bg-background
        p-2
        sm:p-4
        md:p-6
        lg:p-8
      ">

        <div
          className="
            pointer-events-none
            fixed
            inset-0
            z-0
            bg-cover
            bg-center
            bg-no-repeat
            opacity-100
          "
          style={{ backgroundImage:'url(/landing-dark.svg)' }}
          aria-hidden="true"
        />

        <div
          className="
            relative
            z-10
            mx-auto
            w-full
            max-w-full
            bg-white
            dark:bg-card
            border-2
            border-black
            dark:border-border
            overflow-hidden
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
            dark:shadow-[4px_4px_0px_0px_hsl(var(--border))]
            md:border-4
            md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]
            min-h-[calc(100vh-1rem)]
          "
        >

          <NavBar />

          <BirdChecklistExplorer />
          

          <Footer />

        </div>

      </div>
    </main>
  )
}
