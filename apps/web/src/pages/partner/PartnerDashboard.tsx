import { useState, useEffect, useCallback, useMemo, useRef, type ReactNode, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  Percent,
  Truck,
  Headphones,
  Store,
  UserCheck,
  RefreshCw,
  Check,
  ShoppingCart,
  Package,
  ClipboardList,
  Wrench,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Building2,
  Cable,
  Info,
  Bell,
  TrendingUp,
  Activity,
  Award,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useCatalogCurrency } from '../../contexts/CatalogCurrencyContext'
import {
  getPartnerProfile,
  getProducts,
  getPartnerOrders,
  getProductCardImageUrl,
  getCatalogProductSpecLines,
  getResidentialCatalogStockListingCta,
  residentialProductStockUnavailable,
  getPartnerDisplayUnitPriceWithVat,
  getPartnerCatalogVatPercentForDisplay,
  type PublicProduct,
} from '../../lib/api'
import {
  countPartnerDashboardProductBuckets,
  type PartnerDashboardProductBucketKey,
} from '../../lib/catalog-sector'
import { countPartnerOrderDashboardBuckets, partnerOrdersActiveSubtotal, type PartnerOrderDashBuckets } from '../../lib/partner-order-dashboard'
import { getProduseTranslations } from '../../i18n/produse'
import type { LangCode } from '../../i18n/menu'
import { readPartnerCartFromStorage } from '../../lib/partnerCart'
import CompatibilitateInvertorModal from '../../components/CompatibilitateInvertorModal'
import { ReducerePartenerBox, SigurantaClientuluiBox, SuportTehnicBox, PartnerInverterCompatibilityBox, AvantajePartenerDashboardBox, quickPanelEyebrowCls, quickPanelTitleCls, quickPanelBodyCls } from './PartnerSidebarBoxes'

const PENDING_PARTNER_ADVANTAGES: { Icon: LucideIcon; title: string; subtitle: string }[] = [
  {
    Icon: Truck,
    title: 'Livrare și logistică',
    subtitle:
      'Ne ocupăm de întregul lanț logistic, de la depozit până la clientul final. Tu te concentrezi pe clienți — noi gestionăm transportul.',
  },
  {
    Icon: Headphones,
    title: 'Suport tehnic și comercial',
    subtitle:
      'Ai acces la o echipă dedicată pentru orice întrebare legată de produse, specificații tehnice sau soluții personalizate.',
  },
  {
    Icon: Store,
    title: 'Vizibilitate în fața clienților',
    subtitle:
      'Profilul tău apare pe platforma Baterino, conectându-te direct cu clienți din zona ta care caută instalatori verificați.',
  },
  {
    Icon: UserCheck,
    title: 'Responsabilitate client final',
    subtitle:
      'Gestionăm after-sale-ul direct cu clientul final — reclamații, garanții și suport post-instalare — astfel reputația ta rămâne intactă.',
  },
  {
    Icon: RefreshCw,
    title: 'Baterino SWAP',
    subtitle:
      'În cazul unei defecțiuni, înlocuim bateria rapid și fără birocrație. Clientul tău nu rămâne fără soluție.',
  },
  {
    Icon: Percent,
    title: 'Prețuri și reduceri pentru parteneri',
    subtitle:
      'Prețuri preferențiale, marje clare și o strategie construită împreună — ca să fii competitiv și profitabil la fiecare proiect.',
  },
]

const APPROVAL_TIMELINE_STEPS = [
  'Deschidere cont partener',
  'Dezbatere parteneriat și strategie',
  'Semnarea contractului',
  'Aprobare cont partener',
] as const

/** Pas activ în timpul așteptării aprobării (index 0-based): dezbatere parteneriat. */
const APPROVAL_TIMELINE_CURRENT_INDEX = 1

const PARTNER_DASH_SIDEBAR_COLLAPSED_KEY = 'baterino.partner-dash.sidebarCollapsed'
/** PartnerLayout `<main>` — overflow toggled while Quick Panel is expanded (desktop). */
const PARTNER_LAYOUT_SCROLL_ID = 'partner-layout-scroll'

