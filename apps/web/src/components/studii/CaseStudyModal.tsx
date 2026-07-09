import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MapPin, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { resolvePublicImageUrl } from '../../lib/productCaseStudies'
import type { CaseStudyCardSpec } from './CaseStudyCard'

export type CaseStudyModalItem = {
  category: string
  title: string
  location: string
  description: string
  image: string
  imageAlt: string
  images: string[]
  specs: CaseStudyCardSpec[]
  tags: string[]
}

type Props = {
  item: CaseStudyModalItem | null
  onClose: () => void
}

export default function CaseStudyModal({ item, onClose }: Props) {
  const [activeImg, setActiveImg] = useState(0)
  const prevItemRef = useRef<string | null>(null)

  // Reset image index when a different case study is opened
  useEffect(() => {
    if (item && item.title !== prevItemRef.current) {
      setActiveImg(0)
      prevItemRef.current = item.title
    }
  }, [item])

  // Close on Escape
  useEffect(() => {
    if (!item) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setActiveImg((i) => Math.max(0, i - 1))
      if (e.key === 'ArrowRight' && item.images.length > 1)
        setActiveImg((i) => Math.min(item.images.length - 1, i + 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [item, onClose])

  // Prevent body scroll while open
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [item])

  if (!item) return null

  const images = (item.images.length > 0 ? item.images : [item.image]).map(resolvePublicImageUrl)
  const currentImage = images[activeImg] ?? images[0]
  const hasMultiple = images.length > 1

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <div
        className="relative flex w-full max-h-[92dvh] flex-col overflow-hidden rounded-t-[20px] bg-white shadow-2xl animate-slide-up-from-bottom sm:max-h-[90vh] sm:max-w-4xl sm:rounded-2xl lg:flex-row"
        style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 justify-center pt-2.5 pb-0 sm:hidden" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-neutral-300" />
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors sm:top-3"
          aria-label="Închide"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image panel */}
        <div className="relative flex w-full shrink-0 flex-col bg-neutral-900 max-sm:max-h-[42dvh] lg:w-[52%] lg:min-h-0 lg:max-h-[90vh]">
          <div className="relative flex aspect-[4/3] w-full min-h-0 flex-1 items-center justify-center overflow-hidden p-2 max-sm:aspect-auto max-sm:max-h-[38dvh] lg:aspect-auto lg:min-h-[240px]">
            <img
              key={currentImage}
              src={currentImage}
              alt={item.imageAlt}
              className="max-h-full max-w-full object-contain"
            />

            {/* Prev / next arrows */}
            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImg((i) => Math.max(0, i - 1))}
                  disabled={activeImg === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white disabled:opacity-30 hover:bg-black/70 transition-colors"
                  aria-label="Imaginea anterioară"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImg((i) => Math.min(images.length - 1, i + 1))}
                  disabled={activeImg === images.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white disabled:opacity-30 hover:bg-black/70 transition-colors"
                  aria-label="Imaginea următoare"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Dot indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImg(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === activeImg ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                      }`}
                      aria-label={`Imaginea ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {hasMultiple && (
            <div className="flex gap-2 overflow-x-auto bg-neutral-900 px-3 py-2 scrollbar-none">
              {images.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  className={`shrink-0 h-14 w-20 overflow-hidden rounded-md border-2 transition-colors ${
                    i === activeImg ? 'border-white' : 'border-transparent opacity-60 hover:opacity-90'
                  }`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details panel */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-5 pb-6 sm:p-6 lg:p-8">
          {/* Category badge */}
          <span className="mb-4 inline-flex w-fit rounded-md bg-sky-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-sky-900 font-['Inter']">
            {item.category}
          </span>

          {/* Title */}
          <h2 className="m-0 mb-2 text-xl font-extrabold leading-snug text-slate-900 font-['Inter'] sm:text-2xl">
            {item.title}
          </h2>

          {/* Location */}
          {item.location && (
            <p className="m-0 mb-5 inline-flex items-center gap-1.5 text-sm text-neutral-500 font-['Inter']">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden />
              <span>{item.location}</span>
            </p>
          )}

          {/* Specs grid */}
          {item.specs.length > 0 && (
            <div className="mb-5 grid grid-cols-2 gap-2.5">
              {item.specs.slice(0, 4).map((spec) => (
                <div
                  key={`${spec.label}-${spec.value}`}
                  className="min-w-0 rounded-lg bg-neutral-100 px-3 py-2.5"
                >
                  <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-400 font-['Inter'] sm:text-[11px]">
                    {spec.label}
                  </p>
                  <p
                    className={`m-0 mt-1 text-sm font-bold leading-tight font-['Inter'] sm:text-[15px] ${
                      spec.highlight ? 'text-sky-900' : 'text-slate-900'
                    }`}
                  >
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {item.description && (
            <p className="m-0 mb-5 text-sm leading-relaxed text-neutral-700 font-['Inter'] whitespace-pre-line">
              {item.description}
            </p>
          )}

          {/* Tags */}
          {item.tags.length > 0 && (
            <ul className="m-0 mt-auto flex list-none flex-wrap gap-2 p-0 pt-1">
              {item.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600 font-['Inter']"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
