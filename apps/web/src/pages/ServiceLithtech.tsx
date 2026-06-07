import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import SEO from '../components/SEO'
import { useLanguage } from '../contexts/LanguageContext'
import { useSeoPage } from '../contexts/SeoConfigContext'
import { getServiceLithtechTranslations } from '../i18n/service-lithtech'

const SUPPORT_CONTACT_PATH = '/contact?requestType=service'

const PRODUCT_ICONS = [
  '/images/shared/service-icon.svg',
  '/images/shared/maintance-icon.svg',
  '/images/shared/testing-icon.svg',
] as const

const AUTHORIZED_BADGE: Record<string, string> = {
  ro: 'Partener Autorizat România',
  en: 'Authorised Partner Romania',
  zh: '罗马尼亚授权合作伙伴',
}

function SupportCtaLink({ label, className }: { label: string; className?: string }) {
  return (
    <Link
      to={SUPPORT_CONTACT_PATH}
      className={
        className ??
        "inline-flex min-h-12 items-center justify-center rounded-[10px] bg-slate-900 px-8 text-base font-semibold text-white hover:bg-slate-700 transition-colors font-['Inter']"
      }
    >
      {label}
    </Link>
  )
}

export default function ServiceLithtech() {
  const { language } = useLanguage()
  const tr = getServiceLithtechTranslations(language.code)
  const seo = useSeoPage('service')
  const authorizedBadge = AUTHORIZED_BADGE[language.code] ?? AUTHORIZED_BADGE.ro

  return (
    <>
      <SEO
        title={seo.title || tr.seoTitle}
        description={seo.description || tr.seoDesc}
        canonical="/service-baterii-lithtech-romania"
        ogTitle={seo.ogTitle || undefined}
        ogDescription={seo.ogDescription || undefined}
        ogImage={seo.ogImage || undefined}
        lang={language.code}
      />

      <article className="max-w-content mx-auto px-5 lg:px-3 pt-16 pb-24">
        {/* About */}
        <section className="pb-14 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <h1 className="text-black text-2xl lg:text-4xl font-extrabold font-['Inter'] leading-tight">
                {tr.aboutTitle}
              </h1>
              <p className="mt-5 text-gray-700 text-base lg:text-lg font-medium font-['Inter'] leading-8">
                {tr.aboutText}
              </p>
              <div className="mt-8">
                <SupportCtaLink label={tr.heroCta} />
              </div>
            </div>
            <div className="flex flex-col items-center lg:items-end gap-4">
              <img
                src="/images/menu/lithtech.png"
                alt="LithTech"
                className="h-12 w-auto object-contain"
              />
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 font-['Inter']">
                {authorizedBadge}
              </span>
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="py-14 lg:py-20">
          <h2 className="text-center text-black text-2xl lg:text-4xl font-extrabold font-['Inter'] leading-tight mb-10 lg:mb-12">
            {tr.productsTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tr.products.map((item, i) => (
              <div
                key={item.title}
                className="rounded-[10px] bg-white p-6 lg:p-8 shadow-sm border border-neutral-200/80"
              >
                <img
                  src={PRODUCT_ICONS[i] ?? PRODUCT_ICONS[0]}
                  alt=""
                  aria-hidden
                  className="w-16 h-16 object-contain mb-5"
                />
                <h3 className="text-black text-xl font-extrabold font-['Inter'] leading-7 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-700 text-base font-medium font-['Inter'] leading-7">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section className="py-14 lg:py-20">
          <h2 className="text-center text-black text-2xl lg:text-4xl font-extrabold font-['Inter'] leading-tight mb-10 lg:mb-12">
            {tr.servicesTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {tr.services.map((item, i) => (
              <div
                key={item.title}
                className="relative overflow-hidden rounded-[10px] border border-neutral-200 bg-white p-6 lg:p-8"
              >
                <span
                  className="pointer-events-none absolute right-4 top-2 text-6xl lg:text-7xl font-extrabold font-['Inter'] leading-none text-neutral-100 select-none"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="relative text-black text-xl font-extrabold font-['Inter'] leading-7 mb-3">
                  {item.title}
                </h3>
                <p className="relative text-gray-700 text-base font-medium font-['Inter'] leading-7">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Why authorized */}
        <section className="py-14 lg:py-20">
          <h2 className="text-center text-black text-2xl lg:text-4xl font-extrabold font-['Inter'] leading-tight mb-10 lg:mb-12">
            {tr.whyTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {tr.whyPoints.map((item) => (
              <div
                key={item.title}
                className="rounded-[10px] bg-white p-6 lg:p-8 border border-neutral-200/80"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    className="h-6 w-6 shrink-0 text-emerald-600"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <h3 className="text-black text-lg font-extrabold font-['Inter'] leading-7">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-3 pl-9 text-gray-700 text-base font-medium font-['Inter'] leading-7">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="pt-4 pb-0 text-center">
          <h2 className="text-black text-2xl lg:text-4xl font-extrabold font-['Inter'] leading-tight max-w-3xl mx-auto">
            {tr.ctaTitle}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-gray-700 text-base lg:text-lg font-medium font-['Inter'] leading-relaxed">
            {tr.ctaSubtitle}
          </p>
          <div className="mt-8 flex justify-center">
            <SupportCtaLink label={tr.ctaButton} />
          </div>
        </section>
      </article>
    </>
  )
}
