import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { getReduceriTranslations } from '../i18n/reduceri'
import SEO from '../components/SEO'
import CTABar from '../components/CTABar'
import { ReduceriProgramCard } from '../components/reduceri/ReduceriProgramCard'

/* ── How to apply panel ────────────────────────────────────────── */
function HowToApply({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="bg-neutral-100 rounded-[10px] flex flex-col items-center justify-center px-10 pt-3.5 pb-10">
      <h3 className="text-black text-2xl font-bold font-['Inter'] leading-8 text-center w-full mb-6">
        {title}
      </h3>
      <div className="flex flex-col gap-6 w-full flex-1 justify-around">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center gap-2 text-center">
            {/* Number circle on top */}
            <div className="size-12 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg font-extrabold font-['Inter']">{i + 1}</span>
            </div>
            {/* Text below */}
            <p className="text-black text-lg font-semibold font-['Inter'] leading-7">
              {step}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function Reduceri() {
  const { language } = useLanguage()
  const tr = getReduceriTranslations(language.code)

  const [p1, p2, p3, p4] = tr.programs

  return (
    <>
      <SEO
        title={tr.seoTitle}
        description={tr.seoDesc}
        canonical="/reduceri"
        ogImage="/images/programe%20reduceri/programe-reduceri-baterii-sisteme-fotovoltaice-baterino-og.jpg"
        lang={language.code}
      />

      <article className="max-w-content mx-auto px-5 lg:px-3 pt-12 pb-24">

        {/* ── HERO ── */}
        <header className="text-center mb-12 lg:mb-14">
          <h1 className="text-black text-3xl lg:text-5xl font-extrabold font-['Inter'] leading-tight mb-4">
            {tr.heroTitle}
          </h1>
          <p className="text-gray-600 text-base lg:text-lg font-normal font-['Inter'] leading-7 max-w-[560px] mx-auto">
            {tr.heroSubtitle}
          </p>
        </header>

        {/* ── MOBILE: single column with dividers + How to Apply at end ── */}
        <div className="flex flex-col md:hidden mb-10">
          {[p1, p2, p3, p4].map((program, i) => (
            <div key={i}>
              <ReduceriProgramCard program={program} />
              <hr className="border-gray-200 my-10" />
            </div>
          ))}
          <HowToApply title={tr.howTitle} steps={tr.howSteps} />
          <Link
            to="/login"
            className="w-full h-14 mt-6 bg-slate-900 rounded-[10px] inline-flex justify-center items-center text-white text-base font-semibold font-['Inter'] hover:bg-slate-700 transition-colors"
          >
            {tr.programs[0].ctaLabel}
          </Link>
        </div>

        {/* ── DESKTOP ROW 1: first 3 cards ── */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 mb-14 items-stretch">
          {[p1, p2, p3].map((program, i) => (
            <ReduceriProgramCard key={i} program={program} />
          ))}
        </div>

        {/* ── DESKTOP ROW 2: 4th card + How to Apply ── */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 mb-16 lg:mb-20 items-start">
          <ReduceriProgramCard program={p4} />
          <HowToApply title={tr.howTitle} steps={tr.howSteps} />
        </div>

        {/* ── BOTTOM CTA — desktop only ── */}
        <div className="hidden md:block">
          <CTABar
            logo="/images/shared/baterino-logo-black.svg"
            logoAlt="Baterino"
            logoClassName="h-8 lg:h-10"
            title={tr.ctaBarTitle}
            desc={tr.ctaBarDesc}
            btn1Label={tr.ctaBarBtn}
            btn1To="/produse"
          />
        </div>

      </article>
    </>
  )
}
