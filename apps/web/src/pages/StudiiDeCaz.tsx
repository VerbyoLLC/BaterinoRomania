import { useEffect, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { getStudiiDeCazTranslations } from '../i18n/studii-de-caz'
import { getPublicCaseStudies } from '../lib/api'
import SEO from '../components/SEO'
import SchemaOrg from '../components/SchemaOrg'
import CaseStudyCard, { CaseStudyCardSkeleton } from '../components/studii/CaseStudyCard'
import CaseStudyModal, { type CaseStudyModalItem } from '../components/studii/CaseStudyModal'
import { SectorCardsGrid } from '../components/home/HomeProiecteIndustriale'

type CaseItem = CaseStudyModalItem & { slug: string; imageCount: number }

export default function StudiiDeCaz() {
  const { language } = useLanguage()
  const tr = getStudiiDeCazTranslations(language.code)
  const [cases, setCases] = useState<CaseItem[]>(
    tr.cases.map((c) => ({ ...c, description: '', images: [c.image], imageCount: 1 })),
  )
  const [loading, setLoading] = useState(true)
  const [activeCase, setActiveCase] = useState<CaseStudyModalItem | null>(null)

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

  return (
    <>
      <CaseStudyModal item={activeCase} onClose={() => setActiveCase(null)} />
      <SEO
        title={tr.seoTitle}
        description={tr.seoDesc}
        canonical="/studii-de-caz"
        ogImage="/images/divizii/industrial/centre-de-date.jpg"
        lang={language.code}
      />
      <SchemaOrg schema={[
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Studii de caz – Baterino România',
          description: 'Proiecte reale de stocare a energiei implementate cu sisteme LithTech — industrial, rezidențial, medical și maritim.',
          url: 'https://baterino.ro/studii-de-caz',
          image: 'https://baterino.ro/images/divizii/industrial/centre-de-date.jpg',
          inLanguage: 'ro',
          publisher: { '@type': 'Organization', name: 'Baterino Romania', url: 'https://baterino.ro', logo: 'https://baterino.ro/images/shared/baterino-logo-black.svg' },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Acasă', item: 'https://baterino.ro' },
            { '@type': 'ListItem', position: 2, name: 'Studii de Caz', item: 'https://baterino.ro/studii-de-caz' },
          ],
        },
      ]} />

      <article className="max-w-content mx-auto px-5 lg:px-3 pt-12 pb-24">
        <header className="mb-10 lg:mb-14 flex flex-col items-center text-center">
          <h1 className="w-full text-black text-2xl sm:text-4xl lg:text-5xl font-extrabold font-['Inter'] leading-8 sm:leading-[48px] lg:leading-[56px] uppercase tracking-wide">
            {tr.heroTitle}
          </h1>
          <p className="max-w-[739px] text-neutral-600 text-base sm:text-lg lg:text-xl font-medium font-['Inter'] leading-6 sm:leading-7 lg:leading-8 mt-[14px]">
            {tr.heroDesc}
          </p>
        </header>

        <div className="mb-10 lg:mb-14">
          <SectorCardsGrid />
        </div>

        <h2 className="text-black text-2xl sm:text-3xl font-extrabold font-['Inter'] leading-tight mb-3 uppercase tracking-wide">
          Studii de Caz
        </h2>
        <p className="text-neutral-600 text-base font-medium font-['Inter'] leading-7 mb-8">
          Proiecte unde tehnologia de stocare cu baterii LiFePo4 pentru mediul industrial și rezidențial a fost implementată în România și Europa.
        </p>

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
                  onClick={() => setActiveCase(item)}
                />
              </li>
            ))}
          </ul>
        )}
      </article>
    </>
  )
}
