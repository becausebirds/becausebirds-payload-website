'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react'
import Image from 'next/image'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import {
  Dialog,
  DialogContent,
  DialogClose,
} from '@/components/ui/dialog'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

/* ─── Types ─── */

export type LightboxItem = {
  src: string
  alt: string
  width: number
  height: number
}

type LightboxCtx = {
  open: (item: LightboxItem) => void
  close: () => void
  registerImages: (id: string, items: LightboxItem[]) => void
  unregisterImages: (id: string) => void
}

/* ─── Context ─── */

const LightboxContext = createContext<LightboxCtx>({
  open: () => {},
  close: () => {},
  registerImages: () => {},
  unregisterImages: () => {},
})

export const useLightbox = () => useContext(LightboxContext)

/* ─── Provider ─── */

export const LightboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<LightboxItem[]>([])
  const [index, setIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  // ── Registry for cross-block navigation ──
  const [registrations, setRegistrations] = useState<Record<string, LightboxItem[]>>({})

  const registerImages = useCallback((id: string, imageItems: LightboxItem[]) => {
    setRegistrations((prev) => ({ ...prev, [id]: imageItems }))
  }, [])

  const unregisterImages = useCallback((id: string) => {
    setRegistrations((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const allImageItems = useMemo(
    () => Object.values(registrations).flat(),
    [registrations],
  )

  // ── Open ──
  const open = useCallback(
    (item: LightboxItem) => {
      const list = allImageItems.length > 0 ? allImageItems : [item]
      setItems(list)
      setIndex(list.findIndex((i) => i.src === item.src))
      setIsOpen(true)
    },
    [allImageItems],
  )

  const close = useCallback(() => setIsOpen(false), [])

  // ── Navigation ──
  const goTo = useCallback(
    (dir: -1 | 1) => {
      setIndex((prev) => {
        const next = prev + dir
        if (next < 0) return items.length - 1
        if (next >= items.length) return 0
        return next
      })
    },
    [items.length],
  )

  // ── Keyboard arrows ──
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goTo(-1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goTo(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, goTo])

  const current = items[index]

  return (
    <LightboxContext.Provider value={{ open, close, registerImages, unregisterImages }}>
      {children}

      <Dialog open={isOpen} onOpenChange={(v) => { if (!v) setIsOpen(false) }}>
        <LightboxDialogContent
          item={current}
          totalItems={items.length}
          currentIndex={index}
          hasPrev={items.length > 1}
          hasNext={items.length > 1}
          onPrev={() => goTo(-1)}
          onNext={() => goTo(1)}
          onClose={close}
        />
      </Dialog>
    </LightboxContext.Provider>
  )
}

/* ─── Dialog content with swipe support ─── */

const SWIPE_THRESHOLD = 100

const LightboxDialogContent: React.FC<{
  item?: LightboxItem
  totalItems: number
  currentIndex: number
  hasPrev: boolean
  hasNext: boolean
  onPrev: () => void
  onNext: () => void
  onClose: () => void
}> = ({ item, totalItems, currentIndex, hasPrev, hasNext, onPrev, onNext, onClose }) => {
  const startY = useRef(0)
  const currentY = useRef(0)
  const [offsetY, setOffsetY] = useState(0)

  if (!item) return null

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
    currentY.current = e.touches[0].clientY
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY
    const diff = currentY.current - startY.current
    if (diff > 0) setOffsetY(diff * 0.4)
  }
  const handleTouchEnd = () => {
    const diff = currentY.current - startY.current
    if (diff > SWIPE_THRESHOLD) onClose()
    setOffsetY(0)
  }

  return (
    <DialogContent
      className="!max-w-[95vw] !w-[95vw] !max-h-[95vh] !h-[95vh] p-0 bg-black/65 border-2 border-white/20 !rounded-none overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={offsetY > 0 ? { transform: `translateY(${offsetY}px)` } : undefined}
    >
      {/* ═══ Click black background → closes ═══ */}
      <div
        className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
        onClick={onClose}
      >
        {/* Image — stops propagation so clicking the image doesn't close */}
        <div
          className="flex items-center justify-center w-full h-full p-6 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative flex items-center justify-center w-full h-full max-w-full max-h-full">
            <Image
  src={item.src}
  alt={item.alt}
  fill
  className="object-contain rounded"
  sizes="95vw"
  priority
/>
          </div>
        </div>
      </div>

      {/* ═══ Desktop: X + "Close" button in top-right corner ═══ */}
      <DialogClose asChild>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50
                     hidden md:flex items-center gap-2
                     px-4 py-2.5 rounded-full
                     bg-black/70 text-white/90 text-sm
                     hover:bg-black/90 hover:text-white
                     active:bg-black
                     transition-colors border border-white/30
                     shadow-lg"
          aria-label="Close lightbox"
        >
          <X className="h-4 w-4" />
          <span>Close</span>
        </button>
      </DialogClose>

      {/* ═══ Mobile: Bottom close button only ═══ */}
      <button
        onClick={onClose}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50
                   flex md:hidden items-center gap-2
                   px-5 py-2.5 rounded-full
                   bg-black/60 text-white/80 text-xs
                   hover:bg-black/80 hover:text-white
                   transition-colors border border-white/20"
        aria-label="Close lightbox"
      >
        <X className="h-4 w-4" />
        <span>Close</span>
      </button>

      {/* Prev / Next arrows */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-50
                     w-11 h-11 md:w-10 md:h-10
                     flex items-center justify-center
                     rounded-full bg-black/60 text-white
                     hover:bg-black/80 transition-colors border border-white/20"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext() }}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-50
                     w-11 h-11 md:w-10 md:h-10
                     flex items-center justify-center
                     rounded-full bg-black/60 text-white
                     hover:bg-black/80 transition-colors border border-white/20"
          aria-label="Next image"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* ═══ Image counter indicator ═══ */}
      {totalItems > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50
                        bg-black/50 text-white/70 text-xs px-3 py-1 rounded-full
                        border border-white/10">
          {currentIndex + 1} / {totalItems}
        </div>
      )}
    </DialogContent>
  )
}
