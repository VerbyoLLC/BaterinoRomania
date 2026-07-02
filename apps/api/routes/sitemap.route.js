// routes/sitemap.route.js
// Dynamic sitemap for baterino.ro — served from the Express backend (Railway).
// lastmod comes from real data: Prisma updatedAt for products/posts/partners,
// pinned dates for static pages (bump manually only when content actually changes).
//
// Mount in your app:  app.use(createSitemapRouter(prisma));
//                     app.use('/api', createSitemapRouter(prisma));
// Then add a Vercel rewrite so https://baterino.ro/sitemap.xml hits this route
// (see vercel.json snippet in the notes).

const express = require('express')
const { isPartnerPublicProfileFullyComplete } = require('../lib/partner-public-profile-complete.js')
const { collectProductImageUrls } = require('../lib/product-seo-images.js')

const BASE_URL = (
  process.env.SITEMAP_BASE_URL ||
  process.env.SITE_URL ||
  process.env.PUBLIC_SITE_URL ||
  'https://baterino.ro'
).replace(/\/$/, '')

const IMAGE_SITEMAP_NS = 'http://www.google.com/schemas/sitemap-image/1.1'

// ---------------------------------------------------------------------------
// Static pages — pin the date to the last REAL content change.
// Update these by hand when you actually edit the page. Do not automate.
// ---------------------------------------------------------------------------
const STATIC_PAGES = [
  { path: '/', lastmod: '2026-06-24' },
  { path: '/produse', lastmod: '2026-06-24' },
  { path: '/blog', lastmod: null }, // filled from newest post
  { path: '/instalatori', lastmod: '2026-06-09' },
  { path: '/reduceri', lastmod: '2026-06-23' },
  { path: '/studii-de-caz', lastmod: '2026-06-23' },
  { path: '/divizii/rezidential', lastmod: '2026-05-15' },
  { path: '/divizii/industrial', lastmod: '2026-05-15' },
  { path: '/divizii/medical', lastmod: '2026-05-15' },
  { path: '/divizii/maritim', lastmod: '2026-05-15' },
  { path: '/companie/viziune', lastmod: '2026-05-15' },
  { path: '/contact', lastmod: '2026-05-15' },
  { path: '/siguranta', lastmod: '2026-06-09' },
  { path: '/service-baterii-lithtech-romania', lastmod: '2026-06-09' },
  { path: '/intrebari-frecvente', lastmod: '2026-06-27' },
  { path: '/verificare-garantie', lastmod: '2026-05-15' },
  { path: '/parteneriat-strategic-lithtech-baterino', lastmod: '2026-05-15' },
  { path: '/cariere', lastmod: '2026-05-15' },
  { path: '/returnare-produse', lastmod: '2026-06-22' },
  { path: '/politica-de-retur', lastmod: '2026-06-22' },
  { path: '/termeni-si-conditii', lastmod: '2026-06-27' },
  { path: '/termeni-si-conditii-programe-de-reducere', lastmod: '2026-06-28' },
  { path: '/politica-confidentialitate', lastmod: '2026-06-27' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const toW3CDate = (d) => new Date(d).toISOString().slice(0, 10) // YYYY-MM-DD

const escapeXml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

function encodePathSegment(segment) {
  return encodeURIComponent(String(segment))
}

function productPath(product) {
  const segments = [product.category?.slug, product.slug || product.id].filter(Boolean)
  return `/produse/${segments.map(encodePathSegment).join('/')}`
}

const imageEntry = (url) =>
  `\n    <image:image>\n      <image:loc>${escapeXml(url)}</image:loc>\n    </image:image>`

const urlEntry = ({ path, lastmod, images = [] }) => {
  const loc = escapeXml(`${BASE_URL}${path}`)
  const lm = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''
  const imageBlock = images.map((imgUrl) => imageEntry(imgUrl)).join('')
  return `  <url>\n    <loc>${loc}</loc>${lm}${imageBlock}\n  </url>`
}

// ---------------------------------------------------------------------------
// Build XML (also used by scripts/generate-sitemap.cjs)
// ---------------------------------------------------------------------------
async function buildSitemapXml(prisma) {
  const [products, posts, partners] = await Promise.all([
    prisma.product.findMany({
      where: { status: 'published' },
      select: {
        slug: true,
        id: true,
        title: true,
        updatedAt: true,
        cardImage: true,
        images: true,
        category: { select: { slug: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.blogPost.findMany({
      where: { status: 'published', locale: 'ro' },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.partner.findMany({
      where: {
        publicSlug: { not: null },
        isPublic: true,
        isApproved: true,
        isSuspended: false,
        user: { deletedAt: null },
      },
      select: {
        publicSlug: true,
        updatedAt: true,
        logoUrl: true,
        publicName: true,
        street: true,
        county: true,
        city: true,
        description: true,
        services: true,
        publicPhone: true,
        website: true,
        facebookUrl: true,
        linkedinUrl: true,
        instagramUrl: true,
        tiktokUrl: true,
        workPhotos: true,
      },
    }),
  ])

  const productEntries = products.map((p) => ({
    path: productPath(p),
    lastmod: toW3CDate(p.updatedAt),
    images: collectProductImageUrls(p, BASE_URL),
  }))

  const postEntries = posts.map((b) => ({
    path: `/blog/${encodePathSegment(b.slug)}`,
    lastmod: toW3CDate(b.updatedAt ?? b.publishedAt),
  }))

  const partnerEntries = partners
    .filter((p) => p.publicSlug && isPartnerPublicProfileFullyComplete(p))
    .map((p) => ({
      path: `/companii-instalatori-fotovoltaice/${encodePathSegment(p.publicSlug)}`,
      lastmod: toW3CDate(p.updatedAt),
    }))

  const staticEntries = STATIC_PAGES.map((page) =>
    page.path === '/blog' && posts.length > 0
      ? { ...page, lastmod: toW3CDate(posts[0].updatedAt ?? posts[0].publishedAt) }
      : page
  )

  const all = [...staticEntries, ...productEntries, ...postEntries, ...partnerEntries]

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:image="${IMAGE_SITEMAP_NS}">`,
    ...all.map(urlEntry),
    '</urlset>',
    '',
  ].join('\n')
}

// ---------------------------------------------------------------------------
// Handler factory — mount at /sitemap.xml and /api/sitemap.xml
// ---------------------------------------------------------------------------
function createSitemapHandler(prisma) {
  let cache = { xml: null, generatedAt: 0 }
  const CACHE_TTL_MS = 60 * 60 * 1000

  return async function sitemapHandler(req, res) {
    try {
      const now = Date.now()
      if (!cache.xml || now - cache.generatedAt > CACHE_TTL_MS) {
        cache = { xml: await buildSitemapXml(prisma), generatedAt: now }
      }
      res
        .set('Content-Type', 'application/xml; charset=utf-8')
        .set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
        .send(cache.xml)
    } catch (err) {
      console.error('sitemap generation failed:', err)
      if (cache.xml) {
        return res.set('Content-Type', 'application/xml; charset=utf-8').send(cache.xml)
      }
      res.status(500).send('Sitemap temporarily unavailable')
    }
  }
}

// ---------------------------------------------------------------------------
// Router factory — pass the shared Prisma client from index.js
// ---------------------------------------------------------------------------
function createSitemapRouter(prisma) {
  const router = express.Router()
  router.get('/sitemap.xml', createSitemapHandler(prisma))
  return router
}

module.exports = {
  createSitemapRouter,
  createSitemapHandler,
  buildSitemapXml,
  STATIC_PAGES,
  BASE_URL,
}
