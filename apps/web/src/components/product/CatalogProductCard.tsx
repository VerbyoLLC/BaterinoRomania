import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

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
  shellClassName = '',
}: CatalogProductCardProps) {
  const isProduseDensity = density === 'produse'
  const isPartnerDensity = density === 'partner'
  const isIndustrial = variant === 'industrial'
  const partnerMode = footer != null && typeof onMainClick === 'function'
  if (!partnerMode && !to) {
    throw new Error('CatalogProductCard: `to` is required unless using partner mode (`footer` + `onMainClick`).')
  }
  if (!partnerMode && isIndustrial && (!ctaLabel || !String(ctaLabel).trim())) {
    throw new Error('CatalogProductCard: industrial cards require `ctaLabel` for the bottom CTA.')
  }
  const subtitleLine = isIndustrial ? String(subtitle ?? '').trim() : ''
  const showSubtitle = Boolean(subtitleLine)
  const [imgLoaded, setImgLoaded] = useState(!imageLoadingPlaceholder)

  const shellPb = partnerMode
    ? 'pb-0'
    : isIndustrial
      ? (isProduseDensity ? 'pb-8' : 'pb-6')
      : (isProduseDensity ? 'pb-5' : 'pb-4')
  const imageFrameH = isPartnerDensity ? 'h-44' : 'h-56'
  const imageTopRadius = isPartnerDensity ? 'rounded-t-xl' : 'rounded-t-[10px]'

  let titleClass: string
  let specClass: string
  let firstSpecMargin: string
  let secondSpecMargin: string
  let btnMax: string

  if (isPartnerDensity) {
    titleClass =
      "mt-3 w-full max-w-full px-4 text-center text-base font-bold font-['Inter'] text-black leading-snug line-clamp-2"
    specClass = "text-center text-sm font-normal font-['Inter'] leading-snug text-gray-500"
    firstSpecMargin = 'mt-2'
    secondSpecMargin = 'mt-1 mb-1'
    btnMax = ''
  } else if (isProduseDensity) {
    titleClass =
      "mt-4 w-full max-w-full px-4 text-center text-xl font-bold font-['Inter'] text-black leading-6"
    specClass =
      "text-center text-base font-normal font-['Nunito_Sans'] leading-7 tracking-tight text-neutral-950"
    firstSpecMargin = 'mt-1.5'
    secondSpecMargin = ''
    btnMax = 'max-w-[220px] mt-8'
  } else {
    titleClass =
      "mb-3 mt-6 px-6 text-center text-lg font-bold font-['Inter'] leading-snug text-black"
    specClass = "px-6 text-center text-sm font-normal font-['Nunito_Sans'] leading-6 text-neutral-950"
    firstSpecMargin = ''
    secondSpecMargin = 'mb-4'
    btnMax = 'max-w-[200px]'
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
        className={`relative ${imageFrameH} w-full overflow-hidden ${imageTopRadius} border-b border-neutral-200 bg-[#f7f7f7] ${
          isIndustrial ? 'flex items-center justify-center' : ''
        }`}
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
          className={`transition-all duration-300 ${
            partnerMode ? 'transition-transform duration-200 group-hover:scale-105' : ''
          } ${
            isIndustrial
              ? 'h-full w-full max-h-full max-w-full object-contain object-center'
              : 'h-full w-full object-cover object-center'
          } ${imageLoadingPlaceholder && !imgLoaded ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            setImgLoaded(true)
          }}
        />
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

  const metaBlock = (
    <>
      {!isIndustrial ? (
        <>
          <p className={`${specClass} ${specLine1Margin}`.trim()}>{specLine1}</p>
          <p className={`${specClass} ${secondSpecMargin}`.trim()}>{specLine2}</p>
        </>
      ) : null}
      {showDarkListingChip ? (
        <div className={`${priceMarginTop} flex w-full max-w-full flex-col items-center px-2`}>
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
          <div className={`${priceMarginTop} flex w-full max-w-full flex-col items-center px-2`}>
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
            className={`${priceMarginTop} text-center text-lg font-bold font-['Inter'] tracking-tight text-slate-900 tabular-nums`}
          >
            {priceDisplay}
          </p>
        )
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
      ) : isIndustrial && ctaLabel ? (
        <Link
          to={to!}
          state={linkState}
          className={`mx-auto w-full ${btnMax} py-2.5 px-4 bg-slate-900 text-white text-sm font-semibold font-['Inter'] rounded-[10px] hover:bg-slate-700 transition-colors text-center uppercase tracking-wide`}
        >
          {ctaLabel}
        </Link>
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

export function CatalogProductCardSkeleton({
  density = 'produse',
}: {
  density?: CatalogProductCardDensity
}) {
  if (density === 'home') {
    return (
      <div className="flex flex-col items-center overflow-hidden rounded-[10px] bg-[#f7f7f7] pb-6 animate-pulse">
        <div className="flex h-44 w-full items-center justify-center overflow-hidden rounded-t-[10px] border-b border-neutral-200 bg-[#f7f7f7]">
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
          <div className="flex h-44 w-full items-center justify-center overflow-hidden rounded-t-xl border-b border-neutral-200 bg-[#f7f7f7]">
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
        <div className="h-56 w-full overflow-hidden rounded-t-[10px] border-b border-neutral-200 bg-[#f7f7f7]">
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
