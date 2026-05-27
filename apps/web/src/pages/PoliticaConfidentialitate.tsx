import { useLanguage } from '../contexts/LanguageContext'
import { getPoliticaConfidentialitateTranslations } from '../i18n/politica-confidentialitate'
import SEO from '../components/SEO'

function SectionContent({ content }: { content: string | string[] }) {
  if (Array.isArray(content)) {
    return (
      <ul className="mt-4 list-disc space-y-2 pl-5 text-neutral-600 text-base font-['Inter'] leading-relaxed lg:text-lg lg:leading-8">
        {content.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )
  }

  return (
    <p className="mt-4 text-neutral-600 text-base font-['Inter'] leading-relaxed lg:text-lg lg:leading-8">
      {content}
    </p>
  )
}

export default function PoliticaConfidentialitate() {
  const { language } = useLanguage()
  const tr = getPoliticaConfidentialitateTranslations(language.code)

  return (
    <>
      <SEO
        title={tr.seoTitle}
        description={tr.seoDesc}
        canonical="/politica-confidentialitate"
        lang={language.code}
      />

      <article className="max-w-content mx-auto px-5 lg:px-3 pt-12 pb-24">
        <header className="mb-12">
          <h1 className="text-black text-2xl sm:text-4xl lg:text-5xl font-extrabold font-['Inter'] leading-8 sm:leading-[48px] lg:leading-[56px]">
            {tr.pageTitle}
          </h1>
          <p className="mt-3 text-sm text-neutral-500 font-['Inter']">{tr.lastUpdated}</p>
        </header>

        <div className="max-w-3xl space-y-10">
          {tr.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold text-slate-900 font-['Inter'] sm:text-2xl">{section.title}</h2>
              <SectionContent content={section.content} />
            </section>
          ))}
        </div>
      </article>
    </>
  )
}
