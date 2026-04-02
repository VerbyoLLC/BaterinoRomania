import { Fragment, useEffect, useRef, useState, type TouchEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Headset,
  Info,
  Package,
  Phone,
  ShieldCheck,
  X,
} from 'lucide-react'
import type { PublicProduct } from '../lib/api'
import { IndustrialDesktopWhatsappSlide } from '../components/product/IndustrialDesktopWhatsappSlide'
import {
  IndustrialModelConfigurationCard,
  IndustrialModelConfigurationSheetHeader,
} from '../components/product/IndustrialModelConfigurationCard'
import { IndustrialCarouselSlideImage } from '../components/product/ProductPageLoaders'
import IndustrialTechnicalSpecTable from '../components/IndustrialTechnicalSpecTable'
import {
  INDUSTRIAL_SPEC_FIELDS,
  normalizeIndustrialTechnicalSpecs,
  type IndustrialModelSpecEntry,
} from '../lib/industrialTechnicalSpec'
import SEO from '../components/SEO'
import OutlineButton from '../components/OutlineButton'
import ProductPriceBlock from '../components/ProductPriceBlock'
import ResidentialClientPriceBlock, { showResidentialClientPurchaseUI } from '../components/ResidentialClientPriceBlock'
import { getProductDetailTranslations } from '../i18n/product-detail'
import { getProductTemplateSeo } from '../lib/productTemplateSeo'
import type { LangCode } from '../i18n/menu'
import { useLanguage } from '../contexts/LanguageContext'
import { getIndustrialBessTemplateTranslations } from '../i18n/industrial-bess-template'
import {
  INDUSTRIAL_BREADCRUMB_NAV_CLASS,
  INDUSTRIAL_PRODUCT_ARTICLE_CLASS,
} from '../lib/industrialProductPageLayout'

const TABS = [
  { id: 'advantages' as const },
  { id: 'spec' as const },
  { id: 'services' as const },
  { id: 'warranty' as const },
  { id: 'faq' as const },
] as const

type TabId = (typeof TABS)[number]['id']

/** Desktop slider + compact mobile cards when model count exceeds this. */
const MODEL_SLIDER_THRESHOLD = 4
/** Desktop configuration slider: cards per horizontal page (when count > MODEL_SLIDER_THRESHOLD). */
const MODEL_DESKTOP_SLIDE_SIZE = 3
/** Mobile: first N model cards before "Load more" (one card per row). */
const MOBILE_MODELS_INITIAL = 2
/** Mobile: extra cards each time "Load more" is pressed. */
const MOBILE_MODELS_STEP = 2

const HERO_CAROUSEL_SWIPE_PX = 56

/** Hero track transition when snapping (not finger-dragging). */
const HERO_CAROUSEL_TRANSITION =
  'transform 0.42s cubic-bezier(0.22, 1, 0.32, 1)'

function chunkModelEntries<T>(arr: T[], size: number): T[][] {
  if (arr.length === 0) return []
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size))
  return chunks
}

const SERVICE_ICONS = ['/images/shared/delivery-icon.svg', '/images/shared/instalare-icon.svg', '/images/shared/maintance-icon.svg'] as const
const WARRANTY_ICONS = [ShieldCheck, Headset, Package, BookOpen] as const

type Props = {
  product: PublicProduct
  breadcrumbHome: string
  breadcrumbProducts: string
}

