import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminCommercialOffers, type AdminCommercialOfferRow } from '../../lib/api'
import {
  adminOfferEditPath,
  adminOfferNewFreshPath,
  commercialOfferBuyerTypeLabelRo,
} from '../../lib/commercialOfferDraft'

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatMoney(amount: string, currency: string): string {
  const n = Number(String(amount).replace(',', '.'))
  if (!Number.isFinite(n)) return '—'
  return `${n.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency || 'RON'}`
}

export default function AdminOffersList() {
  const [offers, setOffers] = useState<AdminCommercialOfferRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const rows = await getAdminCommercialOffers()
        if (!cancelled) setOffers(rows)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Eroare la încărcare.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-7xl">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Lista oferte</h1>
          <p className="text-sm text-slate-600 font-['Inter'] max-w-3xl">
            Ciorne și oferte generate — editează ciornele sau descarcă PDF-ul ofertei finalizate.
          </p>
        </div>
        <Link
          to={adminOfferNewFreshPath()}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#1e46b4] px-4 py-2.5 text-sm font-semibold font-['Inter'] text-white shadow-sm hover:bg-[#163899]"
        >
          Ofertă nouă
        </Link>
      </div>

      {error ? (
        <p className="mb-4 text-sm font-['Inter'] text-red-800 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">
          {error}
        </p>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-['Inter']">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/90 text-slate-600">
                <th className="px-6 py-3 font-semibold whitespace-nowrap">Dată</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">Status</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">Tip</th>
                <th className="px-6 py-3 font-semibold">Nume client / companie</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">Email</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">Telefon</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">Sumă ofertată</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">Nr. produse</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    Se încarcă…
                  </td>
                </tr>
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    Nu există oferte încă. Folosește „Draft” sau „Generează ofertă” din formularul de ofertă
                    nouă.
                  </td>
                </tr>
              ) : (
                offers.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60">
                    <td className="px-6 py-3 text-slate-700 whitespace-nowrap">
                      {formatDateTime(row.updatedAt || row.createdAt)}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          row.status === 'draft'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {row.status === 'draft' ? 'Ciornă' : 'Generată'}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          row.buyerType === 'company'
                            ? 'bg-sky-100 text-sky-900'
                            : 'bg-violet-100 text-violet-900'
                        }`}
                      >
                        {commercialOfferBuyerTypeLabelRo(row.buyerType)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-900 font-medium">{row.clientLabel || '—'}</td>
                    <td className="px-6 py-3 text-slate-700 max-w-[220px] truncate" title={row.clientEmail || undefined}>
                      {row.clientEmail?.trim() ? (
                        <a
                          href={`mailto:${row.clientEmail.trim()}`}
                          className="text-[#1e46b4] hover:text-[#163899] hover:underline"
                        >
                          {row.clientEmail.trim()}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-6 py-3 text-slate-700 whitespace-nowrap tabular-nums">
                      {row.clientPhone?.trim() ? (
                        <a
                          href={`tel:${row.clientPhone.trim().replace(/\s/g, '')}`}
                          className="text-[#1e46b4] hover:text-[#163899] hover:underline"
                        >
                          {row.clientPhone.trim()}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-6 py-3 text-slate-800 whitespace-nowrap tabular-nums">
                      {formatMoney(row.amountGross, row.currency)}
                    </td>
                    <td className="px-6 py-3 text-slate-700 whitespace-nowrap tabular-nums">{row.productCount}</td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      {row.status === 'draft' ? (
                        <Link
                          to={adminOfferEditPath(row.id)}
                          className="text-sm font-semibold text-[#1e46b4] hover:text-[#163899] underline underline-offset-2"
                        >
                          Editează
                        </Link>
                      ) : row.pdfUrl ? (
                        <a
                          href={row.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="text-sm font-semibold text-[#1e46b4] hover:text-[#163899] underline underline-offset-2"
                        >
                          Descarcă oferta
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
