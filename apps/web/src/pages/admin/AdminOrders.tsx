import { useEffect, useState } from 'react'
import { getAdminGuestResidentialOrders, type AdminGuestResidentialOrderRow } from '../../lib/api'

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

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminGuestResidentialOrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900">Comenzi</h1>
        <p className="text-gray-500 text-sm font-['Inter'] mt-0.5">
          Comenzi rezidențiale din /comanda — {orders.length} în listă (max. 500).
        </p>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm font-['Inter']">Nu există comenzi încă.</div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="min-w-[1100px] w-full text-left text-sm font-['Inter']">
              <thead className="sticky top-0 z-10 bg-slate-100 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Data</th>
                  <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Nr. comandă</th>
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
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/80 align-top">
                      <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{formatDateTime(o.createdAt)}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-900 whitespace-nowrap">
                        {o.orderNumber}
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
