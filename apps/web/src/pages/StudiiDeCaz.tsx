import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { getStudiiDeCazTranslations } from '../i18n/studii-de-caz'
import { getPublicCaseStudies } from '../lib/api'
import SEO from '../components/SEO'
import SchemaOrg from '../components/SchemaOrg'
import CaseStudyCard, { CaseStudyCardSkeleton } from '../components/studii/CaseStudyCard'
import FeaturedCase, { categoryLabel, FeaturedCaseSkeleton } from '../components/studii/FeaturedCase'
import CaseStudyModal, { type CaseStudyModalItem } from '../components/studii/CaseStudyModal'

type CaseItem = CaseStudyModalItem & { slug: string; imageCount: number }

export default function StudiiDeCaz() {
  const { language } = useLanguage()
  const tr = getStudiiDeCazTranslations(language.code)
  const [cases, setCases] = useState<CaseItem[]>(
    tr.cases.map((c) => ({ ...c, description: '', images: [c.image], imageCount: 1 })),
  )
  const [loading, setLoading] = useState(true)
  const [activeCase, setActiveCase] = useState<CaseStudyModalItem | null>(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getPublicCaseStudies(language.code)
      .then((rows) => {
        if (cancelled) return
        if (rows.length > 0) {
          setCases(
            rows.map((row) => ({
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
            })),
          )
        } else {
          setCases(tr.cases.map((c) => ({ ...c, description: '', images: [c.image], imageCount: 1 })))
        }
      })
      .catch(() => {
        if (!cancelled) setCases(tr.cases.map((c) => ({ ...c, description: '', images: [c.image], imageCount: 1 })))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [language.code, tr.cases])

  const categories = useMemo(() => {
    const seen = new Set<string>()
    for (const item of cases) {
      if (item.category) seen.add(item.category)
    }
    return [...seen]
  }, [cases])

  const filtered = filter === 'all' ? cases : cases.filter((item) => item.category === filter)
  const featured = filtered[0]
  const rest = filtered.slice(1)
  const countLabel = `${filtered.length} ${filtered.length === 1 ? tr.projectOne : tr.projectMany}`

  return (
    <>
      <CaseStudyModal item={activeCase} onClose={() => setActiveCase(null)} />
      <SEO
        title={tr.seoTitle}
        description={tr.seoDesc}
        canonical="/studii-de-caz"
        ogImage="/images/divizii/industrial/centre-de-date.webp"
        lang={language.code}
      />
      <SchemaOrg schema={[
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Studii de caz – Baterino România',
          description: 'Proiecte reale de stocare a energiei implementate cu sisteme LithTech — industrial, rezidențial, medical și maritim.',
          url: 'https://www.baterino.ro/studii-de-caz',
          image: 'https://www.baterino.ro/images/divizii/industrial/centre-de-date.webp',
          inLanguage: 'ro',
          publisher: { '@type': 'Organization', name: 'Baterino Romania', url: 'https://www.baterino.ro', logo: 'https://www.baterino.ro/images/shared/baterino-logo-black.svg' },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Acasă', item: 'https://www.baterino.ro' },
            { '@type': 'ListItem', position: 2, name: 'Studii de Caz', item: 'https://www.baterino.ro/studii-de-caz' },
          ],
        },
      ]} />

      <article className="pb-24">
        <header className="max-w-content mx-auto px-5 lg:px-3 pt-12 lg:pt-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="m-0 text-4xl font-extrabold font-['Inter'] leading-none tracking-tight text-black sm:text-5xl lg:text-6xl">
                {tr.heroTitle}
              </h1>
              <p className="mt-4 max-w-2xl text-base font-medium font-['Inter'] leading-7 text-neutral-600 sm:text-lg">
                {tr.heroDesc}
              </p>
            </div>
            <p className="text-sm font-semibold font-['Inter'] text-neutral-900">{loading ? '—' : countLabel}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label={tr.heroTitle}>
            <button
              type="button"
              aria-pressed={filter === 'all'}
              onClick={() => setFilter('all')}
              className={`h-9 rounded-full px-4 text-sm font-semibold font-['Inter'] transition-colors ${
                filter === 'all' ? 'bg-neutral-950 text-white' : 'bg-[#f3f3f3] text-neutral-800 hover:bg-neutral-200'
              }`}
            >
              {tr.filterAll}
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={filter === category}
                onClick={() => setFilter(category)}
                className={`h-9 rounded-full px-4 text-sm font-semibold font-['Inter'] transition-colors ${
                  filter === category ? 'bg-neutral-950 text-white' : 'bg-[#f3f3f3] text-neutral-800 hover:bg-neutral-200'
                }`}
              >
                {categoryLabel(category)}
              </button>
            ))}
          </div>
        </header>

        <div className="max-w-content mx-auto px-5 lg:px-3 mt-8">
          {loading ? (
            <div aria-busy="true" aria-label={tr.heroTitle}>
              <FeaturedCaseSkeleton />
              <ul className="m-0 mt-6 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <li key={i} className="min-w-0">
                    <CaseStudyCardSkeleton />
                  </li>
                ))}
              </ul>
            </div>
          ) : featured ? (
            <>
              <FeaturedCase item={featured} viewLabel={tr.viewProject} onOpen={() => setActiveCase(featured)} />
              {rest.length > 0 ? (
                <ul className="m-0 mt-6 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2">
                  {rest.map((item) => (
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
            </>
          ) : null}
        </div>
      </article>
    </>
  )
}
