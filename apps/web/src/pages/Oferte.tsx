import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { getOferteTranslations } from '../i18n/oferte'
import { getAllOferte } from '../lib/oferteData'
import { getAuthRole } from '../lib/api'
import SEO from '../components/SEO'
import SchemaOrg from '../components/SchemaOrg'

// Admin is exempt so the site operator can always preview/test this page.
const RESTRICTED_ROLES = new Set(['partener', 'sales_agent'])

export default function Oferte() {
  const { language } = useLanguage()
  const tr = getOferteTranslations(language.code)
  const navigate = useNavigate()
  const oferte = getAllOferte()

  // Visible to guests, clients, and admin (for QA) — partners/sales agents get sent home.
  useEffect(() => {
    if (RESTRICTED_ROLES.has(getAuthRole() ?? '')) navigate('/', { replace: true })
  }, [navigate])

  const fmtPrice = (n: number) => `${n.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} RON`

  return (
    <>
      <SEO title={tr.seoTitle} description={tr.seoDesc} canonical="/oferte" lang={language.code} />
      <SchemaOrg
        schema={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: tr.breadcrumbHome, item: 'https://www.baterino.ro' },
            { '@type': 'ListItem', position: 2, name: tr.breadcrumbOferte, item: 'https://www.baterino.ro/oferte' },
          ],
        }}
      />

      <article className="max-w-content mx-auto px-5 lg:px-3 pt-12 pb-24">
        <header className="mb-8 flex flex-col items-center gap-3 text-center sm:mb-10">
          <h1 className="text-black text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Inter'] leading-tight uppercase">
            {tr.pageTitle}
          </h1>
          <p className="max-w-[640px] text-base font-normal font-['Inter'] leading-6 text-gray-600 sm:text-lg">
            {tr.pageSubtitle}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {oferte.map((oferta) => (
            <Link
              key={oferta.slug}
              to={`/oferte/${oferta.slug}`}
              className="group flex flex-col overflow-hidden rounded-[10px] border border-neutral-200 bg-white transition-shadow duration-200 hover:shadow-lg"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                <img
                  src={oferta.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h2 className="text-lg font-bold font-['Inter'] leading-snug text-black">{oferta.title}</h2>
                <p className="flex-1 text-sm font-normal font-['Inter'] leading-relaxed text-gray-600">
                  {oferta.description}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-lg font-bold font-['Inter'] text-black">{fmtPrice(oferta.price)}</span>
                  <span className="text-sm font-semibold font-['Inter'] text-slate-900 underline underline-offset-2">
                    {tr.cardCta}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </article>
    </>
  )
}
