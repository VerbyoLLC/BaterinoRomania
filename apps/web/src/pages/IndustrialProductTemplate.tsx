import { Fragment, useMemo, useState, type ReactNode } from 'react'
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
import SEO from '../components/SEO'
import { useLanguage } from '../contexts/LanguageContext'
import { getIndustrialBessTemplateTranslations } from '../i18n/industrial-bess-template'
import { getMenuTranslations } from '../i18n/menu'
import {
  INDUSTRIAL_BREADCRUMB_NAV_CLASS,
  INDUSTRIAL_PRODUCT_ARTICLE_CLASS,
} from '../lib/industrialProductPageLayout'
import { IndustrialModelConfigurationCard } from '../components/product/IndustrialModelConfigurationCard'
import { IndustrialDesktopWhatsappSlide } from '../components/product/IndustrialDesktopWhatsappSlide'
import { industrialEntriesFromTemplateRows } from '../lib/industrialTechnicalSpec'

type Slide = { title: string; content: ReactNode }

const TABS = [
  { id: 'advantages' as const },
  { id: 'spec' as const },
  { id: 'services' as const },
  { id: 'warranty' as const },
  { id: 'faq' as const },
] as const

type TabId = (typeof TABS)[number]['id']

function BgDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgb(245, 245, 245)" stopOpacity="1" />
        <stop offset="100%" stopColor="rgb(250, 250, 250)" stopOpacity="1" />
      </linearGradient>
    </defs>
  )
}

