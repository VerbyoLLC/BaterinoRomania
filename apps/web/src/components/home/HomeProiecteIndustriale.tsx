import { useLanguage } from '../../contexts/LanguageContext'
import { getHomeTranslations } from '../../i18n/home'
import HomeInstalledCapacityCounters from './HomeInstalledCapacityCounters'
import HomeCaseStudiesPreview from './HomeCaseStudiesPreview'

// ── Icons ─────────────────────────────────────────────────────────────────────

function SolarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
    </svg>
  )
}

function ZapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function MedicalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12h6M12 9v6" />
    </svg>
  )
}

function FactoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden>
      <path d="M2 21h20" />
      <path d="M2 21V7l7-4v4l7-4v4l7-4v14" />
      <path d="M6 14v2M11 14v2M16 14v2" />
    </svg>
  )
}


function HomeGridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
      <circle cx="18" cy="8" r="2" />
      <path d="M18 6V3M16.5 9.5L15 11M19.5 9.5L21 11" />
    </svg>
  )
}

function BatteryChargingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden>
      <rect x="1" y="6" width="18" height="12" rx="2" />
      <line x1="22" y1="10" x2="22" y2="14" />
      <polyline points="11 6 7 12 13 12 9 18" />
    </svg>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

const TEXT = {
  ro: {
    eyebrow: 'Industrial',
    title: 'EPC PROIECTE INDUSTRIALE\nÎN ROMÂNIA',
    subtitle: 'Importăm și implementăm sisteme de stocare BESS industriale în România, în toate sectoarele.',
    cta: 'Vezi toate proiectele',
    sectors: [
      {
        label: 'Parcuri Fotovoltaice',
        desc: 'Sisteme BESS la scară MW pentru stocare și echilibrare în parcuri solare.',
        Icon: SolarIcon,
      },
      {
        label: 'Stații EV',
        desc: 'Stocare tampon pentru stații de încărcare rapidă, fără vârfuri de consum în rețea.',
        Icon: ZapIcon,
      },
      {
        label: 'Facilități Medicale',
        desc: 'Backup de lungă durată pentru echipamente și infrastructuri medicale critice.',
        Icon: MedicalIcon,
      },
      {
        label: 'Unități de producție',
        desc: 'Continuitate operațională și optimizare consum energetic în procesele industriale.',
        Icon: FactoryIcon,
      },
      {
        label: 'Micro rețele rezidențiale',
        desc: 'Sisteme de stocare pentru comunități rezidențiale cu panouri solare, asigurând autonomie energetică și reducerea costurilor.',
        Icon: HomeGridIcon,
      },
      {
        label: 'Parcuri de stocare a energiei',
        desc: 'Soluții utility-scale pentru stabilizarea rețelelor electrice și stocarea energiei regenerabile.',
        Icon: BatteryChargingIcon,
      },
    ],
  },
  en: {
    eyebrow: 'Industrial',
    title: 'EPC INDUSTRIAL PROJECTS\nIN ROMANIA',
    subtitle: 'We import and implement industrial BESS energy storage systems in Romania, across all sectors.',
    cta: 'View all projects',
    sectors: [
      {
        label: 'Solar Parks',
        desc: 'MW-scale BESS for storage and grid balancing in photovoltaic parks.',
        Icon: SolarIcon,
      },
      {
        label: 'EV Stations',
        desc: 'Buffer storage for fast-charging stations, eliminating peak demand from the grid.',
        Icon: ZapIcon,
      },
      {
        label: 'Medical Facilities',
        desc: 'Long-duration backup for critical medical equipment and infrastructure.',
        Icon: MedicalIcon,
      },
      {
        label: 'Production Units',
        desc: 'Operational continuity and energy optimization in industrial processes.',
        Icon: FactoryIcon,
      },
      {
        label: 'Residential Microgrids',
        desc: 'Storage systems for residential communities with solar panels, ensuring energy autonomy and cost reduction.',
        Icon: HomeGridIcon,
      },
      {
        label: 'Energy Storage Parks',
        desc: 'Utility-scale solutions for power grid stabilization and renewable energy storage.',
        Icon: BatteryChargingIcon,
      },
    ],
  },
}

// ── Component ─────────────────────────────────────────────────────────────────

/** Reusable 6-card sector grid — used on Home and Studii de Caz pages. */
export function SectorCardsGrid() {
  const { language } = useLanguage()
  const t = TEXT[language.code as 'ro' | 'en'] ?? TEXT.ro

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-[10px] sm:gap-3 lg:gap-4">
      {t.sectors.map(({ label, desc, Icon }) => (
        <div
          key={label}
          className="flex flex-col rounded-[10px] bg-[#f7f7f7] px-4 py-5 sm:px-5 sm:py-6 lg:px-6 lg:py-6 transition-shadow duration-200 hover:shadow-lg"
        >
          <div className="mb-3 size-9 sm:size-10 text-black shrink-0">
            <Icon />
          </div>
          <h3 className="mb-1.5 text-sm font-semibold font-['Inter'] leading-snug text-black sm:text-base">
            {label}
          </h3>
          <p className="flex-1 text-xs font-normal font-['Inter'] leading-relaxed text-gray-600 sm:text-sm sm:leading-5">
            {desc}
          </p>
        </div>
      ))}
    </div>
  )
}

export default function HomeProiecteIndustriale() {
  const { language } = useLanguage()
  const t = TEXT[language.code as 'ro' | 'en'] ?? TEXT.ro

  return (
    <section id="proiecte-industriale" className="mb-16 lg:mb-24 scroll-mt-24">

      {/* ── Header ── */}
      <div className="flex flex-col items-center text-center mb-10 lg:mb-12">
        <h2 className="text-black text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Inter'] leading-tight mb-3 uppercase whitespace-pre-line">
          {t.title}
        </h2>
        <p className="text-gray-600 text-base lg:text-lg font-normal font-['Inter'] leading-7 max-w-[580px]">
          {t.subtitle}
        </p>
      </div>

      {/* ── 6 sector boxes ── */}
      <div className="mb-10 lg:mb-12">
        <SectorCardsGrid />
      </div>

      <HomeInstalledCapacityCounters tr={getHomeTranslations(language.code)} />
      <HomeCaseStudiesPreview />

    </section>
  )
}
