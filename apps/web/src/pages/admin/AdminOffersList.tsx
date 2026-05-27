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

function formatDateShort(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function buyerTypeShortLabel(buyerType: AdminCommercialOfferRow['buyerType']): string {
  return buyerType === 'company' ? 'Companie' : 'P.F.'
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
    <div className="box-border w-full min-w-0 shrink max-w-full p-6 sm:p-8 lg:p-10">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
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

      <section className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
        <table className="w-full min-w-0 table-fixed text-left text-sm font-['Inter']">
            <colgroup>
              <col className="w-[11%]" />
              <col className="w-[8%]" />
              <col className="w-[9%]" />
              <col className="w-[16%]" />
              <col className="w-[14%]" />
              <col className="w-[10%]" />
              <col className="w-[12%]" />
              <col className="w-[7%]" />
              <col className="w-[13%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/90 text-slate-600">
                <th className="px-3 py-2.5 font-semibold">Dată</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
                <th className="px-3 py-2.5 font-semibold">Tip</th>
                <th className="px-3 py-2.5 font-semibold">Client / companie</th>
                <th className="px-3 py-2.5 font-semibold">Email</th>
                <th className="px-3 py-2.5 font-semibold">Telefon</th>
                <th className="px-3 py-2.5 font-semibold">Sumă</th>
                <th className="px-3 py-2.5 font-semibold">Produse</th>
                <th className="px-3 py-2.5 font-semibold">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-3 py-12 text-center text-slate-500">
                    Se încarcă…
                  </td>
                </tr>
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-12 text-center text-slate-500">
                    Nu există oferte încă. Folosește „Draft” sau „Generează ofertă” din formularul de ofertă
                    nouă.
                  </td>
                </tr>
              ) : (
                offers.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60">
                    <td className="px-3 py-2.5 text-slate-700 max-w-0 truncate" title={formatDateTime(row.updatedAt || row.createdAt)}>
                      {formatDateShort(row.updatedAt || row.createdAt)}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex max-w-full truncate rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          row.status === 'draft'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {row.status === 'draft' ? 'Ciornă' : 'Generată'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex max-w-full truncate rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          row.buyerType === 'company'
                            ? 'bg-sky-100 text-sky-900'
                            : 'bg-violet-100 text-violet-900'
                        }`}
                        title={commercialOfferBuyerTypeLabelRo(row.buyerType)}
                      >
                        {buyerTypeShortLabel(row.buyerType)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-900 font-medium max-w-0 truncate" title={row.clientLabel || undefined}>
                      {row.clientLabel || '—'}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700 max-w-0 truncate" title={row.clientEmail || undefined}>
                      {row.clientEmail?.trim() ? (
                        <a
                          href={`mailto:${row.clientEmail.trim()}`}
                          className="block truncate text-[#1e46b4] hover:text-[#163899] hover:underline"
                        >
                          {row.clientEmail.trim()}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700 max-w-0 truncate tabular-nums" title={row.clientPhone?.trim() || undefined}>
                      {row.clientPhone?.trim() ? (
                        <a
                          href={`tel:${row.clientPhone.trim().replace(/\s/g, '')}`}
                          className="block truncate text-[#1e46b4] hover:text-[#163899] hover:underline"
                        >
                          {row.clientPhone.trim()}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-slate-800 max-w-0 truncate tabular-nums" title={formatMoney(row.amountGross, row.currency)}>
                      {formatMoney(row.amountGross, row.currency)}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700 tabular-nums text-center">{row.productCount}</td>
                    <td className="px-3 py-2.5 max-w-0 truncate">
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
                          title="Descarcă oferta"
                        >
                          Descarcă
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
      </section>
    </div>
  )
}
