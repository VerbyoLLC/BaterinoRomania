const crypto = require('crypto')

const DIACRITIC_PAIRS = [
  ['ă', 'a'],
  ['â', 'a'],
  ['î', 'i'],
  ['ș', 's'],
  ['ş', 's'],
  ['ț', 't'],
  ['ţ', 't'],
  ['Ă', 'a'],
  ['Â', 'a'],
  ['Î', 'i'],
  ['Ș', 's'],
  ['Ț', 't'],
  ['ä', 'a'],
  ['ö', 'o'],
  ['ü', 'u'],
  ['Ä', 'a'],
  ['Ö', 'o'],
  ['Ü', 'u'],
]

/** Single-segment slug under /companii/… — lowercase, hyphens, no leading @ */
const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'login',
  'signup',
  'partner',
  'client',
  'sales-agent',
  'instalatori',
  'produse',
  'companii',
  'comanda',
  'cos',
  'blog',
  'contact',
  'companie',
  'divizii',
  'qr',
])

const MAX_SLUG_LEN = 72

/** @param {string | null | undefined} raw */
function stripDiacriticsAscii(raw) {
  let s = String(raw || '')
  for (const [from, to] of DIACRITIC_PAIRS) {
    s = s.split(from).join(to)
  }
  try {
    s = s.normalize('NFD').replace(/\p{M}/gu, '')
  } catch {
    /* older runtimes without \p */
  }
  return s.toLowerCase()
}

/**
 * @param {string | null | undefined} input
 */
function slugifyCompanyHandle(input, maxLen = MAX_SLUG_LEN) {
  if (input === undefined || input === null) return ''
  let s = stripDiacriticsAscii(String(input).trim())
  if (s.startsWith('@')) s = s.slice(1).trim()
  s = s
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
  if (s.length > maxLen) s = s.slice(0, maxLen).replace(/-+$/g, '')
  return s
}

/**
 * @param {string | null | undefined} segment
 */
function normalizePublicSlugParam(segment) {
  if (segment === undefined || segment === null) return ''
  let s = String(segment).trim()
  if (s.startsWith('@')) s = s.slice(1).trim()
  return s.toLowerCase()
}

function isReservedSlug(slug) {
  return !slug ? true : RESERVED_SLUGS.has(slug)
}

/**
 * @param {string} slug
 */
function isValidPublicSlugFormat(slug) {
  if (!slug || typeof slug !== 'string') return false
  if (slug.length < 2 || slug.length > MAX_SLUG_LEN) return false
  if (/^-|-$|--/.test(slug)) return false
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return false
  if (isReservedSlug(slug)) return false
  return true
}

/** Sintaxă pentru cheie în URL `/companii/:segment` — fără verificarea cuvintelor rezervate. */
function isSlugUrlSegment(slug) {
  return !!(
    slug &&
    slug.length >= 2 &&
    slug.length <= MAX_SLUG_LEN &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  )
}

/**
 * Unique slug coliziuni: −2, −3, … eventual sufix aleatoriu.
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {string | null} excludePartnerId
 * @param {string | null | undefined} rawBase
 */
async function allocateUniquePartnerSlug(prisma, excludePartnerId, rawBase) {
  let base = slugifyCompanyHandle(rawBase || 'partener')
  if (!base || isReservedSlug(base)) base = 'partener'

  let slug = base
  for (let n = 0; n < 500; n += 1) {
    const clash = await prisma.partner.findFirst({
      where: {
        publicSlug: slug,
        ...(excludePartnerId ? { NOT: { id: excludePartnerId } } : {}),
      },
      select: { id: true },
    })
    if (!clash) return slug
    slug = `${base}-${n + 2}`
    if (slug.length > MAX_SLUG_LEN + 16) slug = slug.slice(0, MAX_SLUG_LEN + 8)
  }
  return `${base}-${crypto.randomBytes(4).toString('hex')}`
}

module.exports = {
  slugifyCompanyHandle,
  normalizePublicSlugParam,
  isValidPublicSlugFormat,
  isSlugUrlSegment,
  allocateUniquePartnerSlug,
  RESERVED_SLUGS,
  MAX_SLUG_LEN,
}
