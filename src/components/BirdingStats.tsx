import { Binoculars, ClipboardList, Camera, Mic } from 'lucide-react'

interface StatItem {
  icon: React.ReactNode
  label: string
  value: number
}

const stats: StatItem[] = [
  {
    icon: <Binoculars className="w-5 h-5" />,
    label: 'Species Observed',
    value: 478,
  },
  {
    icon: <ClipboardList className="w-5 h-5" />,
    label: 'Complete Checklists',
    value: 708,
  },
  {
    icon: <Camera className="w-5 h-5" />,
    label: 'Photographed Species',
    value: 350,
  },
  {
    icon: <Mic className="w-5 h-5" />,
    label: 'Recorded Species',
    value: 180,
  },
]

export default function BirdingStats() {
  return (
    <section className="mb-16 lg:mx-16 bg-green-700 border-2 border-black dark:border-white rounded-base p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_#555555]">
      <h2 className="text-2xl font-black mb-5 tracking-tight text-white flex items-center gap-2">
        <span>🐦</span> Jeff&apos;s Birding Stats
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-base p-3 flex flex-col items-center text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_#555555]"
          >
            <div className="text-emerald-700 dark:text-emerald-400 mb-1.5">
              {stat.icon}
            </div>
            <span className="text-xl font-black mb-0.5">
              {stat.value.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest leading-tight">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
