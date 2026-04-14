const nodemailer = require('nodemailer')
const { Resend } = require('resend')
const { getClientTemplate, getPartnerTemplate } = require('../templates/verification-email.js')
const { getVerifyLinkTemplate } = require('../templates/signup-verify-link-email.js')
const { getPasswordResetTemplate } = require('../templates/password-reset-email.js')
const { getAccountDeletedTemplate } = require('../templates/account-deleted-email.js')
const { getInquiryNotificationTemplate, getInquiryConfirmationTemplate } = require('../templates/inquiry-email.js')

function envTrim(name, fallback = '') {
  const v = process.env[name]
  if (v == null || v === '') return fallback
  return String(v).trim()
}

const MAIL_FROM = envTrim('MAIL_FROM') || 'Baterino <noreply@baterino.ro>'
/** From address for signup email confirmation (link). Resend: domain must be verified. */
const VERIFICATION_MAIL_FROM =
  envTrim('VERIFICATION_MAIL_FROM') || envTrim('RESEND_FROM') || 'Baterino <no-reply@baterino.ro>'
const SITE_NAME = envTrim('SITE_NAME') || 'Baterino Romania'

const RESEND_API_KEY = envTrim('RESEND_API_KEY')
const RESEND_FROM = envTrim('RESEND_FROM') || envTrim('MAIL_FROM') || 'Baterino <onboarding@resend.dev>'

const SMTP_HOST = envTrim('SMTP_HOST')
const SMTP_USER = envTrim('SMTP_USER')
const SMTP_PASS = envTrim('SMTP_PASS')
const SMTP_PORT = Number(envTrim('SMTP_PORT')) || 587
const SMTP_SECURE_EXPLICIT = envTrim('SMTP_SECURE').toLowerCase()
/** Port 465 expects implicit TLS unless overridden */
const SMTP_SECURE =
  SMTP_SECURE_EXPLICIT === 'true' || (SMTP_SECURE_EXPLICIT !== 'false' && SMTP_PORT === 465)

/**
 * auto — Resend dacă există RESEND_API_KEY, altfel SMTP dacă e complet configurat
 * smtp — forțează SMTP (ignoră Resend; doar dacă ai nevoie explicit de relay SMTP)
 * resend — forțează Resend
 */
let MAIL_DRIVER = (envTrim('MAIL_DRIVER').toLowerCase() || 'auto').replace(/[^a-z]/g, '') || 'auto'
if (!['auto', 'smtp', 'resend'].includes(MAIL_DRIVER)) {
  console.warn('[Mail] MAIL_DRIVER invalid, using auto:', MAIL_DRIVER)
  MAIL_DRIVER = 'auto'
}

const smtpConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS)
const resendConfigured = Boolean(RESEND_API_KEY)
const resend = resendConfigured ? new Resend(RESEND_API_KEY) : null

const transporter = nodemailer.createTransport({
  host: SMTP_HOST || undefined,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  /** SiteGround 587: STARTTLS după conectare; 465: TLS direct (secure: true) */
  requireTLS: !SMTP_SECURE && SMTP_PORT === 587,
  tls: { minVersion: 'TLSv1.2' },
  auth:
    SMTP_HOST && SMTP_USER
      ? {
          user: SMTP_USER,
          pass: SMTP_PASS,
        }
      : undefined,
})

/**
 * Transportul folosit la trimitere: 'resend' | 'smtp' | null
 */
function getEffectiveMailProvider() {
  if (MAIL_DRIVER === 'smtp') return smtpConfigured ? 'smtp' : null
  if (MAIL_DRIVER === 'resend') return resendConfigured ? 'resend' : null
  // auto: prefer Resend (API HTTP); SMTP only if Resend is not configured
  if (resendConfigured) return 'resend'
  if (smtpConfigured) return 'smtp'
  return null
}

function isMailConfigured() {
  return getEffectiveMailProvider() !== null
}

function getMailProvider() {
  return getEffectiveMailProvider()
}

function getMailDebugInfo() {
  const eff = getEffectiveMailProvider()
  const hints = []
  if (MAIL_DRIVER === 'auto' && resendConfigured && smtpConfigured) {
    hints.push(
      'Ai atât RESEND_API_KEY cât și SMTP setate: modul „auto” folosește Resend. Pentru SMTP direct setează MAIL_DRIVER=smtp sau scoate RESEND_API_KEY.',
    )
  }
  if (eff === 'smtp' && SMTP_PORT === 587 && SMTP_SECURE) {
    hints.push('Pe portul 587 de obicei SMTP_SECURE=false (STARTTLS). Pentru 465 folosește SMTP_SECURE=true.')
  }
  if (eff === 'smtp') {
    hints.push(
      'Multe servere resping mesajul dacă „From” nu coincide cu contul SMTP. Aliniază VERIFICATION_MAIL_FROM / MAIL_FROM cu adresa autentificată.',
    )
  }
  return {
    mailDriverRequested: MAIL_DRIVER,
    effectiveProvider: eff,
    smtpConfigured,
    resendConfigured,
    smtpHostSet: Boolean(SMTP_HOST),
    smtpPort: SMTP_PORT,
    smtpSecure: SMTP_SECURE,
    hints,
  }
}

async function verifySmtpConnection() {
  const eff = getEffectiveMailProvider()
  if (eff !== 'smtp') {
    return { ok: false, skipped: true, reason: 'SMTP nu este transportul activ (vezi MAIL_DRIVER și variabilele).' }
  }
  return new Promise((resolve) => {
    transporter.verify((err) => {
      if (err) resolve({ ok: false, error: err.message || String(err) })
      else resolve({ ok: true })
    })
  })
}

function useResend() {
  return getEffectiveMailProvider() === 'resend' && resend
}

