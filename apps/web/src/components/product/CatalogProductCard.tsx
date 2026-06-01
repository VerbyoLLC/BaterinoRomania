import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Truck, Tag, Wrench, Clock } from 'lucide-react'

export type CatalogProductCardDensity = 'produse' | 'home' | 'partner'

export type CatalogProductCardBaseProps = {
  /** Listing context: Produse, Home featured grid, or partner ordering UI. */
  density?: CatalogProductCardDensity
  imageSrc: string
  imageAlt: string
  title: string
  /** Industrial cards only: second line under title (e.g. CMS subtitle). */
  subtitle?: string
  specLine1: string
  specLine2: string
  linkState?: { tipProdus?: 'rezidential' | 'industrial' }
  /**
   * Default catalog CTA — required for industrial public cards; residential public cards omit the bottom button (whole card links to product).
   */
  to?: string
  ctaLabel?: string
  /**
   * When true (Home grid), show logo pulse until the image loads.
   */
  imageLoadingPlaceholder?: boolean
  /**
   * Partner: quantity + order area below the main block (replaces CTA link).
   */
  footer?: ReactNode
  /**
   * Partner: main block is a button (product selection) instead of a detail link.
   */
  onMainClick?: () => void
  /** Partner: price line under specs (inside main interactive area). */
  priceDisplay?: string | null
  /**
   * Public + partner listing residential: when set, shows this as a button-styled label
   * instead of `priceDisplay` (partner_only / hidden visibility).
   */
  residentialPartnerPriceCta?: string | null
  /**
   * Residential: „stoc epuizat” / „în curând” — același chip ca la parteneri; ascunde prețul.
   */
  residentialStockListingCta?: string | null
  /** Above residential public price (e.g. PREȚ). */
  residentialPriceHeading?: string | null
  /** Below residential public price (e.g. Include TVA 21%). */
  residentialPriceVatNote?: string | null
  /** When set, rendered over the product image (e.g. Stoc / Livrare badges). */
  imageOverlay?: ReactNode
  /** Residential: badge row directly above the price block (e.g. Transport). */
  priceAboveBadge?: ReactNode
  /** Merged onto outer shell (e.g. partner selected border). */
  shellClassName?: string
}

type CatalogProductCardProps = CatalogProductCardBaseProps & {
  variant: 'residential' | 'industrial'
}

