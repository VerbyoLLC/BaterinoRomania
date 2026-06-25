import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { getReduceriTranslations, type ReducereProgram } from '../i18n/reduceri'
import { getAuthToken, getPublicReducerePrograms, type ReducereProgramRow } from '../lib/api'
import SEO from '../components/SEO'
import SchemaOrg from '../components/SchemaOrg'
import { ReduceriProgramCard } from '../components/reduceri/ReduceriProgramCard'
import { CheckCircle2, ArrowRight } from 'lucide-react'

function rowToProgram(p: ReducereProgramRow): ReducereProgram {
  const { id: _id, locale: _loc, sortOrder: _so, ...rest } = p
  return rest
}

export default function Reduceri() {
  const { language } = useLanguage()
  const tr = getReduceriTranslations(language.code)
  const [apiPrograms, setApiPrograms] = useState<ReducereProgram[] | null>(null)
  const [loggedIn, setLoggedIn] = useState(() =>
    typeof window !== 'undefined' ? Boolean(getAuthToken()) : false,
  )

  useEffect(() => {
    const sync = () => setLoggedIn(Boolean(getAuthToken()))
    sync()
    window.addEventListener('baterino-auth-change', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('baterino-auth-change', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    getPublicReducerePrograms(language.code)
      .then((rows) => {
        if (!cancelled) setApiPrograms(rows.length > 0 ? rows.map(rowToProgram) : null)
      })
      .catch(() => {
        if (!cancelled) setApiPrograms(null)
      })
    return () => { cancelled = true }
  }, [language.code])

  const programs = apiPrograms ?? tr.programs

  return (
    <>
      <SEO
        title={tr.seoTitle}
        description={tr.seoDesc}
        canonical="/reduceri"
        ogImage="/images/programe%20reduceri/programe-reduceri-baterii-sisteme-fotovoltaice-baterino-og.jpg"
        lang={language.code}
      />
      <SchemaOrg schema={[
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Reduceri & Oferte',
          description: 'Programe de reducere Baterino: TVA-ul de 9%, Energie pentru Părinți, Știu de la Vecinu\' și Viața la Țară. Reduceri reale pentru oameni reali.',
          url: 'https://baterino.ro/reduceri',
          image: 'https://baterino.ro/images/programe%20reduceri/programe-reduceri-baterii-sisteme-fotovoltaice-baterino-og.jpg',
          inLanguage: 'ro',
          publisher: { '@type': 'Organization', name: 'Baterino Romania', url: 'https://baterino.ro', logo: 'https://baterino.ro/images/shared/baterino-logo-black.svg' },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Acasă', item: 'https://baterino.ro' },
            { '@type': 'ListItem', position: 2, name: 'Reduceri', item: 'https://baterino.ro/reduceri' },
          ],
        },
      ]} />

      {/* ── HERO ── */}
      <div className="bg-white pt-14 pb-16 px-5">
        <div className="max-w-content mx-auto text-center">
          <h1 className="text-slate-900 text-4xl lg:text-6xl font-extrabold font-['Inter'] leading-tight mb-4">
            {tr.heroTitle}
          </h1>
          <p className="text-slate-500 text-base lg:text-lg font-normal font-['Inter'] leading-7 max-w-[560px] mx-auto mb-8">
            {tr.heroSubtitle}
          </p>
          {!loggedIn && (
            <div className="flex flex-col items-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-[10px] bg-slate-900 text-white text-sm font-bold font-['Inter'] hover:bg-slate-700 transition-colors shadow-lg"
              >
                {programs[0]?.ctaLabel ?? tr.programs[0].ctaLabel}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              {programs[0]?.termsLabel && (
                <span className="text-slate-400 text-sm font-medium font-['Nunito_Sans'] cursor-pointer hover:text-slate-600 transition-colors">
                  {programs[0].termsLabel}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-content mx-auto px-5 lg:px-3 pb-24">

        {/* ── ALL CARDS GRID — row 1: programs 1-3, row 2: program 4 + HowToApply + CTA ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">

          {/* Program cards */}
          {programs.map((program, i) => (
            <ReduceriProgramCard key={`${program.programLabel}-${i}`} program={program} hideCta={true} />
          ))}

          {/* How to Apply — fills one column slot */}
          <div className="flex flex-col h-full">
            <div className="flex flex-col flex-1 rounded-[10px] bg-[#f7f7f7] overflow-hidden px-6 py-8">
              <h3 className="text-slate-900 text-xl font-extrabold font-['Inter'] text-center mb-8">
                {tr.howTitle}
              </h3>
              <div className="flex flex-col gap-6 flex-1 justify-around">
                {tr.howSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="size-9 rounded-full bg-sky-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-extrabold font-['Inter']">{i + 1}</span>
                    </div>
                    <p className="text-slate-700 text-sm font-semibold font-['Inter'] leading-snug pt-1.5">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA card — fills one column slot */}
          <div className="flex flex-col h-full">
            <div className="flex flex-col flex-1 rounded-[10px] bg-slate-900 overflow-hidden px-6 py-8">
              <img src="/images/shared/baterino-logo-black.svg" alt="Baterino" className="h-7 w-auto object-contain self-start invert mb-6" />
              <p className="text-white text-xl font-bold font-['Inter'] leading-snug mb-2">{tr.ctaBarTitle}</p>
              <p className="text-white/60 text-sm font-normal font-['Inter'] mb-8">{tr.ctaBarDesc}</p>
              <div className="mt-auto flex flex-col gap-3">
                <Link
                  to="/produse"
                  className="inline-flex items-center justify-center gap-2 h-11 w-full rounded-[10px] bg-white text-slate-900 text-sm font-semibold font-['Inter'] hover:bg-neutral-100 transition-colors"
                >
                  {tr.ctaBarBtn}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                {!loggedIn && (
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 h-11 w-full rounded-[10px] border border-white/30 text-white text-sm font-semibold font-['Inter'] hover:bg-white/10 transition-colors"
                  >
                    <CheckCircle2 className="size-4" aria-hidden />
                    Aplică o reducere
                  </Link>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </>
  )
}
