import { useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { PRODUCTS } from '../i18n/produse'
import { getReduceriTranslations } from '../i18n/reduceri'
import SEO from '../components/SEO'

/* ── Types ──────────────────────────────────────────────────────── */
type ProductDetail = {
  shortDesc: string
  specs: { label: string; value: string }[]
  images: string[]
  discountedPrice: number
  documents: { name: string; type: string; url: string }[]
  faq: { q: string; a: string }[]
  techData: [string, string][]
}

/* ── Product detail data ─────────────────────────────────────────── */
const DETAILS: Record<string, ProductDetail> = {
  'ecohome-5': {
    shortDesc:
      'Pentru locuințe individuale cu 2–4 camere, optimizat pentru integrare cu invertoare de 10–15 kVA.',
    specs: [
      { label: 'Capacitate',           value: '100Ah' },
      { label: 'Capacitate nominală',   value: '5.1 kWh' },
      { label: 'Cicluri de descărcare', value: '5,000 (la 60% DOD)' },
      { label: 'Compatibilitate',       value: 'Nivel 4 — Siguranță ridicată' },
      { label: 'Dimensiuni',            value: '460 × 400 × 130 mm' },
      { label: 'Greutate',              value: '46 kg' },
      { label: 'Temperatura operare',   value: '-20 ~ 55°C' },
    ],
    images: ['/images/shared/eco-home5kwh-lithtech.png'],
    discountedPrice: 15840,
    documents: [
      { name: 'Fisa Tehnica EcoHome5', type: 'PDF',  url: '#' },
      { name: 'Manual Tehnica',        type: 'BPSA', url: '#' },
    ],
    faq: [
      {
        q: 'Cât durează instalarea unei baterii EcoHome 5?',
        a: 'Instalarea standard durează 2–4 ore și include conectarea la invertor, testarea sistemului și configurarea aplicației mobile.',
      },
      {
        q: 'Ce invertoare sunt compatibile cu EcoHome 5?',
        a: 'EcoHome 5 este compatibil cu invertoarele Huawei SUN2000, SolarEdge StorEdge, Fronius Symo GEN24 și alte modele cu protocol CAN/RS485.',
      },
      {
        q: 'Care este durata garanției?',
        a: 'EcoHome 5 vine cu garanție extinsă de 10 ani acoperind defecte de fabricație și degradarea capacității sub 70% din capacitatea nominală.',
      },
      {
        q: 'Pot conecta mai multe baterii în paralel?',
        a: 'Da, până la 4 unități EcoHome 5 pot fi conectate în paralel pentru o capacitate totală de 20.48 kWh.',
      },
      {
        q: 'Are nevoie de mentenanță periodică?',
        a: 'Nu sunt necesare lucrări de mentenanță periodică. BMS-ul monitorizează automat starea și performanța bateriei.',
      },
    ],
    techData: [
      ['Tensiune nominală',          '51.2V'],
      ['Capacitate',                 '100Ah'],
      ['Energie nominală',           '5,120 Wh'],
      ['Curent max. descărcare',     '100A'],
      ['Curent max. încărcare',      '50A'],
      ['Adâncime descărcare (DOD)',  '60%'],
      ['Eficiență ciclu complet',    '≥ 96%'],
      ['Temperatura funcționare',    '-20 ~ 55°C'],
      ['Temperatura stocare',        '-10 ~ 50°C'],
      ['Umiditate',                  '5 ~ 95% (fără condensare)'],
      ['Greutate',                   '46 kg'],
      ['Dimensiuni (L × l × h)',     '460 × 400 × 130 mm'],
      ['Protecție',                  'IP20'],
      ['Certificări',                'CE, IEC 62133, UN38.3'],
      ['Garanție',                   '10 ani'],
    ],
  },
  'hp2000': {
    shortDesc: 'Sistem All-in-One cu invertor integrat, ideal pentru case cu consum ridicat și back-up automat.',
    specs: [
      { label: 'Capacitate',           value: '200Ah' },
      { label: 'Capacitate nominală',   value: '10.24 kWh' },
      { label: 'Cicluri de descărcare', value: '6,000 (la 80% DOD)' },
      { label: 'Compatibilitate',       value: 'All-in-One — invertor integrat' },
      { label: 'Dimensiuni',            value: '600 × 220 × 700 mm' },
      { label: 'Greutate',              value: '82 kg' },
      { label: 'Temperatura operare',   value: '-10 ~ 50°C' },
    ],
    images: ['/images/shared/HP2000-all-in-one.png'],
    discountedPrice: 22880,
    documents: [
      { name: 'Fisa Tehnica HP2000', type: 'PDF',  url: '#' },
      { name: 'Manual Instalare',    type: 'PDF',  url: '#' },
    ],
    faq: [
      { q: 'HP2000 are invertor integrat?',           a: 'Da, HP2000 este un sistem All-in-One care include invertor hibrid, BMS și sistem de management al energiei.' },
      { q: 'Cât timp ține back-up-ul cu HP2000?',     a: 'La un consum mediu de 500W, HP2000 asigură back-up de aproximativ 18–20 ore în regim autonom.' },
      { q: 'Se poate instala în exterior?',           a: 'HP2000 este certificat IP54 și poate fi instalat în exterior, la adăpost de precipitații directe.' },
      { q: 'Necesită un invertor suplimentar?',       a: 'Nu. Invertorul este integrat în unitate. Este nevoie doar de racordarea la panouri fotovoltaice și la rețeaua casei.' },
      { q: 'Care este garanția produsului?',          a: 'HP2000 beneficiază de 10 ani garanție extinsă Baterino.' },
    ],
    techData: [
      ['Tensiune nominală',          '51.2V'],
      ['Capacitate',                 '200Ah'],
      ['Energie nominală',           '10,240 Wh'],
      ['Curent max. descărcare',     '200A'],
      ['Curent max. încărcare',      '100A'],
      ['Adâncime descărcare (DOD)',  '80%'],
      ['Eficiență ciclu complet',    '≥ 97%'],
      ['Temperatura funcționare',    '-10 ~ 50°C'],
      ['Greutate',                   '82 kg'],
      ['Dimensiuni (L × l × h)',     '600 × 220 × 700 mm'],
      ['Protecție',                  'IP54'],
      ['Certificări',                'CE, IEC 62109, UN38.3'],
      ['Garanție',                   '10 ani'],
    ],
  },
}

/* ── Trust badges ─────────────────────────────────────────────────── */
const BADGES = [
  { icon: '/images/shared/swap-icon.svg',          label: 'SWAP+',              sub: 'pentru service'       },
  { icon: '/images/shared/service-icon.svg',       label: 'Import & Service',   sub: 'în Romania'           },
  { icon: '/images/shared/delivery-icon.svg',      label: 'Garanție livrată',   sub: '10 ani'               },
  { icon: '/images/shared/compatibility-icon.svg', label: 'Compatibilitate',    sub: 'cu 99% invertoare'    },
  { icon: '/images/shared/testing-icon.svg',       label: 'Testat',             sub: '30 zile pre-vânzare'  },
  { icon: '/images/shared/safety-icon.svg',        label: 'Retur',              sub: '15 zile'              },
]

/* ── FAQ item ─────────────────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-zinc-200 last:border-0">
      <button
        className="w-full flex items-center justify-between py-4 text-left gap-4"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-black text-base font-medium font-['Inter']">{q}</span>
        <svg
          className={`w-5 h-5 text-black flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <p className="text-gray-600 text-sm font-['Inter'] leading-6 pb-4 pr-8">{a}</p>
      )}
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────── */
export default function ProductRezidential() {
  const { id } = useParams<{ id: string }>()
  const language = useLanguage()
  const product = PRODUCTS.find(p => p.id === id)
  const details  = DETAILS[id ?? '']
  const { programs } = getReduceriTranslations(language.code)

  const [activeImage, setActiveImage] = useState(0)
  const [qty, setQty]                 = useState(2)

  if (!product || !details) return <Navigate to="/produse" replace />

  const discount = Math.round((1 - details.discountedPrice / product.price) * 100)

  return (
    <>
      <SEO
        title={product.name}
        description={details.shortDesc}
        canonical={`/produse/${id}`}
        lang="ro"
      />

      <div className="max-w-content mx-auto px-5 lg:px-3 pt-6 pb-24">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 font-['Inter'] mb-8">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link to="/divizii/rezidential" className="hover:text-black transition-colors">Rezidential</Link>
          <span>/</span>
          <Link to="/produse" className="hover:text-black transition-colors">Produse</Link>
        </nav>

        {/* ── Two-column layout: left sticky, right scrolls ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* LEFT: sticky product info */}
          <div className="lg:col-span-5 flex flex-col lg:sticky lg:top-6 self-start">

            {/* Name */}
            <h1 className="text-black text-2xl lg:text-3xl font-bold font-['Inter'] leading-tight mb-3">
              {product.name}
            </h1>

            {/* Short desc */}
            <p className="text-gray-600 text-base font-['Inter'] leading-6 mb-7">
              {details.shortDesc}
            </p>

            {/* Specs */}
            <div className="flex flex-col gap-2.5 mb-8 border-t border-zinc-100 pt-5">
              {details.specs.map((s, i) => (
                <div key={i} className="flex gap-2 text-sm font-['Inter'] items-baseline">
                  <span className="font-bold text-black w-[180px] flex-shrink-0">{s.label}:</span>
                  <span className="text-gray-700">{s.value}</span>
                </div>
              ))}
            </div>

            {/* Quantity */}
            <div className="mb-5">
              <p className="text-xs font-bold font-['Inter'] text-gray-400 uppercase tracking-widest mb-2">
                CANTITATE
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-[10px] bg-neutral-100 flex items-center justify-center text-lg font-bold hover:bg-neutral-200 transition-colors"
                >
                  −
                </button>
                <span className="text-black text-base font-semibold font-['Inter'] w-8 text-center">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-10 h-10 rounded-[10px] bg-neutral-100 flex items-center justify-center text-lg font-bold hover:bg-neutral-200 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Discount selector */}
            <div className="mb-7 py-3">
              <p className="text-xs font-bold font-['Inter'] text-gray-400 uppercase tracking-widest mb-2">
                ALEGE PROGRAM REDUCERI
              </p>
              <div className="relative inline-flex items-center">
                <select className="appearance-none h-10 pl-4 pr-10 bg-neutral-100 rounded-[10px] text-black text-sm font-semibold font-['Inter'] cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors">
                  <option>Fără reducere</option>
                  {programs.map((p, i) => (
                    <option key={i} value={p.discountPercent ?? 0}>
                      {p.title}
                    </option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute right-3 w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Price */}
            <div className="mb-7">
              <p className="text-xs font-['Inter'] text-gray-400 uppercase tracking-widest mb-1">
                PREȚ FĂRĂ DISCOUNT TVA
              </p>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-gray-400 text-lg font-['Inter'] line-through">
                  {product.price.toLocaleString('ro-RO')} RON
                </span>
                <span className="text-xs font-bold font-['Inter'] text-white bg-red-500 px-2 py-0.5 rounded-full">
                  -{discount}%
                </span>
              </div>
              <p className="text-black text-3xl font-bold font-['Inter']">
                {details.discountedPrice.toLocaleString('ro-RO')}{' '}
                <span className="text-xl font-semibold">RON</span>
              </p>
            </div>

            {/* CTA */}
            <button className="w-full h-14 bg-slate-900 text-white rounded-[10px] text-base font-bold font-['Inter'] uppercase hover:bg-slate-700 active:bg-black transition-colors tracking-wide">
              COMANDĂ
            </button>
          </div>

          {/* RIGHT: everything that scrolls */}
          <div className="lg:col-span-6 lg:col-start-7 flex flex-col gap-5">

            {/* Image carousel */}
            <div className="bg-neutral-100 rounded-[10px] flex items-center justify-center relative overflow-hidden h-[460px] cursor-zoom-in">
              <img
                src={details.images[activeImage]}
                alt={product.name}
                className="max-h-[420px] w-auto object-contain"
              />

              {/* Left arrow */}
              <button
                onClick={() => setActiveImage(i => (i - 1 + details.images.length) % (details.images.length || 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Right arrow */}
              <button
                onClick={() => setActiveImage(i => (i + 1) % (details.images.length || 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                aria-label="Next image"
              >
                <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {(details.images.length > 1 ? details.images : ['', '', '']).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => details.images[i] && setActiveImage(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === activeImage ? 'bg-black' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Trust badges — row 1 (4 cols) */}
            <div className="grid grid-cols-4 gap-3">
              {BADGES.slice(0, 4).map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-2 bg-neutral-100 rounded-[10px] py-4 px-2 text-center">
                  <img src={b.icon} alt="" aria-hidden className="w-8 h-8 object-contain" />
                  <p className="text-black text-xs font-bold font-['Inter'] leading-tight">{b.label}</p>
                  <p className="text-gray-500 text-xs font-['Inter'] leading-tight">{b.sub}</p>
                </div>
              ))}
            </div>

            {/* Trust badges — row 2 (2 items left-aligned) */}
            <div className="grid grid-cols-4 gap-3">
              {BADGES.slice(4).map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-2 bg-neutral-100 rounded-[10px] py-4 px-2 text-center">
                  <img src={b.icon} alt="" aria-hidden className="w-8 h-8 object-contain" />
                  <p className="text-black text-xs font-bold font-['Inter'] leading-tight">{b.label}</p>
                  <p className="text-gray-500 text-xs font-['Inter'] leading-tight">{b.sub}</p>
                </div>
              ))}
            </div>

            {/* Documents */}
            <div>
              <h3 className="text-black text-base font-bold font-['Inter'] mb-3">Documente Tehnice</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {details.documents.map((doc, i) => (
                  <a
                    key={i}
                    href={doc.url}
                    className="flex items-center gap-3 px-4 py-3 rounded-[10px] border border-zinc-200 hover:bg-neutral-50 hover:border-slate-400 hover:shadow-md transition-all duration-200"
                  >
                    <img src="/images/shared/download-icon.svg" alt="" aria-hidden className="w-5 h-5 flex-shrink-0" />
                    <span className="text-black text-sm font-medium font-['Inter'] flex-1">
                      {doc.name}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase">.{doc.type}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* ── Technical data ── */}
            <section>
              <h2 className="text-black text-2xl font-bold font-['Inter'] mb-6">
                Date tehnice despre produs
              </h2>
              <div className="bg-neutral-100 rounded-[10px] overflow-hidden">
                <div className="grid grid-cols-1">
                  {details.techData.map(([key, val], i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 px-6 py-3.5 border-b border-zinc-200 last:border-0"
                    >
                      <span className="text-gray-500 text-sm font-['Inter'] w-[200px] flex-shrink-0">{key}</span>
                      <span className="text-black text-sm font-semibold font-['Inter']">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── FAQ ── */}
            <section>
              <h2 className="text-black text-2xl font-bold font-['Inter'] mb-2">Întrebări frecvente</h2>
              {details.faq.map((item, i) => (
                <FAQItem key={i} q={item.q} a={item.a} />
              ))}
            </section>

            {/* ── Reduceri banner ── */}
            <section className="flex flex-col gap-4">
              <div className="w-full max-w-[592px] h-64 relative rounded-[10px] overflow-hidden">
                <img
                  className="absolute inset-0 w-full h-full object-cover rounded-[10px]"
                  src="/images/product/baterino-swap.jpg"
                  alt=""
                />
                <div className="absolute inset-0 bg-black/50 rounded-[10px]" />
                <div className="absolute left-[32px] top-[66px] w-40 h-12 z-10 text-white text-3xl font-bold font-['Inter'] leading-8">
                  ȘTIAI CĂ?
                </div>
                <div className="absolute left-[32px] top-[121px] w-80 h-24 z-10 text-white text-lg font-semibold font-['Inter'] leading-6">
                  Baterino îți oferă la schimb o baterie atunci când produsul tău se află în service pentru diagnoză sau mentenanță.
                </div>
              </div>
              <div className="w-full max-w-[589px] h-64 relative overflow-hidden rounded-[10px]">
                <div className="absolute inset-0 bg-neutral-100 rounded-[10px]" />
                <img
                  className="absolute inset-0 w-full h-full object-cover rounded-[10px]"
                  src="/images/product/reduceri-banner.jpg"
                  alt=""
                />
                <div className="absolute inset-0 bg-black/50 rounded-[10px]" />
                <div className="absolute left-[28px] top-[61px] w-80 z-10 text-white text-xl font-bold font-['Inter'] leading-8">
                  UTILIZEAZĂ PROGRAMELE NOASTRE DE REDUCERI
                </div>
                <div className="absolute left-[27px] top-[144px] w-96 z-10 text-white text-lg font-medium font-['Inter'] leading-6">
                  Creează un cont pe platforma Baterino și alege programul de reducere care ți se potrivește.
                </div>
                <Link
                  to="/reduceri"
                  className="absolute right-[28px] top-[166px] w-40 h-9 px-4 bg-white rounded-[5px] inline-flex justify-center items-center gap-2 hover:bg-neutral-100 transition-colors z-10"
                >
                  <span className="text-black text-sm font-bold font-['Nunito_Sans'] uppercase">intră în cont</span>
                </Link>
                <img
                  className="absolute right-[28px] top-[15px] w-20 h-4 object-contain object-right z-10"
                  src="/images/programe%20reduceri/baterino-white-logo.png"
                  alt="Baterino"
                />
              </div>
            </section>

            {/* ── Not sure CTA ── */}
            <section>
              <div className="bg-neutral-100 rounded-[10px] flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-7">
                <div>
                  <h3 className="text-black text-xl font-bold font-['Inter'] mb-1">Nu ești sigur ce ți se potrivește?</h3>
                  <p className="text-gray-600 text-sm font-['Inter'] leading-5">
                    Discută cu echipa noastră și află care este cea mai bună soluție pentru tine.
                  </p>
                </div>
                <Link
                  to="/contact"
                  className="flex-shrink-0 h-12 px-8 bg-slate-900 text-white rounded-[10px] inline-flex items-center justify-center text-sm font-bold font-['Inter'] uppercase hover:bg-slate-700 transition-colors whitespace-nowrap"
                >
                  CONTACTEAZĂ-NE
                </Link>
              </div>
            </section>

          </div>{/* end right column */}
        </div>{/* end grid */}

      </div>
    </>
  )
}
