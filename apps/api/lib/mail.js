const nodemailer = require('nodemailer')
const { Resend } = require('resend')
const { getClientTemplate, getPartnerTemplate } = require('../templates/verification-email.js')
const { getPasswordResetTemplate } = require('../templates/password-reset-email.js')
const { getAccountDeletedTemplate } = require('../templates/account-deleted-email.js')
const { getInquiryNotificationTemplate, getInquiryConfirmationTemplate } = require('../templates/inquiry-email.js')

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

const INQUIRY_NOTIFICATION_RECIPIENTS = ['alexander@baterino.ro', 'razvan@baterino.ro']
const INQUIRY_CONFIRMATION_FROM = process.env.RESEND_FROM || process.env.MAIL_FROM || 'Baterino <no-reply@baterino.ro>'

async function sendInquiryNotification(inquiry) {
  if (!isMailConfigured()) {
    console.warn('[Mail] No mail configured – skipping inquiry notification.')
    return
  }

  const subject = `Contact nou – ${inquiry.registrationNumber || inquiry.id} – ${SITE_NAME}`
  const html = getInquiryNotificationTemplate(inquiry)

  for (const to of INQUIRY_NOTIFICATION_RECIPIENTS) {
    try {
      if (resend) {
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
  const fromAddr = resend ? INQUIRY_CONFIRMATION_FROM : MAIL_FROM

  try {
    if (resend) {
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
  sendVerificationCode,
  sendPasswordResetEmail,
  sendAccountDeletedEmail,
  sendInquiryNotification,
  sendInquiryConfirmation,
  isMailConfigured,
  getMailProvider,
  getMailFrom,
}
