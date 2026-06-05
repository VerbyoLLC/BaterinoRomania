import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'
import {
  getAdminProductModels,
  getAuthToken,
  patchAdminProductModelAvailableForStock,
  uploadAdminFile,
  updateAdminProductModel,
  deleteAdminProductModel,
  createAdminProductModel,
  type AdminProductModelRow,
  type UpdateAdminProductModelPayload,
  type ProductModelType,
  PRODUCT_MODEL_TYPES,
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
  const toast = useToast()
  const [rows, setRows] = useState<AdminProductModelRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draftById, setDraftById] = useState<Record<string, ProductModelDraft>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [pendingSave, setPendingSave] = useState<{ rowId: string; draft: ProductModelDraft } | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addForm, setAddForm] = useState<ProductModelDraft>({
    name: '', brand: '', series: '', modelNumber: '', technicalDescription: '',
    usageType: 'industrial', productType: 'ESS', imageUrl: null, productImageUrl: null, availableForStock: true,
  })
  const [addSaving, setAddSaving] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [drawerModelId, setDrawerModelId] = useState<string | null>(null)
  const [specFields, setSpecFields] = useState<SpecField[]>([])
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [uploadTargetRowId, setUploadTargetRowId] = useState<string | null>(null)
  const [uploadingRowId] = useState<string | null>(null)
  const [availabilitySavingId, setAvailabilitySavingId] = useState<string | null>(null)
  const [viewModelId, setViewModelId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const draftByIdRef = useRef<Record<string, ProductModelDraft>>({})

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

  const handleFieldCommit = useCallback((rowId: string) => {
    const draft = draftByIdRef.current[rowId]
    if (draft) setPendingSave({ rowId, draft })
  }, [])

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null)
        setMenuPos(null)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

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
        productType: base.productType ?? 'ESS',
        imageUrl: base.imageUrl ?? null,
        productImageUrl: base.productImageUrl ?? null,
        availableForStock: base.availableForStock !== false,
      }
      const next = { ...prev, [rowId]: { ...current, [key]: value } }
      draftByIdRef.current = next
      return next
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
      toast.success('Câmpul a fost salvat.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Eroare la salvare.')
    } finally {
      setSavingId(null)
    }
  }

  async function handleDelete() {
    if (!confirmDeleteId || deleting) return
    setDeleting(true)
    try {
      await deleteAdminProductModel(confirmDeleteId)
      setRows((prev) => prev.filter((r) => r.id !== confirmDeleteId))
      toast.success('Modelul a fost șters.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Eroare la ștergere.')
    } finally {
      setDeleting(false)
      setConfirmDeleteId(null)
    }
  }

  async function handleAddModel(e: React.FormEvent) {
    e.preventDefault()
    if (addSaving) return
    setAddSaving(true)
    setAddError(null)
    try {
      const created = await createAdminProductModel(addForm)
      setRows((prev) => [created, ...prev])
      setAddModalOpen(false)
      setAddForm({ name: '', brand: '', series: '', modelNumber: '', technicalDescription: '', usageType: 'industrial', productType: 'ESS', imageUrl: null, productImageUrl: null, availableForStock: true })
      toast.success('Modelul a fost adăugat.')
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'Eroare la creare.')
    } finally {
      setAddSaving(false)
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
      productType: drawerRow.productType ?? 'ESS',
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
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap sm:justify-between">
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
        <button
          type="button"
          onClick={() => { setAddError(null); setAddModalOpen(true) }}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 font-['Inter']"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Adaugă model
        </button>
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
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-[10%]">
                    Model
                  </th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-[13%]">
                    SKU
                  </th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-[9%]">
                    Energy
                  </th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-[8%]">
                    Usage
                  </th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-[7%]">
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
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-[4.5rem] text-center">
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
                        onBlur={() => handleFieldCommit(row.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur(); handleFieldCommit(row.id) } }}
                        className={`${inputCellClass} font-semibold text-slate-900`}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        value={row.brand}
                        onChange={(e) => setDraftField(row.id, 'brand', e.target.value)}
                        onBlur={() => handleFieldCommit(row.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur(); handleFieldCommit(row.id) } }}
                        className={inputCellClass}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        value={row.series}
                        onChange={(e) => setDraftField(row.id, 'series', e.target.value)}
                        onBlur={() => handleFieldCommit(row.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur(); handleFieldCommit(row.id) } }}
                        className={inputCellClass}
                        placeholder="—"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        value={row.modelNumber}
                        onChange={(e) => setDraftField(row.id, 'modelNumber', e.target.value)}
                        onBlur={() => handleFieldCommit(row.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur(); handleFieldCommit(row.id) } }}
                        className={`${inputCellClass} font-mono text-[13px]`}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="block min-h-9 rounded-md border border-transparent bg-slate-50/90 px-2.5 py-2 text-xs font-mono font-medium leading-snug text-slate-700 truncate"
                        title={row.sku}
                      >
                        {row.sku}
                      </span>
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
                        onChange={(e) => {
                          setDraftField(row.id, 'usageType', e.target.value === 'residential' ? 'residential' : 'industrial')
                          handleFieldCommit(row.id)
                        }}
                        className={`${inputCellClass} cursor-pointer pr-7 text-sm`}
                      >
                        <option value="industrial">Industrial</option>
                        <option value="residential">Residential</option>
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <select
                        value={row.productType ?? 'ESS'}
                        onChange={(e) => {
                          setDraftField(row.id, 'productType', e.target.value as ProductModelType)
                          handleFieldCommit(row.id)
                        }}
                        className={`${inputCellClass} cursor-pointer pr-7 text-sm font-mono`}
                      >
                        {PRODUCT_MODEL_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
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
                      <div className="flex items-center justify-center gap-0.5">
                        <button type="button" onClick={() => triggerProductImageUpload(row.id)}
                          title="Încarcă Product Image (600×600)" className={btnGhost}>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                        </button>
                        <button type="button" onClick={() => row.productImageUrl && setPreviewImageUrl(row.productImageUrl)}
                          disabled={!row.productImageUrl} title={row.productImageUrl ? 'Previzualizează' : 'Nicio imagine'} className={btnGhost}>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C3.75 7.5 7.5 4.5 12 4.5s8.25 3 9.75 7.5c-1.5 4.5-5.25 7.5-9.75 7.5S3.75 16.5 2.25 12Z" />
                            <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <button type="button" onClick={() => openSpecsDrawer(row)} title="Editează specificații" className={btnGhost}>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center justify-center gap-0.5">
                        <button type="button" onClick={() => triggerUpload(row.id)} disabled={uploadingRowId === row.id}
                          title={uploadingRowId === row.id ? 'Se încarcă…' : 'Încarcă imagine'} className={btnGhost}>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                        </button>
                        <button type="button" onClick={() => row.imageUrl && setPreviewImageUrl(row.imageUrl)}
                          disabled={!row.imageUrl} title={row.imageUrl ? 'Vezi imaginea' : 'Nicio imagine'} className={btnGhost}>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C3.75 7.5 7.5 4.5 12 4.5s8.25 3 9.75 7.5c-1.5 4.5-5.25 7.5-9.75 7.5S3.75 16.5 2.25 12Z" />
                            <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <button type="button" onClick={() => setViewModelId(row.id)} title="Vezi detalii model" className={btnGhost}>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C3.75 7.5 7.5 4.5 12 4.5s8.25 3 9.75 7.5c-1.5 4.5-5.25 7.5-9.75 7.5S3.75 16.5 2.25 12Z" />
                            <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            if (menuOpenId === row.id) { setMenuOpenId(null); setMenuPos(null) }
                            else {
                              const rect = e.currentTarget.getBoundingClientRect()
                              setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
                              setMenuOpenId(row.id)
                            }
                          }}
                          aria-label="Mai multe acțiuni"
                          className={btnGhost}
                        >
                          <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden>
                            <circle cx="3" cy="8" r="1.4" /><circle cx="8" cy="8" r="1.4" /><circle cx="13" cy="8" r="1.4" />
                          </svg>
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

      {/* Add Model modal */}
      {addModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="presentation"
          onClick={(e) => { if (e.target === e.currentTarget && !addSaving) setAddModalOpen(false) }}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl"
            role="dialog" aria-modal="true" aria-labelledby="add-model-title"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 id="add-model-title" className="text-base font-bold text-slate-900 font-['Inter']">Adaugă model nou</h2>
              <button type="button" onClick={() => setAddModalOpen(false)} disabled={addSaving}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-4" aria-hidden>
                  <path strokeLinecap="round" d="M3 3l10 10M13 3L3 13" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddModel} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {addError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 font-['Inter']">{addError}</p>
              ) : null}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-['Inter'] mb-1">Nume <span className="text-red-500">*</span></label>
                  <input required value={addForm.name}
                    onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm font-['Inter'] text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-['Inter'] mb-1">Model Number <span className="text-red-500">*</span></label>
                  <input required value={addForm.modelNumber}
                    onChange={(e) => setAddForm((p) => ({ ...p, modelNumber: e.target.value }))}
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm font-mono font-['Inter'] text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-['Inter'] mb-1">Brand <span className="text-red-500">*</span></label>
                  <input required value={addForm.brand}
                    onChange={(e) => setAddForm((p) => ({ ...p, brand: e.target.value }))}
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm font-['Inter'] text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-['Inter'] mb-1">Series <span className="text-red-500">*</span></label>
                  <input required value={addForm.series}
                    onChange={(e) => setAddForm((p) => ({ ...p, series: e.target.value }))}
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm font-['Inter'] text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-['Inter'] mb-1">Usage</label>
                  <select value={addForm.usageType}
                    onChange={(e) => setAddForm((p) => ({ ...p, usageType: e.target.value === 'residential' ? 'residential' : 'industrial' }))}
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm font-['Inter'] text-slate-900 bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer">
                    <option value="industrial">Industrial</option>
                    <option value="residential">Residential</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-['Inter'] mb-1">Type</label>
                  <select value={addForm.productType}
                    onChange={(e) => setAddForm((p) => ({ ...p, productType: e.target.value as ProductModelType }))}
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm font-mono font-['Inter'] text-slate-900 bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer">
                    {PRODUCT_MODEL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 font-['Inter'] mb-1">Specificații tehnice</label>
                <textarea value={addForm.technicalDescription}
                  onChange={(e) => setAddForm((p) => ({ ...p, technicalDescription: e.target.value }))}
                  rows={5}
                  placeholder={'Energy: 16 kWh\nNominal Voltage: 51.2V\nCycle life: 6000\nCommunication: RS485\nWeight: 150 kg\nWarranty: 5 years'}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono font-['Inter'] text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 resize-y" />
                <p className="mt-1 text-[11px] text-slate-400 font-['Inter']">Un câmp per linie, format: Etichetă: Valoare</p>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="add-available" checked={addForm.availableForStock}
                  onChange={(e) => setAddForm((p) => ({ ...p, availableForStock: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                <label htmlFor="add-available" className="text-sm font-medium text-slate-700 font-['Inter'] cursor-pointer">
                  Disponibil pentru stoc
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setAddModalOpen(false)} disabled={addSaving}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 font-['Inter']">
                  Anulează
                </button>
                <button type="submit" disabled={addSaving}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 font-['Inter']">
                  {addSaving ? 'Se salvează…' : 'Adaugă model'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* 3-dot dropdown */}
      {menuOpenId && menuPos ? (() => {
        const row = rows.find((r) => r.id === menuOpenId)
        if (!row) return null
        return (
          <div
            ref={menuRef}
            style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 60 }}
            className="min-w-[130px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-900/5"
          >
            <button
              type="button"
              onClick={() => { setMenuOpenId(null); setMenuPos(null); setConfirmDeleteId(row.id) }}
              className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 font-['Inter']"
            >
              Șterge
            </button>
          </div>
        )
      })() : null}

      {/* Confirm delete dialog */}
      {confirmDeleteId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="presentation"
          onClick={(e) => { if (e.target === e.currentTarget && !deleting) setConfirmDeleteId(null) }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            role="dialog" aria-modal="true" aria-labelledby="delete-model-title">
            <h2 id="delete-model-title" className="text-base font-bold text-slate-900 font-['Inter']">
              Șterge modelul?
            </h2>
            <p className="mt-2 text-sm text-slate-600 font-['Inter']">
              Modelul{' '}
              <span className="font-semibold text-slate-800">
                {rows.find((r) => r.id === confirmDeleteId)?.modelNumber}
              </span>{' '}
              și toate datele asociate vor fi șterse permanent.
            </p>
            <p className="mt-1 text-xs text-slate-500 font-['Inter']">Această acțiune nu poate fi anulată.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmDeleteId(null)} disabled={deleting}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 font-['Inter']">
                Anulează
              </button>
              <button type="button" onClick={() => void handleDelete()} disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 font-['Inter']">
                {deleting ? 'Se șterge…' : 'Șterge'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Confirm save dialog */}
      {pendingSave ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="presentation"
          onClick={(e) => {
            if (e.target !== e.currentTarget) return
            // cancel: revert draft
            setDraftById((prev) => {
              const next = { ...prev }
              delete next[pendingSave.rowId]
              return next
            })
            setPendingSave(null)
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-save-title"
          >
            <h2 id="confirm-save-title" className="text-base font-bold text-slate-900 font-['Inter']">
              Salvezi modificarea?
            </h2>
            <p className="mt-2 text-sm text-slate-600 font-['Inter']">
              Ai modificat câmpuri din modelul{' '}
              <span className="font-semibold text-slate-800">
                {rows.find((r) => r.id === pendingSave.rowId)?.modelNumber || pendingSave.rowId}
              </span>
              . Dorești să salvezi?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraftById((prev) => {
                    const next = { ...prev }
                    delete next[pendingSave.rowId]
                    return next
                  })
                  setPendingSave(null)
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 font-['Inter']"
              >
                Renunță
              </button>
              <button
                type="button"
                disabled={savingId === pendingSave.rowId}
                onClick={() => {
                  const { rowId, draft } = pendingSave
                  setPendingSave(null)
                  void saveRow(rowId, draft)
                }}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 font-['Inter']"
              >
                {savingId === pendingSave.rowId ? 'Se salvează…' : 'Salvează'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
