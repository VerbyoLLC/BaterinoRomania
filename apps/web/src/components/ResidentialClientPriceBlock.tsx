import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import type { PublicProduct } from '../lib/api'
import type { ProductDetailTranslations } from '../i18n/product-detail'
import type { LangCode } from '../i18n/menu'
import { getProductPricingTranslations } from '../i18n/product-pricing'
import ReduceriProgramsModal from './ReduceriProgramsModal'

function num(v: string | number | null | undefined): number | null {
  if (v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const DISCOUNT_ORDER = ['none', 'program1', 'program2', 'program3'] as const
type DiscountKey = (typeof DISCOUNT_ORDER)[number]

const DISCOUNT_RATE: Record<DiscountKey, number> = {
  none: 0,
  program1: 0.05,
  program2: 0.1,
  program3: 0.15,
}

function discountLabel(key: DiscountKey, tr: ProductDetailTranslations): string {
  switch (key) {
    case 'none':
      return tr.faraReducere
    case 'program1':
      return tr.reduceriProgram5
    case 'program2':
      return tr.reduceriProgram10
    case 'program3':
      return tr.reduceriProgram15
  }
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
  const p = getProductPricingTranslations(lang)
  const [qty, setQty] = useState(1)
  const [discountProgram, setDiscountProgram] = useState<DiscountKey>('none')
  const [showReduceriModal, setShowReduceriModal] = useState(false)

  const sale = num(product.salePrice)!
  const landed = num((product as { landedPrice?: string | number | null }).landedPrice)
  const vatPct = num((product as { vat?: string | number | null }).vat)

  const fmt = (n: number) =>
    n.toLocaleString(lang === 'en' ? 'en-GB' : lang === 'zh' ? 'zh-CN' : 'ro-RO', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    })

  const hasVat = vatPct != null && vatPct > 0
  const baseUnitDisplay = hasVat ? sale * (1 + vatPct! / 100) : sale
  const rate = DISCOUNT_RATE[discountProgram]
  const hasProgramDiscount = rate > 0
  const unitAfterDiscount = baseUnitDisplay * (1 - rate)
  const unitDiscountAmount = baseUnitDisplay * rate
  const lineTotal = unitAfterDiscount * qty
  const totalSavings = unitDiscountAmount * qty
  const showPrevious = landed != null && landed > 0 && landed > sale
  const pctBadge = Math.round(rate * 100)

  return (
    <div className="space-y-3 font-['Inter']">
      {showPrevious ? (
        <div className="flex flex-wrap items-center gap-2 text-xs pb-1 border-b border-neutral-100">
          <span className="font-semibold uppercase tracking-wide text-neutral-500">{p.landedLabel}</span>
          <span className="font-semibold tabular-nums text-neutral-400 line-through decoration-neutral-400">
            {fmt(landed!)} {p.currencySuffix}
          </span>
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="flex w-full flex-col gap-1.5 sm:w-fit sm:shrink-0">
            <span className="text-center text-xs font-semibold uppercase leading-tight text-gray-700 sm:text-left">
              {tr.cantitateLabel}
            </span>
            <div className="mx-auto flex w-fit max-w-full items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2.5 min-h-[2.5rem] sm:mx-0 sm:min-h-[2.75rem] sm:px-3 sm:py-3">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-5 h-5 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                aria-label={tr.ariaQtyDecrease}
              >
                <Minus size={12} strokeWidth={3} aria-hidden />
              </button>
              <span className="text-xs font-semibold text-gray-900 w-6 text-center tabular-nums">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                className="w-5 h-5 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                aria-label={tr.ariaQtyIncrease}
              >
                <Plus size={12} strokeWidth={3} aria-hidden />
              </button>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <label
              htmlFor="res-discount-program"
              className="text-xs font-semibold text-gray-700 uppercase leading-tight"
            >
              {tr.alegeProgramReduceri}
            </label>
            <select
              id="res-discount-program"
              value={discountProgram}
              onChange={(e) => setDiscountProgram(e.target.value as DiscountKey)}
              className={`w-full py-2 pl-2.5 pr-10 rounded-lg text-xs text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-offset-0 min-h-[2.5rem] sm:min-h-[2.75rem] ${
                hasProgramDiscount
                  ? 'border border-green-300 bg-green-50 focus:ring-green-500'
                  : 'border border-gray-300 bg-white focus:ring-slate-900'
              }`}
            >
              {DISCOUNT_ORDER.map((key) => (
                <option key={key} value={key}>
                  {discountLabel(key, tr)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowReduceriModal(true)}
              className="w-full text-left p-0 border-0 bg-transparent text-xs font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-700 font-['Inter']"
            >
              {tr.veziProgrameReduceri}
            </button>
          </div>
        </div>

        {hasProgramDiscount ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 sm:items-stretch">
            <div className="min-w-0 flex flex-col items-center justify-center gap-2 px-4 py-6 sm:px-5 sm:py-7 text-center">
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
                <span className="text-xs font-semibold text-gray-700 uppercase">{tr.pretVechiLabel}</span>
                <span className="text-sm text-gray-500 line-through tabular-nums">
                  {fmt(baseUnitDisplay)} {p.currencySuffix}
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 m-0 tabular-nums leading-tight">
                {fmt(unitAfterDiscount)}{' '}
                <span className="text-lg sm:text-xl font-bold align-baseline">{p.currencySuffix}</span>
              </p>
              {hasVat ? (
                <p className="text-xs text-gray-500 m-0 mt-0.5">
                  {tr.includesVatWithPct.replace(/\{pct\}/g, fmt(vatPct!))}
                </p>
              ) : null}
            </div>
            <div className="min-w-0 flex flex-col items-center justify-center gap-2 px-4 py-6 sm:px-5 sm:py-7 text-center">
              <p className="text-sm sm:text-base font-extrabold text-gray-900 uppercase tracking-wide m-0 leading-tight">
                {tr.discountPctHighlight.replace(/\{pct\}/g, String(pctBadge))}
              </p>
              <p className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wide m-0 leading-tight">
                {tr.economisestiLabel}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold tabular-nums m-0 leading-none">
                <span className="text-green-600">
                  {fmt(totalSavings)}{' '}
                  <span className="text-base sm:text-lg font-bold align-baseline">{p.currencySuffix}</span>
                </span>
              </p>
              {qty > 1 ? (
                <p className="text-xs text-neutral-500 font-medium m-0 leading-snug">
                  {tr.cantitateLabel}: {qty}
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center justify-center gap-2 px-4 py-6 sm:px-5 sm:py-7 text-center">
            <span className="text-xs font-semibold text-gray-700 uppercase">{tr.pretLabel}</span>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 m-0 tabular-nums leading-tight">
              {fmt(baseUnitDisplay)}{' '}
              <span className="text-lg sm:text-xl font-bold align-baseline">{p.currencySuffix}</span>
            </p>
            {hasVat ? (
              <p className="text-xs text-gray-500 m-0 mt-0.5">
                {tr.includesVatWithPct.replace(/\{pct\}/g, fmt(vatPct!))}
              </p>
            ) : null}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            const lines = [
              product.title,
              `${tr.cantitateLabel}: ${qty}`,
              discountLabel(discountProgram, tr),
            ]
            if (hasProgramDiscount) {
              lines.push(`${tr.economisestiLabel}: ${fmt(totalSavings)} ${p.currencySuffix}`)
            }
            lines.push(`${fmt(lineTotal)} ${p.currencySuffix}`)
            window.alert(`${lines.join('\n')}\n\n${tr.clientOrderNotice}`)
          }}
          className={`w-full min-h-[3.25rem] sm:min-h-[3.5rem] font-bold py-3.5 sm:py-4 rounded-xl text-base sm:text-lg uppercase tracking-wide transition-colors ${
            hasProgramDiscount
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-900 hover:bg-gray-800 text-white'
          }`}
        >
          {tr.comandaBtn}
        </button>
      </div>

      {showReduceriModal ? (
        <ReduceriProgramsModal
          lang={lang}
          onClose={() => setShowReduceriModal(false)}
          closeLabel={tr.compatibilitateClose}
          seeFullPageLabel={tr.reduceriModalSeeFullPage}
        />
      ) : null}
    </div>
  )
}
