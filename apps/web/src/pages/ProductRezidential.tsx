import { useState, useEffect } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { getProduct, type PublicProduct } from '../lib/api'
import { getReduceriTranslations } from '../i18n/reduceri'
import SEO from '../components/SEO'

/* ── Build specs and techData from DB product ──────────────────── */
function buildSpecs(p: PublicProduct) {
  const specs: { label: string; value: string }[] = []
  if (p.capacitate) specs.push({ label: 'Capacitate', value: p.capacitate })
  if (p.energieNominala) specs.push({ label: 'Energie nominală', value: p.energieNominala })
  if (p.cicluriDescarcare) specs.push({ label: 'Cicluri de descărcare', value: p.cicluriDescarcare })
  if (p.dimensiuni) specs.push({ label: 'Dimensiuni', value: p.dimensiuni })
  if (p.greutate) specs.push({ label: 'Greutate', value: p.greutate })
  if (p.temperaturaFunctionare) specs.push({ label: 'Temperatura operare', value: p.temperaturaFunctionare })
  return specs
}

function buildTechData(p: PublicProduct): [string, string][] {
  const rows: [string, string][] = []
  const add = (k: string, v: string | null | undefined) => { if (v) rows.push([k, v]) }
  add('Energie nominală', p.energieNominala)
  add('Capacitate', p.capacitate)
  add('Curent max. descărcare', (p as { curentMaxDescarcare?: string }).curentMaxDescarcare)
  add('Curent max. încărcare', (p as { curentMaxIncarcare?: string }).curentMaxIncarcare)
  add('Cicluri de descărcare', p.cicluriDescarcare)
  add('Adâncime descărcare (DOD)', (p as { adancimeDescarcare?: string }).adancimeDescarcare)
  add('Greutate', p.greutate)
  add('Dimensiuni (L × l × h)', p.dimensiuni)
  add('Protecție', (p as { protectie?: string }).protectie)
  add('Certificări', (p as { certificari?: string }).certificari)
  add('Garanție', (p as { garantie?: string }).garantie)
  add('Tensiune nominală', p.tensiuneNominala)
  add('Eficiență ciclu complet', (p as { eficientaCiclu?: string }).eficientaCiclu)
  add('Temperatura funcționare', p.temperaturaFunctionare)
  add('Temperatura stocare', (p as { temperaturaStocare?: string }).temperaturaStocare)
  add('Umiditate', (p as { umiditate?: string }).umiditate)
  return rows
}

/* ── Trust badges ──────────────────────────────────────────────── */
const BADGES = [
  { icon: '/images/shared/testing-icon.svg', label: 'Garantie timp de 10 ani' },
  { icon: '/images/shared/compatibility-icon.svg', label: 'Compatibilitate 99% Invertoare' },
  { icon: '/images/shared/safety-icon.svg', label: 'Producatori verificati' },
  { icon: '/images/shared/delivery-icon.svg', label: 'Retur in 15 zile' },
  { icon: '/images/shared/swap-icon.svg', label: 'SWAP - Baterie la schimb' },
  { icon: '/images/shared/maintance-icon.svg', label: 'Suport & Service in Romania' },
]

