/** Open Graph records for social crawlers (Edge Middleware). Source: production /api/products, 2026-07. */

export type OgRecord = {
  title: string
  description: string
  image: string
  type: 'website' | 'product' | 'article'
  priceAmount?: string
  priceCurrency?: 'RON'
}

const SITE = 'https://www.baterino.ro'

const DEFAULT_OG: OgRecord = {
  title: 'Baterino Romania — Baterii LiFePO₄ și sisteme de stocare a energiei',
  description:
    'Baterii LiFePO₄ și sisteme de stocare a energiei pentru rezidențial, industrial, medical și maritim.',
  image: `${SITE}/images/home/og-baterino-romania.jpg`,
  type: 'website',
}

const BLOG_INDEX_OG: OgRecord = {
  title: 'Noutăți - Perspective - Progres – Baterino România',
  description:
    'Știri și articole despre baterii LiFePO4, sisteme fotovoltaice și stocare energetică în România.',
  image: `${SITE}/images/home/og-baterino-romania.jpg`,
  type: 'website',
}

const CATEGORY_OG: Record<string, OgRecord> = {
  '/produse/baterii-solare': {
    title: 'Baterii Solare LiFePO₄',
    description:
      'Baterii solare LiFePO₄ rezidențiale LithTech — autoconsum, backup de urgență și independență energetică. Garanție 10 ani.',
    image: `${SITE}/images/divizii/rezidential/stocare-energie-rezidential-og.jpg`,
    type: 'website',
  },
  '/produse/sisteme-bess': {
    title: 'Sisteme BESS Industrial LiFePO₄',
    description:
      'Sisteme BESS industriale LithTech — modular, cabinet și container, 62kWh până la 5015kWh. Garanție 10 ani, livrare în România.',
    image: `${SITE}/images/divizii/industrial/baterii-stocare-industrial-og.jpg`,
    type: 'website',
  },
}

