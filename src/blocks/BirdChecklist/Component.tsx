import {
  Calendar,
  Clock,
  MapPin,
  Bird,
  Pencil,
  Binoculars,
  Tally5,
  ExternalLink,
  Maximize2,
  Globe,
  Link,
} from 'lucide-react'
import ChecklistMapClient from './ChecklistMapClient'
import { SpeciesListClient } from './SpeciesListClient'

interface BirdChecklistComponentProps {
  checklist: string | { id: string }
  showMap?: boolean
  showFullSpeciesList?: boolean
  disableInnerContainer?: boolean
  minimized?: boolean
}

interface Species {
  commonName: string
  scientificName: string
  count: string
  comments?: string
}

interface TrackPoint {
  lat: number
  lng: number
  timestamp?: string
}

async function getChecklist(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/bird-checklists/${id}`,
    { next: { revalidate: 60 } },
  )
  if (!res.ok) return null
  return res.json()
}

export default async function BirdChecklistComponent({
  checklist,
  showMap = true,
  showFullSpeciesList = true,
  disableInnerContainer = false,
  minimized = false,
}: BirdChecklistComponentProps) {
  const checklistId = typeof checklist === 'string' ? checklist : checklist?.id

  if (!checklistId) {
    return (
      <div className="rounded-lg border-2 border-black bg-amber-50 p-6 text-center font-bold text-amber-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        No checklist selected.
      </div>
    )
  }

  const c = await getChecklist(checklistId)

  if (!c) {
    return (
      <div className="rounded-lg border-2 border-black bg-amber-50 p-6 text-center font-bold text-amber-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        Could not load checklist.
      </div>
    )
  }

  const species: Species[] = c.species ?? []
  const trackPoints: TrackPoint[] = c.gpsTrack ?? []
  const totalSpecies = c.speciesCount ?? species.length
  const totalCount = species.reduce(
    (sum: number, s: Species) => sum + (parseInt(s.count, 10) || 0),
    0,
  )

  const containerClass = disableInnerContainer ? '' : 'mx-auto max-w-4xl'

  // ── Minimized View ──────────────────────────────────────────
  if (minimized) {
    return (
      <div className={`my-6 ${containerClass}`}>
        <div className="border-2 border-black bg-background text-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          {/* ── HEADER (compact) ── */}
          <div className="border-b-2 border-black bg-gray-500 px-4 py-3 md:px-5 md:py-4 text-white">
            <h2 className="flex items-center gap-2 mt-0 text-lg font-black tracking-tight uppercase text-gray-200 md:text-3xl">
              <Bird className="h-6 w-6 md:h-7 md:w-7" />
              Bird Checklist
            </h2>

            {/* Hero Stats */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 border-2 border-black bg-emerald-300 px-3 py-2 font-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:px-4 md:py-2.5">
                <Binoculars className="h-5 w-5" />
                <span className="text-xl md:text-2xl">{totalSpecies}</span>
                <span className="text-xs md:text-sm">species</span>
              </div>
              <div className="inline-flex items-center gap-2 border-2 border-black bg-sky-300 px-3 py-2 font-bold text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:px-4 md:py-2.5">
                <Tally5 className="h-5 w-5" />
                <span className="text-xl md:text-2xl">{totalCount}</span>
                <span className="text-xs md:text-sm">individuals</span>
              </div>
            </div>

            {/* Location */}
            {c.locationName && (
              <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold md:text-sm">
                <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4" />
                {c.locationId ? (
                  <a
                    href={`https://ebird.org/hotspot/${c.locationId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-white hover:text-blue-300"
                  >
                    {c.locationName}
                  </a>
                ) : (
                  c.locationName
                )}
                {c.region && <> {c.region}</>}
              </p>
            )}

            {/* Date / Time */}
            {c.date && (
              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold md:text-sm">
                <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                {new Date(c.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                {c.startTime && <> {c.startTime}</>}
              </p>
            )}

            {/* Effort Badges */}
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
              {c.protocol && (
                <span className="rounded-md border-2 border-black bg-purple-200 text-black px-2.5 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {c.protocol}
                </span>
              )}
              {c.duration && (
                <span className="rounded-md border-2 border-black bg-orange-200 text-black px-2.5 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {c.duration} min
                </span>
              )}
              {c.distance && (
                <span className="rounded-md border-2 border-black bg-cyan-200 text-black px-2.5 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {c.distance} mi
                </span>
              )}
            </div>
          </div>

          {/* ── BODY — small map preview + expand button ── */}
          <div className="bg-gray-100 px-5 pt-4 pb-4 md:p-6">
            {/* Small Map Clipped Preview */}
            {(showMap && trackPoints.length > 1) ||
            (showMap && trackPoints.length === 1 && c.latitude && c.longitude) ?
              (
                <div className="overflow-hidden rounded-lg border-2 border-black bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {/* We force a small height here to create the "truncated" effect */}
                  <div className="h-36 md:h-44 [&_div]:!h-full [&_div]:!min-h-0">
                    {trackPoints.length > 1 ? (
                      <ChecklistMapClient trackPoints={trackPoints} />
                    ) : (
                      <ChecklistMapClient
                        trackPoints={[
                          { lat: c.latitude, lng: c.longitude },
                          { lat: c.latitude + 0.001, lng: c.longitude + 0.001 },
                        ]}
                      />
                    )}
                  </div>
                </div>
              ) : null}

            {/* Expand Checklist Button */}
            <div className="mt-4 text-center">
              <a
                href={`https://ebird.org/checklist/${checklistId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-blue-500 px-5 py-3 font-bold text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-blue-600 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                <Maximize2 className="h-4 w-4" />
                Expand Checklist
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Full View ──────────────────────────────────────────────
  return (
    <div className={`my-6 ${containerClass}`}>
      <div className="border-2 border-black bg-background text-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="border-b-2 border-black bg-gray-500 px-5 py-4 md:px-6 md:py-5 text-white">
          <h2 className="flex items-center gap-2 mt-0 text-lg font-black tracking-tight uppercase text-gray-200 md:text-3xl">
            <Bird className="h-6 w-6 md:h-7 md:w-7" />
            Bird Checklist
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 border-2 border-black bg-emerald-300 px-3 py-2 font-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:px-4 md:py-2.5">
                <Binoculars className="h-5 w-5" />
                <span className="text-xl md:text-2xl">{totalSpecies}</span>
                <span className="text-xs md:text-sm">species</span>
            </div>
            <div className="inline-flex items-center gap-2 border-2 border-black bg-sky-300 px-3 py-2 font-bold text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:px-4 md:py-2.5">
                <Tally5 className="h-5 w-5" />
                <span className="text-xl md:text-2xl">{totalCount}</span>
                <span className="text-xs md:text-sm">individuals</span>
            </div>
          </div>

          {c.locationName && (
            <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold md:text-sm">
              <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4" />
              {c.locationId ? (
                <a
                  href={`https://ebird.org/hotspot/${c.locationId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-white hover:text-blue-300"
                >
                  {c.locationName}
                </a>
              ) : (
                c.locationName
              )}
              <Globe className="h-3.5 w-3.5 md:h-4 md:w-4" />
              {c.region && <> {c.region}</>}
            </p>
          )}
          {c.date && (
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold md:text-sm">
              <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
              {new Date(c.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
              {c.startTime && <> {c.startTime}</>}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            {c.protocol && (
              <span className="rounded-md border-2 border-black bg-purple-200 text-black px-2.5 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {c.protocol}
              </span>
            )}
            {c.duration && (
              <span className="rounded-md border-2 border-black bg-orange-200 text-black px-2.5 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {c.duration} min
              </span>
            )}
            {c.distance && (
              <span className="rounded-md border-2 border-black bg-cyan-200 text-black px-2.5 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {c.distance} mi
              </span>
            )}
          </div>
        </div>

        <div className="bg-gray-200 dark:bg-gray-800 px-5 pt-4 pb-2 md:p-6">
          {showMap && trackPoints.length > 1 && (
            <div className="mb-6 overflow-hidden rounded-lg border-2 border-black bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <ChecklistMapClient trackPoints={trackPoints} />
            </div>
          )}

          {showMap && trackPoints.length === 1 && c.latitude && c.longitude && (
            <div className="mb-6 overflow-hidden rounded-lg border-2 border-black bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <ChecklistMapClient
                trackPoints={[
                  { lat: c.latitude, lng: c.longitude },
                  { lat: c.latitude + 0.001, lng: c.longitude + 0.001 },
                ]}
              />
            </div>
          )}

          {showFullSpeciesList && species.length > 0 && (
            <SpeciesListClient species={species} />
          )}

          {showFullSpeciesList && species.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-black bg-background p-8 text-center text-sm font-bold text-gray-400">
              <Bird className="mx-auto mb-2 h-6 w-6" />
              No species data available for this checklist.
            </div>
          )}

          {c.notes && (
            <div className="mt-6 rounded-lg border-2 border-black bg-amber-100 dark:bg-taupe-400 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="mb-2 flex items-center gap-2 text-xs text-black uppercase tracking-wider">
                <Pencil className="h-4 w-4" />
                Notes
              </span>
              <p className="whitespace-pre-wrap text-sm text-black font-medium">{c.notes}</p>
            </div>
          )}

          <div className="mt-2 text-center">
            <a
              href={`/bird-checklist/${c.ebirdChecklistId}`}
              target=""
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs underline font-bold text-foreground"
            >
            Permalink
            <Link className="h-3 w-3" /> 
            </a><span className="px-3">|</span>
            <a
              href={`https://ebird.org/checklist/${c.ebirdChecklistId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs underline font-bold text-foreground"
            >
              eBird
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
