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
  isMailConfigured,
  getMailProvider,
  getMailFrom,
  getMailDebugInfo,
  verifySmtpConnection,
} = require('./lib/mail.js')
const { verifyGoogleIdToken } = require('./lib/google-id-token.js')
const {
  uploadToR2,
  generateKey,
  isR2Configured,
  urlToKey,
  deleteFromR2,
  ensureGuestOrderFolder,
  guestOrderDocumentKey,
} = require('./lib/r2.js')
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
        }
    return res.json({
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

app.put('/api/client/profile', authMiddleware, clientAuthMiddleware, async (req, res) => {
  try {
    const body = req.body || {}
    const section = body.section === 'personal' || body.section === 'address' ? body.section : null

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

app.get('/api/client/orders/:orderId/proforma', authMiddleware, clientAuthMiddleware, async (req, res) => {
  try {
    const emailNorm = String(req.userEmail || '')
      .trim()
      .toLowerCase()
    const orderId = String(req.params.orderId || '').trim()
    if (!orderId) return res.status(400).json({ error: 'ID comandă lipsă.' })

    const company = await readCompanyDataFromDb()
    const residential = await prisma.residentialOrder.findFirst({
      where: { id: orderId, OR: [{ userId: req.userId }, { email: emailNorm }] },
      include: { lines: { orderBy: { id: 'asc' } } },
    })
    let html
    let orderNumber
    if (residential) {
      if (!PROFORMA_ALLOWED_STATUSES.has(String(residential.fulfillmentStatus || 'de_platit'))) {
        return res.status(400).json({ error: 'Proforma nu mai este disponibilă pentru această comandă.' })
      }
      html = getProformaTemplateLib().buildResidentialOrderProformaHtml(residential, company)
      orderNumber = residential.orderNumber
    } else {
      const legacy = await prisma.guestResidentialOrder.findFirst({
        where: { id: orderId, email: emailNorm, orderSource: 'client' },
      })
      if (!legacy) return res.status(404).json({ error: 'Comandă negăsită.' })
      if (!PROFORMA_ALLOWED_STATUSES.has(String(legacy.fulfillmentStatus || 'de_platit'))) {
        return res.status(400).json({ error: 'Proforma nu mai este disponibilă pentru această comandă.' })
      }
      html = getProformaTemplateLib().buildGuestOrderProformaHtml(legacy, company)
      orderNumber = legacy.orderNumber
    }
    const safeFile = `proforma-${String(orderNumber).replace(/[^\w.-]+/g, '_')}.html`
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${safeFile}"`)
    return res.send(html)
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
    const html = getProformaTemplateLib().buildSampleProformaPreviewHtml(company)
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
  return { name, cui, address, bankAccounts }
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
      },
      update: {
        name: data.name || 'Baterino SRL',
        cui: data.cui,
        address: data.address,
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
            },
            update: {
              name: data.name,
              cui: data.cui,
              address: data.address,
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
    const billAddress = sanitizeGuestOrderText(body.billAddress)
    const billCounty = sanitizeGuestOrderText(body.billCounty)
    const billCity = sanitizeGuestOrderText(body.billCity)
    const billPostal = sanitizeGuestOrderPostal(body.billPostal)
    const deliveryDifferent = Boolean(body.differentDeliveryAddress ?? body.deliveryDifferent)
    let delAddress = body.delAddress != null ? sanitizeGuestOrderText(body.delAddress) : ''
    let delCounty = body.delCounty != null ? sanitizeGuestOrderText(body.delCounty) : ''
    let delCity = body.delCity != null ? sanitizeGuestOrderText(body.delCity) : ''
    let delPostal = body.delPostal != null ? sanitizeGuestOrderPostal(body.delPostal) : ''

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
      })
      return order
    })

    if (isR2Configured()) {
      ensureGuestOrderFolder(createdOrder.id).catch((e) =>
        console.error('[GuestOrder] R2 orders folder error:', e?.message || e),
      )
    }

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

/** Extrage numărul de serie din textul QR (SN:…, JSON, URL ?sn=) sau întreg conținutul. */
function parseSerialFromQrPayload(raw) {
  const s = String(raw ?? '').trim()
  if (!s) return ''
  const prefixed = /^SN:\s*(.+)$/i.exec(s)
  if (prefixed) return prefixed[1].trim().slice(0, 512)
  if (s.startsWith('{')) {
    try {
      const j = JSON.parse(s)
      const sn = j.SN ?? j.sn ?? j.serialNumber ?? j.serial
      if (typeof sn === 'string' && sn.trim()) return sn.trim().slice(0, 512)
    } catch {
      // ignore
    }
  }
  try {
    const u = new URL(s)
    const q = u.searchParams.get('SN') || u.searchParams.get('sn')
    if (q && q.trim()) return q.trim().slice(0, 512)
  } catch {
    // not a URL
  }
  return s.slice(0, 512)
}

const WAREHOUSE_SN_FACTORY_PREFIX = 'LJC'
const WAREHOUSE_SN_BODY_DIGITS = 16

function normalizeWarehouseSerialNumber(raw) {
  let t = String(raw ?? '')
    .replace(/\s/g, '')
    .toUpperCase()
  if (!t) return ''
  if (t.startsWith(WAREHOUSE_SN_FACTORY_PREFIX)) {
    return WAREHOUSE_SN_FACTORY_PREFIX + t.slice(WAREHOUSE_SN_FACTORY_PREFIX.length).replace(/\s/g, '')
  }
  return `${WAREHOUSE_SN_FACTORY_PREFIX}${t}`
}

function isValidWarehouseSerialNumber(serial) {
  return new RegExp(`^${WAREHOUSE_SN_FACTORY_PREFIX}\\d{${WAREHOUSE_SN_BODY_DIGITS}}$`).test(String(serial ?? ''))
}

/** 16 cifre după LJC: tensiune (2) · capacitate (4) · lună/an MMYY (4) · lot (6). Ex. 5131400325070043 → 03/2025. */
function deriveProducedOnFromSerial(serialNumber) {
  let digits = String(serialNumber ?? '').replace(/\D/g, '')
  if (digits.length > WAREHOUSE_SN_BODY_DIGITS) {
    digits = digits.slice(-WAREHOUSE_SN_BODY_DIGITS)
  }
  if (digits.length < WAREHOUSE_SN_BODY_DIGITS) return ''
  const month = digits.slice(6, 8)
  const year = digits.slice(8, 10)
  if (!/^\d{2}$/.test(month) || !/^\d{2}$/.test(year)) return ''
  const m = parseInt(month, 10)
  if (m < 1 || m > 12) return ''
  return `${month}/20${year}`
}

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
    res.set('Cache-Control', 'no-store')
    return res.json(rows.map(warehouseSavedItemToJson))
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
      return res.status(400).json({
        error:
          'SN invalid. Format: LJC (fabrică) + 16 cifre — tensiune 2, capacitate 4, lună/an 4, lot 6 (ex. LJC5131400325070001). La manual poți introduce doar cele 16 cifre după LJC.',
      })
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
