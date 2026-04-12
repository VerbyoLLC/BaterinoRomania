import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Truck } from 'lucide-react'
import { useCatalogCurrency } from '../contexts/CatalogCurrencyContext'
import {
  cartLineDiscountPercent,
  cartLineMaxQty,
  cartLineMergeKey,
  cartLineQtyLocked,
  useCart,
} from '../contexts/CartContext'
import { CartLineProgramDiscountMark } from '../components/CartLineProgramDiscountMark'
import { CartLineProductThumbLink } from '../components/CartLineProductThumbLink'
import {
  CartLineSpecDetails,
  extractCartLineSpecsFromProduct,
  type CartLineSpecs,
} from '../components/CartLineSpecDetails'
import { useReducereProgramLabels } from '../hooks/useReducereProgramLabels'
import { getCartProgramDiscountTranslations } from '../i18n/cart-program-discount'
import { getProductAsGuest, getProductCardImageUrl } from '../lib/api'
import { showResidentialClientPurchaseUI } from '../lib/residentialPublicPurchase'
import { getProductPricingTranslations } from '../i18n/product-pricing'
import { useLanguage } from '../contexts/LanguageContext'
import type { LangCode } from '../i18n/menu'

function num(v: string | number | null | undefined): number | null {
  if (v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const skBar = 'animate-pulse rounded-md bg-slate-200/80'

function CartLineSpecsSkeleton({ ariaLabel }: { ariaLabel: string }) {
  return (
    <div
      className="mt-2 grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-4"
      role="status"
      aria-busy="true"
      aria-label={ariaLabel}
    >
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i}>
          <div className={`h-3 w-[4.5rem] max-w-full ${skBar}`} />
          <div className={`mt-2 h-4 w-20 max-w-full ${skBar}`} />
        </div>
      ))}
    </div>
  )
}

function CartLinePriceBreakdownSkeleton({ ariaLabel }: { ariaLabel: string }) {
  return (
    <div className="w-full space-y-2 font-['Inter']" role="status" aria-busy="true" aria-label={ariaLabel}>
      <div className="flex items-baseline justify-between gap-3">
        <span className={`h-3.5 w-28 max-w-[55%] ${skBar}`} />
        <span className={`h-3.5 w-16 shrink-0 ${skBar}`} />
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <span className={`h-3.5 w-24 max-w-[50%] ${skBar}`} />
        <span className={`h-3.5 w-14 shrink-0 ${skBar}`} />
      </div>
      <div className="flex items-baseline justify-between gap-3 border-t border-slate-200 pt-2">
        <span className={`h-4 w-20 max-w-[45%] ${skBar}`} />
        <span className={`h-5 w-24 shrink-0 ${skBar}`} />
      </div>
    </div>
  )
}

function CartOrderSummarySkeleton({ ariaLabel }: { ariaLabel: string }) {
  return (
    <div className="mt-2 space-y-2" role="status" aria-busy="true" aria-label={ariaLabel}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className={`h-3.5 w-32 max-w-[60%] ${skBar}`} />
        <span className={`h-3.5 w-20 shrink-0 ${skBar}`} />
      </div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className={`h-3.5 w-16 max-w-[40%] ${skBar}`} />
        <span className={`h-3.5 w-16 shrink-0 ${skBar}`} />
      </div>
      <div className="flex items-baseline justify-between gap-3 border-t border-slate-200 pt-2">
        <span className={`h-4 w-24 max-w-[50%] ${skBar}`} />
        <span className={`h-7 w-28 shrink-0 ${skBar}`} />
      </div>
    </div>
  )
}

type LinePriceState =
  | { status: 'loading' }
  | {
      status: 'ok'
      /** Cu TVA / buc. (după reducere pe net fără TVA, apoi TVA) */
      unitInclVat: number
      /** Fără TVA / buc., după reducere */
      unitExclVat: number
      /** Valoare TVA / buc. (pe baza netului după reducere) */
      unitVatAmount: number
      /** Procent TVA din produs (ex. 21) sau null dacă nu e TVA */
      vatPercent: number | null
      /** Preț catalog fără TVA / buc. (înainte de reducere) */
      unitListExclVat: number
      /** Reducere 0–100; TVA se aplică după ce se scade reducerea din prețul fără TVA */
      discountPercent: number
      specs: CartLineSpecs
      cardImageUrl: string
      /** Limba răspunsului API (detalii produs) */
      fetchedLang: LangCode
    }
  | { status: 'error'; message: string }

