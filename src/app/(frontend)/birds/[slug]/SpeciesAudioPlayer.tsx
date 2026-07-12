'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, Headphones, Calendar, MapPin, Clock } from 'lucide-react'
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

function formatDuration(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function SpeciesAudioPlayer({ recordings }: SpeciesAudioPlayerProps) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [durations, setDurations] = useState<Record<string, string>>({})
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackDuration, setPlaybackDuration] = useState(0)
  const [progressActive, setProgressActive] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null)

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

  // ── Preload all durations on mount ─────────────────────────
  useEffect(() => {
    const els: HTMLAudioElement[] = []

    recordings.forEach((rec) => {
      if (!rec.url) return
      const src = rec.url.startsWith('http') ? rec.url : `${baseUrl}${rec.url}`

      const audio = new Audio()
      audio.preload = 'metadata'
      audio.src = src

      audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && isFinite(audio.duration)) {
          setDurations((prev) => ({
            ...prev,
            [rec.id]: formatDuration(audio.duration),
          }))
        }
      })

      els.push(audio)
    })

    return () => {
      els.forEach((a) => a.remove())
    }
  }, [recordings, baseUrl])

  // ── Smooth progress loop (runs whenever currentlyPlaying changes) ──
  useEffect(() => {
    if (!currentlyPlaying) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = null
      }
      return
    }

    const tick = () => {
      if (audioRef.current && !audioRef.current.paused) {
        setCurrentTime(audioRef.current.currentTime)
      }
      animFrameRef.current = requestAnimationFrame(tick)
    }
    animFrameRef.current = requestAnimationFrame(tick)

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = null
      }
    }
  }, [currentlyPlaying])

  // ── Show/hide progress bar on play/pause with cooldown ──────
  useEffect(() => {
    if (currentlyPlaying) {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
      setProgressActive(true)
      setCurrentTime(audioRef.current?.currentTime ?? 0)
      setPlaybackDuration(audioRef.current?.duration ?? 0)
    } else {
      // Keep progress bar visible for 3 seconds after pause, then fade to equipment
      pauseTimerRef.current = setTimeout(() => {
        setProgressActive(false)
      }, 3000)
    }

    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
    }
  }, [currentlyPlaying])

  // ── Cleanup on unmount ──────────────────────────────────────
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
      audioRef.current?.pause()
    }
  }, [])

  // ── Play / Pause ──────────────────────────────────────────
  const handlePlayPause = useCallback(
    (id: string, url: string | null | undefined) => {
      if (!url) return

      const src = url.startsWith('http') ? url : `${baseUrl}${url}`

      if (currentlyPlaying === id) {
        // Pause current
        audioRef.current?.pause()
        setCurrentlyPlaying(null)
      } else {
        // Stop previous
        if (audioRef.current) {
          audioRef.current.pause()
          if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
        }

        const audio = new Audio(src)
        audio.preload = 'metadata'

        audio.addEventListener('loadedmetadata', () => {
          if (audio.duration && isFinite(audio.duration)) {
            setPlaybackDuration(audio.duration)
            setDurations((prev) => ({
              ...prev,
              [id]: formatDuration(audio.duration),
            }))
          }
        })

        audio.addEventListener('ended', () => {
          setCurrentlyPlaying(null)
        })

        audio.play().catch(() => setCurrentlyPlaying(null))
        audioRef.current = audio
        setCurrentlyPlaying(id)
      }
    },
    [currentlyPlaying, baseUrl],
  )

  // ── Helpers ───────────────────────────────────────────────
  const getActiveSoundTypes = (tags: SoundTypeTags | null | undefined): string[] => {
    if (!tags) return []
    return Object.entries(tags)
      .filter(([, val]) => val)
      .map(([key]) => SOUND_TYPE_LABELS[key] ?? key)
  }

  // ── Empty state ───────────────────────────────────────────
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

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {recordings.map((rec) => {
        const soundTypes = getActiveSoundTypes(rec.soundTypeTags)
        const isPlaying = currentlyPlaying === rec.id

        // Progress percentage
        const isActive = isPlaying || (currentlyPlaying === rec.id && progressActive)
        const progressPct =
          isPlaying && playbackDuration > 0
            ? (currentTime / playbackDuration) * 100
            : 0

        // Reset current time when not active
        const displayTime =
          isPlaying || (currentlyPlaying === rec.id && progressActive) ? currentTime : 0
        const displayProgress =
          isPlaying || (currentlyPlaying === rec.id && progressActive) ? progressPct : 0
        const showProgress = currentlyPlaying === rec.id && progressActive

        // Get checklist data
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
            key={rec.id}
            className={`rounded-lg border-2 border-black p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors ${
              isPlaying ? 'bg-fuchsia-100' : 'bg-white'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Play Button */}
              <button
                onClick={() => handlePlayPause(rec.id, rec.url)}
                disabled={!rec.url}
                className={`mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ${
                  isPlaying ? 'bg-red-500' : 'bg-fuchsia-500'
                }`}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="ml-0.5 h-5 w-5 fill-current" />
                )}
              </button>

              {/* Info */}
              <div className="min-w-0 flex-1 space-y-2">
                {/* Sound Type Tags (as badges) */}
                {soundTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {soundTypes.map((type) => (
                      <span
                        key={type}
                        className="inline-block rounded-md border-2 border-black bg-fuchsia-200 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                )}

                {/* Date */}
                {checklistDate && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{checklistDate}</span>
                  </div>
                )}

                {/* Location */}
                {locationParts.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{locationParts.join(' · ')}</span>
                  </div>
                )}

                {/* Track Length + Rating row */}
                <div className="flex items-center gap-3">
                  {durations[rec.id] && (
                    <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{durations[rec.id]}</span>
                    </div>
                  )}

                  {rec.rating && (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: rec.rating }).map((_, i) => (
                        <span key={i} className="text-xs">⭐</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Progress bar (replaces equipment slot when active) */}
                {showProgress ? (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground tabular-nums">
                      {formatDuration(displayTime)}
                    </span>
                    <Progress
                      value={displayProgress}
                      className="h-2 flex-1 border-2 border-black bg-white [&>div]:bg-fuchsia-500"
                    />
                    <span className="text-[10px] font-mono font-bold text-muted-foreground tabular-nums">
                      {durations[rec.id] ?? formatDuration(playbackDuration)}
                    </span>
                  </div>
                ) : (
                  /* Equipment (hidden while progress bar is active) */
                  rec.equipment?.recorder && (
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {rec.equipment.recorder}
                      {rec.equipment.microphone && <> · {rec.equipment.microphone}</>}
                      {rec.equipment.accessories && <> · {rec.equipment.accessories}</>}
                    </p>
                  )
                )}

                {/* Notes */}
                {rec.mediaNotes && (
                  <p className="text-xs italic text-muted-foreground">
                    {rec.mediaNotes}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
