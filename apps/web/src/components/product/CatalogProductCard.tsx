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
   * Default catalog CTA — required unless `footer` + `onMainClick` (partner mode).
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
  shellClassName = '',
}: CatalogProductCardProps) {
  const partnerMode = footer != null && typeof onMainClick === 'function'
  if (!partnerMode && (!to || !ctaLabel)) {
    throw new Error('CatalogProductCard: `to` and `ctaLabel` are required unless using partner mode (`footer` + `onMainClick`).')
  }

  const isProduseDensity = density === 'produse'
  const isPartnerDensity = density === 'partner'
  const isIndustrial = variant === 'industrial'
  const subtitleLine = isIndustrial ? String(subtitle ?? '').trim() : ''
  const showSubtitle = Boolean(subtitleLine)
  const [imgLoaded, setImgLoaded] = useState(!imageLoadingPlaceholder)

  const shellPb = partnerMode ? 'pb-0' : isProduseDensity ? 'pb-8' : 'pb-6'
  const imageFrameH = isPartnerDensity ? 'h-44' : 'h-56'

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

  const imageBlock = (
    <div className="w-full px-3">
      <div
        className={`relative ${imageFrameH} w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 ${
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
              ? 'max-h-full max-w-full object-contain object-center p-3'
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

  const metaBlock = (
    <>
      {!isIndustrial ? (
        <>
          <p className={`${specClass} ${specLine1Margin}`.trim()}>{specLine1}</p>
          <p className={`${specClass} ${secondSpecMargin}`.trim()}>{specLine2}</p>
        </>
      ) : null}
      {priceDisplay != null && priceDisplay !== '' ? (
        <p
          className={`${priceMarginTop} text-center text-lg font-bold font-['Inter'] tracking-tight text-slate-900 tabular-nums`}
        >
          {priceDisplay}
        </p>
      ) : null}
    </>
  )

  const mainClassName = `flex w-full flex-col items-center ${partnerMode ? 'group flex-1 min-h-0 cursor-pointer' : ''}`

  const mainInner = (
    <>
      {imageBlock}
      <h3 className={titleClass}>{title}</h3>
      {showSubtitle ? <p className={subtitleClass}>{subtitleLine}</p> : null}
      {metaBlock}
    </>
  )

  const defaultShell =
    `flex flex-col overflow-hidden bg-neutral-100 pt-[10px] ${shellPb} transition-shadow duration-300 ` +
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
      ) : (
        <Link
          to={to!}
          state={linkState}
          className={`mx-auto w-full ${btnMax} py-2.5 px-4 bg-slate-900 text-white text-sm font-semibold font-['Inter'] rounded-[10px] hover:bg-slate-700 transition-colors text-center uppercase tracking-wide`}
        >
          {ctaLabel}
        </Link>
      )}
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
      <div className="flex flex-col items-center bg-neutral-100 rounded-[10px] px-6 pt-8 pb-6 animate-pulse">
        <div className="mb-5 flex w-36 h-44 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
          <img
            src="/images/shared/baterino-logo-black.svg"
            alt=""
            className="w-24 h-12 object-contain opacity-30"
            aria-hidden
          />
        </div>
        <div className="w-40 h-5 bg-neutral-200 rounded mb-3" />
        <div className="w-full h-4 bg-neutral-200 rounded mb-1" />
        <div className="w-full h-4 bg-neutral-200 rounded mb-4" />
        <div className="w-40 h-9 bg-neutral-200 rounded" />
      </div>
    )
  }

  if (density === 'partner') {
    return (
      <div className="flex min-h-[340px] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 animate-pulse">
        <div className="w-full px-3 pt-[10px]">
          <div className="flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
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
          <div className="mx-auto mt-3 h-3 w-full max-w-[85%] rounded bg-neutral-100" />
          <div className="mx-auto mt-2 h-3 w-2/3 rounded bg-neutral-100" />
          <div className="mx-auto mt-4 h-6 w-24 rounded bg-neutral-200" />
        </div>
        <div className="space-y-3 px-4 pb-4">
          <div className="flex justify-center gap-2 rounded-lg bg-[#f7f7f7] p-3">
            <div className="h-9 w-9 rounded-lg bg-neutral-200" />
            <div className="h-9 w-6 bg-neutral-100 rounded" />
            <div className="h-9 w-9 rounded-lg bg-neutral-200" />
          </div>
          <div className="h-10 w-full rounded-lg bg-neutral-200" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-[10px] bg-neutral-100 pt-[10px] pb-8 animate-pulse">
      <div className="w-full px-3">
        <div className="h-56 w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
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
      <div className="mx-auto mt-8 h-9 w-40 max-w-[220px] rounded bg-neutral-200" />
    </div>
  )
}
