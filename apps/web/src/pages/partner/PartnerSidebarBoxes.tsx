import { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ChevronDown, Cable, Percent, Megaphone, LineChart, BadgeCheck, Handshake } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { getProductDetailTranslations } from '../../i18n/product-detail'
import { getPartnerSidebarTranslations } from '../../i18n/partner/sidebar'
import type { LangCode } from '../../i18n/menu'

/** Elevated surfaces — no border stroke; soft blurred shadow */
const PARTNER_SURFACE_SHADOW =
  'shadow-[0_8px_32px_-12px_rgba(15,23,42,0.12),0_4px_16px_-8px_rgba(15,23,42,0.06)]'

/** Typography shared by Quick Panel info cards (Dashboard sidebar) */
export const quickPanelEyebrowCls =
  "mb-1 m-0 text-[10px] font-semibold uppercase tracking-wider font-['Inter'] sm:text-xs"
export const quickPanelTitleCls =
  "m-0 text-base font-bold leading-snug text-slate-900 font-['Inter'] sm:text-lg"
export const quickPanelBodyCls =
  "mt-2 m-0 text-sm leading-snug text-slate-700 font-['Inter'] sm:text-[15px] sm:leading-relaxed"

/* ── Reducere Partener box ──────────────────────────────────────── */
export function ReducerePartenerBox({
  className,
  discountPercent,
  loading,
}: {
  className?: string
  discountPercent: number | null
  loading: boolean
}) {
  const { language } = useLanguage()
  const tr = getPartnerSidebarTranslations(language.code as LangCode)
  const fmt = (n: number) => (n % 1 === 0 ? Math.round(n) : n.toFixed(1))

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/75 p-3.5 sm:p-4 ${className ?? ''}`}
    >
      {/* Two columns: icon | 3 stacked text rows */}
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/80 text-amber-700"
          aria-hidden
        >
          <svg className="h-5 w-5 text-amber-700/90" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </span>

        <div className="min-w-0 flex-1 pt-px text-left">
          {loading ? (
            <div className="animate-pulse space-y-1">
              <div className="h-2.5 w-36 rounded-md bg-amber-100/60 sm:w-44" />
              <div className="h-7 w-40 max-w-full rounded-md bg-amber-100/55" />
              <div className="mt-2 space-y-2">
                <div className="h-3.5 w-full rounded bg-amber-100/48" />
                <div className="h-3.5 w-11/12 rounded bg-amber-100/42" />
              </div>
            </div>
          ) : discountPercent != null && discountPercent > 0 ? (
            <div className="flex flex-col">
              <h2 className={`${quickPanelEyebrowCls} text-amber-900`}>{tr.reducereEyebrow}</h2>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className={`${quickPanelTitleCls} inline tabular-nums`}>-{fmt(discountPercent)}%</span>
                <span className={`${quickPanelTitleCls} inline uppercase tracking-wide text-amber-900/90`}>
                  {tr.reducereTitle}
                </span>
              </div>
              <p className={`${quickPanelBodyCls}`}>
                {tr.reducereBenefit.split('{pct}')[0]}
                <span className="font-bold text-slate-900">{fmt(discountPercent)}%</span>
                {tr.reducereBenefit.split('{pct}')[1]}
              </p>
            </div>
          ) : (
            <div className="rounded-lg bg-white/80 px-2.5 py-2">
              <p className={`${quickPanelBodyCls} mt-0 text-slate-600`}>{tr.reducereNoDiscount}</p>
              <p className="mt-1.5 m-0 text-sm leading-snug text-slate-400 font-['Inter'] sm:text-[15px]">
                {tr.reducereContact}
              </p>
            </div>
          )}
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
    <div className={`rounded-2xl bg-white p-5 ${PARTNER_SURFACE_SHADOW}`}>
      <div className="mb-3">{titleRow}</div>
      {list}
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
    <div className={`rounded-2xl bg-white p-5 ${PARTNER_SURFACE_SHADOW}`}>
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
          <div className="mb-3">{titleRow}</div>
          {list}
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
    <>
      <div className="flex flex-col divide-y divide-sky-50">
        {tr.suportItems.map(({ id, label, sub }) => (
          <div key={id} className="flex items-start gap-3.5 py-3.5 first:pt-0 last:pb-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 shadow-[0_4px_14px_-8px_rgba(14,165,233,0.18)]">
              <img src={itemIcons[id] ?? '/images/shared/maintance-icon.svg'} alt="" aria-hidden className="h-6 w-6 object-contain" />
            </div>
            <div className="min-w-0">
              <p className="m-0 text-sm font-bold leading-snug text-slate-900 font-['Inter'] sm:text-[15px]">{label}</p>
              <p className="mt-1 m-0 text-sm leading-snug text-slate-500 font-['Inter'] sm:text-[15px] sm:leading-relaxed">{sub}</p>
            </div>
          </div>
        ))}
      </div>
      <a
        href="/partner/suport"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-50 px-3 py-2.5 text-sm font-semibold text-sky-800 shadow-[0_4px_14px_-8px_rgba(14,165,233,0.18)] transition hover:bg-sky-100 hover:shadow-[0_8px_22px_-10px_rgba(14,165,233,0.22)] font-['Inter']"
      >
        {tr.suportCta}
      </a>
    </>
  )

  return (
    <div className="rounded-2xl bg-gradient-to-b from-sky-50 to-white p-5 shadow-[0_10px_36px_-14px_rgba(14,165,233,0.2),0_4px_18px_-10px_rgba(15,23,42,0.06)]">
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
            className="flex w-full items-center justify-between gap-2 rounded-lg text-left outline-none transition-colors hover:bg-sky-100/60 focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            {titleRow}
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-sky-700 transition-transform duration-300 ease-out ${expanded ? 'rotate-180' : ''}`}
              aria-hidden
              strokeWidth={2.5}
            />
          </button>
        </div>
      ) : (
        <>
          <div className="mb-3">{titleRow}</div>
          {body}
        </>
      )}
    </div>
  )
}
