import { useState, useEffect, useCallback, useMemo, useRef, type ReactNode, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import {
  Percent,
  Package,
  ClipboardList,
  Wrench,
  ChevronRight,
  BarChart3,
  Info,
  TrendingUp,
  Activity,
  Award,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
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
  filterProductsForPartnerPanel,
  isPartnerAccountPromotedProduct,
  partnerDiscountConfigured,
  type PublicProduct,
} from '../../lib/api'
import {
  countPartnerDashboardProductBuckets,
  type PartnerDashboardProductBucketKey,
} from '../../lib/catalog-sector'
import { countPartnerOrderDashboardBuckets, partnerOrdersActiveSubtotal, type PartnerOrderDashBuckets } from '../../lib/partner-order-dashboard'
import { readPartnerProfileHint, writePartnerProfileHintFromProfile } from '../../lib/partnerProfileHint'
import { getProduseTranslations } from '../../i18n/produse'
import { getPartnerDashboardTranslations } from '../../i18n/partner/dashboard'
import { getPartnerProductsTranslations } from '../../i18n/partner/products'
import type { LangCode } from '../../i18n/menu'
import { PartnerCatalogPriceBlock } from '../../components/product/PartnerCatalogPriceBlock'
import { PartnerCatalogCardMedia } from '../../components/partner/PartnerCatalogCardMedia'
import { partnerProductHasListPrice } from '../../lib/partnerCart'
import { PartnerAccountApprovalSection } from '../../components/partner/PartnerAccountApprovalSection'
import { PartnerApprovalTimelineSkeleton } from '../../components/partner/PartnerApprovalTimeline'
import { SigurantaClientuluiBox, SuportTehnicBox, AvantajePartenerDashboardBox } from './PartnerSidebarBoxes'

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

const PARTNER_DASH_KPI_NAV_CARD_CLS =
  "group relative flex min-h-0 min-w-0 flex-col gap-0 rounded-2xl border border-slate-200 bg-white p-4 pr-10 transition-colors duration-200 sm:pr-11 hover:border-slate-300"

const PARTNER_DASH_PROFILE_NAV_CARD_CLS =
  "group relative flex h-full min-h-0 w-full flex-nowrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 pr-11 transition-colors duration-200 sm:pr-12 hover:border-slate-300"

const PARTNER_DASH_BENEFIT_CARD_CLS = 'flex h-full min-w-0 sm:col-span-1'

const PARTNER_DASH_SECTION_BOX =
  'rounded-2xl border border-slate-200 bg-white p-4 sm:p-6'

const PARTNER_DASH_SECTION_HEADING =
  'mb-4 flex flex-wrap items-center justify-between gap-2'

const PARTNER_DASH_SECTION_TITLE =
  "m-0 flex min-w-0 flex-1 items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900 font-['Inter'] sm:gap-3 sm:text-2xl"

function PartnerDashSectionTitleIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-[0_5px_12px_rgba(30,70,180,0.26)] sm:h-11 sm:w-11"
      aria-hidden
    >
      <Icon className="h-5 w-5" strokeWidth={1.9} />
    </span>
  )
}