/** Canonical /produse/{category}/{slug} paths — synced from published catalog. */
const PRODUCT_OG: Record<string, OgRecord> = {
  '/produse/baterii-solare/pachet-baterii-lifepo4-20kwh': {
    title: '20kWh | 2 x 10kWh EcoHome 10 @10kWh',
    description:
      'Pachet promotional de 20kWh stocare format din doua baterii de 10kWh EcoHome10 de la LithTech. Mai multa stocare la un pret mai mic.',
    // TODO: dedicated 1200×630 OG crop — using catalog card image
    image:
      'https://media.baterino.ro/products/20kWh-2-x-10kWh-EcoHome-10-10kWh/20kwh-2-x-10kwh-ecohome-10-10kwh-card-1782109855285.jpg',
    type: 'product',
    priceAmount: '12231',
    priceCurrency: 'RON',
  },
  '/produse/baterii-solare/baterie-lifepo4-16kwh-lithtech': {
    title: 'EcoHome16 – Baterie Solară LiFePO₄ 16kWh',
    description:
      'Baterie solară rezidentaia LiFePO₄ 16kWh LithTech pentru uz rezidențial. Garanție 10 ani, 8.000 cicluri, compatibilă off-grid & on-grid. Livrare 24h.',
    image:
      'https://media.baterino.ro/products/EcoHome16-1607-kWh/ecohome16-1607-kwh-99-1774941779270.jpg',
    type: 'product',
    priceAmount: '9338',
    priceCurrency: 'RON',
  },
  '/produse/baterii-solare/baterie-solara-rezidentiala-10kwh': {
    title: 'EcoHome10 – Baterie Solară LiFePO₄ 10kWh',
    description:
      'Baterie solară rezidentiala LiFePO₄ 10.24kWh, garanție 10 ani, 8.000 cicluri. Ideală off-grid & on-grid. Livrare în 24h în România.',
    image:
      'https://media.baterino.ro/products/EcoHome10-1024kWh/ecohome10-1024kwh-99-1774942786391.jpg',
    type: 'product',
    priceAmount: '6859.5',
    priceCurrency: 'RON',
  },
  '/produse/baterii-solare/baterie-solara-lifepo4-5kwh-lithtech': {
    title: 'EcoHome5 – Baterie Solară LiFePO₄ 5kWh',
    description:
      'Bateria EcoHome5 LithTech 5kWh LiFePO₄ — backup urgență, consum nocturn și autoconsum solar. Garanție 10 ani, 6.000 cicluri. Livrare 24h în România.',
    image: 'https://media.baterino.ro/products/EcoHome5-5kWh/ecohome5-5kwh-99-1774942931788.jpg',
    type: 'product',
    priceAmount: '3598',
    priceCurrency: 'RON',
  },
  '/produse/sisteme-bess/bess-lifepo4-modular-64kwh': {
    title: '64kWh Bess Modular | 4 module de 16kWh HP1600',
    description:
      'Sistem BESS industrial LithTech HP1600, 64–241kWh LiFePO₄, BMS integrat, 8.000 cicluri, compatibil Growatt, Deye, SMA. Garanție 10 ani. Livrare rapidă.',
    image:
      'https://media.baterino.ro/products/64kWh-Bess-Modular-4-module-de-16kWh-HP1600/64kwh-bess-modular-4-module-de-16kwh-hp1600-card-1782862381569.jpg',
    type: 'product',
    priceAmount: '51765',
    priceCurrency: 'RON',
  },
  '/produse/sisteme-bess/bess-modular-high-voltage-hp-1600-112kwh': {
    title: '112kWh Sistem BESS 7 Module 16kWh LiFePO₄',
    description:
      'Sistem BESS industrial LithTech HP1600, 64–241kWh LiFePO₄, BMS integrat, 8.000 cicluri, compatibil Growatt, Deye, SMA. Garanție 10 ani. Livrare rapidă.',
    image:
      'https://media.baterino.ro/products/112kWh-Sistem-BESS-7-Module-16kWh-LiFePO/112kwh-sistem-bess-7-module-16kwh-lifepo-card-1782862497145.jpg',
    type: 'product',
    priceAmount: '86436',
    priceCurrency: 'RON',
  },
  '/produse/sisteme-bess/bess-modular-high-voltage-hp-1600-64kwh-pana-la-241kwh': {
    title: 'HP1600 – Sistem BESS Industrial LiFePO₄ 64kWh–241kWh',
    description:
      'Sistem BESS industrial LithTech HP1600, 64–241kWh LiFePO₄, BMS integrat, 8.000 cicluri, compatibil Growatt, Deye, SMA. Garanție 10 ani. Livrare rapidă.',
    image:
      'https://media.baterino.ro/products/HP1600-Sistem-BESS-Industrial-LiFePO-64kWh241kWh/hp1600-sistem-bess-industrial-lifepo-64kwh241kwh-card-1782790353408.jpg',
    type: 'product',
  },
  '/produse/sisteme-bess/bess-cabinet-lifepo4-215kwh-261kwh': {
    title: 'BESS Cabinet LiFePO₄ 215kWh–261kWh | Răcire Lichidă',
    description:
      'BESS Cabinet LithTech 215–261kWh LiFePO₄, răcire lichidă, 8.000 cicluri, eficiență ≥99%, trifazic 768V–832V. Ideal rețele, microgrids. Livrare rapidă.',
    image:
      'https://media.baterino.ro/products/BESS-Cabinet-LiFePO-215kWh261kWh-Racire-Lichida/bess-cabinet-lifepo-215kwh261kwh-racire-lichida-card-1782978596766.jpg',
    type: 'product',
  },
  '/produse/sisteme-bess/bess-cabinet-lifepo4-261kwh-racire-lichida': {
    title: 'BESS Cabinet LiFePO₄ 261kWh | Răcire Lichidă Industrială',
    description:
      'BESS Cabinet LithTech 261kWh LiFePO₄, răcire lichidă, 832V trifazic, 8.000 cicluri, eficiență ≥99%, durată 20 ani. Ideal centrale & microgrids industriale.',
    image:
      'https://media.baterino.ro/products/BESS-Cabinet-LiFePO-261kWh-Racire-Lichida-Industriala/bess-cabinet-lifepo-261kwh-racire-lichida-industriala-card-1782978632899.jpg',
    type: 'product',
    priceAmount: '215250',
    priceCurrency: 'RON',
  },
  '/produse/sisteme-bess/bess-cabinet-lifepo4-204kwh-241kwh-racire-aer': {
    title: 'BESS Cabinet LiFePO₄ 204kWh–241kWh | Răcire cu Aer',
    description:
      'BESS Cabinet LithTech 204–241kWh LiFePO₄, răcire aer forțat, 9.000 cicluri, eficiență 99.90%, trifazic 768V. Ideal FFR, FCR, peak shaving & parcuri solare.',
    image:
      'https://media.baterino.ro/products/BESS-Cabinet-LiFePO-204kWh241kWh-Racire-cu-Aer/bess-cabinet-lifepo-204kwh241kwh-racire-cu-aer-card-1782978838952.jpg',
    type: 'product',
  },
  '/produse/sisteme-bess/bess-cabinet-lifepo-62kwh-105kwh-racire-cu-aer': {
    title: 'BESS Cabinet LiFePO₄ 62kWh–105kWh | Răcire cu Aer',
    description:
      'BESS Cabinet LithTech 62–105kWh LiFePO₄, răcire cu aer, 6.000 cicluri, 614V & 512V trifazic. Ideal backup rezidențial, comercial & microgrids rurale. 24h.',
    image:
      'https://media.baterino.ro/products/BESS-Cabinet-cu-Racire-prin-Ventilatie/bess-cabinet-cu-racire-prin-ventilatie-99-1774969237609.jpg',
    type: 'product',
  },
  '/produse/sisteme-bess/bess-container-20ft-lifepo4-656kwh-1446kwh': {
    title: 'BESS Container 20ft LiFePO₄ 656kWh–1446kWh | Răcire cu Aer',
    description:
      'BESS container 20ft LithTech, 656–1446kWh LiFePO₄, răcire cu aer, 9.000 cicluri, 25 ani durată. Ideal parcuri solare, microgrids & peak shaving industrial.',
    image:
      'https://media.baterino.ro/products/Bess-20ft-Container-Baterii-LiFePo4-656kWh-1446912kWh/bess-20ft-container-baterii-lifepo4-656kwh-1446912kwh-99-1775012231605.jpg',
    type: 'product',
  },
  '/produse/sisteme-bess/bess-container-20ft-lifepo4-3340kwh-5015kwh-racire-lichida': {
    title: 'BESS Container 20ft LiFePO₄ 3340kWh–5015kWh | Răcire Lichidă',
    description:
      'BESS container 20ft LithTech 3340–5015kWh LiFePO₄, răcire lichidă dual-nivel, 8.000 cicluri, ≥98.5% eficiență, 20 ani. Ideal utility-scale & parcuri solare.',
    image:
      'https://media.baterino.ro/products/20Ft-Container-BESS/20ft-container-bess-99-1774964001885.jpg',
    type: 'product',
  },
}

