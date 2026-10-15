import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { getPublicCaseStudies } from '../../lib/api'
import { getHomeTranslations } from '../../i18n/home'
import { getStudiiDeCazTranslations } from '../../i18n/studii-de-caz'
import CaseStudyModal, { type CaseStudyModalItem } from '../studii/CaseStudyModal'
import FeaturedCase, { FeaturedCaseSkeleton } from '../studii/FeaturedCase'

const CTA_LABEL = { ro: 'Vezi toate proiectele', en: 'View all projects' }

const CAPACITY = [
  { mw: 20, titleKey: 'capacityCounter1Title', subtitleKey: 'capacityCounter1Subtitle' },
  { mw: 4, titleKey: 'capacityCounter2Title', subtitleKey: null },
  { mw: 8, titleKey: 'capacityCounter3Title', subtitleKey: null },
  { mw: 2, titleKey: 'capacityCounter4Title', subtitleKey: null },
  { mw: 1, titleKey: 'capacityCounter5Title', subtitleKey: null },
] as const

type CaseItem = CaseStudyModalItem & { slug: string; imageCount: number }

function mapRowToCaseItem(row: {
  slug: string
  category: string
  title: string
  location: string
  description: string
  image: string
  imageAlt: string
  images: string[]
  imageCount: number
  specs: CaseStudyModalItem['specs']
  tags: string[]
}): CaseItem {
  return {
    slug: row.slug,
    category: row.category,
    title: row.title,
    location: row.location,
    description: row.description || '',
    image: row.images?.[0] || row.image,
    imageAlt: row.imageAlt,
    images: row.images?.length ? row.images : [row.image],
    imageCount: row.images?.length ?? row.imageCount,
    specs: row.specs,
    tags: row.tags,
  }
}

export default function HomeCaseStudiesPreview() {
  const { language } = useLanguage()
  const tr = getStudiiDeCazTranslations(language.code)
  const home = getHomeTranslations(language.code)
  const cta = CTA_LABEL[language.code as 'ro' | 'en'] ?? CTA_LABEL.ro
  const [cases, setCases] = useState<CaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCase, setActiveCase] = useState<CaseStudyModalItem | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getPublicCaseStudies(language.code)
      .then((rows) => {
        if (cancelled) return
        if (rows.length > 0) {
          setCases(rows.slice(0, 1).map(mapRowToCaseItem))
        } else {
          setCases(
            tr.cases.slice(0, 1).map((c) => ({
              ...c,
              description: '',
              images: [c.image],
              imageCount: c.imageCount ?? 1,
            })),
          )
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCases(
            tr.cases.slice(0, 1).map((c) => ({
              ...c,
              description: '',
              images: [c.image],
              imageCount: c.imageCount ?? 1,
            })),
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [language.code, tr.cases])

  const current = cases[0]
  const [total, ...segments] = CAPACITY

  return (
    <section className="mb-0">
      <CaseStudyModal item={activeCase} onClose={() => setActiveCase(null)} />

      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
        <div>
          <h3 className="m-0 mb-6 text-2xl font-extrabold font-['Inter'] leading-tight text-black sm:text-3xl">
            {home.capacitySectionTitle}
          </h3>
          <p className="m-0 flex items-baseline gap-2 font-extrabold font-['Inter'] tabular-nums leading-none text-black">
            <span className="text-6xl sm:text-7xl">{total.mw}</span>
            <span className="text-xl font-bold text-neutral-400">{home.capacityMwUnit}</span>
          </p>
          <p className="m-0 mt-3 text-lg font-semibold font-['Inter'] text-black">{home[total.titleKey]}</p>
          {total.subtitleKey ? (
            <p className="m-0 mt-1 text-sm font-medium font-['Inter'] text-neutral-500">{home[total.subtitleKey]}</p>
          ) : null}
          <ul className="m-0 mt-8 list-none border-t border-neutral-200 p-0">
            {segments.map((item) => (
              <li key={item.titleKey} className="flex items-baseline gap-4 border-b border-neutral-200 py-3.5">
                <span className="flex w-24 shrink-0 items-baseline gap-1 font-extrabold font-['Inter'] tabular-nums leading-none text-black">
                  <span className="text-3xl">{item.mw}</span>
                  <span className="text-sm font-bold text-neutral-400">{home.capacityMwUnit}</span>
                </span>
                <span className="text-base font-semibold font-['Inter'] text-black">{home[item.titleKey]}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/studii-de-caz"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-[10px] bg-slate-900 px-7 text-sm font-semibold font-['Inter'] text-white transition-colors hover:bg-slate-800"
          >
            {cta}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        {loading ? (
          <FeaturedCaseSkeleton stacked />
        ) : current ? (
          <FeaturedCase
            stacked
            item={current}
            viewLabel={tr.viewProject}
            showDetails={false}
            showAction={false}
            onOpen={() => setActiveCase(current)}
          />
        ) : null}
      </div>
    </section>
  )
}
