import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getAdminProductModels,
  getAdminProducts,
  getAuthToken,
  uploadAdminProductTechnicalBrochurePdf,
  type AdminProduct,
  type AdminProductModelRow,
} from '../../lib/api'
import { parseTechnicalDescriptionRows, resolveCatalogForModel } from '../../lib/adminProductSheetResolve'
import { captureProductSheetElementAsPdfBlob } from '../../lib/productTechnicalBrochurePdf'
import AdminProductSheetA4 from './AdminProductSheetA4'

const labelClass = "block text-xs font-medium font-['Inter'] text-slate-700 mb-1"
const selectClass =
  "w-full min-h-[40px] cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 text-sm font-['Inter'] text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-900"
const generateBrochureBtnClass =
  "inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold font-['Inter'] text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"

export default function AdminOffersTemplates() {
  const navigate = useNavigate()
  const [models, setModels] = useState<AdminProductModelRow[]>([])
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [modelsLoading, setModelsLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedModelId, setSelectedModelId] = useState<string>('')
  const sheetHostRef = useRef<HTMLDivElement>(null)
  const [brochureBusy, setBrochureBusy] = useState(false)
  const [brochureError, setBrochureError] = useState<string | null>(null)
  const [brochureUrl, setBrochureUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/admin/login', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    let cancelled = false
    setModelsLoading(true)
    setLoadError(null)
    getAdminProductModels()
      .then((list) => {
        if (!cancelled) setModels(list)
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Eroare la încărcarea modelelor.')
      })
      .finally(() => {
        if (!cancelled) setModelsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setProductsLoading(true)
    getAdminProducts()
      .then((list) => {
        if (!cancelled) setProducts(Array.isArray(list) ? list : [])
      })
      .catch(() => {
        if (!cancelled) setProducts([])
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const sortedModels = useMemo(
    () =>
      [...models].sort((a, b) =>
        a.modelNumber.localeCompare(b.modelNumber, undefined, { numeric: true, sensitivity: 'base' }),
      ),
    [models],
  )

  const selectedModel = useMemo(
    () => sortedModels.find((m) => m.id === selectedModelId) ?? null,
    [sortedModels, selectedModelId],
  )

  const resolved = useMemo(
    () => (selectedModel ? resolveCatalogForModel(selectedModel, products) : null),
    [selectedModel, products],
  )

  const technicalRows = useMemo(
    () => (selectedModel ? parseTechnicalDescriptionRows(selectedModel.technicalDescription) : []),
    [selectedModel],
  )

  const loading = modelsLoading || productsLoading

  useEffect(() => {
    setBrochureError(null)
    setBrochureUrl(null)
  }, [selectedModelId])

  async function handleGenerateTechnicalBrochurePdf() {
    if (!selectedModel || !resolved || !sheetHostRef.current) return
    setBrochureError(null)
    setBrochureBusy(true)
    try {
      const blob = await captureProductSheetElementAsPdfBlob(sheetHostRef.current)
      const safeName = `${selectedModel.modelNumber.replace(/[^\w.-]+/g, '_')}.pdf`
      const file = new File([blob], safeName, { type: 'application/pdf' })
      const out = await uploadAdminProductTechnicalBrochurePdf(selectedModel.id, file)
      setBrochureUrl(out.url)
    } catch (e) {
      setBrochureUrl(null)
      setBrochureError(e instanceof Error ? e.message : 'Nu s-a putut genera sau încărca PDF-ul.')
    } finally {
      setBrochureBusy(false)
    }
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-6xl">
      <Link
        to="/admin/setari/sabloane"
        className="text-sm font-medium text-slate-600 hover:text-slate-900 font-['Inter']"
      >
        ← Înapoi la șabloane
      </Link>
      <h1 className="mt-2 text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Șabloane produse</h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-8 max-w-3xl">
        Alege un model din Magazin → Modele pentru a genera fișa tehnică (~920px lățime, înălțime după
        conținut): bandă sus, hero cu KPI-uri și imagine, tabel specificații fără scroll interior, carduri
        caracteristici, bară jos și footer — alimentată din descrierea tehnică și din produsul catalog cu SKU =
        număr model (dacă există). PDF-ul broșurii se salvează în R2 sub{' '}
        <strong className="text-slate-700">Product Technical Brochures</strong> (nume după model; regenerarea
        suprascrie fișierul).
      </p>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <div className="min-w-0 flex-1 max-w-2xl">
            <label htmlFor="offer-template-model" className={labelClass}>
              Model
            </label>
            <select
              id="offer-template-model"
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              disabled={loading || sortedModels.length === 0}
              className={selectClass}
            >
              <option value="">{loading ? 'Se încarcă…' : 'Selectează modelul'}</option>
              {sortedModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.modelNumber}
                  {m.name && m.name !== m.modelNumber ? ` — ${m.name}` : ''}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleGenerateTechnicalBrochurePdf}
            disabled={!selectedModel || brochureBusy || loading}
            className={`${generateBrochureBtnClass} min-h-[40px] w-full shrink-0 whitespace-nowrap sm:w-auto`}
          >
            {brochureBusy ? 'Se generează…' : 'Generează PDF și salvează în R2'}
          </button>
        </div>

        {brochureError ? (
          <p className="mt-4 text-sm text-red-600 font-['Inter']" role="alert">
            {brochureError}
          </p>
        ) : null}
        {brochureUrl ? (
          <p className="mt-3 text-sm text-emerald-800 font-['Inter']">
            Broșură salvată.{' '}
            <a
              href={brochureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline hover:text-emerald-950"
            >
              Deschide PDF
            </a>
          </p>
        ) : null}

        {loadError ? (
          <p className="mt-4 text-sm text-red-600 font-['Inter']" role="alert">
            {loadError}
          </p>
        ) : null}

        {!loading && sortedModels.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500 font-['Inter']">
            Nu există modele. Adaugă-le în Magazin → Modele.
          </p>
        ) : null}

        {selectedModel && resolved ? (
          <div className="mt-8 border-t border-slate-100 pt-8">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 font-['Inter'] mb-4">
              Previzualizare fișă A4
            </p>
            {!resolved.matchedProduct ? (
              <p className="mb-4 mt-4 text-xs text-amber-800 font-['Inter']">
                Nu există produs în catalog cu SKU egal cu „{selectedModel.modelNumber}”. Titlul folosește
                numele modelului; imaginea — fotografia din Modele sau imaginea implicită.
              </p>
            ) : null}
            <div
              ref={sheetHostRef}
              className="-mx-2 overflow-x-auto px-2 pb-2 sm:mx-0 sm:overflow-x-visible sm:px-0"
            >
              <AdminProductSheetA4
                model={selectedModel}
                title={resolved.title}
                imageUrl={resolved.imageUrl}
                matchedProduct={resolved.matchedProduct}
                technicalRows={technicalRows}
              />
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
