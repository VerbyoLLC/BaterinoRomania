import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getAdminProductModels,
  getAuthToken,
  patchAdminProductModelAvailableForStock,
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

function normalizeSpecLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/** Reads energy from technicalDescription and returns it formatted as kWh only. */
function getEnergyValue(technicalDescription: string, name?: string): string {
  const lines = String(technicalDescription ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  let raw = ''
  for (const line of lines) {
    const idx = line.indexOf(':')
    if (idx <= 0) continue
    const label = normalizeSpecLabel(line.slice(0, idx))
    if (label === 'energy' || label === 'nominal energy' || label === 'energie nominala') {
      raw = line.slice(idx + 1).trim()
      break
    }
  }

  if (!raw) {
    const fromName = String(name ?? '').match(/\(([^)]*kwh[^)]*)\)/i)
    if (fromName?.[1]?.trim()) return fromName[1].trim()
    return '—'
  }

  // Prefer the kWh value inside parentheses: "64307.2Wh (64.3 kWh)" → "64.3 kWh"
  const kwhInParens = raw.match(/\(([\d.,]+\s*kwh)\)/i)
  if (kwhInParens?.[1]) return kwhInParens[1].trim()

  // Pure Wh value — convert: "64307.2Wh" → "64.3 kWh"
  const whOnly = raw.match(/^([\d.,]+)\s*wh$/i)
  if (whOnly) {
    const wh = parseFloat(whOnly[1].replace(',', '.'))
    if (!isNaN(wh) && wh > 0) return `${(wh / 1000).toFixed(1)} kWh`
  }

  // Already kWh or unknown format — return as-is
  return raw
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
  const [uploadingRowId] = useState<string | null>(null)
  const [availabilitySavingId, setAvailabilitySavingId] = useState<string | null>(null)
  const [viewModelId, setViewModelId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Image cropper
  const [cropperState, setCropperState] = useState<{ src: string; rowId: string; fileName: string } | null>(null)
  const [cropUploading, setCropUploading] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isPanning, setIsPanning] = useState(false)
  const isPanningRef = useRef(false)
  const panStartRef = useRef({ x: 0, y: 0 })
  const imgCropRef = useRef<HTMLImageElement>(null)
  const cropContainerRef = useRef<HTMLDivElement>(null)
  const cropBoxRef = useRef<HTMLDivElement>(null)

  // Search & filters
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'industrial' | 'residential'>('all')
  const [filterAvailable, setFilterAvailable] = useState<'all' | 'yes' | 'no'>('all')

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
  const viewRow = useMemo(() => rowsWithDraft.find((r) => r.id === viewModelId) ?? null, [rowsWithDraft, viewModelId])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rowsWithDraft.filter((row) => {
      if (q) {
        const inName = row.name.toLowerCase().includes(q)
        const inSeries = row.series.toLowerCase().includes(q)
        const inModel = row.modelNumber.toLowerCase().includes(q)
        if (!inName && !inSeries && !inModel) return false
      }
      if (filterType !== 'all' && row.usageType !== filterType) return false
      if (filterAvailable === 'yes' && row.availableForStock === false) return false
      if (filterAvailable === 'no' && row.availableForStock !== false) return false
      return true
    })
  }, [rowsWithDraft, search, filterType, filterAvailable])

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
        productImageUrl: base.productImageUrl ?? null,
        availableForStock: base.availableForStock !== false,
      }
      return { ...prev, [rowId]: { ...current, [key]: value } }
    })
  }

  const patchAvailability = async (rowId: string, next: boolean) => {
    setAvailabilitySavingId(rowId)
    setError(null)
    try {
      const updated = await patchAdminProductModelAvailableForStock(rowId, next)
      setRows((prev) => prev.map((r) => (r.id === rowId ? updated : r)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Eroare la actualizarea disponibilității.')
    } finally {
      setAvailabilitySavingId(null)
    }
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
      productImageUrl: drawerRow.productImageUrl ?? null,
      availableForStock: drawerRow.availableForStock !== false,
    }
    await saveRow(drawerRow.id, payload)
    setDrawerModelId(null)
  }

  const triggerUpload = (rowId: string) => {
    setUploadTargetRowId(rowId)
    fileInputRef.current?.click()
  }

  const inputCellClass =
    'w-full min-w-0 h-9 rounded-md border border-slate-200 bg-white px-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20'

  const btnGhost =
    'inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100 disabled:pointer-events-none disabled:opacity-40'

  const onImageSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadTargetRowId) return
    const reader = new FileReader()
    reader.onload = () => {
      setCropperState({ src: reader.result as string, rowId: uploadTargetRowId, fileName: file.name })
      setZoom(1)
      setPanX(0)
      setPanY(0)
    }
    reader.readAsDataURL(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setUploadTargetRowId(null)
  }

  const onCropImageLoad = () => {
    setPanX(0)
    setPanY(0)
  }

  const onCropMouseDown = (e: React.MouseEvent) => {
    isPanningRef.current = true
    setIsPanning(true)
    panStartRef.current = { x: e.clientX - panX, y: e.clientY - panY }
  }
  const onCropMouseMove = (e: React.MouseEvent) => {
    if (!isPanningRef.current) return
    setPanX(e.clientX - panStartRef.current.x)
    setPanY(e.clientY - panStartRef.current.y)
  }
  const onCropMouseUp = () => { isPanningRef.current = false; setIsPanning(false) }

  const onCropConfirm = async () => {
    if (!cropperState || !imgCropRef.current || !cropContainerRef.current || !cropBoxRef.current) return
    const img = imgCropRef.current
    const cropBox = cropBoxRef.current

    // getBoundingClientRect gives actual visual positions (includes CSS transforms on img)
    const imgRect     = img.getBoundingClientRect()      // visual post-transform
    const cropBoxRect = cropBox.getBoundingClientRect()  // no transform on crop box

    // Crop box content area (subtract 2px border on each side)
    const border = 2
    const cropBoxContentLeft = cropBoxRect.left + border
    const cropBoxContentTop  = cropBoxRect.top  + border
    const cropSizeVisual = cropBoxRect.width - border * 2   // square content size in screen px

    // Position of crop box content relative to image visual left/top (in screen px)
    const relX = cropBoxContentLeft - imgRect.left
    const relY = cropBoxContentTop  - imgRect.top

    // img.width/height are LAYOUT dimensions (CSS transform doesn't affect them)
    const W_i = img.width
    const H_i = img.height

    // Convert visual (post-transform) screen px → image layout px (÷ zoom)
    const displayX = relX / zoom
    const displayY = relY / zoom
    const displayW = cropSizeVisual / zoom
    const displayH = cropSizeVisual / zoom

    // Overlap of crop window with actual image layout bounds [0,W_i]×[0,H_i]
    const overlapX1 = Math.max(0, displayX)
    const overlapX2 = Math.min(W_i, displayX + displayW)
    const overlapY1 = Math.max(0, displayY)
    const overlapY2 = Math.min(H_i, displayY + displayH)

    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 600
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // White background (visible when crop window extends beyond image)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 600, 600)

    if (overlapX2 > overlapX1 && overlapY2 > overlapY1) {
      // Where the image lands in the 600×600 output canvas
      const outX = ((overlapX1 - displayX) / displayW) * 600
      const outY = ((overlapY1 - displayY) / displayH) * 600
      const outW = ((overlapX2 - overlapX1) / displayW) * 600
      const outH = ((overlapY2 - overlapY1) / displayH) * 600

      // Natural image coordinates
      const scaleX = img.naturalWidth  / W_i
      const scaleY = img.naturalHeight / H_i
      const natX = overlapX1 * scaleX
      const natY = overlapY1 * scaleY
      const natW = (overlapX2 - overlapX1) * scaleX
      const natH = (overlapY2 - overlapY1) * scaleY

      ctx.drawImage(img, natX, natY, natW, natH, outX, outY, outW, outH)
    }
    canvas.toBlob(async (blob) => {
      if (!blob) return
      const croppedFile = new File([blob], cropperState.fileName.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
      const row = rowsWithDraft.find((r) => r.id === cropperState.rowId)
      if (!row) return
      setCropUploading(true)
      setError(null)
      try {
        const uploaded = await uploadAdminFile(croppedFile, `product-models/${row.modelNumber || row.id}-product`)
        setDraftField(cropperState.rowId, 'productImageUrl', uploaded.url)
        setCropperState(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Eroare la upload imagine.')
      } finally {
        setCropUploading(false)
      }
    }, 'image/jpeg', 0.92)
  }

  const triggerProductImageUpload = (rowId: string) => {
    setUploadTargetRowId(rowId)
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full max-w-none p-6 sm:p-8 lg:p-10">
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

      {/* Search & Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Caută după Nume, Serie, Model…"
          className="h-9 w-full max-w-sm rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-['Inter']"
        />
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 font-['Inter'] uppercase tracking-wide">Tip</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'industrial' | 'residential')}
            className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-['Inter']"
          >
            <option value="all">Toate</option>
            <option value="industrial">Industrial</option>
            <option value="residential">Residential</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 font-['Inter'] uppercase tracking-wide">Disponibil</label>
          <select
            value={filterAvailable}
            onChange={(e) => setFilterAvailable(e.target.value as 'all' | 'yes' | 'no')}
            className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-['Inter']"
          >
            <option value="all">Toate</option>
            <option value="yes">Disponibil</option>
            <option value="no">Indisponibil</option>
          </select>
        </div>
        {(search || filterType !== 'all' || filterAvailable !== 'all') && (
          <span className="text-xs text-slate-400 font-['Inter']">
            {filteredRows.length} / {rowsWithDraft.length} rezultate
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden ring-1 ring-slate-900/[0.04]">
        {loading ? (
          <p className="p-8 text-sm text-gray-500 font-['Inter']">Se încarcă…</p>
        ) : rows.length === 0 ? (
          <p className="p-8 text-sm text-gray-500 font-['Inter']">Nu există înregistrări. Rulează migrarea API.</p>
        ) : filteredRows.length === 0 ? (
          <p className="p-8 text-sm text-gray-500 font-['Inter']">Niciun model nu corespunde filtrelor selectate.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[60rem] table-fixed border-collapse text-left text-sm font-['Inter']">
              <thead>
                <tr className="border-b border-slate-200 bg-gradient-to-b from-slate-100 to-slate-50/90">
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-[12%]">
                    Name
                  </th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-[9%]">
                    Brand
                  </th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-[8%]">
                    Series
                  </th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-[11%]">
                    Model
                  </th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-[10%]">
                    Energy
                  </th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-[10%]">
                    Type
                  </th>
                  <th className="px-2 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-[5.25rem] text-center">
                    Available
                  </th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-[8.25rem] text-center">
                    Product Image
                  </th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-[5.5rem] text-center">
                    Specs
                  </th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-[8.25rem] text-center">
                    Image
                  </th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-[5.5rem] text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`align-middle transition-colors hover:bg-sky-50/40 ${idx % 2 === 1 ? 'bg-slate-50/35' : 'bg-white'}`}
                  >
                    <td className="px-3 py-2.5">
                      <input
                        value={row.name}
                        onChange={(e) => setDraftField(row.id, 'name', e.target.value)}
                        className={`${inputCellClass} font-semibold text-slate-900`}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        value={row.brand}
                        onChange={(e) => setDraftField(row.id, 'brand', e.target.value)}
                        className={inputCellClass}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        value={row.series}
                        onChange={(e) => setDraftField(row.id, 'series', e.target.value)}
                        className={inputCellClass}
                        placeholder="—"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        value={row.modelNumber}
                        onChange={(e) => setDraftField(row.id, 'modelNumber', e.target.value)}
                        className={`${inputCellClass} font-mono text-[13px]`}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="block min-h-9 rounded-md border border-transparent bg-slate-50/90 px-2.5 py-2 text-sm font-medium tabular-nums leading-snug text-slate-800 break-words"
                        title={getEnergyValue(row.technicalDescription, row.name)}
                      >
                        {getEnergyValue(row.technicalDescription, row.name)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <select
                        value={row.usageType}
                        onChange={(e) =>
                          setDraftField(
                            row.id,
                            'usageType',
                            e.target.value === 'residential' ? 'residential' : 'industrial',
                          )
                        }
                        className={`${inputCellClass} cursor-pointer pr-7 text-sm`}
                      >
                        <option value="industrial">Industrial</option>
                        <option value="residential">Residential</option>
                      </select>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={row.availableForStock !== false}
                        aria-busy={availabilitySavingId === row.id}
                        disabled={availabilitySavingId === row.id}
                        title={
                          row.availableForStock !== false
                            ? 'În stoc — apare la Stocuri → Add Item'
                            : 'Indisponibil — ascuns din Add Item'
                        }
                        onClick={() => void patchAvailability(row.id, !(row.availableForStock !== false))}
                        className={`relative mx-auto h-7 w-[2.75rem] shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:opacity-50 ${
                          row.availableForStock !== false ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                            row.availableForStock !== false ? 'translate-x-[1.15rem]' : 'translate-x-0'
                          }`}
                        />
                        <span className="sr-only">
                          {row.availableForStock !== false ? 'Disponibil pentru stoc' : 'Indisponibil pentru stoc'}
                        </span>
                      </button>
                    </td>
                    {/* ── Product Image (600×600 cropped) ── */}
                    <td className="px-2 py-2.5">
                      <div className="flex items-center justify-center gap-1 rounded-lg border border-slate-200/90 bg-slate-50/80 p-1">
                        <button
                          type="button"
                          onClick={() => triggerProductImageUpload(row.id)}
                          title="Încarcă Product Image (600×600)"
                          className={btnGhost}
                        >
                          Upload
                        </button>
                        <button
                          type="button"
                          onClick={() => row.productImageUrl && setPreviewImageUrl(row.productImageUrl)}
                          disabled={!row.productImageUrl}
                          title={row.productImageUrl ? 'Previzualizează Product Image' : 'Nicio imagine'}
                          className={btnGhost}
                        >
                          View
                        </button>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => openSpecsDrawer(row)}
                        className={btnGhost}
                      >
                        View
                      </button>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center justify-center gap-1 rounded-lg border border-slate-200/90 bg-slate-50/80 p-1">
                        <button
                          type="button"
                          onClick={() => triggerUpload(row.id)}
                          disabled={uploadingRowId === row.id}
                          title={uploadingRowId === row.id ? 'Se încarcă…' : 'Încarcă imagine'}
                          className={btnGhost}
                        >
                          Upload
                        </button>
                        <button
                          type="button"
                          onClick={() => row.imageUrl && setPreviewImageUrl(row.imageUrl)}
                          disabled={!row.imageUrl}
                          title={row.imageUrl ? 'Vezi imaginea' : 'Nicio imagine'}
                          className={btnGhost}
                        >
                          View
                        </button>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewModelId(row.id)}
                          title="Vezi detalii model"
                          className={btnGhost}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C3.75 7.5 7.5 4.5 12 4.5s8.25 3 9.75 7.5c-1.5 4.5-5.25 7.5-9.75 7.5S3.75 16.5 2.25 12Z" />
                            <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
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
                              productImageUrl: row.productImageUrl ?? null,
                              availableForStock: row.availableForStock !== false,
                            })
                          }
                          disabled={savingId === row.id}
                          title={savingId === row.id ? 'Se salvează…' : 'Salvează rândul'}
                          className="inline-flex h-9 min-w-[4rem] items-center justify-center rounded-md bg-slate-900 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
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

      {/* ── Model detail view modal ── */}
      {viewRow && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/50"
            onClick={() => setViewModelId(null)}
          />
          <div className="relative flex flex-col w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-['Inter']">{viewRow.name}</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{viewRow.modelNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewModelId(null)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 shrink-0 ml-4"
              >
                Close
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Image */}
              {(viewRow.productImageUrl || viewRow.imageUrl) && (
                <div className="flex justify-center">
                  <img
                    src={viewRow.productImageUrl || viewRow.imageUrl || ''}
                    alt={viewRow.name}
                    className="h-48 w-48 object-contain rounded-xl border border-slate-100 bg-slate-50 p-2"
                  />
                </div>
              )}

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: 'Name', value: viewRow.name },
                  { label: 'Brand', value: viewRow.brand },
                  { label: 'Series', value: viewRow.series || '—' },
                  { label: 'Model', value: viewRow.modelNumber },
                  { label: 'Energy', value: getEnergyValue(viewRow.technicalDescription, viewRow.name) },
                  { label: 'Type', value: viewRow.usageType === 'residential' ? 'Residential' : 'Industrial' },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-1">{label}</p>
                    <p className="text-sm font-semibold text-slate-800 break-words">{value}</p>
                  </div>
                ))}
              </div>

              {/* Specs table */}
              {(() => {
                const specs = parseSpecs(viewRow.technicalDescription).filter((f) => f.label.trim() || f.value.trim())
                if (specs.length === 0) return null
                return (
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 font-['Inter'] mb-3">Specificații tehnice</h3>
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-sm font-['Inter']">
                        <tbody className="divide-y divide-slate-100">
                          {specs.map((f, i) => (
                            <tr key={f.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                              <td className="px-4 py-2.5 text-xs font-semibold text-slate-500 w-[45%] align-top">{f.label || '—'}</td>
                              <td className="px-4 py-2.5 text-sm text-slate-800 align-top">{f.value || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
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

      {/* ── Image cropper modal ── */}
      {cropperState && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/60"
            onClick={() => setCropperState(null)}
          />
          <div className="relative flex flex-col rounded-2xl bg-white shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-['Inter']">Decupează imaginea</h2>
                <p className="text-xs text-slate-500 font-['Inter'] mt-0.5">
                  Selectează zona dorită · Output: <span className="font-semibold">600 × 600 px</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCropperState(null)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Anulează
              </button>
            </div>

            {/* Crop area — fixed container, image zooms + pans behind fixed dashed overlay */}
            <div
              ref={cropContainerRef}
              className="relative bg-slate-800 select-none"
              style={{ height: '55vh', overflow: 'hidden', cursor: isPanning ? 'grabbing' : 'grab' }}
              onMouseDown={onCropMouseDown}
              onMouseMove={onCropMouseMove}
              onMouseUp={onCropMouseUp}
              onMouseLeave={onCropMouseUp}
            >
              {/* The photo — zooms and pans, never affects modal layout */}
              <img
                ref={imgCropRef}
                src={cropperState.src}
                alt=""
                onLoad={onCropImageLoad}
                draggable={false}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${zoom})`,
                  transformOrigin: 'center center',
                  maxHeight: '85%',
                  maxWidth: '85%',
                  objectFit: 'contain',
                  userSelect: 'none',
                  pointerEvents: 'none',
                  transition: isPanning ? 'none' : 'transform 0.08s ease',
                }}
              />

              {/* Fixed dashed crop frame — always centered, never scales */}
              <div
                ref={cropBoxRef}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 'min(85%, calc(55vh * 0.82))',
                  aspectRatio: '1 / 1',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.52)',
                  border: '2px dashed rgba(255,255,255,0.85)',
                  boxSizing: 'border-box',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              >
                {/* Corner handles */}
                <div className="absolute top-0 left-0 h-5 w-5 border-t-[3px] border-l-[3px] border-white" />
                <div className="absolute top-0 right-0 h-5 w-5 border-t-[3px] border-r-[3px] border-white" />
                <div className="absolute bottom-0 left-0 h-5 w-5 border-b-[3px] border-l-[3px] border-white" />
                <div className="absolute bottom-0 right-0 h-5 w-5 border-b-[3px] border-r-[3px] border-white" />
              </div>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-2.5 bg-white shrink-0">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.25, parseFloat((z - 0.1).toFixed(2))))}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 text-base leading-none"
              >−</button>
              <input
                type="range"
                min={0.25}
                max={4}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-slate-900"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(4, parseFloat((z + 0.1).toFixed(2))))}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 text-base leading-none"
              >+</button>
              <span className="text-xs text-slate-500 font-['Inter'] w-10 text-right tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom(1)}
                title="Resetează zoom"
                className="text-xs text-slate-400 hover:text-slate-600 font-['Inter']"
              >↺</button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 shrink-0">
              <p className="text-xs text-slate-400 font-['Inter']">
                Trage imaginea pentru a poziționa · zoom {Math.round(zoom * 100)}% · Output: 600 × 600 px
              </p>
              <button
                type="button"
                onClick={onCropConfirm}
                disabled={cropUploading}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {cropUploading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Se încarcă…
                  </>
                ) : 'Aplică și încarcă'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
