import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getAdminServiceRequests,
  patchAdminServiceRequestStatus,
  type ServiceRequestDto,
} from '../../lib/api'

type Status = 'open' | 'in_progress' | 'resolved' | 'closed'

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'open', label: 'Nouă' },
  { value: 'in_progress', label: 'În desfășurare' },
  { value: 'resolved', label: 'Rezolvată' },
  { value: 'closed', label: 'Închisă' },
]

const STATUS_BADGE_CLASS: Record<Status, string> = {
  open: 'bg-sky-100 text-sky-900',
  in_progress: 'bg-amber-100 text-amber-900',
  resolved: 'bg-emerald-100 text-emerald-900',
  closed: 'bg-slate-200 text-slate-700',
}

const ACCOUNT_LABEL: Record<string, string> = {
  client: 'Client',
  partener: 'Partener',
}

function formatDateTime(iso: string): string {
  if (!iso) return '—'
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

function formatPhone(p: string): string {
  const digits = String(p || '').replace(/\D/g, '')
  if (digits.length === 9) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  }
  return p || '—'
}

function normalizeStatus(s: string): Status {
  return (STATUS_OPTIONS.some((o) => o.value === s) ? (s as Status) : 'open')
}

function fullName(r: ServiceRequestDto): string {
  const n = [r.firstName, r.lastName].map((s) => String(s || '').trim()).filter(Boolean).join(' ')
  return n || '—'
}

export default function AdminService() {
  const [rows, setRows] = useState<ServiceRequestDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [patchingId, setPatchingId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all')

  const loadRows = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminServiceRequests()
      setRows(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Eroare la încărcare.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRows()
  }, [loadRows])

  const filteredRows = useMemo(() => {
    if (statusFilter === 'all') return rows
    return rows.filter((r) => normalizeStatus(r.status) === statusFilter)
  }, [rows, statusFilter])

  const detail = detailId ? rows.find((r) => r.id === detailId) ?? null : null

  const handleStatusChange = useCallback(
    async (r: ServiceRequestDto, next: Status) => {
      const prev = normalizeStatus(r.status)
      if (prev === next) return
      setPatchingId(r.id)
      setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: next } : x)))
      try {
        const updated = await patchAdminServiceRequestStatus(r.id, next)
        setRows((rs) => rs.map((x) => (x.id === r.id ? updated : x)))
      } catch (e) {
        setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: prev } : x)))
        alert(e instanceof Error ? e.message : 'Eroare la actualizare.')
      } finally {
        setPatchingId(null)
      }
    },
    [],
  )

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Service</h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-6">
        Cererile de service trimise de clienți și parteneri.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filtru status:</span>
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Toate ({rows.length})
        </button>
        {STATUS_OPTIONS.map((o) => {
          const count = rows.filter((r) => normalizeStatus(r.status) === o.value).length
          const active = statusFilter === o.value
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => setStatusFilter(o.value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                active
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {o.label} ({count})
            </button>
          )
        })}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => void loadRows()}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          disabled={loading}
        >
          {loading ? 'Se încarcă…' : 'Reîmprospătează'}
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm font-['Inter']">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">Data</th>
              <th className="px-4 py-3 whitespace-nowrap">ID Cerere</th>
              <th className="px-4 py-3 whitespace-nowrap">Tip cont</th>
              <th className="px-4 py-3 whitespace-nowrap">Nume</th>
              <th className="px-4 py-3 whitespace-nowrap">Email</th>
              <th className="px-4 py-3 whitespace-nowrap">Telefon</th>
              <th className="px-4 py-3 whitespace-nowrap">Produs</th>
              <th className="px-4 py-3 whitespace-nowrap">SN</th>
              <th className="px-4 py-3 whitespace-nowrap">Model</th>
              <th className="px-4 py-3 whitespace-nowrap">Status</th>
              <th className="px-4 py-3 whitespace-nowrap" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && rows.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-10 text-center text-slate-500">
                  Se încarcă cererile…
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-10 text-center text-slate-500">
                  {rows.length === 0
                    ? 'Nu există cereri de service încă.'
                    : 'Nu există cereri pe filtrul curent.'}
                </td>
              </tr>
            ) : (
              filteredRows.map((r) => {
                const status = normalizeStatus(r.status)
                const isPatching = patchingId === r.id
                return (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums text-slate-700">
                      {formatDateTime(r.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs font-semibold text-slate-900">
                      {r.requestNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {ACCOUNT_LABEL[r.accountType] || r.accountType}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-900">{fullName(r)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                      <a
                        href={`mailto:${r.email}`}
                        className="underline-offset-2 hover:underline"
                      >
                        {r.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums text-slate-700">
                      {formatPhone(r.phone)}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-900" title={r.productTitle}>
                      {r.productTitle}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs tabular-nums text-slate-700">
                      {r.serialNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">{r.modelNumber}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE_CLASS[status]}`}
                        >
                          {STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status}
                        </span>
                        <select
                          aria-label="Schimbă status"
                          value={status}
                          disabled={isPatching}
                          onChange={(e) => void handleStatusChange(r, e.target.value as Status)}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-50"
                        >
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => setDetailId(r.id)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Detalii
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {detail ? (
        <div
          className="fixed inset-0 z-[85] flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={() => setDetailId(null)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-detail-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 pt-5 pb-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Cerere service
                </p>
                <h2
                  id="service-detail-title"
                  className="mt-1 font-mono text-lg font-bold text-slate-900"
                >
                  {detail.requestNumber}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Închide"
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                onClick={() => setDetailId(null)}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Data</p>
                <p className="mt-0.5 text-sm text-slate-900">{formatDateTime(detail.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tip cont</p>
                <p className="mt-0.5 text-sm text-slate-900">
                  {ACCOUNT_LABEL[detail.accountType] || detail.accountType}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nume</p>
                <p className="mt-0.5 text-sm text-slate-900">{fullName(detail)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</p>
                <p className="mt-0.5 text-sm text-slate-900 break-all">{detail.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Telefon</p>
                <p className="mt-0.5 text-sm text-slate-900 tabular-nums">{formatPhone(detail.phone)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</p>
                <p className="mt-0.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      STATUS_BADGE_CLASS[normalizeStatus(detail.status)]
                    }`}
                  >
                    {STATUS_OPTIONS.find((o) => o.value === normalizeStatus(detail.status))?.label}
                  </span>
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Produs</p>
                <p className="mt-0.5 text-sm text-slate-900">{detail.productTitle}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">SN</p>
                <p className="mt-0.5 font-mono text-xs text-slate-900">{detail.serialNumber}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Model</p>
                <p className="mt-0.5 text-sm text-slate-900">{detail.modelNumber}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Descrierea problemei
                </p>
                <p className="mt-1 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
                  {detail.problemDescription}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
              <button
                type="button"
                onClick={() => setDetailId(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
