import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Loader2 } from 'lucide-react'
import {
  deleteAdminWarehouseSavedItem,
  downloadAdminWarehouseWarrantyCertificate,
  getAdminWarehouseSavedItems,
  getAuthRole,
  getAuthToken,
  type WarehouseSavedItemLocation,
  type WarehouseSavedItemRow,
} from '../../lib/api'

const WAREHOUSE_LOCATION_LABELS: Record<WarehouseSavedItemLocation, string> = {
  depozit: 'Depozit',
  distribuitor: 'Distribuitor',
  client_final: 'Client Final',
  service: 'Service',
}

const LOCATION_FILTER_OPTIONS: { value: WarehouseSavedItemLocation; label: string }[] = [
  { value: 'depozit', label: 'Depozit' },
  { value: 'distribuitor', label: 'Distribuitor' },
  { value: 'client_final', label: 'Client Final' },
  { value: 'service', label: 'Service' },
]

function formatWarehouseLocation(value: string | null | undefined) {
  const key = String(value || 'depozit').trim() as WarehouseSavedItemLocation
  return WAREHOUSE_LOCATION_LABELS[key] ?? 'Depozit'
}

function formatRoDate(iso: string) {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return new Intl.DateTimeFormat('ro-RO', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(d)
  } catch {
    return iso
  }
}

/** Formatare „doar dată” pentru coloanele de garanţie. */
function formatRoDateOnly(iso: string | null | undefined) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '—'
    return new Intl.DateTimeFormat('ro-RO', { dateStyle: 'short' }).format(d)
  } catch {
    return '—'
  }
}

function formatSerialGrouped(serialNumber: string) {
  const raw = String(serialNumber ?? '').trim().toUpperCase()
  if (!raw) return '—'
  const prefix = raw.slice(0, 3)
  const digits = raw.slice(3).replace(/\D/g, '')
  const groups = digits.match(/.{1,4}/g) ?? []
  return groups.length > 0 ? `${prefix} - ${groups.join(' - ')}` : raw
}

function formatWarehouseItemNumber(value: number | null | undefined) {
  if (!Number.isFinite(value)) return '—'
  return String(value).padStart(4, '0')
}

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200, 500] as const

