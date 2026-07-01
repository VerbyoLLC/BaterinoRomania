import { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ChevronDown, Cable, Percent, Megaphone, LineChart, BadgeCheck, Handshake } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { getProductDetailTranslations } from '../../i18n/product-detail'
import { getPartnerSidebarTranslations } from '../../i18n/partner/sidebar'
import type { LangCode } from '../../i18n/menu'

/** Dashboard partnership benefit cards — shared shell */
const PARTNER_DASH_BENEFIT_BOX_CLS =
  'flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-5'

/** Typography shared by Quick Panel info cards (Dashboard sidebar) */
export const quickPanelEyebrowCls =
  "mb-1 m-0 text-[10px] font-semibold uppercase tracking-wider font-['Inter'] sm:text-xs"
export const quickPanelTitleCls =
  "m-0 text-base font-bold leading-snug text-slate-900 font-['Inter'] sm:text-lg"
export const quickPanelBodyCls =
  "mt-2 m-0 text-sm leading-snug text-slate-700 font-['Inter'] sm:text-[15px] sm:leading-relaxed"

/* ── Reducere Partener box ──────────────────────────────────────── */

function DiscountTagIcon({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z" />
      <circle cx="7" cy="7" r="1.3" />
    </svg>
  )
}

function ReducerePartenerSidebarSkeleton({
  className,
  ariaLabel,
}: {
  className?: string
  ariaLabel: string
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[17px] border border-[#e3e9f5] bg-gradient-to-br from-white to-[#eef3fc] p-4 pointer-events-none select-none ${className ?? ''}`}
      aria-busy="true"
      aria-label={ariaLabel}
    >
      <div className="mb-[13px] flex items-center gap-2.5">
        <div className="h-8 w-8 shrink-0 animate-pulse rounded-[10px] bg-[#e6eaf2]" aria-hidden />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-2.5 w-24 animate-pulse rounded bg-[#e6eaf2]" aria-hidden />
          <div className="h-2.5 w-14 animate-pulse rounded bg-[#e6eaf2]" aria-hidden />
        </div>
      </div>
      <div className="mb-0.5 flex flex-col items-center gap-2">
        <div className="h-10 w-[4.5rem] animate-pulse rounded-lg bg-[#e6eaf2]" aria-hidden />
        <div className="h-3.5 w-28 animate-pulse rounded bg-[#e6eaf2]" aria-hidden />
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="h-2.5 w-full animate-pulse rounded bg-[#eef1f7]" aria-hidden />
        <div className="h-2.5 w-[88%] animate-pulse rounded bg-[#eef1f7]" aria-hidden />
      </div>
    </div>
  )
}

export function ReducerePartenerBox({
  className,
  discountPercent,
  loading,
  variant = 'light',
}: {
  className?: string
  discountPercent: number | null
  loading: boolean
  variant?: 'light' | 'sidebar'
}) {
  const { language } = useLanguage()
  const tr = getPartnerSidebarTranslations(language.code as LangCode)
  const fmt = (n: number) => (n % 1 === 0 ? Math.round(n) : n.toFixed(1))
  const isSidebar = variant === 'sidebar'
  const hasDiscount = discountPercent != null && Number(discountPercent) > 0

  if (loading && isSidebar) {
    return <ReducerePartenerSidebarSkeleton className={className} ariaLabel={tr.reducereLoadingAria} />
  }

  if (!hasDiscount) return null

  const containerCls = isSidebar
    ? 'relative overflow-hidden rounded-[17px] border border-[#e3e9f5] bg-gradient-to-br from-white to-[#eef3fc] p-4'
    : 'rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/75 p-3.5 sm:p-4'

  const iconWrapCls = isSidebar
    ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#ffc35a] to-[#f5a524] text-[#3a2a07]'
    : 'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/80 text-amber-700'

  const eyebrowCls = isSidebar
    ? 'text-[9.5px] font-bold uppercase tracking-[0.13em] text-[#7a86a0]'
    : `${quickPanelEyebrowCls} text-amber-900`

  const titleCls = isSidebar ? '' : quickPanelTitleCls

  const bodyCls = isSidebar ? '' : quickPanelBodyCls

  const tagIcon = isSidebar ? (
    <DiscountTagIcon size={17} />
  ) : (
    <svg className="h-5 w-5 text-amber-700/90" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  )

  if (isSidebar) {
    return (
      <div className={`${containerCls} ${className ?? ''}`}>
        <div
          className="pointer-events-none absolute -right-10 -top-[46px] h-[130px] w-[130px] rounded-full bg-[radial-gradient(circle,rgba(42,91,255,0.12),transparent_70%)]"
          aria-hidden
        />
        <div className="relative mb-[13px] flex items-center gap-2.5">
          <span className={iconWrapCls} aria-hidden>
            {tagIcon}
          </span>
          <div className="min-w-0 flex-1">
            <div className={eyebrowCls}>{tr.reducereEyebrow}</div>
          </div>
        </div>
        <div className="relative mb-0.5 text-center">
          <span className="inline-block text-[42px] font-extrabold leading-none tracking-[-0.02em] text-[#0a0e1a] tabular-nums">
            <span className="text-[#f5a524]">−</span>
            {fmt(discountPercent!)}%
          </span>
          <span className="mt-1 block text-[13px] font-semibold text-[#8893ad]">{tr.reducereAllProducts}</span>
        </div>
        <p className="relative m-0 mt-2 text-[11px] leading-normal text-[#6b7488]">
          {tr.reducereBenefitIntro}{' '}
          <strong className="font-bold text-[#0a0e1a]">{tr.reducereBenefitBold}</strong>
        </p>
      </div>
    )
  }

  return (
    <div className={`${containerCls} ${className ?? ''}`}>
      <div className="flex items-start gap-2.5">
        <span className={iconWrapCls} aria-hidden>
          {tagIcon}
        </span>

        <div className="min-w-0 flex-1 pt-px text-left">
          <div className="flex flex-col">
            <h2 className={eyebrowCls}>{tr.reducereEyebrow}</h2>
            <p className={`${titleCls} mt-1 m-0 text-xl tabular-nums`}>-{fmt(discountPercent!)}%</p>
            <p className={`${bodyCls} mt-1 text-xs sm:text-sm`}>{tr.reducereBenefit}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Inverter compatibility (Quick Panel) ───────────────────────── */
export function PartnerInverterCompatibilityBox({
  className,
  onOpenSearch,
}: {
  className?: string
  /** Opens shared inverter-brand search modal (parent mounts `CompatibilitateInvertorModal`). */
  onOpenSearch?: () => void
}) {
  const { language } = useLanguage()
  const tr = getPartnerSidebarTranslations(language.code as LangCode)
  const title = tr.inverterTitle
  const body = tr.inverterBody
  const openLabel = tr.inverterOpenLabel

  const baseCard =
    'group w-full cursor-pointer rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-violet-50/70 p-3.5 text-left transition-colors duration-200 hover:from-indigo-100/50 hover:via-white hover:to-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f7f7] sm:p-4'

  return (
    <button
      type="button"
      onClick={() => onOpenSearch?.()}
      aria-haspopup="dialog"
      aria-label={openLabel}
      className={`${baseCard} ${className ?? ''}`}
      title={openLabel}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/90 text-indigo-700 transition group-hover:bg-white"
          aria-hidden
        >
          <Cable className="h-5 w-5 transition group-hover:text-indigo-800" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1 pt-px">
          <h3 className={quickPanelTitleCls}>{title}</h3>
          <p className={quickPanelBodyCls}>{body}</p>
        </div>
      </div>
    </button>
  )
}

/** Dashboard: ce câștigi ca partener (aliniat cu Siguranța clientului) */
export function AvantajePartenerDashboardBox() {
  const { language } = useLanguage()
  const tr = getPartnerSidebarTranslations(language.code as LangCode)

  const advantageIcons: LucideIcon[] = [Percent, Megaphone, LineChart, BadgeCheck]

  const titleRow = (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 shadow-[0_4px_12px_-6px_rgba(245,158,11,0.25)]">
        <Handshake className="h-4 w-4 text-amber-800" strokeWidth={1.9} aria-hidden />
      </span>
      <h2 className="m-0 text-sm font-bold uppercase tracking-wider text-amber-900/90 font-['Inter']">
        {tr.partnerAdvantagesTitle}
      </h2>
    </div>
  )

  const list = (
    <div className="flex flex-col divide-y divide-slate-100">
      {tr.partnerAdvantageRows.map((row, i) => {
        const Icon = advantageIcons[i] ?? Percent
        return (
          <div key={row.label} className="flex items-start gap-3.5 py-3.5 first:pt-0 last:pb-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 shadow-[0_4px_14px_-8px_rgba(15,23,42,0.09)]">
              <Icon className="h-[1.375rem] w-[1.375rem] text-slate-700" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="m-0 text-sm font-bold leading-snug text-slate-900 font-['Inter'] sm:text-[15px]">{row.label}</p>
              <p className="mt-1 m-0 text-sm leading-snug text-slate-500 font-['Inter'] sm:text-[15px] sm:leading-relaxed">
                {row.sub}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className={PARTNER_DASH_BENEFIT_BOX_CLS}>
      <div className="mb-3 shrink-0">{titleRow}</div>
      <div className="flex min-h-0 flex-1 flex-col">{list}</div>
    </div>
  )
}

const SIDEBAR_ACCORDION_STAGGER_MS = 95

/** Produse sidebar: sync expand with cart; stagger collapse bottom→top / expand top→bottom. */
function useCollapsibleExpandedForCart(
  collapsible: boolean,
  cartHasItems: boolean | undefined,
  stackPosition?: 'upper' | 'lower',
) {
  const [expanded, setExpanded] = useState(() => {
    if (!collapsible) return true
    if (cartHasItems === undefined) return true
    return !cartHasItems
  })

  const prevCartRef = useRef<boolean | undefined>(undefined)
  const staggerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (staggerTimeoutRef.current != null) clearTimeout(staggerTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!collapsible || cartHasItems === undefined) return

    const wantExpanded = !cartHasItems
    const prev = prevCartRef.current
    prevCartRef.current = cartHasItems

    if (staggerTimeoutRef.current != null) {
      clearTimeout(staggerTimeoutRef.current)
      staggerTimeoutRef.current = null
    }

    if (prev === undefined) {
      setExpanded(wantExpanded)
      return
    }

    if (prev === cartHasItems) return

    if (!stackPosition) {
      setExpanded(wantExpanded)
      return
    }

    if (wantExpanded) {
      if (stackPosition === 'upper') setExpanded(true)
      else staggerTimeoutRef.current = setTimeout(() => setExpanded(true), SIDEBAR_ACCORDION_STAGGER_MS)
    } else {
      if (stackPosition === 'lower') setExpanded(false)
      else staggerTimeoutRef.current = setTimeout(() => setExpanded(false), SIDEBAR_ACCORDION_STAGGER_MS)
    }
  }, [collapsible, cartHasItems, stackPosition])

  return [expanded, setExpanded] as const
}

/* ── Siguranța Clientului box ───────────────────────────────────── */
export function SigurantaClientuluiBox({
  collapsible = false,
  cartHasItems,
  stackPosition,
}: {
  collapsible?: boolean
  cartHasItems?: boolean
  stackPosition?: 'upper' | 'lower'
}) {
  const { language } = useLanguage()
  const productTr = getProductDetailTranslations(language.code)
  const sidebarTr = getPartnerSidebarTranslations(language.code as LangCode)
  const [expanded, setExpanded] = useCollapsibleExpandedForCart(collapsible, cartHasItems, stackPosition)

  const items = [
    { icon: '/images/shared/testing-icon.svg', label: productTr.badgeGarantie, sub: sidebarTr.sigurantaItems[0]?.sub ?? '' },
    { icon: '/images/shared/compatibility-icon.svg', label: productTr.badgeCompatibilitate, sub: sidebarTr.sigurantaItems[1]?.sub ?? '' },
    { icon: '/images/shared/delivery-icon.svg', label: productTr.badgeRetur, sub: sidebarTr.sigurantaItems[2]?.sub ?? '' },
    { icon: '/images/shared/swap-icon.svg', label: productTr.badgeSwap, sub: sidebarTr.sigurantaItems[3]?.sub ?? '' },
  ]

  const titleRow = (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
        <svg className="h-4 w-4 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </span>
      <h2 className="m-0 text-sm font-bold uppercase tracking-wider text-slate-700 font-['Inter']">{sidebarTr.sigurantaTitle}</h2>
    </div>
  )

  const list = (
    <div className="flex flex-col divide-y divide-slate-100">
      {items.map(({ icon, label, sub }) => (
        <div key={label} className="flex items-start gap-3.5 py-3.5 first:pt-0 last:pb-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 shadow-[0_4px_14px_-8px_rgba(15,23,42,0.09)]">
            <img src={icon} alt="" aria-hidden className="h-6 w-6 object-contain" />
          </div>
          <div className="min-w-0">
            <p className="m-0 text-sm font-bold leading-snug text-slate-900 font-['Inter'] sm:text-[15px]">{label}</p>
            <p className="mt-1 m-0 text-sm leading-snug text-slate-500 font-['Inter'] sm:text-[15px] sm:leading-relaxed">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className={PARTNER_DASH_BENEFIT_BOX_CLS}>
      {collapsible ? (
        <div className="flex flex-col-reverse">
          <div
            className={`grid min-h-0 transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="pt-3">{list}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            className="flex w-full items-center justify-between gap-2 rounded-lg text-left outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            {titleRow}
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-300 ease-out ${expanded ? 'rotate-180' : ''}`}
              aria-hidden
              strokeWidth={2.5}
            />
          </button>
        </div>
      ) : (
        <>
          <div className="mb-3 shrink-0">{titleRow}</div>
          <div className="flex min-h-0 flex-1 flex-col">{list}</div>
        </>
      )}
    </div>
  )
}

/* ── Suport Tehnic box ──────────────────────────────────────────── */
export function SuportTehnicBox({
  collapsible = false,
  cartHasItems,
  stackPosition,
}: {
  collapsible?: boolean
  cartHasItems?: boolean
  stackPosition?: 'upper' | 'lower'
}) {
  const { language } = useLanguage()
  const tr = getPartnerSidebarTranslations(language.code as LangCode)
  const [expanded, setExpanded] = useCollapsibleExpandedForCart(collapsible, cartHasItems, stackPosition)

  const itemIcons: Record<string, string> = {
    service: '/images/shared/maintance-icon.svg',
    install: '/images/shared/instalare-icon.svg',
    docs: '/images/shared/download-icon.svg',
  }

  const titleRow = (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100">
        <svg className="h-4 w-4 text-sky-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </span>
      <h2 className="m-0 text-sm font-bold uppercase tracking-wider text-sky-800 font-['Inter']">{tr.suportTitle}</h2>
    </div>
  )

  const body = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col divide-y divide-slate-100">
        {tr.suportItems.map(({ id, label, sub }) => (
          <div key={id} className="flex items-start gap-3.5 py-3.5 first:pt-0 last:pb-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 shadow-[0_4px_14px_-8px_rgba(15,23,42,0.09)]">
              <img src={itemIcons[id] ?? '/images/shared/maintance-icon.svg'} alt="" aria-hidden className="h-6 w-6 object-contain" />
            </div>
            <div className="min-w-0">
              <p className="m-0 text-sm font-bold leading-snug text-slate-900 font-['Inter'] sm:text-[15px]">{label}</p>
              <p className="mt-1 m-0 text-sm leading-snug text-slate-500 font-['Inter'] sm:text-[15px] sm:leading-relaxed">{sub}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="min-h-0 flex-1" aria-hidden />
      <a
        href="/partner/suport"
        className="mt-4 flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-100 font-['Inter']"
      >
        {tr.suportCta}
      </a>
    </div>
  )

  return (
    <div className={PARTNER_DASH_BENEFIT_BOX_CLS}>
      {collapsible ? (
        <div className="flex flex-col-reverse">
          <div
            className={`grid min-h-0 transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="pt-3">{body}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            className="flex w-full items-center justify-between gap-2 rounded-lg text-left outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            {titleRow}
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-300 ease-out ${expanded ? 'rotate-180' : ''}`}
              aria-hidden
              strokeWidth={2.5}
            />
          </button>
        </div>
      ) : (
        <>
          <div className="mb-3 shrink-0">{titleRow}</div>
          {body}
        </>
      )}
    </div>
  )
}
