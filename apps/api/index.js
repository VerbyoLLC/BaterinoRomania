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
const { sendVerificationCode, sendPasswordResetEmail, sendAccountDeletedEmail, isMailConfigured } = require('./lib/mail.js')
const { uploadToR2, generateKey, isR2Configured } = require('./lib/r2.js')

const uploadMiddleware = multer({ storage: multer.memoryStorage() })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })
const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'baterino-dev-secret-change-in-production'

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

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

// ── Auth: Signup (step 1) ─────────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  try {
    const body = req.body || {}
    const email = String(body.email || '').trim().toLowerCase()
    const password = body.password
    const role = body.role

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

    const verificationCode = String(Math.floor(1000 + Math.random() * 9000))
    const verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        verificationCode,
        verificationCodeExpiresAt,
      },
    })

    await sendVerificationCode(email, verificationCode, role)

    console.log('[Signup] User created:', user.id, user.email, isMailConfigured() ? '(email sent)' : '(SMTP not configured)')

    return res.status(201).json({
      message: 'Cont creat. Verifică emailul pentru cod.',
      email: user.email,
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

    if (!email) {
      return res.status(400).json({ error: 'Email este obligatoriu.' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(404).json({ error: 'Contul nu a fost găsit.' })
    }

    const verificationCode = String(Math.floor(1000 + Math.random() * 9000))
    const verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode, verificationCodeExpiresAt },
    })

    await sendVerificationCode(email, verificationCode, user.role)

    return res.json({ message: 'Cod retrimis.' })
  } catch (err) {
    console.error('Resend error:', err)
    res.status(500).json({ error: 'Eroare la retrimiterea codului.' })
  }
})

// ── Auth: Verify code (step 2) ────────────────────────────────────────
app.post('/api/auth/verify', async (req, res) => {
  try {
    const body = req.body || {}
    const email = String(body.email || '').trim().toLowerCase()
    const code = body.code

    if (!email || !code) {
      return res.status(400).json({ error: 'Email și cod sunt obligatorii.' })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })
    if (!user) {
      return res.status(404).json({ error: 'Contul nu a fost găsit.' })
    }

    if (!user.verificationCode) {
      return res.status(400).json({ error: 'Cod expirat. Te rugăm să te înregistrezi din nou.' })
    }

    if (new Date() > user.verificationCodeExpiresAt) {
      return res.status(400).json({ error: 'Cod expirat. Te rugăm să ceri un cod nou.' })
    }

    if (code !== user.verificationCode) {
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

    console.log('[Forgot password] Reset requested for:', user.email, isMailConfigured() ? '(email sent)' : '(SMTP not configured)')

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

// ── Partner profile (protejat, doar parteneri) ──────────────────────────
app.put('/api/partner/profile', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'partener') {
      return res.status(403).json({ error: 'Doar partenerii pot accesa acest endpoint.' })
    }

    const body = req.body || {}
    const userId = req.userId

    const existing = await prisma.partner.findUnique({ where: { userId } })

    const legal = {
      companyName: body.companyName,
      cui: body.cui,
      address: body.address,
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
      return res.json(partner)
    }

    if (!legal.companyName || !legal.cui || !legal.contactFirstName || !legal.contactLastName || !legal.phone || !legal.activityTypes) {
      return res.status(400).json({
        error: 'Lipsesc câmpuri obligatorii: companyName, cui, contactFirstName, contactLastName, phone, activityTypes.',
      })
    }

    const createData = { userId, ...legal, isApproved: false }
    for (const [k, v] of Object.entries(publicFields)) {
      if (v !== undefined && v !== null && v !== '') createData[k] = v
    }
    const partner = await prisma.partner.create({
      data: createData,
    })
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
    })
    if (!partner) return res.status(404).json({ error: 'Profil partener negăsit.' })
    return res.json(partner)
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

    await sendAccountDeletedEmail(user.email)

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

// ── Admin: list companies (partners) ───────────────────────────────────
const adminCompaniesHandler = async (req, res) => {
  try {
    const partners = await prisma.partner.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return res.json(partners)
  } catch (err) {
    console.error('Admin companies error:', err)
    const msg = err?.message || 'Eroare la încărcarea companiilor.'
    res.status(500).json({ error: msg })
  }
}
app.get('/api/admin/companies', authMiddleware, adminAuthMiddleware, adminCompaniesHandler)
app.get('/admin/companies', authMiddleware, adminAuthMiddleware, adminCompaniesHandler)

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
    return res.json(partner)
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
    const partner = await prisma.partner.update({
      where: { id },
      data: { isApproved: true },
      include: { user: { select: { email: true } } },
    })
    return res.json(partner)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Companie negăsită.' })
    console.error('Admin approve error:', err)
    res.status(500).json({ error: err?.message || 'Eroare la aprobare.' })
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
    const key = generateKey(req.file.originalname, prefix, req.file.mimetype)
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
    const title = String(body.title || '').trim()
    const sku = String(body.sku || '').trim()
    const tipProdus = ['rezidential', 'industrial'].includes(body.tipProdus) ? body.tipProdus : 'rezidential'

    if (!title || !sku) {
      return res.status(400).json({ error: 'Titlul și SKU sunt obligatorii.' })
    }

    const landedPrice = parseDecimal(body.landedPrice, 0)
    const salePrice = parseDecimal(body.salePrice, 0)
    const vat = parseDecimal(body.vat, 19)

    const images = Array.isArray(body.images) ? body.images : []
    const documenteTehnice = Array.isArray(body.documenteTehnice) ? body.documenteTehnice : []
    const faq = Array.isArray(body.faq) ? body.faq : []

    const product = await prisma.product.create({
      data: {
        status,
        title,
        sku,
        description: body.description?.trim() || null,
        tipProdus,
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
        dimensiuni: body.dimensiuni?.trim() || null,
        protectie: body.protectie?.trim() || null,
        certificari: body.certificari?.trim() || null,
        garantie: body.garantie?.trim() || null,
        tensiuneNominala: body.tensiuneNominala?.trim() || null,
        eficientaCiclu: body.eficientaCiclu?.trim() || null,
        temperaturaFunctionare: body.temperaturaFunctionare?.trim() || null,
        temperaturaStocare: body.temperaturaStocare?.trim() || null,
        umiditate: body.umiditate?.trim() || null,
        images,
        documenteTehnice,
        faq,
      },
    })
    return res.status(201).json(product)
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

// ── 404 catch-all (pentru debug) ───────────────────────────────────────
app.use((req, res) => {
  console.log('[404]', req.method, req.url)
  res.status(404).json({ error: 'Rută negăsită', path: req.url, method: req.method })
})

const server = app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})

// Prevent process from exiting when run under npm/concurrently
process.on('SIGTERM', () => server.close())
process.on('SIGINT', () => server.close())
