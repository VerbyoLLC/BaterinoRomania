/** Absolute product image URLs for sitemap image extension (mirrors apps/web/src/lib/productSeoImages.ts). */

const DEFAULT_PRODUCT_IMAGE = '/images/shared/HP2000-all-in-one.webp'

function toAbsoluteSiteUrl(url, base) {
  const t = String(url ?? '').trim()
  if (!t) return ''
  if (/^https?:\/\//i.test(t)) return t
  if (t.startsWith('//')) return `https:${t}`
  const root = String(base).replace(/\/$/, '')
  return t.startsWith('/') ? `${root}${t}` : `${root}/${t}`
}

function collectProductImageUrls(product, base, { fallback = DEFAULT_PRODUCT_IMAGE } = {}) {
  const seen = new Set()
  const out = []

  const push = (raw) => {
    const abs = toAbsoluteSiteUrl(raw, base)
    if (!abs || seen.has(abs)) return
    seen.add(abs)
    out.push(abs)
  }

  push(product.cardImage)
  const imgs = Array.isArray(product.images) ? product.images : []
  for (const img of imgs) push(img)

  if (out.length === 0 && fallback !== false) {
    push(fallback)
  }

  return out
}

module.exports = {
  DEFAULT_PRODUCT_IMAGE,
  toAbsoluteSiteUrl,
  collectProductImageUrls,
}
