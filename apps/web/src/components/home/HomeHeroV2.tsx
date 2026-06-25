import { useState, useRef, useEffect, useMemo, useCallback, type CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BadgePercent, Headphones, ShieldCheck, Truck, type LucideIcon } from 'lucide-react'
import HomeHeroPromoOfferCard from './HomeHeroPromoOfferCard'
import HomeHeroMedCard from './HomeHeroMedCard'
import HomeHeroInstCard from './HomeHeroInstCard'
import type { HomeTranslations } from '../../i18n/home'
import { useHorizontalDragScroll } from '../../lib/useHorizontalDragScroll'
import { smoothScrollTo } from '../../lib/smoothHorizontalScroll'

/** Fluid card sizes — scale with viewport between mobile min and desktop max. */
const HERO_CARD_CSS_VARS = {
  '--hero-card-w': 'clamp(200px, 28vw, 400px)',
  '--hero-card-w-wide': 'clamp(240px, 55.6vw, 800px)',
  '--hero-card-h': '520px',
  '--hero-card-gap': 'clamp(8px, 1vw, 10px)',
} as CSSProperties

const CARD_COUNT = 5

function getCardElements(el: HTMLDivElement): HTMLElement[] {
  return Array.from(el.children).filter(
    (node): node is HTMLElement => node instanceof HTMLElement && node.getAttribute('aria-hidden') !== 'true',
  )
}

function getSliderScrollBounds(el: HTMLDivElement): { min: number; max: number } {
  const cards = getCardElements(el)
  if (cards.length === 0) return { min: 0, max: 0 }

  const style = getComputedStyle(el)
  const padLeft = parseFloat(style.paddingLeft) || 0
  const padRight = parseFloat(style.paddingRight) || 0

  const first = cards[0]
  const last = cards[cards.length - 1]
  const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth)

  // Hard stops: don't scroll past first/last card into empty space.
  const min = Math.max(0, first.offsetLeft - padLeft)
  const maxEnd = last.offsetLeft + last.offsetWidth + padRight - el.clientWidth
  const max = Math.min(maxScroll, Math.max(min, maxEnd))

  return { min, max }
}

function getSnapTargetForCard(el: HTMLDivElement, index: number): number {
  const cards = getCardElements(el)
  const card = cards[index]
  if (!card) return 0
  const { min, max } = getSliderScrollBounds(el)

  if (index === 0) return min
  if (index === cards.length - 1) return max

  const centerTarget = card.offsetLeft + card.offsetWidth / 2 - el.clientWidth / 2
  return Math.min(max, Math.max(min, centerTarget))
}

function clampSliderScroll(el: HTMLDivElement) {
  const { min, max } = getSliderScrollBounds(el)
  if (el.scrollLeft < min) el.scrollLeft = min
  else if (el.scrollLeft > max) el.scrollLeft = max
}

function scrollToCard(el: HTMLDivElement, index: number, onComplete?: () => void) {
  const card = getCardElements(el)[index]
  if (!card) return
  const { min, max } = getSliderScrollBounds(el)
  const target = getSnapTargetForCard(el, index)
  return smoothScrollTo(el, target, 480, min, max, onComplete)
}

function getNearestCardIndex(el: HTMLDivElement): number {
  const cards = getCardElements(el)
  if (cards.length === 0) return 0

  const { min, max } = getSliderScrollBounds(el)
  const scroll = el.scrollLeft
  if (scroll <= min + 4) return 0
  if (scroll >= max - 4) return cards.length - 1

  // Zone-based: pick the card whose snap position we're closest to (not viewport center).
  // Viewport-center snap wrongly favored wide card 1 over card 0 near scrollLeft ≈ 0,
  // pushing the first card off-screen when dragging right.
  const targets = cards.map((_, i) => getSnapTargetForCard(el, i))
  for (let i = 0; i < targets.length - 1; i++) {
    const mid = (targets[i] + targets[i + 1]) / 2
    if (scroll < mid) return i
  }
  return cards.length - 1
}

type HeroV2CardId = 'oferta' | 'rezidential' | 'reduceri' | 'bess' | 'proiecte' | 'instalatori'

type HomeHeroV2Props = {
  tr: HomeTranslations
  userType: 'profesionist' | 'client' | null
}

