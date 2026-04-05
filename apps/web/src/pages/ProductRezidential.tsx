import { useState, useEffect, useMemo, useRef, useId, useCallback, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link, useParams, Navigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { getProduct, productHasEligibleReducerePrograms, residentialProductStockUnavailable, type PublicProduct } from '../lib/api'
import { getProductDetailTranslations, type ProductDetailTranslations } from '../i18n/product-detail'
import SEO from '../components/SEO'
import ProductPriceBlock from '../components/ProductPriceBlock'
import ResidentialClientPriceBlock, { showResidentialClientPurchaseUI } from '../components/ResidentialClientPriceBlock'
import ResidentialReducereProgramBadge from '../components/ResidentialReducereProgramBadge'
import { getProductTemplateSeo } from '../lib/productTemplateSeo'
import type { LangCode } from '../i18n/menu'
import {
  IndustrialProductPageSkeleton,
  ResidentialProductPageSkeleton,
} from '../components/product/ProductPageLoaders'
import {
  ResidentialProductSpecCard,
  ResidentialTechSpecTable,
} from '../components/product/ResidentialProductSpecCard'
import { cacheProductTip, readCachedProductTip } from '../lib/productTipCache'
import { CONTACT_WHATSAPP_WAME } from '../lib/contactWhatsApp'
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
  'SINEXCEL', 'SMA', 'SOFAR', 'SOLAX POWER', 'SOLIS', 'SOROTEC', 'SRNE', 'SUNGROW',
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

type ResidentialBadge = ReturnType<typeof getBadges>[number]

function ResidentialBadgesGrid({
  badges,
  onCompatibilitate99,
  onGarantie,
  onProducatori,
  onRetur,
  onSwap,
  onSuport,
}: {
  badges: ResidentialBadge[]
  onCompatibilitate99: () => void
  onGarantie: () => void
  onProducatori: () => void
  onRetur: () => void
  onSwap: () => void
  onSuport: () => void
}) {
  const handlerById: Partial<Record<ResidentialBadge['id'], () => void>> = {
    compatibilitate: onCompatibilitate99,
    garantie: onGarantie,
    producatori: onProducatori,
    retur: onRetur,
    swap: onSwap,
    suport: onSuport,
  }

  const tileClass =
    'flex min-h-0 w-full min-w-0 flex-col items-center justify-center gap-2 bg-neutral-100 rounded-[10px] px-2 py-4 text-center lg:aspect-[3/2] lg:gap-1.5 lg:p-2.5 lg:py-3'

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:items-stretch lg:gap-3">
      {badges.map((b, i) => {
        const onClick = handlerById[b.id]
        const inner = (
          <>
            <img src={b.icon} alt="" aria-hidden className="h-8 w-8 shrink-0 object-contain" />
            <p className="text-center text-sm font-bold leading-tight text-black font-['Inter'] break-words">
              {b.label}
            </p>
          </>
        )
        if (onClick) {
          return (
            <button
              key={i}
              type="button"
              onClick={onClick}
              className={`${tileClass} cursor-pointer transition-colors hover:bg-neutral-200`}
            >
              {inner}
            </button>
          )
        }
        return (
          <div key={i} className={tileClass}>
            {inner}
          </div>
        )
      })}
    </div>
  )
}

