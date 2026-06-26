import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useCookieConsent } from '../contexts/CookieConsentContext'
import { useCatalogCurrency } from '../contexts/CatalogCurrencyContext'

import { getHomeTranslations } from '../i18n/home'
import {
  getProducts,
  getProductCardImageUrl,
  getCatalogProductSpecLines,
  formatResidentialCatalogPriceDisplay,
  formatResidentialCatalogNetPriceDisplay,
  getResidentialCatalogStockListingCta,
  residentialCatalogUsesPartnerPriceCta,
  catalogProductShowsPublicPrice,
  isPromoCatalogProduct,
  type PublicProduct,
} from '../lib/api'
import HomePromoModal from '../components/home/HomePromoModal'
import { syncProductTipsFromList } from '../lib/productTipCache'
import SEO from '../components/SEO'
import SchemaOrg from '../components/SchemaOrg'
import { useSeoPage } from '../contexts/SeoConfigContext'
import CTABar from '../components/CTABar'
import HomeHeroV2 from '../components/home/HomeHeroV2'
import HomeMobileSliderV2, { MOBILE_SLIDE_V2_COUNT } from '../components/home/HomeMobileSliderV2'
import HomeWarrantyCta from '../components/home/HomeWarrantyCta'
import HomeInverterSearch from '../components/home/HomeInverterSearch'
import HomeFeaturesGrid from '../components/home/HomeFeaturesGrid'
import HomeInstalledCapacityCounters from '../components/home/HomeInstalledCapacityCounters'
import HomeProiecteIndustriale from '../components/home/HomeProiecteIndustriale'
import HomeCaseStudiesPreview from '../components/home/HomeCaseStudiesPreview'
import {
  CatalogProductCardSkeleton,
  IndustrialCatalogProductCard,
  ResidentialCatalogProductCard,
} from '../components/product/CatalogProductCard'
import ResidentialProductCatalogBadges from '../components/product/ResidentialProductCatalogBadges'
import { catalogBadgeLabelsFromProduseTr } from '../lib/catalogProductBadges'
import { sortCatalogProducts } from '../lib/catalogProductSort'

function renderBaterinoGlobalLink(text: string) {
  return text.split('Baterino Global').map((part, i, arr) =>
    i < arr.length - 1 ? (
      <span key={i}>
        {part}
        <a href="https://baterino.com" target="_blank" rel="noopener noreferrer" className="text-black font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity">
          Baterino Global
        </a>
      </span>
    ) : (
      part
    )
  )
}

/* ── Page ────────────────────────────────────────────────────── */
const WELCOME_MODAL_STORAGE_KEY = 'baterino-welcome-modal-chosen'
const USER_TYPE_STORAGE_KEY = 'baterino-user-type'
const PROMO_MODAL_STORAGE_KEY = 'baterino-promo-case-seen'

