import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams, Navigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { getPublicBlogPost, getPublicBlogPosts, getAdminBlogPostById, type BlogPostRow, type LangCode } from '../lib/api'
import SEO from '../components/SEO'
import SchemaOrg from '../components/SchemaOrg'

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })
}

type TocItem = { id: string; text: string; level: 2 | 3 }

function extractToc(html: string): TocItem[] {
  const matches = [...html.matchAll(/<h([23])[^>]*>(.*?)<\/h[23]>/gi)]
  return matches.map((m, i) => ({
    level: Number(m[1]) as 2 | 3,
    text: m[2].replace(/<[^>]*>/g, ''),
    id: `heading-${i}`,
  }))
}

function injectHeadingIds(html: string): string {
  let i = 0
  return html.replace(/<h([23])([^>]*)>/gi, (_, level, attrs) => `<h${level}${attrs} id="heading-${i++}">`)
}

function ArticleSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="max-w-2xl mx-auto px-5 pt-16 pb-10 text-center">
        <div className="h-3 bg-neutral-200 rounded-full w-24 mx-auto mb-8" />
        <div className="h-9 bg-neutral-200 rounded-lg w-full mb-3" />
        <div className="h-9 bg-neutral-200 rounded-lg w-5/6 mx-auto mb-3" />
        <div className="h-9 bg-neutral-200 rounded-lg w-4/6 mx-auto mb-8" />
        <div className="h-3 bg-neutral-100 rounded-full w-48 mx-auto" />
      </div>
      <div className="max-w-4xl mx-auto px-5 mb-12">
        <div className="aspect-[21/9] bg-neutral-200 rounded-2xl" />
      </div>
      <div className="max-w-[700px] mx-auto px-5 space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`h-4 bg-neutral-100 rounded-full ${i % 5 === 4 ? 'w-2/3' : 'w-full'}`} />
        ))}
      </div>
    </div>
  )
}

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const isPreview = searchParams.get('preview') === '1'
  const previewId = isPreview ? (searchParams.get('id') ?? null) : null
  const { language } = useLanguage()
  const [post, setPost] = useState<BlogPostRow | 'loading' | 'not_found' | 'error'>('loading')
  const [retryCount, setRetryCount] = useState(0)
  const [related, setRelated] = useState<BlogPostRow[]>([])
  const [readProgress, setReadProgress] = useState(0)
  const articleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const el = articleRef.current
      if (!el) return
      const { top, height } = el.getBoundingClientRect()
      const visible = window.innerHeight
      const progress = Math.min(1, Math.max(0, (visible - top) / (height + visible)))
      setReadProgress(progress)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!slug) { setPost('not_found'); return }
    let cancelled = false
    setPost('loading')
    const p = isPreview && previewId
      ? getAdminBlogPostById(previewId)
      : getPublicBlogPost(slug, language.code as LangCode)
    p.then((result) => {
      if (!cancelled) {
        setPost(result ?? 'not_found')
        if (result) {
          getPublicBlogPosts(language.code as LangCode).then((all) => {
            if (cancelled) return
            const others = all.filter((a) => a.slug !== result.slug)
            const sameCat = others.filter((a) => a.category && a.category === result.category)
            const picks = (sameCat.length >= 3 ? sameCat : others).slice(0, 3)
            setRelated(picks)
          }).catch(() => {})
        }
      }
    }).catch(() => { if (!cancelled) setPost('error') })
    return () => { cancelled = true }
  }, [slug, language.code, retryCount, isPreview, previewId])

  if (post === 'not_found') return isPreview
    ? (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-5 font-graphik">
        <p className="text-gray-400 text-base">Articolul draft nu a putut fi găsit sau nu ești autentificat ca administrator.</p>
        <Link to="/blog" className="text-sm font-medium text-black underline underline-offset-4">← Înapoi la Blog</Link>
      </div>
    )
    : <Navigate to="/blog" replace />

  if (post === 'error') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-5 font-graphik">
        <p className="text-gray-400 text-base">Articolul nu a putut fi încărcat.</p>
        <button
          type="button"
          onClick={() => setRetryCount((c) => c + 1)}
          className="rounded-lg bg-black text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 transition-colors"
        >
          Încearcă din nou
        </button>
      </div>
    )
  }

  if (post === 'loading') {
    return (
      <div className="pb-24">
        <ArticleSkeleton />
      </div>
    )
  }

  const toc = post.body ? extractToc(post.body) : []
  const hasToc = toc.length >= 3

  const canonicalUrl = `https://baterino.ro/blog/${post.slug}`
  const seoTitle = post.seoTitle || post.title
  const seoDesc = post.seoDescription || post.excerpt
  const ogImage = post.coverImage || '/images/home/og-baterino-romania.webp'

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.coverImage || undefined,
    url: canonicalUrl,
    inLanguage: post.locale,
    author: { '@type': 'Person', name: post.author || 'Baterino Romania', url: 'https://baterino.ro', sameAs: ['https://baterino.ro'] },
    publisher: {
      '@type': 'Organization',
      name: 'Baterino Romania',
      url: 'https://baterino.ro',
      logo: { '@type': 'ImageObject', url: 'https://baterino.ro/images/shared/baterino-logo-black.svg' },
    },
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    ...(post.tags?.length ? { keywords: post.tags.join(', ') } : {}),
    ...(post.category ? { articleSection: post.category } : {}),
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Acasă', item: 'https://baterino.ro' },
      { '@type': 'ListItem', position: 2, name: 'Noutăți', item: 'https://baterino.ro/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: canonicalUrl },
    ],
  }

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDesc}
        canonical={`/blog/${post.slug}`}
        ogImage={ogImage}
        ogTitle={seoTitle}
        ogDescription={seoDesc}
        ogType="article"
        ogPublishedTime={post.publishedAt ?? post.createdAt}
        ogModifiedTime={post.updatedAt}
        ogAuthor={post.author || 'Baterino Romania'}
        lang={post.locale}
        preloadImage={post.coverImage || undefined}
      />
      <SchemaOrg schema={[articleSchema, breadcrumbSchema]} />

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent">
        <div
          className="h-full bg-black transition-[width] duration-75 ease-out"
          style={{ width: `${readProgress * 100}%` }}
        />
      </div>

      <article ref={articleRef} className="font-graphik pb-32">

        {/* Draft banner */}
        {isPreview && post.status !== 'published' && (
          <div className="max-w-[700px] mx-auto px-5 pt-6">
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <span className="shrink-0 rounded-md bg-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-900">Draft</span>
              <p className="text-xs text-amber-800">Previzualizare — articol nevizibil publicului.</p>
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <header className="max-w-2xl mx-auto px-5 pt-14 pb-12 text-center">

          {/* Title */}
          <h1 className="text-[2rem] sm:text-[2.5rem] lg:text-[3rem] font-bold text-black leading-[1.15] tracking-[-0.02em] mb-6">
            {post.title}
          </h1>

          {/* Meta — by author · category · date */}
          <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-1 text-[15px] text-gray-400 mb-5">
            {post.author && (
              <span>by <span className="text-gray-600 font-medium">{post.author}</span></span>
            )}
            {post.author && post.category && (
              <span className="text-black text-[8px] select-none">●</span>
            )}
            {post.category && (
              <span className="font-semibold uppercase tracking-[0.15em] text-[12px]">{post.category}</span>
            )}
            {(post.author || post.category) && post.publishedAt && (
              <span className="text-black text-[8px] select-none">●</span>
            )}
            {post.publishedAt && (
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            )}
          </div>

          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-1.5 text-xs text-gray-400" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-gray-600 transition-colors">Acasă</Link>
            <span className="text-gray-300">/</span>
            <Link to="/blog" className="hover:text-gray-600 transition-colors">Noutăți</Link>
          </nav>
        </header>

        {/* ── Cover image ── */}
        {post.coverImage && (
          <figure className="max-w-5xl mx-auto px-4 mb-16">
            <img
              src={post.coverImage}
              alt={post.coverImageAlt || post.title}
              className="w-full rounded-2xl object-cover aspect-[21/9]"
            />
          </figure>
        )}

        {/* ── Body ── */}
        <div className="px-5">
          <div className={`mx-auto ${hasToc ? 'max-w-[1120px] lg:flex lg:gap-12 xl:gap-16' : 'max-w-[780px]'}`}>

            {/* Sticky TOC sidebar — desktop only */}
            {hasToc && (
              <aside className="hidden lg:block w-[270px] xl:w-[300px] shrink-0 pt-1">
                <div className="sticky top-20">
                  <nav className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-5" aria-label="Cuprins">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-4">Cuprins</p>
                    <ol className="space-y-0.5 list-none m-0 p-0">
                      {toc.map((item) => (
                        <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
                          <a
                            href={`#${item.id}`}
                            className="flex items-start gap-2 py-1.5 text-[14px] leading-snug text-gray-500 hover:text-black transition-colors no-underline group"
                          >
                            <svg className="mt-[3px] w-3.5 h-3.5 shrink-0 text-gray-300 group-hover:text-black transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                            {item.text}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>

                  {/* Related article — 1 card below TOC, desktop only */}
                  {related.length > 0 && (
                    <div className="mt-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-3">Articol similar</p>
                      <Link
                        to={`/blog/${related[0].slug}`}
                        className="group flex flex-col rounded-xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow"
                      >
                        {related[0].coverImage && (
                          <div className="aspect-[16/9] overflow-hidden bg-neutral-100">
                            <img src={related[0].coverImage} alt={related[0].coverImageAlt || related[0].title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-3 flex flex-col">
                          {related[0].category && (
                            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-1">{related[0].category}</span>
                          )}
                          <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-3 group-hover:text-black">
                            {related[0].title}
                          </p>
                          {related[0].publishedAt && (
                            <span className="mt-2 text-[11px] text-gray-400">{formatDate(related[0].publishedAt)}</span>
                          )}
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              </aside>
            )}

            {/* Article content column */}
            <div className={hasToc ? 'flex-1 min-w-0 max-w-[780px]' : ''}>

              {/* Mobile TOC — shown below lg */}
              {hasToc && (
                <nav className="lg:hidden mb-10 rounded-xl border border-gray-100 bg-gray-50 px-5 py-4" aria-label="Cuprins">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-3">Cuprins</p>
                  <ol className="space-y-1.5 list-none m-0 p-0">
                    {toc.map((item) => (
                      <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
                        <a href={`#${item.id}`} className="text-[14px] text-gray-600 hover:text-black transition-colors no-underline">
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              {/* Article body */}
              {post.body && (
                <div
                  className={[
                    'prose max-w-none font-sans',
                    'prose-headings:font-bold prose-headings:text-black prose-headings:tracking-[-0.02em] prose-headings:leading-snug',
                    'prose-h2:text-[1.6rem] prose-h2:mt-12 prose-h2:mb-4',
                    'prose-h3:text-[1.25rem] prose-h3:mt-10 prose-h3:mb-3',
                    'prose-p:text-[17px] prose-p:leading-[1.9] prose-p:text-gray-700 prose-p:mb-6',
                    'prose-li:text-[17px] prose-li:leading-[1.9] prose-li:text-gray-700',
                    'prose-ul:my-6 prose-ol:my-6',
                    'prose-strong:text-gray-700 prose-strong:font-normal',
                    'prose-a:text-black prose-a:underline prose-a:decoration-gray-300 prose-a:underline-offset-2 hover:prose-a:decoration-black',
                    'prose-blockquote:border-l-2 prose-blockquote:border-gray-200 prose-blockquote:pl-6 prose-blockquote:text-gray-500 prose-blockquote:not-italic prose-blockquote:font-light prose-blockquote:text-[18px] prose-blockquote:leading-[1.75]',
                    'prose-img:rounded-xl prose-img:my-10',
                    'prose-hr:my-10',
                    'prose-h2:scroll-mt-24 prose-h3:scroll-mt-24',
                  ].join(' ')}
                  dangerouslySetInnerHTML={{ __html: injectHeadingIds(post.body) }}
                />
              )}

              {/* ── Footer ── */}
              <footer className="mt-16 pt-10 border-t border-gray-100">

                {/* Social share */}
                {(() => {
                  const url = encodeURIComponent(canonicalUrl)
                  const text = encodeURIComponent(post.title)
                  return (
                    <div className="flex items-center gap-3 mb-10">
                      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">Distribuie</span>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
                        target="_blank" rel="noopener noreferrer"
                        aria-label="Distribuie pe Facebook"
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-[#1877f2] hover:text-white transition-colors"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                      </a>
                      <a
                        href={`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`}
                        target="_blank" rel="noopener noreferrer"
                        aria-label="Distribuie pe LinkedIn"
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-[#0a66c2] hover:text-white transition-colors"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                      </a>
                      <a
                        href={`https://wa.me/?text=${text}%20${url}`}
                        target="_blank" rel="noopener noreferrer"
                        aria-label="Distribuie pe WhatsApp"
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-[#25d366] hover:text-white transition-colors"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                      </a>
                    </div>
                  )
                })()}

                {/* Tags */}
                {post.tags?.length ? (
                  <div className="flex flex-wrap gap-2 mb-10">
                    {post.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {/* Back */}
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-black transition-colors group"
                >
                  <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Înapoi la Noutăți
                </Link>
              </footer>
            </div>

          </div>
        </div>
      </article>

      {/* ── Related articles — mobile only (desktop shows 1 in sidebar) ── */}
      {related.length > 0 && (
        <section className="lg:hidden max-w-[780px] mx-auto px-5 pb-24">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-6">Articole similare</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link
                key={r.id}
                to={`/blog/${r.slug}`}
                className="group flex flex-col rounded-xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow"
              >
                {r.coverImage && (
                  <div className="aspect-[16/9] overflow-hidden bg-neutral-100">
                    <img src={r.coverImage} alt={r.coverImageAlt || r.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1">
                  {r.category && (
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-1">{r.category}</span>
                  )}
                  <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-black">
                    {r.title}
                  </p>
                  {r.publishedAt && (
                    <span className="mt-auto pt-3 text-[11px] text-gray-400">{formatDate(r.publishedAt)}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
