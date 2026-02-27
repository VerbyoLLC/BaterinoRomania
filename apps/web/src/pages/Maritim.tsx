import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useViziuneHeader } from '../contexts/ViziuneHeaderContext'
import { useLanguage } from '../contexts/LanguageContext'
import { getMenuTranslations } from '../i18n/menu'
import { getMaritimTranslations } from '../i18n/maritim'
import { LanguageDropdown } from '../components/LanguageDropdown'
import OutlineButton from '../components/OutlineButton'
import ImageCard from '../components/ImageCard'
import SEO from '../components/SEO'
import CTABar from '../components/CTABar'

const SECTIONS = [
  { id: 'stocare',   navKey: 'navStocare'   as const },
  { id: 'produse',   navKey: 'navProduse'   as const },
  { id: 'aplicatii', navKey: 'navAplicatii' as const },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

const APLICATII: { key: keyof ReturnType<typeof getMaritimTranslations>; img: string }[] = [
  { key: 'aplicatiiRemorcher', img: '/images/divizii/maritim/remorcher.jpg' },
  { key: 'aplicatiiFerry',     img: '/images/divizii/maritim/ferry-boat.jpg' },
  { key: 'aplicatiiRoPax',     img: '/images/divizii/maritim/nava-ro-pax.jpg' },
  { key: 'aplicatiiOffshore',  img: '/images/divizii/maritim/nava-de-suport-offshore.jpg' },
  { key: 'aplicatiiCargo',     img: '/images/divizii/maritim/nava-cargo.jpg' },
  { key: 'aplicatiiPescuit',   img: '/images/divizii/maritim/nava-pescuit.jpg' },
]

const FEATURE_CARDS: { key: keyof ReturnType<typeof getMaritimTranslations>; icon: string }[] = [
  { key: 'cardGarantie',   icon: '/images/shared/safety-icon.svg' },
  { key: 'cardProiectare', icon: '/images/shared/proiectare-icon.svg' },
  { key: 'cardSolutii',    icon: '/images/shared/solutii-icon.svg' },
  { key: 'cardInstalare',  icon: '/images/shared/instalare-icon.svg' },
  { key: 'cardService',    icon: '/images/shared/service-icon.svg' },
]

function renderBold(text: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  )
}

