const nodemailer = require('nodemailer')
const { Resend } = require('resend')
const { getClientTemplate, getPartnerTemplate } = require('../templates/verification-email.js')
const { getVerifyLinkTemplate } = require('../templates/signup-verify-link-email.js')
const { getPasswordResetTemplate } = require('../templates/password-reset-email.js')
const { getAccountDeletedTemplate } = require('../templates/account-deleted-email.js')
const { getInquiryNotificationTemplate, getInquiryConfirmationTemplate } = require('../templates/inquiry-email.js')
/** Reîncarcă modulul la fiecare trimitere — evită cache-ul Node `require` (altfel rămâne textul vechi până la restart API). */
function getPartnerApplicationReceivedTemplateRender() {
  const resolved = require.resolve('../templates/partner-application-received-email.js')
  delete require.cache[resolved]
  return require(resolved).getPartnerApplicationReceivedTemplate
}

function getPartnerAccountApprovedTemplateRender() {
  const resolved = require.resolve('../templates/partner-account-approved-email.js')
  delete require.cache[resolved]
  return require(resolved).getPartnerAccountApprovedTemplate
}

function getPartnerAssignedToAgentTemplateRender() {
  const resolved = require.resolve('../templates/partner-assigned-to-agent-email.js')
  delete require.cache[resolved]
  const mod = require(resolved)
  return {
    getPartnerAssignedToAgentTemplate: mod.getPartnerAssignedToAgentTemplate,
    formatLegalAddress: mod.formatLegalAddress,
  }
}

function getReferralInviteTemplateRender() {
  const resolved = require.resolve('../templates/referral-invite-email.js')
  delete require.cache[resolved]
  return require(resolved).getReferralInviteTemplate
}

function getResidentialOrderProformaTemplateRender() {
  const resolved = require.resolve('../templates/order-proforma-email.js')
  delete require.cache[resolved]
  return require(resolved).getResidentialOrderProformaTemplate
}

function getServiceRequestReceivedTemplateRender() {
  const resolved = require.resolve('../templates/service-request-received-email.js')
  delete require.cache[resolved]
  return require(resolved).getServiceRequestReceivedTemplate
}

function getReturRequestReceivedTemplateBundle() {
  const resolved = require.resolve('../templates/retur-request-received-email.js')
  delete require.cache[resolved]
  return require(resolved)
}

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

/**
 * Partener: după completarea formularului (activități + contact), înainte de aprobare admin.
 * @returns {Promise<boolean>} true dacă mesajul a fost trimis (sau s-a încercat trimiterea reușită)
 */
async function sendPartnerApplicationReceivedEmail(email, { contactFirstName, companyName } = {}) {
  if (!isMailConfigured()) {
    console.warn('[Mail] No mail configured – skipping partner application received email.')
    return false
  }

  const subject = `Am primit cererea ta de parteneriat – ${SITE_NAME}`
  const getPartnerApplicationReceivedTemplate = getPartnerApplicationReceivedTemplateRender()
  const html = getPartnerApplicationReceivedTemplate({ contactFirstName, companyName })
  const fromAddr = useResend() ? INQUIRY_CONFIRMATION_FROM : MAIL_FROM

  try {
    if (useResend()) {
      const { error } = await resend.emails.send({
        from: fromAddr,
        to: email,
        subject,
        html,
      })
      if (error) {
        console.error('[Mail] Resend partner application received error:', error)
        return false
      }
    } else {
      await transporter.sendMail({
        from: fromAddr,
        to: email,
        subject,
        html,
      })
    }
    return true
  } catch (err) {
    console.error('[Mail] Partner application received error:', err?.message)
    return false
  }
}

const PARTNER_LOGIN_URL = envTrim('PARTNER_LOGIN_URL') || 'https://app.baterino.com/login'

function defaultSalesAgentPanelUrl() {
  const explicit = envTrim('SALES_AGENT_PANEL_URL')
  if (explicit) return explicit
  const base = envTrim('FRONTEND_URL')
  if (base) return `${base.replace(/\/+$/, '')}/sales-agent`
  if (PARTNER_LOGIN_URL.endsWith('/login')) {
    return PARTNER_LOGIN_URL.replace(/\/login\/?$/, '/sales-agent')
  }
  return 'https://app.baterino.com/sales-agent'
}

/**
 * Partener: după aprobarea contului de către echipa Baterino (prima aprobare).
 * @returns {Promise<boolean>} true dacă trimiterea a reușit
 */
async function sendPartnerAccountApprovedEmail(email) {
  if (!isMailConfigured()) {
    console.warn('[Mail] No mail configured – skipping partner account approved email.')
    return false
  }

  const subject = `Contul tău de partener a fost aprobat – ${SITE_NAME}`
  const getPartnerAccountApprovedTemplate = getPartnerAccountApprovedTemplateRender()
  const html = getPartnerAccountApprovedTemplate({ loginUrl: PARTNER_LOGIN_URL })
  const fromAddr = useResend() ? INQUIRY_CONFIRMATION_FROM : MAIL_FROM

  try {
    if (useResend()) {
      const { error } = await resend.emails.send({
        from: fromAddr,
        to: email,
        subject,
        html,
      })
      if (error) {
        console.error('[Mail] Resend partner account approved error:', error)
        return false
      }
    } else {
      await transporter.sendMail({
        from: fromAddr,
        to: email,
        subject,
        html,
      })
    }
    return true
  } catch (err) {
    console.error('[Mail] Partner account approved error:', err?.message)
    return false
  }
}

