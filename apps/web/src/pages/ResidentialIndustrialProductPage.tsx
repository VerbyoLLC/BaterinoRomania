import { Fragment, useEffect, useState } from 'react'
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
  Package,
  Phone,
  ShieldCheck,
} from 'lucide-react'
import type { PublicProduct } from '../lib/api'
import { IndustrialCarouselSlideImage } from '../components/product/ProductPageLoaders'
import IndustrialTechnicalSpecTable from '../components/IndustrialTechnicalSpecTable'
import { normalizeIndustrialTechnicalSpecs, type IndustrialModelSpecEntry } from '../lib/industrialTechnicalSpec'
import SEO from '../components/SEO'
import ProductPriceBlock from '../components/ProductPriceBlock'
import { getProductTemplateSeo } from '../lib/productTemplateSeo'
import type { LangCode } from '../i18n/menu'
import { useLanguage } from '../contexts/LanguageContext'
import { getIndustrialBessTemplateTranslations, type IndustrialBessTemplateTranslations } from '../i18n/industrial-bess-template'
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

const MODEL_CONFIGS_PER_SLIDE = 4

function chunkModelEntries<T>(arr: T[], size: number): T[][] {
  if (arr.length === 0) return []
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size))
  return chunks
}

function modelConfigPageGridClass(pageLen: number): string {
  if (pageLen >= 4) return 'grid grid-cols-1 min-[560px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'
  if (pageLen === 3) return 'grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'
  if (pageLen === 2) return 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'
  return 'grid grid-cols-1 gap-3 sm:gap-4'
}