async function sendSignupVerificationLink(email, verifyUrl, role) {
  if (!isMailConfigured()) {
    console.warn('[Mail] No mail configured – skipping signup verify link. URL:', verifyUrl)
    return
  }

  const subject = `Confirmă contul – ${SITE_NAME}`
  const html = getVerifyLinkTemplate({ verifyUrl, email, role })

  if (useResend()) {
    const { error } = await resend.emails.send({
      from: VERIFICATION_MAIL_FROM,
      to: email,
      subject,
      html,
    })
    if (error) {
      console.error('[Mail] Resend signup verify error:', error)
      throw new Error('Eroare la trimiterea emailului.')
    }
    return
  }

  await transporter.sendMail({
    from: VERIFICATION_MAIL_FROM,
    to: email,
    subject,
    html,
  })
}

async function sendVerificationCode(email, code, role) {
  if (!isMailConfigured()) {
    console.warn('[Mail] No mail configured (Resend or SMTP) – skipping send. Code:', code)
    return
  }

  const subject = role === 'partener'
    ? `Codul tău de verificare – ${SITE_NAME}`
    : `Codul tău de verificare – ${SITE_NAME}`

  const html = role === 'partener'
    ? getPartnerTemplate({ code, email })
    : getClientTemplate({ code, email })

  if (useResend()) {
    const { error } = await resend.emails.send({
      from: RESEND_FROM,
      to: email,
      subject,
      html,
    })
    if (error) {
      console.error('[Mail] Resend error:', error)
      throw new Error('Eroare la trimiterea emailului.')
    }
    return
  }

  await transporter.sendMail({
    from: MAIL_FROM,
    to: email,
    subject,
    html,
  })
}

async function sendPasswordResetEmail(email, resetUrl) {
  if (!isMailConfigured()) {
    console.warn('[Mail] No mail configured – skipping send. Reset URL:', resetUrl)
    return
  }

  const subject = `Resetează parola – ${SITE_NAME}`
  const html = getPasswordResetTemplate({ resetUrl, email })

  if (useResend()) {
    const { error } = await resend.emails.send({
      from: RESEND_FROM,
      to: email,
      subject,
      html,
    })
    if (error) {
      console.error('[Mail] Resend error:', error)
      throw new Error('Eroare la trimiterea emailului.')
    }
    return
  }

  await transporter.sendMail({
    from: MAIL_FROM,
    to: email,
    subject,
    html,
  })
}

async function sendAccountDeletedEmail(email, role = 'partener') {
  if (!isMailConfigured()) {
    console.warn('[Mail] No mail configured – skipping account deleted email.')
    return
  }

  const subject = `Contul tău a fost șters – ${SITE_NAME}`
  const html = getAccountDeletedTemplate({ email, role })

  if (useResend()) {
    const { error } = await resend.emails.send({
      from: RESEND_FROM,
      to: email,
      subject,
      html,
    })
    if (error) {
      console.error('[Mail] Resend error:', error)
      throw new Error('Eroare la trimiterea emailului.')
    }
    return
  }

  await transporter.sendMail({
    from: MAIL_FROM,
    to: email,
    subject,
    html,
  })
}

function getMailFrom() {
  return useResend() ? RESEND_FROM : MAIL_FROM
}

const INQUIRY_NOTIFICATION_RECIPIENTS = ['alexander@baterino.ro', 'razvan@baterino.ro']
const INQUIRY_CONFIRMATION_FROM = envTrim('RESEND_FROM') || envTrim('MAIL_FROM') || 'Baterino <no-reply@baterino.ro>'

async function sendInquiryNotification(inquiry) {
  if (!isMailConfigured()) {
    console.warn('[Mail] No mail configured – skipping inquiry notification.')
    return
  }

  const subject = `Contact nou – ${inquiry.registrationNumber || inquiry.id} – ${SITE_NAME}`
  const html = getInquiryNotificationTemplate(inquiry)

  for (const to of INQUIRY_NOTIFICATION_RECIPIENTS) {
    try {
      if (useResend()) {
        const { error } = await resend.emails.send({
          from: RESEND_FROM,
          to,
          subject,
          html,
        })
        if (error) {
          console.error('[Mail] Resend inquiry notification error:', error)
        }
      } else {
        await transporter.sendMail({
          from: MAIL_FROM,
          to,
          subject,
          html,
        })
      }
    } catch (err) {
      console.error('[Mail] Inquiry notification to', to, err?.message)
    }
  }
}

async function sendInquiryConfirmation(inquiry) {
  if (!isMailConfigured()) {
    console.warn('[Mail] No mail configured – skipping inquiry confirmation.')
    return
  }

  const subject = `Confirmare solicitare ${inquiry.registrationNumber || ''} – ${SITE_NAME}`
  const html = getInquiryConfirmationTemplate(inquiry)
  const fromAddr = useResend() ? INQUIRY_CONFIRMATION_FROM : MAIL_FROM

  try {
    if (useResend()) {
      const { error } = await resend.emails.send({
        from: fromAddr,
        to: inquiry.email,
        subject,
        html,
      })
      if (error) {
        console.error('[Mail] Resend inquiry confirmation error:', error)
      }
    } else {
      await transporter.sendMail({
        from: fromAddr,
        to: inquiry.email,
        subject,
        html,
      })
    }
  } catch (err) {
    console.error('[Mail] Inquiry confirmation error:', err?.message)
  }
}

module.exports = {
  sendSignupVerificationLink,
  sendVerificationCode,
  sendPasswordResetEmail,
  sendAccountDeletedEmail,
  sendInquiryNotification,
  sendInquiryConfirmation,
  isMailConfigured,
  getMailProvider,
  getMailFrom,
  getMailDebugInfo,
  verifySmtpConnection,
}
