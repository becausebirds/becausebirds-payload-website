import BirdChecklistExplorer from '@/components/BirdChecklistExplorer'

export const dynamic = 'force-dynamic'

export default async function BirdChecklistPage() {
  return (
    <main className="w-full overflow-x-hidden">
      <BirdChecklistExplorer />
    </main>
  )
}