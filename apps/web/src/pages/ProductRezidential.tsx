import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useParams, Navigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { getProduct, type PublicProduct } from '../lib/api'
import { getProductDetailTranslations, type ProductDetailTranslations } from '../i18n/product-detail'
import SEO from '../components/SEO'
import ProductPriceBlock from '../components/ProductPriceBlock'
import ResidentialClientPriceBlock, { showResidentialClientPurchaseUI } from '../components/ResidentialClientPriceBlock'
import { getProductTemplateSeo } from '../lib/productTemplateSeo'
import type { LangCode } from '../i18n/menu'
import {
  IndustrialProductPageSkeleton,
  ResidentialProductPageSkeleton,
} from '../components/product/ProductPageLoaders'
import { cacheProductTip, readCachedProductTip } from '../lib/productTipCache'
import ResidentialIndustrialProductPage from './ResidentialIndustrialProductPage'

export type ProductPageLocationState = {
  tipProdus?: 'rezidential' | 'industrial'
}

function pickIndustrialLoadingSkeleton(
  navTip: 'rezidential' | 'industrial' | undefined,
  cachedTip: 'rezidential' | 'industrial' | undefined,
): boolean {
  if (navTip === 'industrial') return true
  if (navTip === 'rezidential') return false
  return cachedTip === 'industrial'
}

/* ── Product image with loader (Baterino logo while loading) ─────── */
function ProductImageWithLoader({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  useEffect(() => {
    setLoaded(false)
    const checkComplete = () => {
      if (imgRef.current?.complete) setLoaded(true)
    }
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

/* ── Inverter compatibility list (common brands) ─────────────────── */
const INVERTER_BRANDS = [
  'ATESS', 'DEYE', 'EPEVER', 'GINLONG', 'GOODWE', 'GROWATT', 'HYPONTECH',
  'KOYOE', 'LUXPOWERTEK', 'MEGAREVO', 'MUST', 'SCHNEIDER ELECTRIC', 'SENERGY',
  'SINEXCEL', 'SMA', 'SOFAR', 'SOLAX POWER', 'SOROTEC', 'SRNE', 'SUNGROW',
  'VICTRON ENERGY', 'VOLTRONIC POWER',
]

/* ── Convert Wh to kWh for display (stored in Wh, users expect kWh) ── */
function whToKwhDisplay(wh: string | null | undefined): string | null {
  if (!wh) return null
  const numStr = String(wh).replace(/\s*Wh$/i, '').replace(',', '.').replace(/\s/g, '')
  const num = parseFloat(numStr)
  if (Number.isNaN(num)) return wh
  const kwh = num / 1000
  return `${kwh % 1 === 0 ? kwh.toFixed(0) : kwh.toFixed(2)} kWh`
}

/* ── Build specs and techData from DB product ──────────────────── */
function buildSpecs(p: PublicProduct, tr: ProductDetailTranslations) {
  const specs: { label: string; value: string }[] = []
  const str = (v: unknown) => (v != null ? String(v) : '')
  const energieDisplay = whToKwhDisplay(p.energieNominala)
  if (energieDisplay) specs.push({ label: tr.specEnergieNominala, value: energieDisplay })
  if (p.capacitate) specs.push({ label: tr.specCapacitate, value: str(p.capacitate) })
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
  rows.push([tr.techCompozitieCelula, (p.compozitie && p.compozitie.trim()) || 'LiFePO4'])
  const energieDisplay = whToKwhDisplay(p.energieNominala)
  if (energieDisplay) rows.push([tr.specEnergieNominala, energieDisplay])
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
    { icon: '/images/shared/testing-icon.svg', label: tr.badgeGarantie, id: 'garantie' },
    { icon: '/images/shared/compatibility-icon.svg', label: tr.badgeCompatibilitate, id: 'compatibilitate' },
    { icon: '/images/shared/safety-icon.svg', label: tr.badgeProducatori, id: 'producatori' },
    { icon: '/images/shared/delivery-icon.svg', label: tr.badgeRetur, id: 'retur' },
    { icon: '/images/shared/swap-icon.svg', label: tr.badgeSwap, id: 'swap' },
    { icon: '/images/shared/maintance-icon.svg', label: tr.badgeSuport, id: 'suport' },
  ]
}

/* ── Product image lightbox modal ────────────────────────────────── */
function ProductImageModal({
  images,
  activeIndex,
  onSelect,
  onClose,
  productTitle,
  closeLabel,
  prevLabel,
  nextLabel,
}: {
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
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Galerie imagini produs"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-[70] w-10 h-10 rounded-full bg-white hover:bg-neutral-100 flex items-center justify-center text-black shadow-md transition-colors"
        aria-label={closeLabel}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div
        className="flex flex-col w-fit h-fit max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex items-center justify-center p-2 min-w-0 min-h-0">
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onSelect((activeIndex - 1 + images.length) % images.length) }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-black transition-colors"
                aria-label={prevLabel}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onSelect((activeIndex + 1) % images.length) }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-black transition-colors"
                aria-label={nextLabel}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          <img
            src={images[activeIndex]}
            alt={productTitle}
            className="max-w-[70vw] max-h-[85vh] w-auto h-auto object-contain"
          />
          <img
            src="/images/shared/baterino-logo-black.svg"
            alt="Baterino"
            className="absolute bottom-5 left-1/2 -translate-x-1/2 h-10 w-auto object-contain opacity-80 pointer-events-none"
          />
        </div>
        <div className="flex flex-row gap-2 justify-center py-3 px-2 overflow-x-auto flex-shrink-0">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.stopPropagation(); onSelect(i) }}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === activeIndex ? 'border-slate-900 ring-2 ring-slate-900/30' : 'border-transparent hover:border-neutral-300'
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Garantie modal ────────────────────────────────────────────── */
function GarantieModal({ onClose, tr }: { onClose: () => void; tr: ProductDetailTranslations }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="garantie-modal-title"
    >
      <div
        className="relative w-full max-w-[650px] max-h-[85vh] sm:max-h-[90vh] bg-white rounded-t-[20px] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up-from-bottom"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex items-center justify-between gap-4 p-4 sm:p-6 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-6 border-b border-neutral-100 bg-white">
          <h1 id="garantie-modal-title" className="text-black text-xl sm:text-2xl font-semibold font-['Inter'] leading-tight min-w-0">{tr.garantieModalTitle}</h1>
          <button type="button" onClick={onClose} className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2" aria-label={tr.compatibilitateClose}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-6 p-6 sm:p-10">
          <div className="flex items-center gap-5">
            <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center">
              <img src="/images/shared/testing-icon.svg" alt="" aria-hidden className="w-10 h-10 object-contain" />
            </div>
          </div>
          <p className="text-neutral-700 text-base sm:text-lg font-['Inter'] leading-relaxed">{tr.garantieModalDesc}</p>
        </div>
      </div>
    </div>
  )
}

