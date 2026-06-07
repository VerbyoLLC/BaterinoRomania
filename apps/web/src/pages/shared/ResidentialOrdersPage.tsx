import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Ban,
  Check,
  Copy,
  CreditCard,
  Download,
  Loader2,
  MoreVertical,
  Package,
  X,
} from 'lucide-react'
import {
  getAuthEmail,
  getProductCardImageUrl,
  type ClientOrderLine,
  type ClientOrderRow,
  type ClientPaymentBankDetails,
} from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'
import type { LangCode } from '../../i18n/menu'
import {
  type ClientOrdersTranslations,
  fulfillmentStatusBorderLeftClass,
  fulfillmentStatusLabel,
  getClientOrdersTranslations,
} from '../../i18n/client-orders'
import { CONTACT_WHATSAPP_WAME } from '../../lib/contactWhatsApp'

export type ResidentialOrdersPortalApi = {
  getOrders: () => Promise<ClientOrderRow[]>
  getPaymentBankDetails: () => Promise<ClientPaymentBankDetails>
  downloadProforma: (orderId: string, orderNumber: string) => Promise<{ downloadUrl: string }>
  downloadInvoice: (orderId: string, orderNumber: string) => Promise<void>
  cancelOrder: (orderId: string) => Promise<{ fulfillmentStatus: string }>
}

const skBar = 'animate-pulse rounded-md bg-slate-200/80'

function WhatsappGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function OrdersListSkeleton() {
  return (
    <div className="space-y-5 font-['Inter']" aria-busy="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-col lg:min-h-[160px] lg:flex-row">
            <div className="flex min-h-[100px] w-full flex-col justify-between gap-3 bg-slate-800 px-5 py-4 lg:w-[11.5rem] lg:shrink-0">
              <span className={`h-3 w-16 bg-white/20 ${skBar}`} />
              <span className={`h-5 w-36 bg-white/20 ${skBar}`} />
              <span className={`h-7 w-24 rounded-md bg-white/10 ${skBar}`} />
            </div>
            <div className="grid flex-1 grid-cols-1 gap-4 p-5 lg:grid-cols-12 lg:gap-x-5">
              <div className="flex items-center gap-3 lg:col-span-5">
                <span className={`h-14 w-14 shrink-0 rounded-xl ${skBar}`} />
                <span className={`h-4 flex-1 max-w-xs ${skBar}`} />
              </div>
              <div className="flex items-center gap-2 border-t border-slate-100 pt-4 lg:col-span-2 lg:border-t-0 lg:pt-0">
                <span className={`hidden h-3 w-14 sm:block lg:block ${skBar}`} />
                <span className={`h-5 w-8 ${skBar}`} />
              </div>
              <div className="border-t border-slate-100 pt-4 lg:col-span-5 lg:border-t-0 lg:pt-0">
                <span className={`mb-1 block h-3 w-12 ${skBar}`} />
                <span className={`block h-8 w-32 ${skBar}`} />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-200/80 bg-slate-50/50 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div className="flex items-center gap-2">
              <span className={`h-3 w-24 ${skBar}`} />
              <span className={`h-5 w-32 ${skBar}`} />
              <span className={`h-8 w-8 shrink-0 rounded-lg ${skBar}`} />
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`h-11 w-28 rounded-full ${skBar}`} />
              <span className={`h-11 w-32 rounded-full ${skBar}`} />
              <span className={`h-11 w-28 rounded-full ${skBar}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function formatDate(iso: string, lang: LangCode): string {
  const loc = lang === 'en' ? 'en-GB' : 'ro-RO'
  return new Date(iso).toLocaleString(loc, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function moneyLocale(lang: LangCode): string {
  return lang === 'en' ? 'en-GB' : 'ro-RO'
}

function parseMoneyField(raw: string | null | undefined): number | null {
  if (raw == null || raw === '') return null
  const n = Number(String(raw).trim().replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function computeLineVatBreakdown(L: ClientOrderLine): {
  lineNet: number | null
  lineVat: number | null
  lineIncl: number | null
  vatPct: number | null
} {
  const qty = Math.max(0, Number(L.quantity) || 0)
  const vatPctRaw = parseMoneyField(L.vatPercent)
  const vatRate = vatPctRaw != null && vatPctRaw >= 0 ? vatPctRaw / 100 : null

  const unitIncl = parseMoneyField(L.unitPriceInclVat)
  let lineIncl = parseMoneyField(L.lineTotalInclVat)

  if (lineIncl == null && unitIncl != null && qty > 0) {
    lineIncl = unitIncl * qty
  }

  if (lineIncl == null) {
    return { lineNet: null, lineVat: null, lineIncl: null, vatPct: vatPctRaw }
  }

  if (vatRate == null || vatRate === 0) {
    return {
      lineNet: lineIncl,
      lineVat: 0,
      lineIncl,
      vatPct: vatPctRaw ?? 0,
    }
  }

  const lineNet = lineIncl / (1 + vatRate)
  const lineVat = lineIncl - lineNet
  return {
    lineNet,
    lineVat,
    lineIncl,
    vatPct: vatPctRaw,
  }
}

function aggregateLinesMoney(lines: ClientOrderLine[]): {
  lineNet: number | null
  lineVat: number | null
  lineIncl: number | null
} {
  let net = 0
  let vat = 0
  let incl = 0
  let n = 0
  for (const L of lines) {
    const b = computeLineVatBreakdown(L)
    if (b.lineIncl != null) {
      n += 1
      incl += b.lineIncl
      net += b.lineNet ?? 0
      vat += b.lineVat ?? 0
    }
  }
  if (n === 0) return { lineNet: null, lineVat: null, lineIncl: null }
  return { lineNet: net, lineVat: vat, lineIncl: incl }
}

function formatMoneyValue(n: number | null, currency: string, lang: LangCode): string {
  if (n == null || !Number.isFinite(n)) return '—'
  const cur = String(currency || 'RON').trim() || 'RON'
  const formatted = new Intl.NumberFormat(moneyLocale(lang), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
  return `${formatted} ${cur}`
}

function VatBreakdownBlock({
  lineNet,
  lineVat,
  lineIncl,
  vatPct,
  currency,
  lang,
  tr,
  labels,
  emphasizeGrandTotal = false,
}: {
  lineNet: number | null
  lineVat: number | null
  lineIncl: number | null
  vatPct: number | null
  currency: string
  lang: LangCode
  tr: ClientOrdersTranslations
  labels?: { excl: string; vat: string; incl: string }
  /** Larger “total incl. VAT” row — order summary. */
  emphasizeGrandTotal?: boolean
}) {
  const exclL = labels?.excl ?? tr.priceOrderExclVat
  const vatL = labels?.vat ?? tr.priceOrderVat
  const inclL = labels?.incl ?? tr.priceItemInclVat
  const pctLabel =
    vatPct != null && vatPct > 0
      ? ` (${new Intl.NumberFormat(moneyLocale(lang), { maximumFractionDigits: 2 }).format(vatPct)}%)`
      : ''
  const subRow = emphasizeGrandTotal
    ? 'text-[11px] leading-snug text-slate-500'
    : 'text-xs text-slate-600'
  const subDd = emphasizeGrandTotal ? 'font-medium text-slate-700' : 'font-medium text-slate-800'

  return (
    <dl className={`m-0 space-y-1 ${emphasizeGrandTotal ? '' : 'text-xs text-slate-600'}`}>
      <div className={`flex justify-between gap-3 tabular-nums ${subRow}`}>
        <dt className="text-left font-normal">{exclL}</dt>
        <dd className={`m-0 ${subDd}`}>{formatMoneyValue(lineNet, currency, lang)}</dd>
      </div>
      <div className={`flex justify-between gap-3 tabular-nums ${subRow}`}>
        <dt className="text-left font-normal">
          {vatL}
          {pctLabel}
        </dt>
        <dd className={`m-0 ${subDd}`}>{formatMoneyValue(lineVat, currency, lang)}</dd>
      </div>
      <div
        className={`flex justify-between gap-3 tabular-nums text-slate-900 ${
          emphasizeGrandTotal
            ? 'mt-2 border-t border-slate-200 pt-3 text-xl font-bold tracking-tight'
            : 'font-semibold'
        }`}
      >
        <dt className={`text-left ${emphasizeGrandTotal ? 'font-bold' : 'font-normal'}`}>{inclL}</dt>
        <dd className="m-0">{formatMoneyValue(lineIncl, currency, lang)}</dd>
      </div>
    </dl>
  )
}

function OrderLinePriceWithVat({
  line,
  currency,
  lang,
  tr,
  align = 'start',
  showDiscount = true,
}: {
  line: ClientOrderLine
  currency: string
  lang: LangCode
  tr: ClientOrdersTranslations
  align?: 'start' | 'end'
  showDiscount?: boolean
}) {
  const qty = Math.max(0, Number(line.quantity) || 0)
  const unitIncl = parseMoneyField(line.unitPriceInclVat)
  let lineIncl = parseMoneyField(line.lineTotalInclVat)
  if (lineIncl == null && unitIncl != null && qty > 0) lineIncl = unitIncl * qty
  const cur = String(currency || 'RON').trim() || 'RON'

  const listLine = showDiscount ? parseMoneyField(line.listLineTotalInclVat) : null
  let discountAmt: number | null = null
  if (listLine != null && lineIncl != null && listLine > lineIncl + 0.009) {
    discountAmt = listLine - lineIncl
  }

  const boxAlign = align === 'end' ? 'items-end text-right' : 'items-start text-left'

  return (
    <div className={`flex flex-col gap-0.5 ${boxAlign}`}>
      {discountAmt != null && listLine != null ? (
        <>
          <span className="text-xs tabular-nums text-slate-400 line-through">
            {formatMoneyValue(listLine, cur, lang)}
          </span>
          <span className="text-[11px] font-medium tabular-nums text-emerald-700">
            −{formatMoneyValue(discountAmt, cur, lang)}{' '}
            <span className="font-normal opacity-90">{tr.orderLineDiscount}</span>
          </span>
        </>
      ) : null}
      <span className="text-sm font-semibold tabular-nums text-slate-900">
        {formatMoneyValue(lineIncl, cur, lang)}
      </span>
    </div>
  )
}

function OrderTotalsBreakdown({
  lines,
  currency,
  lang,
  tr,
}: {
  lines: ClientOrderLine[]
  currency: string
  lang: LangCode
  tr: ClientOrdersTranslations
}) {
  return (
    <VatBreakdownBlock
      {...aggregateLinesMoney(lines)}
      vatPct={null}
      emphasizeGrandTotal
      labels={{
        excl: tr.priceOrderExclVat,
        vat: tr.priceOrderVat,
        incl: tr.priceItemInclVat,
      }}
      currency={currency}
      lang={lang}
      tr={tr}
    />
  )
}

/** Destinație link linie comandă în listă rezidențială; partenerul deschide sertarul Produse cu `detail`. */
function orderLineCatalogHref(productsHref: string, line: ClientOrderLine): string {
  const base = String(productsHref ?? '')
    .trim()
    .replace(/\/+$/, '')
  const partnerListing = /^\/partner\/produse$/i.test(base)
  if (partnerListing) {
    return `/partner/produse?detail=${encodeURIComponent(line.productId)}`
  }
  return line.productSlug
    ? `/produse/${encodeURIComponent(line.productSlug)}`
    : `/produse/${encodeURIComponent(line.productId)}`
}

export function ResidentialOrdersPage({
  ordersApi,
  productsHref = '/produse',
  showDiscount = true,
}: {
  ordersApi: ResidentialOrdersPortalApi
  /** Catalog rezidențial: client `/produse`, partener `/partner/produse`. */
  productsHref?: string
  /** Afișează prețul de listă barat + reducere pe fiecare linie. Default true. */
  showDiscount?: boolean
}) {
  const { language } = useLanguage()
  const lang = language.code as LangCode
  const tr = getClientOrdersTranslations(lang)

  const [orders, setOrders] = useState<ClientOrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [actionKind, setActionKind] = useState<'proforma' | 'cancel' | 'invoice' | null>(null)
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const menuContainerRef = useRef<HTMLDivElement | null>(null)
  const [payOrder, setPayOrder] = useState<ClientOrderRow | null>(null)
  const [bankDetails, setBankDetails] = useState<ClientPaymentBankDetails | null>(null)
  const [bankError, setBankError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    if (!menuOpenId) return
    const onDocClick = (e: MouseEvent) => {
      const node = menuContainerRef.current
      if (!node) return
      if (e.target instanceof Node && node.contains(e.target)) return
      setMenuOpenId(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpenId(null)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpenId])

  useEffect(() => {
    if (!payOrder) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPayOrder(null)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [payOrder])

  useEffect(() => {
    if (!payOrder) {
      setBankDetails(null)
      setBankError(null)
      return
    }
    let cancelled = false
    setBankError(null)
    void (async () => {
      try {
        const data = await ordersApi.getPaymentBankDetails()
        if (!cancelled) setBankDetails(data)
      } catch (e) {
        if (!cancelled) setBankError(e instanceof Error ? e.message : tr.payModalErrorGeneric)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [payOrder?.id, tr.payModalErrorGeneric, ordersApi])

  const copyPayField = useCallback(
    async (fieldId: string, value: string) => {
      const text = String(value || '').trim()
      if (!text) return
      try {
        await navigator.clipboard.writeText(text)
        setCopiedField(fieldId)
        window.setTimeout(
          () => setCopiedField((id) => (id === fieldId ? null : id)),
          1800,
        )
      } catch {
        setError(
          lang === 'en'
            ? 'Could not copy to clipboard.'
              : 'Nu s-a putut copia în clipboard.',
        )
      }
    },
    [lang],
  )

  const copyOrderNumberToClipboard = useCallback(
    async (orderId: string, orderNumber: string) => {
      const text = String(orderNumber || '').trim()
      if (!text) return
      try {
        await navigator.clipboard.writeText(text)
        setCopiedOrderId(orderId)
        window.setTimeout(() => setCopiedOrderId((id) => (id === orderId ? null : id)), 2000)
      } catch {
        setError(
          lang === 'en'
            ? 'Could not copy to clipboard.'
              : 'Nu s-a putut copia în clipboard.',
        )
      }
    },
    [lang],
  )

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    return ordersApi
      .getOrders()
      .then((rows) => setOrders(rows))
      .catch((e) => setError(e instanceof Error ? e.message : tr.errorGeneric))
      .finally(() => setLoading(false))
  }, [tr.errorGeneric, ordersApi])

  useEffect(() => {
    void load()
  }, [load])

  async function onDownloadProforma(o: ClientOrderRow) {
    setActionId(o.id)
    setActionKind('proforma')
    try {
      await ordersApi.downloadProforma(o.id, o.orderNumber)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : tr.errorGeneric)
    } finally {
      setActionId(null)
      setActionKind(null)
    }
  }

  async function onDownloadInvoice(o: ClientOrderRow) {
    setActionId(o.id)
    setActionKind('invoice')
    try {
      await ordersApi.downloadInvoice(o.id, o.orderNumber)
    } catch (e) {
      setError(e instanceof Error ? e.message : tr.errorGeneric)
    } finally {
      setActionId(null)
      setActionKind(null)
    }
  }

  function onPayOnline(o: ClientOrderRow) {
    setPayOrder(o)
  }

  async function onCancel(o: ClientOrderRow) {
    if (!window.confirm(tr.cancelConfirm)) return
    setActionId(o.id)
    setActionKind('cancel')
    try {
      await ordersApi.cancelOrder(o.id)
      setOrders((prev) =>
        prev.map((row) =>
          row.id === o.id ? { ...row, fulfillmentStatus: 'anulata' } : row,
        ),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : tr.errorGeneric)
    } finally {
      setActionId(null)
      setActionKind(null)
    }
  }

  if (loading) {
    return (
      <div className="font-['Inter']">
        <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">{tr.title}</h1>
        <p className="text-slate-500 text-sm font-['Inter'] mb-6">{tr.loading}</p>
        <OrdersListSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="font-['Inter']">
        <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">{tr.title}</h1>
        <p className="text-red-600 text-sm font-['Inter'] mb-4">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 font-['Inter']"
        >
          {lang === 'en' ? 'Retry' : 'Reîncearcă'}
        </button>
      </div>
    )
  }

  return (
    <div className="font-['Inter']">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">{tr.title}</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500 text-sm font-['Inter'] mb-8">{tr.pageSubtitle}</p>
      ) : (
        <p className="text-slate-500 text-sm mb-6">
          {tr.orderCount.replace('{n}', String(orders.length))}
        </p>
      )}

      {orders.length === 0 ? (
        <>
          <p className="sr-only">{tr.empty}</p>
          <div className="mx-auto w-full max-w-md bg-white rounded-2xl border border-gray-200 p-10 sm:p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" strokeWidth={1.5} aria-hidden />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">{tr.emptyStateCardTitle}</h2>
            <p className="text-gray-500 text-sm mx-auto leading-relaxed">
              <span className="block">{tr.emptyStateLine1}</span>
              <span className="block mt-2">{tr.emptyStateLine2}</span>
            </p>
            <Link
              to={productsHref}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              {tr.seeProducts}
            </Link>
          </div>
        </>
      ) : (
        <ul className="m-0 list-none space-y-5 p-0">
          {orders.map((o) => {
            const status = String(o.fulfillmentStatus || 'de_platit')
            const hasProforma = Boolean(o.proformaUrl && String(o.proformaUrl).trim())
            const busy = actionId === o.id
            const showCancel = status === 'de_platit'
            const showProforma = status === 'de_platit' || status === 'preluata'
            const invoicePhase =
              status === 'in_pregatire' || status === 'in_curs_livrare' || status === 'livrata'
            const showInvoiceDownload = invoicePhase && Boolean(o.clientHasInvoice)
            const showInvoicePending = invoicePhase && !o.clientHasInvoice
            const statusText = fulfillmentStatusLabel(tr, status, {
              hasProforma: status === 'de_platit' && hasProforma,
            })
            const borderAccent = fulfillmentStatusBorderLeftClass(status)
            const lines = o.lines || []
            const clientEmail = (getAuthEmail() ?? '').trim() || '—'
            const orderHelpWhatsappText = tr.whatsappHelpPrefill
              .replace(/{orderNumber}/g, String(o.orderNumber ?? '').trim())
              .replace(/{orderDate}/g, formatDate(o.createdAt, lang))
              .replace(/{clientEmail}/g, clientEmail)
            const orderHelpWhatsappHref = `https://wa.me/${CONTACT_WHATSAPP_WAME}?text=${encodeURIComponent(orderHelpWhatsappText)}`

            return (
              <li key={o.id}>
                <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-8px_rgba(15,23,42,0.12)] transition hover:shadow-[0_8px_30px_-8px_rgba(15,23,42,0.16)]">
                  <div className="flex min-h-0 flex-col lg:min-h-[168px] lg:flex-row">
                    <div className="flex flex-col gap-4 bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 px-5 py-5 text-white lg:w-[11.75rem] lg:shrink-0 lg:justify-between lg:py-6">
                      <div>
                        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                          {tr.colDate}
                        </p>
                        <p className="mt-1.5 m-0 text-sm font-semibold tabular-nums leading-snug text-white">
                          {formatDate(o.createdAt, lang)}
                        </p>
                      </div>
                      <div className="lg:hidden">
                        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                          {tr.colOrderNumber}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold tabular-nums text-white">
                            {o.orderNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => void copyOrderNumberToClipboard(o.id, o.orderNumber)}
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white/80 transition hover:border-white/25 hover:bg-white/20 hover:text-white"
                            aria-label={tr.copyOrderNumber}
                          >
                            {copiedOrderId === o.id ? (
                              <Check className="h-4 w-4 text-emerald-300" strokeWidth={2.25} aria-hidden />
                            ) : (
                              <Copy className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                            )}
                          </button>
                          {copiedOrderId === o.id ? (
                            <span className="text-xs font-medium text-emerald-300" role="status">
                              {tr.copied}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div>
                        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                          {tr.colStatus}
                        </p>
                        <p
                          className={`mt-2 m-0 border-l-[3px] ${borderAccent} pl-2.5 text-sm font-semibold leading-snug text-white/95`}
                        >
                          {statusText}
                        </p>
                      </div>
                    </div>

                    <div className="grid min-w-0 flex-1 grid-cols-1 gap-5 p-5 lg:grid-cols-12 lg:gap-x-5 lg:gap-y-0 lg:p-6">
                      <div className="min-w-0 lg:col-span-5">
                        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                          {tr.colProduct}
                        </p>
                        <ul className="m-0 mt-2.5 list-none space-y-3 p-0">
                          {lines.map((L) => {
                            const href = orderLineCatalogHref(productsHref, L)
                            const src =
                              (L.imageUrl && String(L.imageUrl).trim()) ||
                              getProductCardImageUrl({ images: [], cardImage: null })
                            return (
                              <li key={L.id} className="min-w-0">
                                <div className="flex min-h-14 min-w-0 items-start gap-3">
                                  <Link
                                    to={href}
                                    className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200/90 transition hover:ring-slate-300"
                                  >
                                    <img
                                      src={src}
                                      alt=""
                                      className="h-full w-full object-contain p-1"
                                      loading="lazy"
                                    />
                                  </Link>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                      <Link
                                        to={href}
                                        className="text-[0.95rem] font-semibold leading-snug text-slate-900 underline-offset-2 hover:underline"
                                      >
                                        {L.productTitle}
                                      </Link>
                                      <span
                                        className="inline-block align-middle text-[0.95rem] font-semibold tabular-nums text-slate-500 lg:hidden"
                                        aria-label={tr.colQuantity}
                                      >
                                        × {L.quantity}
                                      </span>
                                    </div>
                                    {L.catalogSpecLine1 || L.catalogSpecLine2 ? (
                                      <div className="mt-1 space-y-0.5">
                                        {L.catalogSpecLine1 ? (
                                          <p className="m-0 text-center text-[11px] font-normal leading-snug text-slate-600 sm:text-left">
                                            {L.catalogSpecLine1}
                                          </p>
                                        ) : null}
                                        {L.catalogSpecLine2 ? (
                                          <p className="m-0 text-center text-[11px] font-normal leading-snug text-slate-600 sm:text-left">
                                            {L.catalogSpecLine2}
                                          </p>
                                        ) : null}
                                      </div>
                                    ) : null}
                                    <div className="mt-2 lg:hidden">
                                      <OrderLinePriceWithVat
                                        line={L}
                                        currency={o.currency}
                                        lang={lang}
                                        tr={tr}
                                        align="start"
                                        showDiscount={showDiscount}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      </div>

                      <div className="hidden lg:col-span-2 lg:flex lg:flex-col">
                        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                          {tr.colQuantity}
                        </p>
                        <ul className="m-0 mt-2.5 list-none space-y-3 p-0">
                          {lines.map((L) => (
                            <li
                              key={`${L.id}-qty`}
                              className="flex min-h-14 items-center text-sm font-semibold tabular-nums text-slate-800"
                            >
                              {L.quantity}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="hidden lg:col-span-5 lg:flex lg:flex-col lg:border-t-0 lg:pt-0">
                        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                          {tr.colPrice}
                        </p>
                        <ul className="m-0 mt-2.5 list-none space-y-3 p-0">
                          {lines.map((L) => (
                            <li
                              key={`${L.id}-price`}
                              className="flex min-h-14 min-w-0 items-center justify-end"
                            >
                              <OrderLinePriceWithVat
                                line={L}
                                currency={o.currency}
                                lang={lang}
                                tr={tr}
                                align="end"
                                showDiscount={showDiscount}
                              />
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 border-t border-slate-100 pt-3">
                          <p className="m-0 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            {tr.orderTotalsHeading}
                          </p>
                          <OrderTotalsBreakdown lines={lines} currency={o.currency} lang={lang} tr={tr} />
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-4 lg:hidden">
                        <p className="m-0 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                          {tr.orderTotalsHeading}
                        </p>
                        <OrderTotalsBreakdown lines={lines} currency={o.currency} lang={lang} tr={tr} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 border-t border-slate-200/90 bg-slate-50/50 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
                    <div className="hidden min-w-0 sm:flex-row sm:items-center sm:gap-3 lg:flex lg:flex-col lg:items-start lg:gap-1">
                      <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        {tr.colOrderNumber}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-semibold tabular-nums text-slate-900">
                          {o.orderNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => void copyOrderNumberToClipboard(o.id, o.orderNumber)}
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200/90 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                          aria-label={tr.copyOrderNumber}
                        >
                          {copiedOrderId === o.id ? (
                            <Check className="h-4 w-4 text-emerald-600" strokeWidth={2.25} aria-hidden />
                          ) : (
                            <Copy className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                          )}
                        </button>
                        {copiedOrderId === o.id ? (
                          <span className="text-xs font-medium text-emerald-700" role="status">
                            {tr.copied}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:justify-end">
                      {showCancel ? (
                        <button
                          type="button"
                          onClick={() => onPayOnline(o)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-900/5 transition hover:border-slate-300 hover:bg-slate-50 lg:w-auto"
                          aria-label={tr.payOnline}
                        >
                          <CreditCard
                            className="h-4 w-4 shrink-0 text-slate-600"
                            strokeWidth={2.25}
                            aria-hidden
                          />
                          <span>{tr.payOnline}</span>
                        </button>
                      ) : null}

                      {showProforma ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void onDownloadProforma(o)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-900/5 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 lg:w-auto"
                          aria-label={
                            busy && actionKind === 'proforma' ? tr.downloading : tr.downloadProforma
                          }
                        >
                          {busy && actionKind === 'proforma' ? (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-600" aria-hidden />
                          ) : (
                            <Download className="h-4 w-4 shrink-0 text-slate-600" strokeWidth={2.25} aria-hidden />
                          )}
                          <span>
                            {busy && actionKind === 'proforma' ? tr.downloading : tr.downloadProforma}
                          </span>
                        </button>
                      ) : null}

                      {showInvoiceDownload ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void onDownloadInvoice(o)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-900/5 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 lg:w-auto"
                          aria-label={
                            busy && actionKind === 'invoice' ? tr.downloadingInvoice : tr.downloadInvoice
                          }
                        >
                          {busy && actionKind === 'invoice' ? (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-600" aria-hidden />
                          ) : (
                            <Download className="h-4 w-4 shrink-0 text-slate-600" strokeWidth={2.25} aria-hidden />
                          )}
                          <span>
                            {busy && actionKind === 'invoice' ? tr.downloadingInvoice : tr.downloadInvoice}
                          </span>
                        </button>
                      ) : null}

                      {showInvoicePending ? (
                        <button
                          type="button"
                          disabled
                          className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-500 opacity-70 ring-1 ring-slate-900/5 lg:w-auto"
                          title={tr.invoicePending}
                        >
                          <Download className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2.25} aria-hidden />
                          <span>{tr.invoicePending}</span>
                        </button>
                      ) : null}

                      <a
                        href={orderHelpWhatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-900/5 transition hover:border-slate-300 hover:bg-slate-50 lg:w-auto"
                      >
                        <WhatsappGlyph className="h-4 w-4 shrink-0 text-slate-600" />
                        <span>{tr.orderHelpWhatsapp}</span>
                      </a>

                      {showCancel ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void onCancel(o)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 shadow-sm ring-1 ring-rose-900/5 transition hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50 lg:hidden"
                          aria-label={tr.cancelOrder}
                        >
                          {busy && actionKind === 'cancel' ? (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                          ) : (
                            <Ban className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
                          )}
                          <span>
                            {busy && actionKind === 'cancel' ? tr.cancelling : tr.cancelOrder}
                          </span>
                        </button>
                      ) : null}

                      {showCancel ? (
                        <div
                          ref={menuOpenId === o.id ? menuContainerRef : undefined}
                          className="relative hidden lg:block"
                        >
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              setMenuOpenId((prev) => (prev === o.id ? null : o.id))
                            }
                            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm ring-1 ring-slate-900/5 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                            aria-haspopup="menu"
                            aria-expanded={menuOpenId === o.id}
                            aria-label={
                              lang === 'en'
                                ? 'More order actions'
                                  : 'Mai multe acțiuni'
                            }
                          >
                            {busy && actionKind === 'cancel' ? (
                              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                            ) : (
                              <MoreVertical className="h-5 w-5" strokeWidth={2.25} aria-hidden />
                            )}
                          </button>
                          {menuOpenId === o.id ? (
                            <div
                              role="menu"
                              className="absolute bottom-full right-0 z-20 mb-2 w-56 origin-bottom-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5"
                            >
                              <button
                                type="button"
                                role="menuitem"
                                disabled={busy}
                                onClick={() => {
                                  setMenuOpenId(null)
                                  void onCancel(o)
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
                              >
                                {busy && actionKind === 'cancel' ? (
                                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                                ) : (
                                  <Ban className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
                                )}
                                <span>
                                  {busy && actionKind === 'cancel'
                                    ? tr.cancelling
                                    : tr.cancelOrder}
                                </span>
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      )}

      {payOrder ? (
        <PayOnlineModal
          order={payOrder}
          tr={tr}
          lang={lang}
          error={bankError}
          details={bankDetails}
          copiedField={copiedField}
          onCopy={copyPayField}
          onClose={() => setPayOrder(null)}
        />
      ) : null}
    </div>
  )
}

type PayOnlineModalProps = {
  order: ClientOrderRow
  tr: ReturnType<typeof getClientOrdersTranslations>
  lang: LangCode
  error: string | null
  details: ClientPaymentBankDetails | null
  copiedField: string | null
  onCopy: (fieldId: string, value: string) => void | Promise<void>
  onClose: () => void
}

function formatPayAmount(raw: unknown, lang: LangCode): { display: string; copyable: string } {
  if (raw == null || raw === '') return { display: '—', copyable: '' }
  const text = String(raw).trim()
  const n = Number(text.replace(',', '.'))
  if (!Number.isFinite(n)) return { display: text, copyable: text }
  const display = new Intl.NumberFormat(
    lang === 'en' ? 'en-US' : 'ro-RO',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  ).format(n)
  const copyable = n.toFixed(2)
  return { display, copyable }
}

function PayOnlineModal({
  order,
  tr,
  lang,
  error,
  details,
  copiedField,
  onCopy,
  onClose,
}: PayOnlineModalProps) {
  const { display: amountDisplay, copyable: amountCopyable } = formatPayAmount(
    order.orderTotalInclVat,
    lang,
  )
  const currency = String(order.currency || '').trim() || 'RON'
  const orderNumber = String(order.orderNumber || '').trim()

  const rows: Array<{
    id: string
    label: string
    display: string | null
    copy: string
    mono?: boolean
    skeletonWidth?: string
  }> = [
    {
      id: 'companyName',
      label: tr.payModalCompanyLabel,
      display: details ? details.companyName || '—' : null,
      copy: details?.companyName || '',
      skeletonWidth: 'w-44',
    },
    {
      id: 'bankAccount',
      label: tr.payModalBankAccountLabel,
      display: details ? details.bankAccount || '—' : null,
      copy: details?.bankAccount || '',
      mono: true,
      skeletonWidth: 'w-60',
    },
    {
      id: 'bankName',
      label: tr.payModalBankNameLabel,
      display: details ? details.bankName || '—' : null,
      copy: details?.bankName || '',
      skeletonWidth: 'w-36',
    },
    {
      id: 'amount',
      label: tr.payModalAmountLabel,
      display: amountDisplay === '—' ? '—' : `${amountDisplay} ${currency}`,
      copy: amountCopyable,
      mono: true,
    },
    {
      id: 'description',
      label: tr.payModalDescriptionLabel,
      display: orderNumber || '—',
      copy: orderNumber,
      mono: true,
    },
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pay-modal-title"
      className="fixed inset-0 z-50 flex animate-overlay-fade-in items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="
          relative w-full max-w-none overflow-hidden rounded-t-2xl rounded-b-none bg-white shadow-2xl ring-1 ring-slate-900/10
          animate-sheet-slide-up
          pb-[env(safe-area-inset-bottom)]
          sm:max-w-md sm:rounded-2xl sm:pb-0 sm:animate-modal-zoom-in
        "
      >
        <div className="flex justify-center pt-2 sm:hidden" aria-hidden>
          <span className="h-1.5 w-12 rounded-full bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label={tr.payModalClose}
        >
          <X className="h-5 w-5" strokeWidth={2.25} aria-hidden />
        </button>

        <div className="flex flex-col items-center gap-3 px-6 pt-5 pb-2 text-center sm:pt-7">
          <img
            src="/images/shared/baterino-logo-black.svg"
            alt="Baterino"
            className="h-9 w-auto"
          />
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {tr.payModalAboveTitle}
          </p>
          <h2
            id="pay-modal-title"
            className="m-0 text-2xl font-extrabold tracking-tight text-slate-900"
          >
            {tr.payModalTitle}
          </h2>
          <p className="m-0 max-w-sm text-sm text-slate-500">{tr.payModalSubtitle}</p>
        </div>

        <div className="px-6 py-5">
          {error ? (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800">
              {error}
            </div>
          ) : null}

          <ul className="m-0 list-none space-y-2 p-0">
            {rows.map((r) => {
              const isLoadingRow = r.display === null
              const canCopy = !isLoadingRow && Boolean(r.copy)
              const isCopied = copiedField === r.id
              return (
                <li
                  key={r.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      {r.label}
                    </p>
                    {isLoadingRow ? (
                      <span
                        className={`mt-1.5 block h-4 max-w-full animate-pulse rounded-md bg-slate-200/90 ${r.skeletonWidth || 'w-40'}`}
                        aria-hidden
                      />
                    ) : (
                      <p
                        className={`m-0 truncate text-sm font-semibold text-slate-900 ${
                          r.mono ? 'font-mono tabular-nums' : ''
                        }`}
                        title={r.display ?? undefined}
                      >
                        {r.display}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={canCopy ? () => void onCopy(r.id, r.copy) : undefined}
                    disabled={!canCopy}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600"
                    aria-label={`${tr.payModalCopy} – ${r.label}`}
                    title={isCopied ? tr.payModalCopied : tr.payModalCopy}
                  >
                    {isCopied ? (
                      <Check
                        className="h-4 w-4 text-emerald-600"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                    ) : (
                      <Copy className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="flex justify-center border-t border-slate-200 bg-slate-50/70 px-6 py-4 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:w-auto"
          >
            {tr.payModalClose}
          </button>
        </div>
      </div>
    </div>
  )
}
