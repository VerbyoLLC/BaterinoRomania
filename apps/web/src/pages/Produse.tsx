import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { getProduseTranslations } from '../i18n/produse'
import { getProducts, type PublicProduct } from '../lib/api'
import SEO from '../components/SEO'

/* ── Skeleton card for loading state ───────────────────────────── */
function ProductCardSkeleton() {
  return (
    <div className="flex flex-col items-center bg-neutral-100 rounded-[10px] pt-[10px] pb-8 animate-pulse">
      <div className="w-36 h-44 bg-neutral-200 rounded-lg" />
      <div className="w-48 h-5 bg-neutral-200 rounded mt-4 mx-2" />
      <div className="w-56 h-4 bg-neutral-200 rounded mt-3 mx-2" />
      <div className="w-52 h-4 bg-neutral-200 rounded mt-2 mx-2" />
      <div className="w-24 h-8 bg-neutral-200 rounded mt-10 mx-2" />
      <div className="w-20 h-3 bg-neutral-200 rounded mt-1 mx-2" />
    </div>
  )
}

/* ── Product card — same style as before ───────────────────────── */
function ProductCard({ product, currency }: {
  product: PublicProduct
  currency: string
}) {
  const imgs = Array.isArray(product.images) ? product.images : []
  const img = imgs[0] || '/images/shared/HP2000-all-in-one.png'
  const conectivitate = [
    product.conectivitateWifi && 'WiFi',
    product.conectivitateBluetooth && 'Bluetooth',
  ].filter(Boolean).join(' • ') || '—'
  const spec1 = [product.tensiuneNominala, product.capacitate, product.compozitie].filter(Boolean).join(' • ') || '—'
  const spec2 = [product.cicluriDescarcare, conectivitate].filter(Boolean).join(' • ') || '—'
  const price = product.salePrice != null ? Number(product.salePrice) : 0

  return (
    <Link to={`/produse/${product.id}`} className="flex flex-col items-center bg-neutral-100 rounded-[10px] pt-[10px] pb-8 cursor-pointer transition-shadow duration-300 hover:shadow-md">

      <img
        src={img}
        alt={product.title}
        className="w-36 h-44 object-contain"
      />

      <h3 className="w-64 text-center text-black text-xl font-bold font-['Inter'] leading-6 mt-2 px-2">
        {product.title}
      </h3>

      <p className="text-neutral-950 text-base font-normal font-['Nunito_Sans'] leading-7 tracking-tight mt-1.5">
        {spec1}
      </p>

      <p className="text-neutral-950 text-base font-normal font-['Nunito_Sans'] leading-7 tracking-tight">
        {spec2}
      </p>

      <p className="text-sky-950 text-2xl font-bold font-['Inter'] tracking-wide mt-10">
        {price.toLocaleString('ro-RO')} {currency}
      </p>

      <p className="text-neutral-800 text-xs font-medium font-['Nunito_Sans'] tracking-wide -mt-1">
        include TVA
      </p>

    </Link>
  )
}

/* ── Page ─────────────────────────────────────────────────────── */
const VALID_SECTORS = ['rezidential', 'industrial', 'medical', 'maritim']

export default function Produse() {
  const { language } = useLanguage()
  const tr = getProduseTranslations(language.code)
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState<PublicProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [sector, setSector] = useState('')
  const [voltageFilter, setVoltageFilter] = useState<'low' | 'high' | ''>('')
  const [voltageExiting, setVoltageExiting] = useState(false)

  useEffect(() => {
    const sectorParam = searchParams.get('sector')
    if (sectorParam && VALID_SECTORS.includes(sectorParam)) {
      setSector(sectorParam)
    }
  }, [searchParams])

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

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

  return (
    <>
      <SEO
        title={tr.seoTitle}
        description={tr.seoDesc}
        canonical="/produse"
        lang={language.code}
      />

      <div className="max-w-content mx-auto px-5 lg:px-3 pt-12 pb-24">

        {/* ── HERO ── */}
        <header className="text-center mb-10">
          <h1 className="text-black text-3xl lg:text-5xl font-extrabold font-['Inter'] leading-tight mb-4">
            {tr.heroTitle}
          </h1>
          <p className="text-gray-600 text-base lg:text-lg font-normal font-['Inter'] leading-7 max-w-[520px] mx-auto">
            {tr.heroSubtitle}
          </p>
        </header>

        {/* ── FILTER BAR (same as Home) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div
            className="flex flex-col sm:flex-row sm:flex-wrap gap-2 lg:gap-3"
            role="group"
            aria-label={tr.filterSector}
          >
            {tr.sectorOptions.filter((opt) => opt.value !== '').map((opt) => {
              const val = String(opt.value)
              const active = sector === val
              return (
                <button
                  key={val || 'all'}
                  type="button"
                  onClick={() => {
                    if (sector === 'rezidential' && val !== 'rezidential') setVoltageExiting(true)
                    setSector(val)
                    if (val !== 'rezidential') setVoltageFilter('')
                  }}
                  aria-pressed={active}
                  className={`h-10 px-5 rounded-[10px] text-sm font-semibold font-['Inter'] uppercase transition-all duration-200 border-2 ${
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
                className={`flex items-center gap-2 ${voltageExiting ? 'animate-voltage-exit' : 'animate-voltage-enter'}`}
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
                  aria-label={tr.productsVoltageAll}
                  className="h-10 pl-4 pr-10 rounded-[10px] text-sm font-semibold font-['Inter'] border-2 border-gray-200 bg-white text-black cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 appearance-none bg-no-repeat bg-[length:12px] bg-[right_12px_center] min-w-[160px]"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23000' d='M6 8L2 4h8z'/%3E%3C/svg%3E\")" }}
                >
                  <option value="">{tr.productsVoltageAll}</option>
                  <option value="low">{tr.productsVoltageLow}</option>
                  <option value="high">{tr.productsVoltageHigh}</option>
                </select>
              </div>
            )}
            {(sector || voltageFilter) && (
              <button
                type="button"
                onClick={() => { setSector(''); setVoltageFilter('') }}
                aria-label={tr.clearFilters}
                className="inline-flex items-center justify-center h-10 w-10 rounded-[10px] border-2 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-800 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 self-end sm:self-auto sm:ml-auto sm:flex-shrink-0">
            <Link
              to="/produse"
              className="inline-flex items-center justify-center h-10 px-6 border-2 border-gray-200 rounded-[10px] font-semibold font-['Inter'] text-sm text-black hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              {tr.howToChoose}
            </Link>
            <button
              type="button"
              onClick={() => { setSector(''); setVoltageFilter('') }}
              className="inline-flex items-center justify-center h-10 px-6 bg-slate-900 text-white rounded-[10px] font-semibold font-['Inter'] text-sm hover:bg-slate-700 transition-colors"
            >
              {tr.viewAll}
            </button>
          </div>
        </div>

        {/* ── PRODUCT GRID ── */}
        {loading ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="flex items-center gap-2 text-gray-500 font-medium font-['Inter'] text-sm">
                <svg className="animate-spin h-5 w-5 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{tr.loadingProducts}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={tr.currency}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-400 font-['Inter']">
            {tr.noResults}
          </div>
        )}

      </div>
    </>
  )
}
