import { Fragment, useMemo } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import {
  getPoliticaConfidentialitateTranslations,
  type PoliticaConfidentialitateBlock,
  type PoliticaConfidentialitateSection,
} from '../i18n/politica-confidentialitate'
import SEO from '../components/SEO'

type TocItem = {
  id: string
  label: string
}

function sectionAnchorId(title: string): string {
  const match = title.match(/^(\d+)\./)
  return match ? `section-${match[1]}` : 'section-intro'
}

function buildToc(sections: PoliticaConfidentialitateSection[]): TocItem[] {
  return sections.map((section) => ({
    id: sectionAnchorId(section.title),
    label: section.title,
  }))
}

function RichText({ text }: { text: string }) {
  const segments = text.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s]+)/g)
  return (
    <>
      {segments.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-slate-800">
              {part.slice(2, -2)}
            </strong>
          )
        }
        if (/^https?:\/\//.test(part)) {
          return (
            <a
              key={i}
              href={part}
              className="text-slate-900 underline underline-offset-2 hover:text-slate-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              {part.replace(/^https?:\/\//, '')}
            </a>
          )
        }
        return <Fragment key={i}>{part}</Fragment>
      })}
    </>
  )
}

function BlockContent({ block }: { block: PoliticaConfidentialitateBlock }) {
  if (block.kind === 'ul') {
    return (
      <ul className="mt-4 list-disc space-y-2 pl-5 text-neutral-600 text-base font-['Inter'] leading-relaxed lg:text-lg lg:leading-8">
        {block.items.map((item) => (
          <li key={item}>
            <RichText text={item} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <p className="mt-4 text-neutral-600 text-base font-['Inter'] leading-relaxed lg:text-lg lg:leading-8 first:mt-0">
      <RichText text={block.text} />
    </p>
  )
}

function TableOfContents({ title, items }: { title: string; items: TocItem[] }) {
  return (
    <nav aria-label={title} className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
      <p className="m-0 text-xs font-bold uppercase tracking-[0.12em] text-neutral-500 font-['Inter']">
        {title}
      </p>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="block text-sm font-semibold leading-snug text-slate-800 hover:text-slate-600 font-['Inter']"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default function PoliticaConfidentialitate() {
  const { language } = useLanguage()
  const tr = getPoliticaConfidentialitateTranslations(language.code)
  const tocItems = useMemo(() => buildToc(tr.sections), [tr.sections])

  return (
    <>
      <SEO
        title={tr.seoTitle}
        description={tr.seoDesc}
        canonical="/politica-confidentialitate"
        lang={language.code}
      />

      <article className="max-w-content mx-auto px-5 lg:px-3 pt-12 pb-24">
        <header className="mb-10 lg:mb-12">
          <h1 className="text-black text-2xl sm:text-4xl lg:text-5xl font-extrabold font-['Inter'] leading-8 sm:leading-[48px] lg:leading-[56px]">
            {tr.pageTitle}
          </h1>
          <p className="mt-3 text-sm text-neutral-500 font-['Inter']">{tr.lastUpdated}</p>
          <p className="mt-6 max-w-3xl text-neutral-600 text-base font-['Inter'] leading-relaxed lg:text-lg lg:leading-8">
            <RichText text={tr.intro} />
          </p>
        </header>

        <div className="lg:hidden mb-10">
          <TableOfContents title={tr.tocTitle} items={tocItems} />
        </div>

        <div className="lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] xl:gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents title={tr.tocTitle} items={tocItems} />
            </div>
          </aside>

          <div className="min-w-0 space-y-10">
            {tr.sections.map((section) => (
              <section key={section.title} id={sectionAnchorId(section.title)} className="scroll-mt-28">
                <h2 className="text-xl font-bold text-slate-900 font-['Inter'] sm:text-2xl">{section.title}</h2>
                <div>
                  {section.blocks.map((block, i) => (
                    <BlockContent key={`${section.title}-${i}`} block={block} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </article>
    </>
  )
}
