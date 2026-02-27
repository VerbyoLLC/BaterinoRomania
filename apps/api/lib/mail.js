const nodemailer = require('nodemailer')
const { getClientTemplate, getPartnerTemplate } = require('../templates/verification-email.js')
const { getPasswordResetTemplate } = require('../templates/password-reset-email.js')
const { getAccountDeletedTemplate } = require('../templates/account-deleted-email.js')

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const MAIL_FROM = process.env.MAIL_FROM || 'Baterino <noreply@baterino.ro>'
const SITE_NAME = process.env.SITE_NAME || 'Baterino Romania'

function isMailConfigured() {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  )
}

async function sendVerificationCode(email, code, role) {
  if (!isMailConfigured()) {
    console.warn('[Mail] SMTP not configured – skipping send. Code:', code)
    return
  }

  const subject = role === 'partener'
    ? `Codul tău de verificare – ${SITE_NAME}`
    : `Codul tău de verificare – ${SITE_NAME}`

  const html = role === 'partener'
    ? getPartnerTemplate({ code, email })
    : getClientTemplate({ code, email })

  await transporter.sendMail({
    from: MAIL_FROM,
    to: email,
    subject,
    html,
  })
}

async function sendPasswordResetEmail(email, resetUrl) {
  if (!isMailConfigured()) {
    console.warn('[Mail] SMTP not configured – skipping send. Reset URL:', resetUrl)
    return
  }

  const subject = `Resetează parola – ${SITE_NAME}`
  const html = getPasswordResetTemplate({ resetUrl, email })

  await transporter.sendMail({
    from: MAIL_FROM,
    to: email,
    subject,
    html,
  })
}

async function sendAccountDeletedEmail(email) {
  if (!isMailConfigured()) {
    console.warn('[Mail] SMTP not configured – skipping account deleted email.')
    return
  }

  const subject = `Contul tău a fost șters – ${SITE_NAME}`
  const html = getAccountDeletedTemplate({ email })

  await transporter.sendMail({
    from: MAIL_FROM,
    to: email,
    subject,
    html,
  })
}

module.exports = { sendVerificationCode, sendPasswordResetEmail, sendAccountDeletedEmail, isMailConfigured }
