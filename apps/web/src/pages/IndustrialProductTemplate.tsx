import { Fragment, useState, type ReactNode } from 'react'
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
import SEO from '../components/SEO'

type Slide = { title: string; content: ReactNode }

const TABS = [
  { id: 'advantages' as const, label: 'Key Advantages' },
  { id: 'spec' as const, label: 'Technical specification' },
  { id: 'services' as const, label: 'Baterino services' },
  { id: 'warranty' as const, label: 'Warranty and support' },
  { id: 'faq' as const, label: "FAQ's" },
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

const SLIDES: Slide[] = [
  {
    title: '20FT Container system overview',
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
          20FT Container system overview
        </text>
      </svg>
    ),
  },
  {
    title: 'System architecture',
    content: (
      <svg viewBox="0 0 600 400" className="w-full max-w-2xl h-auto">
        <BgDefs id="bess-bg-2" />
        <rect width="600" height="400" fill="url(#bess-bg-2)" />
        <rect x="80" y="100" width="440" height="200" fill="white" stroke="#d1d5db" strokeWidth="2" rx="6" />
        <circle cx="150" cy="150" r="35" fill="#6b7280" />
        <text x="150" y="155" textAnchor="middle" fontSize="14" fontWeight="500" fill="white">
          Battery
        </text>
        <circle cx="300" cy="150" r="35" fill="#6b7280" />
        <text x="300" y="155" textAnchor="middle" fontSize="14" fontWeight="500" fill="white">
          BMS
        </text>
        <circle cx="450" cy="150" r="35" fill="#6b7280" />
        <text x="450" y="155" textAnchor="middle" fontSize="14" fontWeight="500" fill="white">
          Cooling
        </text>
        <line x1="185" y1="150" x2="265" y2="150" stroke="#e5e7eb" strokeWidth="2" />
        <line x1="335" y1="150" x2="415" y2="150" stroke="#e5e7eb" strokeWidth="2" />
        <rect x="100" y="220" width="380" height="50" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1" rx="4" />
        <text x="300" y="252" textAnchor="middle" fontSize="13" fontWeight="500" fill="#1f2937">
          Integrated power management & control system
        </text>
        <text x="300" y="330" textAnchor="middle" fontSize="18" fontWeight="500" fill="#1f2937">
          System architecture
        </text>
      </svg>
    ),
  },
  {
    title: 'Modular liquid cooling system',
    content: (
      <svg viewBox="0 0 600 400" className="w-full max-w-2xl h-auto">
        <BgDefs id="bess-bg-3" />
        <rect width="600" height="400" fill="url(#bess-bg-3)" />
        <rect x="60" y="80" width="480" height="250" fill="white" stroke="#d1d5db" strokeWidth="2" rx="6" />
        <text x="300" y="110" textAnchor="middle" fontSize="14" fontWeight="500" fill="#1f2937">
          Thermal management
        </text>
        <path d="M 150 160 Q 150 130 180 130 L 420 130 Q 450 130 450 160" fill="none" stroke="#6b7280" strokeWidth="3" />
        <text x="300" y="155" textAnchor="middle" fontSize="12" fill="#6b7280">
          Liquid cooling loop
        </text>
        <rect x="120" y="180" width="70" height="80" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1.5" rx="3" />
        <text x="155" y="225" textAnchor="middle" fontSize="11" fill="#1f2937">
          Battery
        </text>
        <rect x="220" y="180" width="70" height="80" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1.5" rx="3" />
        <text x="255" y="225" textAnchor="middle" fontSize="11" fill="#1f2937">
          Heat
        </text>
        <rect x="320" y="180" width="70" height="80" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1.5" rx="3" />
        <text x="355" y="225" textAnchor="middle" fontSize="11" fill="#1f2937">
          Exchanger
        </text>
        <rect x="420" y="180" width="70" height="80" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1.5" rx="3" />
        <text x="455" y="225" textAnchor="middle" fontSize="11" fill="#1f2937">
          Radiator
        </text>
        <path
          d="M 155 180 L 255 180 M 255 180 L 355 180 M 355 180 L 455 180"
          stroke="#e5e7eb"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,5"
        />
        <text x="300" y="330" textAnchor="middle" fontSize="18" fontWeight="500" fill="#1f2937">
          Modular liquid cooling system
        </text>
      </svg>
    ),
  },
  {
    title: 'Key technical parameters',
    content: (
      <svg viewBox="0 0 600 400" className="w-full max-w-2xl h-auto">
        <BgDefs id="bess-bg-4" />
        <rect width="600" height="400" fill="url(#bess-bg-4)" />
        <rect x="80" y="100" width="440" height="220" fill="white" stroke="#d1d5db" strokeWidth="2" rx="6" />
        <text x="300" y="135" textAnchor="middle" fontSize="14" fontWeight="500" fill="#1f2937">
          Specifications
        </text>
        <line x1="80" y1="145" x2="520" y2="145" stroke="#e5e7eb" strokeWidth="1" />
        <rect x="100" y="160" width="380" height="130" fill="#f9fafb" stroke="#f3f4f6" strokeWidth="0.5" rx="2" />
        <text x="120" y="185" fontSize="12" fill="#1f2937">
          Capacity: 334–501.5 kWh
        </text>
        <text x="120" y="210" fontSize="12" fill="#1f2937">
          Voltage: 1331.2V nominal
        </text>
        <text x="120" y="235" fontSize="12" fill="#1f2937">
          Power: 1670–2507.5 kW
        </text>
        <text x="120" y="260" fontSize="12" fill="#1f2937">
          Cycles: 8,000 @ 70% SOH (20yr)
        </text>
        <text x="120" y="285" fontSize="12" fill="#1f2937">
          Efficiency: ≥98.5%
        </text>
        <text x="300" y="330" textAnchor="middle" fontSize="18" fontWeight="500" fill="#1f2937">
          Key technical parameters
        </text>
      </svg>
    ),
  },
]

