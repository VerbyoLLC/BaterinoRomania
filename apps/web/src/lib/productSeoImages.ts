/** Absolute URLs for Product JSON-LD, Open Graph fallbacks, and image sitemaps. */

export const SITE_BASE_URL = 'https://baterino.ro'

const DEFAULT_PRODUCT_IMAGE = '/images/shared/HP2000-all-in-one.webp'

export type ProductImageSource = {
  cardImage?: string | null
  seoOgImage?: string | null
  images?: string[] | null
}

export function toAbsoluteSiteUrl(url: string, base = SITE_BASE_URL): string {
  const t = String(url ?? '').trim()
  if (!t) return ''
  if (/^https?:\/\//i.test(t)) return t
  if (t.startsWith('//')) return `https:${t}`
  const root = base.replace(/\/$/, '')
  return t.startsWith('/') ? `${root}${t}` : `${root}/${t}`
}

/**
 * Product gallery URLs for schema.org / image sitemap (card + gallery; excludes OG crop).
 */
export function collectProductImageUrls(
  product: ProductImageSource,
  options?: { base?: string; fallback?: string | false },
): string[] {
  const base = options?.base ?? SITE_BASE_URL
  const seen = new Set<string>()
  const out: string[] = []

  const push = (raw: unknown) => {
    const abs = toAbsoluteSiteUrl(String(raw ?? ''), base)
    if (!abs || seen.has(abs)) return
    seen.add(abs)
    out.push(abs)
  }

  push(product.cardImage)
  if (Array.isArray(product.images)) {
    for (const img of product.images) push(img)
  }

  if (out.length === 0 && options?.fallback !== false) {
    push(options?.fallback ?? DEFAULT_PRODUCT_IMAGE)
  }

  return out
}

export function getPrimaryProductImageUrl(
  product: ProductImageSource,
  base = SITE_BASE_URL,
): string {
  const urls = collectProductImageUrls(product, { base })
  return urls[0] ?? toAbsoluteSiteUrl(DEFAULT_PRODUCT_IMAGE, base)
}

/** Social / OG image: custom SEO crop, else primary product photo. */
export function resolveProductOgImageUrl(
  product: ProductImageSource,
  base = SITE_BASE_URL,
): string {
  const custom = String(product.seoOgImage ?? '').trim()
  if (custom) return toAbsoluteSiteUrl(custom, base)
  return getPrimaryProductImageUrl(product, base)
}
