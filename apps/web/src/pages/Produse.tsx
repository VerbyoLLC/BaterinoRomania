import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { getProduseTranslations, PRODUCTS } from '../i18n/produse'
import SEO from '../components/SEO'

/* ── Filter dropdown ──────────────────────────────────────────── */
function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string | number; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none h-12 pl-5 pr-10 bg-neutral-100 rounded-[10px] text-black text-base font-semibold font-['Inter'] cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.value === '' || opt.value === 0 ? label : opt.label}
          </option>
        ))}
      </select>
      {/* Chevron arrow */}
      <svg
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

/* ── Product card — Figma spec ────────────────────────────────── */
function ProductCard({ product, currency }: {
  product: typeof PRODUCTS[number]
  currency: string
}) {
  return (
    <Link to={`/produse/${product.id}`} className="flex flex-col items-center bg-neutral-100 rounded-[10px] pt-[10px] pb-8 cursor-pointer transition-shadow duration-300 hover:shadow-md">

      {/* Product image with Figma shadow */}
      <img
        src={product.image}
        alt={product.name}
          className="w-36 h-44 object-contain"
      />

      {/* Name */}
      <h3 className="w-64 text-center text-black text-xl font-bold font-['Inter'] leading-6 mt-2 px-2">
        {product.name}
      </h3>

      {/* Spec 1 */}
      <p className="text-neutral-950 text-base font-normal font-['Nunito_Sans'] leading-7 tracking-tight mt-1.5">
        {product.spec1}
      </p>

      {/* Spec 2 */}
      <p className="text-neutral-950 text-base font-normal font-['Nunito_Sans'] leading-7 tracking-tight">
        {product.spec2}
      </p>

      {/* Price */}
      <p className="text-sky-950 text-2xl font-bold font-['Inter'] tracking-wide mt-10">
        {product.price.toLocaleString('ro-RO')} {currency}
      </p>

      {/* Include TVA */}
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

  const [sector, setSector]   = useState('')
  const [kwh, setKwh]         = useState('0')
  const [volti, setVolti]     = useState('0')
  const [invertor, setInvertor] = useState('')

  useEffect(() => {
    const sectorParam = searchParams.get('sector')
    if (sectorParam && VALID_SECTORS.includes(sectorParam)) {
      setSector(sectorParam)
    }
  }, [searchParams])

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (sector && !p.sector.includes(sector)) return false
      if (Number(kwh) > 0) {
        if (Number(kwh) === 200 ? p.kwh < 200 : p.kwh !== Number(kwh)) return false
      }
      if (Number(volti) > 0 && p.volti !== Number(volti)) return false
      if (invertor && !p.invertor.includes(invertor)) return false
      return true
    })
  }, [sector, kwh, volti, invertor])

  const isFiltered = sector !== '' || Number(kwh) > 0 || Number(volti) > 0 || invertor !== ''

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

        {/* ── FILTER BAR ── */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <FilterSelect
            label={tr.filterSector}
            value={sector}
            onChange={setSector}
            options={tr.sectorOptions}
          />
          <FilterSelect
            label={tr.filterCapacitate}
            value={kwh}
            onChange={setKwh}
            options={tr.kwOptions.map((o) => ({ ...o, value: String(o.value) }))}
          />
          <FilterSelect
            label={tr.filterVolti}
            value={volti}
            onChange={setVolti}
            options={tr.voltiOptions.map((o) => ({ ...o, value: String(o.value) }))}
          />
          <FilterSelect
            label={tr.filterInvertor}
            value={invertor}
            onChange={setInvertor}
            options={tr.invertorOptions}
          />

          {/* Reset if filtered */}
          {isFiltered && (
            <button
              onClick={() => { setSector(''); setKwh('0'); setVolti('0'); setInvertor('') }}
              className="h-12 px-5 bg-neutral-100 rounded-[10px] text-black text-base font-semibold font-['Inter'] hover:bg-neutral-200 transition-colors"
            >
              ✕
            </button>
          )}

          {/* How to choose */}
          <div className="ml-auto flex items-center gap-2 text-sm font-medium font-['Inter'] text-gray-700 cursor-pointer hover:text-black transition-colors">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400 flex-shrink-0" />
            {tr.howToChoose}
          </div>
        </div>

        {/* ── PRODUCT GRID ── */}
        {filtered.length > 0 ? (
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