const KEY_ADVANTAGE_IMAGE = '/images/shared/bess-key-advantage-box.png'

const FEATURES = [
  { title: 'Modular liquid cooling' },
  { title: 'Flexible expansion' },
  { title: 'LiFePO₄ chemistry' },
  { title: 'Low noise design' },
  { title: 'DC-side turnkey solution' },
  { title: 'Multi-scenario deployment' },
  { title: 'Advanced fire safety' },
  { title: 'Remote monitoring' },
] as const

type TechSpecRow =
  | { label: string; merged: string }
  | { label: string; cells: readonly [string, string, string, string] }

const TECH_SPEC_ROWS: TechSpecRow[] = [
  {
    label: 'Model',
    cells: ['LTS1331314L-01', 'LTS1331314L-02', 'LTS1331314L-03', 'LTS1331314L-04'],
  },
  { label: 'Energy System', merged: '0.5C' },
  { label: 'Nominal Voltage', merged: '1331.2V' },
  { label: 'Nominal Capacity', merged: '3140Ah' },
  { label: 'Nominal Energy', cells: ['3340kWh', '3760kWh', '4180kWh', '5015kWh'] },
  { label: 'System Configuration', cells: ['8P416S', '9P416S', '10P416S', '12P416S'] },
  { label: 'Cell Type', merged: '3.2V 314Ah' },
  { label: 'Chemistry', merged: 'LiFePO4' },
  { label: 'Cycle life', merged: '8,000 Times (70% SOH)' },
  { label: 'Battery Module', merged: '166.4V (1P52S)' },
  { label: 'Battery Cluster', merged: '1331.2V (1P416S)' },
  { label: 'Max Output Power', cells: ['1670kW', '1880kW', '2090kW', '2507.5kW'] },
  { label: 'Rated Output Voltage', merged: '690V' },
  { label: 'AC Access Method', merged: '3-Phase 3-Wire' },
  { label: 'Rated Grid Frequency', merged: '50Hz/60Hz' },
  { label: 'Conversion Efficiency', merged: '≥98.5%' },
  { label: 'Cooling Method', merged: 'Liquid' },
  { label: 'Communication', merged: 'RS485, Ethernet, CAN' },
  { label: 'Waterproof', merged: 'IP54 (System) / IP65 (Module)' },
  { label: 'Corrosion Level', merged: 'C4/C5 (Optional)' },
  { label: 'Noise Level', merged: '<80dB' },
  { label: 'Charge Temperature', merged: '0°C to 60°C (32°F to 140°F)' },
  { label: 'Discharge Temperature', merged: '-30°C to 60°C (-22°F to 140°F)' },
  { label: 'Storage Temperature', merged: '0°C to 35°C (32°F to 95°F)' },
  { label: 'Altitude', merged: '≤4000m' },
  {
    label: 'Certification',
    merged: 'IEC 61000-6-2 / 61000-6-4 / 62477-1 / 62619 / UN3536',
  },
  { label: 'Warranty', merged: '5 Years / 10 Years (Optional)' },
  { label: 'Dimensions [L×W×H]', merged: '6058×2438×2896mm' },
  { label: 'Weight', cells: ['~31.1T', '~34.3T', '~37.5T', '~43.9T'] },
]

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

