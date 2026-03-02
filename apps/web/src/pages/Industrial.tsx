import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useViziuneHeader } from '../contexts/ViziuneHeaderContext'
import { useLanguage } from '../contexts/LanguageContext'
import { getMenuTranslations } from '../i18n/menu'
import { getIndustrialTranslations } from '../i18n/industrial'
import { LanguageDropdown } from '../components/LanguageDropdown'
import OutlineButton from '../components/OutlineButton'
import ImageCard from '../components/ImageCard'
import SEO from '../components/SEO'
import CTABar from '../components/CTABar'

const SECTIONS = [
  { id: 'stocare',  navKey: 'navStocare'  as const },
  { id: 'sisteme',  navKey: 'navSisteme'  as const },
  { id: 'aplicatii', navKey: 'navAplicatii' as const },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

const PRODUCTS: {
  nameKey: keyof ReturnType<typeof getIndustrialTranslations>
  specKey: keyof ReturnType<typeof getIndustrialTranslations>
  img: string
  colSpan?: string
  imgClass?: string
}[] = [
  { nameKey: 'product1Name', specKey: 'product1Spec', img: '/images/shared/lithtech-60kwh.png' },
  { nameKey: 'product2Name', specKey: 'product2Spec', img: '/images/shared/lithtech-100kwh.png' },
  { nameKey: 'product3Name', specKey: 'product3Spec', img: '/images/shared/lithtech-200kwh-exterior.png' },
  { nameKey: 'product4Name', specKey: 'product4Spec', img: '/images/shared/lithtech-261kwh.png' },
  { nameKey: 'product5Name', specKey: 'product5Spec', img: '/images/shared/lithtech-288kwh.png' },
  { nameKey: 'product6Name', specKey: 'product6Spec', img: '/images/shared/lithtech-all-in-one-215kwh.png' },
  { nameKey: 'product7Name', specKey: 'product7Spec', img: '/images/shared/10HC-container.png' },
  { nameKey: 'product8Name', specKey: 'product8Spec', img: '/images/shared/20ft-container.png' },
  {
    nameKey: 'product9Name', specKey: 'product9Spec', img: '/images/shared/40ft-container.png',
    colSpan: 'col-span-4 lg:col-span-6',
    imgClass: 'w-4/5 h-44 absolute top-[24px] left-1/2 -translate-x-1/2 object-contain transition-transform duration-300 group-hover:scale-105',
  },
]

const APLICATII: { key: keyof ReturnType<typeof getIndustrialTranslations>; img: string }[] = [
  { key: 'aplicatiiFabrici',    img: '/images/divizii/industrial/fabrica-panouri-solare.jpg' },
  { key: 'aplicatiiSolare',     img: '/images/divizii/industrial/ferme-solare.jpg' },
  { key: 'aplicatiiDate',       img: '/images/divizii/industrial/centre-de-date.jpg' },
  { key: 'aplicatiiAeroporturi',img: '/images/divizii/industrial/aeroport.jpg' },
  { key: 'aplicatiiLogistica',  img: '/images/divizii/industrial/centre-logistica.jpg' },
  { key: 'aplicatiiHoteluri',   img: '/images/divizii/industrial/hotel.jpg' },
]

const FEATURE_CARDS: { key: keyof ReturnType<typeof getIndustrialTranslations>; icon: string; labelMaxW?: string }[] = [
  { key: 'cardProiectare',  icon: '/images/shared/proiectare-icon.svg' },
  { key: 'cardInstalare',   icon: '/images/shared/instalare-icon.svg',   labelMaxW: 'max-w-[160px]' },
  { key: 'cardSolutii',     icon: '/images/shared/solutii-icon.svg' },
  { key: 'cardMentenanta',  icon: '/images/shared/maintance-icon.svg' },
  { key: 'cardSuport',      icon: '/images/shared/support-call-icon.svg' },
  { key: 'cardTestare',     icon: '/images/shared/testing-icon.svg' },
]

export default function Industrial() {
  const { setReplaceMainHeader } = useViziuneHeader()
  const { language, setLanguage } = useLanguage()
  const t  = getMenuTranslations(language.code)
  const tr = getIndustrialTranslations(language.code)

  const [showSubNav,   setShowSubNav]   = useState(false)
  const [footerInView, setFooterInView] = useState(false)
  const [activeSection, setActiveSection] = useState<SectionId>('stocare')
  const [langOpen,     setLangOpen]     = useState(false)
  const [visibleCount, setVisibleCount] = useState(2)
  const [visibleFeatureCount, setVisibleFeatureCount] = useState(4)
  const [visibleProductCount, setVisibleProductCount] = useState(2)

  const heroRef    = useRef<HTMLDivElement>(null)
  const subNavRef  = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    stocare: null, sisteme: null, aplicatii: null,
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

  useEffect(() => { setReplaceMainHeader(showSubNav); return () => setReplaceMainHeader(false) }, [showSubNav, setReplaceMainHeader])

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
    ro: 'Stocare Energie Industrial',
    en: 'Industrial Energy Storage',
    zh: '工业储能',
  }
  const seoDescriptions: Record<string, string> = {
    ro: 'Sisteme BESS LiFePo4 High Voltage pentru industrie, ferme solare și micro-griduri complexe. Soluții scalabile cu garanție 10 ani și monitorizare remotă.',
    en: 'LiFePo4 High Voltage BESS systems for industry, solar farms and complex micro-grids. Scalable solutions with 10-year warranty and remote monitoring.',
    zh: '面向工业、光伏农场和复杂微电网的LiFePo4高压BESS系统。可扩展解决方案，10年质保，远程监控。',
  }

  return (
    <>
      <SEO
        title={seoTitles[language.code] ?? seoTitles.ro}
        description={seoDescriptions[language.code] ?? seoDescriptions.ro}
        canonical="/divizii/industrial"
        ogImage="/images/divizii/industrial/baterii-stocare-industrial-og.jpg"
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
                Industrial
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
              <source media="(max-width: 1023px)" srcSet="/images/divizii/industrial/hero-card-industrial-mobile.jpg" />
              <img
                src="/images/divizii/industrial/hero-card-industrial.jpg"
                alt={tr.heroTitle}
                className="relative w-full object-cover rounded-[10px]"
                style={{ height: '440px' }}
              />
            </picture>
            <div className="absolute inset-0 bg-black/60 rounded-[10px]" aria-hidden />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-10 flex flex-col items-center gap-2 pt-4 lg:pt-0 min-w-0 z-10">
              <img src="/images/divizii/industrial/baterino-pro-industrial-logo-white.png" alt="Baterino Pro" className="h-9 w-auto max-w-[90vw] object-contain flex-shrink-0" />
              <div className="flex flex-col lg:flex-row items-center gap-1 lg:gap-2">
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
          {/* Left – title + body: 5 cols */}
          <div className="col-span-4 lg:col-span-5">
            <h2 className="text-gray-700 text-xl lg:text-3xl font-bold font-['Inter'] leading-7 lg:leading-10 mb-5">
              {tr.sectionStocareTitle}
            </h2>
            <p className="text-gray-700 text-base font-normal lg:font-medium font-['Inter'] leading-6 mb-4">
              {tr.introP1}
            </p>
            <p className="text-gray-700 text-base font-normal lg:font-medium font-['Inter'] leading-6">
              {tr.introP2}
            </p>
          </div>

          {/* Right – feature cards: 6 cols, pushed to col 7 leaving col 6 empty */}
          <div className="col-span-4 lg:col-span-6 lg:col-start-7 pt-8 lg:pt-[70px]">
            <p className="text-black text-base lg:text-lg font-bold font-['Inter'] uppercase tracking-wider leading-6 lg:leading-8 mb-4 whitespace-pre-line text-center lg:text-left">
              {tr.ctaSuport}
            </p>
            <div className="grid-12">
              {FEATURE_CARDS.map(({ key, icon, labelMaxW }, i) => (
                <div
                  key={key}
                  className={`col-span-2 lg:col-span-4 bg-neutral-100 rounded-[10px] h-36 flex flex-col items-center justify-center gap-3 px-2${i >= visibleFeatureCount ? ' hidden lg:flex' : ''}`}
                >
                  <img src={icon} alt="" className="w-9 h-9 object-contain" aria-hidden />
                  <span className={`text-center text-gray-700 text-base font-bold font-['Nunito_Sans'] leading-5 ${labelMaxW ?? 'max-w-[110px]'}`}>
                    {tr[key] as string}
                  </span>
                </div>
              ))}
            </div>

            {/* Load More – mobile only */}
            {visibleFeatureCount < FEATURE_CARDS.length && (
              <div className="flex justify-center mt-6 lg:hidden">
                <OutlineButton onClick={() => setVisibleFeatureCount(FEATURE_CARDS.length)}>
                  VEZI MAI MULT
                </OutlineButton>
              </div>
            )}
          </div>
        </section>

        {/* Section 2 – Sisteme */}
        <section
          id="sisteme"
          ref={(el) => { sectionRefs.current.sisteme = el }}
          className="mb-20 scroll-mt-20"
        >
          <h2 className="text-gray-700 text-xl lg:text-3xl font-bold font-['Inter'] leading-7 lg:leading-10 mb-8">
            {tr.sectionSistemeTitle}
          </h2>

          {/* 4 per row desktop (col-span-3), full width mobile with load more */}
          <div className="grid-12">
            {PRODUCTS.map(({ nameKey, specKey, img, colSpan, imgClass }, i) => (
              <div
                key={nameKey}
                className={`group ${colSpan ?? 'col-span-4 lg:col-span-3'} relative h-72 bg-neutral-100 rounded-[10px] overflow-hidden cursor-pointer transition-shadow duration-300 hover:shadow-md${i >= visibleProductCount ? ' hidden lg:block' : ''}`}
              >
                <img
                  src={img}
                  alt={tr[nameKey] as string}
                  className={imgClass ?? 'w-32 h-40 absolute top-[29px] left-1/2 -translate-x-1/2 object-contain transition-transform duration-300 group-hover:scale-110'}
                />
                <p className="absolute left-[28px] right-[28px] bottom-5 text-center text-black text-base lg:text-lg font-semibold font-['Inter'] leading-6 lg:leading-7">
                  {tr[nameKey] as string}
                  {tr[specKey] && <><br /><span className="font-normal">{tr[specKey] as string}</span></>}
                </p>
              </div>
            ))}
          </div>

          {/* Load More – mobile only */}
          {visibleProductCount < PRODUCTS.length && (
            <div className="flex justify-center mt-10 lg:hidden">
              <OutlineButton onClick={() => setVisibleProductCount(c => Math.min(c + 2, PRODUCTS.length))}>
                VEZI MAI MULT
              </OutlineButton>
            </div>
          )}
        </section>

        <hr className="border-t border-gray-200 my-16" />

        {/* Section 3 – Aplicații */}
        <section
          id="aplicatii"
          ref={(el) => { sectionRefs.current.aplicatii = el }}
          className="mb-20 scroll-mt-20"
        >
          <h2 className="text-black text-xl lg:text-3xl font-bold font-['Inter'] leading-7 lg:leading-10 mb-2 max-w-[510px]">
            {tr.sectionAplicatiiTitle}
          </h2>
          <p className="text-gray-700 text-base lg:text-lg font-normal lg:font-medium font-['Inter'] leading-6 lg:leading-7 max-w-[792px] mb-14">
            {tr.sectionAplicatiiDesc}
          </p>

          {/* 4 per row desktop, full width mobile with load more */}
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

          {/* Load more – mobile only */}
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
          logo="/images/shared/baterino-logo-black.svg"
          logoAlt="Baterino Romania"
          title={tr.ctaTitle}
          desc={tr.ctaDesc}
          btn1Label={tr.ctaButton}
          btn1To="/companie/viziune"
        />

      </article>
    </>
  )
}