/* ── Suport & Service modal ──────────────────────────────────────── */
function SuportModal({ onClose, tr }: { onClose: () => void; tr: ProductDetailTranslations }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="suport-modal-title">
      <div className="relative w-full max-w-[650px] max-h-[85vh] sm:max-h-[90vh] bg-white rounded-t-[20px] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up-from-bottom" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 flex items-center justify-between gap-4 p-4 sm:p-6 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-6 border-b border-neutral-100 bg-white">
          <h1 id="suport-modal-title" className="text-black text-xl sm:text-2xl font-semibold font-['Inter'] leading-tight min-w-0">{tr.suportModalTitle}</h1>
          <button type="button" onClick={onClose} className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2" aria-label={tr.compatibilitateClose}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-6 p-6 sm:p-10">
          <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center">
            <img src="/images/shared/maintance-icon.svg" alt="" aria-hidden className="w-10 h-10 object-contain" />
          </div>
          <p className="text-neutral-700 text-base sm:text-lg font-['Inter'] leading-relaxed">{tr.suportModalDesc}</p>
        </div>
      </div>
    </div>
  )
}

/* ── Swap modal ───────────────────────────────────────────────────── */
function SwapModal({ onClose, tr }: { onClose: () => void; tr: ProductDetailTranslations }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="swap-modal-title">
      <div className="relative w-full max-w-[650px] max-h-[85vh] sm:max-h-[90vh] bg-white rounded-t-[20px] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up-from-bottom" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 flex items-center justify-between gap-4 p-4 sm:p-6 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-6 border-b border-neutral-100 bg-white">
          <h1 id="swap-modal-title" className="text-black text-xl sm:text-2xl font-semibold font-['Inter'] leading-tight min-w-0">{tr.swapModalTitle}</h1>
          <button type="button" onClick={onClose} className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2" aria-label={tr.compatibilitateClose}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-6 p-6 sm:p-10">
          <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center">
            <img src="/images/shared/swap-icon.svg" alt="" aria-hidden className="w-10 h-10 object-contain" />
          </div>
          <p className="text-neutral-700 text-base sm:text-lg font-['Inter'] leading-relaxed">{tr.swapModalDesc}</p>
        </div>
      </div>
    </div>
  )
}

