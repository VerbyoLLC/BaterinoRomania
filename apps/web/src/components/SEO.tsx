import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  lang?: string
  noIndex?: boolean
}

const SITE_NAME = 'Baterino'
const BASE_URL = 'https://baterino.ro'
const DEFAULT_OG_IMAGE = `${BASE_URL}/images/shared/baterino-og-default.jpg`

export default function SEO({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  lang = 'ro',
  noIndex = false,
}: SEOProps) {
  const fullTitle = `${title} | ${SITE_NAME}`
  const resolvedOgTitle = ogTitle ?? title
  const resolvedOgDesc = ogDescription ?? description
  const resolvedOgImage = ogImage ?? DEFAULT_OG_IMAGE
  const resolvedCanonical = canonical ? `${BASE_URL}${canonical}` : undefined

  return (
    <Helmet>
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {resolvedCanonical && <link rel="canonical" href={resolvedCanonical} />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={resolvedOgTitle} />
      <meta property="og:description" content={resolvedOgDesc} />
      <meta property="og:image" content={resolvedOgImage} />
      {resolvedCanonical && <meta property="og:url" content={resolvedCanonical} />}

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedOgTitle} />
      <meta name="twitter:description" content={resolvedOgDesc} />
      <meta name="twitter:image" content={resolvedOgImage} />
    </Helmet>
  )
}