function PartnerDashActivityKpiCardSkeleton() {
  return (
    <div
      className="flex min-h-[11.5rem] min-w-0 flex-col gap-0 rounded-2xl border border-slate-200 bg-white p-4 pr-10 sm:pr-11"
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
      className="relative flex h-full min-h-[5.5rem] min-w-0 w-full flex-nowrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 pr-11 sm:pr-12"
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

function PartnerPartnershipBenefitsSkeleton({
  sectionTitle,
  ariaLabel,
}: {
  sectionTitle: string
  ariaLabel: string
}) {
  return (
    <section className={PARTNER_DASH_SECTION_BOX} aria-busy="true" aria-label={ariaLabel}>
      <div className={PARTNER_DASH_SECTION_HEADING}>
        <h2 className={PARTNER_DASH_SECTION_TITLE}>
          <PartnerDashSectionTitleIcon icon={Award} />
          <span className="min-w-0">{sectionTitle}</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-stretch">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="flex min-h-[14rem] animate-pulse flex-col rounded-2xl border border-slate-200 bg-white p-5"
            aria-hidden
          >
            <div className="mb-3 h-8 w-40 rounded-md bg-slate-100" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((__, j) => (
                <div key={j} className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-3.5 w-[70%] rounded bg-slate-100" />
                    <div className="h-3 w-full rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
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

/** Skeleton tile for trending products carousel — mirrors `PartnerTrendingProductCard` sizing. */
function PartnerTrendingProductCardSkeleton() {
  return (
    <li
      aria-hidden
      className="flex w-[min(18rem,calc(100vw-3rem))] shrink-0 snap-start animate-pulse flex-col overflow-hidden rounded-2xl border border-[#e8eaf0] bg-white max-md:snap-start md:w-full md:min-w-0 md:shrink md:snap-align-none"
    >
      <div className="h-[178px] bg-[#f7f7f7]" />
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
        <div className="h-5 w-[92%] rounded-md bg-[#e8eaf0]" />
        <div className="h-3 w-[54%] rounded-md bg-[#e8eaf0]" />
        <div className="h-[88px] w-full rounded-xl bg-[#eef2f7]" />
        <div className="h-10 w-full rounded-[10px] bg-[#f4f5f7]" />
      </div>
    </li>
  )
}

/** Partner catalog card chrome + price + single details link (no quantity / coș). */
function PartnerTrendingProductCard({
  product,
  trProduse,
  trProducts,
  trDash,
  langCode,
  currency,
  partnerDiscountPct,
  partnerContractSignedAt,
}: {
  product: PublicProduct
  trProduse: ReturnType<typeof getProduseTranslations>
  trProducts: ReturnType<typeof getPartnerProductsTranslations>
  trDash: ReturnType<typeof getPartnerDashboardTranslations>
  langCode: string
  currency: string
  partnerDiscountPct: number | null
  partnerContractSignedAt: string | null
}) {
  const img = getProductCardImageUrl(product)
  const { specLine1 } = getCatalogProductSpecLines(product)
  const stockUnavailable = residentialProductStockUnavailable(product)
  const stockCta = getResidentialCatalogStockListingCta(product, {
    outOfStock: trProduse.catalogStockOutOfStock,
    comingSoon: trProduse.catalogStockComingSoon,
  })
  const hasListPrice = partnerProductHasListPrice(product)
  const quoteStyle = !hasListPrice || product.catalogStockStatus === 'on_order'
  const subtitle = String(product.subtitle || '').trim()
  const detailsLabel = hasListPrice ? trProducts.cardDetailsLabel : trProducts.cardSpecsLabel
  const detailHref = `/partner/produse?detail=${encodeURIComponent(product.id)}`
  const detailsAria = trDash.detailsAria(product.title)

  return (
    <li className="group relative flex h-full w-[min(18rem,calc(100vw-3rem))] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[#e8eaf0] bg-white shadow-[0_1px_2px_rgba(15,20,34,0.04),0_16px_36px_-22px_rgba(15,20,34,0.16)] transition-colors duration-200 hover:border-[#d9dde6] max-md:snap-start md:w-full md:min-w-0 md:shrink md:snap-align-none">
      <Link to={detailHref} className="absolute inset-0 z-0 rounded-2xl" aria-label={detailsAria} />
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col pointer-events-none">
        <div className="relative grid h-[172px] shrink-0 place-items-center bg-[#f7f7f7]">
          <img
            src={img}
            alt=""
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            className="max-h-[130px] max-w-[calc(100%-3rem)] object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <PartnerCatalogCardMedia
            product={product}
            trProduse={trProduse}
            trProducts={trProducts}
            quoteStyle={quoteStyle}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-4">
          <div className="min-h-0 flex-1">
            <p className="m-0 line-clamp-2 text-[15.5px] font-bold leading-snug tracking-[-0.01em] text-[#0f1422]">{product.title}</p>
            {(subtitle || specLine1) && (
              <p className={`mt-1 m-0 line-clamp-2 text-[12px] font-semibold leading-relaxed ${quoteStyle ? 'text-[#4d6079]' : 'text-[#0e8459]'}`}>
                {subtitle || specLine1}
              </p>
            )}
          </div>

          <div className="mt-auto shrink-0 pt-3.5">
            {!stockUnavailable ? (
              <PartnerCatalogPriceBlock
                  product={product}
                  partnerDiscountPct={partnerDiscountPct}
                  partnerContractSignedAt={partnerContractSignedAt}
                  className="w-full"
                  formatAmount={(amount) => formatTrendCardPrice(amount, langCode, currency)}
              />
            ) : stockCta ? (
              <p className="m-0 rounded-xl border border-[#e8eaf0] bg-[#fafbfc] px-3 py-3 text-center text-xs font-semibold text-[#6a7281]">{stockCta}</p>
            ) : null}

            <div className="pt-3.5">
              {stockUnavailable ? (
                <div className="rounded-[10px] border border-[#e8eaf0] bg-[#f4f5f7] px-3 py-2 text-center">
                  <p className="m-0 text-xs font-semibold text-[#6a7281]">{trProduse.catalogStockPartnerFooterNote}</p>
                </div>
              ) : (
                <span className="flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-[#e8eaf0] bg-white px-3 py-[11px] text-[13.5px] font-semibold text-[#4d6079] transition group-hover:bg-[#f4f5f7]">
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                  <span aria-hidden>{detailsLabel}</span>
                </span>
              )}
            </div>
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

  const [isSuspended, setIsSuspended] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileHint] = useState(() => readPartnerProfileHint())

  const [catalogProductsCountLoaded, setCatalogProductsCountLoaded] = useState(false)
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
          const arr = filterProductsForPartnerPanel(Array.isArray(list) ? list : [])
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
    partnerContractSignedAt?: string | null
    publicSlug?: string | null
    street?: string
    county?: string
    city?: string
    description?: string
    services?: string[]
    publicPhone?: string
    website?: string
    facebookUrl?: string
    linkedinUrl?: string
    instagramUrl?: string
    tiktokUrl?: string
    workPhotos?: string[]
    isPublic?: boolean
  } | null>(null)

  useEffect(() => {
    setLoading(true)
    getPartnerProfile()
      .then((p: {
        isSuspended?: boolean
        contactFirstName?: string
        contactLastName?: string
        companyName?: string
        publicName?: string
        logoUrl?: string | null
        partnerDiscountPercent?: number | null
        partnerContractSignedAt?: string | null
        publicSlug?: string | null
        street?: string
        county?: string
        city?: string
        description?: string
        services?: string[] | string
        publicPhone?: string
        website?: string
        facebookUrl?: string
        linkedinUrl?: string
        instagramUrl?: string
        tiktokUrl?: string
        workPhotos?: string[] | string | null
        isPublic?: boolean
      }) => {
        setIsSuspended(p?.isSuspended === true)
        setProfile({
          contactFirstName: p?.contactFirstName,
          contactLastName: p?.contactLastName,
          companyName: p?.companyName,
          publicName: p?.publicName,
          logoUrl: p?.logoUrl,
          partnerDiscountPercent: p?.partnerDiscountPercent,
          partnerContractSignedAt:
            typeof p?.partnerContractSignedAt === 'string' && p.partnerContractSignedAt.trim()
              ? p.partnerContractSignedAt
              : null,
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
          website: p?.website,
          facebookUrl: p?.facebookUrl,
          linkedinUrl: p?.linkedinUrl,
          instagramUrl: p?.instagramUrl,
          tiktokUrl: p?.tiktokUrl,
          workPhotos: Array.isArray(p?.workPhotos)
            ? p.workPhotos
            : typeof p?.workPhotos === 'string'
              ? (() => {
                  try {
                    const parsed = JSON.parse(p.workPhotos) as unknown
                    return Array.isArray(parsed) ? parsed.map((x) => String(x).trim()).filter(Boolean) : []
                  } catch {
                    return []
                  }
                })()
              : undefined,
          isPublic: p?.isPublic,
        })
        writePartnerProfileHintFromProfile(p)
      })
      .catch(() => {
        setIsSuspended(null)
        setProfile(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const tr = getPartnerDashboardTranslations(lang as LangCode)

  const trProdCatalog = getProduseTranslations(lang as LangCode)
  const trProducts = getPartnerProductsTranslations(lang as LangCode)
  const dashboardProductBucketKeysOnCard: PartnerDashboardProductBucketKey[] = [
    'rezidential',
    'industrial',
    'comercial',
  ]

  /** Placeholder until partner service / ticketing API supplies rows. */
  const partnerServiceBuckets = { preluate: 0, inService: 0, rezolvate: 0 }
  const partnerServiceTotal =
    partnerServiceBuckets.preluate + partnerServiceBuckets.inService + partnerServiceBuckets.rezolvate

  const activityKpiMetricsReady = catalogProductsCountLoaded && partnerOrdersCountLoaded

  const trendingPartnerProducts = useMemo(
    () => partnerCatalogProducts.filter((p) => isPartnerAccountPromotedProduct(p)),
    [partnerCatalogProducts],
  )

  const profitableScrollerRef = useRef<HTMLUListElement | null>(null)
  const profitableCarouselDrag = useProfitCarouselDragScroll(profitableScrollerRef)

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

  const showMainDashboard = loading || isSuspended !== true
  const showProfitableSection =
    showMainDashboard && (loading || !catalogProductsCountLoaded || trendingPartnerProducts.length > 0)
  const kpiCardsLoading = loading || !activityKpiMetricsReady
  const reloadPartnerProfile = useCallback(() => {
    getPartnerProfile()
      .then((p) => {
        setProfile((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            partnerDiscountPercent: p?.partnerDiscountPercent,
            partnerContractSignedAt:
              typeof p?.partnerContractSignedAt === 'string' && p.partnerContractSignedAt.trim()
                ? p.partnerContractSignedAt
                : null,
          }
        })
      })
      .catch(() => {})
  }, [])

  const discountConfigured = partnerDiscountConfigured(profile?.partnerDiscountPercent)
  const contractSigned = Boolean(String(profile?.partnerContractSignedAt ?? '').trim())
  const skipApprovalTimelinePreload = profileHint?.discountConfigured === true || discountConfigured
  const showApprovalTimeline = !loading && !contractSigned

  return (
    <div className="relative flex min-h-full min-w-0 w-full flex-1 flex-col bg-[#f7f7f7] lg:min-h-0">
      <div className="min-w-0 flex-1 bg-[#f7f7f7] px-6 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10 lg:w-full">

      {/* Suspended banner */}
      {!loading && isSuspended === true && (
        <div
          className="mb-6 rounded-2xl pt-2 pb-5 px-5 flex items-center gap-4 shadow-[0_10px_36px_-12px_rgba(220,38,38,0.22),0_4px_18px_-10px_rgba(15,23,42,0.06)] sm:pt-3 sm:pb-6 sm:px-6 max-w-7xl"
          style={{ background: 'linear-gradient(to right, #FFF5F5, #FECACA)' }}
        >
          <div className="flex-shrink-0">
            <IconAlert />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold font-['Inter'] text-slate-900">{tr.suspendedTitle}</h3>
            <p className="text-gray-600 text-sm font-['Inter'] mt-1">{tr.suspendedBody}</p>
          </div>
        </div>
      )}

      {showMainDashboard ? (
        <div
          className="flex w-full max-w-7xl flex-col gap-6 pb-4"
          aria-busy={loading}
          aria-label={loading ? tr.dashboardLoadingAria : undefined}
        >
          {loading && !skipApprovalTimelinePreload ? (
            <PartnerApprovalTimelineSkeleton sectionTitle={tr.approvalTimelineAria} />
          ) : null}
          {showApprovalTimeline ? (
            <PartnerAccountApprovalSection
              discountConfigured={discountConfigured}
              onContractSigned={reloadPartnerProfile}
            />
          ) : null}
          {showProfitableSection ? (
            <section
              className={`${PARTNER_DASH_SECTION_BOX} relative z-0 min-w-0 w-full`}
              aria-labelledby="partner-dash-profitable-products-heading"
            >
              <div className={`${PARTNER_DASH_SECTION_HEADING} flex-col items-stretch gap-3 sm:flex-row sm:items-center`}>
                <h2 id="partner-dash-profitable-products-heading" className={PARTNER_DASH_SECTION_TITLE}>
                  <PartnerDashSectionTitleIcon icon={TrendingUp} />
                  <span className="min-w-0">{tr.profitableProductsSectionTitle}</span>
                </h2>
                <div className="flex shrink-0 items-center gap-2 self-end sm:ml-auto sm:self-auto">
                  <Link
                    to="/partner/produse"
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 font-['Inter']"
                    aria-label={tr.dashNavAriaKpiProducts}
                  >
                    {tr.profitableProductsSeeCatalogLabel}
                  </Link>
                </div>
              </div>
              <div
                id="partner-dash-profitable-carousel"
                role="region"
                aria-roledescription="carousel"
                aria-busy={!catalogProductsCountLoaded}
                aria-label={tr.profitableProductsSectionTitle}
                className="relative z-0 min-w-0 w-full"
              >
                <ul
                  ref={catalogProductsCountLoaded ? profitableScrollerRef : undefined}
                  {...(catalogProductsCountLoaded ? profitableCarouselDrag : {})}
                  className={`m-0 list-none p-0 max-md:flex max-md:min-w-0 max-md:gap-4 max-md:overflow-x-auto max-md:overflow-y-visible max-md:overscroll-x-contain max-md:pb-2 max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden max-md:touch-pan-x max-md:snap-x max-md:snap-proximity md:grid md:grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] md:gap-5 md:overflow-visible md:snap-none md:pb-0 lg:gap-6 ${catalogProductsCountLoaded ? 'max-md:cursor-grab max-md:select-none max-md:active:cursor-grabbing' : ''}`}
                >
                  {catalogProductsCountLoaded ? (
                    trendingPartnerProducts.map((product) => (
                      <PartnerTrendingProductCard
                        key={product.id}
                        product={product}
                        trProduse={trProdCatalog}
                        trProducts={trProducts}
                        trDash={tr}
                        langCode={lang}
                        currency={currency}
                        partnerDiscountPct={profile?.partnerDiscountPercent ?? null}
                        partnerContractSignedAt={profile?.partnerContractSignedAt ?? null}
                      />
                    ))
                  ) : (
                    Array.from({ length: 5 }).map((_, i) => <PartnerTrendingProductCardSkeleton key={i} />)
                  )}
                </ul>
              </div>
            </section>
          ) : null}
          <section className={PARTNER_DASH_SECTION_BOX} aria-labelledby="partner-dash-activity-heading">
            <div className={PARTNER_DASH_SECTION_HEADING}>
              <h2 id="partner-dash-activity-heading" className={PARTNER_DASH_SECTION_TITLE}>
                <PartnerDashSectionTitleIcon icon={Activity} />
                <span className="min-w-0">{tr.myActivity}</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-stretch">
              <PartnerDashKpiNavShell
                to="/partner/produse"
                ariaLabel={tr.dashNavAriaKpiProducts}
                loading={kpiCardsLoading}
                tooltipText={tr.dashTooltipProductsSite}
                infoAria={tr.dashInfoAriaProducts}
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
                        {tr.productsCatalogEyebrow}
                      </p>
                      <p className="text-3xl font-bold tabular-nums font-['Inter'] text-slate-900">
                        {catalogProductsTotal < 0 ? (
                          <span aria-label={tr.unavailable}>
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
                                ? tr.productDashLabelComercial
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
                ariaLabel={tr.dashNavAriaKpiOrders}
                loading={kpiCardsLoading}
                tooltipText={tr.dashTooltipOrders}
                infoAria={tr.dashInfoAriaOrders}
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
                        {tr.orders}
                      </p>
                      <p className="text-3xl font-bold tabular-nums font-['Inter'] text-slate-900">
                        {partnerOrdersTotal < 0 ? (
                          <span aria-label={tr.unavailable}>
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
                              {tr.orderDashLabelDePlata}
                            </p>
                            <p className="mt-1 m-0 tabular-nums text-xl font-bold leading-none text-slate-900 font-['Inter'] sm:text-2xl">
                              {partnerOrdersBuckets.dePlata}
                            </p>
                          </div>
                          <div className="min-w-0 text-center sm:text-left">
                            <p className="m-0 text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-500 font-['Inter'] sm:text-[11px]">
                              {tr.orderDashLabelInCurs}
                            </p>
                            <p className="mt-1 m-0 tabular-nums text-xl font-bold leading-none text-slate-900 font-['Inter'] sm:text-2xl">
                              {partnerOrdersBuckets.inCurs}
                            </p>
                          </div>
                          <div className="min-w-0 text-center sm:text-left">
                            <p className="m-0 text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-500 font-['Inter'] sm:text-[11px]">
                              {tr.orderDashLabelLivrate}
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
                ariaLabel={tr.dashNavAriaKpiService}
                loading={kpiCardsLoading}
                tooltipText={tr.dashTooltipService}
                infoAria={tr.dashInfoAriaService}
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
                        {tr.productsInService}
                      </p>
                      <p className="text-3xl font-bold tabular-nums font-['Inter'] text-slate-900">{partnerServiceTotal}</p>
                    </div>
                    <div className="mt-2 border-t border-slate-100 pt-2.5">
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                        <div className="min-w-0 text-center sm:text-left">
                          <p className="m-0 text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-500 font-['Inter'] sm:text-[11px]">
                            {tr.serviceDashLabelPreluate}
                          </p>
                          <p className="mt-1 m-0 tabular-nums text-xl font-bold leading-none text-slate-900 font-['Inter'] sm:text-2xl">
                            {partnerServiceBuckets.preluate}
                          </p>
                        </div>
                        <div className="min-w-0 text-center sm:text-left">
                          <p className="m-0 text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-500 font-['Inter'] sm:text-[11px]">
                            {tr.serviceDashLabelInService}
                          </p>
                          <p className="mt-1 m-0 tabular-nums text-xl font-bold leading-none text-slate-900 font-['Inter'] sm:text-2xl">
                            {partnerServiceBuckets.inService}
                          </p>
                        </div>
                        <div className="min-w-0 text-center sm:text-left">
                          <p className="m-0 text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-500 font-['Inter'] sm:text-[11px]">
                            {tr.serviceDashLabelRezolvate}
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

          <section className={PARTNER_DASH_SECTION_BOX} aria-labelledby="partner-dash-profile-stats-heading">
            <div className={PARTNER_DASH_SECTION_HEADING}>
              <h2 id="partner-dash-profile-stats-heading" className={PARTNER_DASH_SECTION_TITLE}>
                <PartnerDashSectionTitleIcon icon={BarChart3} />
                <span className="min-w-0">{tr.publicProfileStats}</span>
              </h2>
            </div>
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
                  aria-label={tr.profileStatsGateAria}
                  className="min-w-0 w-full self-start lg:h-auto"
                >
                  <div className="flex w-full flex-col items-start justify-start gap-3 text-left rounded-2xl border border-slate-200 bg-white px-5 py-5 sm:gap-4 sm:px-6 sm:py-6">
                    <h3 className="m-0 text-base font-bold leading-tight text-slate-900 font-['Inter'] sm:text-lg">
                      {tr.profileStatsGateTitle}
                    </h3>
                    <p className="m-0 text-sm leading-relaxed text-slate-600 font-['Inter']">{tr.profileStatsGateBody}</p>
                    <Link
                      to="/partner/profil"
                      className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 font-['Inter']"
                    >
                      {tr.profileStatsGateCta}
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
                      aria-label={tr.dashNavAriaProfileStats}
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
                            {tr.views}
                          </p>
                          <p className="text-3xl font-bold tabular-nums font-['Inter'] text-slate-900">0</p>
                        </div>
                        <div className="min-w-0 shrink-0 text-left">
                          <p className="mb-2 text-xs font-['Inter'] font-semibold uppercase tracking-wide text-gray-400">
                            {tr.clicks}
                          </p>
                          <p className="text-3xl font-bold tabular-nums font-['Inter'] text-slate-900">0</p>
                        </div>
                      </div>
                    </div>
                    <PartnerDashStatCardInfo tooltipText={tr.dashTooltipProfileStats} label={tr.dashInfoAriaPublic} />
                  </div>
                )}
              </div>
            </div>
          </section>

          {loading ? (
            <PartnerPartnershipBenefitsSkeleton
              sectionTitle={tr.partnershipBenefitsTitle}
              ariaLabel={tr.advantagesLoadingAria}
            />
          ) : (
          <section className={PARTNER_DASH_SECTION_BOX} aria-labelledby="partner-dash-partnership-advantages-heading">
            <div className={PARTNER_DASH_SECTION_HEADING}>
              <h2 id="partner-dash-partnership-advantages-heading" className={PARTNER_DASH_SECTION_TITLE}>
                <PartnerDashSectionTitleIcon icon={Award} />
                <span className="min-w-0">{tr.partnershipBenefitsTitle}</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-stretch">
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
      ) : null}
      </div>
    </div>
  )
}