function buildSlides(tr: ReturnType<typeof getIndustrialBessTemplateTranslations>): Slide[] {
  const s1 = tr.slide1
  const s2 = tr.slide2
  const s3 = tr.slide3
  const s4 = tr.slide4
  return [
    {
      title: s1.title,
      content: (
        <svg viewBox="0 0 600 400" className="w-full max-w-2xl h-auto">
          <BgDefs id="bess-bg-1" />
          <rect width="600" height="400" fill="url(#bess-bg-1)" />
          <rect x="80" y="120" width="440" height="160" fill="white" stroke="#d1d5db" strokeWidth="2" rx="6" />
          <rect x="100" y="135" width="50" height="130" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1.5" rx="3" />
          <rect x="160" y="135" width="50" height="130" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1.5" rx="3" />
          <rect x="220" y="135" width="50" height="130" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1.5" rx="3" />
          <rect x="280" y="135" width="50" height="130" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1.5" rx="3" />
          <circle cx="380" cy="155" r="14" fill="#6b7280" />
          <circle cx="380" cy="190" r="14" fill="#6b7280" />
          <circle cx="380" cy="225" r="14" fill="#6b7280" />
          <rect x="420" y="120" width="60" height="160" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1.5" rx="3" />
          <rect x="430" y="130" width="15" height="30" fill="#6b7280" rx="2" />
          <rect x="450" y="130" width="15" height="30" fill="#6b7280" rx="2" />
          <rect x="430" y="170" width="15" height="30" fill="#6b7280" rx="2" />
          <rect x="450" y="170" width="15" height="30" fill="#6b7280" rx="2" />
          <text x="300" y="310" textAnchor="middle" fontSize="18" fontWeight="500" fill="#1f2937">
            {s1.diagramTitle}
          </text>
        </svg>
      ),
    },
    {
      title: s2.title,
      content: (
        <svg viewBox="0 0 600 400" className="w-full max-w-2xl h-auto">
          <BgDefs id="bess-bg-2" />
          <rect width="600" height="400" fill="url(#bess-bg-2)" />
          <rect x="80" y="100" width="440" height="200" fill="white" stroke="#d1d5db" strokeWidth="2" rx="6" />
          <circle cx="150" cy="150" r="35" fill="#6b7280" />
          <text x="150" y="155" textAnchor="middle" fontSize="14" fontWeight="500" fill="white">
            {s2.battery}
          </text>
          <circle cx="300" cy="150" r="35" fill="#6b7280" />
          <text x="300" y="155" textAnchor="middle" fontSize="14" fontWeight="500" fill="white">
            {s2.bms}
          </text>
          <circle cx="450" cy="150" r="35" fill="#6b7280" />
          <text x="450" y="155" textAnchor="middle" fontSize="14" fontWeight="500" fill="white">
            {s2.cooling}
          </text>
          <line x1="185" y1="150" x2="265" y2="150" stroke="#e5e7eb" strokeWidth="2" />
          <line x1="335" y1="150" x2="415" y2="150" stroke="#e5e7eb" strokeWidth="2" />
          <rect x="100" y="220" width="380" height="50" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1" rx="4" />
          <text x="300" y="252" textAnchor="middle" fontSize="13" fontWeight="500" fill="#1f2937">
            {s2.mid}
          </text>
          <text x="300" y="330" textAnchor="middle" fontSize="18" fontWeight="500" fill="#1f2937">
            {s2.footer}
          </text>
        </svg>
      ),
    },
    {
      title: s3.title,
      content: (
        <svg viewBox="0 0 600 400" className="w-full max-w-2xl h-auto">
          <BgDefs id="bess-bg-3" />
          <rect width="600" height="400" fill="url(#bess-bg-3)" />
          <rect x="60" y="80" width="480" height="250" fill="white" stroke="#d1d5db" strokeWidth="2" rx="6" />
          <text x="300" y="110" textAnchor="middle" fontSize="14" fontWeight="500" fill="#1f2937">
            {s3.thermal}
          </text>
          <path d="M 150 160 Q 150 130 180 130 L 420 130 Q 450 130 450 160" fill="none" stroke="#6b7280" strokeWidth="3" />
          <text x="300" y="155" textAnchor="middle" fontSize="12" fill="#6b7280">
            {s3.loop}
          </text>
          <rect x="120" y="180" width="70" height="80" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1.5" rx="3" />
          <text x="155" y="225" textAnchor="middle" fontSize="11" fill="#1f2937">
            {s3.battery}
          </text>
          <rect x="220" y="180" width="70" height="80" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1.5" rx="3" />
          <text x="255" y="225" textAnchor="middle" fontSize="11" fill="#1f2937">
            {s3.heat}
          </text>
          <rect x="320" y="180" width="70" height="80" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1.5" rx="3" />
          <text x="355" y="225" textAnchor="middle" fontSize="11" fill="#1f2937">
            {s3.exchanger}
          </text>
          <rect x="420" y="180" width="70" height="80" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1.5" rx="3" />
          <text x="455" y="225" textAnchor="middle" fontSize="11" fill="#1f2937">
            {s3.radiator}
          </text>
          <path
            d="M 155 180 L 255 180 M 255 180 L 355 180 M 355 180 L 455 180"
            stroke="#e5e7eb"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
          />
          <text x="300" y="330" textAnchor="middle" fontSize="18" fontWeight="500" fill="#1f2937">
            {s3.footer}
          </text>
        </svg>
      ),
    },
    {
      title: s4.title,
      content: (
        <svg viewBox="0 0 600 400" className="w-full max-w-2xl h-auto">
          <BgDefs id="bess-bg-4" />
          <rect width="600" height="400" fill="url(#bess-bg-4)" />
          <rect x="80" y="100" width="440" height="220" fill="white" stroke="#d1d5db" strokeWidth="2" rx="6" />
          <text x="300" y="135" textAnchor="middle" fontSize="14" fontWeight="500" fill="#1f2937">
            {s4.header}
          </text>
          <line x1="80" y1="145" x2="520" y2="145" stroke="#e5e7eb" strokeWidth="1" />
          <rect x="100" y="160" width="380" height="130" fill="#f9fafb" stroke="#f3f4f6" strokeWidth="0.5" rx="2" />
          <text x="120" y="185" fontSize="12" fill="#1f2937">
            {s4.cap}
          </text>
          <text x="120" y="210" fontSize="12" fill="#1f2937">
            {s4.volt}
          </text>
          <text x="120" y="235" fontSize="12" fill="#1f2937">
            {s4.pow}
          </text>
          <text x="120" y="260" fontSize="12" fill="#1f2937">
            {s4.cycle}
          </text>
          <text x="120" y="285" fontSize="12" fill="#1f2937">
            {s4.eff}
          </text>
          <text x="300" y="330" textAnchor="middle" fontSize="18" fontWeight="500" fill="#1f2937">
            {s4.footer}
          </text>
        </svg>
      ),
    },
  ]
}

