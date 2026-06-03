import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useCatalogCurrency } from '../contexts/CatalogCurrencyContext'
import { getProduseTranslations } from '../i18n/produse'
import {
  getProducts,
  getProductCardImageUrl,
  getCatalogProductSpecLines,
  formatResidentialCatalogPriceDisplay,
  getResidentialCatalogStockListingCta,
  getResidentialCatalogVatPercentLabel,
  residentialCatalogUsesPartnerPriceCta,
  type PublicProduct,
} from '../lib/api'
import { syncProductTipsFromList } from '../lib/productTipCache'
import SEO from '../components/SEO'
import {
  CatalogProductCardSkeleton,
  HorizontalCatalogProductCard,
  type HorizontalFeatureBadge,
} from '../components/product/CatalogProductCard'
import {
  catalogBadgeLabelsFromProduseTr,
  getCatalogStockBadgeLabel,
  getCatalogDeliveryBadgeLabel,
  getCatalogTransportBadgeLabel,
  getCatalogInstallBadgeLabel,
  productHasEligibleReducerePrograms,
} from '../lib/catalogProductBadges'

/* ── Page ─────────────────────────────────────────────────────── */
const VALID_SECTORS = ['rezidential', 'industrial', 'medical', 'maritim']

export default function Produse() {
  const { language } = useLanguage()
  const { currency } = useCatalogCurrency()
  const tr = getProduseTranslations(language.code)
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState<PublicProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [sector, setSector] = useState('')
  const [voltageFilter, setVoltageFilter] = useState<'low' | 'high' | ''>('')
  const [locationFilter, setLocationFilter] = useState<'indoor' | 'outdoor' | ''>('')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const advancedFilterCount = (voltageFilter ? 1 : 0) + (locationFilter ? 1 : 0)

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

  useEffect(() => {
    if (products.length === 0) return
    syncProductTipsFromList(
      products.map((p) => ({ slug: p.slug, id: p.id, tipProdus: p.tipProdus })),
    )
  }, [products])

  const filtered = useMemo(() => {
    let list = products
    if (sector) {
      list = list.filter((p) => {
        const cat = String(p.categorie || '').toLowerCase()
        if (cat && cat.includes(sector)) return true
        if (!p.categorie?.trim()) {
          const tip = String(p.tipProdus || '').toLowerCase()
          // tipProdus = page template: industrial → carousel, rezidential → classic; empty categorie fallback mirrors that mapping
          if (sector === 'rezidential' && tip === 'industrial') return true
          if (sector === 'industrial' && tip === 'rezidential') return true
        }
        return false
      })
    }
    if (voltageFilter) {
      list = list.filter((p) => {
        const v = parseFloat(String(p.tensiuneNominala || '').replace(',', '.'))
        if (Number.isNaN(v)) return false
        if (voltageFilter === 'low' && v >= 100) return false
        if (voltageFilter === 'high' && v < 100) return false
        return true
      })
    }
    if (locationFilter) {
      list = list.filter((p) => {
        const loc = String(p.locatieMontaj || '').toLowerCase().trim()
        return loc === locationFilter
      })
    }
    return list
  }, [products, sector, voltageFilter, locationFilter])

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

        {/* ── FILTER BAR — Mobile ── */}
        <div className="md:hidden mb-6">
          {/* Sector buttons — one per row */}
          <div
            className="flex flex-col gap-2"
            role="group"
            aria-label={tr.filterSector}
          >
            {tr.sectorOptions.filter((opt) => opt.value !== '').map((opt) => {
              const val = String(opt.value)
              const active = sector === val
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => { setSector(active ? '' : val) }}
                  aria-pressed={active}
                  className={`w-full h-11 px-5 rounded-[10px] text-sm font-bold font-['Inter'] uppercase tracking-wide transition-all duration-150 border-2 text-left ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>

          {/* Filtre + Clear row */}
          <div className="flex items-center gap-2 mt-2">
            {/* Filtre button */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className={`flex-1 flex items-center justify-center gap-2 h-11 px-4 rounded-[10px] border-2 text-sm font-bold font-['Inter'] uppercase tracking-wide transition-all duration-150 ${
                advancedFilterCount > 0
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-gray-500 border-gray-200'
              }`}
              aria-label="Filtre"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
              Filtre
              {advancedFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-900 text-[10px] font-extrabold">
                  {advancedFilterCount}
                </span>
              )}
            </button>

            {/* Clear all */}
            {(sector || voltageFilter || locationFilter) && (
              <button
                type="button"
                onClick={() => { setSector(''); setVoltageFilter(''); setLocationFilter('') }}
                aria-label={tr.clearFilters}
                className="shrink-0 flex items-center justify-center h-9 w-9 rounded-full border-2 border-gray-200 text-gray-500"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Active advanced filter chips */}
          {(voltageFilter || locationFilter) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {voltageFilter && (
                <span className="inline-flex items-center gap-1 h-7 pl-3 pr-2 rounded-full bg-slate-100 text-xs font-semibold font-['Inter'] text-slate-700">
                  {voltageFilter === 'low' ? tr.productsVoltageLow : tr.productsVoltageHigh}
                  <button type="button" onClick={() => setVoltageFilter('')} className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-slate-200" aria-label="Șterge filtru tensiune">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </span>
              )}
              {locationFilter && (
                <span className="inline-flex items-center gap-1 h-7 pl-3 pr-2 rounded-full bg-slate-100 text-xs font-semibold font-['Inter'] text-slate-700">
                  {locationFilter === 'indoor' ? tr.productsLocationIndoor : tr.productsLocationOutdoor}
                  <button type="button" onClick={() => setLocationFilter('')} className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-slate-200" aria-label="Șterge filtru locație">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── FILTER BAR — Desktop ── */}
        <div className="hidden md:flex md:items-center md:justify-between gap-4 mb-8">
          <div
            className="flex flex-wrap gap-2 lg:gap-3"
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
                  onClick={() => { setSector(val) }}
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
            {(sector || voltageFilter || locationFilter) && (
              <button
                type="button"
                onClick={() => { setSector(''); setVoltageFilter(''); setLocationFilter('') }}
                aria-label={tr.clearFilters}
                className="inline-flex items-center justify-center h-10 w-10 rounded-[10px] border-2 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-800 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
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
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter((e.target.value || '') as 'indoor' | 'outdoor' | '')}
              aria-label={tr.productsLocationAll}
              className="h-10 pl-4 pr-10 rounded-[10px] text-sm font-semibold font-['Inter'] border-2 border-gray-200 bg-white text-black cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 appearance-none bg-no-repeat bg-[length:12px] bg-[right_12px_center] min-w-[140px]"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23000' d='M6 8L2 4h8z'/%3E%3C/svg%3E\")" }}
            >
              <option value="">{tr.productsLocationAll}</option>
              <option value="indoor">{tr.productsLocationIndoor}</option>
              <option value="outdoor">{tr.productsLocationOutdoor}</option>
            </select>
          </div>
        </div>

        {/* ── MOBILE FILTER BOTTOM SHEET ── */}
        {mobileFiltersOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end bg-black/50 animate-overlay-fade-in"
            onClick={() => setMobileFiltersOpen(false)}
          >
            <div
              className="w-full rounded-t-[20px] bg-white animate-sheet-slide-up overflow-hidden"
              style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-gray-200" />
              </div>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <h2 className="text-base font-bold font-['Inter'] text-black">Filtre</h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
                  aria-label="Închide"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tensiune */}
              <div className="px-5 pt-4 pb-3">
                <p className="text-xs font-bold font-['Inter'] uppercase tracking-wider text-gray-400 mb-3">{tr.productsVoltageAll}</p>
                <div className="flex flex-col gap-2">
                  {([['', tr.productsVoltageAll], ['low', tr.productsVoltageLow], ['high', tr.productsVoltageHigh]] as [string, string][]).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setVoltageFilter(val as 'low' | 'high' | '')}
                      className={`flex items-center gap-3 h-11 px-4 rounded-[10px] text-sm font-semibold font-['Inter'] text-left transition-colors ${
                        voltageFilter === val
                          ? 'bg-slate-900 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${voltageFilter === val ? 'border-white' : 'border-gray-300'}`}>
                        {voltageFilter === val && <span className="h-2 w-2 rounded-full bg-white" />}
                      </span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Locatie */}
              <div className="px-5 pt-2 pb-4 border-t border-gray-100">
                <p className="text-xs font-bold font-['Inter'] uppercase tracking-wider text-gray-400 mb-3 mt-4">{tr.productsLocationAll}</p>
                <div className="flex flex-col gap-2">
                  {([['', tr.productsLocationAll], ['indoor', tr.productsLocationIndoor], ['outdoor', tr.productsLocationOutdoor]] as [string, string][]).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setLocationFilter(val as 'indoor' | 'outdoor' | '')}
                      className={`flex items-center gap-3 h-11 px-4 rounded-[10px] text-sm font-semibold font-['Inter'] text-left transition-colors ${
                        locationFilter === val
                          ? 'bg-slate-900 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${locationFilter === val ? 'border-white' : 'border-gray-300'}`}>
                        {locationFilter === val && <span className="h-2 w-2 rounded-full bg-white" />}
                      </span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 px-5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setVoltageFilter(''); setLocationFilter('') }}
                  className="flex-1 h-11 rounded-[10px] border-2 border-gray-200 text-sm font-bold font-['Inter'] text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {tr.clearFilters}
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 h-11 rounded-[10px] bg-slate-900 text-sm font-bold font-['Inter'] text-white hover:bg-slate-800 transition-colors"
                >
                  Aplică
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── PRODUCT GRID ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CatalogProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
            {filtered.map((product) => {
              const img = getProductCardImageUrl(product)
              const imgs = Array.isArray(product.images) ? product.images : []
              const fallbackImg = imgs[0] && imgs[0] !== img ? imgs[0] : '/images/shared/HP2000-all-in-one.png'
              const { specLine1, specLine2 } = getCatalogProductSpecLines(product)
              const stockListingCta = getResidentialCatalogStockListingCta(product, {
                outOfStock: tr.catalogStockOutOfStock,
                comingSoon: tr.catalogStockComingSoon,
              })
              const residentialPartnerPriceCta =
                product.tipProdus !== 'industrial' &&
                !stockListingCta &&
                residentialCatalogUsesPartnerPriceCta(product)
                  ? tr.catalogDisponibilParteneriPrice
                  : null
              const priceDisplay =
                product.tipProdus === 'industrial'
                  ? formatResidentialCatalogPriceDisplay(product, language.code, currency) ?? undefined
                  : stockListingCta || residentialPartnerPriceCta
                    ? undefined
                    : formatResidentialCatalogPriceDisplay(product, language.code, currency)
              const industrialHasPrice =
                product.tipProdus === 'industrial' && priceDisplay != null && priceDisplay !== ''
              const to = `/produse/${product.slug || product.id}`
              const linkState = { tipProdus: product.tipProdus }
              const industrialSubtitle = String(product.subtitle || '').trim() || undefined
              const showResPriceExtras =
                priceDisplay != null &&
                priceDisplay !== '' &&
                (residentialPartnerPriceCta == null || String(residentialPartnerPriceCta).trim() === '')
              const catalogBadgeLabels = catalogBadgeLabelsFromProduseTr(tr)
              const featureBadges: HorizontalFeatureBadge[] = []
              const stockLabel = getCatalogStockBadgeLabel(product, { inStock: tr.catalogStockInStock, outOfStock: tr.catalogStockOutOfStock, comingSoon: tr.catalogStockComingSoon, onOrder: tr.catalogStockOnOrder })
              if (stockLabel) featureBadges.push({ type: 'stock', label: stockLabel })
              const deliveryLabel = getCatalogDeliveryBadgeLabel(product, { h24: tr.catalogDelivery24h, h48: tr.catalogDelivery48h, d7_14: tr.catalogDelivery7_14d, d60: catalogBadgeLabels.delivery60d })
              if (deliveryLabel) featureBadges.push({ type: 'delivery', label: `${catalogBadgeLabels.deliveryCategory} ${deliveryLabel}` })
              const transportLabel = getCatalogTransportBadgeLabel(product, { free: catalogBadgeLabels.transportFree, paid: catalogBadgeLabels.transportPaid })
              if (transportLabel) featureBadges.push({ type: 'transport', label: `${catalogBadgeLabels.transportCategory} ${transportLabel}` })
              if (product.tipProdus === 'industrial') {
                const installLabel = getCatalogInstallBadgeLabel(product, { baterino: catalogBadgeLabels.installBaterino, partner: catalogBadgeLabels.installPartner })
                if (installLabel) featureBadges.push({ type: 'install', label: `${catalogBadgeLabels.installCategory} ${installLabel}` })
              } else if (productHasEligibleReducerePrograms(product)) {
                featureBadges.push({ type: 'reduceri', label: catalogBadgeLabels.reduceri })
              }
              return (
                <HorizontalCatalogProductCard
                  key={product.id}
                  variant={product.tipProdus === 'industrial' ? 'industrial' : 'residential'}
                  imageSrc={img}
                  fallbackImageSrc={fallbackImg}
                  imageAlt={product.title}
                  title={product.title}
                  subtitle={industrialSubtitle}
                  specLine1={specLine1}
                  specLine2={specLine2}
                  to={to}
                  linkState={linkState}
                  priceDisplay={priceDisplay}
                  ctaLabel={product.tipProdus === 'industrial' && !industrialHasPrice ? tr.disponibilPentruParteneri : undefined}
                  residentialPartnerPriceCta={residentialPartnerPriceCta}
                  residentialStockListingCta={stockListingCta}
                  residentialPriceHeading={showResPriceExtras || industrialHasPrice ? tr.pretLabel : null}
                  residentialPriceVatNote={
                    showResPriceExtras || industrialHasPrice
                      ? tr.catalogIncludesVatWithPct.replace('{pct}', getResidentialCatalogVatPercentLabel(product))
                      : null
                  }
                  featureBadges={featureBadges}
                />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-600 font-['Inter'] text-base">
            {(sector === 'medical' || sector === 'industrial') ? tr.productsComingSoon : tr.noResults}
          </div>
        )}

      </div>
    </>
  )
}
