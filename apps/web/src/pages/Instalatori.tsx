import { Link, Navigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { getAuthRole } from '../lib/api'
import { INSTALATORI_ONLY } from '../lib/siteMode'
import { getInstallatoriTranslations } from '../i18n/instalatori'
import SEO from '../components/SEO'
import SchemaOrg from '../components/SchemaOrg'
import CTABar from '../components/CTABar'
import InstalatorSignupBox from '../components/InstalatorSignupBox'

function PriceTagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden>
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 5v4h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function BadgeCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

const BENEFIT_CARDS = [
  {
    Icon: PriceTagIcon,
    titleKey: 'imageCard1' as const,
    desc: { ro: 'Prețuri stabile, marje competitive și protecție comercială pentru partenerii noștri.', en: 'Stable prices, competitive margins and commercial protection for our partners.' },
  },
  {
    Icon: TruckIcon,
    titleKey: 'imageCard2' as const,
    desc: { ro: 'Menținem stoc permanent pentru toate modelele și garantăm livrarea în 48 de ore.', en: 'We maintain permanent stock for all models and guarantee delivery within 48 hours.' },
  },
  {
    Icon: ShieldIcon,
    titleKey: 'imageCard3' as const,
    desc: { ro: 'Service 24/7, garanție 10 ani și sistem SWAP — nu rămâi niciodată singur față de client.', en: '24/7 service, 10-year warranty and SWAP system — you are never left alone facing the client.' },
  },
  {
    Icon: BadgeCheckIcon,
    titleKey: 'imageCard4' as const,
    desc: { ro: 'Produse certificate și testate riguros, cu documentație completă și instalare simplificată.', en: 'Rigorously certified and tested products, with full documentation and simplified installation.' },
  },
]

export default function Instalatori() {
  const { language } = useLanguage()
  const tr = getInstallatoriTranslations(language.code)

  if (getAuthRole() === 'sales_agent') return <Navigate to="/sales-agent" replace />
  if (getAuthRole() === 'client') return <Navigate to={INSTALATORI_ONLY ? '/client' : '/produse'} replace />

  return (
    <>
      <SEO
        title={tr.seoTitle}
        description={tr.seoDesc}
        canonical="/instalatori"
        ogImage="/images/instalatori/instalatori-sisteme-fotovoltaice.webp"
        lang={language.code}
      />
      <SchemaOrg schema={[
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: tr.seoTitle,
          description: tr.seoDesc,
          url: 'https://baterino.ro/instalatori',
          inLanguage: language.code,
          publisher: { '@type': 'Organization', name: 'Baterino Romania', url: 'https://baterino.ro' },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Acasă', item: 'https://baterino.ro' },
            { '@type': 'ListItem', position: 2, name: 'Instalatori', item: 'https://baterino.ro/instalatori' },
          ],
        },
      ]} />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div className="relative">
        <section className="relative bg-slate-900">
          <img
            src="/images/instalatori/instalatori-sisteme-fotovoltaice.webp"
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-25 select-none"
          />
          <div className="relative max-w-content mx-auto px-5 lg:px-3 pt-20 pb-0 lg:pt-28 lg:pb-32 flex flex-col lg:flex-row lg:items-center lg:gap-12 xl:gap-16">

            {/* Left: hero text */}
            <div className="flex-1 mb-10 lg:mb-0">
              <p className="text-white text-sm sm:text-base font-semibold uppercase tracking-[0.2em] mb-5 font-['Inter']">
                {tr.supertitle}
              </p>
              <h1 className="text-white text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold font-['Inter'] leading-tight mb-6">
                {tr.heroTitle}
              </h1>
              <p className="text-white/70 text-base sm:text-lg font-normal font-['Inter'] leading-7 mb-10 max-w-lg">
                {tr.introText.split('\n\n').slice(-1)[0].replace(/\*\*/g, '')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/signup/clienti?tab=partener"
                  className="hidden lg:inline-flex h-12 px-8 items-center justify-center bg-white text-black text-sm font-bold font-['Inter'] uppercase tracking-wide rounded-[10px] hover:bg-neutral-100 transition-colors"
                >
                  {tr.btn1}
                </Link>
                <a
                  href="/documents/brosura-baterino-partener-ro.pdf"
                  download="Brosura Baterino - Partener - RO.pdf"
                  className="hidden lg:inline-flex h-12 px-8 items-center justify-center gap-2 border border-white/25 text-white text-sm font-bold font-['Inter'] uppercase tracking-wide rounded-[10px] hover:bg-white/10 transition-colors"
                >
                  {tr.btn2}
                </a>
              </div>
            </div>

            {/* Desktop: signup box inside hero */}
            <div id="signup-box" className="hidden lg:block lg:w-[380px] xl:w-[400px] shrink-0">
              <InstalatorSignupBox />
            </div>

          </div>

          {/* Mobile: spacer extends dark bg to midpoint of signup box */}
          <div className="lg:hidden h-56" aria-hidden />
        </section>

        {/* Mobile: signup box overlapping hero boundary */}
        <div id="signup-box-mobile" className="lg:hidden px-5 max-w-content mx-auto -mt-56 relative z-10 pb-10">
          <InstalatorSignupBox />
        </div>
      </div>

      <div className="max-w-content mx-auto px-5 lg:px-3 pt-16 lg:pt-20">
        <h2 className="text-black text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Inter'] leading-tight uppercase text-center">
          {tr.featuresTitle}
        </h2>
      </div>

      <div className="max-w-content mx-auto px-5 lg:px-3 pb-24">

        {/* ── BENEFIT CARDS ────────────────────────────────────────── */}
        <section className="pt-10 lg:pt-12 mb-20 lg:mb-28">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[10px]">
            {BENEFIT_CARDS.map(({ Icon, titleKey, desc }) => (
              <div
                key={titleKey}
                className="flex flex-col rounded-[10px] bg-[#f7f7f7] px-4 py-5 sm:px-5 sm:py-6 lg:px-6 lg:py-6 transition-shadow duration-200 hover:shadow-lg"
              >
                <div className="mb-3 size-10 text-black shrink-0">
                  <Icon />
                </div>
                <h3 className="mb-1.5 text-base font-semibold font-['Inter'] leading-snug text-black sm:text-base">
                  {tr[titleKey]}
                </h3>
                <p className="flex-1 text-sm font-normal font-['Inter'] leading-relaxed text-gray-600">
                  {desc[language.code as 'ro' | 'en'] ?? desc.ro}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES – left title / right 2×2 cards ──────────────── */}
        <section className="mb-16 lg:mb-24">
          <div className="flex flex-col lg:flex-row lg:gap-16 xl:gap-20 lg:items-start">

            {/* Left: title + subtitle */}
            <div className="lg:w-[38%] shrink-0 mb-10 lg:mb-0 lg:sticky lg:top-24">
              <p className="text-gray-400 text-base sm:text-lg font-semibold uppercase tracking-[0.2em] mb-1 font-['Inter']">
                {language.code === 'en' ? 'For partners' : 'Pentru parteneri'}
              </p>
              <h2 className="text-black text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Inter'] leading-tight uppercase mb-4">
                {tr.feat1Title}
              </h2>
              <p className="text-gray-500 text-base font-normal font-['Inter'] leading-7">
                {tr.feat1Intro}
              </p>
            </div>

            {/* Right: 4 pricing feature cards */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
              {[
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
                  title: tr.feat1Cards[0],
                  desc: language.code === 'en' ? 'Stable acquisition costs — you can quote projects with confidence, with no fluctuation risk.' : 'Costuri de achiziție constante — poți oferta proiecte cu încredere, fără risc de fluctuație.',
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden><circle cx="12" cy="12" r="10"/><line x1="14.5" y1="9.5" x2="9.5" y2="14.5"/><circle cx="9.5" cy="9.5" r="0.5" fill="currentColor"/><circle cx="14.5" cy="14.5" r="0.5" fill="currentColor"/></svg>,
                  title: tr.feat1Cards[1],
                  desc: language.code === 'en' ? 'Progressive discounts based on monthly volume. The more you grow, the better your margin.' : 'Discount-uri progresive în funcție de volumul lunar. Cu cât crești, cu atât marja ta crește.',
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden><path d="M2 21h20"/><path d="M2 21V7l7-4v4l7-4v4l7-4v14"/><path d="M6 14v2M11 14v2M16 14v2"/></svg>,
                  title: tr.feat1Cards[2],
                  desc: language.code === 'en' ? 'Baterino partners are eligible for large C&I projects — technical support, quoting and co-representation.' : 'Partenerii Baterino sunt eligibili pentru proiecte industriale de anvergură — suport tehnic, ofertare și co-reprezentare comercială.',
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
                  title: tr.feat1Cards[4],
                  desc: language.code === 'en' ? 'Your territory is protected by agreement. Baterino never sells direct to your end clients and never competes with its own partner network.' : 'Teritoriul tău este protejat prin acord. Baterino nu vinde direct către clienții tăi finali și nu concurează niciodată cu propria rețea de parteneri.',
                },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="flex flex-col rounded-[10px] bg-[#f7f7f7] px-4 py-5 sm:px-5 sm:py-6 transition-shadow duration-200 hover:shadow-lg"
                >
                  <div className="mb-3 size-10 text-black shrink-0">
                    {icon}
                  </div>
                  <h3 className="mb-1.5 text-base font-semibold font-['Inter'] leading-snug text-black">
                    {title}
                  </h3>
                  <p className="flex-1 text-sm font-normal font-['Inter'] leading-relaxed text-gray-600">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── RESPONSABILITATE PRODUS – left title / right cards ───── */}
        <section className="mb-16 lg:mb-24">
          <div className="flex flex-col lg:flex-row lg:gap-16 xl:gap-20 lg:items-start">

            {/* Left */}
            <div className="lg:w-[38%] shrink-0 mb-10 lg:mb-0 lg:sticky lg:top-24">
              <p className="text-gray-400 text-base sm:text-lg font-semibold uppercase tracking-[0.2em] mb-1 font-['Inter']">
                {language.code === 'en' ? 'After-sales support' : 'Suport post-vânzare'}
              </p>
              <h2 className="text-black text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Inter'] leading-tight uppercase mb-4">
                {tr.feat2Title}
              </h2>
              <p className="text-gray-500 text-base font-normal font-['Inter'] leading-7">
                {tr.feat2Intro}
              </p>
            </div>

            {/* Right: feat2Cards as icon+title+desc cards */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
              {[
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
                  title: tr.feat2Cards[0],
                  desc: language.code === 'en' ? 'Local engineers available during business hours — fast response, without involving the manufacturer in China.' : 'Ingineri locali disponibili în timpul programului — intervenție rapidă, fără să implici producătorul din China.',
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>,
                  title: tr.feat2Cards[1],
                  desc: language.code === 'en' ? 'We swap the faulty unit fast, no red tape — your client stays operational, your reputation intact.' : 'Schimbăm unitatea defectă rapid, fără birocrație — clientul tău rămâne funcțional, reputația ta intactă.',
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden><path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>,
                  title: tr.feat2Cards[2],
                  desc: language.code === 'en' ? 'Throughout the entire diagnosis and repair period, the client receives a replacement battery. Not a single day without storage.' : 'Pe toată durata diagnozei și reparației, clientul primește o baterie de schimb. Nicio zi fără stocare.',
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
                  title: tr.feat2Cards[3],
                  desc: language.code === 'en' ? 'We do not delegate warranty to a third party. We manage it directly — from registration to final resolution.' : 'Nu delegăm garanția unui terț. O gestionăm direct — de la înregistrare până la rezoluție finală.',
                },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="flex flex-col rounded-[10px] bg-[#f7f7f7] px-4 py-5 sm:px-5 sm:py-6 transition-shadow duration-200 hover:shadow-lg"
                >
                  <div className="mb-3 size-10 text-black shrink-0">
                    {icon}
                  </div>
                  <h3 className="mb-1.5 text-base font-semibold font-['Inter'] leading-snug text-black">
                    {title}
                  </h3>
                  <p className="flex-1 text-sm font-normal font-['Inter'] leading-relaxed text-gray-600">
                    {desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── ȘTIAI CĂ? – CTA banner ───────────────────────────────── */}
        <div className="relative mb-16 lg:mb-24 rounded-2xl overflow-hidden">
          <img
            src="/images/instalatori/cta-instalatori.webp"
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/80" />
          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_2.5fr_auto] gap-8 lg:gap-10 items-center px-8 py-10 lg:px-12 lg:py-14">

            {/* Left */}
            <div className="flex flex-col items-start">
              <span className="text-white text-sm font-semibold uppercase tracking-[0.2em] font-['Inter'] mb-2">
                {language.code === 'en' ? 'For installers' : 'Pentru instalatori'}
              </span>
              <p className="text-white text-2xl sm:text-3xl font-extrabold font-['Inter'] leading-tight uppercase">
                {language.code === 'en' ? 'Did you know?' : 'Știai că?'}
              </p>
            </div>

            {/* Middle */}
            <div className="lg:border-l lg:border-r border-white/15 lg:px-10">
              <p className="text-white/85 text-base sm:text-lg font-normal font-['Inter'] leading-7">
                {language.code === 'en'
                  ? 'As an installer, you can reserve products on the Baterino platform for 7 days with no upfront payment — and have them delivered directly to your installation site.'
                  : 'Dacă ești Instalator, îți poți rezerva produsele tale în platforma Baterino, pentru 7 zile fără a fi nevoie să le plătești în avans, iar ele îți pot fi livrate direct la locul unde faci instalarea?'}
              </p>
            </div>

            {/* Right */}
            <div className="flex lg:justify-end">
              <button
                type="button"
                onClick={() => {
                  const id = window.innerWidth >= 1024 ? 'signup-box' : 'signup-box-mobile'
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }}
                className="inline-flex h-12 px-8 items-center justify-center bg-white text-black text-sm font-bold font-['Inter'] uppercase tracking-wide rounded-[10px] hover:bg-neutral-100 transition-colors whitespace-nowrap"
              >
                {language.code === 'en' ? 'Become a Partner' : 'Devino Partener'}
              </button>
            </div>

          </div>
        </div>

        {/* ── POZITIONARE BRAND – left title / right cards ─────────── */}
        <section className="mb-16 lg:mb-24">
          <div className="flex flex-col lg:flex-row lg:gap-16 xl:gap-20 lg:items-start">

            {/* Left */}
            <div className="lg:w-[38%] shrink-0 mb-10 lg:mb-0 lg:sticky lg:top-24">
              <h2 className="text-black text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Inter'] leading-tight uppercase mb-4">
                {tr.feat3Title}
              </h2>
              <p className="text-gray-500 text-base font-normal font-['Inter'] leading-7">
                {tr.feat3Intro}
              </p>
            </div>

            {/* Right: 3 cards */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
              {[
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>,
                  title: tr.feat3Cards[0],
                  desc: language.code === 'en' ? 'We generate demand for portfolio products — leads go to partners in your area.' : 'Generăm cerere pentru produsele din portofoliu — lead-urile ajung la partenerii din zona ta.',
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/><polyline points="16 11 17 13 20 10"/></svg>,
                  title: tr.feat3Cards[1],
                  desc: language.code === 'en' ? 'We invest in LithTech brand reputation in Romania — the client comes to you already informed and convinced.' : 'Investim în reputația brandului LithTech în România — clientul vine la tine deja informat și convins.',
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
                  title: tr.feat3Cards[2],
                  desc: language.code === 'en' ? 'We monitor the market and maintain a stable price structure — your margin is protected from unfair competition.' : 'Supraveghem piața și menținem o structură de prețuri stabilă — marja ta este protejată de concurența neloială.',
                },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="flex flex-col rounded-[10px] bg-[#f7f7f7] px-4 py-5 sm:px-5 sm:py-6 transition-shadow duration-200 hover:shadow-lg"
                >
                  <div className="mb-3 size-10 text-black shrink-0">
                    {icon}
                  </div>
                  <h3 className="mb-1.5 text-base font-semibold font-['Inter'] leading-snug text-black">
                    {title}
                  </h3>
                  <p className="flex-1 text-sm font-normal font-['Inter'] leading-relaxed text-gray-600">
                    {desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── GENERĂM LEAD-URI – left title / right cards ──────────── */}
        <section className="mb-16 lg:mb-24">
          <div className="flex flex-col lg:flex-row lg:gap-16 xl:gap-20 lg:items-start">

            {/* Left */}
            <div className="lg:w-[38%] shrink-0 mb-10 lg:mb-0 lg:sticky lg:top-24">
              <h2 className="text-black text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Inter'] leading-tight uppercase mb-4">
                {tr.feat4Title}
              </h2>
              <p className="text-gray-500 text-base font-normal font-['Inter'] leading-7">
                {tr.feat4Intro}
              </p>
            </div>

            {/* Right: 4 cards */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
              {[
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                  title: tr.feat4Cards[0],
                  desc: language.code === 'en' ? 'Every Baterino client in your area is directed to you — not to a call center, not to a competitor.' : 'Fiecare client Baterino din zona ta este direcționat către tine — nu către un call center, nu către un concurent.',
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
                  title: tr.feat4Cards[1],
                  desc: language.code === 'en' ? 'Your company appears in the Baterino app and platform — where clients search for verified installers.' : 'Compania ta apare în aplicația și platforma Baterino — acolo unde clienții caută instalatori verificați.',
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
                  title: tr.feat4Cards[2],
                  desc: language.code === 'en' ? 'We also route periodic maintenance requests to you — recurring revenue, not just installation.' : 'Direcționăm către tine și solicitările de mentenanță periodică — venit recurent, nu doar la instalare.',
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                  title: tr.feat4Cards[3],
                  desc: language.code === 'en' ? 'We are not looking for installers for a single transaction. We build stable relationships — with support, training and shared growth.' : 'Nu căutăm instalatori pentru o singură tranzacție. Construim relații stabile — cu suport, training și creștere comună.',
                },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="flex flex-col rounded-[10px] bg-[#f7f7f7] px-4 py-5 sm:px-5 sm:py-6 transition-shadow duration-200 hover:shadow-lg"
                >
                  <div className="mb-3 size-10 text-black shrink-0">
                    {icon}
                  </div>
                  <h3 className="mb-1.5 text-base font-semibold font-['Inter'] leading-snug text-black">
                    {title}
                  </h3>
                  <p className="flex-1 text-sm font-normal font-['Inter'] leading-relaxed text-gray-600">
                    {desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <CTABar
          logo="/images/shared/baterino-logo-black.svg"
          logoAlt="Baterino Romania"
          title={tr.ctaTitle}
          desc={tr.ctaDesc}
          btn1Label={tr.ctaBtn1}
          btn1To="/companie/viziune"
          btn2Label={tr.ctaBtn2}
          btn2To="/companie/viziune"
        />

      </div>
    </>
  )
}