function HeroListDot({ light = false }: { light?: boolean }) {
  return (
    <span
      className={`mt-[0.45rem] size-1 shrink-0 rounded-full ${light ? 'bg-white/70' : 'bg-slate-400'}`}
      aria-hidden
    />
  )
}


const CARD_ORDER: HeroV2CardId[] = ['oferta', 'reduceri', 'bess', 'proiecte', 'instalatori']

/** Homepage hero v2 — fluid card slider; sizes scale with viewport (clamp). */
export default function HomeHeroV2({ tr, userType }: HomeHeroV2Props) {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)
  const scrollAnimRef = useRef<{ cancel: () => void } | null>(null)
  const isScrollAnimatingRef = useRef(false)
  const snapIdleTimerRef = useRef<number | null>(null)

  const getScrollBounds = useCallback(() => {
    const el = sliderRef.current
    if (!el) return { min: 0, max: 0 }
    return getSliderScrollBounds(el)
  }, [])

  const cards = useMemo(() => {
    const base: {
      id: HeroV2CardId
      title: string
      subtitle?: string
      buttonLabel: string
      image: string
      to?: string
      scrollToProducts?: boolean
      multilineTitle?: boolean
      wide?: boolean
      noOverlay?: boolean
      /** Residential card: product title, badges, price and order CTA on the right. */
      productHeroOverlay?: boolean
      /** July promo offer — split image/details card (same as welcome modal). */
      promoOfferHeroOverlay?: boolean
      /** Discount card: structured overlay with eligible groups. */
      discountHeroOverlay?: boolean
      /** Medical card: BESS Cabinet product overlay. */
      medicalHeroOverlay?: boolean
      /** Instalatori card: partner programme overlay. */
      instalatoriHeroOverlay?: boolean
      /** Show title/button but skip the dark tint (e.g. instalatori). */
      noDarkOverlay?: boolean
      width?: string
      height?: string
    }[] = [
      {
        id: 'oferta',
        title: tr.promoModalTitleLine1,
        buttonLabel: tr.promoModalCtaPrimary,
        image: '/images/home/offer-baterino.jpg',
        to: '/produse/baterii-solare/20kwh-2-x-10kwh-ecohome-10-10kwh',
        promoOfferHeroOverlay: true,
        width: '800px',
        noDarkOverlay: true,
      },
      {
        id: 'reduceri',
        title: tr.heroV2Card2Title,
        subtitle: tr.heroV2Card2Subtitle,
        buttonLabel: tr.heroV2Card2Cta,
        image: '/images/slider2/slide1.jpg',
        to: '/reduceri',
        discountHeroOverlay: true,
        width: '400px',
        height: '520px',
        noDarkOverlay: true,
      },
      {
        id: 'rezidential',
        title: tr.heroMobile0Title,
        buttonLabel: tr.heroCardCta,
        image: '/images/slider2/slide2.jpg',
        productHeroOverlay: true,
        noDarkOverlay: true,
        width: '600px',
      },
      {
        id: 'bess',
        title: tr.heroV2MedProductTitle,
        buttonLabel: tr.heroV2MedCta,
        image: '/images/slider2/slide4-261kwh-bess.jpg',
        to: '/divizii/medical',
        medicalHeroOverlay: true,
        width: '800px',
        noDarkOverlay: true,
      },
      {
        id: 'proiecte',
        title: tr.heroV2Card3Title,
        subtitle: tr.heroV2Card3Subtitle,
        buttonLabel: tr.heroV2Card3Cta,
        image: '/images/slider2/slider3.jpg',
        to: '/studii-de-caz',
        multilineTitle: true,
        width: '400px',
        height: '520px',
        noDarkOverlay: true,
      },
      {
        id: 'instalatori',
        title: tr.heroV2InstTitle,
        buttonLabel: tr.heroV2InstCta,
        image: '/images/home/slider-apple/slide4-instalatori.jpg',
        to: '/instalatori',
        instalatoriHeroOverlay: true,
        noDarkOverlay: true,
        width: '800px',
      },
    ]
    return CARD_ORDER.map((id) => base.find((c) => c.id === id)!)
  }, [tr])

  const cancelScrollAnimation = useCallback(() => {
    scrollAnimRef.current?.cancel()
    scrollAnimRef.current = null
    isScrollAnimatingRef.current = false
  }, [])

  const snapToNearest = useCallback(() => {
    const el = sliderRef.current
    if (!el) return
    const index = getNearestCardIndex(el)
    const target = getSnapTargetForCard(el, index)
    setActiveIndex(index)
    if (Math.abs(el.scrollLeft - target) < 2) {
      clampSliderScroll(el)
      return
    }
    cancelScrollAnimation()
    isScrollAnimatingRef.current = true
    scrollAnimRef.current =
      scrollToCard(el, index, () => {
        scrollAnimRef.current = null
        isScrollAnimatingRef.current = false
        clampSliderScroll(el)
      }) ?? null
  }, [cancelScrollAnimation])

  const handleDragStart = useCallback(() => {
    cancelScrollAnimation()
    if (snapIdleTimerRef.current != null) {
      window.clearTimeout(snapIdleTimerRef.current)
      snapIdleTimerRef.current = null
    }
  }, [cancelScrollAnimation])

  const handleDragEnd = useCallback(
    (wasDragged: boolean) => {
      if (!wasDragged) return
      const el = sliderRef.current
      if (el) clampSliderScroll(el)
      snapToNearest()
    },
    [snapToNearest],
  )

  const { isDragging, isDraggingRef, isMomentumRef, onPointerDown } = useHorizontalDragScroll(
    sliderRef,
    { onDragStart: handleDragStart, onDragEnd: handleDragEnd, getScrollBounds },
  )

  useEffect(() => {
    return () => cancelScrollAnimation()
  }, [cancelScrollAnimation])

  useEffect(() => {
    const el = sliderRef.current
    if (!el) return
    const sync = () => {
      if (!sliderRef.current) return
      clampSliderScroll(sliderRef.current)
    }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    getCardElements(el).forEach((card) => ro.observe(card))
    window.addEventListener('resize', sync)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', sync)
    }
  }, [cards])

  useEffect(() => {
    const el = sliderRef.current
    if (!el) return

    const scheduleSnapAfterIdleScroll = () => {
      if (snapIdleTimerRef.current != null) window.clearTimeout(snapIdleTimerRef.current)
      snapIdleTimerRef.current = window.setTimeout(() => {
        snapIdleTimerRef.current = null
        if (isDraggingRef.current || isScrollAnimatingRef.current || isMomentumRef.current || !sliderRef.current) return
        snapToNearest()
      }, 140)
    }

    let ticking = false
    const onScroll = () => {
      if (isDraggingRef.current || isScrollAnimatingRef.current || isMomentumRef.current || ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        if (isDraggingRef.current || isScrollAnimatingRef.current || isMomentumRef.current || !sliderRef.current) return
        setActiveIndex(getNearestCardIndex(sliderRef.current))
        scheduleSnapAfterIdleScroll()
      })
    }

    const onScrollEnd = () => {
      if (isDraggingRef.current || isScrollAnimatingRef.current || isMomentumRef.current || !sliderRef.current) return
      if (snapIdleTimerRef.current != null) {
        window.clearTimeout(snapIdleTimerRef.current)
        snapIdleTimerRef.current = null
      }
      snapToNearest()
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('scrollend', onScrollEnd)
    return () => {
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('scrollend', onScrollEnd)
      if (snapIdleTimerRef.current != null) window.clearTimeout(snapIdleTimerRef.current)
    }
  }, [isDraggingRef, isMomentumRef, snapToNearest])

  useEffect(() => {
    const el = sliderRef.current
    if (!el) return
    el.scrollTo({ left: 0, behavior: 'auto' })
    setActiveIndex(0)
  }, [userType])

  const scrollToIndex = (index: number) => {
    const el = sliderRef.current
    if (!el) return
    cancelScrollAnimation()
    isScrollAnimatingRef.current = true
    scrollAnimRef.current =
      scrollToCard(el, index, () => {
        scrollAnimRef.current = null
        isScrollAnimatingRef.current = false
        clampSliderScroll(el)
      }) ?? null
    setActiveIndex(index)
  }

  const handleNoOverlayCardActivate = useCallback(
    (card: (typeof cards)[number]) => {
      if (card.scrollToProducts) {
        document.getElementById('produse-section')?.scrollIntoView({ behavior: 'smooth' })
      } else if (card.to) {
        navigate(card.to)
      }
    },
    [navigate],
  )

  const isNoOverlayInteractive = (card: (typeof cards)[number]) =>
    card.noOverlay && (card.scrollToProducts || card.to)

  const showProductHeroOverlay = (card: (typeof cards)[number]) =>
    card.id === 'rezidential' && card.productHeroOverlay === true

  const showPromoOfferHeroOverlay = (card: (typeof cards)[number]) =>
    card.id === 'oferta' && card.promoOfferHeroOverlay === true

  const showDiscountHeroOverlay = (card: (typeof cards)[number]) =>
    card.id === 'reduceri' && card.discountHeroOverlay === true

  const showMedicalHeroOverlay = (card: (typeof cards)[number]) =>
    card.id === 'bess' && card.medicalHeroOverlay === true

  const showInstalatoriHeroOverlay = (card: (typeof cards)[number]) =>
    card.id === 'instalatori' && card.instalatoriHeroOverlay === true

  const showCardContent = (card: (typeof cards)[number]) =>
    !card.noOverlay &&
    !showProductHeroOverlay(card) &&
    !showPromoOfferHeroOverlay(card) &&
    !showDiscountHeroOverlay(card) &&
    !showMedicalHeroOverlay(card) &&
    !showInstalatoriHeroOverlay(card)
  const showDarkOverlay = (card: (typeof cards)[number]) => !card.noOverlay && !card.noDarkOverlay


  const rezHighlights = useMemo(
    () => [
      tr.heroV2RezBadgeGarantie,
      tr.heroV2RezBadgeService,
      tr.heroV2RezBadgeSwap,
      tr.heroV2RezBadgeReduceri,
    ],
    [
      tr.heroV2RezBadgeGarantie,
      tr.heroV2RezBadgeService,
      tr.heroV2RezBadgeSwap,
      tr.heroV2RezBadgeReduceri,
    ],
  )

  return (
    <section className="mb-16 lg:mb-24 w-full" aria-label="Hero" style={HERO_CARD_CSS_VARS}>
      <header className="mb-8 lg:mb-10 px-5 lg:px-0 text-center max-w-content mx-auto">
        <h2 className="text-black text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Inter'] leading-tight max-w-4xl mx-auto uppercase mb-3 whitespace-pre-line">
          {tr.heroV2Title}
        </h2>
        <p className="text-gray-500 text-base sm:text-lg font-normal font-['Inter'] leading-7">
          {tr.heroV2Subtitle}
        </p>
      </header>

      <div
        ref={sliderRef}
        onPointerDown={onPointerDown}
        className={`flex w-full overflow-x-auto overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-4 gap-[var(--hero-card-gap)] px-[100px] ${
          isDragging ? 'cursor-grabbing select-none scroll-auto' : 'cursor-grab scroll-auto'
        }`}
      >
        {cards.map((card, i) => (
          <div
            key={card.id}
            role={isNoOverlayInteractive(card) ? 'button' : undefined}
            tabIndex={isNoOverlayInteractive(card) ? 0 : undefined}
            onClick={
              isNoOverlayInteractive(card) && !isDraggingRef.current
                ? () => handleNoOverlayCardActivate(card)
                : undefined
            }
            onKeyDown={
              isNoOverlayInteractive(card)
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleNoOverlayCardActivate(card)
                    }
                  }
                : undefined
            }
            className={`group relative flex-shrink-0 overflow-hidden transition-shadow duration-300 hover:shadow-[0_6px_20px_rgba(0,0,0,0.28)] ${
              showProductHeroOverlay(card) ||
              showMedicalHeroOverlay(card) ||
              showInstalatoriHeroOverlay(card) ||
              showPromoOfferHeroOverlay(card)
                ? 'rounded-xl bg-white'
                : 'rounded-[10px] bg-zinc-300'
            } ${
              card.height ? '' : 'h-[var(--hero-card-h)]'
            } ${
              card.width ? '' : card.wide ? 'w-[var(--hero-card-w-wide)]' : 'w-[var(--hero-card-w)]'
            } ${
              isNoOverlayInteractive(card) ? 'cursor-pointer' : ''
            }`}
            style={{
              ...(card.width ? { width: card.width } : {}),
              ...(card.height ? { height: card.height } : {}),
            }}
          >
            {!showPromoOfferHeroOverlay(card) ? (
              <img
                src={card.image}
                alt={card.title.replace(/\n/g, ' ')}
                draggable={false}
                fetchPriority={i === 0 ? 'high' : undefined}
                className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${
                  showProductHeroOverlay(card) || showMedicalHeroOverlay(card) || showInstalatoriHeroOverlay(card)
                    ? 'object-[right_center]'
                    : ''
                }`}
              />
            ) : null}
            {!showDarkOverlay(card) ? null : <div className="absolute inset-0 bg-black/45 pointer-events-none" />}
            {showPromoOfferHeroOverlay(card) ? (
              <HomeHeroPromoOfferCard
                tr={tr}
                isDragging={isDragging}
                productLink={card.to ?? '/produse/baterii-solare/20kwh-2-x-10kwh-ecohome-10-10kwh'}
              />
            ) : showProductHeroOverlay(card) ? (
              <>
                <div
                  className="absolute inset-0 pointer-events-none rounded-xl"
                  style={{
                    background:
                      'linear-gradient(to right, rgba(0, 0, 0, 0.62) 0%, rgba(0, 0, 0, 0.38) 46%, rgba(0, 0, 0, 0.08) 58%, transparent 68%)',
                  }}
                  aria-hidden
                />
                <span className="absolute top-4 right-4 z-[3] inline-flex rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-black font-['Inter'] [text-shadow:none] pointer-events-none">
                  {tr.heroV2MedStockTag}
                </span>
                <div
                  className="absolute inset-y-0 left-0 z-[2] flex h-full w-[54%] min-w-0 flex-col justify-center px-8 py-8 pointer-events-none [text-shadow:0_1px_3px_rgba(0,0,0,0.85),0_2px_10px_rgba(0,0,0,0.45)]"
                >
                  <p className="mb-2 text-xs font-medium text-white/75 font-['Inter']">
                    {tr.heroV2RezProductSubtitle}
                  </p>
                  <h3 className="m-0 text-[clamp(1.5rem,2.3vw,1.875rem)] font-bold leading-tight text-white font-['Inter']">
                    {tr.heroV2RezProductTitle}
                  </h3>
                  <p className="mt-2 text-sm text-white/80 font-['Inter']">
                    {tr.heroV2RezSpecCicluri}
                    <span className="mx-1.5 text-white/40" aria-hidden>
                      ·
                    </span>
                    {tr.heroV2RezSpecIp}
                    <span className="mx-1.5 text-white/40" aria-hidden>
                      ·
                    </span>
                    {tr.heroV2RezSpecChem}
                  </p>

                  <ul className="mt-4 space-y-2">
                    {rezHighlights.map((label) => (
                      <li key={label} className="flex items-start gap-2.5 text-sm text-white/90 font-['Inter']">
                        <HeroListDot light />
                        {label}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 rounded-md border border-white/30 bg-white/20 px-4 py-3 backdrop-blur-md">
                    <p className="text-xs font-medium text-white/80 font-['Inter']">{tr.heroV2RezPriceLabel}</p>
                    <p className="mt-1 text-[clamp(1.5rem,2.5vw,1.875rem)] font-bold leading-none text-white font-['Inter'] tabular-nums">
                      {tr.heroV2RezHeroPrice}
                    </p>
                    <p className="mt-1.5 text-sm text-white/90 font-['Inter']">{tr.heroV2RezPriceNote}</p>
                  </div>
                </div>
              </>
            ) : showMedicalHeroOverlay(card) ? (
              <HomeHeroMedCard
                tr={tr}
                isDragging={isDragging}
                productLink={card.to ?? '/divizii/medical'}
              />
            ) : showDiscountHeroOverlay(card) ? (
                <div className="absolute inset-x-[clamp(0.75rem,2vw,1rem)] bottom-[clamp(1.25rem,3vh,2rem)] flex flex-col items-center text-center gap-[clamp(0.75rem,1.5vh,1rem)] pointer-events-none">
                  <div className="flex flex-col items-center gap-1 text-center [text-shadow:0_1px_3px_rgba(0,0,0,0.85),0_2px_10px_rgba(0,0,0,0.45)]">
                    <img
                      src="/images/shared/baterino-logo-white.png"
                      alt="Baterino"
                      draggable={false}
                      className="h-5 w-auto max-w-[72%] object-contain pointer-events-none [filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.85))]"
                    />
                    <h3 className="m-0 text-[clamp(1rem,3.2vw,1.375rem)] font-bold leading-tight uppercase text-white font-['Inter']">
                      {tr.heroV2Card2Title}
                    </h3>
                  </div>
                  <p className="text-[clamp(0.875rem,2.75vw,1.125rem)] font-normal leading-snug normal-case text-white max-w-[min(320px,94%)] font-['Inter'] [text-shadow:0_1px_3px_rgba(0,0,0,0.85),0_2px_10px_rgba(0,0,0,0.45)]">
                    {tr.heroV2Card2Subtitle}
                  </p>
                  <div className="flex w-full justify-center">
                    <Link
                      to={card.to!}
                      className={`w-full max-w-[min(200px,70%)] h-[clamp(2rem,4vh,2.5rem)] px-3 bg-white rounded-[8px] inline-flex justify-center items-center text-black text-[clamp(0.625rem,1.75vw,0.75rem)] font-bold font-['Inter'] uppercase [text-shadow:none] hover:bg-neutral-100 active:bg-neutral-200 transition-colors ${
                        isDragging ? 'pointer-events-none' : 'pointer-events-auto'
                      }`}
                    >
                      {tr.heroV2Card2Cta}
                    </Link>
                  </div>
                </div>
            ) : showInstalatoriHeroOverlay(card) ? (
              <HomeHeroInstCard
                tr={tr}
                isDragging={isDragging}
                productLink={card.to ?? '/instalatori'}
              />
            ) : showCardContent(card) ? (
            <div className={`absolute inset-x-[clamp(0.75rem,2vw,1rem)] bottom-[clamp(1.25rem,3vh,2rem)] flex flex-col items-center text-center gap-[clamp(0.75rem,1.5vh,1rem)] ${isDragging ? 'pointer-events-none' : ''}`}>
              {card.id === 'proiecte' ? (
                <div className="flex flex-col items-center gap-1 text-center">
                  <img
                    src="/images/lithtech/logo-baterino-pro-white.png"
                    alt="Baterino Pro"
                    draggable={false}
                    className="h-5 w-auto max-w-[72%] object-contain pointer-events-none [filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.85))]"
                  />
                  <h3
                    className={`m-0 text-white font-bold font-['Inter'] leading-tight uppercase whitespace-pre-line ${
                      card.subtitle
                        ? 'text-[clamp(1rem,3.2vw,1.375rem)]'
                        : 'text-[clamp(0.6875rem,2.2vw,0.9375rem)]'
                    }`}
                  >
                    {card.title}
                  </h3>
                </div>
              ) : (
                <h3
                  className={`text-white font-bold font-['Inter'] leading-tight uppercase ${
                    card.subtitle
                      ? 'text-[clamp(1rem,3.2vw,1.375rem)]'
                      : 'text-[clamp(0.6875rem,2.2vw,0.9375rem)]'
                  } ${card.multilineTitle ? 'whitespace-pre-line' : ''}`}
                >
                  {card.title}
                </h3>
              )}
              {card.subtitle ? (
                <p
                  className={`text-white text-[clamp(0.875rem,2.75vw,1.125rem)] font-normal font-['Inter'] leading-snug normal-case max-w-[min(320px,94%)] ${
                    card.id === 'proiecte' ? 'whitespace-pre-line' : ''
                  }`}
                >
                  {card.subtitle}
                </p>
              ) : null}
              {card.scrollToProducts ? (
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById('produse-section')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="w-full max-w-[min(200px,70%)] h-[clamp(2rem,4vh,2.5rem)] px-3 bg-white rounded-[8px] inline-flex justify-center items-center text-black text-[clamp(0.625rem,1.75vw,0.75rem)] font-bold font-['Inter'] uppercase hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
                >
                  {card.buttonLabel}
                </button>
              ) : (
                <div className="flex w-full justify-center">
                  <Link
                    to={card.to!}
                    className="w-full max-w-[min(200px,70%)] h-[clamp(2rem,4vh,2.5rem)] px-3 bg-white rounded-[8px] inline-flex justify-center items-center text-black text-[clamp(0.625rem,1.75vw,0.75rem)] font-bold font-['Inter'] uppercase hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
                  >
                    {card.buttonLabel}
                  </Link>
                </div>
              )}
            </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-5">
        {Array.from({ length: CARD_COUNT }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollToIndex(i)}
            aria-label={`Slide ${i + 1}`}
            aria-current={i === activeIndex ? 'true' : undefined}
            className={`size-2.5 rounded-full transition-colors ${i === activeIndex ? 'bg-black' : 'bg-black/30'}`}
          />
        ))}
      </div>
    </section>
  )
}