export default function ResidentialIndustrialProductPage({ product, breadcrumbHome, breadcrumbProducts }: Props) {
  const { language } = useLanguage()
  const tr = getIndustrialBessTemplateTranslations(language.code)
  const productDetailTr = getProductDetailTranslations(language.code)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeTab, setActiveTab] = useState<TabId>('advantages')

  const imgs = Array.isArray(product.images) && product.images.length > 0 ? product.images : []
  const slideCount = Math.max(1, imgs.length)
  const currentImg = imgs[currentSlide] || ''

  const keyAdvantages = Array.isArray(product.keyAdvantages) ? product.keyAdvantages : []
  const faqItems = Array.isArray(product.faq) ? product.faq.filter((f) => f.q?.trim() || f.a?.trim()) : []
  const docs = product.documenteTehnice || []
  const brochureUrl = docs.find((d) => d.url)?.url || ''
  const technicalSpecsRaw =
    (product as { technicalSpecsModels?: unknown }).technicalSpecsModels ??
    (product as { technical_specs_models?: unknown }).technical_specs_models
  const technicalSpecs = normalizeIndustrialTechnicalSpecs(technicalSpecsRaw) ?? { entries: [] }
  const modelEntries = technicalSpecs.entries
  const modelsUseSlider = modelEntries.length > MODEL_SLIDER_THRESHOLD
  const modelPages = modelsUseSlider
    ? chunkModelEntries(modelEntries, MODEL_DESKTOP_SLIDE_SIZE)
    : []

  const [modelConfigPage, setModelConfigPage] = useState(0)
  const [mobileModelsVisible, setMobileModelsVisible] = useState(MOBILE_MODELS_INITIAL)
  const [mobileSpecModalEntry, setMobileSpecModalEntry] = useState<IndustrialModelSpecEntry | null>(null)
  const [desktopWhatsappModel, setDesktopWhatsappModel] = useState<string | null>(null)

  const heroTouchStartX = useRef<number | null>(null)
  const heroDragPxRef = useRef(0)
  const [heroDragPx, setHeroDragPx] = useState(0)
  const [heroIsDragging, setHeroIsDragging] = useState(false)

  useEffect(() => {
    setModelConfigPage(0)
  }, [product.id, modelEntries.length])

  useEffect(() => {
    setDesktopWhatsappModel(null)
  }, [product.id, modelConfigPage])

  useEffect(() => {
    setMobileModelsVisible(Math.min(MOBILE_MODELS_INITIAL, modelEntries.length))
  }, [product.id, modelEntries.length])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const syncTab = () => {
      if (!mq.matches) setActiveTab((t) => (t === 'spec' ? 'advantages' : t))
    }
    syncTab()
    mq.addEventListener('change', syncTab)
    return () => mq.removeEventListener('change', syncTab)
  }, [])

  useEffect(() => {
    if (!mobileSpecModalEntry) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileSpecModalEntry])

  useEffect(() => {
    if (!mobileSpecModalEntry) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileSpecModalEntry(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileSpecModalEntry])

  useEffect(() => {
    if (!mobileSpecModalEntry) return
    const mq = window.matchMedia('(min-width: 1024px)')
    const closeIfDesktop = () => {
      if (mq.matches) setMobileSpecModalEntry(null)
    }
    closeIfDesktop()
    mq.addEventListener('change', closeIfDesktop)
    return () => mq.removeEventListener('change', closeIfDesktop)
  }, [mobileSpecModalEntry])

  const subtitle = String(product.subtitle || '').trim()
  const overview = String(product.overview || '').trim()
  const overviewParagraphs = overview ? overview.split(/\n\s*\n/).filter(Boolean) : []

  const settleHeroCarousel = () => {
    heroDragPxRef.current = 0
    setHeroDragPx(0)
    setHeroIsDragging(false)
  }

  const nextSlide = () => {
    settleHeroCarousel()
    setCurrentSlide((prev) => (prev + 1) % slideCount)
  }

  const prevSlide = () => {
    settleHeroCarousel()
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount)
  }

  const goToSlide = (index: number) => {
    settleHeroCarousel()
    setCurrentSlide(index)
  }

  const onHeroCarouselTouchStart = (e: TouchEvent) => {
    if (imgs.length <= 1) return
    const x = e.targetTouches[0]?.clientX
    if (x === undefined) return
    heroTouchStartX.current = x
    heroDragPxRef.current = 0
    setHeroDragPx(0)
    setHeroIsDragging(true)
  }

  const onHeroCarouselTouchMove = (e: TouchEvent) => {
    if (imgs.length <= 1 || heroTouchStartX.current == null) return
    const x = e.targetTouches[0]?.clientX
    if (x === undefined) return
    let d = x - heroTouchStartX.current
    if (currentSlide === 0 && d > 0) d *= 0.35
    if (currentSlide >= imgs.length - 1 && d < 0) d *= 0.35
    heroDragPxRef.current = d
    setHeroDragPx(d)
  }

  const onHeroCarouselTouchEnd = () => {
    if (imgs.length <= 1) return
    heroTouchStartX.current = null
    setHeroIsDragging(false)
    const d = heroDragPxRef.current
    heroDragPxRef.current = 0
    if (d < -HERO_CAROUSEL_SWIPE_PX && currentSlide < imgs.length - 1) {
      setHeroDragPx(0)
      setCurrentSlide((c) => c + 1)
    } else if (d > HERO_CAROUSEL_SWIPE_PX && currentSlide > 0) {
      setHeroDragPx(0)
      setCurrentSlide((c) => c - 1)
    } else {
      setHeroDragPx(0)
    }
  }

  const onHeroCarouselTouchCancel = () => {
    heroTouchStartX.current = null
    heroDragPxRef.current = 0
    setHeroDragPx(0)
    setHeroIsDragging(false)
  }

  const canonical = `/produse/${product.slug || product.id}`

  const toggleDesktopModelWhatsapp = (modelName: string) => {
    setDesktopWhatsappModel((prev) => (prev === modelName ? null : modelName))
  }

  const tabLabel = (id: TabId) => {
    switch (id) {
      case 'advantages':
        return tr.tabAdvantages
      case 'spec':
        return tr.tabSpec
      case 'services':
        return tr.tabServices
      case 'warranty':
        return tr.tabWarranty
      case 'faq':
        return tr.tabFaq
    }
  }

  const specLabel = (key: string) => tr.techSpecByKey[key] ?? key
  const templateSeo = getProductTemplateSeo(product, language.code as LangCode)

  return (
    <>
      <SEO
        title={templateSeo.title}
        description={templateSeo.description}
        canonical={canonical}
        lang={language.code}
        ogImage={templateSeo.ogImage}
      />

      <article className={INDUSTRIAL_PRODUCT_ARTICLE_CLASS}>
        <nav className={INDUSTRIAL_BREADCRUMB_NAV_CLASS}>
          <Link to="/" className="hover:text-black transition-colors">
            {breadcrumbHome}
          </Link>
          <span>/</span>
          <Link to="/produse" className="hover:text-black transition-colors">
            {breadcrumbProducts}
          </Link>
          <span>/</span>
          <span className="text-black truncate">{product.title}</span>
        </nav>

        <header className="text-center mb-8 sm:mb-10">
          <p className="m-0 mb-3 text-sm font-normal uppercase tracking-[0.12em] text-neutral-600 sm:mb-4 sm:text-base font-['Inter']">
            {tr.heroKicker}
          </p>
          <h1 className="text-black text-2xl sm:text-4xl lg:text-5xl font-extrabold font-['Inter'] tracking-tight leading-tight sm:leading-[48px] lg:leading-[56px] max-w-4xl mx-auto">
            {product.title}
          </h1>
          {subtitle && (
            <p className="max-w-2xl mx-auto mt-4 sm:mt-5 text-neutral-600 text-base sm:text-lg lg:text-xl font-medium font-['Inter'] leading-6 sm:leading-7 lg:leading-8">
              {subtitle}
            </p>
          )}
        </header>

        <div className="mb-4 flex w-[calc(100%+2.5rem)] max-w-none flex-col sm:mx-auto sm:mb-5 sm:w-full sm:max-w-[1200px] -mx-5">
          <div
            className="relative aspect-[4/3] w-full touch-pan-y overflow-hidden border-y border-neutral-200 bg-neutral-100 sm:aspect-[1200/520] sm:rounded-[10px] sm:border select-none"
            role="region"
            aria-roledescription="carousel"
            aria-label={tr.carouselAria}
            onTouchStart={onHeroCarouselTouchStart}
            onTouchMove={onHeroCarouselTouchMove}
            onTouchEnd={onHeroCarouselTouchEnd}
            onTouchCancel={onHeroCarouselTouchCancel}
          >
            {imgs.length > 1 ? (
              <div
                className="flex h-full"
                style={{
                  width: `${imgs.length * 100}%`,
                  transform: `translate3d(calc(-${(currentSlide * 100) / imgs.length}% + ${heroDragPx}px), 0, 0)`,
                  transition: heroIsDragging ? 'none' : HERO_CAROUSEL_TRANSITION,
                  willChange: heroIsDragging ? 'transform' : 'auto',
                }}
              >
                {imgs.map((src, i) => (
                  <div
                    key={`${i}-${src}`}
                    className="h-full shrink-0"
                    style={{ width: `${100 / imgs.length}%` }}
                  >
                    <div className="flex h-full w-full items-center justify-center bg-white">
                      <IndustrialCarouselSlideImage src={src} alt="" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                {currentImg ? (
                  <IndustrialCarouselSlideImage src={currentImg} alt="" />
                ) : (
                  <span className="text-neutral-400 text-sm font-['Inter']">{tr.noCarouselImages}</span>
                )}
              </div>
            )}

            {imgs.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-slate-800 shadow-md transition-colors hover:bg-white sm:flex"
                  aria-label={tr.prevSlide}
                >
                  <ChevronLeft size={22} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-slate-800 shadow-md transition-colors hover:bg-white sm:flex"
                  aria-label={tr.nextSlide}
                >
                  <ChevronRight size={22} strokeWidth={2} />
                </button>
                <div className="absolute bottom-3 left-0 right-0 z-20 hidden justify-center gap-1.5 sm:flex">
                  {imgs.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => goToSlide(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentSlide
                          ? 'w-8 bg-slate-900'
                          : 'w-2 bg-white/90 shadow-sm hover:bg-white border border-neutral-200'
                      }`}
                      aria-label={`${tr.goToSlide} ${index + 1}`}
                      aria-current={index === currentSlide}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          {imgs.length > 1 ? (
            <div
              className="mt-3 flex justify-center gap-2 sm:hidden"
              role="tablist"
              aria-label={tr.carouselAria}
            >
              {imgs.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={index === currentSlide}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'w-8 bg-slate-900'
                      : 'w-2 bg-neutral-300 hover:bg-neutral-400'
                  }`}
                  aria-label={`${tr.goToSlide} ${index + 1}`}
                  aria-current={index === currentSlide}
                />
              ))}
            </div>
          ) : null}
        </div>

        {modelEntries.length > 0 ? (
          <div
            className="mx-auto w-full min-w-0 max-w-[1200px] mb-10 sm:mb-12"
            aria-label={tr.overviewModelsHeading}
          >
            <p className="m-0 mb-3 text-center text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 font-['Inter']">
              {tr.overviewModelsHeading}
            </p>
            <div
              role="note"
              className="mb-4 flex flex-col items-center gap-1.5 rounded-[10px] border border-amber-200/90 bg-amber-50/95 px-3 py-2.5 text-center font-['Inter'] shadow-sm sm:px-4 sm:py-3 lg:hidden"
            >
              <Info
                className="h-4 w-4 shrink-0 text-amber-700 opacity-90 sm:h-[18px] sm:w-[18px]"
                aria-hidden
                strokeWidth={2}
              />
              <p className="m-0 max-w-lg text-[10px] font-semibold uppercase leading-snug tracking-[0.1em] text-amber-950/90 sm:text-[11px] sm:tracking-[0.12em]">
                {tr.overviewModelsTapHint}
              </p>
            </div>
            <div className="lg:hidden">
              <div className="flex w-full min-w-0 flex-col gap-3">
                {modelEntries.slice(0, mobileModelsVisible).map((entry, i) => (
                  <IndustrialModelConfigurationCard
                    key={`${entry.modelName}-mobile-${i}`}
                    entry={entry}
                    tr={tr}
                    specLabel={specLabel}
                    manyModels={modelEntries.length > MODEL_SLIDER_THRESHOLD}
                    onPress={() => setMobileSpecModalEntry(entry)}
                  />
                ))}
              </div>
              {mobileModelsVisible < modelEntries.length ? (
                <div className="mt-4 flex justify-center">
                  <OutlineButton
                    type="button"
                    className="!h-12 !w-full max-w-md !px-4 sm:!w-72"
                    onClick={() =>
                      setMobileModelsVisible((v) =>
                        Math.min(v + MOBILE_MODELS_STEP, modelEntries.length),
                      )
                    }
                  >
                    {tr.modelsLoadMore}
                  </OutlineButton>
                </div>
              ) : null}
            </div>
            {modelsUseSlider ? (
              <div className="hidden lg:block">
                <div className="relative min-w-0">
                  <div className="mb-2 flex min-h-10 items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setModelConfigPage((p) => Math.max(0, p - 1))}
                      disabled={modelConfigPage === 0}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-slate-900 shadow-md transition-colors hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-35"
                      aria-label={tr.prevSlide}
                    >
                      <ChevronLeft size={22} strokeWidth={2} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setModelConfigPage((p) => Math.min(modelPages.length - 1, p + 1))}
                      disabled={modelConfigPage >= modelPages.length - 1}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-slate-900 shadow-md transition-colors hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-35"
                      aria-label={tr.nextSlide}
                    >
                      <ChevronRight size={22} strokeWidth={2} aria-hidden />
                    </button>
                  </div>
                  <div
                    className={`min-w-0 overflow-x-hidden ${desktopWhatsappModel ? 'pb-28' : 'pb-3'}`}
                  >
                    <div
                      className="flex w-full min-w-0 transition-transform duration-300 ease-out will-change-transform"
                      style={{ transform: `translate3d(-${modelConfigPage * 100}%, 0, 0)` }}
                    >
                      {modelPages.map((page, pageIdx) => (
                        <div
                          key={pageIdx}
                          className="min-w-0 max-w-full shrink-0 grow-0 basis-full"
                        >
                          <div
                            className="grid w-full min-w-0 gap-3 sm:gap-4"
                            style={{
                              gridTemplateColumns: `repeat(${page.length}, minmax(0, 1fr))`,
                            }}
                          >
                            {page.map((entry, i) => (
                              <div
                                key={`${entry.modelName}-${pageIdx * MODEL_DESKTOP_SLIDE_SIZE + i}`}
                                className={`relative flex h-full min-h-0 min-w-0 flex-col ${
                                  desktopWhatsappModel === entry.modelName ? 'z-30' : 'z-10'
                                }`}
                              >
                                <div className="flex min-h-0 flex-1 flex-col">
                                  <IndustrialModelConfigurationCard
                                    entry={entry}
                                    tr={tr}
                                    specLabel={specLabel}
                                    manyModels={false}
                                    stretchHeight
                                    onCardClick={() => toggleDesktopModelWhatsapp(entry.modelName)}
                                    isCardExpanded={desktopWhatsappModel === entry.modelName}
                                  />
                                </div>
                                <IndustrialDesktopWhatsappSlide
                                  open={desktopWhatsappModel === entry.modelName}
                                  productTitle={product.title}
                                  modelName={entry.modelName}
                                  tr={tr}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="hidden w-full min-w-0 gap-3 sm:gap-4 lg:grid"
                style={{
                  gridTemplateColumns: `repeat(${modelEntries.length}, minmax(0, 1fr))`,
                }}
              >
                {modelEntries.map((entry, i) => (
                  <div
                    key={`${entry.modelName}-${i}`}
                    className={`relative flex h-full min-h-0 min-w-0 flex-col ${
                      desktopWhatsappModel === entry.modelName ? 'z-30' : 'z-10'
                    }`}
                  >
                    <div className="flex min-h-0 flex-1 flex-col">
                      <IndustrialModelConfigurationCard
                        entry={entry}
                        tr={tr}
                        specLabel={specLabel}
                        manyModels={false}
                        stretchHeight
                        onCardClick={() => toggleDesktopModelWhatsapp(entry.modelName)}
                        isCardExpanded={desktopWhatsappModel === entry.modelName}
                      />
                    </div>
                    <IndustrialDesktopWhatsappSlide
                      open={desktopWhatsappModel === entry.modelName}
                      productTitle={product.title}
                      modelName={entry.modelName}
                      tr={tr}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        <section className="border-t border-gray-100 pt-10 sm:pt-12">
          <h2 className="text-gray-700 text-xl lg:text-3xl font-bold font-['Inter'] leading-7 lg:leading-10 m-0 mb-6 sm:mb-7 lg:mb-8">
            {tr.overviewTitle}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-8 lg:gap-8 mb-10 lg:mb-12 items-start">
            <div className="min-w-0">
              <div className="flex flex-col gap-5 sm:gap-6 lg:gap-7">
                {overviewParagraphs.length > 0 ? (
                  overviewParagraphs.map((para, i) => (
                    <p key={i} className="text-gray-700 text-base font-normal lg:font-medium font-['Inter'] leading-6 m-0 whitespace-pre-wrap">
                      {para}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500 text-base font-['Inter'] m-0 italic">{tr.overviewPlaceholder}</p>
                )}
              </div>

              {brochureUrl && (
                <a
                  href={brochureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neutral-300 bg-white text-slate-900 px-5 py-3 font-semibold font-['Inter'] text-sm sm:text-base hover:border-slate-400 hover:bg-neutral-50 transition-colors mt-6 sm:mt-8 w-full sm:w-auto"
                >
                  <Download size={18} aria-hidden />
                  {tr.downloadBrochure}
                </a>
              )}
            </div>

            <div className="min-w-0 p-5 sm:p-6 bg-neutral-100 rounded-[10px] border border-neutral-200/80">
              <img
                src="/images/shared/baterino-industrial-black.png"
                alt="Baterino Industrial"
                className="h-5 w-auto max-w-full object-contain object-left mb-3"
              />
              <div className="mb-4">
                {showResidentialClientPurchaseUI(product) ? (
                  <ResidentialClientPriceBlock
                    product={product}
                    tr={productDetailTr}
                    lang={language.code as LangCode}
                  />
                ) : (
                  <ProductPriceBlock product={product} lang={language.code as LangCode} embedded />
                )}
              </div>
              {tr.contactBlurb.trim() ? (
                <>
                  <h3 className="mb-2 text-base font-bold font-['Inter'] text-black">{tr.contactTitle}</h3>
                  <p className="mb-4 text-sm font-normal font-['Inter'] leading-5 text-gray-700">{tr.contactBlurb}</p>
                </>
              ) : (
                <p className="mb-4 text-sm font-semibold font-['Inter'] leading-snug text-gray-900 sm:text-base">
                  {tr.contactTitle}
                </p>
              )}
              <Link
                to="/contact"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-900 bg-slate-900 text-white px-5 py-3.5 font-semibold font-['Inter'] text-sm sm:text-base hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Phone size={18} aria-hidden />
                {tr.contactCta}
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-gray-100 pb-8 sm:pb-10">
          <div
            className="flex flex-wrap justify-center gap-2 sm:gap-2.5 lg:justify-start lg:border-b lg:border-neutral-200 lg:pb-px"
            role="tablist"
            aria-label={tr.tablistAria}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`max-w-[calc(50%-0.25rem)] flex-1 basis-[calc(50%-0.25rem)] px-3 py-2.5 text-center text-xs font-semibold font-['Inter'] rounded-lg transition-all sm:px-4 sm:py-3 sm:text-sm lg:max-w-none lg:flex-none lg:basis-auto lg:rounded-t-lg lg:rounded-b-none lg:border-x-0 lg:border-t-0 lg:px-4 lg:py-3 lg:text-base lg:-mb-px ${
                  tab.id === 'spec' ? 'max-lg:hidden ' : ''
                }${
                  activeTab === tab.id
                    ? 'max-lg:border-2 max-lg:border-slate-900 max-lg:bg-[#f7f7f7] max-lg:text-slate-900 max-lg:shadow-md lg:border-b-2 lg:border-slate-900 lg:bg-neutral-50 lg:shadow-none'
                    : 'max-lg:border max-lg:border-neutral-200 max-lg:bg-[#f7f7f7] max-lg:text-gray-600 max-lg:shadow-sm max-lg:hover:border-neutral-300 max-lg:hover:text-gray-900 lg:border-b-2 lg:border-transparent lg:bg-transparent lg:text-gray-500 lg:shadow-none lg:hover:border-neutral-300 lg:hover:text-gray-800'
                }`}
              >
                {tabLabel(tab.id)}
              </button>
            ))}
          </div>

          <div role="tabpanel" className="mt-6 sm:mt-8 font-['Inter']">
            {activeTab === 'advantages' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                {keyAdvantages.length > 0 ? (
                  keyAdvantages.map((feature) => (
                    <div
                      key={`${feature.title}-${feature.image}`}
                      className="flex flex-col overflow-hidden rounded-[10px] border border-neutral-200/80 bg-neutral-100"
                    >
                      <h3 className="m-0 px-4 pt-4 pb-3 text-center text-base font-bold leading-snug text-black font-['Inter']">
                        {feature.title}
                      </h3>
                      <div className="w-full shrink-0 bg-white">
                        {feature.image ? (
                          <img
                            src={feature.image}
                            alt={feature.title}
                            className="block h-auto w-full"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm col-span-full">{tr.noKeyAdvantages}</p>
                )}
              </div>
            )}
            {activeTab === 'spec' && (
              <div className="flex flex-col gap-6 font-['Inter']">
                {technicalSpecs.entries.length > 0 ? (
                  <IndustrialTechnicalSpecTable
                    data={technicalSpecs}
                    modelLabel={tr.modelLabel}
                    labelForKey={specLabel}
                  />
                ) : null}
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-6 text-gray-700">
                  <p className="m-0 mb-4 text-base leading-relaxed">
                    {technicalSpecs.entries.length > 0 ? tr.specBrochureWhenRows : tr.specBrochureWhenEmpty}
                  </p>
                  {brochureUrl ? (
                    <a
                      href={brochureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-semibold text-slate-900 underline underline-offset-4 hover:no-underline"
                    >
                      <Download size={18} aria-hidden />
                      {tr.specOpenPdf}
                    </a>
                  ) : (
                    <p className="m-0 text-sm text-gray-500">{tr.specNoBrochure}</p>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'services' && (
              <div className="flex flex-col">
                <p className="m-0 max-w-4xl text-base text-gray-700 leading-relaxed">{tr.servicesIntro}</p>
                <div className="mt-8 flex flex-col sm:mt-10 lg:flex-row lg:items-stretch lg:gap-3">
                  {tr.serviceSteps.map((step, i) => (
                    <Fragment key={step.title}>
                      <div className="flex min-h-full min-w-0 flex-1 flex-col items-center justify-center text-center rounded-[10px] border border-neutral-200/80 bg-neutral-100 p-5 sm:p-6">
                        <img
                          src={SERVICE_ICONS[i]!}
                          alt=""
                          className="mb-3 h-12 w-12 shrink-0 object-contain"
                          width={48}
                          height={48}
                          aria-hidden
                        />
                        <h4 className="m-0 mb-2 text-base font-bold text-black font-['Inter'] leading-snug">{step.title}</h4>
                        <p className="m-0 text-sm leading-relaxed text-gray-700 sm:text-base font-['Inter']">{step.body}</p>
                      </div>
                      {i < tr.serviceSteps.length - 1 && (
                        <div className="flex shrink-0 items-center justify-center py-2 text-slate-500 lg:py-0 lg:px-1" aria-hidden>
                          <ArrowDown size={24} strokeWidth={2} className="lg:hidden" />
                          <ArrowRight size={24} strokeWidth={2} className="hidden lg:block" />
                        </div>
                      )}
                    </Fragment>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'warranty' && (
              <div className="flex flex-col">
                <p className="m-0 max-w-4xl text-base text-gray-700 leading-relaxed">{tr.warrantyIntro}</p>
                <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 md:grid-cols-3 md:gap-4 lg:gap-5">
                  {tr.warrantyItems.map(({ title, body }, idx) => {
                    const Icon = WARRANTY_ICONS[idx] ?? ShieldCheck
                    return (
                      <div
                        key={title}
                        className="flex min-h-full min-w-0 flex-col items-center justify-center text-center rounded-[10px] border border-neutral-200/80 bg-neutral-100 p-5 sm:p-6"
                      >
                        <Icon className="mb-3 h-12 w-12 shrink-0 text-black" strokeWidth={2} aria-hidden />
                        <h4 className="m-0 mb-2 text-base font-bold text-black font-['Inter'] leading-snug">{title}</h4>
                        <p className="m-0 text-sm leading-relaxed text-gray-700 sm:text-base font-['Inter']">{body}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            {activeTab === 'faq' && (
              <div className="divide-y divide-neutral-200 rounded-[10px] border border-neutral-200/80 bg-neutral-50/80">
                {faqItems.length > 0 ? (
                  faqItems.map((item) => (
                    <details key={item.q} className="group bg-white open:bg-neutral-50/50">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-left font-semibold text-slate-900 sm:px-5 sm:py-4 [&::-webkit-details-marker]:hidden">
                        <span className="min-w-0 flex-1 text-base leading-snug">{item.q}</span>
                        <ChevronDown
                          size={22}
                          strokeWidth={2}
                          className="shrink-0 text-slate-600 transition-transform duration-200 group-open:rotate-180"
                          aria-hidden
                        />
                      </summary>
                      <div className="border-t border-neutral-100 px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
                        <p className="m-0 pt-3 text-sm leading-relaxed text-gray-700 sm:text-base whitespace-pre-wrap">{item.a}</p>
                      </div>
                    </details>
                  ))
                ) : (
                  <p className="p-6 text-sm text-gray-600 m-0">{tr.noFaqs}</p>
                )}
              </div>
            )}
          </div>
        </section>

        {mobileSpecModalEntry ? (
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 backdrop-blur-[2px] lg:hidden"
            onClick={() => setMobileSpecModalEntry(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="industrial-model-spec-sheet-title"
          >
            <div
              className="relative flex max-h-[88vh] w-full max-w-[100vw] flex-col overflow-hidden rounded-t-[20px] bg-white shadow-2xl animate-slide-up-from-bottom"
              style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-start justify-between gap-3 border-b border-neutral-100 bg-white px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
                <IndustrialModelConfigurationSheetHeader
                  entry={mobileSpecModalEntry}
                  specLabel={specLabel}
                  titleId="industrial-model-spec-sheet-title"
                />
                <button
                  type="button"
                  onClick={() => setMobileSpecModalEntry(null)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                  aria-label={productDetailTr.compatibilitateClose}
                >
                  <X size={22} strokeWidth={2} aria-hidden />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-2">
                <dl className="m-0">
                  {INDUSTRIAL_SPEC_FIELDS.filter((field) => field.key !== 'nominalEnergy').map((field) => {
                    const raw = (mobileSpecModalEntry.specs[field.key] ?? '').trim()
                    const value = raw || '—'
                    return (
                      <div key={field.key} className="border-b border-neutral-100 py-3.5 last:border-b-0">
                        <dt className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500 font-['Inter'] sm:text-[13px]">
                          {specLabel(field.key)}
                        </dt>
                        <dd className="m-0 mt-1.5 break-words text-base font-semibold leading-snug text-slate-900 font-['Inter'] sm:text-lg">
                          {value}
                        </dd>
                      </div>
                    )
                  })}
                </dl>
              </div>
            </div>
          </div>
        ) : null}
      </article>
    </>
  )
}
