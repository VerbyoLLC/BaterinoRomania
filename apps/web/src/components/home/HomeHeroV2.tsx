import { useState, useRef, useEffect, useMemo, useCallback, type CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BadgePercent, Headphones, ShieldCheck, Truck, type LucideIcon } from 'lucide-react'
import type { HomeTranslations } from '../../i18n/home'
import { useHorizontalDragScroll } from '../../lib/useHorizontalDragScroll'
import { smoothScrollTo } from '../../lib/smoothHorizontalScroll'

/** Fluid card sizes — scale with viewport between mobile min and desktop max. */
const HERO_CARD_CSS_VARS = {
  '--hero-card-w': 'clamp(200px, 28vw, 400px)',
  '--hero-card-w-wide': 'clamp(240px, 50.4vw, 720px)',
  '--hero-card-h': '450px',
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

type HeroV2CardId = 'rezidential' | 'industrial' | 'medical' | 'maritim' | 'instalatori'

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

const INST_BENEFIT_ICONS: LucideIcon[] = [BadgePercent, ShieldCheck, Truck, Headphones]

const CARD_ORDER: HeroV2CardId[] = ['industrial', 'rezidential', 'maritim', 'medical', 'instalatori']

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
        id: 'rezidential',
        title: tr.heroMobile0Title,
        buttonLabel: tr.heroCardCta,
        image: '/images/slider2/slide2.jpg',
        productHeroOverlay: true,
        noDarkOverlay: true,
        width: '600px',
      },
      {
        id: 'industrial',
        title: tr.heroV2Card2Title,
        subtitle: tr.heroV2Card2Subtitle,
        buttonLabel: tr.heroV2Card2Cta,
        image: '/images/slider2/slide1.jpg',
        to: '/reduceri',
        discountHeroOverlay: true,
        width: '300px',
        height: '450px',
        noDarkOverlay: true,
      },
      {
        id: 'medical',
        title: tr.heroV2MedProductTitle,
        buttonLabel: tr.heroV2MedCta,
        image: '/images/slider2/slide4-261kwh-bess.jpg',
        to: '/divizii/medical',
        medicalHeroOverlay: true,
        width: '600px',
        noDarkOverlay: true,
      },
      {
        id: 'maritim',
        title: tr.heroV2Card3Title,
        subtitle: tr.heroV2Card3Subtitle,
        buttonLabel: tr.heroV2Card3Cta,
        image: '/images/slider2/slider3.jpg',
        to: '/studii-de-caz',
        multilineTitle: true,
        width: '300px',
        height: '450px',
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
        width: '600px',
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

  const showDiscountHeroOverlay = (card: (typeof cards)[number]) =>
    card.id === 'industrial' && card.discountHeroOverlay === true

  const showMedicalHeroOverlay = (card: (typeof cards)[number]) =>
    card.id === 'medical' && card.medicalHeroOverlay === true

  const showInstalatoriHeroOverlay = (card: (typeof cards)[number]) =>
    card.id === 'instalatori' && card.instalatoriHeroOverlay === true

  const showCardContent = (card: (typeof cards)[number]) =>
    !card.noOverlay &&
    !showProductHeroOverlay(card) &&
    !showDiscountHeroOverlay(card) &&
    !showMedicalHeroOverlay(card) &&
    !showInstalatoriHeroOverlay(card)
  const showDarkOverlay = (card: (typeof cards)[number]) => !card.noOverlay && !card.noDarkOverlay

  const medHighlights = useMemo(
    () => [tr.heroV2MedFeature1, tr.heroV2MedFeature2],
    [tr.heroV2MedFeature1, tr.heroV2MedFeature2],
  )

  const instBenefits = useMemo(
    () => [
      tr.heroV2InstBenefit1,
      tr.heroV2InstBenefit2,
      tr.heroV2InstBenefit3,
      tr.heroV2InstBenefit4,
    ],
    [tr.heroV2InstBenefit1, tr.heroV2InstBenefit2, tr.heroV2InstBenefit3, tr.heroV2InstBenefit4],
  )

  const medSpecs = useMemo(
    () => [
      { label: tr.heroV2MedSpecCapacityLabel, value: tr.heroV2MedSpecCapacityValue },
      { label: tr.heroV2MedSpecPowerLabel, value: tr.heroV2MedSpecPowerValue },
      { label: tr.heroV2MedSpecCyclesLabel, value: tr.heroV2MedSpecCyclesValue },
      { label: tr.heroV2MedSpecRetentionLabel, value: tr.heroV2MedSpecRetentionValue },
    ],
    [
      tr.heroV2MedSpecCapacityLabel,
      tr.heroV2MedSpecCapacityValue,
      tr.heroV2MedSpecPowerLabel,
      tr.heroV2MedSpecPowerValue,
      tr.heroV2MedSpecCyclesLabel,
      tr.heroV2MedSpecCyclesValue,
      tr.heroV2MedSpecRetentionLabel,
      tr.heroV2MedSpecRetentionValue,
    ],
  )

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
        <h1 className="text-black text-3xl sm:text-4xl lg:text-5xl font-extrabold font-['Inter'] leading-tight max-w-4xl mx-auto">
          {tr.heroV2Title}
        </h1>
      </header>

      <div
        ref={sliderRef}
        onPointerDown={onPointerDown}
        className={`flex w-full overflow-x-auto overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] h-[var(--hero-card-h)] gap-[var(--hero-card-gap)] px-[100px] ${
          isDragging ? 'cursor-grabbing select-none scroll-auto' : 'cursor-grab scroll-auto'
        }`}
      >
        {cards.map((card) => (
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
            className={`group relative flex-shrink-0 overflow-hidden bg-zinc-300 ${
              showProductHeroOverlay(card) || showMedicalHeroOverlay(card) || showInstalatoriHeroOverlay(card)
                ? 'rounded-xl'
                : 'rounded-[10px]'
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
            <img
              src={card.image}
              alt={card.title.replace(/\n/g, ' ')}
              draggable={false}
              className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-500 ease-out group-hover:scale-110 ${
                showProductHeroOverlay(card) || showMedicalHeroOverlay(card) || showInstalatoriHeroOverlay(card)
                  ? 'object-[right_center]'
                  : ''
              }`}
            />
            {!showDarkOverlay(card) ? null : <div className="absolute inset-0 bg-black/45 pointer-events-none" />}
            {showProductHeroOverlay(card) ? (
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
                  <h2 className="m-0 text-[clamp(1.5rem,2.3vw,1.875rem)] font-bold leading-tight text-white font-['Inter']">
                    {tr.heroV2RezProductTitle}
                  </h2>
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
                  <p className="mb-2 text-sm font-semibold text-white/90 font-['Inter']">{tr.heroV2MedEyebrow}</p>
                  <h2 className="m-0 text-[clamp(1.5rem,2.3vw,1.875rem)] font-bold leading-tight text-white font-['Inter']">
                    {tr.heroV2MedProductTitle}
                  </h2>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {medSpecs.map(({ label, value }) => (
                      <div
                        key={label}
                        className="rounded-md border border-white/30 bg-white/20 px-2.5 py-2 backdrop-blur-md"
                      >
                        <p className="text-[10px] font-medium uppercase tracking-wide text-white/70 font-['Inter']">
                          {label}
                        </p>
                        <p className="mt-0.5 text-sm font-semibold leading-tight text-white font-['Inter'] tabular-nums">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <ul className="mt-4 space-y-2">
                    {medHighlights.map((label) => (
                      <li key={label} className="flex items-start gap-2.5 text-sm text-white/90 font-['Inter']">
                        <HeroListDot light />
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  to={card.to!}
                  className={`absolute bottom-6 right-6 z-[3] inline-flex h-9 items-center justify-center rounded-[8px] bg-white px-4 text-xs font-bold uppercase text-black font-['Inter'] hover:bg-neutral-100 active:bg-neutral-200 transition-colors ${
                    isDragging ? 'pointer-events-none' : 'pointer-events-auto'
                  }`}
                >
                  {tr.heroV2MedCta}
                </Link>
              </>
            ) : showDiscountHeroOverlay(card) ? (
                <div className="absolute inset-x-[clamp(0.75rem,2vw,1rem)] bottom-[clamp(1.25rem,3vh,2rem)] flex flex-col items-center text-center gap-[clamp(0.75rem,1.5vh,1rem)] pointer-events-none">
                  <div className="flex flex-col items-center gap-1 text-center [text-shadow:0_1px_3px_rgba(0,0,0,0.85),0_2px_10px_rgba(0,0,0,0.45)]">
                    <img
                      src="/images/shared/baterino-logo-white.png"
                      alt="Baterino"
                      draggable={false}
                      className="h-5 w-auto max-w-[72%] object-contain pointer-events-none [filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.85))]"
                    />
                    <h2 className="m-0 text-[clamp(1rem,3.2vw,1.375rem)] font-bold leading-tight uppercase text-white font-['Inter']">
                      {tr.heroV2Card2Title}
                    </h2>
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
              <>
                <div
                  className="absolute inset-0 pointer-events-none rounded-xl"
                  style={{
                    background:
                      'linear-gradient(to right, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.42) 55%, rgba(0, 0, 0, 0.05) 75%, transparent 85%)',
                  }}
                  aria-hidden
                />
                <div className="absolute inset-y-0 left-0 z-[2] flex h-full w-[82%] min-w-0 flex-col justify-center px-7 py-8 pointer-events-none [text-shadow:0_1px_3px_rgba(0,0,0,0.85),0_2px_10px_rgba(0,0,0,0.45)]">
                  <p className="mb-2 text-xs font-medium tracking-wide text-white/75 font-['Inter'] sm:text-sm">
                    {tr.heroV2InstLead}
                  </p>
                  <h2 className="m-0 text-[clamp(1.125rem,2.2vw,1.5rem)] font-bold leading-tight uppercase text-white font-['Inter']">
                    {tr.heroV2InstTitle}
                  </h2>

                  <div className="mt-3 w-full rounded-md border border-white/80 bg-white/20 px-3.5 py-3 backdrop-blur-md [text-shadow:none] sm:px-4 sm:py-3.5">
                    <ul className="space-y-2.5">
                      {instBenefits.map((label, index) => {
                        const Icon = INST_BENEFIT_ICONS[index]
                        return (
                          <li
                            key={label}
                            className="flex items-start gap-2 text-xs leading-snug text-white/90 font-['Inter'] sm:text-sm sm:leading-relaxed"
                          >
                            <Icon className="mt-0.5 size-4 shrink-0 text-white" strokeWidth={1.75} aria-hidden />
                            {label}
                          </li>
                        )
                      })}
                    </ul>
                  </div>

                  <Link
                    to={card.to!}
                    className={`mt-4 inline-flex h-10 items-center justify-center self-start rounded-[8px] bg-white px-5 text-sm font-bold uppercase text-black font-['Inter'] [text-shadow:none] hover:bg-neutral-100 active:bg-neutral-200 transition-colors ${
                      isDragging ? 'pointer-events-none' : 'pointer-events-auto'
                    }`}
                  >
                    {tr.heroV2InstCta}
                  </Link>
                </div>
              </>
            ) : showCardContent(card) ? (
            <div className={`absolute inset-x-[clamp(0.75rem,2vw,1rem)] bottom-[clamp(1.25rem,3vh,2rem)] flex flex-col items-center text-center gap-[clamp(0.75rem,1.5vh,1rem)] ${isDragging ? 'pointer-events-none' : ''}`}>
              {card.id === 'maritim' ? (
                <div className="flex flex-col items-center gap-1 text-center">
                  <img
                    src="/images/lithtech/logo-baterino-pro-white.png"
                    alt="Baterino Pro"
                    draggable={false}
                    className="h-5 w-auto max-w-[72%] object-contain pointer-events-none [filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.85))]"
                  />
                  <h2
                    className={`m-0 text-white font-bold font-['Inter'] leading-tight uppercase whitespace-pre-line ${
                      card.subtitle
                        ? 'text-[clamp(1rem,3.2vw,1.375rem)]'
                        : 'text-[clamp(0.6875rem,2.2vw,0.9375rem)]'
                    }`}
                  >
                    {card.title}
                  </h2>
                </div>
              ) : (
                <h2
                  className={`text-white font-bold font-['Inter'] leading-tight uppercase ${
                    card.subtitle
                      ? 'text-[clamp(1rem,3.2vw,1.375rem)]'
                      : 'text-[clamp(0.6875rem,2.2vw,0.9375rem)]'
                  } ${card.multilineTitle ? 'whitespace-pre-line' : ''}`}
                >
                  {card.title}
                </h2>
              )}
              {card.subtitle ? (
                <p
                  className={`text-white text-[clamp(0.875rem,2.75vw,1.125rem)] font-normal font-['Inter'] leading-snug normal-case max-w-[min(320px,94%)] ${
                    card.id === 'maritim' ? 'whitespace-pre-line' : ''
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
