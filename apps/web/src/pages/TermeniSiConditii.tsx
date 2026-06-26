import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { getTermeniSiConditiiTranslations } from '../i18n/termeni-si-conditii'
import SEO from '../components/SEO'

export default function TermeniSiConditii() {
  const { language } = useLanguage()
  const tr = getTermeniSiConditiiTranslations(language.code)

  return (
    <>
      <SEO
        title={tr.seoTitle}
        description={tr.seoDesc}
        canonical="/termeni-si-conditii"
        lang={language.code}
      />

      <article className="max-w-content mx-auto px-5 lg:px-3 pt-12 pb-24">
        <header className="mb-12">
          <h1 className="text-black text-2xl sm:text-4xl lg:text-5xl font-extrabold font-['Inter'] leading-8 sm:leading-[48px] lg:leading-[56px]">
            {tr.pageTitle}
          </h1>
        </header>

        <div className="prose prose-gray max-w-none space-y-10">
          <p className="text-neutral-600 text-base lg:text-lg font-medium font-['Inter'] leading-6 lg:leading-8">
            {tr.intro}
          </p>

          <section id="politica-retur" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-slate-900 font-['Inter'] sm:text-2xl">{tr.returnPolicyTitle}</h2>
            <p className="mt-4 text-neutral-600 text-base font-['Inter'] leading-relaxed lg:text-lg lg:leading-8">
              {tr.returnPolicyLinkLead}{' '}
              <Link
                to="/politica-de-retur"
                className="font-semibold text-slate-900 underline underline-offset-2 hover:text-slate-700"
              >
                {tr.returnPolicyLinkLabel}
              </Link>
              {tr.returnPolicyLinkSuffix}
            </p>
          </section>
        </div>
      </article>
    </>
  )
}