const FAQ_ITEMS = [
  {
    question: 'What energy capacity does the 20FT Container BESS provide?',
    answer:
      'The system scales from 334 kWh up to 501.5 kWh in a single 20-foot container, with modular design so capacity and power conversion can be aligned to your site load profile and grid requirements.',
  },
  {
    question: 'Which deployment scenarios does this BESS support?',
    answer:
      'It is suitable for grid-side services, transmission and distribution support, and behind-the-meter C&I applications—including peak shaving, backup, and hybrid plant buffering where liquid cooling and footprint are priorities.',
  },
  {
    question: 'Why use liquid cooling instead of air cooling?',
    answer:
      'Liquid cooling maintains tighter, more uniform cell temperatures, which supports higher-duty cycling, improves safety margins, and can extend useful life compared with many air-cooled alternatives in the same footprint.',
  },
  {
    question: 'What warranty and technical support is typical?',
    answer:
      'Standard coverage includes a five-year manufacturer warranty on major components, with ten-year options for critical deployments. Baterino can align remote monitoring, spare parts, and training with your operations model—see the Warranty and support tab for detail.',
  },
  {
    question: 'Does Baterino cover logistics, installation, and commissioning?',
    answer:
      'Yes. We support importing and sourcing, professional installation and commissioning, and after-sales service including maintenance and performance optimization, so you have a single path from contract signature to stable operation.',
  },
] as const

