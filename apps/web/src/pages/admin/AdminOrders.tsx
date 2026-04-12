import { useEffect, useState } from 'react'
import {
  getAdminGuestResidentialOrders,
  patchAdminOrderFulfillmentStatus,
  type AdminGuestResidentialOrderRow,
} from '../../lib/api'

const FULFILLMENT_OPTIONS: { value: string; label: string }[] = [
  { value: 'de_platit', label: 'De plătit' },
  { value: 'preluata', label: 'Preluată' },
  { value: 'in_pregatire', label: 'În pregătire' },
  { value: 'in_curs_livrare', label: 'În curs de livrare' },
  { value: 'livrata', label: 'Livrată' },
  { value: 'anulata', label: 'Anulată' },
]

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPhoneDigits(digits: string): string {
  const d = String(digits || '').replace(/\D/g, '').slice(-9)
  if (d.length !== 9) return digits || '—'
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
}

function formatMoney(amount: string | null, currency: string): string {
  if (amount == null || amount === '') return '—'
  const n = Number(String(amount).replace(',', '.'))
  if (!Number.isFinite(n)) return String(amount)
  return `${n.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency || 'RON'}`
}

function orderSourceLabel(source: string): { label: string; className: string } {
  const s = String(source || '').toLowerCase()
  if (s === 'client') return { label: 'Client', className: 'bg-emerald-100 text-emerald-900' }
  return { label: 'Invitat', className: 'bg-slate-200 text-slate-800' }
}

