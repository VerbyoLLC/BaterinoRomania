require('dotenv').config()
const crypto = require('crypto')
const path = require('path')
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient, Prisma } = require(path.join(__dirname, 'generated', 'prisma', 'index.js'))
const {
  sendVerificationCode,
  sendPasswordResetEmail,
  sendAccountDeletedEmail,
  sendInquiryNotification,
  sendInquiryConfirmation,
  sendReferralInviteEmail,
  sendPartnerApplicationReceivedEmail,
  sendPartnerAccountApprovedEmail,
  sendSalesAgentPartnerAssignedEmail,
  sendResidentialOrderProformaEmail,
  sendServiceRequestReceivedEmail,
  sendReturRequestReceivedEmail,
  sendSalesLeadCreatedNotification,
  isMailConfigured,
  getMailProvider,
  getMailFrom,
  getMailDebugInfo,
  verifySmtpConnection,
} = require('./lib/mail.js')
const {
  softDeleteUserAccount,
  eraseUserAccount,
  SOFT_DELETE_RETENTION_DAYS,
} = require('./lib/account-erasure.js')
const {
  CONSENT_TYPES,
  recordConsentLog,
  recordConsentLogs,
  logAccountCreationConsents,
} = require('./lib/consent-log.js')
const { verifyGoogleIdToken, googleClientIds, idTokenAudiences } = require('./lib/google-id-token.js')
const {
  uploadToR2,
  downloadFromR2,
  generateKey,
  sanitizeFolderName,
  isR2Configured,
  urlToKey,
  deleteFromR2,
  buildPartnerPublicProfileObjectKey,
  ensureGuestOrderFolder,
  guestOrderDocumentKey,
  proformaPdfKey,
  warrantyCertificateKey,
  buildReturConditionPhotoKey,
  productTechnicalBrochurePdfKey,
  resolveProductModelTechnicalBrochureUrl,
  commercialOfferPdfKey,
} = require('./lib/r2.js')
const {
  slugifyCompanyHandle,
  normalizePublicSlugParam,
  isValidPublicSlugFormat,
  isSlugUrlSegment,
  allocateUniquePartnerSlug,
  MAX_SLUG_LEN,
} = require('./lib/partner-public-slug.js')
const { isPartnerPublicProfileFullyComplete } = require('./lib/partner-public-profile-complete.js')
const { renderWarrantyPdf } = require('./lib/warranty-pdf.js')
const { renderCommercialOfferPdfFromHtml } = require('./lib/commercial-offer-pdf.js')
const {
  parseSerialFromQrPayload,
  normalizeWarehouseSerialNumber,
  isValidWarehouseSerialNumber,
  deriveProducedOnFromSerial,
  SN_INVALID_MESSAGE,
} = require('./lib/warehouse-serial.js')
const { warrantyVerifyRateLimitMiddleware } = require('./lib/warranty-verify-rate-limit.js')
const {
  loginLimiter,
  signupLimiter,
  forgotPasswordLimiter,
  resendCodeLimiter,
  verifyIpLimiter,
  resetPasswordLimiter,
  googleAuthLimiter,
  recordOtpFailure,
  clearOtpAttempts,
} = require('./lib/auth-rate-limit.js')
const { mintWarrantyVerifyToken, parseWarrantyVerifyToken } = require('./lib/warranty-verify-token.js')
const QRCode = require('qrcode')
const PROFORMA_TEMPLATE_MODULE_PATH = './lib/proforma-template.js'
function getProformaTemplateLib() {
  // Dev helper: pick up template edits instantly without API restart.
  if (process.env.NODE_ENV !== 'production') {
    try {
      delete require.cache[require.resolve(PROFORMA_TEMPLATE_MODULE_PATH)]
    } catch {
      // ignore resolve/cache misses; fallback to regular require below
    }
  }
  return require(PROFORMA_TEMPLATE_MODULE_PATH)
}

const WARRANTY_CERT_TEMPLATE_MODULE_PATH = './lib/warranty-certificate-template.js'
function getWarrantyCertificateTemplateLib() {
  if (process.env.NODE_ENV !== 'production') {
    try {
      delete require.cache[require.resolve(WARRANTY_CERT_TEMPLATE_MODULE_PATH)]
    } catch {
      // ignore resolve/cache misses
    }
  }
  return require(WARRANTY_CERT_TEMPLATE_MODULE_PATH)
}

const REFERRAL_INVITE_TEMPLATE_PATH = './templates/referral-invite-email.js'
function getReferralInviteTemplateLib() {
  if (process.env.NODE_ENV !== 'production') {
    try {
      delete require.cache[require.resolve(REFERRAL_INVITE_TEMPLATE_PATH)]
    } catch {
      // ignore
    }
  }
  return require(REFERRAL_INVITE_TEMPLATE_PATH)
}

const uploadMiddleware = multer({ storage: multer.memoryStorage() })
/** Logo / lucrări profil public partener → R2 `PublicProfiles/...`. */
const partnerPublicProfileUploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 },
})
/** Fotografii retur: 2–6 fișiere JPEG; max. ~8MB/fișier. */
const returUploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 6 },
})
/** PDF broșură tehnică produs (șabloane admin) — max. ~40MB. */
const technicalBrochurePdfUploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 40 * 1024 * 1024 },
})

/** Slugify title for URL: lowercase, hyphenated, no diacritics */
/** Accept only { entries: [...] } for JSON column; reject arrays / wrong shape (typeof [] === 'object'). */
function parseTechnicalSpecsModelsBody(v) {
  if (v === undefined) return undefined
  if (v === null) return null
  let x = v
  if (typeof v === 'string') {
    try {
      x = JSON.parse(v)
    } catch {
      return undefined
    }
  }
  if (x === null || typeof x !== 'object' || Array.isArray(x)) return undefined
  if (!Array.isArray(x.entries)) return undefined
  try {
    return JSON.parse(JSON.stringify(x))
  } catch {
    return undefined
  }
}

/**
 * Normalize a phone value to E.164-like format (+XXXXXXXXX).
 * Accepts:
 *   - "+40712345678" → "+40712345678"
 *   - "712345678" (legacy 9-digit Romanian) → "+40712345678"
 *   - "" / null / undefined → null (invalid)
 * Returns null when the resulting digit count is < 7 (not a real number).
 */
function normalizeE164Phone(v) {
  if (!v) return null
  const s = String(v).trim()
  if (!s) return null
  // Legacy: exactly 9 bare digits — Romanian mobile without country code
  if (/^\d{9}$/.test(s)) return `+40${s}`
  // Already has a + prefix — preserve as-is after stripping whitespace
  if (s.startsWith('+')) {
    const digits = s.slice(1).replace(/\D/g, '')
    return digits.length >= 7 ? `+${digits}` : null
  }
  // Bare digits (not 9, e.g. international without +)
  const digits = s.replace(/\D/g, '')
  return digits.length >= 7 ? digits : null
}

/** Cod poștal RO: doar cifre, max 6 */
function normalizeRoPostalCode(v) {
  if (v === undefined || v === null) return v
  const s = String(v).replace(/\D/g, '').slice(0, 6)
  return s
}

/** Stradă partener: fără `.` `,` `|` */
function normalizePartnerStreetLine(v) {
  if (v === undefined || v === null) return v
  return String(v)
    .replace(/[.,|]/g, '')
    .trim()
}

/** Plain JSON for API responses (Decimal / odd prototypes can drop or break nested Json like technicalSpecsModels). */
function productToJson(record) {
  if (record == null) return record
  try {
    return JSON.parse(
      JSON.stringify(record, (_, v) => {
        if (typeof v === 'bigint') return v.toString()
        if (v != null && typeof v === 'object' && v.constructor?.name === 'Decimal' && typeof v.toString === 'function') {
          return v.toString()
        }
        return v
      })
    )
  } catch (err) {
    console.error('productToJson:', err?.message || err)
    return record
  }
}

/** Catalog sector order (matches /produse filters). */
const CATALOG_SECTOR_SORT_ORDER = ['rezidential', 'industrial', 'medical', 'maritim', 'comercial', 'micro_grid']

function sectorSortRank(product) {
  const cat = String(product?.categorie || '').toLowerCase()
  let best = CATALOG_SECTOR_SORT_ORDER.length
  if (cat.trim()) {
    for (let i = 0; i < CATALOG_SECTOR_SORT_ORDER.length; i++) {
      if (cat.includes(CATALOG_SECTOR_SORT_ORDER[i])) {
        best = Math.min(best, i)
      }
    }
    if (best < CATALOG_SECTOR_SORT_ORDER.length) return best
  }
  const tip = String(product?.tipProdus || '').toLowerCase()
  if (tip === 'rezidential') return 0
  if (tip === 'industrial') return 1
  return CATALOG_SECTOR_SORT_ORDER.length
}

/** in_stock first; applies when product has catalog stock (rezidential / industrial or explicit status). */
function catalogStockSortRank(catalogStockStatus, tipProdus) {
  const tip = String(tipProdus || '').toLowerCase()
  if (tip !== 'rezidential' && tip !== 'industrial') {
    if (catalogStockStatus == null || catalogStockStatus === '') return 0
  }
  const s = String(catalogStockStatus || 'in_stock').trim()
  if (s === 'in_stock') return 0
  if (s === 'on_order') return 1
  if (s === 'coming_soon') return 2
  if (s === 'out_of_stock') return 3
  return 0
}

/** Catalog list: sector groups, then availability (in stock first), then newest. */
function parseProductCaseStudyExamples(v) {
  if (!Array.isArray(v)) return []
  return v
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null
      const title = String(entry.title ?? '').trim()
      const subtitle = String(entry.subtitle ?? '').trim()
      const location = String(entry.location ?? '').trim()
      const image = String(entry.image ?? entry.picture ?? '').trim()
      if (!title && !subtitle && !location && !image) return null
      return { title, subtitle, location, image }
    })
    .filter(Boolean)
    .slice(0, 6)
}

function sortProductsResidentialFirst(products) {
  return [...products].sort((a, b) => {
    const bySector = sectorSortRank(a) - sectorSortRank(b)
    if (bySector !== 0) return bySector
    const byStock =
      catalogStockSortRank(a.catalogStockStatus, a.tipProdus) -
      catalogStockSortRank(b.catalogStockStatus, b.tipProdus)
    if (byStock !== 0) return byStock
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return tb - ta
  })
}

function parsePriceVisibility(v) {
  const s = String(v || '').trim()
  if (['hidden', 'public', 'partner_only'].includes(s)) return s
  return 'public'
}

function parsePricePresentation(v) {
  const s = String(v || '').trim()
  if (['simple', 'detailed'].includes(s)) return s
  return 'simple'
}

/** Rezidențial: in_stock | out_of_stock | coming_soon | on_order — null clears badge */
function parseCatalogStockStatus(v) {
  if (v === null || v === undefined || v === '') return null
  const s = String(v).trim()
  if (['in_stock', 'out_of_stock', 'coming_soon', 'on_order'].includes(s)) return s
  return null
}

/** Rezidențial: 24h | 48h | 7_14d | 60d — null clears badge */
function parseCatalogDeliveryBadge(v) {
  if (v === null || v === undefined || v === '') return null
  const s = String(v).trim()
  if (['24h', '48h', '7_14d', '60d'].includes(s)) return s
  return null
}

/** Rezidențial: free | paid — null clears badge */
function parseCatalogTransportBadge(v) {
  if (v === null || v === undefined || v === '') return null
  const s = String(v).trim()
  if (['free', 'paid'].includes(s)) return s
  return null
}

/** Industrial: baterino | partner — null clears badge */
function parseCatalogInstallBadge(v) {
  if (v === null || v === undefined || v === '') return null
  const s = String(v).trim()
  if (['baterino', 'partner'].includes(s)) return s
  return null
}

/** Public API: default badge fields when DB is null (pre-migration / never saved). */
function normalizeCatalogBadges(apiProduct) {
  const tip = String(apiProduct?.tipProdus || '').toLowerCase()
  if (tip !== 'rezidential' && tip !== 'industrial') return apiProduct
  const normalized = {
    ...apiProduct,
    catalogStockStatus: parseCatalogStockStatus(apiProduct.catalogStockStatus) ?? 'in_stock',
    catalogDeliveryBadge: parseCatalogDeliveryBadge(apiProduct.catalogDeliveryBadge) ?? '48h',
    catalogTransportBadge: parseCatalogTransportBadge(apiProduct.catalogTransportBadge) ?? 'free',
  }
  if (tip === 'industrial') {
    normalized.catalogInstallBadge =
      parseCatalogInstallBadge(apiProduct.catalogInstallBadge) ?? 'baterino'
  }
  return normalized
}

/** string[] of ReducereProgram ids; invalid input → [] */
function parseReducereProgramIds(v) {
  if (v == null) return []
  if (!Array.isArray(v)) return []
  const ids = [...new Set(v.filter((x) => typeof x === 'string' && String(x).trim()).map((s) => String(s).trim()))]
  return ids
}

/** Optional JWT for public product routes (partners see prices when allowed). */
function readOptionalAuthPayload(req) {
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

/** Strip money fields for anonymous users when visibility is not public. Rezidențial epuizat/în curând: și partenerii nu primesc preț. */
function applyPublicPricePolicy(apiProduct, authPayload) {
  const vis = apiProduct.priceVisibility || 'public'
  const tip = String(apiProduct.tipProdus || '').toLowerCase()
  const stock = apiProduct.catalogStockStatus
  const residentialUnavailable =
    tip === 'rezidential' && (stock === 'out_of_stock' || stock === 'coming_soon')
  const role = authPayload?.role
  if (residentialUnavailable && role === 'partener') {
    return {
      ...apiProduct,
      landedPrice: null,
      salePrice: null,
      partnerSalePrice: null,
      vat: null,
    }
  }
  if (vis === 'public') {
    return { ...apiProduct, partnerSalePrice: null }
  }
  if (role === 'partener') {
    return { ...apiProduct, salePrice: null, landedPrice: null }
  }
  return {
    ...apiProduct,
    landedPrice: null,
    salePrice: null,
    partnerSalePrice: null,
    vat: null,
  }
}

function guestResidentialProductEligible(apiProduct) {
  const vis = apiProduct.priceVisibility || 'public'
  if (vis !== 'public') return false
  if (String(apiProduct.tipProdus || '').toLowerCase() !== 'rezidential') return false
  const stock = apiProduct.catalogStockStatus
  if (stock === 'out_of_stock' || stock === 'coming_soon') return false
  const saleRaw = apiProduct.salePrice
  const sale =
    saleRaw == null || saleRaw === ''
      ? NaN
      : parseFloat(String(saleRaw).replace(/\s/g, '').replace(',', '.'))
  if (!Number.isFinite(sale) || sale <= 0) return false
  return true
}

/** Parteneri: catalog larg (industrial, medical…); prețuri vizibile doar cu JWT — verifică după applyPublicPricePolicy. */
function partnerCatalogCheckoutProductEligible(apiProduct) {
  const partnerRaw = apiProduct.partnerSalePrice
  const partner =
    partnerRaw == null || partnerRaw === ''
      ? NaN
      : parseFloat(String(partnerRaw).replace(/\s/g, '').replace(',', '.'))
  if (Number.isFinite(partner) && partner > 0) {
    // ok
  } else {
    const saleRaw = apiProduct.salePrice
    const sale =
      saleRaw == null || saleRaw === ''
        ? NaN
        : parseFloat(String(saleRaw).replace(/\s/g, '').replace(',', '.'))
    if (!Number.isFinite(sale) || sale <= 0) return false
  }
  const tip = String(apiProduct.tipProdus || '').toLowerCase()
  const stock = apiProduct.catalogStockStatus
  if (tip === 'rezidential' && (stock === 'out_of_stock' || stock === 'coming_soon')) return false
  const vis = apiProduct.priceVisibility || 'public'
  if (vis !== 'public' && vis !== 'partner_only' && vis !== 'hidden') return false
  return true
}

/**
 * Catalog line: salePrice / partnerSalePrice = unit fără TVA; TVA se aplică pe prețul după reducere (program).
 * @returns {{ quantity: number, unitExclCatalog: number, vatPercent: number | null }}
 */
function computeGuestResidentialLineTotals(apiProduct, qty, opts = {}) {
  const usePartner = Boolean(opts.usePartnerPrice)
  const primaryField = usePartner ? 'partnerSalePrice' : 'salePrice'
  let sale = parseFloat(String(apiProduct[primaryField] ?? '').replace(/\s/g, '').replace(',', '.'))
  if (usePartner && (!Number.isFinite(sale) || sale <= 0)) {
    sale = parseFloat(String(apiProduct.salePrice ?? '').replace(/\s/g, '').replace(',', '.'))
  }
  const vatRaw = apiProduct.vat
  const vat =
    vatRaw == null || vatRaw === '' ? 0 : parseFloat(String(vatRaw).replace(/\s/g, '').replace(',', '.'))
  const hasVat = Number.isFinite(vat) && vat > 0
  const unitExclCatalog = Number.isFinite(sale) ? sale : 0
  const q = Math.min(99, Math.max(1, parseInt(String(qty), 10) || 1))
  return {
    quantity: q,
    unitExclCatalog,
    vatPercent: hasVat ? vat : null,
  }
}

/** Reducerea (factor 0–1) se aplică pe prețul fără TVA; apoi se adaugă TVA → preț final cu TVA. */
function applyDiscountFactorToGuestLineTotals(baseTotals, discountFactor) {
  const f = Math.min(1, Math.max(0, Number(discountFactor) || 0))
  const unitExclAfterDiscount = baseTotals.unitExclCatalog * (1 - f)
  const vp = baseTotals.vatPercent
  const unitIncl =
    vp != null && Number(vp) > 0 ? unitExclAfterDiscount * (1 + Number(vp) / 100) : unitExclAfterDiscount
  return {
    quantity: baseTotals.quantity,
    unitPriceInclVat: unitIncl,
    lineTotalInclVat: unitIncl * baseTotals.quantity,
    vatPercent: baseTotals.vatPercent,
  }
}

async function resolveGuestLineDiscountFactor(productRecord, reducereProgramId) {
  const raw = String(reducereProgramId || '').trim()
  if (!raw || raw.startsWith('local-')) return 0
  const prog = await prisma.reducereProgram.findUnique({ where: { id: raw } })
  if (!prog || prog.discountPercent == null) {
    throw new Error('Programul de reducere nu este valid.')
  }
  const pct = Number(prog.discountPercent)
  if (!Number.isFinite(pct) || pct <= 0 || pct > 100) {
    throw new Error('Programul de reducere nu este valid.')
  }
  const allowed = parseReducereProgramIds(productRecord.reducereProgramIds)
  if (allowed.length > 0 && !allowed.includes(raw)) {
    throw new Error('Acest program de reducere nu se aplică la acest produs.')
  }
  return pct / 100
}

function stripControlChars(s) {
  return String(s).replace(/[\u0000-\u001F\u007F]/g, '')
}

/** Nume / prenume: litere Unicode, spațiu, cratimă, apostrof. */
function sanitizeGuestOrderPersonName(value) {
  const s = stripControlChars(value ?? '')
  return s.replace(/[^\p{L}\s'\-]/gu, '').replace(/\s+/g, ' ').trim()
}

/**
 * Nume din token Google — mai permisiv decât guest checkout (poate include cifre rare, semne diacritice combinate).
 * Strict guest sanitization golește prea ușor claim-urile reale din JWT.
 */
function sanitizeOAuthPersonName(value) {
  const s = stripControlChars(value ?? '')
  return s.replace(/[^\p{L}\p{M}\p{N}\s'\-]/gu, '').replace(/\s+/g, ' ').trim()
}

/** Prenume + nume din claim-uri Google (given_name / family_name / name). */
function namesFromGoogleClaims(g) {
  const clean = (v) => sanitizeOAuthPersonName(v || '')
  let firstName = clean(g.givenName)
  let lastName = clean(g.familyName)
  if (!firstName && !lastName && g.name) {
    const raw = String(g.name).trim()
    const parts = raw.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      firstName = clean(parts[0])
      lastName = clean(parts.slice(1).join(' '))
    } else if (parts.length === 1) {
      firstName = clean(parts[0])
    }
  }
  return { firstName, lastName }
}

/** Adresă, județ, localitate: litere, cifre, punctuație limitată (fără ghilimele / caractere tip injection). */
function sanitizeGuestOrderText(value) {
  const s = stripControlChars(value ?? '')
  return s.replace(/[^\p{L}\p{N}\s.,'\-/#]/gu, '').trim()
}

/** Cod poștal: litere, cifre, spațiu, cratimă. */
function sanitizeGuestOrderPostal(value) {
  const s = stripControlChars(value ?? '')
  return s.replace(/[^\p{L}\p{N}\s\-]/gu, '').trim()
}

/** CUI / cod fiscal firmă: litere și cifre (fără spații sau punctuație). */
function sanitizeCompanyCui(value) {
  const s = stripControlChars(value ?? '')
  return s.replace(/[^\p{L}\p{N}]/gu, '').toUpperCase()
}

function clientProfileDefaultsFromRow(prev) {
  if (!prev) {
    return {
      firstName: '',
      lastName: '',
      phone: '',
      billAddress: '',
      billCounty: '',
      billCity: '',
      billPostal: '',
      deliveryDifferent: false,
      delAddress: null,
      delCounty: null,
      delCity: null,
      delPostal: null,
      companyName: '',
      companyCui: '',
      companyAddress: '',
      companyCounty: '',
      companyCity: '',
      companyPostal: '',
    }
  }
  return {
    firstName: prev.firstName ?? '',
    lastName: prev.lastName ?? '',
    phone: prev.phone ?? '',
    billAddress: prev.billAddress ?? '',
    billCounty: prev.billCounty ?? '',
    billCity: prev.billCity ?? '',
    billPostal: prev.billPostal ?? '',
    deliveryDifferent: Boolean(prev.deliveryDifferent),
    delAddress: prev.delAddress ?? null,
    delCounty: prev.delCounty ?? null,
    delCity: prev.delCity ?? null,
    delPostal: prev.delPostal ?? null,
    companyName: prev.companyName ?? '',
    companyCui: prev.companyCui ?? '',
    companyAddress: prev.companyAddress ?? '',
    companyCounty: prev.companyCounty ?? '',
    companyCity: prev.companyCity ?? '',
    companyPostal: prev.companyPostal ?? '',
  }
}

function sanitizeDeliveryBlock(body, deliveryDifferent) {
  let delAddress = body.delAddress != null ? sanitizeGuestOrderText(body.delAddress) : ''
  let delCounty = body.delCounty != null ? sanitizeGuestOrderText(body.delCounty) : ''
  let delCity = body.delCity != null ? sanitizeGuestOrderText(body.delCity) : ''
  let delPostal = body.delPostal != null ? sanitizeGuestOrderPostal(body.delPostal) : ''
  if (!deliveryDifferent) {
    return { delAddress: null, delCounty: null, delCity: null, delPostal: null }
  }
  return {
    delAddress: delAddress || null,
    delCounty: delCounty || null,
    delCity: delCity || null,
    delPostal: delPostal || null,
  }
}

function normalizeCheckoutItems(body) {
  if (Array.isArray(body.items) && body.items.length > 0) {
    const out = []
    for (const x of body.items) {
      if (!x || typeof x !== 'object') continue
      const productIdOrSlug = String(x.productIdOrSlug || x.slug || '').trim()
      if (!productIdOrSlug) continue
      const rid = x.reducereProgramId != null ? String(x.reducereProgramId).trim() : ''
      out.push({
        productIdOrSlug,
        quantity: x.quantity,
        reducereProgramId: rid && !rid.startsWith('local-') ? rid : null,
      })
    }
    return out
  }
  const one = String(body.productIdOrSlug || body.slug || '').trim()
  if (!one) return []
  return [{ productIdOrSlug: one, quantity: body.quantity }]
}

async function findPublicProductRecordByIdOrSlug(idOrSlug) {
  const id = String(idOrSlug || '').trim()
  if (!id) return null
  const isCuid = /^c[a-z0-9]{24}$/.test(id)
  let product = await prisma.product.findFirst({
    where: {
      status: 'published',
      ...(isCuid ? { id } : { slug: id }),
    },
  })
  if (!product) {
    const publishedCount = await prisma.product.count({ where: { status: 'published' } })
    if (publishedCount === 0) {
      product = await prisma.product.findFirst({
        where: isCuid ? { id } : { slug: id },
      })
    }
  }
  return product
}

function slugify(title) {
  if (!title || typeof title !== 'string') return ''
  return title
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100) || 'produs'
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })
const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET env var is missing or too short (min 32 chars). Aborting.')
  process.exit(1)
}

/** Pe Railway / reverse proxy: setează TRUST_PROXY=1 ca req.ip să fie IP-ul clientului (rate limit corect). */
if (String(process.env.TRUST_PROXY || '').trim() === '1') {
  app.set('trust proxy', 1)
}

app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Product-Folder', 'X-Image-Index'],
  exposedHeaders: ['Content-Disposition'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))
/** Limită mărită pentru export PDF ofertă (HTML self-contained în body JSON). */
app.use(express.json({ limit: '8mb' }))

// Explicit OPTIONS for admin products (CORS preflight)
app.options('/api/admin/products', (_, res) => res.status(204).end())
app.options('/api/admin/products/', (_, res) => res.status(204).end())
app.options('/api/admin/products/:id', (_, res) => res.status(204).end())

// ── Auth middleware (pentru rute protejate) ────────────────────────────
async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Token lipsă.' })
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, deletedAt: true },
    })
    if (!user || user.deletedAt) {
      return res.status(401).json({
        error: user?.deletedAt ? 'Contul a fost șters.' : 'Token invalid.',
      })
    }
    req.userId = user.id
    req.userRole = user.role
    req.userEmail = user.email
    next()
  } catch (err) {
    if (err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token invalid.' })
    }
    console.error('authMiddleware error:', err)
    return res.status(500).json({ error: 'Eroare de autentificare.' })
  }
}

function adminAuthMiddleware(req, res, next) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Acces restricționat. Doar administratorii pot accesa.' })
  }
  next()
}

function clientAuthMiddleware(req, res, next) {
  if (req.userRole !== 'client') {
    return res.status(403).json({ error: 'Acces restricționat. Doar conturile client pot accesa.' })
  }
  next()
}

function partnerAuthMiddleware(req, res, next) {
  if (req.userRole !== 'partener') {
    return res.status(403).json({ error: 'Acces restricționat. Doar conturile partener pot accesa.' })
  }
  next()
}

/** Bearer opțional: pentru POST /api/retur — completează datele din profil dacă e client autentificat. */
function optionalAuthMiddleware(req, res, next) {
  req.userId = undefined
  req.userRole = undefined
  req.userEmail = undefined
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return next()
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = payload.userId
    req.userRole = payload.role
    req.userEmail = payload.email ?? null
  } catch {
    // ignoră token invalid
  }
  next()
}

function salesAgentAuthMiddleware(req, res, next) {
  if (req.userRole !== 'sales_agent') {
    return res.status(403).json({ error: 'Acces restricționat. Doar agenții de vânzări pot accesa.' })
  }
  next()
}

/** Internal path only (open after email verify). */
function safeSignupNext(raw) {
  if (raw == null || typeof raw !== 'string') return ''
  let s = raw.trim()
  try {
    s = decodeURIComponent(s)
  } catch {
    return ''
  }
  if (!s.startsWith('/') || s.startsWith('//')) return ''
  if (s.includes('\n') || s.includes('\r')) return ''
  return s.slice(0, 512)
}

/** Explicit opt-in only — pre-ticked or omitted values are treated as false. */
function parseMarketingEmailOptIn(body) {
  return body?.marketingEmailOptIn === true
}

function marketingEmailOptInCreateData(body) {
  if (!parseMarketingEmailOptIn(body)) return {}
  return { marketingEmailOptIn: true, marketingEmailOptInAt: new Date() }
}

/** Cod numeric 6 cifre (leading zeros) pentru verificare email la înregistrare. */
function randomSignupVerificationCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
}

const SIGNUP_VERIFICATION_CODE_TTL_MS = 15 * 60 * 1000

async function buildGoogleAuthPayload(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  })
  if (!user) throw new Error('Utilizator negăsit după autentificare Google.')
  let needsPartnerProfile = false
  let partnerSignupPath = '/signup/parteneri/profil'
  if (user.role === 'partener') {
    const p = await prisma.partner.findUnique({
      where: { userId },
      select: {
        companyName: true,
        cui: true,
        activityTypes: true,
        contactFirstName: true,
        phone: true,
      },
    })
    if (!p) {
      needsPartnerProfile = true
      partnerSignupPath = '/signup/parteneri/profil'
    } else if (!String(p.companyName || '').trim() || !String(p.cui || '').trim()) {
      needsPartnerProfile = true
      partnerSignupPath = '/signup/parteneri/profil'
    } else if (
      !String(p.activityTypes || '').trim() ||
      !String(p.contactFirstName || '').trim() ||
      !String(p.phone || '').trim()
    ) {
      needsPartnerProfile = true
      partnerSignupPath = '/signup/parteneri/profil-public'
    }
  }
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' },
  )
  return {
    token,
    user: { id: user.id, email: user.email, role: user.role },
    needsPartnerProfile,
    ...(needsPartnerProfile ? { partnerSignupPath } : {}),
  }
}

// ── Auth: Signup (step 1) ─────────────────────────────────────────────
app.post('/api/auth/signup', signupLimiter, async (req, res) => {
  try {
    const body = req.body || {}
    const email = String(body.email || '').trim().toLowerCase()
    const password = body.password
    const role = body.role
    const nextPath = safeSignupNext(body.next)

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, parolă și rol sunt obligatorii.' })
    }
    if (!['client', 'partener'].includes(role)) {
      return res.status(400).json({ error: 'Rol invalid.' })
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Parola trebuie să aibă cel puțin 8 caractere.' })
    }
    if (body.acceptedTerms !== true) {
      return res.status(400).json({
        error:
          'Trebuie să accepți Termenii și Condițiile și Politica de Confidențialitate pentru a crea contul.',
      })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'Există deja un cont cu acest email.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const verificationCode = randomSignupVerificationCode()
    const verificationCodeExpiresAt = new Date(Date.now() + SIGNUP_VERIFICATION_CODE_TTL_MS)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        verificationCode,
        verificationCodeExpiresAt,
        ...marketingEmailOptInCreateData(body),
      },
    })

    await logAccountCreationConsents(prisma, req, user.id, parseMarketingEmailOptIn(body))

    let verificationSent = false
    if (isMailConfigured()) {
      try {
        await sendVerificationCode(email, verificationCode, role)
        verificationSent = true
      } catch (mailErr) {
        console.error('[Signup] User created but verification email failed:', user.id, user.email, mailErr)
      }
    } else {
      console.warn('[Signup] User created (mail not configured). User must use resend after mail is configured.')
    }

    console.log(
      '[Signup] User created:',
      user.id,
      user.email,
      !isMailConfigured() ? '(no mail)' : verificationSent ? '(code email sent)' : '(email failed)',
    )

    return res.status(201).json({
      message: verificationSent
        ? 'Cont creat. Verifică emailul pentru codul de 6 cifre.'
        : isMailConfigured()
          ? 'Cont creat. Nu am putut trimite acum emailul cu codul (server de mail). Folosește „Retrimite codul” după ce repari SMTP/Resend.'
          : 'Cont creat. Emailul nu este configurat pe server; configurează SMTP sau Resend, apoi retrimite codul.',
      email: user.email,
      verificationSent,
    })
  } catch (err) {
    console.error('Signup error:', err)
    const msg = err?.message || 'Eroare la înregistrare.'
    res.status(500).json({ error: msg, debug: String(err?.message || err) })
  }
})

// ── Auth: Resend verification code ───────────────────────────────────
app.post('/api/auth/resend-code', resendCodeLimiter, async (req, res) => {
  try {
    const body = req.body || {}
    const email = String(body.email || '').trim().toLowerCase()
    const nextPath = safeSignupNext(body.next)

    if (!email) {
      return res.status(400).json({ error: 'Email este obligatoriu.' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(404).json({ error: 'Contul nu a fost găsit.' })
    }

    if (!user.verificationCode) {
      return res.status(400).json({ error: 'Contul este deja verificat.' })
    }

    const verificationCode = randomSignupVerificationCode()
    const verificationCodeExpiresAt = new Date(Date.now() + SIGNUP_VERIFICATION_CODE_TTL_MS)

    try {
      await sendVerificationCode(email, verificationCode, user.role)
    } catch (mailErr) {
      console.error('[Resend] Verification code email failed:', mailErr)
      return res.status(503).json({
        error:
          'Nu am putut trimite emailul. Verifică setările Resend sau SMTP (ex.: parolă SMTP, port) și încearcă din nou.',
      })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode, verificationCodeExpiresAt },
    })

    return res.json({ message: 'Cod de verificare retrimis.' })
  } catch (err) {
    console.error('Resend error:', err)
    res.status(500).json({ error: 'Eroare la retrimiterea emailului.' })
  }
})

// ── Auth: Verify email (magic link token — doar conturi vechi cu token lung în DB) ──
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const token = String(req.body?.token || '').trim()
    if (!token || token.length < 32) {
      return res.status(400).json({ error: 'Link invalid.' })
    }

    const user = await prisma.user.findFirst({
      where: { verificationCode: token },
    })

    if (!user) {
      return res.status(400).json({ error: 'Link invalid sau deja folosit.' })
    }

    if (!user.verificationCodeExpiresAt || new Date() > user.verificationCodeExpiresAt) {
      return res.status(400).json({
        error: 'Link expirat. Cere un link nou din pagina de înregistrare.',
      })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode: null, verificationCodeExpiresAt: null },
    })

    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    return res.json({
      token: jwtToken,
      user: { id: user.id, email: user.email, role: user.role },
    })
  } catch (err) {
    console.error('Verify-email error:', err)
    res.status(500).json({ error: 'Eroare la verificare.' })
  }
})

// ── Auth: Verify code (6 cifre — înregistrare client și partener) ─────────
app.post('/api/auth/verify', verifyIpLimiter, async (req, res) => {
  try {
    const body = req.body || {}
    const email = String(body.email || '').trim().toLowerCase()
    const codeDigits = String(body.code ?? '').replace(/\D/g, '').slice(0, 6)

    if (!email || codeDigits.length !== 6) {
      return res.status(400).json({ error: 'Email și cod din 6 cifre sunt obligatorii.' })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })
    if (!user) {
      return res.status(404).json({ error: 'Contul nu a fost găsit.' })
    }

    if (!user.verificationCode) {
      return res.status(400).json({ error: 'Contul este deja verificat sau codul a expirat. Te rugăm să te înregistrezi din nou.' })
    }

    if (!user.verificationCodeExpiresAt || new Date() > user.verificationCodeExpiresAt) {
      return res.status(400).json({ error: 'Cod expirat. Te rugăm să ceri un cod nou.' })
    }

    if (codeDigits !== String(user.verificationCode)) {
      const { shouldClearCode } = recordOtpFailure(email)
      if (shouldClearCode) {
        await prisma.user.update({
          where: { id: user.id },
          data: { verificationCode: null, verificationCodeExpiresAt: null },
        })
        return res.status(429).json({
          error: 'Prea multe încercări incorecte. Solicită un cod nou.',
          code: 'otp_locked',
        })
      }
      return res.status(400).json({ error: 'Cod incorect.' })
    }

    clearOtpAttempts(email)
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode: null, verificationCodeExpiresAt: null },
    })

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    return res.json({ token, user: { id: user.id, email: user.email, role: user.role } })
  } catch (err) {
    console.error('Verify error:', err)
    res.status(500).json({ error: 'Eroare la verificare.' })
  }
})

// ── Auth: Forgot password (request reset link) ──────────────────────────
app.post('/api/auth/forgot-password', forgotPasswordLimiter, async (req, res) => {
  try {
    const body = req.body || {}
    const email = String(body.email || '').trim().toLowerCase()

    if (!email) {
      return res.status(400).json({ error: 'Email este obligatoriu.' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'Dacă există un cont cu acest email, vei primi un link de resetare.' })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpiresAt: expiresAt },
    })

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`

    await sendPasswordResetEmail(email, resetUrl)

    console.log('[Forgot password] Reset requested for:', user.email, isMailConfigured() ? `(email sent via ${getMailProvider()})` : '(mail not configured)')

    return res.json({ message: 'Dacă există un cont cu acest email, vei primi un link de resetare.' })
  } catch (err) {
    console.error('Forgot password error:', err)
    res.status(500).json({ error: 'Eroare la trimiterea link-ului de resetare.' })
  }
})

// ── Auth: Reset password (with token) ───────────────────────────────────
app.post('/api/auth/reset-password', resetPasswordLimiter, async (req, res) => {
  try {
    const body = req.body || {}
    const token = body.token
    const newPassword = body.password

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token și parola nouă sunt obligatorii.' })
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Parola trebuie să aibă cel puțin 8 caractere.' })
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiresAt: { gt: new Date() },
      },
    })

    if (!user) {
      return res.status(400).json({ error: 'Link invalid sau expirat. Solicită un link nou.' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    })

    console.log('[Reset password] Password updated for:', user.email)

    return res.json({ message: 'Parola a fost actualizată. Poți te autentifica acum.' })
  } catch (err) {
    console.error('Reset password error:', err)
    res.status(500).json({ error: 'Eroare la resetarea parolei.' })
  }
})

// ── Auth: Login ────────────────────────────────────────────────────────
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const body = req.body || {}
    const email = String(body.email || '').trim().toLowerCase()
    const password = body.password

    if (!email || !password) {
      return res.status(400).json({ error: 'Email și parolă sunt obligatorii.' })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })
    if (!user) {
      return res.status(401).json({ error: 'Email sau parolă incorectă.' })
    }
    if (user.deletedAt) {
      return res.status(401).json({ error: 'Acest cont a fost șters.' })
    }

    if (!user.password) {
      return res.status(401).json({ error: 'Acest cont folosește Conectează-te cu Google.' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Email sau parolă incorectă.' })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    return res.json({ token, user: { id: user.id, email: user.email, role: user.role } })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Eroare la autentificare.' })
  }
})

// ── Auth: Google (GIS / FedCM — ID token de la frontend) ────────────────
app.post('/api/auth/google', googleAuthLimiter, async (req, res) => {
  try {
    const body = req.body || {}
    const idToken = String(body.idToken || '').trim()
    const role = body.role

    if (!idToken) {
      return res.status(400).json({ error: 'Token Google lipsă.' })
    }

    let g
    try {
      g = await verifyGoogleIdToken(idToken)
    } catch (e) {
      if (e?.code === 'GOOGLE_NOT_CONFIGURED') {
        return res.status(503).json({ error: 'Autentificarea Google nu este configurată pe server (GOOGLE_CLIENT_ID).' })
      }
      if (e?.code === 'EMAIL_NOT_VERIFIED') {
        return res.status(400).json({ error: 'Emailul Google nu este verificat. Verifică contul Google și încearcă din nou.' })
      }
      const auds = idTokenAudiences(idToken)
      const expected = googleClientIds()
      if (auds.length && expected.length && !auds.some((a) => expected.includes(a))) {
        console.error('[Auth Google] audience mismatch: token aud=', auds, 'API GOOGLE_CLIENT_ID=', expected)
        return res.status(401).json({
          error:
            'Google: ID-ul client din site (VITE_GOOGLE_CLIENT_ID pe Vercel) nu este același cu GOOGLE_CLIENT_ID de pe API (ex. Railway). Folosește același OAuth 2.0 Web Client ID în ambele locuri și redeploy.',
        })
      }
      console.error('[Auth Google] verify:', e?.message || e)
      return res.status(401).json({ error: 'Token Google invalid sau expirat.' })
    }

    const { sub, email } = g
    if (!email) {
      return res.status(400).json({ error: 'Google nu a returnat adresa de email.' })
    }

    const googleNames = namesFromGoogleClaims({
      givenName: g.givenName,
      familyName: g.familyName,
      name: g.name,
    })

    const intent = String(body.intent || '').trim().toLowerCase()
    const intentSignup = intent === 'signup'
    const intentLogin = intent === 'login'

    let user = await prisma.user.findUnique({ where: { googleSub: sub } })
    if (!user) {
      user = await prisma.user.findUnique({ where: { email } })
    }

    if (user) {
      if (user.deletedAt) {
        return res.status(401).json({
          error: 'Acest cont a fost șters.',
          code: 'ACCOUNT_DELETED',
        })
      }
      /** Înregistrare pe `/signup/clienti`: nu autentifica cont existent și nu împinge în onboarding parteneri. */
      if (intentSignup) {
        return res.status(409).json({
          error: 'Există deja un cont cu acest email.',
          code: 'ACCOUNT_EXISTS',
        })
      }
      if (user.googleSub && user.googleSub !== sub) {
        return res.status(409).json({ error: 'Acest email este deja asociat cu un alt cont Google.' })
      }
      const data = {}
      if (!user.googleSub) data.googleSub = sub
      if (user.verificationCode != null || user.verificationCodeExpiresAt != null) {
        data.verificationCode = null
        data.verificationCodeExpiresAt = null
      }
      if (
        user.role === 'client' &&
        (googleNames.firstName || googleNames.lastName)
      ) {
        if (!String(user.firstName || '').trim() && googleNames.firstName) {
          data.firstName = googleNames.firstName
        }
        if (!String(user.lastName || '').trim() && googleNames.lastName) {
          data.lastName = googleNames.lastName
        }
      }
      if (Object.keys(data).length) {
        user = await prisma.user.update({ where: { id: user.id }, data })
      }
      if (
        user.role === 'client' &&
        (googleNames.firstName || googleNames.lastName)
      ) {
        const prof = await prisma.clientProfile.findUnique({ where: { userId: user.id } })
        if (!prof) {
          await prisma.clientProfile.create({
            data: {
              userId: user.id,
              firstName: googleNames.firstName || '',
              lastName: googleNames.lastName || '',
            },
          })
        } else {
          const pData = {}
          if (!String(prof.firstName || '').trim() && googleNames.firstName) {
            pData.firstName = googleNames.firstName
          }
          if (!String(prof.lastName || '').trim() && googleNames.lastName) {
            pData.lastName = googleNames.lastName
          }
          if (Object.keys(pData).length) {
            await prisma.clientProfile.update({ where: { userId: user.id }, data: pData })
          }
        }
      }
      const out = await buildGoogleAuthPayload(user.id)
      return res.json(out)
    }

    /** Pagina `/login`: fără creare cont nou — doar conturi existente (googleSub sau email legat). */
    if (intentLogin) {
      return res.status(404).json({
        error:
          'Nu există un cont Baterino asociat cu acest cont Google. Înregistrează-te mai întâi sau folosește email și parola.',
        code: 'GOOGLE_NO_ACCOUNT',
      })
    }

    const acceptedTerms = body.acceptedTerms === true
    if (!acceptedTerms) {
      return res.status(400).json({
        error:
          'Trebuie să accepți Termenii și Condițiile și Politica de Confidențialitate pentru a crea contul cu Google.',
        code: 'GOOGLE_TERMS_REQUIRED',
      })
    }

    const effectiveRole =
      role && ['client', 'partener'].includes(role) ? role : 'client'

    const created = await prisma.user.create({
      data: {
        email,
        password: null,
        role: effectiveRole,
        googleSub: sub,
        verificationCode: null,
        verificationCodeExpiresAt: null,
        firstName: googleNames.firstName,
        lastName: googleNames.lastName,
        ...marketingEmailOptInCreateData(body),
        ...(effectiveRole === 'client'
          ? {
              clientProfile: {
                create: {
                  firstName: googleNames.firstName,
                  lastName: googleNames.lastName,
                },
              },
            }
          : {}),
      },
    })
    await logAccountCreationConsents(prisma, req, created.id, parseMarketingEmailOptIn(body))
    const out = await buildGoogleAuthPayload(created.id)
    return res.json(out)
  } catch (err) {
    console.error('Google auth error:', err)
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return res.status(409).json({ error: 'Există deja un cont cu acest email.' })
    }
    res.status(500).json({ error: 'Eroare la autentificare cu Google.' })
  }
})

// ── Client: profil, parolă, comenzi ──────────────────────────────────────
async function ensureUserReferralCode(userId) {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  })
  if (!u) return null
  if (u.referralCode) return u.referralCode
  for (let attempt = 0; attempt < 15; attempt++) {
    const code = `BAT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
    try {
      await prisma.user.update({ where: { id: userId }, data: { referralCode: code } })
      return code
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') continue
      throw err
    }
  }
  return null
}

/** Preferă numele din ClientProfile; dacă lipsește sau e gol, folosește User (ex. înregistrare Google). */
function pickProfileOrUserName(profileVal, userVal) {
  const p = String(profileVal ?? '').trim()
  if (p) return p
  return String(userVal ?? '').trim()
}

const MAX_CLIENT_CART_LINES = 80

/** Validează / normalizează liniile coșului client (aceeași semantică ca frontend CartLine). */
function normalizeClientCartLinesFromBody(rawLines) {
  if (!Array.isArray(rawLines)) return []
  const out = []
  for (let i = 0; i < Math.min(rawLines.length, MAX_CLIENT_CART_LINES); i++) {
    const x = rawLines[i]
    if (!x || typeof x !== 'object') continue
    const productId = String(x.productId ?? '').trim().slice(0, 128)
    const slug = String(x.slug ?? '').trim().slice(0, 256)
    const title = String(x.title ?? '').trim().slice(0, 400)
    let qty = Math.floor(Number(x.qty))
    if (!Number.isFinite(qty) || qty < 1) qty = 1
    const discRaw = x.reducereDiscountPercent
    const hasDisc = discRaw != null && Number(discRaw) > 0
    const reducereDiscountPercent = hasDisc ? Math.min(100, Math.max(1, Number(discRaw))) : undefined
    const reducereProgramId =
      reducereDiscountPercent != null &&
      x.reducereProgramId != null &&
      String(x.reducereProgramId).trim()
        ? String(x.reducereProgramId).trim().slice(0, 128)
        : undefined
    if (hasDisc) qty = 1
    else qty = Math.min(99, qty)
    if (!productId || !title) continue
    const line = { productId, slug, title, qty }
    if (typeof x.imageUrl === 'string' && x.imageUrl.trim()) {
      line.imageUrl = x.imageUrl.trim().slice(0, 2048)
    }
    if (reducereProgramId) line.reducereProgramId = reducereProgramId
    if (reducereDiscountPercent != null) line.reducereDiscountPercent = reducereDiscountPercent
    out.push(line)
  }
  return out
}

app.get('/api/client/cart', authMiddleware, clientAuthMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { clientCart: true },
    })
    if (!user) return res.status(404).json({ error: 'Utilizator negăsit.' })
    const raw = user.clientCart
    const lines = Array.isArray(raw) ? normalizeClientCartLinesFromBody(raw) : []
    return res.json({ lines })
  } catch (err) {
    console.error('Client cart GET error:', err)
    res.status(500).json({ error: err?.message || 'Eroare.' })
  }
})

app.put('/api/client/cart', authMiddleware, clientAuthMiddleware, async (req, res) => {
  try {
    const body = req.body || {}
    const lines = normalizeClientCartLinesFromBody(body.lines)
    await prisma.user.update({
      where: { id: req.userId },
      data: { clientCart: lines },
    })
    return res.json({ lines })
  } catch (err) {
    console.error('Client cart PUT error:', err)
    res.status(500).json({ error: err?.message || 'Eroare.' })
  }
})

app.get('/api/client/profile', authMiddleware, clientAuthMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        createdAt: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        referralInviteEmailsSent: true,
        referralCodeRedemptionsCount: true,
      },
    })
    if (!user) return res.status(404).json({ error: 'Utilizator negăsit.' })
    const referralCode = await ensureUserReferralCode(req.userId)
    const profile = await prisma.clientProfile.findUnique({ where: { userId: req.userId } })
    const profileDto = profile
      ? {
          firstName: pickProfileOrUserName(profile.firstName, user.firstName),
          lastName: pickProfileOrUserName(profile.lastName, user.lastName),
          phone: profile.phone,
          billAddress: profile.billAddress,
          billCounty: profile.billCounty,
          billCity: profile.billCity,
          billPostal: profile.billPostal,
          deliveryDifferent: profile.deliveryDifferent,
          delAddress: profile.delAddress,
          delCounty: profile.delCounty,
          delCity: profile.delCity,
          delPostal: profile.delPostal,
          companyName: profile.companyName,
          companyCui: profile.companyCui,
          companyAddress: profile.companyAddress,
          companyCounty: profile.companyCounty,
          companyCity: profile.companyCity,
          companyPostal: profile.companyPostal,
        }
      : {
          firstName: String(user.firstName || '').trim(),
          lastName: String(user.lastName || '').trim(),
          phone: '',
          billAddress: '',
          billCounty: '',
          billCity: '',
          billPostal: '',
          deliveryDifferent: false,
          delAddress: null,
          delCounty: null,
          delCity: null,
          delPostal: null,
          companyName: '',
          companyCui: '',
          companyAddress: '',
          companyCounty: '',
          companyCity: '',
          companyPostal: '',
        }
    return res.json({
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt || ''),
      email: user.email,
      referralCode,
      referralInviteEmailsSent: user.referralInviteEmailsSent ?? 0,
      referralCodeRedemptionsCount: user.referralCodeRedemptionsCount ?? 0,
      /** False pentru conturi create cu Google fără parolă locală (password null în DB). */
      hasPassword: Boolean(user.password),
      profile: profileDto,
    })
  } catch (err) {
    console.error('Client profile GET error:', err)
    res.status(500).json({ error: err?.message || 'Eroare.' })
  }
})

function mapReturRowForExport(row) {
  return {
    id: row.id,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
    submitSource: row.submitSource,
    lastName: row.lastName,
    firstName: row.firstName,
    street: row.street,
    county: row.county,
    city: row.city,
    postal: row.postal,
    phone: row.phone,
    email: row.email,
    orderNumber: row.orderNumber,
    receiptDate: row.receiptDate,
    serialNumber: row.serialNumber,
    productBrand: row.productBrand,
    productModel: row.productModel,
    returnReason: row.returnReason,
    returnReasonOther: row.returnReasonOther,
    condUninstalled: row.condUninstalled,
    condSeals: row.condSeals,
    condPackaging: row.condPackaging,
    pickupStreet: row.pickupStreet,
    pickupCounty: row.pickupCounty,
    pickupCity: row.pickupCity,
    pickupPostal: row.pickupPostal,
    refundTitular: row.refundTitular,
    refundIban: row.refundIban,
    policyAccepted: row.policyAccepted,
    declarationAccepted: row.declarationAccepted,
    locale: row.locale,
    conditionPhotoUrls: row.conditionPhotoUrls,
    status: row.status,
  }
}

function clientDataExportFilename(email) {
  const safe = String(email || 'cont')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._+-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120)
  return `baterino-datele-mele-${safe || 'cont'}.json`
}

/** GDPR Art. 20 — export JSON al datelor personale ale clientului autentificat. */
app.get('/api/client/export-data', authMiddleware, clientAuthMiddleware, async (req, res) => {
  try {
    const userId = req.userId
    const emailNorm = String(req.userEmail || '')
      .trim()
      .toLowerCase()

    const [user, profile, modernOrders, legacyOrders, serviceRequests, retururi, consentLogs] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            createdAt: true,
            updatedAt: true,
            referralCode: true,
            referralInviteEmailsSent: true,
            referralCodeRedemptionsCount: true,
            clientCart: true,
            marketingEmailOptIn: true,
            marketingEmailOptInAt: true,
          },
        }),
        prisma.clientProfile.findUnique({ where: { userId } }),
        prisma.residentialOrder.findMany({
          where: { OR: [{ userId }, ...(emailNorm ? [{ email: emailNorm }] : [])] },
          include: { lines: { orderBy: { id: 'asc' } } },
          orderBy: { createdAt: 'desc' },
        }),
        emailNorm
          ? prisma.guestResidentialOrder.findMany({
              where: { email: emailNorm, orderSource: 'client' },
              orderBy: { createdAt: 'desc' },
            })
          : Promise.resolve([]),
        prisma.serviceRequest.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.retur.findMany({
          where: { OR: [{ userId }, ...(emailNorm ? [{ email: emailNorm }] : [])] },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.consentLog.findMany({
          where: { userId },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            consentType: true,
            granted: true,
            ipAddress: true,
            userAgent: true,
            createdAt: true,
          },
        }),
      ])

    if (!user) return res.status(404).json({ error: 'Utilizator negăsit.' })

    const referralCode = user.referralCode || (await ensureUserReferralCode(userId))

    const profileDto = profile
      ? {
          firstName: pickProfileOrUserName(profile.firstName, user.firstName),
          lastName: pickProfileOrUserName(profile.lastName, user.lastName),
          phone: profile.phone,
          billAddress: profile.billAddress,
          billCounty: profile.billCounty,
          billCity: profile.billCity,
          billPostal: profile.billPostal,
          deliveryDifferent: profile.deliveryDifferent,
          delAddress: profile.delAddress,
          delCounty: profile.delCounty,
          delCity: profile.delCity,
          delPostal: profile.delPostal,
          companyName: profile.companyName,
          companyCui: profile.companyCui,
          companyAddress: profile.companyAddress,
          companyCounty: profile.companyCounty,
          companyCity: profile.companyCity,
          companyPostal: profile.companyPostal,
          createdAt:
            profile.createdAt instanceof Date ? profile.createdAt.toISOString() : profile.createdAt,
          updatedAt:
            profile.updatedAt instanceof Date ? profile.updatedAt.toISOString() : profile.updatedAt,
        }
      : null

    const cartLines = Array.isArray(user.clientCart)
      ? normalizeClientCartLinesFromBody(user.clientCart)
      : []

    const comenzi = [
      ...modernOrders.map(mapResidentialOrderToClientJson),
      ...legacyOrders.map(mapLegacyGuestOrderToClientJson),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const payload = {
      exportat_la: new Date().toISOString(),
      profil: {
        id: user.id,
        email: user.email,
        firstName: pickProfileOrUserName(profile?.firstName, user.firstName),
        lastName: pickProfileOrUserName(profile?.lastName, user.lastName),
        phone: String(profile?.phone || user.phone || '').trim(),
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
        updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
        marketingEmailOptIn: user.marketingEmailOptIn === true,
        marketingEmailOptInAt:
          user.marketingEmailOptInAt instanceof Date
            ? user.marketingEmailOptInAt.toISOString()
            : user.marketingEmailOptInAt,
        profil_livrare_facturare: profileDto,
      },
      comenzi,
      cereri_service: serviceRequests.map(mapServiceRequestRow),
      retururi: retururi.map(mapReturRowForExport),
      cos_cumparaturi: cartLines.length > 0 ? { lines: cartLines } : null,
      referral: {
        referralCode,
        referralInviteEmailsSent: user.referralInviteEmailsSent ?? 0,
        referralCodeRedemptionsCount: user.referralCodeRedemptionsCount ?? 0,
      },
      consent_log: consentLogs.map((entry) => ({
        ...entry,
        createdAt:
          entry.createdAt instanceof Date ? entry.createdAt.toISOString() : entry.createdAt,
      })),
    }

    const jsonBody = JSON.stringify(payload, null, 2)
    const filename = clientDataExportFilename(user.email)
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Cache-Control', 'no-store')
    return res.send(jsonBody)
  } catch (err) {
    console.error('Client export-data error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la exportul datelor.' })
  }
})

// ── Consent: jurnal imutabil (GDPR) ───────────────────────────────────────
app.post('/api/consent/cookie', optionalAuthMiddleware, async (req, res) => {
  try {
    const body = req.body || {}
    if (typeof body.analytics !== 'boolean') {
      return res.status(400).json({ error: 'Câmpul analytics trebuie să fie true sau false.' })
    }
    await recordConsentLog(prisma, req, {
      userId: req.userId ?? null,
      consentType: CONSENT_TYPES.COOKIE_ANALYTICS,
      granted: body.analytics === true,
    })
    return res.json({ ok: true })
  } catch (err) {
    console.error('Consent cookie POST error:', err)
    res.status(500).json({ error: err?.message || 'Eroare.' })
  }
})

// ── Account: preferințe notificări email (client + partener) ───────────────
app.get('/api/account/email-notifications', authMiddleware, async (req, res) => {
  try {
    if (!['client', 'partener'].includes(req.userRole)) {
      return res.status(403).json({ error: 'Acces restricționat.' })
    }
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { marketingEmailOptIn: true },
    })
    if (!user) return res.status(404).json({ error: 'Utilizator negăsit.' })
    return res.json({ marketingEmailOptIn: user.marketingEmailOptIn === true })
  } catch (err) {
    console.error('Email notifications GET error:', err)
    res.status(500).json({ error: err?.message || 'Eroare.' })
  }
})

app.patch('/api/account/email-notifications', authMiddleware, async (req, res) => {
  try {
    if (!['client', 'partener'].includes(req.userRole)) {
      return res.status(403).json({ error: 'Acces restricționat.' })
    }
    const body = req.body || {}
    if (typeof body.marketingEmailOptIn !== 'boolean') {
      return res.status(400).json({ error: 'Câmpul marketingEmailOptIn trebuie să fie true sau false.' })
    }
    const optIn = body.marketingEmailOptIn === true
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: optIn
        ? { marketingEmailOptIn: true, marketingEmailOptInAt: new Date() }
        : { marketingEmailOptIn: false },
      select: { marketingEmailOptIn: true },
    })
    await recordConsentLog(prisma, req, {
      userId: req.userId,
      consentType: CONSENT_TYPES.MARKETING_EMAILS,
      granted: optIn,
    })
    return res.json({ marketingEmailOptIn: user.marketingEmailOptIn === true })
  } catch (err) {
    console.error('Email notifications PATCH error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la salvare.' })
  }
})

/** Trimite codul de recomandare pe email către adresa introdusă (program „Știu de la vecinu’”). */
app.post('/api/client/referral/send-email', authMiddleware, clientAuthMiddleware, async (req, res) => {
  try {
    if (!isMailConfigured()) {
      return res.status(503).json({
        error: 'Trimiterea emailurilor nu este configurată momentan. Încearcă mai târziu sau folosește „Copiază”.',
      })
    }

    const friendEmail = String(req.body?.friendEmail ?? '')
      .trim()
      .toLowerCase()
    if (!friendEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(friendEmail)) {
      return res.status(400).json({ error: 'Introdu o adresă de email validă.' })
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { email: true, firstName: true, lastName: true },
    })
    if (!user) return res.status(404).json({ error: 'Utilizator negăsit.' })
    if (friendEmail === String(user.email || '').toLowerCase()) {
      return res.status(400).json({ error: 'Nu poți trimite codul către propria adresă de email.' })
    }

    const profile = await prisma.clientProfile.findUnique({
      where: { userId: req.userId },
      select: { firstName: true, lastName: true },
    })
    const firstName = pickProfileOrUserName(profile?.firstName, user.firstName)
    const lastName = pickProfileOrUserName(profile?.lastName, user.lastName)
    const senderName = [firstName, lastName].filter(Boolean).join(' ').trim() || 'Client Baterino'

    const referralCode = await ensureUserReferralCode(req.userId)
    if (!referralCode) {
      return res.status(400).json({ error: 'Codul de recomandare nu este disponibil momentan.' })
    }

    await sendReferralInviteEmail({
      to: friendEmail,
      senderName,
      referralCode,
    })

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: { referralInviteEmailsSent: { increment: 1 } },
      select: { referralInviteEmailsSent: true },
    })

    return res.json({
      message: 'Email trimis.',
      referralInviteEmailsSent: updated.referralInviteEmailsSent,
    })
  } catch (err) {
    console.error('Client referral send-email error:', err)
    const msg = err instanceof Error ? err.message : 'Eroare.'
    res.status(500).json({ error: msg })
  }
})

/** Validare publică cod recomandare (folosit în modalul de programe reduceri). */
app.post('/api/referral/validate-code', async (req, res) => {
  try {
    const referralCode = String(req.body?.referralCode ?? '')
      .trim()
      .toUpperCase()
    if (!referralCode) {
      return res.status(400).json({ error: 'Introdu codul de recomandare.' })
    }
    if (referralCode.length < 4 || referralCode.length > 64) {
      return res.status(400).json({ error: 'Cod de recomandare invalid.' })
    }

    const owner = await prisma.user.findFirst({
      where: {
        role: 'client',
        referralCode: {
          equals: referralCode,
          mode: 'insensitive',
        },
      },
      select: { id: true },
    })
    if (!owner) {
      return res.status(404).json({ error: 'Codul de recomandare nu este valid.' })
    }

    return res.json({
      valid: true,
      referralCode,
      discountPercent: 5,
      message: 'Cod valid. Poți aplica reducerea de 5%.',
    })
  } catch (err) {
    console.error('Referral validate-code error:', err)
    return res.status(500).json({ error: 'Eroare la validarea codului de recomandare.' })
  }
})

app.put('/api/client/profile', authMiddleware, clientAuthMiddleware, async (req, res) => {
  try {
    const body = req.body || {}
    const section =
      body.section === 'personal' || body.section === 'address' || body.section === 'company'
        ? body.section
        : null

    const prev = await prisma.clientProfile.findUnique({ where: { userId: req.userId } })
    const base = clientProfileDefaultsFromRow(prev)

    let data
    if (section === 'personal') {
      const phone = normalizeE164Phone(body.phone)
      if (!phone) {
        return res.status(400).json({ error: 'Telefon invalid.' })
      }
      const firstName = sanitizeGuestOrderPersonName(body.firstName)
      const lastName = sanitizeGuestOrderPersonName(body.lastName)
      if (!firstName || !lastName) {
        return res.status(400).json({ error: 'Nume și prenume sunt obligatorii.' })
      }
      data = {
        ...base,
        firstName,
        lastName,
        phone,
      }
    } else if (section === 'address') {
      const deliveryDifferent = Boolean(body.deliveryDifferent ?? body.differentDeliveryAddress)
      const { delAddress, delCounty, delCity, delPostal } = sanitizeDeliveryBlock(body, deliveryDifferent)
      data = {
        ...base,
        billAddress: sanitizeGuestOrderText(body.billAddress),
        billCounty: sanitizeGuestOrderText(body.billCounty),
        billCity: sanitizeGuestOrderText(body.billCity),
        billPostal: sanitizeGuestOrderPostal(body.billPostal),
        deliveryDifferent,
        delAddress,
        delCounty,
        delCity,
        delPostal,
      }
    } else if (section === 'company') {
      data = {
        ...base,
        companyName: sanitizeGuestOrderText(body.companyName),
        companyCui: sanitizeCompanyCui(body.companyCui),
        companyAddress: sanitizeGuestOrderText(body.companyAddress),
        companyCounty: sanitizeGuestOrderText(body.companyCounty),
        companyCity: sanitizeGuestOrderText(body.companyCity),
        companyPostal: sanitizeGuestOrderPostal(body.companyPostal),
      }
    } else {
      const deliveryDifferent = Boolean(body.deliveryDifferent ?? body.differentDeliveryAddress)
      const { delAddress, delCounty, delCity, delPostal } = sanitizeDeliveryBlock(body, deliveryDifferent)
      data = {
        firstName: sanitizeGuestOrderPersonName(body.firstName),
        lastName: sanitizeGuestOrderPersonName(body.lastName),
        phone: normalizeE164Phone(body.phone) || String(body.phone || '').trim(),
        billAddress: sanitizeGuestOrderText(body.billAddress),
        billCounty: sanitizeGuestOrderText(body.billCounty),
        billCity: sanitizeGuestOrderText(body.billCity),
        billPostal: sanitizeGuestOrderPostal(body.billPostal),
        deliveryDifferent,
        delAddress,
        delCounty,
        delCity,
        delPostal,
        companyName: sanitizeGuestOrderText(body.companyName),
        companyCui: sanitizeCompanyCui(body.companyCui),
        companyAddress: sanitizeGuestOrderText(body.companyAddress),
        companyCounty: sanitizeGuestOrderText(body.companyCounty),
        companyCity: sanitizeGuestOrderText(body.companyCity),
        companyPostal: sanitizeGuestOrderPostal(body.companyPostal),
      }
    }

    const profile = await prisma.clientProfile.upsert({
      where: { userId: req.userId },
      create: { userId: req.userId, ...data },
      update: data,
    })

    const referralCode = await ensureUserReferralCode(req.userId)

    return res.json({
      referralCode,
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        billAddress: profile.billAddress,
        billCounty: profile.billCounty,
        billCity: profile.billCity,
        billPostal: profile.billPostal,
        deliveryDifferent: profile.deliveryDifferent,
        delAddress: profile.delAddress,
        delCounty: profile.delCounty,
        delCity: profile.delCity,
        delPostal: profile.delPostal,
        companyName: profile.companyName,
        companyCui: profile.companyCui,
        companyAddress: profile.companyAddress,
        companyCounty: profile.companyCounty,
        companyCity: profile.companyCity,
        companyPostal: profile.companyPostal,
      },
    })
  } catch (err) {
    console.error('Client profile PUT error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la salvare.' })
  }
})

app.post('/api/client/change-password', authMiddleware, clientAuthMiddleware, async (req, res) => {
  try {
    const body = req.body || {}
    const currentPassword = body.currentPassword
    const newPassword = body.newPassword
    if (!newPassword || String(newPassword).length < 8) {
      return res.status(400).json({
        error: 'Parola nouă (minimum 8 caractere) este obligatorie.',
      })
    }
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!user) return res.status(404).json({ error: 'Utilizator negăsit.' })
    if (!user.password) {
      const hashed = await bcrypt.hash(String(newPassword), 10)
      await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
      return res.json({
        message: 'Parola a fost setată. Poți folosi și autentificarea cu email și parolă.',
      })
    }
    if (!currentPassword) {
      return res.status(400).json({ error: 'Introdu parola curentă.' })
    }
    const valid = await bcrypt.compare(String(currentPassword), user.password)
    if (!valid) return res.status(401).json({ error: 'Parola curentă incorectă.' })
    const hashed = await bcrypt.hash(String(newPassword), 10)
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
    return res.json({ message: 'Parola a fost actualizată.' })
  } catch (err) {
    console.error('Client change-password error:', err)
    res.status(500).json({ error: err?.message || 'Eroare.' })
  }
})

app.post('/api/admin/change-password', authMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const body = req.body || {}
    const currentPassword = body.currentPassword
    const newPassword = body.newPassword
    if (!newPassword || String(newPassword).length < 8) {
      return res.status(400).json({
        error: 'Parola nouă (minimum 8 caractere) este obligatorie.',
      })
    }
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!user) return res.status(404).json({ error: 'Utilizator negăsit.' })
    if (!user.password) {
      const hashed = await bcrypt.hash(String(newPassword), 10)
      await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
      return res.json({
        message: 'Parola a fost setată. Poți folosi și autentificarea cu email și parolă.',
      })
    }
    if (!currentPassword) {
      return res.status(400).json({ error: 'Introdu parola curentă.' })
    }
    const valid = await bcrypt.compare(String(currentPassword), user.password)
    if (!valid) return res.status(401).json({ error: 'Parola curentă incorectă.' })
    const hashed = await bcrypt.hash(String(newPassword), 10)
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
    return res.json({ message: 'Parola a fost actualizată.' })
  } catch (err) {
    console.error('Admin change-password error:', err)
    res.status(500).json({ error: err?.message || 'Eroare.' })
  }
})

app.get('/api/admin/account', authMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    })
    if (!user) return res.status(404).json({ error: 'Utilizator negăsit.' })
    return res.json(user)
  } catch (err) {
    console.error('Admin account GET error:', err)
    res.status(500).json({ error: err?.message || 'Eroare.' })
  }
})

app.patch('/api/admin/account', authMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const body = req.body || {}
    const firstName = String(body.firstName ?? '').trim().slice(0, 120)
    const lastName = String(body.lastName ?? '').trim().slice(0, 120)
    const phone = String(body.phone ?? '').trim().slice(0, 40)
    await prisma.user.update({
      where: { id: req.userId },
      data: { firstName, lastName, phone },
    })
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    })
    if (!user) return res.status(404).json({ error: 'Utilizator negăsit.' })
    return res.json(user)
  } catch (err) {
    console.error('Admin account PATCH error:', err)
    res.status(500).json({ error: err?.message || 'Eroare.' })
  }
})

async function commitClientEmailChange(userId, user, newEmailRaw) {
  const oldEmail = String(user.email || '').trim()
  const oldNorm = oldEmail.toLowerCase()
  const guestEmailSync = [
    prisma.guestResidentialOrder.updateMany({
      where: { orderSource: 'client', email: oldEmail },
      data: { email: newEmailRaw },
    }),
  ]
  if (oldNorm !== oldEmail) {
    guestEmailSync.push(
      prisma.guestResidentialOrder.updateMany({
        where: { orderSource: 'client', email: oldNorm },
        data: { email: newEmailRaw },
      }),
    )
  }
  await prisma.$transaction([
    ...guestEmailSync,
    prisma.residentialOrder.updateMany({
      where: { userId },
      data: { email: newEmailRaw },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmailRaw,
        pendingEmailChange: null,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    }),
  ])
}

app.post('/api/client/change-email', authMiddleware, clientAuthMiddleware, async (req, res) => {
  try {
    const body = req.body || {}
    const newEmailRaw = String(body.newEmail || '')
      .trim()
      .toLowerCase()
    const currentPassword = body.currentPassword
    if (!newEmailRaw) {
      return res.status(400).json({ error: 'Email nou obligatoriu.' })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmailRaw)) {
      return res.status(400).json({ error: 'Adresa de email nu este validă.' })
    }
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!user) return res.status(404).json({ error: 'Utilizator negăsit.' })
    if (!user.password) {
      return res.status(403).json({
        error: 'Conturile create cu Google nu pot schimba adresa de email din setări.',
        code: 'EMAIL_CHANGE_NOT_AVAILABLE',
      })
    }
    if (!currentPassword) {
      return res.status(400).json({ error: 'Parola curentă este obligatorie.' })
    }
    const valid = await bcrypt.compare(String(currentPassword), user.password)
    if (!valid) return res.status(401).json({ error: 'Parola curentă incorectă.' })
    const oldEmail = String(user.email || '').trim()
    const oldNorm = oldEmail.toLowerCase()
    if (newEmailRaw === oldNorm) {
      return res.status(400).json({ error: 'Noul email este identic cu cel curent.' })
    }
    const taken = await prisma.user.findUnique({ where: { email: newEmailRaw } })
    if (taken && taken.id !== user.id) {
      return res.status(409).json({ error: 'Acest email este deja folosit de un alt cont.' })
    }
    await commitClientEmailChange(user.id, user, newEmailRaw)
    const token = jwt.sign(
      { userId: user.id, email: newEmailRaw, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' },
    )
    return res.json({ token, email: newEmailRaw, message: 'Emailul a fost actualizat.' })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return res.status(409).json({ error: 'Acest email este deja folosit.' })
    }
    console.error('Client change-email error:', err)
    res.status(500).json({ error: err?.message || 'Eroare.' })
  }
})

app.delete('/api/client/account', authMiddleware, clientAuthMiddleware, async (req, res) => {
  try {
    const body = req.body || {}
    const currentPassword = body.currentPassword
    const userId = req.userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, password: true, deletedAt: true },
    })
    if (!user) return res.status(404).json({ error: 'Utilizator negăsit.' })
    if (user.deletedAt) {
      return res.status(409).json({ error: 'Contul este deja marcat pentru ștergere.' })
    }
    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Parola curentă este obligatorie pentru ștergerea contului.' })
      }
      const valid = await bcrypt.compare(String(currentPassword), user.password)
      if (!valid) return res.status(401).json({ error: 'Parola curentă incorectă.' })
    }

    await sendAccountDeletedEmail(user.email, 'client')

    await softDeleteUserAccount(prisma, userId)
    return res.json({
      message: `Cont dezactivat. Datele vor fi șterse definitiv după ${SOFT_DELETE_RETENTION_DAYS} de zile.`,
      retentionDays: SOFT_DELETE_RETENTION_DAYS,
    })
  } catch (err) {
    console.error('Client delete account error:', err)
    res.status(500).json({ error: 'Eroare la ștergerea contului.' })
  }
})

function mapResidentialOrderToClientJson(o) {
  const lines = (o.lines || []).map((L) => ({
    id: L.id,
    productId: L.productId,
    productSlug: L.productSlug,
    productTitle: L.productTitle,
    quantity: L.quantity,
    unitPriceInclVat: L.unitPriceInclVat != null ? String(L.unitPriceInclVat) : null,
    lineTotalInclVat: L.lineTotalInclVat != null ? String(L.lineTotalInclVat) : null,
    listUnitPriceInclVat:
      L.listUnitPriceInclVat != null ? String(L.listUnitPriceInclVat) : null,
    listLineTotalInclVat:
      L.listLineTotalInclVat != null ? String(L.listLineTotalInclVat) : null,
    vatPercent: L.vatPercent != null ? String(L.vatPercent) : null,
  }))
  let totalIncl = 0
  for (const L of lines) {
    const v = parseFloat(String(L.lineTotalInclVat || '').replace(',', '.'))
    if (Number.isFinite(v)) totalIncl += v
  }
  return {
    orderKind: 'residential',
    id: o.id,
    orderNumber: o.orderNumber,
    orderSource: o.orderSource,
    email: o.email,
    phone: o.phone,
    lastName: o.lastName,
    firstName: o.firstName,
    billAddress: o.billAddress,
    billCounty: o.billCounty,
    billCity: o.billCity,
    billPostal: o.billPostal,
    deliveryDifferent: o.deliveryDifferent,
    delAddress: o.delAddress,
    delCounty: o.delCounty,
    delCity: o.delCity,
    delPostal: o.delPostal,
    currency: o.currency,
    fulfillmentStatus: String(o.fulfillmentStatus || 'de_platit'),
    clientHasInvoice: Boolean(o.clientInvoiceUrl && String(o.clientInvoiceUrl).trim()),
    proformaUrl: o.proformaUrl ? String(o.proformaUrl) : null,
    createdAt: o.createdAt.toISOString(),
    lines,
    lineCount: lines.length,
    orderTotalInclVat: totalIncl > 0 ? totalIncl.toFixed(2) : null,
  }
}

function mapLegacyGuestOrderToClientJson(r) {
  const lines = [
    {
      id: r.id,
      productId: r.productId,
      productSlug: r.productSlug,
      productTitle: r.productTitle,
      quantity: r.quantity,
      unitPriceInclVat: r.unitPriceInclVat != null ? String(r.unitPriceInclVat) : null,
      lineTotalInclVat: r.lineTotalInclVat != null ? String(r.lineTotalInclVat) : null,
      listUnitPriceInclVat:
        r.listUnitPriceInclVat != null ? String(r.listUnitPriceInclVat) : null,
      listLineTotalInclVat:
        r.listLineTotalInclVat != null ? String(r.listLineTotalInclVat) : null,
      vatPercent: r.vatPercent != null ? String(r.vatPercent) : null,
    },
  ]
  return {
    orderKind: 'legacy',
    id: r.id,
    orderNumber: r.orderNumber,
    orderSource: r.orderSource,
    email: r.email,
    phone: r.phone,
    lastName: r.lastName,
    firstName: r.firstName,
    billAddress: r.billAddress,
    billCounty: r.billCounty,
    billCity: r.billCity,
    billPostal: r.billPostal,
    deliveryDifferent: r.deliveryDifferent,
    delAddress: r.delAddress,
    delCounty: r.delCounty,
    delCity: r.delCity,
    delPostal: r.delPostal,
    currency: r.currency,
    fulfillmentStatus: String(r.fulfillmentStatus || 'de_platit'),
    clientHasInvoice: Boolean(r.clientInvoiceUrl && String(r.clientInvoiceUrl).trim()),
    proformaUrl: r.proformaUrl ? String(r.proformaUrl) : null,
    createdAt: r.createdAt.toISOString(),
    lines,
    lineCount: 1,
    orderTotalInclVat: r.lineTotalInclVat != null ? String(r.lineTotalInclVat) : null,
  }
}

const FULFILLMENT_STATUSES = [
  'de_platit',
  'preluata',
  'in_pregatire',
  'in_curs_livrare',
  'livrata',
  'anulata',
]

const PROFORMA_ALLOWED_STATUSES = new Set(['de_platit', 'preluata'])
const CLIENT_INVOICE_DOWNLOAD_STATUSES = new Set(['in_pregatire', 'in_curs_livrare', 'livrata'])

function productCardImageUrlFromRow(p) {
  const card = String(p?.cardImage ?? '').trim()
  if (card) return card
  const imgs = Array.isArray(p?.images) ? p.images : []
  const first = imgs[0]
  return typeof first === 'string' && first.trim() ? first.trim() : ''
}

/** Client „Produse înregistrate”: card payload din WarehouseSavedItem + Product. */
function mapWarehouseSavedItemToClientRegisteredDto(row) {
  const product = row?.warehouseStockUnit?.product
  let technicalDocs = []
  if (product?.documenteTehnice != null) {
    const raw = product.documenteTehnice
    const docs = Array.isArray(raw) ? raw : []
    technicalDocs = docs
      .filter((d) => d && typeof d === 'object' && String(d.url || '').trim())
      .map((d) => ({
        descriere: String(d.descriere || '').trim(),
        url: String(d.url).trim(),
      }))
  }
  return {
    savedItemId: row.id,
    serialNumber: row.serialNumber,
    modelNumber: row.modelNumber,
    warehouseIn: row.warehouseIn instanceof Date ? row.warehouseIn.toISOString() : row.warehouseIn,
    /* URL-ul R2 nu este expus în UI — folosit doar server-side. Frontend-ul
       primeşte un boolean ca să decidă între „Generează” şi „Descarcă”. */
    warrantyCertificateAvailable: Boolean(row.warrantyCertificateUrl),
    warrantyCertificateGeneratedAt:
      row.warrantyCertificateGeneratedAt instanceof Date
        ? row.warrantyCertificateGeneratedAt.toISOString()
        : null,
    product: product
      ? {
          id: product.id,
          title: product.title,
          slug: product.slug,
          imageUrl: productCardImageUrlFromRow(product) || null,
          documenteTehnice: technicalDocs,
        }
      : null,
  }
}

function clientProfileCompleteForWarranty(profile, user) {
  const fn = String(profile?.firstName ?? user?.firstName ?? '').trim()
  const ln = String(profile?.lastName ?? user?.lastName ?? '').trim()
  const addr = String(profile?.billAddress ?? '').trim()
  return Boolean(fn && ln && addr)
}

const registeredProductInclude = {
  warehouseStockUnit: {
    include: {
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
          cardImage: true,
          images: true,
          documenteTehnice: true,
        },
      },
    },
  },
}

/** Aligned with web `getCatalogProductSpecLines` — subtitle under title in client order boxes. */
function catalogSpecLinesFromProductRow(p) {
  const t = (v) => (v != null ? String(v).trim() : '')
  const line1Pieces = [t(p?.tensiuneNominala), t(p?.capacitate), t(p?.compozitie)].filter(Boolean)
  const wifiBt = []
  if (p?.conectivitateWifi) wifiBt.push('WiFi')
  if (p?.conectivitateBluetooth) wifiBt.push('Bluetooth')
  const connJoined = wifiBt.join(' • ')
  const line2Pieces = []
  const cicl = t(p?.cicluriDescarcare)
  if (cicl) line2Pieces.push(cicl)
  if (connJoined) line2Pieces.push(connJoined)
  const energie = t(p?.energieNominala)
  const catalogSpecLine1 =
    line1Pieces.length > 0 ? line1Pieces.join(' • ') : energie ? energie : null
  const catalogSpecLine2 = line2Pieces.length ? line2Pieces.join(' • ') : null
  return { catalogSpecLine1, catalogSpecLine2 }
}

async function enrichClientOrderListWithProductImages(rows) {
  const productIds = new Set()
  for (const o of rows) {
    for (const L of o.lines || []) {
      if (L.productId) productIds.add(String(L.productId))
    }
  }
  if (productIds.size === 0) return rows
  const plist = await prisma.product.findMany({
    where: { id: { in: [...productIds] } },
    select: {
      id: true,
      cardImage: true,
      images: true,
      tensiuneNominala: true,
      capacitate: true,
      compozitie: true,
      energieNominala: true,
      cicluriDescarcare: true,
      conectivitateWifi: true,
      conectivitateBluetooth: true,
    },
  })
  const thumbById = new Map()
  const specById = new Map()
  for (const p of plist) {
    thumbById.set(p.id, productCardImageUrlFromRow(p))
    specById.set(p.id, catalogSpecLinesFromProductRow(p))
  }
  return rows.map((o) => ({
    ...o,
    lines: (o.lines || []).map((L) => {
      const specs = specById.get(L.productId) || { catalogSpecLine1: null, catalogSpecLine2: null }
      return {
        ...L,
        imageUrl: thumbById.get(L.productId) || null,
        catalogSpecLine1: specs.catalogSpecLine1,
        catalogSpecLine2: specs.catalogSpecLine2,
      }
    }),
  }))
}

async function listAccountResidentialOrdersHandler(req, res, legacyGuestOrderSource) {
  try {
    const email = String(req.userEmail || '')
      .trim()
      .toLowerCase()
    if (!email) return res.status(400).json({ error: 'Email lipsă din sesiune.' })

    const [modern, legacy] = await Promise.all([
      prisma.residentialOrder.findMany({
        where: { OR: [{ userId: req.userId }, { email }] },
        include: { lines: { orderBy: { id: 'asc' } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.guestResidentialOrder.findMany({
        where: { email, orderSource: legacyGuestOrderSource },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ])

    const merged = [...modern.map(mapResidentialOrderToClientJson), ...legacy.map(mapLegacyGuestOrderToClientJson)].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    const out = await enrichClientOrderListWithProductImages(merged)
    return res.json(out)
  } catch (err) {
    console.error('Residential orders list error:', err)
    res.status(500).json({ error: err?.message || 'Eroare.' })
  }
}

/**
 * Detalii bancare pentru plata online (modal "Plătește prin Transfer bancar").
 * Folosit de client și partener (aceleași conturi RON ca proforma).
 */
async function residentialPaymentBankDetailsHandler(_req, res) {
  try {
    const company = await readCompanyDataFromDb()
    const { pickBankAccountByCurrency: pickBank } = getProformaTemplateLib()
    const accounts = Array.isArray(company?.bankAccounts) ? company.bankAccounts : []
    const ronAccount = pickBank(accounts, 'RON') || accounts[0] || null
    return res.json({
      companyName: String(company?.name || '').trim(),
      bankAccount: String(ronAccount?.iban || '').trim(),
      bankName: String(ronAccount?.bankName || '').trim(),
    })
  } catch (err) {
    console.error('residential payment bank details:', err)
    res.status(500).json({ error: err?.message || 'Eroare la încărcarea datelor bancare.' })
  }
}

function makeResidentialOrderProformaHandler(legacyGuestOrderSource) {
  return async (req, res) => {
    try {
      if (!isR2Configured()) {
        return res.status(503).json({
          error: 'Generarea proformei (PDF) necesită R2. Configurează R2_BUCKET, R2_PUBLIC_URL etc.',
        })
      }
      const emailNorm = String(req.userEmail || '')
        .trim()
        .toLowerCase()
      const orderId = String(req.params.orderId || '').trim()
      if (!orderId) return res.status(400).json({ error: 'ID comandă lipsă.' })

      const forceRegenerate =
        String(req.query.regenerate || '') === '1' ||
        process.env.BATERINO_PROFORMA_FORCE_REGENERATE === '1' ||
        process.env.NODE_ENV !== 'production'

      const safePdfFile = (orderNumber) =>
        `proforma-${String(orderNumber || 'comanda').replace(/[^\w.-]+/g, '_')}.pdf`

      const cacheBust = (url) => `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`

      /** Evită deschiderea în tab nou după `fetch` async (blocată ca popup); trimite PDF-ul prin API ca factura. */
      const wantsFile =
        String(req.query.download || '') === '1' ||
        String(req.query.download || '').toLowerCase() === 'true'

      const respondProforma = async (downloadUrl, orderNumber, regenerated) => {
        if (wantsFile) {
          const fetchUrl = regenerated ? cacheBust(downloadUrl) : downloadUrl
          let upstream
          try {
            upstream = await fetch(fetchUrl)
          } catch (e) {
            console.error('Proforma upstream fetch error:', e)
            return res.status(502).json({ error: 'Fișierul proformei nu poate fi citit.' })
          }
          if (!upstream.ok) {
            console.error('Proforma upstream fetch failed', upstream.status, fetchUrl)
            return res.status(502).json({ error: 'Fișierul proformei nu poate fi citit.' })
          }
          const ct = upstream.headers.get('content-type') || 'application/pdf'
          const safeFile = safePdfFile(orderNumber)
          res.setHeader('Content-Type', ct)
          res.setHeader('Content-Disposition', `attachment; filename="${safeFile}"`)
          const buf = Buffer.from(await upstream.arrayBuffer())
          return res.send(buf)
        }
        return res.json({
          downloadUrl: regenerated ? cacheBust(downloadUrl) : downloadUrl,
          orderNumber,
          proformaUrl: downloadUrl,
          regenerated,
        })
      }

      const generateAndUpload = async ({ html, orderNumber }) => {
        const pdfBuffer = await renderWarrantyPdf(html)
        if (
          !Buffer.isBuffer(pdfBuffer) ||
          pdfBuffer.length < 5 ||
          pdfBuffer.slice(0, 5).toString('latin1') !== '%PDF-'
        ) {
          const head = Buffer.isBuffer(pdfBuffer)
            ? pdfBuffer.slice(0, 32).toString('latin1')
            : typeof pdfBuffer
          throw new Error(`PDF invalid (lipsă header %PDF-). Primii 32 octeți: ${head}`)
        }
        const key = proformaPdfKey(orderId, orderNumber)
        const publicUrl = await uploadToR2(pdfBuffer, key, 'application/pdf', {
          contentDisposition: `attachment; filename="${safePdfFile(orderNumber)}"`,
          cacheControl: 'no-cache, max-age=0, must-revalidate',
        })
        return publicUrl
      }

      const residential = await prisma.residentialOrder.findFirst({
        where: { id: orderId, OR: [{ userId: req.userId }, { email: emailNorm }] },
        include: { lines: { orderBy: { id: 'asc' } } },
      })

      if (residential) {
        if (!PROFORMA_ALLOWED_STATUSES.has(String(residential.fulfillmentStatus || 'de_platit'))) {
          return res.status(400).json({ error: 'Proforma nu mai este disponibilă pentru această comandă.' })
        }
        const orderNumber = residential.orderNumber || orderId
        let downloadUrl = !forceRegenerate && residential.proformaUrl ? String(residential.proformaUrl) : ''
        let regenerated = false
        if (!downloadUrl) {
          const [company, generalPhoneRow, residentialPhoneRow] = await Promise.all([
            readCompanyDataFromDb(),
            prisma.departmentPhone.findUnique({ where: { department: 'general' } }).catch(() => null),
            prisma.departmentPhone.findUnique({ where: { department: 'rezidential' } }).catch(() => null),
          ])
          const supplierPhone =
            String(generalPhoneRow?.phone || '').trim() ||
            String(process.env.BATERINO_OFFICE_PHONE || '').trim()
          const supplierSupportPhone =
            String(residentialPhoneRow?.phone || '').trim() ||
            String(process.env.BATERINO_SUPPORT_PHONE || '').trim()
          const html = await getProformaTemplateLib().buildResidentialOrderProformaHtml(residential, company, {
            supplierPhone,
            supplierSupportPhone,
            proformaIssueDate: new Date(),
          })
          downloadUrl = await generateAndUpload({ html, orderNumber })
          await prisma.residentialOrder.update({
            where: { id: orderId },
            data: { proformaUrl: downloadUrl },
          })
          regenerated = true
        }
        return await respondProforma(downloadUrl, orderNumber, regenerated)
      }

      const legacy = await prisma.guestResidentialOrder.findFirst({
        where: { id: orderId, email: emailNorm, orderSource: legacyGuestOrderSource },
      })
      if (!legacy) return res.status(404).json({ error: 'Comandă negăsită.' })
      if (!PROFORMA_ALLOWED_STATUSES.has(String(legacy.fulfillmentStatus || 'de_platit'))) {
        return res.status(400).json({ error: 'Proforma nu mai este disponibilă pentru această comandă.' })
      }
      const orderNumber = legacy.orderNumber || orderId
      let downloadUrl = !forceRegenerate && legacy.proformaUrl ? String(legacy.proformaUrl) : ''
      let regenerated = false
      if (!downloadUrl) {
        const [company, generalPhoneRow, residentialPhoneRow] = await Promise.all([
          readCompanyDataFromDb(),
          prisma.departmentPhone.findUnique({ where: { department: 'general' } }).catch(() => null),
          prisma.departmentPhone.findUnique({ where: { department: 'rezidential' } }).catch(() => null),
        ])
        const supplierPhone =
          String(generalPhoneRow?.phone || '').trim() ||
          String(process.env.BATERINO_OFFICE_PHONE || '').trim()
        const supplierSupportPhone =
          String(residentialPhoneRow?.phone || '').trim() ||
          String(process.env.BATERINO_SUPPORT_PHONE || '').trim()
        const html = await getProformaTemplateLib().buildGuestOrderProformaHtml(legacy, company, {
          supplierPhone,
          supplierSupportPhone,
          proformaIssueDate: new Date(),
        })
        downloadUrl = await generateAndUpload({ html, orderNumber })
        await prisma.guestResidentialOrder.update({
          where: { id: orderId },
          data: { proformaUrl: downloadUrl },
        })
        regenerated = true
      }
      return await respondProforma(downloadUrl, orderNumber, regenerated)
    } catch (err) {
      console.error('Residential order proforma error:', err)
      res.status(500).json({ error: err?.message || 'Eroare la generarea proformei.' })
    }
  }
}

function makeResidentialOrderInvoiceHandler(legacyGuestOrderSource) {
  return async (req, res) => {
    try {
      const emailNorm = String(req.userEmail || '')
        .trim()
        .toLowerCase()
      const orderId = String(req.params.orderId || '').trim()
      if (!orderId) return res.status(400).json({ error: 'ID comandă lipsă.' })

      let orderNumber = ''
      let invoiceUrl = ''

      const residential = await prisma.residentialOrder.findFirst({
        where: { id: orderId, OR: [{ userId: req.userId }, { email: emailNorm }] },
      })
      if (residential) {
        const st = String(residential.fulfillmentStatus || 'de_platit')
        if (!CLIENT_INVOICE_DOWNLOAD_STATUSES.has(st)) {
          return res.status(400).json({ error: 'Factura nu este disponibilă pentru acest status.' })
        }
        invoiceUrl = String(residential.clientInvoiceUrl || '').trim()
        orderNumber = residential.orderNumber
      } else {
        const legacy = await prisma.guestResidentialOrder.findFirst({
          where: { id: orderId, email: emailNorm, orderSource: legacyGuestOrderSource },
        })
        if (!legacy) return res.status(404).json({ error: 'Comandă negăsită.' })
        const st = String(legacy.fulfillmentStatus || 'de_platit')
        if (!CLIENT_INVOICE_DOWNLOAD_STATUSES.has(st)) {
          return res.status(400).json({ error: 'Factura nu este disponibilă pentru acest status.' })
        }
        invoiceUrl = String(legacy.clientInvoiceUrl || '').trim()
        orderNumber = legacy.orderNumber
      }

      if (!invoiceUrl) {
        return res.status(404).json({ error: 'Factura nu a fost încă încărcată.' })
      }

      const upstream = await fetch(invoiceUrl)
      if (!upstream.ok) {
        console.error('Residential invoice fetch failed', upstream.status, invoiceUrl)
        return res.status(502).json({ error: 'Fișierul facturii nu poate fi citit.' })
      }
      const ct = upstream.headers.get('content-type') || 'application/pdf'
      const safeFile = `factura-${String(orderNumber).replace(/[^\w.-]+/g, '_')}.pdf`
      res.setHeader('Content-Type', ct)
      res.setHeader('Content-Disposition', `attachment; filename="${safeFile}"`)
      const buf = Buffer.from(await upstream.arrayBuffer())
      return res.send(buf)
    } catch (err) {
      console.error('Residential order invoice error:', err)
      res.status(500).json({ error: err?.message || 'Eroare la descărcarea facturii.' })
    }
  }
}

function makeResidentialOrderCancelHandler(legacyGuestOrderSource) {
  return async (req, res) => {
    try {
      const emailNorm = String(req.userEmail || '')
        .trim()
        .toLowerCase()
      const orderId = String(req.params.orderId || '').trim()
      if (!orderId) return res.status(400).json({ error: 'ID comandă lipsă.' })

      const residential = await prisma.residentialOrder.findFirst({
        where: { id: orderId, OR: [{ userId: req.userId }, { email: emailNorm }] },
      })
      if (residential) {
        if (residential.fulfillmentStatus !== 'de_platit') {
          return res.status(400).json({ error: 'Comanda nu mai poate fi anulată.' })
        }
        await prisma.residentialOrder.update({
          where: { id: orderId },
          data: { fulfillmentStatus: 'anulata' },
        })
        return res.json({ ok: true, fulfillmentStatus: 'anulata' })
      }
      const legacy = await prisma.guestResidentialOrder.findFirst({
        where: { id: orderId, email: emailNorm, orderSource: legacyGuestOrderSource },
      })
      if (legacy) {
        if (legacy.fulfillmentStatus !== 'de_platit') {
          return res.status(400).json({ error: 'Comanda nu mai poate fi anulată.' })
        }
        await prisma.guestResidentialOrder.update({
          where: { id: orderId },
          data: { fulfillmentStatus: 'anulata' },
        })
        return res.json({ ok: true, fulfillmentStatus: 'anulata' })
      }
      return res.status(404).json({ error: 'Comandă negăsită.' })
    } catch (err) {
      console.error('Residential order cancel error:', err)
      res.status(500).json({ error: err?.message || 'Eroare.' })
    }
  }
}

app.get('/api/client/orders', authMiddleware, clientAuthMiddleware, (req, res) =>
  listAccountResidentialOrdersHandler(req, res, 'client'),
)
app.get('/api/partner/orders', authMiddleware, partnerAuthMiddleware, (req, res) =>
  listAccountResidentialOrdersHandler(req, res, 'partner'),
)

app.get('/api/client/payment-bank-details', authMiddleware, clientAuthMiddleware, residentialPaymentBankDetailsHandler)
app.get('/api/partner/payment-bank-details', authMiddleware, partnerAuthMiddleware, residentialPaymentBankDetailsHandler)

/**
 * Întoarce JSON `{ downloadUrl, orderNumber }`. URL-ul este obiectul R2 încărcat cu
 * `Content-Disposition: attachment; filename="..."`, ca browser-ul să descarce PDF-ul direct
 * de la R2 (CDN-served, byte-perfect — fără riscuri de transformare în lanțul Express/CORS/compression).
 *
 * `?regenerate=1` forțează re-generarea chiar dacă există deja un PDF în R2.
 */
app.get(
  '/api/client/orders/:orderId/proforma',
  authMiddleware,
  clientAuthMiddleware,
  makeResidentialOrderProformaHandler('client'),
)
app.get(
  '/api/partner/orders/:orderId/proforma',
  authMiddleware,
  partnerAuthMiddleware,
  makeResidentialOrderProformaHandler('partner'),
)

app.get(
  '/api/client/orders/:orderId/invoice',
  authMiddleware,
  clientAuthMiddleware,
  makeResidentialOrderInvoiceHandler('client'),
)
app.get(
  '/api/partner/orders/:orderId/invoice',
  authMiddleware,
  partnerAuthMiddleware,
  makeResidentialOrderInvoiceHandler('partner'),
)

app.post(
  '/api/client/orders/:orderId/cancel',
  authMiddleware,
  clientAuthMiddleware,
  makeResidentialOrderCancelHandler('client'),
)
app.post(
  '/api/partner/orders/:orderId/cancel',
  authMiddleware,
  partnerAuthMiddleware,
  makeResidentialOrderCancelHandler('partner'),
)

app.get('/api/client/registered-products', authMiddleware, clientAuthMiddleware, async (req, res) => {
  try {
    const rows = await prisma.warehouseSavedItem.findMany({
      where: { client: req.userId },
      orderBy: { warehouseIn: 'desc' },
      include: registeredProductInclude,
    })
    res.set('Cache-Control', 'no-store')
    return res.json(rows.map(mapWarehouseSavedItemToClientRegisteredDto))
  } catch (err) {
    console.error('Client registered products list error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la încărcarea produselor.' })
  }
})

app.post('/api/client/registered-products/claim', authMiddleware, clientAuthMiddleware, async (req, res) => {
  try {
    const body = req.body || {}
    let serialNumber = String(body.serialNumber || '').trim()
    const qrRaw = body.qrRaw != null ? String(body.qrRaw) : ''
    if (!serialNumber && qrRaw) serialNumber = parseSerialFromQrPayload(qrRaw)
    if (!serialNumber) {
      return res.status(400).json({ error: 'Introdu numărul de serie sau scanează codul QR.' })
    }

    serialNumber = normalizeWarehouseSerialNumber(serialNumber)
    if (!isValidWarehouseSerialNumber(serialNumber)) {
      return res.status(400).json({ error: SN_INVALID_MESSAGE })
    }

    const userId = req.userId
    const saved = await prisma.warehouseSavedItem.findUnique({
      where: { serialNumber },
      include: registeredProductInclude,
    })
    if (!saved) {
      return res.status(404).json({ error: 'Acest număr de serie nu există în evidența noastră.' })
    }

    const existingClient = saved.client != null ? String(saved.client).trim() : ''
    if (existingClient && existingClient !== userId) {
      return res.status(409).json({ error: 'Acest produs este deja înregistrat pe alt cont.' })
    }

    const updated = await prisma.$transaction(async (tx) => {
      const upd = await tx.warehouseSavedItem.updateMany({
        where: {
          id: saved.id,
          OR: [{ client: null }, { client: '' }, { client: userId }],
        },
        data: {
          client: userId,
          location: 'client_final',
        },
      })
      if (upd.count === 0) {
        const check = await tx.warehouseSavedItem.findUnique({
          where: { id: saved.id },
          select: { client: true },
        })
        const c = check?.client != null ? String(check.client).trim() : ''
        if (c && c !== userId) {
          const e = new Error('CONFLICT')
          e.code = 'CLAIM_CONFLICT'
          throw e
        }
        const e = new Error('UPDATE_FAILED')
        e.code = 'UPDATE_FAILED'
        throw e
      }
      return tx.warehouseSavedItem.findUnique({
        where: { id: saved.id },
        include: registeredProductInclude,
      })
    })

    if (!updated) return res.status(500).json({ error: 'Eroare la înregistrare.' })
    res.set('Cache-Control', 'no-store')
    return res.json(mapWarehouseSavedItemToClientRegisteredDto(updated))
  } catch (err) {
    if (err?.code === 'CLAIM_CONFLICT') {
      return res.status(409).json({ error: 'Acest produs este deja înregistrat pe alt cont.' })
    }
    console.error('Client claim registered product error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la înregistrare.' })
  }
})

/* ── Service requests ──────────────────────────────────────────────────── */

/** Cereri considerate „active” pentru UI client (buton „În desfășurare”). */
const SERVICE_REQUEST_ACTIVE_STATUSES = ['open', 'in_progress']
const SERVICE_REQUEST_VALID_STATUSES = ['open', 'in_progress', 'resolved', 'closed']

/**
 * Generează un cod cerere unic în formatul BTROS-YYYYMMDD-NNNN, unde NNNN este
 * un batch zilnic incremental (numărul cererilor create în aceeași zi + 1).
 * Pe eventuală coliziune (race) reîncercăm cu următorul număr disponibil.
 */
async function generateServiceRequestNumber() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const datePart = `${y}${m}${d}`
  const dayStart = new Date(y, now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const dayEnd = new Date(y, now.getMonth(), now.getDate(), 23, 59, 59, 999)

  let countToday = await prisma.serviceRequest.count({
    where: { createdAt: { gte: dayStart, lte: dayEnd } },
  })
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const seq = String(countToday + 1 + attempt).padStart(4, '0')
    const candidate = `BTROS-${datePart}-${seq}`
    const exists = await prisma.serviceRequest.findUnique({
      where: { requestNumber: candidate },
      select: { id: true },
    })
    if (!exists) return candidate
  }
  /* Fallback extrem (foarte improbabil): adăugăm timpul curent în milisec. */
  return `BTROS-${datePart}-${Date.now().toString().slice(-4)}`
}

function mapServiceRequestRow(row) {
  return {
    id: row.id,
    requestNumber: row.requestNumber,
    accountType: row.accountType,
    userId: row.userId,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone,
    serialNumber: row.serialNumber,
    modelNumber: row.modelNumber,
    productTitle: row.productTitle,
    savedItemId: row.savedItemId,
    problemDescription: row.problemDescription,
    status: row.status,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
  }
}

/** Listă proprie de cereri service pentru clientul curent (folosită ca să marchăm butonul „În desfășurare” pe produsele cu cerere activă). */
app.get('/api/client/service-requests', authMiddleware, clientAuthMiddleware, async (req, res) => {
  try {
    const userId = req.userId
    const rows = await prisma.serviceRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    res.set('Cache-Control', 'no-store')
    return res.json(rows.map(mapServiceRequestRow))
  } catch (err) {
    console.error('Client service requests list error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la încărcarea cererilor.' })
  }
})

/**
 * Creare cerere service.
 * Body: { savedItemId: string, problemDescription: string }
 * Reguli:
 *  - produsul trebuie să fie înregistrat pe userul curent (saved.client === userId)
 *  - dacă există deja o cerere activă (open/in_progress) pentru acest SN al userului,
 *    returnăm 409 cu detaliile cererii existente.
 */
app.post('/api/client/service-requests', authMiddleware, clientAuthMiddleware, async (req, res) => {
  try {
    const body = req.body || {}
    const savedItemId = String(body.savedItemId || '').trim()
    const problemDescription = String(body.problemDescription || '').trim()
    if (!savedItemId) return res.status(400).json({ error: 'Lipsește produsul.' })
    if (problemDescription.length < 3) {
      return res.status(400).json({ error: 'Te rugăm să descrii pe scurt problema.' })
    }
    if (problemDescription.length > 2000) {
      return res.status(400).json({ error: 'Descrierea este prea lungă (max. 2000 caractere).' })
    }

    const userId = req.userId
    const saved = await prisma.warehouseSavedItem.findFirst({
      where: { id: savedItemId, client: userId },
      include: {
        warehouseStockUnit: {
          include: {
            product: { select: { id: true, title: true } },
          },
        },
      },
    })
    if (!saved) {
      return res.status(404).json({ error: 'Produsul nu este înregistrat pe contul tău.' })
    }

    const existingActive = await prisma.serviceRequest.findFirst({
      where: {
        userId,
        serialNumber: saved.serialNumber,
        status: { in: SERVICE_REQUEST_ACTIVE_STATUSES },
      },
      orderBy: { createdAt: 'desc' },
    })
    if (existingActive) {
      return res.status(409).json({
        error: 'Există deja o cerere de service activă pentru acest produs.',
        code: 'service_request_already_active',
        serviceRequest: mapServiceRequestRow(existingActive),
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true, phone: true },
    })
    const profile = await prisma.clientProfile.findUnique({ where: { userId } }).catch(() => null)

    const firstName = String(profile?.firstName || user?.firstName || '').trim()
    const lastName = String(profile?.lastName || user?.lastName || '').trim()
    const email = String(user?.email || req.userEmail || '').trim().toLowerCase()
    const phone = String(profile?.phone || user?.phone || '').trim()
    const productTitle = String(saved.warehouseStockUnit?.product?.title || saved.modelNumber || '').trim()

    if (!email) {
      return res.status(400).json({ error: 'Contul tău nu are un email valid pentru notificări.' })
    }

    const requestNumber = await generateServiceRequestNumber()

    const created = await prisma.serviceRequest.create({
      data: {
        requestNumber,
        accountType: 'client',
        userId,
        firstName,
        lastName,
        email,
        phone,
        serialNumber: saved.serialNumber,
        modelNumber: saved.modelNumber,
        productTitle,
        savedItemId: saved.id,
        problemDescription,
        status: 'open',
      },
    })

    /* Trimitem emailul în fundal — nu blocăm răspunsul HTTP. */
    sendServiceRequestReceivedEmail({
      email,
      requestNumber: created.requestNumber,
      firstName,
      productTitle,
      serialNumber: created.serialNumber,
      modelNumber: created.modelNumber,
      problemDescription: created.problemDescription,
    }).catch((e) => console.error('[ServiceRequest] Email error:', e?.message || e))

    res.set('Cache-Control', 'no-store')
    return res.status(201).json(mapServiceRequestRow(created))
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return res.status(409).json({ error: 'Conflict la generarea numărului cererii. Reîncearcă.' })
    }
    console.error('Client service request create error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la trimiterea cererii.' })
  }
})

/** Listă completă pentru pagina admin (Service). */
app.get('/api/admin/service-requests', authMiddleware, adminAuthMiddleware, async (_req, res) => {
  try {
    const rows = await prisma.serviceRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
    })
    res.set('Cache-Control', 'no-store')
    return res.json(rows.map(mapServiceRequestRow))
  } catch (err) {
    console.error('Admin service requests list error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la încărcarea cererilor.' })
  }
})

/** Actualizare status cerere service (open | in_progress | resolved | closed). */
app.patch('/api/admin/service-requests/:id/status', authMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const id = String(req.params.id || '').trim()
    const nextStatus = String(req.body?.status || '').trim()
    if (!id) return res.status(400).json({ error: 'ID lipsă.' })
    if (!SERVICE_REQUEST_VALID_STATUSES.includes(nextStatus)) {
      return res.status(400).json({ error: 'Status invalid.' })
    }
    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: { status: nextStatus },
    })
    res.set('Cache-Control', 'no-store')
    return res.json(mapServiceRequestRow(updated))
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Cererea nu există.' })
    }
    console.error('Admin service request status error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare.' })
  }
})

const RETUR_ADMIN_VALID_STATUSES = ['pending', 'reviewed', 'closed']

/** Serie publică cerere retur (formular site): BTRT + id (min. 6 cifre, extins dacă id > 999999). */
function formatReturRegistrationNumber(id) {
  const n = Number(id)
  if (!Number.isFinite(n) || n < 1) return 'BTRT-000000'
  const s = String(Math.floor(n))
  return `BTRT-${s.length < 6 ? s.padStart(6, '0') : s}`
}

function mapReturRow(row) {
  let photoUrls = []
  try {
    const raw = row.conditionPhotoUrls
    if (Array.isArray(raw)) {
      photoUrls = raw.filter((u) => typeof u === 'string')
    }
  } catch {
    photoUrls = []
  }
  return {
    id: row.id,
    registrationNumber: formatReturRegistrationNumber(row.id),
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
    userId: row.userId,
    submitSource: row.submitSource,
    lastName: row.lastName,
    firstName: row.firstName,
    street: row.street,
    county: row.county,
    city: row.city,
    postal: row.postal,
    phone: row.phone,
    email: row.email,
    orderNumber: row.orderNumber,
    receiptDate: row.receiptDate,
    serialNumber: row.serialNumber,
    productBrand: row.productBrand,
    productModel: row.productModel,
    returnReason: row.returnReason,
    returnReasonOther: row.returnReasonOther,
    condUninstalled: row.condUninstalled,
    condSeals: row.condSeals,
    condPackaging: row.condPackaging,
    pickupStreet: row.pickupStreet,
    pickupCounty: row.pickupCounty,
    pickupCity: row.pickupCity,
    pickupPostal: row.pickupPostal,
    refundTitular: row.refundTitular,
    refundIban: row.refundIban,
    policyAccepted: row.policyAccepted,
    declarationAccepted: row.declarationAccepted,
    locale: row.locale,
    conditionPhotoUrls: photoUrls,
    status: row.status,
  }
}

/** Listă cereri retur (formular site) pentru admin Service. */
app.get('/api/admin/retur', authMiddleware, adminAuthMiddleware, async (_req, res) => {
  try {
    const rows = await prisma.retur.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
    })
    res.set('Cache-Control', 'no-store')
    return res.json(rows.map(mapReturRow))
  } catch (err) {
    console.error('Admin retur list error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la încărcarea cererilor de retur.' })
  }
})

/** Actualizare status cerere retur (pending | reviewed | closed). */
app.patch('/api/admin/retur/:id/status', authMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id || '').trim(), 10)
    const nextStatus = String(req.body?.status || '').trim()
    if (!Number.isFinite(id) || id < 1) return res.status(400).json({ error: 'ID invalid.' })
    if (!RETUR_ADMIN_VALID_STATUSES.includes(nextStatus)) {
      return res.status(400).json({ error: 'Status invalid.' })
    }
    const updated = await prisma.retur.update({
      where: { id },
      data: { status: nextStatus },
    })
    res.set('Cache-Control', 'no-store')
    return res.json(mapReturRow(updated))
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Cererea nu există.' })
    }
    console.error('Admin retur status error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare.' })
  }
})

function extractNumericString(s) {
  const m = String(s ?? '').match(/-?\d+(?:[.,]\d+)?/)
  if (!m) return ''
  return m[0].replace(',', '.')
}

function extractYears(s, fallback = 10) {
  const m = String(s ?? '').match(/\d+/)
  if (!m) return fallback
  const n = parseInt(m[0], 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

function joinFilled(parts, sep = ', ') {
  return parts
    .map((p) => String(p ?? '').trim())
    .filter((p) => p.length > 0)
    .join(sep)
}

function formatRoDateFromDate(d) {
  if (!d) return ''
  const dt = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(dt.getTime())) return ''
  const day = String(dt.getDate()).padStart(2, '0')
  const mo = String(dt.getMonth() + 1).padStart(2, '0')
  const yr = dt.getFullYear()
  return `${day}.${mo}.${yr}`
}

async function loadWarrantyCertificateData(savedItemId, userId) {
  const saved = await prisma.warehouseSavedItem.findFirst({
    where: { id: savedItemId, client: userId },
    include: {
      warehouseStockUnit: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              brand: true,
              energieNominala: true,
              tensiuneNominala: true,
              cicluriDescarcare: true,
              adancimeDescarcare: true,
              technicalSpecsModels: true,
              garantie: true,
            },
          },
        },
      },
    },
  })
  if (!saved) return { saved: null }
  const distributorName = String(saved.distributor || '').trim()
  const modelNumber = String(saved.modelNumber || '').trim()
  const [user, profile, company, generalPhone, partner, productModel] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true, phone: true },
    }),
    prisma.clientProfile.findUnique({ where: { userId } }),
    /* Date companie (admin → Setări → Date companie). */
    prisma.baterinoCompany
      .findUnique({ where: { id: 'default' } })
      .catch(() => null),
    /* Telefon general (admin → Setări → Numere de telefon). */
    prisma.departmentPhone
      .findUnique({ where: { department: 'general' } })
      .catch(() => null),
    /* Profilul companiei distribuitoare (admin → Companii). Match
       case-insensitive pe companyName, cu publicName ca fallback. */
    distributorName
      ? prisma.partner
          .findFirst({
            where: {
              OR: [
                { companyName: { equals: distributorName, mode: 'insensitive' } },
                { publicName: { equals: distributorName, mode: 'insensitive' } },
              ],
            },
            select: {
              companyName: true,
              publicName: true,
              cui: true,
              tradeRegisterNumber: true,
              address: true,
              companyStreet: true,
              companyCity: true,
              companyCounty: true,
              companyPostalCode: true,
              phone: true,
              publicPhone: true,
              user: { select: { email: true } },
            },
          })
          .catch(() => null)
      : Promise.resolve(null),
    /* Specificațiile per modelNumber (admin → Modele produse → drawer
       „Technical specifications”). Folosim conținutul textual ca sursă
       primară pentru Tensiune nominală / Cicluri. */
    modelNumber
      ? prisma.productModel
          .findUnique({
            where: { modelNumber },
            select: { technicalDescription: true },
          })
          .catch(() => null)
      : Promise.resolve(null),
  ])
  return { saved, user, profile, company, generalPhone, partner, productModel }
}

/**
 * Construieşte un identificator unic, stabil, pentru certificatul de garanţie.
 * Format: `CG-{anul în care a fost adăugat itemul}-{itemNumber 5 cifre}`.
 * Foloseşte `WarehouseSavedItem.itemNumber` (autoincrement, unic) → garantăm
 * unicitatea fără tabele suplimentare. Anul se ia din `createdAt` pentru
 * stabilitate (numărul nu se schimbă la regenerare).
 */
function buildCertNumber(saved) {
  const created = saved?.createdAt instanceof Date ? saved.createdAt : new Date()
  const year = String(created.getFullYear())
  const num = Number(saved?.itemNumber)
  const seq = Number.isFinite(num) && num > 0 ? String(num).padStart(5, '0') : '00000'
  return `CG-${year}-${seq}`
}

/**
 * Parsează `ProductModel.technicalDescription` (text plain `Etichetă: valoare`,
 * o linie per câmp) într-un Map cu cheile normalizate (lowercase, fără
 * diacritice). Liniile fără `:` sunt ignorate (header-e tip „Model-specific:”).
 * Suportă atât etichete EN (ex. „Nominal Voltage”, „Cycle life”) cât şi RO
 * (ex. „Tensiune nominală”, „Cicluri”).
 */
function parseProductModelDescription(text) {
  const map = new Map()
  if (!text) return map
  const lines = String(text).split(/\r?\n/)
  for (const line of lines) {
    const idx = line.indexOf(':')
    if (idx <= 0) continue
    const label = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()
    if (!label || !value) continue
    /* Normalizăm cheia: lowercase + fără diacritice românești. */
    const norm = label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    map.set(norm, value)
  }
  return map
}

/**
 * Întoarce prima valoare găsită în `descMap` pentru oricare dintre etichetele
 * date (deja normalizate). Util pentru a accepta şi etichete EN, şi RO.
 */
function pickFromDescMap(descMap, labels) {
  for (const l of labels) {
    const v = descMap.get(l)
    if (v) return v
  }
  return ''
}

/**
 * Caută în `Product.technicalSpecsModels` (industrial) intrarea care corespunde
 * `modelNumber` şi întoarce obiectul de specs (ex. `{ nominalVoltage, cycleLife, ... }`).
 * Returnează `null` dacă nu există entry pentru modelul respectiv.
 */
function findModelSpecs(product, modelNumber) {
  const tsm = product?.technicalSpecsModels
  if (!tsm || typeof tsm !== 'object') return null
  const entries = Array.isArray(tsm.entries) ? tsm.entries : []
  if (entries.length === 0) return null
  const target = String(modelNumber || '').trim().toLowerCase()
  if (!target) return null
  const match = entries.find(
    (e) => String(e?.modelName || '').trim().toLowerCase() === target,
  )
  return match?.specs || null
}

function buildWarrantyCertificateValues({
  saved,
  user,
  profile,
  company,
  generalPhone,
  partner,
  productModel,
}) {
  const product = saved.warehouseStockUnit?.product || {}
  const modelSpecs = findModelSpecs(product, saved.modelNumber)
  /* Specs din `ProductModel.technicalDescription` (admin → Modele produse). */
  const modelDesc = parseProductModelDescription(productModel?.technicalDescription)

  const utilizatorNume =
    joinFilled(
      [
        String(profile?.firstName ?? user?.firstName ?? '').trim(),
        String(profile?.lastName ?? user?.lastName ?? '').trim(),
      ],
      ' ',
    ) || '—'

  const utilizatorAdresa =
    joinFilled([
      profile?.delAddress || profile?.billAddress,
      profile?.delCity || profile?.billCity,
      profile?.delCounty || profile?.billCounty,
      profile?.delPostal || profile?.billPostal,
    ]) || '—'

  const utilizatorTelefon =
    joinFilled([profile?.phone || user?.phone, user?.email], ' · ') || '—'

  const periodaAni = extractYears(product.garantie, 10)
  const periodaLuni = periodaAni * 12

  /* Tensiune: preferăm specs per modelNumber. Surse, în ordine:
     1) ProductModel.technicalDescription → "Nominal Voltage" / "Tensiune nominală"
     2) Product.technicalSpecsModels (industrial multi-model) → nominalVoltage
     3) Product.tensiuneNominala (câmp legacy pe Product). */
  const tensiuneRaw = String(
    pickFromDescMap(modelDesc, ['nominal voltage', 'tensiune nominala']) ||
      modelSpecs?.nominalVoltage ||
      product.tensiuneNominala ||
      '',
  ).trim()
  const tensiune = extractNumericString(tensiuneRaw) || '—'

  /* Cicluri / „Garanție capacitate”: preferăm specs per modelNumber. Surse:
     1) ProductModel.technicalDescription → "Cycle life" / "Cicluri"
     2) Product.technicalSpecsModels → cycleLife
     3) Product.cicluriDescarcare. Dacă valoarea e doar număr (ex. „8000 Times”
     sau „8000 Cicluri”), o normalizăm la formatul de certificat. */
  const cicluriRaw = String(
    pickFromDescMap(modelDesc, ['cycle life', 'cicluri', 'cicluri descarcare']) ||
      modelSpecs?.cycleLife ||
      product.cicluriDescarcare ||
      '',
  ).trim()
  const cicluriNum = cicluriRaw ? extractNumericString(cicluriRaw) : ''
  const cicluri = cicluriNum
    ? `≥ ${cicluriNum} cicluri la ≥ 80% capacitate`
    : cicluriRaw || '≥ 8000 cicluri la ≥ 80% capacitate'

  /* Furnizor / Importator: din admin → Setări → Date companie + Numere de telefon (general). */
  const furnizorNume = String(company?.name || '').trim() || 'Baterino SRL'
  const furnizorCui = String(company?.cui || '').trim() || '—'
  const furnizorAdresa =
    String(company?.address || '')
      .replace(/\s*\r?\n\s*/g, ', ')
      .replace(/,\s*,/g, ',')
      .trim() || '—'
  const furnizorTelefon = String(generalPhone?.phone || '').trim() || '—'

  /* Beneficiar (distribuitor): preluat din profilul Partner asociat numelui
     setat la unitate (admin → Companii). Dacă nu există match, păstrăm doar
     denumirea brută. */
  const beneficiarNume =
    String(partner?.companyName || partner?.publicName || saved.distributor || '').trim() || '—'
  const beneficiarCui =
    joinFilled(
      [
        String(partner?.cui || '').trim(),
        String(partner?.tradeRegisterNumber || '').trim(),
      ],
      ' · ',
    ) || '—'
  const beneficiarAdresa =
    (() => {
      if (!partner) return '—'
      const composed = joinFilled([
        partner.companyStreet,
        partner.companyCity,
        partner.companyCounty,
        partner.companyPostalCode,
      ])
      if (composed) return composed
      return String(partner.address || '').trim() || '—'
    })()
  const beneficiarTelefon =
    joinFilled(
      [
        String(partner?.phone || partner?.publicPhone || '').trim(),
        String(partner?.user?.email || '').trim(),
      ],
      ' · ',
    ) || '—'

  return {
    BRAND: String(product.brand || 'Baterino').trim() || 'Baterino',
    CAPACITATE: extractNumericString(product.energieNominala) || '—',
    SERIAL_NUMBER: String(saved.serialNumber || '').trim() || '—',
    MODEL_COD: String(saved.modelNumber || '').trim() || '—',
    TENSIUNE: tensiune,
    DATA_FABRICATIEI: String(saved.producedOn || '').trim() || '—',
    DATA_VANZARII: formatRoDateFromDate(saved.updatedAt || saved.createdAt) || '—',
    FURNIZOR_NUME: furnizorNume,
    FURNIZOR_CUI: furnizorCui,
    FURNIZOR_ADRESA: furnizorAdresa,
    FURNIZOR_TELEFON: furnizorTelefon,
    FURNIZOR_WEB: 'baterino.ro',
    BENEFICIAR_NUME: beneficiarNume,
    BENEFICIAR_CUI: beneficiarCui,
    BENEFICIAR_ADRESA: beneficiarAdresa,
    BENEFICIAR_TELEFON: beneficiarTelefon,
    UTILIZATOR_NUME: utilizatorNume,
    UTILIZATOR_CNP_CUI: '—',
    UTILIZATOR_ADRESA: utilizatorAdresa,
    UTILIZATOR_TELEFON: utilizatorTelefon,
    PERIOADA: String(periodaAni),
    PERIOADA_LUNI: String(periodaLuni),
    CICLURI: cicluri,
    REPREZENTANT_NUME: String(company?.representativeName || '').trim() || '—',
    BENEFICIAR_SEMNATAR: utilizatorNume,
    CERT_NUMBER: buildCertNumber(saved),
  }
}

app.post(
  '/api/client/registered-products/:savedItemId/warranty-certificate',
  authMiddleware,
  clientAuthMiddleware,
  async (req, res) => {
    try {
      const savedItemId = String(req.params.savedItemId || '').trim()
      if (!savedItemId) return res.status(400).json({ error: 'ID lipsă.' })

      const { saved, user, profile, company, generalPhone, partner, productModel } =
        await loadWarrantyCertificateData(savedItemId, req.userId)
      if (!saved) {
        return res.status(404).json({ error: 'Produs negăsit sau nu îți aparține.' })
      }
      if (!clientProfileCompleteForWarranty(profile, user)) {
        return res.status(400).json({
          code: 'profile_incomplete',
          error:
            'Completează numele, prenumele și adresa de facturare din setări pentru a genera certificatul de garanție.',
          fields: ['firstName', 'lastName', 'billAddress'],
        })
      }

      const tplLib = getWarrantyCertificateTemplateLib()
      const values = buildWarrantyCertificateValues({
        saved,
        user,
        profile,
        company,
        generalPhone,
        partner,
        productModel,
      })

      /* Pentru logo folosim un URL absolut (HTML-ul se deschide în browser).
         În dev preferăm originul cererii (Origin/Referer) ca să nu depindem de
         setarea FRONTEND_URL şi să meargă out-of-the-box pe orice port Vite. */
      const requestOrigin = (() => {
        const o = String(req.headers.origin || '').trim()
        if (o) return o.replace(/\/$/, '')
        const ref = String(req.headers.referer || '').trim()
        if (ref) {
          try {
            const u = new URL(ref)
            return `${u.protocol}//${u.host}`
          } catch {
            /* ignore */
          }
        }
        return ''
      })()
      values.LOGO_URL = requestOrigin
        ? `${requestOrigin}/images/shared/baterino-logo-black.svg`
        : tplLib.defaultWarrantyLogoUrl()

      /* QR: link semnat ?t=… dacă există WARRANTY_VERIFY_TOKEN_SECRET; altfel ?sn=… (compat). */
      const verifyBase = requestOrigin || 'https://baterino.ro'
      const serialForQr = String(values.SERIAL_NUMBER || '').trim()
      const tokenSecret = String(process.env.WARRANTY_VERIFY_TOKEN_SECRET || '').trim()
      let verifyUrl = ''
      if (tokenSecret && serialForQr) {
        const minted = mintWarrantyVerifyToken(serialForQr, tokenSecret)
        if (minted) {
          verifyUrl = `${verifyBase}/verificare-garantie?t=${encodeURIComponent(minted)}`
        }
      }
      if (!verifyUrl) {
        verifyUrl = `${verifyBase}/verificare-garantie?sn=${encodeURIComponent(serialForQr)}`
      }
      try {
        values.QR_DATA_URL = await QRCode.toDataURL(verifyUrl, {
          errorCorrectionLevel: 'M',
          margin: 1,
          width: 300,
          color: { dark: '#0e0e0e', light: '#ffffff' },
        })
      } catch (qrErr) {
        console.error('Warranty QR generation failed:', qrErr)
        values.QR_DATA_URL = ''
      }

      const html = tplLib.buildWarrantyCertificateHtml(values)

      const safeSn = String(saved.serialNumber || 'certificat').replace(/[^\w.-]+/g, '_')

      /* Generăm PDF-ul real (Puppeteer) şi îl arhivăm în R2 (privat, accesat
         doar prin endpoint-ul autentificat de download). Pe medii dev fără
         R2, păstrăm comportamentul vechi: răspundem cu HTML inline. */
      if (isR2Configured()) {
        try {
          const pdfBuffer = await renderWarrantyPdf(html)
          const key = warrantyCertificateKey(saved.id, saved.serialNumber)
          /* Dacă există un fişier vechi salvat la o cheie diferită (ex. format
             SN-based din versiunile anterioare), îl ştergem ca să nu rămână
             expus. */
          const previousUrl = saved.warrantyCertificateUrl
          if (previousUrl) {
            const previousKey = urlToKey(previousUrl)
            if (previousKey && previousKey !== key) {
              await deleteFromR2(previousKey).catch((e) =>
                console.warn('Old warranty cert delete failed:', e?.message || e),
              )
            }
          }
          /* Upload (suprascrie dacă există deja la aceeaşi cheie). URL-ul nu
             este expus clientului — îl folosim doar intern pentru a regăsi
             cheia obiectului la următorul download. */
          const internalUrl = await uploadToR2(pdfBuffer, key, 'application/pdf')
          await prisma.warehouseSavedItem.update({
            where: { id: saved.id },
            data: {
              warrantyCertificateUrl: internalUrl,
              warrantyCertificateGeneratedAt: new Date(),
            },
          })
          /* Răspundem cu PDF-ul direct (force download). Browser-ul va salva
             fişierul pe disc; nu mai expunem niciun URL public. */
          res.setHeader('Content-Type', 'application/pdf')
          res.setHeader(
            'Content-Disposition',
            `attachment; filename="${safeSn}.pdf"`,
          )
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
          res.setHeader('X-Content-Type-Options', 'nosniff')
          return res.send(pdfBuffer)
        } catch (pdfErr) {
          console.error('Warranty PDF generation/upload failed:', pdfErr)
          return res.status(500).json({
            error: 'Generarea PDF-ului certificatului a eșuat. Încearcă din nou.',
          })
        }
      }

      /* Fallback (dev fără R2): răspundem cu HTML ca până acum. */
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.setHeader(
        'Content-Disposition',
        `inline; filename="certificat-garantie-${safeSn}.html"`,
      )
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
      return res.send(html)
    } catch (err) {
      console.error('Client warranty certificate error:', err)
      return res.status(500).json({ error: err?.message || 'Eroare.' })
    }
  },
)

/**
 * Download certificat existent: stream privat din R2.
 * URL-ul R2 nu este niciodată expus în UI. Singurul mod de a obţine PDF-ul
 * este prin acest endpoint, care:
 *   - cere auth (`authMiddleware` + `clientAuthMiddleware`),
 *   - verifică ownership-ul (item-ul aparţine user-ului curent),
 *   - streamează PDF-ul cu `Content-Disposition: attachment` (forţează
 *     download, nu permite preview inline într-un tab partajabil).
 */
app.get(
  '/api/client/registered-products/:savedItemId/warranty-certificate/download',
  authMiddleware,
  clientAuthMiddleware,
  async (req, res) => {
    try {
      const savedItemId = String(req.params.savedItemId || '').trim()
      if (!savedItemId) return res.status(400).json({ error: 'ID lipsă.' })
      const saved = await prisma.warehouseSavedItem.findFirst({
        where: { id: savedItemId, client: req.userId },
        select: {
          id: true,
          serialNumber: true,
          warrantyCertificateUrl: true,
        },
      })
      if (!saved) {
        return res.status(404).json({ error: 'Produs negăsit sau nu îți aparține.' })
      }
      if (!saved.warrantyCertificateUrl) {
        return res.status(404).json({
          code: 'no_certificate',
          error: 'Nu există încă un certificat generat pentru acest produs.',
        })
      }
      const key = urlToKey(saved.warrantyCertificateUrl)
      if (!key) {
        return res.status(500).json({ error: 'Stocare certificat indisponibilă.' })
      }
      let buffer
      try {
        buffer = await downloadFromR2(key)
      } catch (e) {
        console.error('Warranty certificate R2 download failed:', e)
        return res.status(500).json({ error: 'Nu am putut descărca certificatul.' })
      }
      const safeSn = String(saved.serialNumber || 'certificat').replace(/[^\w.-]+/g, '_')
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${safeSn}.pdf"`)
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('Content-Length', String(buffer.length))
      return res.send(buffer)
    } catch (err) {
      console.error('Client warranty certificate download error:', err)
      return res.status(500).json({ error: err?.message || 'Eroare.' })
    }
  },
)

/** Înscriere partener completă: activități + nume contact + telefon (pasul „profil public”). */
function isPartnerSignupApplicationComplete(partner) {
  if (!partner) return false
  if (!String(partner.activityTypes || '').trim()) return false
  if (!String(partner.contactFirstName || '').trim()) return false
  if (!String(partner.contactLastName || '').trim()) return false
  if (!String(partner.phone || '').trim()) return false
  return true
}

async function maybeSendPartnerApplicationReceivedEmail(userId, partner) {
  try {
    if (!isPartnerSignupApplicationComplete(partner)) return
    if (partner.isApproved) return
    if (partner.applicationReceivedEmailSentAt) return

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    })
    if (!user?.email) return

    const ok = await sendPartnerApplicationReceivedEmail(user.email, {
      contactFirstName: partner.contactFirstName,
      companyName: partner.companyName,
    })
    if (!ok) return

    await prisma.partner.update({
      where: { id: partner.id },
      data: { applicationReceivedEmailSentAt: new Date() },
    })
  } catch (err) {
    console.error('[Partner] Application received email:', err?.message || err)
  }
}

async function mergePartnerSlugOnPut(prismaCli, existing, body, data) {
  const mergedCompanyName =
    data.companyName !== undefined && data.companyName !== null && String(data.companyName).trim() !== ''
      ? String(data.companyName).trim()
      : String(existing.companyName || '').trim()

  if (body.publicSlug !== undefined) {
    if (body.publicSlug === null || body.publicSlug === '') {
      data.publicSlug = await allocateUniquePartnerSlug(prismaCli, existing.id, mergedCompanyName || 'partener')
      return
    }
    const cand = normalizePublicSlugParam(body.publicSlug)
    if (!isValidPublicSlugFormat(cand)) {
      throw Object.assign(new Error('PUBLIC_SLUG_INVALID'), { code: 'PUBLIC_SLUG' })
    }
    const clash = await prismaCli.partner.findFirst({
      where: { publicSlug: cand, NOT: { id: existing.id } },
      select: { id: true },
    })
    if (clash) {
      throw Object.assign(new Error('PUBLIC_SLUG_TAKEN'), { code: 'PUBLIC_SLUG' })
    }
    data.publicSlug = cand
    return
  }

  if (!existing.publicSlug) {
    data.publicSlug = await allocateUniquePartnerSlug(prismaCli, existing.id, mergedCompanyName || 'partener')
  }
}

async function deletePartnerPublicProfileR2Object(urlString) {
  if (!urlString || typeof urlString !== 'string') return
  if (!urlString.startsWith('http')) return
  if (!isR2Configured()) return
  const key = urlToKey(urlString)
  if (!key || !key.startsWith('PublicProfiles/')) return
  try {
    await deleteFromR2(key)
  } catch (e) {
    console.warn('[R2] delete PublicProfiles object:', key, e?.message || e)
  }
}

/** Salvează doar URL-uri string; acceptă istoric buggy `{ url }` din frontend. */
function sanitizeWorkPhotosForDb(arr) {
  if (!Array.isArray(arr)) return null
  const out = []
  for (const x of arr.slice(0, 8)) {
    if (typeof x === 'string') {
      const t = String(x).trim()
      if (t) out.push(t)
    } else if (x != null && typeof x === 'object' && typeof x.url === 'string') {
      const t = String(x.url).trim()
      if (t) out.push(t)
    }
  }
  return JSON.stringify(out)
}

// ── Public: pagină instalator ───────────────────────────────────────────
app.get('/api/public/companii/:slugSegment', async (req, res) => {
  try {
    const slug = normalizePublicSlugParam(req.params.slugSegment || '')
    if (!isSlugUrlSegment(slug)) {
      return res.status(404).json({ error: 'Profil negăsit.' })
    }
    const partner = await prisma.partner.findFirst({
      where: {
        publicSlug: slug,
        isPublic: true,
        isApproved: true,
        isSuspended: false,
        user: { deletedAt: null },
      },
      select: {
        publicSlug: true,
        companyName: true,
        logoUrl: true,
        publicName: true,
        street: true,
        county: true,
        city: true,
        zipCode: true,
        description: true,
        services: true,
        publicPhone: true,
        whatsapp: true,
        website: true,
        facebookUrl: true,
        linkedinUrl: true,
        instagramUrl: true,
        tiktokUrl: true,
        workPhotos: true,
      },
    })
    if (!partner) return res.status(404).json({ error: 'Profil negăsit.' })
    let workPhotosArr = []
    if (partner.workPhotos) {
      try {
        workPhotosArr = JSON.parse(partner.workPhotos)
      } catch {
        workPhotosArr = []
      }
    }
    const servicesArr = String(partner.services || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    return res.json({
      ...partner,
      services: servicesArr,
      workPhotos: Array.isArray(workPhotosArr) ? workPhotosArr : [],
    })
  } catch (err) {
    console.error('Public company profile:', err?.message || err)
    res.status(500).json({ error: 'Eroare la încărcarea profilului.' })
  }
})

// ── Partner: încărcare media profil public (logo, lucrări) → R2 PublicProfiles/<firmă>/ ──
app.post(
  '/api/partner/public-profile/media',
  authMiddleware,
  partnerPublicProfileUploadMiddleware.single('file'),
  async (req, res) => {
    try {
      if (req.userRole !== 'partener') {
        return res.status(403).json({ error: 'Doar partenerii pot încărca fișiere.' })
      }
      if (!req.file) return res.status(400).json({ error: 'Fișier lipsă.' })
      if (!isR2Configured()) {
        return res.status(503).json({ error: 'Stocare fișiere neconfigurată. Verifică R2 în .env.' })
      }
      const kind = String(req.body?.kind || '').trim().toLowerCase()
      if (kind !== 'logo' && kind !== 'work') {
        return res.status(400).json({ error: 'Tip invalid. Folosește kind=logo sau kind=work.' })
      }
      const mt = req.file.mimetype || ''
      if (!/^image\/(jpeg|jpg|png|gif|webp)$/i.test(mt)) {
        return res.status(400).json({ error: 'Permise doar imagini JPEG, PNG, GIF sau WebP.' })
      }
      const maxBytes = kind === 'logo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024
      if (req.file.size > maxBytes) {
        return res.status(400).json({
          error: kind === 'logo' ? 'Logo maxim 2 MB.' : 'Fiecare fotografie maxim 5 MB.',
        })
      }
      const partner = await prisma.partner.findUnique({
        where: { userId: req.userId },
        select: { companyName: true },
      })
      if (!partner) {
        return res.status(404).json({ error: 'Profil partener negăsit. Completează mai întâi datele companiei.' })
      }
      const companyName = String(partner.companyName || '').trim()
      if (!companyName) {
        return res.status(400).json({ error: 'Completează numele companiei înainte de a încărca imagini.' })
      }
      const key = buildPartnerPublicProfileObjectKey(companyName, kind, mt)
      const url = await uploadToR2(req.file.buffer, key, mt, {
        cacheControl: 'public, max-age=31536000, immutable',
      })
      return res.json({ url })
    } catch (err) {
      console.error('[Partner public profile upload]', err)
      res.status(500).json({ error: err?.message || 'Eroare la încărcare.' })
    }
  },
)

// ── Partner: disponibilitate handle pagină publică ───────────────────────
app.get('/api/partner/public-slug/availability', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'partener') {
      return res.status(403).json({ error: 'Doar partenerii pot accesa acest endpoint.' })
    }
    const partner = await prisma.partner.findUnique({
      where: { userId: req.userId },
      select: { id: true, publicSlug: true },
    })
    if (!partner) {
      return res.status(404).json({ error: 'Profil partener negăsit.' })
    }

    const cand = normalizePublicSlugParam(req.query.slug ?? req.query.q ?? '')
    const current = normalizePublicSlugParam(partner.publicSlug || '')

    if (!cand) {
      return res.json({ slug: '', available: false, reason: 'empty' })
    }
    if (cand === current) {
      return res.json({ slug: cand, available: true, isCurrent: true })
    }
    if (!isValidPublicSlugFormat(cand)) {
      return res.json({ slug: cand, available: false, reason: 'invalid' })
    }
    const clash = await prisma.partner.findFirst({
      where: { publicSlug: cand, NOT: { id: partner.id } },
      select: { id: true },
    })
    if (clash) {
      return res.json({ slug: cand, available: false, reason: 'taken' })
    }
    return res.json({ slug: cand, available: true })
  } catch (err) {
    console.error('Partner public slug availability:', err)
    res.status(500).json({ error: 'Eroare la verificarea adresei.' })
  }
})

// ── Partner profile (protejat, doar parteneri) ──────────────────────────
app.put('/api/partner/profile', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'partener') {
      return res.status(403).json({ error: 'Doar partenerii pot accesa acest endpoint.' })
    }

    const body = req.body || {}
    if (body.companyPostalCode !== undefined && body.companyPostalCode !== null) {
      body.companyPostalCode = normalizeRoPostalCode(body.companyPostalCode)
    }
    if (body.zipCode !== undefined && body.zipCode !== null) {
      body.zipCode = normalizeRoPostalCode(body.zipCode)
    }
    if (body.companyStreet !== undefined && body.companyStreet !== null) {
      body.companyStreet = normalizePartnerStreetLine(body.companyStreet)
    }
    if (body.street !== undefined && body.street !== null) {
      body.street = normalizePartnerStreetLine(body.street)
    }
    const cp = body.companyPostalCode
    if (cp !== undefined && cp !== null && String(cp).trim() !== '') {
      if (!/^\d{6}$/.test(String(cp).trim())) {
        return res.status(400).json({ error: 'Codul poștal (sediu) trebuie să aibă exact 6 cifre.' })
      }
    }
    const zc = body.zipCode
    if (zc !== undefined && zc !== null && String(zc).trim() !== '') {
      if (!/^\d{6}$/.test(String(zc).trim())) {
        return res.status(400).json({ error: 'Codul poștal (adresă publică) trebuie să aibă exact 6 cifre.' })
      }
    }
    const dlPc = body.deliveryPostalCode
    if (dlPc !== undefined && dlPc !== null && String(dlPc).trim() !== '') {
      const dlNorm = normalizeRoPostalCode(dlPc)
      if (!dlNorm || !/^\d{6}$/.test(String(dlNorm).trim())) {
        return res.status(400).json({ error: 'Codul poștal (livrare) trebuie să aibă exact 6 cifre.' })
      }
    }
    const userId = req.userId

    const DELIVERY_KEYS = ['deliveryStreet', 'deliveryCounty', 'deliveryCity', 'deliveryPostalCode']
    function applyPartnerDeliveryPatch(data) {
      for (const key of DELIVERY_KEYS) {
        if (body[key] === undefined) continue
        const raw = body[key]
        if (raw === null || raw === '') {
          data[key] = null
          continue
        }
        if (key === 'deliveryStreet') {
          data[key] = normalizePartnerStreetLine(raw)
        } else if (key === 'deliveryPostalCode') {
          data[key] = normalizeRoPostalCode(raw) || null
        } else {
          data[key] = String(raw).trim()
        }
      }
    }

    const existing = await prisma.partner.findUnique({ where: { userId } })

    const legal = {
      companyName: body.companyName,
      cui: body.cui,
      address: body.address,
      companyStreet: body.companyStreet,
      companyCity: body.companyCity,
      companyCounty: body.companyCounty,
      companyPostalCode: body.companyPostalCode,
      tradeRegisterNumber: body.tradeRegisterNumber,
      activityTypes: Array.isArray(body.activityTypes) ? body.activityTypes.join(',') : String(body.activityTypes || ''),
      contactFirstName: body.contactFirstName,
      contactLastName: body.contactLastName,
      phone: body.phone,
    }

    const publicFields = {
      logoUrl: body.logoUrl,
      publicName: body.publicName,
      street: body.street,
      county: body.county,
      city: body.city,
      zipCode: body.zipCode,
      description: body.description,
      services: Array.isArray(body.services) ? body.services.join(',') : body.services,
      publicPhone: body.publicPhone,
      whatsapp: body.whatsapp,
      website: body.website,
      facebookUrl: body.facebookUrl,
      linkedinUrl: body.linkedinUrl,
      instagramUrl: body.instagramUrl,
      tiktokUrl: body.tiktokUrl,
      isPublic: body.isPublic,
      workPhotos: Array.isArray(body.workPhotos)
        ? sanitizeWorkPhotosForDb(body.workPhotos)
        : body.workPhotos === null
          ? null
          : undefined,
    }

    if (existing) {
      const data = {}
      const all = { ...legal, ...publicFields }
      for (const [k, v] of Object.entries(all)) {
        if (v !== undefined && v !== null) data[k] = v
        else if ((k === 'logoUrl' || k === 'workPhotos') && (v === null || v === '')) data[k] = null
      }
      applyPartnerDeliveryPatch(data)
      try {
        await mergePartnerSlugOnPut(prisma, existing, body, data)
      } catch (e) {
        if (e.message === 'PUBLIC_SLUG_INVALID') {
          return res.status(400).json({
            error: `Adresa paginii tale publice permite doar litere mici, cifre și cratime (2–${MAX_SLUG_LEN} caractere) și nu poate folosi cuvinte rezervate.`,
          })
        }
        if (e.message === 'PUBLIC_SLUG_TAKEN') {
          return res.status(400).json({
            error: 'Această adresă este deja folosită de un alt instalator. Alege un alt handle.',
          })
        }
        throw e
      }
      const urlsToDeleteAfterUpdate = []
      if (body.logoUrl !== undefined) {
        const nextLogo =
          body.logoUrl === null || body.logoUrl === '' ? null : String(body.logoUrl)
        const oldLogo = existing.logoUrl ? String(existing.logoUrl) : null
        if (oldLogo && oldLogo !== nextLogo) urlsToDeleteAfterUpdate.push(oldLogo)
      }
      if (body.workPhotos !== undefined) {
        let oldArr = []
        try {
          oldArr = existing.workPhotos ? JSON.parse(existing.workPhotos) : []
        } catch {
          oldArr = []
        }
        if (!Array.isArray(oldArr)) oldArr = []
        const newArr =
          body.workPhotos === null
            ? []
            : Array.isArray(body.workPhotos)
              ? body.workPhotos.slice(0, 8)
              : []
        const newSet = new Set(newArr.filter((u) => typeof u === 'string'))
        for (const u of oldArr) {
          if (typeof u === 'string' && !newSet.has(u)) urlsToDeleteAfterUpdate.push(u)
        }
      }

      if (body.isPublic === true) {
        const mergedForPublic = { ...existing, ...data }
        if (!isPartnerPublicProfileFullyComplete(mergedForPublic)) {
          return res.status(400).json({
            error:
              'Completează profilul public la 100% înainte de a-l face vizibil. Verifică lista „Completare profil”.',
            code: 'PUBLIC_PROFILE_INCOMPLETE',
          })
        }
      }

      const partner = await prisma.partner.update({
        where: { userId },
        data,
      })
      for (const u of urlsToDeleteAfterUpdate) {
        void deletePartnerPublicProfileR2Object(u)
      }
      maybeSendPartnerApplicationReceivedEmail(userId, partner).catch((e) =>
        console.error('[Partner] Application received email (async):', e?.message),
      )
      return res.json(partner)
    }

    if (!legal.companyName || !legal.cui) {
      return res.status(400).json({
        error: 'Lipsesc câmpuri obligatorii: companyName, cui.',
      })
    }

    const createData = {
      userId,
      companyName: String(legal.companyName).trim(),
      cui: String(legal.cui).trim(),
      address: legal.address != null && legal.address !== '' ? String(legal.address).trim() : null,
      companyStreet:
        legal.companyStreet != null && legal.companyStreet !== ''
          ? String(legal.companyStreet).trim()
          : null,
      companyCity:
        legal.companyCity != null && legal.companyCity !== '' ? String(legal.companyCity).trim() : null,
      companyCounty:
        legal.companyCounty != null && legal.companyCounty !== '' ? String(legal.companyCounty).trim() : null,
      companyPostalCode:
        legal.companyPostalCode != null && legal.companyPostalCode !== ''
          ? String(legal.companyPostalCode).trim()
          : null,
      tradeRegisterNumber:
        legal.tradeRegisterNumber != null && legal.tradeRegisterNumber !== ''
          ? String(legal.tradeRegisterNumber).trim()
          : null,
      activityTypes: legal.activityTypes || '',
      contactFirstName:
        legal.contactFirstName != null && legal.contactFirstName !== undefined
          ? String(legal.contactFirstName).trim()
          : '',
      contactLastName:
        legal.contactLastName != null && legal.contactLastName !== undefined
          ? String(legal.contactLastName).trim()
          : '',
      phone: legal.phone != null && legal.phone !== undefined ? String(legal.phone).trim() : '',
      isApproved: false,
    }
    for (const [k, v] of Object.entries(publicFields)) {
      if (v !== undefined && v !== null && v !== '') createData[k] = v
    }
    createData.publicSlug = await allocateUniquePartnerSlug(
      prisma,
      null,
      createData.companyName || 'partener',
    )
    const partner = await prisma.partner.create({
      data: createData,
    })
    maybeSendPartnerApplicationReceivedEmail(userId, partner).catch((e) =>
      console.error('[Partner] Application received email (async):', e?.message),
    )
    return res.status(201).json(partner)
  } catch (err) {
    console.error('Partner profile error:', err)
    let errorMsg = 'Eroare la salvarea profilului.'
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        errorMsg = 'Există deja un profil partener pentru acest cont.'
      } else if (err.code === 'P2003') {
        errorMsg = 'Date invalide: utilizatorul nu a fost găsit.'
      } else {
        errorMsg = err.meta?.target ? `Valoare duplicată pentru: ${err.meta.target}` : err.message || errorMsg
      }
    } else if (err instanceof Prisma.PrismaClientValidationError) {
      errorMsg = 'Date invalide. Verifică că toate câmpurile sunt completate corect.'
    } else if (err?.message) {
      errorMsg = err.message
    }
    res.status(500).json({ error: errorMsg })
  }
})

app.get('/api/partner/profile', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'partener') {
      return res.status(403).json({ error: 'Doar partenerii pot accesa acest endpoint.' })
    }
    const partner = await prisma.partner.findUnique({
      where: { userId: req.userId },
      include: {
        assignedSalesAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            whatsapp: true,
            agentKind: true,
            isSuspended: true,
            deletedAt: true,
          },
        },
      },
    })
    if (!partner) return res.status(404).json({ error: 'Profil partener negăsit.' })
    let withSlug = partner
    if (!withSlug.publicSlug) {
      try {
        const slug = await allocateUniquePartnerSlug(
          prisma,
          withSlug.id,
          withSlug.companyName || 'partener',
        )
        withSlug = await prisma.partner.update({
          where: { id: withSlug.id },
          data: { publicSlug: slug },
          include: {
            assignedSalesAgent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                whatsapp: true,
              },
            },
          },
        })
      } catch (backfillErr) {
        console.error('[Partner profile GET] Backfill publicSlug:', backfillErr?.message || backfillErr)
      }
    }
    // Ensure partnerDiscountPercent is always present (plain number) for frontend
    let workPhotosArr = []
    if (withSlug.workPhotos) {
      try { workPhotosArr = JSON.parse(withSlug.workPhotos) } catch (_) { workPhotosArr = [] }
    }
    const visibleAgent = salesAgentPublicFields(withSlug.assignedSalesAgent)
    const result = {
      ...withSlug,
      assignedSalesAgent: visibleAgent,
      assignedSalesAgentId: visibleAgent ? withSlug.assignedSalesAgentId : null,
      partnerDiscountPercent: withSlug.partnerDiscountPercent != null ? Number(withSlug.partnerDiscountPercent) : null,
      workPhotos: Array.isArray(workPhotosArr) ? workPhotosArr : [],
    }
    return res.json(result)
  } catch (err) {
    console.error('Partner get error:', err)
    res.status(500).json({ error: 'Eroare la citirea profilului.' })
  }
})

app.delete('/api/partner/account', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'partener') {
      return res.status(403).json({ error: 'Doar partenerii pot accesa acest endpoint.' })
    }
    const userId = req.userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, deletedAt: true },
    })
    if (!user) return res.status(404).json({ error: 'Utilizator negăsit.' })
    if (user.deletedAt) {
      return res.status(409).json({ error: 'Contul este deja marcat pentru ștergere.' })
    }

    await sendAccountDeletedEmail(user.email, 'partener')

    await softDeleteUserAccount(prisma, userId)
    return res.json({
      message: `Cont dezactivat. Datele vor fi șterse definitiv după ${SOFT_DELETE_RETENTION_DAYS} de zile.`,
      retentionDays: SOFT_DELETE_RETENTION_DAYS,
    })
  } catch (err) {
    console.error('Delete account error:', err)
    res.status(500).json({ error: 'Eroare la ștergerea contului.' })
  }
})

// ── Debug: HTML proforma preview (always registered; blocked in prod unless BATERINO_DEBUG_PROFORMA=1) ──
async function proformaPreviewHandler(req, res) {
  const enabledInProd = process.env.BATERINO_DEBUG_PROFORMA === '1'
  if (process.env.NODE_ENV === 'production' && !enabledInProd) {
    return res.status(403).json({
      error: 'Proforma preview is off in production.',
      hint:
        'Set BATERINO_DEBUG_PROFORMA=1 on this API, or run locally and open GET /api/proforma-template (or /api/debug/proforma-preview) on the API port (e.g. http://localhost:3001/api/proforma-template).',
    })
  }
  try {
    const company = await readCompanyDataFromDb()
    const html = await getProformaTemplateLib().buildSampleProformaPreviewHtml(company)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    res.setHeader('Pragma', 'no-cache')
    return res.send(html)
  } catch (err) {
    console.error('Proforma preview error:', err)
    return res.status(500).type('text/plain').send(err?.message || String(err))
  }
}
app.get('/api/proforma-template', proformaPreviewHandler)

// ── Debug: referral invite email HTML preview (blocked in prod unless BATERINO_DEBUG_REFERRAL_EMAIL=1) ──
async function referralInvitePreviewHandler(req, res) {
  const enabledInProd = process.env.BATERINO_DEBUG_REFERRAL_EMAIL === '1'
  if (process.env.NODE_ENV === 'production' && !enabledInProd) {
    return res.status(403).json({
      error: 'Referral email preview is off in production.',
      hint:
        'Set BATERINO_DEBUG_REFERRAL_EMAIL=1 on this API, or run locally and open GET /api/referral-invite-template on the API port. Optional query: ?sender=Name&code=BAT-XXX',
    })
  }
  try {
    const baseUrl = (process.env.FRONTEND_URL || 'https://baterino.ro').replace(/\/$/, '')
    const senderName = req.query.sender != null ? String(req.query.sender) : 'Ion Popescu'
    const referralCode = req.query.code != null ? String(req.query.code) : 'BAT-PREVIEW'
    const { getReferralInviteTemplate } = getReferralInviteTemplateLib()
    const html = getReferralInviteTemplate({
      senderName,
      referralCode,
      registerUrl: `${baseUrl}/login`,
      assetBaseUrl: baseUrl,
    })
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    res.setHeader('Pragma', 'no-cache')
    return res.send(html)
  } catch (err) {
    console.error('Referral invite preview error:', err)
    return res.status(500).type('text/plain').send(err?.message || String(err))
  }
}
app.get('/api/referral-invite-template', referralInvitePreviewHandler)

// ── Admin: list inquiries (messages) ───────────────────────────────────
app.get('/api/admin/inquiries', authMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return res.json(inquiries)
  } catch (err) {
    console.error('Admin inquiries error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la încărcarea mesajelor.' })
  }
})

app.get('/api/admin/inquiries/unread-count', authMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const count = await prisma.inquiry.count({ where: { isRead: false } })
    return res.json({ count })
  } catch (err) {
    console.error('Admin unread count error:', err)
    res.status(500).json({ error: err?.message || 'Eroare.' })
  }
})

app.patch('/api/admin/inquiries/:id/read', authMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    await prisma.inquiry.update({
      where: { id },
      data: { isRead: true },
    })
    return res.json({ ok: true })
  } catch (err) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Mesaj negăsit.' })
    console.error('Admin mark read error:', err)
    res.status(500).json({ error: err?.message || 'Eroare.' })
  }
})

// ── Admin: list companies (partners) ───────────────────────────────────
const adminCompaniesHandler = async (req, res) => {
  try {
    const partners = await prisma.partner.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    })
    // Ensure partnerDiscountPercent is always present (plain number) for frontend
    const result = partners.map((p) => ({
      ...p,
      partnerDiscountPercent: p.partnerDiscountPercent != null ? Number(p.partnerDiscountPercent) : null,
    }))
    return res.json(result)
  } catch (err) {
    console.error('Admin companies error:', err)
    const msg = err?.message || 'Eroare la încărcarea companiilor.'
    res.status(500).json({ error: msg })
  }
}

const getAdminCompanyByIdHandler = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim()
    if (!id) return res.status(400).json({ error: 'ID lipsă.' })
    const partner = await prisma.partner.findUnique({
      where: { id },
      include: { user: { select: { email: true } } },
    })
    if (!partner) return res.status(404).json({ error: 'Companie negăsită.' })
    const result = {
      ...partner,
      partnerDiscountPercent: partner.partnerDiscountPercent != null ? Number(partner.partnerDiscountPercent) : null,
    }
    return res.json(result)
  } catch (err) {
    console.error('Admin company by id:', err)
    res.status(500).json({ error: err?.message || 'Eroare la încărcare.' })
  }
}

app.get('/api/admin/companies', authMiddleware, adminAuthMiddleware, adminCompaniesHandler)
app.get('/admin/companies', authMiddleware, adminAuthMiddleware, adminCompaniesHandler)
app.get('/api/admin/companies/:id', authMiddleware, adminAuthMiddleware, getAdminCompanyByIdHandler)
app.get('/admin/companies/:id', authMiddleware, adminAuthMiddleware, getAdminCompanyByIdHandler)

// ── Admin: list B2C clients (users with role client) ───────────────────
const adminClientsHandler = async (req, res) => {
  try {
    const rows = await prisma.user.findMany({
      where: { role: 'client' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        referralCode: true,
        createdAt: true,
        updatedAt: true,
        verificationCode: true,
        clientProfile: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            billAddress: true,
            billCounty: true,
            billCity: true,
            billPostal: true,
            deliveryDifferent: true,
            delAddress: true,
            delCounty: true,
            delCity: true,
            delPostal: true,
            companyName: true,
            companyCui: true,
            companyAddress: true,
            companyCounty: true,
            companyCity: true,
            companyPostal: true,
          },
        },
        _count: { select: { residentialOrders: true } },
      },
    })
    const result = rows.map((u) => ({
      id: u.id,
      email: u.email,
      referralCode: u.referralCode,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      emailVerified: !u.verificationCode,
      orderCount: u._count.residentialOrders,
      profile: u.clientProfile,
    }))
    return res.json(result)
  } catch (err) {
    console.error('Admin clients error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la încărcarea clienților.' })
  }
}
app.get('/api/admin/clients', authMiddleware, adminAuthMiddleware, adminClientsHandler)
app.get('/admin/clients', authMiddleware, adminAuthMiddleware, adminClientsHandler)

/** Șterge un cont client. Doar JWT rol `admin` (după adminAuthMiddleware). Fără email — testare din panoul admin. */
async function adminDeleteClientHandler(req, res) {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Acces restricționat. Doar administratorii pot șterge conturi client.' })
    }
    const userId = String(req.params.userId || '').trim()
    if (!userId) return res.status(400).json({ error: 'ID utilizator lipsă.' })
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    })
    if (!user || user.role !== 'client') {
      return res.status(404).json({ error: 'Client negăsit sau utilizatorul nu este cont client.' })
    }
    await prisma.user.delete({ where: { id: userId } })
    return res.json({ ok: true, message: 'Cont șters.' })
  } catch (err) {
    console.error('Admin delete client error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la ștergerea contului.' })
  }
}
app.delete('/api/admin/clients/:userId', authMiddleware, adminAuthMiddleware, adminDeleteClientHandler)
app.delete('/admin/clients/:userId', authMiddleware, adminAuthMiddleware, adminDeleteClientHandler)

// ── Admin: telefoane pe departament ─────────────────────────────────────
const DEPARTMENT_PHONE_KEYS = ['general', 'rezidential', 'industrial', 'medical', 'maritim']

async function ensureDepartmentPhoneRows() {
  for (const department of DEPARTMENT_PHONE_KEYS) {
    await prisma.departmentPhone.upsert({
      where: { department },
      create: { department, phone: '', whatsapp: '' },
      update: {},
    })
  }
}

function orderDepartmentPhones(rows) {
  const byDept = new Map(rows.map((r) => [r.department, r]))
  return DEPARTMENT_PHONE_KEYS.map((department) => {
    const r = byDept.get(department)
    return {
      department,
      phone: r?.phone ?? '',
      whatsapp: r?.whatsapp ?? '',
    }
  })
}

const listDepartmentPhonesHandler = async (req, res) => {
  try {
    await ensureDepartmentPhoneRows()
    const rows = await prisma.departmentPhone.findMany()
    res.json(orderDepartmentPhones(rows))
  } catch (err) {
    console.error('Admin department phones list:', err)
    res.status(500).json({ error: err?.message || 'Eroare la încărcare.' })
  }
}

const putDepartmentPhonesHandler = async (req, res) => {
  try {
    const raw = req.body
    const items = Array.isArray(raw) ? raw : raw?.rows
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Body invalid: trimite un array sau { rows: [...] }.' })
    }
    const seen = new Set()
    for (const item of items) {
      const department = String(item?.department || '').trim()
      if (!DEPARTMENT_PHONE_KEYS.includes(department)) {
        return res.status(400).json({ error: `Departament necunoscut: ${department}` })
      }
      if (seen.has(department)) {
        return res.status(400).json({ error: `Duplicat pentru departament: ${department}` })
      }
      seen.add(department)
      const phone = String(item?.phone ?? '').trim()
      const whatsapp = String(item?.whatsapp ?? '').trim()
      await prisma.departmentPhone.upsert({
        where: { department },
        create: { department, phone, whatsapp },
        update: { phone, whatsapp },
      })
    }
    if (seen.size !== DEPARTMENT_PHONE_KEYS.length) {
      return res.status(400).json({ error: 'Trimite toate departamentele: general, rezidential, industrial, medical, maritim.' })
    }
    const rows = await prisma.departmentPhone.findMany()
    res.json(orderDepartmentPhones(rows))
  } catch (err) {
    console.error('Admin department phones save:', err)
    res.status(500).json({ error: err?.message || 'Eroare la salvare.' })
  }
}

app.get('/api/admin/department-phones', authMiddleware, adminAuthMiddleware, listDepartmentPhonesHandler)
app.get('/admin/department-phones', authMiddleware, adminAuthMiddleware, listDepartmentPhonesHandler)
app.put('/api/admin/department-phones', authMiddleware, adminAuthMiddleware, putDepartmentPhonesHandler)
app.put('/admin/department-phones', authMiddleware, adminAuthMiddleware, putDepartmentPhonesHandler)

const SALES_AGENT_KINDS = new Set(['human', 'ai'])

/** Agent vizibil partenerilor (suport) — exclus suspendat / șters. */
function salesAgentPublicFields(agent) {
  if (!agent || agent.deletedAt || agent.isSuspended) return null
  return {
    id: agent.id,
    firstName: agent.firstName,
    lastName: agent.lastName,
    email: agent.email,
    phone: agent.phone,
    whatsapp: agent.whatsapp,
    agentKind: agent.agentKind === 'ai' ? 'ai' : 'human',
  }
}

function parseSalesAgentBody(body) {
  const lastName = String(body.lastName ?? '').trim()
  const firstName = String(body.firstName ?? '').trim()
  const phone = String(body.phone ?? '').replace(/\D/g, '')
  const whatsapp = String(body.whatsapp ?? '').replace(/\D/g, '')
  const email = String(body.email ?? '').trim().toLowerCase()
  const program = String(body.program ?? '').trim()
  const county = String(body.county ?? '').trim()
  const city = String(body.city ?? '').trim()
  const sector = String(body.sector ?? '').trim()
  const rawKind = String(body.agentKind ?? 'human').trim().toLowerCase()
  const agentKind = rawKind === 'ai' ? 'ai' : 'human'

  const namePattern = /^[\p{L}\s\-'.]+$/u
  if (!lastName || !namePattern.test(lastName)) {
    return { error: 'Nume invalid: folosiți doar litere (inclusiv diacritice), spații și cratime.' }
  }
  if (!firstName || !namePattern.test(firstName)) {
    return { error: 'Prenume invalid: folosiți doar litere (inclusiv diacritice), spații și cratime.' }
  }
  if (!phone || phone.length < 9 || phone.length > 15) {
    return { error: 'Telefon invalid: 9–15 cifre.' }
  }
  if (!whatsapp || whatsapp.length < 9 || whatsapp.length > 15) {
    return { error: 'WhatsApp invalid: 9–15 cifre.' }
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Email invalid.' }
  }
  if (!program || program.length > 512) {
    return { error: 'Program obligatoriu (max. 512 caractere).' }
  }
  if (!county || !city) {
    return { error: 'Județ și oraș obligatorii.' }
  }
  if (!SALES_AGENT_SECTORS.has(sector)) {
    return { error: 'Sector invalid.' }
  }
  if (!SALES_AGENT_KINDS.has(agentKind)) {
    return { error: 'Tip agent invalid (uman sau AI).' }
  }

  return {
    data: {
      lastName,
      firstName,
      phone,
      whatsapp,
      email,
      program,
      county,
      city,
      sector,
      agentKind,
    },
  }
}

const listAdminAgentsHandler = async (req, res) => {
  try {
    const list = await prisma.salesAgent.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { partners: true } },
      },
    })
    const result = list.map(({ _count, ...rest }) => ({
      ...rest,
      partnerCount: _count.partners,
    }))
    res.json(result)
  } catch (err) {
    console.error('Admin agents list:', err)
    res.status(500).json({ error: err?.message || 'Eroare la încărcare.' })
  }
}

const listAgentPartnersForAdminHandler = async (req, res) => {
  try {
    const agentId = String(req.params.id || '').trim()
    if (!agentId) return res.status(400).json({ error: 'ID lipsă.' })
    const agent = await prisma.salesAgent.findUnique({ where: { id: agentId }, select: { id: true } })
    if (!agent) return res.status(404).json({ error: 'Agent negăsit.' })
    const partners = await prisma.partner.findMany({
      where: { assignedSalesAgentId: agentId },
      select: {
        id: true,
        companyName: true,
        companyCounty: true,
        companyCity: true,
        cui: true,
        user: {
          select: {
            email: true,
            _count: { select: { residentialOrders: true } },
          },
        },
      },
      orderBy: { companyName: 'asc' },
    })
    const result = partners.map((p) => ({
      id: p.id,
      companyName: p.companyName,
      cui: p.cui,
      companyCounty: p.companyCounty,
      companyCity: p.companyCity,
      companyEmail: p.user?.email ?? '',
      orderCount: p.user?._count?.residentialOrders ?? 0,
    }))
    res.json(result)
  } catch (err) {
    console.error('Admin agent partners list:', err)
    res.status(500).json({ error: err?.message || 'Eroare la încărcare.' })
  }
}

const SALES_AGENT_SECTORS = new Set(['Toate', 'Industrial', 'Medical', 'Rezidential', 'Maritim'])

const createAdminAgentHandler = async (req, res) => {
  try {
    const parsed = parseSalesAgentBody(req.body || {})
    if (parsed.error) return res.status(400).json({ error: parsed.error })

    const created = await prisma.salesAgent.create({
      data: parsed.data,
    })
    res.status(201).json({ ...created, partnerCount: 0 })
  } catch (err) {
    console.error('Admin create agent:', err)
    res.status(500).json({ error: err?.message || 'Eroare la creare.' })
  }
}

const updateAdminAgentHandler = async (req, res) => {
  try {
    const agentId = String(req.params.id || '').trim()
    if (!agentId) return res.status(400).json({ error: 'ID lipsă.' })
    const existing = await prisma.salesAgent.findFirst({
      where: { id: agentId, deletedAt: null },
    })
    if (!existing) return res.status(404).json({ error: 'Agent negăsit.' })

    const parsed = parseSalesAgentBody(req.body || {})
    if (parsed.error) return res.status(400).json({ error: parsed.error })

    const updated = await prisma.salesAgent.update({
      where: { id: agentId },
      data: parsed.data,
      include: { _count: { select: { partners: true } } },
    })
    const { _count, ...rest } = updated
    res.json({ ...rest, partnerCount: _count.partners })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Agent negăsit.' })
    console.error('Admin update agent:', err)
    res.status(500).json({ error: err?.message || 'Eroare la actualizare.' })
  }
}

const suspendAdminAgentHandler = async (req, res) => {
  try {
    const agentId = String(req.params.id || '').trim()
    if (!agentId) return res.status(400).json({ error: 'ID lipsă.' })
    const suspended = Boolean(req.body?.suspended)
    const existing = await prisma.salesAgent.findFirst({
      where: { id: agentId, deletedAt: null },
    })
    if (!existing) return res.status(404).json({ error: 'Agent negăsit.' })

    const updated = await prisma.salesAgent.update({
      where: { id: agentId },
      data: { isSuspended: suspended },
      include: { _count: { select: { partners: true } } },
    })
    const { _count, ...rest } = updated
    res.json({ ...rest, partnerCount: _count.partners })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Agent negăsit.' })
    console.error('Admin suspend agent:', err)
    res.status(500).json({ error: err?.message || 'Eroare la actualizare.' })
  }
}

const deleteAdminAgentHandler = async (req, res) => {
  try {
    const agentId = String(req.params.id || '').trim()
    if (!agentId) return res.status(400).json({ error: 'ID lipsă.' })
    const existing = await prisma.salesAgent.findFirst({
      where: { id: agentId, deletedAt: null },
    })
    if (!existing) return res.status(404).json({ error: 'Agent negăsit.' })

    await prisma.$transaction([
      prisma.partner.updateMany({
        where: { assignedSalesAgentId: agentId },
        data: { assignedSalesAgentId: null },
      }),
      prisma.salesAgent.update({
        where: { id: agentId },
        data: { deletedAt: new Date(), isSuspended: true },
      }),
    ])
    res.json({ ok: true })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Agent negăsit.' })
    console.error('Admin delete agent:', err)
    res.status(500).json({ error: err?.message || 'Eroare la ștergere.' })
  }
}

app.get('/api/admin/agents', authMiddleware, adminAuthMiddleware, listAdminAgentsHandler)
app.get('/admin/agents', authMiddleware, adminAuthMiddleware, listAdminAgentsHandler)
app.get('/api/admin/agents/:id/partners', authMiddleware, adminAuthMiddleware, listAgentPartnersForAdminHandler)
app.get('/admin/agents/:id/partners', authMiddleware, adminAuthMiddleware, listAgentPartnersForAdminHandler)
app.post('/api/admin/agents', authMiddleware, adminAuthMiddleware, createAdminAgentHandler)
app.post('/admin/agents', authMiddleware, adminAuthMiddleware, createAdminAgentHandler)
app.patch('/api/admin/agents/:id', authMiddleware, adminAuthMiddleware, updateAdminAgentHandler)
app.patch('/admin/agents/:id', authMiddleware, adminAuthMiddleware, updateAdminAgentHandler)
app.put('/api/admin/agents/:id', authMiddleware, adminAuthMiddleware, updateAdminAgentHandler)
app.put('/admin/agents/:id', authMiddleware, adminAuthMiddleware, updateAdminAgentHandler)
app.patch('/api/admin/agents/:id/suspend', authMiddleware, adminAuthMiddleware, suspendAdminAgentHandler)
app.patch('/admin/agents/:id/suspend', authMiddleware, adminAuthMiddleware, suspendAdminAgentHandler)
app.delete('/api/admin/agents/:id', authMiddleware, adminAuthMiddleware, deleteAdminAgentHandler)
app.delete('/admin/agents/:id', authMiddleware, adminAuthMiddleware, deleteAdminAgentHandler)

const salesAgentMeHandler = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, role: true, firstName: true, lastName: true, phone: true },
    })
    if (!user) {
      return res.status(404).json({ error: 'Utilizator negăsit.' })
    }
    const agent = await prisma.salesAgent.findUnique({
      where: { userId: req.userId },
    })
    res.json({ user, agent })
  } catch (err) {
    console.error('Sales agent me:', err)
    res.status(500).json({ error: err?.message || 'Eroare la încărcare.' })
  }
}

const updateSalesAgentMeHandler = async (req, res) => {
  try {
    const agent = await prisma.salesAgent.findFirst({
      where: { userId: req.userId, deletedAt: null },
    })
    if (!agent) {
      return res.status(400).json({
        error: 'Contul nu este legat unei fișe de agent. Contactează administratorul.',
      })
    }
    if (agent.isSuspended) {
      return res.status(403).json({ error: 'Contul de agent este suspendat.' })
    }

    const parsed = parseSalesAgentBody({ ...(req.body || {}), agentKind: agent.agentKind })
    if (parsed.error) return res.status(400).json({ error: parsed.error })

    const { agentKind: _kind, ...profileData } = parsed.data

    const [updatedAgent] = await prisma.$transaction([
      prisma.salesAgent.update({
        where: { id: agent.id },
        data: profileData,
      }),
      prisma.user.update({
        where: { id: req.userId },
        data: {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
        },
      }),
    ])

    res.json({
      user: await prisma.user.findUnique({
        where: { id: req.userId },
        select: { id: true, email: true, role: true, firstName: true, lastName: true, phone: true },
      }),
      agent: updatedAgent,
    })
  } catch (err) {
    console.error('Sales agent update me:', err)
    res.status(500).json({ error: err?.message || 'Eroare la salvare.' })
  }
}

app.get('/api/sales-agent/me', authMiddleware, salesAgentAuthMiddleware, salesAgentMeHandler)
app.patch('/api/sales-agent/me', authMiddleware, salesAgentAuthMiddleware, updateSalesAgentMeHandler)
app.put('/api/sales-agent/me', authMiddleware, salesAgentAuthMiddleware, updateSalesAgentMeHandler)
app.get('/sales-agent/me', authMiddleware, salesAgentAuthMiddleware, salesAgentMeHandler)
app.patch('/sales-agent/me', authMiddleware, salesAgentAuthMiddleware, updateSalesAgentMeHandler)
app.put('/sales-agent/me', authMiddleware, salesAgentAuthMiddleware, updateSalesAgentMeHandler)

const SALES_LEAD_STATUSES = new Set(['nou', 'contactat', 'oferta', 'inchis', 'dead'])
const SALES_LEAD_STATUS_SELECT = ['nou', 'contactat', 'dead']

function formatUserDisplayName(user) {
  if (!user) return ''
  const full = [user.firstName, user.lastName]
    .map((s) => String(s || '').trim())
    .filter(Boolean)
    .join(' ')
  return full || String(user.email || '').trim()
}

const SALES_LEAD_LIST_INCLUDE = {
  createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
  _count: { select: { activities: true } },
}

function serializeSalesLeadRow(row, flags = {}) {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    name: row.name,
    email: row.email,
    phone: row.phone,
    source: row.source,
    status: row.status,
    customerType: row.customerType,
    productLine: row.productLine,
    monthlyVolume: row.monthlyVolume,
    whatsapp: row.whatsapp,
    message: row.message,
    companyName: row.companyName,
    workEmail: row.workEmail,
    jobTitle: row.jobTitle,
    country: row.country,
    website: row.website,
    createdByUserId: row.createdByUserId ?? null,
    createdByName: formatUserDisplayName(row.createdBy),
    createdByEmail: row.createdBy?.email?.trim() ?? '',
    activityCount: row._count?.activities ?? 0,
    isNew: flags.isNew ?? false,
    hasUnreadComments: flags.hasUnreadComments ?? false,
  }
}

function serializeSalesLeadActivity(row) {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    type: row.type,
    comment: row.comment,
    fromStatus: row.fromStatus,
    toStatus: row.toStatus,
    userId: row.userId,
    userName: formatUserDisplayName(row.user),
    userEmail: row.user?.email?.trim() ?? '',
  }
}

async function fetchAllSalesLeads() {
  return prisma.salesLead.findMany({
    include: SALES_LEAD_LIST_INCLUDE,
    orderBy: { createdAt: 'desc' },
    take: 500,
  })
}

async function markSalesLeadCreatorSeen(userId, leadId) {
  if (!userId || !leadId) return
  const now = new Date()
  await prisma.salesLeadUserState.upsert({
    where: { userId_leadId: { userId, leadId } },
    create: { userId, leadId, viewedAt: now, commentsSeenAt: now },
    update: { viewedAt: now, commentsSeenAt: now },
  })
}

function leadHasUnreadComments(leadId, userId, commentsSeenAt, commentRows) {
  return commentRows.some(
    (c) =>
      c.leadId === leadId &&
      c.userId !== userId &&
      (!commentsSeenAt || c.createdAt > commentsSeenAt),
  )
}

async function enrichLeadsForUser(rows, userId) {
  if (!userId || rows.length === 0) {
    return rows.map((row) => serializeSalesLeadRow(row, { isNew: true, hasUnreadComments: false }))
  }

  const leadIds = rows.map((r) => r.id)
  const [states, commentRows] = await Promise.all([
    prisma.salesLeadUserState.findMany({
      where: { userId, leadId: { in: leadIds } },
    }),
    prisma.salesLeadActivity.findMany({
      where: { leadId: { in: leadIds }, type: 'comment' },
      select: { leadId: true, userId: true, createdAt: true },
    }),
  ])
  const stateByLead = new Map(states.map((s) => [s.leadId, s]))

  return rows.map((row) => {
    const state = stateByLead.get(row.id)
    const isNew = !state?.viewedAt
    const hasUnreadComments = leadHasUnreadComments(row.id, userId, state?.commentsSeenAt ?? null, commentRows)
    return serializeSalesLeadRow(row, { isNew, hasUnreadComments })
  })
}

async function loadSalesLeadRow(leadId) {
  return prisma.salesLead.findUnique({
    where: { id: leadId },
    include: SALES_LEAD_LIST_INCLUDE,
  })
}

async function serializeLeadForUser(row, userId) {
  if (!row) return null
  const [enriched] = await enrichLeadsForUser([row], userId)
  return enriched
}

function parseSalesLeadCreatePayload(body) {
  const name = String(body?.name ?? '').trim().slice(0, 200)
  if (!name) return { error: 'Numele este obligatoriu.' }
  const rawStatus = String(body?.status ?? 'nou').trim().toLowerCase()
  const status = SALES_LEAD_STATUSES.has(rawStatus) ? rawStatus : 'nou'
  return {
    data: {
      name,
      email: String(body?.email ?? '').trim().slice(0, 254),
      phone: String(body?.phone ?? '').trim().slice(0, 32),
      source: String(body?.source ?? 'Manual').trim().slice(0, 120) || 'Manual',
      status,
      customerType: String(body?.customerType ?? '').trim().slice(0, 120),
      productLine: String(body?.productLine ?? '').trim().slice(0, 120),
      monthlyVolume: String(body?.monthlyVolume ?? '').trim().slice(0, 120),
      whatsapp: String(body?.whatsapp ?? '').trim().slice(0, 32),
      message: String(body?.message ?? '').trim().slice(0, 4000),
      companyName: String(body?.companyName ?? '').trim().slice(0, 200),
      workEmail: String(body?.workEmail ?? '').trim().slice(0, 254),
      jobTitle: String(body?.jobTitle ?? '').trim().slice(0, 120),
      country: String(body?.country ?? '').trim().slice(0, 80),
      website: String(body?.website ?? '').trim().slice(0, 500),
    },
  }
}

async function resolveSalesAgentIdForUser(userId) {
  const agent = await prisma.salesAgent.findFirst({
    where: { userId, deletedAt: null, isSuspended: false },
    select: { id: true },
  })
  return agent?.id ?? null
}

async function fetchSalesLeadNotificationRecipientEmails(excludeUserId) {
  const users = await prisma.user.findMany({
    where: {
      role: { in: ['admin', 'sales_agent'] },
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
    select: {
      email: true,
      role: true,
      salesAgentProfile: { select: { isSuspended: true, deletedAt: true } },
    },
  })

  const emails = []
  const seen = new Set()
  for (const user of users) {
    const email = String(user.email || '').trim().toLowerCase()
    if (!email || seen.has(email)) continue
    if (user.role === 'sales_agent') {
      const agent = user.salesAgentProfile
      if (agent && (agent.isSuspended || agent.deletedAt)) continue
    }
    seen.add(email)
    emails.push(email)
  }
  return emails
}

function salesLeadRowForEmail(row) {
  return {
    name: row.name,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    source: row.source,
    status: row.status,
    customerType: row.customerType,
    productLine: row.productLine,
    monthlyVolume: row.monthlyVolume,
    companyName: row.companyName,
    workEmail: row.workEmail,
    jobTitle: row.jobTitle,
    country: row.country,
    website: row.website,
    message: row.message,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
  }
}

async function notifyOthersOfNewSalesLead(created, excludeUserId) {
  try {
    const recipients = await fetchSalesLeadNotificationRecipientEmails(excludeUserId)
    if (recipients.length === 0) return
    await sendSalesLeadCreatedNotification({
      createdByName: formatUserDisplayName(created.createdBy),
      lead: salesLeadRowForEmail(created),
      recipients,
    })
  } catch (err) {
    console.error('[SalesLead] Notification error:', err?.message || err)
  }
}

async function listSalesAgentLeadsHandler(req, res) {
  try {
    const rows = await fetchAllSalesLeads()
    const leads = await enrichLeadsForUser(rows, req.userId)
    return res.json({ leads })
  } catch (err) {
    console.error('List sales agent leads error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la listarea leads.' })
  }
}

async function listAdminSalesLeadsHandler(req, res) {
  try {
    const rows = await fetchAllSalesLeads()
    const leads = await enrichLeadsForUser(rows, req.userId)
    return res.json({ leads })
  } catch (err) {
    console.error('List admin sales leads error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la listarea leads.' })
  }
}

async function salesAgentLeadStatsHandler(req, res) {
  try {
    const userId = req.userId

    const [totalLeads, yourLeads, contributionGroups] = await Promise.all([
      prisma.salesLead.count(),
      userId
        ? prisma.salesLead.count({ where: { createdByUserId: userId } })
        : Promise.resolve(0),
      userId
        ? prisma.salesLeadActivity.groupBy({
            by: ['leadId'],
            where: {
              userId,
              type: { in: ['comment', 'status_change'] },
            },
          })
        : Promise.resolve([]),
    ])

    return res.json({
      stats: {
        totalLeads,
        yourLeads,
        contributions: contributionGroups.length,
      },
    })
  } catch (err) {
    console.error('Sales agent lead stats error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la statisticile leads.' })
  }
}

async function createSalesAgentLeadHandler(req, res) {
  try {
    const agentId = await resolveSalesAgentIdForUser(req.userId)
    if (!agentId) {
      return res.status(400).json({
        error: 'Contul nu este legat unei fișe de agent. Contactează administratorul.',
      })
    }
    const parsed = parseSalesLeadCreatePayload(req.body)
    if (parsed.error) return res.status(400).json({ error: parsed.error })

    const created = await prisma.salesLead.create({
      data: {
        ...parsed.data,
        salesAgentId: agentId,
        createdByUserId: req.userId || null,
      },
      include: SALES_LEAD_LIST_INCLUDE,
    })
    await markSalesLeadCreatorSeen(req.userId, created.id)
    notifyOthersOfNewSalesLead(created, req.userId).catch((e) =>
      console.error('[SalesLead] Notification error:', e?.message),
    )
    const lead = await serializeLeadForUser(created, req.userId)
    return res.status(201).json({ lead })
  } catch (err) {
    console.error('Create sales agent lead error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la crearea lead-ului.' })
  }
}

async function createAdminSalesLeadHandler(req, res) {
  try {
    const parsed = parseSalesLeadCreatePayload(req.body)
    if (parsed.error) return res.status(400).json({ error: parsed.error })

    const created = await prisma.salesLead.create({
      data: {
        ...parsed.data,
        salesAgentId: null,
        createdByUserId: req.userId || null,
      },
      include: SALES_LEAD_LIST_INCLUDE,
    })
    await markSalesLeadCreatorSeen(req.userId, created.id)
    notifyOthersOfNewSalesLead(created, req.userId).catch((e) =>
      console.error('[SalesLead] Notification error:', e?.message),
    )
    const lead = await serializeLeadForUser(created, req.userId)
    return res.status(201).json({ lead })
  } catch (err) {
    console.error('Create admin sales lead error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la crearea lead-ului.' })
  }
}

async function markSalesLeadViewedHandler(req, res) {
  try {
    const leadId = String(req.params.id || '').trim()
    const userId = req.userId
    if (!leadId) return res.status(400).json({ error: 'ID lipsă.' })

    const lead = await prisma.salesLead.findUnique({ where: { id: leadId } })
    if (!lead) return res.status(404).json({ error: 'Lead negăsit.' })

    const existingState = await prisma.salesLeadUserState.findUnique({
      where: { userId_leadId: { userId, leadId } },
    })
    const now = new Date()

    await prisma.salesLeadUserState.upsert({
      where: { userId_leadId: { userId, leadId } },
      create: { userId, leadId, viewedAt: now },
      update: { viewedAt: existingState?.viewedAt ?? now },
    })

    const row = await loadSalesLeadRow(leadId)
    const leadJson = await serializeLeadForUser(row, userId)
    return res.json({ lead: leadJson })
  } catch (err) {
    console.error('Mark sales lead viewed error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la marcarea lead-ului.' })
  }
}

async function markSalesLeadCommentsSeenHandler(req, res) {
  try {
    const leadId = String(req.params.id || '').trim()
    const userId = req.userId
    if (!leadId) return res.status(400).json({ error: 'ID lipsă.' })

    const lead = await prisma.salesLead.findUnique({ where: { id: leadId }, select: { id: true } })
    if (!lead) return res.status(404).json({ error: 'Lead negăsit.' })

    const now = new Date()
    const existingState = await prisma.salesLeadUserState.findUnique({
      where: { userId_leadId: { userId, leadId } },
    })

    await prisma.salesLeadUserState.upsert({
      where: { userId_leadId: { userId, leadId } },
      create: { userId, leadId, commentsSeenAt: now, viewedAt: now },
      update: {
        commentsSeenAt: now,
        viewedAt: existingState?.viewedAt ?? now,
      },
    })

    const row = await loadSalesLeadRow(leadId)
    const leadJson = await serializeLeadForUser(row, userId)
    return res.json({ lead: leadJson })
  } catch (err) {
    console.error('Mark sales lead comments seen error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la marcarea comentariilor.' })
  }
}

async function patchSalesLeadStatusHandler(req, res) {
  try {
    const leadId = String(req.params.id || '').trim()
    const userId = req.userId
    const rawStatus = String(req.body?.status ?? '').trim().toLowerCase()
    if (!leadId) return res.status(400).json({ error: 'ID lipsă.' })
    if (!SALES_LEAD_STATUSES.has(rawStatus)) {
      return res.status(400).json({ error: 'Status invalid.' })
    }

    const lead = await prisma.salesLead.findUnique({ where: { id: leadId } })
    if (!lead) return res.status(404).json({ error: 'Lead negăsit.' })

    if (lead.status !== rawStatus) {
      await prisma.salesLead.update({
        where: { id: leadId },
        data: { status: rawStatus },
      })
      await prisma.salesLeadActivity.create({
        data: {
          leadId,
          userId,
          type: 'status_change',
          fromStatus: lead.status,
          toStatus: rawStatus,
        },
      })
    }

    const row = await loadSalesLeadRow(leadId)
    const leadJson = await serializeLeadForUser(row, userId)
    return res.json({ lead: leadJson })
  } catch (err) {
    console.error('Patch sales lead status error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la actualizarea statusului.' })
  }
}

async function getSalesLeadActivitiesHandler(req, res) {
  try {
    const leadId = String(req.params.id || '').trim()
    if (!leadId) return res.status(400).json({ error: 'ID lipsă.' })
    const lead = await prisma.salesLead.findUnique({ where: { id: leadId }, select: { id: true } })
    if (!lead) return res.status(404).json({ error: 'Lead negăsit.' })
    const rows = await prisma.salesLeadActivity.findMany({
      where: { leadId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 200,
    })
    return res.json({ activities: rows.map(serializeSalesLeadActivity) })
  } catch (err) {
    console.error('Get sales lead activities error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la încărcarea comentariilor.' })
  }
}

async function postSalesLeadCommentHandler(req, res) {
  try {
    const leadId = String(req.params.id || '').trim()
    const comment = String(req.body?.comment ?? '').trim().slice(0, 4000)
    if (!leadId) return res.status(400).json({ error: 'ID lipsă.' })
    if (!comment) return res.status(400).json({ error: 'Comentariul este obligatoriu.' })
    const lead = await prisma.salesLead.findUnique({ where: { id: leadId }, select: { id: true } })
    if (!lead) return res.status(404).json({ error: 'Lead negăsit.' })
    const created = await prisma.salesLeadActivity.create({
      data: {
        leadId,
        userId: req.userId,
        type: 'comment',
        comment,
      },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, role: true } },
      },
    })
    return res.status(201).json({ activity: serializeSalesLeadActivity(created) })
  } catch (err) {
    console.error('Post sales lead comment error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la salvarea comentariului.' })
  }
}

app.get('/api/sales-agent/leads/stats', authMiddleware, salesAgentAuthMiddleware, salesAgentLeadStatsHandler)
app.get('/sales-agent/leads/stats', authMiddleware, salesAgentAuthMiddleware, salesAgentLeadStatsHandler)
app.get('/api/sales-agent/leads', authMiddleware, salesAgentAuthMiddleware, listSalesAgentLeadsHandler)
app.get('/sales-agent/leads', authMiddleware, salesAgentAuthMiddleware, listSalesAgentLeadsHandler)
app.get('/api/sales-agent/leads/:id/activities', authMiddleware, salesAgentAuthMiddleware, getSalesLeadActivitiesHandler)
app.get('/sales-agent/leads/:id/activities', authMiddleware, salesAgentAuthMiddleware, getSalesLeadActivitiesHandler)
app.post('/api/sales-agent/leads/:id/viewed', authMiddleware, salesAgentAuthMiddleware, markSalesLeadViewedHandler)
app.post('/sales-agent/leads/:id/viewed', authMiddleware, salesAgentAuthMiddleware, markSalesLeadViewedHandler)
app.post('/api/sales-agent/leads/:id/comments-seen', authMiddleware, salesAgentAuthMiddleware, markSalesLeadCommentsSeenHandler)
app.post('/sales-agent/leads/:id/comments-seen', authMiddleware, salesAgentAuthMiddleware, markSalesLeadCommentsSeenHandler)
app.patch('/api/sales-agent/leads/:id/status', authMiddleware, salesAgentAuthMiddleware, patchSalesLeadStatusHandler)
app.patch('/sales-agent/leads/:id/status', authMiddleware, salesAgentAuthMiddleware, patchSalesLeadStatusHandler)
app.post('/api/sales-agent/leads/:id/comments', authMiddleware, salesAgentAuthMiddleware, postSalesLeadCommentHandler)
app.post('/sales-agent/leads/:id/comments', authMiddleware, salesAgentAuthMiddleware, postSalesLeadCommentHandler)
app.post('/api/sales-agent/leads', authMiddleware, salesAgentAuthMiddleware, createSalesAgentLeadHandler)
app.post('/sales-agent/leads', authMiddleware, salesAgentAuthMiddleware, createSalesAgentLeadHandler)

async function deleteAdminSalesLeadHandler(req, res) {
  try {
    const id = String(req.params?.id ?? '').trim()
    if (!id) return res.status(400).json({ error: 'ID lipsă.' })
    const existing = await prisma.salesLead.findUnique({ where: { id }, select: { id: true } })
    if (!existing) return res.status(404).json({ error: 'Lead negăsit.' })
    await prisma.salesLead.delete({ where: { id } })
    return res.json({ ok: true })
  } catch (err) {
    console.error('Delete sales lead error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la ștergerea lead-ului.' })
  }
}

app.get('/api/admin/leads', authMiddleware, adminAuthMiddleware, listAdminSalesLeadsHandler)
app.get('/admin/leads', authMiddleware, adminAuthMiddleware, listAdminSalesLeadsHandler)
app.post('/api/admin/leads', authMiddleware, adminAuthMiddleware, createAdminSalesLeadHandler)
app.post('/admin/leads', authMiddleware, adminAuthMiddleware, createAdminSalesLeadHandler)
app.delete('/api/admin/leads/:id', authMiddleware, adminAuthMiddleware, deleteAdminSalesLeadHandler)
app.delete('/admin/leads/:id', authMiddleware, adminAuthMiddleware, deleteAdminSalesLeadHandler)
app.get('/api/admin/leads/:id/activities', authMiddleware, adminAuthMiddleware, getSalesLeadActivitiesHandler)
app.get('/admin/leads/:id/activities', authMiddleware, adminAuthMiddleware, getSalesLeadActivitiesHandler)
app.post('/api/admin/leads/:id/viewed', authMiddleware, adminAuthMiddleware, markSalesLeadViewedHandler)
app.post('/admin/leads/:id/viewed', authMiddleware, adminAuthMiddleware, markSalesLeadViewedHandler)
app.post('/api/admin/leads/:id/comments-seen', authMiddleware, adminAuthMiddleware, markSalesLeadCommentsSeenHandler)
app.post('/admin/leads/:id/comments-seen', authMiddleware, adminAuthMiddleware, markSalesLeadCommentsSeenHandler)
app.patch('/api/admin/leads/:id/status', authMiddleware, adminAuthMiddleware, patchSalesLeadStatusHandler)
app.patch('/admin/leads/:id/status', authMiddleware, adminAuthMiddleware, patchSalesLeadStatusHandler)
app.post('/api/admin/leads/:id/comments', authMiddleware, adminAuthMiddleware, postSalesLeadCommentHandler)
app.post('/admin/leads/:id/comments', authMiddleware, adminAuthMiddleware, postSalesLeadCommentHandler)

// ── Public: telefoane pe departament (fără auth — pentru site) ─────────
const publicDepartmentPhonesHandler = async (req, res) => {
  try {
    await ensureDepartmentPhoneRows()
    const rows = await prisma.departmentPhone.findMany()
    res.json(orderDepartmentPhones(rows))
  } catch (err) {
    console.error('Public department phones:', err)
    res.status(500).json({ error: err?.message || 'Eroare la încărcare.' })
  }
}
app.get('/api/department-phones', publicDepartmentPhonesHandler)
app.get('/department-phones', publicDepartmentPhonesHandler)

// ── Monedă catalog produse (public + admin) ─────────────────────────────
const CATALOG_CURRENCY_KEY = 'catalog_currency'
const ALLOWED_CATALOG_CURRENCIES = ['EUR', 'RON', 'IDR', 'MYR', 'PHP', 'USD']

function normalizeCatalogCurrency(value) {
  const code = String(value ?? '').trim().toUpperCase()
  return ALLOWED_CATALOG_CURRENCIES.includes(code) ? code : 'RON'
}

async function readCatalogCurrencyFromDb() {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: CATALOG_CURRENCY_KEY } })
    return normalizeCatalogCurrency(row?.value)
  } catch (err) {
    console.error('readCatalogCurrencyFromDb:', err)
    return 'RON'
  }
}

const getCatalogCurrencyHandler = async (req, res) => {
  try {
    const currency = await readCatalogCurrencyFromDb()
    res.json({ currency })
  } catch (err) {
    console.error('catalog-currency get:', err)
    res.status(500).json({ error: err?.message || 'Eroare la încărcare.' })
  }
}

const putAdminCatalogCurrencyHandler = async (req, res) => {
  try {
    const raw = String(req.body?.currency ?? req.body?.code ?? '').trim().toUpperCase()
    if (!ALLOWED_CATALOG_CURRENCIES.includes(raw)) {
      return res.status(400).json({
        error: `Monedă invalidă. Valori permise: ${ALLOWED_CATALOG_CURRENCIES.join(', ')}.`,
      })
    }
    const currency = raw
    await prisma.siteSetting.upsert({
      where: { key: CATALOG_CURRENCY_KEY },
      create: { key: CATALOG_CURRENCY_KEY, value: currency },
      update: { value: currency },
    })
    res.json({ currency })
  } catch (err) {
    console.error('admin catalog-currency put:', err)
    res.status(500).json({ error: err?.message || 'Eroare la salvare.' })
  }
}

app.get('/api/catalog-currency', getCatalogCurrencyHandler)
app.get('/catalog-currency', getCatalogCurrencyHandler)
app.get('/api/admin/catalog-currency', authMiddleware, adminAuthMiddleware, getCatalogCurrencyHandler)
app.get('/admin/catalog-currency', authMiddleware, adminAuthMiddleware, getCatalogCurrencyHandler)
app.put('/api/admin/catalog-currency', authMiddleware, adminAuthMiddleware, putAdminCatalogCurrencyHandler)
app.put('/admin/catalog-currency', authMiddleware, adminAuthMiddleware, putAdminCatalogCurrencyHandler)

// ── Date companie Baterino (admin) — tabele Prisma + migrare din SiteSetting vechi ──
const COMPANY_DATA_KEY = 'company_data' // legacy JSON (șters după import)
const COMPANY_ID = 'default'
const MAX_COMPANY_BANK_ACCOUNTS = 20

const DEFAULT_COMPANY_DATA = {
  name: 'Baterino SRL',
  cui: '',
  address: '',
  representativeName: '',
  bankAccounts: [],
}

function isSchemaOutOfSyncError(err) {
  return String(err?.code || '') === 'P2022'
}

function isTransactionStartTimeoutError(err) {
  return String(err?.code || '') === 'P2028' && /Unable to start a transaction/i.test(String(err?.message || ''))
}

/** RON | EUR | USD — valori stocate în DB; acceptă și EURO din JSON vechi. */
function normalizeBankCurrency(raw) {
  const s = String(raw ?? '')
    .trim()
    .toUpperCase()
  if (s === 'EUR' || s === 'EURO') return 'EUR'
  if (s === 'USD') return 'USD'
  if (s === 'RON') return 'RON'
  return 'RON'
}

function normalizeCompanyDataPayload(body) {
  const name = String(body?.name ?? '').trim()
  const cui = String(body?.cui ?? '').trim()
  const address = String(body?.address ?? '').trim()
  const representativeName = String(body?.representativeName ?? '').trim()
  const rawList = Array.isArray(body?.bankAccounts) ? body.bankAccounts : []
  const bankAccounts = []
  for (const a of rawList.slice(0, MAX_COMPANY_BANK_ACCOUNTS)) {
    bankAccounts.push({
      id: String(a?.id ?? '').trim() || crypto.randomUUID(),
      bankName: String(a?.bankName ?? '').trim(),
      iban: String(a?.iban ?? a?.IBAN ?? '').trim(),
      swift: String(a?.swift ?? a?.SWIFT ?? a?.bic ?? a?.BIC ?? '').trim(),
      currency: normalizeBankCurrency(a?.currency),
      accountName: String(a?.accountName ?? '').trim(),
    })
  }
  return { name, cui, address, representativeName, bankAccounts }
}

async function readCompanyDataFromLegacySetting() {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: COMPANY_DATA_KEY } })
    if (!row?.value) return { ...DEFAULT_COMPANY_DATA, bankAccounts: [] }
    return normalizeCompanyDataPayload(JSON.parse(row.value))
  } catch (err) {
    console.error('readCompanyDataFromLegacySetting:', err)
    return { ...DEFAULT_COMPANY_DATA, bankAccounts: [] }
  }
}

async function saveCompanyDataToLegacySetting(data) {
  await prisma.siteSetting.upsert({
    where: { key: COMPANY_DATA_KEY },
    create: { key: COMPANY_DATA_KEY, value: JSON.stringify(data) },
    update: { value: JSON.stringify(data) },
  })
}

async function ensureBaterinoCompanyRow() {
  await prisma.baterinoCompany.upsert({
    where: { id: COMPANY_ID },
    create: { id: COMPANY_ID, name: 'Baterino SRL', cui: '', address: '' },
    update: {},
  })
}

/** Import o singură dată din SiteSetting.company_data (înainte de trecerea la tabele). */
async function migrateCompanyDataFromSiteSettingIfNeeded() {
  const legacy = await prisma.siteSetting.findUnique({ where: { key: COMPANY_DATA_KEY } })
  if (!legacy?.value) return

  /** Dacă există deja conturi în tabelele Prisma, nu suprascriem cu JSON-ul vechi (adesea fără IBAN/SWIFT). */
  const existingAccounts = await prisma.companyBankAccount.count({ where: { companyId: COMPANY_ID } })
  if (existingAccounts > 0) {
    await prisma.siteSetting.deleteMany({ where: { key: COMPANY_DATA_KEY } }).catch(() => {})
    return
  }

  let data
  try {
    data = normalizeCompanyDataPayload(JSON.parse(legacy.value))
  } catch {
    return
  }
  await prisma.$transaction(async (tx) => {
    await tx.baterinoCompany.upsert({
      where: { id: COMPANY_ID },
      create: {
        id: COMPANY_ID,
        name: data.name || 'Baterino SRL',
        cui: data.cui,
        address: data.address,
        representativeName: data.representativeName || '',
      },
      update: {
        name: data.name || 'Baterino SRL',
        cui: data.cui,
        address: data.address,
        representativeName: data.representativeName || '',
      },
    })
    await tx.companyBankAccount.deleteMany({ where: { companyId: COMPANY_ID } })
    for (let i = 0; i < data.bankAccounts.length; i++) {
      const a = data.bankAccounts[i]
      await tx.companyBankAccount.create({
        data: {
          id: a.id,
          companyId: COMPANY_ID,
          bankName: a.bankName,
          iban: a.iban,
          swift: a.swift,
          currency: a.currency,
          accountName: a.accountName,
          sortOrder: i,
        },
      })
    }
    await tx.siteSetting.delete({ where: { key: COMPANY_DATA_KEY } })
  })
}

function companyToApiShape(company) {
  return {
    name: company.name,
    cui: company.cui,
    address: company.address,
    representativeName: company.representativeName ?? '',
    bankAccounts: company.bankAccounts.map((b) => ({
      id: b.id,
      bankName: b.bankName,
      iban: b.iban,
      swift: b.swift,
      currency: normalizeBankCurrency(b.currency),
      accountName: b.accountName,
    })),
  }
}

async function readCompanyDataFromDb() {
  try {
    await migrateCompanyDataFromSiteSettingIfNeeded()
    await ensureBaterinoCompanyRow()
    const company = await prisma.baterinoCompany.findUnique({
      where: { id: COMPANY_ID },
      include: { bankAccounts: { orderBy: { sortOrder: 'asc' } } },
    })
    if (!company) {
      return { ...DEFAULT_COMPANY_DATA, bankAccounts: [] }
    }
    return companyToApiShape(company)
  } catch (err) {
    if (isSchemaOutOfSyncError(err)) {
      return await readCompanyDataFromLegacySetting()
    }
    console.error('readCompanyDataFromDb:', err)
    return { ...DEFAULT_COMPANY_DATA, bankAccounts: [] }
  }
}

const getAdminCompanyDataHandler = async (req, res) => {
  try {
    const data = await readCompanyDataFromDb()
    res.json(data)
  } catch (err) {
    console.error('admin company-data get:', err)
    res.status(500).json({ error: err?.message || 'Eroare la încărcare.' })
  }
}

const putAdminCompanyDataHandler = async (req, res) => {
  try {
    const data = normalizeCompanyDataPayload(req.body)
    try {
      await prisma.$transaction(
        async (tx) => {
          await tx.baterinoCompany.upsert({
            where: { id: COMPANY_ID },
            create: {
              id: COMPANY_ID,
              name: data.name || 'Baterino SRL',
              cui: data.cui,
              address: data.address,
              representativeName: data.representativeName || '',
            },
            update: {
              name: data.name,
              cui: data.cui,
              address: data.address,
              representativeName: data.representativeName || '',
            },
          })
          await tx.companyBankAccount.deleteMany({ where: { companyId: COMPANY_ID } })
          for (let i = 0; i < data.bankAccounts.length; i++) {
            const a = data.bankAccounts[i]
            await tx.companyBankAccount.create({
              data: {
                id: a.id,
                companyId: COMPANY_ID,
                bankName: a.bankName,
                iban: a.iban,
                swift: a.swift,
                currency: a.currency,
                accountName: a.accountName,
                sortOrder: i,
              },
            })
          }
          await tx.siteSetting.deleteMany({ where: { key: COMPANY_DATA_KEY } })
        },
        { maxWait: 10000, timeout: 20000 },
      )
    } catch (err) {
      if (isSchemaOutOfSyncError(err) || isTransactionStartTimeoutError(err)) {
        await saveCompanyDataToLegacySetting(data)
        return res.json(data)
      }
      throw err
    }
    const saved = await readCompanyDataFromDb()
    res.json(saved)
  } catch (err) {
    console.error('admin company-data put:', err)
    res.status(500).json({ error: err?.message || 'Eroare la salvare.' })
  }
}

app.get('/api/admin/company-data', authMiddleware, adminAuthMiddleware, getAdminCompanyDataHandler)
app.get('/admin/company-data', authMiddleware, adminAuthMiddleware, getAdminCompanyDataHandler)
app.put('/api/admin/company-data', authMiddleware, adminAuthMiddleware, putAdminCompanyDataHandler)
app.put('/admin/company-data', authMiddleware, adminAuthMiddleware, putAdminCompanyDataHandler)

// ── Admin: update company discount ──────────────────────────────────────
app.patch('/api/admin/companies/:id/discount', authMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { discountPercent } = req.body
    if (discountPercent !== null && discountPercent !== undefined) {
      const num = Number(discountPercent)
      if (Number.isNaN(num) || num < 0.5 || num > 60) {
        return res.status(400).json({ error: 'Reducerea trebuie să fie între 0.5 și 60.' })
      }
    }
    const partner = await prisma.partner.update({
      where: { id },
      data: { partnerDiscountPercent: discountPercent === '' || discountPercent === null || discountPercent === undefined ? null : Number(discountPercent) },
      include: { user: { select: { email: true } } },
    })
    const result = {
      ...partner,
      partnerDiscountPercent: partner.partnerDiscountPercent != null ? Number(partner.partnerDiscountPercent) : null,
    }
    return res.json(result)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Companie negăsită.' })
    console.error('Admin discount error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la actualizare.' })
  }
})

// ── Admin: approve company ───────────────────────────────────────────────
app.patch('/api/admin/companies/:id/approve', authMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const body = req.body || {}
    const data = { isApproved: true }

    const rawDiscount = body.partnerDiscountPercent ?? body.discountPercent
    if (rawDiscount !== undefined && rawDiscount !== null && rawDiscount !== '') {
      const num = Number(rawDiscount)
      if (Number.isNaN(num) || num < 0.5 || num > 60) {
        return res.status(400).json({ error: 'Reducerea trebuie să fie între 0.5 și 60 sau goală.' })
      }
      data.partnerDiscountPercent = num
    } else if (rawDiscount === null || rawDiscount === '') {
      data.partnerDiscountPercent = null
    }

    const rawAgent = body.assignedSalesAgentId
    if (rawAgent !== undefined) {
      const sid = String(rawAgent ?? '').trim()
      if (!sid) {
        data.assignedSalesAgentId = null
      } else {
        const agent = await prisma.salesAgent.findFirst({
          where: { id: sid, deletedAt: null, isSuspended: false },
          select: { id: true },
        })
        if (!agent) {
          return res.status(400).json({ error: 'Agent de vânzări inexistent, suspendat sau șters.' })
        }
        data.assignedSalesAgentId = sid
      }
    }

    const before = await prisma.partner.findUnique({
      where: { id },
      select: { isApproved: true, user: { select: { email: true } } },
    })
    if (!before) return res.status(404).json({ error: 'Companie negăsită.' })

    const partner = await prisma.partner.update({
      where: { id },
      data,
      include: {
        user: { select: { email: true } },
        assignedSalesAgent: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    })
    const isFirstApproval = !before.isApproved
    if (isFirstApproval && before.user?.email) {
      try {
        await sendPartnerAccountApprovedEmail(before.user.email)
      } catch (err) {
        console.error('[Partner] Account approved email:', err?.message || err)
      }
    }
    if (isFirstApproval && partner.assignedSalesAgentId && partner.assignedSalesAgent?.email) {
      try {
        const contactName = [partner.contactFirstName, partner.contactLastName]
          .map((s) => String(s || '').trim())
          .filter(Boolean)
          .join(' ')
        await sendSalesAgentPartnerAssignedEmail(partner.assignedSalesAgent.email, {
          agentFirstName: partner.assignedSalesAgent.firstName,
          companyName: partner.companyName,
          cui: partner.cui,
          tradeRegisterNumber: partner.tradeRegisterNumber,
          companyStreet: partner.companyStreet,
          companyCity: partner.companyCity,
          companyCounty: partner.companyCounty,
          companyPostalCode: partner.companyPostalCode,
          address: partner.address,
          activityTypes: partner.activityTypes,
          contactName,
          contactPhone: partner.phone,
          contactEmail: partner.user?.email || '',
          website: partner.website,
          partnerDiscountPercent:
            partner.partnerDiscountPercent != null ? Number(partner.partnerDiscountPercent) : null,
        })
      } catch (err) {
        console.error('[SalesAgent] Partner assigned email:', err?.message || err)
      }
    }
    const result = {
      ...partner,
      partnerDiscountPercent: partner.partnerDiscountPercent != null ? Number(partner.partnerDiscountPercent) : null,
    }
    return res.json(result)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Companie negăsită.' })
    console.error('Admin approve error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la aprobare.' })
  }
})

/** Șterge definitiv un partener aprobat: cont utilizator + înregistrare partener (CASCADE). */
async function adminDeleteApprovedPartnerHandler(req, res) {
  try {
    const id = String(req.params.id || '').trim()
    if (!id) return res.status(400).json({ error: 'ID lipsă.' })
    const partner = await prisma.partner.findUnique({
      where: { id },
      select: { id: true, userId: true, isApproved: true },
    })
    if (!partner) return res.status(404).json({ error: 'Companie negăsită.' })
    if (!partner.isApproved) {
      return res.status(400).json({ error: 'Ștergerea este disponibilă doar pentru parteneri deja aprobați.' })
    }
    const user = await prisma.user.findUnique({
      where: { id: partner.userId },
      select: { id: true, role: true },
    })
    if (!user || user.role !== 'partener') {
      return res.status(400).json({ error: 'Utilizator invalid pentru acest partener.' })
    }
    await prisma.user.delete({ where: { id: partner.userId } })
    return res.json({ ok: true })
  } catch (err) {
    console.error('Admin delete approved partner error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la ștergere.' })
  }
}
app.delete('/api/admin/companies/:id', authMiddleware, adminAuthMiddleware, adminDeleteApprovedPartnerHandler)
app.delete('/admin/companies/:id', authMiddleware, adminAuthMiddleware, adminDeleteApprovedPartnerHandler)

/** API shape for ReducereProgram (popover fields flattened for admin/public). */
function reducereProgramToApi(row) {
  if (!row) return row
  const t = row.stiaiCaTitle != null ? String(row.stiaiCaTitle).trim() : ''
  const x = row.stiaiCaText != null ? String(row.stiaiCaText).trim() : ''
  const stiaiCa = t || x ? { title: t || 'Știai că?', text: x } : undefined
  return {
    id: row.id,
    locale: row.locale,
    photo: row.photo,
    programLabel: row.programLabel,
    title: row.title,
    descriereScurta: row.descriereScurta ?? undefined,
    description: row.description,
    ctaLabel: row.ctaLabel,
    ctaTo: row.ctaTo,
    termsLabel: row.termsLabel,
    topIcon: row.topIcon ?? undefined,
    stiaiCa,
    durataProgram: row.durataProgram ?? undefined,
    discountPercent: row.discountPercent != null ? Number(row.discountPercent) : undefined,
    sortOrder: row.sortOrder,
    isActive: row.isActive !== false,
  }
}

function parseDiscountPercent(v) {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  if (!Number.isFinite(n) || n < 0 || n > 100) return undefined
  return Math.round(n)
}

// ── Public: discount programmes for /reduceri (locale) ─────────────────
app.get('/api/reducere-programs', async (req, res) => {
  try {
    const raw = String(req.query.locale || 'ro').toLowerCase().replace(/[^a-z]/g, '')
    const locale = raw === 'en' || raw === 'zh' ? raw : 'ro'
    const rows = await prisma.reducereProgram.findMany({
      where: { locale, isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    return res.json(rows.map(reducereProgramToApi))
  } catch (err) {
    console.error('Public reducere-programs error:', err)
    res.status(500).json({ error: err?.message || 'Eroare.' })
  }
})

// ── Admin: list / create / update / delete discount programmes ───────────
const adminReducereListHandler = async (req, res) => {
  try {
    const raw = String(req.query.locale || 'ro').toLowerCase().replace(/[^a-z]/g, '')
    const locale = raw === 'en' || raw === 'zh' ? raw : 'ro'
    const rows = await prisma.reducereProgram.findMany({
      where: { locale },
      orderBy: { sortOrder: 'asc' },
    })
    return res.json(rows.map(reducereProgramToApi))
  } catch (err) {
    console.error('Admin reducere-programs list error:', err)
    res.status(500).json({ error: err?.message || 'Eroare.' })
  }
}
app.get('/api/admin/reducere-programs', authMiddleware, adminAuthMiddleware, adminReducereListHandler)

app.post('/api/admin/reducere-programs', authMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const b = req.body || {}
    const raw = String(b.locale || 'ro').toLowerCase().replace(/[^a-z]/g, '')
    const locale = raw === 'en' || raw === 'zh' ? raw : 'ro'
    const maxSort = await prisma.reducereProgram.aggregate({
      where: { locale },
      _max: { sortOrder: true },
    })
    const sortOrder = (maxSort._max.sortOrder ?? -1) + 1
    const disc = parseDiscountPercent(b.discountPercent)
    if (disc === undefined && b.discountPercent !== null && b.discountPercent !== undefined && b.discountPercent !== '') {
      return res.status(400).json({ error: 'Procent reducere invalid (0–100).' })
    }
    let stiaiCaTitle = null
    let stiaiCaText = null
    if (b.stiaiCa && typeof b.stiaiCa === 'object') {
      stiaiCaTitle = String(b.stiaiCa.title || '').trim() || null
      stiaiCaText = String(b.stiaiCa.text || '').trim() || null
    }
    const row = await prisma.reducereProgram.create({
      data: {
        locale,
        photo: String(b.photo || '').trim() || '/images/programe%20reduceri/tva-cum-era.jpg',
        programLabel: String(b.programLabel || '').trim() || 'PROGRAM',
        title: String(b.title || '').trim() || '',
        descriereScurta: b.descriereScurta ? String(b.descriereScurta).trim() : null,
        description: String(b.description || '').trim() || '',
        ctaLabel: String(b.ctaLabel || 'CREEAZĂ CONT').trim(),
        ctaTo: String(b.ctaTo || '/login').trim(),
        termsLabel: String(b.termsLabel || 'Termeni și Condiții Reducere').trim(),
        topIcon: b.topIcon != null && String(b.topIcon).trim() !== '' ? String(b.topIcon).trim() : null,
        stiaiCaTitle,
        stiaiCaText,
        durataProgram: b.durataProgram ? String(b.durataProgram).trim() : null,
        discountPercent: disc,
        sortOrder,
        isActive: true,
      },
    })
    return res.status(201).json(reducereProgramToApi(row))
  } catch (err) {
    console.error('Admin reducere-programs create error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la creare.' })
  }
})

app.patch('/api/admin/reducere-programs/:id', authMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const b = req.body || {}
    const data = {}
    if (typeof b.photo === 'string') data.photo = b.photo.trim()
    if (typeof b.programLabel === 'string') data.programLabel = b.programLabel.trim()
    if (typeof b.title === 'string') data.title = b.title.trim()
    if (b.descriereScurta !== undefined) {
      data.descriereScurta = b.descriereScurta == null || b.descriereScurta === '' ? null : String(b.descriereScurta).trim()
    }
    if (typeof b.description === 'string') data.description = b.description.trim()
    if (typeof b.ctaLabel === 'string') data.ctaLabel = b.ctaLabel.trim()
    if (typeof b.ctaTo === 'string') data.ctaTo = b.ctaTo.trim()
    if (typeof b.termsLabel === 'string') data.termsLabel = b.termsLabel.trim()
    if (b.topIcon !== undefined) data.topIcon = b.topIcon == null || b.topIcon === '' ? null : String(b.topIcon).trim()
    if (b.durataProgram !== undefined) data.durataProgram = b.durataProgram == null || b.durataProgram === '' ? null : String(b.durataProgram).trim()
    if (b.discountPercent !== undefined) {
      const disc = parseDiscountPercent(b.discountPercent)
      if (disc === undefined && b.discountPercent !== null && b.discountPercent !== '') {
        return res.status(400).json({ error: 'Procent reducere invalid (0–100).' })
      }
      data.discountPercent = disc
    }
    if (b.stiaiCa === null) {
      data.stiaiCaTitle = null
      data.stiaiCaText = null
    } else if (b.stiaiCa && typeof b.stiaiCa === 'object') {
      data.stiaiCaTitle = String(b.stiaiCa.title || '').trim() || null
      data.stiaiCaText = String(b.stiaiCa.text || '').trim() || null
    }
    if (Object.keys(data).length === 0) {
      const existing = await prisma.reducereProgram.findUnique({ where: { id } })
      if (!existing) return res.status(404).json({ error: 'Program negăsit.' })
      return res.json(reducereProgramToApi(existing))
    }
    const updated = await prisma.reducereProgram.update({ where: { id }, data })
    return res.json(reducereProgramToApi(updated))
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Program negăsit.' })
    console.error('Admin reducere-programs patch error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la salvare.' })
  }
})

app.delete('/api/admin/reducere-programs/:id', authMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    await prisma.reducereProgram.delete({ where: { id: req.params.id } })
    return res.status(204).end()
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Program negăsit.' })
    console.error('Admin reducere-programs delete error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la ștergere.' })
  }
})

// ── Case studies (Studii de caz) ─────────────────────────────────────────────

function normalizeCaseStudyLocale(raw) {
  const s = String(raw || 'ro').toLowerCase().replace(/[^a-z]/g, '')
  return s === 'en' || s === 'zh' ? s : 'ro'
}

function slugifyCaseStudy(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseCaseStudySpecs(v) {
  if (!Array.isArray(v)) return []
  return v
    .slice(0, 4)
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const label = String(item.label || '').trim()
      const value = String(item.value || '').trim()
      if (!label && !value) return null
      return {
        label,
        value,
        highlight: item.highlight === true,
      }
    })
    .filter(Boolean)
}

function parseCaseStudyTags(v) {
  if (!Array.isArray(v)) return []
  return [...new Set(v.map((t) => String(t || '').trim()).filter(Boolean))]
}

const CASE_STUDY_MAX_IMAGES = 6

function parseCaseStudyImages(v, fallbackImage) {
  if (Array.isArray(v)) {
    const urls = v
      .map((u) => String(u || '').trim())
      .filter(Boolean)
      .slice(0, CASE_STUDY_MAX_IMAGES)
    if (urls.length > 0) return urls
  }
  const img = String(fallbackImage || '').trim()
  return img ? [img] : []
}

function normalizeCaseStudyImageFields(body, existing) {
  const fallbackImage =
    body?.image != null
      ? String(body.image || '').trim()
      : existing?.image
        ? String(existing.image).trim()
        : ''
  const images = parseCaseStudyImages(body?.images, fallbackImage)
  const image = images[0] || fallbackImage || '/images/divizii/industrial/centre-de-date.jpg'
  const imageCount = images.length
  return { images, image, imageCount }
}

function caseStudyToApi(row) {
  if (!row) return row
  const images = parseCaseStudyImages(row.images, row.image)
  const image = images[0] || String(row.image || '').trim()
  return {
    id: row.id,
    locale: row.locale,
    slug: row.slug,
    category: row.category,
    title: row.title,
    location: row.location,
    image,
    imageAlt: row.imageAlt,
    images,
    imageCount: images.length || Number(row.imageCount) || 0,
    specs: parseCaseStudySpecs(row.specs),
    tags: parseCaseStudyTags(row.tags),
    isActive: row.isActive !== false,
    sortOrder: row.sortOrder ?? 0,
  }
}

app.get('/api/case-studies', async (req, res) => {
  try {
    const locale = normalizeCaseStudyLocale(req.query.locale)
    const rows = await prisma.caseStudy.findMany({
      where: { locale, isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    return res.json(rows.map(caseStudyToApi))
  } catch (err) {
    console.error('Public case-studies error:', err)
    res.status(500).json({ error: err?.message || 'Eroare.' })
  }
})

const adminCaseStudyListHandler = async (req, res) => {
  try {
    const locale = normalizeCaseStudyLocale(req.query.locale)
    const rows = await prisma.caseStudy.findMany({
      where: { locale },
      orderBy: { sortOrder: 'asc' },
    })
    return res.json(rows.map(caseStudyToApi))
  } catch (err) {
    console.error('Admin case-studies list error:', err)
    res.status(500).json({ error: err?.message || 'Eroare.' })
  }
}
app.get('/api/admin/case-studies', authMiddleware, adminAuthMiddleware, adminCaseStudyListHandler)

app.post('/api/admin/case-studies', authMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const b = req.body || {}
    const locale = normalizeCaseStudyLocale(b.locale)
    const slug = slugifyCaseStudy(b.slug || b.title)
    if (!slug) return res.status(400).json({ error: 'Slug invalid.' })
    const title = String(b.title || '').trim()
    if (!title) return res.status(400).json({ error: 'Titlul este obligatoriu.' })

    const existing = await prisma.caseStudy.findUnique({
      where: { locale_slug: { locale, slug } },
    })
    if (existing) return res.status(409).json({ error: 'Există deja un studiu de caz cu acest slug pentru limba selectată.' })

    const maxSort = await prisma.caseStudy.aggregate({
      where: { locale },
      _max: { sortOrder: true },
    })
    const sortOrder = (maxSort._max.sortOrder ?? -1) + 1

    const { images, image, imageCount } = normalizeCaseStudyImageFields(b)

    const row = await prisma.caseStudy.create({
      data: {
        locale,
        slug,
        category: String(b.category || 'INDUSTRIAL').trim() || 'INDUSTRIAL',
        title,
        location: String(b.location || '').trim(),
        image,
        imageAlt: String(b.imageAlt || title).trim(),
        imageCount,
        images,
        specs: parseCaseStudySpecs(b.specs),
        tags: parseCaseStudyTags(b.tags),
        isActive: b.isActive !== false,
        sortOrder,
      },
    })
    return res.status(201).json(caseStudyToApi(row))
  } catch (err) {
    console.error('Admin case-studies create error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la creare.' })
  }
})

app.patch('/api/admin/case-studies/:id', authMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const id = req.params.id
    const current = await prisma.caseStudy.findUnique({ where: { id } })
    if (!current) return res.status(404).json({ error: 'Studiu de caz negăsit.' })

    const b = req.body || {}
    const data = {}

    if (b.locale != null) data.locale = normalizeCaseStudyLocale(b.locale)
    if (b.slug != null) {
      const slug = slugifyCaseStudy(b.slug)
      if (!slug) return res.status(400).json({ error: 'Slug invalid.' })
      data.slug = slug
    }
    if (b.category != null) data.category = String(b.category).trim()
    if (b.title != null) {
      const title = String(b.title).trim()
      if (!title) return res.status(400).json({ error: 'Titlul este obligatoriu.' })
      data.title = title
    }
    if (b.location != null) data.location = String(b.location).trim()
    if (b.imageAlt != null) data.imageAlt = String(b.imageAlt).trim()
    if (b.images != null || b.image != null) {
      const normalized = normalizeCaseStudyImageFields(b, current)
      data.images = normalized.images
      data.image = normalized.image
      data.imageCount = normalized.imageCount
    } else if (b.imageCount != null) {
      data.imageCount = Math.max(0, parseInt(String(b.imageCount), 10) || 0)
    }
    if (b.specs != null) data.specs = parseCaseStudySpecs(b.specs)
    if (b.tags != null) data.tags = parseCaseStudyTags(b.tags)
    if (b.isActive != null) data.isActive = b.isActive !== false
    if (b.sortOrder != null) {
      const n = parseInt(String(b.sortOrder), 10)
      if (Number.isFinite(n)) data.sortOrder = n
    }

    const nextLocale = data.locale ?? current.locale
    const nextSlug = data.slug ?? current.slug
    if (nextLocale !== current.locale || nextSlug !== current.slug) {
      const clash = await prisma.caseStudy.findUnique({
        where: { locale_slug: { locale: nextLocale, slug: nextSlug } },
      })
      if (clash && clash.id !== id) {
        return res.status(409).json({ error: 'Există deja un studiu de caz cu acest slug pentru limba selectată.' })
      }
    }

    const row = await prisma.caseStudy.update({ where: { id }, data })
    return res.json(caseStudyToApi(row))
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Studiu de caz negăsit.' })
    console.error('Admin case-studies patch error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la actualizare.' })
  }
})

app.delete('/api/admin/case-studies/:id', authMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    await prisma.caseStudy.delete({ where: { id: req.params.id } })
    return res.status(204).end()
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Studiu de caz negăsit.' })
    console.error('Admin case-studies delete error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la ștergere.' })
  }
})

// ── Admin: file upload (images, PDFs) → R2 ─────────────────────────────────────────
const uploadHandler = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Fișier lipsă.' })
    if (!isR2Configured()) {
      return res.status(503).json({ error: 'Stocare fișiere neconfigurată. Verifică R2 în .env.' })
    }
    const customPrefix = String(req.query?.prefix || req.get('X-Upload-Prefix') || '').trim()
    const isPdf = req.file.mimetype === 'application/pdf'
    const prefix = customPrefix || (isPdf ? 'docs' : 'products')
    const productFolder = (req.query?.folder || req.get('X-Product-Folder') || req.body?.folder || '').trim()
    const imageIndexRaw = req.get('X-Image-Index') || req.body?.imageIndex || req.query?.imageIndex
    const imageIndex = imageIndexRaw != null ? parseInt(String(imageIndexRaw), 10) : undefined

    if (prefix === 'study-cases') {
      const mt = String(req.file.mimetype || '').toLowerCase()
      const name = String(req.file.originalname || '').toLowerCase()
      const isJpeg = mt === 'image/jpeg' || mt === 'image/jpg' || name.endsWith('.jpg') || name.endsWith('.jpeg')
      if (!isJpeg) {
        return res.status(400).json({ error: 'Studiile de caz acceptă doar imagini JPG/JPEG.' })
      }
      if (!productFolder) {
        return res.status(400).json({ error: 'Folder studiu de caz lipsă (slug).' })
      }
    }

    const key = generateKey(req.file.originalname, prefix, req.file.mimetype, productFolder || undefined, imageIndex)
    console.log('[R2 Upload] imageIndex:', imageIndex, 'key:', key, 'size:', req.file.size)
    const url = await uploadToR2(req.file.buffer, key, req.file.mimetype)
    console.log('[R2 Upload] success url:', url)
    return res.json({ url })
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la încărcare.' })
  }
}
app.post('/api/admin/upload', authMiddleware, adminAuthMiddleware, uploadMiddleware.single('file'), uploadHandler)
app.post('/admin/upload', authMiddleware, adminAuthMiddleware, uploadMiddleware.single('file'), uploadHandler)

// ── Admin: create product ───────────────────────────────────────────────
const createProductHandler = async (req, res) => {
  try {
    if (!prisma.product) {
      console.error('Prisma Product model missing. Run: npx prisma generate')
      return res.status(500).json({ error: 'Server misconfiguration. Contact administrator.' })
    }
    const body = req.body || {}
    const status = body.status === 'published' ? 'published' : 'draft'
    const title = String(body.title || '').trim() || 'Fără titlu'
    const sku = String(body.sku || '').trim() || `SKU-${Date.now()}`
    const tipProdus = ['rezidential', 'industrial'].includes(body.tipProdus) ? body.tipProdus : 'rezidential'

    const salePrice = parseDecimal(body.salePrice, 0)
    const partnerSalePrice = parseDecimal(body.partnerSalePrice, 0)
    const vat = parseDecimal(body.vat, 19)

    const images = Array.isArray(body.images) ? body.images : []
    const documenteTehnice = Array.isArray(body.documenteTehnice) ? body.documenteTehnice : []
    const faq = Array.isArray(body.faq) ? body.faq : []
    const caseStudyExamples = parseProductCaseStudyExamples(body.caseStudyExamples)

    let baseSlug = slugify(title)
    let slug = baseSlug
    let suffix = 0
    while (true) {
      const existing = await prisma.product.findFirst({ where: { slug } })
      if (!existing) break
      slug = `${baseSlug}-${++suffix}`
    }

    const product = await prisma.product.create({
      data: {
        status,
        brand: body.brand?.trim() || null,
        title,
        slug,
        sku,
        description: body.description?.trim() || null,
        subtitle: body.subtitle?.trim() || null,
        overview: body.overview?.trim() || null,
        seoTitle: body.seoTitle != null && String(body.seoTitle).trim() ? String(body.seoTitle).trim() : null,
        seoDescription:
          body.seoDescription != null && String(body.seoDescription).trim()
            ? String(body.seoDescription).trim()
            : null,
        seoOgImage:
          body.seoOgImage != null && String(body.seoOgImage).trim() ? String(body.seoOgImage).trim() : null,
        tipProdus,
        categorie: body.categorie?.trim() || null,
        categoryId: body.categoryId?.trim() || null,
        priceVisibility: parsePriceVisibility(body.priceVisibility),
        pricePresentation: parsePricePresentation(body.pricePresentation),
        catalogStockStatus:
          tipProdus === 'rezidential' || tipProdus === 'industrial'
            ? parseCatalogStockStatus(body.catalogStockStatus) ?? 'in_stock'
            : null,
        catalogDeliveryBadge:
          tipProdus === 'rezidential' || tipProdus === 'industrial'
            ? parseCatalogDeliveryBadge(body.catalogDeliveryBadge) ?? '48h'
            : null,
        catalogTransportBadge:
          tipProdus === 'rezidential' || tipProdus === 'industrial'
            ? parseCatalogTransportBadge(body.catalogTransportBadge) ?? 'free'
            : null,
        catalogInstallBadge:
          tipProdus === 'industrial' ? parseCatalogInstallBadge(body.catalogInstallBadge) ?? 'baterino' : null,
        reducereProgramIds: tipProdus === 'rezidential' ? parseReducereProgramIds(body.reducereProgramIds) : [],
        promovarePeContClient: body.promovarePeContClient === true,
        promovarePeContPartener: body.promovarePeContPartener === true,
        landedPrice: 0,
        salePrice,
        partnerSalePrice,
        vat,
        energieNominala: body.energieNominala?.trim() || null,
        capacitate: body.capacitate?.trim() || null,
        curentMaxDescarcare: body.curentMaxDescarcare?.trim() || null,
        curentMaxIncarcare: body.curentMaxIncarcare?.trim() || null,
        cicluriDescarcare: body.cicluriDescarcare?.trim() || null,
        adancimeDescarcare: body.adancimeDescarcare?.trim() || null,
        greutate: body.greutate?.trim() || null,
        compozitie: body.compozitie?.trim() || null,
        dimensiuni: body.dimensiuni?.trim() || null,
        protectie: body.protectie?.trim() || null,
        conectivitateWifi: body.conectivitateWifi === true,
        conectivitateBluetooth: body.conectivitateBluetooth === true,
        protectieFoc: body.protectieFoc?.trim() || null,
        certificari: body.certificari?.trim() || null,
        garantie: body.garantie?.trim() || null,
        tensiuneNominala: body.tensiuneNominala?.trim() || null,
        locatieMontaj: body.locatieMontaj?.trim() || null,
        eficientaCiclu: body.eficientaCiclu?.trim() || null,
        temperaturaFunctionare: body.temperaturaFunctionare?.trim() || null,
        temperaturaStocare: body.temperaturaStocare?.trim() || null,
        umiditate: body.umiditate?.trim() || null,
        cardImage: typeof body.cardImage === 'string' && body.cardImage.trim() ? body.cardImage.trim() : null,
        images,
        keyAdvantages: Array.isArray(body.keyAdvantages) ? body.keyAdvantages : [],
        documenteTehnice,
        faq,
        caseStudyExamples,
        alimentaModalContent: body.alimentaModalContent && typeof body.alimentaModalContent === 'object' ? body.alimentaModalContent : null,
        technicalSpecsModels: (() => {
          const n = parseTechnicalSpecsModelsBody(body.technicalSpecsModels)
          return n === undefined ? null : n
        })(),
      },
    })
    return res.status(201).json(productToJson(product))
  } catch (err) {
    console.error('Create product error:', err)
    let errorMsg = 'Eroare la salvarea produsului.'
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') errorMsg = 'Există deja un produs cu acest SKU.'
      else if (err.code === 'P2003') errorMsg = 'Date invalide.'
    } else if (err?.message) errorMsg = err.message
    res.status(500).json({ error: errorMsg })
  }
}
app.post('/api/admin/products', authMiddleware, adminAuthMiddleware, createProductHandler)
app.post('/admin/products', authMiddleware, adminAuthMiddleware, createProductHandler)

// ── Admin: update product ───────────────────────────────────────────────
const updateProductHandler = async (req, res) => {
  try {
    const { id } = req.params
    const body = req.body || {}
    const status = body.status === 'published' ? 'published' : body.status === 'draft' ? 'draft' : undefined
    const title = String(body.title || '').trim() || undefined
    const sku = String(body.sku || '').trim() || undefined
    const tipProdus = ['rezidential', 'industrial'].includes(body.tipProdus) ? body.tipProdus : undefined

    const data = {}
    if (status !== undefined) data.status = status
    if (title) data.title = title
    if (sku) data.sku = sku
    if (tipProdus) data.tipProdus = tipProdus
    if (body.brand !== undefined) data.brand = body.brand?.trim() || null
    if (body.description !== undefined) data.description = body.description?.trim() || null
    if (body.subtitle !== undefined) data.subtitle = body.subtitle?.trim() || null
    if (body.overview !== undefined) data.overview = body.overview?.trim() || null
    if (body.seoTitle !== undefined) data.seoTitle = body.seoTitle != null && String(body.seoTitle).trim() ? String(body.seoTitle).trim() : null
    if (body.seoDescription !== undefined)
      data.seoDescription =
        body.seoDescription != null && String(body.seoDescription).trim()
          ? String(body.seoDescription).trim()
          : null
    if (body.seoOgImage !== undefined)
      data.seoOgImage = body.seoOgImage != null && String(body.seoOgImage).trim() ? String(body.seoOgImage).trim() : null
    if (body.categorie !== undefined) data.categorie = body.categorie?.trim() || null
    if (body.categoryId !== undefined) data.categoryId = body.categoryId?.trim() || null
    if (body.priceVisibility !== undefined) data.priceVisibility = parsePriceVisibility(body.priceVisibility)
    if (body.pricePresentation !== undefined) data.pricePresentation = parsePricePresentation(body.pricePresentation)
    if (body.landedPrice !== undefined) data.landedPrice = parseDecimal(body.landedPrice, 0)
    if (body.salePrice !== undefined) data.salePrice = parseDecimal(body.salePrice, 0)
    if (body.partnerSalePrice !== undefined) data.partnerSalePrice = parseDecimal(body.partnerSalePrice, 0)
    if (body.vat !== undefined) data.vat = parseDecimal(body.vat, 19)
    if (body.energieNominala !== undefined) data.energieNominala = body.energieNominala?.trim() || null
    if (body.capacitate !== undefined) data.capacitate = body.capacitate?.trim() || null
    if (body.curentMaxDescarcare !== undefined) data.curentMaxDescarcare = body.curentMaxDescarcare?.trim() || null
    if (body.curentMaxIncarcare !== undefined) data.curentMaxIncarcare = body.curentMaxIncarcare?.trim() || null
    if (body.cicluriDescarcare !== undefined) data.cicluriDescarcare = body.cicluriDescarcare?.trim() || null
    if (body.adancimeDescarcare !== undefined) data.adancimeDescarcare = body.adancimeDescarcare?.trim() || null
    if (body.greutate !== undefined) data.greutate = body.greutate?.trim() || null
    if (body.compozitie !== undefined) data.compozitie = body.compozitie?.trim() || null
    if (body.dimensiuni !== undefined) data.dimensiuni = body.dimensiuni?.trim() || null
    if (body.protectie !== undefined) data.protectie = body.protectie?.trim() || null
    if (body.conectivitateWifi !== undefined) data.conectivitateWifi = body.conectivitateWifi === true
    if (body.conectivitateBluetooth !== undefined) data.conectivitateBluetooth = body.conectivitateBluetooth === true
    if (body.protectieFoc !== undefined) data.protectieFoc = body.protectieFoc?.trim() || null
    if (body.certificari !== undefined) data.certificari = body.certificari?.trim() || null
    if (body.garantie !== undefined) data.garantie = body.garantie?.trim() || null
    if (body.tensiuneNominala !== undefined) data.tensiuneNominala = body.tensiuneNominala?.trim() || null
    if (body.locatieMontaj !== undefined) data.locatieMontaj = body.locatieMontaj?.trim() || null
    if (body.eficientaCiclu !== undefined) data.eficientaCiclu = body.eficientaCiclu?.trim() || null
    if (body.temperaturaFunctionare !== undefined) data.temperaturaFunctionare = body.temperaturaFunctionare?.trim() || null
    if (body.temperaturaStocare !== undefined) data.temperaturaStocare = body.temperaturaStocare?.trim() || null
    if (body.umiditate !== undefined) data.umiditate = body.umiditate?.trim() || null
    if (body.cardImage !== undefined) {
      data.cardImage = typeof body.cardImage === 'string' && body.cardImage.trim() ? body.cardImage.trim() : null
      console.log('[Product Update] cardImage ->', data.cardImage)
    }
    if (Array.isArray(body.images)) { data.images = body.images; console.log('[Product Update] images count ->', body.images.length, body.images[0] || '(empty)') }
    if (Array.isArray(body.keyAdvantages)) data.keyAdvantages = body.keyAdvantages
    if (Array.isArray(body.documenteTehnice)) data.documenteTehnice = body.documenteTehnice
    if (Array.isArray(body.faq)) data.faq = body.faq
    if (Array.isArray(body.caseStudyExamples)) data.caseStudyExamples = parseProductCaseStudyExamples(body.caseStudyExamples)
    if (body.alimentaModalContent !== undefined) {
      data.alimentaModalContent = body.alimentaModalContent && typeof body.alimentaModalContent === 'object' ? body.alimentaModalContent : null
    }
    if (body.technicalSpecsModels !== undefined) {
      if (body.technicalSpecsModels === null) {
        data.technicalSpecsModels = null
      } else {
        const n = parseTechnicalSpecsModelsBody(body.technicalSpecsModels)
        if (n !== undefined) data.technicalSpecsModels = n
      }
    }

    if (tipProdus === 'industrial') {
      data.reducereProgramIds = []
    } else if (tipProdus === 'rezidential') {
      data.catalogInstallBadge = null
    }

    if (body.catalogStockStatus !== undefined) {
      let rowTip = tipProdus
      if (!rowTip) {
        const ex = await prisma.product.findUnique({ where: { id }, select: { tipProdus: true } })
        rowTip = ex?.tipProdus
      }
      if (rowTip === 'rezidential' || rowTip === 'industrial') {
        data.catalogStockStatus = parseCatalogStockStatus(body.catalogStockStatus) ?? 'in_stock'
      }
    }

    if (body.catalogDeliveryBadge !== undefined) {
      let rowTip = tipProdus
      if (!rowTip) {
        const ex = await prisma.product.findUnique({ where: { id }, select: { tipProdus: true } })
        rowTip = ex?.tipProdus
      }
      if (rowTip === 'rezidential' || rowTip === 'industrial') {
        data.catalogDeliveryBadge = parseCatalogDeliveryBadge(body.catalogDeliveryBadge) ?? '48h'
      }
    }

    if (body.catalogTransportBadge !== undefined) {
      let rowTip = tipProdus
      if (!rowTip) {
        const ex = await prisma.product.findUnique({ where: { id }, select: { tipProdus: true } })
        rowTip = ex?.tipProdus
      }
      if (rowTip === 'rezidential' || rowTip === 'industrial') {
        data.catalogTransportBadge = parseCatalogTransportBadge(body.catalogTransportBadge) ?? 'free'
      }
    }

    if (body.catalogInstallBadge !== undefined) {
      let rowTip = tipProdus
      if (!rowTip) {
        const ex = await prisma.product.findUnique({ where: { id }, select: { tipProdus: true } })
        rowTip = ex?.tipProdus
      }
      if (rowTip === 'industrial') {
        data.catalogInstallBadge = parseCatalogInstallBadge(body.catalogInstallBadge) ?? 'baterino'
      } else if (rowTip === 'rezidential') {
        data.catalogInstallBadge = null
      }
    }

    if (body.reducereProgramIds !== undefined && tipProdus !== 'industrial') {
      let rowTip = tipProdus
      if (!rowTip) {
        const ex = await prisma.product.findUnique({ where: { id }, select: { tipProdus: true } })
        rowTip = ex?.tipProdus
      }
      if (rowTip === 'rezidential') {
        data.reducereProgramIds = parseReducereProgramIds(body.reducereProgramIds)
      }
    }

    if (body.promovarePeContClient !== undefined)
      data.promovarePeContClient = body.promovarePeContClient === true
    if (body.promovarePeContPartener !== undefined)
      data.promovarePeContPartener = body.promovarePeContPartener === true

    const explicitSlug = body.slug != null ? slugify(String(body.slug)) : null
    if (explicitSlug) {
      const existing = await prisma.product.findFirst({ where: { slug: explicitSlug } })
      if (existing && existing.id !== id) {
        return res.status(409).json({ error: `Slug-ul „${explicitSlug}" este deja folosit de alt produs.` })
      }
      data.slug = explicitSlug
    } else if (title) {
      let baseSlug = slugify(title)
      let newSlug = baseSlug
      let suffix = 0
      while (true) {
        const existing = await prisma.product.findFirst({ where: { slug: newSlug } })
        if (!existing || existing.id === id) break
        newSlug = `${baseSlug}-${++suffix}`
      }
      data.slug = newSlug
    }

    const product = await prisma.product.update({
      where: { id },
      data,
    })
    return res.json(productToJson(product))
  } catch (err) {
    console.error('Update product error:', err)
    let errorMsg = 'Eroare la actualizare.'
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') errorMsg = 'Produs negăsit.'
      else if (err.code === 'P2002') errorMsg = 'Există deja un produs cu acest SKU.'
      else if (err.code === 'P2003') errorMsg = 'Date invalide.'
    } else if (err?.message) errorMsg = err.message
    res.status(500).json({ error: errorMsg })
  }
}
app.put('/api/admin/products/:id', authMiddleware, adminAuthMiddleware, updateProductHandler)
app.patch('/api/admin/products/:id', authMiddleware, adminAuthMiddleware, updateProductHandler)
app.put('/admin/products/:id', authMiddleware, adminAuthMiddleware, updateProductHandler)
app.patch('/admin/products/:id', authMiddleware, adminAuthMiddleware, updateProductHandler)

// ── Public: contact form inquiry (no auth) ───────────────────────────────
app.post('/api/inquiries', async (req, res) => {
  try {
    const body = req.body || {}
    const name = String(body.name || '').trim()
    const company = String(body.company || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const domain = body.domain
    const requestType = body.requestType
    const message = String(body.message || '').trim()

    if (!name || !company || !email || !domain || !requestType || !message) {
      return res.status(400).json({ error: 'Toate câmpurile sunt obligatorii.' })
    }

    const validDomains = ['rezidential', 'industrial', 'medical', 'maritim']
    const validRequestTypes = ['sales', 'technical', 'service', 'partnership']
    if (!validDomains.includes(domain)) {
      return res.status(400).json({ error: 'Divizie invalidă.' })
    }
    if (!validRequestTypes.includes(requestType)) {
      return res.status(400).json({ error: 'Tip solicitare invalid.' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email invalid.' })
    }

    const ip = (req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip || req.socket?.remoteAddress || '')
      .split(',')[0]
      .trim() || null

    const inquiry = await prisma.inquiry.create({
      data: { name, company, email, domain, requestType, message, ip },
    })

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const shortId = inquiry.id.slice(-8).toUpperCase()
    const registrationNumber = `BTR-${today}-${shortId}`

    await prisma.inquiry.update({
      where: { id: inquiry.id },
      data: { registrationNumber },
    })

    const inquiryWithReg = { ...inquiry, registrationNumber }

    sendInquiryNotification(inquiryWithReg).catch((e) => console.error('[Inquiry] Notification error:', e?.message))
    sendInquiryConfirmation(inquiryWithReg).catch((e) => console.error('[Inquiry] Confirmation error:', e?.message))

    return res.status(201).json({
      message: 'Solicitarea a fost trimisă. Vei primi un email de confirmare.',
      registrationNumber,
    })
  } catch (err) {
    console.error('Inquiry error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la trimiterea solicitării.' })
  }
})

const RETUR_CONDITION_PHOTO_MIN = 2
const RETUR_CONDITION_PHOTO_MAX = 6
const RETUR_REASONS = new Set(['withdrawal', 'defective', 'not_as_described', 'damaged_delivery', 'other'])

/** Acceptă doar JPEG pentru fotografii retur (browser trimite de obicei image/jpeg). */
function isReturJpegPhoto(f) {
  const m = String(f.mimetype || '').toLowerCase()
  if (m === 'image/jpeg' || m === 'image/jpg' || m === 'image/pjpeg') return true
  const n = String(f.originalname || '').toLowerCase()
  return n.endsWith('.jpg') || n.endsWith('.jpeg')
}

function isValidDdMmYyyyRetur(s) {
  const t = String(s || '').trim()
  if (!/^\d{2}-\d{2}-\d{4}$/.test(t)) return false
  const [dd, mm, yyyy] = t.split('-').map(Number)
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return false
  const d = new Date(yyyy, mm - 1, dd)
  return d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd
}

function parseBoolField(v) {
  if (v === true) return true
  if (v === false) return false
  const s = String(v ?? '').toLowerCase().trim()
  return s === 'true' || s === '1' || s === 'on' || s === 'yes'
}

function normalizeIbanRetur(raw) {
  return String(raw || '')
    .replace(/\s+/g, '')
    .toUpperCase()
}

function isValidRoIbanRetur(raw) {
  return /^RO\d{2}[A-Z0-9]{20}$/.test(normalizeIbanRetur(raw))
}

async function loadClientSnapshotForRetur(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, email: true, phone: true },
  })
  const profile = await prisma.clientProfile.findUnique({
    where: { userId },
    select: {
      firstName: true,
      lastName: true,
      phone: true,
      billAddress: true,
      billCounty: true,
      billCity: true,
      billPostal: true,
    },
  })
  return {
    firstName: String(profile?.firstName || user?.firstName || '').trim(),
    lastName: String(profile?.lastName || user?.lastName || '').trim(),
    email: String(user?.email || '').trim().toLowerCase(),
    phone: String(profile?.phone || user?.phone || '').trim(),
    street: String(profile?.billAddress || '').trim(),
    county: String(profile?.billCounty || '').trim(),
    city: String(profile?.billCity || '').trim(),
    postal: String(profile?.billPostal || '')
      .replace(/\D/g, '')
      .slice(0, 6),
  }
}

app.options('/api/retur', (_req, res) => res.status(204).end())

/**
 * Public: cerere retur (multipart). Câmpuri text în body + între 2 și 6 fișiere `photos` (JPEG .jpg / .jpeg).
 * Opțional `Authorization: Bearer` pentru client — datele de contact se completează din profil dacă lipsesc.
 */
app.post(
  '/api/retur',
  optionalAuthMiddleware,
  returUploadMiddleware.array('photos', RETUR_CONDITION_PHOTO_MAX),
  async (req, res) => {
    try {
      if (!isR2Configured()) {
        return res.status(503).json({ error: 'Stocarea fișierelor (R2) nu este configurată.' })
      }

      const files = Array.isArray(req.files) ? req.files : []
      if (files.length < RETUR_CONDITION_PHOTO_MIN || files.length > RETUR_CONDITION_PHOTO_MAX) {
        return res.status(400).json({
          error: `Încarcă între ${RETUR_CONDITION_PHOTO_MIN} și ${RETUR_CONDITION_PHOTO_MAX} fotografii JPEG (.jpg sau .jpeg).`,
          code: 'retur_photos_count',
        })
      }
      if (!files.every((f) => isReturJpegPhoto(f))) {
        return res.status(400).json({
          error: 'Sunt permise doar fișiere JPEG (.jpg sau .jpeg).',
          code: 'retur_photos_type',
        })
      }
      const imageFiles = files

      const b = req.body || {}
      const str = (k) => String(b[k] ?? '').trim()

      let lastName = str('lastName')
      let firstName = str('firstName')
      let street = str('street')
      let county = str('county')
      let city = str('city')
      let postal = normalizeRoPostalCode(str('postal')) || ''
      let phone = str('phone')
      let email = str('email').toLowerCase()

      let userIdToStore = null
      let submitSource = 'guest'
      if (req.userId && req.userRole === 'client') {
        submitSource = 'client'
        userIdToStore = req.userId
        const snap = await loadClientSnapshotForRetur(req.userId)
        if (!lastName) lastName = snap.lastName
        if (!firstName) firstName = snap.firstName
        if (!street) street = snap.street
        if (!county) county = snap.county
        if (!city) city = snap.city
        if (!postal) postal = snap.postal
        if (!phone) phone = snap.phone
        if (!email) email = snap.email
      }

      const nameRe = /^[\p{L}\s'\-]+$/u
      if (!lastName || !firstName || lastName.length < 2 || firstName.length < 2) {
        return res.status(400).json({ error: 'Nume și prenume invalide sau lipsă.' })
      }
      if (!nameRe.test(lastName) || !nameRe.test(firstName)) {
        return res.status(400).json({ error: 'Nume și prenume conțin caractere nepermise.' })
      }
      if (!street || street.length < 3 || !county || !city || !/^\d{6}$/.test(postal)) {
        return res.status(400).json({ error: 'Adresa de contact este incompletă sau codul poștal nu are 6 cifre.' })
      }
      const digitsPhone = phone.replace(/\D/g, '')
      if (digitsPhone.length < 9) {
        return res.status(400).json({ error: 'Telefon invalid.' })
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Email invalid.' })
      }

      const orderNumber = str('orderNumber')
      const receiptDate = str('receiptDate')
      const serialNumber = str('serialNumber')
      const productBrand = str('productBrand')
      const productModel = str('productModel')
      if (!orderNumber || !receiptDate || !serialNumber || !productBrand || !productModel) {
        return res.status(400).json({ error: 'Completează detaliile despre comandă și produs.' })
      }
      if (!isValidDdMmYyyyRetur(receiptDate)) {
        return res.status(400).json({ error: 'Data recepției nu este validă (format zz-ll-aaaa).' })
      }

      const returnReason = str('returnReason')
      if (!RETUR_REASONS.has(returnReason)) {
        return res.status(400).json({ error: 'Motiv retur invalid.' })
      }
      let returnReasonOther = str('returnReasonOther')
      if (returnReason === 'other' && returnReasonOther.length < 3) {
        return res.status(400).json({ error: 'Completează descrierea pentru „Alt motiv”.' })
      }
      if (returnReasonOther.length > 4000) {
        return res.status(400).json({ error: 'Descrierea motivului este prea lungă.' })
      }
      if (returnReason !== 'other') returnReasonOther = ''

      const condUninstalled = parseBoolField(b.condUninstalled)
      const condSeals = parseBoolField(b.condSeals)
      const condPackaging = parseBoolField(b.condPackaging)
      if (!condUninstalled && !condSeals && !condPackaging) {
        return res.status(400).json({ error: 'Bifează cel puțin o declarație despre starea produsului.' })
      }

      const pickupStreet = str('pickupStreet')
      const pickupCounty = str('pickupCounty')
      const pickupCity = str('pickupCity')
      const pickupPostal = normalizeRoPostalCode(str('pickupPostal')) || ''
      if (!pickupStreet || pickupStreet.length < 3 || !pickupCounty || !pickupCity || !/^\d{6}$/.test(pickupPostal)) {
        return res.status(400).json({ error: 'Adresa de preluare este incompletă sau codul poștal nu are 6 cifre.' })
      }

      const refundTitular = str('refundTitular')
      const refundIbanRaw = str('refundIban')
      if (!refundTitular || refundTitular.length < 2) {
        return res.status(400).json({ error: 'Titular cont invalid.' })
      }
      const titRe = /^[\p{L}\p{N}\s'\-.,()/&]+$/u
      if (!titRe.test(refundTitular)) {
        return res.status(400).json({ error: 'Titular cont conține caractere nepermise.' })
      }
      if (!isValidRoIbanRetur(refundIbanRaw)) {
        return res.status(400).json({ error: 'IBAN invalid (format RO + 22 caractere).' })
      }
      const refundIban = normalizeIbanRetur(refundIbanRaw)

      const policyAccepted = parseBoolField(b.policyAccepted)
      const declarationAccepted = parseBoolField(b.declarationAccepted)
      if (!policyAccepted || !declarationAccepted) {
        return res.status(400).json({ error: 'Confirmă politica de retur și declarația de corectitudine.' })
      }

      let locale = str('locale') || 'ro'
      if (!['ro', 'en', 'zh'].includes(locale)) locale = 'ro'

      const created = await prisma.retur.create({
        data: {
          userId: userIdToStore,
          submitSource,
          lastName,
          firstName,
          street,
          county,
          city,
          postal,
          phone,
          email,
          orderNumber,
          receiptDate,
          serialNumber,
          productBrand,
          productModel,
          returnReason,
          returnReasonOther,
          condUninstalled,
          condSeals,
          condPackaging,
          pickupStreet,
          pickupCounty,
          pickupCity,
          pickupPostal,
          refundTitular,
          refundIban,
          policyAccepted,
          declarationAccepted,
          locale,
          conditionPhotoUrls: [],
          status: 'pending',
        },
      })

      await recordConsentLogs(prisma, req, [
        { userId: userIdToStore ?? null, consentType: CONSENT_TYPES.RETURN_POLICY, granted: true },
        { userId: userIdToStore ?? null, consentType: CONSENT_TYPES.RETURN_DECLARATION, granted: true },
      ])

      const returId = created.id
      const photoUrls = []
      const uploadedKeys = []
      try {
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i]
          const key = buildReturConditionPhotoKey(orderNumber, returId, i + 1, file.mimetype)
          const url = await uploadToR2(file.buffer, key, file.mimetype)
          uploadedKeys.push(key)
          photoUrls.push(url)
        }
        await prisma.retur.update({
          where: { id: returId },
          data: { conditionPhotoUrls: photoUrls },
        })
      } catch (uploadErr) {
        for (const key of uploadedKeys) {
          await deleteFromR2(key).catch(() => {})
        }
        await prisma.retur.delete({ where: { id: returId } }).catch(() => {})
        console.error('[Retur] Upload rollback:', uploadErr)
        return res.status(500).json({ error: 'Nu am putut salva fotografiile. Încearcă din nou.' })
      }

      const registrationNumber = formatReturRegistrationNumber(returId)
      sendReturRequestReceivedEmail({
        email,
        locale,
        registrationNumber,
        firstName,
        orderNumber,
        productBrand,
        productModel,
      }).catch((e) => console.error('[Retur] Confirmation email error:', e?.message || e))

      return res.status(201).json({
        id: returId,
        registrationNumber,
        message: 'Cererea de retur a fost înregistrată.',
      })
    } catch (err) {
      console.error('Retur submit error:', err)
      return res.status(500).json({ error: err?.message || 'Eroare la înregistrarea cererii de retur.' })
    }
  },
)

/**
 * După plasarea unei comenzi rezidențiale: generează proforma PDF, o salvează în R2
 * (pentru reutilizare în „cont/comenzi”) și trimite confirmarea pe email cu PDF atașat.
 *
 * Rulează în fundal; nu blocăm răspunsul HTTP. Erorile sunt doar logate.
 *
 * @param {{ id: string, orderNumber: string, email: string, lines: Array<any> } & Record<string, any>} order
 */
async function dispatchOrderProformaEmail(order) {
  if (!order || !order.email) return
  try {
    const [company, generalPhoneRow, residentialPhoneRow] = await Promise.all([
      readCompanyDataFromDb(),
      prisma.departmentPhone.findUnique({ where: { department: 'general' } }).catch(() => null),
      prisma.departmentPhone.findUnique({ where: { department: 'rezidential' } }).catch(() => null),
    ])
    const supplierPhone =
      String(generalPhoneRow?.phone || '').trim() ||
      String(process.env.BATERINO_OFFICE_PHONE || '').trim()
    const supplierSupportPhone =
      String(residentialPhoneRow?.phone || '').trim() ||
      String(process.env.BATERINO_SUPPORT_PHONE || '').trim()

    const issueDate = new Date()
    const proformaLib = getProformaTemplateLib()
    const html = await proformaLib.buildResidentialOrderProformaHtml(order, company, {
      supplierPhone,
      supplierSupportPhone,
      proformaIssueDate: issueDate,
    })

    const pdfBuffer = await renderWarrantyPdf(html)
    if (
      !Buffer.isBuffer(pdfBuffer) ||
      pdfBuffer.length < 5 ||
      pdfBuffer.slice(0, 5).toString('latin1') !== '%PDF-'
    ) {
      throw new Error('Proforma PDF invalidă (lipsă header %PDF-).')
    }

    const safeNum = String(order.orderNumber || 'comanda').replace(/[^\w.-]+/g, '_')
    const pdfFilename = `proforma-${safeNum}.pdf`

    // Best-effort upload în R2 (dacă e configurat) — nu blocăm trimiterea emailului dacă eșuează.
    let proformaUrl = ''
    if (isR2Configured()) {
      try {
        const key = proformaPdfKey(order.id, order.orderNumber)
        proformaUrl = await uploadToR2(pdfBuffer, key, 'application/pdf', {
          contentDisposition: `attachment; filename="${pdfFilename}"`,
          cacheControl: 'no-cache, max-age=0, must-revalidate',
        })
        await prisma.residentialOrder
          .update({ where: { id: order.id }, data: { proformaUrl } })
          .catch((e) => console.error('[GuestOrder] proformaUrl persist error:', e?.message || e))
      } catch (e) {
        console.error('[GuestOrder] Proforma R2 upload error:', e?.message || e)
      }
    }

    const accounts = Array.isArray(company?.bankAccounts) ? company.bankAccounts : []
    const ronAccount = proformaLib.pickBankAccountByCurrency(accounts, 'RON') || accounts[0] || null
    const supplierCui = company?.cui
      ? `RO${String(company.cui).replace(/^RO/i, '').trim()}`
      : ''

    const linesArr = Array.isArray(order.lines) ? order.lines : []
    const totalIncl = linesArr.reduce(
      (s, L) => s + (Number(L.lineTotalInclVat) || Number(L.unitPriceInclVat) * Number(L.quantity) || 0),
      0,
    )

    const { paymentDueStr } = proformaLib.proformaIssueAndPaymentDueStrings
      ? proformaLib.proformaIssueAndPaymentDueStrings(issueDate)
      : (() => {
          const due = new Date(issueDate)
          due.setDate(due.getDate() + 30)
          const dd = String(due.getDate()).padStart(2, '0')
          const mm = String(due.getMonth() + 1).padStart(2, '0')
          return { paymentDueStr: `${dd}/${mm}/${due.getFullYear()}` }
        })()

    await sendResidentialOrderProformaEmail({
      to: order.email,
      order,
      lines: linesArr,
      currency: order.currency || 'RON',
      supplier: {
        name: String(company?.name || '').trim(),
        cui: supplierCui,
        ibanRon: String(ronAccount?.iban || '').trim(),
        bankName: String(ronAccount?.bankName || '').trim(),
      },
      payment: {
        reference: order.orderNumber || '',
        paymentDueStr: paymentDueStr || '',
      },
      totalIncl,
      pdfBuffer,
      pdfFilename,
    })
  } catch (err) {
    console.error('[GuestOrder] dispatchOrderProformaEmail error:', err?.message || err)
  }
}

// `proformaIssueAndPaymentDueStrings` nu este exportat de modulul template; folosim un fallback local.
// (helperul de mai sus încearcă întâi metoda exportată dacă apare în viitor.)

// ── Public: guest residential checkout — persist order (track by orderNumber + email) ──
// Acceptă `items: [{ productIdOrSlug, quantity }]` (coș) sau câmpurile vechi produs unic.
app.post('/api/guest-residential-orders', async (req, res) => {
  try {
    const body = req.body || {}
    const authPayload = readOptionalAuthPayload(req)
    const role = authPayload?.role
    const isClient = role === 'client'
    const isPartener = role === 'partener'
    const orderSource = isClient ? 'client' : isPartener ? 'partner' : 'guest'
    const userIdForOrder =
      (isClient || isPartener) && authPayload?.userId ? String(authPayload.userId) : null

    const emailRaw = String(body.email || '').trim().toLowerCase()
    const phoneRaw = normalizeE164Phone(body.phone)
    const lastName = sanitizeGuestOrderPersonName(body.nume ?? body.lastName)
    const firstName = sanitizeGuestOrderPersonName(body.prenume ?? body.firstName)
    const buyerType = body.buyerType === 'company' ? 'company' : 'person'
    const companyName = buyerType === 'company' ? sanitizeGuestOrderText(body.companyName) : ''
    const companyCui = buyerType === 'company' ? sanitizeCompanyCui(body.companyCui) : ''
    const companyAddress = buyerType === 'company' ? sanitizeGuestOrderText(body.companyAddress) : ''
    const companyCounty = buyerType === 'company' ? sanitizeGuestOrderText(body.companyCounty) : ''
    const companyCity = buyerType === 'company' ? sanitizeGuestOrderText(body.companyCity) : ''
    const companyPostal = buyerType === 'company' ? sanitizeGuestOrderPostal(body.companyPostal) : ''
    // Pasul 3 din checkout: pentru PF este adresa de livrare/facturare, pentru PJ este STRICT adresa de livrare.
    const inputAddress = sanitizeGuestOrderText(body.billAddress)
    const inputCounty = sanitizeGuestOrderText(body.billCounty)
    const inputCity = sanitizeGuestOrderText(body.billCity)
    const inputPostal = sanitizeGuestOrderPostal(body.billPostal)
    let billAddress = inputAddress
    let billCounty = inputCounty
    let billCity = inputCity
    let billPostal = inputPostal
    let deliveryDifferent = Boolean(body.differentDeliveryAddress ?? body.deliveryDifferent)
    let delAddress = body.delAddress != null ? sanitizeGuestOrderText(body.delAddress) : ''
    let delCounty = body.delCounty != null ? sanitizeGuestOrderText(body.delCounty) : ''
    let delCity = body.delCity != null ? sanitizeGuestOrderText(body.delCity) : ''
    let delPostal = body.delPostal != null ? sanitizeGuestOrderPostal(body.delPostal) : ''
    if (buyerType === 'company') {
      // Factură pe firmă: bill* = sediul/punctul de facturare (=companyAddress), del* = adresa Pas 3.
      billAddress = companyAddress
      billCounty = companyCounty
      billCity = companyCity
      billPostal = companyPostal
      delAddress = inputAddress
      delCounty = inputCounty
      delCity = inputCity
      delPostal = inputPostal
      deliveryDifferent = true
    }

    const parsedItems = normalizeCheckoutItems(body)
    if (parsedItems.length === 0) {
      return res.status(400).json({ error: 'Adaugă cel puțin un produs.' })
    }
    if (parsedItems.length > 40) {
      return res.status(400).json({ error: 'Prea multe linii în comandă.' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailRaw)) {
      return res.status(400).json({ error: 'Email invalid.' })
    }
    /** Pentru client / partener autentificat, emailul din cont (JWT) — legătură reală în DB. */
    let emailToStore = emailRaw
    if (isClient || isPartener) {
      const tokenEmail = String(authPayload.email || '').trim().toLowerCase()
      if (!tokenEmail || !emailRegex.test(tokenEmail)) {
        return res.status(401).json({
          error: isClient
            ? 'Sesiune invalidă. Autentifică-te din nou ca și client.'
            : 'Sesiune invalidă. Autentifică-te din nou ca și partener.',
        })
      }
      emailToStore = tokenEmail
    }
    if (!phoneRaw) {
      return res.status(400).json({ error: 'Telefon invalid.' })
    }
    if (!lastName || !firstName) {
      return res.status(400).json({ error: 'Nume și prenume sunt obligatorii.' })
    }
    if (buyerType === 'company') {
      if (!companyName || !companyCui || !companyAddress || !companyCounty || !companyCity || !companyPostal) {
        return res.status(400).json({ error: 'Datele firmei sunt incomplete.' })
      }
      if (!delAddress || !delCounty || !delCity || !delPostal) {
        return res.status(400).json({ error: 'Adresa de livrare este incompletă.' })
      }
    } else {
      if (!billAddress || !billCounty || !billCity || !billPostal) {
        return res.status(400).json({ error: 'Adresa de facturare este incompletă.' })
      }
      if (deliveryDifferent) {
        if (!delAddress || !delCounty || !delCity || !delPostal) {
          return res.status(400).json({ error: 'Adresa de livrare este incompletă.' })
        }
      } else {
        delAddress = null
        delCounty = null
        delCity = null
        delPostal = null
      }
    }

    let partnerCatalogDiscountFactor = 0
    if (isPartener && userIdForOrder) {
      try {
        const part = await prisma.partner.findUnique({
          where: { userId: userIdForOrder },
          select: { partnerDiscountPercent: true },
        })
        const pct = part?.partnerDiscountPercent
        if (pct != null && Number.isFinite(Number(pct)) && Number(pct) > 0) {
          partnerCatalogDiscountFactor = Math.min(1, Math.max(0, Number(pct) / 100))
        }
      } catch (_) {
        partnerCatalogDiscountFactor = 0
      }
    }

    const linePayloads = []
    for (const it of parsedItems) {
      const row = await findPublicProductRecordByIdOrSlug(it.productIdOrSlug)
      if (!row) {
        return res.status(404).json({ error: `Produs negăsit: ${it.productIdOrSlug}.` })
      }
      const apiProduct = applyPublicPricePolicy(productToJson(row), authPayload)
      const eligible = isPartener
        ? partnerCatalogCheckoutProductEligible(apiProduct)
        : guestResidentialProductEligible(apiProduct)
      if (!eligible) {
        return res.status(400).json({
          error: isPartener
            ? 'Unul sau mai multe produse din coș nu pot fi comandate (preț indisponibil sau stoc).'
            : 'Unul sau mai multe produse nu pot fi comandate în fluxul public.',
        })
      }
      let discountFactor = 0
      if (it.reducereProgramId) {
        try {
          discountFactor = await resolveGuestLineDiscountFactor(row, it.reducereProgramId)
        } catch (e) {
          return res.status(400).json({ error: e?.message || 'Reducere invalidă.' })
        }
      } else if (isPartener && partnerCatalogDiscountFactor > 0) {
        discountFactor = partnerCatalogDiscountFactor
      }
      const qParsed = Math.min(99, Math.max(1, parseInt(String(it.quantity), 10) || 1))
      if (it.reducereProgramId && qParsed > 1) {
        return res.status(400).json({
          error:
            'Cu program de reducere se poate comanda maximum 1 bucată per produs. Actualizează coșul și încearcă din nou.',
        })
      }
      const baseTotals = computeGuestResidentialLineTotals(apiProduct, it.quantity, {
        usePartnerPrice: isPartener,
      })
      const totals = applyDiscountFactorToGuestLineTotals(baseTotals, discountFactor)
      const listTotals =
        discountFactor > 0 ? applyDiscountFactorToGuestLineTotals(baseTotals, 0) : null
      const title = String(apiProduct.title || '').trim() || 'Produs'
      const slugVal = apiProduct.slug != null && String(apiProduct.slug).trim() ? String(apiProduct.slug).trim() : null
      linePayloads.push({
        productId: row.id,
        productSlug: slugVal,
        productTitle: title,
        quantity: totals.quantity,
        unitPriceInclVat: totals.unitPriceInclVat.toFixed(2),
        lineTotalInclVat: totals.lineTotalInclVat.toFixed(2),
        listUnitPriceInclVat:
          listTotals != null ? listTotals.unitPriceInclVat.toFixed(2) : null,
        listLineTotalInclVat:
          listTotals != null ? listTotals.lineTotalInclVat.toFixed(2) : null,
        vatPercent: totals.vatPercent != null ? totals.vatPercent.toFixed(2) : null,
      })
    }

    const currency = await readCatalogCurrencyFromDb()
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const orderSuffix = crypto.randomBytes(4).toString('hex').toUpperCase()
    const orderNumber = `BTO-${today}-${orderSuffix}`

    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.residentialOrder.create({
        data: {
          orderNumber,
          orderSource,
          userId: userIdForOrder,
          email: emailToStore,
          phone: phoneRaw,
          lastName,
          firstName,
          billAddress,
          billCounty,
          billCity,
          billPostal,
          deliveryDifferent,
          delAddress,
          delCounty,
          delCity,
          delPostal,
          buyerType,
          companyName: buyerType === 'company' ? companyName : null,
          companyCui: buyerType === 'company' ? companyCui : null,
          companyAddress: buyerType === 'company' ? companyAddress : null,
          companyCounty: buyerType === 'company' ? companyCounty : null,
          companyCity: buyerType === 'company' ? companyCity : null,
          companyPostal: buyerType === 'company' ? companyPostal : null,
          currency,
          lines: {
            create: linePayloads.map((L) => ({
              productId: L.productId,
              productSlug: L.productSlug,
              productTitle: L.productTitle,
              quantity: L.quantity,
              unitPriceInclVat: L.unitPriceInclVat,
              lineTotalInclVat: L.lineTotalInclVat,
              listUnitPriceInclVat: L.listUnitPriceInclVat,
              listLineTotalInclVat: L.listLineTotalInclVat,
              vatPercent: L.vatPercent,
            })),
          },
        },
        include: { lines: { orderBy: { id: 'asc' } } },
      })
      return order
    })

    if (isR2Configured()) {
      ensureGuestOrderFolder(createdOrder.id).catch((e) =>
        console.error('[GuestOrder] R2 orders folder error:', e?.message || e),
      )
    }

    // Generează proforma + trimite emailul în fundal — fără să blocheze răspunsul HTTP.
    dispatchOrderProformaEmail(createdOrder).catch((e) =>
      console.error('[GuestOrder] Proforma email dispatch error:', e?.message || e),
    )

    return res.status(201).json({
      orderNumber,
      orderId: createdOrder.id,
      email: emailToStore,
      orderSource,
      message: 'Comanda a fost înregistrată.',
    })
  } catch (err) {
    console.error('Guest residential order error:', err)
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return res.status(409).json({ error: 'Conflict la generarea numărului de comandă. Reîncearcă.' })
    }
    res.status(500).json({ error: err?.message || 'Eroare la înregistrarea comenzii.' })
  }
})

function mapLegacyGuestRowAdmin(r) {
  const base = mapLegacyGuestOrderToClientJson(r)
  const first = base.lines[0]
  return {
    ...base,
    clientInvoiceUrl: r.clientInvoiceUrl ? String(r.clientInvoiceUrl) : null,
    proformaUrl: r.proformaUrl ? String(r.proformaUrl) : null,
    productId: first?.productId,
    productSlug: first?.productSlug,
    productTitle: first?.productTitle,
    quantity: first?.quantity ?? r.quantity,
    unitPriceInclVat: first?.unitPriceInclVat,
    lineTotalInclVat: base.orderTotalInclVat,
    vatPercent: first?.vatPercent,
  }
}

function mapResidentialRowAdmin(o) {
  const base = mapResidentialOrderToClientJson(o)
  const first = base.lines[0]
  return {
    ...base,
    clientInvoiceUrl: o.clientInvoiceUrl ? String(o.clientInvoiceUrl) : null,
    proformaUrl: o.proformaUrl ? String(o.proformaUrl) : null,
    productId: first?.productId,
    productSlug: first?.productSlug,
    productTitle:
      base.lines.length > 1 ? `${first?.productTitle || '—'} (+${base.lines.length - 1})` : first?.productTitle,
    quantity: base.lines.reduce((s, L) => s + (L.quantity || 0), 0),
    unitPriceInclVat: first?.unitPriceInclVat,
    lineTotalInclVat: base.orderTotalInclVat,
    vatPercent: first?.vatPercent,
  }
}

/** Agregate comenzi rezidențiale pentru dashboard admin (fără listă completă). */
const adminOrdersDashboardSummaryHandler = async (req, res) => {
  try {
    const NEW_STATUS = 'de_platit'
    const [
      resNewBySource,
      legNewBySource,
      resByStatus,
      legByStatus,
    ] = await Promise.all([
      prisma.residentialOrder.groupBy({
        by: ['orderSource'],
        where: { fulfillmentStatus: NEW_STATUS },
        _count: { _all: true },
      }),
      prisma.guestResidentialOrder.groupBy({
        by: ['orderSource'],
        where: { fulfillmentStatus: NEW_STATUS },
        _count: { _all: true },
      }),
      prisma.residentialOrder.groupBy({
        by: ['fulfillmentStatus'],
        _count: { _all: true },
      }),
      prisma.guestResidentialOrder.groupBy({
        by: ['fulfillmentStatus'],
        _count: { _all: true },
      }),
    ])
    const bucketSource = (src) => {
      const s = String(src || 'guest').toLowerCase()
      if (s === 'client') return 'client'
      if (s === 'partner' || s === 'partener') return 'partner'
      return 'guest'
    }
    const newBySource = { client: 0, partner: 0, guest: 0 }
    for (const row of resNewBySource) {
      const k = bucketSource(row.orderSource)
      newBySource[k] += row._count._all
    }
    for (const row of legNewBySource) {
      const k = bucketSource(row.orderSource)
      newBySource[k] += row._count._all
    }
    const newOrdersTotal = newBySource.client + newBySource.partner + newBySource.guest
    const byFulfillmentStatus = {}
    for (const row of resByStatus) {
      const st = String(row.fulfillmentStatus || 'de_platit')
      byFulfillmentStatus[st] = (byFulfillmentStatus[st] || 0) + row._count._all
    }
    for (const row of legByStatus) {
      const st = String(row.fulfillmentStatus || 'de_platit')
      byFulfillmentStatus[st] = (byFulfillmentStatus[st] || 0) + row._count._all
    }
    res.set('Cache-Control', 'no-store')
    return res.json({
      newOrders: {
        total: newOrdersTotal,
        client: newBySource.client,
        partner: newBySource.partner,
        guest: newBySource.guest,
      },
      byFulfillmentStatus,
    })
  } catch (err) {
    console.error('Admin orders dashboard summary error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la agregate comenzi.' })
  }
}

/** Agregate cereri service + retur pentru dashboard admin (status „noi”). */
const adminServiceDashboardSummaryHandler = async (req, res) => {
  try {
    const [serviceOpen, returPending] = await Promise.all([
      prisma.serviceRequest.count({ where: { status: 'open' } }),
      prisma.retur.count({ where: { status: 'pending' } }),
    ])
    res.set('Cache-Control', 'no-store')
    return res.json({
      service: { newOpen: serviceOpen },
      retur: { newPending: returPending },
    })
  } catch (err) {
    console.error('Admin service dashboard summary error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la agregate service.' })
  }
}

const adminGuestResidentialOrdersHandler = async (req, res) => {
  try {
    const [legacyRows, modernRows] = await Promise.all([
      prisma.guestResidentialOrder.findMany({
        orderBy: { createdAt: 'desc' },
        take: 400,
      }),
      prisma.residentialOrder.findMany({
        include: { lines: { orderBy: { id: 'asc' } } },
        orderBy: { createdAt: 'desc' },
        take: 400,
      }),
    ])
    const out = [
      ...modernRows.map(mapResidentialRowAdmin),
      ...legacyRows.map(mapLegacyGuestRowAdmin),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return res.json(out.slice(0, 500))
  } catch (err) {
    console.error('Admin guest residential orders error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la încărcarea comenzilor.' })
  }
}
app.get('/api/admin/guest-residential-orders', authMiddleware, adminAuthMiddleware, adminGuestResidentialOrdersHandler)
app.get('/admin/guest-residential-orders', authMiddleware, adminAuthMiddleware, adminGuestResidentialOrdersHandler)
app.get('/api/admin/orders', authMiddleware, adminAuthMiddleware, adminGuestResidentialOrdersHandler)
app.get('/admin/orders', authMiddleware, adminAuthMiddleware, adminGuestResidentialOrdersHandler)
app.get(
  '/api/admin/orders-dashboard-summary',
  authMiddleware,
  adminAuthMiddleware,
  adminOrdersDashboardSummaryHandler,
)
app.get(
  '/admin/orders-dashboard-summary',
  authMiddleware,
  adminAuthMiddleware,
  adminOrdersDashboardSummaryHandler,
)
app.get(
  '/api/admin/service-dashboard-summary',
  authMiddleware,
  adminAuthMiddleware,
  adminServiceDashboardSummaryHandler,
)
app.get(
  '/admin/service-dashboard-summary',
  authMiddleware,
  adminAuthMiddleware,
  adminServiceDashboardSummaryHandler,
)

/** Panou admin: notificări + statistici agregate (un singur request). */
const adminDashboardSummaryHandler = async (req, res) => {
  try {
    const userId = req.userId
    const NEW_ORDER_STATUS = 'de_platit'
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [
      resNewBySource,
      legNewBySource,
      serviceOpen,
      returPending,
      unreadMessages,
      partnersPending,
      partnersApproved,
      totalClients,
      newClients30d,
      totalLeads,
      offerDrafts,
      offersGenerated7d,
      totalOffersGenerated,
      totalAgents,
      allLeadIds,
      viewedLeadStates,
    ] = await Promise.all([
      prisma.residentialOrder.groupBy({
        by: ['orderSource'],
        where: { fulfillmentStatus: NEW_ORDER_STATUS },
        _count: { _all: true },
      }),
      prisma.guestResidentialOrder.groupBy({
        by: ['orderSource'],
        where: { fulfillmentStatus: NEW_ORDER_STATUS },
        _count: { _all: true },
      }),
      prisma.serviceRequest.count({ where: { status: 'open' } }),
      prisma.retur.count({ where: { status: 'pending' } }),
      prisma.inquiry.count({ where: { isRead: false } }),
      prisma.partner.count({ where: { isApproved: false } }),
      prisma.partner.count({ where: { isApproved: true } }),
      prisma.user.count({ where: { role: 'client' } }),
      prisma.user.count({ where: { role: 'client', createdAt: { gte: thirtyDaysAgo } } }),
      prisma.salesLead.count(),
      prisma.adminCommercialOffer.count({ where: { status: 'draft' } }),
      prisma.adminCommercialOffer.count({
        where: { status: 'generated', createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.adminCommercialOffer.count({ where: { status: 'generated' } }),
      prisma.salesAgent.count(),
      prisma.salesLead.findMany({ select: { id: true }, take: 500 }),
      userId
        ? prisma.salesLeadUserState.findMany({
            where: { userId, viewedAt: { not: null } },
            select: { leadId: true, commentsSeenAt: true },
          })
        : Promise.resolve([]),
    ])

    const bucketSource = (src) => {
      const s = String(src || 'guest').toLowerCase()
      if (s === 'client') return 'client'
      if (s === 'partner' || s === 'partener') return 'partner'
      return 'guest'
    }
    const newBySource = { client: 0, partner: 0, guest: 0 }
    for (const row of resNewBySource) {
      newBySource[bucketSource(row.orderSource)] += row._count._all
    }
    for (const row of legNewBySource) {
      newBySource[bucketSource(row.orderSource)] += row._count._all
    }
    const newOrdersTotal = newBySource.client + newBySource.partner + newBySource.guest

    const viewedLeadIds = new Set(viewedLeadStates.map((s) => s.leadId))
    const newLeads = allLeadIds.filter((l) => !viewedLeadIds.has(l.id)).length

    let leadsWithUnreadComments = 0
    if (userId && allLeadIds.length > 0) {
      const leadIds = allLeadIds.map((l) => l.id)
      const commentsSeenByLead = new Map(viewedLeadStates.map((s) => [s.leadId, s.commentsSeenAt]))
      const commentRows = await prisma.salesLeadActivity.findMany({
        where: { leadId: { in: leadIds }, type: 'comment' },
        select: { leadId: true, userId: true, createdAt: true },
      })
      for (const leadId of leadIds) {
        const commentsSeenAt = commentsSeenByLead.get(leadId) ?? null
        if (leadHasUnreadComments(leadId, userId, commentsSeenAt, commentRows)) {
          leadsWithUnreadComments += 1
        }
      }
    }

    res.set('Cache-Control', 'no-store')
    return res.json({
      notifications: {
        newOrders: newOrdersTotal,
        offerDrafts,
        offersRecent: offersGenerated7d,
        newLeads,
        leadsUnreadComments: leadsWithUnreadComments,
        serviceRequests: serviceOpen,
        returRequests: returPending,
        unreadMessages,
        partnersPending,
        newClients: newClients30d,
      },
      statistics: {
        clients: totalClients,
        partners: partnersApproved,
        partnersPending,
        leads: totalLeads,
        offersGenerated: totalOffersGenerated,
        agents: totalAgents,
        newOrders: newOrdersTotal,
      },
      orders: {
        newOrders: {
          total: newOrdersTotal,
          client: newBySource.client,
          partner: newBySource.partner,
          guest: newBySource.guest,
        },
      },
    })
  } catch (err) {
    console.error('Admin dashboard summary error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la agregate dashboard.' })
  }
}
app.get('/api/admin/dashboard-summary', authMiddleware, adminAuthMiddleware, adminDashboardSummaryHandler)
app.get('/admin/dashboard-summary', authMiddleware, adminAuthMiddleware, adminDashboardSummaryHandler)

const patchAdminOrderFulfillmentStatusHandler = async (req, res) => {
  try {
    const orderId = String(req.params.orderId || '').trim()
    if (!orderId) return res.status(400).json({ error: 'ID comandă lipsă.' })

    const invoiceFile = req.files?.clientInvoice?.[0] ?? null
    const proformaFile = req.files?.proforma?.[0] ?? null

    const mod = await prisma.residentialOrder.findUnique({ where: { id: orderId } })
    if (mod) {
      let status = String(req.body?.fulfillmentStatus ?? '').trim()
      if (!status && (invoiceFile || proformaFile)) {
        status = String(mod.fulfillmentStatus || 'de_platit')
      }
      if (!status) return res.status(400).json({ error: 'Status invalid.' })
      if (!FULFILLMENT_STATUSES.includes(status)) {
        return res.status(400).json({ error: 'Status invalid.' })
      }

      const prev = String(mod.fulfillmentStatus || 'de_platit')
      if (status === 'in_pregatire' && prev !== 'in_pregatire' && !invoiceFile && !mod.clientInvoiceUrl) {
        return res.status(400).json({
          error:
            'Pentru „În pregătire” încarcă factura client (PDF): același PATCH cu multipart/form-data și câmpul clientInvoice.',
        })
      }

      let nextInvoiceUrl = mod.clientInvoiceUrl
      if (invoiceFile) {
        if (invoiceFile.mimetype !== 'application/pdf') {
          return res.status(400).json({ error: 'Factura trebuie să fie PDF.' })
        }
        if (!isR2Configured()) {
          return res.status(503).json({ error: 'Stocarea fișierelor (R2) nu este configurată.' })
        }
        try {
          const key = guestOrderDocumentKey(orderId, 'factura-client.pdf')
          const oldKey = mod.clientInvoiceUrl ? urlToKey(String(mod.clientInvoiceUrl)) : null
          if (oldKey) await deleteFromR2(oldKey).catch(() => {})
          nextInvoiceUrl = await uploadToR2(invoiceFile.buffer, key, 'application/pdf')
        } catch (e) {
          console.error('Residential order invoice upload:', e)
          return res.status(500).json({ error: e?.message || 'Încărcare factură eșuată.' })
        }
      }

      let nextProformaUrl = mod.proformaUrl
      if (proformaFile) {
        if (proformaFile.mimetype !== 'application/pdf') {
          return res.status(400).json({ error: 'Proforma trebuie să fie PDF.' })
        }
        if (!isR2Configured()) {
          return res.status(503).json({ error: 'Stocarea fișierelor (R2) nu este configurată.' })
        }
        try {
          const key = guestOrderDocumentKey(orderId, 'proforma.pdf')
          const oldKey = mod.proformaUrl ? urlToKey(String(mod.proformaUrl)) : null
          if (oldKey) await deleteFromR2(oldKey).catch(() => {})
          nextProformaUrl = await uploadToR2(proformaFile.buffer, key, 'application/pdf')
        } catch (e) {
          console.error('Residential order proforma upload:', e)
          return res.status(500).json({ error: e?.message || 'Încărcare proforma eșuată.' })
        }
      }

      const data = { fulfillmentStatus: status }
      if (invoiceFile) data.clientInvoiceUrl = nextInvoiceUrl
      if (proformaFile) data.proformaUrl = nextProformaUrl
      await prisma.residentialOrder.update({ where: { id: orderId }, data })
      const merged = await prisma.residentialOrder.findUnique({ where: { id: orderId } })
      return res.json({
        ok: true,
        id: orderId,
        fulfillmentStatus: merged.fulfillmentStatus,
        clientInvoiceUrl: merged.clientInvoiceUrl,
        proformaUrl: merged.proformaUrl,
      })
    }

    const leg = await prisma.guestResidentialOrder.findUnique({ where: { id: orderId } })
    if (leg) {
      let status = String(req.body?.fulfillmentStatus ?? '').trim()
      if (!status && (invoiceFile || proformaFile)) {
        status = String(leg.fulfillmentStatus || 'de_platit')
      }
      if (!status) return res.status(400).json({ error: 'Status invalid.' })
      if (!FULFILLMENT_STATUSES.includes(status)) {
        return res.status(400).json({ error: 'Status invalid.' })
      }

      const prev = String(leg.fulfillmentStatus || 'de_platit')
      if (status === 'in_pregatire' && prev !== 'in_pregatire' && !invoiceFile && !leg.clientInvoiceUrl) {
        return res.status(400).json({
          error:
            'Pentru „În pregătire” încarcă factura client (PDF): PATCH multipart cu câmpul clientInvoice.',
        })
      }

      let nextInvoiceUrl = leg.clientInvoiceUrl
      if (invoiceFile) {
        if (invoiceFile.mimetype !== 'application/pdf') {
          return res.status(400).json({ error: 'Factura trebuie să fie PDF.' })
        }
        if (!isR2Configured()) {
          return res.status(503).json({ error: 'Stocarea fișierelor (R2) nu este configurată.' })
        }
        try {
          const key = guestOrderDocumentKey(orderId, 'factura-client.pdf')
          const oldKey = leg.clientInvoiceUrl ? urlToKey(String(leg.clientInvoiceUrl)) : null
          if (oldKey) await deleteFromR2(oldKey).catch(() => {})
          nextInvoiceUrl = await uploadToR2(invoiceFile.buffer, key, 'application/pdf')
        } catch (e) {
          console.error('Guest order invoice upload:', e)
          return res.status(500).json({ error: e?.message || 'Încărcare factură eșuată.' })
        }
      }

      let nextProformaUrl = leg.proformaUrl
      if (proformaFile) {
        if (proformaFile.mimetype !== 'application/pdf') {
          return res.status(400).json({ error: 'Proforma trebuie să fie PDF.' })
        }
        if (!isR2Configured()) {
          return res.status(503).json({ error: 'Stocarea fișierelor (R2) nu este configurată.' })
        }
        try {
          const key = guestOrderDocumentKey(orderId, 'proforma.pdf')
          const oldKey = leg.proformaUrl ? urlToKey(String(leg.proformaUrl)) : null
          if (oldKey) await deleteFromR2(oldKey).catch(() => {})
          nextProformaUrl = await uploadToR2(proformaFile.buffer, key, 'application/pdf')
        } catch (e) {
          console.error('Guest order proforma upload:', e)
          return res.status(500).json({ error: e?.message || 'Încărcare proforma eșuată.' })
        }
      }

      const data = { fulfillmentStatus: status }
      if (invoiceFile) data.clientInvoiceUrl = nextInvoiceUrl
      if (proformaFile) data.proformaUrl = nextProformaUrl
      await prisma.guestResidentialOrder.update({ where: { id: orderId }, data })
      const merged = await prisma.guestResidentialOrder.findUnique({ where: { id: orderId } })
      return res.json({
        ok: true,
        id: orderId,
        fulfillmentStatus: merged.fulfillmentStatus,
        clientInvoiceUrl: merged.clientInvoiceUrl,
        proformaUrl: merged.proformaUrl,
      })
    }

    return res.status(404).json({ error: 'Comandă negăsită.' })
  } catch (err) {
    console.error('Admin order status patch error:', err)
    res.status(500).json({ error: err?.message || 'Eroare.' })
  }
}
const adminOrderPatchUpload = uploadMiddleware.fields([
  { name: 'clientInvoice', maxCount: 1 },
  { name: 'proforma', maxCount: 1 },
])
app.patch(
  '/api/admin/orders/:orderId',
  authMiddleware,
  adminAuthMiddleware,
  adminOrderPatchUpload,
  patchAdminOrderFulfillmentStatusHandler,
)
app.patch(
  '/admin/orders/:orderId',
  authMiddleware,
  adminAuthMiddleware,
  adminOrderPatchUpload,
  patchAdminOrderFulfillmentStatusHandler,
)

// ── Public: list published products (no auth) ───────────────────────────
// When no published products exist, fall back to drafts (helps new sites / dev)
const listPublicProductsHandler = async (req, res) => {
  try {
    if (!prisma.product) return res.status(500).json({ error: 'Server misconfiguration.' })
    const productInclude = { category: { select: { id: true, slug: true, name: true } } }
    let products = await prisma.product.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      include: productInclude,
    })
    if (products.length === 0) {
      products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        include: productInclude,
      })
    }
    products = sortProductsResidentialFirst(products)
    const authPayload = readOptionalAuthPayload(req)
    return res.json(
      products.map((p) =>
        applyPublicPricePolicy(normalizeCatalogBadges(productToJson(p)), authPayload),
      ),
    )
  } catch (err) {
    console.error('List public products error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la încărcare.' })
  }
}
app.get('/api/products', listPublicProductsHandler)
app.get('/products', listPublicProductsHandler)

// ── Public: list product categories ────────────────────────────────────
app.get('/api/product-categories', async (_req, res) => {
  try {
    const cats = await prisma.productCategory.findMany({ orderBy: { order: 'asc' } })
    return res.json(cats)
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Eroare.' })
  }
})
app.get('/product-categories', async (_req, res) => {
  try {
    const cats = await prisma.productCategory.findMany({ orderBy: { order: 'asc' } })
    return res.json(cats)
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Eroare.' })
  }
})

/** Modele produs (catalog) pentru formulare publice (ex. retur) — fără auth, fără specificații tehnice complete. */
const listPublicProductModelsHandler = async (_req, res) => {
  try {
    const rows = await prisma.productModel.findMany({
      orderBy: [{ sortOrder: 'asc' }, { modelNumber: 'asc' }],
      select: {
        id: true,
        name: true,
        brand: true,
        series: true,
        modelNumber: true,
        usageType: true,
      },
    })
    const withBrochures = await Promise.all(
      rows.map(async (r) => {
        let technicalBrochureUrl = null
        try {
          technicalBrochureUrl = await resolveProductModelTechnicalBrochureUrl(r.modelNumber, r.name)
        } catch {
          technicalBrochureUrl = null
        }
        return {
          id: r.id,
          name: r.name,
          brand: r.brand,
          series: r.series || '',
          modelNumber: r.modelNumber,
          usageType: r.usageType === 'residential' ? 'residential' : 'industrial',
          technicalBrochureUrl,
        }
      }),
    )
    res.set('Cache-Control', 'public, max-age=120')
    return res.json(withBrochures)
  } catch (err) {
    console.error('List public product models error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la încărcarea modelelor.' })
  }
}
app.get('/api/public/product-models', listPublicProductModelsHandler)
app.get('/public/product-models', listPublicProductModelsHandler)

// ── Public: get single published product (no auth) ───────────────────────
// Accepts id (cuid) or slug for SEO-friendly URLs
// Falls back to draft when no published products exist (consistent with list)
const getPublicProductHandler = async (req, res) => {
  try {
    const { id } = req.params
    const isCuid = /^c[a-z0-9]{24}$/.test(id)
    const catInclude = { category: { select: { id: true, slug: true, name: true } } }
    let product = await prisma.product.findFirst({
      where: {
        status: 'published',
        ...(isCuid ? { id } : { slug: id }),
      },
      include: catInclude,
    })
    if (!product) {
      const publishedCount = await prisma.product.count({ where: { status: 'published' } })
      if (publishedCount === 0) {
        product = await prisma.product.findFirst({
          where: isCuid ? { id } : { slug: id },
          include: catInclude,
        })
      }
    }
    if (!product) return res.status(404).json({ error: 'Produs negăsit.' })
    const authPayload = readOptionalAuthPayload(req)
    return res.json(
      applyPublicPricePolicy(normalizeCatalogBadges(productToJson(product)), authPayload),
    )
  } catch (err) {
    console.error('Get public product error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la încărcare.' })
  }
}
app.get('/api/products/:id', getPublicProductHandler)
app.get('/products/:id', getPublicProductHandler)

/** Imagine card sau prima din `images` — pentru verificare garanție publică. */
function pickProductHeroImageUrlForWarrantyVerify(product) {
  const card = product?.cardImage && String(product.cardImage).trim()
  if (card) return card
  const imgs = product?.images
  if (Array.isArray(imgs)) {
    for (const x of imgs) {
      const u = typeof x === 'string' ? x.trim() : ''
      if (u) return u
    }
  }
  return ''
}

/** Garanție „activă” publică doar dacă unitatea e la client final sau distribuitor (câmp sau locație). */
function warehouseSavedItemEligibleForPublicWarrantyVerify(savedItem) {
  if (!savedItem) return false
  const hasClient = savedItem.client != null && String(savedItem.client).trim() !== ''
  const hasDistributor = savedItem.distributor != null && String(savedItem.distributor).trim() !== ''
  if (hasClient || hasDistributor) return true
  const loc = String(savedItem.location || 'depozit').trim()
  return loc === 'client_final' || loc === 'distribuitor'
}

/** Public: verificare SN în depozit (fără date personale / certificat). ?t= token semnat sau ?sn= legacy. */
const verifyPublicWarrantySerialHandler = async (req, res) => {
  try {
    const tokenParam = String(req.query.t ?? req.query.token ?? '').trim()
    let sn = ''

    if (tokenParam) {
      const secret = String(process.env.WARRANTY_VERIFY_TOKEN_SECRET || '').trim()
      if (!secret) {
        return res.status(503).json({
          code: 'token_not_configured',
          error: 'Verificarea cu link semnat nu este configurată pe server.',
        })
      }
      const parsed = parseWarrantyVerifyToken(tokenParam, secret)
      if (!parsed) {
        return res.status(400).json({
          code: 'invalid_token',
          error: 'Linkul de verificare nu este valid sau a expirat.',
        })
      }
      sn = parsed.sn
    } else {
      sn = String(req.query.sn ?? req.query.serial ?? '').trim()
      const qrRaw = req.query.qr != null ? String(req.query.qr) : ''
      if (!sn && qrRaw) sn = parseSerialFromQrPayload(qrRaw)
      if (!sn) {
        return res.status(400).json({
          error: 'Introdu numărul de serie sau folosește linkul din certificat.',
        })
      }
      sn = normalizeWarehouseSerialNumber(sn)
      if (!isValidWarehouseSerialNumber(sn)) {
        return res.status(400).json({ error: SN_INVALID_MESSAGE, code: 'invalid_serial' })
      }
    }
    const unit = await prisma.warehouseStockUnit.findUnique({
      where: { serialNumber: sn },
      select: {
        serialNumber: true,
        product: {
          select: {
            brand: true,
            title: true,
            sku: true,
            cardImage: true,
            images: true,
          },
        },
        savedItem: {
          select: {
            modelNumber: true,
            client: true,
            distributor: true,
            location: true,
          },
        },
      },
    })
    if (!unit) {
      return res.json({
        found: false,
        serialNumber: sn,
      })
    }
    if (!warehouseSavedItemEligibleForPublicWarrantyVerify(unit.savedItem)) {
      return res.json({
        found: false,
        serialNumber: sn,
      })
    }
    const p = unit.product
    const modelNumber =
      (unit.savedItem && String(unit.savedItem.modelNumber || '').trim()) || String(p?.sku || '').trim()
    const imageUrl = pickProductHeroImageUrlForWarrantyVerify(p) || null
    const brand = p?.brand != null ? String(p.brand).trim() : ''
    return res.json({
      found: true,
      serialNumber: unit.serialNumber,
      brand: brand || null,
      title: p?.title || '',
      modelNumber,
      imageUrl,
    })
  } catch (err) {
    console.error('Warranty verify error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la verificare.' })
  }
}
app.get('/api/warranty-verify', warrantyVerifyRateLimitMiddleware, verifyPublicWarrantySerialHandler)
app.get('/warranty-verify', warrantyVerifyRateLimitMiddleware, verifyPublicWarrantySerialHandler)

const RETURN_ELIGIBILITY_RECEIPT_MAX_DAYS = 15

/** Parsează `clientReceiptDate` (zz-ll-aaaa, zz.ll.aaaa sau ISO) pentru fereastra de retur. */
function parseClientReceiptDateForReturEligibility(raw) {
  const t = String(raw ?? '').trim()
  if (!t) return null
  const sep = /^(\d{2})[-.](\d{2})[-.](\d{4})$/.exec(t)
  if (sep) {
    const dd = parseInt(sep[1], 10)
    const mm = parseInt(sep[2], 10)
    const yyyy = parseInt(sep[3], 10)
    if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null
    const d = new Date(yyyy, mm - 1, dd)
    if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null
    return d
  }
  const d = new Date(t)
  if (Number.isNaN(d.getTime())) return null
  return d
}

/** `clientReceiptDate` normalizată ca zz-ll-aaaa pentru formulare publice. */
function formatClientReceiptDateDdMmYyyy(parsed) {
  if (!(parsed instanceof Date) || Number.isNaN(parsed.getTime())) return null
  const dd = String(parsed.getDate()).padStart(2, '0')
  const mm = String(parsed.getMonth() + 1).padStart(2, '0')
  const yyyy = String(parsed.getFullYear())
  return `${dd}-${mm}-${yyyy}`
}

/** Data recepției nu e în viitor și nu e cu mai mult de `RETURN_ELIGIBILITY_RECEIPT_MAX_DAYS` zile în urmă (zi calendaristică locală server). */
function isClientReceiptWithinReturEligibilityWindow(receiptDate) {
  const t = new Date()
  const todayStart = new Date(t.getFullYear(), t.getMonth(), t.getDate())
  const r = receiptDate
  const receiptStart = new Date(r.getFullYear(), r.getMonth(), r.getDate())
  const diffDays = Math.floor((todayStart.getTime() - receiptStart.getTime()) / 86400000)
  return diffDays >= 0 && diffDays <= RETURN_ELIGIBILITY_RECEIPT_MAX_DAYS
}

/** Public: SN în stocuri + data recepție ≤ 15 zile (fără date personale). */
const getPublicReturSerialEligibilityHandler = async (req, res) => {
  try {
    let sn = String(req.query.sn ?? '').trim()
    if (!sn) {
      return res.status(400).json({ error: 'Parametrul sn (număr de serie) este obligatoriu.', code: 'missing_serial' })
    }
    sn = normalizeWarehouseSerialNumber(sn)
    if (!isValidWarehouseSerialNumber(sn)) {
      return res.status(400).json({ error: SN_INVALID_MESSAGE, code: 'invalid_serial' })
    }
    const row = await prisma.warehouseSavedItem.findUnique({
      where: { serialNumber: sn },
      select: {
        clientReceiptDate: true,
        modelNumber: true,
        warehouseStockUnit: {
          select: {
            product: { select: { brand: true, title: true } },
          },
        },
      },
    })
    if (!row) {
      return res.set('Cache-Control', 'no-store').json({ eligible: false })
    }
    const parsed = parseClientReceiptDateForReturEligibility(row.clientReceiptDate)
    if (!parsed) {
      return res.set('Cache-Control', 'no-store').json({ eligible: false })
    }
    const eligible = isClientReceiptWithinReturEligibilityWindow(parsed)
    if (!eligible) {
      return res.set('Cache-Control', 'no-store').json({ eligible: false })
    }
    const clientReceiptDate = formatClientReceiptDateDdMmYyyy(parsed)
    const savedMn = String(row.modelNumber ?? '').trim()
    let productModelId = null
    let brand = null
    let modelName = null
    if (savedMn) {
      const pm = await prisma.productModel.findFirst({
        where: { modelNumber: savedMn },
        select: { id: true, brand: true, name: true },
      })
      if (pm) {
        productModelId = pm.id
        brand = pm.brand
        modelName = pm.name
      }
    }
    if (!productModelId) {
      const pb = row.warehouseStockUnit?.product?.brand
      brand = typeof pb === 'string' && pb.trim() ? pb.trim() : null
      const title = row.warehouseStockUnit?.product?.title
      modelName = typeof title === 'string' && title.trim() ? title.trim() : null
    }
    return res
      .set('Cache-Control', 'no-store')
      .json({
        eligible: true,
        clientReceiptDate,
        productModelId,
        brand,
        modelName,
        modelNumber: savedMn || null,
      })
  } catch (err) {
    console.error('Retur serial eligibility error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la verificare.' })
  }
}
app.get(
  '/api/public/retur-serial-eligibility',
  warrantyVerifyRateLimitMiddleware,
  getPublicReturSerialEligibilityHandler,
)
app.get('/public/retur-serial-eligibility', warrantyVerifyRateLimitMiddleware, getPublicReturSerialEligibilityHandler)

// ── Admin: list products ───────────────────────────────────────────────
const listProductsHandler = async (req, res) => {
  try {
    if (!prisma.product) return res.status(500).json({ error: 'Server misconfiguration.' })
    const products = sortProductsResidentialFirst(
      await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
    )
    res.set('Cache-Control', 'no-store')
    return res.json(products.map(productToJson))
  } catch (err) {
    console.error('List products error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la încărcare.' })
  }
}
// List products – match exact path and common variants (trailing slash, proxy quirks)
app.get('/api/admin/products', authMiddleware, adminAuthMiddleware, listProductsHandler)
app.get('/api/admin/products/', authMiddleware, adminAuthMiddleware, listProductsHandler)
app.get('/admin/products', authMiddleware, adminAuthMiddleware, listProductsHandler)
app.get('/admin/products/', authMiddleware, adminAuthMiddleware, listProductsHandler)

// ── Admin: one product by id (full row from DB — nested JSON e.g. technicalSpecsModels) ──
const getAdminProductByIdHandler = async (req, res) => {
  try {
    if (!prisma.product) return res.status(500).json({ error: 'Server misconfiguration.' })
    const { id } = req.params
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return res.status(404).json({ error: 'Produs negăsit.' })
    res.set('Cache-Control', 'no-store')
    return res.json(productToJson(product))
  } catch (err) {
    console.error('Get admin product error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la încărcare.' })
  }
}
app.get('/api/admin/products/:id', authMiddleware, adminAuthMiddleware, getAdminProductByIdHandler)
app.get('/admin/products/:id', authMiddleware, adminAuthMiddleware, getAdminProductByIdHandler)

// ── Admin: update product status (go live) ───────────────────────────────
const updateProductStatusHandler = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    if (!['draft', 'published'].includes(status)) {
      return res.status(400).json({ error: 'Status invalid. Folosește "draft" sau "published".' })
    }
    const product = await prisma.product.update({
      where: { id },
      data: { status },
    })
    return res.json(product)
  } catch (err) {
    console.error('Update product status error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la actualizare.' })
  }
}
app.patch('/api/admin/products/:id/status', authMiddleware, adminAuthMiddleware, updateProductStatusHandler)
app.patch('/admin/products/:id/status', authMiddleware, adminAuthMiddleware, updateProductStatusHandler)

// ── Admin: delete product ───────────────────────────────────────────────
const deleteProductHandler = async (req, res) => {
  try {
    const { id } = req.params
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return res.status(404).json({ error: 'Produs negăsit.' })

    // Delete images from R2
    if (isR2Configured()) {
      if (product.cardImage) {
        const key = urlToKey(product.cardImage)
        if (key) {
          try {
            await deleteFromR2(key)
          } catch (e) {
            console.warn('R2 delete cardImage:', key, e?.message)
          }
        }
      }
      const imgs = Array.isArray(product.images) ? product.images : []
      for (const url of imgs) {
        const key = urlToKey(url)
        if (key) {
          try {
            await deleteFromR2(key)
          } catch (e) {
            console.warn('R2 delete image:', key, e?.message)
          }
        }
      }
      // Delete documente tehnice (PDFs) from R2
      const docs = Array.isArray(product.documenteTehnice) ? product.documenteTehnice : []
      for (const doc of docs) {
        const url = doc?.url || doc
        const key = typeof url === 'string' ? urlToKey(url) : null
        if (key) {
          try {
            await deleteFromR2(key)
          } catch (e) {
            console.warn('R2 delete doc:', key, e?.message)
          }
        }
      }
    }

    await prisma.product.delete({ where: { id } })
    return res.status(204).send()
  } catch (err) {
    console.error('Delete product error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la ștergere.' })
  }
}
app.delete('/api/admin/products/:id', authMiddleware, adminAuthMiddleware, deleteProductHandler)
app.delete('/admin/products/:id', authMiddleware, adminAuthMiddleware, deleteProductHandler)

function warehouseStockUnitToJson(row) {
  if (!row) return row
  return {
    id: row.id,
    productId: row.productId,
    serialNumber: row.serialNumber,
    warehouseReceivedAt:
      row.warehouseReceivedAt instanceof Date ? row.warehouseReceivedAt.toISOString() : row.warehouseReceivedAt,
    entryMethod: row.entryMethod,
    rawQrPayload: row.rawQrPayload,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
    product: row.product
      ? { id: row.product.id, title: row.product.title, sku: row.product.sku }
      : undefined,
  }
}

function warehouseSavedItemToJson(row) {
  if (!row) return row
  const parsedItemNumber =
    typeof row.itemNumber === 'number'
      ? row.itemNumber
      : typeof row.itemNumber === 'string'
        ? parseInt(row.itemNumber, 10)
        : null
  const brandRaw = row.warehouseStockUnit?.product?.brand
  const brand =
    brandRaw != null && String(brandRaw).trim() ? String(brandRaw).trim() : null
  return {
    id: row.id,
    itemNumber: Number.isFinite(parsedItemNumber) ? parsedItemNumber : null,
    warehouseStockUnitId: row.warehouseStockUnitId,
    brand,
    modelNumber: row.modelNumber,
    serialNumber: row.serialNumber,
    producedOn: row.producedOn || '',
    warehouseIn: row.warehouseIn instanceof Date ? row.warehouseIn.toISOString() : row.warehouseIn,
    location: row.location || 'depozit',
    distributor: row.distributor || null,
    client: row.client || null,
    /* Status certificat de garanţie client (afişat în „Garanţie client” din admin Stocuri). */
    warrantyCertificateAvailable: Boolean(row.warrantyCertificateUrl),
    warrantyCertificateGeneratedAt:
      row.warrantyCertificateGeneratedAt instanceof Date
        ? row.warrantyCertificateGeneratedAt.toISOString()
        : null,
    warrantyCertificateNumber: row.warrantyCertificateUrl ? buildCertNumber(row) : null,
    clientReceiptDate:
      row.clientReceiptDate != null && String(row.clientReceiptDate).trim()
        ? String(row.clientReceiptDate).trim()
        : null,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
  }
}

const listWarehouseStockUnitsHandler = async (req, res) => {
  try {
    const take = Math.min(200, Math.max(1, parseInt(String(req.query.limit || '100'), 10) || 100))
    const rows = await prisma.warehouseStockUnit.findMany({
      orderBy: { warehouseReceivedAt: 'desc' },
      take,
      include: { product: { select: { id: true, title: true, sku: true } } },
    })
    res.set('Cache-Control', 'no-store')
    return res.json(rows.map(warehouseStockUnitToJson))
  } catch (err) {
    console.error('List warehouse stock units error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la încărcare.' })
  }
}

const listWarehouseSavedItemsHandler = async (req, res) => {
  try {
    const take = Math.min(500, Math.max(1, parseInt(String(req.query.limit || '200'), 10) || 200))
    const rows = await prisma.warehouseSavedItem.findMany({
      orderBy: { warehouseIn: 'desc' },
      take,
      include: {
        warehouseStockUnit: {
          select: {
            product: { select: { brand: true } },
          },
        },
      },
    })
    const clientIds = [
      ...new Set(
        rows.map((r) => String(r.client || '').trim()).filter(Boolean),
      ),
    ]
    const users =
      clientIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: clientIds } },
            select: { id: true, email: true, firstName: true, lastName: true },
          })
        : []
    const userById = new Map(users.map((u) => [u.id, u]))
    res.set('Cache-Control', 'no-store')
    return res.json(
      rows.map((row) => {
        const o = warehouseSavedItemToJson(row)
        const cid = String(row.client || '').trim()
        if (cid && userById.has(cid)) {
          const u = userById.get(cid)
          o.clientAccount = {
            email: u.email,
            firstName: u.firstName || '',
            lastName: u.lastName || '',
          }
        }
        return o
      }),
    )
  } catch (err) {
    console.error('List warehouse saved items error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la încărcarea listei de stocuri.' })
  }
}

/** Șterge unitatea din depozit (rând lista + stock unit). Doar rol admin (adminAuthMiddleware). */
const deleteWarehouseSavedItemHandler = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim()
    if (!id) return res.status(400).json({ error: 'ID lipsă.' })
    const saved = await prisma.warehouseSavedItem.findUnique({
      where: { id },
      select: { warehouseStockUnitId: true },
    })
    if (!saved) return res.status(404).json({ error: 'Înregistrarea nu există.' })
    await prisma.warehouseStockUnit.delete({ where: { id: saved.warehouseStockUnitId } })
    res.set('Cache-Control', 'no-store')
    return res.status(204).end()
  } catch (err) {
    console.error('Delete warehouse saved item error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la ștergere.' })
  }
}

const createWarehouseStockUnitHandler = async (req, res) => {
  try {
    const body = req.body || {}
    let productId = String(body.productId || '').trim()
    const productModelId = String(body.productModelId || '').trim()
    const entryMethod = ['qr_scan', 'manual'].includes(String(body.entryMethod || '').trim())
      ? String(body.entryMethod).trim()
      : 'manual'
    let serialNumber = String(body.serialNumber || '').trim()
    const qrRaw = body.qrRaw != null ? String(body.qrRaw) : ''
    if (!serialNumber && qrRaw) serialNumber = parseSerialFromQrPayload(qrRaw)
    if (!serialNumber) return res.status(400).json({ error: 'Numărul de serie lipsește.' })

    serialNumber = normalizeWarehouseSerialNumber(serialNumber)
    if (!isValidWarehouseSerialNumber(serialNumber)) {
      return res.status(400).json({ error: SN_INVALID_MESSAGE })
    }

    const existingBySn = await prisma.warehouseStockUnit.findUnique({
      where: { serialNumber },
      select: { id: true },
    })
    if (existingBySn) {
      return res.status(409).json({
        error: `Acest număr de serie (${serialNumber}) este deja înregistrat în depozit.`,
      })
    }

    let resolvedModelNumber = ''
    if (!productId && productModelId) {
      const pm = await prisma.productModel.findUnique({
        where: { id: productModelId },
        select: { modelNumber: true },
      })
      if (!pm) return res.status(404).json({ error: 'Model negăsit în tabelul Modele.' })
      const sku = String(pm.modelNumber || '').trim()
      if (!sku) return res.status(400).json({ error: 'Modelul selectat nu are număr de model (SKU) setat.' })
      resolvedModelNumber = sku
      const prod = await prisma.product.findUnique({ where: { sku }, select: { id: true } })
      if (!prod) {
        return res.status(400).json({
          error: `Nu există produs în catalog cu SKU „${sku}”. În Inventar → Produse, creează un produs cu SKU identic cu numărul modelului din Modele (ex. ${sku}).`,
        })
      }
      productId = prod.id
    }

    if (!productId) return res.status(400).json({ error: 'Selectează modelul din listă.' })

    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, sku: true } })
    if (!product) return res.status(404).json({ error: 'Produs negăsit.' })
    if (!resolvedModelNumber) resolvedModelNumber = String(product.sku || '').trim()

    const rawQrPayload = qrRaw ? qrRaw.slice(0, 4000) : null
    const producedOn = deriveProducedOnFromSerial(serialNumber)

    const created = await prisma.$transaction(async (tx) => {
      const stockUnit = await tx.warehouseStockUnit.create({
        data: {
          productId,
          serialNumber,
          entryMethod,
          rawQrPayload,
        },
        include: { product: { select: { id: true, title: true, sku: true } } },
      })
      await tx.warehouseSavedItem.create({
        data: {
          warehouseStockUnitId: stockUnit.id,
          modelNumber: resolvedModelNumber || String(stockUnit.product?.sku || '').trim(),
          serialNumber,
          producedOn,
          warehouseIn: stockUnit.warehouseReceivedAt,
          location: 'depozit',
        },
      })
      return stockUnit
    })
    return res.status(201).json(warehouseStockUnitToJson(created))
  } catch (err) {
    if (err?.code === 'P2002') {
      return res.status(409).json({
        error: 'Acest număr de serie este deja înregistrat în depozit (conflict unicitate).',
      })
    }
    console.error('Create warehouse stock unit error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la înregistrare.' })
  }
}

app.get('/api/admin/warehouse-stock-units', authMiddleware, adminAuthMiddleware, listWarehouseStockUnitsHandler)
app.get('/admin/warehouse-stock-units', authMiddleware, adminAuthMiddleware, listWarehouseStockUnitsHandler)
app.post('/api/admin/warehouse-stock-units', authMiddleware, adminAuthMiddleware, createWarehouseStockUnitHandler)
app.post('/admin/warehouse-stock-units', authMiddleware, adminAuthMiddleware, createWarehouseStockUnitHandler)
app.get('/api/admin/warehouse-saved-items', authMiddleware, adminAuthMiddleware, listWarehouseSavedItemsHandler)
app.get('/admin/warehouse-saved-items', authMiddleware, adminAuthMiddleware, listWarehouseSavedItemsHandler)
app.delete('/api/admin/warehouse-saved-items/:id', authMiddleware, adminAuthMiddleware, deleteWarehouseSavedItemHandler)
app.delete('/admin/warehouse-saved-items/:id', authMiddleware, adminAuthMiddleware, deleteWarehouseSavedItemHandler)

/**
 * Admin: descărcare PDF certificat de garanţie pentru orice item din depozit.
 * Spre deosebire de varianta client, nu cerem ownership — admin-ul are acces
 * la toate certificatele. Răspunsul are `Content-Disposition: attachment` ca
 * să forţeze descărcarea (URL-ul R2 nu este expus).
 */
const downloadAdminWarehouseWarrantyCertificateHandler = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim()
    if (!id) return res.status(400).json({ error: 'ID lipsă.' })
    const saved = await prisma.warehouseSavedItem.findUnique({
      where: { id },
      select: {
        id: true,
        serialNumber: true,
        warrantyCertificateUrl: true,
      },
    })
    if (!saved) {
      return res.status(404).json({ error: 'Item negăsit.' })
    }
    if (!saved.warrantyCertificateUrl) {
      return res.status(404).json({
        code: 'no_certificate',
        error: 'Nu există încă un certificat generat pentru acest produs.',
      })
    }
    const key = urlToKey(saved.warrantyCertificateUrl)
    if (!key) {
      return res.status(500).json({ error: 'Stocare certificat indisponibilă.' })
    }
    let buffer
    try {
      buffer = await downloadFromR2(key)
    } catch (e) {
      console.error('Admin warranty cert R2 download failed:', e)
      return res.status(500).json({ error: 'Nu am putut descărca certificatul.' })
    }
    const safeSn = String(saved.serialNumber || 'certificat').replace(/[^\w.-]+/g, '_')
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${safeSn}.pdf"`)
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Content-Length', String(buffer.length))
    return res.send(buffer)
  } catch (err) {
    console.error('Admin warranty certificate download error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare.' })
  }
}

app.get(
  '/api/admin/warehouse-saved-items/:id/warranty-certificate/download',
  authMiddleware,
  adminAuthMiddleware,
  downloadAdminWarehouseWarrantyCertificateHandler,
)
app.get(
  '/admin/warehouse-saved-items/:id/warranty-certificate/download',
  authMiddleware,
  adminAuthMiddleware,
  downloadAdminWarehouseWarrantyCertificateHandler,
)

const BRAND_CODES = { lithtech: 'LTC' }

function brandCode(brand) {
  const key = String(brand || '').trim().toLowerCase()
  return BRAND_CODES[key] || String(brand || '').trim()
}

function buildModelSku(brand, productType, modelNumber) {
  const b = brandCode(brand)
  const t = String(productType || 'ESS').trim()
  const m = String(modelNumber || '').trim()
  return [b, t, m].filter(Boolean).join('-')
}

const listProductModelsHandler = async (req, res) => {
  try {
    const rows = await prisma.productModel.findMany({
      orderBy: [{ sortOrder: 'asc' }, { modelNumber: 'asc' }],
    })
    res.set('Cache-Control', 'no-store')
    return res.json(
      rows.map((r) => ({
        id: r.id,
        name: r.name,
        brand: r.brand,
        series: r.series || '',
        modelNumber: r.modelNumber,
        technicalDescription: r.technicalDescription,
        usageType: r.usageType === 'residential' ? 'residential' : 'industrial',
        productType: r.productType || 'ESS',
        sku: r.sku || buildModelSku(r.brand, r.productType, r.modelNumber),
        imageUrl: r.imageUrl || null,
        productImageUrl: r.productImageUrl || null,
        availableForStock: r.availableForStock !== false,
        sortOrder: r.sortOrder,
        createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
        updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
      })),
    )
  } catch (err) {
    console.error('List product models error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la încărcarea modelelor.' })
  }
}

const updateProductModelHandler = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim()
    if (!id) return res.status(400).json({ error: 'ID model lipsă.' })

    const body = req.body || {}
    const name = String(body.name ?? '').trim()
    const brand = String(body.brand ?? '').trim()
    const series = String(body.series ?? '').trim()
    const modelNumber = String(body.modelNumber ?? '').trim()
    const technicalDescription = String(body.technicalDescription ?? '').trim()
    const usageType = String(body.usageType ?? 'industrial').trim().toLowerCase()
    const VALID_PRODUCT_TYPES = ['ESS','INV','PV','PCS','BMS','ACC','CHG']
    const productTypeRaw = String(body.productType ?? 'ESS').trim().toUpperCase()
    const productType = VALID_PRODUCT_TYPES.includes(productTypeRaw) ? productTypeRaw : 'ESS'
    const imageUrlRaw = body.imageUrl == null ? '' : String(body.imageUrl).trim()
    const imageUrl = imageUrlRaw ? imageUrlRaw.slice(0, 2000) : null
    const productImageUrlRaw = body.productImageUrl == null ? '' : String(body.productImageUrl).trim()
    const productImageUrl = productImageUrlRaw ? productImageUrlRaw.slice(0, 2000) : null
    const availableForStock = body.availableForStock === false ? false : true

    if (!name) return res.status(400).json({ error: 'Numele modelului este obligatoriu.' })
    if (!brand) return res.status(400).json({ error: 'Brand-ul este obligatoriu.' })
    if (!series) return res.status(400).json({ error: 'Series este obligatoriu.' })
    if (!modelNumber) return res.status(400).json({ error: 'Model number este obligatoriu.' })
    if (!technicalDescription) return res.status(400).json({ error: 'Specificațiile tehnice sunt obligatorii.' })
    if (!['industrial', 'residential'].includes(usageType)) {
      return res.status(400).json({ error: 'Tip invalid. Folosește industrial sau residential.' })
    }

    const sku = buildModelSku(brand, productType, modelNumber)
    const updated = await prisma.productModel.update({
      where: { id },
      data: { name, brand, series, modelNumber, technicalDescription, usageType, productType, sku, imageUrl, productImageUrl, availableForStock },
    })
    return res.json({
      id: updated.id,
      name: updated.name,
      brand: updated.brand,
      series: updated.series || '',
      modelNumber: updated.modelNumber,
      technicalDescription: updated.technicalDescription,
      usageType: updated.usageType === 'residential' ? 'residential' : 'industrial',
      productType: updated.productType || 'ESS',
      sku: updated.sku || buildModelSku(updated.brand, updated.productType, updated.modelNumber),
      imageUrl: updated.imageUrl || null,
      productImageUrl: updated.productImageUrl || null,
      availableForStock: updated.availableForStock !== false,
      sortOrder: updated.sortOrder,
      createdAt: updated.createdAt instanceof Date ? updated.createdAt.toISOString() : updated.createdAt,
      updatedAt: updated.updatedAt instanceof Date ? updated.updatedAt.toISOString() : updated.updatedAt,
    })
  } catch (err) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Model negăsit.' })
    if (err?.code === 'P2002') return res.status(409).json({ error: 'Model number există deja.' })
    console.error('Update product model error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la salvarea modelului.' })
  }
}

const patchProductModelAvailableForStockHandler = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim()
    if (!id) return res.status(400).json({ error: 'ID model lipsă.' })
    const body = req.body || {}
    if (typeof body.availableForStock !== 'boolean') {
      return res.status(400).json({ error: 'Parametrul „availableForStock” (boolean) este obligatoriu.' })
    }
    const updated = await prisma.productModel.update({
      where: { id },
      data: { availableForStock: body.availableForStock },
    })
    return res.json({
      id: updated.id,
      name: updated.name,
      brand: updated.brand,
      series: updated.series || '',
      modelNumber: updated.modelNumber,
      technicalDescription: updated.technicalDescription,
      usageType: updated.usageType === 'residential' ? 'residential' : 'industrial',
      imageUrl: updated.imageUrl || null,
      productImageUrl: updated.productImageUrl || null,
      availableForStock: updated.availableForStock !== false,
      sortOrder: updated.sortOrder,
      createdAt: updated.createdAt instanceof Date ? updated.createdAt.toISOString() : updated.createdAt,
      updatedAt: updated.updatedAt instanceof Date ? updated.updatedAt.toISOString() : updated.updatedAt,
    })
  } catch (err) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Model negăsit.' })
    console.error('Patch product model availability error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la actualizare.' })
  }
}

function bufferLooksLikePdf(buf) {
  if (!buf || buf.length < 5) return false
  return buf.slice(0, 5).toString('latin1').startsWith('%PDF')
}

const uploadProductTechnicalBrochureHandler = async (req, res) => {
  try {
    if (!req.file?.buffer) return res.status(400).json({ error: 'Fișier PDF lipsă.' })
    if (!bufferLooksLikePdf(req.file.buffer)) {
      return res.status(400).json({ error: 'Conținutul nu este un PDF valid (%PDF).' })
    }
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Tip fișier: trimite un PDF (application/pdf).' })
    }
    if (!isR2Configured()) {
      return res.status(503).json({ error: 'Stocare R2 neconfigurată. Verifică variabilele din .env.' })
    }
    const id = String(req.params.id || '').trim()
    if (!id) return res.status(400).json({ error: 'ID model lipsă.' })
    const row = await prisma.productModel.findUnique({ where: { id } })
    if (!row) return res.status(404).json({ error: 'Model negăsit.' })
    const key = productTechnicalBrochurePdfKey(row.modelNumber, row.name)
    const safeBase = sanitizeFolderName(`${row.modelNumber} ${row.name}`).slice(0, 180) || 'brochure'
    const safeFilename = `${safeBase}.pdf`.replace(/"/g, '')
    const url = await uploadToR2(req.file.buffer, key, 'application/pdf', {
      contentDisposition: `inline; filename="${safeFilename}"`,
      cacheControl: 'public, max-age=120',
    })
    return res.json({
      url,
      key,
      modelNumber: row.modelNumber,
      modelName: row.name,
    })
  } catch (err) {
    console.error('Upload product technical brochure error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la salvarea broșurii PDF.' })
  }
}

function normalizeCommercialOfferSaveRecord(raw) {
  if (!raw || typeof raw !== 'object') return null
  const buyerType =
    raw.buyerType === 'company' ? 'company' : raw.buyerType === 'person' ? 'person' : null
  if (!buyerType) return null
  const clientLabel = String(raw.clientLabel ?? '').trim().slice(0, 300)
  if (!clientLabel) return null
  const currency = raw.currency === 'EUR' ? 'EUR' : raw.currency === 'RON' ? 'RON' : null
  if (!currency) return null
  const amountGross = Number(raw.amountGross)
  if (!Number.isFinite(amountGross) || amountGross < 0) return null
  const productCount = Math.floor(Number(raw.productCount))
  if (!Number.isFinite(productCount) || productCount < 0) return null
  const clientEmail = String(raw.clientEmail ?? '').trim().slice(0, 254)
  const clientPhone = String(raw.clientPhone ?? '').trim().slice(0, 32)
  return {
    buyerType,
    clientLabel,
    clientEmail,
    clientPhone,
    currency,
    amountGross: Math.round(amountGross * 100) / 100,
    productCount,
  }
}

function sanitizeOfferDraftSnapshot(raw) {
  if (!raw || typeof raw !== 'object') return null
  const buyerType =
    raw.buyerType === 'company' ? 'company' : raw.buyerType === 'person' ? 'person' : null
  if (!buyerType) return null
  const generatedAt = typeof raw.generatedAt === 'string' && raw.generatedAt ? raw.generatedAt : undefined
  if (buyerType === 'person') {
    const p = raw.clientPerson
    if (!p || typeof p !== 'object') return null
    return {
      buyerType,
      ...(generatedAt ? { generatedAt } : {}),
      clientPerson: {
        email: String(p.email ?? '').trim().slice(0, 254),
        telefon: String(p.telefon ?? '').trim().slice(0, 32),
        tara: String(p.tara ?? '').trim().slice(0, 80),
      },
    }
  }
  const c = raw.clientCompany
  if (!c || typeof c !== 'object') return null
  return {
    buyerType,
    ...(generatedAt ? { generatedAt } : {}),
    clientCompany: {
      contactEmail: String(c.contactEmail ?? '').trim().slice(0, 254),
      contactTelefon: String(c.contactTelefon ?? '').trim().slice(0, 32),
      tara: String(c.tara ?? '').trim().slice(0, 80),
    },
  }
}

function resolveOfferRowClientContact(row) {
  let email = String(row.clientEmail ?? '').trim()
  let phone = String(row.clientPhone ?? '').trim()
  const snap = row.draftSnapshot
  if (snap && typeof snap === 'object') {
    const formSnap = snap.kind === 'adminOfferForm' ? snap.form : null
    if (formSnap && typeof formSnap === 'object') {
      if (formSnap.buyerType === 'company' && formSnap.clientCompany) {
        if (!email) email = String(formSnap.clientCompany.contactEmail ?? '').trim()
        if (!phone) phone = String(formSnap.clientCompany.contactTelefon ?? '').trim()
      } else if (formSnap.buyerType === 'person' && formSnap.clientPerson) {
        if (!email) email = String(formSnap.clientPerson.email ?? '').trim()
        if (!phone) phone = String(formSnap.clientPerson.telefon ?? '').trim()
      }
    } else if (snap.buyerType === 'company' && snap.clientCompany) {
      if (!email) email = String(snap.clientCompany.contactEmail ?? '').trim()
      if (!phone) phone = String(snap.clientCompany.contactTelefon ?? '').trim()
    } else if (snap.buyerType === 'person' && snap.clientPerson) {
      if (!email) email = String(snap.clientPerson.email ?? '').trim()
      if (!phone) phone = String(snap.clientPerson.telefon ?? '').trim()
    }
  }
  return { clientEmail: email, clientPhone: phone }
}

function sanitizeAdminOfferFormPersistedSnapshot(raw) {
  if (!raw || typeof raw !== 'object') return null
  const form = raw.form
  if (!form || typeof form !== 'object') return null
  const buyerType =
    form.buyerType === 'company' ? 'company' : form.buyerType === 'person' ? 'person' : null
  if (!buyerType) return null
  const language =
    form.language === 'en' || form.language === 'de' || form.language === 'ro' ? form.language : 'ro'
  const currency = form.offerCurrency === 'EUR' ? 'EUR' : 'RON'
  const lines = Array.isArray(form.offerProductLines)
    ? form.offerProductLines
        .filter((row) => row && typeof row === 'object' && typeof row.id === 'string')
        .slice(0, 50)
        .map((row) => ({
          id: String(row.id).slice(0, 80),
          productModelId: String(row.productModelId ?? '').slice(0, 80),
          priceWithoutVat: String(row.priceWithoutVat ?? '').slice(0, 32),
          qty: String(row.qty ?? '1').slice(0, 8),
          vatPercent: String(row.vatPercent ?? '21').slice(0, 4),
          discountPercent: String(row.discountPercent ?? '0').slice(0, 4),
        }))
    : []
  const trimStr = (v, max) => String(v ?? '').trim().slice(0, max)
  const person = form.clientPerson && typeof form.clientPerson === 'object' ? form.clientPerson : {}
  const company = form.clientCompany && typeof form.clientCompany === 'object' ? form.clientCompany : {}
  return {
    version: 1,
    kind: 'adminOfferForm',
    form: {
      version: 1,
      buyerType,
      language,
      clientPerson: {
        nume: trimStr(person.nume, 120),
        prenume: trimStr(person.prenume, 120),
        adresa: trimStr(person.adresa, 300),
        judet: trimStr(person.judet, 80),
        oras: trimStr(person.oras, 120),
        tara: trimStr(person.tara, 80) || 'România',
        codPostal: trimStr(person.codPostal, 16),
        email: trimStr(person.email, 254),
        telefon: trimStr(person.telefon, 32),
      },
      clientCompany: {
        companyName: trimStr(company.companyName, 200),
        cui: trimStr(company.cui, 32),
        strada: trimStr(company.strada, 300),
        judet: trimStr(company.judet, 80),
        oras: trimStr(company.oras, 120),
        codPostal: trimStr(company.codPostal, 16),
        tara: trimStr(company.tara, 80) || 'România',
        contactNume: trimStr(company.contactNume, 120),
        contactPrenume: trimStr(company.contactPrenume, 120),
        contactEmail: trimStr(company.contactEmail, 254),
        contactTelefon: trimStr(company.contactTelefon, 32),
      },
      offerProductLines: lines,
      offerValidityDays: trimStr(form.offerValidityDays, 3) || '30',
      offerCurrency: currency,
      offerPreparedByAgentId: trimStr(form.offerPreparedByAgentId, 80),
      offerDeliveryNotes: trimStr(form.offerDeliveryNotes, 500),
      offerPaymentConditions: trimStr(form.offerPaymentConditions, 500),
      offerIncludeProductTechnicalDetails: Boolean(form.offerIncludeProductTechnicalDetails),
      offerIncludeBaterinoBenefits: Boolean(form.offerIncludeBaterinoBenefits),
    },
  }
}

function normalizeCommercialOfferDraftMeta(raw) {
  const base = normalizeCommercialOfferSaveRecord(raw)
  if (!base) return null
  if (!base.clientLabel || base.clientLabel === '—') {
    return { ...base, clientLabel: 'Ciornă' }
  }
  return base
}

function buildOfferNumberFromGeneratedAt(generatedAt) {
  if (!generatedAt || typeof generatedAt !== 'string') return ''
  const t = new Date(generatedAt)
  if (isNaN(t.getTime())) return ''
  const y = t.getFullYear()
  const m = String(t.getMonth() + 1).padStart(2, '0')
  const day = String(t.getDate()).padStart(2, '0')
  const tail = generatedAt.replace(/\W/g, '').slice(-6) || String(t.getTime()).slice(-6)
  return `OC-${y}${m}${day}-${tail}`
}

function extractCountryFromSnapshot(snapshot, buyerType) {
  if (!snapshot || typeof snapshot !== 'object') return ''
  try {
    const form = snapshot.form || snapshot
    if (buyerType === 'person' && form.clientPerson?.tara) return form.clientPerson.tara
    if (buyerType === 'company' && form.clientCompany?.tara) return form.clientCompany.tara
  } catch (e) { /* ignore */ }
  return ''
}

function serializeAdminCommercialOfferRow(row) {
  const contact = resolveOfferRowClientContact(row)

  // Prefer DB columns; fall back to snapshot for rows saved before the migration
  let offerNumber = row.offerNumber || ''
  let country = row.country || ''
  if ((!offerNumber || !country) && row.draftSnapshot) {
    try {
      const draft = typeof row.draftSnapshot === 'string'
        ? JSON.parse(row.draftSnapshot)
        : row.draftSnapshot
      if (!offerNumber) offerNumber = buildOfferNumberFromGeneratedAt(draft.generatedAt)
      if (!country) country = extractCountryFromSnapshot(draft, row.buyerType)
    } catch (e) { /* ignore */ }
  }

  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : row.createdAt.toISOString(),
    status: row.status === 'draft' ? 'draft' : 'generated',
    buyerType: row.buyerType,
    clientLabel: row.clientLabel,
    clientEmail: contact.clientEmail,
    clientPhone: contact.clientPhone,
    amountGross: row.amountGross != null ? String(row.amountGross) : '0',
    currency: row.currency,
    productCount: row.productCount,
    pdfUrl: row.pdfUrl,
    noteCount: row._count?.notes ?? 0,
    offerNumber: offerNumber || '—',
    country: country || '—',
  }
}

async function listAdminCommercialOffersHandler(req, res) {
  try {
    const rows = await prisma.adminCommercialOffer.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 500,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        buyerType: true,
        clientLabel: true,
        clientEmail: true,
        clientPhone: true,
        amountGross: true,
        currency: true,
        productCount: true,
        pdfUrl: true,
        offerNumber: true,
        country: true,
        draftSnapshot: true,
        _count: { select: { notes: true } },
      },
    })
    return res.json({ offers: rows.map(serializeAdminCommercialOfferRow) })
  } catch (err) {
    console.error('List commercial offers error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la listarea ofertelor.' })
  }
}

async function getAdminCommercialOfferHandler(req, res) {
  try {
    const id = String(req.params?.id ?? '').trim()
    if (!id) return res.status(400).json({ error: 'ID lipsă.' })
    const row = await prisma.adminCommercialOffer.findUnique({ where: { id } })
    if (!row) return res.status(404).json({ error: 'Oferta nu a fost găsită.' })
    return res.json({
      offer: {
        ...serializeAdminCommercialOfferRow(row),
        draftSnapshot: row.draftSnapshot ?? null,
      },
    })
  } catch (err) {
    console.error('Get commercial offer error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la încărcarea ofertei.' })
  }
}

async function saveAdminCommercialOfferDraftHandler(req, res) {
  try {
    const formSnapshot = sanitizeAdminOfferFormPersistedSnapshot(req.body?.formSnapshot)
    if (!formSnapshot) return res.status(400).json({ error: 'Date formular invalide.' })
    const meta = normalizeCommercialOfferDraftMeta(req.body?.meta)
    if (!meta) return res.status(400).json({ error: 'Metadate ofertă invalide.' })
    const id = String(req.body?.id ?? '').trim() || null

    const data = {
      status: 'draft',
      buyerType: meta.buyerType,
      clientLabel: meta.clientLabel,
      clientEmail: meta.clientEmail,
      clientPhone: meta.clientPhone,
      amountGross: meta.amountGross,
      currency: meta.currency,
      productCount: meta.productCount,
      draftSnapshot: formSnapshot,
      country: extractCountryFromSnapshot(formSnapshot, meta.buyerType),
      pdfUrl: '',
    }

    if (id) {
      const existing = await prisma.adminCommercialOffer.findUnique({ where: { id } })
      if (!existing) return res.status(404).json({ error: 'Ciorna nu a fost găsită.' })
      if (existing.status !== 'draft') {
        return res.status(400).json({ error: 'Doar ciornele pot fi actualizate ca draft.' })
      }
      const row = await prisma.adminCommercialOffer.update({
        where: { id },
        data,
      })
      return res.json({ offer: serializeAdminCommercialOfferRow(row) })
    }

    const row = await prisma.adminCommercialOffer.create({
      data: {
        ...data,
        createdByUserId: req.userId || null,
      },
    })
    return res.status(201).json({ offer: serializeAdminCommercialOfferRow(row) })
  } catch (err) {
    console.error('Save commercial offer draft error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la salvarea ciornei.' })
  }
}

async function adminCommercialOfferPdfHandler(req, res) {
  try {
    const html = String(req.body?.html ?? '').trim()
    if (!html) return res.status(400).json({ error: 'HTML lipsă.' })
    const filename = String(req.body?.filename ?? '').trim() || undefined
    const saveMeta = normalizeCommercialOfferSaveRecord(req.body?.saveRecord)
    const draftSnapshot = sanitizeOfferDraftSnapshot(req.body?.draftSnapshot)
    const offerId = String(req.body?.offerId ?? '').trim() || null
    const { buffer, filename: outName } = await renderCommercialOfferPdfFromHtml(html, { filename })

    if (saveMeta) {
      if (!isR2Configured()) {
        console.warn('[Commercial offer] saveRecord ignored: R2 not configured')
      } else if (!bufferLooksLikePdf(buffer)) {
        console.warn('[Commercial offer] saveRecord ignored: invalid PDF buffer')
      } else {
        try {
          const safeFilename = String(outName || 'oferta-comerciala.pdf')
            .replace(/[/\\]/g, '')
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .slice(0, 120) || 'oferta-comerciala.pdf'
          const pdfPayload = {
            buyerType: saveMeta.buyerType,
            clientLabel: saveMeta.clientLabel,
            clientEmail: saveMeta.clientEmail,
            clientPhone: saveMeta.clientPhone,
            amountGross: saveMeta.amountGross,
            currency: saveMeta.currency,
            productCount: saveMeta.productCount,
            status: 'generated',
            offerNumber: draftSnapshot ? buildOfferNumberFromGeneratedAt(draftSnapshot.generatedAt) : '',
            country: draftSnapshot ? extractCountryFromSnapshot(draftSnapshot, saveMeta.buyerType) : '',
          }
          let targetId = offerId
          if (targetId) {
            const existing = await prisma.adminCommercialOffer.findUnique({ where: { id: targetId } })
            if (!existing || existing.status !== 'draft') targetId = null
          }
          let created
          if (targetId) {
            created = await prisma.adminCommercialOffer.update({
              where: { id: targetId },
              data: {
                ...pdfPayload,
                draftSnapshot: draftSnapshot ?? undefined,
                pdfUrl: '',
              },
            })
          } else {
            created = await prisma.adminCommercialOffer.create({
              data: {
                ...pdfPayload,
                draftSnapshot: draftSnapshot ?? undefined,
                pdfUrl: '',
                createdByUserId: req.userId || null,
              },
            })
          }
          const key = commercialOfferPdfKey(created.id, safeFilename)
          const pdfUrl = await uploadToR2(buffer, key, 'application/pdf', {
            contentDisposition: `attachment; filename="${safeFilename.replace(/"/g, '')}"`,
            cacheControl: 'private, max-age=31536000',
          })
          await prisma.adminCommercialOffer.update({
            where: { id: created.id },
            data: { pdfUrl },
          })
        } catch (saveErr) {
          console.error('Commercial offer save error:', saveErr)
        }
      }
    }

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`)
    res.setHeader('Cache-Control', 'no-store')
    return res.send(buffer)
  } catch (err) {
    console.error('Commercial offer PDF error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la generarea PDF-ului.' })
  }
}

app.get(
  '/api/admin/commercial-offers',
  authMiddleware,
  adminAuthMiddleware,
  listAdminCommercialOffersHandler,
)
app.get('/admin/commercial-offers', authMiddleware, adminAuthMiddleware, listAdminCommercialOffersHandler)

app.get(
  '/api/admin/commercial-offers/:id',
  authMiddleware,
  adminAuthMiddleware,
  getAdminCommercialOfferHandler,
)
app.get(
  '/admin/commercial-offers/:id',
  authMiddleware,
  adminAuthMiddleware,
  getAdminCommercialOfferHandler,
)

app.post(
  '/api/admin/commercial-offers/draft',
  authMiddleware,
  adminAuthMiddleware,
  saveAdminCommercialOfferDraftHandler,
)
app.post(
  '/admin/commercial-offers/draft',
  authMiddleware,
  adminAuthMiddleware,
  saveAdminCommercialOfferDraftHandler,
)

app.post(
  '/api/admin/commercial-offer/pdf',
  authMiddleware,
  adminAuthMiddleware,
  adminCommercialOfferPdfHandler,
)
app.post(
  '/admin/commercial-offer/pdf',
  authMiddleware,
  adminAuthMiddleware,
  adminCommercialOfferPdfHandler,
)

async function deleteAdminCommercialOfferHandler(req, res) {
  try {
    const { id } = req.params
    if (!id) return res.status(400).json({ error: 'ID lipsă.' })
    const offer = await prisma.adminCommercialOffer.findUnique({ where: { id } })
    if (!offer) return res.status(404).json({ error: 'Oferta nu există.' })
    if (offer.pdfUrl) {
      const key = urlToKey(offer.pdfUrl)
      if (key) {
        await deleteFromR2(key).catch((e) =>
          console.warn('[Commercial offer delete] R2 delete failed:', e?.message || e),
        )
      }
    }
    await prisma.adminCommercialOffer.delete({ where: { id } })
    return res.json({ ok: true })
  } catch (err) {
    console.error('Delete commercial offer error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la ștergerea ofertei.' })
  }
}

app.delete(
  '/api/admin/commercial-offers/:id',
  authMiddleware,
  adminAuthMiddleware,
  deleteAdminCommercialOfferHandler,
)
app.delete(
  '/admin/commercial-offers/:id',
  authMiddleware,
  adminAuthMiddleware,
  deleteAdminCommercialOfferHandler,
)

async function listAdminOfferNotesHandler(req, res) {
  try {
    const { id } = req.params
    const notes = await prisma.adminCommercialOfferNote.findMany({
      where: { offerId: id },
      orderBy: { createdAt: 'asc' },
      select: { id: true, createdAt: true, authorName: true, body: true },
    })
    return res.json({ notes })
  } catch (err) {
    console.error('List offer notes error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la încărcarea notițelor.' })
  }
}

async function addAdminOfferNoteHandler(req, res) {
  try {
    const { id } = req.params
    const body = String(req.body?.body ?? '').trim()
    if (!body) return res.status(400).json({ error: 'Notița nu poate fi goală.' })
    const offer = await prisma.adminCommercialOffer.findUnique({ where: { id } })
    if (!offer) return res.status(404).json({ error: 'Oferta nu există.' })
    const user = req.userId
      ? await prisma.user.findUnique({ where: { id: req.userId }, select: { firstName: true, lastName: true, email: true } })
      : null
    const authorName = user
      ? (`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || '')
      : ''
    const note = await prisma.adminCommercialOfferNote.create({
      data: { offerId: id, authorId: req.userId || null, authorName, body },
      select: { id: true, createdAt: true, authorName: true, body: true },
    })
    return res.status(201).json({ note })
  } catch (err) {
    console.error('Add offer note error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la salvarea notiței.' })
  }
}

app.get('/api/admin/commercial-offers/:id/notes', authMiddleware, adminAuthMiddleware, listAdminOfferNotesHandler)
app.get('/admin/commercial-offers/:id/notes', authMiddleware, adminAuthMiddleware, listAdminOfferNotesHandler)
app.post('/api/admin/commercial-offers/:id/notes', authMiddleware, adminAuthMiddleware, addAdminOfferNoteHandler)
app.post('/admin/commercial-offers/:id/notes', authMiddleware, adminAuthMiddleware, addAdminOfferNoteHandler)

app.post(
  '/api/admin/product-models/:id/technical-brochure',
  authMiddleware,
  adminAuthMiddleware,
  technicalBrochurePdfUploadMiddleware.single('file'),
  uploadProductTechnicalBrochureHandler,
)
app.post(
  '/admin/product-models/:id/technical-brochure',
  authMiddleware,
  adminAuthMiddleware,
  technicalBrochurePdfUploadMiddleware.single('file'),
  uploadProductTechnicalBrochureHandler,
)

app.get('/api/admin/product-models', authMiddleware, adminAuthMiddleware, listProductModelsHandler)
app.get('/admin/product-models', authMiddleware, adminAuthMiddleware, listProductModelsHandler)
app.patch('/api/admin/product-models/:id', authMiddleware, adminAuthMiddleware, updateProductModelHandler)
app.patch('/admin/product-models/:id', authMiddleware, adminAuthMiddleware, updateProductModelHandler)

async function deleteProductModelHandler(req, res) {
  try {
    const id = String(req.params.id || '').trim()
    if (!id) return res.status(400).json({ error: 'ID lipsă.' })
    const existing = await prisma.productModel.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Modelul nu a fost găsit.' })
    await prisma.productModel.delete({ where: { id } })
    return res.json({ ok: true })
  } catch (err) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Modelul nu a fost găsit.' })
    console.error('Delete product model error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la ștergerea modelului.' })
  }
}

app.delete('/api/admin/product-models/:id', authMiddleware, adminAuthMiddleware, deleteProductModelHandler)
app.delete('/admin/product-models/:id', authMiddleware, adminAuthMiddleware, deleteProductModelHandler)

async function createProductModelHandler(req, res) {
  try {
    const body = req.body || {}
    const name = String(body.name ?? '').trim()
    const brand = String(body.brand ?? '').trim()
    const series = String(body.series ?? '').trim()
    const modelNumber = String(body.modelNumber ?? '').trim()
    const technicalDescription = String(body.technicalDescription ?? '').trim()
    const usageType = String(body.usageType ?? 'industrial').trim().toLowerCase()
    const VALID_PRODUCT_TYPES = ['ESS','INV','PV','PCS','BMS','ACC','CHG']
    const productTypeRaw = String(body.productType ?? 'ESS').trim().toUpperCase()
    const productType = VALID_PRODUCT_TYPES.includes(productTypeRaw) ? productTypeRaw : 'ESS'
    const availableForStock = body.availableForStock === false ? false : true

    if (!name) return res.status(400).json({ error: 'Numele modelului este obligatoriu.' })
    if (!brand) return res.status(400).json({ error: 'Brand-ul este obligatoriu.' })
    if (!series) return res.status(400).json({ error: 'Series este obligatoriu.' })
    if (!modelNumber) return res.status(400).json({ error: 'Model number este obligatoriu.' })
    if (!['industrial', 'residential'].includes(usageType)) {
      return res.status(400).json({ error: 'Tip invalid.' })
    }

    const sku = buildModelSku(brand, productType, modelNumber)
    const created = await prisma.productModel.create({
      data: { name, brand, series, modelNumber, technicalDescription, usageType, productType, sku, availableForStock, sortOrder: 0 },
    })
    return res.status(201).json({
      id: created.id,
      name: created.name,
      brand: created.brand,
      series: created.series || '',
      modelNumber: created.modelNumber,
      technicalDescription: created.technicalDescription,
      usageType: created.usageType === 'residential' ? 'residential' : 'industrial',
      productType: created.productType || 'ESS',
      sku: created.sku || buildModelSku(created.brand, created.productType, created.modelNumber),
      imageUrl: null,
      productImageUrl: null,
      availableForStock: created.availableForStock !== false,
      sortOrder: created.sortOrder,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    })
  } catch (err) {
    if (err?.code === 'P2002') return res.status(409).json({ error: 'Model number există deja.' })
    console.error('Create product model error:', err)
    return res.status(500).json({ error: err?.message || 'Eroare la crearea modelului.' })
  }
}

app.post('/api/admin/product-models', authMiddleware, adminAuthMiddleware, createProductModelHandler)
app.post('/admin/product-models', authMiddleware, adminAuthMiddleware, createProductModelHandler)
app.patch(
  '/api/admin/product-models/:id/available-for-stock',
  authMiddleware,
  adminAuthMiddleware,
  patchProductModelAvailableForStockHandler,
)
app.patch(
  '/admin/product-models/:id/available-for-stock',
  authMiddleware,
  adminAuthMiddleware,
  patchProductModelAvailableForStockHandler,
)

function parseDecimal(val, fallback) {
  if (val === '' || val === null || val === undefined) return fallback
  const n = Number(String(val).replace(',', '.'))
  return Number.isNaN(n) ? fallback : n
}

// ── Admin: suspend/unsuspend company ────────────────────────────────────
app.patch('/api/admin/companies/:id/suspend', authMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { suspended } = req.body
    if (typeof suspended !== 'boolean') {
      return res.status(400).json({ error: 'Parametrul "suspended" (boolean) este obligatoriu.' })
    }
    const partner = await prisma.partner.update({
      where: { id },
      data: { isSuspended: suspended },
      include: { user: { select: { email: true } } },
    })
    return res.json(partner)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Companie negăsită.' })
    console.error('Admin suspend error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la actualizare.' })
  }
})

// ── Health ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ ok: true }))
app.get('/health', (req, res) => res.json({ ok: true }))

// R2 status (verificare config, fără auth)
app.get('/api/r2-status', (req, res) => {
  const configured = isR2Configured()
  res.json({ configured, message: configured ? 'R2 configurat' : 'R2 neconfigurat (lipsește .env)' })
})

// ── Document proxy download ────────────────────────────────────────────
// Fetches a remote PDF server-side and streams it back as an attachment,
// bypassing browser CORS restrictions and forcing a download.
app.get('/api/download-proxy', async (req, res) => {
  const { url } = req.query
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url param' })
  }
  // Only allow downloads from our own media CDN
  let parsed
  try { parsed = new URL(url) } catch { return res.status(400).json({ error: 'Invalid URL' }) }
  if (!parsed.hostname.endsWith('baterino.ro')) {
    return res.status(403).json({ error: 'Not allowed' })
  }
  try {
    const upstream = await fetch(url)
    if (!upstream.ok) return res.status(502).json({ error: 'Upstream error', status: upstream.status })
    const filename = parsed.pathname.split('/').pop() || 'document.pdf'
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    const cl = upstream.headers.get('content-length')
    if (cl) res.setHeader('Content-Length', cl)
    const { Readable } = require('stream')
    Readable.fromWeb(upstream.body).pipe(res)
  } catch (err) {
    console.error('[download-proxy]', err)
    res.status(500).json({ error: 'Download failed' })
  }
})

// ── Page SEO ────────────────────────────────────────────────────────────
const PAGE_SEO_ALLOWED_KEYS = new Set([
  'home', 'produse', 'blog', 'faq', 'garantie', 'service', 'returnare',
  'rezidential', 'industrial', 'medical', 'maritim', 'lithtech', 'instalatori',
  'viziune', 'studii-de-caz', 'contact', 'cariere',
])

const getPageSeoHandler = async (req, res) => {
  try {
    const rows = await prisma.pageSeo.findMany()
    res.json(rows)
  } catch (err) {
    console.error('page-seo get:', err)
    res.status(500).json({ error: err?.message || 'Eroare.' })
  }
}

const putAdminPageSeoHandler = async (req, res) => {
  try {
    const { pageKey } = req.params
    if (!PAGE_SEO_ALLOWED_KEYS.has(pageKey)) {
      return res.status(400).json({ error: 'pageKey invalid.' })
    }
    const title = String(req.body?.title ?? '').trim()
    const description = String(req.body?.description ?? '').trim()
    const ogTitle = String(req.body?.ogTitle ?? '').trim()
    const ogDescription = String(req.body?.ogDescription ?? '').trim()
    const ogImage = String(req.body?.ogImage ?? '').trim()
    const row = await prisma.pageSeo.upsert({
      where: { pageKey },
      create: { pageKey, title, description, ogTitle, ogDescription, ogImage },
      update: { title, description, ogTitle, ogDescription, ogImage },
    })
    res.json(row)
  } catch (err) {
    console.error('admin page-seo put:', err)
    res.status(500).json({ error: err?.message || 'Eroare la salvare.' })
  }
}

app.get('/api/page-seo', getPageSeoHandler)
app.get('/page-seo', getPageSeoHandler)
app.put('/api/admin/page-seo/:pageKey', authMiddleware, adminAuthMiddleware, putAdminPageSeoHandler)
app.put('/admin/page-seo/:pageKey', authMiddleware, adminAuthMiddleware, putAdminPageSeoHandler)

// ── 404 catch-all (pentru debug) ───────────────────────────────────────
app.use((req, res) => {
  console.log('[404]', req.method, req.url)
  res.status(404).json({ error: 'Rută negăsită', path: req.url, method: req.method })
})

const host = process.env.HOST || '0.0.0.0'
const server = app.listen(PORT, host, () => {
  console.log(`API running on http://${host}:${PORT}`)
})

// Prevent process from exiting when run under npm/concurrently
process.on('SIGTERM', () => server.close())
process.on('SIGINT', () => server.close())