/** Legacy slug-only URLs (/produse/{slug}) → canonical product record. */
const PRODUCT_BY_SLUG: Record<string, string> = {
  'pachet-baterii-lifepo4-20kwh': '/produse/baterii-solare/pachet-baterii-lifepo4-20kwh',
  'baterie-lifepo4-16kwh-lithtech': '/produse/baterii-solare/baterie-lifepo4-16kwh-lithtech',
  'baterie-solara-rezidentiala-10kwh': '/produse/baterii-solare/baterie-solara-rezidentiala-10kwh',
  'baterie-solara-lifepo4-5kwh-lithtech': '/produse/baterii-solare/baterie-solara-lifepo4-5kwh-lithtech',
  'bess-lifepo4-modular-64kwh': '/produse/sisteme-bess/bess-lifepo4-modular-64kwh',
  'bess-modular-high-voltage-hp-1600-112kwh': '/produse/sisteme-bess/bess-modular-high-voltage-hp-1600-112kwh',
  'bess-modular-high-voltage-hp-1600-64kwh-pana-la-241kwh':
    '/produse/sisteme-bess/bess-modular-high-voltage-hp-1600-64kwh-pana-la-241kwh',
  'bess-cabinet-lifepo4-215kwh-261kwh': '/produse/sisteme-bess/bess-cabinet-lifepo4-215kwh-261kwh',
  'bess-cabinet-lifepo4-261kwh-racire-lichida': '/produse/sisteme-bess/bess-cabinet-lifepo4-261kwh-racire-lichida',
  'bess-cabinet-lifepo4-204kwh-241kwh-racire-aer': '/produse/sisteme-bess/bess-cabinet-lifepo4-204kwh-241kwh-racire-aer',
  'bess-cabinet-lifepo-62kwh-105kwh-racire-cu-aer': '/produse/sisteme-bess/bess-cabinet-lifepo-62kwh-105kwh-racire-cu-aer',
  'bess-container-20ft-lifepo4-656kwh-1446kwh': '/produse/sisteme-bess/bess-container-20ft-lifepo4-656kwh-1446kwh',
  'bess-container-20ft-lifepo4-3340kwh-5015kwh-racire-lichida':
    '/produse/sisteme-bess/bess-container-20ft-lifepo4-3340kwh-5015kwh-racire-lichida',
}

