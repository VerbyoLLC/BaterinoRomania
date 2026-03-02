import { useState, useEffect, useMemo } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { getProduct, type PublicProduct } from '../lib/api'
import { getReduceriTranslations } from '../i18n/reduceri'
import { getProductDetailTranslations, type ProductDetailTranslations } from '../i18n/product-detail'
import SEO from '../components/SEO'

/* ── Inverter compatibility list (common brands) ─────────────────── */
const INVERTER_BRANDS = [
  'Huawei', 'SolarEdge', 'SMA', 'Fronius', 'Victron', 'GoodWe', 'Growatt',
  'Solis', 'Sungrow', 'Kostal', 'Solarwatt', 'Sofar', 'Deye', 'Hyundai',
  'LG', 'Samsung', 'Delta', 'ABB', 'Schneider', 'Siemens', 'Kaco', 'Refu',
]

/* ── Build specs and techData from DB product ──────────────────── */
function buildSpecs(p: PublicProduct, tr: ProductDetailTranslations) {
  const specs: { label: string; value: string }[] = []
  const str = (v: unknown) => (v != null ? String(v) : '')
  if (p.capacitate) specs.push({ label: tr.specCapacitate, value: str(p.capacitate) })
  if (p.energieNominala) specs.push({ label: tr.specEnergieNominala, value: str(p.energieNominala) })
  if (p.cicluriDescarcare) specs.push({ label: tr.specCicluriDescarcare, value: str(p.cicluriDescarcare) })
  if (p.dimensiuni) specs.push({ label: tr.specDimensiuni, value: str(p.dimensiuni) })
  if (p.greutate) specs.push({ label: tr.specGreutate, value: str(p.greutate) })
  if (p.temperaturaFunctionare) specs.push({ label: tr.specTemperaturaOperare, value: str(p.temperaturaFunctionare) })
  return specs
}

function buildTechData(p: PublicProduct, tr: ProductDetailTranslations): [string, string][] {
  const rows: [string, string][] = []
  const add = (k: string, v: unknown) => {
    if (v != null && typeof v === 'string') rows.push([k, v])
  }
  add(tr.specEnergieNominala, p.energieNominala)
  add(tr.specCapacitate, p.capacitate)
  add(tr.techCurentMaxDescarcare, (p as { curentMaxDescarcare?: string }).curentMaxDescarcare)
  add(tr.techCurentMaxIncarcare, (p as { curentMaxIncarcare?: string }).curentMaxIncarcare)
  add(tr.specCicluriDescarcare, p.cicluriDescarcare)
  add(tr.techAdancimeDescarcare, (p as { adancimeDescarcare?: string }).adancimeDescarcare)
  add(tr.specGreutate, p.greutate)
  add(tr.techDimensiuni, p.dimensiuni)
  add(tr.techProtectie, (p as { protectie?: string }).protectie)
  add(tr.techCertificari, (p as { certificari?: string }).certificari)
  add(tr.techGarantie, (p as { garantie?: string }).garantie)
  add(tr.techTensiuneNominala, p.tensiuneNominala)
  add(tr.techEficientaCiclu, (p as { eficientaCiclu?: string }).eficientaCiclu)
  add(tr.techTemperaturaFunctionare, p.temperaturaFunctionare)
  add(tr.techTemperaturaStocare, (p as { temperaturaStocare?: string }).temperaturaStocare)
  add(tr.techUmiditate, (p as { umiditate?: string }).umiditate)
  return rows
}

function getBadges(tr: ProductDetailTranslations) {
  return [
    { icon: '/images/shared/testing-icon.svg', label: tr.badgeGarantie },
    { icon: '/images/shared/compatibility-icon.svg', label: tr.badgeCompatibilitate },
    { icon: '/images/shared/safety-icon.svg', label: tr.badgeProducatori },
    { icon: '/images/shared/delivery-icon.svg', label: tr.badgeRetur },
    { icon: '/images/shared/swap-icon.svg', label: tr.badgeSwap },
    { icon: '/images/shared/maintance-icon.svg', label: tr.badgeSuport },
  ]
}

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

