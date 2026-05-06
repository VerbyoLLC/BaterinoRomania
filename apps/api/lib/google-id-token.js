const { OAuth2Client } = require('google-auth-library')

/** Decode JWT payload (same claims verifyIdToken uses); helps if library payload omits optional fields. */
function decodeJwtPayload(idToken) {
  try {
    const parts = String(idToken).split('.')
    if (parts.length < 2) return {}
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
  } catch {
    return {}
  }
}

function firstNonEmptyString(...vals) {
  for (const v of vals) {
    if (v == null) continue
    const s = String(v).trim()
    if (s) return s
  }
  return undefined
}

function googleClientIds() {
  const raw = String(process.env.GOOGLE_CLIENT_ID || '').trim()
  if (!raw) return []
  return [...new Set(raw.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean))]
}

/** `aud` din JWT (înainte de verificare) — pentru mesaje de diagnostic la nepotrivire cu GOOGLE_CLIENT_ID. */
function idTokenAudiences(idToken) {
  const raw = decodeJwtPayload(idToken).aud
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean)
  if (raw != null && raw !== '') return [String(raw)]
  return []
}

/**
 * Verifies a Google Sign-In ID token (JWT) from GIS FedCM / One Tap / button.
 * @returns {{ sub: string, email: string, name?: string, givenName?: string, familyName?: string }}
 */
async function verifyGoogleIdToken(idToken) {
  const audience = googleClientIds()
  if (!audience.length) {
    const err = new Error('GOOGLE_CLIENT_ID is not configured')
    err.code = 'GOOGLE_NOT_CONFIGURED'
    throw err
  }
  const client = new OAuth2Client()
  const ticket = await client.verifyIdToken({
    idToken,
    audience,
  })
  const p = ticket.getPayload()
  if (!p?.sub || !p.email) {
    const err = new Error('Invalid Google token payload')
    err.code = 'INVALID_PAYLOAD'
    throw err
  }
  const verifiedOk =
    p.email_verified === true ||
    p.email_verified === 'true' ||
    p.email_verified === 1
  if (!verifiedOk) {
    const err = new Error('Google email not verified')
    err.code = 'EMAIL_NOT_VERIFIED'
    throw err
  }

  const raw = decodeJwtPayload(idToken)
  const givenName = firstNonEmptyString(
    p.given_name,
    p.givenName,
    raw.given_name,
    raw.givenName,
  )
  const familyName = firstNonEmptyString(
    p.family_name,
    p.familyName,
    raw.family_name,
    raw.familyName,
  )
  const name = firstNonEmptyString(p.name, raw.name)

  return {
    sub: String(p.sub),
    email: String(p.email).trim().toLowerCase(),
    name,
    givenName,
    familyName,
  }
}

module.exports = { verifyGoogleIdToken, googleClientIds, idTokenAudiences }
