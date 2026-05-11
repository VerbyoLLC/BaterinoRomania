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
  sendResidentialOrderProformaEmail,
  sendServiceRequestReceivedEmail,
  isMailConfigured,
  getMailProvider,
  getMailFrom,
  getMailDebugInfo,
  verifySmtpConnection,
} = require('./lib/mail.js')
const { verifyGoogleIdToken, googleClientIds, idTokenAudiences } = require('./lib/google-id-token.js')
const {
  uploadToR2,
  downloadFromR2,
  generateKey,
  isR2Configured,
  urlToKey,
  deleteFromR2,
  ensureGuestOrderFolder,
  guestOrderDocumentKey,
  proformaPdfKey,
  warrantyCertificateKey,
} = require('./lib/r2.js')
const { renderWarrantyPdf } = require('./lib/warranty-pdf.js')
const {
  parseSerialFromQrPayload,
  normalizeWarehouseSerialNumber,
  isValidWarehouseSerialNumber,
  deriveProducedOnFromSerial,
  SN_INVALID_MESSAGE,
} = require('./lib/warehouse-serial.js')
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

/** Rezidențial: in_stock | out_of_stock | coming_soon — null clears badge */
function parseCatalogStockStatus(v) {
  if (v === null || v === undefined || v === '') return null
  const s = String(v).trim()
  if (['in_stock', 'out_of_stock', 'coming_soon'].includes(s)) return s
  return null
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
      vat: null,
    }
  }
  if (vis === 'public') return apiProduct
  if (role === 'partener') return apiProduct
  return {
    ...apiProduct,
    landedPrice: null,
    salePrice: null,
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

/**
 * Catalog line: salePrice = unit fără TVA; TVA se aplică pe prețul după reducere (program).
 * @returns {{ quantity: number, unitExclCatalog: number, vatPercent: number | null }}
 */
function computeGuestResidentialLineTotals(apiProduct, qty) {
  const sale = parseFloat(String(apiProduct.salePrice ?? '').replace(/\s/g, '').replace(',', '.'))
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
const JWT_SECRET = process.env.JWT_SECRET || 'baterino-dev-secret-change-in-production'

app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Product-Folder', 'X-Image-Index'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))
app.use(express.json())

// Explicit OPTIONS for admin products (CORS preflight)
app.options('/api/admin/products', (_, res) => res.status(204).end())
app.options('/api/admin/products/', (_, res) => res.status(204).end())
app.options('/api/admin/products/:id', (_, res) => res.status(204).end())

// ── Auth middleware (pentru rute protejate) ────────────────────────────
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Token lipsă.' })
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = payload.userId
    req.userRole = payload.role
    req.userEmail = payload.email ?? null
    next()
  } catch {
    return res.status(401).json({ error: 'Token invalid.' })
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

/** Cod numeric 4 cifre (leading zeros) pentru verificare email la înregistrare. */
function randomSignupVerificationCode() {
  return String(crypto.randomInt(0, 10000)).padStart(4, '0')
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
app.post('/api/auth/signup', async (req, res) => {
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
      },
    })

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
        ? 'Cont creat. Verifică emailul pentru codul de 4 cifre.'
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
app.post('/api/auth/resend-code', async (req, res) => {
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

// ── Auth: Verify code (4 cifre — înregistrare client și partener) ─────────
app.post('/api/auth/verify', async (req, res) => {
  try {
    const body = req.body || {}
    const email = String(body.email || '').trim().toLowerCase()
    const codeDigits = String(body.code ?? '').replace(/\D/g, '').slice(0, 4)

    if (!email || codeDigits.length !== 4) {
      return res.status(400).json({ error: 'Email și cod din 4 cifre sunt obligatorii.' })
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
      return res.status(400).json({ error: 'Cod incorect.' })
    }

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
app.post('/api/auth/forgot-password', async (req, res) => {
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
app.post('/api/auth/reset-password', async (req, res) => {
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
app.post('/api/auth/login', async (req, res) => {
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
app.post('/api/auth/google', async (req, res) => {
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

    let user = await prisma.user.findUnique({ where: { googleSub: sub } })
    if (!user) {
      user = await prisma.user.findUnique({ where: { email } })
    }

    if (user) {
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
      const phoneDigits = String(body.phone || '').replace(/\D/g, '').slice(0, 9)
      if (phoneDigits.length !== 9) {
        return res.status(400).json({ error: 'Telefon: exact 9 cifre.' })
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
        phone: phoneDigits,
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
      const phoneDigits = String(body.phone || '').replace(/\D/g, '').slice(0, 9)
      const deliveryDifferent = Boolean(body.deliveryDifferent ?? body.differentDeliveryAddress)
      const { delAddress, delCounty, delCity, delPostal } = sanitizeDeliveryBlock(body, deliveryDifferent)
      data = {
        firstName: sanitizeGuestOrderPersonName(body.firstName),
        lastName: sanitizeGuestOrderPersonName(body.lastName),
        phone: phoneDigits,
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

app.post('/api/client/change-email', authMiddleware, clientAuthMiddleware, async (req, res) => {
  try {
    const body = req.body || {}
    const newEmailRaw = String(body.newEmail || '')
      .trim()
      .toLowerCase()
    const currentPassword = body.currentPassword
    if (!newEmailRaw || !currentPassword) {
      return res.status(400).json({ error: 'Email nou și parola curentă sunt obligatorii.' })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmailRaw)) {
      return res.status(400).json({ error: 'Adresa de email nu este validă.' })
    }
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!user) return res.status(404).json({ error: 'Utilizator negăsit.' })
    if (!user.password) {
      return res.status(400).json({
        error: 'Pentru schimbarea emailului, setează mai întâi o parolă în zona „Schimbă parola”.',
      })
    }
    const oldEmail = String(user.email || '').trim()
    const oldNorm = oldEmail.toLowerCase()
    if (newEmailRaw === oldNorm) {
      return res.status(400).json({ error: 'Noul email este identic cu cel curent.' })
    }
    const valid = await bcrypt.compare(String(currentPassword), user.password)
    if (!valid) return res.status(401).json({ error: 'Parola curentă incorectă.' })
    const taken = await prisma.user.findUnique({ where: { email: newEmailRaw } })
    if (taken && taken.id !== user.id) {
      return res.status(409).json({ error: 'Acest email este deja folosit de un alt cont.' })
    }
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
        where: { userId: user.id },
        data: { email: newEmailRaw },
      }),
      prisma.user.update({ where: { id: user.id }, data: { email: newEmailRaw } }),
    ])
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
      select: { email: true, password: true },
    })
    if (!user) return res.status(404).json({ error: 'Utilizator negăsit.' })
    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Parola curentă este obligatorie pentru ștergerea contului.' })
      }
      const valid = await bcrypt.compare(String(currentPassword), user.password)
      if (!valid) return res.status(401).json({ error: 'Parola curentă incorectă.' })
    }

    await sendAccountDeletedEmail(user.email, 'client')

    await prisma.user.delete({ where: { id: userId } })
    return res.json({ message: 'Cont șters.' })
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
    select: { id: true, cardImage: true, images: true },
  })
  const thumbById = new Map()
  for (const p of plist) {
    thumbById.set(p.id, productCardImageUrlFromRow(p))
  }
  return rows.map((o) => ({
    ...o,
    lines: (o.lines || []).map((L) => ({
      ...L,
      imageUrl: thumbById.get(L.productId) || null,
    })),
  }))
}

app.get('/api/client/orders', authMiddleware, clientAuthMiddleware, async (req, res) => {
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
        where: { email, orderSource: 'client' },
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
    console.error('Client orders error:', err)
    res.status(500).json({ error: err?.message || 'Eroare.' })
  }
})

/**
 * Detalii bancare pentru plata online (modal "Plătește prin Transfer bancar").
 *
 * Întoarce strict câmpurile sigure (nume companie + IBAN RON + bancă) folosite de UI
 * pentru plata prin transfer. Folosim aceeași logică de selecție a contului ca proforma
 * (`pickBankAccountByCurrency('RON')`) pentru ca datele afișate în modal să coincidă
 * 1:1 cu cele tipărite în PDF-ul proforma.
 */
app.get('/api/client/payment-bank-details', authMiddleware, clientAuthMiddleware, async (_req, res) => {
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
    console.error('client payment bank details:', err)
    res.status(500).json({ error: err?.message || 'Eroare la încărcarea datelor bancare.' })
  }
})

/**
 * Întoarce JSON `{ downloadUrl, orderNumber }`. URL-ul este obiectul R2 încărcat cu
 * `Content-Disposition: attachment; filename="..."`, ca browser-ul să descarce PDF-ul direct
 * de la R2 (CDN-served, byte-perfect — fără riscuri de transformare în lanțul Express/CORS/compression).
 *
 * `?regenerate=1` forțează re-generarea chiar dacă există deja un PDF în R2.
 */
app.get('/api/client/orders/:orderId/proforma', authMiddleware, clientAuthMiddleware, async (req, res) => {
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

    /**
     * Dev mode (`NODE_ENV !== 'production'`) regenerează implicit la fiecare cerere
     * ca să vezi imediat schimbările din template fără a apela `?regenerate=1`.
     * În producție se cache-uiește la URL-ul R2 din `proformaUrl` până la
     * `?regenerate=1` explicit (sau env `BATERINO_PROFORMA_FORCE_REGENERATE=1`).
     */
    const forceRegenerate =
      String(req.query.regenerate || '') === '1' ||
      process.env.BATERINO_PROFORMA_FORCE_REGENERATE === '1' ||
      process.env.NODE_ENV !== 'production'

    const safePdfFile = (orderNumber) =>
      `proforma-${String(orderNumber || 'comanda').replace(/[^\w.-]+/g, '_')}.pdf`

    /** Apending `?t=<ms>` la URL ca să forțeze browser-ul (și CDN-ul) să nu folosească copia veche. */
    const cacheBust = (url) => `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`

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
      return res.json({
        downloadUrl: regenerated ? cacheBust(downloadUrl) : downloadUrl,
        orderNumber,
        proformaUrl: downloadUrl,
        regenerated,
      })
    }

    const legacy = await prisma.guestResidentialOrder.findFirst({
      where: { id: orderId, email: emailNorm, orderSource: 'client' },
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
    return res.json({
      downloadUrl: regenerated ? cacheBust(downloadUrl) : downloadUrl,
      orderNumber,
      proformaUrl: downloadUrl,
      regenerated,
    })
  } catch (err) {
    console.error('Client order proforma error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la generarea proformei.' })
  }
})

app.get('/api/client/orders/:orderId/invoice', authMiddleware, clientAuthMiddleware, async (req, res) => {
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
        where: { id: orderId, email: emailNorm, orderSource: 'client' },
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
      console.error('Client invoice fetch failed', upstream.status, invoiceUrl)
      return res.status(502).json({ error: 'Fișierul facturii nu poate fi citit.' })
    }
    const ct = upstream.headers.get('content-type') || 'application/pdf'
    const safeFile = `factura-${String(orderNumber).replace(/[^\w.-]+/g, '_')}.pdf`
    res.setHeader('Content-Type', ct)
    res.setHeader('Content-Disposition', `attachment; filename="${safeFile}"`)
    const buf = Buffer.from(await upstream.arrayBuffer())
    return res.send(buf)
  } catch (err) {
    console.error('Client order invoice error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la descărcarea facturii.' })
  }
})

app.post('/api/client/orders/:orderId/cancel', authMiddleware, clientAuthMiddleware, async (req, res) => {
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
      where: { id: orderId, email: emailNorm, orderSource: 'client' },
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
    console.error('Client order cancel error:', err)
    res.status(500).json({ error: err?.message || 'Eroare.' })
  }
})

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

      /* QR code: link către pagina publică de verificare garanție, cu SN-ul
         pre-completat în query string. Deep-link util când codul e scanat. */
      const verifyBase = requestOrigin || 'https://baterino.ro'
      const verifyUrl = `${verifyBase}/verificare-garantie?sn=${encodeURIComponent(
        values.SERIAL_NUMBER || '',
      )}`
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
    const userId = req.userId

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
      isPublic: body.isPublic,
    }

    if (existing) {
      const data = {}
      const all = { ...legal, ...publicFields }
      for (const [k, v] of Object.entries(all)) {
        if (v !== undefined && v !== null) data[k] = v
        else if (k === 'logoUrl' && (v === null || v === '')) data[k] = null
      }
      const partner = await prisma.partner.update({
        where: { userId },
        data,
      })
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
          },
        },
      },
    })
    if (!partner) return res.status(404).json({ error: 'Profil partener negăsit.' })
    // Ensure partnerDiscountPercent is always present (plain number) for frontend
    const result = {
      ...partner,
      partnerDiscountPercent: partner.partnerDiscountPercent != null ? Number(partner.partnerDiscountPercent) : null,
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
      select: { email: true },
    })
    if (!user) return res.status(404).json({ error: 'Utilizator negăsit.' })

    await sendAccountDeletedEmail(user.email, 'partener')

    await prisma.$transaction(async (tx) => {
      await tx.partner.deleteMany({ where: { userId } })
      await tx.user.delete({ where: { id: userId } })
    })
    return res.json({ message: 'Cont șters.' })
  } catch (err) {
    console.error('Delete account error:', err)
    res.status(500).json({ error: 'Eroare la ștergerea contului.' })
  }
})

