import { Fragment, useMemo } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import {
  getTermeniProgrameReducereTranslations,
  type TermeniProgrameReducereBlock,
  type TermeniProgrameReducereSection,
} from '../i18n/termeni-programe-reducere'
import SEO from '../components/SEO'

type TocItem = {
  id: string
  label: string
  children?: TocItem[]
}

function sectionAnchorId(title: string): string {
  const match = title.match(/^(\d+)\./)
  return match ? `section-${match[1]}` : 'section-intro'
}

function subsectionAnchorId(text: string): string {
  const match = text.match(/^(\d+\.\d+)/)
  return match ? `section-${match[1].replace('.', '-')}` : `subsection-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
}

function buildToc(sections: TermeniProgrameReducereSection[]): TocItem[] {
  return sections.map((section) => {
    const children = section.blocks
      .filter((block): block is Extract<TermeniProgrameReducereBlock, { kind: 'h3' }> => block.kind === 'h3')
      .map((block) => ({
        id: subsectionAnchorId(block.text),
        label: block.text,
      }))

    return {
      id: sectionAnchorId(section.title),
      label: section.title,
      children: children.length > 0 ? children : undefined,
    }
  })
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="font-semibold text-slate-800">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  )
}

function BlockContent({ block }: { block: TermeniProgrameReducereBlock }) {
  if (block.kind === 'h3') {
    return (
      <h3
        id={subsectionAnchorId(block.text)}
        className="mt-6 mb-2 scroll-mt-28 text-lg font-bold text-slate-900 font-['Inter'] first:mt-0"
      >
        {block.text}
      </h3>
    )
  }

  if (block.kind === 'ul') {
    return (
      <ul className="mt-2 list-disc space-y-2 pl-5 text-neutral-600 text-base font-['Inter'] leading-relaxed lg:text-lg lg:leading-8">
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
            {item.children ? (
              <ul className="mt-2 space-y-2 border-l border-neutral-200 pl-3">
                {item.children.map((child) => (
                  <li key={child.id}>
                    <a
                      href={`#${child.id}`}
                      className="block text-xs leading-snug text-neutral-600 hover:text-slate-900 font-['Inter']"
                    >
                      {child.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default function TermeniSiConditiiProgrameReducere() {
  const { language } = useLanguage()
  const tr = getTermeniProgrameReducereTranslations(language.code)
  const tocItems = useMemo(() => buildToc(tr.sections), [tr.sections])

  return (
    <>
      <SEO
        title={tr.seoTitle}
        description={tr.seoDesc}
        canonical="/termeni-si-conditii-programe-de-reducere"
        lang={language.code}
      />

      <article className="max-w-content mx-auto px-5 lg:px-3 pt-12 pb-24">
        <header className="mb-10 lg:mb-12">
          <h1 className="text-black text-2xl sm:text-4xl lg:text-5xl font-extrabold font-['Inter'] leading-8 sm:leading-[48px] lg:leading-[56px]">
            {tr.pageTitle}
          </h1>
          <p className="mt-3 text-sm text-neutral-500 font-['Inter']">{tr.lastUpdated}</p>
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

            <p className="border-t border-neutral-200 pt-8 text-sm italic text-neutral-500 font-['Inter'] leading-relaxed">
              {tr.disclaimer}
            </p>
          </div>
        </div>
      </article>
    </>
  )
}
