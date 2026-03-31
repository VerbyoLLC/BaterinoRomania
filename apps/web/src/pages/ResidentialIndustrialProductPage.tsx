import { Fragment, useState } from 'react'
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
import type { LucideIcon } from 'lucide-react'
import type { PublicProduct } from '../lib/api'
import IndustrialTechnicalSpecTable from '../components/IndustrialTechnicalSpecTable'
import { normalizeIndustrialTechnicalSpecs } from '../lib/industrialTechnicalSpec'
import SEO from '../components/SEO'

const TABS = [
  { id: 'advantages' as const, label: 'Key Advantages' },
  { id: 'spec' as const, label: 'Technical specification' },
  { id: 'services' as const, label: 'Baterino services' },
  { id: 'warranty' as const, label: 'Warranty and support' },
  { id: 'faq' as const, label: "FAQ's" },
] as const

type TabId = (typeof TABS)[number]['id']

const BATERINO_SERVICE_STEPS = [
  {
    title: 'Importing & sourcing',
    icon: '/images/shared/delivery-icon.svg',
    body: 'Direct procurement from manufacturers with quality assurance, compliance verification, and logistics coordination across Southeast Asia and Eastern Europe.',
  },
  {
    title: 'Installation & commissioning',
    icon: '/images/shared/instalare-icon.svg',
    body: 'Professional on-site installation, system integration, testing, and commissioning by certified technicians. Full site preparation and grid connection support.',
  },
  {
    title: 'After-sales service',
    icon: '/images/shared/maintance-icon.svg',
    body: 'Scheduled maintenance, emergency repairs, spare parts availability, and performance optimization. Local service network across operating regions.',
  },
] as const

const WARRANTY_SUPPORT_ITEMS: readonly { title: string; body: string; Icon: LucideIcon }[] = [
  {
    title: 'Standard warranty',
    body: '5-year manufacturer warranty covering all components. Extended 10-year options available for critical deployments.',
    Icon: ShieldCheck,
  },
  {
    title: 'Technical support',
    body: '24/7 remote monitoring and diagnostics. On-call technical team for troubleshooting and emergency response.',
    Icon: Headset,
  },
  {
    title: 'Spare parts',
    body: 'Pre-stocked critical components for rapid replacement. Direct access to manufacturer inventory for complete modularity.',
    Icon: Package,
  },
  {
    title: 'Training & documentation',
    body: 'Comprehensive operator training, maintenance manuals, and system documentation. Support for staff skill development.',
    Icon: BookOpen,
  },
]

type Props = {
  product: PublicProduct
  breadcrumbHome: string
  breadcrumbProducts: string
  lang?: string
}

