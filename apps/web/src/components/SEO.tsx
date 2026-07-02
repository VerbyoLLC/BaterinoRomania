import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogImageWidth?: number
  ogImageHeight?: number
  ogType?: 'website' | 'article'
  ogPublishedTime?: string
  ogModifiedTime?: string
  ogAuthor?: string
  lang?: string
  noIndex?: boolean
  preloadImage?: string
}

const SITE_NAME = 'Baterino Romania'
const BASE_URL = 'https://www.baterino.ro'
const DEFAULT_OG_IMAGE = `${BASE_URL}/images/home/og-baterino-romania.jpg`
const TWITTER_SITE = '@baterino_ro'

function ogImageMimeType(url: string): string {
  const lower = url.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.gif')) return 'image/gif'
  return 'image/jpeg'
}

export default function SEO({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogImageWidth = 1200,
  ogImageHeight = 630,
  ogType = 'website',
  ogPublishedTime,
  ogModifiedTime,
  ogAuthor,
  lang = 'ro',
  noIndex = false,
  preloadImage,
}: SEOProps) {
  const fullTitle = `${title} | ${SITE_NAME}`
  const resolvedOgTitle = ogTitle ?? title
  const resolvedOgDesc = ogDescription ?? description
  const resolvedOgImage = ogImage
    ? ogImage.startsWith('/')
      ? `${BASE_URL}${ogImage}`
      : ogImage
    : DEFAULT_OG_IMAGE
  const resolvedCanonical = canonical ? `${BASE_URL}${canonical}` : undefined
  const ogLocale = lang === 'ro' ? 'ro_RO' : 'en_US'

  return (
    <Helmet>
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {resolvedCanonical && <link rel="canonical" href={resolvedCanonical} />}
      {preloadImage && <link rel="preload" as="image" href={preloadImage} />}

      {/* Hreflang — same URL serves both languages (client-side switcher) */}
      {resolvedCanonical && <link rel="alternate" hrefLang="ro" href={resolvedCanonical} />}
      {resolvedCanonical && <link rel="alternate" hrefLang="en" href={resolvedCanonical} />}
      {resolvedCanonical && <link rel="alternate" hrefLang="x-default" href={resolvedCanonical} />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:title" content={resolvedOgTitle} />
      <meta property="og:description" content={resolvedOgDesc} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:image:secure_url" content={resolvedOgImage} />
      <meta property="og:image:type" content={ogImageMimeType(resolvedOgImage)} />
      <meta property="og:image:width" content={String(ogImageWidth)} />
      <meta property="og:image:height" content={String(ogImageHeight)} />
      <meta property="og:image:alt" content={resolvedOgTitle} />
      {resolvedCanonical && <meta property="og:url" content={resolvedCanonical} />}

      {/* Article meta (blog posts) */}
      {ogType === 'article' && ogPublishedTime && (
        <meta property="article:published_time" content={ogPublishedTime} />
      )}
      {ogType === 'article' && ogModifiedTime && (
        <meta property="article:modified_time" content={ogModifiedTime} />
      )}
      {ogType === 'article' && ogAuthor && (
        <meta property="article:author" content={ogAuthor} />
      )}

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_SITE} />
      <meta name="twitter:title" content={resolvedOgTitle} />
      <meta name="twitter:description" content={resolvedOgDesc} />
      <meta name="twitter:image" content={resolvedOgImage} />
    </Helmet>
  )
}
