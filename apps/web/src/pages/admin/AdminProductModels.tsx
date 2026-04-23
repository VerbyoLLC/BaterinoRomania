import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getAdminProductModels,
  getAuthToken,
  uploadAdminFile,
  updateAdminProductModel,
  type AdminProductModelRow,
  type UpdateAdminProductModelPayload,
} from '../../lib/api'

type ProductModelDraft = UpdateAdminProductModelPayload
type SpecField = { id: string; label: string; value: string }

function parseSpecs(technicalDescription: string): SpecField[] {
  const lines = String(technicalDescription ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length === 0) return [{ id: crypto.randomUUID(), label: 'Spec', value: '' }]
  return lines.map((line) => {
    const idx = line.indexOf(':')
    if (idx <= 0) return { id: crypto.randomUUID(), label: line, value: '' }
    return {
      id: crypto.randomUUID(),
      label: line.slice(0, idx).trim(),
      value: line.slice(idx + 1).trim(),
    }
  })
}

function serializeSpecs(fields: SpecField[]): string {
  return fields
    .map((f) => {
      const label = f.label.trim()
      const value = f.value.trim()
      if (!label && !value) return ''
      if (!label) return value
      if (!value) return label
      return `${label}: ${value}`
    })
    .filter(Boolean)
    .join('\n')
}

