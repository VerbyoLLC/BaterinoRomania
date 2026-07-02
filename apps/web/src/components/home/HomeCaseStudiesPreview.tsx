import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { getPublicCaseStudies } from '../../lib/api'
import { getStudiiDeCazTranslations } from '../../i18n/studii-de-caz'
import CaseStudyCard, { CaseStudyCardSkeleton } from '../studii/CaseStudyCard'
import CaseStudyModal, { type CaseStudyModalItem } from '../studii/CaseStudyModal'

const CTA_LABEL = { ro: 'Vezi toate proiectele', en: 'View all projects' }

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
          setCases(rows.slice(0, 3).map(mapRowToCaseItem))
        } else {
          setCases(
            tr.cases.slice(0, 3).map((c) => ({
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
            tr.cases.slice(0, 3).map((c) => ({
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

  return (
    <section className="mb-0">
      <CaseStudyModal item={activeCase} onClose={() => setActiveCase(null)} />

      {loading ? (
        <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="min-w-0">
              <CaseStudyCardSkeleton />
            </li>
          ))}
        </ul>
      ) : cases.length > 0 ? (
        <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((item) => (
            <li key={item.slug} className="min-w-0">
              <CaseStudyCard
                category={item.category}
                title={item.title}
                location={item.location}
                image={item.image}
                imageAlt={item.imageAlt}
                imageCount={item.imageCount}
                galleryLabel={tr.galleryPhotosAria}
                specs={item.specs}
                tags={item.tags}
                onClick={() => setActiveCase(item)}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {!loading && (
        <div className="mt-8 flex justify-center">
          <Link
            to="/studii-de-caz"
            className="inline-flex items-center gap-2 h-12 px-7 rounded-[10px] bg-slate-900 text-white text-sm font-semibold font-['Inter'] hover:bg-slate-800 transition-colors"
          >
            {cta}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </section>
  )
}
