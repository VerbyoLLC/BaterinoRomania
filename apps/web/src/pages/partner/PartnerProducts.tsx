import { useState, useEffect, useMemo } from 'react'
import {
  getProducts,
  getProduct,
  getProductCardImageUrl,
  getCatalogProductSpecLines,
  type PublicProduct,
} from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'
import { getProductDetailTranslations } from '../../i18n/product-detail'
import { getProduseTranslations } from '../../i18n/produse'
import ProductDetailRightSection from '../../components/ProductDetailRightSection'
import {
  CatalogProductCardSkeleton,
  IndustrialCatalogProductCard,
  ResidentialCatalogProductCard,
} from '../../components/product/CatalogProductCard'

function whToKwhDisplay(wh: string | null | undefined): string | null {
  if (!wh) return null
  const numStr = String(wh).replace(/\s*Wh$/i, '').replace(',', '.').replace(/\s/g, '')
  const num = parseFloat(numStr)
  if (Number.isNaN(num)) return wh
  const kwh = num / 1000
  return `${kwh % 1 === 0 ? kwh.toFixed(0) : kwh.toFixed(2)} kWh`
}

/* ── Product card (clickable for details + quantity + order) ───────── */
function ProductCard({
  product,
  selected,
  quantity,
  onSelect,
  onQuantityChange,
  onOrder,
  orderLabel,
}: {
  product: PublicProduct
  selected: boolean
  quantity: number
  onSelect: () => void
  onQuantityChange: (delta: number) => void
  onOrder: () => void
  orderLabel: string
}) {
  const img = getProductCardImageUrl(product)
  const { specLine1, specLine2 } = getCatalogProductSpecLines(product)
  const price =
    product.salePrice != null && product.salePrice !== '' ? Number(product.salePrice) : NaN
  const priceOk = Number.isFinite(price) && price > 0
  const priceDisplay = priceOk ? `${price.toLocaleString('ro-RO')} lei` : '—'

  const footer = (
    <div className="rounded-lg bg-[#f7f7f7] p-3 space-y-3">
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onQuantityChange(-1)}
          className="w-9 h-9 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-lg font-bold text-slate-700 hover:bg-neutral-100 hover:border-neutral-300 transition-colors"
          aria-label="Scade cantitatea"
        >
          −
        </button>
        <span className="text-black text-sm font-bold font-['Inter'] min-w-[1.5rem] text-center tabular-nums">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => onQuantityChange(1)}
          className="w-9 h-9 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-lg font-bold text-slate-700 hover:bg-neutral-100 hover:border-neutral-300 transition-colors"
          aria-label="Crește cantitatea"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={onOrder}
        className="w-full py-3 bg-slate-900 text-white rounded-lg text-sm font-bold font-['Inter'] uppercase tracking-wide hover:bg-slate-800 active:bg-slate-950 transition-colors"
      >
        {orderLabel}
      </button>
    </div>
  )

  const industrialSubtitle = String(product.subtitle || '').trim() || undefined

  const common = {
    density: 'partner' as const,
    imageSrc: img,
    imageAlt: product.title,
    title: product.title,
    subtitle: industrialSubtitle,
    specLine1,
    specLine2,
    linkState: { tipProdus: product.tipProdus } as { tipProdus: 'rezidential' | 'industrial' },
    priceDisplay,
    shellClassName: selected ? 'border-2 border-slate-900 shadow-md' : '',
    onMainClick: onSelect,
    footer,
  }

  return product.tipProdus === 'industrial' ? (
    <IndustrialCatalogProductCard {...common} />
  ) : (
    <ResidentialCatalogProductCard {...common} />
  )
}

const PARTNER_DETAIL_TABS = [
  { id: 'detalii' as const, label: 'Detalii' },
  { id: 'tehnice' as const, label: 'Detalii tehnice' },
  { id: 'manuale' as const, label: 'Manuale' },
  { id: 'videos' as const, label: 'Ghid Video de Instalare' },
]

