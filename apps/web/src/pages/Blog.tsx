import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useSeoPage } from '../contexts/SeoConfigContext'
import { getPublicBlogPosts, type BlogPostRow, type LangCode } from '../lib/api'
import SEO from '../components/SEO'
import SchemaOrg from '../components/SchemaOrg'

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })
}

function readingTime(post: BlogPostRow): string {
  const text = [post.title, post.excerpt, post.body].filter(Boolean).join(' ').replace(/<[^>]*>/g, '')
  const minutes = Math.max(1, Math.round(text.split(/\s+/).length / 200))
  return `${minutes} min citire`
}

function BlogCard({ post }: { post: BlogPostRow }) {
  const url = `/blog/${post.slug}`
  return (
    <Link
      to={url}
      className="group flex flex-col overflow-hidden rounded-[10px] bg-white border border-gray-100 hover:shadow-md transition-shadow"
    >
      {post.coverImage && (
        <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
          <img
            src={post.coverImage}
            alt={post.coverImageAlt || post.title}
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute bottom-3 right-3 z-10">
            <img
              src="/images/shared/baterino-logo-white.png"
              alt=""
              aria-hidden
              className="h-5 w-auto max-w-[88px] object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]"
            />
          </div>
        </div>
      )}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 mb-3">
          {post.category && (
            <span className="inline-block rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white font-['Inter']">{post.category}</span>
          )}
          {post.category && <span className="text-gray-300 text-[10px]">·</span>}
          <p className="text-[11px] font-medium text-gray-400 font-['Inter'] m-0">{readingTime(post)}</p>
        </div>
        <h2 className="text-base font-bold font-['Inter'] text-gray-900 leading-snug mb-2 mt-0 group-hover:text-slate-700 transition-colors line-clamp-2">
          {post.title}
        </h2>
        {post.excerpt ? (
          <p className="text-sm text-gray-500 font-['Inter'] leading-relaxed mb-4 line-clamp-3 flex-1">
            {post.excerpt}
          </p>
        ) : null}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400 font-['Inter']">{formatDate(post.publishedAt)}</span>
          <span className="text-xs font-semibold text-slate-700 font-['Inter']">Citește →</span>
        </div>
      </div>
    </Link>
  )
}

function BlogCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[10px] bg-white border border-gray-100 animate-pulse">
      <div className="aspect-[16/9] bg-neutral-200" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 bg-neutral-200 rounded w-3/4" />
        <div className="h-3 bg-neutral-100 rounded w-full" />
        <div className="h-3 bg-neutral-100 rounded w-2/3" />
      </div>
    </div>
  )
}

export default function Blog() {
  const { language } = useLanguage()
  const seo = useSeoPage('blog')
  const [posts, setPosts] = useState<BlogPostRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getPublicBlogPosts(language.code as LangCode)
      .then((rows) => { if (!cancelled) { setPosts(rows); setLoading(false) } })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [language.code])

  const pageTitle = seo.title || 'Noutăți - Perspective - Progres – Baterino România'
  const pageDesc = seo.description || 'Știri și articole despre baterii LiFePO4, sisteme fotovoltaice și stocare energetică în România.'

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDesc}
        canonical="/blog"
        ogImage={seo.ogImage || '/images/home/og-baterino-romania.jpg'}
        lang={language.code}
      />
      <SchemaOrg schema={[
        {
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: pageTitle,
          description: pageDesc,
          url: 'https://baterino.ro/blog',
          inLanguage: 'ro',
          publisher: { '@type': 'Organization', name: 'Baterino Romania', url: 'https://baterino.ro', logo: 'https://baterino.ro/images/shared/baterino-logo-black.svg' },
          ...(posts.length > 0 ? {
            blogPost: posts.map((p) => ({
              '@type': 'BlogPosting',
              headline: p.title,
              url: `https://baterino.ro/blog/${p.slug}`,
              datePublished: p.publishedAt ?? p.createdAt,
              image: p.coverImage || undefined,
            })),
          } : {}),
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Acasă', item: 'https://baterino.ro' },
            { '@type': 'ListItem', position: 2, name: 'Noutăți - Perspective - Progres', item: 'https://baterino.ro/blog' },
          ],
        },
      ]} />

      <article className="max-w-content mx-auto px-5 lg:px-3 pt-12 pb-24">
        <header className="mb-10 lg:mb-14 text-center">
          <h1 className="text-black text-2xl sm:text-4xl lg:text-5xl font-extrabold font-['Inter'] leading-tight">
            Noutăți · Perspective · Progres
          </h1>
          <p className="mt-3 text-neutral-600 text-base sm:text-lg font-medium font-['Inter'] leading-7 max-w-[600px] mx-auto">
            {pageDesc}
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <BlogCardSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-16 text-center">
            <p className="text-gray-500 text-base font-['Inter']">Nu există articole publicate momentan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => <BlogCard key={post.id} post={post} />)}
          </div>
        )}
      </article>
    </>
  )
}