function ModelConfigurationCard({
  entry,
  tr,
  specLabel,
}: {
  entry: IndustrialModelSpecEntry
  tr: IndustrialBessTemplateTranslations
  specLabel: (key: string) => string
}) {
  const nominalEnergyVal = String(entry.specs.nominalEnergy ?? '').trim() || '—'
  const detailCells = [
    { label: tr.modelLabel, value: entry.modelName },
    { label: specLabel('nominalVoltage'), value: String(entry.specs.nominalVoltage ?? '').trim() || '—' },
    { label: specLabel('maxOutputPower'), value: String(entry.specs.maxOutputPower ?? '').trim() || '—' },
    { label: specLabel('cycleLife'), value: String(entry.specs.cycleLife ?? '').trim() || '—' },
  ] as const
  return (
    <div className="flex min-w-0 w-full flex-col rounded-[10px] border border-neutral-200 bg-white px-4 py-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md hover:shadow-slate-900/8">
      <div className="rounded-lg border border-slate-200/80 bg-gradient-to-b from-slate-50 to-white px-3 py-3 sm:px-3.5 sm:py-3.5">
        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 font-['Inter']">
          {specLabel('nominalEnergy')}
        </p>
        <p className="m-0 mt-1.5 text-xl sm:text-2xl font-extrabold font-['Inter'] tracking-tight text-slate-900 leading-none tabular-nums">
          {nominalEnergyVal}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3.5">
        {detailCells.map((cell, j) => (
          <div key={`${cell.label}-${j}`} className="min-w-0">
            <p className="m-0 text-[10px] font-medium text-neutral-500 font-['Inter'] leading-tight">{cell.label}</p>
            <p className="m-0 mt-0.5 text-xs font-semibold text-neutral-900 font-['Inter'] leading-snug break-words">
              {cell.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
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
  const modelPages = chunkModelEntries(modelEntries, MODEL_CONFIGS_PER_SLIDE)
  const modelsUseSlider = modelPages.length > 1

  const [modelConfigPage, setModelConfigPage] = useState(0)

  useEffect(() => {
    setModelConfigPage(0)
  }, [product.id, modelEntries.length])

  const subtitle = String(product.subtitle || '').trim()
  const overview = String(product.overview || '').trim()
  const overviewParagraphs = overview ? overview.split(/\n\s*\n/).filter(Boolean) : []

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slideCount)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount)
  const goToSlide = (index: number) => setCurrentSlide(index)

  const canonical = `/produse/${product.slug || product.id}`

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

        <div
          className="relative mx-auto w-full max-w-[1200px] aspect-[1200/520] rounded-[10px] overflow-hidden bg-neutral-100 border border-neutral-200 mb-4 sm:mb-5"
          role="region"
          aria-roledescription="carousel"
          aria-label={tr.carouselAria}
        >
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            {currentImg ? (
              <IndustrialCarouselSlideImage src={currentImg} alt="" />
            ) : (
              <span className="text-neutral-400 text-sm font-['Inter']">{tr.noCarouselImages}</span>
            )}
          </div>

          {imgs.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 hover:bg-white shadow-md border border-neutral-200 flex items-center justify-center text-slate-800 transition-colors"
                aria-label={tr.prevSlide}
              >
                <ChevronLeft size={22} strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 hover:bg-white shadow-md border border-neutral-200 flex items-center justify-center text-slate-800 transition-colors"
                aria-label={tr.nextSlide}
              >
                <ChevronRight size={22} strokeWidth={2} />
              </button>
              <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5">
                {imgs.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? 'w-8 bg-slate-900'
                        : 'w-2 bg-white/90 hover:bg-white border border-neutral-200 shadow-sm'
                    }`}
                    aria-label={`${tr.goToSlide} ${index + 1}`}
                    aria-current={index === currentSlide}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {modelEntries.length > 0 ? (
          <div
            className="mx-auto w-full max-w-[1200px] mb-10 sm:mb-12"
            aria-label={tr.overviewModelsHeading}
          >
            <p className="m-0 mb-3 text-center text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 font-['Inter']">
              {tr.overviewModelsHeading}
            </p>
            <div className={`relative ${modelsUseSlider ? 'px-10 sm:px-12' : ''}`}>
              {modelsUseSlider ? (
                <>
                  <button
                    type="button"
                    onClick={() => setModelConfigPage((p) => Math.max(0, p - 1))}
                    disabled={modelConfigPage === 0}
                    className="absolute left-0 top-[calc(50%-1.25rem)] z-10 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-slate-800 shadow-md transition-colors hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-35"
                    aria-label={tr.prevSlide}
                  >
                    <ChevronLeft size={22} strokeWidth={2} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => setModelConfigPage((p) => Math.min(modelPages.length - 1, p + 1))}
                    disabled={modelConfigPage >= modelPages.length - 1}
                    className="absolute right-0 top-[calc(50%-1.25rem)] z-10 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-slate-800 shadow-md transition-colors hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-35"
                    aria-label={tr.nextSlide}
                  >
                    <ChevronRight size={22} strokeWidth={2} aria-hidden />
                  </button>
                </>
              ) : null}
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-out will-change-transform"
                  style={{ transform: `translate3d(-${modelConfigPage * 100}%, 0, 0)` }}
                >
                  {modelPages.map((page, pageIdx) => (
                    <div key={pageIdx} className="min-w-full shrink-0 px-0.5">
                      <div className={modelConfigPageGridClass(page.length)}>
                        {page.map((entry, i) => (
                          <ModelConfigurationCard
                            key={`${entry.modelName}-${pageIdx * MODEL_CONFIGS_PER_SLIDE + i}`}
                            entry={entry}
                            tr={tr}
                            specLabel={specLabel}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {modelsUseSlider ? (
              <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label={tr.overviewModelsHeading}>
                {modelPages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === modelConfigPage}
                    onClick={() => setModelConfigPage(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === modelConfigPage
                        ? 'w-8 bg-slate-900'
                        : 'w-2 bg-neutral-300 hover:bg-neutral-400'
                    }`}
                    aria-label={`${tr.goToSlide} ${i + 1}`}
                  />
                ))}
              </div>
            ) : null}
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
                <ProductPriceBlock product={product} lang={language.code as LangCode} />
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
          <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-px" role="tablist" aria-label={tr.tablistAria}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm sm:text-base font-semibold font-['Inter'] rounded-t-lg border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? 'border-slate-900 text-slate-900 bg-neutral-50'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-neutral-300'
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
      </article>
    </>
  )
}
