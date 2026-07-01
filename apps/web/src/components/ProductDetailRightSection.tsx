import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import type { PublicProduct } from '../lib/api'
import type { ProductDetailTranslations } from '../i18n/product-detail'
import { getIndustrialBessTemplateTranslations } from '../i18n/industrial-bess-template'
import type { LangCode } from '../i18n/menu'
import { normalizeIndustrialTechnicalSpecs } from '../lib/industrialTechnicalSpec'
import { buildProductFlatTechRows } from '../lib/productFlatTechSpecs'
import { normalizeProductFaq } from '../lib/productFaq'
import { normalizeProductCaseStudyExamples } from '../lib/productCaseStudies'
import IndustrialTechnicalSpecTable from './IndustrialTechnicalSpecTable'
import ProductCaseStudiesSection from './product/ProductCaseStudiesSection'
import ProductDetailCtaBoxes from './product/ProductDetailCtaBoxes'

export type PartnerProductDetailTab = 'detalii' | 'tehnice' | 'manuale' | 'videos' | 'caseStudies' | 'faq'

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
          <img
            src={images[activeIndex]}
            alt={productTitle}
            className="relative z-[1] max-w-[70vw] max-h-[85vh] w-auto h-auto object-contain"
          />
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="badge-modal-title"
    >
      <div className="relative w-full max-w-[650px] bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors" aria-label="Închide">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="flex flex-col gap-6 px-8 pb-8 pt-5 sm:px-10 sm:pb-10 sm:pt-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
            <img src={icon} alt="" aria-hidden className="h-10 w-10 object-contain" />
          </div>
          <h1 id="badge-modal-title" className="m-0 text-xl font-semibold leading-tight text-black font-['Inter'] sm:text-2xl">
            {title}
          </h1>
          <p className="text-base leading-relaxed text-neutral-700 font-['Inter'] sm:text-lg">{desc}</p>
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
  partnerTab?: PartnerProductDetailTab
  /** Hide the benefit badge grid (Garanție, Compatibilitate etc.) */
  hideBadges?: boolean
}