/**
 * Agent de vânzări: partener nou aprobat și atribuit (prima aprobare + agent alocat).
 * @param {string} agentEmail
 * @param {object} details
 * @returns {Promise<boolean>}
 */
async function sendSalesAgentPartnerAssignedEmail(agentEmail, details) {
  const to = String(agentEmail || '').trim()
  if (!to) return false
  if (!isMailConfigured()) {
    console.warn('[Mail] No mail configured – skipping sales agent partner assigned email.')
    return false
  }

  const { getPartnerAssignedToAgentTemplate, formatLegalAddress } = getPartnerAssignedToAgentTemplateRender()
  const companyName = String(details?.companyName || '').trim() || 'Partener'
  const subject = `Partener nou atribuit: ${companyName} – ${SITE_NAME}`
  const legalAddress =
    details.legalAddress != null && String(details.legalAddress).trim()
      ? String(details.legalAddress).trim()
      : formatLegalAddress(details)
  const html = getPartnerAssignedToAgentTemplate({
    agentFirstName: details?.agentFirstName,
    companyName: details.companyName,
    cui: details.cui,
    tradeRegisterNumber: details.tradeRegisterNumber,
    legalAddress,
    activityTypes: details.activityTypes,
    contactName: details.contactName,
    contactPhone: details.contactPhone,
    contactEmail: details.contactEmail,
    website: details.website,
    partnerDiscountPercent: details.partnerDiscountPercent ?? null,
    panelUrl: details.panelUrl || defaultSalesAgentPanelUrl(),
  })
  const fromAddr = useResend() ? INQUIRY_CONFIRMATION_FROM : MAIL_FROM

  try {
    if (useResend()) {
      const { error } = await resend.emails.send({
        from: fromAddr,
        to,
        subject,
        html,
      })
      if (error) {
        console.error('[Mail] Resend sales agent partner assigned error:', error)
        return false
      }
    } else {
      await transporter.sendMail({
        from: fromAddr,
        to,
        subject,
        html,
      })
    }
    return true
  } catch (err) {
    console.error('[Mail] Sales agent partner assigned error:', err?.message)
    return false
  }
}

/**
 * Trimite prietenului codul de recomandare în numele clientului.
 * @param {{ to: string, senderName: string, referralCode: string }} params
 */
async function sendReferralInviteEmail({ to, senderName, referralCode }) {
  if (!isMailConfigured()) {
    throw new Error('Serviciul de email nu este configurat.')
  }
  const baseUrl = (envTrim('FRONTEND_URL') || 'https://baterino.ro').replace(/\/$/, '')
  const registerUrl = `${baseUrl}/login`
  const html = getReferralInviteTemplateRender()({
    senderName: senderName || 'Un client Baterino',
    referralCode,
    registerUrl,
    assetBaseUrl: baseUrl,
  })
  const safeSubjectName = String(senderName || 'Un prieten')
    .replace(/[\r\n\u202E\u202D]/g, ' ')
    .slice(0, 80)
  const subject = `${safeSubjectName} ți-a trimis codul de 5% reducere – ${SITE_NAME}`

  if (useResend()) {
    const { error } = await resend.emails.send({
      from: RESEND_FROM,
      to,
      subject,
      html,
    })
    if (error) {
      console.error('[Mail] Resend referral invite error:', error)
      throw new Error('Eroare la trimiterea emailului.')
    }
    return
  }

  await transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject,
    html,
  })
}

/**
 * Trimite emailul de confirmare comandă cu proforma în atașament.
 * Eșecul este logat dar nu este aruncat — emailul nu trebuie să blocheze înregistrarea comenzii.
 *
 * @param {{
 *   to: string,
 *   order: any,
 *   lines: Array<any>,
 *   currency: string,
 *   supplier: { name: string, cui: string, ibanRon: string, bankName: string },
 *   payment: { reference: string, paymentDueStr: string },
 *   totalIncl: number,
 *   pdfBuffer: Buffer,
 *   pdfFilename: string,
 * }} params
 * @returns {Promise<boolean>}
 */
