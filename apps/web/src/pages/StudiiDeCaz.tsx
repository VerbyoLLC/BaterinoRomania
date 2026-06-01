import { useEffect, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { getStudiiDeCazTranslations } from '../i18n/studii-de-caz'
import { getPublicCaseStudies } from '../lib/api'
import SEO from '../components/SEO'
import CaseStudyCard, { CaseStudyCardSkeleton } from '../components/studii/CaseStudyCard'

export default function StudiiDeCaz() {
  const { language } = useLanguage()
  const tr = getStudiiDeCazTranslations(language.code)
  const [cases, setCases] = useState(tr.cases)
  const [loading, setLoading] = useState(true)

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
              image: row.images?.[0] || row.image,
              imageAlt: row.imageAlt,
              imageCount: row.images?.length ?? row.imageCount,
              specs: row.specs,
              tags: row.tags,
            })),
          )
        } else {
          setCases(tr.cases)
        }
      })
      .catch(() => {
        if (!cancelled) setCases(tr.cases)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [language.code, tr.cases])

  return (
    <>
      <SEO
        title={tr.seoTitle}
        description={tr.seoDesc}
        canonical="/studii-de-caz"
        ogImage="/images/divizii/industrial/centre-de-date.jpg"
        lang={language.code}
      />

      <article className="max-w-content mx-auto px-5 lg:px-3 pt-12 pb-24">
        <header className="mb-10 lg:mb-14 flex flex-col items-center text-center">
          <h1 className="w-full text-black text-2xl sm:text-4xl lg:text-5xl font-extrabold font-['Inter'] leading-8 sm:leading-[48px] lg:leading-[56px]">
            {tr.heroTitle}
          </h1>
          <p className="max-w-[739px] text-neutral-600 text-base sm:text-lg lg:text-xl font-medium font-['Inter'] leading-6 sm:leading-7 lg:leading-8 mt-[14px]">
            {tr.heroDesc}
          </p>
        </header>

        {loading ? (
          <ul
            className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3"
            aria-busy="true"
            aria-label={tr.heroTitle}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="min-w-0">
                <CaseStudyCardSkeleton />
              </li>
            ))}
          </ul>
        ) : (
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
                />
              </li>
            ))}
          </ul>
        )}
      </article>
    </>
  )
}
