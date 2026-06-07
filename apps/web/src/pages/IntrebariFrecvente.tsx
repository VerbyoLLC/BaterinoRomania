import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Search } from 'lucide-react'
import SEO from '../components/SEO'
import SchemaOrg from '../components/SchemaOrg'
import { useLanguage } from '../contexts/LanguageContext'
import { useSeoPage } from '../contexts/SeoConfigContext'
import { getIntrebariFrecventeTranslations } from '../i18n/intrebari-frecvente'

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
}

export default function IntrebariFrecvente() {
  const { language } = useLanguage()
  const tr = getIntrebariFrecventeTranslations(language.code)
  const seo = useSeoPage('faq')
  const [query, setQuery] = useState('')

  const filteredSections = useMemo(() => {
    const q = normalizeSearchText(query)
    if (!q) return tr.sections

    return tr.sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          const haystack = normalizeSearchText(`${section.title} ${item.q} ${item.a}`)
          return haystack.includes(q)
        }),
      }))
      .filter((section) => section.items.length > 0)
  }, [query, tr.sections])

  const hasResults = filteredSections.length > 0

  return (
    <>
      <SEO
        title={seo.title || tr.pageTitle}
        description={seo.description || tr.pageDescription}
        canonical="/intrebari-frecvente"
        ogTitle={seo.ogTitle || undefined}
        ogDescription={seo.ogDescription || undefined}
        ogImage={seo.ogImage || undefined}
        lang={language.code}
      />
      <SchemaOrg schema={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: tr.sections.flatMap((section) =>
          section.items.map(({ q, a }) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: a },
          }))
        ),
      }} />

      <article className="max-w-content mx-auto px-5 lg:px-3 pt-16 pb-24">
        <header className="text-center mb-10 lg:mb-12 max-w-3xl mx-auto">
          <p className="text-black text-sm lg:text-base font-medium font-['Inter'] tracking-widest uppercase mb-3">
            FAQ
          </p>
          <h1 className="text-black text-3xl lg:text-5xl font-extrabold font-['Inter'] leading-tight">
            {tr.pageTitle}
          </h1>
          <p className="mt-4 text-gray-600 text-base lg:text-lg font-medium font-['Inter'] leading-relaxed">
            {tr.heroSubtitle}
          </p>

          <div className="relative mt-8 mx-auto max-w-xl">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tr.searchPlaceholder}
              aria-label={tr.searchPlaceholder}
              className="box-border h-12 w-full rounded-full border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/80 font-['Inter']"
            />
          </div>
        </header>

        <div className="mx-auto max-w-3xl space-y-12">
          {!hasResults ? (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-600 font-['Inter']">
              {tr.noResults}
            </p>
          ) : (
            filteredSections.map((section) => (
              <section key={section.id} aria-labelledby={`faq-section-${section.id}`}>
                <h2
                  id={`faq-section-${section.id}`}
                  className="text-black text-xl lg:text-2xl font-extrabold font-['Inter'] mb-4"
                >
                  {section.title}
                </h2>
                <div className="divide-y divide-neutral-200 rounded-[10px] border border-neutral-200/80 bg-neutral-50/80">
                  {section.items.map((item, i) => (
                    <details
                      key={`${section.id}-${i}`}
                      className="group bg-white open:bg-neutral-50/50"
                      open={query.trim().length > 0 ? true : undefined}
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-left font-semibold text-slate-900 sm:px-5 sm:py-4 [&::-webkit-details-marker]:hidden">
                        <span className="min-w-0 flex-1 text-sm leading-snug sm:text-base">{item.q}</span>
                        <ChevronDown
                          size={22}
                          strokeWidth={2}
                          className="shrink-0 text-slate-600 transition-transform duration-200 group-open:rotate-180"
                          aria-hidden
                        />
                      </summary>
                      <div className="border-t border-neutral-100 px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
                        <p className="m-0 pt-3 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap font-['Inter']">
                          {item.a}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        <p className="mt-14 text-center text-sm text-gray-600 font-['Inter']">
          {tr.contactCta}{' '}
          <Link to="/contact" className="font-semibold text-slate-900 underline underline-offset-2 hover:text-black">
            {tr.contactLink}
          </Link>
          .
        </p>
      </article>
    </>
  )
}
