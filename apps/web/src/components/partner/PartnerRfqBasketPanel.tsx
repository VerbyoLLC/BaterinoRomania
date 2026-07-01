import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Check,
  FileText,
  Loader2,
  Minus,
  Package,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import type { LangCode } from '../../i18n/menu'
import { getPartnerProductsTranslations } from '../../i18n/partner/products'
import { PartnerRfqPriceJourneySidebar, PartnerRfqApprovedEmptySidebar } from './PartnerRfqPriceJourney'
import {
  getPartnerCatalogPrpUnitWithVatNumeric,
  getPartnerDisplayUnitPriceWithVat,
  getProductCardImageUrl,
  submitPartnerRfqRequest,
} from '../../lib/api'
import { type PartnerRfqItem } from '../../lib/partnerRfqBasket'

type RfqView = 'basket' | 'done'

function formatRfqAmount(amount: number, langCode: LangCode, currency: string): string {
  const locale = langCode === 'en' ? 'en-GB' : 'ro-RO'
  return `${amount.toLocaleString(locale, { maximumFractionDigits: 0 })} ${currency}`
}

function getRfqIndicativeRrpGross(product: PartnerRfqItem['product']): number | null {
  const prp = getPartnerCatalogPrpUnitWithVatNumeric(product)
  if (!Number.isNaN(prp)) return prp
  const gross = getPartnerDisplayUnitPriceWithVat(product, null)
  if (!Number.isNaN(gross)) return gross
  return null
}

function PartnerRfqBasketSkeleton() {
  return (
    <div className="animate-pulse motion-reduce:animate-none p-4 space-y-3" aria-hidden>
      <div className="h-12 rounded-xl bg-slate-200" />
      <div className="h-16 rounded-xl bg-slate-100" />
      <div className="h-16 rounded-xl bg-slate-100" />
      <div className="h-20 rounded-xl bg-slate-100" />
      <div className="h-11 rounded-xl bg-slate-300" />
    </div>
  )
}

function RfqPanelHeader({
  title,
  count,
  onDismiss,
  closeLabel,
}: {
  title: string
  count?: number
  onDismiss?: () => void
  closeLabel?: string
}) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-indigo-50 text-indigo-700">
          <FileText className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        </div>
        <h2 className="m-0 truncate text-base font-bold text-slate-900 font-['Inter']">{title}</h2>
        {count != null && count > 0 ? (
          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 px-1.5 text-[11px] font-bold tabular-nums text-white font-['Inter']">
            {count > 99 ? '99+' : count}
          </span>
        ) : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={closeLabel}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <X className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      ) : null}
    </header>
  )
}