function cartLabels(lang: LangCode) {
  if (lang === 'en') {
    return {
      qty: 'Quantity',
      cartTotal: 'Final total',
      loadingPrices: 'Loading prices…',
      remove: 'Remove',
      /** Product unit price excl. VAT (catalog), before programme discount if any */
      productPriceExcl: 'Product price',
      discount: 'Discount',
      /** VAT row label without rate — combine with rate in UI, e.g. "VAT 21%" */
      vatPrefix: 'VAT',
      totalFinal: 'Final total',
      cartProductExcl: 'Product subtotal',
      cartDiscountExcl: 'Discount',
      cartVatTotal: 'VAT',
      freeShippingTitle: 'Free delivery',
      freeShippingBody:
        'For Baterino platform users, delivery is free. The nationwide Baterino network lets us get your order to you as quickly as possible.',
    }
  }
  if (lang === 'zh') {
    return {
      qty: '数量',
      cartTotal: '最终合计',
      loadingPrices: '加载价格中…',
      remove: '移除',
      productPriceExcl: '产品价格',
      discount: '折扣',
      vatPrefix: '增值税',
      totalFinal: '含税合计',
      cartProductExcl: '产品小计',
      cartDiscountExcl: '折扣',
      cartVatTotal: '增值税',
      freeShippingTitle: '免运费',
      freeShippingBody:
        'Baterino 平台用户享受免运费。依托全国 Baterino 网络，我们尽快为您配送。',
    }
  }
  return {
    qty: 'Cantitate',
    cartTotal: 'Total final',
    loadingPrices: 'Se încarcă prețurile…',
    remove: 'Elimină',
    productPriceExcl: 'Preț produs',
    discount: 'Reducere',
    vatPrefix: 'TVA',
    totalFinal: 'Total final',
    cartProductExcl: 'Preț produse',
    cartDiscountExcl: 'Reducere',
    cartVatTotal: 'TVA',
    freeShippingTitle: 'Transport gratuit',
    freeShippingBody:
      'Pentru utilizatorii platformei Baterino, transportul este gratuit. Rețeaua națională Baterino ne permite să îți livrăm produsul în cel mai scurt timp.',
  }
}