// ── Debug: test Prisma (fără auth, doar pentru diagnostic) ─────────────
app.get('/api/debug/db', async (req, res) => {
  try {
    const count = await prisma.partner.count()
    return res.json({ ok: true, partnersCount: count })
  } catch (err) {
    console.error('Debug DB error:', err)
    return res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

// ── Debug: mail config + optional test send ───────────────────────────
app.get('/api/debug/mail', async (req, res) => {
  try {
    const provider = getMailProvider()
    const configured = isMailConfigured()
    const from = getMailFrom()
    const out = {
      configured,
      provider,
      from: from ? String(from).replace(/<[^>]+>/, '<***>') : null,
      ...getMailDebugInfo(),
    }

    if (req.query.verify === '1' || req.query.verify === 'true') {
      out.smtpVerify = await verifySmtpConnection()
    }

    const testTo = req.query.test || req.query.to
    if (testTo && configured) {
      const resetUrl = `${process.env.FRONTEND_URL || 'https://baterino.ro'}/reset-password?token=test123`
      await sendPasswordResetEmail(String(testTo), resetUrl)
      out.testSent = true
      out.testTo = testTo
    }
    return res.json(out)
  } catch (err) {
    console.error('Debug mail error:', err)
    return res.status(500).json({ ok: false, configured: isMailConfigured(), error: err?.message || String(err) })
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
app.get('/api/debug/proforma-preview', proformaPreviewHandler)
app.get('/debug/proforma-preview', proformaPreviewHandler)
/** Same HTML sample as debug route — easier URL to remember for template checks. */
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
app.get('/api/debug/referral-invite-preview', referralInvitePreviewHandler)
app.get('/debug/referral-invite-preview', referralInvitePreviewHandler)
/** Same HTML sample as debug route — open in browser while editing templates/referral-invite-email.js */
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

const listAdminAgentsHandler = async (req, res) => {
  try {
    const list = await prisma.salesAgent.findMany({
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
    const body = req.body || {}
    const lastName = String(body.lastName ?? '').trim()
    const firstName = String(body.firstName ?? '').trim()
    const phone = String(body.phone ?? '').replace(/\D/g, '')
    const whatsapp = String(body.whatsapp ?? '').replace(/\D/g, '')
    const email = String(body.email ?? '').trim().toLowerCase()
    const program = String(body.program ?? '').trim()
    const county = String(body.county ?? '').trim()
    const city = String(body.city ?? '').trim()
    const sector = String(body.sector ?? '').trim()

    const namePattern = /^[\p{L}\s\-'.]+$/u
    if (!lastName || !namePattern.test(lastName)) {
      return res.status(400).json({ error: 'Nume invalid: folosiți doar litere (inclusiv diacritice), spații și cratime.' })
    }
    if (!firstName || !namePattern.test(firstName)) {
      return res.status(400).json({ error: 'Prenume invalid: folosiți doar litere (inclusiv diacritice), spații și cratime.' })
    }
    if (!phone || phone.length < 9 || phone.length > 15) {
      return res.status(400).json({ error: 'Telefon invalid: 9–15 cifre.' })
    }
    if (!whatsapp || whatsapp.length < 9 || whatsapp.length > 15) {
      return res.status(400).json({ error: 'WhatsApp invalid: 9–15 cifre.' })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email invalid.' })
    }
    if (!program || program.length > 512) {
      return res.status(400).json({ error: 'Program obligatoriu (max. 512 caractere).' })
    }
    if (!county || !city) {
      return res.status(400).json({ error: 'Județ și oraș obligatorii.' })
    }
    if (!SALES_AGENT_SECTORS.has(sector)) {
      return res.status(400).json({ error: 'Sector invalid.' })
    }

    const created = await prisma.salesAgent.create({
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
      },
    })
    res.status(201).json({ ...created, partnerCount: 0 })
  } catch (err) {
    console.error('Admin create agent:', err)
    res.status(500).json({ error: err?.message || 'Eroare la creare.' })
  }
}

app.get('/api/admin/agents', authMiddleware, adminAuthMiddleware, listAdminAgentsHandler)
app.get('/admin/agents', authMiddleware, adminAuthMiddleware, listAdminAgentsHandler)
app.get('/api/admin/agents/:id/partners', authMiddleware, adminAuthMiddleware, listAgentPartnersForAdminHandler)
app.get('/admin/agents/:id/partners', authMiddleware, adminAuthMiddleware, listAgentPartnersForAdminHandler)
app.post('/api/admin/agents', authMiddleware, adminAuthMiddleware, createAdminAgentHandler)
app.post('/admin/agents', authMiddleware, adminAuthMiddleware, createAdminAgentHandler)

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
app.get('/api/sales-agent/me', authMiddleware, salesAgentAuthMiddleware, salesAgentMeHandler)

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
        const agent = await prisma.salesAgent.findUnique({ where: { id: sid }, select: { id: true } })
        if (!agent) {
          return res.status(400).json({ error: 'Agent de vânzări inexistent.' })
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
      include: { user: { select: { email: true } } },
    })
    if (!before.isApproved && before.user?.email) {
      try {
        await sendPartnerAccountApprovedEmail(before.user.email)
      } catch (err) {
        console.error('[Partner] Account approved email:', err?.message || err)
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

// ── Admin: file upload (images, PDFs) → R2 ─────────────────────────────────────────
const uploadHandler = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Fișier lipsă.' })
    if (!isR2Configured()) {
      return res.status(503).json({ error: 'Stocare fișiere neconfigurată. Verifică R2 în .env.' })
    }
    const isPdf = req.file.mimetype === 'application/pdf'
    const prefix = isPdf ? 'docs' : 'products'
    const productFolder = (req.query?.folder || req.get('X-Product-Folder') || req.body?.folder || '').trim()
    const imageIndexRaw = req.get('X-Image-Index') || req.body?.imageIndex || req.query?.imageIndex
    const imageIndex = imageIndexRaw != null ? parseInt(String(imageIndexRaw), 10) : undefined
    const key = generateKey(req.file.originalname, prefix, req.file.mimetype, productFolder || undefined, imageIndex)
    console.log('[R2 Upload] productFolder:', productFolder || '(none)', 'key:', key)
    const url = await uploadToR2(req.file.buffer, key, req.file.mimetype)
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

    const landedPrice = parseDecimal(body.landedPrice, 0)
    const salePrice = parseDecimal(body.salePrice, 0)
    const vat = parseDecimal(body.vat, 19)

    const images = Array.isArray(body.images) ? body.images : []
    const documenteTehnice = Array.isArray(body.documenteTehnice) ? body.documenteTehnice : []
    const faq = Array.isArray(body.faq) ? body.faq : []

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
        priceVisibility: parsePriceVisibility(body.priceVisibility),
        pricePresentation: parsePricePresentation(body.pricePresentation),
        catalogStockStatus:
          tipProdus === 'rezidential' ? parseCatalogStockStatus(body.catalogStockStatus) ?? 'in_stock' : null,
        reducereProgramIds: tipProdus === 'rezidential' ? parseReducereProgramIds(body.reducereProgramIds) : [],
        landedPrice,
        salePrice,
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
        eficientaCiclu: body.eficientaCiclu?.trim() || null,
        temperaturaFunctionare: body.temperaturaFunctionare?.trim() || null,
        temperaturaStocare: body.temperaturaStocare?.trim() || null,
        umiditate: body.umiditate?.trim() || null,
        cardImage: typeof body.cardImage === 'string' && body.cardImage.trim() ? body.cardImage.trim() : null,
        images,
        keyAdvantages: Array.isArray(body.keyAdvantages) ? body.keyAdvantages : [],
        documenteTehnice,
        faq,
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
    if (body.priceVisibility !== undefined) data.priceVisibility = parsePriceVisibility(body.priceVisibility)
    if (body.pricePresentation !== undefined) data.pricePresentation = parsePricePresentation(body.pricePresentation)
    if (body.landedPrice !== undefined) data.landedPrice = parseDecimal(body.landedPrice, 0)
    if (body.salePrice !== undefined) data.salePrice = parseDecimal(body.salePrice, 0)
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
    if (body.eficientaCiclu !== undefined) data.eficientaCiclu = body.eficientaCiclu?.trim() || null
    if (body.temperaturaFunctionare !== undefined) data.temperaturaFunctionare = body.temperaturaFunctionare?.trim() || null
    if (body.temperaturaStocare !== undefined) data.temperaturaStocare = body.temperaturaStocare?.trim() || null
    if (body.umiditate !== undefined) data.umiditate = body.umiditate?.trim() || null
    if (body.cardImage !== undefined) data.cardImage = typeof body.cardImage === 'string' && body.cardImage.trim() ? body.cardImage.trim() : null
    if (Array.isArray(body.images)) data.images = body.images
    if (Array.isArray(body.keyAdvantages)) data.keyAdvantages = body.keyAdvantages
    if (Array.isArray(body.documenteTehnice)) data.documenteTehnice = body.documenteTehnice
    if (Array.isArray(body.faq)) data.faq = body.faq
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
      data.catalogStockStatus = null
      data.reducereProgramIds = []
    } else if (body.catalogStockStatus !== undefined) {
      let rowTip = tipProdus
      if (!rowTip) {
        const ex = await prisma.product.findUnique({ where: { id }, select: { tipProdus: true } })
        rowTip = ex?.tipProdus
      }
      if (rowTip === 'rezidential') {
        data.catalogStockStatus = parseCatalogStockStatus(body.catalogStockStatus) ?? 'in_stock'
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

    if (title) {
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
    const isClient = authPayload?.role === 'client'
    const orderSource = isClient ? 'client' : 'guest'
    const userIdForOrder = isClient && authPayload?.userId ? String(authPayload.userId) : null

    const emailRaw = String(body.email || '').trim().toLowerCase()
    const phoneDigits = String(body.phone || '').replace(/\D/g, '').slice(0, 9)
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
    /** Pentru client autentificat, emailul din cont (JWT) — legătură reală în DB. */
    let emailToStore = emailRaw
    if (isClient) {
      const tokenEmail = String(authPayload.email || '').trim().toLowerCase()
      if (!tokenEmail || !emailRegex.test(tokenEmail)) {
        return res.status(401).json({ error: 'Sesiune invalidă. Autentifică-te din nou ca și client.' })
      }
      emailToStore = tokenEmail
    }
    if (phoneDigits.length !== 9) {
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

    const linePayloads = []
    for (const it of parsedItems) {
      const row = await findPublicProductRecordByIdOrSlug(it.productIdOrSlug)
      if (!row) {
        return res.status(404).json({ error: `Produs negăsit: ${it.productIdOrSlug}.` })
      }
      const apiProduct = applyPublicPricePolicy(productToJson(row), null)
      if (!guestResidentialProductEligible(apiProduct)) {
        return res.status(400).json({ error: 'Unul sau mai multe produse nu pot fi comandate în fluxul public.' })
      }
      let discountFactor = 0
      if (it.reducereProgramId) {
        try {
          discountFactor = await resolveGuestLineDiscountFactor(row, it.reducereProgramId)
        } catch (e) {
          return res.status(400).json({ error: e?.message || 'Reducere invalidă.' })
        }
      }
      const qParsed = Math.min(99, Math.max(1, parseInt(String(it.quantity), 10) || 1))
      if (it.reducereProgramId && qParsed > 1) {
        return res.status(400).json({
          error:
            'Cu program de reducere se poate comanda maximum 1 bucată per produs. Actualizează coșul și încearcă din nou.',
        })
      }
      const baseTotals = computeGuestResidentialLineTotals(apiProduct, it.quantity)
      const totals = applyDiscountFactorToGuestLineTotals(baseTotals, discountFactor)
      const title = String(apiProduct.title || '').trim() || 'Produs'
      const slugVal = apiProduct.slug != null && String(apiProduct.slug).trim() ? String(apiProduct.slug).trim() : null
      linePayloads.push({
        productId: row.id,
        productSlug: slugVal,
        productTitle: title,
        quantity: totals.quantity,
        unitPriceInclVat: totals.unitPriceInclVat.toFixed(2),
        lineTotalInclVat: totals.lineTotalInclVat.toFixed(2),
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
          phone: phoneDigits,
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
    let products = await prisma.product.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
    })
    if (products.length === 0) {
      products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      })
    }
    const authPayload = readOptionalAuthPayload(req)
    return res.json(
      products.map((p) => applyPublicPricePolicy(productToJson(p), authPayload))
    )
  } catch (err) {
    console.error('List public products error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la încărcare.' })
  }
}
app.get('/api/products', listPublicProductsHandler)
app.get('/products', listPublicProductsHandler)

// ── Public: get single published product (no auth) ───────────────────────
// Accepts id (cuid) or slug for SEO-friendly URLs
// Falls back to draft when no published products exist (consistent with list)
const getPublicProductHandler = async (req, res) => {
  try {
    const { id } = req.params
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
    if (!product) return res.status(404).json({ error: 'Produs negăsit.' })
    const authPayload = readOptionalAuthPayload(req)
    return res.json(applyPublicPricePolicy(productToJson(product), authPayload))
  } catch (err) {
    console.error('Get public product error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la încărcare.' })
  }
}
app.get('/api/products/:id', getPublicProductHandler)
app.get('/products/:id', getPublicProductHandler)

// ── Admin: list products ───────────────────────────────────────────────
const listProductsHandler = async (req, res) => {
  try {
    if (!prisma.product) return res.status(500).json({ error: 'Server misconfiguration.' })
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
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
  return {
    id: row.id,
    itemNumber: Number.isFinite(parsedItemNumber) ? parsedItemNumber : null,
    warehouseStockUnitId: row.warehouseStockUnitId,
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
        imageUrl: r.imageUrl || null,
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
    const imageUrlRaw = body.imageUrl == null ? '' : String(body.imageUrl).trim()
    const imageUrl = imageUrlRaw ? imageUrlRaw.slice(0, 2000) : null
    const availableForStock = body.availableForStock === false ? false : true

    if (!name) return res.status(400).json({ error: 'Numele modelului este obligatoriu.' })
    if (!brand) return res.status(400).json({ error: 'Brand-ul este obligatoriu.' })
    if (!series) return res.status(400).json({ error: 'Series este obligatoriu.' })
    if (!modelNumber) return res.status(400).json({ error: 'Model number este obligatoriu.' })
    if (!technicalDescription) return res.status(400).json({ error: 'Specificațiile tehnice sunt obligatorii.' })
    if (!['industrial', 'residential'].includes(usageType)) {
      return res.status(400).json({ error: 'Tip invalid. Folosește industrial sau residential.' })
    }

    const updated = await prisma.productModel.update({
      where: { id },
      data: { name, brand, series, modelNumber, technicalDescription, usageType, imageUrl, availableForStock },
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

app.get('/api/admin/product-models', authMiddleware, adminAuthMiddleware, listProductModelsHandler)
app.get('/admin/product-models', authMiddleware, adminAuthMiddleware, listProductModelsHandler)
app.patch('/api/admin/product-models/:id', authMiddleware, adminAuthMiddleware, updateProductModelHandler)
app.patch('/admin/product-models/:id', authMiddleware, adminAuthMiddleware, updateProductModelHandler)
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