async function sendResidentialOrderProformaEmail(params) {
  const {
    to,
    order,
    lines,
    currency,
    supplier,
    payment,
    totalIncl,
    pdfBuffer,
    pdfFilename,
  } = params
  if (!isMailConfigured()) {
    console.warn('[Mail] No mail configured – skipping order proforma email.')
    return false
  }
  if (!to || typeof to !== 'string') {
    console.warn('[Mail] No recipient for order proforma email – skipping.')
    return false
  }

  const orderNumber = String(order?.orderNumber || '').trim()
  const subject = orderNumber
    ? `Comanda ${orderNumber} – proforma ${SITE_NAME}`
    : `Confirmare comandă – ${SITE_NAME}`

  const getTemplate = getResidentialOrderProformaTemplateRender()
  const html = getTemplate({ order, lines, currency, supplier, payment, totalIncl })
  const fromAddr = useResend() ? INQUIRY_CONFIRMATION_FROM : MAIL_FROM
  const filename = String(pdfFilename || 'proforma.pdf')

  try {
    if (useResend()) {
      const { error } = await resend.emails.send({
        from: fromAddr,
        to,
        subject,
        html,
        attachments: pdfBuffer
          ? [
              {
                filename,
                content: Buffer.isBuffer(pdfBuffer) ? pdfBuffer.toString('base64') : pdfBuffer,
              },
            ]
          : undefined,
      })
      if (error) {
        console.error('[Mail] Resend order proforma error:', error)
        return false
      }
    } else {
      await transporter.sendMail({
        from: fromAddr,
        to,
        subject,
        html,
        attachments: pdfBuffer
          ? [
              {
                filename,
                content: pdfBuffer,
                contentType: 'application/pdf',
              },
            ]
          : undefined,
      })
    }
    return true
  } catch (err) {
    console.error('[Mail] Order proforma email error:', err?.message || err)
    return false
  }
}

/**
 * Confirmare către utilizator după crearea unei cereri de service.
 * Conține numărul cererii (BTROS-…), produsul și problema descrisă.
 *
 * @param {{
 *   email: string,
 *   requestNumber: string,
 *   firstName?: string,
 *   productTitle: string,
 *   serialNumber: string,
 *   modelNumber: string,
 *   problemDescription: string,
 * }} params
 * @returns {Promise<boolean>}
 */
async function sendServiceRequestReceivedEmail(params) {
  const { email } = params
  if (!isMailConfigured()) {
    console.warn('[Mail] No mail configured – skipping service request received email.')
    return false
  }
  if (!email || typeof email !== 'string') {
    console.warn('[Mail] No recipient for service request email – skipping.')
    return false
  }

  const subject = `Cerere service primită ${params.requestNumber || ''} – ${SITE_NAME}`.trim()
  const getTemplate = getServiceRequestReceivedTemplateRender()
  const html = getTemplate(params)
  const fromAddr = useResend() ? INQUIRY_CONFIRMATION_FROM : MAIL_FROM

  try {
    if (useResend()) {
      const { error } = await resend.emails.send({
        from: fromAddr,
        to: email,
        subject,
        html,
      })
      if (error) {
        console.error('[Mail] Resend service request received error:', error)
        return false
      }
    } else {
      await transporter.sendMail({
        from: fromAddr,
        to: email,
        subject,
        html,
      })
    }
    return true
  } catch (err) {
    console.error('[Mail] Service request received error:', err?.message || err)
    return false
  }
}

/**
 * Confirmare către utilizator după înregistrarea unei cereri de retur (formular site).
 *
 * @param {{
 *   email: string,
 *   locale?: string,
 *   registrationNumber: string,
 *   firstName?: string,
 *   orderNumber: string,
 *   productBrand: string,
 *   productModel: string,
 * }} params
 * @returns {Promise<boolean>}
 */
async function sendReturRequestReceivedEmail(params) {
  const { email, registrationNumber } = params
  if (!isMailConfigured()) {
    console.warn('[Mail] No mail configured – skipping retur request received email.')
    return false
  }
  if (!email || typeof email !== 'string') {
    console.warn('[Mail] No recipient for retur confirmation email – skipping.')
    return false
  }

  const bundle = getReturRequestReceivedTemplateBundle()
  const locale = typeof params.locale === 'string' ? params.locale : 'ro'
  const html = bundle.getReturRequestReceivedTemplate({
    locale,
    registrationNumber,
    firstName: params.firstName,
    orderNumber: params.orderNumber,
    productBrand: params.productBrand,
    productModel: params.productModel,
  })
  const subject = bundle.subjectForLocale(locale, registrationNumber)
  const fromAddr = useResend() ? INQUIRY_CONFIRMATION_FROM : MAIL_FROM

  try {
    if (useResend()) {
      const { error } = await resend.emails.send({
        from: fromAddr,
        to: email,
        subject,
        html,
      })
      if (error) {
        console.error('[Mail] Resend retur request received error:', error)
        return false
      }
    } else {
      await transporter.sendMail({
        from: fromAddr,
        to: email,
        subject,
        html,
      })
    }
    return true
  } catch (err) {
    console.error('[Mail] Retur request received error:', err?.message || err)
    return false
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
  sendReferralInviteEmail,
  sendPartnerApplicationReceivedEmail,
  sendPartnerAccountApprovedEmail,
  sendSalesAgentPartnerAssignedEmail,
  sendResidentialOrderProformaEmail,
  sendServiceRequestReceivedEmail,
  sendReturRequestReceivedEmail,
  isMailConfigured,
  getMailProvider,
  getMailFrom,
  getMailDebugInfo,
  verifySmtpConnection,
}