/* ── Product detail panel (uses right section from product page) ─── */
function ProductDetailPanel({
  product,
  loading,
  tr,
  langCode,
  activeTab,
}: {
  product: PublicProduct | null
  loading: boolean
  tr: ReturnType<typeof getProductDetailTranslations>
  langCode: string
  activeTab: 'detalii' | 'tehnice' | 'manuale' | 'videos'
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-3/4 bg-neutral-200 rounded" />
        <div className="bg-neutral-100 rounded-[10px] h-[280px] flex items-center justify-center">
          <img src="/images/shared/baterino-logo-black.svg" alt="" className="w-24 h-12 object-contain opacity-30" aria-hidden />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-2">
              <div className="h-4 w-32 bg-neutral-200 rounded" />
              <div className="h-4 w-24 bg-neutral-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center text-gray-500">
        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0v10l-8 4m0-14L4 17m8 4V10" />
        </svg>
        <p className="text-base font-['Inter']">Alege un produs din listă pentru a vedea detaliile.</p>
      </div>
    )
  }

  const energieDisplay = whToKwhDisplay(product.energieNominala)
  const p = product as PublicProduct & {
    capacitate?: string
    cicluriDescarcare?: string
    dimensiuni?: string
    greutate?: string
    temperaturaFunctionare?: string
  }
  const specRows: [string, string][] = []
  if (energieDisplay) specRows.push([tr.specEnergieNominala, energieDisplay])
  if (p.capacitate) specRows.push([tr.specCapacitate, p.capacitate])
  if (p.cicluriDescarcare) specRows.push([tr.specCicluriDescarcare, p.cicluriDescarcare])
  if (p.dimensiuni) specRows.push([tr.specDimensiuni, p.dimensiuni])
  if (p.greutate) specRows.push([tr.specGreutate, p.greutate])
  if (p.temperaturaFunctionare) specRows.push([tr.specTemperaturaOperare, p.temperaturaFunctionare])

  return (
    <div className="flex flex-col gap-4">
      {activeTab === 'detalii' && (
        <>
          {specRows.length > 0 && (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                {specRows.map(([label, value], i) => (
                  <div key={i} className="flex flex-col gap-0.5 text-sm font-['Inter']">
                    <span className="font-bold text-black">{label}</span>
                    <span className="text-gray-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      <ProductDetailRightSection
        product={product}
        tr={tr}
        langCode={langCode}
        compact
        partnerTab={activeTab}
      />
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function PartnerProducts() {
  const { language } = useLanguage()
  const tr = getProductDetailTranslations(language.code)
  const trProduse = getProduseTranslations(language.code)
  const [products, setProducts] = useState<PublicProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [sector, setSector] = useState('')
  const [voltageFilter, setVoltageFilter] = useState<'low' | 'high' | ''>('')
  const [voltageExiting, setVoltageExiting] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<PublicProduct | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailPanelTab, setDetailPanelTab] = useState<'detalii' | 'tehnice' | 'manuale' | 'videos'>('detalii')
  const [animateDetail, setAnimateDetail] = useState(false)
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const filtered = useMemo(() => {
    let list = products
    if (sector) {
      list = list.filter((p) => {
        const cat = String(p.categorie || '').toLowerCase()
        if (cat && cat.includes(sector)) return true
        if (!p.categorie?.trim()) {
          const tip = String(p.tipProdus || '').toLowerCase()
          if (sector === 'rezidential' && tip === 'industrial') return true
          if (sector === 'industrial' && tip === 'rezidential') return true
        }
        return false
      })
    }
    if (sector === 'rezidential' && voltageFilter) {
      list = list.filter((p) => {
        const v = parseFloat(String(p.tensiuneNominala || '').replace(',', '.'))
        if (Number.isNaN(v)) return false
        if (voltageFilter === 'low' && v >= 100) return false
        if (voltageFilter === 'high' && v < 100) return false
        return true
      })
    }
    return list
  }, [products, sector, voltageFilter])

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (filtered.length === 0 || (selectedId && !filtered.some((p) => p.id === selectedId))) {
      setSelectedId(null)
    }
  }, [filtered, selectedId])

  useEffect(() => {
    if (!selectedId) {
      setSelectedProduct(null)
      setDetailLoading(false)
      return
    }
    setDetailPanelTab('detalii')
    setDetailLoading(true)
    getProduct(selectedId)
      .then(setSelectedProduct)
      .catch(() => setSelectedProduct(null))
      .finally(() => setDetailLoading(false))
  }, [selectedId])

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center px-5 py-4 sm:px-6 lg:px-8 border-b border-gray-200 bg-white shrink-0 shadow-sm">
        <h1 className="text-xl font-bold font-['Inter'] text-slate-900">Produse</h1>
      </div>

      <div className="flex flex-col flex-1 min-h-0 px-6 sm:px-8 lg:px-10 pb-6 sm:pb-8 lg:pb-10 overflow-hidden">
        {/* Product cards + filters */}
        <div className="flex flex-col min-h-0 pt-4 sm:pt-6 w-full">
          {/* Filters — same style as Home page */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 lg:gap-3 mb-4 shrink-0" role="group" aria-label={trProduse.filterSector}>
            {trProduse.sectorOptions.filter((opt) => opt.value !== '').map((opt) => {
              const val = String(opt.value)
              const active = sector === val
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    if (sector === 'rezidential' && val !== 'rezidential') setVoltageExiting(true)
                    setSector(val)
                    if (val !== 'rezidential') setVoltageFilter('')
                  }}
                  aria-pressed={active}
                  className={`h-12 sm:h-10 px-5 rounded-[10px] text-sm font-semibold font-['Inter'] uppercase transition-all duration-200 border-2 ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
            {(sector === 'rezidential' || voltageExiting) && (
              <div
                className={`hidden md:flex items-center gap-2 ${voltageExiting ? 'animate-voltage-exit' : 'animate-voltage-enter'}`}
                onAnimationEnd={() => voltageExiting && setVoltageExiting(false)}
              >
                <span className="flex items-center text-gray-400 px-1" aria-hidden>
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none" className="shrink-0">
                    <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <select
                  value={voltageFilter}
                  onChange={(e) => setVoltageFilter((e.target.value || '') as 'low' | 'high' | '')}
                  aria-label={trProduse.productsVoltageAll}
                  className="h-12 sm:h-10 pl-4 pr-10 rounded-[10px] text-sm font-semibold font-['Inter'] border-2 border-gray-200 bg-white text-black cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 appearance-none bg-no-repeat bg-[length:12px] bg-[right_12px_center] min-w-[160px]"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23000' d='M6 8L2 4h8z'/%3E%3C/svg%3E\")" }}
                >
                  <option value="">{trProduse.productsVoltageAll}</option>
                  <option value="low">{trProduse.productsVoltageLow}</option>
                  <option value="high">{trProduse.productsVoltageHigh}</option>
                </select>
              </div>
            )}
            {(sector || voltageFilter) && (
              <button
                type="button"
                onClick={() => { setSector(''); setVoltageFilter('') }}
                aria-label={trProduse.clearFilters}
                className="inline-flex items-center justify-center h-12 sm:h-10 px-6 border-2 border-gray-200 rounded-[10px] font-semibold font-['Inter'] text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                {trProduse.clearFilters}
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-[20px] overflow-y-auto">
              {Array.from({ length: 6 }).map((_, i) => (
                <CatalogProductCardSkeleton key={i} density="partner" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-[20px] overflow-y-auto max-h-[calc(100vh-22rem)] lg:max-h-[calc(100vh-18rem)]">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  selected={selectedId === product.id}
                  quantity={quantities[product.id] ?? 1}
                  onSelect={() => {
                    setAnimateDetail(true)
                    setSelectedId(product.id)
                  }}
                  onQuantityChange={(delta) => {
                    const prev = quantities[product.id] ?? 1
                    const next = Math.max(1, Math.min(99, prev + delta))
                    setQuantities((q) => ({ ...q, [product.id]: next }))
                  }}
                  onOrder={() => {
                    const qty = quantities[product.id] ?? 1
                    const p =
                      product.salePrice != null && product.salePrice !== ''
                        ? Number(product.salePrice)
                        : NaN
                    const line = Number.isFinite(p) && p > 0
                      ? `Total: ${(p * qty).toLocaleString('ro-RO')} lei`
                      : 'Total: —'
                    alert(`Comandă: ${product.title}\nCantitate: ${qty}\n${line}\n\nFuncționalitate comandă în curând.`)
                  }}
                  orderLabel={tr.comandaBtn}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600 font-['Inter'] text-sm">
              {(sector === 'medical' || sector === 'industrial') ? trProduse.productsComingSoon : trProduse.noResults}
            </div>
          )}
        </div>
      </div>

      {/* Product detail panel — slides in from the right when a card is clicked */}
      {selectedId != null && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40"
            aria-hidden
            onClick={() => setSelectedId(null)}
          />
          <aside
            key={selectedId}
            className={`fixed top-0 right-0 bottom-0 z-40 w-full max-w-4xl bg-white shadow-2xl flex flex-col overflow-hidden ${animateDetail ? 'animate-slide-in-from-right' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="partner-detail-title"
          >
            <div className="shrink-0 border-b border-neutral-200 bg-white">
              <div className="flex items-center justify-between px-4 sm:px-6 py-4">
                <h2 id="partner-detail-title" className="text-lg font-bold font-['Inter'] text-slate-900 min-w-0 truncate pr-2">
                  {detailLoading ? 'Se încarcă…' : selectedProduct?.title ?? 'Detalii produs'}
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-slate-900 transition-colors"
                  aria-label="Închide"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex border-b-0 border-neutral-200 gap-0 px-4 sm:px-6" role="tablist" aria-label="Detalii produs">
                {PARTNER_DETAIL_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={detailPanelTab === tab.id}
                    onClick={() => setDetailPanelTab(tab.id)}
                    className={`px-4 py-3 text-sm font-semibold font-['Inter'] border-b-2 transition-colors -mb-px ${
                      detailPanelTab === tab.id
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-neutral-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4">
              <div className="max-w-xl mx-auto">
                <ProductDetailPanel
                  product={selectedProduct}
                  loading={detailLoading}
                  tr={tr}
                  langCode={language.code}
                  activeTab={detailPanelTab}
                />
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