export default function AdminStocuriLista() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<WarehouseSavedItemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const selectAllRef = useRef<HTMLInputElement>(null)

  const [filterModelNumber, setFilterModelNumber] = useState('')
  const [filterLocation, setFilterLocation] = useState<'' | WarehouseSavedItemLocation>('')
  const [searchDistributor, setSearchDistributor] = useState('')
  const [searchClient, setSearchClient] = useState('')
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const [warrantyDownloadingId, setWarrantyDownloadingId] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState<number>(50)
  const [page, setPage] = useState(1)

  const handleDownloadWarranty = useCallback(async (rowId: string) => {
    setWarrantyDownloadingId(rowId)
    setError(null)
    try {
      const { pdfBlob, filename } = await downloadAdminWarehouseWarrantyCertificate(rowId)
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Eroare la descărcare.')
    } finally {
      setWarrantyDownloadingId(null)
    }
  }, [])

  const isAdmin = getAuthRole() === 'admin'

  const uniqueModelNumbers = useMemo(() => {
    const s = new Set<string>()
    for (const r of rows) {
      const m = String(r.modelNumber ?? '').trim()
      if (m) s.add(m)
    }
    return [...s].sort((a, b) => a.localeCompare(b, 'ro', { sensitivity: 'base' }))
  }, [rows])

  /** Baterii aflate în Depozit, grupate pe model (indiferent de filtrele listei). */
  const depozitStockByModel = useMemo(() => {
    const counts = new Map<string, number>()
    let total = 0
    for (const r of rows) {
      const loc = String(r.location ?? 'depozit').trim() as WarehouseSavedItemLocation
      if (loc !== 'depozit') continue
      total += 1
      const model = String(r.modelNumber ?? '').trim() || '—'
      counts.set(model, (counts.get(model) ?? 0) + 1)
    }
    const byModel = [...counts.entries()].sort((a, b) =>
      a[0].localeCompare(b[0], 'ro', { sensitivity: 'base' }),
    )
    return { total, byModel }
  }, [rows])

  const filteredRows = useMemo(() => {
    const distQ = searchDistributor.trim().toLowerCase()
    const clientQ = searchClient.trim().toLowerCase()
    return rows.filter((row) => {
      if (filterModelNumber && String(row.modelNumber ?? '').trim() !== filterModelNumber) return false
      if (filterLocation) {
        const loc = String(row.location ?? 'depozit').trim() as WarehouseSavedItemLocation
        if (loc !== filterLocation) return false
      }
      if (distQ && !String(row.distributor ?? '').toLowerCase().includes(distQ)) return false
      if (clientQ && !String(row.client ?? '').toLowerCase().includes(clientQ)) return false
      return true
    })
  }, [rows, filterModelNumber, filterLocation, searchDistributor, searchClient])

  /* Paginare listă (după filtre). */
  const totalFiltered = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize) || 1)
  const safePage = Math.min(page, totalPages)
  const rangeStart = totalFiltered === 0 ? 0 : (safePage - 1) * pageSize + 1
  const rangeEnd = Math.min(safePage * pageSize, totalFiltered)

  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredRows.slice(start, start + pageSize)
  }, [filteredRows, safePage, pageSize])

  useEffect(() => {
    setPage(1)
  }, [filterModelNumber, filterLocation, searchDistributor, searchClient])

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages))
  }, [totalPages])

  const hasActiveFilters =
    Boolean(filterModelNumber) || Boolean(filterLocation) || searchDistributor.trim() !== '' || searchClient.trim() !== ''

  const clearFilters = () => {
    setFilterModelNumber('')
    setFilterLocation('')
    setSearchDistributor('')
    setSearchClient('')
  }

  /** ID-uri pe pagina curentă (pentru „selectează tot” pe această pagină). */
  const pageRowIds = useMemo(() => paginatedRows.map((r) => r.id), [paginatedRows])
  const selectedOnPageCount = useMemo(
    () => pageRowIds.filter((id) => selectedIds.has(id)).length,
    [pageRowIds, selectedIds],
  )
  const allPageSelected =
    pageRowIds.length > 0 && selectedOnPageCount === pageRowIds.length
  const somePageSelected = selectedOnPageCount > 0 && !allPageSelected

  useLayoutEffect(() => {
    const el = selectAllRef.current
    if (el) el.indeterminate = somePageSelected
  }, [somePageSelected])

  const toggleRowSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allPageSelected) {
        for (const id of pageRowIds) next.delete(id)
      } else {
        for (const id of pageRowIds) next.add(id)
      }
      return next
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  const handleBulkDelete = async () => {
    if (!isAdmin || selectedIds.size === 0 || bulkDeleting) return
    const ids = [...selectedIds]
    const ok = window.confirm(
      `Sigur ștergi ${ids.length} unități din depozit? Numerele de serie vor putea fi înregistrate din nou ulterior.`,
    )
    if (!ok) return
    setBulkDeleting(true)
    setError(null)
    const failed: string[] = []
    for (const id of ids) {
      try {
        await deleteAdminWarehouseSavedItem(id)
        setRows((prev) => prev.filter((r) => r.id !== id))
      } catch {
        failed.push(id)
      }
    }
    setSelectedIds(new Set(failed))
    setBulkDeleting(false)
    if (failed.length > 0) {
      setError(
        failed.length === ids.length
          ? 'Nu s-au putut șterge înregistrările. Verifică permisiunile sau încearcă din nou.'
          : `${failed.length} din ${ids.length} înregistrări nu au putut fi șterse.`,
      )
    }
  }

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const result = await getAdminWarehouseSavedItems(500)
      setRows(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Eroare la încărcare.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/admin/login', { replace: true })
      return
    }
    load()
  }, [navigate, load])

  useEffect(() => {
    const valid = new Set(rows.map((r) => r.id))
    setSelectedIds((prev) => {
      const next = new Set<string>()
      for (const id of prev) {
        if (valid.has(id)) next.add(id)
      }
      return next.size === prev.size ? prev : next
    })
  }, [rows])

  return (
    <div className="w-full max-w-none p-6 sm:p-8 lg:p-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-['Inter']">
          Stocuri - Lista
        </h1>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 font-['Inter']"
        >
          Reîncarcă
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-['Inter']">
          {error}
        </div>
      )}

      {!loading && rows.length > 0 && (
        <>
        <div className="mb-4 rounded-xl border border-slate-200 bg-[#f7f7f7] px-3 py-2 shadow-sm sm:px-4">
          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-['Inter']"
            role="group"
            aria-label="Rezumat stocuri Depozit"
          >
            <span className="shrink-0 font-bold text-slate-900">Total Stocuri</span>
            <span className="text-slate-300 select-none" aria-hidden>
              |
            </span>
            <span className="flex shrink-0 items-baseline gap-1.5 tabular-nums">
              <span className="text-lg font-bold leading-none text-slate-900">{depozitStockByModel.total}</span>
              <span className="text-xs font-medium text-slate-600">
                {depozitStockByModel.total === 1 ? 'item' : 'iteme'}
              </span>
            </span>
            {depozitStockByModel.byModel.length > 0 ? (
              <>
                <span className="text-slate-300 select-none" aria-hidden>
                  |
                </span>
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-700">
                  {depozitStockByModel.byModel.map(([model, count], i) => (
                    <span key={model} className="inline-flex max-w-full items-center gap-1">
                      {i > 0 ? (
                        <span className="text-slate-300 select-none" aria-hidden>
                          ·
                        </span>
                      ) : null}
                      <span className="min-w-0 truncate font-medium text-slate-800" title={model}>
                        {model}
                      </span>
                      <span className="shrink-0 tabular-nums font-semibold text-slate-900">{count}</span>
                    </span>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5">
            <button
              type="button"
              onClick={() => setFiltersExpanded((v) => !v)}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-lg py-1 text-left text-sm font-semibold text-slate-800 outline-none ring-slate-400/50 hover:bg-slate-50 focus-visible:ring-2 sm:flex-none font-['Inter']"
              aria-expanded={filtersExpanded}
              aria-controls="stocuri-filters-panel"
              id="stocuri-filters-toggle"
            >
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${filtersExpanded ? 'rotate-180' : ''}`}
                aria-hidden
                strokeWidth={2}
              />
              <span>Filtre</span>
              {hasActiveFilters && (
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-900">active</span>
              )}
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 font-['Inter']"
              >
                Resetează filtrele
              </button>
            )}
          </div>
          {filtersExpanded && (
            <div
              id="stocuri-filters-panel"
              role="region"
              aria-labelledby="stocuri-filters-toggle"
              className="border-t border-slate-100 px-4 pb-4 pt-3 sm:px-5 sm:pb-5"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label htmlFor="stocuri-filter-model" className="mb-1.5 block text-xs font-medium text-slate-600 font-['Inter']">
                    Model number
                  </label>
                  <select
                    id="stocuri-filter-model"
                    value={filterModelNumber}
                    onChange={(e) => setFilterModelNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 font-['Inter']"
                  >
                    <option value="">Toate modelele</option>
                    {uniqueModelNumbers.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="stocuri-filter-location" className="mb-1.5 block text-xs font-medium text-slate-600 font-['Inter']">
                    Locație
                  </label>
                  <select
                    id="stocuri-filter-location"
                    value={filterLocation}
                    onChange={(e) => setFilterLocation((e.target.value || '') as '' | WarehouseSavedItemLocation)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 font-['Inter']"
                  >
                    <option value="">Toate locațiile</option>
                    {LOCATION_FILTER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="stocuri-search-distributor" className="mb-1.5 block text-xs font-medium text-slate-600 font-['Inter']">
                    Căutare distribuitor
                  </label>
                  <input
                    id="stocuri-search-distributor"
                    type="search"
                    value={searchDistributor}
                    onChange={(e) => setSearchDistributor(e.target.value)}
                    placeholder="Text în numele distribuitorului…"
                    autoComplete="off"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 font-['Inter']"
                  />
                </div>
                <div>
                  <label htmlFor="stocuri-search-client" className="mb-1.5 block text-xs font-medium text-slate-600 font-['Inter']">
                    Căutare client
                  </label>
                  <input
                    id="stocuri-search-client"
                    type="search"
                    value={searchClient}
                    onChange={(e) => setSearchClient(e.target.value)}
                    placeholder="Text în numele clientului…"
                    autoComplete="off"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 font-['Inter']"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        </>
      )}

      {isAdmin && selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
          <p className="text-sm font-medium text-slate-800 font-['Inter']">
            <span className="font-semibold tabular-nums">{selectedIds.size}</span>{' '}
            {selectedIds.size === 1 ? 'rând selectat' : 'rânduri selectate'}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={clearSelection}
              disabled={bulkDeleting}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 font-['Inter']"
            >
              Anulează selecția
            </button>
            <button
              type="button"
              onClick={() => void handleBulkDelete()}
              disabled={bulkDeleting}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 font-['Inter']"
            >
              {bulkDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Se șterge…
                </>
              ) : (
                'Șterge selectate'
              )}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        {!loading && rows.length > 0 && (
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
            <p className="text-sm text-slate-600 font-['Inter'] tabular-nums" aria-live="polite">
              <span className="font-semibold text-slate-900">
                {totalFiltered === 0 ? '0' : `${rangeStart}–${rangeEnd}`}
              </span>{' '}
              din <span className="font-semibold text-slate-900">{totalFiltered}</span> după filtre
              <span className="mx-1.5 text-slate-300">·</span>
              <span className="text-slate-500">{rows.length} în total</span>
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="stocuri-page-size" className="flex items-center gap-2 text-sm text-slate-600 font-['Inter']">
                <span className="whitespace-nowrap">Rânduri pe pagină</span>
                <select
                  id="stocuri-page-size"
                  value={pageSize}
                  onChange={(e) => {
                    const n = Number(e.target.value)
                    setPageSize(n)
                    setPage(1)
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/50"
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1 || loading}
                  className="rounded-md px-2.5 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Pagina anterioară"
                >
                  ‹
                </button>
                <span className="min-w-[7rem] px-2 text-center text-sm tabular-nums text-slate-700 font-['Inter']">
                  Pagina <span className="font-semibold text-slate-900">{safePage}</span> / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages || loading}
                  className="rounded-md px-2.5 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Pagina următoare"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
        <table
          className={`w-full border-collapse text-left text-sm font-['Inter'] ${isAdmin ? 'min-w-[1520px]' : 'min-w-[1460px]'}`}
        >
          <thead className="sticky top-0 z-10 bg-slate-100/95 shadow-[inset_0_-1px_0_0_rgb(226_232_240)] backdrop-blur-sm">
            <tr className="text-slate-700">
              {isAdmin && (
                <th className="w-12 px-3 py-3.5" scope="col">
                  <span className="sr-only">Selectare</span>
                  {paginatedRows.length > 0 && (
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allPageSelected}
                      onChange={toggleSelectAllOnPage}
                      disabled={bulkDeleting}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-400"
                      aria-label="Selectează toate rândurile din această pagină"
                    />
                  )}
                </th>
              )}
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Nr. item</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Model</th>
              <th className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                SN
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Produced on</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Warehouse in</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Locație</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Distributor</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                Garanție distribuitor
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Client</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                Data
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                Garanție client
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 12 : 11} className="px-4 py-8 text-center text-slate-500">
                  Se încarcă...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 12 : 11} className="px-4 py-8 text-center text-slate-500">
                  Nu există iteme salvate încă.
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 12 : 11} className="px-4 py-10 text-center text-slate-500 font-['Inter']">
                  Niciun rezultat pentru filtrele curente.{' '}
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
                  >
                    Resetează filtrele
                  </button>
                </td>
              </tr>
            ) : (
              paginatedRows.map((row) => (
                <tr
                  key={row.id}
                  className={`text-slate-800 transition-colors hover:bg-slate-50/90 ${selectedIds.has(row.id) ? 'bg-sky-50/80' : 'bg-white'}`}
                >
                  {isAdmin && (
                    <td className="px-3 py-3 align-middle">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleRowSelected(row.id)}
                        disabled={bulkDeleting}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-400"
                        aria-label={`Selectează rândul ${formatWarehouseItemNumber(row.itemNumber)}`}
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 font-mono">{formatWarehouseItemNumber(row.itemNumber)}</td>
                  <td className="px-4 py-3">{row.modelNumber || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs sm:text-sm align-middle">
                    {formatSerialGrouped(row.serialNumber)}
                  </td>
                  <td className="px-4 py-3">{row.producedOn || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatRoDate(row.warehouseIn)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatWarehouseLocation(row.location)}</td>
                  <td className="px-4 py-3">{row.distributor || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                    {row.distributor ? (
                      <span className="text-slate-700">{formatRoDateOnly(row.warehouseIn)}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {row.clientAccount ? (
                      <span className="block">
                        {(() => {
                          const name = [row.clientAccount.firstName, row.clientAccount.lastName]
                            .filter(Boolean)
                            .join(' ')
                            .trim()
                          if (name) {
                            return (
                              <>
                                <span className="font-medium text-slate-900">{name}</span>
                                <span className="block text-xs text-slate-500">{row.clientAccount.email}</span>
                              </>
                            )
                          }
                          return (
                            <span className="font-medium text-slate-900">{row.clientAccount.email}</span>
                          )
                        })()}
                      </span>
                    ) : (
                      row.client || '—'
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                    {row.warrantyCertificateGeneratedAt ? (
                      <span className="text-slate-700">
                        {formatRoDateOnly(row.warrantyCertificateGeneratedAt)}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.warrantyCertificateAvailable && row.warrantyCertificateNumber ? (
                      <button
                        type="button"
                        onClick={() => void handleDownloadWarranty(row.id)}
                        disabled={warrantyDownloadingId === row.id}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-xs font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-progress disabled:opacity-60"
                        title="Descarcă PDF certificat"
                        aria-label={`Descarcă certificat ${row.warrantyCertificateNumber}`}
                      >
                        {warrantyDownloadingId === row.id ? (
                          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                        ) : null}
                        <span>{row.warrantyCertificateNumber}</span>
                      </button>
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
      </div>
    </div>
  )
}
