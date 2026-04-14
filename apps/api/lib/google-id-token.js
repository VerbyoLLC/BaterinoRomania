const { OAuth2Client } = require('google-auth-library')

function googleClientIds() {
  const raw = String(process.env.GOOGLE_CLIENT_ID || '').trim()
  if (!raw) return []
  return [...new Set(raw.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean))]
}

/**
 * Verifies a Google Sign-In ID token (JWT) from GIS FedCM / One Tap / button.
 * @returns {{ sub: string, email: string, name?: string }}
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
  if (p.email_verified !== true) {
    const err = new Error('Google email not verified')
    err.code = 'EMAIL_NOT_VERIFIED'
    throw err
  }
  return {
    sub: String(p.sub),
    email: String(p.email).trim().toLowerCase(),
    name: p.name ? String(p.name) : undefined,
  }
}

module.exports = { verifyGoogleIdToken, googleClientIds }
