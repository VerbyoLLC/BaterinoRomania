import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminWarehouseSavedItems, getAuthToken, type WarehouseSavedItemRow } from '../../lib/api'

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

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left text-sm font-['Inter']">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="px-4 py-3 font-semibold">Nr. item</th>
              <th className="px-4 py-3 font-semibold">Model number</th>
              <th className="px-4 py-3 font-semibold">SN</th>
              <th className="px-4 py-3 font-semibold">Produced on</th>
              <th className="px-4 py-3 font-semibold">Warehouse in</th>
              <th className="px-4 py-3 font-semibold">Distributor</th>
              <th className="px-4 py-3 font-semibold">Client</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Se încarcă...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Nu există iteme salvate încă.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 text-slate-800">
                  <td className="px-4 py-3 font-mono">{formatWarehouseItemNumber(row.itemNumber)}</td>
                  <td className="px-4 py-3">{row.modelNumber || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs sm:text-sm">{formatSerialGrouped(row.serialNumber)}</td>
                  <td className="px-4 py-3">{row.producedOn || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatRoDate(row.warehouseIn)}</td>
                  <td className="px-4 py-3">{row.distributor || '—'}</td>
                  <td className="px-4 py-3">{row.client || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