export default function ProductDetailRightSection({ product, tr, langCode, compact = false, partnerTab, hideBadges = false }: ProductDetailRightSectionProps) {
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
  const galleryImages = imgs.length > 0 ? imgs : [img]
  const techData = buildProductFlatTechRows(product, tr)
  const industrialTr = getIndustrialBessTemplateTranslations(langCode as LangCode)
  const technicalSpecsRaw =
    product.technicalSpecsModels ??
    (product as { technical_specs_models?: unknown }).technical_specs_models
  const industrialSpecs = normalizeIndustrialTechnicalSpecs(technicalSpecsRaw) ?? { entries: [] }
  const specLabel = (key: string) => industrialTr.techSpecByKey[key] ?? key
  const hasIndustrialSpecs = industrialSpecs.entries.length > 0
  const hasFlatSpecs = techData.length > 0
  const badges = getBadges(tr)
  const docs = (product as { documenteTehnice?: { descriere: string; url: string }[] }).documenteTehnice || []
  const faqItems = normalizeProductFaq(product.faq)
  const caseStudyItems = normalizeProductCaseStudyExamples(product.caseStudyExamples)

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

  if (partnerTab === 'caseStudies') {
    return <ProductCaseStudiesSection items={caseStudyItems} />
  }

  if (partnerTab === 'faq') {
    return (
      <div className="divide-y divide-neutral-200 rounded-[10px] border border-neutral-200/80 bg-neutral-50/80">
        {faqItems.length > 0 ? (
          faqItems.map((item) => (
            <details key={item.q} className="group bg-white open:bg-neutral-50/50">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-left font-semibold text-slate-900 sm:px-5 sm:py-4 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 flex-1 text-base leading-snug">{item.q}</span>
                <ChevronDown
                  size={22}
                  strokeWidth={2}
                  className="shrink-0 text-slate-600 transition-transform duration-200 group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <div className="border-t border-neutral-100 px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
                <p className="m-0 pt-3 text-sm leading-relaxed text-gray-700 sm:text-base whitespace-pre-wrap">{item.a}</p>
              </div>
            </details>
          ))
        ) : (
          <p className="p-6 text-sm text-slate-500 m-0 font-['Inter']">{tr.faqEmpty}</p>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {showDetalii && (
        <>
        {compact ? (
          <div className="grid grid-cols-3 gap-2">
            {galleryImages.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => {
                  setActiveImage(i)
                  setShowImageModal(true)
                }}
                className="aspect-square overflow-hidden rounded-[10px] bg-neutral-100 ring-1 ring-neutral-200/90 transition hover:ring-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                aria-label={`${product.title} — ${i + 1} / ${galleryImages.length}`}
              >
                <span className="flex h-full w-full items-center justify-center p-2">
                  <img src={src} alt="" className="max-h-full max-w-full object-contain" loading={i < 6 ? 'eager' : 'lazy'} />
                </span>
              </button>
            ))}
          </div>
        ) : (
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
        )}

        {!hideBadges && <div className="grid grid-cols-3 gap-3">
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
        </div>}
        </>
        )}

        {showDocumenteTehnice && docs.length > 0 && (
          <div>
            <h3 className="text-black text-base font-bold font-['Inter'] mb-3">{tr.documenteTehnice}</h3>
            <div className={compact ? 'flex flex-wrap gap-3' : 'flex flex-col gap-2'}>
              {docs.map((doc, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={doc.descriere || tr.document}
                  onClick={() => {
                    const apiBase =
                      import.meta.env.DEV
                        ? 'http://localhost:3001/api'
                        : `${window.location.origin}/api`
                    const proxyUrl = `${apiBase}/download-proxy?url=${encodeURIComponent(doc.url)}`
                    const a = document.createElement('a')
                    a.href = proxyUrl
                    a.download =
                      ((doc.descriere || 'document').replace(/[^a-zA-Z0-9-_ăâîșțĂÂÎȘȚ\s]/g, '') || 'document') +
                      '.pdf'
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                  }}
                  className={`group border transition-all ${
                    compact
                      ? 'relative flex w-40 flex-col items-center gap-2 rounded-2xl border-neutral-200 bg-neutral-50 p-4 text-center hover:border-slate-300 hover:bg-white hover:shadow-md active:scale-[0.98]'
                      : 'flex w-full items-center gap-3 rounded-[10px] border-zinc-200 px-4 py-3 text-left hover:bg-neutral-50 hover:border-slate-400'
                  }`}
                >
                  {compact ? (
                    <>
                      {/* Download icon — top-right corner */}
                      <span className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-400 transition-colors group-hover:bg-slate-800 group-hover:text-white">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />
                        </svg>
                      </span>
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 ring-1 ring-red-200/60">
                        <svg className="h-7 w-7 text-red-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
                          <path d="M8.5 14.5h1.2c.7 0 1.1-.4 1.1-1s-.4-1-1.1-1H8v4h.5v-2zm0-1.5h.7c.4 0 .6.2.6.5s-.2.5-.6.5H8.5v-1zm3 3.5h1.2c1 0 1.6-.6 1.6-1.8 0-1.2-.6-1.7-1.7-1.7H11.5v3.5zm.5-3h.7c.7 0 1.1.3 1.1 1.2 0 .9-.4 1.3-1.1 1.3H12V14zm2.5 3.5V14h2v.5h-1.5v1h1.3v.5h-1.3v1.5H14.5z"/>
                        </svg>
                      </span>
                      <span className="text-xs font-semibold leading-snug text-slate-700 line-clamp-3 font-['Inter'] w-full">
                        {doc.descriere || tr.document}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-auto">PDF</span>
                    </>
                  ) : (
                    <>
                      <img
                        src="/images/shared/download-icon.svg"
                        alt=""
                        aria-hidden
                        className="w-5 h-5 flex-shrink-0"
                      />
                      <span className="text-black text-sm font-medium font-['Inter'] flex-1">
                        {doc.descriere || tr.document}
                      </span>
                      <span className="text-xs font-bold text-gray-400 uppercase">.PDF</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {showTehnice && hasIndustrialSpecs && (
          <section>
            {partnerTab !== 'tehnice' ? (
              <h2 className="text-black text-2xl font-bold font-['Inter'] mb-6">{tr.dateTehnice}</h2>
            ) : null}
            <IndustrialTechnicalSpecTable
              data={industrialSpecs}
              modelLabel={industrialTr.modelLabel}
              labelForKey={specLabel}
              hideEmptyRows={compact}
            />
          </section>
        )}

        {showTehnice && hasFlatSpecs && (
          <section>
            {partnerTab !== 'tehnice' && !hasIndustrialSpecs ? (
              <h2 className="text-black text-2xl font-bold font-['Inter'] mb-6">{tr.dateTehnice}</h2>
            ) : null}
            <div className="overflow-x-auto rounded-xl border border-neutral-200">
              <table className="w-full min-w-[280px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th
                      scope="col"
                      className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-neutral-600 font-['Inter'] sm:px-5"
                    >
                      {tr.techTableColSpec}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-neutral-600 font-['Inter'] sm:px-5"
                    >
                      {tr.techTableColValue}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {techData.map(([key, val], i) => (
                    <tr
                      key={i}
                      className={`border-b border-neutral-100 last:border-b-0 ${i % 2 === 1 ? 'bg-neutral-50/60' : 'bg-white'}`}
                    >
                      <th
                        scope="row"
                        className="align-top px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-neutral-500 font-['Inter'] sm:px-5 sm:w-[42%]"
                      >
                        {key}
                      </th>
                      <td className="align-top px-4 py-3 text-sm font-semibold text-neutral-900 font-['Inter'] leading-snug break-words sm:px-5">
                        {val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {showTehnice && partnerTab === 'tehnice' && !hasIndustrialSpecs && !hasFlatSpecs && (
          <p className="py-8 text-center text-sm text-slate-500 font-['Inter']">{tr.techSpecsEmpty}</p>
        )}

        {!compact && (
          <>
            <ProductDetailCtaBoxes tr={tr} />

            <section>
              <div className="bg-neutral-100 rounded-[10px] flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-7">
                <div>
                  <h3 className="text-black text-lg font-bold font-['Inter'] mb-1">{tr.contactTitle}</h3>
                  <p className="text-gray-600 text-base font-['Inter'] leading-relaxed">{tr.contactDesc}</p>
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
            images={galleryImages}
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
