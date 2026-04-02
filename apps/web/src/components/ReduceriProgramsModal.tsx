import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getReduceriTranslations, type ReducereProgram } from '../i18n/reduceri'
import type { LangCode } from '../i18n/menu'
import { getPublicReducerePrograms, type ReducereProgramRow } from '../lib/api'
import { ReduceriProgramCard } from './reduceri/ReduceriProgramCard'
import { ReduceriProgramCardSkeleton } from './reduceri/ReduceriProgramCardSkeleton'

function rowToProgram(p: ReducereProgramRow): ReducereProgram {
  const { id: _id, locale: _loc, sortOrder: _so, ...rest } = p
  return rest
}

function normProgramLabel(s: string): string {
  return s.replace(/^PROGRAMUL\s*/i, '').trim().toLowerCase()
}

function matchDiscountOptionId(
  program: ReducereProgram,
  options: { id: string; programLabel: string; discountPercent: number }[],
): string | null {
  const pct = program.discountPercent
  if (pct == null || !Number.isFinite(Number(pct))) return null
  const pl = normProgramLabel(program.programLabel)
  const exact = options.find(
    (o) => normProgramLabel(o.programLabel) === pl && o.discountPercent === pct,
  )
  if (exact) return exact.id
  const samePct = options.filter((o) => o.discountPercent === pct)
  if (samePct.length === 1) return samePct[0].id
  return null
}

const SKELETON_COUNT = 4

type ApplyMode = {
  discountOptions: { id: string; programLabel: string; discountPercent: number }[]
  onApply: (id: string) => void
  applyLabel: string
}

type Props = {
  lang: LangCode
  onClose: () => void
  closeLabel: string
  applyMode?: ApplyMode
}

export default function ReduceriProgramsModal({ lang, onClose, closeLabel, applyMode }: Props) {
  const reduceriTr = getReduceriTranslations(lang)
  const [programs, setPrograms] = useState<ReducereProgram[] | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const loading = programs === null

  useEffect(() => {
    let cancelled = false
    setPrograms(null)
    const fallback = getReduceriTranslations(lang).programs
    getPublicReducerePrograms(lang)
      .then((rows) => {
        if (cancelled) return
        setPrograms(rows.length > 0 ? rows.map(rowToProgram) : fallback)
      })
      .catch(() => {
        if (!cancelled) setPrograms(fallback)
      })
    return () => {
      cancelled = true
    }
  }, [lang])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const panel = (
    <article
      role="dialog"
      aria-modal="true"
      aria-labelledby="reduceri-programs-modal-title"
      aria-busy={loading}
      className="box-border w-full max-w-[min(100%,calc(21rem+5rem))] bg-white shadow-2xl sm:max-w-[min(100%,calc(42rem+1.25rem+5rem))]"
      style={{ borderRadius: 10, overflow: 'hidden' }}
      onClick={(e) => e.stopPropagation()}
    >
      <header className="relative border-b border-neutral-100 px-[40px] pb-6 pt-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-[40px] top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          aria-label={closeLabel}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="pr-12 text-center sm:pr-14">
          <h2
            id="reduceri-programs-modal-title"
            className="break-words font-['Inter'] text-lg font-bold leading-tight text-black sm:text-2xl"
          >
            {reduceriTr.heroTitle}
          </h2>
          <p className="mt-2 font-['Inter'] text-sm leading-relaxed text-gray-600 sm:mt-3 sm:text-base">
            {reduceriTr.heroSubtitle}
          </p>
        </div>
      </header>

      <div className="p-[40px]">
        <div
          className="grid grid-cols-1 justify-items-center gap-[20px] sm:grid-cols-2"
          aria-live={loading ? 'polite' : undefined}
        >
          {loading
            ? Array.from({ length: SKELETON_COUNT }, (_, i) => (
                <div key={`sk-${i}`} className="flex w-full max-w-[21rem] flex-col">
                  <ReduceriProgramCardSkeleton />
                </div>
              ))
            : (programs ?? []).map((program, i) => {
                const optionId = applyMode
                  ? matchDiscountOptionId(program, applyMode.discountOptions)
                  : null
                const hoverApply =
                  applyMode && optionId
                    ? {
                        label: applyMode.applyLabel,
                        onApply: () => {
                          applyMode.onApply(optionId)
                          onClose()
                        },
                      }
                    : undefined

                return (
                  <div key={`${program.programLabel}-${i}`} className="flex w-full max-w-[21rem] flex-col">
                    <ReduceriProgramCard
                      program={program}
                      hideCta
                      selectable={false}
                      selected={false}
                      hoverApply={hoverApply}
                    />
                  </div>
                )
              })}
        </div>
      </div>
    </article>
  )

  const modal = (
    <div
      className="fixed inset-0 z-[80] overflow-y-auto overflow-x-hidden overscroll-contain bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
        {panel}
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modal, document.body)
}