export default function ResidentialIndustrialProductPage({ product, breadcrumbHome, breadcrumbProducts, lang = 'ro' }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeTab, setActiveTab] = useState<TabId>('advantages')

  const imgs = Array.isArray(product.images) && product.images.length > 0 ? product.images : []
  const slideCount = Math.max(1, imgs.length)
  const currentImg = imgs[currentSlide] || ''

  const keyAdvantages = Array.isArray(product.keyAdvantages) ? product.keyAdvantages : []
  const faqItems = Array.isArray(product.faq) ? product.faq.filter((f) => f.q?.trim() || f.a?.trim()) : []
  const docs = product.documenteTehnice || []
  const brochureUrl = docs.find((d) => d.url)?.url || ''
  const technicalSpecs = normalizeIndustrialTechnicalSpecs(
    (product as { technicalSpecsModels?: unknown }).technicalSpecsModels
  )

  const subtitle = String(product.subtitle || '').trim()
  const overview = String(product.overview || '').trim()
  const overviewParagraphs = overview ? overview.split(/\n\s*\n/).filter(Boolean) : []

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slideCount)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount)
  const goToSlide = (index: number) => setCurrentSlide(index)

  const canonical = `/produse/${product.slug || product.id}`

  return (
    <>
      <SEO
        title={product.title}
        description={product.description || overview || subtitle || ''}
        canonical={canonical}
        lang={lang}
      />

      <article className="max-w-content mx-auto px-5 lg:px-3 pt-16 lg:pt-24 pb-16 lg:pb-20">
        <nav className="flex items-center gap-2 text-sm text-gray-500 font-['Inter'] mb-8">
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
            Baterino Introducing LithTech&apos;s
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
          className="relative mx-auto w-full max-w-[1200px] aspect-[1200/520] rounded-[10px] overflow-hidden bg-neutral-100 shadow-lg border border-neutral-200 mb-12 sm:mb-14"
          role="region"
          aria-roledescription="carousel"
          aria-label="Product images"
        >
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            {currentImg ? (
              <img src={currentImg} alt="" className="max-h-full max-w-full object-contain" loading="lazy" />
            ) : (
              <span className="text-neutral-400 text-sm font-['Inter']">No carousel images</span>
            )}
          </div>

          {imgs.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 hover:bg-white shadow-md border border-neutral-200 flex items-center justify-center text-slate-800 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft size={22} strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 hover:bg-white shadow-md border border-neutral-200 flex items-center justify-center text-slate-800 transition-colors"
                aria-label="Next slide"
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
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={index === currentSlide}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <section className="border-t border-gray-100 pt-10 sm:pt-12">
          <h2 className="text-gray-700 text-xl lg:text-3xl font-bold font-['Inter'] leading-7 lg:leading-10 m-0 mb-6 sm:mb-7 lg:mb-8">
            Overview
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
                  <p className="text-gray-500 text-base font-['Inter'] m-0 italic">Overview content will appear here when provided.</p>
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
                  Download Brochure
                </a>
              )}
            </div>

            <div className="min-w-0 p-5 sm:p-6 bg-neutral-100 rounded-[10px] border border-neutral-200/80">
              <img
                src="/images/shared/baterino-industrial-black.png"
                alt="Baterino Industrial"
                className="h-5 w-auto max-w-full object-contain object-left mb-3"
              />
              <h3 className="text-black text-base font-bold font-['Inter'] mb-2">Contact Us</h3>
              <p className="text-gray-700 text-sm font-normal font-['Inter'] leading-5 mb-4">
                Our team is ready to discuss your project requirements and timeline.
              </p>
              <Link
                to="/contact"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-900 bg-slate-900 text-white px-5 py-3.5 font-semibold font-['Inter'] text-sm sm:text-base hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Phone size={18} aria-hidden />
                Contact us
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-gray-100 pb-8 sm:pb-10">
          <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-px" role="tablist" aria-label="Product details">
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
                {tab.label}
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
                      <div className="aspect-[2/1] w-full shrink-0 bg-white">
                        {feature.image ? (
                          <img
                            src={feature.image}
                            alt={feature.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm col-span-full">No key advantages configured for this product.</p>
                )}
              </div>
            )}
            {activeTab === 'spec' && (
              <div className="flex flex-col gap-6 font-['Inter']">
                {technicalSpecs && technicalSpecs.entries.length > 0 ? (
                  <IndustrialTechnicalSpecTable data={technicalSpecs} />
                ) : null}
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-6 text-gray-700">
                  <p className="m-0 mb-4 text-base leading-relaxed">
                    {technicalSpecs && technicalSpecs.entries.length > 0
                      ? 'Additional details and drawings are available in the technical brochure.'
                      : 'Full technical specifications for this product are provided in the technical brochure.'}
                  </p>
                  {brochureUrl ? (
                    <a
                      href={brochureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-semibold text-slate-900 underline underline-offset-4 hover:no-underline"
                    >
                      <Download size={18} aria-hidden />
                      Open technical brochure (PDF)
                    </a>
                  ) : (
                    <p className="m-0 text-sm text-gray-500">Brochure not uploaded yet.</p>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'services' && (
              <div className="flex flex-col">
                <p className="m-0 max-w-4xl text-base text-gray-700 leading-relaxed">
                  We handle every stage of your BESS deployment—from sourcing and logistics to installation and
                  long-term support. Our integrated service model ensures reliability, compliance, and optimal system
                  performance throughout the lifecycle.
                </p>
                <div className="mt-8 flex flex-col sm:mt-10 lg:flex-row lg:items-stretch lg:gap-3">
                  {BATERINO_SERVICE_STEPS.map((step, i) => (
                    <Fragment key={step.title}>
                      <div className="flex min-h-full min-w-0 flex-1 flex-col items-center justify-center text-center rounded-[10px] border border-neutral-200/80 bg-neutral-100 p-5 sm:p-6">
                        <img
                          src={step.icon}
                          alt=""
                          className="mb-3 h-12 w-12 shrink-0 object-contain"
                          width={48}
                          height={48}
                          aria-hidden
                        />
                        <h4 className="m-0 mb-2 text-base font-bold text-black font-['Inter'] leading-snug">{step.title}</h4>
                        <p className="m-0 text-sm leading-relaxed text-gray-700 sm:text-base font-['Inter']">{step.body}</p>
                      </div>
                      {i < BATERINO_SERVICE_STEPS.length - 1 && (
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
                <p className="m-0 max-w-4xl text-base text-gray-700 leading-relaxed">
                  Comprehensive warranty and technical support ensures your BESS operates reliably from day one through
                  end-of-life.
                </p>
                <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 md:grid-cols-3 md:gap-4 lg:gap-5">
                  {WARRANTY_SUPPORT_ITEMS.map(({ title, body, Icon }) => (
                    <div
                      key={title}
                      className="flex min-h-full min-w-0 flex-col items-center justify-center text-center rounded-[10px] border border-neutral-200/80 bg-neutral-100 p-5 sm:p-6"
                    >
                      <Icon className="mb-3 h-12 w-12 shrink-0 text-black" strokeWidth={2} aria-hidden />
                      <h4 className="m-0 mb-2 text-base font-bold text-black font-['Inter'] leading-snug">{title}</h4>
                      <p className="m-0 text-sm leading-relaxed text-gray-700 sm:text-base font-['Inter']">{body}</p>
                    </div>
                  ))}
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
                  <p className="p-6 text-sm text-gray-600 m-0">No FAQs for this product yet.</p>
                )}
              </div>
            )}
          </div>
        </section>
      </article>
    </>
  )
}
