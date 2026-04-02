import { Link } from 'react-router-dom'
import type { PublicProduct } from '../lib/api'
import { getAuthRole } from '../lib/api'
import { getProductPricingTranslations } from '../i18n/product-pricing'
import type { LangCode } from '../i18n/menu'

function num(v: string | number | null | undefined): number | null {
  if (v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

type Props = {
  product: PublicProduct
  lang: LangCode
  /** e.g. text-lg for industrial hero-adjacent */
  className?: string
  /** When true, omit extra border/shadow (parent already provides the panel) */
  embedded?: boolean
}

export default function ProductPriceBlock({ product, lang, className = '', embedded = false }: Props) {
  const tr = getProductPricingTranslations(lang)
  const vis = (product.priceVisibility as 'hidden' | 'public' | 'partner_only' | undefined) || 'public'
  const presentation =
    (product.pricePresentation as 'simple' | 'detailed' | undefined) || 'simple'
  const role = getAuthRole()
  const isPartner = role === 'partener'

  const sale = num(product.salePrice)
  const landed = num((product as { landedPrice?: string | number | null }).landedPrice)
  const vatPct = num((product as { vat?: string | number | null }).vat)

  const canSeeMoney =
    vis === 'public' || (isPartner && (vis === 'partner_only' || vis === 'hidden'))
  const hasMoney = sale != null && sale > 0

  if (!canSeeMoney) {
    return (
      <div
        className={`font-['Inter'] text-gray-800 ${
          embedded ? 'text-base' : 'text-sm rounded-xl border border-neutral-200 bg-white/90 px-4 py-4 shadow-sm'
        } ${className}`}
      >
        <p className="m-0 mb-4 leading-relaxed">
          {vis === 'partner_only' ? tr.partnerLoginPrompt : tr.hiddenPrompt}
        </p>
        {vis === 'partner_only' ? (
          <Link
            to="/login?tab=partener"
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-base font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            {tr.partnerLoginCta}
          </Link>
        ) : (
          <Link
            to="/contact"
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border-2 border-slate-900 bg-white px-5 py-3 text-base font-semibold text-slate-900 hover:bg-neutral-50 transition-colors"
          >
            {tr.contactCta}
          </Link>
        )}
      </div>
    )
  }

  if (!hasMoney) return null

  const locale = lang === 'en' ? 'en-GB' : lang === 'zh' ? 'zh-CN' : 'ro-RO'
  const fmtMoney = (n: number) =>
    n.toLocaleString(locale, { maximumFractionDigits: 0, minimumFractionDigits: 0 })
  const fmtPct = (n: number) =>
    n.toLocaleString(locale, { maximumFractionDigits: 2, minimumFractionDigits: 0 })

  const withVat =
    sale != null && vatPct != null ? sale * (1 + vatPct / 100) : null

  if (presentation === 'detailed') {
    return (
      <div
        className={`font-['Inter'] text-gray-900 space-y-3 ${
          embedded ? 'text-base' : 'space-y-2 text-sm rounded-xl border border-neutral-200 bg-white/90 px-4 py-4 shadow-sm'
        } ${className}`}
      >
        {landed != null && landed > 0 ? (
          <div className="flex justify-between gap-4 text-sm sm:text-base">
            <span className="text-gray-600">{tr.landedLabel}</span>
            <span className="font-semibold tabular-nums">
              {fmtMoney(landed)} {tr.currencySuffix}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between gap-4 text-sm sm:text-base">
          <span className="text-gray-600">{tr.saleLabel}</span>
          <span className="font-semibold tabular-nums">
            {fmtMoney(sale!)} {tr.currencySuffix}
          </span>
        </div>
        {vatPct != null ? (
          <div className="flex justify-between gap-4 text-sm sm:text-base">
            <span className="text-gray-600">{tr.vatLabel}</span>
            <span className="font-semibold tabular-nums">{fmtPct(vatPct)}%</span>
          </div>
        ) : null}
        {withVat != null ? (
          <div className="flex justify-between gap-4 text-base sm:text-lg pt-2 border-t border-neutral-100">
            <span className="font-bold text-black">{tr.priceWithVatLabel}</span>
            <span className="font-bold tabular-nums">
              {fmtMoney(withVat)} {tr.currencySuffix}
            </span>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className={`font-['Inter'] ${
        embedded ? '' : 'rounded-xl border border-neutral-200 bg-white/90 px-4 py-4 shadow-sm'
      } ${className}`}
    >
      <p
        className={`m-0 font-medium uppercase tracking-wide text-gray-500 ${
          embedded ? 'text-sm' : 'text-xs'
        }`}
      >
        {tr.saleLabel}
      </p>
      <p
        className={`m-0 mt-2 font-bold tabular-nums text-slate-900 ${
          embedded ? 'text-3xl sm:text-4xl' : 'text-2xl'
        }`}
      >
        {fmtMoney(sale!)}{' '}
        <span className={`font-semibold text-gray-600 ${embedded ? 'text-xl' : 'text-lg'}`}>{tr.currencySuffix}</span>
      </p>
      {vatPct != null && withVat != null ? (
        <p className={`m-0 mt-2 text-gray-500 ${embedded ? 'text-sm' : 'text-xs'}`}>
          {tr.priceWithVatLabel}: {fmtMoney(withVat)} {tr.currencySuffix}
        </p>
      ) : null}
    </div>
  )
}