/* ── FAQ item ──────────────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-zinc-200 last:border-0">
      <button className="w-full flex items-center justify-between py-4 text-left gap-4" onClick={() => setOpen((o) => !o)}>
        <span className="text-black text-base font-medium font-['Inter']">{q}</span>
        <svg className={`w-5 h-5 text-black flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <p className="text-gray-600 text-sm font-['Inter'] leading-6 pb-4 pr-8">{a}</p>}
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function ProductRezidential() {
  const { id } = useParams<{ id: string }>()
  const { language } = useLanguage()
  const [product, setProduct] = useState<PublicProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { programs } = getReduceriTranslations(language.code)

  const [activeImage, setActiveImage] = useState(0)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setError(true)
      return
    }
    getProduct(id)
      .then(setProduct)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-content mx-auto px-5 py-24 text-center text-gray-500 font-['Inter']">
        Se încarcă produsul…
      </div>
    )
  }
  if (error || !product) return <Navigate to="/produse" replace />

  const imgs = Array.isArray(product.images) ? product.images : []
  const img = imgs[activeImage] || imgs[0] || '/images/shared/HP2000-all-in-one.png'
  const specs = buildSpecs(product)
  const techData = buildTechData(product)
  const docs = (product as { documenteTehnice?: { descriere: string; url: string }[] }).documenteTehnice || []
  const faq = (product as { faq?: { q: string; a: string }[] }).faq || []
  const price = Number(product.salePrice) || 0
  const tipProdus = product.tipProdus === 'industrial' ? 'industrial' : 'rezidential'
  const divisionPath = tipProdus === 'industrial' ? '/divizii/industrial' : '/divizii/rezidential'
  const divisionLabel = tipProdus === 'industrial' ? 'Industrial' : 'Rezidențial'

  return (
    <>
      <SEO title={product.title} description={product.description || ''} canonical={`/produse/${id}`} lang="ro" />

      <div className="max-w-content mx-auto px-5 lg:px-3 pt-6 pb-24 overflow-visible">
        <nav className="flex items-center gap-2 text-sm text-gray-500 font-['Inter'] mb-8">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link to={divisionPath} className="hover:text-black transition-colors">{divisionLabel}</Link>
          <span>/</span>
          <Link to="/produse" className="hover:text-black transition-colors">Produse</Link>
        </nav>

        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:items-start gap-6 overflow-visible">
          <div className="contents lg:flex lg:flex-col lg:col-span-5 lg:col-start-1 lg:sticky lg:top-24 lg:self-start">
            <div className="order-1 lg:order-none flex flex-col">
              <h1 className="text-black text-2xl lg:text-3xl font-bold font-['Inter'] leading-tight mb-3">{product.title}</h1>
              <p className="text-gray-600 text-base font-['Inter'] leading-6 mb-4 lg:mb-5">{product.description || ''}</p>
            </div>

            <div className="order-3 lg:order-none flex flex-col">
              <div className="flex flex-col gap-2.5 mb-5 lg:mb-6 border-t border-zinc-100 pt-4 lg:pt-5">
                {specs.map((s, i) => (
                  <div key={i} className="flex gap-2 text-sm font-['Inter'] items-baseline">
                    <span className="font-bold text-black w-[180px] flex-shrink-0">{s.label}:</span>
                    <span className="text-gray-700">{s.value}</span>
                  </div>
                ))}
              </div>

              <div className="mb-5">
                <p className="text-xs font-bold font-['Inter'] text-gray-400 uppercase tracking-widest mb-2">CANTITATE</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 rounded-[10px] bg-neutral-100 flex items-center justify-center text-lg font-bold hover:bg-neutral-200 transition-colors">−</button>
                  <span className="text-black text-base font-semibold font-['Inter'] w-8 text-center">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} className="w-10 h-10 rounded-[10px] bg-neutral-100 flex items-center justify-center text-lg font-bold hover:bg-neutral-200 transition-colors">+</button>
                </div>
              </div>

              <div className="mb-5 lg:mb-6 py-2 lg:py-3">
                <p className="text-xs font-bold font-['Inter'] text-gray-400 uppercase tracking-widest mb-2">ALEGE PROGRAM REDUCERI</p>
                <div className="relative inline-flex items-center">
                  <select className="appearance-none h-10 pl-4 pr-10 bg-neutral-100 rounded-[10px] text-black text-sm font-semibold font-['Inter'] cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors">
                    <option>Fără reducere</option>
                    {programs.map((p, i) => (
                      <option key={i} value={p.discountPercent ?? 0}>{p.title}</option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="mb-5 lg:mb-6">
                <p className="text-xs font-['Inter'] text-gray-400 uppercase tracking-widest mb-1">PREȚ</p>
                <p className="text-black text-3xl font-bold font-['Inter']">
                  {price.toLocaleString('ro-RO')} <span className="text-xl font-semibold">RON</span>
                </p>
                <p className="text-neutral-800 text-xs font-medium font-['Nunito_Sans'] mt-1">include TVA</p>
              </div>

              <button className="w-[min(280px,100%)] px-10 h-14 bg-slate-900 text-white rounded-[10px] text-base font-bold font-['Inter'] uppercase hover:bg-slate-700 active:bg-black transition-colors tracking-wide">
                COMANDĂ
              </button>
            </div>
          </div>

          <div className="contents lg:flex lg:flex-col lg:col-span-6 lg:col-start-7 lg:min-w-0 gap-6">
            <div className="order-2 lg:order-none flex flex-col gap-4">
              <div className="bg-neutral-100 rounded-[10px] flex items-center justify-center relative overflow-hidden h-[320px] lg:h-[460px]">
                <img src={img} alt={product.title} className="max-h-[280px] lg:max-h-[420px] w-auto object-contain" />
                {imgs.length > 1 && (
                  <>
                    <button onClick={() => setActiveImage((i) => (i - 1 + imgs.length) % imgs.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-sm flex items-center justify-center" aria-label="Previous">
                      <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={() => setActiveImage((i) => (i + 1) % imgs.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-sm flex items-center justify-center" aria-label="Next">
                      <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {BADGES.map((b, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 bg-neutral-100 rounded-[10px] py-4 px-2 text-center">
                    <img src={b.icon} alt="" aria-hidden className="w-8 h-8 object-contain" />
                    <p className="text-black text-xs font-bold font-['Inter'] leading-tight">{b.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-4 lg:order-none flex flex-col gap-5">
              {docs.length > 0 && (
                <div>
                  <h3 className="text-black text-base font-bold font-['Inter'] mb-3">Documente Tehnice</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {docs.map((doc, i) => (
                      <a key={i} href={doc.url} className="flex items-center gap-3 px-4 py-3 rounded-[10px] border border-zinc-200 hover:bg-neutral-50 hover:border-slate-400 transition-all">
                        <img src="/images/shared/download-icon.svg" alt="" aria-hidden className="w-5 h-5 flex-shrink-0" />
                        <span className="text-black text-sm font-medium font-['Inter'] flex-1">{doc.descriere || 'Document'}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase">.PDF</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {techData.length > 0 && (
                <section>
                  <h2 className="text-black text-2xl font-bold font-['Inter'] mb-6">Date tehnice despre produs</h2>
                  <div className="bg-neutral-100 rounded-[10px] overflow-hidden">
                    <div className="grid grid-cols-1">
                      {techData.map(([key, val], i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-3.5 border-b border-zinc-200 last:border-0">
                          <span className="text-gray-500 text-sm font-['Inter'] w-[200px] flex-shrink-0">{key}</span>
                          <span className="text-black text-sm font-semibold font-['Inter']">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {faq.length > 0 && (
                <section>
                  <h2 className="text-black text-2xl font-bold font-['Inter'] mb-2">Întrebări frecvente</h2>
                  {faq.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} />)}
                </section>
              )}

              <section className="flex flex-col gap-4">
                <div className="w-full max-w-[592px] h-64 relative rounded-[10px] overflow-hidden">
                  <img className="absolute inset-0 w-full h-full object-cover rounded-[10px]" src="/images/product/baterino-swap.jpg" alt="" />
                  <div className="absolute inset-0 bg-black/50 rounded-[10px]" />
                  <div className="absolute left-[32px] top-[66px] z-10 text-white text-3xl font-bold font-['Inter']">ȘTIAI CĂ?</div>
                  <div className="absolute left-[32px] top-[121px] w-80 z-10 text-white text-lg font-semibold font-['Inter'] leading-6">
                    Baterino îți oferă la schimb o baterie atunci când produsul tău se află în service pentru diagnoză sau mentenanță.
                  </div>
                </div>
                <div className="w-full max-w-[589px] h-64 relative overflow-hidden rounded-[10px]">
                  <img className="absolute inset-0 w-full h-full object-cover rounded-[10px]" src="/images/product/reduceri-banner.jpg" alt="" />
                  <div className="absolute inset-0 bg-black/50 rounded-[10px]" />
                  <div className="absolute left-[28px] top-[61px] w-80 z-10 text-white text-xl font-bold font-['Inter']">UTILIZEAZĂ PROGRAMELE NOASTRE DE REDUCERI</div>
                  <div className="absolute left-[27px] top-[144px] w-96 z-10 text-white text-lg font-medium font-['Inter']">Creează un cont pe platforma Baterino și alege programul de reducere care ți se potrivește.</div>
                  <Link to="/reduceri" className="absolute right-[28px] top-[166px] w-40 h-9 px-4 bg-white rounded-[5px] inline-flex justify-center items-center gap-2 hover:bg-neutral-100 transition-colors z-10">
                    <span className="text-black text-sm font-bold font-['Nunito_Sans'] uppercase">intră în cont</span>
                  </Link>
                </div>
              </section>

              <section>
                <div className="bg-neutral-100 rounded-[10px] flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-7">
                  <div>
                    <h3 className="text-black text-xl font-bold font-['Inter'] mb-1">Nu ești sigur ce ți se potrivește?</h3>
                    <p className="text-gray-600 text-sm font-['Inter'] leading-5">Discută cu echipa noastră și află care este cea mai bună soluție pentru tine.</p>
                  </div>
                  <Link to="/companie" className="flex-shrink-0 h-12 px-8 bg-slate-900 text-white rounded-[10px] inline-flex items-center justify-center text-sm font-bold font-['Inter'] uppercase hover:bg-slate-700 transition-colors whitespace-nowrap">
                    CONTACTEAZĂ-NE
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