function ResidentialMobileExpandable({
  title,
  iconSrc,
  open,
  onToggle,
  children,
  triggerId,
}: {
  title: string
  iconSrc: string
  open: boolean
  onToggle: () => void
  children: ReactNode
  triggerId: string
}) {
  const panelId = useId()
  return (
    <div className="w-full">
      <button
        type="button"
        id={triggerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="group flex w-full items-center gap-3 min-h-[52px] rounded-xl bg-[#f7f7f7] px-4 py-3 text-left shadow-none transition-shadow duration-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/90">
          <img src={iconSrc} alt="" aria-hidden className="h-6 w-6 object-contain opacity-90" />
        </span>
        <span className="min-w-0 flex-1 text-sm font-semibold text-neutral-900 font-['Inter'] leading-snug">{title}</span>
        <svg
          className={`h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open ? (
        <div id={panelId} role="region" aria-labelledby={triggerId} className="pt-3">
          {children}
        </div>
      ) : null}
    </div>
  )
}

function ResidentialFullTechDetailsModal({
  onClose,
  tr,
  productTitle,
  productImageSrc,
  techData,
}: {
  onClose: () => void
  tr: ProductDetailTranslations
  productTitle: string
  productImageSrc: string
  techData: [string, string][]
}) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])
  return (
    <div
      className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="res-full-tech-modal-title"
    >
      <div
        className="relative flex w-full max-w-[650px] max-h-[90vh] sm:max-h-[90vh] flex-col overflow-hidden rounded-t-[20px] bg-white shadow-2xl sm:rounded-2xl animate-slide-up-from-bottom"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-neutral-100 bg-white p-4 sm:p-6 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-6">
          <h1 id="res-full-tech-modal-title" className="min-w-0 text-xl font-semibold leading-tight text-black font-['Inter']">
            {productTitle}
          </h1>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            aria-label={tr.compatibilitateClose}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex w-full items-center justify-center bg-neutral-100 px-6 py-8">
            <img
              src={productImageSrc}
              alt={productTitle}
              className="max-h-[200px] w-auto max-w-full object-contain"
            />
          </div>
          <h2 className="m-0 px-4 pt-4 text-lg font-bold text-black font-['Inter'] sm:px-6">
            {tr.detaliiTehnice}
          </h2>
          {techData.length > 0 ? (
            <div className="px-4 pb-8 pt-2 sm:px-6">
              <ResidentialTechSpecTable
                ariaLabel={tr.dateTehnice}
                rows={techData.map(([label, value]) => ({ label, value }))}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
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
            className="relative z-[1] max-w-[70vw] max-h-[85vh] w-auto h-auto object-contain"
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
        <div className="flex shrink-0 justify-end border-b border-neutral-100 bg-white px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:pb-2.5 sm:pt-4">
          <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2" aria-label={tr.compatibilitateClose}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6 pt-4 sm:px-10 sm:pb-10 sm:pt-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
            <img src="/images/shared/testing-icon.svg" alt="" aria-hidden className="h-10 w-10 object-contain" />
          </div>
          <h1 id="garantie-modal-title" className="m-0 text-xl font-semibold leading-tight text-black font-['Inter']">{tr.garantieModalTitle}</h1>
          <p className="text-base leading-relaxed text-neutral-700 font-['Inter']">{tr.garantieModalDesc}</p>
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
        <div className="flex shrink-0 justify-end border-b border-neutral-100 bg-white px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:pb-2.5 sm:pt-4">
          <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2" aria-label={tr.compatibilitateClose}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6 pt-4 sm:px-10 sm:pb-10 sm:pt-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
            <img src="/images/shared/maintance-icon.svg" alt="" aria-hidden className="h-10 w-10 object-contain" />
          </div>
          <h1 id="suport-modal-title" className="m-0 text-xl font-semibold leading-tight text-black font-['Inter']">{tr.suportModalTitle}</h1>
          <p className="text-base leading-relaxed text-neutral-700 font-['Inter']">{tr.suportModalDesc}</p>
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
        <div className="flex shrink-0 justify-end border-b border-neutral-100 bg-white px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:pb-2.5 sm:pt-4">
          <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2" aria-label={tr.compatibilitateClose}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6 pt-4 sm:px-10 sm:pb-10 sm:pt-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
            <img src="/images/shared/swap-icon.svg" alt="" aria-hidden className="h-10 w-10 object-contain" />
          </div>
          <h1 id="swap-modal-title" className="m-0 text-xl font-semibold leading-tight text-black font-['Inter']">{tr.swapModalTitle}</h1>
          <p className="text-base leading-relaxed text-neutral-700 font-['Inter']">{tr.swapModalDesc}</p>
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
        <div className="flex shrink-0 justify-end border-b border-neutral-100 bg-white px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:pb-2.5 sm:pt-4">
          <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2" aria-label={tr.compatibilitateClose}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6 pt-4 sm:px-10 sm:pb-10 sm:pt-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
            <img src="/images/shared/delivery-icon.svg" alt="" aria-hidden className="h-10 w-10 object-contain" />
          </div>
          <h1 id="retur-modal-title" className="m-0 text-xl font-semibold leading-tight text-black font-['Inter']">{tr.returModalTitle}</h1>
          <p className="text-base leading-relaxed text-neutral-700 font-['Inter']">{tr.returModalDesc}</p>
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
        <div className="flex shrink-0 justify-end border-b border-neutral-100 bg-white px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:pb-2.5 sm:pt-4">
          <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2" aria-label={tr.compatibilitateClose}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6 pt-4 sm:px-10 sm:pb-10 sm:pt-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
            <img src="/images/shared/safety-icon.svg" alt="" aria-hidden className="h-10 w-10 object-contain" />
          </div>
          <h1 id="producatori-modal-title" className="m-0 text-xl font-semibold leading-tight text-black font-['Inter']">{tr.producatoriModalTitle}</h1>
          <p className="text-base leading-relaxed text-neutral-700 font-['Inter']">{tr.producatoriModalDesc}</p>
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
        <div className="flex shrink-0 justify-end border-b border-neutral-100 bg-white px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:pb-2.5 sm:pt-4">
          <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2" aria-label={tr.compatibilitateClose}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6 pt-4 sm:px-10 sm:pb-10 sm:pt-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
            <img src="/images/shared/compatibility-icon.svg" alt="" aria-hidden className="h-10 w-10 object-contain" />
          </div>
          <h1 id="compatibilitate99-title" className="m-0 text-xl font-semibold leading-tight text-black font-['Inter']">{tr.compatibilitate99Title}</h1>
          <p className="text-base leading-relaxed text-neutral-700 font-['Inter']">{tr.compatibilitate99Desc}</p>
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
            <h1 id="alimenta-modal-title" className="text-black text-xl font-semibold font-['Inter'] leading-tight min-w-0 flex-1">
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
          <h1 id="alimenta-modal-title" className="text-black text-xl font-semibold font-['Inter'] leading-tight min-w-0 flex-1">
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
  const query = search.trim().toLowerCase()
  const searching = query.length > 0
  const filtered = useMemo(() => {
    if (!query) return INVERTER_BRANDS
    return INVERTER_BRANDS.filter((b) => b.toLowerCase().includes(query))
  }, [query])
  const whatsappAssistanceHref = useMemo(() => {
    const q = search.trim()
    const text = tr.compatibilitateInvertorWhatsappPrefill.replace(/\{search\}/g, q || '—')
    return `https://wa.me/${CONTACT_WHATSAPP_WAME}?text=${encodeURIComponent(text)}`
  }, [search, tr.compatibilitateInvertorWhatsappPrefill])
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="compatibilitate-invertor-hero"
    >
      <div
        className="flex h-[min(85dvh,34rem)] w-full max-h-[85vh] flex-col overflow-hidden rounded-t-[20px] bg-white shadow-2xl animate-slide-up-from-bottom sm:h-[min(80dvh,32rem)] sm:max-h-[80vh] sm:max-w-md sm:rounded-2xl"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center gap-4 border-b border-neutral-100 bg-white p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:p-6 sm:pt-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
            <img
              src="/images/shared/compatibility-icon.svg"
              alt=""
              aria-hidden
              className="h-8 w-8 object-contain"
            />
          </div>
          <h1
            id="compatibilitate-invertor-hero"
            className="min-w-0 flex-1 text-xl font-semibold leading-tight text-black font-['Inter']"
          >
            {tr.compatibilitateInvertorHeroTitle}
          </h1>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            aria-label={tr.compatibilitateClose}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="border-b border-zinc-100 px-4 py-3 sm:px-6">
          <input
            type="text"
            placeholder={tr.compatibilitateSearch}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-4 pr-4 rounded-[10px] bg-neutral-100 text-black text-base font-['Inter'] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {filtered.length > 0 ? (
            <ul className="space-y-1">
              {filtered.map((brand) => {
                const isHighlighted = searching && brand.toLowerCase().includes(query)
                return (
                  <li
                    key={brand}
                    className={`rounded-[10px] px-3 py-2.5 text-base font-medium font-['Inter'] ${
                      isHighlighted
                        ? 'bg-green-50 text-green-900 ring-1 ring-inset ring-green-200'
                        : 'text-black hover:bg-neutral-100'
                    }`}
                  >
                    {brand}
                  </li>
                )
              })}
            </ul>
          ) : searching ? (
            <div className="flex flex-col items-center gap-4 py-1">
              <p className="m-0 max-w-[18.5rem] text-center text-base leading-relaxed text-neutral-700 font-['Inter'] sm:max-w-[22rem]">
                {tr.compatibilitateInvertorNotFoundMessage}
              </p>
              <a
                href={whatsappAssistanceHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full min-h-[3.25rem] items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3.5 text-center text-base font-bold uppercase tracking-wide text-white font-['Inter'] transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 sm:min-h-[3.5rem] sm:py-4"
              >
                <svg className="h-5 w-5 shrink-0 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {tr.compatibilitateInvertorAskAssistanceBtn}
              </a>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-gray-500 font-['Inter']">{tr.compatibilitateNoResults}</p>
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
  const [mobileTechOpen, setMobileTechOpen] = useState(false)
  const [mobileSafetyOpen, setMobileSafetyOpen] = useState(false)
  const [showFullTechDetailsModal, setShowFullTechDetailsModal] = useState(false)

  const galleryScrollerRef = useRef<HTMLDivElement>(null)
  const galleryScrollRaf = useRef(0)

  const [galleryZoomEnabled, setGalleryZoomEnabled] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => setGalleryZoomEnabled(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const galleryImageCount = product && Array.isArray(product.images) ? product.images.length : 0

  useEffect(() => {
    setActiveImage(0)
    requestAnimationFrame(() => {
      galleryScrollerRef.current?.scrollTo({ left: 0, behavior: 'auto' })
    })
  }, [product?.id])

  const handleGalleryScrollerScroll = useCallback(() => {
    cancelAnimationFrame(galleryScrollRaf.current)
    galleryScrollRaf.current = requestAnimationFrame(() => {
      const el = galleryScrollerRef.current
      if (!el || galleryImageCount <= 1) return
      const w = el.clientWidth
      if (w <= 0) return
      // Nearest slide (avoids off-by-one while snap / momentum is between pages)
      const idx = Math.max(
        0,
        Math.min(galleryImageCount - 1, Math.floor((el.scrollLeft + w * 0.5) / w)),
      )
      setActiveImage((prev) => (prev !== idx ? idx : prev))
    })
  }, [galleryImageCount])

  useEffect(() => () => cancelAnimationFrame(galleryScrollRaf.current), [])

  const galleryScrollToIndex = (index: number) => {
    const el = galleryScrollerRef.current
    if (!el || galleryImageCount <= 1) return
    const w = el.clientWidth
    if (w <= 0) return
    const i = Math.max(0, Math.min(galleryImageCount - 1, index))
    el.scrollTo({ left: i * w, behavior: 'smooth' })
  }

  const galleryScrollByDelta = (delta: number) => {
    const el = galleryScrollerRef.current
    if (!el) return
    el.scrollBy({ left: delta * el.clientWidth, behavior: 'smooth' })
  }

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
  const faqItems = Array.isArray(product.faq)
    ? product.faq.filter((f) => (f.q?.trim() || f.a?.trim()))
    : []
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
        <nav className="mb-3 hidden w-full items-center justify-end gap-2 text-sm text-gray-500 font-['Inter'] lg:mb-4 lg:flex">
          <Link to="/" className="hover:text-black transition-colors">{tr.breadcrumbHome}</Link>
          <span>/</span>
          <Link to="/produse" className="hover:text-black transition-colors">{tr.breadcrumbProducts}</Link>
          <span>/</span>
          <span className="text-black">{divisionLabel}</span>
        </nav>

        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:items-start gap-8 lg:gap-5 overflow-visible">
          {/* Mobile: title → description → images → specs (boxed 2/col) → purchase via flex order; lg: sticky left column */}
          <div className="max-lg:contents lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:row-span-full lg:sticky lg:top-20 lg:z-10 lg:flex lg:h-min lg:flex-col lg:gap-8 lg:self-start">
            <header className="order-1 w-full max-w-lg space-y-0 lg:order-none">
              <h1 className="text-black text-2xl font-bold font-['Inter'] leading-tight tracking-tight m-0 sm:text-3xl">
                {product.title}
              </h1>
              {!residentialProductStockUnavailable(product) || productHasEligibleReducerePrograms(product) ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {!residentialProductStockUnavailable(product) ? (
                    <span className="inline-flex max-w-full items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white font-['Inter'] shadow-sm ring-1 ring-emerald-800/40">
                      {tr.residentialStockInStockBadge}
                    </span>
                  ) : null}
                  <ResidentialReducereProgramBadge product={product} label={tr.programReducereBadge} />
                </div>
              ) : null}
              {rawDesc ? (
                <div className="mt-3 sm:mt-4 max-w-prose">
                  <p className="text-neutral-700 text-base font-['Inter'] leading-relaxed m-0">
                    {rawDesc}
                  </p>
                </div>
              ) : null}
            </header>

            <section className="order-4 m-0 w-full max-w-lg lg:order-none hidden lg:block" aria-label={tr.dateTehnice}>
              <ul className="m-0 grid list-none gap-3 p-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)_minmax(0,1.4fr)] lg:gap-x-8 lg:gap-y-5">
                {specs.map((s, i) => (
                  <ResidentialProductSpecCard key={i} label={s.label} value={s.value} variant="plain" />
                ))}
              </ul>
            </section>

            <div className="order-5 flex w-full max-w-lg flex-col gap-6 lg:order-none">
              <hr className="m-0 w-full border-0 border-t border-neutral-200 lg:hidden" />
              <section className="m-0">
                {showResidentialClientPurchaseUI(product) ? (
                  <ResidentialClientPriceBlock product={product} tr={tr} lang={language.code as LangCode} />
                ) : (
                  <ProductPriceBlock product={product} lang={language.code as LangCode} embedded />
                )}
              </section>
            </div>
          </div>

          <div className="max-lg:contents lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:flex lg:flex-col lg:gap-3 lg:min-w-0 lg:self-start">
            <div className="order-2 w-full max-lg:-mx-5 max-lg:w-[calc(100%+2.5rem)] lg:mx-0 lg:w-full lg:max-w-none lg:order-none">
              <div
                className={`relative flex h-[320px] items-center justify-center overflow-hidden bg-neutral-100 lg:h-[460px] max-lg:rounded-none lg:rounded-[10px] ${
                  galleryZoomEnabled ? 'cursor-zoom-in' : 'cursor-default'
                }`}
                onClick={() => galleryZoomEnabled && setShowImageModal(true)}
                role={galleryZoomEnabled ? 'button' : undefined}
                tabIndex={galleryZoomEnabled ? 0 : -1}
                onKeyDown={(e) => galleryZoomEnabled && e.key === 'Enter' && setShowImageModal(true)}
                aria-label={galleryZoomEnabled ? 'Mărire imagine' : undefined}
              >
                <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center" aria-hidden>
                  <img
                    src="/images/shared/baterino-logo-black.svg"
                    alt=""
                    className="h-20 w-40 max-w-[55%] object-contain opacity-[0.14]"
                  />
                </div>
                {imgs.length > 1 ? (
                  <>
                    <div className="pointer-events-none absolute top-4 right-4 z-20 hidden items-center gap-1.5 rounded-lg bg-white/80 px-2.5 py-1.5 shadow-sm lg:flex">
                      <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-['Inter'] text-sm font-semibold text-black">
                        {activeImage + 1}/{imgs.length}
                      </span>
                    </div>
                    <div
                      ref={galleryScrollerRef}
                      onScroll={handleGalleryScrollerScroll}
                      className="relative z-10 flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    >
                      {imgs.map((src, i) => (
                        <div
                          key={i}
                          className="flex h-full w-full min-w-full shrink-0 snap-center items-center justify-center"
                        >
                          <ProductImageWithLoader src={src} alt={product.title} />
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        galleryScrollByDelta(-1)
                      }}
                      className="absolute left-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 shadow-sm hover:bg-white lg:flex"
                      aria-label={tr.ariaPrev}
                    >
                      <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        galleryScrollByDelta(1)
                      }}
                      className="absolute right-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 shadow-sm hover:bg-white lg:flex"
                      aria-label={tr.ariaNext}
                    >
                      <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <div className="relative z-10 flex h-full w-full items-center justify-center">
                    <ProductImageWithLoader src={img} alt={product.title} />
                  </div>
                )}
              </div>
              {imgs.length > 1 ? (
                <div className="mt-3 flex justify-center gap-2 px-1" role="tablist" aria-label="Imagini produs">
                  {imgs.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-selected={i === activeImage}
                      aria-label={`${i + 1} / ${imgs.length}`}
                      onClick={() => {
                        setActiveImage(i)
                        galleryScrollToIndex(i)
                      }}
                      className="flex min-h-11 min-w-11 items-center justify-center p-2"
                    >
                      <span
                        className={`block h-2 w-2 rounded-full transition-colors ${
                          i === activeImage ? 'bg-neutral-800' : 'bg-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="order-3 w-full flex flex-col lg:order-none lg:min-w-0">
            <section className="flex flex-col lg:pt-6" aria-labelledby="compat-util-heading">
              <h3
                id="compat-util-heading"
                className="text-black text-lg font-bold font-['Inter'] mb-3 m-0"
              >
                {tr.compatibilitateSiUtilizare}
              </h3>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setShowCompatibilitateModal(true)}
                  className="group order-1 flex min-h-[52px] items-center gap-3 rounded-xl bg-[#f7f7f7] px-4 py-3 text-left shadow-none transition-shadow duration-200 hover:shadow-md lg:min-w-0"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/90">
                    <img src="/images/shared/compatibility-icon.svg" alt="" aria-hidden className="h-6 w-6 object-contain opacity-90" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-semibold text-neutral-900 font-['Inter'] leading-snug">{tr.verificareCompatibilitate}</span>
                  <svg className="h-5 w-5 shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="order-2 lg:hidden">
                  <ResidentialMobileExpandable
                    title={tr.sigurantaBaterino}
                    iconSrc="/images/shared/safety-icon.svg"
                    open={mobileSafetyOpen}
                    onToggle={() => {
                      setMobileSafetyOpen((prev) => {
                        const next = !prev
                        if (next) setMobileTechOpen(false)
                        return next
                      })
                    }}
                    triggerId="res-mobile-safety-trigger"
                  >
                    <ResidentialBadgesGrid
                      badges={badges}
                      onCompatibilitate99={() => setShowCompatibilitate99Modal(true)}
                      onGarantie={() => setShowGarantieModal(true)}
                      onProducatori={() => setShowProducatoriModal(true)}
                      onRetur={() => setShowReturModal(true)}
                      onSwap={() => setShowSwapModal(true)}
                      onSuport={() => setShowSuportModal(true)}
                    />
                  </ResidentialMobileExpandable>
                </div>
                <div className="order-3 lg:hidden">
                  <ResidentialMobileExpandable
                    title={tr.detaliiTehnice}
                    iconSrc="/images/shared/bms-icon.svg"
                    open={mobileTechOpen}
                    onToggle={() => {
                      setMobileTechOpen((prev) => {
                        const next = !prev
                        if (next) setMobileSafetyOpen(false)
                        return next
                      })
                    }}
                    triggerId="res-mobile-tech-trigger"
                  >
                    <ResidentialTechSpecTable ariaLabel={tr.dateTehnice} rows={specs} />
                    {techData.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setShowFullTechDetailsModal(true)}
                        className="mt-3 flex w-full min-h-[3.25rem] items-center justify-center rounded-xl border border-blue-600 bg-white py-3.5 text-center text-base font-bold uppercase tracking-wide text-black font-['Inter'] transition-colors hover:bg-neutral-50 sm:min-h-[3.5rem] sm:py-4"
                      >
                        {tr.toateDetaliileBtn}
                      </button>
                    ) : null}
                  </ResidentialMobileExpandable>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCeSePoateAlimentaModal(true)}
                  className="group order-4 flex min-h-[52px] items-center gap-3 rounded-xl bg-[#f7f7f7] px-4 py-3 text-left shadow-none transition-shadow duration-200 hover:shadow-md lg:order-2 lg:min-w-0"
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
          </div>

            <div className="order-6 hidden w-full flex-col gap-8 lg:order-none lg:flex lg:min-w-0">
              <section className="flex flex-col lg:pt-6" aria-labelledby="siguranta-baterino-heading">
                <h3
                  id="siguranta-baterino-heading"
                  className="text-black text-lg font-bold font-['Inter'] mb-3 m-0"
                >
                  {tr.sigurantaBaterino}
                </h3>
                <ResidentialBadgesGrid
                  badges={badges}
                  onCompatibilitate99={() => setShowCompatibilitate99Modal(true)}
                  onGarantie={() => setShowGarantieModal(true)}
                  onProducatori={() => setShowProducatoriModal(true)}
                  onRetur={() => setShowReturModal(true)}
                  onSwap={() => setShowSwapModal(true)}
                  onSuport={() => setShowSuportModal(true)}
                />
              </section>
            </div>
          </div>

            <div className="order-7 flex flex-col gap-8 lg:col-span-6 lg:col-start-7 lg:min-w-0">
              {docs.length > 0 && (
                <div>
                  <h3 className="text-black text-lg font-bold font-['Inter'] mb-3">{tr.documenteTehnice}</h3>
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
                <section className="hidden lg:block">
                  <h2 className="text-black text-lg font-bold font-['Inter'] mb-4 sm:mb-6">{tr.dateTehnice}</h2>
                  <ResidentialTechSpecTable
                    ariaLabel={tr.dateTehnice}
                    rows={techData.map(([label, value]) => ({ label, value }))}
                  />
                </section>
              )}

              {faqItems.length > 0 ? (
                <section aria-labelledby="res-product-faq-heading">
                  <h2
                    id="res-product-faq-heading"
                    className="text-black text-lg font-bold font-['Inter'] mb-4 sm:mb-6"
                  >
                    {tr.intrebariFrecvente}
                  </h2>
                  <div className="divide-y divide-neutral-200 rounded-[10px] border border-neutral-200/80 bg-neutral-50/80">
                    {faqItems.map((item, i) => (
                      <details key={`faq-${i}-${item.q}`} className="group bg-white open:bg-neutral-50/50">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-left font-semibold text-slate-900 sm:px-5 sm:py-4 [&::-webkit-details-marker]:hidden">
                          <span className="min-w-0 flex-1 text-sm leading-snug sm:text-base">{item.q}</span>
                          <ChevronDown
                            size={22}
                            strokeWidth={2}
                            className="shrink-0 text-slate-600 transition-transform duration-200 group-open:rotate-180"
                            aria-hidden
                          />
                        </summary>
                        <div className="border-t border-neutral-100 px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
                          <p className="m-0 pt-3 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{item.a}</p>
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="flex flex-col gap-4">
                <div className="relative h-64 w-full max-w-[592px] overflow-hidden rounded-[10px]">
                  <img className="absolute inset-0 h-full w-full rounded-[10px] object-cover" src="/images/product/baterino-swap.jpg" alt="" />
                  <div className="absolute inset-0 rounded-[10px] bg-black/50" />
                  <div className="absolute inset-0 z-10 flex flex-col justify-end gap-2.5 px-6 pb-5 pt-6 sm:gap-3 sm:px-8 sm:pb-6 sm:pt-8">
                    <p className="m-0 w-full shrink-0 text-xl font-bold leading-tight text-white font-['Inter'] sm:text-2xl">
                      {tr.stiaiCa}
                    </p>
                    <p className="m-0 w-full text-pretty text-sm font-normal leading-snug text-white font-['Inter'] sm:text-base">
                      {tr.swapDesc}
                    </p>
                    <div className="shrink-0 pt-0.5">
                      <Link
                        to="/siguranta"
                        className="inline-flex h-10 min-w-[11rem] items-center justify-center gap-2 rounded-lg bg-white px-4 hover:bg-neutral-100 transition-colors sm:min-w-[12rem] sm:px-5"
                      >
                        <span className="text-center text-xs font-bold uppercase tracking-wide text-black font-['Nunito_Sans'] sm:text-sm">
                          {tr.swapBannerCta}
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="relative h-64 w-full max-w-[589px] overflow-hidden rounded-[10px]">
                  <img className="absolute inset-0 h-full w-full rounded-[10px] object-cover" src="/images/product/reduceri-banner.jpg" alt="" />
                  <div className="absolute inset-0 rounded-[10px] bg-black/50" />
                  <div className="absolute inset-0 z-10 flex flex-col justify-end gap-2.5 px-6 pb-5 pt-6 sm:gap-3 sm:px-8 sm:pb-6 sm:pt-8">
                    <p className="m-0 max-w-[calc(100%-0.5rem)] text-xl font-bold leading-tight text-white font-['Inter'] sm:text-2xl">
                      {tr.reduceriTitle}
                    </p>
                    <p className="m-0 max-w-lg shrink-0 text-sm font-normal leading-snug text-white font-['Inter'] sm:text-base">
                      {tr.reduceriDesc}
                    </p>
                    <div className="shrink-0 pt-0.5">
                      <Link
                        to="/reduceri"
                        className="inline-flex h-10 min-w-[11rem] items-center justify-center gap-2 rounded-lg bg-white px-4 hover:bg-neutral-100 transition-colors sm:min-w-[12rem] sm:px-5"
                      >
                        <span className="text-center text-xs font-bold uppercase tracking-wide text-black font-['Nunito_Sans'] sm:text-sm">
                          {tr.intraInCont}
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </section>

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

      {showFullTechDetailsModal && (
        <ResidentialFullTechDetailsModal
          onClose={() => setShowFullTechDetailsModal(false)}
          tr={tr}
          productTitle={product.title}
          productImageSrc={img}
          techData={techData}
        />
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
