import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { getRezidentialTranslations } from '../i18n/rezidential'

const DIVIZII: Record<string, string> = {
  rezidential: 'Rezidențial',
  industrial: 'Industrial',
  medical: 'Medical',
  maritim: 'Maritim',
}

const ANSAMBLURI_KEYS = [
  'ansambluriHoteluri',
  'ansambluriCentre',
  'ansambluriLocuinte',
  'ansambluriFerme',
  'ansambluriStatiuni',
  'ansambluriCladiri',
  'ansambluriZone',
] as const

export default function Divizii() {
  const { slug } = useParams<{ slug: string }>()
  const { language } = useLanguage()
  const tr = slug === 'rezidential' ? getRezidentialTranslations(language.code) : null
  const title = slug ? DIVIZII[slug] ?? slug : 'Divizii'

  if (slug === 'rezidential' && tr) {
    return (
      <article className="max-w-content mx-auto px-4 py-16">
        {/* Hero */}
        <div className="w-full mx-auto mb-16 flex flex-col items-center gap-2 text-center">
          <h1 className="text-black text-lg sm:text-xl font-medium leading-tight">
            {tr.heroTitle}
          </h1>
          <p className="text-base text-gray-700 leading-relaxed max-w-[720px]">
            {tr.heroTagline}
          </p>
        </div>

        {/* Intro */}
        <section className="mb-12">
          <p className="text-base text-gray-700 leading-relaxed mb-4">{tr.introP1}</p>
          <p className="text-base text-gray-700 leading-relaxed">{tr.introP2}</p>
        </section>

        {/* Stocare energetică */}
        <section className="mb-12 scroll-mt-20">
          <h2 className="text-black text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
            {tr.sectionStocareTitle}
          </h2>
          <p className="text-base text-gray-700 leading-relaxed">{tr.sectionStocareDesc}</p>
        </section>

        {/* Aplicații reale – product cards */}
        <section className="mb-12 scroll-mt-20">
          <h2 className="text-black text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6">
            {tr.sectionAplicatiiTitle}
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50/50">
              <div className="text-black text-lg font-bold">{tr.productTRX}</div>
              <div className="text-gray-600 text-sm mt-1">{tr.productTRXSpec}</div>
              <p className="text-base text-gray-700 leading-relaxed mt-4">{tr.productDesc}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50/50">
              <div className="text-black text-lg font-bold">{tr.productHV}</div>
              <div className="text-gray-600 text-sm mt-1">{tr.productHVSpec}</div>
              <p className="text-base text-gray-700 leading-relaxed mt-4">{tr.productDesc}</p>
            </div>
          </div>
        </section>

        {/* Ansambluri rezidențiale – grid */}
        <section className="mb-12 scroll-mt-20">
          <h2 className="text-black text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6">
            {tr.sectionAnsambluriTitle}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" aria-label={tr.sectionAnsambluriTitle}>
            {ANSAMBLURI_KEYS.map((key) => (
              <li
                key={key}
                className="text-base font-semibold text-gray-900 border border-gray-200 rounded-lg px-4 py-3 bg-white"
              >
                {tr[key]}
              </li>
            ))}
          </ul>
        </section>

        {/* Sisteme LiFePo4 – TA6000 */}
        <section className="mb-12 scroll-mt-20">
          <h2 className="text-black text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
            {tr.sectionSistemeTitle}
          </h2>
          <div className="border border-gray-200 rounded-lg p-5 bg-gray-50/50 max-w-md">
            <div className="text-black text-lg font-bold">{tr.productTA6000}</div>
            <div className="text-gray-600 text-sm mt-1">{tr.productTA6000Spec}</div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-black text-xl sm:text-2xl font-extrabold mb-2">{tr.ctaTitle}</h2>
          <p className="text-base text-gray-700 leading-relaxed mb-6">{tr.ctaDesc}</p>
          <ul className="text-sm text-gray-700 space-y-2 mb-6">
            <li>{tr.ctaSuport}</li>
            <li>{tr.ctaRetur}</li>
            <li>{tr.ctaCompatibilitate}</li>
            <li>{tr.ctaGarantie}</li>
            <li>{tr.ctaVerificat}</li>
            <li>{tr.ctaSuportService}</li>
          </ul>
          <div className="flex justify-center">
            <Link
              to="/companie/viziune"
              className="w-72 h-12 px-2.5 py-[5px] bg-slate-900 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex justify-center items-center gap-3.5 text-white hover:bg-transparent hover:outline-slate-900 hover:text-black active:bg-zinc-100 active:outline-slate-900 active:text-black transition-colors font-semibold text-base"
            >
              <span className="text-center text-inherit">{tr.ctaButton}</span>
            </Link>
          </div>
        </section>
      </article>
    )
  }

  return (
    <div className="max-w-content mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-600">Divizia {title}.</p>
    </div>
  )
}
