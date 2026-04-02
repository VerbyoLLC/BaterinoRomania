import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { getReduceriTranslations } from '../i18n/reduceri'
import type { LangCode } from '../i18n/menu'
import { ReduceriProgramCard } from './reduceri/ReduceriProgramCard'

type Props = {
  lang: LangCode
  onClose: () => void
  closeLabel: string
  seeFullPageLabel: string
}

export default function ReduceriProgramsModal({ lang, onClose, closeLabel, seeFullPageLabel }: Props) {
  const reduceriTr = getReduceriTranslations(lang)
  const programs = reduceriTr.programs
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

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

  const modal = (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reduceri-programs-modal-title"
    >
      <div
        className="relative w-full max-w-[min(90rem,calc(100vw-1rem))] max-h-[92vh] sm:max-h-[90vh] bg-white rounded-t-[20px] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex items-center justify-between gap-4 p-4 sm:p-6 border-b border-neutral-100 bg-white">
          <h2
            id="reduceri-programs-modal-title"
            className="text-black text-lg sm:text-2xl font-bold font-['Inter'] leading-tight min-w-0 pr-2"
          >
            {reduceriTr.heroTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            aria-label={closeLabel}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 sm:pb-8">
          <p className="text-gray-600 text-sm sm:text-base font-['Inter'] leading-relaxed max-w-3xl mb-5 sm:mb-6">
            {reduceriTr.heroSubtitle}
          </p>

          <div className="flex flex-nowrap gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [-webkit-overflow-scrolling:touch] lg:snap-none lg:overflow-visible lg:gap-4">
            {programs.map((program, i) => (
              <div
                key={i}
                className="min-w-[min(100%,17.5rem)] max-w-[17.5rem] shrink-0 snap-center sm:min-w-[18rem] sm:max-w-[18rem] lg:min-w-0 lg:max-w-none lg:flex-1 lg:shrink"
              >
                <ReduceriProgramCard program={program} hideCta />
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 pt-2 border-t border-neutral-100">
            <Link
              to="/reduceri"
              onClick={onClose}
              className="inline-flex justify-center items-center min-h-12 px-6 rounded-xl bg-slate-900 text-white text-sm font-semibold font-['Inter'] hover:bg-slate-800 transition-colors"
            >
              {seeFullPageLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modal, document.body)
}