/* ── Retur modal ─────────────────────────────────────────────────── */
function ReturModal({ onClose, tr }: { onClose: () => void; tr: ProductDetailTranslations }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="retur-modal-title">
      <div className="relative w-full max-w-[650px] max-h-[85vh] sm:max-h-[90vh] bg-white rounded-t-[20px] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up-from-bottom" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 flex items-center justify-between gap-4 p-4 sm:p-6 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-6 border-b border-neutral-100 bg-white">
          <h1 id="retur-modal-title" className="text-black text-xl sm:text-2xl font-semibold font-['Inter'] leading-tight min-w-0">{tr.returModalTitle}</h1>
          <button type="button" onClick={onClose} className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2" aria-label={tr.compatibilitateClose}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-6 p-6 sm:p-10">
          <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center">
            <img src="/images/shared/delivery-icon.svg" alt="" aria-hidden className="w-10 h-10 object-contain" />
          </div>
          <p className="text-neutral-700 text-base sm:text-lg font-['Inter'] leading-relaxed">{tr.returModalDesc}</p>
        </div>
      </div>
    </div>
  )
}

/* ── Producator verificat modal ─────────────────────────────────── */
function ProducatoriModal({ onClose, tr }: { onClose: () => void; tr: ProductDetailTranslations }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="producatori-modal-title">
      <div className="relative w-full max-w-[650px] max-h-[85vh] sm:max-h-[90vh] bg-white rounded-t-[20px] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up-from-bottom" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 flex items-center justify-between gap-4 p-4 sm:p-6 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-6 border-b border-neutral-100 bg-white">
          <h1 id="producatori-modal-title" className="text-black text-xl sm:text-2xl font-semibold font-['Inter'] leading-tight min-w-0">{tr.producatoriModalTitle}</h1>
          <button type="button" onClick={onClose} className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2" aria-label={tr.compatibilitateClose}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-6 p-6 sm:p-10">
          <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center">
            <img src="/images/shared/safety-icon.svg" alt="" aria-hidden className="w-10 h-10 object-contain" />
          </div>
          <p className="text-neutral-700 text-base sm:text-lg font-['Inter'] leading-relaxed">{tr.producatoriModalDesc}</p>
        </div>
      </div>
    </div>
  )
}

/* ── Compatibilitate 99% modal ─────────────────────────────────── */
function Compatibilitate99Modal({ onClose, tr }: { onClose: () => void; tr: ProductDetailTranslations }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="compatibilitate99-title">
      <div className="relative w-full max-w-[650px] max-h-[85vh] sm:max-h-[90vh] bg-white rounded-t-[20px] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up-from-bottom" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 flex items-center justify-between gap-4 p-4 sm:p-6 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-6 border-b border-neutral-100 bg-white">
          <h1 id="compatibilitate99-title" className="text-black text-xl sm:text-2xl font-semibold font-['Inter'] leading-tight min-w-0">{tr.compatibilitate99Title}</h1>
          <button type="button" onClick={onClose} className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2" aria-label={tr.compatibilitateClose}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-6 p-6 sm:p-10">
          <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center">
            <img src="/images/shared/compatibility-icon.svg" alt="" aria-hidden className="w-10 h-10 object-contain" />
          </div>
          <p className="text-neutral-700 text-base sm:text-lg font-['Inter'] leading-relaxed">{tr.compatibilitate99Desc}</p>
        </div>
      </div>
    </div>
  )
}

/** Product-specific "Ce se poate alimenta" modal content from DB */
type AlimentaModalContent = {
  title: string
  intro?: string
  sections: Array<{ label: string; items: string[] }>
}