export default function CartPage() {
  const { lines, itemCount, setLineQty, removeLine } = useCart()
  const navigate = useNavigate()
  const { language } = useLanguage()
  const lang = language.code as LangCode
  const { currency } = useCatalogCurrency()
  const p = getProductPricingTranslations(lang, currency)
  const labels = cartLabels(lang)
  const anyCartLineProgramDiscount = useMemo(
    () => lines.some((l) => cartLineDiscountPercent(l) > 0),
    [lines],
  )
  const programLabelById = useReducereProgramLabels(lang, anyCartLineProgramDiscount)
  const cartProgramDiscountTr = getCartProgramDiscountTranslations(lang)

  const locale = lang === 'en' ? 'en-GB' : lang === 'zh' ? 'zh-CN' : 'ro-RO'
  const fmtMoney = (n: number) =>
    n.toLocaleString(locale, { maximumFractionDigits: 0, minimumFractionDigits: 0 })

  /** Schimbă la produse / reduceri / limbă — nu include cantitatea. */
  const priceFetchKey = useMemo(
    () => [...lines].map(cartLineMergeKey).sort().join('|'),
    [lines],
  )

  const [linePrices, setLinePrices] = useState<Record<string, LinePriceState>>({})
  const linesRef = useRef(lines)
  linesRef.current = lines
  const linePricesRef = useRef(linePrices)
  linePricesRef.current = linePrices

  useEffect(() => {
    const snapshot = linesRef.current
    if (snapshot.length === 0) {
      setLinePrices({})
      return
    }

    const prev = linePricesRef.current
    const toFetch = snapshot.filter((line) => {
      const lk = cartLineMergeKey(line)
      const p = prev[lk]
      const d = cartLineDiscountPercent(line)
      if (p?.status === 'ok' && p.discountPercent === d && p.fetchedLang === lang) return false
      return true
    })

    const fetchSet = new Set(toFetch.map((l) => cartLineMergeKey(l)))
    setLinePrices((prevState) => {
      const next: Record<string, LinePriceState> = {}
      for (const line of snapshot) {
        const lk = cartLineMergeKey(line)
        if (fetchSet.has(lk)) {
          next[lk] = { status: 'loading' }
        } else {
          const row = prevState[lk]
          next[lk] = row ?? { status: 'loading' }
        }
      }
      return next
    })

    if (toFetch.length === 0) return

    let cancelled = false
    ;(async () => {
      const patch: Record<string, LinePriceState> = {}
      const errMsg =
        lang === 'en'
          ? 'Price unavailable for this product.'
          : lang === 'zh'
            ? '无法显示此产品价格。'
            : 'Preț indisponibil pentru acest produs.'

      for (const line of toFetch) {
        const lk = cartLineMergeKey(line)
        try {
          const row = await getProductAsGuest(line.slug || line.productId)
          if (!showResidentialClientPurchaseUI(row)) {
            patch[lk] = { status: 'error', message: errMsg }
            continue
          }
          const sale = num(row.salePrice)
          if (sale == null || sale <= 0) {
            patch[lk] = { status: 'error', message: errMsg }
            continue
          }
          const vatPct = num((row as { vat?: string | number | null }).vat)
          const hasVat = vatPct != null && vatPct > 0
          const vp = hasVat && vatPct != null ? vatPct : null
          const unitListExclVat = sale
          const discountPercent = cartLineDiscountPercent(line)
          const unitNetExclAfterDiscount = unitListExclVat * (1 - discountPercent / 100)
          const unitExclVat = unitNetExclAfterDiscount
          const unitInclVat =
            vp != null && vp > 0 ? unitNetExclAfterDiscount * (1 + vp / 100) : unitNetExclAfterDiscount
          const unitVatAmount = Math.max(0, unitInclVat - unitExclVat)
          patch[lk] = {
            status: 'ok',
            unitInclVat,
            unitExclVat,
            unitVatAmount,
            vatPercent: vp,
            unitListExclVat,
            discountPercent,
            specs: extractCartLineSpecsFromProduct(row),
            cardImageUrl: getProductCardImageUrl(row),
            fetchedLang: lang,
          }
        } catch {
          patch[lk] = { status: 'error', message: errMsg }
        }
      }
      if (!cancelled) setLinePrices((prevState) => ({ ...prevState, ...patch }))
    })()

    return () => {
      cancelled = true
    }
  }, [priceFetchKey, lang])

  const { cartSum, cartExclSum, cartVatSum, cartListExclSum, cartDiscountExclSum, allLinesOk, anyLoading } =
    useMemo(() => {
      let sumIncl = 0
      let sumExcl = 0
      let sumVat = 0
      let sumListExcl = 0
      let sumDiscountExcl = 0
      let loading = false
      let allOk = lines.length > 0
      for (const line of lines) {
        const pr = linePrices[cartLineMergeKey(line)]
        if (pr == null || pr.status === 'loading') {
          loading = true
          allOk = false
          continue
        }
        if (pr.status === 'error') {
          allOk = false
          continue
        }
        const q = line.qty
        sumIncl += pr.unitInclVat * q
        sumExcl += pr.unitExclVat * q
        sumVat += pr.unitVatAmount * q
        sumListExcl += pr.unitListExclVat * q
        if (pr.discountPercent > 0) {
          sumDiscountExcl += (pr.unitListExclVat - pr.unitExclVat) * q
        }
      }
      return {
        cartSum: sumIncl,
        cartExclSum: sumExcl,
        cartVatSum: sumVat,
        cartListExclSum: sumListExcl,
        cartDiscountExclSum: sumDiscountExcl,
        allLinesOk: allOk && lines.length > 0,
        anyLoading: loading,
      }
    }, [lines, linePrices])

  if (itemCount === 0) {
    return (
      <div className="max-w-content mx-auto px-4 py-16 sm:py-20">
        <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Coșul tău</h1>
        <p className="text-slate-600 font-['Inter'] mb-6">Coșul este gol.</p>
        <Link to="/produse" className="inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white">
          Produse
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-content mx-auto px-4 py-10 sm:py-12">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Coșul tău ({itemCount})</h1>

      <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
        {lines.map((line) => {
          const lineKey = cartLineMergeKey(line)
          const pr = linePrices[lineKey]
          const thumb =
            (pr?.status === 'ok' ? pr.cardImageUrl : '') ||
            line.imageUrl?.trim() ||
            getProductCardImageUrl({ images: [], cardImage: null })
          const unitIncl = pr?.status === 'ok' ? pr.unitInclVat : null
          const lineExcl = pr?.status === 'ok' ? pr.unitExclVat * line.qty : null
          const lineVat = pr?.status === 'ok' ? pr.unitVatAmount * line.qty : null
          const lineTotal = unitIncl != null ? unitIncl * line.qty : null
          const vatPctDisp = pr?.status === 'ok' ? pr.vatPercent : null
          const lineListExcl = pr?.status === 'ok' ? pr.unitListExclVat * line.qty : null
          const lineDiscExcl =
            pr?.status === 'ok' && pr.discountPercent > 0
              ? (pr.unitListExclVat - pr.unitExclVat) * line.qty
              : null
          const showDiscBreakdown = pr?.status === 'ok' && pr.discountPercent > 0
          const lineMaxQty = cartLineMaxQty(line)
          const qtyLocked = cartLineQtyLocked(line)

          return (
            <li key={lineKey} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:justify-between">
              <div className="flex min-w-0 flex-1 gap-4">
                <CartLineProductThumbLink
                  to={`/produse/${encodeURIComponent(line.slug)}`}
                  src={thumb}
                  lang={lang}
                />
                <div className="min-w-0 flex flex-col justify-center">
                  <p className="font-semibold text-slate-900 font-['Inter']">{line.title}</p>
                  {pr?.status === 'ok' ? (
                    <CartLineSpecDetails specs={pr.specs} lang={lang} />
                  ) : pr?.status === 'loading' || pr == null ? (
                    <CartLineSpecsSkeleton ariaLabel={labels.loadingPrices} />
                  ) : null}
                  <CartLineProgramDiscountMark
                    line={line}
                    programLabelById={programLabelById}
                    tr={cartProgramDiscountTr}
                  />
                  {pr?.status === 'error' ? (
                    <p className="mt-2 text-xs text-amber-800 font-['Inter']">{pr.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:gap-6 sm:border-t-0 sm:pt-0 sm:pl-2">
                <div className="flex flex-col gap-1">
                  <span
                    className={`text-xs font-medium font-['Inter'] ${qtyLocked ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    {labels.qty}
                  </span>
                  <div
                    className={`flex items-center gap-1 rounded-lg ${qtyLocked ? 'bg-slate-50 opacity-80' : ''}`}
                  >
                    <button
                      type="button"
                      aria-label={lang === 'en' ? 'Decrease quantity' : 'Scade cantitatea'}
                      disabled={qtyLocked || line.qty <= 1}
                      onClick={() => setLineQty(lineKey, line.qty - 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <Minus className="h-4 w-4" strokeWidth={2.25} />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={lineMaxQty}
                      value={line.qty}
                      disabled={qtyLocked}
                      aria-label={labels.qty}
                      onChange={(e) => setLineQty(lineKey, parseInt(e.target.value, 10) || 1)}
                      className="h-9 w-14 rounded-lg border border-slate-200 px-1 text-center text-sm font-semibold tabular-nums font-['Inter'] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 disabled:opacity-90"
                    />
                    <button
                      type="button"
                      aria-label={lang === 'en' ? 'Increase quantity' : 'Crește cantitatea'}
                      disabled={qtyLocked || line.qty >= lineMaxQty}
                      onClick={() => setLineQty(lineKey, line.qty + 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <Plus className="h-4 w-4" strokeWidth={2.25} />
                    </button>
                  </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-center sm:min-w-[200px]">
                  {pr?.status === 'loading' || pr == null ? (
                    <div className="min-h-[5.5rem] py-1">
                      <CartLinePriceBreakdownSkeleton ariaLabel={labels.loadingPrices} />
                    </div>
                  ) : pr.status === 'ok' ? (
                    <div className="w-full space-y-2 font-['Inter']">
                      {showDiscBreakdown ? (
                        <>
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-xs text-slate-500">{labels.productPriceExcl}</span>
                            <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                              {fmtMoney(lineListExcl!)} {p.currencySuffix}
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-xs text-slate-500">
                              {labels.discount} (−{String(pr.discountPercent).replace(/\.0+$/, '')}%)
                            </span>
                            <span className="shrink-0 text-sm font-semibold tabular-nums text-emerald-800">
                              −{fmtMoney(lineDiscExcl!)} {p.currencySuffix}
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-xs text-slate-500">
                              {vatPctDisp != null && vatPctDisp > 0
                                ? `${labels.vatPrefix} ${vatPctDisp}%`
                                : labels.vatPrefix}
                            </span>
                            <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                              {fmtMoney(lineVat!)} {p.currencySuffix}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-xs text-slate-500">{labels.productPriceExcl}</span>
                            <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                              {fmtMoney(lineExcl!)} {p.currencySuffix}
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-xs text-slate-500">
                              {vatPctDisp != null && vatPctDisp > 0
                                ? `${labels.vatPrefix} ${vatPctDisp}%`
                                : labels.vatPrefix}
                            </span>
                            <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                              {fmtMoney(lineVat!)} {p.currencySuffix}
                            </span>
                          </div>
                        </>
                      )}
                      <div className="flex items-baseline justify-between gap-3 border-t border-slate-200 pt-2">
                        <span className="text-xs font-semibold text-slate-600">{labels.totalFinal}</span>
                        <span className="shrink-0 text-base font-extrabold tabular-nums text-slate-900">
                          {fmtMoney(lineTotal!)} {p.currencySuffix}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400 font-['Inter']">—</span>
                  )}
                </div>

                <div className="flex items-end sm:items-center">
                  <button
                    type="button"
                    onClick={() => removeLine(lineKey)}
                    className="text-sm font-medium text-red-600 hover:text-red-700 font-['Inter']"
                  >
                    {labels.remove}
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-6 flex flex-col gap-4 font-['Inter'] lg:flex-row lg:items-stretch lg:gap-6">
        <div className="flex min-w-0 flex-1 items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-5 sm:px-6">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 ring-1 ring-slate-100 sm:h-24 sm:w-24"
            aria-hidden
          >
            <Truck className="h-10 w-10 sm:h-12 sm:w-12" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900">{labels.freeShippingTitle}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{labels.freeShippingBody}</p>
          </div>
        </div>

        <div className="w-full shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-5 sm:px-6 lg:w-72 lg:max-w-full">
          <p className="text-sm font-semibold text-slate-800">{labels.cartTotal}</p>
          {anyLoading ? (
            <CartOrderSummarySkeleton ariaLabel={labels.loadingPrices} />
          ) : allLinesOk ? (
            <div className="mt-2 space-y-2">
              {cartDiscountExclSum > 0 ? (
                <>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-slate-600">{labels.cartProductExcl}</span>
                    <span className="shrink-0 font-semibold tabular-nums text-slate-900">
                      {fmtMoney(cartListExclSum)} {p.currencySuffix}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-slate-600">{labels.cartDiscountExcl}</span>
                    <span className="shrink-0 font-semibold tabular-nums text-emerald-800">
                      −{fmtMoney(cartDiscountExclSum)} {p.currencySuffix}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-slate-600">{labels.cartVatTotal}</span>
                    <span className="shrink-0 font-semibold tabular-nums text-slate-900">
                      {fmtMoney(cartVatSum)} {p.currencySuffix}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-slate-600">{labels.cartProductExcl}</span>
                    <span className="shrink-0 font-semibold tabular-nums text-slate-900">
                      {fmtMoney(cartExclSum)} {p.currencySuffix}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-slate-600">{labels.cartVatTotal}</span>
                    <span className="shrink-0 font-semibold tabular-nums text-slate-900">
                      {fmtMoney(cartVatSum)} {p.currencySuffix}
                    </span>
                  </div>
                </>
              )}
              <div className="flex items-baseline justify-between gap-3 border-t border-slate-200 pt-2">
                <span className="font-semibold text-slate-800">{labels.totalFinal}</span>
                <span className="shrink-0 text-xl font-extrabold tabular-nums text-slate-900">
                  {fmtMoney(cartSum)} {p.currencySuffix}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-amber-800">
              {lang === 'en'
                ? 'Some lines have no price; check products or remove them before checkout.'
                : lang === 'zh'
                  ? '部分商品无法计价，请处理后再结算。'
                  : 'Unele produse nu au preț afișat; verifică sau elimină din coș înainte de plată.'}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => navigate('/comanda')}
          className="min-h-12 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white hover:bg-slate-800"
        >
          Finalizează comanda ({p.currencySuffix})
        </button>
        <Link
          to="/produse"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 px-6 text-sm font-bold text-slate-900"
        >
          Continuă cumpărăturile
        </Link>
      </div>
    </div>
  )
}
