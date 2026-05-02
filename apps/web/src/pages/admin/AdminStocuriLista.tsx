import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Loader2 } from 'lucide-react'
import {
  deleteAdminWarehouseSavedItem,
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

  const isAdmin = getAuthRole() === 'admin'

  const uniqueModelNumbers = useMemo(() => {
    const s = new Set<string>()
    for (const r of rows) {
      const m = String(r.modelNumber ?? '').trim()
      if (m) s.add(m)
    }
    return [...s].sort((a, b) => a.localeCompare(b, 'ro', { sensitivity: 'base' }))
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

  const hasActiveFilters =
    Boolean(filterModelNumber) || Boolean(filterLocation) || searchDistributor.trim() !== '' || searchClient.trim() !== ''

  const clearFilters = () => {
    setFilterModelNumber('')
    setFilterLocation('')
    setSearchDistributor('')
    setSearchClient('')
  }

  const visibleIds = useMemo(() => filteredRows.map((r) => r.id), [filteredRows])
  const selectedInViewCount = useMemo(
    () => visibleIds.filter((id) => selectedIds.has(id)).length,
    [visibleIds, selectedIds],
  )
  const allVisibleSelected =
    visibleIds.length > 0 && selectedInViewCount === visibleIds.length
  const someVisibleSelected = selectedInViewCount > 0 && !allVisibleSelected

  useLayoutEffect(() => {
    const el = selectAllRef.current
    if (el) el.indeterminate = someVisibleSelected
  }, [someVisibleSelected])

  const toggleRowSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) {
        for (const id of visibleIds) next.delete(id)
      } else {
        for (const id of visibleIds) next.add(id)
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

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {!loading && rows.length > 0 && (
          <div className="flex justify-end border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 sm:px-5">
            <p className="text-xs text-slate-500 font-['Inter'] text-right tabular-nums" aria-live="polite">
              Afișare: <span className="font-semibold text-slate-800">{filteredRows.length}</span> din{' '}
              <span className="font-semibold text-slate-800">{rows.length}</span> înregistrări
            </p>
          </div>
        )}
        <div className="overflow-x-auto">
        <table className={`w-full text-left text-sm font-['Inter'] ${isAdmin ? 'min-w-[1080px]' : 'min-w-[1020px]'}`}>
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200 text-slate-600">
              {isAdmin && (
                <th className="w-12 px-3 py-3" scope="col">
                  <span className="sr-only">Selectare</span>
                  {filteredRows.length > 0 && (
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAllVisible}
                      disabled={bulkDeleting}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-400"
                      aria-label="Selectează toate rândurile vizibile"
                    />
                  )}
                </th>
              )}
              <th className="px-4 py-3 font-semibold">Nr. item</th>
              <th className="px-4 py-3 font-semibold">Model number</th>
              <th className="px-4 py-3 font-semibold">SN</th>
              <th className="px-4 py-3 font-semibold">Produced on</th>
              <th className="px-4 py-3 font-semibold">Warehouse in</th>
              <th className="px-4 py-3 font-semibold">Locație</th>
              <th className="px-4 py-3 font-semibold">Distributor</th>
              <th className="px-4 py-3 font-semibold">Client</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 9 : 8} className="px-4 py-8 text-center text-slate-500">
                  Se încarcă...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 9 : 8} className="px-4 py-8 text-center text-slate-500">
                  Nu există iteme salvate încă.
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 9 : 8} className="px-4 py-10 text-center text-slate-500 font-['Inter']">
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
              filteredRows.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-slate-100 text-slate-800 ${selectedIds.has(row.id) ? 'bg-sky-50/70' : ''}`}
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
                  <td className="px-4 py-3 font-mono text-xs sm:text-sm">{formatSerialGrouped(row.serialNumber)}</td>
                  <td className="px-4 py-3">{row.producedOn || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatRoDate(row.warehouseIn)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatWarehouseLocation(row.location)}</td>
                  <td className="px-4 py-3">{row.distributor || '—'}</td>
                  <td className="px-4 py-3">{row.client || '—'}</td>
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
