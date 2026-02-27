import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

import { getHomeTranslations } from '../i18n/home'
import { PRODUCTS } from '../i18n/produse'
import SEO from '../components/SEO'
import CTABar from '../components/CTABar'

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

const LOCALE_BY_LANG: Record<string, string> = { ro: 'ro-RO', en: 'en-US', zh: 'zh-CN' }

/* ── Mini product card for featured products ─────────────────── */
function HomeProductCard({
  name, image, spec1, spec2, price, includesTVA, locale = 'ro-RO',
}: {
  name: string
  image: string
  spec1: string
  spec2: string
  price: number
  includesTVA: string
  locale?: string
}) {
  return (
    <div className="flex flex-col items-center bg-neutral-100 rounded-[10px] px-6 pt-8 pb-6 transition-shadow duration-300 hover:shadow-md">
      <img
        src={image}
        alt={name}
        className="w-28 h-36 object-contain mb-5"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
      />
      <h3 className="text-center text-black text-lg font-bold font-['Inter'] leading-snug mb-3">
        {name}
      </h3>
      <p className="text-neutral-950 text-sm font-normal font-['Nunito_Sans'] leading-6">{spec1}</p>
      <p className="text-neutral-950 text-sm font-normal font-['Nunito_Sans'] leading-6 mb-4">{spec2}</p>
      <p className="text-sky-950 text-xl font-bold font-['Inter']">
        {price.toLocaleString(locale)} RON
      </p>
      <p className="text-neutral-800 text-xs font-medium font-['Nunito_Sans']">{includesTVA}</p>
    </div>
  )
}

/* ── Division card ───────────────────────────────────────────── */
function DivisionCard({
  image, title, to, className = '',
}: {
  image: string
  title: string
  to: string
  className?: string
}) {
  return (
    <Link
      to={to}
      className={`group relative rounded-[10px] overflow-hidden bg-neutral-100 block transition-shadow duration-300 hover:shadow-md ${className}`}
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
      />
      <div className="absolute inset-0 bg-black/35 group-hover:bg-black/25 transition-colors duration-300" />
      <img
        src="/images/shared/baterino-logo-white.png"
        alt="Baterino"
        className="absolute top-4 right-4 h-5 w-auto object-contain"
      />
      <div className="absolute bottom-4 left-4">
        <span className="block text-white text-sm font-bold font-['Inter'] tracking-wider">
          {title}
        </span>
      </div>
    </Link>
  )
}

