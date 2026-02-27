import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useViziuneHeader } from '../contexts/ViziuneHeaderContext'
import { useLanguage } from '../contexts/LanguageContext'
import { getMenuTranslations } from '../i18n/menu'
import { getRezidentialTranslations } from '../i18n/rezidential'
import { LanguageDropdown } from '../components/LanguageDropdown'
import OutlineButton from '../components/OutlineButton'
import ImageCard from '../components/ImageCard'
import SEO from '../components/SEO'
import CTABar from '../components/CTABar'

const SECTIONS = [
  { id: 'stocare', navKey: 'navStocare' as const },
  { id: 'sisteme', navKey: 'navSisteme' as const },
  { id: 'ansambluri', navKey: 'navAnsambluri' as const },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

const ANSAMBLURI: { key: keyof ReturnType<typeof getRezidentialTranslations>; img: string }[] = [
  { key: 'ansambluriRezidential', img: '/images/divizii/rezidential/ansambluri-rezidentiale.jpg' },
  { key: 'ansambluriHoteluri', img: '/images/divizii/rezidential/hoteluri-si-pensiuni.jpg' },
  { key: 'ansambluriCentre', img: '/images/divizii/rezidential/centre-comerciale.jpg' },
  { key: 'ansambluriLocuinte', img: '/images/divizii/rezidential/locuinte-individuale.jpg' },
  { key: 'ansambluriFerme', img: '/images/divizii/rezidential/ferme-agricole.jpg' },
  { key: 'ansambluriStatiuni', img: '/images/divizii/rezidential/statiuni-meteorologice.jpg' },
  { key: 'ansambluriCladiri', img: '/images/divizii/rezidential/cladiri-de-birouri.jpg' },
  { key: 'ansambluriZone', img: '/images/divizii/rezidential/zone-greu-accesibile.jpg' },
]

const CTA_FEATURES: { key: keyof ReturnType<typeof getRezidentialTranslations>; icon: string }[] = [
  { key: 'cardGarantie',       icon: '/images/shared/testing-icon.svg' },
  { key: 'cardCompatibilitate',icon: '/images/shared/compatibility-icon.svg' },
  { key: 'cardVerificat',      icon: '/images/shared/safety-icon.svg' },
  { key: 'cardRetur',          icon: '/images/shared/delivery-icon.svg' },
  { key: 'cardSwap',           icon: '/images/shared/swap-icon.svg' },
  { key: 'cardService',        icon: '/images/shared/service-icon.svg' },
]

export default function Rezidential() {
  const { setReplaceMainHeader } = useViziuneHeader()
  const { language, setLanguage } = useLanguage()
  const t = getMenuTranslations(language.code)
  const tr = getRezidentialTranslations(language.code)

  const [showSubNav, setShowSubNav] = useState(false)
  const [footerInView, setFooterInView] = useState(false)
  const [activeSection, setActiveSection] = useState<SectionId>('stocare')
  const [langOpen, setLangOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(2)
  const [visibleFeatureCount, setVisibleFeatureCount] = useState(4)

  const heroRef = useRef<HTMLDivElement>(null)
  const subNavRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    stocare: null,
    sisteme: null,
    ansambluri: null,
  })

  const scrollTo = useCallback((id: string) => {
    if (id === 'top' && heroRef.current) {
      heroRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Show sub-nav once hero scrolls out
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const observer = new IntersectionObserver(
      ([e]) => setShowSubNav(!e.isIntersecting),
      { threshold: 0.1, rootMargin: '-64px 0px 0px 0px' }
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setReplaceMainHeader(showSubNav)
    return () => setReplaceMainHeader(false)
  }, [showSubNav, setReplaceMainHeader])

  // Hide back-to-top when footer in view
  useEffect(() => {
    const footer = document.querySelector('footer')
    if (!footer) return
    const observer = new IntersectionObserver(
      ([e]) => setFooterInView(e.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  // Click outside to close lang dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (subNavRef.current && !subNavRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Active section tracking
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    const options: IntersectionObserverInit = {
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0,
    }
    SECTIONS.forEach(({ id }) => {
      const el = sectionRefs.current[id]
      if (!el) return
      const ob = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setActiveSection(id)
      }, options)
      ob.observe(el)
      observers.push(ob)
    })
    return () => observers.forEach((ob) => ob.disconnect())
  }, [])

  return (
    <>
    <SEO
      title={
        language.code === 'en' ? 'Residential Energy Storage'
        : language.code === 'zh' ? '住宅储能'
        : 'Stocare Energie Rezidențial'
      }
      description={
        language.code === 'en'
          ? 'LiFePo4 Low Voltage and High Voltage energy storage systems for individual homes and residential micro-grids. 10-year warranty, dedicated technical support and local service in Romania.'
        : language.code === 'zh'
          ? '面向独立住宅与住宅微电网的LiFePo4低压及高压储能系统。10年质保，专业技术支持，罗马尼亚本地服务。'
          : 'Sisteme de stocare a energiei LiFePo4 Low Voltage și High Voltage pentru locuințe individuale și micro-griduri rezidențiale. Garanție 10 ani, suport tehnic dedicat și service local în România.'
      }
      canonical="/divizii/rezidential"
      ogImage="/images/divizii/rezidential/stocare-energie-rezidential-og.jpg"
      lang={language.code}
    />
    <article className="max-w-content mx-auto px-5 lg:px-3 pt-24 pb-16">

      {/* Hero */}
      <div
        ref={heroRef}
        className="w-full mx-auto mb-16 flex flex-col items-center gap-0"
      >
        <h1 className="w-full text-center text-black text-2xl sm:text-4xl lg:text-5xl font-extrabold font-['Inter'] leading-8 sm:leading-[48px] lg:leading-[56px]">
          {tr.heroTitle}
        </h1>
        <p className="max-w-[739px] text-center text-neutral-600 text-base sm:text-lg lg:text-xl font-medium font-['Inter'] leading-6 sm:leading-7 lg:leading-8 mt-[14px] mb-[60px]">
          {tr.heroTagline}
        </p>

        {/* Hero image card */}
        <div className="w-full relative">
          {/* Main image — mobile/desktop sources */}
          <picture>
            <source
              media="(max-width: 1023px)"
              srcSet="/images/divizii/rezidential/hero-card-rezidential-mobile.jpg"
            />
            <img
              src="/images/divizii/rezidential/hero-card-rezidential.jpg"
              alt={tr.heroTitle}
              className="relative w-full object-cover rounded-[10px]"
              style={{ height: '440px' }}
            />
          </picture>
          {/* Baterino logo + Powered by LithTech – bottom center/right */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-10 flex flex-col items-center gap-2 pt-4 lg:pt-0">
            <img src="/images/divizii/rezidential/baterino-logo-white.png" alt="Baterino" className="h-9 w-auto" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-white text-xs font-normal font-['Inter'] leading-5">Powered by</span>
              <img src="/images/shared/lithtech-logo-white.png" alt="LithTech" className="h-5 w-auto object-contain" />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky sub-nav */}
      <div
        ref={subNavRef}
        className={`fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 transition-opacity duration-200 ${
          showSubNav ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-content mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center gap-4">
          <Link to="/" className="flex items-center flex-shrink-0" aria-label="Baterino Romania – home">
            <img src="/images/shared/baterino-logo-black.svg" alt="Baterino Romania" className="h-8 w-auto" />
          </Link>
          <div className="flex-1 hidden sm:flex items-center justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => scrollTo('top')}
              className="text-gray-900 font-bold text-sm hover:text-black"
            >
              {t.rezidential}
            </button>
            <span className="text-gray-300 select-none" aria-hidden>|</span>
            {SECTIONS.map(({ id, navKey }, index) => (
              <span key={id} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => scrollTo(id)}
                  className={`text-sm transition-colors hover:text-black ${
                    activeSection === id ? 'text-gray-900 font-bold' : 'text-gray-400 font-normal'
                  }`}
                >
                  {index + 1}. {tr[navKey]}
                </button>
                {id !== 'ansambluri' && (
                  <span className="text-gray-300 select-none" aria-hidden>–</span>
                )}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 min-w-[120px] justify-end">
            <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium text-sm">
              {t.login}
            </Link>
            <LanguageDropdown
              current={language}
              isOpen={langOpen}
              onToggle={() => setLangOpen(!langOpen)}
              onSelect={setLanguage}
            />
          </div>
        </div>
      </div>

      {/* Back to top */}
      <div
        className={`fixed z-50 transition-opacity duration-200 ${
          showSubNav && !footerInView ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          right: 'max(1rem, calc((100vw - 1200px) / 2 + 1rem))',
          bottom: '2rem',
          transform: 'translateX(100px)',
        }}
      >
        <button
          type="button"
          onClick={scrollToTop}
          className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-900 text-white flex items-center justify-center shadow-lg border-2 border-gray-600"
          aria-label="Scroll to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>

      {/* Section 1 – Stocare: cols 1–6 text · cols 7–12 feature cards */}
      <section
        id="stocare"
        ref={(el) => { sectionRefs.current.stocare = el }}
        className="grid-12 mb-20 scroll-mt-20"
      >
        {/* Left – cols 1–5 */}
        <div className="col-span-4 lg:col-span-5">
          <h2 className="text-gray-700 text-xl lg:text-3xl font-bold font-['Inter'] leading-7 lg:leading-10 mb-5">
            {tr.sectionStocareTitle}
          </h2>
          <p className="text-gray-700 text-base font-normal lg:font-medium font-['Inter'] leading-6 lg:leading-6 mb-4">
            {tr.introP1}
          </p>
          <p className="text-gray-700 text-base font-normal lg:font-medium font-['Inter'] leading-6">
            {tr.introP2}
          </p>
        </div>

        {/* Right – cols 7–12, col 6 left empty */}
        <div className="col-span-4 lg:col-span-6 lg:col-start-7 lg:pt-[70px]">
          <p className="text-black text-sm lg:text-lg font-bold font-['Inter'] uppercase tracking-wider leading-8 lg:leading-10 mb-3">
            {tr.ctaSuport}
          </p>
          {/* Feature cards: 2 per row on mobile, 3 per row on desktop */}
          <div className="grid-12">
            {CTA_FEATURES.map(({ key, icon }, i) => (
              <div
                key={key}
                className={`col-span-2 lg:col-span-4 bg-neutral-100 rounded-[10px] h-36 flex flex-col items-center justify-center gap-3 px-2${i >= visibleFeatureCount ? ' hidden lg:flex' : ''}`}
              >
                <img src={icon} alt="" className="w-9 h-9 object-contain" aria-hidden />
                <span className="text-center text-gray-700 text-base font-bold font-['Nunito_Sans'] leading-5">
                  {tr[key] as string}
                </span>
              </div>
            ))}
          </div>

          {/* Load More – mobile only */}
          {visibleFeatureCount < CTA_FEATURES.length && (
            <div className="flex justify-center mt-6 lg:hidden">
              <OutlineButton onClick={() => setVisibleFeatureCount(CTA_FEATURES.length)}>
                VEZI MAI MULT
              </OutlineButton>
            </div>
          )}
        </div>
      </section>

      {/* Section 2 – Sisteme: cols 1–4 · 5–8 · 9–12 */}
      <section
        id="sisteme"
        ref={(el) => { sectionRefs.current.sisteme = el }}
        className="mb-20 scroll-mt-20"
      >
        <h2 className="text-gray-700 text-xl lg:text-3xl font-bold font-['Inter'] leading-7 lg:leading-10 mb-8">
          {tr.sectionSistemeTitle}
        </h2>

        <div className="grid-12">
          {/* TRX Series LiFePo4 LV – cols 1–3 */}
          <div className="group col-span-4 lg:col-span-3 relative h-72 bg-neutral-100 rounded-[10px] overflow-hidden cursor-pointer transition-shadow duration-300 hover:shadow-md">
            <img
              src="/images/shared/eco-home5kwh-lithtech.png"
              alt={tr.productTRX}
              className="w-32 h-40 absolute top-[29px] left-1/2 -translate-x-1/2 object-contain transition-transform duration-300 group-hover:scale-110"
            />
            <p className="absolute left-[28px] right-[28px] bottom-5 text-center text-black text-base lg:text-lg font-semibold font-['Inter'] leading-6 lg:leading-7">
              {tr.productTRX} {tr.productTRXSpec}
            </p>
          </div>

          {/* TA6000 LiFePo4 LV – cols 4–6 */}
          <div className="group col-span-4 lg:col-span-3 relative h-72 bg-neutral-100 rounded-[10px] overflow-hidden cursor-pointer transition-shadow duration-300 hover:shadow-md">
            <img
              src="/images/shared/ta6000-lithtech.png"
              alt={tr.productTA6000}
              className="w-28 h-40 absolute top-[29px] left-1/2 -translate-x-1/2 object-contain transition-transform duration-300 group-hover:scale-110"
            />
            <p className="absolute left-[28px] right-[28px] bottom-5 text-center text-black text-base lg:text-lg font-semibold font-['Inter'] leading-6 lg:leading-7">
              {tr.productTA6000} {tr.productTA6000Spec}
            </p>
          </div>

          {/* LiFePo4 HV – cols 7–9 */}
          <div className="group col-span-4 lg:col-span-3 relative h-72 bg-neutral-100 rounded-[10px] overflow-hidden cursor-pointer transition-shadow duration-300 hover:shadow-md">
            <img
              src="/images/shared/HP2000-all-in-one.png"
              alt={tr.productHV}
              className="w-28 h-40 absolute top-[29px] left-1/2 -translate-x-1/2 object-contain transition-transform duration-300 group-hover:scale-110"
            />
            <p className="absolute left-[28px] right-[28px] bottom-5 text-center text-black text-base lg:text-lg font-semibold font-['Inter'] leading-6 lg:leading-7">
              {tr.productHV} {tr.productHVSpec}
            </p>
          </div>
        </div>
      </section>

      <hr className="border-t border-gray-200 my-16" />

      {/* Section 3 – Ansambluri: 4 per row (col-span-3 each) */}
      <section
        id="ansambluri"
        ref={(el) => { sectionRefs.current.ansambluri = el }}
        className="mb-20 scroll-mt-20"
      >
        {/* Title */}
        <h2 className="text-black text-xl lg:text-3xl font-bold font-['Inter'] leading-7 lg:leading-10 mb-2 max-w-[510px]">
          {tr.sectionAnsambluriTitle}
        </h2>
        {/* Description */}
        <p className="text-gray-700 text-base lg:text-lg font-normal lg:font-medium font-['Inter'] leading-6 lg:leading-7 max-w-[792px] mb-14">
          {tr.sectionStocareDesc}
        </p>

        {/* Image grid — 1 col mobile · 3 cols desktop, fixed */}
        <ul className="grid grid-cols-1 lg:grid-cols-4 gap-5" aria-label={tr.sectionAnsambluriTitle}>
          {ANSAMBLURI.map(({ key, img }, i) => (
            <li key={key} className={i >= visibleCount ? 'hidden lg:block' : ''}>
              <ImageCard
                src={img}
                alt={tr[key] as string}
                label={tr[key] as string}
              />
            </li>
          ))}
        </ul>

        {/* Load More – mobile only */}
        {visibleCount < ANSAMBLURI.length && (
          <div className="flex justify-center mt-10 lg:hidden">
            <OutlineButton onClick={() => setVisibleCount((c) => Math.min(c + 2, ANSAMBLURI.length))}>
              VEZI MAI MULT
            </OutlineButton>
          </div>
        )}
      </section>

      <hr className="border-t border-gray-200 my-16" />

      {/* CTA bar */}
      <CTABar
        logo="/images/shared/baterino-logo-black.svg"
        logoAlt="Baterino Romania"
        title={tr.ctaTitle}
        desc={tr.ctaDesc}
        btn1Label={tr.ctaButton}
        btn1To="/companie"
      />

    </article>
    </>
  )
}
