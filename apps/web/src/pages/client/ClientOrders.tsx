import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Ban, Check, Copy, Download, Loader2 } from 'lucide-react'
import {
  cancelClientOrder,
  downloadClientOrderInvoice,
  downloadClientOrderProforma,
  getAuthEmail,
  getClientOrders,
  getProductCardImageUrl,
  type ClientOrderRow,
} from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'
import type { LangCode } from '../../i18n/menu'
import {
  fulfillmentStatusBorderLeftClass,
  fulfillmentStatusLabel,
  getClientOrdersTranslations,
} from '../../i18n/client-orders'
import { CONTACT_WHATSAPP_WAME } from '../../lib/contactWhatsApp'

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
  const loc = lang === 'en' ? 'en-GB' : lang === 'zh' ? 'zh-CN' : 'ro-RO'
  return new Date(iso).toLocaleString(loc, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ClientOrders() {
  const { language } = useLanguage()
  const lang = language.code as LangCode
  const tr = getClientOrdersTranslations(lang)

  const [orders, setOrders] = useState<ClientOrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [actionKind, setActionKind] = useState<'proforma' | 'cancel' | 'invoice' | null>(null)
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null)

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
            : lang === 'zh'
              ? '无法复制到剪贴板。'
              : 'Nu s-a putut copia în clipboard.',
        )
      }
    },
    [lang],
  )

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    return getClientOrders()
      .then((rows) => setOrders(rows))
      .catch((e) => setError(e instanceof Error ? e.message : tr.errorGeneric))
      .finally(() => setLoading(false))
  }, [tr.errorGeneric])

  useEffect(() => {
    void load()
  }, [load])

  async function onDownloadProforma(o: ClientOrderRow) {
    setActionId(o.id)
    setActionKind('proforma')
    try {
      await downloadClientOrderProforma(o.id, o.orderNumber)
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
      await downloadClientOrderInvoice(o.id, o.orderNumber)
    } catch (e) {
      setError(e instanceof Error ? e.message : tr.errorGeneric)
    } finally {
      setActionId(null)
      setActionKind(null)
    }
  }

  async function onCancel(o: ClientOrderRow) {
    if (!window.confirm(tr.cancelConfirm)) return
    setActionId(o.id)
    setActionKind('cancel')
    try {
      await cancelClientOrder(o.id)
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
      <div>
        <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">{tr.title}</h1>
        <p className="text-slate-500 text-sm font-['Inter'] mb-6">{tr.loading}</p>
        <OrdersListSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">{tr.title}</h1>
        <p className="text-red-600 text-sm font-['Inter'] mb-4">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 font-['Inter']"
        >
          {lang === 'en' ? 'Retry' : lang === 'zh' ? '重试' : 'Reîncearcă'}
        </button>
      </div>
    )
  }

  return (
    <div className="font-['Inter']">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-1">{tr.title}</h1>
      <p className="text-slate-500 text-sm mb-6">{tr.orderCount.replace('{n}', String(orders.length))}</p>

      {orders.length === 0 ? (
        <p className="text-slate-500">{tr.empty}</p>
      ) : (
        <ul className="m-0 list-none space-y-5 p-0">
          {orders.map((o) => {
            const status = String(o.fulfillmentStatus || 'de_platit')
            const busy = actionId === o.id
            const showCancel = status === 'de_platit'
            const showProforma = status === 'de_platit' || status === 'preluata'
            const invoicePhase =
              status === 'in_pregatire' || status === 'in_curs_livrare' || status === 'livrata'
            const showInvoiceDownload = invoicePhase && Boolean(o.clientHasInvoice)
            const showInvoicePending = invoicePhase && !o.clientHasInvoice
            const statusText = fulfillmentStatusLabel(tr, status)
            const borderAccent = fulfillmentStatusBorderLeftClass(status)
            const priceText =
              o.orderTotalInclVat != null && o.orderTotalInclVat !== ''
                ? `${o.orderTotalInclVat} ${o.currency}`
                : '—'
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
                    {/* Dark rail — date + status */}
                    <div className="flex flex-col justify-between gap-4 bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 px-5 py-5 text-white lg:w-[11.75rem] lg:shrink-0 lg:py-6">
                      <div>
                        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                          {tr.colDate}
                        </p>
                        <p className="mt-1.5 m-0 text-sm font-semibold tabular-nums leading-snug text-white">
                          {formatDate(o.createdAt, lang)}
                        </p>
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

                    {/* Light panel — produs | cantitate | preț */}
                    <div className="grid min-w-0 flex-1 grid-cols-1 gap-5 p-5 lg:grid-cols-12 lg:gap-x-5 lg:gap-y-0 lg:p-6">
                    <div className="min-w-0 lg:col-span-5">
                      <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        {tr.colProduct}
                      </p>
                      <ul className="m-0 mt-2.5 list-none space-y-3 p-0">
                        {(o.lines || []).map((L) => {
                          const href = L.productSlug
                            ? `/produse/${encodeURIComponent(L.productSlug)}`
                            : `/produse/${encodeURIComponent(L.productId)}`
                          const src =
                            (L.imageUrl && String(L.imageUrl).trim()) ||
                            getProductCardImageUrl({ images: [], cardImage: null })
                          return (
                            <li key={L.id} className="flex min-h-14 min-w-0 items-center gap-3">
                              <Link
                                to={href}
                                className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200/90 transition hover:ring-slate-300"
                              >
                                <img
                                  src={src}
                                  alt=""
                                  className="h-full w-full object-contain p-1"
                                  loading="lazy"
                                />
                              </Link>
                              <div className="min-w-0">
                                <Link
                                  to={href}
                                  className="text-[0.95rem] font-semibold leading-snug text-slate-900 underline-offset-2 hover:underline"
                                >
                                  {L.productTitle}
                                </Link>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    </div>

                    <div className="border-t border-slate-100 pt-4 lg:col-span-2 lg:flex lg:flex-col lg:border-t-0 lg:pt-0">
                      <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        {tr.colQuantity}
                      </p>
                      <ul className="m-0 mt-2.5 list-none space-y-3 p-0">
                        {(o.lines || []).map((L) => (
                          <li
                            key={`${L.id}-qty`}
                            className="flex min-h-14 items-center text-sm font-semibold tabular-nums text-slate-800"
                          >
                            {L.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-slate-100 pt-4 lg:col-span-5 lg:flex lg:flex-col lg:border-t-0 lg:pt-0">
                      <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        {tr.colPrice}
                      </p>
                      <div className="mt-2.5 lg:flex lg:min-h-14 lg:flex-1 lg:flex-col lg:justify-center lg:pt-0">
                        <p className="m-0 text-2xl font-bold tabular-nums tracking-tight text-slate-900">
                          {priceText}
                        </p>
                        <p className="mt-0.5 m-0 text-xs text-slate-400">{tr.totalWithVat}</p>
                      </div>
                    </div>
                    </div>
                  </div>

                  {/* Second row — nr. comandă + copy | actions */}
                  <div className="flex flex-col gap-4 border-t border-slate-200/90 bg-slate-50/50 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
                    <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
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

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      {showProforma ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void onDownloadProforma(o)}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-900/5 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                          aria-label={tr.downloadProforma}
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
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-900/5 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                          aria-label={tr.downloadInvoice}
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
                          className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-500 opacity-70 ring-1 ring-slate-900/5"
                          title={tr.invoicePending}
                        >
                          <Download className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2.25} aria-hidden />
                          <span>{tr.invoicePending}</span>
                        </button>
                      ) : null}

                      {showCancel ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void onCancel(o)}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-900/5 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                          aria-label={tr.cancelOrder}
                        >
                          {busy && actionKind === 'cancel' ? (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-600" aria-hidden />
                          ) : (
                            <Ban className="h-4 w-4 shrink-0 text-slate-600" strokeWidth={2.25} aria-hidden />
                          )}
                          <span>
                            {busy && actionKind === 'cancel' ? tr.cancelling : tr.cancelOrder}
                          </span>
                        </button>
                      ) : null}

                      <a
                        href={orderHelpWhatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-900/5 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        <WhatsappGlyph className="h-4 w-4 shrink-0 text-slate-600" />
                        <span>{tr.orderHelpWhatsapp}</span>
                      </a>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
