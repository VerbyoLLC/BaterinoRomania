import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useCatalogCurrency } from '../contexts/CatalogCurrencyContext'

import { getHomeTranslations } from '../i18n/home'
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
import CTABar from '../components/CTABar'
import HomeHeroV2 from '../components/home/HomeHeroV2'
import HomeInverterSearch from '../components/home/HomeInverterSearch'
import HomeFeaturesGrid from '../components/home/HomeFeaturesGrid'
import HomeInstalledCapacityCounters from '../components/home/HomeInstalledCapacityCounters'
import {
  CatalogProductCardSkeleton,
  IndustrialCatalogProductCard,
  ResidentialCatalogProductCard,
} from '../components/product/CatalogProductCard'

function renderBold(text: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
  )
}

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
  const tr = getHomeTranslations(language.code)

  const [activeTab,  setActiveTab]  = useState<string>('rezidential')
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
    return filtered.slice(0, 3)
  }, [products, activeTab])

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
        title={tr.seoTitle}
        description={tr.seoDesc}
        canonical="/"
        ogImage="/images/home/og-baterino-romania.jpg"
        lang={language.code}
      />

      <div className="pt-6 lg:pt-10">
        <HomeHeroV2 tr={tr} userType={userType} />
      </div>

      <div className="max-w-content mx-auto px-5 lg:px-3 pb-24">
        {/* ── PRODUCTS ── */}
        <section id="produse-section" className="mb-0">
          <h2 className="text-center text-black text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Inter'] mt-6 sm:mt-8 lg:mt-10 mb-4 sm:mb-5">
            {tr.productsSectionTitle}
          </h2>

          <div className="flex justify-center mb-6 sm:mb-8 lg:mb-10">
            <HomeInverterSearch placeholder={tr.heroV2InverterSearchPlaceholder} />
          </div>

          {/* Filters left + Vezi tot right */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 lg:mb-10">
            <div
              className="flex flex-col sm:flex-row sm:flex-wrap gap-2 lg:gap-3"
              role="group"
              aria-label={tr.productsSectionTitle}
            >
              {(isMobile ? tabs.filter((t) => ['rezidential', 'industrial', 'medical'].includes(t.id)) : tabs).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-pressed={activeTab === tab.id}
                  aria-label={tab.label}
                  className={`h-12 sm:h-10 px-5 rounded-[10px] text-sm font-semibold font-['Inter'] uppercase transition-all duration-200 border-2 sm:w-auto ${
                    isMobile ? 'w-full max-w-xs' : ''
                  } ${
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="hidden sm:flex flex-wrap gap-2 self-end sm:self-auto sm:ml-auto sm:flex-shrink-0">
              <Link
                to="/produse"
                className="inline-flex items-center justify-center h-10 px-6 bg-slate-900 text-white rounded-[10px] font-semibold font-['Inter'] text-sm hover:bg-slate-700 transition-colors"
              >
                {tr.productsViewAll}
              </Link>
            </div>
          </div>

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
                  ? undefined
                  : stockListingCta || residentialPartnerPriceCta
                    ? undefined
                    : formatResidentialCatalogPriceDisplay(p, language.code, currency)
              const to = `/produse/${p.slug || p.id}`
              const linkState = { tipProdus: p.tipProdus }
              const common = {
                density: 'home' as const,
                imageSrc: img,
                imageAlt: p.title,
                title: p.title,
                specLine1,
                specLine2,
                to,
                linkState,
                imageLoadingPlaceholder: true,
                priceDisplay,
              }
              const industrialSubtitle = String(p.subtitle || '').trim() || undefined
              const showResPriceExtras =
                priceDisplay != null &&
                priceDisplay !== '' &&
                (residentialPartnerPriceCta == null || String(residentialPartnerPriceCta).trim() === '')
              return p.tipProdus === 'industrial' ? (
                <IndustrialCatalogProductCard
                  key={p.id}
                  {...common}
                  subtitle={industrialSubtitle}
                  ctaLabel={tr.disponibilPentruParteneri}
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
                      ? tr.catalogIncludesVatWithPct.replace('{pct}', getResidentialCatalogVatPercentLabel(p))
                      : null
                  }
                />
              )
            })
            )}
          </div>

          {/* Vezi toate produsele – mobile only, under products */}
          <div className="flex justify-center sm:hidden mb-10">
            <Link
              to="/produse"
              className="inline-flex items-center justify-center h-12 px-8 bg-slate-900 text-white rounded-[10px] font-semibold font-['Inter'] text-sm hover:bg-slate-700 transition-colors"
            >
              {tr.productsViewAll}
            </Link>
          </div>
        </section>

      </div>

      <HomeFeaturesGrid tr={tr} />

      {/* ── REDUCERI – Programe de reduceri ── */}
      <section className="mb-0 max-w-content mx-auto px-5 lg:px-3">
        <div className="flex flex-col gap-4 my-6 sm:my-8 text-center sm:text-left items-center sm:items-stretch">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 w-full">
            <h2 className="text-black text-2xl sm:text-3xl font-bold font-['Inter'] leading-9 sm:leading-10">
              {tr.reduceriGridTitle}
            </h2>
            <Link
              to="/reduceri"
              className="hidden lg:inline-flex items-center justify-center h-10 px-6 bg-slate-900 text-white rounded-[10px] font-semibold font-['Inter'] text-sm hover:bg-slate-700 transition-colors shrink-0"
            >
              {tr.reduceriViewAll}
            </Link>
          </div>
          <p className="text-black text-base sm:text-lg font-normal font-['Inter'] leading-5 sm:leading-6 max-w-[846px]">
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
                <div className="absolute top-3 right-3 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/95 rounded-[5px] z-10">
                  <span className="text-slate-900 text-xs sm:text-sm font-bold font-['Inter']">{card.pct} {tr.reduceriDiscountSuffix}</span>
                </div>
                <div className="absolute left-[20px] sm:left-[26px] right-[20px] sm:right-[26px] bottom-[20px] sm:bottom-[24px] z-10 flex flex-col gap-2 sm:gap-3">
                  <p className="text-white text-sm sm:text-base font-medium font-['Nunito_Sans'] leading-5 sm:leading-6">{tr.reduceriProgramLabel}</p>
                  <h3 className="text-white text-xl sm:text-2xl font-bold font-['Inter'] leading-7 sm:leading-8 whitespace-pre-line">
                    {card.title}
                  </h3>
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

      <hr className="border-gray-200 my-16 lg:my-24 w-full lg:max-w-[1100px] lg:mx-auto" />

      <div className="max-w-content mx-auto px-5 lg:px-3 pb-24">

        {/* ── RESPONSABILITATE & COMUNITATE ── */}
        <section className="mb-16 lg:mb-24">
          {/* ── Mobile: Responsabilitate + map ── */}
          <section className="lg:hidden flex flex-col items-center text-center mb-8">
            <h2 className="text-black text-2xl sm:text-3xl font-bold font-['Inter'] leading-9 sm:leading-10 my-4">
              {tr.divisionsSectionTitle}
            </h2>
            <p className="text-gray-700 text-sm sm:text-base font-medium font-['Inter'] leading-6 sm:leading-7 mb-6">
              {renderBaterinoGlobalLink(tr.divisionsSectionBody)}
            </p>
            <div className="flex items-center gap-4 sm:gap-6 p-4 rounded-[10px] bg-neutral-100 mb-6 w-full max-w-md">
              <img src="/images/home/harta-romania.png" alt="" aria-hidden className="w-32 sm:w-40 h-32 sm:h-40 shrink-0 object-contain" />
              <h3 className="text-black text-lg sm:text-xl font-bold font-['Inter'] leading-tight text-left min-w-0 flex-1">{tr.netTitle}</h3>
            </div>
            <Link
              to="/companie/viziune"
              className="w-fit h-11 sm:h-12 px-4 sm:px-5 py-[5px] rounded-[10px] outline outline-1 outline-zinc-300 inline-flex justify-center items-center whitespace-nowrap hover:bg-neutral-100 transition-colors"
            >
              <span className="text-black text-sm sm:text-base font-semibold font-['Inter'] uppercase">{tr.divisionsSectionBtn}</span>
            </Link>
          </section>

          {/* ── Desktop grid ── */}
          <div className="hidden lg:grid grid-cols-12 gap-x-4 gap-y-10">
            <div className="col-span-6 flex flex-col pt-5 pb-4">
              <h2 className="text-black text-3xl font-bold font-['Inter'] leading-10 my-5 max-w-[513px]">
                {tr.divisionsSectionTitle}
              </h2>
              <p className="text-gray-700 text-lg font-medium font-['Inter'] leading-8 mb-8 max-w-[483px]">
                {renderBaterinoGlobalLink(tr.divisionsSectionBody)}
              </p>
              <Link
                to="/companie/viziune"
                className="w-fit h-12 px-5 py-[5px] rounded-[10px] outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex justify-center items-center whitespace-nowrap hover:bg-neutral-100 transition-colors"
              >
                <span className="text-black text-base font-semibold font-['Inter']">
                  {tr.divisionsSectionBtn}
                </span>
              </Link>
            </div>

            <div className="col-span-6 w-full max-w-[578px] h-96 relative flex items-center justify-start">
              <div className="absolute inset-0 bg-neutral-100 rounded-[10px]" />
              <div className="relative z-10 flex items-center justify-start gap-8 w-full pl-0 pr-5">
                <img
                  className="size-80 shrink-0 object-contain"
                  src="/images/home/harta-romania.png"
                  alt=""
                  aria-hidden
                />
                <div className="flex flex-col gap-4">
                  <p className="text-black text-3xl font-bold font-['Inter'] leading-9">
                    {tr.netTitle}
                  </p>
                  <p className="text-black text-base font-normal font-['Inter'] leading-5 max-w-[256px]">
                    {tr.netBody}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── DIVIZIILE BATERINO ── */}
        <section className="mb-16 lg:mb-24">
          <div>
            <h2 className="text-black text-2xl sm:text-3xl font-bold font-['Inter'] leading-9 sm:leading-10 my-4 text-center lg:text-left">
              {tr.diviziileNoastreTitle}
            </h2>
            <p className="text-gray-700 text-base sm:text-lg font-medium font-['Inter'] leading-6 sm:leading-8 mb-6 sm:mb-8 max-w-[894px] text-center lg:text-left mx-auto lg:mx-0">
              {tr.diviziileNoastreSubtitle}
            </p>

            {/* Desktop: 4 cards in grid */}
            <div className="hidden lg:grid grid-cols-4 gap-6">
              <Link to="/divizii/rezidential" className="h-[450px] relative rounded-[10px] overflow-hidden bg-zinc-300 group block">
                <img src="/images/home/rezidential-baterii-lifepo4.jpg" alt={tr.divRezTitle} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40" />
                <img src="/images/shared/baterino-logo-white.png" alt="Baterino" className="absolute top-6 right-6 h-6 w-auto object-contain" />
                <div className="absolute bottom-6 left-[21px]">
                  <p className="text-white text-3xl font-bold font-['Inter'] leading-9 mb-1">{tr.divRezTitle}</p>
                  <p className="text-white text-base font-medium font-['Inter'] leading-5 max-w-[240px]">{tr.divRezDesc}</p>
                </div>
              </Link>
              <Link to="/divizii/industrial" className="h-[450px] relative rounded-[10px] overflow-hidden bg-zinc-300 group block">
                <img src="/images/home/industrial-baterii-lifepo4.jpg" alt={tr.divIndTitle} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40" />
                <img src="/images/shared/baterino-pro-industrial-logo.png" alt="Baterino Industrial" className="absolute top-5 right-6 h-6 w-auto object-contain" />
                <div className="absolute bottom-6 left-[22px]">
                  <p className="text-white text-3xl font-bold font-['Inter'] leading-9 mb-1">{tr.divIndTitle}</p>
                  <p className="text-white text-base font-medium font-['Inter'] leading-5 max-w-[224px]">{tr.divIndDesc}</p>
                </div>
              </Link>
              <Link to="/divizii/medical" className="h-[450px] relative rounded-[10px] overflow-hidden bg-zinc-300 group block">
                <img src="/images/home/medical-baterii-lifepo4.jpg" alt={tr.divMedTitle} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40" />
                <img src="/images/shared/baterino-medical-logo-white.png" alt="Baterino Medical" className="absolute top-6 right-6 h-6 w-auto object-contain" />
                <div className="absolute bottom-6 left-[18px]">
                  <p className="text-white text-3xl font-bold font-['Inter'] leading-9 mb-1">{tr.divMedTitle}</p>
                  <p className="text-white text-base font-medium font-['Inter'] leading-5 max-w-[240px]">{tr.divMedDesc}</p>
                </div>
              </Link>
              <Link to="/divizii/maritim" className="h-[450px] relative rounded-[10px] overflow-hidden bg-zinc-300 group block">
                <img src="/images/home/maritim-baterii-lifepo4.jpg" alt={tr.divMarTitle} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40" />
                <img src="/images/shared/baterino-maritim-logo-white.png" alt="Baterino Maritim" className="absolute top-6 right-6 h-6 w-auto object-contain" />
                <div className="absolute bottom-6 left-[31px]">
                  <p className="text-white text-3xl font-bold font-['Inter'] leading-9 mb-1">{tr.divMarTitle}</p>
                  <p className="text-white text-base font-medium font-['Inter'] leading-5 max-w-[256px]">{tr.divMarDesc}</p>
                </div>
              </Link>
            </div>

            {/* Mobile: slider */}
            <div className="lg:hidden">
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
                      <img src={d.img} alt={d.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40" />
                      <img src={d.logo} alt="" className="absolute top-5 sm:top-6 right-5 sm:right-6 h-5 sm:h-6 w-auto object-contain" />
                      <div className="absolute bottom-5 sm:bottom-6 left-[16px] sm:left-[21px]">
                        <h3 className="text-white text-2xl sm:text-3xl font-bold font-['Inter'] leading-8 sm:leading-9 mb-1">{d.title}</h3>
                        <p className="text-white text-sm sm:text-base font-medium font-['Inter'] leading-4 sm:leading-5 max-w-[220px] sm:max-w-[240px]">{d.desc}</p>
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

        <HomeInstalledCapacityCounters tr={tr} />

        {/* ── LITHTECH ── */}
        <section className="mb-16 lg:mb-24">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-y-8 gap-x-6 lg:gap-x-4 lg:gap-y-10 items-start">
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
    </>
  )
}
