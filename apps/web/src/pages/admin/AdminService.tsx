import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getAdminReturRequests,
  getAdminServiceRequests,
  patchAdminReturStatus,
  patchAdminServiceRequestStatus,
  type ReturRequestDto,
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

type ReturStatus = 'pending' | 'reviewed' | 'closed'

const RETUR_STATUS_OPTIONS: { value: ReturStatus; label: string }[] = [
  { value: 'pending', label: 'În așteptare' },
  { value: 'reviewed', label: 'Verificată' },
  { value: 'closed', label: 'Închisă' },
]

const RETUR_STATUS_BADGE_CLASS: Record<ReturStatus, string> = {
  pending: 'bg-amber-100 text-amber-900',
  reviewed: 'bg-sky-100 text-sky-900',
  closed: 'bg-slate-200 text-slate-700',
}

const SUBMIT_SOURCE_LABEL: Record<string, string> = {
  guest: 'Invitat',
  client: 'Client autentificat',
}

const RETURN_REASON_LABEL: Record<string, string> = {
  withdrawal: 'Drept de retragere',
  defective: 'Produs defect',
  not_as_described: 'Neconform descrierii',
  damaged_delivery: 'Deteriorat la livrare',
  other: 'Alt motiv',
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

function fullNameRetur(r: ReturRequestDto): string {
  const n = [r.firstName, r.lastName].map((s) => String(s || '').trim()).filter(Boolean).join(' ')
  return n || '—'
}

function normalizeReturStatus(s: string): ReturStatus {
  return RETUR_STATUS_OPTIONS.some((o) => o.value === s) ? (s as ReturStatus) : 'pending'
}

export default function AdminService() {
  const [rows, setRows] = useState<ServiceRequestDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [patchingId, setPatchingId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all')

  const [returRows, setReturRows] = useState<ReturRequestDto[]>([])
  const [returLoading, setReturLoading] = useState(true)
  const [returError, setReturError] = useState<string | null>(null)
  const [returPatchingId, setReturPatchingId] = useState<number | null>(null)
  const [returDetailId, setReturDetailId] = useState<number | null>(null)
  const [returStatusFilter, setReturStatusFilter] = useState<'all' | ReturStatus>('all')

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

  const loadReturRows = useCallback(async () => {
    setReturLoading(true)
    setReturError(null)
    try {
      const data = await getAdminReturRequests()
      setReturRows(data)
    } catch (e) {
      setReturError(e instanceof Error ? e.message : 'Eroare la încărcarea cererilor de retur.')
    } finally {
      setReturLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRows()
  }, [loadRows])

  useEffect(() => {
    void loadReturRows()
  }, [loadReturRows])

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

  const filteredReturRows = useMemo(() => {
    if (returStatusFilter === 'all') return returRows
    return returRows.filter((r) => normalizeReturStatus(r.status) === returStatusFilter)
  }, [returRows, returStatusFilter])

  const returDetail = returDetailId != null ? returRows.find((r) => r.id === returDetailId) ?? null : null

  const handleReturStatusChange = useCallback(async (r: ReturRequestDto, next: ReturStatus) => {
    const prev = normalizeReturStatus(r.status)
    if (prev === next) return
    setReturPatchingId(r.id)
    setReturRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: next } : x)))
    try {
      const updated = await patchAdminReturStatus(r.id, next)
      setReturRows((rs) => rs.map((x) => (x.id === r.id ? updated : x)))
    } catch (e) {
      setReturRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: prev } : x)))
      alert(e instanceof Error ? e.message : 'Eroare la actualizare.')
    } finally {
      setReturPatchingId(null)
    }
  }, [])

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Service</h1>
      <h2 className="text-xl font-extrabold font-['Inter'] text-slate-900 mb-1">Cereri Service</h2>
      <p className="text-gray-500 text-sm font-['Inter'] mb-4">
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
          onClick={() => {
            void loadRows()
            void loadReturRows()
          }}
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

      <h2 className="mt-12 text-xl font-extrabold font-['Inter'] text-slate-900 mb-1">Cereri retur</h2>
      <p className="text-gray-500 text-sm font-['Inter'] mb-4">
        Cereri trimise din formularul public „Returnare produse” (site).
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filtru status:</span>
        <button
          type="button"
          onClick={() => setReturStatusFilter('all')}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            returStatusFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Toate ({returRows.length})
        </button>
        {RETUR_STATUS_OPTIONS.map((o) => {
          const count = returRows.filter((r) => normalizeReturStatus(r.status) === o.value).length
          const active = returStatusFilter === o.value
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => setReturStatusFilter(o.value)}
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
          onClick={() => void loadReturRows()}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          disabled={returLoading}
        >
          {returLoading ? 'Se încarcă…' : 'Reîmprospătează'}
        </button>
      </div>

      {returError ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {returError}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm font-['Inter']">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">Data</th>
              <th className="px-4 py-3 whitespace-nowrap">Serie</th>
              <th className="px-4 py-3 whitespace-nowrap">Sursă</th>
              <th className="px-4 py-3 whitespace-nowrap">Nume</th>
              <th className="px-4 py-3 whitespace-nowrap">Email</th>
              <th className="px-4 py-3 whitespace-nowrap">Comandă</th>
              <th className="px-4 py-3 whitespace-nowrap">Recepție</th>
              <th className="px-4 py-3 whitespace-nowrap">SN</th>
              <th className="px-4 py-3 whitespace-nowrap">Produs</th>
              <th className="px-4 py-3 whitespace-nowrap">Motiv</th>
              <th className="px-4 py-3 whitespace-nowrap">Status</th>
              <th className="px-4 py-3 whitespace-nowrap" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {returLoading && returRows.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-10 text-center text-slate-500">
                  Se încarcă cererile de retur…
                </td>
              </tr>
            ) : filteredReturRows.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-10 text-center text-slate-500">
                  {returRows.length === 0
                    ? 'Nu există cereri de retur încă.'
                    : 'Nu există cereri pe filtrul curent.'}
                </td>
              </tr>
            ) : (
              filteredReturRows.map((r) => {
                const rStatus = normalizeReturStatus(r.status)
                const isReturPatching = returPatchingId === r.id
                return (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums text-slate-700">
                      {formatDateTime(r.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs font-semibold text-slate-900">
                      {r.registrationNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {SUBMIT_SOURCE_LABEL[r.submitSource] || r.submitSource}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-900">{fullNameRetur(r)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                      <a href={`mailto:${r.email}`} className="underline-offset-2 hover:underline">
                        {r.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-slate-800">{r.orderNumber}</td>
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums text-slate-700">{r.receiptDate}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-slate-700">{r.serialNumber}</td>
                    <td className="px-4 py-3 max-w-[10rem] truncate text-slate-900" title={`${r.productBrand} ${r.productModel}`}>
                      {r.productBrand} {r.productModel}
                    </td>
                    <td className="px-4 py-3 max-w-[8rem] truncate text-slate-700" title={RETURN_REASON_LABEL[r.returnReason] || r.returnReason}>
                      {RETURN_REASON_LABEL[r.returnReason] || r.returnReason}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${RETUR_STATUS_BADGE_CLASS[rStatus]}`}
                        >
                          {RETUR_STATUS_OPTIONS.find((o) => o.value === rStatus)?.label ?? rStatus}
                        </span>
                        <select
                          aria-label="Schimbă status retur"
                          value={rStatus}
                          disabled={isReturPatching}
                          onChange={(e) => void handleReturStatusChange(r, e.target.value as ReturStatus)}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-50"
                        >
                          {RETUR_STATUS_OPTIONS.map((o) => (
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
                        onClick={() => setReturDetailId(r.id)}
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

      {returDetail ? (
        <div
          className="fixed inset-0 z-[86] flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={() => setReturDetailId(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="retur-detail-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 pt-5 pb-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cerere retur</p>
                <h2 id="retur-detail-title" className="mt-1 font-mono text-lg font-bold text-slate-900">
                  {returDetail.registrationNumber}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">ID intern: {returDetail.id}</p>
              </div>
              <button
                type="button"
                aria-label="Închide"
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                onClick={() => setReturDetailId(null)}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Data</p>
                <p className="mt-0.5 text-sm text-slate-900">{formatDateTime(returDetail.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sursă</p>
                <p className="mt-0.5 text-sm text-slate-900">
                  {SUBMIT_SOURCE_LABEL[returDetail.submitSource] || returDetail.submitSource}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</p>
                <p className="mt-0.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${RETUR_STATUS_BADGE_CLASS[normalizeReturStatus(returDetail.status)]}`}
                  >
                    {RETUR_STATUS_OPTIONS.find((o) => o.value === normalizeReturStatus(returDetail.status))?.label}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Limbă formular</p>
                <p className="mt-0.5 text-sm text-slate-900">{returDetail.locale}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nume</p>
                <p className="mt-0.5 text-sm text-slate-900">{fullNameRetur(returDetail)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</p>
                <p className="mt-0.5 text-sm break-all text-slate-900">{returDetail.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Telefon</p>
                <p className="mt-0.5 text-sm tabular-nums text-slate-900">{formatPhone(returDetail.phone)}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Adresă contact</p>
                <p className="mt-0.5 text-sm text-slate-900">
                  {returDetail.street}, {returDetail.city}, {returDetail.county} {returDetail.postal}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nr. comandă</p>
                <p className="mt-0.5 font-mono text-sm text-slate-900">{returDetail.orderNumber}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Data recepție</p>
                <p className="mt-0.5 text-sm text-slate-900">{returDetail.receiptDate}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">SN</p>
                <p className="mt-0.5 font-mono text-xs text-slate-900">{returDetail.serialNumber}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Marcă / model</p>
                <p className="mt-0.5 text-sm text-slate-900">
                  {returDetail.productBrand} — {returDetail.productModel}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Motiv retur</p>
                <p className="mt-0.5 text-sm text-slate-900">
                  {RETURN_REASON_LABEL[returDetail.returnReason] || returDetail.returnReason}
                </p>
              </div>
              {returDetail.returnReasonOther ? (
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Detalii motiv</p>
                  <p className="mt-1 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
                    {returDetail.returnReasonOther}
                  </p>
                </div>
              ) : null}
              {!returDetail.condUninstalled || !returDetail.condSeals || !returDetail.condPackaging ? (
                <div
                  className="sm:col-span-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-950 shadow-sm"
                  role="alert"
                >
                  <p className="font-bold text-amber-900">Atenție: nu toate declarațiile sunt „Da”</p>
                  <p className="mt-1.5 leading-snug text-amber-950/95">
                    Clientul a marcat cel puțin o afirmație ca <strong>Nu</strong> (sau nu a confirmat toate cele trei condiții pozitive). Verifică fotografiile atașate și potrivirea cu politica de retur înainte de a procesa cererea.
                  </p>
                </div>
              ) : null}
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Declarații stare produs</p>
                <ul className="mt-1 list-inside list-disc text-sm text-slate-800">
                  <li>{returDetail.condUninstalled ? 'Da' : 'Nu'} — Neinstalat / neconectat</li>
                  <li>{returDetail.condSeals ? 'Da' : 'Nu'} — Sigilii intacte</li>
                  <li>{returDetail.condPackaging ? 'Da' : 'Nu'} — Ambalaj și accesorii complete</li>
                </ul>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Adresă preluare colet</p>
                <p className="mt-0.5 text-sm text-slate-900">
                  {returDetail.pickupStreet}, {returDetail.pickupCity}, {returDetail.pickupCounty}{' '}
                  {returDetail.pickupPostal}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Titular cont</p>
                <p className="mt-0.5 text-sm text-slate-900">{returDetail.refundTitular}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">IBAN</p>
                <p className="mt-0.5 font-mono text-xs break-all text-slate-900">{returDetail.refundIban}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Confirmări legale</p>
                <p className="mt-0.5 text-sm text-slate-900">
                  Politică: {returDetail.policyAccepted ? 'da' : 'nu'} · Declarație:{' '}
                  {returDetail.declarationAccepted ? 'da' : 'nu'}
                </p>
              </div>
              {returDetail.userId ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">User ID</p>
                  <p className="mt-0.5 font-mono text-xs break-all text-slate-700">{returDetail.userId}</p>
                </div>
              ) : null}
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Fotografii (R2)</p>
                {Array.isArray(returDetail.conditionPhotoUrls) && returDetail.conditionPhotoUrls.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {returDetail.conditionPhotoUrls.map((url, i) => (
                      <li key={`${url}-${i}`}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-sky-800 underline underline-offset-2 hover:text-sky-950"
                        >
                          Fotografie {i + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">—</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
              <button
                type="button"
                onClick={() => setReturDetailId(null)}
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
