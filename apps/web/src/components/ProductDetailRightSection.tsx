import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import type { PublicProduct } from '../lib/api'
import type { ProductDetailTranslations } from '../i18n/product-detail'

function whToKwhDisplay(wh: string | null | undefined): string | null {
  if (!wh) return null
  const numStr = String(wh).replace(/\s*Wh$/i, '').replace(',', '.').replace(/\s/g, '')
  const num = parseFloat(numStr)
  if (Number.isNaN(num)) return wh
  const kwh = num / 1000
  return `${kwh % 1 === 0 ? kwh.toFixed(0) : kwh.toFixed(2)} kWh`
}

function buildTechData(p: PublicProduct, tr: ProductDetailTranslations): [string, string][] {
  const rows: [string, string][] = []
  const add = (k: string, v: unknown) => {
    if (v != null && typeof v === 'string') rows.push([k, v])
  }
  const energieDisplay = whToKwhDisplay(p.energieNominala)
  if (energieDisplay) rows.push([tr.specEnergieNominala, energieDisplay])
  add(tr.specCapacitate, p.capacitate)
  add(tr.techCurentMaxDescarcare, (p as { curentMaxDescarcare?: string }).curentMaxDescarcare)
  add(tr.techCurentMaxIncarcare, (p as { curentMaxIncarcare?: string }).curentMaxIncarcare)
  add(tr.specCicluriDescarcare, p.cicluriDescarcare)
  add(tr.techAdancimeDescarcare, (p as { adancimeDescarcare?: string }).adancimeDescarcare)
  add(tr.specGreutate, (p as { greutate?: string }).greutate)
  add(tr.techDimensiuni, (p as { dimensiuni?: string }).dimensiuni)
  add(tr.techProtectie, (p as { protectie?: string }).protectie)
  add(tr.techCertificari, (p as { certificari?: string }).certificari)
  add(tr.techGarantie, (p as { garantie?: string }).garantie)
  add(tr.techTensiuneNominala, p.tensiuneNominala)
  add(tr.techEficientaCiclu, (p as { eficientaCiclu?: string }).eficientaCiclu)
  add(tr.techTemperaturaFunctionare, (p as { temperaturaFunctionare?: string }).temperaturaFunctionare)
  add(tr.techTemperaturaStocare, (p as { temperaturaStocare?: string }).temperaturaStocare)
  add(tr.techUmiditate, (p as { umiditate?: string }).umiditate)
  return rows
}

function getBadges(tr: ProductDetailTranslations) {
  return [
    { icon: '/images/shared/testing-icon.svg', label: tr.badgeGarantie, id: 'garantie' },
    { icon: '/images/shared/compatibility-icon.svg', label: tr.badgeCompatibilitate, id: 'compatibilitate' },
    { icon: '/images/shared/safety-icon.svg', label: tr.badgeProducatori, id: 'producatori' },
    { icon: '/images/shared/delivery-icon.svg', label: tr.badgeRetur, id: 'retur' },
    { icon: '/images/shared/swap-icon.svg', label: tr.badgeSwap, id: 'swap' },
    { icon: '/images/shared/maintance-icon.svg', label: tr.badgeSuport, id: 'suport' },
  ]
}