/* ── Page ────────────────────────────────────────────────────── */
export default function Home() {
  const { language } = useLanguage()
  const tr = getHomeTranslations(language.code)

  const [activeTab,  setActiveTab]  = useState<string>('all')
  const [heroSlide,  setHeroSlide]  = useState(0)
  const [reduceriVisibleCount, setReduceriVisibleCount] = useState(2)
  const [isMobile, setIsMobile] = useState(true)
  const [featuresActiveIndex, setFeaturesActiveIndex] = useState(0)

  const [divisionsActiveIndex, setDivisionsActiveIndex] = useState(0)
  const divisionsSliderRef = useRef<HTMLDivElement>(null)

  const [heroMobileActiveIndex, setHeroMobileActiveIndex] = useState(0)
  const heroMobileSliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const HERO_SLIDES = [
    { label: tr.heroSliderRez, image: '/images/home/slider-apple/slide1-baterii-rezidential.jpg' },
    { label: tr.heroSliderInd, image: '/images/home/slider-apple/slide2-baterii-industrial.jpg' },
    { label: tr.heroSliderMed, image: '/images/home/slider-apple/slide3-baterii-medical.jpg' },
    { label: tr.heroSliderInst, image: '/images/home/slider-apple/slide4-instalatori.jpg' },
  ]

  const HERO_MOBILE_SLIDES = [
    { label: tr.heroSliderRez, image: '/images/home/slider-1-mobile.jpg' },
    { label: tr.heroSliderInd, image: '/images/home/slider-2-mobile.jpg' },
    { label: tr.heroSliderMed, image: '/images/home/slider-3-mobile.jpg' },
  ]
  const HERO_MOBILE_COUNT = 3
  const HERO_MOBILE_CARD_WIDTH = 324
  const featuresSliderRef = useRef<HTMLDivElement>(null)
  const FEATURES_COUNT = 7
  const FEATURES_CARD_WIDTH = 324
  const CARD_GAP = 10
  const DIVISIONS_COUNT = 4
  const DIVISIONS_CARD_WIDTH = 324

  useEffect(() => {
    const el = featuresSliderRef.current
    if (!el) return
    const onScroll = () => {
      const index = Math.round(el.scrollLeft / (FEATURES_CARD_WIDTH + CARD_GAP))
      setFeaturesActiveIndex(Math.min(Math.max(0, index), FEATURES_COUNT - 1))
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

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

  useEffect(() => {
    const el = heroMobileSliderRef.current
    if (!el) return
    const onScroll = () => {
      const index = Math.round(el.scrollLeft / (HERO_MOBILE_CARD_WIDTH + CARD_GAP))
      setHeroMobileActiveIndex(Math.min(Math.max(0, index), HERO_MOBILE_COUNT - 1))
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  function slideFeatures(dir: 'left' | 'right') {
    if (!featuresSliderRef.current) return
    const cardWidth = featuresSliderRef.current.firstElementChild
      ? (featuresSliderRef.current.firstElementChild as HTMLElement).offsetWidth + CARD_GAP
      : featuresSliderRef.current.offsetWidth / 3
    featuresSliderRef.current.scrollBy({ left: dir === 'right' ? cardWidth : -cardWidth, behavior: 'smooth' })
  }

  function slideDivisions(dir: 'left' | 'right') {
    if (!divisionsSliderRef.current) return
    const cardWidth = DIVISIONS_CARD_WIDTH + CARD_GAP
    divisionsSliderRef.current.scrollBy({ left: dir === 'right' ? cardWidth : -cardWidth, behavior: 'smooth' })
  }

  const featuredProducts = useMemo(() => {
    if (activeTab === 'all') return PRODUCTS.slice(0, 3)
    return PRODUCTS.filter((p) => p.sector.includes(activeTab)).slice(0, 3)
  }, [activeTab])

  const tabs = [
    { id: 'all',         label: tr.productsTabAll },
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
        ogImage="/images/home/hero-card.jpg"
        lang={language.code}
      />

      <div className="max-w-content mx-auto px-5 lg:px-3 pt-6 lg:pt-10 pb-24">

        {/* ── HERO ── */}
        <section className="mb-16 lg:mb-24">
          {/* Mobile: horizontal slider (like diviziile baterino) */}
          <div className="lg:hidden">
            <div className="-mx-5 w-[calc(100%+2.5rem)]">
              <div
                ref={heroMobileSliderRef}
                className="flex gap-[10px] overflow-x-auto scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pl-5 pr-5"
                style={{
                  scrollPaddingLeft: 'max(10px, calc(50vw - 162px))',
                  scrollPaddingRight: 'max(10px, calc(50vw - 162px))',
                }}
              >
                {HERO_MOBILE_SLIDES.map((slide, i) => (
                  <div
                    key={slide.image}
                    className="relative flex-shrink-0 w-[324px] h-[466px] rounded-[10px] overflow-hidden bg-zinc-300 snap-center"
                  >
                    <img
                      src={slide.image}
                      alt={`Baterii LiFePO4 – ${slide.label}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    {i === 0 && (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-72 h-44 text-center">
                        <div className="w-full h-28 text-white text-2xl font-bold font-['Inter'] uppercase leading-8">
                          Sisteme de stocare a energiei cu baterii LiFePO4
                        </div>
                        <div className="w-full h-14 text-white text-lg font-bold font-['Inter'] leading-7">
                          Pentru locuințe individuale și micro-grid-uri.
                        </div>
                      </div>
                    )}
                    {i === 1 && (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-72 h-52 text-center">
                        <div className="w-full h-28 text-white text-2xl font-bold font-['Inter'] uppercase leading-8">
                          Soluții BESS pentru stocare de energie la nivel MW
                        </div>
                        <div className="w-full h-20 text-white text-xl font-bold font-['Inter'] leading-7">
                          Proiecte integrate pentru industrie și parcuri fotovoltaice.
                        </div>
                      </div>
                    )}
                    {i === 2 && (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-72 h-52 text-center">
                        <div className="w-full h-28 text-white text-2xl font-bold font-['Inter'] uppercase leading-8">
                          Soluții BESS pentru infrastructura medicala critica
                        </div>
                        <div className="w-full h-20 text-white text-lg font-bold font-['Inter'] leading-6">
                          Pentru clinici de imagistică, stomatologie, centre de transfuzie și spitale.
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div aria-hidden style={{ flexShrink: 0, width: 'var(--grid-edge)' }} />
              </div>
            </div>
            {/* Dot indicators – mobile only */}
            <div className="flex justify-center gap-2 mt-5">
              {Array.from({ length: HERO_MOBILE_COUNT }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    const el = heroMobileSliderRef.current
                    if (el) el.scrollTo({ left: i * (HERO_MOBILE_CARD_WIDTH + CARD_GAP), behavior: 'smooth' })
                  }}
                  aria-label={`Slide ${i + 1}`}
                  className={`size-2.5 rounded-full transition-colors ${i === heroMobileActiveIndex ? 'bg-black' : 'bg-black/30'}`}
                />
              ))}
            </div>
          </div>

          {/* Desktop: crossfade hero with tabs */}
          <div className="hidden lg:block relative rounded-[10px] overflow-hidden h-[600px] w-full bg-zinc-300">
            {/* Slide images – crossfade */}
            {HERO_SLIDES.map((slide, i) => (
              <img
                key={slide.image}
                src={slide.image}
                alt={`Baterii LiFePO4 – ${slide.label}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  heroSlide === i ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}

            {/* Bottom gradient for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent" />


            {/* ── Slide tab bar – top center ── */}
            <div className="hidden lg:block absolute top-8 left-1/2 -translate-x-1/2 w-[793px] max-w-[calc(100%-4.5rem)]">
              <div className="relative h-10 rounded-[20px] overflow-hidden">
                {/* White frosted glass background */}
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" />
                {/* Permanent black pill locked to INSTALATORI slot – hidden when it's the active tab */}
                <div
                  className={`absolute top-0 h-10 rounded-[20px] bg-black transition-opacity duration-300 ${
                    heroSlide === 3 ? 'opacity-0' : 'opacity-100'
                  }`}
                  style={{ width: '25%', transform: 'translateX(300%)' }}
                />
                {/* Sliding white pill – always tracks the active tab */}
                <div
                  className="absolute top-0 h-10 rounded-[20px] bg-white transition-transform duration-300 ease-in-out"
                  style={{ width: '25%', transform: `translateX(${heroSlide * 100}%)` }}
                />
                <div className="relative flex h-full">
                  {HERO_SLIDES.map((slide, i) => (
                    <button
                      key={slide.label}
                      type="button"
                      onClick={() => setHeroSlide(i)}
                      className={`flex-1 text-sm font-semibold font-['Inter'] uppercase transition-colors duration-300 ${
                        heroSlide === i
                          ? 'text-black'
                          : i === 3
                            ? 'text-white'
                            : 'text-black/60 hover:text-black'
                      }`}
                    >
                      {slide.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Bottom content – per-slide ── */}
            <div className="absolute bottom-14 left-14 right-14 flex flex-col items-center lg:items-stretch">

              {/* REZIDENTIAL slide content – slide 0 */}
              {heroSlide === 0 && (
                <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8 text-center lg:text-left w-full">
                  {/* Left: logo + headline + description */}
                  <div className="flex flex-col gap-3 items-center lg:items-start">
                    <h1 className="text-white text-3xl font-bold font-['Inter'] uppercase leading-10 max-w-[510px] whitespace-pre-line">
                      {tr.heroSlideRezTitle}
                    </h1>
                    <p className="text-white text-lg font-normal font-['Inter'] leading-7 max-w-[612px]">
                      {renderBold(tr.heroSlideRezDesc)}
                    </p>
                  </div>

                  {/* Right: CTA + Powered by */}
                  <div className="hidden lg:flex flex-col items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() =>
                        document.getElementById('produse-section')?.scrollIntoView({ behavior: 'smooth' })
                      }
                      className="w-60 h-12 bg-white rounded-[10px] outline outline-1 outline-zinc-300 inline-flex justify-center items-center text-black text-base font-semibold font-['Inter'] transition-all duration-150 hover:bg-neutral-100 hover:scale-105 active:scale-95 active:bg-neutral-200 whitespace-nowrap"
                    >
                      {tr.heroCardCta}
                    </button>
                    <div className="flex items-center gap-2 opacity-50 p-[5px]">
                      <span className="text-white text-xs font-normal font-['Inter'] leading-5">{tr.poweredBy}</span>
                      <img
                        src="/images/shared/lithtech-logo-white.png"
                        alt="LithTech"
                        className="h-5 w-auto object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* INDUSTRIAL slide content – slide 1 */}
              {heroSlide === 1 && (
                <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8 text-center lg:text-left w-full">
                  <div className="flex flex-col gap-3 items-center lg:items-start">
                    <img
                      src="/images/divizii/industrial/baterino-pro-industrial-logo-white.png"
                      alt="Baterino Industrial"
                      className="h-6 w-auto object-contain object-center lg:object-left"
                    />
                    <h1 className="text-white text-3xl font-bold font-['Inter'] uppercase leading-10 max-w-[612px]">
                      {tr.heroSlideIndTitle}
                    </h1>
                    <p className="text-white text-xl font-['Inter'] leading-8 max-w-[612px]">
                      {renderBold(tr.heroSlideIndDesc)}
                    </p>
                  </div>
                  <div className="hidden lg:flex flex-col items-center gap-3 flex-shrink-0">
                    <Link
                      to="/companie"
                      className="w-60 h-12 bg-white rounded-[10px] outline outline-1 outline-zinc-300 inline-flex justify-center items-center text-black text-base font-semibold font-['Inter'] transition-all duration-150 hover:bg-neutral-100 hover:scale-105 active:scale-95 active:bg-neutral-200 whitespace-nowrap"
                    >
                      {tr.heroSlideIndCta}
                    </Link>
                    <div className="flex items-center gap-2 opacity-50 p-[5px]">
                      <span className="text-white text-xs font-normal font-['Inter'] leading-5">{tr.poweredBy}</span>
                      <img src="/images/shared/lithtech-logo-white.png" alt="LithTech" className="h-5 w-auto object-contain" />
                    </div>
                  </div>
                </div>
              )}

              {/* Default content – slide 4 (INSTALATORI) */}
              {heroSlide === 3 && (
                <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8 text-center lg:text-left w-full">
                  <div className="flex flex-col gap-3 items-center lg:items-start">
                    <h1 className="text-white text-3xl font-bold font-['Inter'] leading-10 max-w-[532px] whitespace-pre-line">
                      {tr.heroSlideInstTitle}
                    </h1>
                    <p className="text-white text-xl font-normal font-['Inter'] leading-8 max-w-[690px]">
                      {renderBold(tr.heroSlideInstDesc)}
                    </p>
                  </div>
                  <div className="hidden lg:flex flex-col items-center gap-3 flex-shrink-0">
                    <Link
                      to="/signup/clienti?tab=partener"
                      className="w-60 h-12 px-2.5 py-[5px] bg-white rounded-[10px] outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex justify-center items-center text-black text-base font-semibold font-['Inter'] uppercase hover:bg-neutral-100 transition-colors"
                    >
                      {tr.heroBoxCta}
                    </Link>
                    <div className="flex items-center gap-2 opacity-50 p-[5px]">
                      <span className="text-white text-xs font-normal font-['Inter'] leading-5">
                        {tr.heroSlideInstImportatori}
                      </span>
                      <img
                        src="/images/shared/lithtech-logo-white.png"
                        alt="LithTech"
                        className="h-5 w-auto object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* MEDICAL slide content – slide 2 */}
              {heroSlide === 2 && (
                <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8 text-center lg:text-left w-full">
                  {/* Left: logo + headline + description */}
                  <div className="flex flex-col gap-3 items-center lg:items-start">
                    <img
                      src="/images/divizii/medical/baterino-medical-logo-white.png"
                      alt="Baterino Medical"
                      className="h-6 w-auto object-contain object-center lg:object-left"
                    />
                    <h1 className="text-white text-3xl font-bold font-['Inter'] uppercase leading-10 max-w-[510px]">
                      {tr.heroSlideMedTitle}
                    </h1>
                    <p className="text-white text-lg font-normal font-['Inter'] leading-7 max-w-[612px]">
                      {tr.heroSlideMedDesc}
                    </p>
                  </div>

                  {/* Right: CTA + Powered by */}
                  <div className="hidden lg:flex flex-col items-center gap-3 flex-shrink-0">
                    <Link
                      to="/companie"
                      className="w-60 h-12 bg-white rounded-[10px] outline outline-1 outline-zinc-300 inline-flex justify-center items-center text-black text-base font-semibold font-['Inter'] transition-all duration-150 hover:bg-neutral-100 hover:scale-105 active:scale-95 active:bg-neutral-200 whitespace-nowrap"
                    >
                      {tr.heroSlideMedCta}
                    </Link>
                    <div className="flex items-center gap-2 opacity-50 p-[5px]">
                      <span className="text-white text-xs font-normal font-['Inter'] leading-5">{tr.poweredBy}</span>
                      <img
                        src="/images/shared/lithtech-logo-white.png"
                        alt="LithTech"
                        className="h-5 w-auto object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>

        {/* ── PRODUCTS ── */}
        <section id="produse-section" className="mb-0">
          <h2 className="text-center text-black text-3xl lg:text-4xl font-extrabold font-['Inter'] my-8 lg:my-10">
            {tr.productsSectionTitle}
          </h2>

          {/* Tabs */}
          <div className="flex justify-center gap-3 mb-10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`h-10 px-5 rounded-[10px] text-sm font-semibold font-['Inter'] transition-colors ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-neutral-100 text-black hover:bg-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {featuredProducts.map((p) => (
              <HomeProductCard
                key={p.id}
                name={p.name}
                image={p.image}
                spec1={p.spec1}
                spec2={p.spec2}
                price={p.price}
                includesTVA={tr.includesTVA}
                locale={LOCALE_BY_LANG[language.code] ?? 'ro-RO'}
              />
            ))}
          </div>

          <div className="flex justify-center">
            <Link
              to="/produse"
              className="inline-flex items-center justify-center h-12 px-10 bg-slate-900 text-white rounded-[10px] font-semibold font-['Inter'] text-sm hover:bg-slate-700 transition-colors"
            >
              {tr.productsViewMore}
            </Link>
          </div>
        </section>

      </div>

      {/* ── FEATURES – De ce să îți cumperi baterie de la noi ── */}
      <section className="mb-16 lg:mb-24">

        {/* Title – centered on mobile, left on desktop */}
        <div className="my-10 px-5 lg:px-0 text-center lg:text-left lg:pl-[var(--grid-edge)]">
          <h2
            className="text-black text-3xl font-bold font-['Inter'] leading-10 mx-auto lg:mx-0"
            style={{ width: '676px', maxWidth: '100%' }}
          >
            {tr.featuresSectionTitle}
          </h2>
        </div>

        {/* Scrollable card track – center snap on mobile */}
        <div
          ref={featuresSliderRef}
          className="flex gap-[10px] overflow-x-auto scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{
            paddingLeft: 'var(--grid-edge)',
            scrollPaddingLeft: 'max(10px, calc(50vw - 162px))',
            scrollPaddingRight: 'max(10px, calc(50vw - 162px))',
          }}
        >
          {([
            { icon: '/images/shared/battery-full-icon.svg', title: tr.f1Title, desc: tr.f1Desc },
            { icon: '/images/shared/service-icon.svg',       title: tr.f2Title, desc: tr.f2Desc },
            { icon: '/images/shared/swap-icon.svg',          title: tr.f3Title, desc: tr.f3Desc },
            { icon: '/images/shared/compatibility-icon.svg', title: tr.f4Title, desc: tr.f4Desc },
            { icon: '/images/shared/testing-icon.svg',       title: tr.f5Title, desc: tr.f5Desc },
            { icon: '/images/shared/delivery-icon.svg',      title: tr.f6Title, desc: tr.f6Desc },
            { icon: '/images/shared/swap-icon.svg',          title: tr.f7Title, desc: tr.f7Desc },
          ] as const).map((f, i) => (
            <div
              key={i}
              className="relative flex-shrink-0 w-[324px] h-80 rounded-[10px] snap-center"
            >
              {/* Mobile: absolute layout per spec */}
              <div className="lg:hidden absolute inset-0">
                <div className="absolute inset-0 bg-neutral-100 rounded-[10px]" />
                <img src={f.icon} alt="" aria-hidden className="size-16 object-contain absolute left-[40px] top-[40px]" />
                <div className="absolute left-[47px] top-[115px] w-56 text-black text-2xl font-semibold font-['Inter'] leading-8">
                  {f.title}
                </div>
                <div className="absolute left-[47px] top-[196px] w-64 text-black text-lg font-normal font-['Inter'] leading-6">
                  {f.desc}
                </div>
              </div>
              {/* Desktop: flow layout with border */}
              <div className="hidden lg:block relative h-full border border-zinc-200 rounded-[10px] px-[35px] pt-[35px] pb-5">
                <img src={f.icon} alt="" aria-hidden className="size-12 object-contain mb-5" />
                <p className="text-black text-2xl font-semibold font-['Inter'] leading-8 mb-3 max-w-[224px]">
                  {f.title}
                </p>
                <p className="text-black text-lg font-normal font-['Inter'] leading-6 max-w-[256px]">
                  {f.desc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => slideFeatures('right')}
                aria-label="Next"
                className="hidden lg:flex absolute bottom-5 right-5 size-12 rounded-full transition-transform duration-200 hover:scale-110 active:scale-95 z-10 items-center justify-center"
              >
                <img
                  src="/images/shared/round-arrow-icon.svg"
                  alt=""
                  aria-hidden
                  className="w-full h-full"
                />
              </button>
            </div>
          ))}
          {/* Right-end spacer */}
          <div aria-hidden style={{ flexShrink: 0, width: 'var(--grid-edge)' }} />
        </div>

        {/* Dot indicators – below cards, mobile only */}
        <div className="flex justify-center gap-2 mt-5 lg:hidden">
          {Array.from({ length: FEATURES_COUNT }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                const el = featuresSliderRef.current
                if (el) el.scrollTo({ left: i * (FEATURES_CARD_WIDTH + CARD_GAP), behavior: 'smooth' })
              }}
              aria-label={`Card ${i + 1}`}
              className={`size-2.5 rounded-full transition-colors ${
                i === featuresActiveIndex ? 'bg-black' : 'bg-black/30'
              }`}
            />
          ))}
        </div>

        {/* Arrows – below cards, right-aligned to container, desktop only */}
        <div
          className="hidden lg:flex justify-end gap-2 mt-5"
          style={{ paddingRight: 'var(--grid-edge)' }}
        >
          <button
            onClick={() => slideFeatures('left')}
            aria-label={tr.ariaPrev}
            className="size-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white transition-colors"
          >
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M7 1L1 7l6 6" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button
            onClick={() => slideFeatures('right')}
            aria-label={tr.ariaNext}
            className="size-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white transition-colors"
          >
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

      </section>

      {/* ── DIVIDER ── */}
      <hr className="border-gray-200 mb-16 lg:mb-24 w-full lg:max-w-[1100px] lg:mx-auto" />

      {/* ── REDUCERI – Programe de reduceri ── */}
      <section className="mb-16 lg:mb-24 max-w-content mx-auto px-5 lg:px-3">
        <div className="flex flex-col gap-4 my-8 text-center sm:text-left items-center sm:items-stretch">
          <h2 className="text-black text-3xl font-bold font-['Inter'] leading-10">
            {tr.reduceriGridTitle}
          </h2>
          <p className="text-black text-lg font-normal font-['Inter'] leading-6 max-w-[846px]">
            {tr.reduceriGridSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reduceriVisibleCards.map((card, i) => (
            <Link key={i} to="/reduceri" className="group block">
              <div className="w-full aspect-[3/4] min-h-[400px] sm:min-h-0 sm:max-h-96 relative rounded-[10px] overflow-hidden bg-zinc-300 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                <img
                  src={card.img}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover rounded-[10px] transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 rounded-[10px] transition-colors duration-300 group-hover:bg-black/55" />
                <div className="absolute top-3 right-3 px-3 py-1.5 bg-white/95 rounded-[5px] z-10">
                  <span className="text-slate-900 text-sm font-bold font-['Inter']">{card.pct} {tr.reduceriDiscountSuffix}</span>
                </div>
                <div className="absolute left-[26px] right-[26px] bottom-[24px] z-10 flex flex-col gap-3">
                  <p className="text-white text-base font-medium font-['Nunito_Sans'] leading-6">{tr.reduceriProgramLabel}</p>
                  <p className="text-white text-2xl font-bold font-['Inter'] leading-8 whitespace-pre-line">
                    {card.title}
                  </p>
                  <p className="text-white text-base font-medium font-['Inter'] leading-5">
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
              className="h-12 px-8 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-zinc-300 text-black text-base font-semibold font-['Inter'] hover:bg-neutral-100 transition-colors"
            >
              {tr.reduceriLoadMore}
            </button>
          </div>
        )}
      </section>

      <div className="max-w-content mx-auto px-5 lg:px-3 pb-24">

        {/* ── DIVIDER ── */}
        <hr className="border-gray-200 mb-16 lg:mb-24 w-full lg:max-w-[1100px] lg:mx-auto" />

        {/* ── LITHTECH ── */}
        <section className="mb-16 lg:mb-24">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-y-8 gap-x-6 lg:gap-x-4 lg:gap-y-10 items-start">
            {/* Left: text – 6 cols (on mobile: centered, gap-4 like reduceri) */}
            <div className="flex flex-col gap-4 order-1 lg:order-1 lg:col-span-6 text-center lg:text-left items-center lg:items-stretch w-full">
              <h2 className="text-black text-3xl font-bold font-['Inter'] leading-10 max-w-96 my-8">
                {tr.lithtechTitle}
              </h2>
              <p className="text-black text-lg font-normal font-['Inter'] leading-6 max-w-[482px] whitespace-pre-line">
                {tr.lithtechBody}
              </p>
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
                  PRODUCE TEHNOLOGIE
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
                  iMPLEMENTEAZA
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
                <div className="absolute w-72 left-1/2 -translate-x-1/2 top-[177px] flex justify-center items-center text-white text-2xl font-bold font-['Inter'] leading-10 z-10">
                  PRODUCE TEHNOLOGIE
                </div>
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
                <div className="absolute w-52 left-1/2 -translate-x-1/2 top-[187px] flex justify-center items-center text-white text-2xl font-bold font-['Inter'] leading-10 z-10">
                  IMPLEMENTEAZA
                </div>
              </div>
              <Link
                to="/parteneriat-strategic-lithtech-baterino"
                className="w-full max-w-[24rem] mx-auto h-14 bg-white rounded-[10px] flex items-center justify-center text-black text-base font-bold font-['Inter'] uppercase outline outline-1 outline-zinc-300 hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
              >
                VEZI PARTNERIAT
              </Link>
            </div>
          </div>
        </section>

        {/* ── DIVIDER ── */}
        <hr className="border-gray-200 mb-16 lg:mb-24 w-full lg:max-w-[1100px] lg:mx-auto" />

        {/* ── DIVISIONS ── */}
        <section className="mb-16 lg:mb-24">

          {/* ── Mobile: Responsabilitate + map (shown first on mobile) ── */}
          <section className="lg:hidden flex flex-col items-center text-center mb-8">
            <h2 className="text-black text-3xl font-bold font-['Inter'] leading-10 my-4">
              {tr.divisionsSectionTitle}
            </h2>
            <p className="text-gray-700 text-base font-medium font-['Inter'] leading-7 mb-6">
              {renderBaterinoGlobalLink(tr.divisionsSectionBody)}
            </p>
            <div className="flex items-center gap-6 p-4 rounded-[10px] bg-neutral-100 mb-6 w-full max-w-md">
              <img src="/images/home/harta-romania.png" alt="" aria-hidden className="w-40 h-40 shrink-0 object-contain" />
              <p className="text-black text-xl font-bold font-['Inter'] leading-tight text-left min-w-0 flex-1">{tr.netTitle}</p>
            </div>
            <Link
              to="/companie"
              className="w-fit h-12 px-5 py-[5px] rounded-[10px] outline outline-1 outline-zinc-300 inline-flex justify-center items-center whitespace-nowrap hover:bg-neutral-100 transition-colors"
            >
              <span className="text-black text-base font-semibold font-['Inter'] uppercase">{tr.divisionsSectionBtn}</span>
            </Link>
          </section>

          {/* ── Desktop grid ── */}
          <div className="hidden lg:grid grid-cols-12 gap-x-4 gap-y-10">

            {/* ── ROW 1 ── */}

            {/* Text block – 6 cols */}
            <div className="col-span-6 flex flex-col pt-5 pb-4">
              <h2 className="text-black text-3xl font-bold font-['Inter'] leading-10 my-5 max-w-[513px]">
                {tr.divisionsSectionTitle}
              </h2>
              <p className="text-gray-700 text-lg font-medium font-['Inter'] leading-8 mb-8 max-w-[483px]">
                {renderBaterinoGlobalLink(tr.divisionsSectionBody)}
              </p>
              <Link
                to="/companie"
                className="w-fit h-12 px-5 py-[5px] rounded-[10px] outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex justify-center items-center whitespace-nowrap hover:bg-neutral-100 transition-colors"
              >
                <span className="text-black text-base font-semibold font-['Inter']">
                  {tr.divisionsSectionBtn}
                </span>
              </Link>
            </div>

            {/* RETEA NATIONALA – 6 cols, h-96 */}
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

          {/* ── DIVIDER ── */}
          <hr className="border-gray-200 my-16 lg:my-20 w-full lg:max-w-[1100px] lg:mx-auto" />

          {/* ── DIVIZIILE BATERINO – desktop: 4 cards grid; mobile: slider ── */}
          <div>
            <h2 className="text-black text-3xl font-bold font-['Inter'] leading-10 my-4 text-center lg:text-left">
              {tr.diviziileNoastreTitle}
            </h2>
            <p className="text-gray-700 text-lg font-medium font-['Inter'] leading-8 mb-8 max-w-[894px] text-center lg:text-left mx-auto lg:mx-0">
              {tr.diviziileNoastreSubtitle}
            </p>

            {/* Desktop: 4 cards in grid */}
            <div className="hidden lg:grid grid-cols-4 gap-6">
              <Link to="/divizii/rezidential" className="h-96 relative rounded-[10px] overflow-hidden bg-zinc-300 group block">
                <img src="/images/home/rezidential-baterii-lifepo4.jpg" alt={tr.divRezTitle} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40" />
                <img src="/images/shared/baterino-logo-white.png" alt="Baterino" className="absolute top-6 right-6 h-6 w-auto object-contain" />
                <div className="absolute bottom-6 left-[21px]">
                  <p className="text-white text-3xl font-bold font-['Inter'] leading-9 mb-1">{tr.divRezTitle}</p>
                  <p className="text-white text-base font-medium font-['Inter'] leading-5 max-w-[240px]">{tr.divRezDesc}</p>
                </div>
              </Link>
              <Link to="/divizii/industrial" className="h-96 relative rounded-[10px] overflow-hidden bg-zinc-300 group block">
                <img src="/images/home/industrial-baterii-lifepo4.jpg" alt={tr.divIndTitle} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40" />
                <img src="/images/shared/baterino-pro-industrial-logo.png" alt="Baterino Industrial" className="absolute top-5 right-6 h-6 w-auto object-contain" />
                <div className="absolute bottom-6 left-[22px]">
                  <p className="text-white text-3xl font-bold font-['Inter'] leading-9 mb-1">{tr.divIndTitle}</p>
                  <p className="text-white text-base font-medium font-['Inter'] leading-5 max-w-[224px]">{tr.divIndDesc}</p>
                </div>
              </Link>
              <Link to="/divizii/medical" className="h-96 relative rounded-[10px] overflow-hidden bg-zinc-300 group block">
                <img src="/images/home/medical-baterii-lifepo4.jpg" alt={tr.divMedTitle} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40" />
                <img src="/images/shared/baterino-medical-logo-white.png" alt="Baterino Medical" className="absolute top-6 right-6 h-6 w-auto object-contain" />
                <div className="absolute bottom-6 left-[18px]">
                  <p className="text-white text-3xl font-bold font-['Inter'] leading-9 mb-1">{tr.divMedTitle}</p>
                  <p className="text-white text-base font-medium font-['Inter'] leading-5 max-w-[240px]">{tr.divMedDesc}</p>
                </div>
              </Link>
              <Link to="/divizii/maritim" className="h-96 relative rounded-[10px] overflow-hidden bg-zinc-300 group block">
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
                      className="relative flex-shrink-0 w-[324px] h-[466px] rounded-[10px] overflow-hidden bg-zinc-300 group block snap-center"
                    >
                      <img src={d.img} alt={d.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40" />
                      <img src={d.logo} alt="" className="absolute top-6 right-6 h-6 w-auto object-contain" />
                      <div className="absolute bottom-6 left-[21px]">
                        <p className="text-white text-3xl font-bold font-['Inter'] leading-9 mb-1">{d.title}</p>
                        <p className="text-white text-base font-medium font-['Inter'] leading-5 max-w-[240px]">{d.desc}</p>
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
    </>
  )
}