export default function IndustrialProductTemplate() {
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

  return (
    <>
      <SEO
        title="20FT Container BESS | Baterino"
        description="20FT Container Battery Energy Storage System — modular liquid cooling, 334–501.5 kWh, industrial-grade energy storage. Grid, transmission, and user-side deployment."
        canonical="/industrial-product-template"
      />

      <article className="max-w-content mx-auto px-5 lg:px-3 pt-16 lg:pt-24 pb-16 lg:pb-20">
        {/* Hero — matches Industrial / division typography */}
        <header className="text-center mb-8 sm:mb-10">
          <p className="m-0 mb-3 text-sm font-normal uppercase tracking-[0.12em] text-neutral-600 sm:mb-4 sm:text-base font-['Inter']">
            Baterino Introducing LithTech&apos;s
          </p>
          <h1 className="text-black text-2xl sm:text-4xl lg:text-5xl font-extrabold font-['Inter'] tracking-tight leading-tight sm:leading-[48px] lg:leading-[56px] max-w-4xl mx-auto">
            20FT Container Battery Energy Storage System (BESS)
          </h1>
          <p className="max-w-2xl mx-auto mt-4 sm:mt-5 text-neutral-600 text-base sm:text-lg lg:text-xl font-medium font-['Inter'] leading-6 sm:leading-7 lg:leading-8">
            Modular liquid cooling · 334–501.5 kWh · Industrial-grade energy storage
          </p>
        </header>

        {/* Slider — fixed aspect 1200×520 (scales with width, caps at 1200px wide) */}
        <div
          className="relative mx-auto w-full max-w-[1200px] aspect-[1200/520] rounded-[10px] overflow-hidden bg-neutral-100 shadow-lg border border-neutral-200 mb-12 sm:mb-14"
          role="region"
          aria-roledescription="carousel"
          aria-label="BESS product diagrams"
        >
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            {SLIDES[currentSlide].content}
          </div>

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
            {SLIDES.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide ? 'w-8 bg-slate-900' : 'w-2 bg-white/90 hover:bg-white border border-neutral-200 shadow-sm'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentSlide}
              />
            ))}
          </div>
        </div>

        {/* Overview — full-width title, then 2 cols: copy (2fr) | Contact card (1fr) */}
        <section className="border-t border-gray-100 pt-10 sm:pt-12">
          <h2 className="text-gray-700 text-xl lg:text-3xl font-bold font-['Inter'] leading-7 lg:leading-10 m-0 mb-6 sm:mb-7 lg:mb-8">
            Overview
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-8 lg:gap-8 mb-10 lg:mb-12 items-start">
            <div className="min-w-0">
              <div className="flex flex-col gap-5 sm:gap-6 lg:gap-7">
                <p className="text-gray-700 text-base font-normal lg:font-medium font-['Inter'] leading-6 m-0">
                  The 20FT Container BESS delivers 334–501.5 kWh of modular energy storage with advanced liquid cooling,
                  flexible expansion, and industry-leading reliability. Supports grid-side, transmission-side, and user-side
                  deployment scenarios.
                </p>
                <p className="text-gray-700 text-base font-normal lg:font-medium font-['Inter'] leading-6 m-0">
                  We handle everything: sourcing, installation, commissioning, maintenance, and technical support. Our
                  integrated service model ensures optimal performance throughout the system&apos;s lifecycle.
                </p>
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neutral-300 bg-white text-slate-900 px-5 py-3 font-semibold font-['Inter'] text-sm sm:text-base hover:border-slate-400 hover:bg-neutral-50 transition-colors mt-6 sm:mt-8 w-full sm:w-auto"
              >
                <Download size={18} aria-hidden />
                Download Brochure
              </Link>
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

        {/* Tabs — same pattern as original industrial product template */}
        <section className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-gray-100 pb-8 sm:pb-10">
          <div
            className="flex flex-wrap gap-2 border-b border-neutral-200 pb-px"
            role="tablist"
            aria-label="Product details"
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
                {tab.label}
              </button>
            ))}
          </div>

          <div role="tabpanel" className="mt-6 sm:mt-8 font-['Inter']">
            {activeTab === 'advantages' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                {FEATURES.map((feature) => (
                  <div
                    key={feature.title}
                    className="flex flex-col overflow-hidden rounded-[10px] border border-neutral-200/80 bg-neutral-100"
                  >
                    <h3 className="m-0 px-4 pt-4 pb-3 text-center text-base font-bold leading-snug text-black font-['Inter']">
                      {feature.title}
                    </h3>
                    <div className="aspect-[2/1] w-full shrink-0 bg-white">
                      <img
                        src={KEY_ADVANTAGE_IMAGE}
                        alt={feature.title}
                        className="h-full w-full object-cover"
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
                    {TECH_SPEC_ROWS.map((row, i) => (
                      <tr
                        key={row.label}
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
                          {row.label}
                        </th>
                        {'merged' in row ? (
                          <td
                            colSpan={4}
                            className="border border-neutral-200 px-3 py-2 text-center"
                          >
                            {row.merged}
                          </td>
                        ) : (
                          row.cells.map((cell, j) => (
                            <td
                              key={`${row.label}-${j}`}
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
                        <h4 className="m-0 mb-2 text-base font-bold text-black font-['Inter'] leading-snug">
                          {step.title}
                        </h4>
                        <p className="m-0 text-sm leading-relaxed text-gray-700 sm:text-base font-['Inter']">
                          {step.body}
                        </p>
                      </div>
                      {i < BATERINO_SERVICE_STEPS.length - 1 && (
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
                      <Icon
                        className="mb-3 h-12 w-12 shrink-0 text-black"
                        strokeWidth={2}
                        aria-hidden
                      />
                      <h4 className="m-0 mb-2 text-base font-bold text-black font-['Inter'] leading-snug">{title}</h4>
                      <p className="m-0 text-sm leading-relaxed text-gray-700 sm:text-base font-['Inter']">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'faq' && (
              <div className="divide-y divide-neutral-200 rounded-[10px] border border-neutral-200/80 bg-neutral-50/80">
                {FAQ_ITEMS.map((item) => (
                  <details key={item.question} className="group bg-white open:bg-neutral-50/50">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-left font-semibold text-slate-900 sm:px-5 sm:py-4 [&::-webkit-details-marker]:hidden">
                      <span className="min-w-0 flex-1 text-base leading-snug">{item.question}</span>
                      <ChevronDown
                        size={22}
                        strokeWidth={2}
                        className="shrink-0 text-slate-600 transition-transform duration-200 group-open:rotate-180"
                        aria-hidden
                      />
                    </summary>
                    <div className="border-t border-neutral-100 px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
                      <p className="m-0 pt-3 text-sm leading-relaxed text-gray-700 sm:text-base">{item.answer}</p>
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
