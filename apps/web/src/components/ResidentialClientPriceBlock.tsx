import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Minus, Plus } from 'lucide-react'
import { getAuthRole, getPublicReducerePrograms, type PublicProduct } from '../lib/api'
import {
  RESIDENTIAL_DISCOUNT_GUEST_NOTICE_FALLBACK_RO,
  type ProductDetailTranslations,
} from '../i18n/product-detail'
import { getReduceriTranslations } from '../i18n/reduceri'
import type { LangCode } from '../i18n/menu'
import { getProductPricingTranslations } from '../i18n/product-pricing'
import ReduceriProgramsModal from './ReduceriProgramsModal'
import ResidentialMobileDiscountModals from './ResidentialMobileDiscountModals'

function num(v: string | number | null | undefined): number | null {
  if (v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

type DiscountProgramOption = { id: string; programLabel: string; discountPercent: number }

function buildLocalDiscountOptions(lc: LangCode): DiscountProgramOption[] {
  return getReduceriTranslations(lc).programs
    .filter((p) => p.discountPercent != null && Number(p.discountPercent) > 0)
    .map((p, i) => ({
      id: `local-${lc}-${i}-${p.discountPercent}`,
      programLabel: p.programLabel,
      discountPercent: Number(p.discountPercent),
    }))
}

/** Matches card display on /reduceri — drop leading „PROGRAMUL”. */
function cleanProgramDisplayName(programLabel: string): string {
  return programLabel.replace(/^PROGRAMUL\s*/i, '').trim() || programLabel.trim()
}

function formatResidentialDiscountOption(
  tr: ProductDetailTranslations,
  programLabel: string,
  discountPercent: number,
): string {
  const suffix = tr.residentialDiscountOptionSuffix || 'REDUCERE'
  return `${cleanProgramDisplayName(programLabel)} : ${discountPercent}% ${suffix}`
}

/** Residential template: show public client purchase UI (price, programme, qty, order). */
export function showResidentialClientPurchaseUI(product: PublicProduct): boolean {
  const vis = (product.priceVisibility as string) || 'public'
  if (vis !== 'public') return false
  const sale = num(product.salePrice)
  return sale != null && sale > 0
}

type Props = { product: PublicProduct; tr: ProductDetailTranslations; lang: LangCode }

export default function ResidentialClientPriceBlock({ product, tr, lang }: Props) {
  const navigate = useNavigate()
  const p = getProductPricingTranslations(lang)
  const [qty, setQty] = useState(1)
  const [discountOptions, setDiscountOptions] = useState<DiscountProgramOption[]>(() =>
    buildLocalDiscountOptions(lang),
  )
  const [discountProgramId, setDiscountProgramId] = useState<string>('none')
  const [showReduceriModal, setShowReduceriModal] = useState(false)
  const [mobileDiscountPickOpen, setMobileDiscountPickOpen] = useState(false)
  const [mobileDiscountDetailId, setMobileDiscountDetailId] = useState<string | null>(null)
  /** Doar utilizatorul „client” poate plasa cu reducere; altfel afișăm COMANDĂ CU CONT. */
  const [isClientUser, setIsClientUser] = useState(() =>
    typeof window !== 'undefined' ? getAuthRole() === 'client' : false,
  )

  useEffect(() => {
    const sync = () => setIsClientUser(getAuthRole() === 'client')
    sync()
    window.addEventListener('focus', sync)
    window.addEventListener('storage', sync)
    window.addEventListener('baterino-auth-change', sync)
    return () => {
      window.removeEventListener('focus', sync)
      window.removeEventListener('storage', sync)
      window.removeEventListener('baterino-auth-change', sync)
    }
  }, [])

  useEffect(() => {
    setDiscountProgramId('none')
    setDiscountOptions(buildLocalDiscountOptions(lang))
    let cancelled = false
    getPublicReducerePrograms(lang)
      .then((rows) => {
        if (cancelled) return
        const mapped = rows
          .filter((r) => r.discountPercent != null && Number(r.discountPercent) > 0)
          .map((r) => ({
            id: r.id,
            programLabel: r.programLabel,
            discountPercent: Number(r.discountPercent),
          }))
        setDiscountOptions(mapped.length > 0 ? mapped : buildLocalDiscountOptions(lang))
      })
      .catch(() => {
        if (!cancelled) setDiscountOptions(buildLocalDiscountOptions(lang))
      })
    return () => {
      cancelled = true
    }
  }, [lang])

  useEffect(() => {
    if (discountProgramId === 'none') return
    if (!discountOptions.some((o) => o.id === discountProgramId)) {
      setDiscountProgramId('none')
    }
  }, [discountOptions, discountProgramId])

  const sale = num(product.salePrice)!
  const landed = num((product as { landedPrice?: string | number | null }).landedPrice)
  const vatPct = num((product as { vat?: string | number | null }).vat)

  const locale = lang === 'en' ? 'en-GB' : lang === 'zh' ? 'zh-CN' : 'ro-RO'
  const fmtMoney = (n: number) =>
    n.toLocaleString(locale, { maximumFractionDigits: 0, minimumFractionDigits: 0 })
  const fmtPct = (n: number) =>
    n.toLocaleString(locale, { maximumFractionDigits: 2, minimumFractionDigits: 0 })

  const hasVat = vatPct != null && vatPct > 0
  const baseUnitDisplay = hasVat ? sale * (1 + vatPct! / 100) : sale
  const selectedDiscount =
    discountProgramId === 'none' ? null : discountOptions.find((o) => o.id === discountProgramId)
  const rate = selectedDiscount ? selectedDiscount.discountPercent / 100 : 0
  const hasProgramDiscount = rate > 0
  const unitAfterDiscount = baseUnitDisplay * (1 - rate)
  const unitDiscountAmount = baseUnitDisplay * rate
  /** Full line before programme discount (VAT-inclusive unit × qty). */
  const lineBaseTotal = baseUnitDisplay * qty
  /** Final line total: discount applies to the full line (same as unit × qty with discount per unit). */
  const lineTotal = unitAfterDiscount * qty
  const totalSavings = unitDiscountAmount * qty
  const showPrevious = landed != null && landed > 0 && landed > sale
  const pctBadge = selectedDiscount ? selectedDiscount.discountPercent : Math.round(rate * 100)
  const qtyPiecesWord = qty === 1 ? tr.residentialQtyPieceSingular : tr.residentialQtyPiecePlural
  const vatInline = hasVat ? tr.includesVatWithPct.replace(/\{pct\}/g, fmtPct(vatPct!)) : null
  const guestWithDiscount = hasProgramDiscount && !isClientUser
  const discountGuestNoticeText = (
    (typeof tr.residentialDiscountGuestNotice === 'string' && tr.residentialDiscountGuestNotice.trim()) ||
    RESIDENTIAL_DISCOUNT_GUEST_NOTICE_FALLBACK_RO ||
    'Trebuie să îți creezi un cont pe platforma Baterino pentru a plasa o comandă cu reducere, deoarece sunt necesare mai multe informații.'
  ).trim()

  return (
    <div className="space-y-3 font-['Inter']">
      {showPrevious ? (
        <div className="flex flex-wrap items-center gap-2 text-xs pb-1 border-b border-neutral-100">
          <span className="font-semibold uppercase tracking-wide text-neutral-500">{p.landedLabel}</span>
          <span className="font-semibold tabular-nums text-neutral-400 line-through decoration-neutral-400">
            {fmtMoney(landed!)} {p.currencySuffix}
          </span>
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="flex w-full flex-col gap-2 sm:w-fit sm:shrink-0">
            <span className="text-sm font-semibold uppercase leading-tight text-gray-700 sm:text-left">
              {tr.cantitateLabel}
            </span>
            <div className="flex w-full min-h-[3.25rem] items-center gap-2 rounded-xl border border-neutral-200/80 bg-gray-50 px-2 py-2 sm:w-fit sm:min-h-[2.75rem] sm:gap-1.5 sm:rounded-lg sm:border-0 sm:px-3 sm:py-3">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition-colors sm:h-8 sm:w-8"
                aria-label={tr.ariaQtyDecrease}
              >
                <Minus className="h-5 w-5 sm:h-3 sm:w-3" strokeWidth={3} aria-hidden />
              </button>
              <span className="min-w-0 flex-1 text-center text-lg font-semibold tabular-nums text-gray-900 sm:w-6 sm:flex-none sm:text-sm">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition-colors sm:h-8 sm:w-8"
                aria-label={tr.ariaQtyIncrease}
              >
                <Plus className="h-5 w-5 sm:h-3 sm:w-3" strokeWidth={3} aria-hidden />
              </button>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="text-sm font-semibold uppercase leading-tight text-gray-700">{tr.alegeProgramReduceri}</div>
            <div className="hidden sm:block">
              <div className="relative">
                <select
                  id="res-discount-program"
                  aria-label={tr.alegeProgramReduceri}
                  value={discountProgramId}
                  onChange={(e) => setDiscountProgramId(e.target.value)}
                  className={`w-full min-h-[3.5rem] appearance-none rounded-lg border border-gray-300 bg-white py-3 pl-2.5 pr-11 text-sm font-medium text-gray-700 box-border focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-slate-900 ${
                    hasProgramDiscount ? 'border-green-300 bg-green-50 focus:ring-green-500' : ''
                  }`}
                >
                  <option value="none">{tr.faraReducere}</option>
                  {discountOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {formatResidentialDiscountOption(tr, opt.programLabel, opt.discountPercent)}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700"
                  strokeWidth={2.25}
                  aria-hidden
                />
              </div>
              <button
                type="button"
                onClick={() => setShowReduceriModal(true)}
                className="mt-2 w-full border-0 bg-transparent p-0 text-left font-['Inter'] text-sm font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-700"
              >
                {tr.veziProgrameReduceri}
              </button>
            </div>
            <div className="sm:hidden">
              <button
                type="button"
                onClick={() => {
                  setMobileDiscountDetailId(null)
                  setMobileDiscountPickOpen(true)
                }}
                aria-haspopup="dialog"
                aria-expanded={mobileDiscountPickOpen}
                className={`w-full min-h-[3.75rem] rounded-lg border px-3 py-2 text-left text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  hasProgramDiscount
                    ? 'border-green-300 bg-green-50 focus:ring-green-500'
                    : 'border-gray-300 bg-white focus:ring-slate-900'
                }`}
              >
                {tr.mobileApplyDiscountBtn}
              </button>
              <p className="mt-1.5 text-sm text-gray-600">
                {selectedDiscount
                  ? formatResidentialDiscountOption(
                      tr,
                      selectedDiscount.programLabel,
                      selectedDiscount.discountPercent,
                    )
                  : tr.faraReducere}
              </p>
            </div>
          </div>
        </div>

        {hasProgramDiscount ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 sm:items-stretch">
            {/* Stânga: reduceri / preț vechi / economie; dreapta: preț curent (ordine inversată față de trecut). */}
            <div className="min-w-0 flex flex-col items-start gap-2 rounded-xl border border-green-200/80 bg-green-50/50 px-4 py-5 sm:px-5 sm:py-6 text-left">
              <div className="flex flex-wrap items-baseline justify-start gap-x-2 gap-y-0.5 w-full pb-1 border-b border-green-200/60">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{tr.pretVechiLabel}</span>
                <span className="text-sm text-neutral-500 line-through tabular-nums whitespace-nowrap">
                  {fmtMoney(lineBaseTotal)} {p.currencySuffix}
                </span>
              </div>
              <p className="text-sm sm:text-base font-extrabold text-green-900 uppercase tracking-wide m-0 leading-tight">
                {tr.discountPctHighlight.replace(/\{pct\}/g, String(pctBadge))}
              </p>
              <p className="text-xs sm:text-sm font-bold text-green-800/90 uppercase tracking-wide m-0 leading-tight">
                {tr.economisestiLabel}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold tabular-nums m-0 leading-none">
                <span className="text-green-700">
                  {fmtMoney(totalSavings)}{' '}
                  <span className="text-base sm:text-lg font-bold align-baseline">{p.currencySuffix}</span>
                </span>
              </p>
            </div>
            <div className="min-w-0 flex h-full min-h-0 flex-col justify-end pt-6 sm:pt-0 sm:pb-1">
              <div className="flex w-full flex-col items-stretch gap-3 rounded-xl border-2 border-white bg-white px-0 py-4 text-left text-black max-sm:gap-3 sm:items-start sm:gap-2.5 sm:px-5 sm:py-6">
                <span className="text-xs font-semibold uppercase tracking-wide">{tr.pretFinalLabel}</span>
                <p className="m-0 text-3xl font-extrabold tabular-nums leading-none sm:text-4xl">
                  {fmtMoney(lineTotal)}{' '}
                  <span className="text-xl font-bold align-baseline sm:text-2xl">{p.currencySuffix}</span>
                </p>
                {vatInline ? (
                  <p className="m-0 text-sm font-medium text-gray-600 sm:text-base">{vatInline}</p>
                ) : null}
                <p className="m-0 text-sm tabular-nums text-neutral-600">
                  {fmtMoney(unitAfterDiscount)} {p.currencySuffix} × {qty} {qtyPiecesWord}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Fără reduceri: varianta standard — neutral, preț mare gri/negru. */
          <div className="flex w-full flex-col items-stretch gap-3 px-0 py-4 text-left max-sm:gap-3 sm:items-start sm:gap-2 sm:px-5 sm:py-7">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-700">{tr.pretLabel}</span>
            <p className="m-0 text-3xl font-bold tabular-nums leading-none text-gray-900 sm:text-4xl md:text-5xl">
              {fmtMoney(lineBaseTotal)}{' '}
              <span className="text-2xl font-bold align-baseline sm:text-3xl md:text-4xl">{p.currencySuffix}</span>
            </p>
            {vatInline ? (
              <p className="m-0 text-sm font-medium text-gray-500 sm:text-base">{vatInline}</p>
            ) : null}
            <p className="m-0 text-sm tabular-nums text-neutral-500 sm:text-base">
              {fmtMoney(baseUnitDisplay)} {p.currencySuffix} × {qty} {qtyPiecesWord}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            if (guestWithDiscount) {
              navigate('/signup/clienti')
              return
            }
            const lines = [
              product.title,
              `${tr.cantitateLabel}: ${qty}`,
              selectedDiscount
                ? formatResidentialDiscountOption(tr, selectedDiscount.programLabel, selectedDiscount.discountPercent)
                : tr.faraReducere,
            ]
            if (hasProgramDiscount) {
              lines.push(`${tr.economisestiLabel}: ${fmtMoney(totalSavings)} ${p.currencySuffix}`)
            }
            lines.push(`${fmtMoney(lineTotal)} ${p.currencySuffix}`)
            window.alert(`${lines.join('\n')}\n\n${tr.clientOrderNotice}`)
          }}
          className={`w-full min-h-[3.25rem] sm:min-h-[3.5rem] font-bold py-3.5 sm:py-4 rounded-xl text-base sm:text-lg uppercase tracking-wide transition-colors ${
            hasProgramDiscount
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-900 hover:bg-gray-800 text-white'
          }`}
        >
          {guestWithDiscount ? tr.comandaCuContBtn || 'COMANDĂ CU CONT' : tr.comandaBtn}
        </button>
        {guestWithDiscount ? (
          <p
            className="text-xs sm:text-sm text-neutral-600 font-['Inter'] leading-snug m-0 mt-2 sm:mt-3 text-center max-w-prose mx-auto px-0.5 pb-1 relative z-[1]"
            role="note"
          >
            {discountGuestNoticeText}
          </p>
        ) : null}
      </div>

      {showReduceriModal ? (
        <ReduceriProgramsModal
          lang={lang}
          onClose={() => setShowReduceriModal(false)}
          closeLabel={tr.compatibilitateClose}
          applyMode={{
            discountOptions: discountOptions,
            onApply: (id) => setDiscountProgramId(id),
            applyLabel: tr.reduceriHoverApplyBtn,
          }}
        />
      ) : null}

      <ResidentialMobileDiscountModals
        lang={lang}
        tr={tr}
        discountOptions={discountOptions}
        discountProgramId={discountProgramId}
        formatOptionLabel={(opt) => formatResidentialDiscountOption(tr, opt.programLabel, opt.discountPercent)}
        pickOpen={mobileDiscountPickOpen}
        onClosePick={() => setMobileDiscountPickOpen(false)}
        detailOptionId={mobileDiscountDetailId}
        onCloseDetail={() => setMobileDiscountDetailId(null)}
        onSelectProgram={(id) => {
          setDiscountProgramId(id)
          if (id === 'none') {
            setMobileDiscountPickOpen(false)
            setMobileDiscountDetailId(null)
            return
          }
          setMobileDiscountPickOpen(false)
          setMobileDiscountDetailId(id)
        }}
      />
    </div>
  )
}