/* ── Ce se poate alimenta modal ─────────────────────────────────── */
function CeSePoateAlimentaModal({
  onClose,
  tr,
  customContent,
  energieNominala,
}: {
  onClose: () => void
  tr: ProductDetailTranslations
  customContent?: AlimentaModalContent | null
  energieNominala?: string | null
}) {
  const useCustom = customContent && customContent.title && Array.isArray(customContent.sections) && customContent.sections.length > 0

  const energieDisplay = whToKwhDisplay(energieNominala)
  const kwhNum = (() => {
    if (!energieNominala) return null
    const numStr = String(energieNominala).replace(/\s*Wh$/i, '').replace(',', '.').replace(/\s/g, '')
    const num = parseFloat(numStr)
    return Number.isNaN(num) ? null : num / 1000
  })()
  const usableRangeStr =
    kwhNum != null
      ? `${(0.8 * kwhNum).toFixed(1)} – ${(0.9 * kwhNum).toFixed(1)}`
      : null

  if (useCustom && customContent) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="alimenta-modal-title"
      >
        <div
          className="relative w-full sm:max-w-[600px] max-h-[85vh] sm:max-h-[90vh] bg-white rounded-t-[20px] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up-from-bottom"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-shrink-0 flex items-center gap-4 p-4 sm:p-6 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-6 border-b border-neutral-100 bg-white">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-neutral-100 flex items-center justify-center">
              <img src="/images/shared/battery-full-icon.svg" alt="" aria-hidden className="w-8 h-8 object-contain" />
            </div>
            <h1 id="alimenta-modal-title" className="text-black text-xl sm:text-2xl font-semibold font-['Inter'] leading-tight min-w-0 flex-1">
              {customContent.title}
            </h1>
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
              aria-label={tr.compatibilitateClose}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            {customContent.intro && (
              <p className="text-neutral-700 text-base font-['Inter'] leading-relaxed mb-6">
                {customContent.intro}
              </p>
            )}
            {customContent.sections.map((sec, si) => (
              <div key={si} className="mb-6">
                <p className="text-black text-sm font-bold font-['Inter'] uppercase tracking-wider mb-3">
                  {sec.label}
                </p>
                <ul className="space-y-2">
                  {sec.items.map((item, ii) => (
                    <li key={ii} className="flex items-center gap-2 text-neutral-700 text-sm font-['Inter']">
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const examples = [tr.alimentaModalEx1, tr.alimentaModalEx2, tr.alimentaModalEx3, tr.alimentaModalEx4, tr.alimentaModalEx5, tr.alimentaModalEx6]
  const emojis = ['💡', '📺', '🧊', '🖥️', '🔥', '🏠']
  const durations = [tr.alimentaModalDurata1, tr.alimentaModalDurata2, tr.alimentaModalDurata3]
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alimenta-modal-title"
    >
      <div
        className="relative w-full sm:max-w-[600px] max-h-[85vh] sm:max-h-[90vh] bg-white rounded-t-[20px] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up-from-bottom"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex items-center gap-4 p-4 sm:p-6 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-6 border-b border-neutral-100 bg-white">
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-neutral-100 flex items-center justify-center">
            <img src="/images/shared/battery-full-icon.svg" alt="" aria-hidden className="w-8 h-8 object-contain" />
          </div>
          <h1 id="alimenta-modal-title" className="text-black text-xl sm:text-2xl font-semibold font-['Inter'] leading-tight min-w-0 flex-1">
            {energieDisplay
              ? tr.alimentaModalTitle.replace(/5\s*kWh/i, energieDisplay)
              : tr.alimentaModalTitle}
          </h1>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            aria-label={tr.compatibilitateClose}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <p className="text-neutral-700 text-base font-['Inter'] leading-relaxed mb-6">
            {usableRangeStr
              ? tr.alimentaModalIntro.replace(/\d+(\.\d+)?\s*[–-]\s*\d+(\.\d+)?\s*kWh?/gi, `${usableRangeStr} kWh`)
              : tr.alimentaModalIntro}
          </p>
          <p className="text-black text-sm font-bold font-['Inter'] uppercase tracking-wider mb-3">
            {tr.alimentaModalExemple}
          </p>
          <ul className="space-y-2.5 mb-6">
            {examples.map((ex, i) => (
              <li key={i} className="flex items-center gap-2 text-neutral-700 text-sm font-['Inter']">
                <span className="flex-shrink-0 text-base" aria-hidden>{emojis[i]}</span>
                <span>{ex}</span>
              </li>
            ))}
          </ul>
          <p className="text-black text-sm font-bold font-['Inter'] uppercase tracking-wider mb-3">
            {tr.alimentaModalCateOre}
          </p>
          <p className="text-neutral-700 text-sm font-['Inter'] mb-2">
            {tr.alimentaModalDurata}
          </p>
          <ul className="space-y-2">
            {durations.map((d, i) => (
              <li key={i} className="text-neutral-700 text-sm font-['Inter'] pl-4 border-l-2 border-neutral-200">
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md max-h-[85vh] sm:max-h-[80vh] flex flex-col overflow-hidden rounded-t-[20px] sm:rounded-[10px] shadow-xl animate-slide-up-from-bottom"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-4 border-b border-zinc-200">
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
  const { slug } = useParams<{ slug: string }>()
  const location = useLocation()
  const navTip = (location.state as ProductPageLocationState | null)?.tipProdus
  const cachedTip = slug ? readCachedProductTip(slug) : undefined
  const showIndustrialLoader = pickIndustrialLoadingSkeleton(navTip, cachedTip)
  const { language } = useLanguage()
  const tr = getProductDetailTranslations(language.code)
  const [product, setProduct] = useState<PublicProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [showCompatibilitateModal, setShowCompatibilitateModal] = useState(false)
  const [showCeSePoateAlimentaModal, setShowCeSePoateAlimentaModal] = useState(false)
  const [showCompatibilitate99Modal, setShowCompatibilitate99Modal] = useState(false)
  const [showGarantieModal, setShowGarantieModal] = useState(false)
  const [showProducatoriModal, setShowProducatoriModal] = useState(false)
  const [showReturModal, setShowReturModal] = useState(false)
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [showSuportModal, setShowSuportModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      setError(true)
      return
    }
    getProduct(slug)
      .then(setProduct)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!product) return
    cacheProductTip({ slug: product.slug, id: product.id, tipProdus: product.tipProdus })
  }, [product])

  useEffect(() => {
    setDescExpanded(false)
  }, [product?.id])

  if (loading) {
    return (
      <>
        <SEO title={tr.loading} description="" canonical={`/produse/${slug}`} lang={language.code} />
        {showIndustrialLoader ? <IndustrialProductPageSkeleton /> : <ResidentialProductPageSkeleton />}
      </>
    )
  }
  if (error || !product) return <Navigate to="/produse" replace />

  if (product.tipProdus === 'industrial') {
    return (
      <ResidentialIndustrialProductPage
        product={product}
        breadcrumbHome={tr.breadcrumbHome}
        breadcrumbProducts={tr.breadcrumbProducts}
      />
    )
  }

  const imgs = Array.isArray(product.images) ? product.images : []
  const img = imgs[activeImage] || imgs[0] || '/images/shared/HP2000-all-in-one.png'
  const specs = buildSpecs(product, tr)
  const techData = buildTechData(product, tr)
  const badges = getBadges(tr)
  const docs = (product as { documenteTehnice?: { descriere: string; url: string }[] }).documenteTehnice || []
  const divisionLabel = (() => {
    const cat = String((product as { categorie?: string }).categorie || '').toLowerCase()
    if (cat.includes('industrial')) return tr.sectorIndustrial
    if (cat.includes('medical')) return 'Medical'
    if (cat.includes('maritim')) return 'Maritim'
    if (cat.includes('rezidential')) return tr.sectorRezidential
    return tr.sectorRezidential
  })()
  const templateSeo = getProductTemplateSeo(product, language.code as LangCode)
  const rawDesc = product.description?.trim() ?? ''
  const descNeedsToggle = rawDesc.length > 140

  return (
    <>
      <SEO
        title={templateSeo.title}
        description={templateSeo.description}
        canonical={`/produse/${product.slug || product.id}`}
        lang={language.code}
        ogImage={templateSeo.ogImage}
      />

      <div className="max-w-content mx-auto px-5 lg:px-3 pt-4 pb-24 overflow-visible">
        <nav className="flex w-full items-center justify-end gap-2 text-xs sm:text-sm text-gray-500 font-['Inter'] mb-3 lg:mb-4">
          <Link to="/" className="hover:text-black transition-colors">{tr.breadcrumbHome}</Link>
          <span>/</span>
          <Link to="/produse" className="hover:text-black transition-colors">{tr.breadcrumbProducts}</Link>
          <span>/</span>
          <span className="text-black">{divisionLabel}</span>
        </nav>

        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:items-start gap-8 lg:gap-5 overflow-visible">
          <div className="contents lg:flex lg:flex-col lg:col-span-5 lg:col-start-1 lg:sticky lg:top-20 lg:self-start">
            <div className="order-1 lg:order-none flex flex-col max-w-lg w-full lg:col-span-5 lg:col-start-1 gap-8">
              <header className="space-y-0">
                <h1 className="text-black text-2xl sm:text-3xl font-bold font-['Inter'] leading-tight tracking-tight m-0">
                  {product.title}
                </h1>
                {rawDesc ? (
                  <div className="mt-3 sm:mt-4 max-w-prose">
                    <p
                      className={`text-neutral-700 text-base font-['Inter'] leading-relaxed m-0 ${
                        descNeedsToggle && !descExpanded ? 'line-clamp-4' : ''
                      }`}
                    >
                      {rawDesc}
                      {descNeedsToggle ? (
                        <>
                          {'\u00A0'}
                          <button
                            type="button"
                            onClick={() => setDescExpanded((e) => !e)}
                            className="inline p-0 border-0 bg-transparent text-sm font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-700 font-['Inter'] align-baseline whitespace-nowrap"
                          >
                            {descExpanded ? tr.descriptionReadLess : tr.descriptionReadMore}
                          </button>
                        </>
                      ) : null}
                    </p>
                  </div>
                ) : null}
              </header>

              <section className="m-0" aria-label={tr.dateTehnice}>
                <ul className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)_minmax(0,1.4fr)] gap-x-8 gap-y-5">
                  {specs.map((s, i) => (
                    <li key={i} className="min-w-0">
                      <span className="block text-[11px] font-bold uppercase tracking-wide text-neutral-500 font-['Inter']">{s.label}</span>
                      <span className="mt-1.5 block text-sm font-semibold text-neutral-900 font-['Inter'] leading-snug break-words">{s.value}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="m-0">
                {showResidentialClientPurchaseUI(product) ? (
                  <ResidentialClientPriceBlock product={product} tr={tr} lang={language.code as LangCode} />
                ) : (
                  <ProductPriceBlock product={product} lang={language.code as LangCode} embedded />
                )}
              </section>
            </div>
          </div>

          <div className="contents lg:flex lg:flex-col lg:col-span-6 lg:col-start-7 lg:min-w-0 gap-8">
            <div className="order-2 lg:order-none flex flex-col gap-8">
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

              <section className="flex flex-col" aria-labelledby="compat-util-heading">
                <h3
                  id="compat-util-heading"
                  className="text-black text-base font-bold font-['Inter'] mb-3 m-0"
                >
                  {tr.compatibilitateSiUtilizare}
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCompatibilitateModal(true)}
                    className="group flex flex-1 items-center gap-3 min-h-[52px] rounded-xl bg-[#f7f7f7] px-4 py-3 text-left shadow-none transition-shadow duration-200 hover:shadow-md"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/90">
                      <img src="/images/shared/compatibility-icon.svg" alt="" aria-hidden className="h-6 w-6 object-contain opacity-90" />
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-semibold text-neutral-900 font-['Inter'] leading-snug">{tr.verificareCompatibilitate}</span>
                    <svg className="h-5 w-5 shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCeSePoateAlimentaModal(true)}
                    className="group flex flex-1 items-center gap-3 min-h-[52px] rounded-xl bg-[#f7f7f7] px-4 py-3 text-left shadow-none transition-shadow duration-200 hover:shadow-md"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/90">
                      <img src="/images/shared/battery-full-icon.svg" alt="" aria-hidden className="h-6 w-6 object-contain opacity-90" />
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-semibold text-neutral-900 font-['Inter'] leading-snug">{tr.ceSePoateAlimenta}</span>
                    <svg className="h-5 w-5 shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </section>

              <section className="flex flex-col" aria-labelledby="siguranta-baterino-heading">
                <h3
                  id="siguranta-baterino-heading"
                  className="text-black text-base font-bold font-['Inter'] mb-3 m-0"
                >
                  {tr.sigurantaBaterino}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {badges.map((b, i) => (
                  b.id === 'compatibilitate' ? (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setShowCompatibilitate99Modal(true)}
                      className="flex flex-col items-center gap-2 bg-neutral-100 rounded-[10px] py-4 px-2 text-center hover:bg-neutral-200 transition-colors cursor-pointer"
                    >
                      <img src={b.icon} alt="" aria-hidden className="w-8 h-8 object-contain" />
                      <p className="text-black text-xs font-bold font-['Inter'] leading-tight">{b.label}</p>
                    </button>
                  ) : b.id === 'garantie' ? (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setShowGarantieModal(true)}
                      className="flex flex-col items-center gap-2 bg-neutral-100 rounded-[10px] py-4 px-2 text-center hover:bg-neutral-200 transition-colors cursor-pointer"
                    >
                      <img src={b.icon} alt="" aria-hidden className="w-8 h-8 object-contain" />
                      <p className="text-black text-xs font-bold font-['Inter'] leading-tight">{b.label}</p>
                    </button>
                  ) : b.id === 'producatori' ? (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setShowProducatoriModal(true)}
                      className="flex flex-col items-center gap-2 bg-neutral-100 rounded-[10px] py-4 px-2 text-center hover:bg-neutral-200 transition-colors cursor-pointer"
                    >
                      <img src={b.icon} alt="" aria-hidden className="w-8 h-8 object-contain" />
                      <p className="text-black text-xs font-bold font-['Inter'] leading-tight">{b.label}</p>
                    </button>
                  ) : b.id === 'retur' ? (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setShowReturModal(true)}
                      className="flex flex-col items-center gap-2 bg-neutral-100 rounded-[10px] py-4 px-2 text-center hover:bg-neutral-200 transition-colors cursor-pointer"
                    >
                      <img src={b.icon} alt="" aria-hidden className="w-8 h-8 object-contain" />
                      <p className="text-black text-xs font-bold font-['Inter'] leading-tight">{b.label}</p>
                    </button>
                  ) : b.id === 'swap' ? (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setShowSwapModal(true)}
                      className="flex flex-col items-center gap-2 bg-neutral-100 rounded-[10px] py-4 px-2 text-center hover:bg-neutral-200 transition-colors cursor-pointer"
                    >
                      <img src={b.icon} alt="" aria-hidden className="w-8 h-8 object-contain" />
                      <p className="text-black text-xs font-bold font-['Inter'] leading-tight">{b.label}</p>
                    </button>
                  ) : b.id === 'suport' ? (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setShowSuportModal(true)}
                      className="flex flex-col items-center gap-2 bg-neutral-100 rounded-[10px] py-4 px-2 text-center hover:bg-neutral-200 transition-colors cursor-pointer"
                    >
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
              </section>
            </div>

            <div className="order-4 lg:order-none flex flex-col gap-8">
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

      {showCeSePoateAlimentaModal && (
        <CeSePoateAlimentaModal
          onClose={() => setShowCeSePoateAlimentaModal(false)}
          tr={tr}
          customContent={(product as { alimentaModalContent?: AlimentaModalContent | null }).alimentaModalContent ?? undefined}
          energieNominala={product?.energieNominala ?? undefined}
        />
      )}

      {showCompatibilitate99Modal && (
        <Compatibilitate99Modal onClose={() => setShowCompatibilitate99Modal(false)} tr={tr} />
      )}

      {showGarantieModal && (
        <GarantieModal onClose={() => setShowGarantieModal(false)} tr={tr} />
      )}

      {showProducatoriModal && (
        <ProducatoriModal onClose={() => setShowProducatoriModal(false)} tr={tr} />
      )}

      {showReturModal && (
        <ReturModal onClose={() => setShowReturModal(false)} tr={tr} />
      )}

      {showSwapModal && (
        <SwapModal onClose={() => setShowSwapModal(false)} tr={tr} />
      )}

      {showSuportModal && (
        <SuportModal onClose={() => setShowSuportModal(false)} tr={tr} />
      )}

      {showImageModal && (
        <ProductImageModal
          images={imgs.length > 0 ? imgs : [img]}
          activeIndex={activeImage}
          onSelect={setActiveImage}
          onClose={() => setShowImageModal(false)}
          productTitle={product.title}
          closeLabel={tr.compatibilitateClose}
          prevLabel={tr.ariaPrev}
          nextLabel={tr.ariaNext}
        />
      )}
    </>
  )
}