const KEY_ADVANTAGE_IMAGE = '/images/shared/bess-key-advantage-box.png'

type TechSpecRow =
  | { key: string; merged: string }
  | { key: string; cells: readonly [string, string, string, string] }

const STATIC_TECH_SPEC_ROWS: TechSpecRow[] = [
  { key: 'model', cells: ['LTS1331314L-01', 'LTS1331314L-02', 'LTS1331314L-03', 'LTS1331314L-04'] },
  { key: 'energySystem', merged: '0.5C' },
  { key: 'nominalVoltage', merged: '1331.2V' },
  { key: 'nominalCapacity', merged: '3140Ah' },
  { key: 'nominalEnergy', cells: ['3340kWh', '3760kWh', '4180kWh', '5015kWh'] },
  { key: 'systemConfiguration', cells: ['8P416S', '9P416S', '10P416S', '12P416S'] },
  { key: 'cellType', merged: '3.2V 314Ah' },
  { key: 'chemistry', merged: 'LiFePO4' },
  { key: 'cycleLife', merged: '8,000 Times (70% SOH)' },
  { key: 'batteryModule', merged: '166.4V (1P52S)' },
  { key: 'batteryCluster', merged: '1331.2V (1P416S)' },
  { key: 'maxOutputPower', cells: ['1670kW', '1880kW', '2090kW', '2507.5kW'] },
  { key: 'ratedOutputVoltage', merged: '690V' },
  { key: 'acAccessMethod', merged: '3-Phase 3-Wire' },
  { key: 'ratedGridFrequency', merged: '50Hz/60Hz' },
  { key: 'conversionEfficiency', merged: '≥98.5%' },
  { key: 'coolingMethod', merged: 'Liquid' },
  { key: 'communication', merged: 'RS485, Ethernet, CAN' },
  { key: 'waterproof', merged: 'IP54 (System) / IP65 (Module)' },
  { key: 'corrosionLevel', merged: 'C4/C5 (Optional)' },
  { key: 'noiseLevel', merged: '<80dB' },
  { key: 'chargeTemperature', merged: '0°C to 60°C (32°F to 140°F)' },
  { key: 'dischargeTemperature', merged: '-30°C to 60°C (-22°F to 140°F)' },
  { key: 'storageTemperature', merged: '0°C to 35°C (32°F to 95°F)' },
  { key: 'altitude', merged: '≤4000m' },
  {
    key: 'certification',
    merged: 'IEC 61000-6-2 / 61000-6-4 / 62477-1 / 62619 / UN3536',
  },
  { key: 'warranty', merged: '5 Years / 10 Years (Optional)' },
  { key: 'dimensions', merged: '6058×2438×2896mm' },
  { key: 'weight', cells: ['~31.1T', '~34.3T', '~37.5T', '~43.9T'] },
]