function IconAlert() {
  return (
    <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

/** Small “ⓘ” in the corner of KPI cards; tooltip explains the metric. */
function PartnerDashStatCardInfo({
  tooltipText,
  label,
  className,
}: {
  tooltipText: string
  label: string
  className?: string
}) {
  return (
    <span
      className={`group/statinf pointer-events-auto absolute right-2.5 top-2.5 z-[2] md:right-3 md:top-3 ${className ?? ''}`}
    >
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 outline-none transition-colors hover:border-slate-200/90 hover:bg-slate-50 hover:text-slate-600 focus-visible:border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-400/35 focus-visible:ring-offset-2"
        aria-label={label}
      >
        <Info className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-[70] mb-2 w-max max-w-[min(17rem,calc(100vw-2.5rem))] -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-left text-xs font-medium leading-snug text-white opacity-0 shadow-xl ring-1 ring-white/10 transition-opacity duration-150 group-hover/statinf:opacity-100 group-focus-within/statinf:opacity-100 sm:left-auto sm:right-0 sm:translate-x-0"
      >
        {tooltipText}
      </span>
    </span>
  )
}

const PARTNER_DASH_SURFACE_SHADOW =
  'shadow-[0_8px_32px_-12px_rgba(15,23,42,0.12),0_4px_16px_-8px_rgba(15,23,42,0.06)]'

const PARTNER_DASH_KPI_NAV_CARD_CLS =
  `group relative flex min-h-0 min-w-0 flex-col gap-0 rounded-2xl bg-white p-4 pr-10 ${PARTNER_DASH_SURFACE_SHADOW} transition-all duration-200 sm:pr-11 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_-14px_rgba(15,23,42,0.16),0_8px_24px_-10px_rgba(15,23,42,0.09)] focus-within:shadow-[0_20px_48px_-14px_rgba(15,23,42,0.16),0_8px_24px_-10px_rgba(15,23,42,0.09)]`

const PARTNER_DASH_PROFILE_NAV_CARD_CLS =
  `group relative flex h-full min-h-0 w-full flex-nowrap items-center gap-4 rounded-2xl bg-white p-5 pr-11 ${PARTNER_DASH_SURFACE_SHADOW} transition-all duration-200 sm:pr-12 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_-14px_rgba(15,23,42,0.16),0_8px_24px_-10px_rgba(15,23,42,0.09)] focus-within:shadow-[0_20px_48px_-14px_rgba(15,23,42,0.16),0_8px_24px_-10px_rgba(15,23,42,0.09)]`

const PARTNER_DASH_BENEFIT_CARD_CLS = 'min-w-0 sm:col-span-1'

function PartnerDashActivityKpiCardSkeleton() {
  return (
    <div
      className={`flex min-h-[11.5rem] min-w-0 flex-col gap-0 rounded-2xl bg-white p-4 pr-10 sm:pr-11 ${PARTNER_DASH_SURFACE_SHADOW}`}
      aria-busy="true"
      aria-hidden
    >
      <div className="flex min-h-0 items-start gap-3 sm:gap-4">
        <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-slate-100" />
        <div className="min-w-0 flex-1">
          <div className="mb-2 h-3 w-28 max-w-[70%] animate-pulse rounded-md bg-slate-100" />
          <div className="h-9 w-14 animate-pulse rounded-md bg-slate-100" />
          <div className="mt-3 border-t border-slate-100 pt-2.5">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="min-w-0">
                  <div className="mx-auto h-2.5 max-w-[4rem] animate-pulse rounded bg-slate-100 sm:mx-0" />
                  <div className="mx-auto mt-2 h-7 w-9 animate-pulse rounded bg-slate-100 sm:mx-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PartnerDashProfileStatCardSkeleton() {
  return (
    <div
      className={`relative flex h-full min-h-[5.5rem] min-w-0 w-full flex-nowrap items-center gap-4 rounded-2xl bg-white p-5 pr-11 sm:pr-12 ${PARTNER_DASH_SURFACE_SHADOW}`}
      aria-busy="true"
    >
      <div
        className="pointer-events-none absolute right-2.5 top-2.5 h-8 w-8 shrink-0 rounded-lg bg-slate-100 md:right-3 md:top-3"
        aria-hidden
      />
      <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-slate-100" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-nowrap items-center justify-start gap-8 sm:gap-10 lg:gap-12">
        <div className="min-w-0 shrink-0">
          <div className="mb-2 h-3 w-24 animate-pulse rounded-md bg-slate-200/90" />
          <div className="h-9 w-12 animate-pulse rounded-md bg-slate-200/90" />
        </div>
        <div className="min-w-0 shrink-0">
          <div className="mb-2 h-3 w-20 animate-pulse rounded-md bg-slate-200/90" />
          <div className="h-9 w-11 animate-pulse rounded-md bg-slate-200/90" />
        </div>
      </div>
    </div>
  )
}

function PartnerDashKpiNavShell({
  to,
  ariaLabel,
  loading,
  tooltipText,
  infoAria,
  children,
}: {
  to: string
  ariaLabel: string
  loading: boolean
  tooltipText: string
  infoAria: string
  children: ReactNode
}) {
  if (loading) {
    return <PartnerDashActivityKpiCardSkeleton />
  }
  return (
    <div className={PARTNER_DASH_KPI_NAV_CARD_CLS}>
      <Link to={to} className="absolute inset-0 z-0 rounded-2xl" aria-label={ariaLabel} />
      <div className="relative z-[1] pointer-events-none">{children}</div>
      <PartnerDashStatCardInfo tooltipText={tooltipText} label={infoAria} />
    </div>
  )
}

function PartnerApprovalTimelineSkeleton() {
  return (
    <div
      className={`mb-6 rounded-2xl bg-slate-50/90 px-5 py-6 sm:px-6 animate-pulse ${PARTNER_DASH_SURFACE_SHADOW}`}
      aria-hidden
    >
      <div className="flex items-start justify-between gap-1 sm:gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2 min-w-0">
            <div className="h-10 w-10 rounded-full bg-slate-200" />
            <div className="h-3 w-full max-w-[5.5rem] bg-slate-200/90 rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

function PartnerApprovalTimeline() {
  return (
    <div className={`mb-6 rounded-2xl bg-white px-5 py-6 sm:px-7 ${PARTNER_DASH_SURFACE_SHADOW}`}>
      {/* Accent stripe */}
      <div className="pointer-events-none mb-5 h-1 w-full max-w-xs rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 sm:mb-6" aria-hidden />

      {/* Desktop / tablet: horizontal */}
      <ol
        className="hidden sm:flex sm:items-start sm:w-full"
        aria-label="Etape aprobare cont partener"
      >
        {APPROVAL_TIMELINE_STEPS.map((label, i) => {
          const isComplete = i < APPROVAL_TIMELINE_CURRENT_INDEX
          const isCurrent = i === APPROVAL_TIMELINE_CURRENT_INDEX
          return (
            <li key={label} className="flex flex-1 min-w-0 items-start last:flex-[0_0_auto]">
              <div className="flex flex-1 min-w-0 flex-col items-center text-center">
                <TimelineStepMarker index={i} isComplete={isComplete} isCurrent={isCurrent} />
                <span
                  className={`mt-3 text-xs font-['Inter'] leading-tight sm:text-[13px] px-0.5 ${
                    isCurrent
                      ? 'font-semibold text-indigo-950'
                      : isComplete
                        ? 'font-medium text-slate-700'
                        : 'font-medium text-slate-500'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < APPROVAL_TIMELINE_STEPS.length - 1 && (
                <div
                  className={`mx-1.5 mt-[22px] h-[3px] min-w-[0.5rem] flex-1 rounded-full ${
                    i < APPROVAL_TIMELINE_CURRENT_INDEX ? 'bg-indigo-400' : 'bg-slate-200'
                  }`}
                  aria-hidden
                />
              )}
            </li>
          )
        })}
      </ol>

      {/* Mobile: vertical */}
      <ol className="sm:hidden space-y-0 font-['Inter']" aria-label="Etape aprobare cont partener">
        {APPROVAL_TIMELINE_STEPS.map((label, i) => {
          const isComplete = i < APPROVAL_TIMELINE_CURRENT_INDEX
          const isCurrent = i === APPROVAL_TIMELINE_CURRENT_INDEX
          const isLast = i === APPROVAL_TIMELINE_STEPS.length - 1
          return (
            <li key={label} className="flex gap-3.5">
              <div className="flex flex-col items-center">
                <TimelineStepMarker index={i} isComplete={isComplete} isCurrent={isCurrent} />
                {!isLast && (
                  <div
                    className={`w-[3px] flex-1 min-h-[1.25rem] my-1.5 rounded-full ${
                      i < APPROVAL_TIMELINE_CURRENT_INDEX ? 'bg-indigo-400' : 'bg-slate-200'
                    }`}
                    aria-hidden
                  />
                )}
              </div>
              <div
                className={`pb-5 pt-2 text-sm leading-snug ${
                  isCurrent ? 'font-semibold text-indigo-950' : isComplete ? 'font-medium text-slate-700' : 'font-medium text-slate-500'
                }`}
              >
                {label}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function TimelineStepMarker({
  index,
  isComplete,
  isCurrent,
}: {
  index: number
  isComplete: boolean
  isCurrent: boolean
}) {
  if (isComplete) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
        <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden />
        <span className="sr-only">Finalizat</span>
      </div>
    )
  }
  if (isCurrent) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700 shadow-sm ring-2 ring-indigo-500 ring-offset-2 ring-offset-white">
        {index + 1}
        <span className="sr-only">În curs</span>
      </div>
    )
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-sm font-semibold text-slate-400 shadow-[0_4px_14px_-6px_rgba(15,23,42,0.12)]">
      {index + 1}
      <span className="sr-only">Urmează</span>
    </div>
  )
}

function PartnerAdvantageBoxesSkeleton() {
  return (
    <section className="mb-8" aria-busy="true" aria-label="Se încarcă avantajele">
      <div className="h-7 w-72 max-w-full bg-gray-200 rounded-md animate-pulse mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className={`rounded-2xl p-5 sm:p-6 flex flex-col gap-1.5 bg-gray-100/80 animate-pulse ${PARTNER_DASH_SURFACE_SHADOW}`}
          >
            <div className="h-10 w-10 rounded-xl bg-gray-300/90" />
            <div className="h-5 w-4/5 max-w-[14rem] bg-gray-300/90 rounded" />
            <div className="h-3.5 w-full bg-gray-200 rounded" />
            <div className="h-3.5 w-full bg-gray-200 rounded" />
            <div className="h-3.5 w-11/12 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </section>
  )
}

function formatTrendCardPrice(price: number, langCode: string, currency: string): string {
  const locale = langCode === 'en' ? 'en-GB' : langCode === 'zh' ? 'zh-CN' : 'ro-RO'
  return `${price.toLocaleString(locale, { maximumFractionDigits: 0 })} ${currency}`
}

function formatTrendCardVatPctLabel(pct: number): string {
  if (Number.isInteger(pct)) return String(pct)
  const rounded = Math.round(pct * 100) / 100
  return String(rounded).replace(/\.?0+$/, '')
}

/** Skeleton tile for trending products carousel — mirrors `PartnerTrendingProductCard` sizing. */
function PartnerTrendingProductCardSkeleton() {
  return (
    <li
      aria-hidden
      className={`flex w-[min(17.5rem,calc(100vw-6.75rem))] shrink-0 snap-start animate-pulse flex-col overflow-hidden rounded-2xl bg-white sm:w-[17.75rem] ${PARTNER_DASH_SURFACE_SHADOW}`}
    >
      <div className="relative bg-[#f7f7f7]">
        <div className="absolute left-3 top-3 h-5 w-[4.875rem] rounded-full bg-slate-200/90" aria-hidden />
        <div className="flex h-56 items-center justify-center p-6">
          <div className="h-44 w-[90%] max-w-[11.5rem] rounded-xl bg-slate-200/90" aria-hidden />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 p-4">
        <div className="min-w-0 space-y-2">
          <div className="h-4 w-[92%] max-w-[11rem] rounded-md bg-slate-200/90" />
          <div className="h-4 w-[68%] max-w-[9rem] rounded-md bg-slate-200/80" />
          <div className="h-3 w-[54%] max-w-[7rem] rounded-md bg-slate-200/70" />
        </div>
        <div className="mt-auto space-y-2 pt-1">
          <div className="h-5 w-28 max-w-full rounded-md bg-slate-200/85" />
          <div className="h-3 w-36 max-w-full rounded-md bg-slate-200/65" />
        </div>
        <div className="mt-1 h-[2.5rem] w-full rounded-xl bg-slate-200/65" aria-hidden />
      </div>
    </li>
  )
}

/** Matches partner catalog stock pill (PartnerProducts `StockBadge`). */
function PartnerTrendStockBadge({
  product,
  inStockLabel,
  outOfStockLabel,
  comingSoonLabel,
}: {
  product: PublicProduct
  inStockLabel: string
  outOfStockLabel: string
  comingSoonLabel: string
}) {
  const status = product.catalogStockStatus
  if (status === 'out_of_stock') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700 font-['Inter']">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden />
        {outOfStockLabel}
      </span>
    )
  }
  if (status === 'coming_soon') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 font-['Inter']">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden />
        {comingSoonLabel}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 font-['Inter']">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
      {inStockLabel}
    </span>
  )
}

/** Partner catalog card chrome + price + single „Detalii” (no quantity / coș). */
function PartnerTrendingProductCard({
  product,
  trProduse,
  langCode,
  currency,
}: {
  product: PublicProduct
  trProduse: ReturnType<typeof getProduseTranslations>
  langCode: string
  currency: string
}) {
  const img = getProductCardImageUrl(product)
  const { specLine1 } = getCatalogProductSpecLines(product)
  const stockUnavailable = residentialProductStockUnavailable(product)
  const stockCta = getResidentialCatalogStockListingCta(product, {
    outOfStock: trProduse.catalogStockOutOfStock,
    comingSoon: trProduse.catalogStockComingSoon,
  })
  const unitWithVat = getPartnerDisplayUnitPriceWithVat(product)
  const priceDisplay = !Number.isNaN(unitWithVat) ? formatTrendCardPrice(unitWithVat, langCode, currency) : null
  const partnerVatPct = getPartnerCatalogVatPercentForDisplay(product)
  const subtitle = String(product.subtitle || '').trim()
  const detailsLabel = langCode === 'en' ? 'Details' : langCode === 'zh' ? '详情' : 'Detalii'
  const detailHref = `/partner/produse?detail=${encodeURIComponent(product.id)}`
  const detailsAria =
    langCode === 'en'
      ? `Open ${detailsLabel} for ${product.title}`
      : langCode === 'zh'
        ? `${detailsLabel}：${product.title}`
        : `Deschide ${detailsLabel.toLowerCase()} pentru ${product.title}`

  return (
    <li className={`group relative flex w-[min(17.5rem,calc(100vw-6.75rem))] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-white transition-all duration-200 hover:shadow-[0_20px_48px_-14px_rgba(15,23,42,0.16),0_8px_24px_-10px_rgba(15,23,42,0.09)] sm:w-[17.75rem] ${PARTNER_DASH_SURFACE_SHADOW}`}>
      <Link to={detailHref} className="absolute inset-0 z-0 rounded-2xl" aria-label={detailsAria} />
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col pointer-events-none">
        <div className="relative bg-[#f7f7f7]">
          <div className="flex h-56 items-center justify-center p-6">
            <img
              src={img}
              alt=""
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
          </div>
          <div className="absolute left-3 top-3">
            <PartnerTrendStockBadge
              product={product}
              inStockLabel={trProduse.catalogStockInStock}
              outOfStockLabel={trProduse.catalogStockOutOfStock}
              comingSoonLabel={trProduse.catalogStockComingSoon}
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 p-4">
          <div className="min-w-0">
            <p className="m-0 line-clamp-2 text-base font-bold leading-snug text-slate-900 font-['Inter']">{product.title}</p>
            {(subtitle || specLine1) && (
              <p className="mt-1 m-0 line-clamp-1 text-xs text-slate-500 font-['Inter']">{subtitle || specLine1}</p>
            )}
          </div>

          <div className="mt-auto pt-1">
            {priceDisplay && !stockUnavailable ? (
              <div>
                <p className="m-0 text-base font-extrabold tabular-nums text-slate-900 font-['Inter']">{priceDisplay}</p>
                {partnerVatPct != null ? (
                  <p className="mt-0.5 m-0 text-[11px] font-medium text-slate-500 font-['Inter']">
                    {trProduse.catalogIncludesVatWithPct.replace('{pct}', formatTrendCardVatPctLabel(partnerVatPct))}
                  </p>
                ) : null}
              </div>
            ) : stockCta ? (
              <p className="m-0 text-xs font-semibold text-slate-500 font-['Inter']">{stockCta}</p>
            ) : (
              <p className="m-0 text-xs text-slate-400 font-['Inter']">—</p>
            )}
          </div>

          <div className="mt-1 flex flex-col gap-2">
            {stockUnavailable ? (
              <div className="rounded-xl bg-slate-50 px-3 py-2 text-center shadow-[0_4px_14px_-8px_rgba(15,23,42,0.08)]">
                <p className="m-0 text-xs font-semibold text-slate-500 font-['Inter']">{trProduse.catalogStockPartnerFooterNote}</p>
              </div>
            ) : null}
            <span className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_4px_14px_-8px_rgba(15,23,42,0.08)] transition group-hover:bg-slate-50 group-hover:text-slate-900 group-hover:shadow-[0_8px_22px_-10px_rgba(15,23,42,0.12)] font-['Inter']">
              <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
              <span aria-hidden>{detailsLabel}</span>
            </span>
          </div>
        </div>
      </div>
    </li>
  )
}

/** Mouse drag to scroll horizontally; touch uses native overscroll-x pan on the strip. */
function useProfitCarouselDragScroll(scrollRef: RefObject<HTMLUListElement | null>) {
  const drag = useRef({ active: false, capturing: false, startX: 0, scrollLeft: 0, dragged: false })

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLUListElement>) => {
      if (e.pointerType === 'touch' || e.button !== 0) return
      const el = scrollRef.current
      if (!el) return
      drag.current = {
        active: true,
        capturing: false,
        startX: e.clientX,
        scrollLeft: el.scrollLeft,
        dragged: false,
      }
    },
    [scrollRef],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLUListElement>) => {
      if (!drag.current.active || e.pointerType === 'touch') return
      const el = scrollRef.current
      if (!el) return
      const dx = e.clientX - drag.current.startX
      const pastThreshold = Math.abs(dx) > 3
      if (pastThreshold) {
        if (!drag.current.capturing) {
          try {
            el.setPointerCapture(e.pointerId)
          } catch {
            /* pointer may already be captured */
          }
          drag.current.capturing = true
        }
        drag.current.dragged = true
      }
      if (drag.current.capturing) {
        el.scrollLeft = drag.current.scrollLeft - dx
      }
    },
    [scrollRef],
  )

  const onPointerEnd = useCallback(
    (e: React.PointerEvent<HTMLUListElement>) => {
      if (!drag.current.active) return
      const wasDragged = drag.current.dragged
      const hadCapture = drag.current.capturing
      drag.current.active = false
      drag.current.capturing = false
      drag.current.dragged = false
      const el = scrollRef.current
      if (!el) return
      if (hadCapture) {
        try {
          el.releasePointerCapture(e.pointerId)
        } catch {
          /* already released */
        }
      }
      if (wasDragged) {
        const swallowClick = (ev: MouseEvent) => {
          ev.preventDefault()
          ev.stopImmediatePropagation()
          el.removeEventListener('click', swallowClick, true)
        }
        el.addEventListener('click', swallowClick, true)
        window.setTimeout(() => el.removeEventListener('click', swallowClick, true), 100)
      }
    },
    [scrollRef],
  )

  return { onPointerDown, onPointerMove, onPointerEnd, onPointerCancel: onPointerEnd }
}

export default function PartnerDashboard() {
  const { language } = useLanguage()
  const { currency } = useCatalogCurrency()
  const lang = language.code

  const [pendingApproval, setPendingApproval] = useState<boolean | null>(null)
  const [isSuspended, setIsSuspended] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [partnerCartLineCount, setPartnerCartLineCount] = useState(0)
  const [invertorCompatibilityModalOpen, setInvertorCompatibilityModalOpen] = useState(false)
  const [partnerSidebarCollapsed, setPartnerSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return window.localStorage.getItem(PARTNER_DASH_SIDEBAR_COLLAPSED_KEY) === '1'
    } catch {
      return false
    }
  })

  const togglePartnerSidebarCollapsed = useCallback(() => {
    setPartnerSidebarCollapsed((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(PARTNER_DASH_SIDEBAR_COLLAPSED_KEY, next ? '1' : '0')
      } catch {
        /* ignore quota / private mode */
      }
      return next
    })
  }, [])

  const syncPartnerCartCount = useCallback(() => {
    setPartnerCartLineCount(readPartnerCartFromStorage().length)
  }, [])

  useEffect(() => {
    syncPartnerCartCount()
    window.addEventListener('storage', syncPartnerCartCount)
    window.addEventListener('focus', syncPartnerCartCount)
    document.addEventListener('visibilitychange', syncPartnerCartCount)
    return () => {
      window.removeEventListener('storage', syncPartnerCartCount)
      window.removeEventListener('focus', syncPartnerCartCount)
      document.removeEventListener('visibilitychange', syncPartnerCartCount)
    }
  }, [syncPartnerCartCount])

  const [catalogProductsCountLoaded, setCatalogProductsCountLoaded] = useState(false)
  const [profitableProductsSectionExpanded, setProfitableProductsSectionExpanded] = useState(true)
  const [partnerCatalogProducts, setPartnerCatalogProducts] = useState<PublicProduct[]>([])
  const [catalogProductsTotal, setCatalogProductsTotal] = useState(0)
  const [catalogProductBuckets, setCatalogProductBuckets] = useState<Record<
    PartnerDashboardProductBucketKey,
    number
  > | null>(null)

  useEffect(() => {
    let cancelled = false
    getProducts()
      .then((list) => {
        if (!cancelled) {
          const arr = Array.isArray(list) ? list : []
          setPartnerCatalogProducts(arr)
          setCatalogProductsTotal(arr.length)
          setCatalogProductBuckets(countPartnerDashboardProductBuckets(arr))
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPartnerCatalogProducts([])
          setCatalogProductsTotal(-1)
          setCatalogProductBuckets(null)
        }
      })
      .finally(() => {
        if (!cancelled) setCatalogProductsCountLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const [partnerOrdersCountLoaded, setPartnerOrdersCountLoaded] = useState(false)
  const [partnerOrdersTotal, setPartnerOrdersTotal] = useState(0)
  const [partnerOrdersBuckets, setPartnerOrdersBuckets] = useState<PartnerOrderDashBuckets | null>(null)

  useEffect(() => {
    let cancelled = false
    getPartnerOrders()
      .then((rows) => {
        if (!cancelled) {
          const buckets = countPartnerOrderDashboardBuckets(rows)
          setPartnerOrdersBuckets(buckets)
          setPartnerOrdersTotal(partnerOrdersActiveSubtotal(buckets))
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPartnerOrdersTotal(-1)
          setPartnerOrdersBuckets(null)
        }
      })
      .finally(() => {
        if (!cancelled) setPartnerOrdersCountLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const [profile, setProfile] = useState<{
    contactFirstName?: string
    contactLastName?: string
    companyName?: string
    publicName?: string
    logoUrl?: string | null
    partnerDiscountPercent?: number | null
    publicSlug?: string | null
    street?: string
    county?: string
    city?: string
    description?: string
    services?: string[]
    publicPhone?: string
    isPublic?: boolean
  } | null>(null)

  useEffect(() => {
    setLoading(true)
    getPartnerProfile()
      .then((p: {
        isApproved?: boolean
        isSuspended?: boolean
        contactFirstName?: string
        contactLastName?: string
        companyName?: string
        publicName?: string
        logoUrl?: string | null
        partnerDiscountPercent?: number | null
        publicSlug?: string | null
        street?: string
        county?: string
        city?: string
        description?: string
        services?: string[] | string
        publicPhone?: string
        isPublic?: boolean
      }) => {
        setPendingApproval(p?.isApproved === false)
        setIsSuspended(p?.isSuspended === true)
        setProfile({
          contactFirstName: p?.contactFirstName,
          contactLastName: p?.contactLastName,
          companyName: p?.companyName,
          publicName: p?.publicName,
          logoUrl: p?.logoUrl,
          partnerDiscountPercent: p?.partnerDiscountPercent,
          publicSlug: p?.publicSlug != null ? String(p.publicSlug) : undefined,
          street: p?.street,
          county: p?.county,
          city: p?.city,
          description: p?.description,
          services: Array.isArray(p?.services)
            ? p.services
            : typeof p?.services === 'string'
              ? p.services
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              : undefined,
          publicPhone: p?.publicPhone,
          isPublic: p?.isPublic,
        })
      })
      .catch(() => {
        setPendingApproval(null)
        setIsSuspended(null)
        setProfile(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const showQuickPanel = !loading && !isSuspended && !pendingApproval

  useEffect(() => {
    const mainEl = document.getElementById(PARTNER_LAYOUT_SCROLL_ID)
    if (!mainEl) return

    const mq = window.matchMedia('(min-width: 1024px)')
    const apply = () => {
      const quickPanelExpanded = showQuickPanel && !partnerSidebarCollapsed
      mainEl.style.overflowY = mq.matches && quickPanelExpanded ? 'hidden' : ''
    }
    apply()
    mq.addEventListener('change', apply)
    return () => {
      mq.removeEventListener('change', apply)
      mainEl.style.overflowY = ''
    }
  }, [showQuickPanel, partnerSidebarCollapsed])

  const sidebarWelcomeDisplayName =
    [profile?.contactFirstName, profile?.contactLastName].filter(Boolean).join(' ') ||
    (lang === 'en' ? 'Partner' : lang === 'zh' ? '合作伙伴' : 'Partener')

  const sidebarWelcomeCompanyDisplay =
    String(profile?.companyName ?? '').trim() || String(profile?.publicName ?? '').trim() || null

  const sidebarAccountStatusLabel =
    lang === 'en' ? 'Active partner' : lang === 'zh' ? '活跃合作伙伴' : 'Status cont: Partener activ'

  const quickPanelTitle = lang === 'zh' ? '快捷面板' : 'Quick Panel'

  const collapsedRailIconCls =
    'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.06)] ring-1 ring-white/80 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f7f7]'

  /** Collapse/expand control — blue accent, separated from shortcut icons */
  const collapsedRailChevronCls =
    `${collapsedRailIconCls} border-blue-200/90 bg-blue-50/90 text-blue-600 shadow-none ring-1 ring-blue-100/70 hover:border-blue-200 hover:bg-blue-100/90 hover:text-blue-700 focus-visible:ring-blue-400/40`

  const quickPanelNotifTitle =
    lang === 'en' ? 'Notifications' : lang === 'zh' ? '通知' : 'Notificări'
  const quickPanelNotifAria =
    lang === 'en'
      ? 'Notifications (coming soon)'
      : lang === 'zh'
        ? '通知（即将推出）'
        : 'Notificări (în curând)'

  const productsCatalogEyebrow =
    lang === 'en'
      ? 'Products on site'
      : lang === 'zh'
        ? '在售产品总数'
        : 'Produse pe site'

  const dashTooltipProductsSite =
    lang === 'en'
      ? 'Number of SKU rows listed in your partner-facing catalogue—the same assortment as Produse.'
      : lang === 'zh'
        ? '网站上合作伙伴目录中上架的产品 SKU 数量（与「产品」页一致）。'
        : 'Numărul de SKU-uri din catalogul partenerilor afișat pe site și în secțiunea Produse.'

  const dashTooltipOrders =
    lang === 'en'
      ? 'Partner orders excluding cancelled. To pay; in the delivery pipeline (received, preparing, or out for delivery); delivered.'
      : lang === 'zh'
        ? '合作伙伴订单（不含已取消）：待付款、配送流程中（已接单 / 备货 / 配送中）、已送达。'
        : 'Comenzi partener (fără anulate): de plată; în curs (preluată, în pregătire, pe drum); livrate.'

  const dashTooltipService =
    lang === 'en'
      ? 'Partner service pipeline: received, in workshop/service, and resolved cases.'
      : lang === 'zh'
        ? '合作伙伴服务流程：已接收、服务中、已办结。'
        : 'Flux service partener: preluate, în service, rezolvate.'

  const dashTooltipProfileStats =
    lang === 'en'
      ? 'Views of your public partner profile page and taps on tracked actions where metrics are collected.'
      : lang === 'zh'
        ? '公开的合作伙伴主页被浏览的次数，以及在可采集时的有效点击等指标。'
        : 'Vizualizări ale profilului dvs. public de partener și click-uri unde se colectează statistici.'

  const dashInfoAriaMore =
    lang === 'en' ? 'Explanation' : lang === 'zh' ? '说明' : 'Explicație'
  const dashInfoAriaProducts = `${dashInfoAriaMore}: ${productsCatalogEyebrow}`
  const dashInfoAriaOrders =
    lang === 'en' ? `${dashInfoAriaMore}: Orders` : lang === 'zh' ? `${dashInfoAriaMore}：订单` : `${dashInfoAriaMore}: Comenzi`
  const dashInfoAriaService =
    lang === 'en'
      ? `${dashInfoAriaMore}: Products in service`
      : lang === 'zh'
        ? `${dashInfoAriaMore}：维保中的产品`
        : `${dashInfoAriaMore}: Produse în service`
  const dashInfoAriaPublic =
    lang === 'en'
      ? `${dashInfoAriaMore}: Public profile stats`
      : lang === 'zh'
        ? `${dashInfoAriaMore}：公开主页数据`
        : `${dashInfoAriaMore}: Statistici profil public`

  const trProdCatalog = getProduseTranslations(lang as LangCode)
  const dashboardProductBucketKeysOnCard: PartnerDashboardProductBucketKey[] = [
    'rezidential',
    'industrial',
    'comercial',
  ]
  const productDashLabelComercial =
    lang === 'en' ? 'Commercial' : lang === 'zh' ? '商业' : 'Comercial'

  const orderDashLabelDePlata =
    lang === 'en' ? 'To pay' : lang === 'zh' ? '待付款' : 'De plată'
  const orderDashLabelInCurs =
    lang === 'en' ? 'In progress' : lang === 'zh' ? '进行中' : 'În curs'
  const orderDashLabelLivrate =
    lang === 'en' ? 'Delivered' : lang === 'zh' ? '已送达' : 'Livrate'

  const serviceDashLabelPreluate =
    lang === 'en' ? 'Received' : lang === 'zh' ? '已接收' : 'Preluate'
  const serviceDashLabelInService =
    lang === 'en' ? 'In service' : lang === 'zh' ? '服务中' : 'În service'
  const serviceDashLabelRezolvate =
    lang === 'en' ? 'Resolved' : lang === 'zh' ? '已解决' : 'Rezolvate'

  /** Placeholder until partner service / ticketing API supplies rows. */
  const partnerServiceBuckets = { preluate: 0, inService: 0, rezolvate: 0 }
  const partnerServiceTotal =
    partnerServiceBuckets.preluate + partnerServiceBuckets.inService + partnerServiceBuckets.rezolvate

  const activityKpiMetricsReady = catalogProductsCountLoaded && partnerOrdersCountLoaded

  const trendingPartnerProducts = useMemo(
    () => partnerCatalogProducts.filter((p) => p.promovarePeContPartener === true),
    [partnerCatalogProducts],
  )

  const profitableScrollerRef = useRef<HTMLUListElement | null>(null)
  const profitableCarouselDrag = useProfitCarouselDragScroll(profitableScrollerRef)

  const profitableProductsSectionTitle =
    lang === 'en'
      ? 'Most profitable products'
      : lang === 'zh'
        ? '利润最高的产品'
        : 'Cele mai profitabile produse'

  const profitableProductsSeeCatalogLabel =
    lang === 'en' ? 'See products' : lang === 'zh' ? '查看产品' : 'Vezi Produse'

  const profitableProductsCollapseToggleAria =
    profitableProductsSectionExpanded
      ? lang === 'en'
        ? 'Collapse most profitable products'
        : lang === 'zh'
          ? '收起利润最高的产品'
          : 'Restrânge cele mai profitabile produse'
      : lang === 'en'
        ? 'Expand most profitable products'
        : lang === 'zh'
          ? '展开利润最高的产品'
          : 'Extinde cele mai profitabile produse'

  const dashNavAriaKpiProducts =
    lang === 'en'
      ? 'Open partner products'
      : lang === 'zh'
        ? '打开合作伙伴产品目录'
        : 'Deschide catalogul Produse partener'
  const dashNavAriaKpiOrders =
    lang === 'en'
      ? 'Open partner orders'
      : lang === 'zh'
        ? '打开合作伙伴订单'
        : 'Deschide Comenzi partener'
  const dashNavAriaKpiService =
    lang === 'en'
      ? 'Open partner repairs'
      : lang === 'zh'
        ? '打开维修'
        : 'Deschide Reparatii partener'
  const dashNavAriaProfileStats =
    lang === 'en'
      ? 'Open public profile settings'
      : lang === 'zh'
        ? '打开公开主页设置'
        : 'Deschide Profil public'

  /** Public listing: same required fields as Profil Public save + published toggle. */
  const partnerPublicProfileListedAndComplete = useMemo(() => {
    if (!profile) return false
    const services = Array.isArray(profile.services)
      ? profile.services.map((s) => String(s).trim()).filter(Boolean)
      : []
    return (
      Boolean(String(profile.publicName ?? '').trim()) &&
      Boolean(String(profile.street ?? '').trim()) &&
      Boolean(String(profile.county ?? '').trim()) &&
      Boolean(String(profile.city ?? '').trim()) &&
      Boolean(String(profile.description ?? '').trim()) &&
      Boolean(String(profile.publicPhone ?? '').trim()) &&
      services.length > 0 &&
      profile.isPublic === true
    )
  }, [profile])

  const profileStatsGateTitle =
    lang === 'en'
      ? 'Create your company profile'
      : lang === 'zh'
        ? '创建公司公开主页'
        : 'Creează profilul companiei tale'

  const profileStatsGateBody =
    lang === 'en'
      ? 'Complete your company’s public profile so we can promote your services.'
      : lang === 'zh'
        ? '请完善公司的公开主页，以便我们为您推广服务。'
        : 'Completează-ți profilul public al companiei pentru ca noi să-ți promovăm serviciile.'

  const profileStatsGateCta =
    lang === 'en'
      ? 'Complete public profile'
      : lang === 'zh'
        ? '完善公开主页'
        : 'Completează profilul public'

  const profileStatsGateAria =
    lang === 'en'
      ? 'Public profile required before statistics apply'
      : lang === 'zh'
        ? '需先完善公开主页后统计数据方可生效'
        : 'Profil public necesar înainte ca statisticile să fie relevante'

  return (
    <div className="relative flex min-h-full min-w-0 w-full flex-1 flex-col bg-white lg:min-h-0">
      <div className="min-w-0 flex-1 bg-white pl-6 pt-6 pb-6 pr-[76px] sm:pl-8 sm:pt-8 sm:pb-8 lg:pl-10 lg:pt-10 lg:pb-10 lg:w-full">
        <div className="w-full max-w-7xl">
          <h1 className="sr-only">{lang === 'zh' ? '仪表板' : 'Dashboard'}</h1>

      {/* Status + advantages loading skeletons */}
      {loading && (
        <>
          <PartnerApprovalTimelineSkeleton />
          <PartnerAdvantageBoxesSkeleton />
        </>
      )}

      {/* Suspended banner */}
      {!loading && isSuspended === true && (
        <div
          className="mb-6 rounded-2xl pt-2 pb-5 px-5 flex items-center gap-4 shadow-[0_10px_36px_-12px_rgba(220,38,38,0.22),0_4px_18px_-10px_rgba(15,23,42,0.06)] sm:pt-3 sm:pb-6 sm:px-6"
          style={{ background: 'linear-gradient(to right, #FFF5F5, #FECACA)' }}
        >
          <div className="flex-shrink-0">
            <IconAlert />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold font-['Inter'] text-slate-900">
              Contul tău este suspendat.
            </h3>
            <p className="text-gray-600 text-sm font-['Inter'] mt-1">
              Ne pare rău, însă contul tău a fost suspendat. Contactează-ne pentru a rezolva problema.
            </p>
          </div>
        </div>
      )}

      {/* Pending approval timeline + advantages */}
      {!loading && !isSuspended && pendingApproval === true && (
        <>
          <PartnerApprovalTimeline />

          <section className="mb-12 sm:mb-14" aria-labelledby="pending-partner-advantages-heading">
            <h2
              id="pending-partner-advantages-heading"
              className="mb-4 text-xl font-bold tracking-tight text-slate-900 font-['Inter'] sm:text-2xl"
            >
              Avantajele parteneriatului Baterino
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PENDING_PARTNER_ADVANTAGES.map(({ Icon, title, subtitle }) => (
                <div
                  key={title}
                  className={`flex flex-col gap-1.5 rounded-2xl bg-white p-5 sm:p-6 ${PARTNER_DASH_SURFACE_SHADOW}`}
                >
                  <div
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 shadow-[0_4px_14px_-8px_rgba(245,158,11,0.22)]"
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-base font-bold font-['Inter'] text-slate-900 leading-tight">{title}</h3>
                  <p className="text-sm font-['Inter'] text-gray-600 leading-snug">{subtitle}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
        </div>

      {pendingApproval !== true && (
        <>
          {!isSuspended && (!catalogProductsCountLoaded || trendingPartnerProducts.length > 0) ? (
            <section
              className="relative z-0 mb-12 min-w-0 w-full max-w-none self-stretch sm:mb-14 lg:-mr-[76px]"
              aria-labelledby="partner-dash-profitable-products-heading"
            >
              <div className="mb-4 flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="min-w-0 max-w-7xl flex-1">
                  <h2
                    id="partner-dash-profitable-products-heading"
                    className="m-0 flex min-w-0 items-center gap-2 text-xl font-bold text-slate-900 font-['Inter'] sm:gap-2.5 sm:text-2xl"
                  >
                    <TrendingUp className="h-7 w-7 shrink-0 text-slate-700 sm:h-8 sm:w-8" strokeWidth={1.85} aria-hidden />
                    <span className="min-w-0">{profitableProductsSectionTitle}</span>
                  </h2>
                </div>
                <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto sm:ml-auto">
                  <button
                    type="button"
                    aria-expanded={profitableProductsSectionExpanded}
                    aria-controls="partner-dash-profitable-carousel"
                    onClick={() => setProfitableProductsSectionExpanded((v) => !v)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                    aria-label={profitableProductsCollapseToggleAria}
                  >
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 transition-transform duration-200 ${profitableProductsSectionExpanded ? 'rotate-0' : '-rotate-90'}`}
                      strokeWidth={2}
                      aria-hidden
                    />
                  </button>
                  <Link
                    to="/partner/produse"
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 font-['Inter']"
                    aria-label={dashNavAriaKpiProducts}
                  >
                    {profitableProductsSeeCatalogLabel}
                  </Link>
                </div>
              </div>
              {profitableProductsSectionExpanded ? (
                <div
                  id="partner-dash-profitable-carousel"
                  role="region"
                  aria-roledescription="carousel"
                  aria-busy={!catalogProductsCountLoaded}
                  aria-label={profitableProductsSectionTitle}
                  className="relative z-0 min-w-0 w-full"
                >
                  <ul
                    ref={catalogProductsCountLoaded ? profitableScrollerRef : undefined}
                    {...(catalogProductsCountLoaded ? profitableCarouselDrag : {})}
                    className={`flex w-full min-w-0 gap-4 overflow-x-auto overflow-y-visible overscroll-x-contain pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden touch-pan-x ${catalogProductsCountLoaded ? 'cursor-grab select-none snap-x snap-proximity active:cursor-grabbing' : 'snap-x snap-proximity'}`}
                  >
                    {catalogProductsCountLoaded ? (
                      trendingPartnerProducts.map((product) => (
                        <PartnerTrendingProductCard
                          key={product.id}
                          product={product}
                          trProduse={trProdCatalog}
                          langCode={lang}
                          currency={currency}
                        />
                      ))
                    ) : (
                      Array.from({ length: 5 }).map((_, i) => <PartnerTrendingProductCardSkeleton key={i} />)
                    )}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}
          <div className="w-full max-w-7xl">
          <section className="mb-12 sm:mb-14" aria-labelledby="partner-dash-activity-heading">
            <h2
              id="partner-dash-activity-heading"
              className="mb-3 flex items-center gap-2 text-xl font-bold text-slate-900 font-['Inter'] sm:gap-2.5 sm:text-2xl"
            >
              <Activity className="h-7 w-7 shrink-0 text-slate-700 sm:h-8 sm:w-8" strokeWidth={1.85} aria-hidden />
              <span>{lang === 'en' ? 'My activity' : lang === 'zh' ? '我的活动' : 'Activitatea mea'}</span>
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-stretch">
              <PartnerDashKpiNavShell
                to="/partner/produse"
                ariaLabel={dashNavAriaKpiProducts}
                loading={!activityKpiMetricsReady}
                tooltipText={dashTooltipProductsSite}
                infoAria={dashInfoAriaProducts}
              >
                <div className="flex min-h-0 items-start gap-3 sm:gap-4">
                  <div className="flex w-14 shrink-0 flex-col items-center sm:items-start">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 shadow-[0_5px_18px_-8px_rgba(15,23,42,0.10)]"
                      aria-hidden
                    >
                      <Package className="h-7 w-7" strokeWidth={1.65} />
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-start gap-0">
                    <div>
                      <p className="mb-1 text-xs font-['Inter'] font-semibold uppercase tracking-wide text-gray-400">
                        {productsCatalogEyebrow}
                      </p>
                      <p className="text-3xl font-bold tabular-nums font-['Inter'] text-slate-900">
                        {catalogProductsTotal < 0 ? (
                          <span aria-label={lang === 'en' ? 'Unavailable' : lang === 'zh' ? '无法加载' : 'Indisponibil'}>
                            —
                          </span>
                        ) : (
                          catalogProductsTotal
                        )}
                      </p>
                    </div>
                    {catalogProductBuckets && catalogProductsTotal >= 0 ? (
                      <div className="mt-2 border-t border-slate-100 pt-2.5">
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                          {dashboardProductBucketKeysOnCard.map((bucketKey) => {
                            const label =
                              bucketKey === 'comercial'
                                ? productDashLabelComercial
                                : trProdCatalog.sectorOptions.find((o) => o.value === bucketKey)?.label ??
                                  bucketKey
                            return (
                              <div key={bucketKey} className="min-w-0 text-center sm:text-left">
                                <p className="m-0 text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-500 font-['Inter'] sm:text-[11px]">
                                  {label}
                                </p>
                                <p className="mt-1 m-0 tabular-nums text-xl font-bold leading-none text-slate-900 font-['Inter'] sm:text-2xl">
                                  {catalogProductBuckets[bucketKey]}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </PartnerDashKpiNavShell>
              <PartnerDashKpiNavShell
                to="/partner/comenzi"
                ariaLabel={dashNavAriaKpiOrders}
                loading={!activityKpiMetricsReady}
                tooltipText={dashTooltipOrders}
                infoAria={dashInfoAriaOrders}
              >
                <div className="flex min-h-0 items-start gap-3 sm:gap-4">
                  <div className="flex w-14 shrink-0 flex-col items-center sm:items-start">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 shadow-[0_5px_18px_-8px_rgba(15,23,42,0.10)]"
                      aria-hidden
                    >
                      <ClipboardList className="h-7 w-7" strokeWidth={1.65} />
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-start gap-0">
                    <div>
                      <p className="mb-1 text-xs font-['Inter'] font-semibold uppercase tracking-wide text-gray-400">
                        {lang === 'en' ? 'Orders' : lang === 'zh' ? '订单' : 'Comenzi'}
                      </p>
                      <p className="text-3xl font-bold tabular-nums font-['Inter'] text-slate-900">
                        {partnerOrdersTotal < 0 ? (
                          <span aria-label={lang === 'en' ? 'Unavailable' : lang === 'zh' ? '无法加载' : 'Indisponibil'}>
                            —
                          </span>
                        ) : (
                          partnerOrdersTotal
                        )}
                      </p>
                    </div>
                    {partnerOrdersBuckets && partnerOrdersTotal >= 0 ? (
                      <div className="mt-2 border-t border-slate-100 pt-2.5">
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                          <div className="min-w-0 text-center sm:text-left">
                            <p className="m-0 text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-500 font-['Inter'] sm:text-[11px]">
                              {orderDashLabelDePlata}
                            </p>
                            <p className="mt-1 m-0 tabular-nums text-xl font-bold leading-none text-slate-900 font-['Inter'] sm:text-2xl">
                              {partnerOrdersBuckets.dePlata}
                            </p>
                          </div>
                          <div className="min-w-0 text-center sm:text-left">
                            <p className="m-0 text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-500 font-['Inter'] sm:text-[11px]">
                              {orderDashLabelInCurs}
                            </p>
                            <p className="mt-1 m-0 tabular-nums text-xl font-bold leading-none text-slate-900 font-['Inter'] sm:text-2xl">
                              {partnerOrdersBuckets.inCurs}
                            </p>
                          </div>
                          <div className="min-w-0 text-center sm:text-left">
                            <p className="m-0 text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-500 font-['Inter'] sm:text-[11px]">
                              {orderDashLabelLivrate}
                            </p>
                            <p className="mt-1 m-0 tabular-nums text-xl font-bold leading-none text-slate-900 font-['Inter'] sm:text-2xl">
                              {partnerOrdersBuckets.livrate}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </PartnerDashKpiNavShell>
              <PartnerDashKpiNavShell
                to="/partner/servicii"
                ariaLabel={dashNavAriaKpiService}
                loading={!activityKpiMetricsReady}
                tooltipText={dashTooltipService}
                infoAria={dashInfoAriaService}
              >
                <div className="flex min-h-0 items-start gap-3 sm:gap-4">
                  <div className="flex w-14 shrink-0 flex-col items-center sm:items-start">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 shadow-[0_5px_18px_-8px_rgba(15,23,42,0.10)]"
                      aria-hidden
                    >
                      <Wrench className="h-7 w-7" strokeWidth={1.65} />
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-start gap-0">
                    <div>
                      <p className="mb-1 text-xs font-['Inter'] font-semibold uppercase tracking-wide text-gray-400">
                        {lang === 'en'
                          ? 'Products in service'
                          : lang === 'zh'
                            ? '服务中的产品'
                            : 'Produse în service'}
                      </p>
                      <p className="text-3xl font-bold tabular-nums font-['Inter'] text-slate-900">{partnerServiceTotal}</p>
                    </div>
                    <div className="mt-2 border-t border-slate-100 pt-2.5">
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                        <div className="min-w-0 text-center sm:text-left">
                          <p className="m-0 text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-500 font-['Inter'] sm:text-[11px]">
                            {serviceDashLabelPreluate}
                          </p>
                          <p className="mt-1 m-0 tabular-nums text-xl font-bold leading-none text-slate-900 font-['Inter'] sm:text-2xl">
                            {partnerServiceBuckets.preluate}
                          </p>
                        </div>
                        <div className="min-w-0 text-center sm:text-left">
                          <p className="m-0 text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-500 font-['Inter'] sm:text-[11px]">
                            {serviceDashLabelInService}
                          </p>
                          <p className="mt-1 m-0 tabular-nums text-xl font-bold leading-none text-slate-900 font-['Inter'] sm:text-2xl">
                            {partnerServiceBuckets.inService}
                          </p>
                        </div>
                        <div className="min-w-0 text-center sm:text-left">
                          <p className="m-0 text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-500 font-['Inter'] sm:text-[11px]">
                            {serviceDashLabelRezolvate}
                          </p>
                          <p className="mt-1 m-0 tabular-nums text-xl font-bold leading-none text-slate-900 font-['Inter'] sm:text-2xl">
                            {partnerServiceBuckets.rezolvate}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </PartnerDashKpiNavShell>
            </div>
          </section>

          <section className="mb-12 sm:mb-14" aria-labelledby="partner-dash-profile-stats-heading">
            <h2
              id="partner-dash-profile-stats-heading"
              className="mb-3 flex items-center gap-2 text-xl font-bold text-slate-900 font-['Inter'] sm:gap-2.5 sm:text-2xl"
            >
              <BarChart3 className="h-7 w-7 shrink-0 text-slate-700 sm:h-8 sm:w-8" strokeWidth={1.85} aria-hidden />
              <span>
                {lang === 'en'
                  ? 'Public profile stats'
                  : lang === 'zh'
                    ? '公开主页数据'
                    : 'Statistici profil public'}
              </span>
            </h2>
            <div
              className={`grid w-full gap-4 sm:items-stretch ${
                loading || partnerPublicProfileListedAndComplete
                  ? 'max-w-xl grid-cols-1 sm:max-w-2xl'
                  : 'max-w-3xl grid-cols-1 lg:grid-cols-2 lg:gap-5'
              }`}
            >
              {!loading && !partnerPublicProfileListedAndComplete ? (
                <div
                  role="region"
                  aria-label={profileStatsGateAria}
                  className="min-w-0 w-full self-start lg:h-auto"
                >
                  <div className={`flex w-full flex-col items-start justify-start gap-3 text-left rounded-2xl bg-white px-5 py-5 sm:gap-4 sm:px-6 sm:py-6 ${PARTNER_DASH_SURFACE_SHADOW}`}>
                    <h3 className="m-0 text-base font-bold leading-tight text-slate-900 font-['Inter'] sm:text-lg">
                      {profileStatsGateTitle}
                    </h3>
                    <p className="m-0 text-sm leading-relaxed text-slate-600 font-['Inter']">{profileStatsGateBody}</p>
                    <Link
                      to="/partner/profil"
                      className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 font-['Inter']"
                    >
                      {profileStatsGateCta}
                      <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                    </Link>
                  </div>
                </div>
              ) : null}
              <div className="relative min-w-0">
                {loading ? (
                  <PartnerDashProfileStatCardSkeleton />
                ) : (
                  <div
                    className={`${PARTNER_DASH_PROFILE_NAV_CARD_CLS} ${
                      partnerPublicProfileListedAndComplete
                        ? ''
                        : 'pointer-events-none opacity-[0.38] saturate-50 grayscale-[0.55] transition-[opacity,filter] duration-200 lg:h-full'
                    }`}
                    aria-hidden={!partnerPublicProfileListedAndComplete}
                  >
                    <Link
                      to="/partner/profil"
                      className="absolute inset-0 z-0 rounded-2xl"
                      aria-label={dashNavAriaProfileStats}
                      tabIndex={partnerPublicProfileListedAndComplete ? 0 : -1}
                    />
                    <div className="relative z-[1] flex h-full min-h-0 w-full flex-nowrap items-center gap-4 pointer-events-none">
                      <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 shadow-[0_5px_18px_-8px_rgba(15,23,42,0.10)]"
                        aria-hidden
                      >
                        <BarChart3 className="h-7 w-7" strokeWidth={1.65} />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-nowrap items-center justify-start gap-8 sm:gap-10 lg:gap-12">
                        <div className="min-w-0 shrink-0 text-left">
                          <p className="mb-2 text-xs font-['Inter'] font-semibold uppercase tracking-wide text-gray-400">
                            {lang === 'en' ? 'Views' : lang === 'zh' ? '浏览次数' : 'Vizualizări'}
                          </p>
                          <p className="text-3xl font-bold tabular-nums font-['Inter'] text-slate-900">0</p>
                        </div>
                        <div className="min-w-0 shrink-0 text-left">
                          <p className="mb-2 text-xs font-['Inter'] font-semibold uppercase tracking-wide text-gray-400">
                            {lang === 'en' ? 'Clicks' : lang === 'zh' ? '点击次数' : 'Click-uri'}
                          </p>
                          <p className="text-3xl font-bold tabular-nums font-['Inter'] text-slate-900">0</p>
                        </div>
                      </div>
                    </div>
                    <PartnerDashStatCardInfo tooltipText={dashTooltipProfileStats} label={dashInfoAriaPublic} />
                  </div>
                )}
              </div>
            </div>
          </section>

          {!loading && (
          <section className="mb-12 sm:mb-14" aria-labelledby="partner-dash-partnership-advantages-heading">
            <h2
              id="partner-dash-partnership-advantages-heading"
              className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 font-['Inter'] sm:gap-2.5 sm:text-2xl"
            >
              <Award className="h-7 w-7 shrink-0 text-slate-700 sm:h-8 sm:w-8" strokeWidth={1.85} aria-hidden />
              <span>
                {lang === 'en'
                  ? 'Baterino partnership benefits'
                  : lang === 'zh'
                    ? 'Baterino 合作优势'
                    : 'Avantajele parteneriatului Baterino'}
              </span>
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className={PARTNER_DASH_BENEFIT_CARD_CLS}>
                <AvantajePartenerDashboardBox />
              </div>
              <div className={PARTNER_DASH_BENEFIT_CARD_CLS}>
                <SigurantaClientuluiBox />
              </div>
              <div className={PARTNER_DASH_BENEFIT_CARD_CLS}>
                <SuportTehnicBox />
              </div>
            </div>
          </section>
          )}
          </div>
        </>
      )}
      </div>

      {showQuickPanel && (
        <aside
          className={`flex w-full shrink-0 flex-col border-t border-slate-200 bg-[#f7f7f7] px-4 py-6 duration-300 ease-out sm:px-5 lg:z-30 lg:border-l lg:border-t-0 lg:transition-[width,padding,gap,box-shadow] ${
            partnerSidebarCollapsed ? 'lg:shadow-none' : 'lg:shadow-[-16px_0_40px_rgba(15,23,42,0.08)]'
          } ${
            partnerSidebarCollapsed
              ? 'lg:fixed lg:inset-y-0 lg:right-0 lg:w-14 lg:min-w-[3.5rem] lg:max-w-[3.5rem] lg:gap-2 lg:overflow-x-hidden lg:overflow-y-hidden lg:px-2 lg:py-8'
              : 'lg:absolute lg:top-0 lg:right-0 lg:h-full lg:w-[23rem] lg:max-w-[23rem] lg:gap-4 lg:overflow-y-auto lg:px-5 lg:py-10'
          }`}
          aria-label={
            lang === 'zh'
              ? '快捷面板 — 合作伙伴摘要'
              : 'Quick Panel — partner summary'
          }
        >
          {partnerSidebarCollapsed ? (
            <div className="hidden lg:flex lg:flex-col lg:items-center lg:gap-2.5 mb-2" role="presentation">
              <button
                type="button"
                id="partner-dash-sidebar-collapse-toggle"
                onClick={togglePartnerSidebarCollapsed}
                aria-expanded={false}
                aria-controls="partner-dash-sidebar-cards"
                className={collapsedRailChevronCls}
                title={
                  lang === 'en'
                    ? 'Expand sidebar'
                    : lang === 'zh'
                      ? '展开侧栏'
                      : 'Extinde panoul lateral'
                }
              >
                <ChevronLeft className="h-6 w-6" aria-hidden strokeWidth={2.5} />
                <span className="sr-only">
                  {lang === 'en' ? 'Expand sidebar' : lang === 'zh' ? '展开侧栏' : 'Extinde panoul lateral'}
                </span>
              </button>
              <div
                className="h-px w-10 shrink-0 bg-slate-300/80"
                aria-hidden
                role="separator"
              />
              <button
                type="button"
                className={collapsedRailIconCls}
                title={quickPanelNotifTitle}
                aria-label={quickPanelNotifAria}
              >
                <Bell className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.75} aria-hidden />
                <span className="sr-only">{quickPanelNotifAria}</span>
              </button>
              <button
                type="button"
                className={collapsedRailIconCls}
                onClick={() => setPartnerSidebarCollapsed(false)}
                title={
                  lang === 'en' ? 'Show welcome summary' : lang === 'zh' ? '显示欢迎摘要' : 'Arată rezumat bun venit'
                }
              >
                <Building2 className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.75} aria-hidden />
                <span className="sr-only">
                  {lang === 'en' ? 'Show welcome summary' : lang === 'zh' ? '显示欢迎摘要' : 'Arată rezumat bun venit'}
                </span>
              </button>
              <button
                type="button"
                className={collapsedRailIconCls}
                onClick={() => setPartnerSidebarCollapsed(false)}
                title={
                  lang === 'en' ? 'Show partner discount' : lang === 'zh' ? '显示合作伙伴折扣' : 'Arată reducerea partener'
                }
              >
                <Percent className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.75} aria-hidden />
                <span className="sr-only">
                  {lang === 'en'
                    ? 'Show partner discount'
                    : lang === 'zh'
                      ? '显示合作伙伴折扣'
                      : 'Arată reducerea partener'}
                </span>
              </button>
              <button
                type="button"
                className={collapsedRailIconCls}
                onClick={() => setInvertorCompatibilityModalOpen(true)}
                title={
                  lang === 'en'
                    ? 'Search inverter compatibility'
                    : lang === 'zh'
                      ? '搜索逆变器兼容性'
                      : 'Căutare compatibilitate invertor'
                }
              >
                <Cable className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.75} aria-hidden />
                <span className="sr-only">
                  {lang === 'en'
                    ? 'Search inverter compatibility'
                    : lang === 'zh'
                      ? '搜索逆变器兼容性'
                      : 'Deschide căutarea de compatibilitate invertoare'}
                </span>
              </button>
              {partnerCartLineCount > 0 ? (
                <Link
                  to="/partner/produse"
                  className={`${collapsedRailIconCls} relative text-inherit`}
                  title={
                    lang === 'en'
                      ? 'Finish your order — open cart'
                      : lang === 'zh'
                        ? '完成订单 — 打开购物车'
                        : 'Finalizează comanda — deschide coșul'
                  }
                  aria-label={
                    lang === 'en'
                      ? 'Cart has items awaiting checkout. Go to Partner products.'
                      : lang === 'zh'
                        ? '购物车中有待结账的商品。前往合作伙伴产品。'
                        : 'Ai articole în coș de finalizat. Mergi la Produse partener.'
                  }
                >
                  <ShoppingCart className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.75} aria-hidden />
                  <span
                    className="pointer-events-none absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#f7f7f7]"
                    aria-hidden
                  />
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="hidden lg:mb-4 lg:flex lg:items-center lg:justify-start lg:gap-2.5">
              <button
                type="button"
                id="partner-dash-sidebar-collapse-toggle"
                onClick={togglePartnerSidebarCollapsed}
                aria-expanded
                aria-controls="partner-dash-sidebar-cards"
                className={collapsedRailChevronCls}
                title={
                  lang === 'en'
                    ? 'Collapse sidebar'
                    : lang === 'zh'
                      ? '收起侧栏'
                      : 'Restrânge panoul lateral'
                }
              >
                <ChevronRight className="h-6 w-6" aria-hidden strokeWidth={2.5} />
                <span className="sr-only">
                  {lang === 'en' ? 'Collapse sidebar' : lang === 'zh' ? '收起侧栏' : 'Restrânge panoul lateral'}
                </span>
              </button>
              <div className="h-10 w-px shrink-0 self-center bg-slate-300/80" aria-hidden role="separator" />
              <button
                type="button"
                className={collapsedRailIconCls}
                title={quickPanelNotifTitle}
                aria-label={quickPanelNotifAria}
              >
                <Bell className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.75} aria-hidden />
                <span className="sr-only">{quickPanelNotifAria}</span>
              </button>
              <h2
                id="partner-dash-quick-panel-heading"
                className="m-0 min-w-0 flex-1 text-left text-base font-extrabold leading-tight tracking-tight text-slate-900 font-['Inter'] sm:text-lg"
              >
                {quickPanelTitle}
              </h2>
            </div>
          )}

          <div
            id="partner-dash-sidebar-cards"
            role="region"
            aria-labelledby="partner-dash-quick-panel-heading"
            className={`flex flex-col gap-4 ${partnerSidebarCollapsed ? 'lg:hidden' : ''}`}
          >
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-200/90 p-3.5 shadow-[0_12px_40px_-14px_rgba(16,185,129,0.28),0_4px_18px_-10px_rgba(15,23,42,0.07)] sm:p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/70 shadow-[0_5px_18px_-8px_rgba(15,23,42,0.12)]">
                {profile?.logoUrl ? (
                  <img src={profile.logoUrl} alt="" className="h-7 w-7 object-contain" />
                ) : (
                  <svg className="h-6 w-6 text-green-700/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-1 pt-px">
                {lang === 'en' ? (
                  <>
                    <p className="m-0 text-sm font-medium leading-snug text-slate-700 font-['Inter'] sm:text-[15px]">Welcome,</p>
                    <p className="m-0 text-xl font-extrabold leading-tight tracking-tight text-slate-900 font-['Inter'] sm:text-2xl">
                      {sidebarWelcomeDisplayName}
                    </p>
                    {sidebarWelcomeCompanyDisplay ? (
                      <p className="m-0 line-clamp-2 text-sm font-medium leading-snug text-slate-600 font-['Inter'] sm:text-[15px]">
                        {sidebarWelcomeCompanyDisplay}
                      </p>
                    ) : null}
                    <p className="mt-0.5 m-0 text-xs font-bold leading-snug text-emerald-900/90 font-['Inter'] sm:text-sm">
                      {sidebarAccountStatusLabel}
                    </p>
                  </>
                ) : lang === 'zh' ? (
                  <>
                    <p className="m-0 text-sm font-medium leading-snug text-slate-700 font-['Inter'] sm:text-[15px]">欢迎，</p>
                    <p className="m-0 text-xl font-extrabold leading-tight tracking-tight text-slate-900 font-['Inter'] sm:text-2xl">
                      {sidebarWelcomeDisplayName}
                    </p>
                    {sidebarWelcomeCompanyDisplay ? (
                      <p className="m-0 line-clamp-2 text-sm font-medium leading-snug text-slate-600 font-['Inter'] sm:text-[15px]">
                        {sidebarWelcomeCompanyDisplay}
                      </p>
                    ) : null}
                    <p className="mt-0.5 m-0 text-xs font-bold leading-snug text-emerald-900/90 font-['Inter'] sm:text-sm">
                      {sidebarAccountStatusLabel}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="m-0 text-sm font-medium leading-snug text-slate-700 font-['Inter'] sm:text-[15px]">
                      Bine ai venit,
                    </p>
                    <p className="m-0 text-xl font-extrabold leading-tight tracking-tight text-slate-900 font-['Inter'] sm:text-2xl">
                      {sidebarWelcomeDisplayName}
                    </p>
                    {sidebarWelcomeCompanyDisplay ? (
                      <p className="m-0 line-clamp-2 text-sm font-medium leading-snug text-slate-600 font-['Inter'] sm:text-[15px]">
                        {sidebarWelcomeCompanyDisplay}
                      </p>
                    ) : null}
                    <p className="mt-0.5 m-0 text-xs font-bold leading-snug text-emerald-900/90 font-['Inter'] sm:text-sm">
                      {sidebarAccountStatusLabel}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {profile ? (
            String(profile.publicSlug ?? '').trim() ? (
              <Link
                to={`/companii/@${String(profile.publicSlug).trim().replace(/^@/, '').toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-sky-200/90 bg-gradient-to-br from-sky-50 to-white px-3.5 py-3 shadow-[0_10px_32px_-12px_rgba(14,165,233,0.35),0_4px_16px_-10px_rgba(15,23,42,0.06)] transition hover:border-sky-300 hover:shadow-[0_14px_36px_-12px_rgba(14,165,233,0.4)] sm:px-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-700 shadow-[0_5px_16px_-8px_rgba(14,165,233,0.45)]">
                  <ExternalLink className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-[11px] font-bold uppercase tracking-wider text-sky-900/65 font-['Inter']">
                    {lang === 'en'
                      ? 'Live public layout'
                      : lang === 'zh'
                        ? '公开页面预览'
                        : 'Șablon pagină publică'}
                  </p>
                  <p className="mt-1 m-0 truncate font-mono text-sm font-semibold text-slate-900 font-['Inter']">
                    /companii/@{String(profile.publicSlug).trim().replace(/^@/, '').toLowerCase()}
                  </p>
                </div>
              </Link>
            ) : (
              <Link
                to="/partner/profil"
                className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/80 px-3.5 py-3 shadow-sm transition hover:border-slate-300 hover:bg-slate-50/90 sm:px-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <ExternalLink className="h-5 w-5 opacity-70" strokeWidth={2} aria-hidden />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="m-0 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-['Inter']">
                    {lang === 'en' ? 'Installer page' : lang === 'zh' ? '安装商页面' : 'Pagină instalator'}
                  </p>
                  <p className="mt-1 m-0 text-sm font-semibold text-slate-800 font-['Inter']">
                    {lang === 'en'
                      ? 'Set your /companii/… URL to open the template'
                      : lang === 'zh'
                        ? '设置 /companii/… 链接以预览页面'
                        : 'Creează adresa ta /companii/… pentru a vedea șablonul'}
                  </p>
                </div>
              </Link>
            )
          ) : null}

          <ReducerePartenerBox discountPercent={profile?.partnerDiscountPercent ?? null} loading={loading} />

          <PartnerInverterCompatibilityBox onOpenSearch={() => setInvertorCompatibilityModalOpen(true)} />

          {partnerCartLineCount > 0 ? (
            <Link
              to="/partner/produse"
              aria-label={
                lang === 'en'
                  ? 'Go to Partner products'
                  : lang === 'zh'
                    ? '前往合作伙伴产品页面'
                    : 'Mergi la pagina Produse partener'
              }
              className="group flex flex-col rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/80 p-3.5 shadow-[0_12px_40px_-14px_rgba(245,158,11,0.26),0_4px_18px_-10px_rgba(15,23,42,0.07)] transition-all duration-200 hover:shadow-[0_18px_46px_-14px_rgba(245,158,11,0.32),0_8px_22px_-10px_rgba(15,23,42,0.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/35 focus-visible:ring-offset-2 sm:p-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/80 text-amber-700 shadow-[0_5px_18px_-8px_rgba(15,23,42,0.11)] transition group-hover:bg-white group-hover:shadow-[0_8px_22px_-10px_rgba(245,158,11,0.2)]"
                  aria-hidden
                >
                  <ShoppingCart className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 pt-px text-left">
                  <p className={`${quickPanelEyebrowCls} text-amber-900/90`}>
                    {lang === 'en' ? 'Active cart' : lang === 'zh' ? '购物车' : 'Comandă nefinalizată'}
                  </p>
                  <h3 className={quickPanelTitleCls}>
                    {lang === 'en' ? 'Finish your order' : lang === 'zh' ? '完成您的订单' : 'Finalizează comanda'}
                  </h3>
                  <p className={quickPanelBodyCls}>
                    {lang === 'en'
                      ? 'Items in cart not yet submitted. Continue when ready.'
                      : lang === 'zh'
                        ? '购物车中有尚未提交的商品，可随时继续结账完成订单。'
                        : 'Ai produse în coș care nu au fost trimise încă. Continuă pentru a plasa comanda.'}
                  </p>
                </div>
              </div>
            </Link>
          ) : null}
          </div>
        </aside>
      )}
      {!loading && !isSuspended && !pendingApproval && invertorCompatibilityModalOpen ? (
        <CompatibilitateInvertorModal onClose={() => setInvertorCompatibilityModalOpen(false)} />
      ) : null}
    </div>
  )
}