/* ── Compatibilitate invertor modal ─────────────────────────────── */
function CompatibilitateInvertorModal({ onClose, tr }: { onClose: () => void; tr: ProductDetailTranslations }) {
  const [search, setSearch] = useState('')
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return INVERTER_BRANDS
    return INVERTER_BRANDS.filter((b) => b.toLowerCase().includes(q))
  }, [search])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-[10px] shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <h3 className="text-black text-lg font-bold font-['Inter']">{tr.compatibilitateTitle}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors"
            aria-label={tr.compatibilitateClose}
          >
            <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-4 py-3 border-b border-zinc-100">
          <input
            type="text"
            placeholder={tr.compatibilitateSearch}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-4 pr-4 rounded-[10px] bg-neutral-100 text-black text-base font-['Inter'] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <ul className="space-y-1">
            {filtered.map((brand) => (
              <li key={brand} className="py-2.5 px-3 rounded-[10px] hover:bg-neutral-100 text-black text-base font-medium font-['Inter']">
                {brand}
              </li>
            ))}
          </ul>
          {filtered.length === 0 && (
            <p className="text-gray-500 text-sm font-['Inter'] py-4 text-center">{tr.compatibilitateNoResults}</p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function ProductRezidential() {
  const { id } = useParams<{ id: string }>()
  const { language } = useLanguage()
  const tr = getProductDetailTranslations(language.code)
  const [product, setProduct] = useState<PublicProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { programs } = getReduceriTranslations(language.code)

  const [activeImage, setActiveImage] = useState(0)
  const [qty, setQty] = useState(1)
  const [showCompatibilitateModal, setShowCompatibilitateModal] = useState(false)

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
        {tr.loading}
      </div>
    )
  }
  if (error || !product) return <Navigate to="/produse" replace />

  const imgs = Array.isArray(product.images) ? product.images : []
  const img = imgs[activeImage] || imgs[0] || '/images/shared/HP2000-all-in-one.png'
  const specs = buildSpecs(product, tr)
  const techData = buildTechData(product, tr)
  const badges = getBadges(tr)
  const docs = (product as { documenteTehnice?: { descriere: string; url: string }[] }).documenteTehnice || []
  const faq = (product as { faq?: { q: string; a: string }[] }).faq || []
  const price = Number(product.salePrice) || 0
  const divisionLabel = product.tipProdus === 'industrial' ? tr.sectorIndustrial : tr.sectorRezidential

  return (
    <>
      <SEO title={product.title} description={product.description || ''} canonical={`/produse/${id}`} lang={language.code} />

      <div className="max-w-content mx-auto px-5 lg:px-3 pt-6 pb-24 overflow-visible">
        <nav className="flex items-center gap-2 text-sm text-gray-500 font-['Inter'] mb-8">
          <Link to="/" className="hover:text-black transition-colors">{tr.breadcrumbHome}</Link>
          <span>/</span>
          <Link to="/produse" className="hover:text-black transition-colors">{tr.breadcrumbProducts}</Link>
          <span>/</span>
          <span className="text-black">{divisionLabel}</span>
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

              <div className="mb-5 lg:mb-6">
                <p className="text-xs font-bold font-['Inter'] text-gray-400 uppercase tracking-widest mb-2">{tr.compatibilitateLabel}</p>
                <button
                  type="button"
                  onClick={() => setShowCompatibilitateModal(true)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-[10px] bg-neutral-100 hover:bg-neutral-200 transition-colors text-left"
                >
                  <img src="/images/shared/compatibility-icon.svg" alt="" aria-hidden className="w-8 h-8 object-contain flex-shrink-0" />
                  <span className="text-black text-sm font-semibold font-['Inter']">{tr.verificareCompatibilitate}</span>
                  <svg className="w-4 h-4 text-gray-500 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="mb-5">
                <p className="text-xs font-bold font-['Inter'] text-gray-400 uppercase tracking-widest mb-2">{tr.cantitateLabel}</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 rounded-[10px] bg-neutral-100 flex items-center justify-center text-lg font-bold hover:bg-neutral-200 transition-colors">−</button>
                  <span className="text-black text-base font-semibold font-['Inter'] w-8 text-center">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} className="w-10 h-10 rounded-[10px] bg-neutral-100 flex items-center justify-center text-lg font-bold hover:bg-neutral-200 transition-colors">+</button>
                </div>
              </div>

              <div className="mb-5 lg:mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="flex-shrink-0">
                  <p className="text-xs font-['Inter'] text-gray-400 uppercase tracking-widest mb-1">{tr.pretLabel}</p>
                  <p className="text-black text-3xl font-bold font-['Inter']">
                    {price.toLocaleString(language.code === 'ro' ? 'ro-RO' : language.code === 'zh' ? 'zh-CN' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span className="text-xl font-semibold">RON</span>
                  </p>
                  <p className="text-neutral-800 text-xs font-medium font-['Nunito_Sans'] mt-1">{tr.includesTVA}</p>
                </div>
                <div>
                  <p className="text-xs font-bold font-['Inter'] text-gray-400 uppercase tracking-widest mb-2">{tr.alegeProgramReduceri}</p>
                  <div className="relative inline-flex items-center">
                    <select className="appearance-none h-10 pl-4 pr-10 bg-neutral-100 rounded-[10px] text-black text-sm font-semibold font-['Inter'] cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors w-[280px]">
                      <option>{tr.faraReducere}</option>
                      {programs.map((p, i) => (
                        <option key={i} value={p.discountPercent ?? 0}>{p.title}</option>
                      ))}
                    </select>
                    <svg className="pointer-events-none absolute right-3 w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <button className="w-[min(280px,100%)] px-10 h-14 bg-slate-900 text-white rounded-[10px] text-base font-bold font-['Inter'] uppercase hover:bg-slate-700 active:bg-black transition-colors tracking-wide">
                {tr.comandaBtn}
              </button>
            </div>
          </div>

          <div className="contents lg:flex lg:flex-col lg:col-span-6 lg:col-start-7 lg:min-w-0 gap-6">
            <div className="order-2 lg:order-none flex flex-col gap-4">
              <div className="bg-neutral-100 rounded-[10px] flex items-center justify-center relative overflow-hidden h-[320px] lg:h-[460px]">
                <img src={img} alt={product.title} className="max-h-[280px] lg:max-h-[420px] w-auto object-contain" />
                {imgs.length > 1 && (
                  <>
                    <button onClick={() => setActiveImage((i) => (i - 1 + imgs.length) % imgs.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-sm flex items-center justify-center" aria-label={tr.ariaPrev}>
                      <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={() => setActiveImage((i) => (i + 1) % imgs.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-sm flex items-center justify-center" aria-label={tr.ariaNext}>
                      <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {badges.map((b, i) => (
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
                  <h3 className="text-black text-base font-bold font-['Inter'] mb-3">{tr.documenteTehnice}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {docs.map((doc, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await fetch(doc.url, { mode: 'cors' })
                            const blob = await res.blob()
                            const a = document.createElement('a')
                            a.href = URL.createObjectURL(blob)
                            a.download = ((doc.descriere || 'document').replace(/[^a-zA-Z0-9-_ăâîșțĂÂÎȘȚ\s]/g, '') || 'document') + '.pdf'
                            a.click()
                            URL.revokeObjectURL(a.href)
                          } catch {
                            window.open(doc.url, '_blank')
                          }
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-[10px] border border-zinc-200 hover:bg-neutral-50 hover:border-slate-400 transition-all w-full text-left"
                      >
                        <img src="/images/shared/download-icon.svg" alt="" aria-hidden className="w-5 h-5 flex-shrink-0" />
                        <span className="text-black text-sm font-medium font-['Inter'] flex-1">{doc.descriere || tr.document}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase">.PDF</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {techData.length > 0 && (
                <section>
                  <h2 className="text-black text-2xl font-bold font-['Inter'] mb-6">{tr.dateTehnice}</h2>
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
                  <h2 className="text-black text-2xl font-bold font-['Inter'] mb-2">{tr.intrebariFrecvente}</h2>
                  {faq.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} />)}
                </section>
              )}

              <section className="flex flex-col gap-4">
                <div className="w-full max-w-[592px] h-64 relative rounded-[10px] overflow-hidden">
                  <img className="absolute inset-0 w-full h-full object-cover rounded-[10px]" src="/images/product/baterino-swap.jpg" alt="" />
                  <div className="absolute inset-0 bg-black/50 rounded-[10px]" />
                  <div className="absolute left-[32px] top-[66px] z-10 text-white text-3xl font-bold font-['Inter']">{tr.stiaiCa}</div>
                  <div className="absolute left-[32px] top-[121px] w-80 z-10 text-white text-lg font-semibold font-['Inter'] leading-6">
                    {tr.swapDesc}
                  </div>
                </div>
                <div className="w-full max-w-[589px] h-64 relative overflow-hidden rounded-[10px]">
                  <img className="absolute inset-0 w-full h-full object-cover rounded-[10px]" src="/images/product/reduceri-banner.jpg" alt="" />
                  <div className="absolute inset-0 bg-black/50 rounded-[10px]" />
                  <div className="absolute left-[28px] top-[61px] w-80 z-10 text-white text-xl font-bold font-['Inter']">{tr.reduceriTitle}</div>
                  <div className="absolute left-[27px] top-[144px] w-96 z-10 text-white text-lg font-medium font-['Inter']">{tr.reduceriDesc}</div>
                  <Link to="/reduceri" className="absolute right-[28px] top-[166px] w-40 h-9 px-4 bg-white rounded-[5px] inline-flex justify-center items-center gap-2 hover:bg-neutral-100 transition-colors z-10">
                    <span className="text-black text-sm font-bold font-['Nunito_Sans'] uppercase">{tr.intraInCont}</span>
                  </Link>
                </div>
              </section>

              <section>
                <div className="bg-neutral-100 rounded-[10px] flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-7">
                  <div>
                    <h3 className="text-black text-xl font-bold font-['Inter'] mb-1">{tr.contactTitle}</h3>
                    <p className="text-gray-600 text-sm font-['Inter'] leading-5">{tr.contactDesc}</p>
                  </div>
                  <Link to="/companie/viziune" className="flex-shrink-0 h-12 px-8 bg-slate-900 text-white rounded-[10px] inline-flex items-center justify-center text-sm font-bold font-['Inter'] uppercase hover:bg-slate-700 transition-colors whitespace-nowrap">
                    {tr.contacteazaNe}
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {showCompatibilitateModal && (
        <CompatibilitateInvertorModal onClose={() => setShowCompatibilitateModal(false)} tr={tr} />
      )}
    </>
  )
}
