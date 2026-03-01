const nodemailer = require('nodemailer')
const { Resend } = require('resend')
const { getClientTemplate, getPartnerTemplate } = require('../templates/verification-email.js')
const { getPasswordResetTemplate } = require('../templates/password-reset-email.js')
const { getAccountDeletedTemplate } = require('../templates/account-deleted-email.js')

const MAIL_FROM = process.env.MAIL_FROM || 'Baterino <noreply@baterino.ro>'
const SITE_NAME = process.env.SITE_NAME || 'Baterino Romania'

// Resend (HTTP API) – works on Railway Free/Hobby; SMTP is blocked on those plans
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
// Use onboarding@resend.dev if no RESEND_FROM – works without domain verification
const RESEND_FROM = process.env.RESEND_FROM || process.env.MAIL_FROM || 'Baterino <onboarding@resend.dev>'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

function isMailConfigured() {
  if (resend) return true
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

function getMailProvider() {
  if (resend) return 'Resend'
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return 'SMTP'
  return null
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

  if (resend) {
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

  if (resend) {
    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: email,
      subject,
      html,
    })
    if (error) {
      console.error('[Mail] Resend error:', error)
      throw new Error('Eroare la trimiterea emailului.')
    }
    console.log('[Mail] Resend sent successfully, id:', data?.id)
    return
  }

  await transporter.sendMail({
    from: MAIL_FROM,
    to: email,
    subject,
    html,
  })
}

async function sendAccountDeletedEmail(email) {
  if (!isMailConfigured()) {
    console.warn('[Mail] No mail configured – skipping account deleted email.')
    return
  }

  const subject = `Contul tău a fost șters – ${SITE_NAME}`
  const html = getAccountDeletedTemplate({ email })

  if (resend) {
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
  return resend ? RESEND_FROM : MAIL_FROM
}

module.exports = { sendVerificationCode, sendPasswordResetEmail, sendAccountDeletedEmail, isMailConfigured, getMailProvider, getMailFrom }
