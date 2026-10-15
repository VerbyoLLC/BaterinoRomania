import { useCallback, useEffect, useRef, useState, type CSSProperties, type TouchEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  Cpu,
  HardHat,
  PlugZap,
  RefreshCw,
  ShieldCheck,
  Truck,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { createPortal } from 'react-dom'
import CompatibilitateInvertorModal from '../CompatibilitateInvertorModal'
import { useCatalogCurrency } from '../../contexts/CatalogCurrencyContext'
import { useLanguage } from '../../contexts/LanguageContext'
import {
  formatResidentialCatalogPriceDisplay,
  getProducts,
  getPublicCatalogProductHref,
  type PublicProduct,
} from '../../lib/api'
import {
  getHomeProductSliderTranslations,
  type HomeProductSliderTranslations,
} from '../../i18n/home-product-slider'

const SLIDE_MS = 640
const SLIDE_EASE = 'cubic-bezier(0.77, 0, 0.175, 1)'

function slideMotion(direction: 1 | -1, kind: 'in' | 'out'): CSSProperties {
  return {
    ['--slide-to' as string]: direction > 0 ? '-100%' : '100%',
    ['--slide-from' as string]: direction > 0 ? '100%' : '-100%',
    animation: `${kind === 'out' ? 'home-product-slider-out' : 'home-product-slider-in'} ${SLIDE_MS}ms ${SLIDE_EASE} both`,
  }
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function SliderArrow({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={`size-9 text-[#232323] ${direction === 'left' ? 'rotate-180' : ''}`}
      fill="none"
      aria-hidden
    >
      <path d="M2 20H37M19 2l18 18-18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

type TrKey = keyof HomeProductSliderTranslations

type Spec = { value: string; valueKey?: TrKey; labelKey: TrKey }

const SLIDES: {
  id: string
  name: string
  title?: string
  subtitleKey?: TrKey
  image?: string
  background: string
  imageSizeClass?: string
  imageCount?: number
  /** Different images shown side by side; overrides `image` and `imageCount`. */
  images?: string[]
  imageOverlapClass?: string
  /** Image files with wide transparent margins let the info block sit closer. */
  infoOffsetClass?: string
  groupShiftClass?: string
  productSlug?: string
  /** Details destination when this slide should not show a catalog price. */
  href?: string
  highlights?: TrKey[]
  /** Right edge of the product inside the image file, as a % of the image width. */
  productEdge?: number
  specs: Spec[]
}[] = [
  {
    id: '10kwh',
    name: '10kwh',
    title: 'EcoHome 10kWh LiFePO4',
    subtitleKey: 'ecoHomeSubtitle',
    image: '/images/shared/slider-10kwh.png',
    imageSizeClass: 'max-h-[46vh] max-w-[59vw] lg:max-h-[min(44vh,420px)] lg:max-w-[min(34vw,540px)]',
    infoOffsetClass: '-mr-[6vh]',
    productSlug: 'baterie-solara-rezidentiala-10kwh',
    highlights: [
      'highlightCompatibility',
      'highlightShipping',
      'highlightSwap',
      'highlightService',
    ],
    background: 'linear-gradient(100deg, #e4edf6 0%, #b9cadb 55%, #8fa6bd 100%)',
    specs: [
      { value: '10 kWh', labelKey: 'specCapacity' },
      { value: '51.2 V', labelKey: 'specVoltage' },
      { value: '6000+', labelKey: 'specCycles' },
      { value: 'LiFePO₄', labelKey: 'specChemistry' },
      { value: '', valueKey: 'warrantyValue', labelKey: 'specWarranty' },
    ],
  },
  {
    id: '16kwh',
    name: '16kwh',
    title: 'EcoHome 16kWh LiFePO4',
    subtitleKey: 'ecoHome16Subtitle',
    productSlug: 'baterie-lifepo4-16kwh-lithtech',
    image: '/images/shared/slider-16kwh.png',
    imageSizeClass: 'max-h-[46vh] max-w-[59vw] lg:max-h-[min(44vh,420px)] lg:max-w-[min(34vw,540px)]',
    infoOffsetClass: '-mr-[2vh]',
    productEdge: 80,
    highlights: ['highlightCompatibility', 'highlightShipping', 'highlightSwap', 'highlightService'],
    background: 'linear-gradient(100deg, #f3eee6 0%, #d9cfc1 55%, #b8a993 100%)',
    specs: [
      { value: '16 kWh', labelKey: 'specCapacity' },
      { value: '51.2 V', labelKey: 'specVoltage' },
      { value: '8000+', labelKey: 'specCycles' },
      { value: 'LiFePO₄', labelKey: 'specChemistry' },
      { value: '', valueKey: 'warrantyValue', labelKey: 'specWarranty' },
    ],
  },
  {
    id: '20kwh',
    name: '20kwh',
    title: 'Pachet EcoHome 20kWh LiFePO4',
    subtitleKey: 'ecoHome20Subtitle',
    productSlug: 'pachet-baterii-lifepo4-20kwh',
    image: '/images/shared/slider-10kwh.png',
    imageCount: 2,
    highlights: ['highlightCompatibility', 'highlightShipping', 'highlightSwap', 'highlightService'],
    imageSizeClass:
      'max-h-[40vh] max-w-[60vw] lg:max-h-[min(40vh,380px)] lg:max-w-[min(26vw,380px)] xl:max-w-[min(34vw,540px)] xl:max-[1399px]:max-h-[min(44vh,420px)] min-[1400px]:max-h-[min(42vh,400px)]',
    imageOverlapClass:
      '-ml-[calc(28.8vw-12px)] lg:max-xl:-ml-[min(13.5vh,10.2vw)] xl:max-[1399px]:-ml-[min(18.1vh,11.3vw,175px)] min-[1400px]:-ml-[min(17.4vh,10.9vw,168px)]',
    infoOffsetClass: '-mr-[6vh] min-[1400px]:-mr-[8vh]',
    groupShiftClass: 'lg:max-xl:-translate-x-8 xl:max-[1399px]:-translate-x-4 min-[1400px]:-translate-x-[38px]',
    background: 'linear-gradient(100deg, #e8efe9 0%, #c3d3c6 55%, #97ad9c 100%)',
    specs: [
      { value: '20 kWh', labelKey: 'specCapacity' },
      { value: '51.2 V', labelKey: 'specVoltage' },
      { value: '6000+', labelKey: 'specCycles' },
      { value: 'LiFePO₄', labelKey: 'specChemistry' },
      { value: '', valueKey: 'warrantyValue', labelKey: 'specWarranty' },
    ],
  },
  {
    id: '261kwh',
    name: '261 kwh',
    title: 'Cabinet Răcire Lichidă 261kWh',
    subtitleKey: 'bess261Subtitle',
    productSlug: 'bess-cabinet-lifepo4-261kwh-racire-lichida',
    image: '/images/shared/slider-bess-closed.png',
    images: ['/images/shared/slider-bess-closed.png', '/images/shared/slider-bess-open.png'],
    imageSizeClass: 'max-h-[46vh] max-w-[90vw] lg:max-h-[min(56vh,520px)] lg:max-w-[min(40vw,640px)]',
    imageOverlapClass: '-ml-[calc(57.2vw-12px)] lg:-ml-[min(52vh,23.2vw,371px)]',
    infoOffsetClass: '-mr-[min(30vh,13.5vw,216px)]',
    highlights: ['highlightInstall', 'highlightEms', 'highlightWarranty', 'highlightMaintenance'],
    productEdge: 65,
    background: 'linear-gradient(100deg, #e9e9ee 0%, #c4c6cf 55%, #9599a6 100%)',
    specs: [
      { value: '261 kWh', labelKey: 'specCapacity' },
      { value: '6000+', labelKey: 'specCycles' },
      { value: '', valueKey: 'useOutdoor', labelKey: 'specUse' },
      { value: 'LiFePO₄', labelKey: 'specChemistry' },
      { value: '', valueKey: 'warrantyValue', labelKey: 'specWarranty' },
    ],
  },
]

const HIGHLIGHT_ICONS: Record<string, LucideIcon> = {
  highlightCompatibility: PlugZap,
  highlightShipping: Truck,
  highlightSwap: RefreshCw,
  highlightService: Wrench,
  highlightInstall: HardHat,
  highlightEms: Cpu,
  highlightWarranty: ShieldCheck,
  highlightMaintenance: Wrench,
}

const CALLOUT_GAP = 'clamp(24px, 2.5vw, 48px)'
const HIGHLIGHT_ROW =
  'flex items-center gap-3 whitespace-nowrap py-3 text-[15px] font-semibold leading-snug text-neutral-900 xl:py-4 xl:max-[1399px]:text-[17px] min-[1400px]:text-[19px]'

function HighlightRow({
  Icon,
  label,
  onClick,
}: {
  Icon: LucideIcon
  label: string
  onClick?: () => void
}) {
  const itemClass = 'block border-t border-neutral-400 first:border-t-0'
  const front = (
    <span className={HIGHLIGHT_ROW}>
      <Icon className="size-5 shrink-0 text-neutral-700 xl:size-6" strokeWidth={1.75} aria-hidden />
      {label}
    </span>
  )

  if (!onClick) {
    return <li className={itemClass}>{front}</li>
  }

  return (
    <li className={itemClass}>
      <button type="button" onClick={onClick} className="block w-full text-left">
        {front}
      </button>
    </li>
  )
}

function DetailsButton({ href, label, className }: { href: string | null; label: string; className: string }) {
  const base = `inline-flex items-center rounded-md border ${className}`
  if (!href) return <span className={base}>{label}</span>
  return (
    <Link
      to={href}
      className={`${base} hover:bg-white/40`}
    >
      {label}
    </Link>
  )
}

function SlideTitle({ title, className }: { title: string; className: string }) {
  return (
    <p className={className}>
      {title.split('\n').map((line) => (
        <span key={line} className="block w-max max-w-full">
          {line}
        </span>
      ))}
    </p>
  )
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

const INDUSTRIAL_GREY = 'linear-gradient(100deg, #e9e9ee 0%, #c4c6cf 55%, #9599a6 100%)'
const INDUSTRIAL_HIGHLIGHTS: TrKey[] = ['highlightInstall', 'highlightEms', 'highlightWarranty', 'highlightMaintenance']

export const BESS_SLIDES: typeof SLIDES = [
  {
    id: 'bess-64kwh',
    name: '64 - 112kwh',
    title: 'BESS Modular High Voltage',
    subtitleKey: 'bessModularHvSubtitle',
    href: '/produse/sisteme-bess/bess-modular-high-voltage-hp-1600-64kwh-pana-la-241kwh',
    image: '/images/shared/slider-bess-modular-hv.png',
    imageSizeClass: '!h-[min(37vw,30vh)] !w-auto lg:!h-[min(16.5vw,264px)]',
    infoOffsetClass: 'mr-6 xl:!max-w-[220px]',
    productEdge: 100,
    highlights: INDUSTRIAL_HIGHLIGHTS,
    background: INDUSTRIAL_GREY,
    specs: [
      { value: '64 kWh', labelKey: 'specCapacity' },
      { value: '358.4 V', labelKey: 'specVoltage' },
      { value: '8.000+', labelKey: 'specCycles' },
      { value: '', valueKey: 'useIndoor', labelKey: 'specUse' },
      { value: 'LiFePO₄', labelKey: 'specChemistry' },
      { value: '', valueKey: 'warrantyValue', labelKey: 'specWarranty' },
    ],
  },
  {
    ...SLIDES[3],
    id: 'bess-261-kwh',
    name: '215 - 261kwh',
    title: 'BESS Cabine 215 - 261kwh - Răcire Lichidă',
    productSlug: undefined,
    href: '/produse/sisteme-bess/bess-cabinet-lifepo4-261kwh-racire-lichida',
    specs: [
      { value: '261 kWh', labelKey: 'specCapacity' },
      { value: '832 V', labelKey: 'specVoltage' },
      { value: '8.000+', labelKey: 'specCycles' },
      { value: '', valueKey: 'useOutdoor', labelKey: 'specUse' },
      { value: 'LiFePO₄', labelKey: 'specChemistry' },
      { value: '', valueKey: 'warrantyValue', labelKey: 'specWarranty' },
    ],
  },
  {
    id: 'bess-2mw',
    name: '656 - 1.41MW',
    title: 'BESS 20ft Container\n656 - 1.41MW\nRăcire Aer',
    infoOffsetClass: 'mr-6 !max-w-[320px]',
    subtitleKey: 'bessContainer14Subtitle',
    href: '/produse/sisteme-bess/bess-container-20ft-lifepo4-656kwh-1446kwh',
    image: '/images/shared/20ft-container.webp',
    imageSizeClass: '!h-[min(36vh,50vw)] !w-auto lg:!h-[min(48vh,22vw,340px)]',
    productEdge: 100,
    highlights: INDUSTRIAL_HIGHLIGHTS,
    background: INDUSTRIAL_GREY,
    specs: [
      { value: '656 kWh - 1.41 MW', labelKey: 'specCapacity' },
      { value: '768 V', labelKey: 'specVoltage' },
      { value: '9.000+', labelKey: 'specCycles' },
      { value: '', valueKey: 'useOutdoor', labelKey: 'specUse' },
      { value: 'LiFePO₄', labelKey: 'specChemistry' },
      { value: '', valueKey: 'warrantyValue', labelKey: 'specWarranty' },
    ],
  },
  {
    id: 'bess-5mw',
    name: '3.3 - 5.1MW',
    title: 'BESS Container\n3.3 - 5.1MW\nRăcire Lichidă',
    subtitleKey: 'bessContainer51Subtitle',
    infoOffsetClass: 'mr-6 !max-w-[250px]',
    href: '/produse/sisteme-bess/bess-container-20ft-lifepo4-3340kwh-5015kwh-racire-lichida',
    image: '/images/shared/slider-bess-5mw.png',
    imageSizeClass: '!h-[min(24vh,200px)] !w-auto lg:!h-[min(28vh,280px)]',
    productEdge: 100,
    highlights: INDUSTRIAL_HIGHLIGHTS,
    background: INDUSTRIAL_GREY,
    specs: [
      { value: '3.3 - 5.1 MW', labelKey: 'specCapacity' },
      { value: '1331.2 V', labelKey: 'specVoltage' },
      { value: '8.000+', labelKey: 'specCycles' },
      { value: '', valueKey: 'useOutdoor', labelKey: 'specUse' },
      { value: 'LiFePO₄', labelKey: 'specChemistry' },
      { value: '', valueKey: 'warrantyValue', labelKey: 'specWarranty' },
    ],
  },
]

type HomeProductSliderProps = {
  slides?: typeof SLIDES
  /** Page hero shows the site title. Embedded sliders keep only the product slides. */
  showPageHeader?: boolean
}

export default function HomeProductSlider({ slides = SLIDES, showPageHeader = true }: HomeProductSliderProps) {
  const { language } = useLanguage()
  const tr = getHomeProductSliderTranslations(language.code)
  const [index, setIndex] = useState(0)
  const [leaving, setLeaving] = useState<{ index: number; direction: 1 | -1; seq: number } | null>(null)
  const slide = slides[index]
  const { currency } = useCatalogCurrency()
  const [products, setProducts] = useState<PublicProduct[] | null>(null)
  const [compatOpen, setCompatOpen] = useState(false)

  useEffect(() => {
    if (!leaving) return
    const timer = window.setTimeout(() => setLeaving(null), SLIDE_MS + 80)
    return () => window.clearTimeout(timer)
  }, [leaving])

  useEffect(() => {
    let cancelled = false
    getProducts()
      .then((list) => { if (!cancelled) setProducts(list) })
      .catch(() => { if (!cancelled) setProducts([]) })
    return () => { cancelled = true }
  }, [])

  const indexRef = useRef(index)
  indexRef.current = index

  const goTo = useCallback((next: number) => {
    const current = indexRef.current
    if (next === current) return
    if (!prefersReducedMotion()) {
      setLeaving({ index: current, direction: next > current ? 1 : -1, seq: Date.now() })
    }
    setIndex(next)
  }, [])

  const go = useCallback((delta: 1 | -1) => {
    const current = indexRef.current
    const next = (current + delta + slides.length) % slides.length
    if (!prefersReducedMotion()) {
      setLeaving({ index: current, direction: delta, seq: Date.now() })
    }
    setIndex(next)
  }, [slides.length])

  const touchStart = useRef<{ x: number; y: number; axis: 'x' | 'y' | null } | null>(null)

  const onTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY, axis: null }
  }, [])

  const onTouchMove = useCallback((event: TouchEvent) => {
    const start = touchStart.current
    if (!start || start.axis) return
    const touch = event.touches[0]
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
      start.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    }
  }, [])

  const onTouchEnd = useCallback((event: TouchEvent) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start || start.axis !== 'x') return
    const dx = event.changedTouches[0].clientX - start.x
    if (Math.abs(dx) >= 50) go(dx < 0 ? 1 : -1)
  }, [go])

  const renderStageGroup = (item: (typeof slides)[number]) => {
    const itemProduct = item.productSlug ? products?.find((p) => p.slug === item.productSlug) ?? null : null
    const itemPrice = itemProduct ? formatResidentialCatalogPriceDisplay(itemProduct, language.code, currency) : null
    const itemPriceLoading = Boolean(item.productSlug) && products === null
    const itemHref = item.href ?? (itemProduct ? getPublicCatalogProductHref(itemProduct) : null)
    const pictures = (item.images ?? (item.image ? Array.from({ length: item.imageCount ?? 1 }, () => item.image) : [])).filter(
      (src): src is string => Boolean(src),
    )
    const showCopy = Boolean(item.title || item.subtitleKey || item.productSlug)

    return (
      <>
        {showCopy ? (
        <div
          className={`absolute right-full top-1/2 z-[2] hidden w-max max-w-56 -translate-y-1/2 lg:block xl:max-w-72 ${
            item.infoOffsetClass ?? 'mr-6'
          }`}
        >
          <SlideTitle title={item.title ?? item.name} className="text-[28px] font-bold leading-[1.1] tracking-tight text-neutral-950 xl:text-[32px]" />
          {item.subtitleKey ? (
            <p className="mt-2 text-[15px] leading-snug text-neutral-600">{tr[item.subtitleKey]}</p>
          ) : null}
          {(itemPrice || itemPriceLoading) && (
            <div className="mt-6">
              <p className="text-[13px] text-neutral-500">{tr.priceLabel}</p>
              {itemPrice ? (
                <p className="mt-1 text-[28px] font-bold leading-none tracking-tight text-neutral-950">{itemPrice}</p>
              ) : (
                <span aria-hidden className="mt-1 block h-7 w-36 animate-pulse rounded-md bg-neutral-900/10" />
              )}
            </div>
          )}
          <DetailsButton
            href={itemHref}
            label={tr.previewBadge}
            className="mt-6 h-10 border-neutral-900 px-5 text-[14px] font-medium text-neutral-900"
          />
        </div>
        ) : null}
        {pictures.length > 0 ? (
        <>
        <div className="relative z-[1] flex items-center">
          {pictures.map((src, i, all) => (
            <div key={i} className={`relative ${i > 0 ? item.imageOverlapClass ?? '-ml-[min(16vh,10vw)]' : ''}`}>
              <div
                aria-hidden
                className="pointer-events-none absolute bottom-1 left-1/2 z-0 h-8 w-[72%] -translate-x-1/2 rounded-[100%] bg-black/15 blur-xl"
              />
              {itemHref ? (
                <Link to={itemHref} className="block" aria-label={(item.title ?? item.name).replaceAll('\n', ' ')}>
                  <img
                    src={src}
                    alt=""
                    draggable={false}
                    className={`block h-auto w-auto object-contain select-none ${
                      item.imageSizeClass ??
                      'max-h-[46vh] max-w-[86vw] lg:max-h-[min(54vh,520px)] lg:max-w-[min(42vw,680px)]'
                    }`}
                  />
                </Link>
              ) : (
                <img
                  src={src}
                  alt={i === 0 ? (item.title ?? item.name).replaceAll('\n', ' ') : ''}
                  draggable={false}
                  className={`block h-auto w-auto object-contain select-none ${
                    item.imageSizeClass ??
                    'max-h-[46vh] max-w-[86vw] lg:max-h-[min(54vh,520px)] lg:max-w-[min(42vw,680px)]'
                  }`}
                />
              )}
              {i === all.length - 1 && item.highlights && (
                <ul
                  className="absolute top-1/2 z-[2] hidden w-max -translate-y-1/2 lg:block"
                  style={{ left: `calc(${item.productEdge ?? 76}% + ${CALLOUT_GAP})` }}
                >
                  {item.highlights.map((key) => (
                    <HighlightRow
                      key={key}
                      Icon={HIGHLIGHT_ICONS[key]}
                      label={tr[key]}
                      onClick={key === 'highlightCompatibility' ? () => setCompatOpen(true) : undefined}
                    />
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        </>
        ) : (
          <div className="min-h-[160px] lg:min-h-[220px]" />
        )}
      </>
    )
  }

  const stageHoldClass = showPageHeader ? '' : 'min-h-[min(46vh,56.25vw)] lg:min-h-[min(56vh,25vw,400px)]'

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return
      if (event.key === 'ArrowRight') go(1)
      if (event.key === 'ArrowLeft') go(-1)
    }
    if (!showPageHeader) return
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, showPageHeader])

  const enterStyle = leaving ? slideMotion(leaving.direction, 'in') : undefined
  const leavingSlide = leaving ? slides[leaving.index] : null

  const renderMobileCopy = (item: (typeof slides)[number]) => {
    const itemProduct = item.productSlug ? products?.find((p) => p.slug === item.productSlug) ?? null : null
    const itemPrice = itemProduct ? formatResidentialCatalogPriceDisplay(itemProduct, language.code, currency) : null
    const itemPriceLoading = Boolean(item.productSlug) && products === null
    const itemHref = item.href ?? (itemProduct ? getPublicCatalogProductHref(itemProduct) : null)

    return (
      <>
        <div className="text-center">
          {(item.title || item.subtitleKey || item.productSlug) ? (
            <>
              <SlideTitle title={item.title ?? item.name} className="mx-auto text-[32px] font-bold leading-tight tracking-tight text-neutral-950 [&>span]:mx-auto" />
              {item.subtitleKey ? (
                <p className="mx-auto mt-1.5 max-w-sm text-[14px] leading-snug text-neutral-600">
                  {tr[item.subtitleKey]}
                </p>
              ) : null}
              {(itemPrice || itemPriceLoading || itemHref) && (
                <div className="mt-5 flex flex-col items-center gap-3">
                  {itemPrice ? (
                    <p className="text-[24px] font-bold leading-none tracking-tight text-neutral-950">{itemPrice}</p>
                  ) : itemPriceLoading ? (
                    <span aria-hidden className="block h-6 w-28 animate-pulse rounded-md bg-neutral-900/10" />
                  ) : null}
                  {itemHref && (
                    <Link
                      to={itemHref}
                      className="inline-flex h-10 items-center rounded-full bg-neutral-950 px-5 text-[14px] font-medium text-white"
                    >
                      {tr.previewBadge}
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
        {item.highlights && (
          <ul className="mt-6 grid grid-cols-2 border-y border-neutral-400/70">
            {item.highlights.map((key, i) => {
              const Icon = HIGHLIGHT_ICONS[key]
              return (
                <li
                  key={key}
                  className={`border-neutral-400/70 ${i % 2 === 1 ? 'border-l' : ''} ${i > 1 ? 'border-t' : ''}`}
                >
                  <span className="flex h-full w-full flex-col items-center gap-2 px-3 py-3.5 text-center text-[14px] font-semibold leading-snug text-neutral-900">
                    <Icon className="size-5 shrink-0 text-neutral-700" strokeWidth={1.75} aria-hidden />
                    <span>{tr[key]}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </>
    )
  }

  const renderSpecs = (item: (typeof slides)[number]) => (
    <dl className={`flex max-w-full overflow-x-auto [scrollbar-width:none] lg:overflow-visible [&::-webkit-scrollbar]:hidden ${showPageHeader ? 'px-5 sm:px-10 lg:px-0' : 'min-w-0'}`}>
      {item.specs.map((spec) => (
        <div
          key={spec.labelKey}
          className="border-l border-neutral-400 px-2 first:border-l-0 first:pl-0 last:pr-0 sm:px-6"
        >
          <dt className="whitespace-nowrap text-[15px] font-semibold leading-none text-neutral-900 sm:text-[17px] lg:text-[19px]">
            {spec.valueKey ? tr[spec.valueKey] : spec.value}
          </dt>
          <dd className="mt-2 text-[12px] text-neutral-500 sm:text-[13px] lg:text-[14px]">{tr[spec.labelKey]}</dd>
        </div>
      ))}
    </dl>
  )

  return (
    <section
      aria-label={tr.ariaHero}
      className={`relative isolate flex flex-col overflow-hidden text-neutral-900 ${showPageHeader ? 'md:min-h-[calc(100svh-4rem)]' : ''}`}
    >
      <style>{`
        @keyframes home-product-slider-out {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(var(--slide-to), 0, 0); }
        }
        @keyframes home-product-slider-in {
          from { transform: translate3d(var(--slide-from), 0, 0); }
          to { transform: translate3d(0, 0, 0); }
        }
      `}</style>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: slide.background }}
      />

      {showPageHeader ? <header className="px-6 pt-10 text-center sm:pt-14">
        <h1 className="mx-auto w-full max-w-[22rem] text-[1.75rem] font-extrabold leading-[1.15] text-black font-['Inter'] sm:max-w-[28rem] sm:text-[2rem] lg:max-w-[76rem] lg:text-[clamp(1.75rem,3.15vw,2.75rem)] lg:leading-tight lg:whitespace-nowrap">
          <span className="block">{tr.titleLine1}</span>
          <span className="block">{tr.titleLine2}</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-neutral-600 font-['Inter'] sm:text-lg">
          {tr.subtitle}
        </p>
      </header> : null}

      <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 pt-8 sm:gap-x-10 sm:pt-10" aria-label={tr.ariaSlides}>
        {slides.map((item, i) => {
          const active = i === index
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(i)}
              aria-current={active ? 'true' : undefined}
              className={`shrink-0 text-[17px] tracking-wide sm:text-[19px] lg:text-[20px] ${
                active ? 'font-medium text-neutral-900' : 'font-normal text-neutral-400 hover:text-neutral-600'
              }`}
            >
              {item.name}
            </button>
          )
        })}
      </nav>

      <div
        className="relative flex flex-1 touch-pan-y flex-col max-lg:select-none items-center justify-center gap-6 px-4 pb-2 pt-6 lg:px-28 lg:py-8"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        <div className="relative w-full overflow-hidden pb-7">
          <div key={slide.id} className="flex w-full justify-center" style={enterStyle}>
            <div className={`relative ${slide.groupShiftClass ?? ''}`}>
              <div className={`relative flex items-center justify-center ${stageHoldClass}`}>
                {renderStageGroup(slide)}
              </div>
            </div>
          </div>
          {leaving && leavingSlide ? (
            <div
              key={leaving.seq}
              inert
              aria-hidden
              className="pointer-events-none absolute inset-0 flex justify-center"
              style={slideMotion(leaving.direction, 'out')}
            >
              <div className={`relative ${leavingSlide.groupShiftClass ?? ''}`}>
                <div className={`relative flex items-center justify-center ${stageHoldClass}`}>
                  {renderStageGroup(leavingSlide)}
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div className="pointer-events-none absolute inset-0 z-[3] mx-auto hidden max-w-content px-4 sm:px-6 lg:block lg:px-8">
          <div className="relative h-full">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={tr.ariaPrev}
              className="pointer-events-auto absolute -left-2 top-1/2 lg:-left-4 xl:-left-14 -translate-y-1/2 p-2 text-neutral-800 hover:text-neutral-950"
            >
              <SliderArrow direction="left" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={tr.ariaNext}
              className="pointer-events-auto absolute -right-2 top-1/2 lg:-right-4 xl:-right-14 -translate-y-1/2 p-2 text-neutral-800 hover:text-neutral-950"
            >
              <SliderArrow direction="right" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`mx-auto w-full max-w-xl touch-pan-y px-6 pb-6 sm:px-10 lg:hidden ${showPageHeader ? '' : 'min-h-[26rem]'}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        <div className="relative overflow-hidden">
          <div key={slide.id} className="w-full" style={enterStyle}>
            {renderMobileCopy(slide)}
          </div>
          {leaving && leavingSlide ? (
            <div
              key={leaving.seq}
              inert
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={slideMotion(leaving.direction, 'out')}
            >
              {renderMobileCopy(leavingSlide)}
            </div>
          ) : null}
        </div>
      </div>

      <footer
        className={
          showPageHeader
            ? 'mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-8 pb-10 sm:flex-row sm:items-end lg:justify-center lg:px-12 lg:pb-12'
            : 'mx-auto flex w-full max-w-content min-h-[89px] items-center justify-center gap-8 px-5 pb-10 lg:min-h-[97px] lg:gap-12 lg:px-3 lg:pb-12'
        }
      >
        {showPageHeader ? null : (
          <img
            src="/images/divizii/industrial/baterino-pro-logo-black.webp"
            alt="Baterino PRO"
            className="h-5 w-auto shrink-0 object-contain sm:h-6"
          />
        )}
        <div className="relative min-w-0 max-w-full overflow-hidden">
          <div key={slide.id} className="w-full" style={enterStyle}>
            {renderSpecs(slide)}
          </div>
          {leaving && leavingSlide ? (
            <div
              key={leaving.seq}
              inert
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={slideMotion(leaving.direction, 'out')}
            >
              {renderSpecs(leavingSlide)}
            </div>
          ) : null}
        </div>
      </footer>
      {compatOpen && createPortal(<CompatibilitateInvertorModal onClose={() => setCompatOpen(false)} />, document.body)}
    </section>
  )
}
