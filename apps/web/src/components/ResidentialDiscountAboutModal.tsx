import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import type { LangCode } from '../i18n/menu'
import { getReduceriTranslations, type ReducereProgram } from '../i18n/reduceri'
import type { ProductDetailTranslations } from '../i18n/product-detail'
import { getTermeniProgrameReducereTranslations } from '../i18n/termeni-programe-reducere'
import { getPublicReducerePrograms, type ReducereProgramRow } from '../lib/api'
import { ReduceriProgramCard } from './reduceri/ReduceriProgramCard'

function normProgramLabel(s: string) {
  return s.replace(/^PROGRAMUL\s*/i, '').trim().toLowerCase()
}

function fullProgramForOption(
  opt: { programLabel: string; discountPercent: number },
  programs: ReducereProgram[],
): ReducereProgram | null {
  const hit = programs.find(
    (p) =>
      normProgramLabel(p.programLabel) === normProgramLabel(opt.programLabel) &&
      p.discountPercent === opt.discountPercent,
  )
  if (hit) return hit
  const samePct = programs.filter((p) => Number(p.discountPercent) === opt.discountPercent)
  return samePct.length === 1 ? samePct[0]! : null
}

function rowToProgram(p: ReducereProgramRow): ReducereProgram {
  const { id: _id, locale: _loc, sortOrder: _so, ...rest } = p
  return rest
}

/** Matches card display — drop leading „PROGRAMUL”. */
function cleanProgramDisplayName(programLabel: string): string {
  return programLabel.replace(/^PROGRAMUL\s*/i, '').trim() || programLabel.trim()
}

type Props = {
  lang: LangCode
  tr: ProductDetailTranslations
  option: { id: string; programLabel: string; discountPercent: number }
  onClose: () => void
}

export default function ResidentialDiscountAboutModal({ lang, tr, option, onClose }: Props) {
  const [resolved, setResolved] = useState<ReducereProgram | null | undefined>(undefined)
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

  useEffect(() => {
    let cancelled = false
    const fallback = getReduceriTranslations(lang).programs

    getPublicReducerePrograms(lang)
      .then((rows) => {
        if (cancelled) return
        const asPrograms = rows.length > 0 ? rows.map(rowToProgram) : fallback
        if (!option.id.startsWith('local-')) {
          const row = rows.find((r) => r.id === option.id)
          if (row) {
            setResolved(rowToProgram(row))
            return
          }
        }
        setResolved(fullProgramForOption(option, asPrograms))
      })
      .catch(() => {
        if (!cancelled) setResolved(fullProgramForOption(option, fallback))
      })
    return () => {
      cancelled = true
    }
  }, [lang, option.id, option.programLabel, option.discountPercent])

  const termeni = getTermeniProgrameReducereTranslations(lang)
  const program = resolved === undefined ? null : resolved

  return createPortal(
    <div
      className="fixed inset-0 z-[92] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="res-discount-about-terms-heading"
        className="box-border flex max-h-[min(92vh,880px)] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-neutral-100 px-4 py-4 sm:px-6 sm:py-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-slate-800" aria-hidden>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </span>
            <h2
              id="res-discount-about-terms-heading"
              className="m-0 min-w-0 text-base font-bold leading-snug text-black font-['Inter'] sm:text-lg"
            >
              {tr.reduceriProgramTermsHeading}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            aria-label={tr.compatibilitateClose}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="grid gap-8 p-4 sm:grid-cols-[minmax(0,20rem)_1fr] sm:items-start sm:gap-8 sm:p-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
            <div className="min-w-0 w-full justify-self-start">
              {program ? (
                <ReduceriProgramCard program={program} hideCta />
              ) : resolved === undefined ? (
                <div className="h-80 animate-pulse rounded-[10px] bg-neutral-100 sm:h-[28rem]" />
              ) : (
                <div className="rounded-[10px] border border-neutral-200 bg-neutral-50 p-5">
                  <p className="m-0 text-lg font-bold text-black font-['Inter']">
                    {cleanProgramDisplayName(option.programLabel)}
                  </p>
                  <p className="mt-2 m-0 text-sm font-semibold text-neutral-700">
                    {option.discountPercent}% — {tr.residentialDiscountOptionSuffix}
                  </p>
                  <p className="mt-4 m-0 text-sm text-neutral-600 font-['Inter'] leading-relaxed">
                    {termeni.intro}
                  </p>
                </div>
              )}
            </div>
            <div className="min-w-0 border-t border-neutral-200 pt-8 sm:border-t-0 sm:border-l sm:pl-8 sm:pt-0 lg:pl-10">
              <p className="m-0 text-sm leading-relaxed text-neutral-700 font-['Inter'] sm:text-base">
                {termeni.intro}
              </p>
              <Link
                to="/termeni-si-conditii-programe-de-reducere"
                className="mt-5 inline-flex text-sm font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-700 font-['Inter']"
                onClick={onClose}
              >
                {tr.reduceriTermsOpenFullPage}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