function ProductImageWithLoader({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  useEffect(() => {
    setLoaded(false)
    const checkComplete = () => { if (imgRef.current?.complete) setLoaded(true) }
    checkComplete()
    const t = setTimeout(checkComplete, 50)
    return () => clearTimeout(t)
  }, [src])
  if (!src) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <img src="/images/shared/baterino-logo-black.svg" alt="" className="w-24 h-12 object-contain opacity-30" aria-hidden />
      </div>
    )
  }
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img src="/images/shared/baterino-logo-black.svg" alt="" className="w-24 h-12 object-contain opacity-30 animate-pulse" aria-hidden />
        </div>
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`max-h-[280px] lg:max-h-[420px] w-auto object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
    </div>
  )
}

function ProductImageModal({ images, activeIndex, onSelect, onClose, productTitle, closeLabel, prevLabel, nextLabel }: {
  images: string[]
  activeIndex: number
  onSelect: (i: number) => void
  onClose: () => void
  productTitle: string
  closeLabel: string
  prevLabel: string
  nextLabel: string
}) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30" onClick={onClose} role="dialog" aria-modal="true" aria-label="Galerie imagini produs">
      <button type="button" onClick={onClose} className="absolute top-4 right-4 z-[70] w-10 h-10 rounded-full bg-white hover:bg-neutral-100 flex items-center justify-center text-black shadow-md transition-colors" aria-label={closeLabel}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      <div className="flex flex-col w-fit h-fit max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex items-center justify-center p-2 min-w-0 min-h-0">
          {images.length > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); onSelect((activeIndex - 1 + images.length) % images.length) }} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-black transition-colors" aria-label={prevLabel}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); onSelect((activeIndex + 1) % images.length) }} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-black transition-colors" aria-label={nextLabel}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
          <img src={images[activeIndex]} alt={productTitle} className="max-w-[70vw] max-h-[85vh] w-auto h-auto object-contain" />
          <img src="/images/shared/baterino-logo-black.svg" alt="Baterino" className="absolute bottom-5 left-1/2 -translate-x-1/2 h-10 w-auto object-contain opacity-80 pointer-events-none" />
        </div>
        <div className="flex flex-row gap-2 justify-center py-3 px-2 overflow-x-auto flex-shrink-0">
          {images.map((src, i) => (
            <button key={i} type="button" onClick={(e) => { e.stopPropagation(); onSelect(i) }} className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === activeIndex ? 'border-slate-900 ring-2 ring-slate-900/30' : 'border-transparent hover:border-neutral-300'}`}>
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function BadgeModal({ onClose, title, desc, icon }: { onClose: () => void; title: string; desc: string; icon: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className="relative w-full max-w-[650px] bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors" aria-label="Închide">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="flex flex-col gap-6 p-8 sm:p-10">
          <div className="flex items-center gap-5">
            <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center">
              <img src={icon} alt="" aria-hidden className="w-10 h-10 object-contain" />
            </div>
            <h1 className="text-black text-xl sm:text-2xl font-semibold font-['Inter'] leading-tight">{title}</h1>
          </div>
          <p className="text-neutral-700 text-base sm:text-lg font-['Inter'] leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  )
}

export type ProductDetailRightSectionProps = {
  product: PublicProduct
  tr: ProductDetailTranslations
  langCode: string
  /** Hide SWAP/Reduceri banners and contact CTA (for partner panel) */
  compact?: boolean
  /** When set (partner panel tabs), only render the corresponding section */
  partnerTab?: 'detalii' | 'tehnice' | 'manuale' | 'videos'
}

export default function ProductDetailRightSection({ product, tr, langCode: _langCode, compact = false, partnerTab }: ProductDetailRightSectionProps) {
  const [activeImage, setActiveImage] = useState(0)
  const [showCompatibilitate99Modal, setShowCompatibilitate99Modal] = useState(false)
  const [showGarantieModal, setShowGarantieModal] = useState(false)
  const [showProducatoriModal, setShowProducatoriModal] = useState(false)
  const [showReturModal, setShowReturModal] = useState(false)
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [showSuportModal, setShowSuportModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)

  const imgs = Array.isArray(product.images) ? product.images : []
  const img = imgs[activeImage] || imgs[0] || '/images/shared/HP2000-all-in-one.png'
  const techData = buildTechData(product, tr)
  const badges = getBadges(tr)
  const docs = (product as { documenteTehnice?: { descriere: string; url: string }[] }).documenteTehnice || []

  const showDetalii = !partnerTab || partnerTab === 'detalii'
  const showTehnice = !partnerTab || partnerTab === 'tehnice'
  const showManuale = partnerTab === 'manuale'
  /** Documente tehnice: in partner panel only in Manuale tab; on main product page show with rest of content */
  const showDocumenteTehnice = showManuale || !partnerTab

  if (partnerTab === 'videos') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
        <svg className="w-14 h-14 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p className="text-base font-['Inter']">Videoclipuri de instalare vor fi disponibile în curând.</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {showDetalii && (
        <>
        <div
          className="bg-neutral-100 rounded-[10px] flex items-center justify-center relative overflow-hidden h-[320px] lg:h-[460px] cursor-zoom-in"
          onClick={() => setShowImageModal(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setShowImageModal(true)}
          aria-label="Mărire imagine"
        >
          {imgs.length > 1 ? (
            <>
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/80 shadow-sm pointer-events-none">
                <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-black text-sm font-semibold font-['Inter']">{activeImage + 1}/{imgs.length}</span>
              </div>
              <div className="flex w-full h-full transition-transform duration-300 ease-out" style={{ transform: `translateX(-${activeImage * 100}%)` }}>
                {imgs.map((src, i) => (
                  <div key={i} className="flex-shrink-0 w-full h-full flex items-center justify-center">
                    <ProductImageWithLoader src={src} alt={product.title} />
                  </div>
                ))}
              </div>
              <button onClick={(e) => { e.stopPropagation(); setActiveImage((i) => (i - 1 + imgs.length) % imgs.length) }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-sm flex items-center justify-center z-10 cursor-pointer" aria-label={tr.ariaPrev}>
                <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); setActiveImage((i) => (i + 1) % imgs.length) }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-sm flex items-center justify-center z-10 cursor-pointer" aria-label={tr.ariaNext}>
                <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          ) : (
            <ProductImageWithLoader src={img} alt={product.title} />
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {badges.map((b, i) => (
            b.id === 'compatibilitate' ? (
              <button key={i} type="button" onClick={() => setShowCompatibilitate99Modal(true)} className="flex flex-col items-center gap-2 bg-neutral-100 rounded-[10px] py-4 px-2 text-center hover:bg-neutral-200 transition-colors cursor-pointer">
                <img src={b.icon} alt="" aria-hidden className="w-8 h-8 object-contain" />
                <p className="text-black text-xs font-bold font-['Inter'] leading-tight">{b.label}</p>
              </button>
            ) : b.id === 'garantie' ? (
              <button key={i} type="button" onClick={() => setShowGarantieModal(true)} className="flex flex-col items-center gap-2 bg-neutral-100 rounded-[10px] py-4 px-2 text-center hover:bg-neutral-200 transition-colors cursor-pointer">
                <img src={b.icon} alt="" aria-hidden className="w-8 h-8 object-contain" />
                <p className="text-black text-xs font-bold font-['Inter'] leading-tight">{b.label}</p>
              </button>
            ) : b.id === 'producatori' ? (
              <button key={i} type="button" onClick={() => setShowProducatoriModal(true)} className="flex flex-col items-center gap-2 bg-neutral-100 rounded-[10px] py-4 px-2 text-center hover:bg-neutral-200 transition-colors cursor-pointer">
                <img src={b.icon} alt="" aria-hidden className="w-8 h-8 object-contain" />
                <p className="text-black text-xs font-bold font-['Inter'] leading-tight">{b.label}</p>
              </button>
            ) : b.id === 'retur' ? (
              <button key={i} type="button" onClick={() => setShowReturModal(true)} className="flex flex-col items-center gap-2 bg-neutral-100 rounded-[10px] py-4 px-2 text-center hover:bg-neutral-200 transition-colors cursor-pointer">
                <img src={b.icon} alt="" aria-hidden className="w-8 h-8 object-contain" />
                <p className="text-black text-xs font-bold font-['Inter'] leading-tight">{b.label}</p>
              </button>
            ) : b.id === 'swap' ? (
              <button key={i} type="button" onClick={() => setShowSwapModal(true)} className="flex flex-col items-center gap-2 bg-neutral-100 rounded-[10px] py-4 px-2 text-center hover:bg-neutral-200 transition-colors cursor-pointer">
                <img src={b.icon} alt="" aria-hidden className="w-8 h-8 object-contain" />
                <p className="text-black text-xs font-bold font-['Inter'] leading-tight">{b.label}</p>
              </button>
            ) : b.id === 'suport' ? (
              <button key={i} type="button" onClick={() => setShowSuportModal(true)} className="flex flex-col items-center gap-2 bg-neutral-100 rounded-[10px] py-4 px-2 text-center hover:bg-neutral-200 transition-colors cursor-pointer">
                <img src={b.icon} alt="" aria-hidden className="w-8 h-8 object-contain" />
                <p className="text-black text-xs font-bold font-['Inter'] leading-tight">{b.label}</p>
              </button>
            ) : (
              <div key={i} className="flex flex-col items-center gap-2 bg-neutral-100 rounded-[10px] py-4 px-2 text-center">
                <img src={b.icon} alt="" aria-hidden className="w-8 h-8 object-contain" />
                <p className="text-black text-xs font-bold font-['Inter'] leading-tight">{b.label}</p>
              </div>
            )
          ))}
        </div>
        </>
        )}

        {showDocumenteTehnice && docs.length > 0 && (
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

        {showTehnice && techData.length > 0 && (
          <section>
            <h2 className="text-black text-2xl font-bold font-['Inter'] mb-6">{tr.dateTehnice}</h2>
            <ul className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              {techData.map(([key, val], i) => (
                <li key={i} className="min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-neutral-500 font-['Inter']">
                    {key}
                  </span>
                  <span className="mt-1.5 block text-sm font-semibold text-neutral-900 font-['Inter'] leading-snug break-words">
                    {val}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!compact && (
          <>
            <section className="flex flex-col gap-4">
              <div className="w-full max-w-[592px] h-64 relative rounded-[10px] overflow-hidden">
                <img className="absolute inset-0 w-full h-full object-cover rounded-[10px]" src="/images/product/baterino-swap.jpg" alt="" />
                <div className="absolute inset-0 bg-black/50 rounded-[10px]" />
                <div className="absolute left-[32px] top-[66px] z-10 text-white text-3xl font-bold font-['Inter']">{tr.stiaiCa}</div>
                <div className="absolute left-[32px] top-[121px] w-80 z-10 text-white text-lg font-semibold font-['Inter'] leading-6">{tr.swapDesc}</div>
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
          </>
        )}
      </div>

      {showCompatibilitate99Modal && <BadgeModal onClose={() => setShowCompatibilitate99Modal(false)} title={tr.compatibilitate99Title} desc={tr.compatibilitate99Desc} icon="/images/shared/compatibility-icon.svg" />}
      {showGarantieModal && <BadgeModal onClose={() => setShowGarantieModal(false)} title={tr.garantieModalTitle} desc={tr.garantieModalDesc} icon="/images/shared/testing-icon.svg" />}
      {showProducatoriModal && <BadgeModal onClose={() => setShowProducatoriModal(false)} title={tr.producatoriModalTitle} desc={tr.producatoriModalDesc} icon="/images/shared/safety-icon.svg" />}
      {showReturModal && <BadgeModal onClose={() => setShowReturModal(false)} title={tr.returModalTitle} desc={tr.returModalDesc} icon="/images/shared/delivery-icon.svg" />}
      {showSwapModal && <BadgeModal onClose={() => setShowSwapModal(false)} title={tr.swapModalTitle} desc={tr.swapModalDesc} icon="/images/shared/swap-icon.svg" />}
      {showSuportModal && <BadgeModal onClose={() => setShowSuportModal(false)} title={tr.suportModalTitle} desc={tr.suportModalDesc} icon="/images/shared/maintance-icon.svg" />}
      {showImageModal &&
        createPortal(
          <ProductImageModal
            images={imgs.length > 0 ? imgs : [img]}
            activeIndex={activeImage}
            onSelect={setActiveImage}
            onClose={() => setShowImageModal(false)}
            productTitle={product.title}
            closeLabel={tr.compatibilitateClose}
            prevLabel={tr.ariaPrev}
            nextLabel={tr.ariaNext}
          />,
          document.body
        )}
    </>
  )
}