function getEnergyValue(technicalDescription: string): string {
  const lines = String(technicalDescription ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  const energyLine = lines.find((line) => /^energy\s*:/i.test(line))
  if (!energyLine) return '—'
  const idx = energyLine.indexOf(':')
  if (idx < 0) return '—'
  const value = energyLine.slice(idx + 1).trim()
  return value || '—'
}

export default function AdminProductModels() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<AdminProductModelRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draftById, setDraftById] = useState<Record<string, ProductModelDraft>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [drawerModelId, setDrawerModelId] = useState<string | null>(null)
  const [specFields, setSpecFields] = useState<SpecField[]>([])
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [uploadTargetRowId, setUploadTargetRowId] = useState<string | null>(null)
  const [uploadingRowId, setUploadingRowId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    getAdminProductModels()
      .then((result) => {
        setRows(result)
        setDraftById({})
      })
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

  const rowsWithDraft = useMemo(
    () =>
      rows.map((row) => {
        const draft = draftById[row.id]
        return draft ? { ...row, ...draft } : row
      }),
    [rows, draftById],
  )

  const drawerRow = useMemo(() => rowsWithDraft.find((r) => r.id === drawerModelId) ?? null, [rowsWithDraft, drawerModelId])

  const setDraftField = <K extends keyof ProductModelDraft>(rowId: string, key: K, value: ProductModelDraft[K]) => {
    setDraftById((prev) => {
      const base = rows.find((r) => r.id === rowId)
      if (!base) return prev
      const current: ProductModelDraft = prev[rowId] ?? {
        name: base.name,
        brand: base.brand,
        series: base.series,
        modelNumber: base.modelNumber,
        technicalDescription: base.technicalDescription,
        usageType: base.usageType,
        imageUrl: base.imageUrl ?? null,
      }
      return { ...prev, [rowId]: { ...current, [key]: value } }
    })
  }

  const saveRow = async (rowId: string, payload: ProductModelDraft) => {
    setSavingId(rowId)
    setError(null)
    try {
      const updated = await updateAdminProductModel(rowId, payload)
      setRows((prev) => prev.map((r) => (r.id === rowId ? updated : r)))
      setDraftById((prev) => {
        const next = { ...prev }
        delete next[rowId]
        return next
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Eroare la salvare.')
    } finally {
      setSavingId(null)
    }
  }

  const openSpecsDrawer = (row: AdminProductModelRow) => {
    setDrawerModelId(row.id)
    setSpecFields(parseSpecs(row.technicalDescription))
  }

  const saveSpecs = async () => {
    if (!drawerRow) return
    const composed = serializeSpecs(specFields)
    const payload: ProductModelDraft = {
      name: drawerRow.name,
      brand: drawerRow.brand,
      series: drawerRow.series,
      modelNumber: drawerRow.modelNumber,
      technicalDescription: composed,
      usageType: drawerRow.usageType,
      imageUrl: drawerRow.imageUrl ?? null,
    }
    await saveRow(drawerRow.id, payload)
    setDrawerModelId(null)
  }

  const triggerUpload = (rowId: string) => {
    setUploadTargetRowId(rowId)
    fileInputRef.current?.click()
  }

  const onImageSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadTargetRowId) return
    const row = rowsWithDraft.find((r) => r.id === uploadTargetRowId)
    if (!row) return
    setUploadingRowId(uploadTargetRowId)
    setError(null)
    try {
      const uploaded = await uploadAdminFile(file, `product-models/${row.modelNumber || row.id}`)
      setDraftField(uploadTargetRowId, 'imageUrl', uploaded.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la upload imagine.')
    } finally {
      setUploadingRowId(null)
      setUploadTargetRowId(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-6xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-1">Modele</h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-6">
        Product Models — modele produs cu specificații tehnice (tabel <span className="font-mono">product_models</span>
        ).
      </p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-['Inter']">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-sm text-gray-500 font-['Inter']">Se încarcă…</p>
        ) : rows.length === 0 ? (
          <p className="p-8 text-sm text-gray-500 font-['Inter']">Nu există înregistrări. Rulează migrarea API.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-['Inter'] min-w-[1220px]">
              <thead>
                <tr className="border-b border-gray-200 bg-slate-50 text-slate-600">
                  <th className="px-4 py-3 font-semibold w-[13%]">Name</th>
                  <th className="px-4 py-3 font-semibold w-[10%]">Brand</th>
                  <th className="px-4 py-3 font-semibold w-[10%]">Series</th>
                  <th className="px-4 py-3 font-semibold w-[12%]">Model number</th>
                  <th className="px-4 py-3 font-semibold w-[10%]">Energy</th>
                  <th className="px-4 py-3 font-semibold w-[12%]">Type</th>
                  <th className="px-4 py-3 font-semibold w-[12%]">Specifications</th>
                  <th className="px-4 py-3 font-semibold w-[13%]">Image</th>
                  <th className="px-4 py-3 font-semibold w-[8%]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rowsWithDraft.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 align-top last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <input
                        value={row.name}
                        onChange={(e) => setDraftField(row.id, 'name', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={row.brand}
                        onChange={(e) => setDraftField(row.id, 'brand', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={row.series}
                        onChange={(e) => setDraftField(row.id, 'series', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                        placeholder="Series"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={row.modelNumber}
                        onChange={(e) => setDraftField(row.id, 'modelNumber', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-800"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                        {getEnergyValue(row.technicalDescription)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={row.usageType}
                        onChange={(e) =>
                          setDraftField(
                            row.id,
                            'usageType',
                            e.target.value === 'residential' ? 'residential' : 'industrial',
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                      >
                        <option value="industrial">Industrial</option>
                        <option value="residential">Residential</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openSpecsDrawer(row)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                      >
                        View
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => triggerUpload(row.id)}
                          disabled={uploadingRowId === row.id}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
                        >
                          {uploadingRowId === row.id ? 'Uploading...' : 'Upload'}
                        </button>
                        <button
                          type="button"
                          onClick={() => row.imageUrl && setPreviewImageUrl(row.imageUrl)}
                          disabled={!row.imageUrl}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-40"
                        >
                          View
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          saveRow(row.id, {
                            name: row.name,
                            brand: row.brand,
                            series: row.series,
                            modelNumber: row.modelNumber,
                            technicalDescription: row.technicalDescription,
                            usageType: row.usageType,
                            imageUrl: row.imageUrl ?? null,
                          })
                        }
                        disabled={savingId === row.id}
                        className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        {savingId === row.id ? 'Saving...' : 'Save'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {drawerRow && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setDrawerModelId(null)}
            className="absolute inset-0 bg-black/35"
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-['Inter']">Technical specifications</h2>
                <p className="text-xs text-slate-500 font-mono">{drawerRow.modelNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerModelId(null)}
                className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {specFields.map((field, index) => (
                <div key={field.id} className="rounded-xl border border-slate-200 p-3 space-y-2">
                  <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
                    {(field.label || `Field ${index + 1}`).trim()}
                  </div>
                  <textarea
                    value={field.value}
                    onChange={(e) =>
                      setSpecFields((prev) =>
                        prev.map((f) => (f.id === field.id ? { ...f, value: e.target.value } : f)),
                      )
                    }
                    placeholder="Value"
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-y"
                  />
                </div>
              ))}
              </div>
            </div>

            <div className="border-t border-slate-200 p-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDrawerModelId(null)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveSpecs}
                disabled={savingId === drawerRow.id}
                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
              >
                {savingId === drawerRow.id ? 'Saving...' : 'Save specs'}
              </button>
            </div>
          </aside>
        </div>
      )}

      {previewImageUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close preview"
            className="absolute inset-0 bg-black/60"
            onClick={() => setPreviewImageUrl(null)}
          />
          <div className="relative max-w-5xl w-full rounded-xl bg-white shadow-2xl p-4">
            <div className="flex justify-end mb-3">
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                Close
              </button>
            </div>
            <img src={previewImageUrl} alt="Product model" className="w-full max-h-[75vh] object-contain rounded-lg" />
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImageSelected}
      />
    </div>
  )
}
