import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Phone } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { getOferteTranslations } from '../i18n/oferte'
import { getHomeTranslations } from '../i18n/home'
import { getOfertaBySlug } from '../lib/oferteData'
import { getAuthRole } from '../lib/api'
import { CONTACT_WHATSAPP_WAME, FALLBACK_PHONE_DISPLAY, FALLBACK_PHONE_TEL_HREF } from '../lib/contactWhatsApp'
import { WhatsAppGlyph } from '../components/WhatsAppGlyph'
import SEO from '../components/SEO'
import SchemaOrg from '../components/SchemaOrg'

// Admin is exempt so the site operator can always preview/test this page.
const RESTRICTED_ROLES = new Set(['partener', 'sales_agent'])

/** Same 6 advantage icons as the homepage "De ce să cumperi de la noi?" grid. */
const WHY_US_ICONS = [
  '/images/shared/battery-full-icon.svg',
  '/images/shared/service-icon.svg',
  '/images/shared/swap-icon.svg',
  '/images/shared/compatibility-icon.svg',
  '/images/shared/testing-icon.svg',
  '/images/shared/delivery-icon.svg',
]

function fmtPrice(n: number) {
  return `${n.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} RON`
}

export default function OfertaTemplate() {
  const { language } = useLanguage()
  const { slug } = useParams<{ slug: string }>()
  const tr = getOferteTranslations(language.code)
  const homeTr = getHomeTranslations(language.code)
  const navigate = useNavigate()
  const oferta = getOfertaBySlug(slug)

  // Visible to guests, clients, and admin (for QA) — partners/sales agents get sent home.
  useEffect(() => {
    if (RESTRICTED_ROLES.has(getAuthRole() ?? '')) navigate('/', { replace: true })
  }, [navigate])

  const whyUsBoxes = [
    { icon: WHY_US_ICONS[0], title: homeTr.f1Title, desc: homeTr.f1Desc },
    { icon: WHY_US_ICONS[1], title: homeTr.f2Title, desc: homeTr.f2Desc },
    { icon: WHY_US_ICONS[2], title: homeTr.f3Title, desc: homeTr.f3Desc },
    { icon: WHY_US_ICONS[3], title: homeTr.f4Title, desc: homeTr.f4Desc },
    { icon: WHY_US_ICONS[4], title: homeTr.f5Title, desc: homeTr.f5Desc },
    { icon: WHY_US_ICONS[5], title: homeTr.f6Title, desc: homeTr.f6Desc },
  ]

  if (!oferta) {
    return (
      <>
        <SEO title={tr.notFoundTitle} description={tr.seoDesc} noIndex lang={language.code} />
        <article className="max-w-content mx-auto flex flex-col items-center gap-4 px-5 py-24 text-center">
          <h1 className="text-2xl font-bold font-['Inter'] text-black">{tr.notFoundTitle}</h1>
          <p className="text-base text-gray-600 font-['Inter']">{tr.notFoundBody}</p>
          <Link
            to="/oferte"
            className="mt-2 inline-flex h-11 items-center justify-center rounded-[10px] bg-slate-900 px-6 text-sm font-semibold font-['Inter'] text-white transition-colors hover:bg-slate-700"
          >
            {tr.notFoundCta}
          </Link>
        </article>
      </>
    )
  }

  const priceLabel = fmtPrice(oferta.price)
  const whatsappHref = `https://wa.me/${CONTACT_WHATSAPP_WAME}?text=${encodeURIComponent(
    tr.whatsappPrefill.replace('{title}', oferta.title).replace('{price}', priceLabel),
  )}`

  return (
    <>
      <SEO
        title={`${oferta.title} — Baterino`}
        description={oferta.description}
        canonical={`/oferte/${oferta.slug}`}
        ogImage={oferta.image}
        lang={language.code}
      />
      <SchemaOrg
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: oferta.title,
            description: oferta.description,
            image: `https://www.baterino.ro${oferta.image}`,
            offers: {
              '@type': 'Offer',
              price: oferta.price,
              priceCurrency: 'RON',
              availability: 'https://schema.org/InStock',
              url: `https://www.baterino.ro/oferte/${oferta.slug}`,
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: tr.breadcrumbHome, item: 'https://www.baterino.ro' },
              { '@type': 'ListItem', position: 2, name: tr.breadcrumbOferte, item: 'https://www.baterino.ro/oferte' },
              { '@type': 'ListItem', position: 3, name: oferta.title, item: `https://www.baterino.ro/oferte/${oferta.slug}` },
            ],
          },
        ]}
      />

      <article className="max-w-content mx-auto px-5 lg:px-3 pt-10 pb-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image */}
          <div className="aspect-[4/3] w-full overflow-hidden rounded-[10px] bg-neutral-100">
            <img src={oferta.image} alt="" className="h-full w-full object-cover" />
          </div>

          {/* a. title / b. description / c. price / d. buy buttons */}
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Inter'] leading-tight text-black">
              {oferta.title}
            </h1>
            <p className="mt-4 text-base font-normal font-['Inter'] leading-relaxed text-gray-600 sm:text-lg">
              {oferta.description}
            </p>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-['Inter'] text-black tabular-nums">
                {priceLabel}
              </span>
              <span className="text-sm font-medium font-['Inter'] text-gray-500">{tr.vatNote}</span>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-slate-900 px-6 text-sm font-semibold font-['Inter'] text-white transition-colors hover:bg-slate-700 sm:text-base"
              >
                <WhatsAppGlyph className="h-5 w-5 shrink-0" />
                {tr.buyWhatsappCta}
              </a>
              <a
                href={`tel:${FALLBACK_PHONE_TEL_HREF}`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] border-2 border-slate-900 bg-white px-6 text-sm font-semibold font-['Inter'] text-slate-900 transition-colors hover:bg-neutral-50 sm:text-base"
              >
                <Phone className="h-5 w-5 shrink-0" />
                {tr.buyPhoneCta}
              </a>
            </div>
            <p className="mt-3 text-sm font-medium font-['Inter'] text-gray-500">{FALLBACK_PHONE_DISPLAY}</p>
          </div>
        </div>

        {/* Detalii tehnice — same table style as the product page */}
        {oferta.specs && oferta.specs.length > 0 ? (
          <section className="mt-16 lg:mt-24">
            <h2 className="mb-6 text-black text-2xl font-bold font-['Inter'] sm:mb-8">
              {tr.technicalDetailsTitle}
            </h2>
            <div className="overflow-x-auto rounded-xl border border-neutral-200">
              <table className="w-full min-w-[280px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th
                      scope="col"
                      className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-neutral-600 font-['Inter'] sm:px-5"
                    >
                      {tr.techTableColSpec}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-neutral-600 font-['Inter'] sm:px-5"
                    >
                      {tr.techTableColValue}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {oferta.specs.map((spec, i) => (
                    <tr
                      key={spec.label}
                      className={`border-b border-neutral-100 last:border-b-0 ${i % 2 === 1 ? 'bg-neutral-50/60' : 'bg-white'}`}
                    >
                      <th
                        scope="row"
                        className="align-top px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-neutral-500 font-['Inter'] sm:px-5 sm:w-[42%]"
                      >
                        {spec.label}
                      </th>
                      <td className="align-top px-4 py-3 text-sm font-semibold text-neutral-900 font-['Inter'] leading-snug break-words sm:px-5">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {/* e. Why buy from us — 6 advantage boxes, same style/copy as the homepage */}
        <section className="mt-16 lg:mt-24">
          <h2 className="mb-6 text-center text-2xl sm:text-3xl font-bold font-['Inter'] leading-tight text-black sm:mb-8">
            {tr.whyUsTitle}
          </h2>
          <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-3">
            {whyUsBoxes.map((box) => (
              <div
                key={box.title}
                className="flex h-full w-full flex-col rounded-[10px] bg-[#f7f7f7] px-4 py-5 sm:px-5 sm:py-6"
              >
                <img src={box.icon} alt="" aria-hidden className="mb-3 size-9 object-contain sm:size-10" />
                <h3 className="mb-1.5 text-sm font-semibold font-['Inter'] leading-snug text-black sm:text-base">
                  {box.title}
                </h3>
                <p className="text-xs font-normal font-['Inter'] leading-relaxed text-gray-600 sm:text-sm sm:leading-5">
                  {box.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </article>
    </>
  )
}