/* ── Welcome modal (mobile only, slides up from bottom) ───────────────── */
function WelcomeModal({
  onClose,
  onProfesionist,
  tr,
}: {
  onClose: () => void
  onProfesionist: () => void
  tr: { welcomeModalWelcomeTo: string; welcomeModalTitle: string; welcomeModalSubtitle: string; welcomeModalProfesionist: string; welcomeModalClientFinal: string }
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative w-full max-w-[100vw] bg-white rounded-t-[20px] shadow-2xl animate-slide-up-from-bottom"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center px-6 pt-8 pb-6 gap-6">
          <div className="w-80 max-w-full relative flex flex-col items-center">
            <p className="text-black text-xs font-medium font-['Inter'] leading-5 text-center mb-1">
              {tr.welcomeModalWelcomeTo}
            </p>
            <img
              src="/images/shared/baterino-logo-black.svg"
              alt="Baterino"
              className="w-36 h-7 object-contain"
            />
            <h2 id="welcome-modal-title" className="text-black text-lg font-bold font-['Inter'] leading-6 text-center mt-5 mb-2 px-1">
              {tr.welcomeModalTitle}
            </h2>
            <p className="text-black text-sm font-medium font-['Inter'] leading-5 text-center px-1">
              {tr.welcomeModalSubtitle}
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-[320px]">
            <button
              type="button"
              onClick={onProfesionist}
              className="w-full h-12 px-6 bg-slate-900 text-white rounded-[10px] font-semibold font-['Inter'] text-sm uppercase tracking-wide hover:bg-slate-700 transition-colors"
            >
              {tr.welcomeModalProfesionist}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full h-12 px-6 border-2 border-gray-200 text-gray-700 rounded-[10px] font-semibold font-['Inter'] text-sm uppercase tracking-wide hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              {tr.welcomeModalClientFinal}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { language } = useLanguage()
  const { currency } = useCatalogCurrency()
  const { preference: cookiePreference } = useCookieConsent()
  const tr = getHomeTranslations(language.code)
  const seo = useSeoPage('home')

  const [activeTab,  setActiveTab]  = useState<string>('')
  const [mobileTabOpen, setMobileTabOpen] = useState(false)
  const [voltageFilter, setVoltageFilter] = useState<'low' | 'high' | ''>('')
  const [locationFilter, setLocationFilter] = useState<'indoor' | 'outdoor' | ''>('')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const advancedFilterCount = (voltageFilter ? 1 : 0) + (locationFilter ? 1 : 0)
  const [reduceriVisibleCount, setReduceriVisibleCount] = useState(2)
  const [isMobile, setIsMobile] = useState(true)

  const [divisionsActiveIndex, setDivisionsActiveIndex] = useState(0)
  const divisionsSliderRef = useRef<HTMLDivElement>(null)
  const CARD_GAP = 10
  const DIVISIONS_COUNT = 4
  const DIVISIONS_CARD_WIDTH = 324

  const [products, setProducts] = useState<PublicProduct[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [userType, setUserType] = useState<'profesionist' | 'client' | null>(() => {
    if (typeof sessionStorage === 'undefined') return null
    const stored = sessionStorage.getItem(USER_TYPE_STORAGE_KEY)
    return stored === 'profesionist' || stored === 'client' ? stored : null
  })

  useEffect(() => {
    setProductsLoading(true)
    getProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false))
  }, [])

  useEffect(() => {
    if (products.length === 0) return
    syncProductTipsFromList(
      products.map((p) => ({ slug: p.slug, id: p.id, tipProdus: p.tipProdus })),
    )
  }, [products])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (window.innerWidth >= 640) return
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(WELCOME_MODAL_STORAGE_KEY)) return
    setShowWelcomeModal(true)
  }, [])

  useEffect(() => {
    if (!cookiePreference.decided) return
    if (window.innerWidth < 768) return
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(PROMO_MODAL_STORAGE_KEY)) return
    const timer = setTimeout(() => setShowPromoModal(true), 1000)
    return () => clearTimeout(timer)
  }, [cookiePreference.decided])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 768) setShowPromoModal(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const closeWelcomeModal = () => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(WELCOME_MODAL_STORAGE_KEY, '1')
      sessionStorage.setItem(USER_TYPE_STORAGE_KEY, 'client')
    }
    setUserType('client')
    setShowWelcomeModal(false)
  }

  const handleWelcomeProfesionist = () => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(WELCOME_MODAL_STORAGE_KEY, '1')
      sessionStorage.setItem(USER_TYPE_STORAGE_KEY, 'profesionist')
    }
    setUserType('profesionist')
    setShowWelcomeModal(false)
  }

  useEffect(() => {
    const el = divisionsSliderRef.current
    if (!el) return
    const onScroll = () => {
      const index = Math.round(el.scrollLeft / (DIVISIONS_CARD_WIDTH + CARD_GAP))
      setDivisionsActiveIndex(Math.min(Math.max(0, index), DIVISIONS_COUNT - 1))
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])


  const featuredProducts = useMemo(() => {
    const filtered = products.filter((p) => {
      if (!activeTab) return true
      const cat = String(p.categorie || '').toLowerCase()
      if (cat && cat.includes(activeTab)) {
        // pass sector filter
      } else if (!p.categorie?.trim()) {
        const tip = String(p.tipProdus || '').toLowerCase()
        if (activeTab === 'rezidential' && tip === 'industrial') {
          // pass — carousel-template products skew residential sector
        } else if (activeTab === 'industrial' && tip === 'rezidential') {
          // pass — classic-page products skew industrial sector
        } else {
          return false
        }
      } else {
        return false
      }
      return true
    })
    const withPrice = filtered.filter((p) => catalogProductShowsPublicPrice(p, language.code, currency))
    if (voltageFilter) {
      const vf = withPrice.filter((p) => {
        const v = parseFloat(String(p.tensiuneNominala || '').replace(',', '.'))
        if (Number.isNaN(v)) return false
        if (voltageFilter === 'low' && v >= 100) return false
        if (voltageFilter === 'high' && v < 100) return false
        return true
      })
      if (vf.length > 0) {
        return sortCatalogProducts(vf).slice(0, 6)
      }
    }
    if (locationFilter) {
      const lf = withPrice.filter((p) => String(p.locatieMontaj || '').toLowerCase().trim() === locationFilter)
      if (lf.length > 0) {
        return sortCatalogProducts(lf).slice(0, 6)
      }
    }
    return sortCatalogProducts(withPrice).slice(0, 6)
  }, [products, activeTab, voltageFilter, locationFilter, language.code, currency])

  const tabs = [
    { id: 'rezidential', label: tr.productsTabRez },
    { id: 'industrial',  label: tr.productsTabInd },
    { id: 'medical',     label: tr.productsTabMed },
    { id: 'maritim',     label: tr.productsTabMar },
  ]

  const reduceriCards = [
    { img: '/images/programe%20reduceri/energie-pentru-parinti-campenie-reduceri-baterino.jpg', pct: '20%', title: tr.reduceriCard1Title, desc: tr.reduceriCard1Desc },
    { img: '/images/programe%20reduceri/tva-ul-cum-era-campanie-reducere-baterino.jpg', pct: '12%', title: tr.reduceriCard2Title, desc: tr.reduceriCard2Desc },
    { img: '/images/programe%20reduceri/cum-e-viata-la-tara-campanie-reduceri-baterino.jpg', pct: '7%', title: tr.reduceriCard3Title, desc: tr.reduceriCard3Desc },
    { img: '/images/programe%20reduceri/stiu-de-la-vecinu-program-reducere-baterino.jpg', pct: '5%', title: tr.reduceriCard4Title, desc: tr.reduceriCard4Desc },
  ]
  const reduceriVisibleCards = reduceriCards.slice(0, isMobile ? reduceriVisibleCount : 4)

  return (
    <>
      <SEO
        title={seo.title || tr.seoTitle}
        description={seo.description || tr.seoDesc}
        canonical="/"
        ogTitle={seo.ogTitle || undefined}
        ogDescription={seo.ogDescription || undefined}
        ogImage={seo.ogImage || '/images/home/og-baterino-romania.jpg'}
        lang={language.code}
      />

      <SchemaOrg schema={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Baterino Romania',
        url: 'https://baterino.ro',
        logo: 'https://baterino.ro/images/shared/baterino-logo-black.svg',
        description: tr.seoDesc,
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          url: 'https://baterino.ro/contact',
          availableLanguage: ['Romanian', 'English'],
        },
        areaServed: 'RO',
        knowsLanguage: ['ro', 'en'],
        sameAs: ['https://www.facebook.com/baterino.ro/', 'https://www.linkedin.com/company/baterino-romania', 'https://www.google.com/maps?cid=15926825830058361764'],
      }} />

      <h1 className="sr-only">{tr.heroV2Title}</h1>

      {/* Mobile: card slider built from desktop cards, split in two */}
      <div className="md:hidden">
        <HomeMobileSliderV2 tr={tr} jumpTo={userType === 'profesionist' ? MOBILE_SLIDE_V2_COUNT - 1 : 0} />
      </div>

      {/* Desktop: card slider hero */}
      <div className="hidden md:block pt-6 lg:pt-10">
        <HomeHeroV2 tr={tr} userType={userType} />
      </div>

      <div className="max-w-content mx-auto px-5 lg:px-3 pb-24">
        {/* ── PRODUCTS ── */}
        <section id="produse-section" className="mb-0">
          <h2 className="text-center text-black text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Inter'] leading-tight mt-6 sm:mt-8 lg:mt-10 mb-6 sm:mb-8 lg:mb-10 uppercase">
            {tr.productsSectionTitle}
          </h2>

          {/* Product category filters */}
          {isMobile ? (
            <div className="mb-8">
              <div className="flex items-center gap-2">
                {/* Sector dropdown */}
                <button
                  type="button"
                  onClick={() => setMobileTabOpen(true)}
                  className={`flex-1 flex items-center justify-between gap-2 h-11 px-4 rounded-[10px] border-2 text-sm font-bold font-['Inter'] uppercase tracking-wide transition-all ${
                    activeTab
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  <span className="truncate">{tabs.find((t) => t.id === activeTab)?.label ?? tr.productsTabAll}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {/* Filtre button */}
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className={`shrink-0 flex items-center gap-2 h-11 px-4 rounded-[10px] border-2 text-sm font-bold font-['Inter'] uppercase tracking-wide transition-all ${
                    advancedFilterCount > 0 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                  </svg>
                  Filtre
                  {advancedFilterCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-900 text-[10px] font-extrabold">{advancedFilterCount}</span>
                  )}
                </button>
                {/* Clear */}
                {(voltageFilter || locationFilter) && (
                  <button
                    type="button"
                    onClick={() => { setVoltageFilter(''); setLocationFilter('') }}
                    aria-label={tr.clearFilters}
                    className="shrink-0 flex items-center justify-center h-11 w-11 rounded-[10px] border-2 border-gray-200 text-gray-500"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {/* Active filter chips */}
              {(voltageFilter || locationFilter) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {voltageFilter && (
                    <span className="inline-flex items-center gap-1 h-7 pl-3 pr-2 rounded-full bg-slate-100 text-xs font-semibold font-['Inter'] text-slate-700">
                      {voltageFilter === 'low' ? tr.productsVoltageLow : tr.productsVoltageHigh}
                      <button type="button" onClick={() => setVoltageFilter('')} className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-slate-200">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </span>
                  )}
                  {locationFilter && (
                    <span className="inline-flex items-center gap-1 h-7 pl-3 pr-2 rounded-full bg-slate-100 text-xs font-semibold font-['Inter'] text-slate-700">
                      {locationFilter === 'indoor' ? tr.productsLocationIndoor : tr.productsLocationOutdoor}
                      <button type="button" onClick={() => setLocationFilter('')} className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-slate-200">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </span>
                  )}
                </div>
              )}
              {/* Mobile: inverter search below filters */}
              <div className="mt-3">
                <HomeInverterSearch placeholder={tr.heroV2InverterSearchPlaceholder} />
              </div>
            </div>
          ) : (
            /* Desktop: pill filter bar */
            <div className="flex items-center gap-3 mb-8 lg:mb-10">
              {/* Left: sector pills + voltage + location dropdowns */}
              <div className="flex items-center gap-2 flex-1 flex-wrap" role="group" aria-label={tr.productsSectionTitle}>
                {/* All pill */}
                <button
                  type="button"
                  onClick={() => setActiveTab('')}
                  aria-pressed={activeTab === ''}
                  className={`h-9 px-4 rounded-full text-sm font-semibold font-['Inter'] border transition-all duration-200 ${
                    activeTab === ''
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {tr.productsTabAll}
                </button>

                {/* Sector pills */}
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    aria-pressed={activeTab === tab.id}
                    className={`h-9 px-4 rounded-full text-sm font-semibold font-['Inter'] border transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}

              </div>

              {/* Right: inverter search — pill style */}
              <HomeInverterSearch placeholder={tr.heroV2InverterSearchPlaceholder} compact />
            </div>
          )}

          {/* Mobile sector bottom sheet */}
          {mobileTabOpen && (
            <div
              className="fixed inset-0 z-50 flex items-end bg-black/50 animate-overlay-fade-in"
              onClick={() => setMobileTabOpen(false)}
            >
              <div
                className="w-full rounded-t-[20px] bg-white animate-sheet-slide-up overflow-hidden"
                style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-center pt-3 pb-1">
                  <div className="h-1 w-10 rounded-full bg-gray-200" />
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                  <h2 className="text-base font-bold font-['Inter'] text-black">{tr.productsSectionTitle}</h2>
                  <button
                    type="button"
                    onClick={() => setMobileTabOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
                    aria-label="Închide"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-col gap-2 px-5 py-4">
                  {[{ id: '', label: tr.productsTabAll }, ...tabs].map((tab) => {
                    const active = activeTab === tab.id
                    return (
                      <button
                        key={tab.id || 'all'}
                        type="button"
                        onClick={() => { setActiveTab(tab.id); setMobileTabOpen(false) }}
                        className={`flex items-center gap-3 h-12 px-4 rounded-[10px] text-sm font-semibold font-['Inter'] text-left transition-colors ${
                          active ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${active ? 'border-white' : 'border-gray-300'}`}>
                          {active && <span className="h-2 w-2 rounded-full bg-white" />}
                        </span>
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Filtre bottom sheet */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 flex items-end bg-black/50 animate-overlay-fade-in" onClick={() => setMobileFiltersOpen(false)}>
              <div className="w-full rounded-t-[20px] bg-white animate-sheet-slide-up overflow-hidden" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }} onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-center pt-3 pb-1"><div className="h-1 w-10 rounded-full bg-gray-200" /></div>
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                  <h2 className="text-base font-bold font-['Inter'] text-black">Filtre</h2>
                  <button type="button" onClick={() => setMobileFiltersOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100" aria-label="Închide">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>
                {/* Tensiune */}
                <div className="px-5 pt-4 pb-3">
                  <p className="text-xs font-bold font-['Inter'] uppercase tracking-wider text-gray-400 mb-3">{tr.productsVoltageAll}</p>
                  <div className="flex flex-col gap-2">
                    {([['', tr.productsVoltageAll], ['low', tr.productsVoltageLow], ['high', tr.productsVoltageHigh]] as [string, string][]).map(([val, label]) => (
                      <button key={val} type="button" onClick={() => setVoltageFilter(val as 'low' | 'high' | '')}
                        className={`flex items-center gap-3 h-11 px-4 rounded-[10px] text-sm font-semibold font-['Inter'] text-left transition-colors ${voltageFilter === val ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
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
                      <button key={val} type="button" onClick={() => setLocationFilter(val as 'indoor' | 'outdoor' | '')}
                        className={`flex items-center gap-3 h-11 px-4 rounded-[10px] text-sm font-semibold font-['Inter'] text-left transition-colors ${locationFilter === val ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
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
                  <button type="button" onClick={() => { setVoltageFilter(''); setLocationFilter('') }}
                    className="flex-1 h-11 rounded-[10px] border-2 border-gray-200 text-sm font-bold font-['Inter'] text-gray-600 hover:bg-gray-50 transition-colors">
                    {tr.clearFilters}
                  </button>
                  <button type="button" onClick={() => setMobileFiltersOpen(false)}
                    className="flex-1 h-11 rounded-[10px] bg-slate-900 text-sm font-bold font-['Inter'] text-white hover:bg-slate-800 transition-colors">
                    Aplică
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 sm:mb-10">
            {productsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <CatalogProductCardSkeleton key={i} density="home" />
              ))
            ) : featuredProducts.length === 0 && (activeTab === 'medical' || activeTab === 'industrial') ? (
              <div className="col-span-full text-center py-16 text-gray-600 font-['Inter'] text-base">
                {tr.productsComingSoon}
              </div>
            ) : (
            featuredProducts.map((p) => {
              const img = getProductCardImageUrl(p)
              const pImgs = Array.isArray(p.images) ? p.images : []
              const fallbackImg = pImgs[0] && pImgs[0] !== img ? pImgs[0] : '/images/shared/HP2000-all-in-one.png'
              const { specLine1, specLine2 } = getCatalogProductSpecLines(p)
              const stockListingCta = getResidentialCatalogStockListingCta(p, {
                outOfStock: tr.catalogStockOutOfStock,
                comingSoon: tr.catalogStockComingSoon,
              })
              const residentialPartnerPriceCta =
                p.tipProdus !== 'industrial' && !stockListingCta && residentialCatalogUsesPartnerPriceCta(p)
                  ? tr.catalogDisponibilParteneriPrice
                  : null
              const priceDisplay =
                p.tipProdus === 'industrial'
                  ? formatResidentialCatalogPriceDisplay(p, language.code, currency) ?? undefined
                  : stockListingCta || residentialPartnerPriceCta
                    ? undefined
                    : formatResidentialCatalogPriceDisplay(p, language.code, currency)
              const industrialHasPrice = p.tipProdus === 'industrial' && priceDisplay != null && priceDisplay !== ''
              const showIndustrialPriceExtras = industrialHasPrice
              const to = `/produse/${[p.category?.slug, p.slug || p.id].filter(Boolean).join('/')}`
              const linkState = { tipProdus: p.tipProdus }
              const common = {
                density: 'home' as const,
                imageSrc: img,
                fallbackImageSrc: fallbackImg,
                imageAlt: p.title,
                title: p.title,
                specLine1,
                specLine2,
                to,
                linkState,
                imageLoadingPlaceholder: true,
                priceDisplay,
                promoted: isPromoCatalogProduct(p),
                capacityTag: (() => {
                  // Try energieNominala first (residential + classic industrial)
                  const raw = p.energieNominala
                  if (raw) {
                    const wh = parseFloat(String(raw).replace(',', '.'))
                    if (!isNaN(wh) && wh > 0) {
                      const kwh = wh / 1000
                      const formatted = kwh % 1 === 0 ? kwh.toFixed(0) : kwh.toFixed(2).replace(/\.?0+$/, '')
                      return `${formatted} kWh`
                    }
                  }
                  // Fallback: scan technicalSpecsModels specs for a kWh value
                  const models = (p as { technicalSpecsModels?: { entries?: Array<{ specs?: Record<string, string> }> } }).technicalSpecsModels
                  if (models?.entries?.length) {
                    const specs = models.entries[0]?.specs ?? {}
                    for (const val of Object.values(specs)) {
                      const m = String(val).match(/([\d.,]+)\s*kWh/i)
                      if (m) return `${m[1]} kWh`
                    }
                  }
                  return null
                })(),
              }
              const industrialSubtitle = String(p.subtitle || '').trim() || undefined
              const showResPriceExtras =
                priceDisplay != null &&
                priceDisplay !== '' &&
                (residentialPartnerPriceCta == null || String(residentialPartnerPriceCta).trim() === '')
              const catalogBadgeLabels = catalogBadgeLabelsFromProduseTr(tr)
              return p.tipProdus === 'industrial' ? (
                <IndustrialCatalogProductCard
                  key={p.id}
                  {...common}
                  subtitle={industrialSubtitle}
                  ctaLabel={industrialHasPrice ? undefined : tr.disponibilPentruParteneri}
                  residentialPriceHeading={showIndustrialPriceExtras ? tr.pretLabel : null}
                  residentialPriceVatNote={(() => {
                    const net = formatResidentialCatalogNetPriceDisplay(p, language.code, currency)
                    return net ? tr.catalogPretFaraTva.replace('{price}', net) : null
                  })()}
                  imageOverlay={
                    <ResidentialProductCatalogBadges
                      product={p}
                      labels={catalogBadgeLabels}
                      layout="stack"
                      include={['stock', 'delivery']}
                    />
                  }
                  priceAboveBadge={
                    <ResidentialProductCatalogBadges
                      product={p}
                      labels={catalogBadgeLabels}
                      layout="wrap"
                      className="justify-center gap-1.5"
                      include={['transport', 'install']}
                      appearance="neutral"
                    />
                  }
                />
              ) : (
                <ResidentialCatalogProductCard
                  key={p.id}
                  {...common}
                  residentialPartnerPriceCta={residentialPartnerPriceCta}
                  residentialStockListingCta={stockListingCta}
                  residentialPriceHeading={showResPriceExtras ? tr.pretLabel : null}
                  residentialPriceVatNote={
                    showResPriceExtras
                      ? (() => {
                          const net = formatResidentialCatalogNetPriceDisplay(p, language.code, currency)
                          return net ? tr.catalogPretFaraTva.replace('{price}', net) : null
                        })()
                      : null
                  }
                  imageOverlay={
                    <ResidentialProductCatalogBadges
                      product={p}
                      labels={catalogBadgeLabels}
                      layout="stack"
                      include={['stock', 'delivery']}
                    />
                  }
                  priceAboveBadge={
                    <ResidentialProductCatalogBadges
                      product={p}
                      labels={catalogBadgeLabels}
                      layout="wrap"
                      className="justify-center gap-1.5"
                      include={['transport', 'reducere']}
                      appearance="neutral"
                    />
                  }
                />
              )
            })
            )}
          </div>
        </section>

        <div className="mt-8 lg:mt-10">
          <HomeWarrantyCta tr={tr} />
        </div>

      </div>

      {/* ── REDUCERI – Programe de reduceri ── */}
      <section className="mb-16 lg:mb-24 max-w-content mx-auto px-5 lg:px-3">
        <div className="my-6 flex flex-col items-center gap-4 text-center sm:my-8">
          <h2 className="text-black text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Inter'] leading-tight mb-3 uppercase">
            {tr.reduceriGridTitle}
          </h2>
          <p className="max-w-[846px] text-base font-normal font-['Inter'] leading-5 text-black sm:text-lg sm:leading-6">
            {tr.reduceriGridSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reduceriVisibleCards.map((card, i) => (
            <Link key={i} to="/reduceri" className="group block">
              <div className="w-full h-[450px] relative rounded-[10px] overflow-hidden bg-zinc-300 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                <img
                  src={card.img}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover rounded-[10px] transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 rounded-[10px] transition-colors duration-300 group-hover:bg-black/55" />
                <div className="absolute top-3 left-3 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-slate-900/80 rounded-[5px] z-10">
                  <span className="text-white text-xs font-semibold font-['Inter'] uppercase tracking-wide">Pentru Clienți</span>
                </div>
                <div className="absolute top-3 right-3 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/95 rounded-[5px] z-10">
                  <span className="text-slate-900 text-xs sm:text-sm font-bold font-['Inter']">{card.pct} {tr.reduceriDiscountSuffix}</span>
                </div>
                <div className="absolute left-[20px] sm:left-[26px] right-[20px] sm:right-[26px] bottom-[20px] sm:bottom-[24px] z-10 flex flex-col gap-2 sm:gap-3">
                  <div className="flex flex-col">
                    <p className="m-0 text-white text-sm sm:text-base font-medium font-['Nunito_Sans'] leading-none">{tr.reduceriProgramLabel}</p>
                    <h3 className="m-0 text-white text-xl sm:text-2xl font-bold font-['Inter'] leading-tight whitespace-pre-line">
                      {card.title}
                    </h3>
                  </div>
                  <p className="text-white text-sm sm:text-base font-medium font-['Inter'] leading-4 sm:leading-5">
                    {card.desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {isMobile && reduceriVisibleCount < 4 && (
          <div className="mt-6 flex justify-center sm:hidden">
            <button
              type="button"
              onClick={() => setReduceriVisibleCount(4)}
              className="h-11 sm:h-12 px-6 sm:px-8 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-zinc-300 text-black text-sm sm:text-base font-semibold font-['Inter'] hover:bg-neutral-100 transition-colors"
            >
              {tr.reduceriLoadMore}
            </button>
          </div>
        )}
      </section>

      <HomeFeaturesGrid tr={tr} />

      <hr className="border-gray-200 my-16 lg:my-24 w-full lg:max-w-[1100px] lg:mx-auto" />

      <div className="max-w-content mx-auto px-5 lg:px-3 pb-24">

        {/* ── DIVIZIILE BATERINO ── */}
        <section className="mb-16 lg:mb-24">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-black text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Inter'] leading-tight mb-3 uppercase">
              {tr.diviziileNoastreTitle}
            </h2>
            <p className="mb-6 max-w-[894px] text-base font-medium font-['Inter'] leading-6 text-gray-700 sm:mb-8 sm:text-lg sm:leading-8">
              {tr.diviziileNoastreSubtitle}
            </p>

            {/* Desktop: 4 cards in grid */}
            <div className="hidden w-full lg:grid lg:grid-cols-4 lg:gap-6">
              <Link to="/divizii/rezidential" className="h-[450px] relative rounded-[10px] overflow-hidden bg-zinc-300 group block">
                <img src="/images/home/rezidential-baterii-lifepo4.jpg" alt={tr.divRezTitle} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40" />
                <img src="/images/shared/baterino-logo-white.png" alt="Baterino" loading="lazy" className="absolute top-6 right-6 h-6 w-auto object-contain" />
                <div className="absolute bottom-6 left-[21px]">
                  <p className="text-white text-3xl font-bold font-['Inter'] leading-9 mb-1">{tr.divRezTitle}</p>
                  <p className="text-white text-base font-medium font-['Inter'] leading-5 max-w-[240px]">{tr.divRezDesc}</p>
                </div>
              </Link>
              <Link to="/divizii/industrial" className="h-[450px] relative rounded-[10px] overflow-hidden bg-zinc-300 group block">
                <img src="/images/home/industrial-baterii-lifepo4.jpg" alt={tr.divIndTitle} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40" />
                <img src="/images/shared/baterino-pro-industrial-logo.png" alt="Baterino Industrial" loading="lazy" className="absolute top-5 right-6 h-6 w-auto object-contain" />
                <div className="absolute bottom-6 left-[22px]">
                  <p className="text-white text-3xl font-bold font-['Inter'] leading-9 mb-1">{tr.divIndTitle}</p>
                  <p className="text-white text-base font-medium font-['Inter'] leading-5 max-w-[224px]">{tr.divIndDesc}</p>
                </div>
              </Link>
              <Link to="/divizii/medical" className="h-[450px] relative rounded-[10px] overflow-hidden bg-zinc-300 group block">
                <img src="/images/home/medical-baterii-lifepo4.jpg" alt={tr.divMedTitle} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40" />
                <img src="/images/shared/baterino-medical-logo-white.png" alt="Baterino Medical" loading="lazy" className="absolute top-6 right-6 h-6 w-auto object-contain" />
                <div className="absolute bottom-6 left-[18px]">
                  <p className="text-white text-3xl font-bold font-['Inter'] leading-9 mb-1">{tr.divMedTitle}</p>
                  <p className="text-white text-base font-medium font-['Inter'] leading-5 max-w-[240px]">{tr.divMedDesc}</p>
                </div>
              </Link>
              <Link to="/divizii/maritim" className="h-[450px] relative rounded-[10px] overflow-hidden bg-zinc-300 group block">
                <img src="/images/home/maritim-baterii-lifepo4.jpg" alt={tr.divMarTitle} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40" />
                <img src="/images/shared/baterino-maritim-logo-white.png" alt="Baterino Maritim" loading="lazy" className="absolute top-6 right-6 h-6 w-auto object-contain" />
                <div className="absolute bottom-6 inset-x-0 px-4 text-center">
                  <p className="text-white text-3xl font-bold font-['Inter'] leading-9 mb-1">{tr.divMarTitle}</p>
                  <p className="text-white text-base font-medium font-['Inter'] leading-5 max-w-[256px] mx-auto">{tr.divMarDesc}</p>
                </div>
              </Link>
            </div>

            {/* Mobile: slider */}
            <div className="w-full lg:hidden">
              <div className="-mx-5 w-[calc(100%+2.5rem)]">
                <div
                  ref={divisionsSliderRef}
                  className="flex gap-[10px] overflow-x-auto scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pl-5 pr-5"
                  style={{
                    scrollPaddingLeft: 'max(10px, calc(50vw - 162px))',
                    scrollPaddingRight: 'max(10px, calc(50vw - 162px))',
                  }}
                >
                  {[
                    { img: '/images/home/rezidential-baterii-lifepo4.jpg', title: tr.divRezTitle, desc: tr.divRezDesc, to: '/divizii/rezidential', logo: '/images/shared/baterino-logo-white.png' },
                    { img: '/images/home/industrial-baterii-lifepo4.jpg', title: tr.divIndTitle, desc: tr.divIndDesc, to: '/divizii/industrial', logo: '/images/shared/baterino-pro-industrial-logo.png' },
                    { img: '/images/home/medical-baterii-lifepo4.jpg', title: tr.divMedTitle, desc: tr.divMedDesc, to: '/divizii/medical', logo: '/images/shared/baterino-medical-logo-white.png' },
                    { img: '/images/home/maritim-baterii-lifepo4.jpg', title: tr.divMarTitle, desc: tr.divMarDesc, to: '/divizii/maritim', logo: '/images/shared/baterino-maritim-logo-white.png' },
                  ].map((d, i) => (
                    <Link
                      key={i}
                      to={d.to}
                      className="relative flex-shrink-0 w-[324px] h-[450px] rounded-[10px] overflow-hidden bg-zinc-300 group block snap-center"
                    >
                      <img src={d.img} alt={d.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40" />
                      <img src={d.logo} alt="" loading="lazy" className="absolute top-5 sm:top-6 right-5 sm:right-6 h-5 sm:h-6 w-auto object-contain" />
                      <div className="absolute bottom-5 sm:bottom-6 inset-x-0 px-4 text-center">
                        <h3 className="text-white text-3xl font-bold font-['Inter'] leading-9 mb-2 uppercase">{d.title}</h3>
                        <p className="text-white text-base font-medium font-['Inter'] leading-6 max-w-[280px] mx-auto">{d.desc}</p>
                      </div>
                    </Link>
                  ))}
                  <div aria-hidden style={{ flexShrink: 0, width: 'var(--grid-edge)' }} />
                </div>
              </div>
              {/* Dot indicators – mobile only */}
              <div className="flex justify-center gap-2 mt-5">
                {Array.from({ length: DIVISIONS_COUNT }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const el = divisionsSliderRef.current
                      if (el) el.scrollTo({ left: i * (DIVISIONS_CARD_WIDTH + CARD_GAP), behavior: 'smooth' })
                    }}
                    aria-label={`Division ${i + 1}`}
                    className={`size-2.5 rounded-full transition-colors ${i === divisionsActiveIndex ? 'bg-black' : 'bg-black/30'}`}
                  />
                ))}
              </div>
            </div>
          </div>

        </section>

        <HomeProiecteIndustriale />

        {/* ── CAPACITATE + STUDII DE CAZ – combined section ── */}
        <section className="mb-16 lg:mb-24">
          <div className="flex flex-col items-center text-center mb-2">
            <h2 className="text-black text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Inter'] leading-tight mb-3 uppercase">
              {language.code === 'en' ? 'Case studies' : 'Studii de caz'}
            </h2>
            <p className="text-gray-600 text-base lg:text-lg font-normal font-['Inter'] leading-7 max-w-[580px]">
              {language.code === 'en'
                ? 'LithTech BESS energy storage solutions deployed in industrial energy projects across Romania and Europe.'
                : 'Soluții de stocare a energiei BESS LithTech implementate în proiecte energetice industriale în România și Europa.'}
            </p>
          </div>
          <HomeInstalledCapacityCounters tr={tr} />
          <HomeCaseStudiesPreview />
        </section>

        {/* ── LITHTECH ── */}
        <section className="mb-16 lg:mb-24">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-y-8 gap-x-6 lg:gap-x-4 lg:gap-y-10 items-start lg:items-center">
            {/* Left: text – 6 cols (on mobile: centered, gap-4 like reduceri) */}
            <div className="flex flex-col gap-4 order-1 lg:order-1 lg:col-span-6 text-center lg:text-left items-center lg:items-stretch w-full">
              <h2 className="text-black text-2xl sm:text-3xl font-bold font-['Inter'] leading-9 sm:leading-10 max-w-96 my-6 sm:my-8">
                {tr.lithtechTitle}
              </h2>
              <p className="text-black text-base sm:text-lg font-normal font-['Inter'] leading-5 sm:leading-6 max-w-[482px] whitespace-pre-line">
                {tr.lithtechBody}
              </p>
              <Link
                to="/parteneriat-strategic-lithtech-baterino"
                className="hidden lg:inline-flex w-fit h-12 px-6 bg-white rounded-[10px] outline outline-1 outline-zinc-300 justify-center items-center text-black text-sm font-bold font-['Inter'] uppercase hover:bg-neutral-50 active:bg-neutral-100 transition-colors mt-2"
              >
                {tr.lithtechPartnershipLink}
              </Link>
            </div>

            {/* Cards – each 3 cols, desktop only */}
            {/* Left card – LithTech */}
            <div className="hidden lg:block order-1 lg:order-2 lg:col-span-3 h-96 relative rounded-[10px] overflow-hidden bg-zinc-300 shadow-md group">
              <img
                src="/images/home/lithtech-importator-baterino.jpg"
                alt={tr.lithtechImgAltLithTech}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-0"
              />
              <div className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/25 z-[1]" />
              <div className="absolute left-[18px] bottom-8 w-60 h-16 z-10">
                <img
                  src="/images/shared/lithtech-logo-white.png"
                  alt="LithTech"
                  className="w-28 h-5 left-[60px] top-0 absolute object-contain object-left"
                />
                <div className="w-60 h-10 left-0 top-[30px] absolute flex items-center justify-center text-white text-xl font-bold font-['Inter'] leading-10">
                  {tr.lithtechCardProduces}
                </div>
              </div>
            </div>
            {/* Right card – Baterino */}
            <div className="hidden lg:block order-1 lg:order-3 lg:col-span-3 h-96 relative rounded-[10px] overflow-hidden bg-zinc-300 shadow-md group">
              <img
                src="/images/home/importatori-lithtech.jpg"
                alt={tr.lithtechImgAltBaterino}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-0"
              />
              <div className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/25 z-[1]" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-8 w-48 h-16 z-10">
                <img
                  src="/images/shared/baterino-logo-white.png"
                  alt="Baterino"
                  className="w-24 h-5 left-1/2 -translate-x-1/2 top-0 absolute object-contain"
                />
                <div className="w-48 left-0 right-0 top-[26px] absolute flex items-center justify-center text-center text-white text-xl font-bold font-['Inter'] leading-10">
                  {tr.lithtechCardImplements}
                </div>
              </div>
            </div>
            {/* Mobile: 2 image cards – hidden on desktop */}
            <div className="flex flex-col gap-6 lg:hidden order-2 w-full">
              {/* Card A – LithTech */}
              <div className="w-full max-w-[24rem] h-60 relative rounded-[10px] overflow-hidden bg-zinc-300 shadow-md mx-auto">
                <img
                  src="/images/home/parteneriat-lithtech-baterino1-mobile.jpg"
                  alt={tr.lithtechImgAltLithTech}
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="absolute inset-0 bg-black/40 z-[1]" />
                <img
                  src="/images/shared/lithtech-logo-white.png"
                  alt="LithTech"
                  className="absolute w-36 h-6 left-1/2 -translate-x-1/2 top-[149px] object-contain z-10"
                />
                <h3 className="absolute w-64 sm:w-72 left-1/2 -translate-x-1/2 top-[165px] sm:top-[177px] flex justify-center items-center text-white text-xl sm:text-2xl font-bold font-['Inter'] leading-8 sm:leading-10 z-10 text-center px-2">
                  {tr.lithtechCardProduces}
                </h3>
              </div>
              {/* Card B – Baterino */}
              <div className="w-full max-w-[24rem] h-60 relative rounded-[10px] overflow-hidden bg-zinc-300 shadow-md mx-auto">
                <img
                  src="/images/home/parteneriat-lithtech-baterino2-mobile.jpg"
                  alt={tr.lithtechImgAltBaterino}
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="absolute inset-0 bg-black/40 z-[1]" />
                <img
                  src="/images/shared/baterino-logo-white.png"
                  alt="Baterino"
                  className="absolute w-28 h-5 left-1/2 -translate-x-1/2 top-[165px] object-contain z-10"
                />
                <h3 className="absolute w-44 sm:w-52 left-1/2 -translate-x-1/2 top-[175px] sm:top-[187px] flex justify-center items-center text-white text-xl sm:text-2xl font-bold font-['Inter'] leading-8 sm:leading-10 z-10 text-center">
                  {tr.lithtechCardImplements}
                </h3>
              </div>
              <Link
                to="/parteneriat-strategic-lithtech-baterino"
                className="w-full max-w-[24rem] mx-auto h-12 sm:h-14 bg-white rounded-[10px] flex items-center justify-center text-black text-sm sm:text-base font-bold font-['Inter'] uppercase outline outline-1 outline-zinc-300 hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
              >
                {tr.lithtechPartnershipLink}
              </Link>
            </div>
          </div>
        </section>

        {/* ── RESPONSABILITATE & COMUNITATE ── */}
        <section className="mb-16 lg:mb-24">
          <section className="lg:hidden flex flex-col items-center text-center mb-8">
            <h2 className="text-black text-2xl sm:text-3xl font-bold font-['Inter'] leading-9 sm:leading-10 my-4">
              {tr.divisionsSectionTitle}
            </h2>
            <p className="text-gray-700 text-sm sm:text-base font-medium font-['Inter'] leading-6 sm:leading-7 mb-6">
              {renderBaterinoGlobalLink(tr.divisionsSectionBody)}
            </p>
            <div className="flex items-center gap-4 sm:gap-6 p-4 rounded-[10px] bg-neutral-100 mb-6 w-full max-w-md">
              <img src="/images/home/harta-romania.png" alt="" aria-hidden loading="lazy" className="w-32 sm:w-40 h-32 sm:h-40 shrink-0 object-contain" />
              <h3 className="text-black text-lg sm:text-xl font-bold font-['Inter'] leading-tight text-left min-w-0 flex-1">{tr.netTitle}</h3>
            </div>
            <Link to="/companie/viziune" className="w-fit h-11 sm:h-12 px-4 sm:px-5 py-[5px] rounded-[10px] outline outline-1 outline-zinc-300 inline-flex justify-center items-center whitespace-nowrap hover:bg-neutral-100 transition-colors">
              <span className="text-black text-sm sm:text-base font-semibold font-['Inter'] uppercase">{tr.divisionsSectionBtn}</span>
            </Link>
          </section>
          <div className="hidden lg:grid grid-cols-12 gap-x-4 gap-y-10">
            <div className="col-span-6 flex flex-col pt-5 pb-4">
              <h2 className="text-black text-3xl font-bold font-['Inter'] leading-10 my-5 max-w-[513px]">{tr.divisionsSectionTitle}</h2>
              <p className="text-gray-700 text-lg font-medium font-['Inter'] leading-8 mb-8 max-w-[483px]">{renderBaterinoGlobalLink(tr.divisionsSectionBody)}</p>
              <Link to="/companie/viziune" className="w-fit h-12 px-5 py-[5px] rounded-[10px] outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex justify-center items-center whitespace-nowrap hover:bg-neutral-100 transition-colors">
                <span className="text-black text-base font-semibold font-['Inter']">{tr.divisionsSectionBtn}</span>
              </Link>
            </div>
            <div className="col-span-6 w-full max-w-[578px] h-96 relative flex items-center justify-start">
              <div className="absolute inset-0 bg-neutral-100 rounded-[10px]" />
              <div className="relative z-10 flex items-center justify-start gap-8 w-full pl-0 pr-5">
                <img className="size-80 shrink-0 object-contain" src="/images/home/harta-romania.png" alt="" aria-hidden loading="lazy" />
                <div className="flex flex-col gap-4">
                  <p className="text-black text-3xl font-bold font-['Inter'] leading-9">{tr.netTitle}</p>
                  <p className="text-black text-base font-normal font-['Inter'] leading-5 max-w-[256px]">{tr.netBody}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA BAR ── */}
        <CTABar
          logo="/images/shared/baterino-logo-black.svg"
          logoAlt="Baterino"
          title={tr.ctaTitle}
          desc={tr.ctaDesc}
          btn1Label={tr.ctaBtn1}
          btn1To="/produse"
          btn2Label={tr.ctaBtn2}
          btn2To="/instalatori"
        />

      </div>

      {showWelcomeModal && (
        <WelcomeModal
          onClose={closeWelcomeModal}
          onProfesionist={handleWelcomeProfesionist}
          tr={tr}
        />
      )}

      <HomePromoModal
        open={showPromoModal}
        onClose={() => {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(PROMO_MODAL_STORAGE_KEY, '1')
          }
          setShowPromoModal(false)
        }}
        tr={tr}
      />
    </>
  )
}
