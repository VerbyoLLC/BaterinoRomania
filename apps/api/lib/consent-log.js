/** Tipuri de consimțământ înregistrate în jurnal (immutable). */
const CONSENT_TYPES = {
  TERMS_ACCOUNT: 'terms_account',
  MARKETING_EMAILS: 'marketing_emails',
  COOKIE_ANALYTICS: 'cookie_analytics',
  RETURN_POLICY: 'return_policy',
  RETURN_DECLARATION: 'return_declaration',
}

function requestClientMeta(req) {
  const rawIp =
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.ip ||
    req.socket?.remoteAddress ||
    ''
  const ipAddress = String(rawIp).split(',')[0].trim().slice(0, 45) || null
  const userAgent = String(req.headers['user-agent'] || '')
    .trim()
    .slice(0, 2048) || null
  return { ipAddress, userAgent }
}

/**
 * @param {import('../generated/prisma').PrismaClient} prisma
 * @param {import('express').Request} req
 * @param {{ userId?: string | null, consentType: string, granted: boolean }} entry
 */
async function recordConsentLog(prisma, req, entry) {
  await recordConsentLogs(prisma, req, [entry])
}

/**
 * @param {import('../generated/prisma').PrismaClient} prisma
 * @param {import('express').Request} req
 * @param {Array<{ userId?: string | null, consentType: string, granted: boolean }>} entries
 */
async function recordConsentLogs(prisma, req, entries) {
  if (!entries?.length) return
  try {
    const { ipAddress, userAgent } = requestClientMeta(req)
    await prisma.consentLog.createMany({
      data: entries.map((e) => ({
        userId: e.userId ?? null,
        consentType: e.consentType,
        granted: e.granted === true,
        ipAddress,
        userAgent,
      })),
    })
  } catch (err) {
    console.error('[ConsentLog] insert failed:', err?.message || err)
  }
}

/** La crearea contului: termeni (obligatoriu) + marketing (explicit da/nu). */
async function logAccountCreationConsents(prisma, req, userId, marketingOptIn) {
  await recordConsentLogs(prisma, req, [
    { userId, consentType: CONSENT_TYPES.TERMS_ACCOUNT, granted: true },
    { userId, consentType: CONSENT_TYPES.MARKETING_EMAILS, granted: marketingOptIn === true },
  ])
}

module.exports = {
  CONSENT_TYPES,
  recordConsentLog,
  recordConsentLogs,
  logAccountCreationConsents,
}