export function normalizePathname(pathname: string): string {
  let path = pathname.toLowerCase()
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)
  return path
}

export type ResolvedOg = OgRecord & { url: string; canonicalPath: string }

export function resolveOg(pathname: string): ResolvedOg {
  const path = normalizePathname(pathname)

  if (path === '/blog' || path.startsWith('/blog/')) {
    return { ...BLOG_INDEX_OG, url: `${SITE}${path}`, canonicalPath: path }
  }

  const exact = PRODUCT_OG[path]
  if (exact) {
    return { ...exact, url: `${SITE}${path}`, canonicalPath: path }
  }

  const category = CATEGORY_OG[path]
  if (category) {
    return { ...category, url: `${SITE}${path}`, canonicalPath: path }
  }

  if (path.startsWith('/produse/baterii-solare/')) {
    const cat = CATEGORY_OG['/produse/baterii-solare']
    return { ...cat, url: `${SITE}${path}`, canonicalPath: path }
  }

  if (path.startsWith('/produse/sisteme-bess/')) {
    const cat = CATEGORY_OG['/produse/sisteme-bess']
    return { ...cat, url: `${SITE}${path}`, canonicalPath: path }
  }

  const legacyMatch = path.match(/^\/produse\/([^/]+)$/)
  if (legacyMatch) {
    const canonical = PRODUCT_BY_SLUG[legacyMatch[1]]
    if (canonical && PRODUCT_OG[canonical]) {
      return { ...PRODUCT_OG[canonical], url: `${SITE}${path}`, canonicalPath: canonical }
    }
  }

  return { ...DEFAULT_OG, url: `${SITE}${path}`, canonicalPath: path }
}

/** All registered canonical product paths (for catalog cross-check). */
export const REGISTERED_PRODUCT_PATHS = Object.keys(PRODUCT_OG)

// ── Dynamic OG (live API) ────────────────────────────────────────────────
// Fetches current product / blog data from the Railway API at request time so
// the static snapshot above never goes stale. The snapshot remains the
// fallback when the API is unreachable or returns 404.

const API_BASE = 'https://baterinoromania-production.up.railway.app'
const FETCH_TIMEOUT_MS = 4000

async function fetchJson(url: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { accept: 'application/json' },
    })
    if (!res.ok) return null
    return (await res.json()) as Record<string, unknown>
  } catch {
    return null
  }
}

function str(v: unknown): string {
  return v == null ? '' : String(v).trim()
}

function toAbsoluteUrl(url: string): string {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('//')) return `https:${url}`
  return url.startsWith('/') ? `${SITE}${url}` : `${SITE}/${url}`
}

