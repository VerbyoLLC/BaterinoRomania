import { useState, useRef, useEffect, useMemo, useCallback, type CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
        scrollToProducts: true,
        noOverlay: true,
        width: '600px',
      },
      {
        id: 'industrial',
        title: tr.heroV2Card2Title,
        subtitle: tr.heroV2Card2Subtitle,
        buttonLabel: tr.heroV2Card2Cta,
        image: '/images/slider2/slide1.jpg',
        to: '/reduceri',
        width: '300px',
        height: '450px',
        noDarkOverlay: true,
      },
      {
        id: 'medical',
        title: tr.heroSlideMedTitle,
        buttonLabel: tr.heroSlideMedCta,
        image: '/images/slider2/slide4-261kwh-bess.jpg',
        to: '/divizii/medical',
        width: '600px',
        noDarkOverlay: true,
      },
      {
        id: 'maritim',
        title: tr.heroV2Card3Title,
        subtitle: tr.heroV2Card3Subtitle,
        buttonLabel: tr.heroSlideIndCta,
        image: '/images/slider2/slider3.jpg',
        to: '/divizii/maritim',
        width: '300px',
        height: '450px',
        noDarkOverlay: true,
      },
      {
        id: 'instalatori',
        title: tr.heroSlideInstTitle,
        subtitle: tr.heroMobileInstDesc,
        buttonLabel: tr.heroSlideInstCta,
        image: '/images/home/slider-apple/slide4-instalatori.jpg',
        to: '/instalatori',
        multilineTitle: true,
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

  const showCardContent = (card: (typeof cards)[number]) => !card.noOverlay
  const showDarkOverlay = (card: (typeof cards)[number]) => !card.noOverlay && !card.noDarkOverlay

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
            className={`relative flex-shrink-0 rounded-[10px] overflow-hidden bg-zinc-300 ${
              card.id === 'industrial' ? 'group' : ''
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
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
            {!showDarkOverlay(card) ? null : <div className="absolute inset-0 bg-black/45 pointer-events-none" />}
            {showCardContent(card) ? (
            <div className={`absolute inset-x-[clamp(0.75rem,2vw,1rem)] bottom-[clamp(1.25rem,3vh,2rem)] flex flex-col items-center text-center gap-[clamp(0.75rem,1.5vh,1rem)] ${isDragging ? 'pointer-events-none' : ''}`}>
              <h2
                className={`text-white font-bold font-['Inter'] leading-tight uppercase ${
                  card.subtitle
                    ? 'text-[clamp(1rem,3.2vw,1.375rem)]'
                    : 'text-[clamp(0.6875rem,2.2vw,0.9375rem)]'
                } ${card.multilineTitle ? 'whitespace-pre-line' : ''}`}
              >
                {card.title}
              </h2>
              {card.subtitle ? (
                <p className="text-white text-[clamp(0.875rem,2.75vw,1.125rem)] font-normal font-['Inter'] leading-snug normal-case max-w-[min(320px,94%)]">
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
                <div
                  className={
                    card.id === 'industrial'
                      ? 'flex w-full justify-center translate-y-[calc(100%+1rem)] opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100'
                      : 'flex w-full justify-center'
                  }
                >
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