export function PartnerRfqBasketPanel({
  variant,
  items,
  loading = false,
  onChangeQty,
  onRemove,
  onClear,
  onDismiss,
  onSubmitted,
  langCode,
  currency,
  embedded = false,
  hideHeader = false,
  discountPricesVisible = false,
}: {
  variant: 'sidebar' | 'mobile'
  items: PartnerRfqItem[]
  loading?: boolean
  onChangeQty: (productId: string, delta: number) => void
  onRemove: (productId: string) => void
  onClear: () => void
  onDismiss?: () => void
  onSubmitted?: () => void
  langCode: LangCode
  currency: string
  embedded?: boolean
  hideHeader?: boolean
  /** Partner discount approved — show configurable-systems empty state instead of onboarding journey. */
  discountPricesVisible?: boolean
}) {
  const tr = getPartnerProductsTranslations(langCode)
  const [view, setView] = useState<RfqView>('basket')
  const [submittedId, setSubmittedId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const totalQty = useMemo(() => items.reduce((sum, row) => sum + row.quantity, 0), [items])

  const rrpTotal = useMemo(() => {
    return items.reduce((sum, row) => {
      const rrp = getRfqIndicativeRrpGross(row.product)
      if (rrp == null) return sum
      return sum + rrp * row.quantity
    }, 0)
  }, [items])

  const resetAfterDone = useCallback(() => {
    setView('basket')
    setSubmittedId('')
    onSubmitted?.()
  }, [onSubmitted])

  const handleSubmit = useCallback(async () => {
    if (items.length === 0 || submitting) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const result = await submitPartnerRfqRequest(
        items.map(({ product, quantity }) => ({
          productId: product.id,
          quantity,
        })),
      )
      setSubmittedId(result.orderNumber || result.id)
      onClear()
      setView('done')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Eroare la trimiterea cererii.')
    } finally {
      setSubmitting(false)
    }
  }, [items, onClear, submitting])

  useEffect(() => {
    if (view === 'basket' && items.length === 0 && submittedId) {
      setSubmittedId('')
    }
  }, [items.length, submittedId, view])

  const shellClass = embedded
    ? 'relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white'
    : variant === 'sidebar'
      ? 'relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'
      : 'relative flex max-h-[min(58vh,560px)] flex-col overflow-hidden rounded-t-2xl border border-b-0 border-slate-200 bg-white shadow-[0_-12px_40px_rgba(15,23,42,0.12)]'

  if (loading) {
    return (
      <section className={shellClass} aria-busy="true" aria-label={tr.rfqTitle}>
        {!hideHeader ? (
          <RfqPanelHeader title={tr.rfqTitle} onDismiss={embedded ? undefined : onDismiss} closeLabel={tr.rfqCloseAria} />
        ) : null}
        <PartnerRfqBasketSkeleton />
      </section>
    )
  }

  if (view === 'done') {
    return (
      <section className={shellClass} aria-label={tr.rfqTitle}>
        {!hideHeader ? (
          <RfqPanelHeader title={tr.rfqTitle} onDismiss={embedded ? undefined : onDismiss} closeLabel={tr.rfqCloseAria} />
        ) : null}
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center font-['Inter']">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Check className="h-6 w-6" strokeWidth={2.4} aria-hidden />
          </div>
          <h3 className="m-0 text-base font-bold text-slate-900">{tr.rfqDoneTitle}</h3>
          {submittedId ? (
            <span className="mt-2 inline-block rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
              {submittedId}
            </span>
          ) : null}
          <p className="mx-auto mt-3 mb-4 max-w-[18rem] text-sm leading-relaxed text-slate-500">{tr.rfqDoneBody}</p>
          <Link
            to="/partner/comenzi"
            onClick={resetAfterDone}
            className="mb-2 flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 active:bg-slate-950"
          >
            {tr.rfqDoneViewOrders}
          </Link>
          <button
            type="button"
            onClick={resetAfterDone}
            className="w-full rounded-xl border border-slate-200 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            {tr.rfqDoneBack}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className={shellClass} aria-label={tr.rfqTitle}>
      {!hideHeader ? (
        <RfqPanelHeader
          title={tr.rfqTitle}
          count={totalQty}
          onDismiss={embedded ? undefined : onDismiss}
          closeLabel={tr.rfqCloseAria}
        />
      ) : null}

      {items.length === 0 ? (
        discountPricesVisible ? (
          <PartnerRfqApprovedEmptySidebar tr={tr} />
        ) : (
          <PartnerRfqPriceJourneySidebar tr={tr} />
        )
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto font-['Inter']">
            <p className="mx-4 mb-0 mt-3 text-sm leading-snug text-slate-500">
              <strong className="font-semibold text-slate-700">{tr.rfqSubnoteBold}</strong>
              {tr.rfqSubnoteEnd}
            </p>

            <ul className="m-0 list-none divide-y divide-slate-100 p-0">
              {items.map(({ product, quantity }) => {
                const rrp = getRfqIndicativeRrpGross(product)
                const img = getProductCardImageUrl(product)
                return (
                  <li key={product.id} className="flex items-start gap-3 px-4 py-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#f7f7f7] ring-1 ring-slate-200">
                      {img ? (
                        <img src={img} alt="" className="h-full w-full object-contain p-1.5" loading="lazy" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-5 w-5 text-slate-300" strokeWidth={1.7} aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 line-clamp-2 text-sm font-semibold leading-snug text-slate-900">{product.title}</p>
                      {rrp != null ? (
                        <p className="mt-0.5 m-0 text-sm text-slate-400">
                          {tr.rfqRrpLabel}: {formatRfqAmount(rrp, langCode, currency)}
                          {tr.rfqPerUnit}
                        </p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <div className="flex items-stretch overflow-hidden rounded-lg border border-slate-200 bg-white">
                          <button
                            type="button"
                            onClick={() => onChangeQty(product.id, -1)}
                            aria-label="−"
                            className="flex w-7 items-center justify-center text-slate-500 transition hover:bg-slate-50"
                          >
                            <Minus className="h-3 w-3" strokeWidth={2.5} />
                          </button>
                          <span className="flex w-8 items-center justify-center border-x border-slate-200 text-sm font-bold tabular-nums text-slate-900">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onChangeQty(product.id, 1)}
                            aria-label="+"
                            className="flex w-7 items-center justify-center text-slate-500 transition hover:bg-slate-50"
                          >
                            <Plus className="h-3 w-3" strokeWidth={2.5} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemove(product.id)}
                          aria-label={tr.rfqRemoveItem}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            {rrpTotal > 0 ? (
              <div className="mx-4 mb-2 mt-1 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">{tr.rfqReferenceTotal}</span>
                  <span className="text-sm font-semibold tabular-nums text-slate-800">
                    {formatRfqAmount(rrpTotal, langCode, currency)}
                  </span>
                </div>
                <p className="mt-1 m-0 text-sm leading-snug text-slate-400">{tr.rfqReferenceNote}</p>
              </div>
            ) : null}
          </div>

          <div className="shrink-0 space-y-2 border-t border-slate-100 bg-white px-4 py-3">
            {submitError ? (
              <p className="m-0 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-snug text-rose-800">
                {submitError}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={submitting}
              aria-busy={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 active:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" strokeWidth={2} aria-hidden />
              ) : (
                <Send className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              )}
              {submitting ? tr.rfqSubmittingCta : tr.rfqSubmitCta}
            </button>
            <button
              type="button"
              onClick={onClear}
              disabled={submitting}
              className="w-full rounded-xl border border-slate-200 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {tr.rfqClear}
            </button>
          </div>
        </>
      )}
    </section>
  )
}
