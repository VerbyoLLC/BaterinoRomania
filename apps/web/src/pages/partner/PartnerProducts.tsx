import { useState, useEffect, useMemo } from 'react'
import { getProducts, getProduct, type PublicProduct } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'
import { getProductDetailTranslations } from '../../i18n/product-detail'
import { getProduseTranslations } from '../../i18n/produse'
import ProductDetailRightSection from '../../components/ProductDetailRightSection'

/* ── Skeleton card ─────────────────────────────────────────────── */
function ProductCardSkeleton() {
  return (
    <div className="flex flex-col items-center bg-neutral-100 rounded-[10px] pt-[10px] pb-6 animate-pulse">
      <div className="w-36 h-36 flex items-center justify-center">
        <img src="/images/shared/baterino-logo-black.svg" alt="" className="w-28 h-14 object-contain opacity-30" aria-hidden />
      </div>
      <div className="w-48 h-5 bg-neutral-200 rounded mt-4 mx-2" />
      <div className="w-56 h-4 bg-neutral-200 rounded mt-3 mx-2" />
      <div className="w-24 h-8 bg-neutral-200 rounded mt-6 mx-2" />
    </div>
  )
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
  const imgs = Array.isArray(product.images) ? product.images : []
  const img = imgs[0] || '/images/shared/HP2000-all-in-one.png'
  const price = product.salePrice != null ? Number(product.salePrice) : 0

  return (
    <div
      className={`w-full flex flex-col items-center bg-neutral-100 rounded-[10px] pt-[10px] pb-4 overflow-hidden ${
        selected ? 'ring-2 ring-slate-900 shadow-md bg-neutral-50' : ''
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="w-full flex flex-col items-center cursor-pointer transition-opacity hover:opacity-90 text-left"
      >
        <img src={img} alt={product.title} className="w-36 h-36 object-contain" />
        <h3 className="w-full text-center text-black text-base font-bold font-['Inter'] leading-5 mt-2 px-2 line-clamp-2">
          {product.title}
        </h3>
        <p className="text-sky-950 text-lg font-bold font-['Inter'] tracking-wide mt-4">
          {price.toLocaleString('ro-RO')} lei
        </p>
      </button>

      <div className="w-full px-3 mt-4 pt-3 border-t border-neutral-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => onQuantityChange(-1)}
            className="w-8 h-8 rounded-lg bg-neutral-200 flex items-center justify-center text-base font-bold hover:bg-neutral-300 transition-colors"
            aria-label="Scade cantitatea"
          >
            −
          </button>
          <span className="text-black text-sm font-semibold font-['Inter'] w-6 text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => onQuantityChange(1)}
            className="w-8 h-8 rounded-lg bg-neutral-200 flex items-center justify-center text-base font-bold hover:bg-neutral-300 transition-colors"
            aria-label="Crește cantitatea"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={onOrder}
          className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold font-['Inter'] uppercase hover:bg-slate-700 transition-colors"
        >
          {orderLabel}
        </button>
      </div>
    </div>
  )
}

/* ── Product detail panel (uses right section from product page) ─── */
function ProductDetailPanel({
  product,
  loading,
  tr,
  langCode,
}: {
  product: PublicProduct | null
  loading: boolean
  tr: ReturnType<typeof getProductDetailTranslations>
  langCode: string
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

  return (
    <div>
      <h2 className="text-xl font-bold font-['Inter'] text-slate-900 mb-4">{product.title}</h2>
      <ProductDetailRightSection product={product} tr={tr} langCode={langCode} compact />
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
          if (sector === 'rezidential' && tip === 'rezidential') return true
          if (sector === 'industrial' && tip === 'industrial') return true
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

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 px-6 sm:px-8 lg:px-10 pb-6 sm:pb-8 lg:pb-10 overflow-hidden">
        {/* Left: product cards + filters */}
        <div className="lg:flex-1 lg:min-w-0 flex flex-col min-h-0 pt-4 sm:pt-6">
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
            <div className="grid grid-cols-2 gap-4 overflow-y-auto">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[calc(100vh-22rem)] lg:max-h-[calc(100vh-18rem)]">
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
                    const price = product.salePrice != null ? Number(product.salePrice) : 0
                    const total = price * qty
                    alert(`Comandă: ${product.title}\nCantitate: ${qty}\nTotal: ${total.toLocaleString('ro-RO')} lei\n\nFuncționalitate comandă în curând.`)
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

        {/* Right: product detail — no card, slides in from left only when card is clicked */}
        <div className="lg:flex-1 lg:min-w-0 min-w-0 flex flex-col min-h-0 overflow-y-auto pl-0 lg:pl-4">
          <div key={selectedId ?? 'empty'} className={animateDetail ? 'animate-slide-in-from-left min-h-0' : 'min-h-0'}>
            <div className="h-10 text-sm font-semibold font-['Inter'] text-slate-700 mb-4">Detalii produs</div>
            <ProductDetailPanel product={selectedProduct} loading={detailLoading} tr={tr} langCode={language.code} />
          </div>
        </div>
      </div>
    </div>
  )
}