function CatalogProductCard({
  variant,
  density = 'produse',
  imageSrc,
  imageAlt,
  title,
  subtitle,
  specLine1,
  specLine2,
  to,
  linkState,
  ctaLabel,
  imageLoadingPlaceholder = false,
  footer,
  onMainClick,
  priceDisplay,
  residentialPartnerPriceCta = null,
  residentialStockListingCta = null,
  residentialPriceHeading = null,
  residentialPriceVatNote = null,
  imageOverlay = null,
  priceAboveBadge = null,
  shellClassName = '',
}: CatalogProductCardProps) {
  const isProduseDensity = density === 'produse'
  const isPartnerDensity = density === 'partner'
  const isIndustrial = variant === 'industrial'
  const partnerMode = footer != null && typeof onMainClick === 'function'
  const hasCatalogPrice = priceDisplay != null && String(priceDisplay).trim() !== ''
  if (!partnerMode && !to) {
    throw new Error('CatalogProductCard: `to` is required unless using partner mode (`footer` + `onMainClick`).')
  }
  if (
    !partnerMode &&
    isIndustrial &&
    !hasCatalogPrice &&
    (!ctaLabel || !String(ctaLabel).trim())
  ) {
    throw new Error(
      'CatalogProductCard: industrial cards require `ctaLabel` when no `priceDisplay` is set.',
    )
  }
  const subtitleLine = isIndustrial ? String(subtitle ?? '').trim() : ''
  const showSubtitle = Boolean(subtitleLine)
  const [imgLoaded, setImgLoaded] = useState(!imageLoadingPlaceholder)

  const shellPb = partnerMode
    ? 'pb-0'
    : isIndustrial
      ? isProduseDensity
        ? 'pb-5'
        : 'pb-4'
      : isProduseDensity
        ? 'pb-5'
        : 'pb-4'
  const imageFrameH = isPartnerDensity ? 'h-44' : 'h-56'
  const imageTopRadius = isPartnerDensity ? 'rounded-t-xl' : 'rounded-t-[10px]'

  let titleClass: string
  let specClass: string
  let firstSpecMargin: string
  let secondSpecMargin: string

  if (isPartnerDensity) {
    titleClass =
      "mt-3 w-full max-w-full px-4 text-center text-base font-bold font-['Inter'] text-black leading-snug line-clamp-2"
    specClass = "text-center text-sm font-normal font-['Inter'] leading-snug text-gray-500"
    firstSpecMargin = 'mt-2'
    secondSpecMargin = 'mt-1 mb-1'
  } else if (isProduseDensity) {
    titleClass =
      "mt-4 w-full max-w-full px-4 text-center text-xl font-bold font-['Inter'] text-black leading-6"
    specClass =
      "text-center text-base font-normal font-['Nunito_Sans'] leading-7 tracking-tight text-neutral-950"
    firstSpecMargin = 'mt-1.5'
    secondSpecMargin = ''
  } else {
    titleClass =
      "mb-3 mt-6 px-6 text-center text-lg font-bold font-['Inter'] leading-snug text-black"
    specClass = "px-6 text-center text-sm font-normal font-['Nunito_Sans'] leading-6 text-neutral-950"
    firstSpecMargin = ''
    secondSpecMargin = 'mb-4'
  }

  let subtitleClass: string
  if (isPartnerDensity) {
    subtitleClass =
      "mt-1 w-full max-w-full px-4 text-center text-xs font-medium font-['Inter'] leading-snug text-neutral-600 sm:text-sm line-clamp-3"
  } else if (isProduseDensity) {
    subtitleClass =
      "mt-1.5 w-full max-w-full px-4 text-center text-sm font-medium font-['Inter'] leading-snug text-neutral-600"
  } else {
    subtitleClass =
      "mt-1.5 w-full max-w-full px-6 text-center text-sm font-medium font-['Inter'] leading-snug text-neutral-600"
  }

  const titleMt =
    isPartnerDensity ? 'mt-3' : isProduseDensity ? 'mt-4' : 'mt-6'
  const titleClassWithMargin = `${titleMt} ${titleClass.replace(/\bmt-\d+(\.\d+)?\b/g, '').replace(/\s+/g, ' ').trim()}`.trim()

  const imageBlock = (
    <div className="w-full">
      <div
        className={`relative ${imageFrameH} w-full overflow-hidden ${imageTopRadius} bg-[#f7f7f7] flex items-center justify-center`}
      >
        {imageLoadingPlaceholder && !imgLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/images/shared/baterino-logo-black.svg"
              alt=""
              className="h-12 w-24 object-contain opacity-30 animate-pulse"
              aria-hidden
            />
          </div>
        ) : null}
        <img
          src={imageSrc}
          alt={imageAlt}
          className={`h-full w-full max-h-full max-w-full object-contain object-center transition-all duration-300 ${
            partnerMode ? 'transition-transform duration-200 group-hover:scale-105' : ''
          } ${imageLoadingPlaceholder && !imgLoaded ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            setImgLoaded(true)
          }}
        />
        {imageOverlay ? (
          <div className="pointer-events-none absolute left-3 top-3 z-10 max-w-[calc(100%-1.5rem)]">
            {imageOverlay}
          </div>
        ) : null}
      </div>
    </div>
  )

  /** Residential-only lines (voltage / capacity / cycles…). Industrial products use subtitle + detail page specs instead. */
  const specLine1Margin = showSubtitle ? 'mt-2' : firstSpecMargin
  const priceMarginTop = isIndustrial && !showSubtitle ? 'mt-4' : 'mt-3'

  const stockListingTrim =
    !isIndustrial &&
    residentialStockListingCta != null &&
    String(residentialStockListingCta).trim() !== ''
  const partnerListingCta =
    !partnerMode &&
    residentialPartnerPriceCta != null &&
    String(residentialPartnerPriceCta).trim() !== ''
  const darkListingLabel = stockListingTrim
    ? String(residentialStockListingCta).trim()
    : partnerListingCta
      ? String(residentialPartnerPriceCta).trim()
      : ''
  const showDarkListingChip =
    !isIndustrial &&
    ((stockListingTrim && !partnerMode) || partnerListingCta) &&
    darkListingLabel !== ''

  const showIndustrialDetailsCta =
    isIndustrial && !hasCatalogPrice && ctaLabel != null && String(ctaLabel).trim() !== ''

  const catalogPriceSlotClass = `${priceAboveBadge ? 'mt-2' : priceMarginTop} flex w-full max-w-full flex-col items-center px-2`

  const metaBlock = (
    <>
      {!isIndustrial ? (
        <>
          <p className={`${specClass} ${specLine1Margin}`.trim()}>{specLine1}</p>
          <p className={`${specClass} ${secondSpecMargin}`.trim()}>{specLine2}</p>
        </>
      ) : null}
      {priceAboveBadge ? (
        <div
          className={`${
            isIndustrial
              ? showSubtitle
                ? 'mt-3'
                : 'mt-2'
              : priceMarginTop
          } flex w-full justify-center px-2`}
        >
          {priceAboveBadge}
        </div>
      ) : null}
      {showDarkListingChip ? (
        <div
          className={`${priceAboveBadge ? 'mt-2' : priceMarginTop} flex w-full max-w-full flex-col items-center px-2`}
        >
          <span
            className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-600 font-['Inter'] sm:text-[13px] invisible select-none pointer-events-none"
            aria-hidden
          >
            {String(residentialPriceHeading ?? '').trim() || 'PREȚ'}
          </span>
          <span
            className="mt-1 mx-auto inline-flex max-w-[min(100%,18rem)] items-center justify-center rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-white font-['Inter'] sm:text-sm"
          >
            {darkListingLabel}
          </span>
          <span
            className="m-0 mt-1 text-center text-xs font-medium text-neutral-500 font-['Inter'] sm:text-sm invisible select-none pointer-events-none"
            aria-hidden
          >
            &nbsp;
          </span>
        </div>
      ) : priceDisplay != null && priceDisplay !== '' ? (
        residentialPriceHeading != null || residentialPriceVatNote != null ? (
          <div className={catalogPriceSlotClass}>
            <span
              className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-600 font-['Inter'] sm:text-[13px] invisible select-none pointer-events-none"
              aria-hidden
            >
              {String(residentialPriceHeading ?? '').trim() || 'PREȚ'}
            </span>
            <p className="m-0 mt-1 text-center text-2xl font-extrabold tabular-nums tracking-tight text-slate-900 font-['Inter'] sm:text-3xl">
              {priceDisplay}
            </p>
            {residentialPriceVatNote ? (
              <span className="m-0 mt-1 text-center text-xs font-medium text-neutral-500 font-['Inter'] sm:text-sm">
                {residentialPriceVatNote}
              </span>
            ) : null}
          </div>
        ) : (
          <p
            className={`${priceAboveBadge ? 'mt-2' : priceMarginTop} text-center text-lg font-bold font-['Inter'] tracking-tight text-slate-900 tabular-nums`}
          >
            {priceDisplay}
          </p>
        )
      ) : showIndustrialDetailsCta ? (
        <div className={catalogPriceSlotClass}>
          <span
            className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-600 font-['Inter'] sm:text-[13px] invisible select-none pointer-events-none"
            aria-hidden
          >
            {String(residentialPriceHeading ?? '').trim() || 'PREȚ'}
          </span>
          <span
            className={`mt-1 mx-auto inline-flex w-full max-w-[min(100%,18rem)] items-center justify-center rounded-[10px] bg-slate-900 px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-white font-['Inter'] sm:text-sm ${isProduseDensity ? 'max-w-[220px]' : isPartnerDensity ? '' : 'max-w-[200px]'}`}
          >
            {String(ctaLabel).trim()}
          </span>
          <span
            className="m-0 mt-1 text-center text-xs font-medium text-neutral-500 font-['Inter'] sm:text-sm invisible select-none pointer-events-none"
            aria-hidden
          >
            {residentialPriceVatNote?.trim() || 'Include TVA 21%'}
          </span>
        </div>
      ) : null}
    </>
  )

  const mainClassName = `flex w-full min-w-0 flex-col items-stretch ${partnerMode ? 'group flex-1 min-h-0 cursor-pointer' : ''}`

  const mainInner = (
    <>
      {imageBlock}
      <h3 className={titleClassWithMargin}>{title}</h3>
      {showSubtitle ? <p className={subtitleClass}>{subtitleLine}</p> : null}
      {metaBlock}
    </>
  )

  const defaultShell =
    `flex flex-col overflow-hidden bg-[#f7f7f7] ${shellPb} transition-shadow duration-300 ` +
    (isPartnerDensity
      ? 'min-h-[340px] rounded-xl border border-neutral-200 hover:border-neutral-300 hover:shadow-md'
      : 'rounded-[10px] hover:shadow-md')

  return (
    <div className={`${defaultShell} ${shellClassName}`.trim()}>
      {partnerMode ? (
        <button type="button" onClick={onMainClick} className={mainClassName}>
          {mainInner}
        </button>
      ) : (
        <Link to={to!} state={linkState} className={mainClassName}>
          {mainInner}
        </Link>
      )}
      {partnerMode ? (
        <div
          className="w-full px-4 pb-4 pt-0"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="presentation"
        >
          {footer}
        </div>
      ) : null}
    </div>
  )
}

export type ResidentialCatalogProductCardProps = CatalogProductCardBaseProps

/** Catalog / grid card for residential products (image cover, Produse- or Home-style density). */
export function ResidentialCatalogProductCard(props: ResidentialCatalogProductCardProps) {
  return <CatalogProductCard {...props} variant="residential" />
}

export type IndustrialCatalogProductCardProps = CatalogProductCardBaseProps

/** Catalog / grid card for industrial products (image contain in frame, same copy layout). */
export function IndustrialCatalogProductCard(props: IndustrialCatalogProductCardProps) {
  return <CatalogProductCard {...props} variant="industrial" />
}

export type HorizontalFeatureBadge = {
  type: 'stock' | 'delivery' | 'transport' | 'install' | 'reduceri'
  label: string
}

export type HorizontalCatalogProductCardProps = Omit<CatalogProductCardBaseProps, 'priceAboveBadge' | 'imageOverlay'> & {
  variant?: 'residential' | 'industrial'
  /** Compact feature badges rendered in a single row: stock, delivery, transport, install, reduceri */
  featureBadges?: HorizontalFeatureBadge[]
}

/**
 * Desktop: horizontal card — image on the left, content on the right.
 * Mobile: standard vertical layout.
 * Uses compact icon + text badges instead of pill badges to guarantee single-row display.
 */
export function HorizontalCatalogProductCard({
  variant = 'residential',
  imageSrc,
  imageAlt,
  title,
  subtitle,
  specLine1,
  specLine2,
  to,
  linkState,
  priceDisplay,
  residentialPriceHeading,
  residentialPriceVatNote,
  residentialPartnerPriceCta,
  residentialStockListingCta,
  shellClassName = '',
  ctaLabel,
  featureBadges = [],
}: HorizontalCatalogProductCardProps) {
  const [imgLoaded, setImgLoaded] = useState(true)
  const isIndustrial = variant === 'industrial'

  const stockListingTrim =
    !isIndustrial &&
    residentialStockListingCta != null &&
    String(residentialStockListingCta).trim() !== ''
  const partnerListingCta =
    residentialPartnerPriceCta != null &&
    String(residentialPartnerPriceCta).trim() !== ''
  const darkLabel = stockListingTrim
    ? String(residentialStockListingCta).trim()
    : partnerListingCta
      ? String(residentialPartnerPriceCta).trim()
      : ''
  const showDarkChip = !isIndustrial && darkLabel !== ''
  const showPrice = !showDarkChip && priceDisplay != null && priceDisplay !== ''
  const showIndustrialCta = isIndustrial && !showPrice && ctaLabel
  const subtitleLine = isIndustrial ? String(subtitle ?? '').trim() : ''

  // Split badges into two rows: stock/delivery on image, transport/install/reduceri in content
  const imageBadges = featureBadges.filter(b => b.type === 'stock' || b.type === 'delivery')
  const featureRow = featureBadges.filter(b => b.type === 'transport' || b.type === 'install' || b.type === 'reduceri')

  return (
    <div
      className={`group overflow-hidden rounded-[10px] bg-[#f7f7f7] transition-shadow duration-300 hover:shadow-md ${shellClassName}`.trim()}
    >
      <Link
        to={to!}
        state={linkState}
        className="flex flex-col lg:flex-row lg:items-stretch w-full"
      >
        {/* ── Image ── */}
        <div className="relative h-56 w-full flex-shrink-0 overflow-hidden rounded-t-[10px] bg-[#f7f7f7] lg:h-auto lg:w-[38%] lg:min-h-[180px] lg:rounded-l-[10px] lg:rounded-tr-none flex items-center justify-center">
          <img
            src={imageSrc}
            alt={imageAlt}
            className={`h-full w-full max-h-full max-w-full object-contain object-center transition-all duration-300 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
          {/* Stock + delivery badges overlaid on image */}
          {imageBadges.length > 0 && (
            <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-1.5">
              {imageBadges.map(b => (
                <HorizontalBadgePill key={b.type} badge={b} />
              ))}
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="flex flex-1 flex-col justify-center px-5 py-5 lg:px-5 lg:py-4">

          <h3 className="text-lg font-bold font-['Inter'] leading-snug text-black lg:text-xl">
            {title}
          </h3>
          {subtitleLine ? (
            <p className="mt-1 text-sm font-medium font-['Inter'] leading-snug text-neutral-500">
              {subtitleLine}
            </p>
          ) : null}
          {!isIndustrial ? (
            <div className="mt-1.5">
              <p className="text-sm font-['Nunito_Sans'] leading-6 text-neutral-600">{specLine1}</p>
              <p className="text-sm font-['Nunito_Sans'] leading-6 text-neutral-600">{specLine2}</p>
            </div>
          ) : null}

          {/* Compact icon badges — transport, install, reduceri — guaranteed single row */}
          {featureRow.length > 0 ? (
            <div className="mt-2.5 flex items-center gap-3 flex-wrap">
              {featureRow.map((b, i) => (
                <HorizontalFeatureItem key={b.type} badge={b} showDivider={i < featureRow.length - 1} />
              ))}
            </div>
          ) : null}

          {/* Price / CTA */}
          {showDarkChip ? (
            <div className="mt-3">
              <span className="inline-flex items-center justify-center rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white font-['Inter']">
                {darkLabel}
              </span>
            </div>
          ) : showPrice ? (
            <div className="mt-3">
              {residentialPriceHeading ? (
                <span className="block text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400 font-['Inter']">
                  {residentialPriceHeading}
                </span>
              ) : null}
              <p className="mt-0.5 text-2xl font-extrabold tabular-nums tracking-tight text-slate-900 font-['Inter'] lg:text-[1.75rem]">
                {priceDisplay}
              </p>
              {residentialPriceVatNote ? (
                <span className="text-[11px] font-medium text-neutral-400 font-['Inter']">
                  {residentialPriceVatNote}
                </span>
              ) : null}
            </div>
          ) : showIndustrialCta ? (
            <div className="mt-3">
              <span className="inline-flex items-center justify-center rounded-[10px] bg-slate-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white font-['Inter']">
                {String(ctaLabel).trim()}
              </span>
            </div>
          ) : null}
        </div>
      </Link>
    </div>
  )
}

// ── Internal sub-components ────────────────────────────────────────────────

function stockVariantStyle(type: HorizontalFeatureBadge['type'], label: string) {
  if (type !== 'stock') return 'bg-slate-100 text-slate-600'
  const l = label.toLowerCase()
  if (l.includes('epuizat') || l.includes('out')) return 'bg-red-100 text-red-700'
  if (l.includes('curând') || l.includes('soon')) return 'bg-amber-100 text-amber-700'
  if (l.includes('comandă') || l.includes('order')) return 'bg-sky-100 text-sky-700'
  return 'bg-emerald-100 text-emerald-700'
}

function stockDotColor(label: string) {
  const l = label.toLowerCase()
  if (l.includes('epuizat') || l.includes('out')) return 'bg-red-500'
  if (l.includes('curând') || l.includes('soon')) return 'bg-amber-400'
  if (l.includes('comandă') || l.includes('order')) return 'bg-sky-500'
  return 'bg-emerald-500'
}

/** Stock / delivery colored pill — shown on image */
function HorizontalBadgePill({ badge }: { badge: HorizontalFeatureBadge }) {
  const isStock = badge.type === 'stock'
  const pillClass = stockVariantStyle(badge.type, badge.label)
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold font-['Inter'] ${pillClass}`}>
      {isStock && (
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${stockDotColor(badge.label)}`} aria-hidden />
      )}
      {badge.type === 'delivery' && <Clock size={11} aria-hidden />}
      {badge.label}
    </span>
  )
}

/** Transport / install / reduceri — compact icon + text, no background */
function HorizontalFeatureItem({ badge, showDivider }: { badge: HorizontalFeatureBadge; showDivider: boolean }) {
  const Icon =
    badge.type === 'transport' ? Truck :
    badge.type === 'install' ? Wrench :
    Tag

  const iconColor =
    badge.type === 'transport' ? 'text-teal-600' :
    badge.type === 'install' ? 'text-indigo-500' :
    'text-violet-500'

  const textColor =
    badge.type === 'transport' ? 'text-teal-700' :
    badge.type === 'install' ? 'text-indigo-700' :
    'text-violet-700'

  return (
    <span className="inline-flex items-center gap-1.5 shrink-0">
      <Icon size={13} className={`shrink-0 ${iconColor}`} aria-hidden />
      <span className={`text-xs font-semibold font-['Inter'] ${textColor}`}>{badge.label}</span>
      {showDivider && <span className="text-neutral-300 text-xs" aria-hidden>·</span>}
    </span>
  )
}

export function CatalogProductCardSkeleton({
  density = 'produse',
}: {
  density?: CatalogProductCardDensity
}) {
  if (density === 'home') {
    return (
      <div className="flex flex-col items-center overflow-hidden rounded-[10px] bg-[#f7f7f7] pb-6 animate-pulse">
        <div className="flex h-44 w-full items-center justify-center overflow-hidden rounded-t-[10px] bg-[#f7f7f7]">
          <img
            src="/images/shared/baterino-logo-black.svg"
            alt=""
            className="w-24 h-12 object-contain opacity-30"
            aria-hidden
          />
        </div>
        <div className="flex w-full flex-col items-center px-6 pt-8">
          <div className="w-40 h-5 bg-neutral-200 rounded mb-3" />
          <div className="w-full h-4 bg-neutral-200 rounded mb-1" />
          <div className="w-full h-4 bg-neutral-200 rounded mb-2" />
          <div className="h-3 w-16 rounded bg-neutral-300 mb-1" />
          <div className="w-36 h-8 bg-neutral-200 rounded mb-1" />
          <div className="h-3 w-28 rounded bg-neutral-300" />
        </div>
      </div>
    )
  }

  if (density === 'partner') {
    return (
      <div className="flex min-h-[340px] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-[#f7f7f7] animate-pulse">
        <div className="w-full">
          <div className="flex h-44 w-full items-center justify-center overflow-hidden rounded-t-xl bg-[#f7f7f7]">
            <img
              src="/images/shared/baterino-logo-black.svg"
              alt=""
              className="w-28 h-14 object-contain opacity-30"
              aria-hidden
            />
          </div>
        </div>
        <div className="flex flex-1 flex-col px-4 pt-3">
          <div className="mx-auto h-5 w-full max-w-[90%] rounded bg-neutral-200" />
          <div className="mx-auto mt-3 h-3 w-full max-w-[85%] rounded bg-neutral-200/80" />
          <div className="mx-auto mt-2 h-3 w-2/3 rounded bg-neutral-200/80" />
          <div className="mx-auto mt-4 h-6 w-24 rounded bg-neutral-200" />
        </div>
        <div className="space-y-3 px-4 pb-4">
          <div className="flex justify-center gap-2 rounded-lg bg-[#f7f7f7] p-3">
            <div className="h-9 w-9 rounded-lg bg-neutral-200" />
            <div className="h-9 w-6 bg-neutral-200/80 rounded" />
            <div className="h-9 w-9 rounded-lg bg-neutral-200" />
          </div>
          <div className="h-10 w-full rounded-lg bg-neutral-200" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-[10px] bg-[#f7f7f7] pb-8 animate-pulse">
      <div className="w-full">
        <div className="h-56 w-full overflow-hidden rounded-t-[10px] bg-[#f7f7f7]">
          <div className="flex h-full w-full items-center justify-center">
            <img
              src="/images/shared/baterino-logo-black.svg"
              alt=""
              className="h-14 w-28 object-contain opacity-30"
              aria-hidden
            />
          </div>
        </div>
      </div>
      <div className="mx-auto mt-4 h-5 w-48 max-w-[calc(100%-2rem)] rounded bg-neutral-200" />
      <div className="mx-auto mt-3 h-4 w-56 max-w-[calc(100%-2rem)] rounded bg-neutral-200" />
      <div className="mx-auto mt-2 h-4 w-52 max-w-[calc(100%-2rem)] rounded bg-neutral-200" />
      <div className="mx-auto mt-5 flex flex-col items-center gap-1">
        <div className="h-3 w-14 rounded bg-neutral-300" />
        <div className="h-8 w-36 max-w-[calc(100%-2rem)] rounded bg-neutral-200" />
        <div className="h-3 w-32 rounded bg-neutral-300" />
      </div>
    </div>
  )
}
