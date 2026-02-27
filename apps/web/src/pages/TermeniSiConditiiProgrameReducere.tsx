import { useLanguage } from '../contexts/LanguageContext'
import { getTermeniProgrameReducereTranslations } from '../i18n/termeni-programe-reducere'
import SEO from '../components/SEO'

export default function TermeniSiConditiiProgrameReducere() {
  const { language } = useLanguage()
  const tr = getTermeniProgrameReducereTranslations(language.code)

  return (
    <>
      <SEO
        title={tr.seoTitle}
        description={tr.seoDesc}
        canonical="/termeni-si-conditii-programe-de-reducere"
        lang={language.code}
      />

      <article className="max-w-content mx-auto px-5 lg:px-3 pt-12 pb-24">
        <header className="mb-12">
          <h1 className="text-black text-2xl sm:text-4xl lg:text-5xl font-extrabold font-['Inter'] leading-8 sm:leading-[48px] lg:leading-[56px]">
            {tr.pageTitle}
          </h1>
        </header>

        <div className="prose prose-gray max-w-none">
          <p className="text-neutral-600 text-base lg:text-lg font-medium font-['Inter'] leading-6 lg:leading-8">
            {tr.intro}
          </p>
        </div>
      </article>
    </>
  )
}
