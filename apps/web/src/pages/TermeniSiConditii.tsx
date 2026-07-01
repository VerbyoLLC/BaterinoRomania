import { Fragment, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import {
  getTermeniSiConditiiTranslations,
  type TermeniSiConditiiBlock,
  type TermeniSiConditiiSection,
} from '../i18n/termeni-si-conditii'
import SEO from '../components/SEO'

type TocItem = {
  id: string
  label: string
}

function sectionAnchorId(title: string): string {
  const match = title.match(/^(\d+)\./)
  return match ? `section-articol-${match[1]}` : 'section-intro'
}

function buildToc(sections: TermeniSiConditiiSection[]): TocItem[] {
  return sections.map((section) => ({
    id: sectionAnchorId(section.title),
    label: section.title,
  }))
}

function normalizeInternalPath(href: string): string | null {
  if (href.startsWith('/')) return href
  try {
    const url = new URL(href)
    if (url.hostname === 'baterino.ro' || url.hostname === 'www.baterino.ro') {
      return `${url.pathname}${url.search}${url.hash}`
    }
  } catch {
    return null
  }
  return null
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-slate-800">
              {part.slice(2, -2)}
            </strong>
          )
        }

        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (linkMatch) {
          const [, label, href] = linkMatch
          const internalPath = normalizeInternalPath(href)
          const className = 'font-semibold text-slate-900 underline underline-offset-2 hover:text-slate-700'

          if (internalPath) {
            return (
              <Link key={i} to={internalPath} className={className}>
                {label}
              </Link>
            )
          }

          return (
            <a key={i} href={href} className={className} target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          )
        }

        return <Fragment key={i}>{part}</Fragment>
      })}
    </>
  )
}

function BlockContent({ block }: { block: TermeniSiConditiiBlock }) {
  if (block.kind === 'h3') {
    return (
      <h3 className="mt-6 mb-2 scroll-mt-28 text-lg font-bold text-slate-900 font-['Inter'] first:mt-0">
        {block.text}
      </h3>
    )
  }

  if (block.kind === 'ul') {
    return (
      <ul className="mt-2 list-disc space-y-2 pl-5 text-left text-neutral-600 text-base font-['Inter'] leading-relaxed lg:text-lg lg:leading-8">
        {block.items.map((item) => (
          <li key={item}>
            <RichText text={item} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <p className="mt-4 text-left text-neutral-600 text-base font-['Inter'] leading-relaxed lg:text-lg lg:leading-8 first:mt-0">
      <RichText text={block.text} />
    </p>
  )
}

function TableOfContents({ title, items }: { title: string; items: TocItem[] }) {
  return (
    <nav aria-label={title} className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-left">
      <p className="m-0 text-xs font-bold uppercase tracking-[0.12em] text-neutral-500 font-['Inter']">
        {title}
      </p>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="block text-xs font-medium leading-snug text-slate-800 hover:text-slate-600 font-['Inter']"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default function TermeniSiConditii() {
  const { language } = useLanguage()
  const tr = getTermeniSiConditiiTranslations(language.code)
  const tocItems = useMemo(() => buildToc(tr.sections), [tr.sections])

  return (
    <>
      <SEO
        title={tr.seoTitle}
        description={tr.seoDesc}
        canonical="/termeni-si-conditii"
        lang={language.code}
      />

      <article className="max-w-content mx-auto px-5 lg:px-3 pt-12 pb-24">
        <header className="mb-10 lg:mb-12 text-left">
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

          <div className="min-w-0 space-y-10 text-left">
            <p className="text-neutral-600 text-base font-['Inter'] leading-relaxed lg:text-lg lg:leading-8">
              <RichText text={tr.intro} />
            </p>

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
