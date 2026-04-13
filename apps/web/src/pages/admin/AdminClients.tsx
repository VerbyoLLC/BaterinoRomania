import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteAdminClient, getAdminClients, getAuthToken, type AdminClientRow } from '../../lib/api'

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

function displayName(c: AdminClientRow): string {
  const p = c.profile
  if (!p) return '—'
  const n = [p.firstName, p.lastName].map((s) => String(s || '').trim()).filter(Boolean).join(' ')
  return n || '—'
}

function billingLine(c: AdminClientRow): string {
  const p = c.profile
  if (!p) return '—'
  const parts = [p.billAddress, p.billCity, p.billCounty, p.billPostal].map((s) => String(s || '').trim()).filter(Boolean)
  return parts.length ? parts.join(', ') : '—'
}

export default function AdminClients() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<AdminClientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    getAdminClients()
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : 'Eroare la încărcare.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/admin/login', { replace: true })
      return
    }
    load()
  }, [navigate, load])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((c) => {
      const email = c.email.toLowerCase()
      const ref = (c.referralCode || '').toLowerCase()
      const name = displayName(c).toLowerCase()
      const phone = (c.profile?.phone || '').toLowerCase()
      const bill = billingLine(c).toLowerCase()
      return email.includes(q) || ref.includes(q) || name.includes(q) || phone.includes(q) || bill.includes(q)
    })
  }, [rows, query])

  if (loading) {
    return (
      <div className="h-full flex flex-col p-6 sm:p-8 lg:p-10">
        <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Clienți</h1>
        <p className="text-gray-500 text-sm font-['Inter'] mb-6">Conturi client B2C (înregistrare pe site).</p>
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500 font-['Inter']">Se încarcă...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8 lg:p-10">
        <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Clienți</h1>
        <p className="text-red-600 text-sm font-['Inter'] mb-4">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 font-['Inter']"
        >
          Reîncearcă
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900">Clienți</h1>
          <p className="text-gray-500 text-sm font-['Inter'] mt-1">
            {filtered.length} din {rows.length} conturi
          </p>
        </div>
        <label className="block sm:max-w-xs w-full">
          <span className="sr-only">Caută</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Caută email, nume, telefon…"
            className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-['Inter'] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
          />
        </label>
      </div>

      <div className="flex-1 min-h-0 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
          <table className="min-w-[1000px] w-full text-left text-sm font-['Inter'] border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">Email</th>
                <th className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">Nume</th>
                <th className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">Telefon</th>
                <th className="px-4 py-3 font-semibold text-slate-700 min-w-[200px]">Adresă facturare</th>
                <th className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">Livrare</th>
                <th className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">Cod recomandare</th>
                <th className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">Comenzi</th>
                <th className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">Email verificat</th>
                <th className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">Înregistrat</th>
                <th className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-500">
                    {rows.length === 0 ? 'Nu există încă clienți înregistrați.' : 'Niciun rezultat pentru căutare.'}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 align-top">
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{c.email}</td>
                    <td className="px-4 py-3 text-slate-700">{displayName(c)}</td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap tabular-nums">
                      {c.profile?.phone?.trim() || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs leading-relaxed max-w-[280px]">{billingLine(c)}</td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {c.profile?.deliveryDifferent ? (
                        <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                          Altă adresă
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{c.referralCode || '—'}</td>
                    <td className="px-4 py-3 text-slate-800 tabular-nums font-semibold">{c.orderCount}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {c.emailVerified ? (
                        <span className="text-emerald-700 font-medium">Da</span>
                      ) : (
                        <span className="text-amber-700 font-medium">În așteptare</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs tabular-nums">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        disabled={deletingId === c.id}
                        onClick={() => {
                          if (
                            !window.confirm(
                              `Ștergi definitiv contul client?\n\n${c.email}\n\nComenzile rămân în sistem fără legătură la cont.`,
                            )
                          ) {
                            return
                          }
                          setDeletingId(c.id)
                          deleteAdminClient(c.id)
                            .then(() => {
                              setRows((prev) => prev.filter((x) => x.id !== c.id))
                            })
                            .catch((e) => {
                              window.alert(e instanceof Error ? e.message : 'Eroare la ștergere.')
                            })
                            .finally(() => setDeletingId(null))
                        }}
                        className="rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 font-['Inter']"
                      >
                        {deletingId === c.id ? '…' : 'Șterge'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