export default function Maritim() {
  const { setReplaceMainHeader } = useViziuneHeader()
  const { language, setLanguage } = useLanguage()
  const t  = getMenuTranslations(language.code)
  const tr = getMaritimTranslations(language.code)

  const [showSubNav,          setShowSubNav]          = useState(false)
  const [footerInView,        setFooterInView]        = useState(false)
  const [activeSection,       setActiveSection]       = useState<SectionId>('stocare')
  const [langOpen,            setLangOpen]            = useState(false)
  const [visibleCount,        setVisibleCount]        = useState(2)
  const [visibleFeatureCount, setVisibleFeatureCount] = useState(4)

  const heroRef    = useRef<HTMLDivElement>(null)
  const subNavRef  = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    stocare: null, produse: null, aplicatii: null,
  })

  const scrollTo = useCallback((id: string) => {
    if (id === 'top' && heroRef.current) {
      heroRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: 'smooth' }), [])

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const ob = new IntersectionObserver(
      ([e]) => setShowSubNav(!e.isIntersecting),
      { threshold: 0.1, rootMargin: '-64px 0px 0px 0px' }
    )
    ob.observe(hero)
    return () => ob.disconnect()
  }, [])

  useEffect(() => {
    setReplaceMainHeader(showSubNav)
    return () => setReplaceMainHeader(false)
  }, [showSubNav, setReplaceMainHeader])

  useEffect(() => {
    const footer = document.querySelector('footer')
    if (!footer) return
    const ob = new IntersectionObserver(([e]) => setFooterInView(e.isIntersecting), { threshold: 0 })
    ob.observe(footer)
    return () => ob.disconnect()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (subNavRef.current && !subNavRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    const options = { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const ob = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id) },
        options
      )
      ob.observe(el)
      observers.push(ob)
    })
    return () => observers.forEach(ob => ob.disconnect())
  }, [])

  const seoTitles: Record<string, string> = {
    ro: 'Stocare Energie Maritim',
    en: 'Maritime Energy Storage',
    zh: '船舶储能',
  }
  const seoDescriptions: Record<string, string> = {
    ro: 'Sisteme de stocare a energiei LiFePo4 pentru nave comerciale, remorchere, ferry-boat și infrastructură portuară. Soluții Full-Electric și Hibride certificate pentru sectorul naval.',
    en: 'LiFePo4 energy storage systems for commercial vessels, tugboats, ferries and port infrastructure. Certified Full-Electric and Hybrid solutions for the maritime sector.',
    zh: '面向商业船舶、拖船、渡轮和港口基础设施的LiFePo4储能系统。经认证的全电动和混合动力海事解决方案。',
  }

  return (
    <>
      <SEO
        title={seoTitles[language.code] ?? seoTitles.ro}
        description={seoDescriptions[language.code] ?? seoDescriptions.ro}
        canonical="/divizii/maritim"
        ogImage="/images/divizii/maritim/sisteme-stocare-sector-maritim-og.jpg"
        lang={language.code}
      />
      <article className="max-w-content mx-auto px-5 lg:px-3 pt-24 pb-16">

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
              <button type="button" onClick={() => scrollTo('top')} className="text-gray-900 font-bold text-sm hover:text-black">
                Maritim
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
                  {id !== 'aplicatii' && <span className="text-gray-300 select-none" aria-hidden>–</span>}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 min-w-[120px] justify-end">
              <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium text-sm">{t.login}</Link>
              <LanguageDropdown current={language} isOpen={langOpen} onToggle={() => setLangOpen(!langOpen)} onSelect={setLanguage} />
            </div>
          </div>
        </div>

        {/* Back to top */}
        <div
          className={`fixed z-50 transition-opacity duration-200 ${
            showSubNav && !footerInView ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          style={{ right: 'max(1rem, calc((100vw - 1200px) / 2 + 1rem))', bottom: '2rem', transform: 'translateX(100px)' }}
        >
          <button type="button" onClick={scrollToTop} className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-900 text-white flex items-center justify-center shadow-lg border-2 border-gray-600" aria-label="Scroll to top">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>

        {/* Hero */}
        <div ref={heroRef} className="w-full mx-auto mb-16 flex flex-col items-center gap-0">
          <h1 className="w-full text-center text-black text-2xl sm:text-4xl lg:text-5xl font-extrabold font-['Inter'] leading-8 sm:leading-[48px] lg:leading-[56px]">
            {tr.heroTitle}
          </h1>
          <p className="max-w-[739px] text-center text-neutral-600 text-base sm:text-lg lg:text-xl font-medium font-['Inter'] leading-6 sm:leading-7 lg:leading-8 mt-[14px] mb-[60px]">
            {tr.heroTagline}
          </p>
          <div className="w-full relative">
            <picture>
              <source media="(max-width: 1023px)" srcSet="/images/divizii/maritim/hero-card-maritim-mobile.jpg" />
              <img
                src="/images/divizii/maritim/hero-card-maritim.jpg"
                alt={tr.heroTitle}
                className="relative w-full object-cover rounded-[10px]"
                style={{ height: '440px' }}
              />
            </picture>
            <div className="absolute inset-0 bg-black/60 rounded-[10px]" aria-hidden />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-10 flex flex-col items-center gap-2 pt-4 lg:pt-0 min-w-0 z-10">
              <img src="/images/divizii/maritim/baterino-maritim-logo-white.png" alt="Baterino At Sea" className="h-9 w-auto max-w-[90vw] object-contain flex-shrink-0" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-white text-xs font-normal font-['Inter'] leading-5">Powered by</span>
                <img src="/images/shared/lithtech-logo-white.png" alt="LithTech" className="h-5 w-auto object-contain" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 1 – Stocare */}
        <section
          id="stocare"
          ref={(el) => { sectionRefs.current.stocare = el }}
          className="grid-12 mb-20 scroll-mt-20"
        >
          {/* Left – title + body */}
          <div className="col-span-4 lg:col-span-5">
            <h2 className="text-gray-700 text-xl lg:text-3xl font-bold font-['Inter'] leading-7 lg:leading-10 mb-5">
              {tr.sectionStocareTitle}
            </h2>
            <p className="text-gray-700 text-base font-normal lg:font-medium font-['Inter'] leading-6 mb-4">
              {renderBold(tr.introP1)}
            </p>
            <p className="text-gray-700 text-base font-normal lg:font-medium font-['Inter'] leading-6 mb-4">
              {renderBold(tr.introP2)}
            </p>
            <p className="text-gray-700 text-base font-semibold font-['Inter'] leading-6 mb-2">
              {tr.examplesTitle}
            </p>
            <ul className="list-disc list-inside space-y-1">
              {tr.introExamples.split('\n').filter(Boolean).map((line) => {
                const colonIdx = line.indexOf(':')
                const label = colonIdx !== -1 ? line.slice(0, colonIdx) : line
                const detail = colonIdx !== -1 ? line.slice(colonIdx) : ''
                return (
                  <li key={line} className="text-gray-600 text-sm font-['Inter'] leading-5">
                    <span className="font-bold">{label}</span>
                    <span className="font-normal">{detail}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Right – feature cards */}
          <div className="col-span-4 lg:col-span-6 lg:col-start-7 pt-8 lg:pt-[70px]">
            <p className="text-black text-base lg:text-lg font-bold font-['Inter'] uppercase tracking-wider leading-6 lg:leading-8 mb-4 text-center lg:text-left">
              {tr.ctaSuport}
            </p>
            <div className="grid-12">
              {FEATURE_CARDS.map(({ key, icon }, i) => (
                <div
                  key={key}
                  className={`col-span-2 lg:col-span-4 bg-neutral-100 rounded-[10px] h-36 flex flex-col items-center justify-center gap-3 px-2${i >= visibleFeatureCount ? ' hidden lg:flex' : ''}`}
                >
                  <img src={icon} alt="" className="w-9 h-9 object-contain" aria-hidden />
                  <span className="text-center text-gray-700 text-base font-bold font-['Nunito_Sans'] leading-5 max-w-[160px] whitespace-pre-line">
                    {tr[key] as string}
                  </span>
                </div>
              ))}
            </div>

            {visibleFeatureCount < FEATURE_CARDS.length && (
              <div className="flex justify-center mt-6 lg:hidden">
                <OutlineButton onClick={() => setVisibleFeatureCount(FEATURE_CARDS.length)}>
                  VEZI MAI MULT
                </OutlineButton>
              </div>
            )}
          </div>
        </section>

        {/* Section 2 – Produse */}
        <section
          id="produse"
          ref={(el) => { sectionRefs.current.produse = el }}
          className="mb-20 scroll-mt-20"
        >
          <h2 className="text-gray-700 text-xl lg:text-3xl font-bold font-['Inter'] leading-7 lg:leading-10 mb-8">
            {tr.sectionProduseTitle}
          </h2>

          {/* Featured product card – stacks on mobile (image top, text bottom), side-by-side on desktop */}
          <div className="w-full lg:w-1/2 rounded-[10px] overflow-hidden flex flex-col-reverse lg:flex-row lg:h-[280px]">
            <div className="w-full lg:w-[45%] bg-gray-900 flex flex-col justify-between p-6">
              <div>
                <p className="text-gray-400 text-xs font-semibold font-['Inter'] uppercase tracking-widest mb-3">
                  {tr.product1Category}
                </p>
                <p className="text-white text-xl font-bold font-['Inter'] leading-7">
                  {tr.product1Name}
                </p>
                <p className="text-gray-300 text-sm font-normal font-['Inter'] leading-5 mt-3 whitespace-pre-line">
                  {tr.product1Spec}
                </p>
              </div>
              <button className="text-white text-sm font-semibold font-['Inter'] underline underline-offset-2 self-start hover:text-gray-300 transition-colors mt-6 lg:mt-0">
                {tr.detailsButton}
              </button>
            </div>
            <div className="w-full lg:w-[55%] bg-neutral-100 flex items-center justify-center p-4 h-52 lg:h-auto">
              <img
                src="/images/shared/white-sharl-series.png"
                alt={tr.product1Name}
                className="h-44 w-auto object-contain"
              />
            </div>
          </div>
        </section>

        <hr className="border-t border-gray-200 my-16" />

        {/* Section 3 – Aplicații */}
        <section
          id="aplicatii"
          ref={(el) => { sectionRefs.current.aplicatii = el }}
          className="mb-20 scroll-mt-20"
        >
          <h2 className="text-black text-xl lg:text-3xl font-bold font-['Inter'] leading-7 lg:leading-10 mb-2">
            {tr.sectionAplicatiiTitle}
          </h2>
          <p className="text-gray-700 text-base lg:text-lg font-normal lg:font-medium font-['Inter'] leading-6 lg:leading-7 max-w-[792px] mb-14">
            {tr.sectionAplicatiiDesc}
          </p>

          {/* 4 per row desktop, 1 per row mobile with load more */}
          <ul className="grid grid-cols-1 lg:grid-cols-4 gap-5" aria-label={tr.sectionAplicatiiTitle}>
            {APLICATII.map(({ key, img }, i) => (
              <li key={key} className={i >= visibleCount ? 'hidden lg:block' : ''}>
                <ImageCard
                  src={img}
                  alt={tr[key] as string}
                  label={tr[key] as string}
                />
              </li>
            ))}
          </ul>

          {visibleCount < APLICATII.length && (
            <div className="flex justify-center mt-10 lg:hidden">
              <OutlineButton onClick={() => setVisibleCount(c => Math.min(c + 2, APLICATII.length))}>
                VEZI MAI MULT
              </OutlineButton>
            </div>
          )}
        </section>

        <hr className="border-t border-gray-200 my-16" />

        {/* CTA bar */}
        <CTABar
          logo="/images/divizii/maritim/baterino-maritim-logo-black.png"
          logoAlt="Baterino At Sea"
          logoClassName="h-6 lg:h-16"
          title={tr.ctaTitle}
          desc={tr.ctaDesc}
          btn1Label={tr.ctaButton}
          btn1To="/companie"
        />

      </article>
    </>
  )
}
