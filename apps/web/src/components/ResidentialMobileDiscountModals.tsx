import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getReduceriTranslations, type ReducereProgram } from '../i18n/reduceri'
import type { LangCode } from '../i18n/menu'
import type { ProductDetailTranslations } from '../i18n/product-detail'
import { validateReferralCode } from '../lib/api'

function normProgramLabel(s: string): string {
  return s.replace(/^PROGRAMUL\s*/i, '').trim().toLowerCase()
}

function fullProgramForOption(opt: { programLabel: string; discountPercent: number }, programs: ReducereProgram[]): ReducereProgram | null {
  const hit = programs.find(
    (p) =>
      normProgramLabel(p.programLabel) === normProgramLabel(opt.programLabel) &&
      p.discountPercent === opt.discountPercent,
  )
  if (hit) return hit
  const samePct = programs.filter((p) => Number(p.discountPercent) === opt.discountPercent)
  return samePct.length === 1 ? samePct[0]! : null
}

function renderBold(text: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-bold">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

export type MobileDiscountOption = { id: string; programLabel: string; discountPercent: number }

type Props = {
  lang: LangCode
  tr: ProductDetailTranslations
  discountOptions: MobileDiscountOption[]
  /** Draft selection while picker/detail flow is open (program id or 'none'). */
  pickDraftId: string
  formatOptionLabel: (opt: MobileDiscountOption) => string
  pickOpen: boolean
  onClosePick: () => void
  detailOptionId: string | null
  /** Dismiss details without committing (backdrop / Escape). */
  onCloseDetail: () => void
  /** Commit programme from details sheet and close. */
  onApplyDetail: () => void
  /** Picker radio: 'none' commits immediately; programme id opens details only. */
  onSelectProgram: (id: string) => void
}

export default function ResidentialMobileDiscountModals({
  lang,
  tr,
  discountOptions,
  pickDraftId,
  formatOptionLabel,
  pickOpen,
  onClosePick,
  detailOptionId,
  onCloseDetail,
  onApplyDetail,
  onSelectProgram,
}: Props) {
  const reduceriTr = getReduceriTranslations(lang)
  const detailOpt = detailOptionId ? discountOptions.find((o) => o.id === detailOptionId) : null
  const detailProgram = detailOpt ? fullProgramForOption(detailOpt, reduceriTr.programs) : null
  const needsReferralCode = Boolean(detailOpt && Number(detailOpt.discountPercent) === 5)
  const [referralDigits, setReferralDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [referralBusy, setReferralBusy] = useState(false)
  const [referralVerified, setReferralVerified] = useState(false)
  const [referralMessage, setReferralMessage] = useState<string | null>(null)
  const [referralError, setReferralError] = useState<string | null>(null)
  const referralInputRefs = useRef<Array<HTMLInputElement | null>>([])
  const normalizedReferralInput = useMemo(
    () => `BAT-${referralDigits.join('')}`,
    [referralDigits],
  )

  const anyOpen = pickOpen || detailOptionId != null

  useEffect(() => {
    if (!anyOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [anyOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (detailOptionId) onCloseDetail()
      else if (pickOpen) onClosePick()
    }
    if (!anyOpen) return
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [anyOpen, pickOpen, detailOptionId, onCloseDetail, onClosePick])

  useEffect(() => {
    setReferralDigits(['', '', '', '', '', ''])
    setReferralBusy(false)
    setReferralVerified(false)
    setReferralMessage(null)
    setReferralError(null)
  }, [detailOptionId])

  const hasCompleteReferralDigits = referralDigits.every((d) => /^\d$/.test(d))
  const canApplyDetail = !needsReferralCode || hasCompleteReferralDigits

  const panelBase =
    'mx-auto w-full max-w-lg rounded-xl bg-white shadow-2xl max-h-[90vh] overflow-hidden flex flex-col'

  const pickerModal =
    pickOpen && !detailOptionId ? (
      <div
        className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
        onClick={onClosePick}
        role="presentation"
      >
        <div
          className={panelBase + ' max-sm:rounded-b-none max-sm:rounded-t-2xl'}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-discount-picker-title"
        >
          <div className="border-b border-neutral-100 px-4 py-4">
            <h2 id="mobile-discount-picker-title" className="m-0 text-lg font-bold text-gray-900">
              {tr.alegeProgramReduceri}
            </h2>
          </div>
          <div className="overflow-y-auto overscroll-contain px-4 py-4">
            <fieldset className="m-0 space-y-3 border-0 p-0">
              <legend className="sr-only">{tr.alegeProgramReduceri}</legend>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 px-3 py-3">
                <input
                  type="radio"
                  name="mobile-residential-discount"
                  className="h-5 w-5 shrink-0 accent-slate-900"
                  checked={pickDraftId === 'none'}
                  onChange={() => onSelectProgram('none')}
                />
                <span className="text-sm font-medium text-gray-900">{tr.faraReducere}</span>
              </label>
              {discountOptions.map((opt) => (
                <label key={opt.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 px-3 py-3">
                  <input
                    type="radio"
                    name="mobile-residential-discount"
                    className="h-5 w-5 shrink-0 accent-slate-900"
                    checked={pickDraftId === opt.id}
                    onChange={() => onSelectProgram(opt.id)}
                  />
                  <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-gray-900">
                    {formatOptionLabel(opt)}
                  </span>
                </label>
              ))}
            </fieldset>
          </div>
          <div className="border-t border-neutral-100 p-4">
            <button
              type="button"
              onClick={onClosePick}
              className="w-full min-h-12 rounded-xl border-2 border-slate-900 bg-white py-3 font-semibold text-slate-900"
            >
              {tr.compatibilitateClose}
            </button>
          </div>
        </div>
      </div>
    ) : null

  const detailModal =
    detailOptionId != null && detailProgram ? (
      <div
        className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
        onClick={onCloseDetail}
        role="presentation"
      >
        <div
          className={panelBase + ' max-sm:max-h-[92vh] max-sm:rounded-b-none max-sm:rounded-t-2xl'}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-discount-detail-title"
        >
          <div className="relative max-h-[40vh] w-full shrink-0 overflow-hidden bg-neutral-200">
            <img
              src={detailProgram.photo}
              alt=""
              className="h-full max-h-[40vh] w-full object-cover"
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            <h2 id="mobile-discount-detail-title" className="m-0 text-lg font-bold text-gray-900">
              {detailProgram.title}
            </h2>
            <div className="mt-4 space-y-5 text-sm leading-relaxed text-gray-700">
              {detailProgram.description.split(/\n+/).filter(Boolean).map((para, i) => (
                <p key={i} className="m-0">
                  {renderBold(para)}
                </p>
              ))}
            </div>
          </div>
          <div className="border-t border-neutral-100 px-4 pt-4 pb-5">
            {needsReferralCode ? (
              <div className="mb-5">
                <label htmlFor="mobile-referral-code" className="mb-2 block text-center text-xs font-semibold text-gray-700">
                  Cod recomandare primit de la prieten
                </label>
                <div
                  id="mobile-referral-code"
                  className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-2"
                >
                  <span className="select-none px-1 py-1 text-base font-bold tracking-wide text-gray-700 sm:self-auto">
                    BAT-
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    {referralDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          referralInputRefs.current[idx] = el
                        }}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="off"
                        aria-label={`Cifra ${idx + 1} din codul de recomandare`}
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const onlyDigit = e.target.value.replace(/\D/g, '').slice(0, 1)
                          const next = [...referralDigits]
                          next[idx] = onlyDigit
                          setReferralDigits(next)
                          setReferralVerified(false)
                          setReferralMessage(null)
                          setReferralError(null)
                          if (onlyDigit && idx < 5) referralInputRefs.current[idx + 1]?.focus()
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !referralDigits[idx] && idx > 0) {
                            referralInputRefs.current[idx - 1]?.focus()
                          }
                          if (e.key === 'ArrowLeft' && idx > 0) referralInputRefs.current[idx - 1]?.focus()
                          if (e.key === 'ArrowRight' && idx < 5) referralInputRefs.current[idx + 1]?.focus()
                        }}
                        onPaste={(e) => {
                          e.preventDefault()
                          const raw = e.clipboardData.getData('text')
                          const digits = raw.replace(/\D/g, '').slice(0, 6).split('')
                          if (!digits.length) return
                          const filled = ['', '', '', '', '', '']
                          for (let i = 0; i < digits.length; i += 1) filled[i] = digits[i] || ''
                          setReferralDigits(filled)
                          setReferralVerified(false)
                          setReferralMessage(null)
                          setReferralError(null)
                          referralInputRefs.current[Math.min(digits.length, 6) - 1]?.focus()
                        }}
                        className="h-12 w-11 rounded-lg border border-neutral-300 bg-white text-center text-lg font-bold tabular-nums text-gray-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      />
                    ))}
                  </div>
                </div>
                {referralError ? <p className="mt-1.5 m-0 text-xs text-red-600">{referralError}</p> : null}
                {referralMessage && referralVerified ? (
                  <p className="mt-1.5 m-0 text-xs text-emerald-700">{referralMessage}</p>
                ) : null}
              </div>
            ) : null}
            <button
              type="button"
              onClick={async () => {
                if (!needsReferralCode) {
                  onApplyDetail()
                  return
                }
                setReferralBusy(true)
                setReferralVerified(false)
                setReferralError(null)
                setReferralMessage(null)
                try {
                  const result = await validateReferralCode(normalizedReferralInput)
                  if (Number(result.discountPercent) !== Number(detailOpt?.discountPercent || 0)) {
                    setReferralError(
                      `Codul este valid, dar oferă ${result.discountPercent}% (nu ${detailOpt?.discountPercent || 0}%).`,
                    )
                    return
                  }
                  setReferralVerified(true)
                  setReferralMessage(result.message || 'Cod valid. Reducerea poate fi aplicată.')
                  onApplyDetail()
                } catch (err) {
                  setReferralError(err instanceof Error ? err.message : 'Cod invalid.')
                } finally {
                  setReferralBusy(false)
                }
              }}
              disabled={!canApplyDetail || referralBusy}
              className="w-full min-h-12 rounded-xl bg-slate-900 py-3 font-semibold text-white uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-50"
            >
              {referralBusy ? 'Se verifică…' : tr.reduceriHoverApplyBtn}
            </button>
          </div>
        </div>
      </div>
    ) : detailOptionId != null ? (
      (() => {
        const opt = discountOptions.find((o) => o.id === detailOptionId)
        return (
          <div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4"
            onClick={onCloseDetail}
          >
            <div
              className="max-w-lg rounded-xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <p className="m-0 text-gray-700">{opt ? formatOptionLabel(opt) : detailOptionId}</p>
              <button
                type="button"
                onClick={onApplyDetail}
                className="mt-4 w-full min-h-12 rounded-xl bg-slate-900 py-3 font-semibold text-white uppercase tracking-wide"
              >
                {tr.reduceriHoverApplyBtn}
              </button>
            </div>
          </div>
        )
      })()
    ) : null

  if (typeof document === 'undefined') return null
  return (
    <>
      {pickerModal ? createPortal(pickerModal, document.body) : null}
      {detailModal ? createPortal(detailModal, document.body) : null}
    </>
  )
}