export default function IndustrialProductTemplate() {
  const { language } = useLanguage()
  const tr = getIndustrialBessTemplateTranslations(language.code)
  const menuT = getMenuTranslations(language.code)
  const SLIDES = buildSlides(tr)
  const warrantyIcons = [ShieldCheck, Headset, Package, BookOpen] as const

  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeTab, setActiveTab] = useState<TabId>('advantages')

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
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

  const rowLabel = (key: string) => tr.techSpecByKey[key] ?? key

  const templateModelEntries = useMemo(
    () => industrialEntriesFromTemplateRows(STATIC_TECH_SPEC_ROWS),
    [],
  )

  return (
    <>
      <SEO
        title={tr.seoTitle}
        description={tr.seoDescription}
        canonical="/industrial-product-template"
        lang={language.code}
      />

      <article className={INDUSTRIAL_PRODUCT_ARTICLE_CLASS}>
        <nav className={INDUSTRIAL_BREADCRUMB_NAV_CLASS}>
          <Link to="/" className="hover:text-black transition-colors">
            {menuT.home}
          </Link>
          <span>/</span>
          <Link to="/produse" className="hover:text-black transition-colors">
            {menuT.produse}
          </Link>
          <span>/</span>
          <span className="truncate text-black">{tr.heroTitle}</span>
        </nav>
        <header className="text-center mb-8 sm:mb-10">
          <p className="m-0 mb-3 text-sm font-normal uppercase tracking-[0.12em] text-neutral-600 sm:mb-4 sm:text-base font-['Inter']">
            {tr.heroKicker}
          </p>
          <h1 className="text-black text-2xl sm:text-4xl lg:text-5xl font-extrabold font-['Inter'] tracking-tight leading-tight sm:leading-[48px] lg:leading-[56px] max-w-4xl mx-auto">
            {tr.heroTitle}
          </h1>
          <p className="max-w-2xl mx-auto mt-4 sm:mt-5 text-neutral-600 text-base sm:text-lg lg:text-xl font-medium font-['Inter'] leading-6 sm:leading-7 lg:leading-8">
            {tr.heroSubtitle}
          </p>
        </header>

        <div
          className="relative mx-auto w-full max-w-[1200px] aspect-[1200/520] rounded-[10px] overflow-hidden bg-neutral-100 border border-neutral-200 mb-12 sm:mb-14"
          role="region"
          aria-roledescription="carousel"
          aria-label={tr.carouselAria}
        >
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            {SLIDES[currentSlide]?.content}
          </div>

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
            {SLIDES.map((_, index) => (
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
        </div>

        {templateModelEntries.length > 0 ? (
          <div
            className="mx-auto w-full min-w-0 max-w-[1200px] mb-6 sm:mb-8"
            aria-label={tr.overviewModelsHeading}
          >
            <p className="m-0 mb-3 text-center text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 font-['Inter']">
              {tr.overviewModelsHeading}
            </p>
            <div className="flex w-full min-w-0 flex-col gap-3 lg:hidden">
              {templateModelEntries.map((entry, i) => (
                <IndustrialModelConfigurationCard
                  key={`${entry.modelName}-m-${i}`}
                  entry={entry}
                  tr={tr}
                  specLabel={rowLabel}
                  variant="compact"
                />
              ))}
            </div>
            <div
              className="hidden w-full min-w-0 gap-3 sm:gap-4 lg:grid"
              style={{
                gridTemplateColumns: `repeat(${templateModelEntries.length}, minmax(0, 1fr))`,
              }}
            >
              {templateModelEntries.map((entry, i) => (
                <div
                  key={`${entry.modelName}-d-${i}`}
                  className="group relative z-10 flex h-full min-h-0 min-w-0 flex-col pb-24 outline-none hover:z-20 focus-within:z-20"
                  tabIndex={0}
                >
                  <div className="relative flex min-h-0 flex-1 flex-col">
                    <IndustrialModelConfigurationCard
                      entry={entry}
                      tr={tr}
                      specLabel={rowLabel}
                      stretchHeight
                    />
                    <IndustrialDesktopWhatsappSlide
                      reveal="group-hover"
                      open={false}
                      productTitle={tr.heroTitle}
                      modelName={entry.modelName}
                      tr={tr}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <section className="border-t border-gray-100 pt-6 sm:pt-8">
          <h2 className="text-gray-700 text-xl lg:text-3xl font-bold font-['Inter'] leading-7 lg:leading-10 m-0 mb-6 sm:mb-7 lg:mb-8">
            {tr.overviewTitle}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-8 lg:gap-8 mb-10 lg:mb-12 items-start">
            <div className="min-w-0">
              <div className="flex flex-col gap-5 sm:gap-6 lg:gap-7">
                <p className="text-gray-700 text-base font-normal lg:font-medium font-['Inter'] leading-6 m-0">
                  {tr.overviewP1}
                </p>
                <p className="text-gray-700 text-base font-normal lg:font-medium font-['Inter'] leading-6 m-0">
                  {tr.overviewP2}
                </p>
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neutral-300 bg-white text-slate-900 px-5 py-3 font-semibold font-['Inter'] text-sm sm:text-base hover:border-slate-400 hover:bg-neutral-50 transition-colors mt-6 sm:mt-8 w-full sm:w-auto"
              >
                <Download size={18} aria-hidden />
                {tr.downloadBrochure}
              </Link>
            </div>

            <div className="min-w-0 p-5 sm:p-6 bg-neutral-100 rounded-[10px] border border-neutral-200/80">
              <img
                src="/images/shared/baterino-industrial-black.png"
                alt="Baterino Industrial"
                className="h-5 w-auto max-w-full object-contain object-left mb-3"
              />
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
            className="flex flex-wrap gap-2 border-b border-neutral-200 pb-px"
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
                {tr.keyAdvantageFeatures.map((title) => (
                  <div
                    key={title}
                    className="flex flex-col overflow-hidden rounded-[10px] border border-neutral-200/80 bg-neutral-100"
                  >
                    <h3 className="m-0 px-4 pt-4 pb-3 text-center text-base font-bold leading-snug text-black font-['Inter']">
                      {title}
                    </h3>
                    <div className="w-full shrink-0 bg-white">
                      <img
                        src={KEY_ADVANTAGE_IMAGE}
                        alt={title}
                        className="block h-auto w-full"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'spec' && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-sm font-['Inter'] text-gray-800">
                  <tbody>
                    {STATIC_TECH_SPEC_ROWS.map((row, i) => (
                      <tr
                        key={row.key}
                        className={
                          i === 0
                            ? 'bg-neutral-100'
                            : i % 2 === 1
                              ? 'bg-white'
                              : 'bg-neutral-50/80'
                        }
                      >
                        <th
                          scope="row"
                          className={`border border-neutral-200 px-3 py-2 text-left text-slate-900 ${
                            i === 0 ? 'font-semibold' : 'font-medium'
                          }`}
                        >
                          {rowLabel(row.key)}
                        </th>
                        {'merged' in row ? (
                          <td colSpan={4} className="border border-neutral-200 px-3 py-2 text-center">
                            {row.merged}
                          </td>
                        ) : (
                          row.cells.map((cell, j) => (
                            <td
                              key={`${row.key}-${j}`}
                              className={`border border-neutral-200 px-2 py-2 text-center ${
                                i === 0 ? 'font-semibold text-slate-900' : ''
                              }`}
                            >
                              {cell}
                            </td>
                          ))
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                          src={['/images/shared/delivery-icon.svg', '/images/shared/instalare-icon.svg', '/images/shared/maintance-icon.svg'][i]!}
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
                        <div
                          className="flex shrink-0 items-center justify-center py-2 text-slate-500 lg:py-0 lg:px-1"
                          aria-hidden
                        >
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
                    const Icon = warrantyIcons[idx] ?? ShieldCheck
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
                {tr.faqItems.map((item) => (
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
                      <p className="m-0 pt-3 text-sm leading-relaxed text-gray-700 sm:text-base">{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        </section>
      </article>
    </>
  )
}
