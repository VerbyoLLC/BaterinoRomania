import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useViziuneHeader } from '../contexts/ViziuneHeaderContext'
import { useLanguage } from '../contexts/LanguageContext'
import { getMenuTranslations } from '../i18n/menu'
import { getViziuneTranslations } from '../i18n/viziune'
import { LanguageDropdown } from '../components/LanguageDropdown'
import SEO from '../components/SEO'

const SECTIONS = [
  { id: 'viziune', labelKey: 'viziune' as const },
  { id: 'misiune', labelKey: 'misiune' as const },
  { id: 'implementare', labelKey: 'implementare' as const },
  { id: 'echipa', labelKey: 'echipa' as const },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

export default function Viziune() {
  const { setReplaceMainHeader } = useViziuneHeader()
  const { language, setLanguage } = useLanguage()
  const t = getMenuTranslations(language.code)
  const tv = getViziuneTranslations(language.code)
  const [showSubNav, setShowSubNav] = useState(false)
  const [footerInView, setFooterInView] = useState(false)
  const [activeSection, setActiveSection] = useState<SectionId>('viziune')
  const [langOpen, setLangOpen] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const subNavRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    viziune: null,
    misiune: null,
    implementare: null,
    echipa: null,
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (subNavRef.current && !subNavRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    const options: IntersectionObserverInit = {
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0,
    }
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const ob = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActiveSection(id)
          })
        },
        options
      )
      ob.observe(el)
      observers.push(ob)
    })
    return () => observers.forEach((ob) => ob.disconnect())
  }, [])

  const seoTitles: Record<string, string> = {
    ro: 'Viziune, Misiune & Echipă',
    en: 'Vision, Mission & Team',
    zh: '愿景、使命与团队',
  }
  const seoDescriptions: Record<string, string> = {
    ro: 'Descoperă viziunea și misiunea Baterino Romania — distribuitor de sisteme de stocare a energiei LiFePo4, dedicat siguranței, calității și suportului tehnic pe termen lung.',
    en: 'Discover the vision and mission of Baterino Romania — a distributor of LiFePo4 energy storage systems, dedicated to safety, quality and long-term technical support.',
    zh: '了解Baterino Romania的愿景与使命——专注于LiFePo4储能系统分销，致力于安全、质量和长期技术支持。',
  }

  return (
    <>
    <SEO
      title={seoTitles[language.code] ?? seoTitles.ro}
      description={seoDescriptions[language.code] ?? seoDescriptions.ro}
      canonical="/companie/viziune"
      ogImage="/images/companie/viziune-og.jpg"
      lang={language.code}
    />
    <article className="max-w-content mx-auto px-5 lg:px-3 py-16">

      {/* Sub-nav: replaces main header on scroll – fixed, with logo + section nav + login + language */}
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
              className="text-gray-900 font-bold text-base sm:text-sm hover:text-black"
            >
              {t.home}
            </button>
            <span className="text-gray-300 select-none" aria-hidden>|</span>
            {SECTIONS.map(({ id, labelKey }, index) => (
              <span key={id} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => scrollTo(id)}
                  className={`text-base sm:text-sm transition-colors hover:text-black ${
                    activeSection === id ? 'text-gray-900 font-bold' : 'text-gray-400 font-normal'
                  }`}
                >
                  {index + 1}. {t[labelKey]}
                </button>
                {id !== 'echipa' && (
                  <span className="text-gray-300 select-none" aria-hidden>–</span>
                )}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 min-w-[120px] justify-end">
            <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium text-base sm:text-sm">
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

      {/* Back to top: fixed in right margin next to text area, hidden when footer is in view */}
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

      {/* 12-col grid: content spans 10 cols centered on desktop, full 4 cols on mobile */}
      <div className="grid-12">
      <div className="col-span-4 lg:col-span-10 lg:col-start-2">

        {/* Hero */}
        <div
          ref={heroRef}
          className="w-full mb-16 flex flex-col items-center gap-0"
        >
          <div className="text-black text-lg sm:text-xl font-medium leading-tight">
            {tv.heroTitle}
          </div>
          <div className="text-black text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight -mt-1">
            BATERINO
          </div>
        </div>

      <section className="mb-20 scroll-mt-20" id="viziune" ref={(el) => { sectionRefs.current.viziune = el }}>
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="text-black text-base sm:text-lg font-medium">{tv.capitolu1}</div>
          <div className="text-black text-2xl sm:text-3xl md:text-4xl font-extrabold">{tv.viziune}</div>
        </div>
        <p className="text-base text-gray-700 leading-relaxed mb-4">{tv.viziuneP1}</p>
        <p className="text-base text-gray-700 leading-relaxed">{tv.viziuneP2}</p>
      </section>

      <section className="mb-20 scroll-mt-20" id="misiune" ref={(el) => { sectionRefs.current.misiune = el }}>
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="text-black text-base sm:text-lg font-medium">{tv.capitolu2}</div>
          <div className="text-black text-2xl sm:text-3xl md:text-4xl font-extrabold">{tv.misiune}</div>
        </div>
        <p className="text-base text-gray-700 leading-relaxed mb-4">{tv.misiuneP1}</p>
        <p className="text-base text-gray-700 leading-relaxed mb-4">{tv.misiuneP2}</p>
        <p className="text-base text-gray-700 leading-relaxed mb-4">{tv.misiuneP3}</p>
        <p className="text-base text-gray-700 leading-relaxed">{tv.misiuneP4}</p>
      </section>

      <section className="mb-20 scroll-mt-20" id="implementare" ref={(el) => { sectionRefs.current.implementare = el }}>
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="text-black text-base sm:text-lg font-medium">{tv.capitolu3}</div>
          <div className="text-black text-2xl sm:text-3xl md:text-4xl font-extrabold">{tv.implementare}</div>
        </div>
        <p className="text-base text-gray-700 leading-relaxed mb-4">{tv.implementareP1}</p>
        <p className="text-base text-gray-700 leading-relaxed mb-4">{tv.implementareP2}</p>
        <p className="text-base text-gray-700 leading-relaxed mb-4">{tv.implementareP3}</p>
        <p className="text-base text-gray-700 leading-relaxed">{tv.implementareP4}</p>
      </section>

      <section className="mb-12 scroll-mt-20" id="echipa" ref={(el) => { sectionRefs.current.echipa = el }}>
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="text-black text-base sm:text-lg font-medium">{tv.capitolu4}</div>
          <div className="text-black text-2xl sm:text-3xl md:text-4xl font-extrabold">{tv.echipa}</div>
        </div>
        <p className="text-base text-gray-700 leading-relaxed mb-4">{tv.echipaP1}</p>
        <p className="text-base text-gray-700 leading-relaxed mb-4">{tv.echipaP2}</p>
        <p className="text-base text-gray-700 leading-relaxed">{tv.echipaP3}</p>
        <div className="flex justify-center mt-16">
          <Link
            to="/companie"
            className="w-72 h-12 px-2.5 py-[5px] bg-slate-900 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex justify-center items-center gap-3.5 text-white hover:bg-transparent hover:outline-slate-900 hover:text-black active:bg-zinc-100 active:outline-slate-900 active:text-black transition-colors"
          >
            <span className="text-center text-base font-semibold font-['Inter'] leading-normal text-inherit">
              {tv.discutaCuNoi}
            </span>
          </Link>
        </div>
      </section>

      </div>{/* col-span-10 */}
      </div>{/* grid-12 */}
    </article>
    </>
  )
}
