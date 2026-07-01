import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { getPublicCaseStudies, type CaseStudyRow } from '../../lib/api'
import { getStudiiDeCazTranslations } from '../../i18n/studii-de-caz'
import CaseStudyCard, { CaseStudyCardSkeleton } from '../studii/CaseStudyCard'

const CTA_LABEL = { ro: 'Vezi toate proiectele', en: 'View all projects' }

export default function HomeCaseStudiesPreview() {
  const { language } = useLanguage()
  const tr = getStudiiDeCazTranslations(language.code)
  const cta = CTA_LABEL[language.code as 'ro' | 'en'] ?? CTA_LABEL.ro
  const [cases, setCases] = useState<CaseStudyRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getPublicCaseStudies(language.code)
      .then((rows) => { if (!cancelled) setCases(rows.slice(0, 3)) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [language.code])

  return (
    <section className="mb-0">
      {loading ? (
        <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="min-w-0"><CaseStudyCardSkeleton /></li>
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
                image={item.images?.[0] || item.image}
                imageAlt={item.imageAlt}
                imageCount={item.images?.length ?? item.imageCount}
                galleryLabel={tr.galleryPhotosAria}
                specs={item.specs}
                tags={item.tags}
                to={`/studii-de-caz/${item.slug}`}
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