/** Mirrors apps/web getProductTemplateSeo + resolveProductOgImageUrl. */
function productToOg(p: Record<string, unknown>, path: string): ResolvedOg {
  const title = str(p.seoTitle) || str(p.title) || DEFAULT_OG.title
  const description =
    str(p.seoDescription) || str(p.description) || str(p.overview) || str(p.subtitle) || DEFAULT_OG.description

  const images = Array.isArray(p.images) ? p.images : []
  const image =
    toAbsoluteUrl(str(p.seoOgImage)) ||
    toAbsoluteUrl(str(p.cardImage)) ||
    toAbsoluteUrl(str(images.find((x) => str(x)))) ||
    DEFAULT_OG.image

  const salePrice = parseFloat(str(p.salePrice).replace(',', '.'))
  const hasPublicPrice = str(p.priceVisibility) === 'public' && Number.isFinite(salePrice) && salePrice > 0

  const slug = str(p.slug)
  return {
    title,
    description,
    image,
    type: 'product',
    ...(hasPublicPrice ? { priceAmount: String(salePrice), priceCurrency: 'RON' as const } : {}),
    url: `${SITE}${path}`,
    // SPA canonical is /produse/{slug} (see ResidentialIndustrialProductPage).
    canonicalPath: slug ? `/produse/${slug}` : path,
  }
}

function blogPostToOgRecord(b: Record<string, unknown>, path: string): ResolvedOg {
  const title = str(b.seoTitle) || str(b.title) || BLOG_INDEX_OG.title
  const description = str(b.seoDescription) || str(b.excerpt) || BLOG_INDEX_OG.description
  const image = toAbsoluteUrl(str(b.coverImage)) || BLOG_INDEX_OG.image
  const slug = str(b.slug)
  return {
    title,
    description,
    image,
    type: 'article',
    url: `${SITE}${path}`,
    canonicalPath: slug ? `/blog/${slug}` : path,
  }
}

/**
 * Live resolution: products from /api/products/{slug}, articles from
 * /api/blog/{slug}. Falls back to the static maps on API failure.
 */
export async function resolveOgDynamic(pathname: string): Promise<ResolvedOg> {
  const path = normalizePathname(pathname)

  if (path === '/blog') {
    return { ...BLOG_INDEX_OG, url: `${SITE}${path}`, canonicalPath: path }
  }

  const blogMatch = path.match(/^\/blog\/([^/]+)$/)
  if (blogMatch) {
    const slug = encodeURIComponent(blogMatch[1])
    const post =
      (await fetchJson(`${API_BASE}/api/blog/${slug}?locale=ro`)) ??
      (await fetchJson(`${API_BASE}/api/blog/${slug}?locale=en`))
    if (post) return blogPostToOgRecord(post, path)
    return { ...BLOG_INDEX_OG, url: `${SITE}${path}`, canonicalPath: path }
  }

  if (path.startsWith('/produse/')) {
    const segments = path.split('/').filter(Boolean) // ['produse', ...]
    const last = segments[segments.length - 1]

    // /produse/{category} — known category pages are static, not products.
    if (segments.length === 2 && CATEGORY_OG[path]) {
      return { ...CATEGORY_OG[path], url: `${SITE}${path}`, canonicalPath: path }
    }

    const product = await fetchJson(`${API_BASE}/api/products/${encodeURIComponent(last)}`)
    if (product && str(product.slug)) return productToOg(product, path)
  }

  return resolveOg(path)
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildOgHtml(og: ResolvedOg): string {
  const title = og.title.includes('Baterino') ? og.title : `${og.title} | Baterino Romania`
  const t = escapeHtml(title)
  const d = escapeHtml(og.description.slice(0, 160))
  const url = escapeHtml(og.url)
  const canonical = escapeHtml(`${SITE}${og.canonicalPath}`)
  const image = escapeHtml(og.image)
  const ogTitle = escapeHtml(og.title)
  const ogType = escapeHtml(og.type)
  const imageType = /\.png(\?|$)/i.test(og.image)
    ? 'image/png'
    : /\.webp(\?|$)/i.test(og.image)
      ? 'image/webp'
      : 'image/jpeg'

  const priceTags =
    og.priceAmount && og.priceCurrency
      ? `\n    <meta property="product:price:amount" content="${escapeHtml(og.priceAmount)}" />\n    <meta property="product:price:currency" content="${escapeHtml(og.priceCurrency)}" />`
      : ''

  return `<!doctype html>
<html lang="ro">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${t}</title>
    <meta name="description" content="${d}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:site_name" content="Baterino" />
    <meta property="og:locale" content="ro_RO" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:secure_url" content="${image}" />
    <meta property="og:image:type" content="${imageType}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${ogTitle}" />${priceTags}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${ogTitle}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${image}" />
  </head>
  <body></body>
</html>`
}