function hasInvoiceUrl(o: AdminGuestResidentialOrderRow): boolean {
  return Boolean(o.clientInvoiceUrl && String(o.clientInvoiceUrl).trim())
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminGuestResidentialOrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [patchingId, setPatchingId] = useState<string | null>(null)
  const [invoiceModal, setInvoiceModal] = useState<{
    order: AdminGuestResidentialOrderRow
    previousStatus: string
  } | null>(null)
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)
  const [invoiceSubmitting, setInvoiceSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getAdminGuestResidentialOrders()
        if (!cancelled) setOrders(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Eroare la încărcare.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  function closeInvoiceModal() {
    setInvoiceModal(null)
    setInvoiceFile(null)
    setInvoiceSubmitting(false)
  }

  async function submitInvoiceModal() {
    if (!invoiceModal || !invoiceFile) {
      window.alert('Selectează fișierul PDF al facturii pentru client.')
      return
    }
    setInvoiceSubmitting(true)
    try {
      const { clientInvoiceUrl } = await patchAdminOrderFulfillmentStatus(
        invoiceModal.order.id,
        'in_pregatire',
        invoiceFile,
      )
      setOrders((rows) =>
        rows.map((r) =>
          r.id === invoiceModal.order.id
            ? {
                ...r,
                fulfillmentStatus: 'in_pregatire',
                clientInvoiceUrl: clientInvoiceUrl ?? r.clientInvoiceUrl ?? null,
              }
            : r,
        ),
      )
      closeInvoiceModal()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Încărcarea a eșuat.')
      setInvoiceSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col p-6 sm:p-8 lg:p-10">
        <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Comenzi</h1>
        <p className="text-gray-500 text-sm font-['Inter'] mb-6">
          Comenzi rezidențiale (flux invitat și client autentificat).
        </p>
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500 font-['Inter']">Se încarcă...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8 lg:p-10">
        <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Comenzi</h1>
        <p className="text-red-600 text-sm font-['Inter']">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0 p-4 sm:p-6 lg:p-8">
      {invoiceModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="presentation"
          onClick={() => !invoiceSubmitting && closeInvoiceModal()}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            role="dialog"
            aria-labelledby="invoice-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="invoice-modal-title" className="text-lg font-bold text-slate-900 font-['Inter']">
              Factură client (PDF)
            </h2>
            <p className="mt-2 text-sm text-slate-600 font-['Inter']">
              Comanda <span className="font-mono font-semibold">{invoiceModal.order.orderNumber}</span>
              {invoiceModal.previousStatus === 'in_pregatire'
                ? ' este deja în „În pregătire”, dar lipsește factura. '
                : ' trece în „În pregătire”. '}
              Încarcă factura PDF pe care o va descărca clientul din cont.
            </p>
            <label className="mt-4 block text-sm font-medium text-slate-700 font-['Inter']">
              Fișier PDF
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="mt-1 block w-full text-sm text-slate-700"
                disabled={invoiceSubmitting}
                onChange={(e) => setInvoiceFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={invoiceSubmitting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 font-['Inter']"
                onClick={() => !invoiceSubmitting && closeInvoiceModal()}
              >
                Anulează
              </button>
              <button
                type="button"
                disabled={invoiceSubmitting || !invoiceFile}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 font-['Inter']"
                onClick={() => void submitInvoiceModal()}
              >
                {invoiceSubmitting ? 'Se încarcă…' : 'Salvează status și factura'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex-shrink-0 mb-4">
        <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900">Comenzi</h1>
        <p className="text-gray-500 text-sm font-['Inter'] mt-0.5">
          Comenzi rezidențiale din /comanda — {orders.length} în listă (max. 500). La „În pregătire” este obligatoriu
          PDF-ul facturii (R2 configurat pe API).
        </p>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm font-['Inter']">Nu există comenzi încă.</div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="min-w-[1320px] w-full text-left text-sm font-['Inter']">
              <thead className="sticky top-0 z-10 bg-slate-100 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Data</th>
                  <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Nr. comandă</th>
                  <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap min-w-[11rem]">
                    Status comandă
                  </th>
                  <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Factură</th>
                  <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Sursă</th>
                  <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Client</th>
                  <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Email</th>
                  <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Telefon</th>
                  <th className="px-3 py-3 font-semibold text-slate-700 min-w-[200px]">Produs</th>
                  <th className="px-3 py-3 font-semibold text-slate-700 text-right whitespace-nowrap">Cant.</th>
                  <th className="px-3 py-3 font-semibold text-slate-700 text-right whitespace-nowrap">Preț u. cu TVA</th>
                  <th className="px-3 py-3 font-semibold text-slate-700 text-right whitespace-nowrap">Total cu TVA</th>
                  <th className="px-3 py-3 font-semibold text-slate-700 text-right whitespace-nowrap">TVA %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => {
                  const src = orderSourceLabel(o.orderSource)
                  const name = `${o.lastName} ${o.firstName}`.trim() || '—'
                  const stRaw = String(o.fulfillmentStatus || 'de_platit')
                  const st = FULFILLMENT_OPTIONS.some((x) => x.value === stRaw) ? stRaw : 'de_platit'
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/80 align-top">
                      <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{formatDateTime(o.createdAt)}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-900 whitespace-nowrap">
                        {o.orderNumber}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap align-top">
                        <select
                          className="max-w-[11rem] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-900 disabled:opacity-50"
                          value={st}
                          disabled={patchingId === o.id}
                          onChange={async (e) => {
                            const next = e.target.value
                            const prev = st
                            if (
                              next === 'in_pregatire' &&
                              prev !== 'in_pregatire' &&
                              !hasInvoiceUrl(o)
                            ) {
                              setInvoiceModal({ order: o, previousStatus: prev })
                              return
                            }
                            setPatchingId(o.id)
                            setOrders((rows) =>
                              rows.map((r) => (r.id === o.id ? { ...r, fulfillmentStatus: next } : r)),
                            )
                            try {
                              const out = await patchAdminOrderFulfillmentStatus(o.id, next)
                              setOrders((rows) =>
                                rows.map((r) =>
                                  r.id === o.id
                                    ? {
                                        ...r,
                                        fulfillmentStatus: next,
                                        ...(out.clientInvoiceUrl !== undefined
                                          ? { clientInvoiceUrl: out.clientInvoiceUrl }
                                          : {}),
                                      }
                                    : r,
                                ),
                              )
                            } catch (err) {
                              setOrders((rows) =>
                                rows.map((r) => (r.id === o.id ? { ...r, fulfillmentStatus: prev } : r)),
                              )
                              window.alert(
                                err instanceof Error ? err.message : 'Nu s-a putut salva statusul.',
                              )
                            } finally {
                              setPatchingId(null)
                            }
                          }}
                        >
                          {FULFILLMENT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 whitespace-nowrap">
                        {hasInvoiceUrl(o) ? (
                          <span className="text-emerald-700 font-semibold" title="Încărcată">
                            ✓
                          </span>
                        ) : st === 'in_pregatire' ? (
                          <button
                            type="button"
                            className="text-xs font-semibold text-sky-700 underline-offset-2 hover:underline disabled:opacity-50"
                            disabled={patchingId === o.id}
                            onClick={() => setInvoiceModal({ order: o, previousStatus: st })}
                          >
                            Încarcă
                          </button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${src.className}`}>
                          {src.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-900 max-w-[160px]">
                        <span className="line-clamp-2" title={name}>
                          {name}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 max-w-[180px] break-all">{o.email}</td>
                      <td className="px-3 py-2.5 text-slate-700 whitespace-nowrap">{formatPhoneDigits(o.phone)}</td>
                      <td className="px-3 py-2.5 text-slate-800">
                        <span className="line-clamp-2" title={o.productTitle}>
                          {o.productTitle}
                        </span>
                        {o.productSlug ? (
                          <span className="block text-xs text-slate-500 mt-0.5 font-mono">{o.productSlug}</span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-slate-800">{o.quantity}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-slate-800 whitespace-nowrap">
                        {formatMoney(o.unitPriceInclVat, o.currency)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums font-medium text-slate-900 whitespace-nowrap">
                        {formatMoney(o.lineTotalInclVat, o.currency)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 whitespace-nowrap">
                        {o.vatPercent != null ? `${o.vatPercent}%` : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
