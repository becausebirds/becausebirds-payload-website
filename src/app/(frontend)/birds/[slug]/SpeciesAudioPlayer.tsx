'use client'

import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react'
import {
  Play,
  Pause,
  Headphones,
  Calendar,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Star,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface SoundTypeTags {
  song?: boolean | null
  call?: boolean | null
  flightSong?: boolean | null
  flightCall?: boolean | null
  mechanicalSound?: boolean | null
  dawnSong?: boolean | null
  duet?: boolean | null
}

interface ChecklistRef {
  id: string
  date?: string
  locationName?: string | null
  region?: string | null
  county?: string | null
  state?: string | null
}

interface AudioRecordItem {
  id: string
  url?: string | null
  filename?: string | null
  soundTypeTags?: SoundTypeTags | null
  equipment?: {
    recorder?: string | null
    microphone?: string | null
    accessories?: string | null
  } | null
  mediaNotes?: string | null
  rating?: number | null
  checklistId?: string | ChecklistRef | null
}

interface SpeciesAudioPlayerProps {
  recordings: AudioRecordItem[]
}

const SOUND_TYPE_LABELS: Record<string, string> = {
  song: 'Song',
  call: 'Call',
  flightSong: 'Flight Song',
  flightCall: 'Flight Call',
  mechanicalSound: 'Mechanical Sound',
  dawnSong: 'Dawn Song',
  duet: 'Duet',
}

const ITEMS_PER_PAGE = 5
const INCREMENT = 10
const PROGRESS_INTERVAL_MS = 100 // 10fps — smooth enough, 6x fewer renders

function formatDuration(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function getActiveSoundTypes(tags: SoundTypeTags | null | undefined): string[] {
  if (!tags) return []
  return Object.entries(tags)
    .filter(([, val]) => val)
    .map(([key]) => SOUND_TYPE_LABELS[key] ?? key)
}

// ──────────────────────────────────────────────────
// Memoized row so only the playing track re-renders
// ──────────────────────────────────────────────────
const TrackRow = memo(function TrackRow({
  rec,
  isPlaying,
  currentTime,
  playbackDuration,
  progressActive,
  durationLabel,
  onPlayPause,
  baseUrl,
}: {
  rec: AudioRecordItem
  isPlaying: boolean
  currentTime: number
  playbackDuration: number
  progressActive: boolean
  durationLabel: string
  onPlayPause: (id: string, url: string | null | undefined) => void
  baseUrl: string
}) {
  const soundTypes = getActiveSoundTypes(rec.soundTypeTags)

  const progressPct =
    isPlaying && playbackDuration > 0
      ? (currentTime / playbackDuration) * 100
      : 0

  const showProgress = isPlaying || (rec.id === 'currently-playing-placeholder' ? false : false)

  // Actually compute showProgress properly:
  // The isPlaying here is for THIS specific row
  const showProg = isPlaying && progressActive

  const displayTime = isPlaying && progressActive ? currentTime : 0
  const displayProgress = isPlaying && progressActive ? progressPct : 0

  const checklistData =
    typeof rec.checklistId === 'object' && rec.checklistId !== null
      ? (rec.checklistId as ChecklistRef)
      : null

  const checklistDate = checklistData?.date
    ? new Date(checklistData.date).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  const locationParts = [
    checklistData?.locationName,
    checklistData?.county,
    checklistData?.state,
    checklistData?.region,
  ].filter(Boolean)

  return (
    <div
      className={`px-5 py-3 md:px-6 transition-colors ${
        isPlaying ? 'bg-background' : 'hover:bg-accent/20'
      }`}
    >
      <div className="flex items-start gap-3 bg-background">
        {/* Play Button */}
        <button
          onClick={() => onPlayPause(rec.id, rec.url)}
          disabled={!rec.url}
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ${
            isPlaying ? 'bg-red-500' : 'bg-fuchsia-500'
          }`}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="ml-0.5 h-4 w-4 fill-current" />
          )}
        </button>

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Sound Type Tags + Duration + Rating row */}
          <div className="flex flex-wrap items-center gap-2">
            {soundTypes.length > 0 && (
              <>
                {soundTypes.map((type) => (
                  <span
                    key={type}
                    className="inline-block rounded-md border-2 border-black bg-fuchsia-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:text-gray-900"
                  >
                    {type}
                  </span>
                ))}
              </>
            )}
            {durationLabel && (
              <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                <Clock className="h-3 w-3" />
                {durationLabel}
              </span>
            )}
            {rec.rating && (
              <span className="flex items-center gap-0.5">
                {Array.from({ length: rec.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </span>
            )}
          </div>

          {/* Date + Location */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-semibold text-muted-foreground">
            {checklistDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {checklistDate}
              </span>
            )}
            {locationParts.length > 0 && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{locationParts.join(' · ')}</span>
              </span>
            )}
          </div>

          {/* Progress bar (only when playing this track) */}
          {showProg && (
            <div className="flex items-center gap-3 bg-background pt-1">
              <span className="font-mono text-[10px] font-bold text-muted-foreground tabular-nums">
                {formatDuration(displayTime)}
              </span>
              <Progress
                value={displayProgress}
                className="h-2 flex-1 border-2 border-black bg-background [&>div]:bg-fuchsia-500"
              />
              <span className="font-mono text-[10px] font-bold text-muted-foreground tabular-nums">
                {durationLabel}
              </span>
            </div>
          )}

          {/* Equipment + Notes (hidden while progress bar is active) */}
          {!showProg && (
            <>
              {rec.equipment?.recorder && (
                <p className="text-[11px] font-medium text-muted-foreground">
                  {rec.equipment.recorder}
                  {rec.equipment.microphone && <> · {rec.equipment.microphone}</>}
                  {rec.equipment.accessories && <> · {rec.equipment.accessories}</>}
                </p>
              )}
              {rec.mediaNotes && (
                <p className="text-xs italic text-muted-foreground">
                  {rec.mediaNotes}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
})

// ──────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────
export default function SpeciesAudioPlayer({ recordings }: SpeciesAudioPlayerProps) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [durations, setDurations] = useState<Record<string, string>>({})
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackDuration, setPlaybackDuration] = useState(0)
  const [progressActive, setProgressActive] = useState(false)
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const audioCacheRef = useRef<Map<string, HTMLAudioElement>>(new Map())

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

  // Memoize sort so it doesn't re-run on every render
  const sorted = useMemo(
    () => [...recordings].sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1)),
    [recordings],
  )

  const displayed = sorted.slice(0, visibleCount)
  const hasMore = sorted.length > visibleCount
  const isExpanded = visibleCount > ITEMS_PER_PAGE

  // ── Preload & cache audio for visible items ──
  useEffect(() => {
    const cache = audioCacheRef.current
    const currentIds = new Set(displayed.map((r) => r.id))

    // Evict cached elements no longer visible
    cache.forEach((el, id) => {
      if (!currentIds.has(id)) {
        el.pause()
        el.src = ''
        el.load()
        cache.delete(id)
      }
    })

    // Preload new visible items
    displayed.forEach((rec) => {
      if (!rec.url || cache.has(rec.id)) return

      const src = rec.url.startsWith('http') ? rec.url : `${baseUrl}${rec.url}`
      const audio = new Audio()
      audio.preload = 'auto' // full buffer since files are small
      audio.src = src

      audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && isFinite(audio.duration)) {
          setDurations((prev) => ({
            ...prev,
            [rec.id]: formatDuration(audio.duration),
          }))
        }
      })

      cache.set(rec.id, audio)
    })
  }, [displayed, baseUrl])

  // ── Throttled progress tick (10fps instead of 60fps) ──
  useEffect(() => {
    if (!currentlyPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      if (audioRef.current && !audioRef.current.paused) {
        setCurrentTime(audioRef.current.currentTime)
      }
    }, PROGRESS_INTERVAL_MS)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [currentlyPlaying])

  // ── Progress bar visibility with pause cooldown ──
  useEffect(() => {
    if (currentlyPlaying) {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
      setProgressActive(true)
      setCurrentTime(audioRef.current?.currentTime ?? 0)
      setPlaybackDuration(audioRef.current?.duration ?? 0)
    } else {
      pauseTimerRef.current = setTimeout(() => {
        setProgressActive(false)
      }, 3000)
    }

    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
    }
  }, [currentlyPlaying])

  // ── Global cleanup ──
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
      audioRef.current?.pause()
      audioCacheRef.current.forEach((el) => {
        el.pause()
        el.src = ''
      })
      audioCacheRef.current.clear()
    }
  }, [])

  // ── Play / Pause — reuses cached preloaded audio ──
  const handlePlayPause = useCallback(
    (id: string, url: string | null | undefined) => {
      if (!url) return

      if (currentlyPlaying === id) {
        audioRef.current?.pause()
        setCurrentlyPlaying(null)
        return
      }

      // Pause whatever is currently playing
      if (audioRef.current) {
        audioRef.current.pause()
      }

      const src = url.startsWith('http') ? url : `${baseUrl}${url}`

      // Check cache first
      let audio = audioCacheRef.current.get(id)

      if (!audio) {
        // Fallback: create on demand (shouldn't happen if preload works)
        audio = new Audio()
        audio.preload = 'auto'
        audio.src = src
        audioCacheRef.current.set(id, audio)

        audio.addEventListener('loadedmetadata', () => {
          if (audio!.duration && isFinite(audio!.duration)) {
            setPlaybackDuration(audio!.duration)
            setDurations((prev) => ({
              ...prev,
              [id]: formatDuration(audio!.duration),
            }))
          }
        })
      } else {
        // Already cached — synchronously read duration
        if (audio.duration && isFinite(audio.duration)) {
          setPlaybackDuration(audio.duration)
        }
      }

      // Single-use ended handler to avoid accumulation
      const onEnded = () => setCurrentlyPlaying(null)
      audio.addEventListener('ended', onEnded, { once: true })

      audio.play().catch(() => setCurrentlyPlaying(null))
      audioRef.current = audio
      setCurrentlyPlaying(id)
    },
    [currentlyPlaying, baseUrl],
  )

  // ── Empty state ──
  if (recordings.length === 0) {
    return (
      <div className="flex h-[150px] w-full items-center justify-center rounded-lg border-2 border-black bg-white">
        <p className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
          <Headphones className="h-4 w-4" />
          No audio recordings
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="divide-y-2 divide-black bg-background">
        {displayed.map((rec) => (
          <TrackRow
            key={rec.id}
            rec={rec}
            isPlaying={currentlyPlaying === rec.id}
            currentTime={currentTime}
            playbackDuration={playbackDuration}
            progressActive={progressActive}
            durationLabel={durations[rec.id] ?? formatDuration(playbackDuration)}
            onPlayPause={handlePlayPause}
            baseUrl={baseUrl}
          />
        ))}
      </div>

      {/* Show less */}
      {isExpanded && (
        <div className="flex justify-center bg-background p-4 md:p-5">
          <button
            onClick={() => setVisibleCount(ITEMS_PER_PAGE)}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-purple-300 px-5 py-2.5 text-sm font-bold text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            Show less <ChevronUp className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* View more */}
      {hasMore && (
        <div className="flex justify-center bg-background p-4 md:p-5">
          <button
            onClick={() => setVisibleCount((prev) => prev + INCREMENT)}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-emerald-200 px-5 py-2.5 text-sm font-bold text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            View more <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  )
}
